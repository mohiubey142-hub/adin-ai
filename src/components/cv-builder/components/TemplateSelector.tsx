import React from 'react';

interface TemplateSelectorProps {
    template: 'modern' | 'minimal';
    onTemplateChange: (template: 'modern' | 'minimal') => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
    template,
    onTemplateChange
}) => {
    return (
        // ✅ Mobile optimized: reduced sticky top value, smaller padding
        <div className="sticky top-[52px] sm:top-[56px] lg:top-[64px] z-40 flex justify-center gap-2 sm:gap-2.5 lg:gap-5 py-1.5 sm:py-2.5 lg:py-3.5 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm px-2 sm:px-4 relative overflow-visible">
            <button
                onClick={() => onTemplateChange('modern')}
                className={`px-3 sm:px-4 lg:px-6 py-1 sm:py-1.5 lg:py-2 rounded-xl text-[10px] sm:text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap tracking-wide touch-manipulation min-h-[32px] sm:min-h-[36px] ${
                    template === 'modern'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/30 scale-105' 
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:scale-105 hover:text-gray-200'
                }`}
            >
                Modern
            </button>

            <button
                onClick={() => onTemplateChange('minimal')}
                className={`px-3 sm:px-4 lg:px-6 py-1 sm:py-1.5 lg:py-2 rounded-xl text-[10px] sm:text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap tracking-wide touch-manipulation min-h-[32px] sm:min-h-[36px] ${
                    template === 'minimal'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/30 scale-105' 
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:scale-105 hover:text-gray-200'
                }`}
            >
                Minimal
            </button>
        </div>
    );
};

export default TemplateSelector;