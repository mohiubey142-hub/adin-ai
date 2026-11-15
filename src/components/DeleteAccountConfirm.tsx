// src/components/DeleteAccountConfirm.tsx
// ============================================
// Account Deletion Confirmation Modal (Supabase)
// ============================================
// ✅ Simple confirmation checkbox (No PIN required anymore)
// ✅ Clean, straightforward UI

import { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { accountDeletionService } from '../services/accountDeletionService';
import toast from 'react-hot-toast';

interface DeleteAccountConfirmProps {
  isOpen: boolean;
  userId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteAccountConfirm({
  isOpen,
  userId,
  onConfirm,
  onCancel,
}: DeleteAccountConfirmProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const canDelete = isConfirmed && !isDeleting;

  const handleDelete = async () => {
    if (!canDelete) return;

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

  const handleCancel = () => {
    if (isDeleting) return;
    setIsConfirmed(false);
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6">
        {/* Close */}
        {!isDeleting && (
          <button
            onClick={handleCancel}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            aria-label="Close"
          >
            <X size={16} className="text-slate-500" />
          </button>
        )}

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
          <li>Your Account details</li>
          <li>All data from our cloud database</li>
        </ul>

        <p className="text-xs text-red-600 mb-5 leading-relaxed">
          <strong>Once deleted, this data cannot be recovered.</strong>
        </p>

        {/* Checkbox */}
        <div className="mb-6">
          <label htmlFor="confirm-delete" className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              id="confirm-delete"
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              disabled={isDeleting}
              className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              I understand that this action is permanent and all my data will be erased.
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Forever'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}