// src/components/profile/ProfilePage.tsx
// Full-screen Profile page
// ✅ Premium minimal UI — clean, elegant, uncluttered
// ✅ Inner content scrolls, header stays fixed
// ✅ Subtle purple scrollbar (matches theme)
// ✅ Body scroll lock via CSS class (overrides App.tsx !important)
// ✅ Sectioned layout with hairline separators
// ✅ Guest Account Info Button & Modal
// ✅ UPDATED: ID and Download button always visible (disabled until PIN is set)

import React, { useEffect, useState } from 'react';
import {
  X, Copy, CloudDownload, Download, Lock, HardDrive, Trash2, LogOut,
  ChevronRight, Gift, ArrowRight, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Restore needs BOTH the ID and the PIN → the ID is only copyable once a PIN is set.
const ID_HINT_WITH_PIN = 'Use this together with your PIN to restore your data on any device.';
const ID_HINT_NO_PIN = 'Your ID alone cannot restore your data — set a PIN below first.';

interface ProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  hasPinSet: boolean;
  onRestoreClick: () => void;
  onDownloadIdClick: () => void;
  onSetPinClick: () => void;
  onClearCacheClick: () => void;
  onDeleteAccountClick: () => void;
  onLogoutClick: () => void;
}

const getAvatarLetter = (name: string): string => {
  if (!name || name === 'User') return 'U';
  return name.trim().charAt(0).toUpperCase();
};

