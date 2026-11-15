// src/components/profile/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import {
  X, HardDrive, Trash2, LogOut,
  ChevronRight, Mail, KeyRound
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';
import ClearCacheConfirm from '../ClearCacheConfirm';

const AVATAR_URL_STORAGE_KEY = 'adin-avatar-url';   // App.tsx ke saath same key

interface ProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userEmail: string;
  avatarUrl?: string | null;   // ✅ App.tsx se aata hai (login par save hoti hai) — ab Supabase se fetch nahi hota
  // Note: onChangePasswordClick aur onClearCacheClick ab direct ProfilePage ke andar handle honge
  onDeleteAccountClick: () => void;
  onLogoutClick: () => void;
}

const getGoogleAvatarColor = (name: string): string => {
  const colors = [
    'bg-slate-700', 'bg-slate-600', 'bg-slate-800', 'bg-zinc-700', 
    'bg-gray-700', 'bg-neutral-700'
  ];
  if (!name || name === 'User') return colors[0];
  const charCode = name.trim().charAt(0).toUpperCase().charCodeAt(0);
  return colors[charCode % colors.length];
};

const getAvatarLetter = (name: string): string => {
  if (!name || name === 'User') return 'U';
  return name.trim().charAt(0).toUpperCase();
};

const ProfilePage: React.FC<ProfilePageProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  userEmail,
  avatarUrl = null,
  onDeleteAccountClick,
  onLogoutClick,
}) => {
  // DP load na ho (link expire / Google ne rok diya) to letter wala avatar dikhao
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showClearCache, setShowClearCache] = useState(false);

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
  const avatarColor = getGoogleAvatarColor(userName);

  const handleClearCache = () => {
    // Clear cache logic (jo pehle App.tsx mein tha)
    const PRESERVE_KEYS = ['adin-user-id', 'adin_user_name', 'adin-onboarding-completed', 'adin-guest-session', 'adin-has-seen-landing', 'adin-pin-education-shown', 'adin-sync-queue', 'adin-backup-reminder-shown', AVATAR_URL_STORAGE_KEY];
    const REMOVE_PREFIXES = ['adin_cv_document_', 'adin_cv_documents_index_', 'adin_cover_letter_document_', 'adin_cover_letter_documents_index_', 'adin_cv_builder_data_'];
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key || PRESERVE_KEYS.includes(key)) continue;
        if (key === 'cover_letter_data' || REMOVE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    } catch (e) {}
    
    sessionStorage.removeItem('adin-session-page');
    sessionStorage.removeItem('adin-session-active');
    sessionStorage.removeItem('adin-session-cv-doc');
    sessionStorage.removeItem('adin-session-cl-doc');
    sessionStorage.removeItem('adin-session-template');
    sessionStorage.removeItem('adin-session-cover-template');
    sessionStorage.removeItem('adin-session-entry-source');
    sessionStorage.removeItem('adin-session-cl-entry-source');

    try { indexedDB.deleteDatabase('adin_cv_images'); } catch (e) {}
    
    setShowClearCache(false);
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#fafafa] flex flex-col animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <style>{`
        html.profile-page-open, body.profile-page-open {
          overflow: hidden !important; height: 100vh !important;
        }
        .profile-scroll::-webkit-scrollbar { width: 6px; }
        .profile-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div className="shrink-0 h-[60px] flex items-center justify-between px-6 bg-white border-b border-gray-200">
        <h1 className="text-[15px] font-semibold text-gray-900 tracking-tight">Account Settings</h1>
        <button
          onClick={onClose}
          className="p-2 -mr-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="profile-scroll flex-1 min-h-0 overflow-y-auto pb-20">
        <main className="max-w-xl mx-auto px-6 py-10">
          
          {/* Profile Header */}
          <div className="flex items-center gap-5 mb-10">
            {avatarUrl && avatarUrl !== failedAvatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="w-16 h-16 rounded-full object-cover border border-gray-200"
                referrerPolicy="no-referrer"
                onError={() => setFailedAvatarUrl(avatarUrl)}
              />
            ) : (
              <div className={`w-16 h-16 rounded-full ${avatarColor} flex items-center justify-center text-white font-medium text-2xl`}>
                {avatarLetter}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 truncate">{userName || 'User'}</h2>
              <p className="text-sm text-gray-500 truncate mt-0.5">{userEmail || 'No email attached'}</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Account Info */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Account Information
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-4">
                  <Mail size={18} className="text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{userEmail || 'No email attached'}</p>
                    <p className="text-xs text-gray-500">Email Address</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Security */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Security
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <CleanRow
                  icon={<KeyRound size={18} />}
                  title="Change Password"
                  subtitle="Send a reset link to your email"
                  onClick={() => setShowChangePassword(true)} // ✅ Opens inside ProfilePage
                />
              </div>
            </section>

            {/* Device */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Device
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <CleanRow
                  icon={<HardDrive size={18} />}
                  title="Clear Local Cache"
                  subtitle="Free up storage on this device"
                  onClick={() => setShowClearCache(true)} // ✅ Opens inside ProfilePage
                />
              </div>
            </section>

            {/* Danger Zone */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Account Actions
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {/* ✅ LogOut Icon properly used here */}
                <CleanRow
                  icon={<LogOut size={18} />}
                  title="Log out"
                  subtitle="Sign out of your session"
                  onClick={onLogoutClick}
                />
                <div className="h-px bg-gray-100 ml-14" />
                <CleanRow
                  icon={<Trash2 size={18} />}
                  title="Delete Account"
                  subtitle="Permanently remove all data"
                  onClick={onDeleteAccountClick}
                  isDanger
                />
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* ✅ Fixed Footer at bottom */}
      <div className="shrink-0 h-[50px] bg-white border-t border-gray-200 flex items-center justify-center">
        <p className="text-xs text-gray-400 font-medium">© 2026 Adin AI</p>
      </div>

      {/* ✅ Popups rendered inside ProfilePage (so they open on top of it) */}
      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
      <ClearCacheConfirm isOpen={showClearCache} onConfirm={handleClearCache} onCancel={() => setShowClearCache(false)} />
    </div>
  );
};

// Minimal Clean Row
interface CleanRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  isDanger?: boolean;
}

const CleanRow: React.FC<CleanRowProps> = ({
  icon, title, subtitle, onClick, isDanger = false
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-gray-50 group"
  >
    <div className={`shrink-0 ${isDanger ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-700'} transition-colors`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className={`text-sm font-medium truncate ${isDanger ? 'text-red-600' : 'text-gray-900'}`}>
        {title}
      </div>
      <div className="text-xs text-gray-500 truncate mt-0.5">
        {subtitle}
      </div>
    </div>
    <ChevronRight size={16} className={`shrink-0 transition-colors ${isDanger ? 'text-red-300 group-hover:text-red-400' : 'text-gray-300 group-hover:text-gray-500'}`} />
  </button>
);

export default ProfilePage;