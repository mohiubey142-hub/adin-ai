// src/utils/analytics.ts
// ✅ GA4 loads ONLY after the user has accepted the Privacy Policy (consent flag)
// ✅ No User ID / personal data is ever sent to Google Analytics
// ✅ Query strings & hashes are stripped from page paths
// ✅ No console logs of IDs in production
// ✅ Internal (developer/test) sessions are tagged with traffic_type=internal
//    so they can be excluded via a GA4 Data Filter
// ✅ Same exports as before (setUserID is kept as a harmless no-op so nothing breaks)

import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const CONSENT_KEY = 'adin_analytics_consent';
const CONSENT_GRANTED_VALUE = 'granted';

// ---- Internal traffic (developer / test sessions) ----
// Open the site once with  https://your-site/?internal=1  to tag the whole session.
const INTERNAL_URL_PARAM = 'internal';
const INTERNAL_URL_PARAM_ON_VALUE = '1';
const INTERNAL_STORAGE_KEY = 'adin_internal_traffic';
const INTERNAL_STORAGE_ON_VALUE = '1';
// Must match the value set in GA4 → Admin → Data Settings → Data Filters → Internal Traffic
const TRAFFIC_TYPE_PARAM = 'traffic_type';
const TRAFFIC_TYPE_INTERNAL_VALUE = 'internal';
// Internal sessions also turn on GA4 DebugView so test events show up there instantly
const DEBUG_MODE_PARAM = 'debug_mode';
const DEBUG_MODE_ON = true;

let initialized = false;

const isEnabled = (): boolean => Boolean(GA_MEASUREMENT_ID) && import.meta.env.PROD;

const readConsent = (): boolean => {
  try {
    return localStorage.getItem(CONSENT_KEY) === CONSENT_GRANTED_VALUE;
  } catch {
    return false;
  }
};

const writeConsent = (granted: boolean): void => {
  try {
    if (granted) localStorage.setItem(CONSENT_KEY, CONSENT_GRANTED_VALUE);
    else localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* storage unavailable — ignore */
  }
};

/**
 * Remembers (in localStorage, so it survives new tabs) that this browser is an internal/test one.
 * Incognito: lasts until the incognito window is closed. Normal browser: stays until site data is cleared.
 * Runs before the consent check so the flag survives the onboarding flow and
 * any router that strips the query string.
 */
const captureInternalFlag = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get(INTERNAL_URL_PARAM) === INTERNAL_URL_PARAM_ON_VALUE) {
      localStorage.setItem(INTERNAL_STORAGE_KEY, INTERNAL_STORAGE_ON_VALUE);
    }
  } catch {
    /* storage unavailable — ignore */
  }
};

const isInternalSession = (): boolean => {
  try {
    return localStorage.getItem(INTERNAL_STORAGE_KEY) === INTERNAL_STORAGE_ON_VALUE;
  } catch {
    return false;
  }
};

// Official gtag.js opt-out switch: window['ga-disable-<MEASUREMENT_ID>'] = true
const setOptOutFlag = (optOut: boolean): void => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = optOut;
};

const canTrack = (): boolean => isEnabled() && initialized && readConsent();

// Strip query string / hash so nothing personal in a URL can reach GA
const cleanPath = (path: string): string => (path || '/').split(/[?#]/)[0] || '/';

/**
 * Call on app start. Does nothing until the user has given consent
 * (returning users who already accepted are initialized automatically).
 */
export const initializeGA = (): void => {
  captureInternalFlag();

  if (!isEnabled() || initialized || !readConsent()) return;

  setOptOutFlag(false);
  ReactGA.initialize(GA_MEASUREMENT_ID as string, {
    gtagOptions: {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      // Added to every event of this session only when the internal flag is set
      ...(isInternalSession()
        ? {
            [TRAFFIC_TYPE_PARAM]: TRAFFIC_TYPE_INTERNAL_VALUE,
            [DEBUG_MODE_PARAM]: DEBUG_MODE_ON,
          }
        : {}),
    },
  });
  initialized = true;
};

/** Call right after the user accepts the Privacy Policy (e.g. onboarding "Continue"). */
export const enableAnalytics = (): void => {
  writeConsent(true);
  setOptOutFlag(false);
  initializeGA();
};

/** Call if you add an "analytics off" switch, or when the user deletes their account. */
export const disableAnalytics = (): void => {
  writeConsent(false);
  setOptOutFlag(true);
};

export const trackPageView = (path: string): void => {
  if (!canTrack()) return;
  try {
    ReactGA.send({ hitType: 'pageview', page: cleanPath(path) });
  } catch {
    /* analytics must never break the app */
  }
};

/**
 * Custom event. NEVER pass names, emails, phone numbers, User IDs or CV text
 * in category / action / label.
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
): void => {
  if (!canTrack()) return;
  try {
    ReactGA.event({ category, action, label, value });
  } catch {
    /* ignore */
  }
};

/**
 * @deprecated Intentionally does nothing. The Adin User ID is an account key and
 * must not be sent to Google Analytics. Remove any callers when convenient.
 */
export const setUserID = (_userId: string): void => {
  /* no-op */
};

export default {
  initializeGA,
  enableAnalytics,
  disableAnalytics,
  trackPageView,
  trackEvent,
  setUserID,
};
