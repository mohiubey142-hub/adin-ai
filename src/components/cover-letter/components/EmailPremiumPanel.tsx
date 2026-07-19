import React from 'react';
import { Mail, CheckCircle, Download } from 'lucide-react';

export const EmailPremiumPanel = () => {
  return (
    <div className="mt-6 rounded-2xl p-8 bg-gradient-to-br from-purple-900/30 via-gray-900/40 to-blue-900/30 border border-purple-500/20 shadow-xl overflow-hidden relative flex flex-col items-center justify-center h-[4.5in] transition-all duration-300 hover:border-purple-500/40">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-48 -mb-48" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-blue-600/5" />
      
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="w-40 h-40 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 transition-all duration-500 hover:scale-110 hover:shadow-3xl hover:shadow-purple-500/70 animate-float-email">
          <Mail size={80} className="text-white" />
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-2 border-black flex items-center justify-center shadow-lg animate-pulse">
            <CheckCircle size={16} className="text-white" />
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-300 font-medium tracking-wide">
            Download your professional cover letter now
          </p>
          <div className="flex items-center justify-center gap-3 mt-2.5">
            <span className="w-12 h-0.5 rounded-full bg-gradient-to-r from-purple-400/40 to-purple-400/80" />
            <Download size={18} className="text-purple-400/70 transition-all duration-300 hover:text-purple-400/90 hover:scale-110" />
            <span className="w-12 h-0.5 rounded-full bg-gradient-to-l from-purple-400/40 to-purple-400/80" />
          </div>
          <p className="text-[11px] text-purple-300/80 mt-2.5 tracking-wider uppercase font-medium">
            Ready in multiple formats
          </p>
        </div>
      </div>
    </div>
  );
};