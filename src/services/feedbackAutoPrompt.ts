// src/services/feedbackAutoPrompt.ts
// ✅ Auto feedback popup rules (CV Builder + Cover Letter dono share karte hain)
//    - 24 ghante mein sirf 1 baar (koi bhi action se khule: PDF / PNG / TXT / Copy)
//    - "last shown" feedbackService se aata ha (modal khulte hi wahan save hota ha)
//    - user ne kisi bhi screen se feedback SUBMIT kiya ho to auto popup kabhi nahi aata
//      (manual Feedback button chalta rahega)
//    - PDF pe tab aata ha jab user ka 2nd (ya zyada) PDF download ho

import { hasSubmittedAnyFeedback, getLastFeedbackShownAt } from './feedbackService';

const PDF_COUNT_KEY = 'adin-pdf-download-count';

export const FEEDBACK_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const FEEDBACK_AUTO_DELAY_MS = 1200; // download khatam hone ke baad thora ruk ke

export type FeedbackAutoSource = 'cv-builder' | 'cover-letter';

export function canAutoShowFeedback(): boolean {
  try {
    if (hasSubmittedAnyFeedback()) return false;
    const last = getLastFeedbackShownAt();
    if (last <= 0) return true;
    return Date.now() - last >= FEEDBACK_COOLDOWN_MS;
  } catch {
    return false; // storage kharab ho to nag mat karo
  }
}

/** PDF download count badhao aur naya count return karo */
export function bumpPdfDownloadCount(source: FeedbackAutoSource): number {
  try {
    const key = `${PDF_COUNT_KEY}:${source}`;
    const n = (parseInt(localStorage.getItem(key) || '0', 10) || 0) + 1;
    localStorage.setItem(key, String(n));
    return n;
  } catch {
    return 0;
  }
}
