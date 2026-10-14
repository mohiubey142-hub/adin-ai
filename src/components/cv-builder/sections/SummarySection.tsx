// src/components/cv-builder/sections/SummarySection.tsx
// Premium — transparent wrapper, no double bg
// ZERO feature break: colon cleaner, AI summary, template fallback, analysis — all intact
// ✅ UPDATED: "Recommended 40-70 words" in tips

import React, { useState, useEffect } from 'react';
import { AlertCircle, Lightbulb } from 'lucide-react';
import { generateDescriptionFromData } from '../utils/aiGenerators';
import toast from 'react-hot-toast';

interface SummarySectionProps {
    professionalSummary: string;
    setProfessionalSummary: (summary: string) => void;
    generateSummary: () => void;
    generateAISummary?: () => Promise<void>;
    // ✅ FIX: section-specific key (boolean nahi)
    generating: string | null;
    aiGenerating?: string | null;
    personalInfo?: any;
    experiences?: any[];
    skills?: string;
}

const AdinAIIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="rgba(59,130,246,0.12)" />
        <circle cx="12" cy="12" r="4" fill="white" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
        <path d="M12 2L14 6L12 10L10 6L12 2Z" fill="#A855F7" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 14L14 18L12 22L10 18L12 14Z" fill="#A855F7" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M5 9L7 7L10 8L10 11L7 13L5 11L5 9Z" fill="#3B82F6" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M19 9L17 7L14 8L14 11L17 13L19 11L19 9Z" fill="#3B82F6" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
);

const AdinAILoadingIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="rgba(59,130,246,0.12)" />
        <circle cx="12" cy="12" r="4" fill="white" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
        <path d="M12 2L14 6L12 10L10 6L12 2Z" fill="#A855F7" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 14L14 18L12 22L10 18L12 14Z" fill="#A855F7" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M5 9L7 7L10 8L10 11L7 13L5 11L5 9Z" fill="#3B82F6" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M19 9L17 7L14 8L14 11L17 13L19 11L19 9Z" fill="#3B82F6" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
);

const removeAllColons = (text: string): string => {
    if (!text) return text;
    let cleaned = text;
    cleaned = cleaned.replace(/\b(\w+(?:-\w+)?)\s*:\s*(\w+)\b/g, '$1 $2');
    cleaned = cleaned.replace(/\b(\w+):(\w+)\b/g, '$1 $2');
    cleaned = cleaned.replace(/\bmy\s*:\s*professional\b/gi, 'my professional');
    cleaned = cleaned.replace(/\bmy\s*:\s*career\b/gi, 'my career');
    cleaned = cleaned.replace(/\bmy\s*:\s*journey\b/gi, 'my journey');
    cleaned = cleaned.replace(/:\s+/g, ' ');
    cleaned = cleaned.replace(/:/g, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/\s+([.,!?;])/g, '$1');
    return cleaned.trim();
};

const baseInput =
    'w-full rounded-xl bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-4 py-3 text-sm';
const normalInput =
    'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-slate-300';

