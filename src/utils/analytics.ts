// src/utils/analytics.ts
// ✅ GA4 Consent Mode: Loads on every page (anonymous), cookies only after consent
// ✅ No personal data sent to GA
// ✅ Internal traffic tagging for GA4 Data Filters

import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const CONSENT_KEY = 'adin_analytics_consent';
const CONSENT_GRANTED_VALUE = 'granted';

// ---- Internal traffic ----
const INTERNAL_URL_PARAM = 'internal';
const INTERNAL_URL_PARAM_ON_VALUE = '1';
const INTERNAL_STORAGE_KEY = 'adin_internal_traffic';
const INTERNAL_STORAGE_ON_VALUE = '1';
const TRAFFIC_TYPE_PARAM = 'traffic_type';
const TRAFFIC_TYPE_INTERNAL_VALUE = 'internal';
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
  } catch { /* ignore */ }
};

const captureInternalFlag = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get(INTERNAL_URL_PARAM) === INTERNAL_URL_PARAM_ON_VALUE) {
      localStorage.setItem(INTERNAL_STORAGE_KEY, INTERNAL_STORAGE_ON_VALUE);
    }
  } catch { /* ignore */ }
};

const isInternalSession = (): boolean => {
  try {
    return localStorage.getItem(INTERNAL_STORAGE_KEY) === INTERNAL_STORAGE_ON_VALUE;
  } catch {
    return false;
  }
};

const setOptOutFlag = (optOut: boolean): void => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = optOut;
};

const canTrack = (): boolean => isEnabled() && initialized;

const cleanPath = (path: string): string => (path || '/').split(/[?#]/)[0] || '/';

export const initializeGA = (): void => {
  captureInternalFlag();

  if (!isEnabled() || initialized) return;

  setOptOutFlag(false);
  const hasConsent = readConsent();

  ReactGA.initialize(GA_MEASUREMENT_ID as string, {
    gtagOptions: {
      'ads_data_redaction': true,
      'url_passthrough': true,
      'allow_google_signals': hasConsent,
      'allow_ad_personalization_signals': false,
      ...(isInternalSession()
        ? {
            [TRAFFIC_TYPE_PARAM]: TRAFFIC_TYPE_INTERNAL_VALUE,
            [DEBUG_MODE_PARAM]: DEBUG_MODE_ON,
          }
        : {}),
    },
  });

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: hasConsent ? 'granted' : 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }

  initialized = true;
};

export const enableAnalytics = (): void => {
  writeConsent(true);
  setOptOutFlag(false);
  
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  }
  
  initializeGA();
};

export const disableAnalytics = (): void => {
  writeConsent(false);
  setOptOutFlag(true);
  
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
};

export const trackPageView = (path: string): void => {
  if (!canTrack()) return;
  try {
    ReactGA.send({ hitType: 'pageview', page: cleanPath(path) });
  } catch { /* ignore */ }
};

export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
): void => {
  if (!canTrack()) return;
  try {
    ReactGA.event({ category, action, label, value });
  } catch { /* ignore */ }
};

export const setUserID = (_userId: string): void => { /* no-op */ };

export default {
  initializeGA,
  enableAnalytics,
  disableAnalytics,
  trackPageView,
  trackEvent,
  setUserID,
};