import React, { useState, useEffect } from 'react';
import { generateDescriptionFromData } from '../utils/aiGenerators';
import toast from 'react-hot-toast';

interface SummarySectionProps {
    professionalSummary: string;
    setProfessionalSummary: (summary: string) => void;
    generateSummary: () => void;
    generating: boolean;
    personalInfo?: any;
    experiences?: any[];
    skills?: string;
}

// Adin AI Brand Icon Component
const AdinAIIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg 
        className={className} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Glow effect */}
        <circle cx="12" cy="12" r="10" fill="rgba(59,130,246,0.12)" />
        
        {/* Center Core */}
        <circle cx="12" cy="12" r="4" fill="white" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
        
        {/* Top Diamond */}
        <path 
            d="M12 2L14 6L12 10L10 6L12 2Z" 
            fill="#A855F7" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        
        {/* Bottom Diamond */}
        <path 
            d="M12 14L14 18L12 22L10 18L12 14Z" 
            fill="#A855F7" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        
        {/* Left Hexagon */}
        <path 
            d="M5 9L7 7L10 8L10 11L7 13L5 11L5 9Z" 
            fill="#3B82F6" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        
        {/* Right Hexagon */}
        <path 
            d="M19 9L17 7L14 8L14 11L17 13L19 11L19 9Z" 
            fill="#3B82F6" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
    </svg>
);

// Loading variant with rotation
const AdinAILoadingIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg 
        className={`${className} animate-spin`} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="12" cy="12" r="10" fill="rgba(59,130,246,0.12)" />
        <circle cx="12" cy="12" r="4" fill="white" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
        <path 
            d="M12 2L14 6L12 10L10 6L12 2Z" 
            fill="#A855F7" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        <path 
            d="M12 14L14 18L12 22L10 18L12 14Z" 
            fill="#A855F7" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        <path 
            d="M5 9L7 7L10 8L10 11L7 13L5 11L5 9Z" 
            fill="#3B82F6" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        <path 
            d="M19 9L17 7L14 8L14 11L17 13L19 11L19 9Z" 
            fill="#3B82F6" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
    </svg>
);

const SummarySection: React.FC<SummarySectionProps> = ({
    professionalSummary,
    setProfessionalSummary,
    generateSummary: oldGenerateSummary,
    generating,
    personalInfo,
    experiences,
    skills
}) => {
    const [analysis, setAnalysis] = useState({
        words: 0,
        chars: 0,
        score: 0,
        quality: '',
        warnings: [] as string[]
    });
    
    // ✅ Local loading state for synchronous operation
    const [isGenerating, setIsGenerating] = useState(false);

    // ✅ New human-touch summary generator with minimum 2.5s loading
    const generateHumanSummary = async () => {
        if (!personalInfo?.title) {
            toast.error('Please fill your job title in Personal Information first');
            return;
        }
        
        // Start loading
        setIsGenerating(true);
        
        try {
            // Start the AI generation
            const generationPromise = new Promise<string>((resolve) => {
                const summary = generateDescriptionFromData({
                    type: 'summary',
                    jobTitle: personalInfo.title,
                    companyName: '',
                    userData: { experiences: experiences || [], skills: skills || '' }
                });
                resolve(summary);
            });
            
            // Wait for both: AI generation AND minimum 2.5 seconds
            const [summary] = await Promise.all([
                generationPromise,
                new Promise(resolve => setTimeout(resolve, 2500)) // Minimum 2.5s loading
            ]);
            
            setProfessionalSummary(summary);
            toast.success('Human-touch summary generated!');
        } catch (error) {
            toast.error('Failed to generate summary');
        } finally {
            // End loading
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        const text = professionalSummary;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        
        let score = 0;
        const warnings: string[] = [];
        
        if (chars >= 150) {
            score = 100;
        } else if (chars >= 100) {
            score = 85;
        } else if (chars >= 70) {
            score = 70;
        } else if (chars >= 50) {
            score = 55;
        } else if (chars > 0) {
            score = 35;
            warnings.push('Summary is too short (50+ characters recommended)');
        } else {
            score = 0;
        }
        
        let quality = '';
        if (score >= 85) quality = 'Excellent';
        else if (score >= 70) quality = 'Good';
        else if (score >= 50) quality = 'Average';
        else if (score > 0) quality = 'Poor';
        else quality = 'Not started';
        
        setAnalysis({ words, chars, score, quality, warnings });
    }, [professionalSummary]);

    const getQualityColor = () => {
        if (analysis.quality === 'Excellent') return 'text-green-400';
        if (analysis.quality === 'Good') return 'text-purple-400';
        if (analysis.quality === 'Average') return 'text-blue-400';
        return 'text-gray-400';
    };
    
    // Combine external and local loading states
    const isLoading = generating || isGenerating;

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-white tracking-tight">Professional Summary</h2>
                <button 
                    onClick={generateHumanSummary} 
                    disabled={isLoading} 
                    className="h-11 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm tracking-tight flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 active:scale-98 backdrop-blur-sm border border-white/8 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                    {isLoading ? (
                        <>
                            <AdinAILoadingIcon className="w-5 h-5" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <AdinAIIcon className="w-5 h-5" />
                            AI Generate Summary
                        </>
                    )}
                </button>
            </div>
            
            <p className="text-xs text-gray-400 mb-2">Write a professional summary based on your experience, skills, and career goals. AI will analyze your full CV and generate a human-touch summary.</p>
            
            <textarea 
                value={professionalSummary} 
                onChange={e => setProfessionalSummary(e.target.value)} 
                rows={6} 
                placeholder="Write a brief professional summary highlighting your experience, skills, and career goals..." 
                className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none resize-none focus:border-purple-500 text-sm transition-colors duration-300" 
            />
            
            {/* Live Summary Analyzer */}
            {professionalSummary && (
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-purple-400">Summary Analysis</h3>
                        <span className="text-xs text-gray-400">Score: {analysis.score}%</span>
                    </div>
                    <div className="flex gap-4 mb-3 text-xs">
                        <span className="text-gray-400">Words: <span className="text-white">{analysis.words}</span></span>
                        <span className="text-gray-400">Characters: <span className="text-white">{analysis.chars}</span></span>
                        <span className="text-gray-400">Quality: <span className={getQualityColor()}>{analysis.quality}</span></span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full mb-3">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300" style={{ width: `${analysis.score}%` }}></div>
                    </div>
                    {analysis.warnings.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {analysis.warnings.map((warning, i) => (
                                <span key={i} className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">{warning}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            <div className="p-3 rounded-lg bg-purple-600/10 border border-purple-500/30">
                <p className="text-xs text-purple-300 mb-1">Tips for a great summary:</p>
                <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                    <li>Highlight your years of experience and key expertise</li>
                    <li>Mention your top achievements or successful projects</li>
                    <li>Include relevant certifications or specializations</li>
                    <li>Keep it concise (100-200 characters recommended)</li>
                </ul>
            </div>
        </div>
    );
};

export default SummarySection;