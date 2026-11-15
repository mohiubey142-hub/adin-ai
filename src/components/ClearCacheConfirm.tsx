// src/components/ClearCacheConfirm.tsx
import React, { useState } from 'react';
import { HardDrive, X, CheckCircle2, XCircle } from 'lucide-react';
import { getStorageUsageMB } from './cv-builder/utils/storageUtils';

interface ClearCacheConfirmProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ClearCacheConfirm: React.FC<ClearCacheConfirmProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isOpen) return null;

  const usedMB = getStorageUsageMB();
  const canClear = isConfirmed;

  const handleConfirm = () => {
    if (!canClear) return;
    setIsConfirmed(false);
    onConfirm();
  };

  const handleCancel = () => {
    setIsConfirmed(false);
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

        <div className="px-5 pb-4">
          <div className="grid grid-cols-2 gap-2">
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

            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 size={12} className="text-emerald-600" strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Will stay safe
                </span>
              </div>
              <ul className="space-y-1 text-[10px] text-emerald-700 leading-relaxed">
                <li>• Your Account</li>
                <li>• Cloud backups</li>
                <li>• Email & Password</li>
                <li>• Account access</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Current usage</span>
              <span className="font-bold text-slate-900">{usedMB.toFixed(2)} MB</span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-4">
          <label 
            htmlFor="confirm-clear" 
            className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <input
              id="confirm-clear"
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              I understand that my local data will be removed from this browser.
            </span>
          </label>
        </div>

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