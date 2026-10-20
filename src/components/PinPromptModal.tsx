// src/components/PinPromptModal.tsx
import { Lock, X, AlertTriangle } from 'lucide-react';

const PIN_PROMPT_COUNT_KEY = 'adin-pin-prompt-count';
const PIN_PROMPT_SESSION_KEY = 'adin-pin-prompt-session';
export const PIN_PROMPT_MAX_SHOWS = 1;

export type PinPromptSource = 'cv-builder' | 'cover-letter';

function readPinPromptCount(source: PinPromptSource): number {
  try {
    const n = parseInt(localStorage.getItem(`${PIN_PROMPT_COUNT_KEY}:${source}`) || '0', 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return PIN_PROMPT_MAX_SHOWS;
  }
}

export function canShowPinPrompt(source: PinPromptSource): boolean {
  try {
    if (sessionStorage.getItem(`${PIN_PROMPT_SESSION_KEY}:${source}`)) return false;
  } catch { /* ignore */ }
  return readPinPromptCount(source) < PIN_PROMPT_MAX_SHOWS;
}

export function recordPinPromptShown(source: PinPromptSource): void {
  try {
    localStorage.setItem(`${PIN_PROMPT_COUNT_KEY}:${source}`, String(readPinPromptCount(source) + 1));
  } catch { /* ignore */ }
  try {
    sessionStorage.setItem(`${PIN_PROMPT_SESSION_KEY}:${source}`, 'true');
  } catch { /* ignore */ }
}

interface PinPromptModalProps {
  isOpen: boolean;
  onSetPin: () => void;
  onSkip: () => void;
}

export default function PinPromptModal({ isOpen, onSetPin, onSkip }: PinPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X size={16} strokeWidth={2.2} />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
          <Lock size={22} className="text-purple-600" strokeWidth={2.4} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 mb-2 pr-6">
          🔒 Don't lose this masterpiece!
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          You just created something great. Set a 4-digit PIN so you can restore this document on any device.
        </p>

        {/* ✅ NEW: Warning Box with Actionable Solution */}
        <div className="mb-5 rounded-xl bg-amber-50/80 border border-amber-200/80 p-3.5 flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" strokeWidth={2.4} />
          <div className="text-[12px] text-amber-900 leading-relaxed space-y-1.5">
            <p>
              <strong className="font-semibold text-amber-950">Important:</strong> To restore your data after logging out or on a new device, you will need <strong>both your User ID and PIN</strong>.
            </p>
            <p>
              If you haven't downloaded your User ID yet, <strong>go to your Profile and download it now.</strong> Keep it safe with your PIN.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={onSetPin}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 active:scale-95"
          >
            Set PIN Now
          </button>
          
          <button
            onClick={onSkip}
            className="w-full py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 text-sm font-semibold transition-colors duration-200 active:scale-95"
          >
            Skip for now
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-center text-slate-400 mt-4 leading-relaxed">
          Not interested? You can always set or change your PIN later from <strong>Profile → Set PIN</strong>.
        </p>
      </div>
    </div>
  );
}