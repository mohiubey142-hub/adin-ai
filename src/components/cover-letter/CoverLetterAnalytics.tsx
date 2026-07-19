import React from 'react';
import { AlertCircle, CheckCircle, Target, Zap } from 'lucide-react';

interface CoverLetterAnalyticsProps {
  jobTitle: string;
  company: string;
  selectedStyle: string;
  jobDescription: string;
  additionalInfo: string;
}

const CoverLetterAnalytics: React.FC<CoverLetterAnalyticsProps> = ({ jobTitle, company, selectedStyle, jobDescription, additionalInfo }) => {
  // ===== FIXED: Selected style should NOT be considered incomplete if it's set =====
  // Pehle: selectedStyle !== 'professional' — yeh galat tha kyunki 'professional' ek valid style hai
  // Ab: selectedStyle !== '' — sirf tab incomplete jab empty ho
  
  const fields = [
    { name: 'Job Title', completed: !!jobTitle },
    { name: 'Company Name', completed: !!company },
    { name: 'Letter Style', completed: !!selectedStyle }, // FIXED: agar style select hai toh complete
    { name: 'Job Description', completed: !!jobDescription },
    { name: 'Achievements', completed: !!additionalInfo },
  ];
  
  const completedCount = fields.filter(f => f.completed).length;
  const completionPercentage = Math.round((completedCount / fields.length) * 100);
  
  // ===== FIXED: Readiness Score Logic Improved =====
  const readinessScore = completionPercentage >= 80 ? 95 : completionPercentage >= 60 ? 75 : completionPercentage >= 40 ? 55 : 30;
  
  return (
    <div className="rounded-2xl p-5 bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 shadow-xl">
      <h3 className="text-sm font-semibold text-purple-400 mb-4 flex items-center gap-2">
        <Target size={14} /> Completion Analytics
      </h3>
      
      <div className="flex items-center justify-between mb-6">
        {/* Circular Progress Ring */}
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="6" />
            <circle cx="48" cy="48" r="42" fill="none" stroke="url(#analyticsGradient)" strokeWidth="6" strokeDasharray="263.9" strokeDashoffset={263.9 - (completionPercentage / 100) * 263.9} strokeLinecap="round" className="transition-all duration-700" />
            <defs><linearGradient id="analyticsGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white">{completionPercentage}%</span>
            <span className="text-[9px] text-gray-400">Complete</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{fields.length - completedCount}</div>
          <div className="text-[10px] text-gray-400">Missing Fields</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{readinessScore}%</div>
          <div className="text-[10px] text-gray-400">Readiness Score</div>
        </div>
      </div>
      
      <div className="space-y-2">
        {fields.map((field, idx) => (
          <div key={idx} className="flex items-center justify-between py-1.5 border-b border-gray-800/50 last:border-0">
            <span className="text-xs text-gray-400">{field.name}</span>
            {field.completed ? (
              <CheckCircle size={14} className="text-green-400" />
            ) : (
              <AlertCircle size={14} className="text-yellow-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoverLetterAnalytics;