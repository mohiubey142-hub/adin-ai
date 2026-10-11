// src/components/PinEducationPopup.tsx
// ============================================
// Adin AI — Account Education Popup
// ============================================
// ✅ Friendly, simple English
// ✅ Plain text style (no over-colorful cards)
// ✅ Emphasizes: BOTH ID + PIN are important
// ✅ Logout context: after logout, both needed for backup restore
// ✅ PIN must stay private
// ✅ Download ID + Copy ID buttons

import { useEffect, useState } from 'react';
import {
  Shield,
  Key,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  X,
  ArrowRight,
  Download,
} from 'lucide-react';

interface PinEducationPopupProps {
  userId: string;
  onSetPin: () => void;
  onDismiss: () => void;
}

export default function PinEducationPopup({
  userId,
  onSetPin,
  onDismiss,
}: PinEducationPopupProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleCopyId = async () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(userId);
      } else {
        const ta = document.createElement('textarea');
        ta.value = userId;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const handleDownloadId = () => {
    try {
      const content = `ADIN AI — YOUR ACCOUNT ID
==========================

Your ID: ${userId}

Keep this safe.

You'll need BOTH this ID and your 4-digit PIN to restore your
CVs and Cover Letters on any browser or device.

How to restore:
1. Open Adin AI on any device
2. Profile → "Restore from another device"
3. Enter your ID + PIN

Never share your PIN with anyone.

Generated on: ${new Date().toLocaleString()}
Adin AI — https://adin-ai.vercel.app
`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'adin-ai-user-id.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(), 250);
  };

  const handleSetPin = () => {
    setLeaving(true);
    setTimeout(() => onSetPin(), 200);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 ${
          visible && !leaving ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleDismiss}
        role="dialog"
        aria-modal="true"
        aria-label="Account education"
      >
        <div
          className={`relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/20 transition-all duration-300 max-h-[90vh] flex flex-col ${
            visible && !leaving ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors z-10"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Scrollable content */}
          <div className="overflow-y-auto p-5 sm:p-6 pin-edu-scroll">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/25">
                <Shield size={22} className="text-white" strokeWidth={2.4} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Your ID, PIN & Backup
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                A simple guide to keeping your documents safe.
              </p>
            </div>

            {/* Intro */}
            <div className="mb-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                Your CVs and cover letters are saved <strong className="text-slate-800">privately in the cloud</strong> — nobody else can see them.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mt-2">
                If you log out and want to restore your data later, you'll need <strong className="text-slate-800">both</strong> your ID and your PIN. So it's a good idea to have both ready — just in case.
              </p>
            </div>

            {/* Section 1: Your ID */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2.5">
                <Key size={14} className="text-slate-500" strokeWidth={2.4} />
                <h3 className="text-sm font-bold text-slate-900">Your ID</h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                This is your unique account key. It never changes. Use it together with your PIN to restore your documents on any device.
              </p>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 overflow-hidden">
                  <div className="text-[11px] sm:text-xs font-bold text-slate-900 font-mono tracking-wider select-all truncate text-center">
                    {userId}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold transition-colors"
                  title="Copy ID"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadId}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Download size={13} />
                <span>Download ID (.txt)</span>
              </button>
            </div>

            {/* Section 2: Your PIN */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2.5">
                <Lock size={14} className="text-slate-500" strokeWidth={2.4} />
                <h3 className="text-sm font-bold text-slate-900">Your PIN</h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                A 4-digit code that protects your account. You'll need it when:
              </p>

              <ul className="space-y-1.5 mb-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={12} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    Logging back in after you log out
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={12} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    Restoring documents on another device
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={12} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    Deleting your account
                  </span>
                </li>
              </ul>

              <p className="text-xs text-slate-600 leading-relaxed">
                You can change your PIN anytime from your profile menu.
              </p>
            </div>

            {/* Section 3: Stay Logged In */}
            <div className="mb-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Stay Logged In — Everything Stays Here
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                As long as you don't log out, your documents stay right here. You can download them anytime from My Documents.
              </p>
            </div>

            {/* Section 4: Keep in mind */}
            <div className="mb-5 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-2.5">
                Keep these in mind
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-base leading-none mt-0.5">🔒</span>
                  <span className="text-xs text-slate-700 leading-relaxed">
                    <strong>Never share your PIN</strong> with anyone. It's your private key.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base leading-none mt-0.5">💾</span>
                  <span className="text-xs text-slate-700 leading-relaxed">
                    <strong>Download your important documents</strong> and keep them safe — an extra backup never hurts.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base leading-none mt-0.5">🔕</span>
                  <span className="text-xs text-slate-700 leading-relaxed">
                    <strong>Don't worry</strong> — this is all optional. Take your time.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Actions — sticky bottom */}
          <div className="border-t border-slate-100 p-4 sm:p-5 bg-white rounded-b-2xl">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 order-2 sm:order-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all duration-200"
              >
                Got it
              </button>
              <button
                type="button"
                onClick={handleSetPin}
                className="flex-1 order-1 sm:order-2 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md shadow-purple-600/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #2563eb 100%)',
                }}
              >
                <Lock size={14} />
                <span>Set PIN Now</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2.5">
              You can open this guide anytime from the "Backup Help" button.
            </p>
          </div>
        </div>
      </div>

      {/* Custom scrollbar */}
      <style>{`
        .pin-edu-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .pin-edu-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .pin-edu-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a78bfa, #818cf8, #60a5fa);
          border-radius: 10px;
        }
        .pin-edu-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #8b5cf6, #6366f1, #3b82f6);
        }
        .pin-edu-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }
        .pin-edu-scroll {
          scrollbar-width: thin;
          scrollbar-color: #a855f7 transparent;
        }
      `}</style>
    </>
  );
}