const SummarySection: React.FC<SummarySectionProps> = ({
    professionalSummary, setProfessionalSummary,
    generateSummary: oldGenerateSummary, generateAISummary,
    generating, aiGenerating, personalInfo, experiences, skills,
}) => {
    const [analysis, setAnalysis] = useState({
        words: 0, chars: 0, score: 0, quality: '', warnings: [] as string[],
    });
    const [isGenerating, setIsGenerating] = useState(false);
    // ✅ ONE-AT-A-TIME: kisi bhi section mein generation chal rahi ho to naya start nahi hoga
    const isBusy = !!generating || !!aiGenerating || isGenerating;

    const setSummarySafe = (summary: string) => {
        const cleaned = removeAllColons(summary);
        setProfessionalSummary(cleaned);
    };

    const handleGenerateSummary = async () => {
        // ✅ ONE-AT-A-TIME guard
        if (isBusy) {
            toast.error('Please wait — another generation is already in progress.', { id: 'gen-busy' });
            return;
        }
        if (!personalInfo?.title) {
            toast.error('Please fill your job title in Personal Information first');
            return;
        }
        if (generateAISummary) {
            try {
                await generateAISummary();
                toast.success('AI summary generated!');
            } catch (error) {
                toast.error('AI failed, using template summary');
                generateTemplateSummary();
            }
            return;
        }
        generateTemplateSummary();
    };

    const generateTemplateSummary = async () => {
        setIsGenerating(true);
        try {
            const generationPromise = new Promise<string>(resolve => {
                const summary = generateDescriptionFromData({
                    type: 'summary',
                    jobTitle: personalInfo.title,
                    companyName: '',
                    userData: { experiences: experiences || [], skills: skills || '' },
                });
                resolve(summary);
            });
            const [summary] = await Promise.all([
                generationPromise,
                new Promise(resolve => setTimeout(resolve, 2500)),
            ]);
            setSummarySafe(summary);
            toast.success('Template summary generated!');
        } catch (error) {
            toast.error('Failed to generate summary');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const cleaned = removeAllColons(value);
        setProfessionalSummary(cleaned);
    };

    useEffect(() => {
        const text = professionalSummary;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        let score = 0;
        const warnings: string[] = [];
        if (chars >= 150) score = 100;
        else if (chars >= 100) score = 85;
        else if (chars >= 70) score = 70;
        else if (chars >= 50) score = 55;
        else if (chars > 0) {
            score = 35;
            warnings.push('Summary is too short (50+ characters recommended)');
        } else score = 0;

        let quality = '';
        if (score >= 85) quality = 'Excellent';
        else if (score >= 70) quality = 'Good';
        else if (score >= 50) quality = 'Average';
        else if (score > 0) quality = 'Poor';
        else quality = 'Not started';

        setAnalysis({ words, chars, score, quality, warnings });
    }, [professionalSummary]);

    const getQualityColor = () => {
        if (analysis.quality === 'Excellent') return 'text-emerald-600';
        if (analysis.quality === 'Good') return 'text-purple-600';
        if (analysis.quality === 'Average') return 'text-blue-600';
        return 'text-slate-500';
    };

    // ✅ FIX: sirf Summary ki apni loading — pehle `!!aiGenerating` tha jo kisi bhi section ke
    //    Gen button par Summary button ko bhi spin karwa deta tha.
    const isLoading = generating === 'summary' || isGenerating || aiGenerating === 'summary';

    return (
        <div className="space-y-5">
            {/* AI Button (top) */}
            <div className="flex justify-end">
                <button
                    onClick={handleGenerateSummary}
                    disabled={isLoading || isBusy}
                    className="h-10 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold text-sm tracking-tight flex items-center gap-2 transition-all duration-200 shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 focus:outline-none focus:ring-4 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <AdinAILoadingIcon className="w-4 h-4" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <AdinAIIcon className="w-4 h-4" />
                            AI Generate Summary
                        </>
                    )}
                </button>
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Summary
                </label>
                <textarea
                    value={professionalSummary}
                    onChange={handleTextChange}
                    rows={6}
                    placeholder="Write a brief professional summary highlighting your experience, skills, and career goals..."
                    className={`${baseInput} ${normalInput} resize-none`}
                />
            </div>

            {professionalSummary && (
                <div className="rounded-xl bg-white border border-slate-200 p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-slate-700">Summary Analysis</h3>
                        <span className="text-xs font-semibold text-purple-600">Score: {analysis.score}%</span>
                    </div>
                    <div className="flex gap-4 mb-3 text-xs flex-wrap">
                        <span className="text-slate-500">
                            Words: <span className="text-slate-900 font-medium">{analysis.words}</span>
                        </span>
                        <span className="text-slate-500">
                            Characters: <span className="text-slate-900 font-medium">{analysis.chars}</span>
                        </span>
                        <span className="text-slate-500">
                            Quality: <span className={`font-semibold ${getQualityColor()}`}>{analysis.quality}</span>
                        </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300"
                            style={{ width: `${analysis.score}%` }}
                        />
                    </div>
                    {analysis.warnings.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {analysis.warnings.map((warning, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full"
                                >
                                    <AlertCircle size={11} />
                                    {warning}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="rounded-xl bg-purple-50 border border-purple-100 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-2">
                    <Lightbulb size={13} />
                    Tips for a great summary
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-5 list-disc">
                    <li>Highlight your years of experience and key expertise</li>
                    <li>Mention your top achievements or successful projects</li>
                    <li>Include relevant certifications or specializations</li>
                    <li>Keep it concise (40-70 words recommended)</li>
                </ul>
            </div>
        </div>
    );
};

export default SummarySection;