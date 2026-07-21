// src/utils/analytics.ts
import ReactGA from 'react-ga4';

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Google Analytics Initialize karein
 * Is function ko app start hone par call karein
 */
export const initializeGA = (): void => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('⚠️ Google Analytics Measurement ID not found in environment variables');
    return;
  }

  // Production environment mein hi initialize karein
  if (import.meta.env.PROD) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log('✅ Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
  } else {
    console.log('🔍 Google Analytics: Development mode - tracking disabled');
    // Development mein bhi enable karna hai toh neeche comment hatayein
    // ReactGA.initialize(GA_MEASUREMENT_ID);
  }
};

/**
 * Page view track karein
 * Har page change par is function ko call karein
 */
export const trackPageView = (path: string): void => {
  if (!GA_MEASUREMENT_ID || !import.meta.env.PROD) return;
  
  try {
    ReactGA.send({ 
      hitType: 'pageview', 
      page: path 
    });
    console.log(`📊 Page viewed: ${path}`);
  } catch (error) {
    console.error('❌ Error tracking page view:', error);
  }
};

/**
 * Custom event track karein
 * Jaise: button clicks, form submissions, etc.
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
): void => {
  if (!GA_MEASUREMENT_ID || !import.meta.env.PROD) return;

  try {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
    console.log(`📊 Event tracked: ${category} - ${action}`);
  } catch (error) {
    console.error('❌ Error tracking event:', error);
  }
};

/**
 * User ID track karein (agar user logged in hai)
 */
export const setUserID = (userId: string): void => {
  if (!GA_MEASUREMENT_ID || !import.meta.env.PROD) return;

  try {
    ReactGA.set({ userId });
    console.log(`👤 User ID set: ${userId}`);
  } catch (error) {
    console.error('❌ Error setting user ID:', error);
  }
};

export default {
  initializeGA,
  trackPageView,
  trackEvent,
  setUserID,
};