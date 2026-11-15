// src/components/feedback/FeedbackFullScreen.tsx
// ✅ v3 — Save-on-tap bottom sheet (same props + default export as before)
// ✅ Star tap = rating is saved to Supabase instantly (one row, created right away).
// ✅ Tags / note / email UPDATE that same row — no duplicates, no data lost.
// ✅ Tags auto-save ~1.2s after the last tap; note/email save on Send or on close.
// ✅ Button is visible right after the first star: "Done" (nothing to add) or
//    "Send feedback" (tags/note added). Press it any time to finish early.
// ✅ If the user does nothing more, the sheet closes by itself 6s after "Saved".
//    Every tap restarts that 6s, and it is paused while the note is open.
// ✅ Closing (X / backdrop / ESC) never loses the rating or unsaved tags.
// ⚠️ Needs feedback_update_migration.sql to be run once in Supabase.

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Star, Check, Plus } from 'lucide-react';
import {
  createFeedback,
  updateFeedback,
  generateFeedbackId,
  markFeedbackShown,
  recordFeedbackTier,
  type FeedbackSource,
} from '../../services/feedbackService';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════
// TYPES + CONSTANTS
// ═══════════════════════════════════════════════════════════════
type ScreenState = 'form' | 'success';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface FeedbackFullScreenProps {
  isOpen: boolean;
  onClose: () => void;
  source: FeedbackSource;
}

const AUTO_CLOSE_MS = 6000; // after "Saved", if the user does nothing more
const CHIP_SAVE_DEBOUNCE_MS = 1200; // wait for the last tag tap before saving
const SPIN_MS = 700; // one full spinner rotation
const SUCCESS_MS = 1200;
const CLOSE_MS = 250;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATING_LABELS = ['', 'Poor', 'Fair', 'Okay', 'Good', 'Loved it'];

const HAPPY_CHIPS = ['Easy to use', 'Fast', 'Great templates', 'Good AI writing', 'Nice design'];
const UNHAPPY_CHIPS = ['Slow', 'Poor output', 'Hard to use', 'Bug / error', 'Missing feature'];

const isUnhappy = (rating: number): boolean => rating > 0 && rating <= 3;

const getTitle = (rating: number): string => {
  if (rating === 0) return 'How’s Adin AI?';
  if (rating >= 4) return 'Glad you like it!';
  return 'Sorry about that.';
};

const getSubtitle = (rating: number): string => {
  if (rating === 0) return 'Tap a star — it saves instantly.';
  if (isUnhappy(rating)) return 'What went wrong? Tap all that apply.';
  return 'What did you like? Tap all that apply.';
};

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

// Resolves after the browser has painted (so the spinner has really started turning)
const afterPaint = () =>
  new Promise<void>((resolve) => {
    let done = false;
    const fin = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    requestAnimationFrame(() => requestAnimationFrame(fin));
    window.setTimeout(fin, 120); // fallback if the tab is hidden and rAF is paused
  });

