import React from 'react';
import { Copy, FileText, Printer, Sparkles, RefreshCw } from 'lucide-react';

interface CoverLetterActionCenterProps {
  onGenerate: () => void;
  onCopy: () => void;
  onDownloadTXT: () => void;
  onDownloadPDF: () => void;
  generating: boolean;
  hasGeneratedLetter: boolean;
}

const CoverLetterActionCenter: React.FC<CoverLetterActionCenterProps> = ({ onGenerate, onCopy, onDownloadTXT, onDownloadPDF, generating, hasGeneratedLetter }) => {
  return (
    <div className="space-y-4">
      {/* Premium Generate Button */}
      <button
        onClick={onGenerate}
        disabled={generating}
        className="relative w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white font-semibold text-base transition-all duration-300 hover:scale-105 shadow-xl shadow-purple-500/40 disabled:opacity-50 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        <div className="relative flex items-center justify-center gap-2">
          {generating ? (
            <><RefreshCw size={18} className="animate-spin" /> Generating...</>
          ) : (
            <><Sparkles size={18} /> Generate Cover Letter</>
          )}
        </div>
      </button>
      
      {/* Premium Action Cards - Only show after generation */}
      {hasGeneratedLetter && (
        <div className="grid grid-cols-3 gap-3">
          <button onClick={onCopy} className="group p-3 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300">
            <Copy size={20} className="mx-auto text-gray-400 group-hover:text-purple-400 transition-colors" />
            <span className="block text-[10px] text-gray-500 mt-1 group-hover:text-purple-400">Copy</span>
          </button>
          
          <button onClick={onDownloadTXT} className="group p-3 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300">
            <FileText size={20} className="mx-auto text-gray-400 group-hover:text-purple-400 transition-colors" />
            <span className="block text-[10px] text-gray-500 mt-1 group-hover:text-purple-400">TXT</span>
          </button>
          
          <button onClick={onDownloadPDF} className="group p-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300">
            <Printer size={20} className="mx-auto text-purple-400" />
            <span className="block text-[10px] text-purple-400 mt-1">PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CoverLetterActionCenter;