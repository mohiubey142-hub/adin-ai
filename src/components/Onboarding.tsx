// src/components/Onboarding.tsx
// ✅ LIGHT THEME — matches app UI
// ✅ Minimal: name + consent + helper text
// ✅ No ID/PIN complexity on onboarding (progressive disclosure)
// ✅ GDPR-compliant consent (checkbox required, uncheckable by default)
// ✅ Friendly helper text — auto-save explained subtly
// ✅ Professional purple gradient scrollbar
// ✅ FIX: Privacy Policy + Terms links → path-based (no hash)

import { useState, useEffect, useRef } from "react";
import { ArrowRight, User, AlertCircle } from "lucide-react";
import { getOrCreateUserId } from '../utils/userId';
import { syncService } from '../services/sync/syncService';

interface OnboardingProps {
  onComplete: (profile: {
    name: string;
    userId: string;
  }) => void;
  onRestoreClick: () => void;
}

type OnboardingProfile = Parameters<OnboardingProps['onComplete']>[0];

const NAME_STORAGE_KEY = "adin_onboarding_name";
const ENTER_ANIMATION_MS = 1500;

// ============================================
// Consent constants
// ============================================
// ✅ FIX: Path-based URLs (no hash)
const PRIVACY_POLICY_URL = "/privacy-policy";
const TERMS_OF_SERVICE_URL = "/terms-of-service";
const LEGAL_LINK_TARGET = "_blank";
const LEGAL_LINK_WINDOW_FEATURES = "noopener,noreferrer";

const CONSENT_CHECKBOX_ID = "adin-consent";
const CONSENT_ERROR_ID = "adin-consent-error";
const CONSENT_HELPER_ID = "adin-consent-helper";
const CONSENT_ARIA_LABEL = "Agree to terms";

const NAME_ERROR_MESSAGE = "Please enter your name.";
const CONSENT_ERROR_MESSAGE =
  "Please agree to the Privacy Policy and Terms of Service to continue";

// ✅ Friendly helper text — auto-save explained subtly, no jargon
const CONSENT_HELPER_TEXT = "Your work auto-saves to a private cloud — safe and secure";

