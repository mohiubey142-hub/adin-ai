// src/components/cv-builder/sections/ExperienceSection.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ExperienceItem, ExperienceValidationResult, EXPERIENCE_LEVELS } from '../types/cvTypes';

interface ExperienceSectionProps {
    experiences: ExperienceItem[];
    addExperience: () => void;
    removeExperience: (i: number) => void;
    updateExperience: (i: number, field: keyof ExperienceItem, value: string) => void;
    generateDescription: (index: number, exp: ExperienceItem) => void;
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

// ✅ Validation function
const validateExperienceYears = (level: string, startDate: string, endDate: string): ExperienceValidationResult => {
    const defaultResult: ExperienceValidationResult = {
        isValid: true,
        years: 0,
        expectedLevel: '',
        selectedLevel: level,
        message: ''
    };

    if (!level || !startDate || !endDate) {
        return defaultResult;
    }

    const startYearMatch = startDate.match(/\d{4}/);
    const endYearMatch = endDate.match(/\d{4}/);

    if (!startYearMatch || !endYearMatch) {
        return defaultResult;
    }

    const startYear = parseInt(startYearMatch[0]);
    const endYear = parseInt(endYearMatch[0]);

    if (startYear > endYear) {
        return {
            ...defaultResult,
            isValid: false,
            years: 0,
            expectedLevel: '',
            selectedLevel: level,
            message: 'Start year cannot be after end year'
        };
    }

    const years = endYear - startYear;
    let expectedLevel = '';

    if (years <= 2) expectedLevel = EXPERIENCE_LEVELS.JUNIOR;
    else if (years >= 3 && years <= 6) expectedLevel = EXPERIENCE_LEVELS.MID;
    else if (years >= 7) expectedLevel = EXPERIENCE_LEVELS.SENIOR;

    const isValid = level === expectedLevel;

    const levelDisplayNames: Record<string, string> = {
        'Junior': 'Junior (0-2 years)',
        'Mid': 'Mid Level (3-6 years)',
        'Senior': 'Senior (7+ years)'
    };

    const expectedDisplay = levelDisplayNames[expectedLevel] || expectedLevel;

    return {
        isValid,
        years,
        expectedLevel,
        selectedLevel: level,
        message: isValid 
            ? `✓ ${years} years of experience matches ${level} level`
            : `⚠ Selected ${level} Level does not match ${years} years of experience (Expected: ${expectedDisplay})`
    };
};

// Experience Item Component with Level Dropdown
const ExperienceItemComponent: React.FC<{
    exp: ExperienceItem;
    idx: number;
    updateExperience: (i: number, field: keyof ExperienceItem, value: string) => void;
    removeExperience: (i: number) => void;
    generateDescription: (index: number, exp: ExperienceItem) => void;
    generating: boolean;
    totalExperiences: number;
}> = ({
    exp,
    idx,
    updateExperience,
    removeExperience,
    generateDescription,
    generating,
    totalExperiences
}) => {
    const titleInputRef = useRef<HTMLInputElement>(null);
    
    // ✅ Job Level State
    const [selectedLevel, setSelectedLevel] = useState<string>(() => {
        return exp.jobLevel || '';
    });

    // ✅ Validation State
    const [validation, setValidation] = useState<ExperienceValidationResult>(() => {
        return validateExperienceYears(exp.jobLevel || '', exp.startDate || '', exp.endDate || '');
    });

    // ✅ Re-validate when any field changes
    useEffect(() => {
        const result = validateExperienceYears(
            selectedLevel,
            exp.startDate || '',
            exp.endDate || ''
        );
        setValidation(result);
        
        // Update the experience item with validation status
        updateExperience(idx, 'isValid', result.isValid);
        updateExperience(idx, 'yearsOfExperience', result.years);
    }, [selectedLevel, exp.startDate, exp.endDate]);

    // ✅ Clean level text
    const getCleanLevel = (level: string): string => {
        if (!level) return '';
        return level.replace(/\s*Level$/, '').trim();
    };

    // ✅ Get clean title (without level prefix)
    const getCleanTitle = (fullTitle: string): string => {
        if (!fullTitle) return '';
        const levelPattern = /^(Junior|Mid|Senior)\s*/;
        return fullTitle.replace(levelPattern, '');
    };

    // ✅ Handle level selection
    const handleLevelChange = (level: string) => {
        const cleanLevel = getCleanLevel(level);
        setSelectedLevel(level);
        updateExperience(idx, 'jobLevel', level);
        
        const currentTitle = exp.title || '';
        const cleanTitle = getCleanTitle(currentTitle);
        const newTitle = cleanLevel ? `${cleanLevel} ${cleanTitle}`.trim() : cleanTitle;
        updateExperience(idx, 'title', newTitle);
        
        setTimeout(() => {
            if (titleInputRef.current) {
                titleInputRef.current.focus();
                const len = titleInputRef.current.value.length;
                titleInputRef.current.setSelectionRange(len, len);
            }
        }, 50);
    };

    // ✅ Handle title change
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const cleanLevel = getCleanLevel(selectedLevel);
        
        if (!cleanLevel) {
            updateExperience(idx, 'title', value);
            return;
        }

        if (!value.startsWith(cleanLevel + ' ')) {
            if (value.trim() === '') {
                updateExperience(idx, 'title', '');
                return;
            }
            
            const cleanValue = value.replace(new RegExp(`^${cleanLevel}\\s*`), '');
            const newTitle = cleanLevel + ' ' + cleanValue;
            updateExperience(idx, 'title', newTitle.trim());
            
            setTimeout(() => {
                if (titleInputRef.current) {
                    const len = titleInputRef.current.value.length;
                    titleInputRef.current.setSelectionRange(len, len);
                }
            }, 0);
        } else {
            updateExperience(idx, 'title', value);
        }
    };

