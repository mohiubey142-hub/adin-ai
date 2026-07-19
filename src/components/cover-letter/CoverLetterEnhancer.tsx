import React, { useState } from 'react';
import { Mail, Loader2, RotateCcw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { enhanceCoverLetter, isGroqConfigured } from './services/groqService';

interface CoverLetterEnhancerProps {
  originalLetter: string;
  onEnhance: (enhancedLetter: string) => void;
  userName: string;
  jobTitle: string;
  company: string;
  isEnhanced?: boolean;
  onRestoreOriginal?: () => void;
}

// Enhancement options - REMOVED: expand, executive | REMOVED ALL ICONS
const enhancementOptions = [
  { id: 'professional', label: 'Professional Tone', desc: 'Formal & polished' },
  { id: 'persuasive', label: 'More Persuasive', desc: 'Compelling & convincing' },
  { id: 'ats', label: 'ATS Optimized', desc: 'Keyword-rich' },
  { id: 'formal', label: 'More Formal', desc: 'Highly professional' },
  { id: 'human', label: 'More Human', desc: 'Warm & personal' },
  { id: 'shorten', label: 'Shorten Content', desc: 'Concise & focused' },
  { id: 'closing', label: 'Stronger Closing', desc: 'Powerful ending' },
  { id: 'grammar', label: 'Fix Grammar', desc: 'Perfect clarity' },
];

const CoverLetterEnhancer: React.FC<CoverLetterEnhancerProps> = ({ 
  originalLetter, 
  onEnhance,
  userName,
  jobTitle,
  company,
  isEnhanced = false,
  onRestoreOriginal
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Check if Groq is configured
  const isGroqAvailable = isGroqConfigured();

  const handleEnhance = async (optionId: string) => {
    if (!originalLetter) {
      toast.error('Generate a letter first');
      return;
    }

    // Check if Groq API key is configured
    if (!isGroqAvailable) {
      toast.error('⚠️ Groq API key not configured! Please add VITE_GROQ_API_KEY to .env.local');
      return;
    }

    setSelectedOption(optionId);
    setIsEnhancing(true);
    toast.loading('AI is enhancing your cover letter...', { id: 'enhance' });

    try {
      // Real AI call - Groq API
      const enhanced = await enhanceCoverLetter(
        originalLetter,
        optionId,
        userName,
        jobTitle,
        company
      );

      onEnhance(enhanced);
      toast.success('Cover letter enhanced with AI! ✨', { id: 'enhance' });
      
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to enhance letter', { id: 'enhance' });
      
      // Fallback: Agar API fail ho to fake enhancement use karein
      try {
        const fakeEnhanced = getFallbackEnhancement(originalLetter, optionId);
        onEnhance(fakeEnhanced);
        toast.success('Enhanced with backup method (API failed)', { id: 'enhance' });
      } catch {
        toast.error('Could not enhance letter', { id: 'enhance' });
      }
      
    } finally {
      setIsEnhancing(false);
    }
  };

  // ===== FALLBACK ENHANCEMENT (Agar API fail ho to) =====
  const getFallbackEnhancement = (letter: string, optionId: string): string => {
    let enhanced = letter;
    
    switch(optionId) {
      case 'professional':
        enhanced = enhanced.replace(/I'm/g, 'I am').replace(/I've/g, 'I have');
        break;
      case 'persuasive':
        enhanced = enhanced.replace(/I am writing to/g, 'I am reaching out to');
        break;
      case 'ats':
        enhanced = enhanced.replace(/I have experience in/g, 'I have demonstrated expertise in');
        break;
      case 'formal':
        enhanced = enhanced.replace(/I'm/g, 'I am').replace(/can't/g, 'cannot');
        break;
      case 'human':
        enhanced = enhanced.replace(/Sincerely/g, 'With warm regards');
        break;
      case 'shorten':
        const lines = letter.split('\n').filter(line => line.trim().length > 0);
        enhanced = lines.slice(0, Math.floor(lines.length * 0.7)).join('\n');
        break;
      case 'closing':
        enhanced = enhanced.replace(/Thank you for considering/g, 'I am eager to discuss how I can contribute');
        break;
      case 'grammar':
        enhanced = enhanced.replace(/  /g, ' ').replace(/ ,/g, ',');
        break;
    }
    return enhanced;
  };

  const handleRestore = () => {
    if (onRestoreOriginal) {
      onRestoreOriginal();
    }
  };

  return (
    <div className="mt-4 p-5 bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 rounded-2xl shadow-xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-purple-500/10">
      
      {/* ===== API Status Warning ===== */}
      <div className={`mb-4 p-3 rounded-xl text-center ${isGroqAvailable ? 'bg-green-500/10 border border-green-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
        <p className={`text-xs font-medium tracking-wide ${isGroqAvailable ? 'text-green-400' : 'text-yellow-400'}`}>
          {isGroqAvailable ? (
            '✅ Adin AI is ready! Smart AI enhancement enabled.'
          ) : (
            '⚠️ Groq API key not found! Add VITE_GROQ_API_KEY to .env.local'
          )}
        </p>
      </div>

      {/* ===== HEADER - Updated with Mail icon ===== */}
      <div className="flex items-center gap-2 mb-4 sticky top-0 bg-gray-900/80 backdrop-blur-sm py-2 -mt-2 z-10 rounded-t-xl">
        <Mail size={20} className="text-purple-400" />
        <h3 className="text-sm font-semibold text-purple-400 tracking-wide">Enhance With AI</h3>
      </div>

      {/* ===== ENHANCEMENT OPTIONS GRID ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {enhancementOptions.map((option) => {
          const isSelected = selectedOption === option.id && isEnhancing;
          const isDisabled = isEnhancing || !isGroqAvailable;
          
          return (
            <button
              key={option.id}
              onClick={() => handleEnhance(option.id)}
              disabled={isDisabled}
              className={`
                relative px-3 py-3 rounded-xl text-left
                transition-all duration-300 ease-out
                ${isSelected 
                  ? 'bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-purple-600/20 border border-purple-500/40 shadow-lg shadow-purple-500/20' 
                  : 'bg-gray-800/50 hover:bg-gray-700/50 border border-transparent hover:border-purple-500/30'
                }
                hover:scale-105 hover:-translate-y-0.5
                hover:shadow-lg hover:shadow-purple-500/20
                disabled:opacity-50 disabled:cursor-not-allowed
                disabled:hover:scale-100 disabled:hover:-translate-y-0
                min-h-[72px]
                group
              `}
            >
              {/* Premium background overlay */}
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="flex items-start gap-2.5 w-full h-full relative z-10">
                {/* Premium Mail Icon with animation */}
                <span className={`
                  flex-shrink-0 mt-0.5 transition-all duration-300
                  ${isSelected ? 'opacity-100 scale-100' : 'opacity-60 group-hover:opacity-100'}
                `}>
                  {isSelected ? (
                    <Loader2 size={16} className="text-purple-400 generate-spinner" />
                  ) : (
                    <Mail 
                      size={16} 
                      className="text-purple-400/70 group-hover:text-purple-400 group-hover:scale-110 transition-all duration-300" 
                    />
                  )}
                </span>
                
                {/* Text */}
                <div className="flex flex-col items-start justify-center flex-1">
                  <p className="text-[11px] font-medium text-gray-300 leading-tight tracking-wide group-hover:text-white transition-colors duration-300">
                    {option.label}
                  </p>
                  <p className="text-[9px] text-gray-500 leading-tight mt-0.5 tracking-wide">
                    {option.desc}
                  </p>
                </div>
              </div>
              
              {/* Shimmer effect on hover */}
              <span className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              </span>
            </button>
          );
        })}
      </div>

      {/* ===== RESTORE ORIGINAL BUTTON - Updated with Adin AI colors ===== */}
      {isEnhanced && onRestoreOriginal && (
        <div className="mt-4 pt-3 border-t border-purple-500/20 flex justify-center">
          <button
            onClick={handleRestore}
            className="
              relative px-6 py-2.5 rounded-xl
              bg-gray-800/85 hover:bg-gray-700/90
              text-gray-300 hover:text-white
              text-sm font-medium
              transition-all duration-300 ease-out
              hover:scale-105 hover:-translate-y-0.5
              shadow-lg shadow-gray-900/30 hover:shadow-purple-500/20
              border border-white/5 hover:border-purple-500/30
              flex items-center gap-2.5
              group
            "
          >
            {/* Background hover overlay */}
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Icon */}
            <span className="relative z-10">
              <RotateCcw 
                size={18} 
                className="text-gray-400 group-hover:text-purple-400 group-hover:scale-110 transition-all duration-300" 
              />
            </span>
            
            {/* Text */}
            <span className="relative z-10">
              Restore Original
            </span>
            
            {/* Shimmer effect */}
            <span className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </span>
          </button>
        </div>
      )}

      {isEnhancing && (
        <div className="mt-3 text-center">
          <p className="text-xs text-purple-400 animate-pulse">AI is enhancing your cover letter...</p>
        </div>
      )}
    </div>
  );
};

export default CoverLetterEnhancer;