const LEGAL_LINK_CLASSES =
  "inline text-purple-600 hover:underline focus-visible:underline focus-visible:outline-none font-medium";

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [name, setName] = useState(() => localStorage.getItem(NAME_STORAGE_KEY) || "");
  const [nameError, setNameError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEnterAnimation, setShowEnterAnimation] = useState(false);

  // ✅ GDPR consent: unchecked by default (no pre-ticked boxes)
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [consentError, setConsentError] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);

  // ✅ Persist name while typing
  useEffect(() => {
    localStorage.setItem(NAME_STORAGE_KEY, name);
  }, [name]);

  // ✅ Auto-focus name input
  useEffect(() => {
    const t = setTimeout(() => nameInputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const openLegalPage = (url: string) => {
    window.open(url, LEGAL_LINK_TARGET, LEGAL_LINK_WINDOW_FEATURES);
  };

  const buildProfile = (): OnboardingProfile => ({
    name: name.trim(),
    userId: getOrCreateUserId(),
  });

  const syncProfile = (profile: OnboardingProfile) => {
    const now = Date.now();
    return syncService.syncUser({
      userId: profile.userId,
      name: profile.name,
      consentCloudSync: true,
      createdAt: now,
      updatedAt: now,
    });
  };

  const startEnterAnimation = (profile: OnboardingProfile) => {
    setShowEnterAnimation(true);

    setTimeout(() => {
      setIsLoading(false);
      setShowEnterAnimation(false);
      // Clear onboarding leftovers
      [NAME_STORAGE_KEY, "adin_onboarding_gender", "adin_onboarding_country",
       "adin_onboarding_month", "adin_onboarding_day", "adin_onboarding_year",
      ].forEach((k) => localStorage.removeItem(k));
      // Fire-and-forget Sheet sync
      syncProfile(profile).catch(err => {
        console.warn('[Onboarding] Sheet sync failed (queued for retry):', err);
      });
      onComplete(profile);
    }, ENTER_ANIMATION_MS);
  };

  const canSubmit = name.trim().length > 0 && agreedToTerms;

  const handleContinue = () => {
    if (isLoading) return;

    const isNameValid = name.trim().length > 0;
    if (!isNameValid) setNameError(NAME_ERROR_MESSAGE);
    if (!agreedToTerms) setConsentError(CONSENT_ERROR_MESSAGE);
    if (!isNameValid || !agreedToTerms) return;

    setNameError("");
    setConsentError("");
    setIsLoading(true);
    startEnterAnimation(buildProfile());
  };

  // ============================================
  // Enter Animation
  // ============================================
  if (showEnterAnimation) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <img
            src="/icon-1024x1024.png"
            alt="Adin AI"
            className="w-24 h-24 rounded-2xl shadow-xl shadow-purple-600/20 animate-pulse-slow"
          />

          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Entering Adin AI
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>

          <div className="w-64 h-1 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-500 animate-progress" />
          </div>

          <p className="text-sm text-slate-500">Setting up your workspace...</p>
        </div>

        <style>{`
          @keyframes pulse-slow {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
          .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
          .animate-progress { animation: progress ${ENTER_ANIMATION_MS}ms ease-in-out forwards; }
        `}</style>
      </div>
    );
  }

  // ============================================
  // Main render
  // ============================================
  return (
    <div className="relative min-h-screen w-full overflow-y-auto overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">

      {/* Background layers */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />

      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div
        className="fixed inset-0 opacity-[0.5]"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 0.7px, transparent 0.7px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 30%, black 15%, transparent 75%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md mx-auto p-6 animate-fade-in">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="p-2.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white shadow-lg shadow-purple-900/10">
              <img src="/icon-1024x1024.png" alt="Adin AI" className="w-16 h-16 rounded-xl" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Welcome to Adin AI
            </h2>
            <p className="text-slate-500 text-sm mt-3">
              No login • No signup • 100% Free
            </p>
          </div>

          <div className="space-y-4">
            {/* Name input */}
            <div>
              <label htmlFor="adin-name" className="block text-sm font-medium text-slate-600 mb-1.5">
                What should we call you? <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <User size={18} />
                </div>
                <input
                  id="adin-name"
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleContinue();
                  }}
                  placeholder="Enter your full name"
                  className={`w-full h-12 pl-10 pr-4 rounded-xl bg-white border ${
                    nameError
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : name.trim()
                        ? 'border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/20'
                        : 'border-slate-200 focus:border-purple-500 focus:ring-purple-500/20'
                  } text-slate-900 placeholder-slate-400 focus:ring-2 outline-none transition-all duration-300`}
                />
              </div>
              {nameError && (
                <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1 animate-fade-in">
                  <AlertCircle size={12} />
                  {nameError}
                </p>
              )}
            </div>

            {/* Consent */}
            <div>
              <label
                htmlFor={CONSENT_CHECKBOX_ID}
                className="flex items-start gap-2.5 min-h-[44px] py-1 cursor-pointer select-none"
              >
                <input
                  id={CONSENT_CHECKBOX_ID}
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (e.target.checked) setConsentError("");
                  }}
                  aria-label={CONSENT_ARIA_LABEL}
                  aria-invalid={consentError ? true : undefined}
                  aria-describedby={`${CONSENT_HELPER_ID}${consentError ? ` ${CONSENT_ERROR_ID}` : ''}`}
                  className="w-4 h-4 mt-[3px] shrink-0 cursor-pointer rounded accent-purple-600"
                />
                <span className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => openLegalPage(PRIVACY_POLICY_URL)}
                    className={LEGAL_LINK_CLASSES}
                  >
                    Privacy Policy
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={() => openLegalPage(TERMS_OF_SERVICE_URL)}
                    className={LEGAL_LINK_CLASSES}
                  >
                    Terms of Service
                  </button>
                </span>
              </label>

              {/* Helper text */}
              <p
                id={CONSENT_HELPER_ID}
                className="text-[10px] sm:text-[11px] text-slate-400 italic pl-[26px] -mt-0.5"
              >
                {CONSENT_HELPER_TEXT}
              </p>

              {/* Consent error */}
              {consentError && (
                <p
                  id={CONSENT_ERROR_ID}
                  role="alert"
                  className="text-red-600 text-xs mt-1.5 flex items-center gap-1 animate-fade-in"
                >
                  <AlertCircle size={12} className="shrink-0" />
                  {consentError}
                </p>
              )}
            </div>

            {/* Continue button */}
            <button
              type="button"
              onClick={handleContinue}
              disabled={!canSubmit || isLoading}
              className="relative w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                Continue
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-[length:200%_100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer" />
            </button>

            {/* Footer note */}
            <div className="text-center mt-4">
              <p className="text-slate-500 text-xs flex items-center justify-center gap-1.5">
                <span>🔒</span>
                <span>One-time setup • You won't see this page again</span>
              </p>
            </div>
          </div>

          <style>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
            .animate-shimmer { animation: shimmer 2s linear infinite; }

            /* Professional purple gradient scrollbar */
            ::-webkit-scrollbar { width: 8px; height: 8px; }
            ::-webkit-scrollbar-track {
              background: rgba(139, 92, 246, 0.05);
              border-radius: 10px;
              border: 1px solid rgba(139, 92, 246, 0.05);
            }
            ::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, rgba(139, 92, 246, 0.5), rgba(59, 130, 246, 0.5));
              border-radius: 10px;
              border: 1px solid rgba(139, 92, 246, 0.1);
              transition: background 0.3s ease, border-color 0.3s ease;
              box-shadow: 0 0 10px rgba(139, 92, 246, 0.05);
            }
            ::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, rgba(139, 92, 246, 0.7), rgba(59, 130, 246, 0.7));
              border-color: rgba(139, 92, 246, 0.2);
              box-shadow: 0 0 20px rgba(139, 92, 246, 0.1);
            }
            ::-webkit-scrollbar-thumb:active {
              background: linear-gradient(180deg, rgba(139, 92, 246, 0.85), rgba(59, 130, 246, 0.85));
              border-color: rgba(139, 92, 246, 0.3);
              box-shadow: 0 0 30px rgba(139, 92, 246, 0.15);
            }
            * {
              scrollbar-width: thin;
              scrollbar-color: rgba(139, 92, 246, 0.5) rgba(139, 92, 246, 0.05);
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};