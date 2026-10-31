// src/components/HomeLink.tsx
// ============================================================
// Seedha khulne wale public pages (Google se aaye visitor) par "Back" ki jagah
// yeh asli <a href="/"> link dikhta hai — header khaali nahi rehta aur homepage
// ka crawlable link bhi milta hai.
// ============================================================

interface HomeLinkProps {
  /** Style override (default: plain logo + naam, bina border/shadow) */
  className?: string;
  label?: string;
}

const DEFAULT_CLASS =
  'inline-flex items-center gap-2 py-1.5 text-slate-800 hover:text-purple-700 transition-colors duration-200';

export default function HomeLink({ className, label = 'Adin AI' }: HomeLinkProps) {
  return (
    <a href="/" aria-label="Adin AI home" className={className ?? DEFAULT_CLASS}>
      <img src="/icon-1024x1024.png" alt="" className="w-6 h-6 rounded-md object-contain" />
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </a>
  );
}
