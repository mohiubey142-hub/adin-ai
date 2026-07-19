import React from 'react';
import { Printer, Edit3, FileText, Clipboard, RotateCcw } from 'lucide-react';
import CoverLetterEnhancer from './CoverLetterEnhancer';

interface Step3PreviewProps {
  generatedLetter: string;
  onCopy: () => void;
  onDownloadTXT: () => void;
  onDownloadPDF: () => void;
  generating: boolean;
  isEnhanced?: boolean;
  onRestoreOriginal?: () => void;
  totalScore?: number;
  overallQuality?: number;
  userName?: string;
  jobTitle?: string;
  company?: string;
  onEnhance?: (letter: string) => void;
  onEdit?: () => void;
  originalLetter?: string;
}

// ============================================================
// ===== PREMIUM ACTION BUTTONS =====
// ============================================================
const PremiumActionButtons = ({ 
  onCopy, 
  onDownloadTXT, 
  onDownloadPDF, 
  onEdit 
}: { 
  onCopy: () => void; 
  onDownloadTXT: () => void; 
  onDownloadPDF: () => void; 
  onEdit: () => void; 
}) => {
  const buttons = [
    {
      id: 'pdf',
      label: 'Download PDF',
      icon: <Printer size={20} />,
      onClick: onDownloadPDF,
      gradient: 'from-purple-600 to-blue-500',
      shadow: 'shadow-purple-500/30 hover:shadow-purple-500/50',
      hoverScale: 'hover:scale-105',
      color: 'text-white'
    },
    {
      id: 'copy',
      label: 'Copy to Clipboard',
      icon: <Clipboard size={20} />,
      onClick: onCopy,
      gradient: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/30 hover:shadow-emerald-500/50',
      hoverScale: 'hover:scale-105',
      color: 'text-white'
    },
    {
      id: 'txt',
      label: 'Download TXT',
      icon: <FileText size={20} />,
      onClick: onDownloadTXT,
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/30 hover:shadow-amber-500/50',
      hoverScale: 'hover:scale-105',
      color: 'text-white'
    },
    {
      id: 'edit',
      label: 'Back to Edit',
      icon: <Edit3 size={20} />,
      onClick: onEdit,
      gradient: 'from-rose-500 to-pink-500',
      shadow: 'shadow-rose-500/30 hover:shadow-rose-500/50',
      hoverScale: 'hover:scale-105',
      color: 'text-white'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          onClick={btn.onClick}
          className={`
            flex items-center justify-center gap-3 px-4 py-4 rounded-xl
            bg-gradient-to-r ${btn.gradient} ${btn.color}
            font-medium text-sm transition-all duration-300
            ${btn.hoverScale} hover:opacity-90
            shadow-lg ${btn.shadow}
            hover:shadow-xl
            relative overflow-hidden group
          `}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
            {btn.icon}
          </span>
          <span className="relative tracking-wide">
            {btn.label}
          </span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </button>
      ))}
    </div>
  );
};

const Step3Preview: React.FC<Step3PreviewProps> = ({ 
  generatedLetter, 
  onCopy, 
  onDownloadTXT, 
  onDownloadPDF, 
  generating,
  isEnhanced = false,
  onRestoreOriginal,
  totalScore = 0,
  overallQuality = 0,
  userName = '',
  jobTitle = '',
  company = '',
  onEnhance,
  onEdit,
  originalLetter = ''
}) => {
  return (
    <div className="space-y-4 pb-4">
      {/* ===== COVER LETTER READY PANEL ===== */}
      {generatedLetter && (
        <div className="rounded-xl p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 shadow-xl text-center transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-500/20">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30 transition-all duration-500 hover:shadow-purple-500/50">
            <span className="text-2xl">🎉</span>
          </div>
          <h3 className="text-xl font-bold text-purple-400 tracking-wide">Cover Letter Ready!</h3>
          <p className="text-xs text-gray-400 mt-1.5 tracking-wide">Your professional cover letter is ready for use</p>
          <div className="mt-5 flex justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{totalScore}%</p>
              <p className="text-[10px] text-gray-400 tracking-wide">Complete</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{overallQuality}%</p>
              <p className="text-[10px] text-gray-400 tracking-wide">Quality</p>
            </div>
          </div>
          
          {isEnhanced && onRestoreOriginal && (
            <button 
              onClick={onRestoreOriginal}
              className="mt-4 px-4 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <RotateCcw size={14} /> Restore Original
            </button>
          )}
        </div>
      )}

      {/* ===== COVER LETTER ENHANCER ===== */}
      {generatedLetter && onEnhance && (
        <CoverLetterEnhancer 
          originalLetter={originalLetter || generatedLetter}
          onEnhance={onEnhance}
          userName={userName}
          jobTitle={jobTitle}
          company={company}
          isEnhanced={isEnhanced}
          onRestoreOriginal={onRestoreOriginal}
        />
      )}

      {/* ============================================================
          ✅ FIXED: Premium Action Buttons - Sticky at bottom
          ============================================================ */}
      {generatedLetter && (
        <div className="sticky bottom-0 pt-4 pb-2 bg-gray-900/95 backdrop-blur-sm -mx-6 px-6 rounded-b-2xl">
          <PremiumActionButtons 
            onCopy={onCopy}
            onDownloadTXT={onDownloadTXT}
            onDownloadPDF={onDownloadPDF}
            onEdit={onEdit || (() => {})}
          />
        </div>
      )}
    </div>
  );
};

export default Step3Preview;