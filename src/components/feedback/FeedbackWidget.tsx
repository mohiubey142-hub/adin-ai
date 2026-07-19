// src/components/feedback/FeedbackWidget.tsx
import { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

interface FeedbackWidgetProps {
  onOpen: () => void;
  onClose: () => void;
  isVisible: boolean;
  source: 'cv-builder' | 'cover-letter';
}

export default function FeedbackWidget({ onOpen, onClose, isVisible, source }: FeedbackWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9998] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div
        className={`
          relative bg-gradient-to-br from-[#0a0a12] to-[#111122] 
          border border-purple-500/30 rounded-2xl 
          shadow-2xl shadow-purple-500/20 
          backdrop-blur-xl
          transition-all duration-300 ease-out
          ${isHovered ? 'scale-105 shadow-purple-500/30' : 'scale-100'}
          p-3
          group
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

        {/* Content */}
        <div className="flex items-center gap-3">
          {/* ✅ Adin AI Logo (No Sparkles) */}
          <div className="flex-shrink-0">
            <img
              src="/icon-192x192.png"
              alt="Adin AI"
              className="w-7 h-7 object-contain rounded-lg bg-gradient-to-br from-purple-600/10 to-blue-500/10 p-0.5 border border-purple-500/20"
            />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white leading-tight">
              Adin AI
            </p>
            <p className="text-[10px] text-gray-400 leading-tight">
              Help us improve
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={onOpen}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white text-[10px] font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/20 flex items-center gap-1"
            >
              <MessageCircle size={12} />
              <span className="hidden xs:inline">Feedback</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-all duration-300 hover:scale-110 group/close"
              aria-label="Close feedback widget"
            >
              <X size={14} className="text-gray-400 group-hover/close:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Bottom border glow */}
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      </div>
    </div>
  );
}