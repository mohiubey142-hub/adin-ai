// src/utils/inAppNav.ts
// ============================================================
// "Kya user app ke andar se is page par aaya?" — ek hi jagah ka rule.
//
// App.tsx jab bhi app ke andar navigate karta hai (navigateToPath), history entry
// mein { inApp: true } marker lagata hai. Seedha link / Google / naya tab / address bar
// se khulne wale page par history.state null hota hai → "Back" button nahi dikhana.
// Page refresh par history.state bacha rehta hai, isliye in-app user ko refresh ke baad
// bhi Back milta hai.
// ============================================================

export const IN_APP_STATE = { inApp: true } as const;

export function cameFromApp(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // 1) App ke andar (SPA) navigation: history.state marker
    const state = window.history.state as { inApp?: boolean } | null;
    if (state?.inApp === true) return true;

    // 2) Same-site link se aaye (jaise /free-cv-builder, /pk/... ya blog ke <a href> se full reload):
    //    referrer hamari apni site ka ho aur history mein pichla page maujood ho -> Back kaam karega.
    //    Google / seedha address bar / naya tab (history.length <= 1) par ye false rehta hai -> logo dikhega.
    if (window.history.length > 1 && document.referrer) {
      const ref = new URL(document.referrer);
      if (ref.origin === window.location.origin) return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ------------------------------------------------------------
// "Adin AI" logo → real landing page
// Public pages ka logo <a href="/"> full reload karta hai. Agar user pehle "Get Started"/koi page
// dekh chuka hai (adin-has-seen-landing), to App `/` par landing ki jagah onboarding dikha deta tha.
// Logo click par yeh session flag lagta hai; App.tsx isse dekh kar (sirf naye / onboarding-se-pehle
// wale visitor ko) landing page dikhata hai.
// ------------------------------------------------------------
export const FORCE_LANDING_KEY = 'adin-force-landing';

export function markLandingIntent(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(FORCE_LANDING_KEY, 'true');
  } catch {
    /* ignore */
  }
}
