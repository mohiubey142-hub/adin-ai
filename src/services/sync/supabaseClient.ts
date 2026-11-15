// src/services/sync/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, Session } from '@supabase/supabase-js';

// Aapka Project URL aur Publishable Key
const SUPABASE_URL = 'https://ocuajkatxlkwvddplhqt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ACOqYUq-ku4KeNFkMEjQ7g_0Bf-kh31';

// ✅ SINGLETON: poori app (aur Vite HMR reload) me sirf EK client.
//    Ek se zyada GoTrueClient ek hi storage key par alag alag token refresh karte hain →
//    refresh rate-limit (429) → supabase-js session hata kar SIGNED_OUT bhej deta hai.
const GLOBAL_CLIENT_KEY = '__adin_supabase_client__';

type GlobalWithClient = typeof globalThis & { [GLOBAL_CLIENT_KEY]?: SupabaseClient };

const globalScope = globalThis as GlobalWithClient;

const buildClient = (): SupabaseClient =>
  createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  });

export const supabase: SupabaseClient =
  globalScope[GLOBAL_CLIENT_KEY] ?? (globalScope[GLOBAL_CLIENT_KEY] = buildClient());

// ✅ Current user ID from the LOCAL session (auto-refreshed by supabase-js).
//    getUser() ek network call hai jo slow net / token refresh ke dauraan fail ho kar null deta tha,
//    aur sync silently drop ho jata tha. getSession() local hai aur zaroorat par refresh khud karta hai.
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user?.id) return data.session.user.id;
    // ✅ Session gayab ho gayi (jaise refresh 429 par supabase-js ne hata di) → backup se wapas lao
    const recovered = await tryRecoverSession();
    return recovered?.user?.id || null;
  } catch {
    return null;
  }
}

// ============================================
// Session backup + self-heal
// ============================================
// Masla: supabase-js refresh fail (429 / refresh-token race) par session localStorage se HATA deta hai
// aur SIGNED_OUT bhejta hai. UI "logged in" dikhata rahta hai magar cloud writes silently fail hoti hain.
// Hal: har valid session ka refresh_token alag key me rakho. Agar session gayab ho to us se dobara
// session banane ki koshish karo. Agar refresh token sach me revoke ho chuka ho to ye fail hoga
// aur user ko dobara sign-in karna padega (tab App.tsx saaf message dikhata hai).
// Manual logout par backup foran delete hota hai (clearSessionBackup) — logout wapas zinda nahi hota.
const SESSION_BACKUP_KEY = 'adin_auth_session_backup';
const RECOVERY_MIN_GAP_MS = 10 * 1000;

interface SessionBackup {
  refreshToken: string;
  userId: string;
  savedAt: number;
}

// ✅ Logout ke dauran (aur logout ke baad, naye sign-in tak) recovery + backup BAND.
//    Warna koi stray event / in-flight request backup dobara bana kar user ko wapas login kar deta tha.
let sessionRecoveryBlocked = false;
export const setSessionRecoveryBlocked = (blocked: boolean): void => {
  sessionRecoveryBlocked = blocked;
  if (blocked) clearSessionBackup();
};

export const saveSessionBackup = (session: { refresh_token?: string; user?: { id?: string } } | null): void => {
  try {
    if (sessionRecoveryBlocked) return;
    if (!session?.refresh_token || !session.user?.id) return;
    const backup: SessionBackup = {
      refreshToken: session.refresh_token,
      userId: session.user.id,
      savedAt: Date.now(),
    };
    window.localStorage.setItem(SESSION_BACKUP_KEY, JSON.stringify(backup));
  } catch {
    // storage unavailable — best-effort
  }
};

export const clearSessionBackup = (): void => {
  try { window.localStorage.removeItem(SESSION_BACKUP_KEY); } catch { /* ignore */ }
};

const readSessionBackup = (): SessionBackup | null => {
  try {
    const raw = window.localStorage.getItem(SESSION_BACKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.refreshToken && parsed?.userId ? (parsed as SessionBackup) : null;
  } catch {
    return null;
  }
};

let recoveryInFlight: Promise<Session | null> | null = null;
let lastRecoveryAttemptAt = 0;

// Returns the recovered session, or null when recovery was not possible.
export async function tryRecoverSession(): Promise<Session | null> {
  if (sessionRecoveryBlocked) return null;
  if (recoveryInFlight) return recoveryInFlight;
  const backup = readSessionBackup();
  if (!backup) return null;
  if (Date.now() - lastRecoveryAttemptAt < RECOVERY_MIN_GAP_MS) return null;
  lastRecoveryAttemptAt = Date.now();

  recoveryInFlight = (async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession({ refresh_token: backup.refreshToken });
      if (error || !data.session) {
        console.warn('[auth-recover] failed:', error?.message);
        return null;
      }
      saveSessionBackup(data.session);
      console.log('[auth-recover] session restored');
      return data.session;
    } catch (e) {
      console.warn('[auth-recover] exception', e);
      return null;
    } finally {
      recoveryInFlight = null;
    }
  })();
  return recoveryInFlight;
}


// ============================================
// Reliable manual logout
// ============================================
// supabase.auth.signOut() pehle server ko call karta hai. Network slow / fail ho to session
// localStorage se HATTA hi nahi → app "logout" dikhata hai magar session zinda rehta hai aur
// agla event (focus / refresh) user ko wapas login kar deta hai (pehla logout "kaam nahi karta").
// Isliye: signOut try karo (timeout ke saath), phir stored tokens khud delete karo.
const SIGN_OUT_TIMEOUT_MS = 4 * 1000;
const AUTH_STORAGE_KEY_PATTERN = /^sb-.+-auth-token(-code-verifier|-user)?$/;

const removeStoredAuthTokens = (): void => {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && AUTH_STORAGE_KEY_PATTERN.test(key)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // storage unavailable — nothing more we can do
  }
};

export async function forceLocalSignOut(): Promise<void> {
  setSessionRecoveryBlocked(true);
  try {
    await Promise.race([
      supabase.auth.signOut({ scope: 'local' }),
      new Promise<void>((resolve) => window.setTimeout(resolve, SIGN_OUT_TIMEOUT_MS)),
    ]);
  } catch {
    // ignore — tokens are removed below anyway
  }
  removeStoredAuthTokens();
}
