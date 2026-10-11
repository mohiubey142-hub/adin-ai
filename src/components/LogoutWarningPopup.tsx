// src/components/LogoutWarningPopup.tsx
// ============================================
// Adin AI — Logout Warning Popup
// ============================================
// ✅ Friendly, simple language
// ✅ Plain-text style (no colorful cards)
// ✅ Emphasizes: BOTH ID + PIN are important
// ✅ Download ID + Copy ID buttons

import React, { useState } from 'react';
import { AlertTriangle, Copy, Check, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface LogoutWarningPopupProps {
  isOpen: boolean;
  userId: string;
  onConfirmLogout: () => void;
  onCancel: () => void;
}

const LogoutWarningPopup: React.FC<LogoutWarningPopupProps> = ({
  isOpen,
  userId,
  onConfirmLogout,
  onCancel,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(userId);
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
      toast.success('Copied!', { duration: 1500 });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleDownload = () => {
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

Generated: ${new Date().toLocaleString()}
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
      toast.success('Downloaded', { duration: 1500 });
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl shadow-slate-900/20 overflow-hidden">

        {/* Header */}
        <div className="relative px-5 pt-5 pb-4">
          <button
            onClick={onCancel}
            className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-amber-600" strokeWidth={2.4} />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Before you log out
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
            To log back in later, you'll need <strong className="text-slate-700">both</strong> your ID and your PIN. Please save them now if you haven't already.
          </p>
        </div>

        {/* ID Box */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
                Your ID
              </div>
              <div className="text-base font-bold text-slate-900 font-mono tracking-wider select-all truncate">
                {userId}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* PIN reminder */}
        <div className="px-5 pb-4">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            🔒 You'll also need your <strong className="text-slate-700">4-digit PIN</strong>. Never share it with anyone.
          </p>
        </div>

        {/* Download button */}
        <div className="px-5 pb-4">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            <Download size={13} />
            <span>Download ID as .txt file</span>
          </button>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 space-y-2">
          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            Cancel — stay logged in
          </button>
          <button
            onClick={onConfirmLogout}
            className="w-full py-2 rounded-lg text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
          >
            Logout anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutWarningPopup;