import React from 'react';

interface SuccessCardProps {
    realWeightedAverage: number;
    realCompletionPercentage: number;
    realQuality: {
        text: string;
        color: string;
        icon: string;
    };
}

const SuccessCard: React.FC<SuccessCardProps> = ({
    realWeightedAverage,
    realCompletionPercentage,
    realQuality
}) => {
    return (
        // ✅ Mobile optimized: reduced padding
        <div className="p-4 sm:p-5 lg:p-7 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-purple-500/30 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 animate-bounce">
                <span className="text-2xl sm:text-3xl lg:text-4xl">🎉</span>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-400 tracking-tight text-center">Professional CV Completed</h3>
            <div className="mt-3 sm:mt-4 flex justify-center gap-4 sm:gap-6 lg:gap-10 flex-wrap">
                <div className="text-center">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                        {Math.round(realWeightedAverage)}
                        <span className="text-[8px] sm:text-xs text-gray-400">/100</span>
                    </p>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-400 font-medium">ATS Score</p>
                </div>
                <div className="text-center">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                        {Math.round(realCompletionPercentage)}
                        <span className="text-[8px] sm:text-xs text-gray-400">%</span>
                    </p>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-400 font-medium">Complete</p>
                </div>
                <div className="text-center">
                    <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${realQuality.color}`}>{realQuality.icon}</p>
                    <p className={`text-[8px] sm:text-[10px] lg:text-xs ${realQuality.color} font-medium`}>{realQuality.text}</p>
                </div>
            </div>
            <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-400 mt-3 sm:mt-4 font-light text-center">Your CV is ready for professional use</p>
        </div>
    );
};

export default SuccessCard;