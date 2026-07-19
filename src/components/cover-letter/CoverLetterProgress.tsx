import React from 'react';
import { BadgeInfo, ScanSearch } from 'lucide-react';

interface CoverLetterProgressProps {
  step: number;
  jobTitle: string;
  company: string;
  selectedStyle: string;
}

const CoverLetterProgress: React.FC<CoverLetterProgressProps> = ({ step, jobTitle, company, selectedStyle }) => {
  
  const steps = [
    { num: 1, name: 'Details', icon: <BadgeInfo size={18} />, iconBg: 'from-blue-500 to-cyan-500' },
    { num: 2, name: 'Style', icon: '💎', iconBg: 'from-purple-500 to-pink-500' },
    { num: 3, name: 'Preview', icon: <ScanSearch size={18} />, iconBg: 'from-emerald-500 to-teal-500' },
  ];

  let completion = 0;
  if (jobTitle && company) completion = 33;
  if (selectedStyle !== 'professional') completion = 66;
  if (step === 3) completion = 100;

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Completion</span>
          <span className="text-purple-400">{completion}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
        </div>
      </div>

      {/* STEPPER - With Glowing Connector Lines */}
      <div className="relative w-full">
        {/* Background line - full width */}
        <div className="absolute left-0 right-0 top-6 h-0.5 bg-gray-700 -z-0" />
        
        {/* Glowing connector lines between steps */}
        <div className="absolute left-0 right-0 top-6 h-0.5 -z-0 flex">
          {/* Line between Step 1 and Step 2 */}
          <div className="w-1/2 h-full relative">
            <div className={`absolute inset-0 transition-all duration-700 ${
              step > 1 
                ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 shadow-lg shadow-purple-500/50 animate-pulse' 
                : 'bg-gray-700'
            }`} />
            {step > 1 && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-purple-400/20 blur-md animate-pulse" />
                <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/70 animate-ping" />
              </>
            )}
          </div>
          {/* Line between Step 2 and Step 3 */}
          <div className="w-1/2 h-full relative">
            <div className={`absolute inset-0 transition-all duration-700 ${
              step > 2 
                ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 shadow-lg shadow-purple-500/50 animate-pulse' 
                : 'bg-gray-700'
            }`} />
            {step > 2 && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-purple-400/20 blur-md animate-pulse" />
                <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/70 animate-ping" />
              </>
            )}
          </div>
        </div>
        
        {/* Icons on top of line */}
        <div className="relative z-10 flex justify-between w-full">
          {steps.map((s, idx) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            
            return (
              <div key={s.num} className="flex flex-col items-center group cursor-pointer">
                {/* Step Circle - ONLY ACTIVE STEP FLOATS */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : ''}
                  ${isActive ? `bg-gradient-to-r ${s.iconBg} text-white shadow-lg shadow-purple-500/50 scale-110 ring-2 ring-purple-400/40 ring-offset-2 ring-offset-black animate-float-active` : ''}
                  ${!isCompleted && !isActive ? 'bg-gray-800 text-gray-500 hover:bg-gray-700 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/30 hover:ring-1 hover:ring-purple-500/30' : ''}
                  group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300
                `}>
                  {isCompleted ? (
                    // SVG Checkmark for completed steps
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    typeof s.icon === 'string' ? (
                      <span className="text-xl">{s.icon}</span>
                    ) : (
                      s.icon
                    )
                  )}
                </div>
                
                {/* Step Label */}
                <span className={`
                  text-[11px] mt-2 font-medium transition-all duration-300
                  ${isActive ? 'text-purple-400' : isCompleted ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'}
                  group-hover:scale-105
                `}>
                  {s.name}
                </span>
                
                {/* Dot indicator - Active step gets pulse */}
                <div className={`
                  w-1.5 h-1.5 rounded-full mt-1 transition-all duration-300
                  ${isActive ? 'bg-purple-400 animate-pulse' : isCompleted ? 'bg-green-400' : 'bg-gray-600 group-hover:bg-purple-400'}
                `} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== ONLY ACTIVE STEP ANIMATION ===== */}
      <style>{`
        /* Floating animation - ONLY for ACTIVE step */
        @keyframes float-active {
          0%, 100% {
            transform: translateY(0px) scale(1.1);
          }
          50% {
            transform: translateY(-8px) scale(1.15);
          }
        }
        .animate-float-active {
          animation: float-active 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CoverLetterProgress;