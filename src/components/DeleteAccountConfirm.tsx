// src/components/DeleteAccountConfirm.tsx
// ============================================
// Account Deletion Confirmation Modal
// ============================================
// ✅ PIN verification required before delete (only if PIN is set)
// ✅ Double confirmation: "DELETE" text + 4-digit PIN
// ✅ Checks PIN existence upfront — hides PIN field if not set
// ✅ Plain text style (no over-colorful cards)
// ✅ Profile photo line removed
// ✅ Forgot PIN? → hint to change PIN from profile (no old PIN needed)
// ✅ NEW: real PIN error shown (wrong PIN / rate limit / network)
// ✅ NEW: if PIN status can't be checked (network/rate limit) → delete BLOCKED + Retry
//         (before: any error was treated as "no PIN" and PIN step was skipped)

import { useState, useEffect } from 'react';
import { AlertTriangle, X, Loader2, Lock, AlertCircle } from 'lucide-react';
import { accountDeletionService } from '../services/accountDeletionService';
import { syncService } from '../services/sync/syncService';
import toast from 'react-hot-toast';

interface DeleteAccountConfirmProps {
  isOpen: boolean;
  userId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

type AccountCheckState = 'checking' | 'has_pin' | 'no_pin' | 'error';

export default function DeleteAccountConfirm({
  isOpen,
  userId,
  onConfirm,
  onCancel,
}: DeleteAccountConfirmProps) {
  const [confirmText, setConfirmText] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [accountState, setAccountState] = useState<AccountCheckState>('checking');
  const [checkError, setCheckError] = useState('');
  const [checkAttempt, setCheckAttempt] = useState(0); // bump to retry the account check

  useEffect(() => {
    if (!isOpen) {
      setConfirmText('');
      setPin('');
      setPinError('');
      setIsDeleting(false);
      setIsVerifying(false);
      setAccountState('checking');
      setCheckError('');
      return;
    }

    let cancelled = false;
    setAccountState('checking');
    setCheckError('');

    (async () => {
      try {
        const res = await syncService.getPinStatus(userId);
        if (cancelled) return;

        if (res.status === 'has_pin') {
          setAccountState('has_pin');
        } else if (res.status === 'no_pin') {
          setAccountState('no_pin');
        } else {
          setCheckError(res.message || 'Could not check your account. Please try again.');
          setAccountState('error');
        }
      } catch (e: any) {
        if (cancelled) return;
        setCheckError(e?.message || 'Could not check your account. Please try again.');
        setAccountState('error');
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen, userId, checkAttempt]);

  if (!isOpen) return null;

  const canDelete =
    confirmText === 'DELETE' &&
    (accountState === 'no_pin' || (accountState === 'has_pin' && pin.length === 4));

  const handlePinChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    setPin(cleaned);
    setPinError('');
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await accountDeletionService.deleteAccount(userId);
      if (result.ok) {
        toast.success('Account deleted permanently', { duration: 4000 });
        onConfirm();
      } else {
        toast.error(result.message || 'Deletion failed');
        setIsDeleting(false);
      }
    } catch (e) {
      console.error('[DeleteAccount] Failed:', e);
      toast.error('Failed to delete account. Try again.');
      setIsDeleting(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;

    if (accountState === 'has_pin') {
      setIsVerifying(true);
      setPinError('');

      try {
        const r = await syncService.verifyPinDetailed(userId, pin);
        if (!r.verified) {
          const msg = r.message || 'Incorrect PIN';
          setPinError(msg);
          toast.error(msg);
          setIsVerifying(false);
          return;
        }
      } catch (e: any) {
        const msg = e?.message || 'Failed to verify PIN';
        setPinError(msg);
        toast.error(msg);
        setIsVerifying(false);
        return;
      }

      setIsVerifying(false);
    }

    await executeDelete();
  };

  const handleCancel = () => {
    if (isDeleting || isVerifying) return;
    setConfirmText('');
    setPin('');
    setPinError('');
    onCancel();
  };

  const isBusy = isDeleting || isVerifying;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6">
        {/* Close */}
        {!isBusy && (
          <button
            onClick={handleCancel}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            aria-label="Close"
          >
            <X size={16} className="text-slate-500" />
          </button>
        )}

        {/* LOADING STATE */}
        {accountState === 'checking' && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Loader2 size={32} className="text-red-600 animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-700">
              Checking account...
            </p>
          </div>
        )}

        {/* ✅ NEW: ERROR STATE (could not check PIN status) */}
        {accountState === 'error' && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
              <AlertCircle size={22} className="text-red-600" />
            </div>
            <p className="text-sm font-semibold text-slate-900 mb-1">
              Couldn't check your account
            </p>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              {checkError}
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setCheckAttempt((n) => n + 1)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* MAIN FORM */}
        {(accountState === 'has_pin' || accountState === 'no_pin') && (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={22} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Account?</h3>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            {/* Warning */}
            <p className="text-sm text-slate-700 mb-3 leading-relaxed">
              This will <strong className="text-red-600">permanently delete</strong> your account and everything in it:
            </p>

            <ul className="text-xs text-slate-600 space-y-1.5 mb-4 pl-5 list-disc">
              <li>Your CVs and Cover Letters</li>
              <li>Your User ID</li>
              <li>All data from our cloud database</li>
            </ul>

            <p className="text-xs text-red-600 mb-5 leading-relaxed">
              <strong>Once deleted, this data cannot be recovered.</strong>
            </p>

            {/* PIN status hint */}
            {accountState === 'no_pin' && (
              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                This account has no PIN set. Just type DELETE below to confirm.
              </p>
            )}

            {accountState === 'has_pin' && (
              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                Enter your PIN to confirm deletion.
              </p>
            )}

            {/* Step 1: Type DELETE */}
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Step 1: Type <code className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-red-600 font-bold">DELETE</code> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              disabled={isBusy}
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm mb-4 font-mono tracking-wider focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none disabled:opacity-60"
            />

            {/* Step 2: PIN */}
            {accountState === 'has_pin' && (
              <>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Step 2: Enter your 4-digit PIN
                </label>
                <div className="relative mb-3">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    placeholder="••••"
                    disabled={isBusy}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border ${
                      pinError ? 'border-red-500' : 'border-slate-200'
                    } text-slate-900 text-lg font-mono tracking-[0.5em] text-center focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none disabled:opacity-60`}
                  />
                </div>

                {pinError && (
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-red-600">
                    <AlertCircle size={12} />
                    <span>{pinError}</span>
                  </div>
                )}

                {/* Forgot PIN hint */}
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                  Forgot your PIN? No problem — you can change it from your profile. No old PIN needed. Just cancel this, go to Profile → "Change PIN", and come back.
                </p>
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleCancel}
                disabled={isBusy}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!canDelete || isBusy}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Verifying...
                  </>
                ) : isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Forever'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
