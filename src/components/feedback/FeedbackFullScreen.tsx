// src/components/feedback/FeedbackFullScreen.tsx
// ✅ Design C — Full-screen focused feedback
// ✅ Single-screen: stars + optional message + send
// ✅ No two-step flow — everything on one screen
// ✅ "Add your thoughts" expands inline
// ✅ Optional email only when reply requested
// ✅ Auto-dismisses on success (fast: 1.2s)
// ✅ Brand logo at top (icon-1024x1024.png)
// ✅ Pure CSS spinner — always smooth, never breaks

import { useState, useEffect, useRef } from 'react';
import { X, Star, Lock, Check, Plus } from 'lucide-react';
import {
  submitFeedback,
  markFeedbackShown,
  recordFeedbackTier,
  type FeedbackSource,
} from '../../services/feedbackService';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
type ScreenState = 'form' | 'success';

interface FeedbackFullScreenProps {
  isOpen: boolean;
  onClose: () => void;
  source: FeedbackSource;
}

// ═══════════════════════════════════════════════════════════════
// ADAPTIVE COPY
// ═══════════════════════════════════════════════════════════════
const getTitle = (rating: number): string => {
  if (rating === 0) return "How's Adin AI?";
  if (rating >= 4) return 'Thanks for the rating.';
  return "We'd love to hear more.";
};

