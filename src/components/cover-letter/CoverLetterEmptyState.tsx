import React from 'react';
import { Sparkles, FileText, ArrowRight } from 'lucide-react';

interface CoverLetterEmptyStateProps {
  onGenerate?: () => void;
  hasData: boolean;
}

const CoverLetterEmptyState: React.FC<CoverLetterEmptyStateProps> = ({ onGenerate, hasData }) => {
  if (hasData) return null;
  
  return (
    <div className="rounded-2xl p-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/20 text-center">
      <div className="relative w-24 h-24 mx-auto mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl blur-xl opacity-30 animate-pulse" />
        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-2xl">
          <FileText size={40} className="text-white" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Ready to Create?</h3>
      <p className="text-sm text-gray-400 mb-4 max-w-sm mx-auto">
        Fill in your job details and let AI craft a professional cover letter that stands out.
      </p>
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Sparkles size={12} className="text-purple-400" />
          <span>AI-powered • Professional • Fast</span>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterEmptyState;