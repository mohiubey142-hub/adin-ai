// src/services/feedbackService.ts
// ✅ Formspree Integration - No backend required

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mojgdpda';

// ✅ FEATURE-SPECIFIC KEYS - Each feature has its own keys
const FEEDBACK_KEYS = {
  // CV Builder
  CV_COMPLETED: 'adin-feedback-completed-cv-builder',
  CV_LAST_SHOWN: 'adin-feedback-last-shown-cv-builder',
  CV_SKIPPED: 'adin-feedback-skipped-cv-builder',
  CV_WIDGET_VISIBLE: 'adin-feedback-widget-cv-builder', // ✅ NEW: Widget visibility
  
  // Cover Letter
  CL_COMPLETED: 'adin-feedback-completed-cover-letter',
  CL_LAST_SHOWN: 'adin-feedback-last-shown-cover-letter',
  CL_SKIPPED: 'adin-feedback-skipped-cover-letter',
  CL_WIDGET_VISIBLE: 'adin-feedback-widget-cover-letter', // ✅ NEW: Widget visibility
};

interface FeedbackData {
  rating: number;
  name: string;
  email: string;
  message: string;
  source: 'cv-builder' | 'cover-letter';
  timestamp: string;
}

// ✅ Get the correct keys based on source
const getKeys = (source: 'cv-builder' | 'cover-letter') => {
  if (source === 'cv-builder') {
    return {
      completed: FEEDBACK_KEYS.CV_COMPLETED,
      lastShown: FEEDBACK_KEYS.CV_LAST_SHOWN,
      skipped: FEEDBACK_KEYS.CV_SKIPPED,
      widgetVisible: FEEDBACK_KEYS.CV_WIDGET_VISIBLE,
    };
  }
  return {
    completed: FEEDBACK_KEYS.CL_COMPLETED,
    lastShown: FEEDBACK_KEYS.CL_LAST_SHOWN,
    skipped: FEEDBACK_KEYS.CL_SKIPPED,
    widgetVisible: FEEDBACK_KEYS.CL_WIDGET_VISIBLE,
  };
};

// ✅ Submit feedback to Formspree
export const submitFeedback = async (data: FeedbackData): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        rating: data.rating,
        name: data.name || 'Anonymous',
        email: data.email || 'Not provided',
        message: data.message,
        source: data.source,
        timestamp: data.timestamp,
      }),
    });

    if (response.ok) {
      return { success: true, message: 'Thank you for your feedback!' };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.error || 'Failed to submit feedback' };
    }
  } catch (error) {
    console.error('Feedback submission error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// ✅ Check if feedback should be shown for a specific source
export const shouldShowFeedback = (source: 'cv-builder' | 'cover-letter'): boolean => {
  const keys = getKeys(source);

  // 1️⃣ Check if user already submitted feedback for this feature (PERMANENT)
  const completed = localStorage.getItem(keys.completed);
  if (completed === 'true') {
    return false;
  }

  // 2️⃣ Check if modal was shown recently (24 hours cooldown)
  const lastShown = localStorage.getItem(keys.lastShown);
  if (lastShown) {
    const lastShownTime = parseInt(lastShown, 10);
    const hoursSince = (Date.now() - lastShownTime) / (1000 * 60 * 60);
    if (hoursSince < 24) {
      return false;
    }
  }

  // 3️⃣ Check skip count (max 3 skips, then force show)
  const skipCount = parseInt(localStorage.getItem(keys.skipped) || '0', 10);
  if (skipCount >= 3) {
    // Reset skip count after 3 skips
    localStorage.setItem(keys.skipped, '0');
    return true;
  }

  return true;
};

// ✅ Mark feedback as completed (PERMANENT - Never show again for this feature)
export const markFeedbackCompleted = (source: 'cv-builder' | 'cover-letter'): void => {
  const keys = getKeys(source);
  localStorage.setItem(keys.completed, 'true');
  // ✅ Also hide widget when feedback is completed
  localStorage.setItem(keys.widgetVisible, 'false');
};

// ✅ Mark feedback as shown (for cooldown tracking)
export const markFeedbackShown = (source: 'cv-builder' | 'cover-letter'): void => {
  const keys = getKeys(source);
  localStorage.setItem(keys.lastShown, Date.now().toString());
};

// ✅ Mark feedback as skipped (Maybe Later / Close)
export const markFeedbackSkipped = (source: 'cv-builder' | 'cover-letter'): void => {
  const keys = getKeys(source);
  const current = parseInt(localStorage.getItem(keys.skipped) || '0', 10);
  localStorage.setItem(keys.skipped, (current + 1).toString());
  // Also set last shown for cooldown
  markFeedbackShown(source);
  // ✅ Hide widget when skipped (applies cooldown)
  localStorage.setItem(keys.widgetVisible, 'false');
};

// ✅ NEW: Get widget visibility state
export const getWidgetVisibility = (source: 'cv-builder' | 'cover-letter'): boolean => {
  const keys = getKeys(source);
  const visible = localStorage.getItem(keys.widgetVisible);
  return visible === 'true';
};

// ✅ NEW: Set widget visibility state
export const setWidgetVisibility = (source: 'cv-builder' | 'cover-letter', visible: boolean): void => {
  const keys = getKeys(source);
  localStorage.setItem(keys.widgetVisible, String(visible));
};

// ✅ NEW: Minimize modal to widget (NO COOLDOWN)
export const minimizeToWidget = (source: 'cv-builder' | 'cover-letter'): void => {
  // ✅ Check if feedback already completed
  const keys = getKeys(source);
  const completed = localStorage.getItem(keys.completed);
  if (completed === 'true') {
    return;
  }
  // Show widget
  setWidgetVisibility(source, true);
};

// ✅ NEW: Close widget (applies 24h cooldown)
export const closeWidget = (source: 'cv-builder' | 'cover-letter'): void => {
  // Mark as skipped (applies 24h cooldown)
  markFeedbackSkipped(source);
  // Hide widget
  setWidgetVisibility(source, false);
};

// ✅ Developer Mode: Reset ONLY feedback keys for a specific feature
export const resetFeedbackModal = (source?: 'cv-builder' | 'cover-letter'): void => {
  const allKeys = [
    FEEDBACK_KEYS.CV_COMPLETED,
    FEEDBACK_KEYS.CV_LAST_SHOWN,
    FEEDBACK_KEYS.CV_SKIPPED,
    FEEDBACK_KEYS.CV_WIDGET_VISIBLE,
    FEEDBACK_KEYS.CL_COMPLETED,
    FEEDBACK_KEYS.CL_LAST_SHOWN,
    FEEDBACK_KEYS.CL_SKIPPED,
    FEEDBACK_KEYS.CL_WIDGET_VISIBLE,
  ];

  // If source is provided, only reset that feature's keys
  if (source) {
    const keys = getKeys(source);
    const keysToRemove = [keys.completed, keys.lastShown, keys.skipped, keys.widgetVisible];
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    console.log(`✅ Feedback modal reset complete for ${source}.`);
    return;
  }

  // Reset all feedback keys
  allKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('✅ All feedback keys reset complete.');
};

// ✅ Add to window for developer console access
if (typeof window !== 'undefined') {
  (window as any).resetFeedbackModal = resetFeedbackModal;
}