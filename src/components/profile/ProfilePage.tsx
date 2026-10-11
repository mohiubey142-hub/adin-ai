// src/components/profile/ProfilePage.tsx
// Full-screen Profile page
// ✅ Premium minimal UI — clean, elegant, uncluttered
// ✅ Inner content scrolls, header stays fixed
// ✅ Subtle purple scrollbar (matches theme)
// ✅ Body scroll lock via CSS class (overrides App.tsx !important)
// ✅ Sectioned layout with hairline separators
// ✅ Removed: "NEW" badge, gradient hero, decorative circles

import React, { useEffect } from 'react';
import {
  X, Copy, CloudDownload, Download, Lock, HardDrive, Trash2, LogOut,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  useEffect(() => {
    if (!isOpen) return;

    document.documentElement.classList.add('profile-page-open');
    document.body.classList.add('profile-page-open');

    return () => {
      document.documentElement.classList.remove('profile-page-open');
      document.body.classList.remove('profile-page-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const avatarLetter = getAvatarLetter(userName);

  const handleCopyId = () => {
    if (!userId) return;
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
              <p className="text-sm text-slate-500 mt-0.5">
                Guest Account
              </p>
            </div>
          </section>

          {/* User ID */}
          {userId && (
            <section className="mb-10">
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Adin AI ID
                </h3>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-purple-600 transition-colors"
                >
                  <Copy size={11} strokeWidth={2.4} />
                  <span>Copy</span>
                </button>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 px-4 py-3.5">
                <div className="text-sm font-semibold text-slate-900 font-mono tracking-wider select-all text-center break-all">
                  {userId}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Use this to restore your data on any device.
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
                subtitle="Save as .txt file"
                onClick={() => handleAction(onDownloadIdClick)}
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
}

const ProfileRow: React.FC<ProfileRowProps> = ({
  icon,
  title,
  subtitle,
  onClick,
  variant = 'default',
}) => {
  const isDanger = variant === 'danger';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-4 sm:px-5 py-4 text-left transition-colors duration-150 group ${
        isDanger ? 'hover:bg-red-50/50' : 'hover:bg-slate-50'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150 ${
          isDanger
            ? 'bg-red-50 text-red-600 group-hover:bg-red-100'
            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
        }`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-medium truncate ${
            isDanger ? 'text-red-700' : 'text-slate-900'
          }`}
        >
          {title}
        </div>
        <div
          className={`text-xs mt-0.5 truncate ${
            isDanger ? 'text-red-500/80' : 'text-slate-500'
          }`}
        >
          {subtitle}
        </div>
      </div>

      <ChevronRight
        size={16}
        strokeWidth={2}
        className={`shrink-0 transition-colors duration-150 ${
          isDanger
            ? 'text-slate-300 group-hover:text-red-400'
            : 'text-slate-300 group-hover:text-slate-500'
        }`}
      />
    </button>
  );
};

export default ProfilePage;