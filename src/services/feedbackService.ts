// src/services/feedbackService.ts
// ✅ Supabase integration — direct insert into 'feedback' table
// ✅ Smart cooldown based on user commitment
// ✅ createFeedback/updateFeedback: tap-to-save flow (one row per feedback, updated in place)
// ✅ Email notification only for low ratings or reply requests (abhi hum bas database mein save kar rahe hain, email baad mein add kar sakte hain)

import { supabase } from './sync/supabaseClient';

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
    // Ab direct Supabase ke 'feedback' table mein insert ho raha hai
    const { error } = await supabase.from('feedback').insert({
      rating: data.rating,
      message: data.message || '',
      email: data.email || '',
      wants_reply: data.wantsReply === true,
      source: data.source,
      client_timestamp: data.timestamp,
    });

    if (error) {
      console.error('[feedbackService] Supabase error:', error.message);
      return { success: false, message: 'Failed to submit feedback. Please try again.' };
    }

    return { success: true, message: 'Thank you for your feedback!' };
  } catch (error) {
    console.error('[feedback] submission error', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// ============================================
// CREATE + UPDATE  (tap-to-save flow)
// ============================================
// Star tap  -> createFeedback()  (one row, rating only, saved instantly)
// Tags/note -> updateFeedback()  (same row, via the update_feedback RPC)
// Needs the SQL in feedback_update_migration.sql to be run once in Supabase.

export interface FeedbackCreatePayload extends FeedbackPayload {
  clientId: string;
  tags?: string[];
}

export interface FeedbackUpdatePayload {
  rating: number;
  tags?: string[];
  message?: string;
  email?: string;
  wantsReply?: boolean;
}

type FeedbackResult = { success: boolean; message: string };

export const generateFeedbackId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const updateFeedback = async (
  clientId: string,
  data: FeedbackUpdatePayload,
): Promise<FeedbackResult> => {
  try {
    const { data: updated, error } = await supabase.rpc('update_feedback', {
      p_client_id: clientId,
      p_rating: data.rating,
      p_tags: data.tags ?? [],
      p_message: data.message ?? '',
      p_email: data.email ?? '',
      p_wants_reply: data.wantsReply === true,
    });

    if (error) {
      console.error('[feedbackService] update error:', error.message);
      return { success: false, message: 'Could not save. Please try again.' };
    }
    if (updated !== true) {
      return { success: false, message: 'Could not save. Please try again.' };
    }
    return { success: true, message: 'Saved' };
  } catch (error) {
    console.error('[feedback] update error', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

export const createFeedback = async (
  data: FeedbackCreatePayload,
): Promise<FeedbackResult> => {
  try {
    const { error } = await supabase.from('feedback').insert({
      client_id: data.clientId,
      rating: data.rating,
      tags: data.tags ?? [],
      message: data.message || '',
      email: data.email || '',
      wants_reply: data.wantsReply === true,
      source: data.source,
      client_timestamp: data.timestamp,
    });

    if (error) {
      // 23505 = unique violation: an earlier attempt already created this row
      // (response was lost). Just apply the latest values to it.
      if (error.code === '23505') {
        return updateFeedback(data.clientId, {
          rating: data.rating,
          tags: data.tags,
          message: data.message,
          email: data.email,
          wantsReply: data.wantsReply,
        });
      }
      console.error('[feedbackService] create error:', error.message);
      return { success: false, message: 'Could not save. Please try again.' };
    }

    return { success: true, message: 'Saved' };
  } catch (error) {
    console.error('[feedback] create error', error);
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

const ALL_SOURCES: FeedbackSource[] = ['cv-builder', 'cover-letter', 'global'];

export const hasSubmittedAnyFeedback = (): boolean =>
  ALL_SOURCES.some((source) => {
    const keys = getKeys(source);
    return (
      localStorage.getItem(keys.completed) === 'true' ||
      !!localStorage.getItem(keys.tier)
    );
  });

export const getLastFeedbackShownAt = (): number =>
  ALL_SOURCES.reduce((latest, source) => {
    const t = parseInt(localStorage.getItem(getKeys(source).lastShown) || '0', 10);
    return Number.isFinite(t) && t > latest ? t : latest;
  }, 0);

export const recordFeedbackTier = (
  source: FeedbackSource,
  hasMessage: boolean,
  wantsReply: boolean,
): void => {
  const keys = getKeys(source);

  if (hasMessage && wantsReply) {
    markFeedbackCompleted(source);
    return;
  }

  if (hasMessage) {
    localStorage.setItem(keys.tier, 'with-message');
    return;
  }

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

if (typeof window !== 'undefined') {
  (window as any).resetFeedback = resetFeedback;
}