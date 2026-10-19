// src/services/feedbackService.ts
// ✅ Apps Script integration via our backend proxy (/api/sync) — no secret in the browser
// ✅ Truly unlimited — no monthly quota
// ✅ Data saved to Google Sheet "Feedback"
// ✅ Smart cooldown based on user commitment
// ✅ Email notification only for low ratings or reply requests

import { postToSyncProxy } from './sync/proxyClient';

// ============================================
// STORAGE KEYS (per source)
// ============================================
const FEEDBACK_KEYS = {
  // CV Builder
  CV_COMPLETED: 'adin-feedback-completed-cv-builder',
  CV_LAST_SHOWN: 'adin-feedback-last-shown-cv-builder',
  CV_TIER: 'adin-feedback-tier-cv-builder',

  // Cover Letter
  CL_COMPLETED: 'adin-feedback-completed-cover-letter',
  CL_LAST_SHOWN: 'adin-feedback-last-shown-cover-letter',
  CL_TIER: 'adin-feedback-tier-cover-letter',

  // Global
  GLOBAL_COMPLETED: 'adin-feedback-completed-global',
  GLOBAL_LAST_SHOWN: 'adin-feedback-last-shown-global',
  GLOBAL_TIER: 'adin-feedback-tier-global',
};

// ============================================
// COOLDOWN TIMINGS
// ============================================
const COOLDOWN = {
  RATING_ONLY: 7 * 24 * 60 * 60 * 1000,      // 7 days
  WITH_MESSAGE: 30 * 24 * 60 * 60 * 1000,    // 30 days
  NEVER_ASKED: 14 * 24 * 60 * 60 * 1000,     // 14 days (if dismissed without rating)
} as const;

// ============================================
// TYPES
// ============================================
export type FeedbackSource = 'cv-builder' | 'cover-letter' | 'global';

export type FeedbackTier = 'rating-only' | 'with-message' | 'with-reply';

export interface FeedbackPayload {
  rating: number;
  message?: string;
  email?: string;
  wantsReply?: boolean;
  source: FeedbackSource;
  timestamp: string;
}

// ============================================
// HELPERS
// ============================================
const getKeys = (source: FeedbackSource) => {
  if (source === 'cv-builder') {
    return {
      completed: FEEDBACK_KEYS.CV_COMPLETED,
      lastShown: FEEDBACK_KEYS.CV_LAST_SHOWN,
      tier: FEEDBACK_KEYS.CV_TIER,
    };
  }
  if (source === 'cover-letter') {
    return {
      completed: FEEDBACK_KEYS.CL_COMPLETED,
      lastShown: FEEDBACK_KEYS.CL_LAST_SHOWN,
      tier: FEEDBACK_KEYS.CL_TIER,
    };
  }
  return {
    completed: FEEDBACK_KEYS.GLOBAL_COMPLETED,
    lastShown: FEEDBACK_KEYS.GLOBAL_LAST_SHOWN,
    tier: FEEDBACK_KEYS.GLOBAL_TIER,
  };
};

// ============================================
// SUBMIT
// ============================================
export const submitFeedback = async (
  data: FeedbackPayload,
): Promise<{ success: boolean; message: string }> => {
  try {
    const { httpOk, status, json } = await postToSyncProxy('submit_feedback', {
      rating: data.rating,
      message: data.message || '',
      email: data.email || '',
      wants_reply: data.wantsReply === true,
      source: data.source,
      timestamp: data.timestamp,
    });

    if (json?.ok) {
      return { success: true, message: 'Thank you for your feedback!' };
    }
    if (json?.error === 'not_configured') {
      return { success: false, message: 'Feedback service unavailable' };
    }
    if (!json && !httpOk) {
      return { success: false, message: `HTTP ${status}` };
    }
    return { success: false, message: json?.message || 'Failed to submit feedback' };
  } catch (error) {
    console.error('[feedback] submission error');
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// ============================================
// SHOULD SHOW?
// ============================================
export const shouldShowFeedback = (source: FeedbackSource): boolean => {
  const keys = getKeys(source);

  // 1. Permanent completion
  if (localStorage.getItem(keys.completed) === 'true') {
    return false;
  }

  // 2. Cooldown check
  const lastShown = localStorage.getItem(keys.lastShown);
  if (lastShown) {
    const lastShownTime = parseInt(lastShown, 10);
    const tier = (localStorage.getItem(keys.tier) || 'rating-only') as FeedbackTier;
    const elapsed = Date.now() - lastShownTime;

    let requiredCooldown = COOLDOWN.NEVER_ASKED;

    if (tier === 'with-message') {
      requiredCooldown = COOLDOWN.WITH_MESSAGE;
    } else if (tier === 'rating-only') {
      requiredCooldown = COOLDOWN.RATING_ONLY;
    }

    if (elapsed < requiredCooldown) {
      return false;
    }
  }

  return true;
};

// ============================================
// MARKERS
// ============================================
export const markFeedbackShown = (source: FeedbackSource): void => {
  const keys = getKeys(source);
  localStorage.setItem(keys.lastShown, Date.now().toString());
};

export const markFeedbackCompleted = (source: FeedbackSource): void => {
  const keys = getKeys(source);
  localStorage.setItem(keys.completed, 'true');
};

/**
 * Called after successful submission.
 * Determines whether this user should be asked again.
 *
 * - Rating + message + reply requested → permanent completion
 * - Rating + message → 30-day cooldown (tier: with-message)
 * - Rating only → 7-day cooldown (tier: rating-only)
 */
export const recordFeedbackTier = (
  source: FeedbackSource,
  hasMessage: boolean,
  wantsReply: boolean,
): void => {
  const keys = getKeys(source);

  // Full commitment → never ask again
  if (hasMessage && wantsReply) {
    markFeedbackCompleted(source);
    return;
  }

  // Message but no reply → 30-day cooldown
  if (hasMessage) {
    localStorage.setItem(keys.tier, 'with-message');
    return;
  }

  // Rating only → 7-day cooldown
  localStorage.setItem(keys.tier, 'rating-only');
};

// ============================================
// DEVELOPER UTILITIES
// ============================================
export const resetFeedback = (source?: FeedbackSource): void => {
  if (source) {
    const keys = getKeys(source);
    [keys.completed, keys.lastShown, keys.tier].forEach((k) =>
      localStorage.removeItem(k),
    );
    console.log(`✅ Feedback reset for ${source}`);
    return;
  }

  Object.values(FEEDBACK_KEYS).forEach((k) => localStorage.removeItem(k));
  console.log('✅ All feedback keys reset');
};

// Dev console access
if (typeof window !== 'undefined') {
  (window as any).resetFeedback = resetFeedback;
}