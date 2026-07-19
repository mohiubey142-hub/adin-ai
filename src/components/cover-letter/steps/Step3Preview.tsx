import React from 'react';
import { Copy, File, Printer, Eye, Sparkles, RotateCcw } from 'lucide-react';

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
}

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
  company = ''
}) => {
  return (
    <div className="space-y-4">
      {/* ===== COVER LETTER READY PANEL ===== */}
      {generatedLetter && (
        <div className="rounded-xl p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 shadow-xl text-center transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-500/20">
          {/* ===== CONGRATULATIONS ICON WITH SLOW PERMANENT HOVER ===== */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30 transition-all duration-500 hover:shadow-purple-500/50 animate-float-cover animate-glow-cover">
            <span className="text-2xl congrats-icon">🎉</span>
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
          
          {/* Restore button */}
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

      {/* ===== PREVIEW SECTION ===== */}
      <div className="rounded-xl bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 p-5">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
            <Eye size={14} /> Preview
          </h3>
          <div className="flex gap-2">
            <button onClick={onCopy} className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm transition flex items-center gap-1">
              <Copy size={12} /> Copy
            </button>
            <button onClick={onDownloadTXT} className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm transition flex items-center gap-1">
              <File size={12} /> TXT
            </button>
            <button onClick={onDownloadPDF} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm transition flex items-center gap-1">
              <Printer size={12} /> PDF
            </button>
          </div>
        </div>
        
        {generatedLetter ? (
          <div className="bg-black/40 rounded-lg p-4 max-h-[450px] overflow-auto preview-scroll">
            <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">{generatedLetter}</div>
          </div>
        ) : (
          <div className="bg-black/40 rounded-lg p-8 text-center">
            <Sparkles size={40} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-500 text-sm">
              {generating ? 'Generating your cover letter...' : 'Fill details and style, then click "Generate Letter"'}
            </p>
          </div>
        )}
      </div>

      {/* ===== QUALITY SCORE SECTION ===== */}
      {generatedLetter && (
        <div className="rounded-xl p-4 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xl shadow-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <span className="font-semibold text-sm text-white">Letter Quality Score</span>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <div className="text-white font-bold text-base">{overallQuality}<span className="text-xs text-white/60">/100</span></div>
                <div className="text-[8px] text-white/60">Quality</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-base">{totalScore}<span className="text-xs text-white/60">%</span></div>
                <div className="text-[8px] text-white/60">Relevance</div>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
            <div className="bg-white h-1.5 rounded-full transition-all duration-700" style={{ width: `${overallQuality}%` }}></div>
          </div>
        </div>
      )}

      {/* ===== PRO TIPS ===== */}
      <div className="rounded-xl p-4 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20">
        <h4 className="text-sm font-semibold text-purple-400 mb-2">💡 Pro Tips</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div>• Research the company</div>
          <div>• Quantify achievements</div>
          <div>• Keep it one page</div>
          <div>• Customize with your voice</div>
        </div>
      </div>
    </div>
  );
};

export default Step3Preview;