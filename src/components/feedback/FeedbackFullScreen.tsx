// src/components/feedback/FeedbackFullScreen.tsx
// ✅ Design C — Full-screen focused feedback
// ✅ Single-screen: stars + optional message + send
// ✅ No two-step flow — everything on one screen
// ✅ "Add your thoughts" expands inline
// ✅ Optional email only when reply requested
// ✅ Auto-dismisses on success (fast: 1.2s)
// ✅ Brand logo at top (icon-1024x1024.png) — matches LoadingScreen round shape & size
// ✅ Pure CSS spinner — always smooth, never breaks
// ✅ FIXED: Scrollbar hidden (content still scrolls, no visual scrollbar)
// ✅ FIXED: Feedback UI stays centered on all screen sizes, no clipping
// ✅ FIXED: Scroll works even when opened from workspace pages (body scroll lock)
// ✅ FIXED: Removed the OLD non-working page scrollbar while modal is open
// ✅ FIXED: Closing the modal (X / backdrop / ESC) no longer auto-submits.
//           Feedback is ONLY sent when the user explicitly clicks Send.

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

  // ✅ Body scroll lock — safely preserves any existing overflow value
  // and forces html+body lock so the fixed overlay's own scroll works
  // regardless of which workspace page is underneath.
  //
  // 🆕 KILLS the OLD non-working page scrollbar (WorkspacePage injects
  //    `overflow-y: auto !important` on html/body/* via a <style> tag).
  //    We counteract it with an equally-important override while the modal
  //    is open, and cleanly remove it on close.
  useEffect(() => {
    if (!isOpen) return;

    const html = document.documentElement;
    const body = document.body;

    // Snapshot previous inline styles so we can restore them exactly
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
      htmlOverflowY: (html.style as any).overflowY,
      bodyOverflowY: (body.style as any).overflowY,
    };

    // ✅ Inline styles with !important via setProperty — these beat
    //    WorkspacePage's <style> tag `overflow-y: auto !important` rules.
    html.style.setProperty('overflow', 'hidden', 'important');
    html.style.setProperty('overflow-y', 'hidden', 'important');
    body.style.setProperty('overflow', 'hidden', 'important');
    body.style.setProperty('overflow-y', 'hidden', 'important');
    html.style.setProperty('overscroll-behavior', 'contain', 'important');
    body.style.setProperty('overscroll-behavior', 'contain', 'important');

    // ✅ Also neutralize the nested workspace elements that WorkspacePage
    //    forces to `overflow-y: visible !important` — this kills the old
    //    dead scrollbar that appears at the page level.
    const oldStyleId = 'feedback-scroll-killswitch';
    const killStyle = document.createElement('style');
    killStyle.id = oldStyleId;
    killStyle.textContent = `
      html, body {
        overflow: hidden !important;
        overflow-y: hidden !important;
        height: 100% !important;
        max-height: 100% !important;
        overscroll-behavior: contain !important;
      }
      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      html, body {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
    `;
    document.head.appendChild(killStyle);

    return () => {
      // Restore inline styles
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      body.style.overscrollBehavior = prev.bodyOverscroll;
      (html.style as any).overflowY = prev.htmlOverflowY || '';
      (body.style as any).overflowY = prev.bodyOverflowY || '';

      // Remove the override <style> so WorkspacePage's own rules re-take effect
      const existing = document.getElementById(oldStyleId);
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    };
  }, [isOpen]);

  // ═══════════════════════════════════════════════════════════════
  // Handlers
  // ═══════════════════════════════════════════════════════════════
  const handleStarClick = (value: number) => {
    setRating(value);
  };

  // ✅ FIXED: Closing the modal NEVER submits feedback anymore.
  //           Only `handleSend` submits — matches the intended UX.
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
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
          className={`absolute top-5 right-5 sm:top-6 sm:right-6 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 z-20 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          aria-label="Close feedback"
        >
          <X size={18} strokeWidth={2} />
        </button>

        {/* ✅ The ONLY scrollable element while the modal is open.
            Uses touch-action + overscroll-behavior for reliable mobile scrolling. */}
        <div
          className="feedback-scroll absolute inset-0 overflow-y-auto overflow-x-hidden"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`min-h-full flex flex-col items-center justify-center px-5 sm:px-8 py-16 sm:py-20 transition-all duration-300 ${
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

                  {/* Brand logo — matches LoadingScreen round shape & size */}
                  <div className="flex flex-col items-center gap-3 mb-8">
                    <div className="relative w-20 h-20">
                      {/* Glow ring */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 rounded-2xl bg-purple-500 opacity-30 blur-xl animate-pulse"
                      />
                      {/* Logo image inside rounded square — same as LoadingScreen */}
                      <div className="relative w-20 h-20 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20 overflow-hidden">
                        <img
                          src="/icon-1024x1024.png"
                          alt="Adin AI"
                          className="w-full h-full object-contain"
                          draggable={false}
                        />
                      </div>
                    </div>
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
      </div>

      {/* Keyframes + pure CSS spinner + hidden scrollbar */}
      <style>{`
        /* ✅ Hide scrollbar visually but keep scrolling functional */
        .feedback-scroll {
          scrollbar-width: none;          /* Firefox */
          -ms-overflow-style: none;       /* IE / Edge legacy */
          -webkit-overflow-scrolling: touch;
        }
        .feedback-scroll::-webkit-scrollbar {
          display: none;                  /* Chrome / Safari / Edge */
          width: 0;
          height: 0;
        }

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