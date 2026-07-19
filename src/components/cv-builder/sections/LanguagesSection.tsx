import React, { useState } from 'react';
import { LanguageItem } from '../types/cvTypes';

interface LanguagesSectionProps {
    languages: LanguageItem[];
    addLanguage: () => void;
    removeLanguage: (i: number) => void;
    updateLanguage: (i: number, field: keyof LanguageItem, value: string) => void;
}

const capitalizeLanguage = (lang: string): string => {
    if (!lang) return '';
    const languageMap: Record<string, string> = {
        'urdu': 'Urdu', 'english': 'English', 'spanish': 'Spanish',
        'french': 'French', 'german': 'German', 'chinese': 'Chinese',
        'japanese': 'Japanese', 'arabic': 'Arabic', 'hindi': 'Hindi',
        'bengali': 'Bengali', 'russian': 'Russian', 'portuguese': 'Portuguese',
        'italian': 'Italian', 'turkish': 'Turkish', 'persian': 'Persian',
        'pashto': 'Pashto', 'sindhi': 'Sindhi', 'punjabi': 'Punjabi'
    };
    const lowerLang = lang.toLowerCase().trim();
    return languageMap[lowerLang] || lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
};

const getProficiencyLabel = (value: string): string => {
    const labels: Record<string, string> = {
        'Beginner': 'Beginner',
        'Intermediate': 'Professional Working Proficiency',
        'Advanced': 'Advanced Professional Proficiency',
        'Fluent': 'Native/Bilingual Proficiency'
    };
    return labels[value] || value;
};

const formatLanguageDisplay = (language: string, proficiency: string): string => {
    if (!language) return '';
    const profLabel = getProficiencyLabel(proficiency);
    return `${language}: ${profLabel}`;
};

// Check if input contains any separator that would indicate multiple languages
const hasSeparator = (value: string): boolean => {
    const separators = [',', '/', ';', '|', '&', '+'];
    return separators.some(sep => value.includes(sep));
};

// Check if input contains multiple words that aren't a known multi-word language
const hasMultipleWords = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    
    const words = trimmed.split(/\s+/);
    if (words.length <= 1) return false;
    
    // Known multi-word languages that should be allowed
    const multiWordLanguages = [
        'brazilian portuguese',
        'simplified chinese',
        'traditional chinese',
        'sign language',
        'american sign language',
        'british sign language',
        'mandarin chinese',
        'cantonese chinese',
        'new zealand sign language',
        'australian sign language'
    ];
    
    const lowerValue = trimmed.toLowerCase();
    for (const lang of multiWordLanguages) {
        if (lowerValue.includes(lang)) {
            return false; // It's a valid multi-word language
        }
    }
    
    return true; // Multiple words but not a known multi-word language
};

const isValidSingleLanguage = (value: string): boolean => {
    if (!value || !value.trim()) return true; // Empty is valid (not yet entered)
    
    const trimmed = value.trim();
    
    // Reject if contains separators
    if (hasSeparator(trimmed)) return false;
    
    // Reject if it has multiple words that aren't a known language name
    if (hasMultipleWords(trimmed)) return false;
    
    return true;
};

const LanguagesSection: React.FC<LanguagesSectionProps> = ({
    languages,
    addLanguage,
    removeLanguage,
    updateLanguage
}) => {
    const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});

    const handleLanguageChange = (idx: number, value: string) => {
        const capitalized = capitalizeLanguage(value);
        
        // Check if the input is valid
        const isValid = isValidSingleLanguage(capitalized);
        
        if (!isValid && capitalized.trim() !== '') {
            setValidationErrors(prev => ({
                ...prev,
                [idx]: 'Please enter only one language. Click "Add Language" to add another language.'
            }));
            // Don't update state with invalid value
            return;
        }
        
        // Clear validation error for this index
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[idx];
            return newErrors;
        });
        
        // Only update if valid
        updateLanguage(idx, 'language', capitalized);
    };

    return (
        <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white mb-1">
                Languages <span className="text-sm font-normal text-gray-400">(Optional)</span>
            </h2>
            <p className="text-xs text-gray-400 mb-2">Add languages you speak with proficiency level.</p>
            
            {languages.map((lang, idx) => (
                <div key={`language-${idx}`} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-purple-400">Language #{idx + 1}</span>
                        {languages.length > 1 && (
                            <button onClick={() => removeLanguage(idx)} className="text-red-400 text-sm hover:text-red-300 transition">
                                Remove
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        <input 
                            type="text" 
                            placeholder="e.g. English" 
                            value={lang.language} 
                            onChange={e => handleLanguageChange(idx, e.target.value)} 
                            className={`w-full p-3 rounded-xl bg-gray-800 border text-white outline-none focus:border-purple-500 ${
                                validationErrors[idx] ? 'border-red-500' : 'border-gray-700'
                            }`} 
                        />
                        
                        {validationErrors[idx] && (
                            <p className="text-red-400 text-xs mt-1">{validationErrors[idx]}</p>
                        )}
                        
                        <select 
                            value={lang.proficiency} 
                            onChange={e => updateLanguage(idx, 'proficiency', e.target.value)} 
                            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500"
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Professional Working Proficiency</option>
                            <option value="Advanced">Advanced Professional Proficiency</option>
                            <option value="Fluent">Native/Bilingual Proficiency</option>
                        </select>

                        {/* Preview with FIXED overflow handling */}
                        {lang.language && (
                            <div className="mt-2 p-2 rounded-lg bg-gray-700/30 border border-gray-600/50 overflow-hidden">
                                <p className="text-xs text-gray-400 break-words whitespace-normal">
                                    Preview: <span className="text-purple-300 font-medium break-words">
                                        {formatLanguageDisplay(lang.language, lang.proficiency)}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            
            <button onClick={addLanguage} className="w-full py-3 rounded-xl border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 transition">
                + Add Language
            </button>
        </div>
    );
};

export default LanguagesSection;