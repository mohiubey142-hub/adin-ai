// src/components/cover-letter/steps/Step2Style.tsx
// Light theme (CVBuilder style) + Unified purple brand
// All 8 letter styles preserved — only colors unified to purple shades
// ZERO feature break: selection logic, all style IDs intact

import React from 'react';
import { Briefcase, Zap, Palette, Wrench, Crown, Target, Shield, Heart, Check } from 'lucide-react';

interface Step2StyleProps {
  selectedStyle: string;
  setSelectedStyle: (value: string) => void;
  selectedTemplate: string;
  setSelectedTemplate: (value: 'modern' | 'classic' | 'minimal') => void;
}

// ✅ UNIFIED PURPLE BRAND — subtle shade variations only
// Every style keeps its identity via icon, but colors stay within purple family
const letterStyles = [
  {
    id: 'professional',
    name: 'Professional',
    icon: <Briefcase size={28} />,
    gradient: 'from-purple-600 to-purple-500',
    desc: 'Formal & Corporate',
  },
  {
    id: 'enthusiastic',
    name: 'Enthusiastic',
    icon: <Zap size={28} />,
    gradient: 'from-purple-600 to-purple-500',
    desc: 'Energetic & Passionate',
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: <Palette size={28} />,
    gradient: 'from-purple-600 to-purple-500',
    desc: 'Unique & Artistic',
  },
  {
    id: 'technical',
    name: 'Technical',
    icon: <Wrench size={28} />,
    gradient: 'from-purple-600 to-purple-500',
    desc: 'Data-driven & Precise',
  },
  {
    id: 'executive',
    name: 'Executive',
    icon: <Crown size={28} />,
    gradient: 'from-purple-600 to-purple-500',
    desc: 'Leadership & Management',
  },
  {
    id: 'persuasive',
    name: 'Persuasive',
    icon: <Target size={28} />,
    gradient: 'from-purple-600 to-purple-500',
    desc: 'Sales & Marketing',
  },
  {
    id: 'confident',
    name: 'Confident',
    icon: <Shield size={28} />,
    gradient: 'from-purple-600 to-purple-500',
    desc: 'Bold & Leadership',
  },
  {
    id: 'empathetic',
    name: 'Empathetic',
    icon: <Heart size={28} />,
    gradient: 'from-purple-600 to-purple-500',
    desc: 'Caring & Supportive',
  },
];

const Step2Style: React.FC<Step2StyleProps> = ({ selectedStyle, setSelectedStyle }) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Choose Your Letter Style
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {letterStyles.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                aria-pressed={isSelected}
                className={`group relative flex flex-col items-center justify-center gap-2.5 p-4 md:p-5 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/15 ${
                  isSelected
                    ? 'bg-white border-purple-300 shadow-md shadow-purple-900/5'
                    : 'bg-white border-slate-200 hover:border-purple-200 hover:shadow-sm'
                }`}
              >
                {/* Icon badge */}
                <div
                  className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? `bg-gradient-to-br ${style.gradient} text-white shadow-md shadow-purple-600/20`
                      : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'
                  }`}
                >
                  {style.icon}
                </div>

                {/* Name + desc */}
                <div className="text-center min-w-0 w-full">
                  <div className={`text-xs md:text-sm font-semibold tracking-tight truncate ${
                    isSelected ? 'text-purple-700' : 'text-slate-900'
                  }`}>
                    {style.name}
                  </div>
                  <div className="text-[10px] md:text-[11px] text-slate-500 mt-0.5 truncate">
                    {style.desc}
                  </div>
                </div>

                {/* Selected check badge */}
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm">
                    <Check size={11} className="text-white" strokeWidth={3.5} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Step2Style;