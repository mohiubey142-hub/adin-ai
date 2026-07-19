import React from 'react';

interface CircularProgressRingProps {
  score: number;
  label: string;
}

export const CircularProgressRing = ({ score, label }: CircularProgressRingProps) => {
  const size = 70;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getScoreColor = () => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-purple-400";
    if (score >= 40) return "text-blue-400";
    return "text-gray-400";
  };
  
  return (
    <div className="flex flex-col items-center transition-all duration-300 hover:scale-105">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="url(#ringGradient)" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          <defs><linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${getScoreColor()}`}>{Math.round(score)}<span className="text-[8px]">%</span></span>
        </div>
      </div>
      <span className="text-[10px] text-gray-400 mt-1.5 tracking-wide">{label}</span>
    </div>
  );
};