import React from 'react';
import { CircularProgressProps } from '../types/previewTypes';

const CircularProgress: React.FC<CircularProgressProps> = ({
    score,
    size = 70,
    strokeWidth = 4,
    label = "",
    icon = ""
}) => {
    const validScore = typeof score === 'number' && !isNaN(score) 
        ? Math.min(Math.max(score, 0), 100) 
        : 0;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (validScore / 100) * circumference;
    
    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="url(#progressGradient)"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {icon && <span className="text-xs">{icon}</span>}
                    <span className="text-sm font-bold text-white">
                        {Math.round(validScore)}
                        <span className="text-[8px] text-gray-400">%</span>
                    </span>
                </div>
            </div>
            {label && <span className="text-[10px] text-gray-400 mt-1">{label}</span>}
        </div>
    );
};

export default CircularProgress;