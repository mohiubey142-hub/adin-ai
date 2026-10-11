// src/components/cv-builder/components/SuccessCard.tsx
// Clean premium — no sparkle, no over-decoration
// Gradient border + solid check icon + minimal text

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessCardProps {
    realWeightedAverage: number;
    realCompletionPercentage: number;
    realQuality: {
        text: string;
        color: string;
        icon: string;
    };
}

const SuccessCard: React.FC<SuccessCardProps> = () => {
    return (
        <div className="relative rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-500 p-[1px] shadow-lg shadow-purple-600/15">
            <div className="rounded-2xl bg-white p-6 md:p-7">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-600/25">
                        <CheckCircle2 size={22} className="text-white" strokeWidth={2.6} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                            Your CV is ready
                        </h3>
                        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                            All required sections are complete. Download your CV and start applying.
                        </p>

                        {/* Minimal badges */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold">
                                <CheckCircle2 size={11} strokeWidth={2.8} />
                                Complete
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-[11px] font-semibold">
                                ATS Ready
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessCard;