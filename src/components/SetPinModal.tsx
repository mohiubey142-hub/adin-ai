// src/components/SetPinModal.tsx
// ✅ FIXED: userId guard + localStorage fallback + debug logs
// ✅ Session error handling when userId is undefined
// ✅ NEW: shows real error (message → error code → generic) + logs full result

import { useState } from 'react';
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6">
        <button
          onClick={handleClose}
          disabled={isSaving}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
          aria-label="Close"
        >
          <X size={16} className="text-slate-500" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <Lock size={22} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Set Your PIN</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Needed to restore or delete your account
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              4-Digit PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              disabled={isSaving}
              autoFocus
              className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-center text-2xl font-mono tracking-[0.5em] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              disabled={isSaving}
              className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-center text-2xl font-mono tracking-[0.5em] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none disabled:opacity-60"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Important:</strong> If you forget your PIN, you won't be able to restore your data. Save it somewhere safe.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || pin.length !== 4 || confirmPin.length !== 4}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
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
