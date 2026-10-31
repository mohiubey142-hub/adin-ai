// src/components/HomeLink.tsx
// ============================================================
// Seedha khulne wale public pages (Google se aaye visitor) par "Back" ki jagah
// yeh asli <a href="/"> link dikhta hai — header khaali nahi rehta aur homepage
// ka crawlable link bhi milta hai.
// ============================================================

interface HomeLinkProps {
  /** Style override (default: Privacy/Terms/Contact wale Back button jaisa pill) */
  className?: string;
  label?: string;
}

const DEFAULT_CLASS =
  'group inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 transition-all duration-200 shadow-sm hover:shadow-md';

export default function HomeLink({ className, label = 'Adin AI' }: HomeLinkProps) {
  return (
    <a href="/" aria-label="Adin AI home" className={className ?? DEFAULT_CLASS}>
      <img src="/icon-1024x1024.png" alt="" className="w-5 h-5 rounded-md object-contain" />
      <span className="text-xs sm:text-sm font-semibold">{label}</span>
    </a>
  );
}
