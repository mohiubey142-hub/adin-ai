// src/components/PinEducationPopup.tsx
// ============================================
// Adin AI — Account Education Popup
// ============================================
// ✅ Modern, clean, premium UI
// ✅ Same content as before — nothing removed
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
  Ban,
  Save,
  Sparkles,
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
        className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md transition-opacity duration-300 ${
          visible && !leaving ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleDismiss}
        role="dialog"
        aria-modal="true"
        aria-label="Account education"
      >
        <div
          className={`relative w-full max-w-lg bg-white rounded-3xl shadow-[0_30px_80px_-20px_rgba(15,23,42,0.4)] transition-all duration-300 max-h-[90vh] flex flex-col overflow-hidden ${
            visible && !leaving ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ═══════ HEADER ═══════ */}
          <div className="relative px-6 pt-6 pb-5 shrink-0">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-150 active:scale-95 z-10"
              aria-label="Close"
            >
              <X size={16} strokeWidth={2.2} />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
                <Shield size={24} className="text-white" strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <h2 className="text-[19px] sm:text-[21px] font-bold text-slate-900 tracking-tight leading-tight">
                  Your ID, PIN & Backup
                </h2>
                <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
                  A simple guide to keeping your documents safe.
                </p>
              </div>
            </div>
          </div>

          {/* ═══════ SCROLLABLE CONTENT ═══════ */}
          <div className="overflow-y-auto px-6 pb-6 pin-edu-scroll flex-1 min-h-0">

            {/* Intro */}
            <div className="mb-6">
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Your CVs and cover letters are saved <strong className="text-slate-800 font-semibold">privately in the cloud</strong> — nobody else can see them.
              </p>
              <p className="text-[13px] text-slate-600 leading-relaxed mt-2">
                If you log out and want to restore your data later, you'll need <strong className="text-slate-800 font-semibold">both</strong> your ID and your PIN. So it's a good idea to have both ready — just in case.
              </p>
            </div>

            {/* ═══════ SECTION 1: YOUR ID ═══════ */}
            <div className="mb-6">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Key size={14} className="text-slate-700" strokeWidth={2.4} />
                </div>
                <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">
                  Your ID
                </h3>
              </div>

              <p className="text-[12.5px] text-slate-600 leading-relaxed mb-3">
                This is your unique account key. It never changes. Use it together with your PIN to restore your documents on any device.
              </p>

              {/* ID box */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 mb-2.5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Account ID
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-[11px] font-semibold transition-all duration-150 active:scale-95"
                  >
                    {copied ? <Check size={11} strokeWidth={2.6} /> : <Copy size={11} strokeWidth={2.4} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-[14px] font-bold text-slate-900 font-mono tracking-wide select-all break-all text-center">
                  {userId}
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadId}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-[12.5px] font-semibold transition-all duration-150 active:scale-[0.98]"
              >
                <Download size={14} strokeWidth={2.2} />
                <span>Download ID as .txt file</span>
              </button>
            </div>

            {/* ═══════ SECTION 2: YOUR PIN ═══════ */}
            <div className="mb-6">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Lock size={14} className="text-slate-700" strokeWidth={2.4} />
                </div>
                <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">
                  Your PIN
                </h3>
              </div>

              <p className="text-[12.5px] text-slate-600 leading-relaxed mb-3">
                A 4-digit code that protects your account. You'll need it when:
              </p>

              <ul className="space-y-2 mb-3">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={2.4} />
                  <span className="text-[12.5px] text-slate-700 leading-relaxed">
                    Logging back in after you log out
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={2.4} />
                  <span className="text-[12.5px] text-slate-700 leading-relaxed">
                    Restoring documents on another device
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={2.4} />
                  <span className="text-[12.5px] text-slate-700 leading-relaxed">
                    Deleting your account
                  </span>
                </li>
              </ul>

              <p className="text-[12.5px] text-slate-600 leading-relaxed">
                You can change your PIN anytime from your profile menu.
              </p>
            </div>

            {/* ═══════ SECTION 3: STAY LOGGED IN ═══════ */}
            <div className="mb-6">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} className="text-emerald-600" strokeWidth={2.4} />
                </div>
                <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">
                  Stay logged in — everything stays here
                </h3>
              </div>
              <p className="text-[12.5px] text-slate-600 leading-relaxed">
                As long as you don't log out, your documents stay right here. You can download them anytime from My Documents.
              </p>
            </div>

            {/* ═══════ SECTION 4: KEEP IN MIND ═══════ */}
            <div className="pt-5 border-t border-slate-100">
              <h3 className="text-[14px] font-bold text-slate-900 tracking-tight mb-3">
                Keep these in mind
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Ban size={14} className="text-purple-600" strokeWidth={2.4} />
                  </div>
                  <p className="text-[12.5px] text-slate-700 leading-relaxed pt-1">
                    <strong className="text-slate-900 font-semibold">Never share your PIN</strong> with anyone. It's your private key.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Save size={14} className="text-blue-600" strokeWidth={2.4} />
                  </div>
                  <p className="text-[12.5px] text-slate-700 leading-relaxed pt-1">
                    <strong className="text-slate-900 font-semibold">Download your important documents</strong> and keep them safe — an extra backup never hurts.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Sparkles size={14} className="text-amber-600" strokeWidth={2.4} />
                  </div>
                  <p className="text-[12.5px] text-slate-700 leading-relaxed pt-1">
                    <strong className="text-slate-900 font-semibold">Don't worry</strong> — this is all optional. Take your time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ ACTIONS — sticky bottom ═══════ */}
          <div className="border-t border-slate-100 px-6 py-4 bg-white shrink-0">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 order-2 sm:order-1 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-semibold transition-all duration-150 active:scale-[0.98]"
              >
                Got it
              </button>
              <button
                type="button"
                onClick={handleSetPin}
                className="flex-1 order-1 sm:order-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-[13px] font-semibold bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 active:scale-[0.98]"
              >
                <Lock size={14} strokeWidth={2.4} />
                <span>Set PIN Now</span>
                <ArrowRight size={14} strokeWidth={2.4} />
              </button>
            </div>
            <p className="text-[10.5px] text-slate-400 text-center mt-2.5">
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
          background: rgba(148, 163, 184, 0.4);
          border-radius: 10px;
        }
        .pin-edu-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.6);
        }
        .pin-edu-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }
        .pin-edu-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
        }
      `}</style>
    </>
  );
}