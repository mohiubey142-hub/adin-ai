// src/components/feedback/FeedbackWidget.tsx
import { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

interface FeedbackWidgetProps {
  onOpen: () => void;
  onClose: () => void;
  isVisible: boolean;
  source: 'cv-builder' | 'cover-letter';
}

export default function FeedbackWidget({ onOpen, onClose, isVisible }: FeedbackWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9998] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div
        className={`
          relative bg-white 
          border border-slate-200 rounded-2xl 
          shadow-xl shadow-slate-900/10
          transition-all duration-300 ease-out
          ${isHovered ? 'scale-105 shadow-purple-500/20' : 'scale-100'}
          p-3
          group
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-sm shadow-purple-500/25">
              <img
                src="/icon-192x192.png"
                alt="Adin AI"
                className="w-5 h-5 object-contain"
              />
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 leading-tight">
              Adin AI
            </p>
            <p className="text-[10px] text-slate-500 leading-tight">
              Help us improve
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={onOpen}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-[10px] font-medium transition-all duration-300 hover:scale-105 shadow-md shadow-purple-500/20 flex items-center gap-1"
            >
              <MessageCircle size={12} />
              <span className="hidden xs:inline">Feedback</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-all duration-300 hover:scale-110 group/close"
              aria-label="Close feedback widget"
            >
              <X size={14} className="text-slate-400 group-hover/close:text-slate-700 transition-colors" />
            </button>
          </div>
        </div>

        {/* Bottom border accent */}
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
      </div>
    </div>
  );
}