    // ✅ Handle keydown
    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        const cleanLevel = getCleanLevel(selectedLevel);
        
        if (!cleanLevel) return;

        if (e.key === 'Backspace') {
            const cursorPos = input.selectionStart || 0;
            const value = input.value;
            const levelPrefix = cleanLevel + ' ';
            
            if (cursorPos <= levelPrefix.length) {
                const selectionStart = input.selectionStart || 0;
                const selectionEnd = input.selectionEnd || 0;
                
                if (selectionStart === 0 && selectionEnd === 0) {
                    return;
                }
                
                if (selectionStart < levelPrefix.length) {
                    e.preventDefault();
                    input.setSelectionRange(levelPrefix.length, levelPrefix.length);
                    return;
                }
            }
        }

        if (e.key === ' ') {
            const value = input.value;
            const cursorPos = input.selectionStart || 0;
            
            if (cursorPos === value.length && value.endsWith(' ')) {
                e.preventDefault();
                return;
            }
            return;
        }
    };

    // ✅ Get display title
    const getDisplayTitle = (): string => {
        if (!exp.title) return '';
        const cleanLevel = getCleanLevel(selectedLevel);
        
        if (!cleanLevel) {
            return getCleanTitle(exp.title);
        }
        
        if (exp.title.startsWith(cleanLevel + ' ')) {
            return exp.title;
        }
        
        const cleanTitle = getCleanTitle(exp.title);
        return cleanLevel + ' ' + cleanTitle;
    };

    // ✅ Sync title
    useEffect(() => {
        if (selectedLevel && exp.title) {
            const cleanLevel = getCleanLevel(selectedLevel);
            const cleanTitle = getCleanTitle(exp.title);
            
            if (!exp.title.startsWith(cleanLevel + ' ')) {
                const fixedTitle = cleanLevel + ' ' + cleanTitle;
                if (fixedTitle.trim() !== exp.title) {
                    updateExperience(idx, 'title', fixedTitle.trim());
                }
            }
        }
    }, [selectedLevel, exp.title]);

    // ✅ Check if AI generation should be disabled
    const isAIDisabled = !validation.isValid && exp.startDate && exp.endDate;

    const levelOptions = [
        { value: 'Junior', label: 'Junior Level' },
        { value: 'Mid', label: 'Mid Level' },
        { value: 'Senior', label: 'Senior Level' },
    ];

    return (
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-purple-400">Experience #{idx + 1}</span>
                {totalExperiences > 1 && (
                    <button 
                        onClick={() => removeExperience(idx)} 
                        className="text-red-400 text-sm hover:text-red-300 transition-colors duration-300"
                    >
                        Remove
                    </button>
                )}
            </div>
            <div className="space-y-3">
                {/* ✅ Job Level Dropdown */}
                <div>
                    <select
                        value={selectedLevel}
                        onChange={e => handleLevelChange(e.target.value)}
                        className={`w-full p-3 rounded-xl bg-gray-800 border ${!validation.isValid && exp.startDate && exp.endDate ? 'border-red-500' : 'border-gray-700'} text-white outline-none focus:border-purple-500 appearance-none transition-colors duration-300`}
                        style={{ textAlignLast: 'center' }}
                    >
                        <option value="">Select Level</option>
                        {levelOptions.map(level => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* ✅ Validation Warning */}
                {!validation.isValid && exp.startDate && exp.endDate && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                        <p className="text-sm text-red-400 flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">⚠</span>
                            <span>{validation.message}</span>
                        </p>
                        <p className="text-xs text-red-400/70 mt-1 ml-6">
                            Please update either your Experience Level or your Start/End Years.
                        </p>
                    </div>
                )}

                {/* ✅ Success Message */}
                {validation.isValid && validation.years > 0 && (
                    <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-xs text-green-400 text-center">
                            {validation.message}
                        </p>
                    </div>
                )}
                
                {/* ✅ Position Title Input with Level Prefix */}
                <input 
                    ref={titleInputRef}
                    type="text" 
                    placeholder={selectedLevel ? "e.g., Software Engineer" : "Select level first"} 
                    value={getDisplayTitle()} 
                    onChange={handleTitleChange}
                    onKeyDown={handleTitleKeyDown}
                    className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500 transition-colors duration-300" 
                    disabled={!selectedLevel}
                />
                
                {/* ✅ Company Name */}
                <input 
                    type="text" 
                    placeholder="Company Name (e.g., Google, Microsoft)" 
                    value={exp.company} 
                    onChange={e => updateExperience(idx, 'company', e.target.value)} 
                    className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500 transition-colors duration-300" 
                />
                
                {/* ✅ Date Fields - No bullet style */}
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Start Date (e.g., Jan 2022)" 
                        value={exp.startDate} 
                        onChange={e => updateExperience(idx, 'startDate', e.target.value)} 
                        className={`w-1/2 p-3 rounded-xl bg-gray-800 border ${!validation.isValid && exp.startDate && exp.endDate ? 'border-red-500' : 'border-gray-700'} text-white outline-none focus:border-purple-500 transition-colors duration-300`} 
                    />
                    <input 
                        type="text" 
                        placeholder="End Date (e.g., Present or Dec 2024)" 
                        value={exp.endDate} 
                        onChange={e => updateExperience(idx, 'endDate', e.target.value)} 
                        className={`w-1/2 p-3 rounded-xl bg-gray-800 border ${!validation.isValid && exp.startDate && exp.endDate ? 'border-red-500' : 'border-gray-700'} text-white outline-none focus:border-purple-500 transition-colors duration-300`} 
                    />
                </div>
                
                {/* ✅ Description - Height increased 20% more (rows 5 → 6) */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-gray-300">Description <span className="text-gray-500">(Optional)</span></label>
                        <button 
                            onClick={() => {
                                if (isAIDisabled) {
                                    return;
                                }
                                generateDescription(idx, exp);
                            }} 
                            disabled={generating || isAIDisabled}
                            className={`h-11 px-4 rounded-xl font-semibold text-sm tracking-tight flex items-center gap-2 transition-all duration-300 ${
                                isAIDisabled
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 active:scale-98 backdrop-blur-sm border border-white/8'
                            }`}
                            title={isAIDisabled ? 'Please fix the Experience Level mismatch before generating AI content' : ''}
                        >
                            {generating ? (
                                <>
                                    <AdinAILoadingIcon className="w-5 h-5" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <AdinAIIcon className="w-5 h-5" />
                                    {isAIDisabled ? 'Fix Level Mismatch' : 'Generate AI Description'}
                                </>
                            )}
                        </button>
                    </div>
                    {isAIDisabled && (
                        <p className="text-xs text-red-400 mb-2">
                            ⚠ Please fix the Experience Level mismatch before generating AI content.
                        </p>
                    )}
                    {/* ✅ rows={6} - 20% more height */}
                    <textarea 
                        placeholder="Describe your responsibilities, achievements, and impact..." 
                        value={exp.description} 
                        onChange={e => updateExperience(idx, 'description', e.target.value)} 
                        rows={6} 
                        className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none resize-none focus:border-purple-500 transition-colors duration-300" 
                    />
                </div>
            </div>
        </div>
    );
};

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
    experiences,
    addExperience,
    removeExperience,
    updateExperience,
    generateDescription,
    generating
}) => {
    return (
        <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white mb-1 tracking-tight">
                Work Experience <span className="text-sm font-normal text-gray-400">(Optional)</span>
            </h2>
            <p className="text-xs text-gray-500 mb-2">Add your professional experience. Position and Company are recommended.</p>
            
            {experiences.map((exp, idx) => (
                <ExperienceItemComponent
                    key={idx}
                    exp={exp}
                    idx={idx}
                    updateExperience={updateExperience}
                    removeExperience={removeExperience}
                    generateDescription={generateDescription}
                    generating={generating}
                    totalExperiences={experiences.length}
                />
            ))}
            
            <button 
                onClick={addExperience} 
                className="w-full py-3 rounded-xl border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-all duration-300"
            >
                + Add Experience
            </button>
        </div>
    );
};

export default ExperienceSection;