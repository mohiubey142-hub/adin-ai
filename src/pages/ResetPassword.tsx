// src/pages/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/sync/supabaseClient';
import { Lock, Loader2, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

// ✅ Same validation as AuthScreen
const validatePassword = (pass: string) => {
  const minLength = pass.length >= 8;
  const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(pass);
  return {
    minLength,
    hasNumberOrSpecial,
    isValid: minLength && hasNumberOrSpecial,
  };
};

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const passCheck = validatePassword(password);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      } else {
        setError('This password reset link is invalid or has expired. Please request a new one.');
      }
      setCheckingSession(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setIsValidSession(true);
        setCheckingSession(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!passCheck.isValid) {
      setError('Password must be at least 8 characters and include a number or special character.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      toast.success('Password updated successfully!');
      
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);

    } catch (err: any) {
      setError(err?.message || 'Failed to update password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Loading State
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-purple-600 animate-spin" />
          <p className="text-sm text-slate-500">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // 2. Success State
  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset!</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Your password has been changed successfully. You can now use your new password to sign in.
          </p>
          <a 
            href="/" 
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
          >
            Continue to App <ArrowRight size={18} />
          </a>
        </div>
      </div>
    );
  }

  // 3. Error State (Invalid Link)
  if (!isValidSession && !checkingSession) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Link Expired</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            {error}
          </p>
          <a 
            href="/" 
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-2 transition-all"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  // 4. Form State
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-8">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 animate-in slide-in-from-bottom-4 duration-300">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
          <p className="text-sm text-slate-500 mt-2">
            Please enter your new password below to secure your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* ✅ Password Checklist — same as AuthScreen */}
          {password.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-700 mb-1">Password must contain:</p>
              <div className="grid grid-cols-1 gap-2 text-[11px]">
                <div className={`flex items-center gap-1.5 ${passCheck.minLength ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <CheckCircle2 size={12} className={passCheck.minLength ? 'opacity-100' : 'opacity-40'} />
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-1.5 ${passCheck.hasNumberOrSpecial ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <CheckCircle2 size={12} className={passCheck.hasNumberOrSpecial ? 'opacity-100' : 'opacity-40'} />
                  A number or special character (e.g. 1, @, #)
                </div>
              </div>
            </div>
          )}

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
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs animate-in fade-in">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}