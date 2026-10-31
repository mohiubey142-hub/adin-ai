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
    const state = window.history.state as { inApp?: boolean } | null;
    return state?.inApp === true;
  } catch {
    return false;
  }
}
