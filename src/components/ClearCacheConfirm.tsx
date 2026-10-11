// src/components/ClearCacheConfirm.tsx
// ============================================
// Adin AI — Clear Local Cache Confirmation
// ============================================
// ✅ NEW: "Type CLEAR to confirm" safety
// ✅ NEW: "Download my ID" shortcut button
// ✅ NEW: "What will be cleared" list

import React, { useState } from 'react';
import { HardDrive, AlertTriangle, X, Download, CheckCircle2, XCircle } from 'lucide-react';
import { getStorageUsageMB } from './cv-builder/utils/storageUtils';
import toast from 'react-hot-toast';

interface ClearCacheConfirmProps {
  isOpen: boolean;
  userId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ClearCacheConfirm: React.FC<ClearCacheConfirmProps> = ({
  isOpen,
  userId,
  onConfirm,
  onCancel,
}) => {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const usedMB = getStorageUsageMB();
  const canClear = confirmText.trim().toUpperCase() === 'CLEAR';

  const handleDownloadId = () => {
    if (!userId) return;
    try {
      const content = `ADIN AI — YOUR ACCOUNT ID
==========================

Your ID: ${userId}

IMPORTANT: Keep this safe.

This ID is your key to restoring your CVs and Cover Letters on any
browser or device. Without this ID, you cannot recover your data.

How to use it:
1. Open Adin AI on any device
2. Go to your profile → "Restore from another device"
3. Enter this ID + your 4-digit PIN
4. Your data will be restored from the cloud

Save this file somewhere safe:
- Email it to yourself
- Save it in your notes
- Take a screenshot

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
      toast.success('ID file downloaded!', { duration: 2500 });
    } catch (e) {
      toast.error('Download failed');
    }
  };

  const handleConfirm = () => {
    if (!canClear) return;
    setConfirmText('');
    onConfirm();
  };

  const handleCancel = () => {
    setConfirmText('');
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-3">
          <button
            onClick={handleCancel}
            className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <HardDrive size={16} className="text-amber-600" strokeWidth={2.4} />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Clear local cache?
            </h2>
          </div>

          <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
            This removes all local data from <strong>this browser</strong>. Your cloud data stays safe.
          </p>
        </div>

        {/* What will be cleared / What stays safe */}
        <div className="px-5 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {/* Will be cleared */}
            <div className="rounded-xl bg-red-50 border border-red-100 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <XCircle size={12} className="text-red-600" strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                  Will be cleared
                </span>
              </div>
              <ul className="space-y-1 text-[10px] text-red-700 leading-relaxed">
                <li>• All local CVs</li>
                <li>• Cover Letters</li>
                <li>• Profile photos</li>
                <li>• Sync queue</li>
              </ul>
            </div>

            {/* Will stay safe */}
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 size={12} className="text-emerald-600" strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Will stay safe
                </span>
              </div>
              <ul className="space-y-1 text-[10px] text-emerald-700 leading-relaxed">
                <li>• Your User ID</li>
                <li>• Cloud backups</li>
                <li>• Your PIN</li>
                <li>• Account access</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Storage info */}
        <div className="px-5 pb-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-3">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-slate-500 font-medium">Current usage</span>
              <span className="font-bold text-slate-900">{usedMB.toFixed(2)} MB</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 text-center truncate">
              Your ID: {userId || '—'}
            </div>
          </div>
        </div>

        {/* Download ID shortcut */}
        <div className="px-5 pb-4">
          <button
            onClick={handleDownloadId}
            disabled={!userId}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            Download my ID first
          </button>
        </div>

        {/* Confirm input */}
        <div className="px-5 pb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Type <code className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-amber-600 font-bold">CLEAR</code> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type CLEAR"
            autoFocus
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono tracking-wider focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
          />
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 space-y-2">
          <button
            onClick={handleConfirm}
            disabled={!canClear}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-xs font-semibold transition-all duration-200 shadow-md shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear cache & reload
          </button>
          <button
            onClick={handleCancel}
            className="w-full py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearCacheConfirm;