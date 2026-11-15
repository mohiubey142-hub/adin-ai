// src/components/auth/AuthScreen.tsx
import { useState, useEffect, useMemo } from 'react';
import { Mail, Lock, User, ArrowRight, ArrowLeft, AlertCircle, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/sync/authService';
import { supabase } from '../../services/sync/supabaseClient';
import toast from 'react-hot-toast';
import { FORCE_LANDING_KEY } from '../../utils/inAppNav';
import { requestCaptchaToken } from '../../utils/captcha';
import { suggestEmailFix } from '../../utils/emailTypo';


interface AuthScreenProps {
  onSuccess: () => void;
  onBack?: () => void;
  /** Controlled mode — parent (URL: /login → 'signin', /signup → 'signup') decides. */
  mode?: 'signin' | 'signup';
  /** Toggle link click par parent ko batata hai (controlled mode mein). */
  onModeChange?: (mode: 'signin' | 'signup') => void;
  /** Sirf uncontrolled use ke liye (jaise Onboarding ke andar): starting mode. */
  initialMode?: 'signin' | 'signup';
}

type Mode = 'signin' | 'signup';

// ✅ Kickresume-style Password Validation (8+ chars, must have number or special char)
const validatePassword = (pass: string) => {
  const minLength = pass.length >= 8;
  const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(pass);
  
  return { 
    minLength, 
    hasNumberOrSpecial, 
    isValid: minLength && hasNumberOrSpecial 
  };
};

export const AuthScreen = ({ onSuccess, onBack, mode: modeProp, onModeChange, initialMode = 'signup' }: AuthScreenProps) => {
  // ✅ URL-driven: mode prop diya ho to wahi sach hai; warna (Onboarding ke andar) purana local state
  const [localMode, setLocalMode] = useState<Mode>(initialMode);
  const mode: Mode = modeProp ?? localMode;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Typo hint (sirf signup, sirf email field se nikalne ke baad) — kabhi block nahi karta
  const emailSuggestion = useMemo(
    () => (mode === 'signup' && emailTouched ? suggestEmailFix(email) : null),
    [mode, emailTouched, email],
  );

  // Mode badalne par (toggle ya browser Back/Forward) purana error/password saaf
  useEffect(() => {
    setError('');
    setPassword('');
  }, [mode]);

  // Toggle: asli <a href> (crawlable). Plain click par SPA switch; Ctrl/Cmd/middle-click browser par.
  const handleModeLink = (next: Mode) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (onModeChange) onModeChange(next);
    else setLocalMode(next);
  };

  const passCheck = validatePassword(password);

  // ✅ Back button AuthScreen ka apna hai — Onboarding/parent par depend nahi.
  //    1) parent onBack de to wahi   2) warna App ko 'adin:go-landing' event (SPA, reload nahi)
  //    3) App handle na kare to reload fallback (stale login keys saaf karke, warna landing skip ho jati ha)
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    const handledByApp = !window.dispatchEvent(new CustomEvent('adin:go-landing', { cancelable: true }));
    if (handledByApp) return;

    try {
      window.sessionStorage.setItem(FORCE_LANDING_KEY, 'true');
      window.localStorage.removeItem('adin-has-seen-landing');
      window.localStorage.removeItem('adin-onboarding-completed');
      window.localStorage.removeItem('adin-guest-session');
      window.localStorage.removeItem('adin_user_name');
    } catch { /* ignore */ }
    window.location.assign('/');
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setGoogleLoading(true);
      let justSignedOut = false;
      try { justSignedOut = window.localStorage.getItem('adin-just-signed-out') === '1'; } catch { /* ignore */ }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: justSignedOut ? { prompt: 'select_account' } : undefined,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Google. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first, then click "Forgot Password?".');
      return;
    }
    setError('');
    setResetLoading(true);
    try {
      // Token na mile to bhi request jaati hai — captcha ka asli faisla Supabase (server) karta hai
      const captchaToken = await requestCaptchaToken();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
        captchaToken,
      });
      if (error) throw error;
      toast.success('Password reset link sent to your email!');
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset link.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    
    // Kickresume-style Password Check
    if (mode === 'signup' && !passCheck.isValid) {
      setError('Password must be at least 8 characters and include a number or special character.');
      return;
    }

    if (!password) {
      setError('Please enter a password.');
      return;
    }

    setLoading(true);
    try {
      // Token na mile to bhi request jaati hai — captcha ka asli faisla Supabase (server) karta hai
      const captchaToken = await requestCaptchaToken();
      const res = mode === 'signup'
        ? await authService.signUpWithPassword(email, password, name, captchaToken)
        : await authService.signInWithPassword(email, password, captchaToken);

      if (!res.ok) {
        setError(res.message || 'Authentication failed.');
        setLoading(false);
        return;
      }
      onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    // ✅ Added custom scrollbar styling via inline style tag to match the theme
    <>
      <style>{`
        html, body {
          background-color: #f8fafc; /* slate-50 */
          scrollbar-width: thin;
          scrollbar-color: #a855f7 #f1f5f9; /* thumb color, track color */
        }
        /* Webkit Scrollbar (Chrome, Edge, Safari) */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9; /* slate-100 */
        }
        ::-webkit-scrollbar-thumb {
          background: #a855f7; /* purple-500 */
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #9333ea; /* purple-600 */
        }
      `}</style>

      <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-8">
        {/* ✅ Back to landing — screen ke top-left corner par */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to landing page"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src="/icon-1024x1024.png" alt="Adin AI" className="w-16 h-16 rounded-2xl shadow-lg shadow-purple-600/10" />
          </div>

          {/* Dynamic Heading based on Mode */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              {mode === 'signup' ? 'Start building your professional career for free' : 'Enter your details to access your account'}
            </p>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full h-12 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 font-medium flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin text-slate-500" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Or continue with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-slate-900 placeholder:text-slate-400 transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="Email Address"
                autoComplete="email"
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-slate-900 placeholder:text-slate-400 transition-all"
              />
            </div>

            {emailSuggestion && (
              <p className="-mt-2 text-xs text-amber-700">
                Did you mean{' '}
                <button
                  type="button"
                  onClick={() => setEmail(emailSuggestion)}
                  className="font-semibold underline hover:text-amber-800"
                >
                  {emailSuggestion}
                </button>
                ?
              </p>
            )}

            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Password (min 8 chars)' : 'Password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="w-full h-12 pl-10 pr-12 rounded-xl bg-white border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-slate-900 placeholder:text-slate-400 transition-all"
              />
              {/* Show/Hide Password Eye */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* ✅ Kickresume-style Password Checklist (Only for Signup) */}
            {mode === 'signup' && password.length > 0 && (
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

            {mode === 'signin' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors disabled:opacity-50"
                >
                  {resetLoading ? 'Sending...' : 'Forgot Password?'}
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 animate-in fade-in">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  {mode === 'signup' ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="text-center mt-6 text-sm text-slate-500">
            {mode === 'signup' ? (
              <>Already have an account?{' '}
                <a href="/login" onClick={handleModeLink('signin')} className="text-purple-600 font-semibold hover:underline">
                  Sign In
                </a>
              </>
            ) : (
              <>Don't have an account?{' '}
                <a href="/signup" onClick={handleModeLink('signup')} className="text-purple-600 font-semibold hover:underline">
                  Create Account
                </a>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
};