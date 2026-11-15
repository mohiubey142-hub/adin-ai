// src/components/profile/ChangePasswordModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Lock, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import { supabase } from '../../services/sync/supabaseClient';
import toast from 'react-hot-toast';

interface ChangePasswordModalProps {
  isOpen: boolean;
  userEmail: string;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  userEmail: initialEmail,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  // Internal email state as fallback
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    if (isOpen) {
      if (initialEmail) {
        setEmail(initialEmail);
      } else {
        // Fallback: Directly fetch from Supabase if prop is empty
        supabase.auth.getUser().then(({ data }) => {
          if (data?.user?.email) {
            setEmail(data.user.email);
          }
        });
      }
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill all fields.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword,
      });

      if (signInError) {
        setError('Current password is incorrect. If you forgot it, use "Forgot Password?" above.');
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      toast.success('Password updated successfully!');
      onClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Could not determine email address. Please refresh the page.');
      return;
    }
    
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success(`Password reset link sent to ${email}!`);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-100">
          <button
            onClick={onClose}
            disabled={loading || resetLoading}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
            <KeyRound size={20} className="text-purple-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
          <p className="text-xs text-slate-500 mt-1">Enter your current password to set a new one.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Current Password</label>
              {/* Forgot Password Button */}
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading || resetLoading}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors disabled:opacity-50"
              >
                {resetLoading ? 'Sending...' : 'Forgot Password?'}
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || resetLoading}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || resetLoading}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};