// Pure-CSS ring spinner: fixed size, compositor-only rotation, no layout shift
function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-[18px] w-[18px] shrink-0 rounded-full border-2"
      style={{
        borderColor: 'rgba(255,255,255,0.35)',
        borderTopColor: '#ffffff',
        animation: `fbSpin ${SPIN_MS}ms linear infinite`,
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    />
  );
}

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
  const [chips, setChips] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [isClosing, setIsClosing] = useState(false);
  const [tick, setTick] = useState(0); // bumps on every tap → restarts the 6s auto-close
  const [finishing, setFinishing] = useState(false); // explicit Done/Send in progress (spinner)
  const finishingRef = useRef(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timersRef = useRef<number[]>([]);
  const debounceRef = useRef<number | null>(null);

  // Persistence bookkeeping (refs = always current inside async code)
  const clientIdRef = useRef<string | null>(null); // id of the single feedback row
  const createdRef = useRef(false); // row exists in Supabase
  const dirtyRef = useRef(false); // local changes not yet saved
  const queueRef = useRef<Promise<void>>(Promise.resolve()); // saves run one at a time, in order

  // Latest values for timers / async callbacks (avoids stale closures)
  const latest = useRef({ rating, chips, note, email });
  latest.current = { rating, chips, note, email };

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setScreen('form');
      setRating(0);
      setHoverRating(0);
      setChips([]);
      setNote('');
      setExpanded(false);
      setEmail('');
      setEmailError('');
      setSaveState('idle');
      setIsClosing(false);
      setTick(0);
      setFinishing(false);
      finishingRef.current = false;
      clientIdRef.current = null;
      createdRef.current = false;
      dirtyRef.current = false;
      queueRef.current = Promise.resolve();
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      markFeedbackShown(source);
    }
  }, [isOpen, source]);

  // Focus textarea when note opens
  useEffect(() => {
    if (expanded && textareaRef.current) {
      const t = window.setTimeout(() => textareaRef.current?.focus(), 150);
      return () => window.clearTimeout(t);
    }
  }, [expanded]);

  // Light body scroll lock while open
  useEffect(() => {
    if (!isOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
    };
    html.style.setProperty('overflow', 'hidden', 'important');
    body.style.setProperty('overflow', 'hidden', 'important');
    return () => {
      html.style.removeProperty('overflow');
      body.style.removeProperty('overflow');
      if (prev.htmlOverflow) html.style.overflow = prev.htmlOverflow;
      if (prev.bodyOverflow) body.style.overflow = prev.bodyOverflow;
    };
  }, [isOpen]);

  // ═══════════════════════════════════════════════════════════════
  // Core actions
  // ═══════════════════════════════════════════════════════════════
  const finishClose = useCallback(() => {
    setIsClosing(true);
    const t = window.setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, CLOSE_MS);
    timersRef.current.push(t);
  }, [onClose]);

  // Saves the CURRENT state: first time = insert, afterwards = update of the same row.
  // Calls are queued so an update can never overtake the insert.
  // silent = no toast / no email validation message (auto-saves and close-saves)
  const persist = useCallback(
    (silent: boolean): Promise<boolean> => {
      const run = async (): Promise<boolean> => {
        const { rating: r, chips: c, note: n, email: e } = latest.current;
        if (r === 0) return false;

        let trimmedEmail = e.trim();
        if (trimmedEmail && !EMAIL_RE.test(trimmedEmail)) {
          if (!silent) {
            setEmailError('Please enter a valid email');
            return false;
          }
          trimmedEmail = ''; // silent save: drop a half-typed email rather than lose the rest
        }
        setEmailError('');

        if (!clientIdRef.current) clientIdRef.current = generateFeedbackId();
        const clientId = clientIdRef.current;
        const message = n.trim();
        const wantsReply = !!trimmedEmail;

        dirtyRef.current = false;
        setSaveState('saving');

        const res = !createdRef.current
          ? await createFeedback({
              clientId,
              rating: r,
              tags: c,
              message: message || undefined,
              email: wantsReply ? trimmedEmail : undefined,
              wantsReply,
              source,
              timestamp: new Date().toISOString(),
            })
          : await updateFeedback(clientId, {
              rating: r,
              tags: c,
              message: message || undefined,
              email: wantsReply ? trimmedEmail : undefined,
              wantsReply,
            });

        if (res.success) {
          if (!createdRef.current) {
            createdRef.current = true;
            recordFeedbackTier(source, false, false); // cooldown starts as soon as a rating exists
          }
          setSaveState(dirtyRef.current ? 'idle' : 'saved');
          return true;
        }

        dirtyRef.current = true;
        setSaveState('error');
        if (!silent) toast.error(res.message || 'Could not save. Please try again.');
        return false;
      };

      const p = queueRef.current.then(run, run);
      queueRef.current = p.then(
        () => undefined,
        () => undefined
      );
      return p;
    },
    [source]
  );

  const recordFinalTier = useCallback(() => {
    const { chips: c, note: n, email: e } = latest.current;
    recordFeedbackTier(source, !!n.trim() || c.length > 0, EMAIL_RE.test(e.trim()));
  }, [source]);

  const finishWithSuccess = useCallback(() => {
    recordFinalTier();
    setScreen('success');
    const t = window.setTimeout(() => finishClose(), SUCCESS_MS);
    timersRef.current.push(t);
  }, [recordFinalTier, finishClose]);

  // "Done" / "Send feedback" / "Try again"
  // The spinner is shown ONLY here (explicit press) and always ends on a full rotation.
  const handleDone = async () => {
    if (screen !== 'form' || latest.current.rating === 0 || finishingRef.current) return;
    finishingRef.current = true;
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    await queueRef.current; // let any save that is already in flight finish first

    // Nothing left to save → finish instantly, no spinner
    if (!dirtyRef.current && createdRef.current) {
      finishWithSuccess();
      return;
    }

    setFinishing(true);
    await afterPaint();
    const t0 = performance.now();
    const ok = await persist(false);

    // Let the spinner finish its CURRENT full turn (at least one), then continue.
    // So it never stops half-way: it completes a circle, and only then "Thank you" appears.
    const elapsed = performance.now() - t0;
    const turns = Math.max(1, Math.ceil(elapsed / SPIN_MS));
    await sleep(turns * SPIN_MS - elapsed);

    if (!ok) {
      finishingRef.current = false;
      setFinishing(false);
      return;
    }
    finishWithSuccess();
  };

  // Closing never loses the rating or unsaved tags/note
  const handleClose = useCallback(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (latest.current.rating > 0) {
      if (dirtyRef.current || !createdRef.current) void persist(true);
      recordFinalTier();
    }
    finishClose();
  }, [persist, recordFinalTier, finishClose]);

  // ESC key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  // Auto-close: 6s after "Saved" if the user does nothing more (paused while the note is open)
  useEffect(() => {
    if (!isOpen || screen !== 'form' || rating === 0 || expanded || saveState !== 'saved') return;
    const t = window.setTimeout(() => finishWithSuccess(), AUTO_CLOSE_MS);
    return () => window.clearTimeout(t);
  }, [isOpen, screen, rating, expanded, saveState, tick, finishWithSuccess]);

  // ═══════════════════════════════════════════════════════════════
  // Handlers
  // ═══════════════════════════════════════════════════════════════
  const markChanged = () => {
    dirtyRef.current = true;
    setTick((t) => t + 1);
    // keep "saving" / "error" visible; otherwise hide the old "Saved" until the new save lands
    setSaveState((s) => (s === 'saving' || s === 'error' ? s : 'idle'));
  };

  const handleStarClick = (value: number) => {
    if (screen !== 'form') return;
    const prevRating = latest.current.rating;
    const changed = value !== prevRating;
    const moodChanged = isUnhappy(value) !== isUnhappy(prevRating);
    const nextChips = moodChanged ? [] : latest.current.chips;

    if (moodChanged) setChips([]); // tag set follows mood
    setRating(value);
    setTick((t) => t + 1);
    try {
      navigator.vibrate?.(8);
    } catch {
      /* haptics not supported */
    }

    // First tap creates the row right now; changing the star later updates it.
    // (latest is patched here because React re-renders after this handler returns,
    //  and the save must already see the new rating.)
    if (changed || !createdRef.current) {
      latest.current = { ...latest.current, rating: value, chips: nextChips };
      dirtyRef.current = true;
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      void persist(true);
    }
  };

  const toggleChip = (chip: string) => {
    if (screen !== 'form') return;
    markChanged();
    setChips((prev) => (prev.includes(chip) ? prev.filter((x) => x !== chip) : [...prev, chip]));
    // Save once the user pauses (several quick taps = one save)
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null;
      void persist(true);
    }, CHIP_SAVE_DEBOUNCE_MS);
  };

  if (!isOpen && !isClosing) return null;

  const activeRating = hoverRating || rating;
  const unhappy = isUnhappy(rating);
  const chipList = unhappy ? UNHAPPY_CHIPS : HAPPY_CHIPS;
  const hasDetails = chips.length > 0 || !!note.trim() || !!email.trim();
  const showAutoCloseBar = saveState === 'saved' && !expanded;

  const buttonLabel =
    saveState === 'error' ? 'Try again' : hasDetails ? 'Send feedback' : 'Done';
  const buttonIsPrimary = hasDetails || saveState === 'error' || finishing;

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={handleClose}
        />

        {/* Sheet */}
        <div
          className={`fb-enter relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto overflow-x-hidden bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl shadow-purple-900/20 px-5 sm:px-8 pt-3 sm:pt-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-8 transition-all duration-[250ms] ${
            isClosing ? 'opacity-0 translate-y-6 sm:scale-95' : 'opacity-100 translate-y-0 sm:scale-100'
          }`}
          style={{
            animation: 'fbSheetUp 380ms cubic-bezier(0.22, 1, 0.36, 1)',
            overscrollBehavior: 'contain',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle (mobile look) */}
          <div className="sm:hidden mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" aria-hidden="true" />

          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close feedback"
          >
            <X size={18} strokeWidth={2} />
          </button>

          {/* SUCCESS */}
          {screen === 'success' && (
            <div className="fb-enter py-10 text-center" style={{ animation: 'fbFadeUp 400ms ease-out' }}>
              <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 flex items-center justify-center">
                <Check
                  size={28}
                  className="text-emerald-600"
                  strokeWidth={2.5}
                  style={{ animation: 'fbPop 450ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Thank you.</h2>
              <p className="text-sm text-slate-500">Your feedback helps us grow.</p>
            </div>
          )}

          {/* FORM */}
          {screen === 'form' && (
            <div className="fb-enter" style={{ animation: 'fbFadeUp 350ms ease-out' }}>
              {/* Logo */}
              <div className="flex justify-center mb-4 mt-1">
                <div className="w-14 h-14 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-center shadow-md shadow-purple-600/15 overflow-hidden">
                  <img
                    src="/icon-1024x1024.png"
                    alt="Adin AI"
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                </div>
              </div>

              {/* Title */}
              <h1
                id="feedback-title"
                className="text-2xl sm:text-[28px] font-bold text-slate-900 text-center tracking-[-0.02em] leading-tight"
              >
                {getTitle(rating)}
              </h1>
              <p className="mt-1.5 text-sm text-slate-500 text-center">{getSubtitle(rating)}</p>

              {/* Stars */}
              <div className="flex justify-center gap-2 sm:gap-3 mt-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform duration-150 hover:scale-110 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 rounded-full"
                    aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-10 h-10 sm:w-11 sm:h-11 transition-all duration-200 ${
                        star <= activeRating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_4px_12px_rgba(251,191,36,0.45)]'
                          : 'text-slate-200'
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>

              {/* Mood label (fixed height = no layout jump) */}
              <p className="h-5 mt-1 text-center text-xs font-semibold tracking-wide text-slate-400 uppercase">
                {RATING_LABELS[activeRating] || ''}
              </p>

              {/* Tags + note + button — appear after the first star tap */}
              {rating > 0 && (
                <div className="fb-enter mt-4" style={{ animation: 'fbFadeUp 300ms ease-out' }}>
                  <div className="flex flex-wrap justify-center gap-2">
                    {chipList.map((chip) => {
                      const selected = chips.includes(chip);
                      return (
                        <button
                          key={chip}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleChip(chip)}
                          className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all duration-150 active:scale-95 ${
                            selected
                              ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/25'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-700'
                          }`}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>

                  {/* Optional note */}
                  {!expanded ? (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setExpanded(true)}
                        className="group inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-purple-700 transition-colors"
                      >
                        <Plus
                          size={15}
                          className="group-hover:rotate-90 transition-transform duration-300"
                        />
                        Add a note
                      </button>
                    </div>
                  ) : (
                    <div className="fb-enter mt-4 space-y-3" style={{ animation: 'fbFadeUp 300ms ease-out' }}>
                      <textarea
                        ref={textareaRef}
                        value={note}
                        onChange={(e) => {
                          setNote(e.target.value);
                          markChanged();
                        }}
                        maxLength={500}
                        rows={3}
                        placeholder={unhappy ? 'Tell us what happened…' : 'Anything else? (optional)'}
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-all"
                      />
                      {unhappy && (
                        <div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              markChanged();
                              if (emailError) setEmailError('');
                            }}
                            placeholder="Email — only if you’d like a reply (optional)"
                            className={`w-full rounded-2xl border bg-slate-50/60 px-4 py-3 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all ${
                              emailError
                                ? 'border-red-300 focus:border-red-400 focus:ring-red-500/10'
                                : 'border-slate-200 focus:border-purple-400 focus:ring-purple-500/10'
                            }`}
                          />
                          {emailError && <p className="mt-1.5 px-1 text-xs text-red-500">{emailError}</p>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Save status (fixed height = no layout jump) */}
                  <p
                    className={`mt-4 h-4 text-center text-xs font-medium ${
                      saveState === 'error'
                        ? 'text-red-500'
                        : saveState === 'saved'
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                    aria-live="polite"
                  >
                    {saveState === 'saved' && (
                      <span key="saved" style={{ animation: 'fbFadeIn 250ms ease-out' }}>
                        ✓ Saved
                      </span>
                    )}
                    {saveState === 'error' && 'Couldn’t save — check your connection'}
                  </p>

                  {/* Done / Send — visible from the first star tap */}
                  <button
                    type="button"
                    onClick={() => void handleDone()}
                    disabled={finishing}
                    className={`mt-2 w-full h-12 rounded-2xl font-semibold active:scale-[0.98] transition-[transform,background-color,box-shadow] duration-150 flex items-center justify-center gap-2.5 ${
                      buttonIsPrimary
                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {finishing ? (
                      <>
                        <Spinner />
                        <span>Sending…</span>
                      </>
                    ) : (
                      buttonLabel
                    )}
                  </button>

                  {/* Auto-close countdown (only while everything is saved) */}
                  <div className="mt-4 h-[3px] w-full rounded-full bg-slate-100 overflow-hidden">
                    {showAutoCloseBar && (
                      <div
                        key={`${tick}|${rating}`}
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400"
                        style={{ animation: `fbProgress ${AUTO_CLOSE_MS}ms linear forwards` }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fbSheetUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fbFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fbProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes fbPop {
          0%   { transform: scale(0.4); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes fbFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fbSpin {
          to { transform: rotate(360deg); }
        }
        /* Reduced motion: only skip the entrance animations. The spinner must keep a normal speed. */
        @media (prefers-reduced-motion: reduce) {
          .fb-enter { animation: none !important; }
        }
      `}</style>
    </>
  );
}
