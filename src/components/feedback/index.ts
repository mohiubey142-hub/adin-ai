// src/components/feedback/index.ts
// ✅ Design C — Full-screen focused feedback
// ✅ Removed: FeedbackModal, FeedbackWidget (replaced by FeedbackFullScreen)
// ✅ StarRating kept: still used inside FeedbackFullScreen? No — stars are inline now.
//    Keeping StarRating export for any other future usage.

export { default as FeedbackFullScreen } from './FeedbackFullScreen';
export { default as StarRating } from './StarRating';
