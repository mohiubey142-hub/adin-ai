// src/components/feedback/GlobalFeedbackButton.tsx
import { MessageCircle } from 'lucide-react';

interface GlobalFeedbackButtonProps {
  onClick: () => void;
  hidden?: boolean;
}

export default function GlobalFeedbackButton({ onClick, hidden }: GlobalFeedbackButtonProps) {
  if (hidden) return null;

  return (
    <button
      onClick={onClick}
      aria-label="Give feedback"
      className="fixed bottom-6 right-6 z-[9997] group flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-semibold shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
    >
      <MessageCircle size={18} className="group-hover:rotate-12 transition-transform duration-300" />
      <span className="hidden sm:inline">Feedback</span>
    </button>
  );
}