const isUnhappy = (rating: number): boolean => rating > 0 && rating <= 3;

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function FeedbackFullScreen({
  isOpen,
  onClose,
  source,
}: FeedbackFullScreenProps) {
  const [screen, setScreen] = useState<ScreenState>('form');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [wantsReply, setWantsReply] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showEmailField, setShowEmailField] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setScreen('form');
      setRating(0);
      setHoverRating(0);
      setMessage('');
      setExpanded(false);
      setWantsReply(false);
      setEmail('');
      setEmailError('');
      setShowEmailField(false);
      setIsSubmitting(false);
      setIsClosing(false);
      markFeedbackShown(source);
    }
  }, [isOpen, source]);

  // Focus textarea when expanded
  useEffect(() => {
    if (expanded && textareaRef.current) {
      const t = setTimeout(() => textareaRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [expanded]);

  // Auto-show email field on unhappy ratings when expanded
  useEffect(() => {
    if (expanded && isUnhappy(rating)) {
      setShowEmailField(true);
    }
  }, [expanded, rating]);

  // ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, rating]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // ═══════════════════════════════════════════════════════════════
  // Handlers
  // ═══════════════════════════════════════════════════════════════
  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleClose = () => {
    if (rating > 0 && !isSubmitting) {
      submitSilently();
    }
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  };

  const submitSilently = async () => {
    try {
      await submitFeedback({
        rating,
        message: message.trim() || undefined,
        email: wantsReply ? email.trim() : undefined,
        wantsReply,
        source,
        timestamp: new Date().toISOString(),
      });
      recordFeedbackTier(source, !!message.trim(), wantsReply);
    } catch { /* silent */ }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const validateEmail = (): boolean => {
    if (!wantsReply) return true;
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Email is required if you want a reply');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSend = async () => {
    if (rating === 0) {
      toast.error('Please rate first');
      return;
    }
    if (!validateEmail()) return;

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 0));

    const hasMessage = !!message.trim();
    const result = await submitFeedback({
      rating,
      message: message.trim() || undefined,
      email: wantsReply ? email.trim() : undefined,
      wantsReply,
      source,
      timestamp: new Date().toISOString(),
    });

    if (result.success) {
      recordFeedbackTier(source, hasMessage, wantsReply);
      setScreen('success');
      setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => {
          setIsClosing(false);
          onClose();
        }, 250);
      }, 1200);
    } else {
      toast.error(result.message || 'Failed to submit. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  const activeRating = hoverRating || rating;
  const title = getTitle(rating);
  const unhappy = isUnhappy(rating);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <>
      <div
        className={`fixed inset-0 z-[9999] transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.06) 0%, transparent 50%), ' +
            'radial-gradient(circle at 50% 100%, rgba(59,130,246,0.06) 0%, transparent 50%), ' +
            '#ffffff',
        }}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className={`absolute top-5 right-5 sm:top-6 sm:right-6 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 z-10 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          aria-label="Close feedback"
        >
          <X size={18} strokeWidth={2} />
        </button>

        {/* Content */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center px-5 sm:px-8 py-12 transition-all duration-300 ${
            isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <div className="w-full max-w-md">

            {/* SUCCESS SCREEN */}
            {screen === 'success' && (
              <div className="animate-[fadeUp_500ms_cubic-bezier(0.4,0,0.2,1)]">
                <div className="flex justify-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 flex items-center justify-center">
                    <Check
                      size={28}
                      className="text-emerald-600 animate-[checkDraw_500ms_cubic-bezier(0.4,0,0.2,1)_200ms_both]"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
                <h2 className="text-[26px] sm:text-[32px] font-bold text-slate-900 text-center tracking-[-0.02em] leading-[1.15] mb-3">
                  Thank you.
                </h2>
                <p className="text-sm sm:text-base text-slate-500 text-center">
                  Your feedback helps us grow.
                </p>
              </div>
            )}

            {/* MAIN FORM */}
            {screen === 'form' && (
              <div className="animate-[fadeUp_500ms_cubic-bezier(0.4,0,0.2,1)]">

                {/* Brand logo + label */}
                <div className="flex flex-col items-center gap-3 mb-8">
                  <img
                    src="/icon-1024x1024.png"
                    alt="Adin AI"
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                  />
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
                    Adin AI
                  </p>
                </div>

                {/* Title */}
                <h1
                  id="feedback-title"
                  className="text-[26px] sm:text-[32px] font-bold text-slate-900 text-center tracking-[-0.02em] leading-[1.2] mb-8 transition-all duration-300"
                >
                  {title}
                </h1>

                {/* Stars */}
                <div className="flex justify-center gap-3 sm:gap-4 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-all duration-200 hover:scale-110 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 rounded-full"
                      aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-11 h-11 sm:w-12 sm:h-12 transition-all duration-200 ${
                          star <= activeRating
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_4px_14px_rgba(251,191,36,0.4)]'
                            : 'text-slate-200'
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>

                {/* Message section */}
                <div className="mt-8">
                  {!expanded ? (
                    <button
                      type="button"
                      onClick={() => setExpanded(true)}
                      className="w-full group flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border-[1.5px] border-dashed border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-500 hover:text-purple-700 transition-all duration-200"
                    >
                      <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                      <span className="text-sm font-medium">Add your thoughts</span>
                    </button>
                  ) : (
                    <div className="animate-[fadeUp_400ms_cubic-bezier(0.4,0,0.2,1)]">
                      <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          unhappy
                            ? 'Tell us what went wrong...'
                            : 'Share your thoughts... (optional)'
                        }
                        rows={5}
                        maxLength={1000}
                        className="w-full px-5 py-4 rounded-2xl bg-white border-[1.5px] border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 text-[15px] resize-none leading-relaxed"
                      />

                      {showEmailField && (
                        <div className="mt-5 space-y-3 animate-[fadeUp_400ms_cubic-bezier(0.4,0,0.2,1)]">
                          <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                            <input
                              type="checkbox"
                              checked={wantsReply}
                              onChange={(e) => {
                                setWantsReply(e.target.checked);
                                if (!e.target.checked) {
                                  setEmail('');
                                  setEmailError('');
                                }
                              }}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500/30 cursor-pointer accent-purple-600"
                            />
                            <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                              I'd like a reply from the team
                            </span>
                          </label>

                          <div
                            className={`overflow-hidden transition-all duration-300 ease-out ${
                              wantsReply ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                          >
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                if (emailError) setEmailError('');
                              }}
                              placeholder="you@example.com"
                              className={`w-full px-5 py-3 rounded-2xl bg-white border-[1.5px] text-slate-900 placeholder-slate-400 focus:ring-4 outline-none transition-all duration-200 text-[15px] ${
                                emailError
                                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                                  : 'border-slate-200 focus:border-purple-500 focus:ring-purple-500/10'
                              }`}
                            />
                            {emailError && (
                              <p className="text-xs text-red-500 mt-1.5 ml-1">
                                {emailError}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Send button */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSubmitting || rating === 0}
                  className="mt-7 w-full py-4 rounded-2xl text-white text-[15px] font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/30"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      {/* ✅ Pure CSS spinner — always smooth */}
                      <span className="feedback-spinner-css" aria-hidden="true" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    'Send'
                  )}
                </button>

                {/* Trust badge */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-5">
                  <Lock size={12} strokeWidth={2} />
                  <span>Anonymous · We never share your data</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Keyframes + pure CSS spinner */}
      <style>{`
        /* ✅ Pure CSS spinner — no SVG, no rotation bugs */
        .feedback-spinner-css {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: feedbackSpin 0.6s linear infinite;
          flex-shrink: 0;
          box-sizing: border-box;
        }

        @keyframes feedbackSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes checkDraw {
          0% { opacity: 0; transform: scale(0.5) rotate(-45deg); }
          60% { opacity: 1; transform: scale(1.15) rotate(0deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
          .feedback-spinner-css {
            animation-duration: 0.6s !important;
          }
        }
      `}</style>
    </>
  );
}