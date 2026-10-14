// src/components/SetPinModal.tsx
// ✅ FIXED: userId guard + localStorage fallback + debug logs
// ✅ Session error handling when userId is undefined
// ✅ NEW: shows real error (message → error code → generic) + logs full result
// ✅ MODERN UI: cleaner layout, better visuals, matches app theme
// ✅ AUTO-FOCUS: when PIN reaches 4 digits, cursor jumps to Confirm field

import { useState, useRef, useEffect } from 'react';
import { X, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { syncService } from '../services/sync/syncService';
import { validatePin } from '../utils/pinHash';
import toast from 'react-hot-toast';

interface SetPinModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SetPinModal({ isOpen, userId, onClose, onSuccess }: SetPinModalProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const pinInputRef = useRef<HTMLInputElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);

  // ✅ Auto-focus the first field when the modal opens
  useEffect(() => {
    if (isOpen) {
      // slight delay so the browser doesn't override focus after mount
      const t = setTimeout(() => pinInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[SetPinModal] handleSave called');
    console.log('[SetPinModal] userId prop:', userId);
    console.log('[SetPinModal] pin length:', pin.length);
    console.log('[SetPinModal] confirmPin length:', confirmPin.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // ✅ FIX: Fallback to localStorage if userId prop is undefined
    const effectiveUserId =
      (userId && typeof userId === 'string' && userId.trim().length > 0)
        ? userId.trim()
        : (localStorage.getItem('adin-user-id') || localStorage.getItem('adin-guest-user-id') || '');

    console.log('[SetPinModal] effectiveUserId:', effectiveUserId);

    if (!effectiveUserId) {
      console.error('[SetPinModal] ❌ No userId found (prop or localStorage)');
      setError('Session error. Please refresh the page and try again.');
      toast.error('Session error. Please refresh.');
      return;
    }

    // Validation
    const validation = validatePin(pin);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setIsSaving(true);
    try {
      console.log('[SetPinModal] Calling syncService.setPin with userId:', effectiveUserId);
      const result = await syncService.setPin(effectiveUserId, pin);
      console.log('[SetPinModal] setPin result:', JSON.stringify(result));

      if (result.ok) {
        toast.success('PIN set successfully!');
        setPin('');
        setConfirmPin('');
        setError('');
        onSuccess();
      } else {
        // ✅ Real error dikhao: message → error code → generic
        const errMsg = result.message || result.error || 'Failed to set PIN';
        console.error('[SetPinModal] ❌ setPin failed:', errMsg, '| code:', result.error);
        setError(errMsg);
      }
    } catch (e: any) {
      console.error('[SetPinModal] ❌ setPin exception:', e);
      setError(e?.message || 'Network error. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    setPin('');
    setConfirmPin('');
    setError('');
    onClose();
  };

  // ✅ Auto-advance: when PIN reaches 4 digits, move focus to Confirm
  const handlePinChange = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 4);
    setPin(clean);
    if (clean.length === 4) {
      confirmInputRef.current?.focus();
    }
  };

  // ✅ Auto-advance back: when Confirm is emptied (backspace at 0),
  //    move focus back to the PIN field for a natural typing flow.
  const handleConfirmChange = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 4);
    setConfirmPin(clean);
  };

  const handleConfirmKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && confirmPin.length === 0) {
      pinInputRef.current?.focus();
    }
    // ✅ Enter on confirm = submit (if both are 4 digits)
    if (e.key === 'Enter' && pin.length === 4 && confirmPin.length === 4) {
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_30px_80px_-20px_rgba(15,23,42,0.4)] overflow-hidden animate-in zoom-in-95 duration-200">

        {/* ═══════ HEADER ═══════ */}
        <div className="relative px-6 pt-6 pb-5">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.2} />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
              <Lock size={24} className="text-white" strokeWidth={2.4} />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <h2 className="text-[19px] font-bold text-slate-900 tracking-tight leading-tight">
                Set Your PIN
              </h2>
              <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
                Needed to restore or delete your account
              </p>
            </div>
          </div>
        </div>

        {/* ═══════ FORM ═══════ */}
        <div className="px-6 pb-6 space-y-4">

          {/* PIN */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-2">
              4-Digit PIN
            </label>
            <input
              ref={pinInputRef}
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              placeholder="••••"
              disabled={isSaving}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-center text-2xl font-mono tracking-[0.5em] focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/15 outline-none transition-all duration-150 disabled:opacity-60"
            />
          </div>

          {/* Confirm PIN */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-2">
              Confirm PIN
            </label>
            <input
              ref={confirmInputRef}
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => handleConfirmChange(e.target.value)}
              onKeyDown={handleConfirmKeyDown}
              placeholder="••••"
              disabled={isSaving}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-center text-2xl font-mono tracking-[0.5em] focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/15 outline-none transition-all duration-150 disabled:opacity-60"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-3">
              <p className="text-[12.5px] text-red-700 leading-relaxed font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Warning */}
          <div className="rounded-xl bg-amber-50/70 border border-amber-200/70 px-3.5 py-3">
            <p className="text-[12px] text-amber-900 leading-relaxed">
              <strong className="font-semibold">Important:</strong> If you forget your PIN, you won't be able to restore your data. Save it somewhere safe.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || pin.length !== 4 || confirmPin.length !== 4}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white text-[13px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 active:scale-[0.98]"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" strokeWidth={2.4} />
                  Saving...
                </>
              ) : (
                <>
                  <ShieldCheck size={14} strokeWidth={2.4} />
                  Set PIN
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}