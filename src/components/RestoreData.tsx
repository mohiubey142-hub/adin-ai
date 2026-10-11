// src/components/RestoreData.tsx
// ============================================
// Adin AI — Restore Data Modal
// ============================================
// ✅ Supports all 3 ID formats (8-char, 8-char-hyphen, 16-char)
// ✅ PIN verification required (with no_pin_set warning case)
// ✅ NEW: If user has no PIN set → warning + allow restore
// ✅ NEW: real errors shown (rate limit / network / wrong PIN) — no more fake "No account found"

import React, { useState } from 'react';
import { CloudDownload, X, CheckCircle2, AlertCircle, Loader2, Lock, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { syncRestoreService, RestoreResult } from '../services/sync/syncRestoreService';
import { syncService } from '../services/sync/syncService';

interface RestoreDataProps {
  isOpen: boolean;
  onClose: () => void;
  onRestored?: () => void;
}

type RestoreStatus = 'idle' | 'loading' | 'success' | 'error' | 'no_pin_warning';

// ✅ Accepts all 3 formats:
//   1. ADN-XXXXXXXX           (old: 8 chars, no hyphen)
//   2. ADN-XXXX-XXXX          (old: 8 chars, with hyphen)
//   3. ADN-XXXXXXXXXXXXXXXX   (new: 16 chars continuous)
const ID_REGEX = /^ADN-[A-Z0-9]{8}$|^ADN-[A-Z0-9]{4}-[A-Z0-9]{4}$|^ADN-[A-Z0-9]{16}$/;

const RestoreData: React.FC<RestoreDataProps> = ({ isOpen, onClose, onRestored }) => {
  const [userId, setUserId] = useState('');
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<RestoreStatus>('idle');
  const [result, setResult] = useState<RestoreResult | null>(null);
  const [pinError, setPinError] = useState('');
  // ✅ Store cleanId when no_pin_set warning is shown
  const [pendingNoPinUserId, setPendingNoPinUserId] = useState<string>('');

  // ✅ Format input: uppercase, auto-insert hyphen after ADN
  const handleInputChange = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    let formatted = cleaned;
    if (cleaned.startsWith('ADN')) {
      const rest = cleaned.slice(3);
      if (rest.length <= 16) {
        formatted = 'ADN' + (rest ? '-' + rest : '');
      } else {
        formatted = 'ADN-' + rest.slice(0, 16);
      }
    }
    setUserId(formatted.slice(0, 20));
    setPinError('');
  };

  // ✅ PIN input: only digits, max 4
  const handlePinChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    setPin(cleaned);
    setPinError('');
  };

  const isValidForm = (): boolean => {
    if (!ID_REGEX.test(userId.trim().toUpperCase())) return false;
    if (pin.length !== 4) return false;
    return true;
  };

  // ✅ Core restore action — reused for both "with PIN" and "no PIN" paths
  const executeRestore = async (cleanId: string) => {
    try {
      const res = await syncRestoreService.restoreAll(cleanId);

      if (res.ok) {
        setStatus('success');
        setResult(res);
        toast.success(res.message, { duration: 5000 });
      } else {
        setStatus('error');
        setResult(res);
        toast.error(res.message);
      }
    } catch (e: any) {
      setStatus('error');
      setResult({
        ok: false,
        error: 'unknown',
        user: null,
        cvsRestored: 0,
        coverLettersRestored: 0,
        photosRestored: 0,
        message: e?.message || 'Something went wrong.',
      });
    }
  };

  const handleRestore = async () => {
    const cleanId = userId.trim().toUpperCase();

    if (!ID_REGEX.test(cleanId)) {
      toast.error('Invalid ID format');
      return;
    }

    if (pin.length !== 4) {
      setPinError('Please enter your 4-digit PIN');
      return;
    }

    setStatus('loading');
    setResult(null);
    setPinError('');

    try {
      // ✅ Check account first (status-aware: not_found vs error vs pin state)
      const acc = await syncService.checkAccount(cleanId);

      // Couldn't check (network / rate limit / secret / sync off) → show REAL reason
      if (acc.status === 'error') {
        const msg = acc.message || 'Could not check your account. Please try again.';
        setStatus('error');
        setResult({
          ok: false,
          error: 'check_failed',
          user: null,
          cvsRestored: 0,
          coverLettersRestored: 0,
          photosRestored: 0,
          message: msg,
        });
        return;
      }

      if (acc.status === 'not_found') {
        setStatus('error');
        setResult({
          ok: false,
          error: 'not_found',
          user: null,
          cvsRestored: 0,
          coverLettersRestored: 0,
          photosRestored: 0,
          message: 'No account found with this ID.',
        });
        return;
      }

      // ✅ If user has no PIN set → show warning, allow restore
      if (acc.status === 'no_pin') {
        setPendingNoPinUserId(cleanId);
        setStatus('no_pin_warning');
        return;
      }

      // ✅ User has PIN → verify it (detailed: wrong PIN / rate limit / network)
      const pinCheck = await syncService.verifyPinDetailed(cleanId, pin);

      if (!pinCheck.verified) {
        const msg = pinCheck.message || 'Invalid User ID or PIN';
        setStatus('idle');
        setPinError(msg);
        toast.error(msg);
        return;
      }

      // ✅ PIN verified → restore
      await executeRestore(cleanId);
    } catch (e: any) {
      setStatus('error');
      setResult({
        ok: false,
        error: 'unknown',
        user: null,
        cvsRestored: 0,
        coverLettersRestored: 0,
        photosRestored: 0,
        message: e?.message || 'Something went wrong.',
      });
    }
  };

  // ✅ Handler for "no PIN set" case — user chose to continue without PIN
  const handleContinueWithoutPin = async () => {
    if (!pendingNoPinUserId) return;
    setStatus('loading');
    await executeRestore(pendingNoPinUserId);
  };

  const handleClose = () => {
    if (status === 'loading') return;
    setUserId('');
    setPin('');
    setPinError('');
    setStatus('idle');
    setResult(null);
    setPendingNoPinUserId('');
    onClose();
  };

  const handleDone = () => {
    if (status === 'success') {
      onRestored?.();
      window.location.reload();
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={status === 'loading' ? undefined : handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-black/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600 to-purple-500">
          <div className="flex items-center gap-2.5">
            <CloudDownload size={18} className="text-white" />
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Restore Your Data
              </h3>
              <p className="text-[10px] text-white/80 mt-0.5">
                Enter your ID and PIN to restore
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={status === 'loading'}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {status === 'idle' && (
            <>
              {/* User ID */}
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Your Adin AI ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="ADN-XXXXXXXXXXXXXXXX"
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-slate-900 text-sm font-mono tracking-wider outline-none transition-all duration-200"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRestore();
                }}
              />
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Find your ID in the profile menu or in your workspace header.
              </p>

              {/* PIN */}
              <label className="block text-xs font-medium text-slate-600 mb-2 mt-4">
                Your 4-Digit PIN
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-slate-900 text-lg font-mono tracking-[0.5em] text-center outline-none transition-all duration-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRestore();
                  }}
                />
              </div>

              {pinError && (
                <p className="text-[11px] text-red-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {pinError}
                </p>
              )}

              <button
                onClick={handleRestore}
                disabled={!isValidForm()}
                className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Restore My Data
              </button>

              <p className="text-[10px] text-slate-400 mt-3 text-center leading-relaxed">
                🔒 Your PIN is verified securely — we never store it in plain text.
              </p>
            </>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Loader2 size={32} className="text-purple-600 animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-700">
                Verifying PIN and fetching your data...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                This may take a few seconds
              </p>
            </div>
          )}

          {/* ✅ NEW: no PIN set → warning + allow restore */}
          {status === 'no_pin_warning' && (
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={26} className="text-amber-600" strokeWidth={2.5} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                No PIN Set on This Account
              </h3>
              <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                This account doesn't have a PIN. Anyone with this ID could access it.
              </p>

              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-left mb-4">
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>Recommendation:</strong> Continue with restore, then set a PIN
                  from your profile menu to protect your data going forward.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStatus('idle');
                    setPendingNoPinUserId('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-all duration-200"
                >
                  Go Back
                </button>
                <button
                  onClick={handleContinueWithoutPin}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-purple-600/20"
                >
                  Continue Anyway
                </button>
              </div>
            </div>
          )}

          {status === 'success' && result && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={26} className="text-emerald-600" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Restore Complete!
              </h3>
              <p className="text-sm text-slate-600 mb-4">{result.message}</p>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>CVs restored:</span>
                  <span className="font-semibold text-slate-900">{result.cvsRestored}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cover Letters restored:</span>
                  <span className="font-semibold text-slate-900">{result.coverLettersRestored}</span>
                </div>
              </div>

              <button
                onClick={handleDone}
                className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-purple-600/20"
              >
                Continue
              </button>
            </div>
          )}

          {status === 'error' && result && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={26} className="text-red-600" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Restore Failed
              </h3>
              <p className="text-sm text-slate-600 mb-4">{result.message}</p>

              <button
                onClick={() => {
                  setStatus('idle');
                  setResult(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestoreData;