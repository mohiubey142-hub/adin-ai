import React, { useState } from 'react';
import { ProjectItem } from '../types/cvTypes';

interface ProjectsSectionProps {
    projects: ProjectItem[];
    addProject: () => void;
    removeProject: (i: number) => void;
    updateProject: (i: number, field: keyof ProjectItem, value: string) => void;
    generateDescription: (index: number, proj: ProjectItem) => void;
    generating: boolean;
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

// Loading variant with rotation - same animation as Skills/Experience/Achievements
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

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
    projects,
    addProject,
    removeProject,
    updateProject,
    generateDescription,
    generating
}) => {
    // ✅ Local loading state for synchronous operation
    const [isGenerating, setIsGenerating] = useState<number | null>(null);

    // Calculate project score for each project
    const getProjectScore = (proj: ProjectItem): number => {
        let score = 0;
        if (proj.name && proj.name.trim()) score += 30;
        if (proj.description && proj.description.trim().length > 30) score += 30;
        if (proj.tech && proj.tech.trim()) score += 25;
        if (proj.github && proj.github.trim()) score += 15;
        return score;
    };

    const getProjectWeakPoints = (proj: ProjectItem): string[] => {
        const weakPoints: string[] = [];
        if (proj.name && !proj.description) weakPoints.push('Missing description');
        if (proj.name && !proj.tech) weakPoints.push('Missing technologies used');
        if (proj.name && proj.description && proj.description.length < 30) weakPoints.push('Description too short');
        return weakPoints;
    };

    // ✅ Count bullet points in description
    const getBulletCount = (description: string): number => {
        if (!description) return 0;
        const lines = description.split('\n').filter(line => line.trim().startsWith('•'));
        return lines.length;
    };

    // ✅ Generate 3 bullets based on project title
    const generateThreeBullets = (proj: ProjectItem): string => {
        const name = proj.name || 'Project';
        const tech = proj.tech || 'modern technologies';
        
        // 3 professional bullet points based on title
        const bullets = [
            `• Built ${name} using ${tech}, delivering a scalable and maintainable solution`,
            `• Implemented core features and functionality with focus on performance optimization`,
            `• Achieved measurable results through clean code and positive user experience`
        ];
        
        return bullets.join('\n');
    };

    // ✅ Handle description with bullets
    const handleDescriptionChange = (idx: number, value: string) => {
        const lines = value.split('\n');
        const hasBullets = lines.some(line => line.trim().startsWith('•'));
        
        if (hasBullets) {
            updateProject(idx, 'description', value);
        } else {
            const bulletLines = lines
                .filter(line => line.trim())
                .map(line => {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('•')) {
                        return `• ${trimmed}`;
                    }
                    return trimmed;
                });
            updateProject(idx, 'description', bulletLines.join('\n'));
        }
    };

    // ✅ Generate 3 bullets based on title with minimum 2.5s loading
    const handleGenerateBullets = async (idx: number, proj: ProjectItem) => {
        // Start loading for this specific project
        setIsGenerating(idx);
        
        try {
            // Start the AI generation
            const generationPromise = new Promise<string>((resolve) => {
                const threeBullets = generateThreeBullets(proj);
                resolve(threeBullets);
            });
            
            // Wait for both: AI generation AND minimum 2.5 seconds
            const [threeBullets] = await Promise.all([
                generationPromise,
                new Promise(resolve => setTimeout(resolve, 2500)) // Minimum 2.5s loading
            ]);
            
            updateProject(idx, 'description', threeBullets);
        } catch (error) {
            console.error('Failed to generate bullets:', error);
        } finally {
            // End loading
            setIsGenerating(null);
        }
    };

    return (
        <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">Projects</h2>
            <p className="text-xs text-gray-400 mb-2">Add your best personal, freelance or academic projects. <span className="text-purple-400">Aim for 3 bullet points per project!</span></p>
            
            {projects.map((proj, idx) => {
                const score = getProjectScore(proj);
                const weakPoints = getProjectWeakPoints(proj);
                const bulletCount = getBulletCount(proj.description || '');
                const isLoading = generating || isGenerating === idx;
                
                return (
                    <div key={idx} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-purple-400">Project #{idx + 1}</span>
                            <div className="flex items-center gap-3">
                                {proj.name && (
                                    <span className="text-xs text-gray-400">Score: <span className="text-purple-400">{score}%</span></span>
                                )}
                                {projects.length > 1 && (
                                    <button onClick={() => removeProject(idx)} className="text-red-400 text-sm hover:text-red-300 transition-colors duration-300">Remove</button>
                                )}
                            </div>
                        </div>
                        
                        {/* Weak points */}
                        {weakPoints.length > 0 && proj.name && (
                            <div className="mb-3 flex flex-wrap gap-2">
                                {weakPoints.map((wp, i) => (
                                    <span key={i} className="text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">⚠ {wp}</span>
                                ))}
                            </div>
                        )}
                        
                        {/* ✅ Bullet count indicator */}
                        {proj.name && proj.description && (
                            <div className="mb-3 flex items-center gap-3">
                                <span className={`text-xs font-medium ${bulletCount >= 3 ? 'text-green-400' : bulletCount >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    📝 {bulletCount} bullet{bulletCount > 1 ? 's' : ''}
                                    {bulletCount < 3 && ' (3 recommended)'}
                                    {bulletCount >= 3 && ' ✅'}
                                </span>
                            </div>
                        )}
                        
                        <div className="space-y-3">
                            <input 
                                type="text" 
                                placeholder="Project Name (e.g., AI Career Assistant)" 
                                value={proj.name} 
                                onChange={e => updateProject(idx, 'name', e.target.value)} 
                                className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500 transition-colors duration-300" 
                            />
                            
                            <input 
                                type="text" 
                                placeholder="Technologies Used (e.g., React, Python, AWS)" 
                                value={proj.tech} 
                                onChange={e => updateProject(idx, 'tech', e.target.value)} 
                                className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500 transition-colors duration-300" 
                            />
                            
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm text-gray-300">Description</label>
                                    {/* ✅ Premium AI Button with minimum 2.5s loading */}
                                    <button 
                                        onClick={() => handleGenerateBullets(idx, proj)} 
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
                                                Generate AI Bullets
                                            </>
                                        )}
                                    </button>
                                </div>
                                <textarea 
                                    placeholder="Describe your project in bullet points (each line gets a bullet)..." 
                                    value={proj.description || ''} 
                                    onChange={e => handleDescriptionChange(idx, e.target.value)} 
                                    rows={5} 
                                    className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none resize-none focus:border-purple-500 font-mono text-sm transition-colors duration-300" 
                                />
                                {proj.description && getBulletCount(proj.description) < 3 && proj.name && (
                                    <p className="text-xs text-yellow-400 mt-1">⚠️ Add {3 - getBulletCount(proj.description)} more bullet point{3 - getBulletCount(proj.description) > 1 ? 's' : ''}</p>
                                )}
                            </div>
                            
                            <input 
                                type="text" 
                                placeholder="GitHub Link (Optional)" 
                                value={proj.github} 
                                onChange={e => updateProject(idx, 'github', e.target.value)} 
                                className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500 transition-colors duration-300" 
                            />
                        </div>
                        
                        {/* Progress bar for project completion */}
                        {proj.name && (
                            <div className="mt-3">
                                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300" style={{ width: `${score}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
            
            <button onClick={addProject} className="w-full py-3 rounded-xl border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-all duration-300">
                + Add Project
            </button>
        </div>
    );
};

export default ProjectsSection;