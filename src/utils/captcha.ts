// src/utils/captcha.ts
// ============================================
// Cloudflare Turnstile (free captcha) — works on ANY host (Vercel included).
// Only a free Cloudflare account is needed to create the site key; hosting stays on Vercel.
// If VITE_TURNSTILE_SITE_KEY is not set, captcha is skipped completely (nothing breaks).
// ============================================

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const SITE_KEY: string = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) || '';

const SILENT_CHECK_TIMEOUT_MS = 12 * 1000;       // user ko kuch dikhaye bina; itne mein token na aaye to aage badho
const INTERACTIVE_CHECK_TIMEOUT_MS = 90 * 1000;  // agar checkbox dikhana pada
const HIDDEN_OPACITY = '0.01';
const HIDDEN_SIZE_PX = '2px';
const OVERLAY_Z_INDEX = 2147483000;
const LOG_TAG = '[captcha]';

export const isCaptchaEnabled = (): boolean => SITE_KEY.length > 0;

let scriptPromise: Promise<void> | null = null;

const loadTurnstileScript = (): Promise<void> => {
  if ((window as any).turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => { scriptPromise = null; reject(new Error('turnstile_script_failed')); };
    document.head.appendChild(script);
  });
  return scriptPromise;
};

// Widget viewport ke ANDAR rehna chahiye (screen se bahar / display:none par Turnstile ruk jata hai),
// bas itna chhota aur transparent ke user ko nazar na aaye.
const styleHidden = (box: HTMLElement): void => {
  box.style.position = 'fixed';
  box.style.left = '0';
  box.style.bottom = '0';
  box.style.top = 'auto';
  box.style.transform = 'none';
  box.style.width = HIDDEN_SIZE_PX;
  box.style.height = HIDDEN_SIZE_PX;
  box.style.overflow = 'hidden';
  box.style.opacity = HIDDEN_OPACITY;
  box.style.pointerEvents = 'none';
  box.style.padding = '0';
  box.style.background = 'transparent';
  box.style.boxShadow = 'none';
};

const styleVisible = (box: HTMLElement): void => {
  box.style.position = 'fixed';
  box.style.width = 'auto';
  box.style.height = 'auto';
  box.style.overflow = 'visible';
  box.style.opacity = '1';
  box.style.pointerEvents = 'auto';
  box.style.bottom = 'auto';
  box.style.left = '50%';
  box.style.top = '50%';
  box.style.transform = 'translate(-50%, -50%)';
  box.style.zIndex = String(OVERLAY_Z_INDEX);
  box.style.padding = '12px';
  box.style.background = '#ffffff';
  box.style.borderRadius = '12px';
  box.style.boxShadow = '0 10px 40px rgba(0,0,0,0.25)';
};

// Returns a one-time token, or undefined when captcha is disabled / could not be completed.
// Tokens are single-use, so call this right before each auth request.
export async function requestCaptchaToken(): Promise<string | undefined> {
  if (!isCaptchaEnabled()) return undefined;
  try {
    await loadTurnstileScript();
  } catch {
    console.warn(`${LOG_TAG} script blocked (extension / CSP / network) →`, TURNSTILE_SCRIPT_URL);
    return undefined;
  }
  const turnstile = (window as any).turnstile;
  if (!turnstile) {
    console.warn(`${LOG_TAG} script loaded but window.turnstile is missing`);
    return undefined;
  }

  return new Promise<string | undefined>((resolve) => {
    const box = document.createElement('div');
    styleHidden(box);
    document.body.appendChild(box);

    let settled = false;
    let widgetId: string | undefined;
    let timer: ReturnType<typeof setTimeout>;

    const finish = (token?: string): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { if (widgetId !== undefined) turnstile.remove(widgetId); } catch { /* ignore */ }
      box.remove();
      resolve(token);
    };

    timer = setTimeout(() => {
      console.warn(`${LOG_TAG} timed out waiting for a token`);
      finish(undefined);
    }, SILENT_CHECK_TIMEOUT_MS);

    try {
      widgetId = turnstile.render(box, {
        sitekey: SITE_KEY,
        appearance: 'interaction-only',          // checkbox sirf tab dikhta hai jab zaroori ho
        callback: (token: string) => {
          console.log(`${LOG_TAG} token received`);
          finish(token);
        },
        'error-callback': (errorCode?: string) => {
          console.warn(`${LOG_TAG} widget error code:`, errorCode);
          finish(undefined);
        },
        'expired-callback': () => {
          console.warn(`${LOG_TAG} token expired before use`);
          finish(undefined);
        },
        'before-interactive-callback': () => {
          console.log(`${LOG_TAG} interaction needed → showing checkbox`);
          styleVisible(box);
          clearTimeout(timer);
          timer = setTimeout(() => finish(undefined), INTERACTIVE_CHECK_TIMEOUT_MS);
        },
        'after-interactive-callback': () => styleHidden(box),
      });
    } catch (e) {
      console.warn(`${LOG_TAG} render failed`, e);
      finish(undefined);
    }
  });
}
