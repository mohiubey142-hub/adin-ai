import React from 'react';
import { Briefcase, Zap, Palette, Wrench, Crown, Target, Shield, Heart } from 'lucide-react';

interface Step2StyleProps {
  selectedStyle: string;
  setSelectedStyle: (value: string) => void;
  selectedTemplate: string;
  setSelectedTemplate: (value: 'modern' | 'classic' | 'minimal') => void;
}

const letterStyles = [
  { 
    id: 'professional', 
    name: 'Professional', 
    icon: <Briefcase size={32} />,
    gradient: 'from-purple-500 to-indigo-600', 
    bgGradient: 'from-purple-600/20 to-indigo-600/20',
    borderColor: 'border-purple-500/40',
    glowColor: 'shadow-purple-500/30',
    desc: 'Formal & Corporate',
    color: 'text-purple-400'
  },
  { 
    id: 'enthusiastic', 
    name: 'Enthusiastic', 
    icon: <Zap size={32} />,
    gradient: 'from-amber-500 to-orange-600', 
    bgGradient: 'from-amber-600/20 to-orange-600/20',
    borderColor: 'border-amber-500/40',
    glowColor: 'shadow-amber-500/30',
    desc: 'Energetic & Passionate',
    color: 'text-amber-400'
  },
  { 
    id: 'creative', 
    name: 'Creative', 
    icon: <Palette size={32} />,
    gradient: 'from-emerald-500 to-teal-600', 
    bgGradient: 'from-emerald-600/20 to-teal-600/20',
    borderColor: 'border-emerald-500/40',
    glowColor: 'shadow-emerald-500/30',
    desc: 'Unique & Artistic',
    color: 'text-emerald-400'
  },
  { 
    id: 'technical', 
    name: 'Technical', 
    icon: <Wrench size={32} />,
    gradient: 'from-cyan-500 to-blue-600', 
    bgGradient: 'from-cyan-600/20 to-blue-600/20',
    borderColor: 'border-cyan-500/40',
    glowColor: 'shadow-cyan-500/30',
    desc: 'Data-driven & Precise',
    color: 'text-cyan-400'
  },
  { 
    id: 'executive', 
    name: 'Executive', 
    icon: <Crown size={32} />,
    gradient: 'from-violet-500 to-purple-600', 
    bgGradient: 'from-violet-600/20 to-purple-600/20',
    borderColor: 'border-violet-500/40',
    glowColor: 'shadow-violet-500/30',
    desc: 'Leadership & Management',
    color: 'text-violet-400'
  },
  { 
    id: 'persuasive', 
    name: 'Persuasive', 
    icon: <Target size={32} />,
    gradient: 'from-rose-500 to-pink-600', 
    bgGradient: 'from-rose-600/20 to-pink-600/20',
    borderColor: 'border-rose-500/40',
    glowColor: 'shadow-rose-500/30',
    desc: 'Sales & Marketing',
    color: 'text-rose-400'
  },
  { 
    id: 'confident', 
    name: 'Confident', 
    icon: <Shield size={32} />,
    gradient: 'from-blue-500 to-indigo-600', 
    bgGradient: 'from-blue-600/20 to-indigo-600/20',
    borderColor: 'border-blue-500/40',
    glowColor: 'shadow-blue-500/30',
    desc: 'Bold & Leadership',
    color: 'text-blue-400'
  },
  { 
    id: 'empathetic', 
    name: 'Empathetic', 
    icon: <Heart size={32} />,
    gradient: 'from-pink-500 to-rose-600', 
    bgGradient: 'from-pink-600/20 to-rose-600/20',
    borderColor: 'border-pink-500/40',
    glowColor: 'shadow-pink-500/30',
    desc: 'Caring & Supportive',
    color: 'text-pink-400'
  },
];

const Step2Style: React.FC<Step2StyleProps> = ({ selectedStyle, setSelectedStyle }) => {
  return (
    <div className="space-y-10 min-h-[750px]">
      <div>
        <label className="block text-base font-medium text-gray-300 mb-8">
          Choose Your Letter Style
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-10 justify-items-center">
          {letterStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className="group flex flex-col items-center gap-4 transition-all duration-300"
            >
              <div className={`
                relative w-28 h-28 rounded-full flex items-center justify-center 
                transition-all duration-500 cursor-pointer
                ${selectedStyle === style.id 
                  ? `bg-gradient-to-br ${style.gradient} ${style.glowColor} shadow-2xl scale-110 ring-4 ring-purple-400/30` 
                  : `bg-gradient-to-br ${style.bgGradient} border-2 ${style.borderColor} hover:scale-105 hover:shadow-xl`
                }
              `}>
                {selectedStyle === style.id && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-30 animate-ping" />
                )}
                
                <div className={`transition-all duration-300 ${selectedStyle === style.id ? 'text-white scale-110' : style.color + ' group-hover:scale-110'}`}>
                  {style.icon}
                </div>
                
                {selectedStyle === style.id && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <div className={`text-base font-semibold ${selectedStyle === style.id ? 'text-purple-400' : 'text-gray-300'}`}>
                  {style.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">{style.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step2Style;