const ProfilePage: React.FC<ProfilePageProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  hasPinSet,
  onRestoreClick,
  onDownloadIdClick,
  onSetPinClick,
  onClearCacheClick,
  onDeleteAccountClick,
  onLogoutClick,
}) => {
  const [showGuestInfo, setShowGuestInfo] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    document.documentElement.classList.add('profile-page-open');
    document.body.classList.add('profile-page-open');

    return () => {
      document.documentElement.classList.remove('profile-page-open');
      document.body.classList.remove('profile-page-open');
    };
  }, [isOpen]);

  // Close guest-info popup automatically if the whole profile page closes.
  useEffect(() => {
    if (!isOpen) setShowGuestInfo(false);
  }, [isOpen]);

  // Esc key closes the guest-info popup first, then the profile page.
  useEffect(() => {
    if (!showGuestInfo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowGuestInfo(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showGuestInfo]);

  if (!isOpen) return null;

  const avatarLetter = getAvatarLetter(userName);

  const handleCopyId = () => {
    if (!userId || !hasPinSet) return; // Guard (though button is disabled)
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(userId);
      } else {
        const ta = document.createElement('textarea');
        ta.value = userId;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast.success('User ID copied', { duration: 2000 });
    } catch (err) {
      toast.error('Copy failed');
    }
  };

  const handleAction = (fn: () => void) => {
    onClose();
    setTimeout(() => fn(), 200);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Profile"
    >
      <style>{`
        html.profile-page-open,
        body.profile-page-open {
          overflow: hidden !important;
          height: 100vh !important;
          max-height: 100vh !important;
          min-height: 100vh !important;
        }

        .profile-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .profile-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .profile-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.4);
          border-radius: 10px;
        }
        .profile-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.6);
        }
        .profile-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }
        .profile-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
        }

        .guest-info-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .guest-info-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .guest-info-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.4);
          border-radius: 10px;
        }
        .guest-info-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.6);
        }
        .guest-info-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }
        .guest-info-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
        }
      `}</style>

      {/* Header bar */}
      <div className="shrink-0 h-[56px] flex items-center justify-between px-4 sm:px-6 bg-white border-b border-slate-200">
        <button
          onClick={onClose}
          aria-label="Close profile"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <X size={16} strokeWidth={2.2} />
          <span>Close</span>
        </button>

        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">
          Profile
        </h1>

        <div className="w-[72px]" aria-hidden="true" />
      </div>

      {/* Scrollable content */}
      <div className="profile-scroll flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <main className="max-w-lg mx-auto px-4 sm:px-6 py-10 sm:py-14">

          {/* Hero — minimal */}
          <section className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-semibold text-xl shadow-sm shrink-0">
              {avatarLetter}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                {userName || 'User'}
              </h2>

              {/* Guest Account Button */}
              <button
                type="button"
                onClick={() => setShowGuestInfo(true)}
                aria-label="What is a Guest Account?"
                className="group inline-flex items-center gap-1.5 mt-1.5 pl-2.5 pr-2 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 hover:shadow-sm active:scale-[0.97] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40"
              >
                <Gift
                  size={13}
                  strokeWidth={2.4}
                  className="text-purple-600 group-hover:text-purple-700 transition-colors duration-150 shrink-0"
                />
                <span className="text-xs font-semibold tracking-tight whitespace-nowrap">
                  Guest Account
                </span>
                <ArrowRight
                  size={12}
                  strokeWidth={2.6}
                  className="text-purple-500 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
                />
              </button>
            </div>
          </section>

          {/* User ID Section */}
          {userId && (
            <section className="mb-10">
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Adin AI ID
                </h3>
                <button
                  type="button"
                  onClick={handleCopyId}
                  disabled={!hasPinSet}
                  className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors ${
                    hasPinSet
                      ? 'text-slate-500 hover:text-purple-600'
                      : 'text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Copy size={11} strokeWidth={2.4} />
                  <span>Copy</span>
                </button>
              </div>
              <div className={`rounded-xl border px-4 py-3.5 transition-colors ${
                hasPinSet ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className={`text-sm font-semibold font-mono tracking-wider select-all text-center break-all ${
                  hasPinSet ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {userId}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {hasPinSet ? ID_HINT_WITH_PIN : ID_HINT_NO_PIN}
              </p>
            </section>
          )}

          {/* Section: Backup & security */}
          <section className="mb-10">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Backup & Security
            </h3>

            <div className="rounded-xl bg-white border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              <ProfileRow
                icon={<CloudDownload size={17} strokeWidth={2} />}
                title="Restore from another device"
                subtitle="Use your ID + PIN to restore"
                onClick={() => handleAction(onRestoreClick)}
              />
              <ProfileRow
                icon={<Download size={17} strokeWidth={2} />}
                title="Download my ID"
                subtitle={hasPinSet ? "Save as .txt file" : "Set PIN to enable download"}
                onClick={() => handleAction(onDownloadIdClick)}
                disabled={!hasPinSet}
              />
              <ProfileRow
                icon={<Lock size={17} strokeWidth={2} />}
                title={hasPinSet ? 'Change PIN' : 'Set PIN'}
                subtitle={
                  hasPinSet
                    ? 'Update your 4-digit PIN'
                    : 'Secure your account with a 4-digit PIN'
                }
                onClick={() => handleAction(onSetPinClick)}
              />
            </div>
          </section>

          {/* Section: Device */}
          <section className="mb-10">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Device
            </h3>

            <div className="rounded-xl bg-white border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              <ProfileRow
                icon={<HardDrive size={17} strokeWidth={2} />}
                title="Clear local cache"
                subtitle="Free up storage on this device"
                onClick={() => handleAction(onClearCacheClick)}
              />
            </div>
          </section>

          {/* Section: Account */}
          <section className="mb-10">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Account
            </h3>

            <div className="rounded-xl bg-white border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              <ProfileRow
                icon={<LogOut size={17} strokeWidth={2} />}
                title="Logout"
                subtitle="Sign out of your session"
                onClick={() => handleAction(onLogoutClick)}
                variant="default"
              />
              <ProfileRow
                icon={<Trash2 size={17} strokeWidth={2} />}
                title="Delete my account"
                subtitle="Permanently remove all data"
                onClick={() => handleAction(onDeleteAccountClick)}
                variant="danger"
              />
            </div>
          </section>

          {/* Footer */}
          <p className="text-center text-[11px] text-slate-400 mt-12 mb-6">
            © 2026 Adin AI
          </p>
        </main>
      </div>

      {/* Guest Account Info Modal */}
      {showGuestInfo && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowGuestInfo(false)}
          role="dialog"
          aria-modal="true"
          aria-label="About your Guest Account"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-black/20 overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600 to-blue-500 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Gift size={15} className="text-white" strokeWidth={2.4} />
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight truncate">
                  Your Guest Account
                </h3>
              </div>
              <button
                onClick={() => setShowGuestInfo(false)}
                aria-label="Close"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors duration-200 shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="guest-info-scroll flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-5">

              {/* Warm welcome line */}
              <div className="flex items-start gap-3 rounded-xl bg-gradient-to-br from-purple-50 via-white to-blue-50 border border-purple-100 px-4 py-3.5">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mt-0.5">
                  <Sparkles size={15} strokeWidth={2.2} />
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">
                  <strong className="font-semibold text-slate-900">
                    You've been given a Guest Account
                  </strong>{' '}
                  — a private space to try Adin AI freely, no signup needed.
                </p>
              </div>

              {/* What is it */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">
                  What is a Guest Account?
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A private space we automatically create for you — no email,
                  no password, no signup required. It comes with a unique{' '}
                  <strong className="text-slate-800">User ID</strong> and an
                  optional <strong className="text-slate-800">4-digit PIN</strong>{' '}
                  for extra security.
                </p>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Why we give it */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  Why do we give it to you?
                </h4>
                <div className="space-y-3">
                  <InfoStep
                    number="1"
                    title="Try before signup"
                    body="Use the app freely, decide later. No email upfront."
                  />
                  <InfoStep
                    number="2"
                    title="Private by default"
                    body="Your data stays yours. We never sell or share it."
                  />
                  <InfoStep
                    number="3"
                    title="Restore on any device"
                    body="Your User ID + PIN brings your work anywhere."
                  />
                  <InfoStep
                    number="4"
                    title="Full control"
                    body="Download your ID, export documents, or delete anytime."
                  />
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Backup key */}
              <div className="rounded-xl bg-purple-50/60 border border-purple-100 px-4 py-3.5">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-purple-700 mb-1.5">
                  Your backup key
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">User ID + 4-digit PIN</strong>.
                  Save them somewhere safe — they're your only key to restore
                  your account on another device.
                </p>
              </div>

            </div>

            {/* Modal footer */}
            <div className="px-5 py-4 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setShowGuestInfo(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-semibold text-sm tracking-tight transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Row component
// ═══════════════════════════════════════════════════════════════
interface ProfileRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

const ProfileRow: React.FC<ProfileRowProps> = ({
  icon,
  title,
  subtitle,
  onClick,
  variant = 'default',
  disabled = false,
}) => {
  const isDanger = variant === 'danger';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3.5 px-4 sm:px-5 py-4 text-left transition-colors duration-150 group ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : isDanger
            ? 'hover:bg-red-50/50'
            : 'hover:bg-slate-50'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150 ${
          disabled
            ? 'bg-slate-50 text-slate-400'
            : isDanger
              ? 'bg-red-50 text-red-600 group-hover:bg-red-100'
              : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
        }`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-medium truncate ${
            disabled ? 'text-slate-400' : isDanger ? 'text-red-700' : 'text-slate-900'
          }`}
        >
          {title}
        </div>
        <div
          className={`text-xs mt-0.5 truncate ${
            disabled ? 'text-slate-400' : isDanger ? 'text-red-500/80' : 'text-slate-500'
          }`}
        >
          {subtitle}
        </div>
      </div>

      <ChevronRight
        size={16}
        strokeWidth={2}
        className={`shrink-0 transition-colors duration-150 ${
          disabled
            ? 'text-slate-200'
            : isDanger
              ? 'text-slate-300 group-hover:text-red-400'
              : 'text-slate-300 group-hover:text-slate-500'
        }`}
      />
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
// Info step component (for the Guest Account modal)
// ═══════════════════════════════════════════════════════════════
interface InfoStepProps {
  number: string;
  title: string;
  body: string;
}

const InfoStep: React.FC<InfoStepProps> = ({ number, title, body }) => (
  <div className="flex items-start gap-3">
    <div className="shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[11px] font-bold mt-0.5">
      {number}
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-sm font-semibold text-slate-900 leading-tight">
        {title}
      </div>
      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
        {body}
      </div>
    </div>
  </div>
);

export default ProfilePage;