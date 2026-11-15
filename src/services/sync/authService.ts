// src/services/sync/authService.ts
import { supabase } from './supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

const SIGN_OUT_SCOPE = 'local' as const;

export interface AuthResult {
  ok: boolean;
  error?: string;
  message?: string;
  user?: User | null;
}

// Errors ko user-friendly banane ke liye
function friendlyAuthError(error: string, message?: string): string {
  switch (error) {
    case 'invalid_credentials':
      return 'Incorrect email or password.';
    case 'email_exists':
      return 'An account with this email already exists. Try signing in.';
    case 'weak_password':
      return message || 'Password is too weak. Use at least 6 characters.';
    case 'invalid_email':
      return 'Please enter a valid email address.';
    case 'rate_limited':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'network':
      return 'Network error. Please check your internet.';
    case 'captcha_failed':
      return 'Could not verify that you are human. Please refresh the page and try again.';
    default:
      return message || 'Something went wrong. Please try again.';
  }
}

function normalizeError(err: any): { error: string; message: string } {
  const msg = String(err?.message || err || '').toLowerCase();
  if (msg.includes('captcha')) return { error: 'captcha_failed', message: '' };
  if (msg.includes('invalid login')) return { error: 'invalid_credentials', message: '' };
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return { error: 'email_exists', message: '' };
  }
  if (msg.includes('password')) return { error: 'weak_password', message: err.message };
  if (msg.includes('email')) return { error: 'invalid_email', message: err.message };
  if (msg.includes('rate') || msg.includes('too many')) return { error: 'rate_limited', message: '' };
  if (msg.includes('fetch') || msg.includes('network')) return { error: 'network', message: '' };
  return { error: 'unknown', message: err?.message || String(err) };
}

export const authService = {
  // ── Email/Password Signup ──
  async signUpWithPassword(email: string, password: string, name: string, captchaToken?: string): Promise<AuthResult> {
    try {
      if (!email?.trim() || !password) {
        return { ok: false, error: 'invalid_email', message: 'Email and password are required.' };
      }
      if (password.length < 6) {
        return { ok: false, error: 'weak_password', message: 'Password must be at least 6 characters.' };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name?.trim() || '' }, captchaToken },
      });

      if (error) {
        const n = normalizeError(error);
        return { ok: false, error: n.error, message: friendlyAuthError(n.error, n.message) };
      }
      return { ok: true, user: data.user };
    } catch (e: any) {
      const n = normalizeError(e);
      return { ok: false, error: n.error, message: friendlyAuthError(n.error, n.message) };
    }
  },

  // ── Email/Password Login ──
  async signInWithPassword(email: string, password: string, captchaToken?: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
        options: { captchaToken },
      });
      if (error) {
        const n = normalizeError(error);
        return { ok: false, error: n.error, message: friendlyAuthError(n.error, n.message) };
      }
      return { ok: true, user: data.user };
    } catch (e: any) {
      const n = normalizeError(e);
      return { ok: false, error: n.error, message: friendlyAuthError(n.error, n.message) };
    }
  },

  // ── Session ──
  async getSession(): Promise<Session | null> {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch {
      return null;
    }
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => callback(session));
  },

  // ── Logout ──
  // ✅ scope 'local': sirf IS device ka session khatam. Default ('global') saare devices logout kar deta tha.
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut({ scope: SIGN_OUT_SCOPE });
    } catch {}
  },
};