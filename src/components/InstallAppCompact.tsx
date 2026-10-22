// src/components/InstallAppCompact.tsx
// Compact, premium PWA install button for the landing page drawer + footer.
// - Captures `beforeinstallprompt` once at module level so every instance
//   (including the drawer, which mounts later) can use it.
// - Renders nothing if the app is already installed or not installable.
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true);

interface Props {
  variant?: 'drawer' | 'footer';
}

export default function InstallAppCompact({ variant = 'drawer' }: Props) {
  const [canInstall, setCanInstall] = useState<boolean>(!!deferredPrompt && !isStandalone());

  useEffect(() => {
    const update = () => setCanInstall(!!deferredPrompt && !isStandalone());
    listeners.add(update);
    update();
    return () => {
      listeners.delete(update);
    };
  }, []);

  if (!canInstall) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch {
      /* user closed the prompt – ignore */
    }
    deferredPrompt = null;
    notify();
  };

  const isDrawer = variant === 'drawer';

  return (
    <button
      type="button"
      onClick={handleInstall}
      aria-label="Install Adin AI app"
      className={`group inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200/80 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 text-purple-700 font-semibold shadow-sm transition-all duration-300 hover:border-purple-300 hover:shadow-md hover:shadow-purple-600/10 active:scale-[0.97] ${
        isDrawer ? 'mt-2.5 w-full py-2.5 text-[13px]' : 'mt-4 px-3.5 py-2 text-xs'
      }`}
    >
      <span
        className="flex items-center justify-center w-5 h-5 rounded-md text-white shadow-sm shadow-purple-600/30 transition-transform duration-300 group-hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #2563eb 100%)' }}
      >
        <Download size={11} strokeWidth={2.5} />
      </span>
      <span>Install App</span>
    </button>
  );
}
