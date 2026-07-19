import React from 'react';
import { Copy, Download, File, Trash2 } from 'lucide-react';

interface DownloadButtonsProps {
    onCopy: () => void;
    onDownloadPDF: () => void;
    onDownloadTXT: () => void;
    onClear: () => void;
}

const DownloadButtons: React.FC<DownloadButtonsProps> = ({
    onCopy,
    onDownloadPDF,
    onDownloadTXT,
    onClear
}) => {
    return (
        // ✅ Mobile optimized: reduced gap, better touch targets
        <div className="flex gap-1.5 sm:gap-2 lg:gap-4 justify-center flex-wrap">
            <button 
                onClick={onCopy} 
                className="px-3 sm:px-4 lg:px-7 py-1.5 sm:py-2 lg:py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-green-600/20 hover:shadow-green-600/40 text-[10px] sm:text-sm lg:text-base flex items-center gap-1.5 sm:gap-2 touch-manipulation min-h-[36px] sm:min-h-[40px]"
            >
                <Copy size={14} className="flex-shrink-0 sm:size-4 lg:size-5" /> 
                <span>Copy</span>
            </button>
            
            <button 
                onClick={onDownloadPDF} 
                className="px-3 sm:px-4 lg:px-7 py-1.5 sm:py-2 lg:py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 text-[10px] sm:text-sm lg:text-base flex items-center gap-1.5 sm:gap-2 touch-manipulation min-h-[36px] sm:min-h-[40px]"
            >
                <Download size={14} className="flex-shrink-0 sm:size-4 lg:size-5" /> 
                <span>PDF</span>
            </button>
            
            <button 
                onClick={onDownloadTXT} 
                className="px-3 sm:px-4 lg:px-7 py-1.5 sm:py-2 lg:py-2.5 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-gray-600/20 hover:shadow-gray-600/40 text-[10px] sm:text-sm lg:text-base flex items-center gap-1.5 sm:gap-2 touch-manipulation min-h-[36px] sm:min-h-[40px]"
            >
                <File size={14} className="flex-shrink-0 sm:size-4 lg:size-5" /> 
                <span>TXT</span>
            </button>
            
            <button 
                onClick={onClear} 
                className="px-3 sm:px-4 lg:px-7 py-1.5 sm:py-2 lg:py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-red-600/20 hover:shadow-red-600/40 text-[10px] sm:text-sm lg:text-base flex items-center gap-1.5 sm:gap-2 touch-manipulation min-h-[36px] sm:min-h-[40px]"
            >
                <Trash2 size={14} className="flex-shrink-0 sm:size-4 lg:size-5" /> 
                <span>Clear</span>
            </button>
        </div>
    );
};

export default DownloadButtons;