// utils/aiGenerators.ts
// ============================================
// AI GENERATOR - ENTRY POINT
// ============================================

console.log("🚀 AI GENERATOR - PAKISTAN EDITION (60+ Professions) 🚀");

// ============================================
// CONFIG
// ============================================
export { initializeAI, isAIInitialized, resetAI } from './config';

// ============================================
// PROFESSION
// ============================================
export { detectProfession, getBulletsByProfession, getProfessionalSummary } from './profession';

// ============================================
// HELPERS
// ============================================
export {
    normalizeJobTitle,
    getLevel,
    getYears,
    getYearsForCurrentExp,
    generateSmartProjectDescription,
    generateSmartAchievementDescription
} from './helpers';

// ============================================
// ENHANCERS
// ============================================
export {
    enhanceUserSkills,
    polishGrammar,
    polishText,
    polishBullets,
    fixGrammar,
    needsPolishing,
    getPolishingSuggestions,
    enhanceCVText,
    enhanceCVBullets
} from './enhancers';

// ============================================
// PROVIDERS
// ============================================
export {
    AIProviderManager,
    AISummaryGenerator,
    AIExperienceEnhancer,
    AISkillsGenerator,
    OpenRouterProvider,
    GroqProvider
} from './providers';

// ============================================
// FALLBACK SYSTEM
// ============================================
import { 
    generateCVFromQA, 
    generateFallbackCV,
    generateFallbackBullets,
    generateFallbackSummary,
    generateSmartQuestions
} from './fallback/guidedQAFallback';

export {
    generateCVFromQA,
    generateFallbackCV,
    generateFallbackBullets,
    generateFallbackSummary,
    generateSmartQuestions
};

// ============================================
// TYPE IMPORTS
// ============================================
import type { QAResponse, GeneratedContent } from './fallback/guidedQAFallback';
export type { QAResponse, GeneratedContent };

// ============================================
// MAIN GENERATION FUNCTION
// ============================================
import { detectProfession, getBulletsByProfession, getProfessionalSummary } from './profession';
import { getLevel, getYears, getYearsForCurrentExp, generateSmartProjectDescription, generateSmartAchievementDescription } from './helpers';
import { polishText, polishBullets, enhanceCVText } from './enhancers';
import { generateFallbackBullets, generateFallbackSummary } from './fallback/guidedQAFallback';
import { getGeneralBullets } from './pools/generalPool';
import { AISummaryGenerator, AIExperienceEnhancer, AISkillsGenerator } from './providers';
import { initializeAI } from './config';

// ============================================
// 🆕 LANGUAGE FILTER - Remove languages from skills
// ============================================
const LANGUAGE_KEYWORDS = [
    // Major Languages
    'english', 'urdu', 'hindi', 'arabic', 'french', 'german', 'spanish', 
    'chinese', 'japanese', 'korean', 'russian', 'italian', 'turkish', 
    'portuguese', 'bengali', 'punjabi', 'sindhi', 'pashto', 'persian',
    'dutch', 'swedish', 'norwegian', 'danish', 'finnish', 'polish', 
    'greek', 'hebrew', 'thai', 'vietnamese', 'indonesian', 'malay',
    
    // Language-related phrases
    'language proficiency', 'language skills', 'communication language',
    'spoken language', 'written language', 'native language',
    'fluent english', 'native english', 'business english',
    'spoken english', 'written english', 'english proficiency',
    'english language', 'professional english', 'academic english',
    'conversational english', 'technical english', 'medical english',
    'legal english', 'financial english', 'english communication',
    'english speaking', 'english writing', 'english reading',
    'english comprehension', 'english vocabulary', 'english grammar',
    
    // Language levels
    'fluent', 'native', 'bilingual', 'trilingual', 'multilingual',
    'conversational', 'intermediate', 'advanced', 'proficient',
    'beginner', 'elementary', 'limited working', 'professional working',
    'full professional', 'native or bilingual', 'elementary proficiency',
    'limited working proficiency', 'professional working proficiency',
    'full professional proficiency', 'native or bilingual proficiency'
];

const isLanguageSkill = (skill: string): boolean => {
    const lower = skill.toLowerCase().trim();
    
    // Exact match check
    if (LANGUAGE_KEYWORDS.includes(lower)) return true;
    
    // Check if skill contains language keyword
    for (const keyword of LANGUAGE_KEYWORDS) {
        if (lower.includes(keyword) && skill.length < 30) {
            return true;
        }
    }
    
    return false;
};

const filterLanguagesFromSkills = (skills: string[]): string[] => {
    return skills.filter(skill => !isLanguageSkill(skill));
};

// ============================================
// 🆕 AI GENERATE SUMMARY WITH AI PROVIDER
// ============================================
export const generateAISummary = async (params: {
    jobTitle: string;
    company?: string;
    years: number;
    profession: string;
    skills: string[];
    experiences: any[];
}): Promise<string> => {
    initializeAI();
    
    try {
        const summaryGenerator = new AISummaryGenerator();
        return await summaryGenerator.generate(params);
    } catch (error) {
        console.error('AI Summary failed, using fallback:', error);
        const { jobTitle, company, years, profession } = params;
        const level = getLevel(jobTitle, years);
        return getProfessionalSummary(profession, level, years, jobTitle, company || '');
    }
};

// ============================================
// 🆕 AI GENERATE EXPERIENCE BULLETS WITH AI PROVIDER
// ============================================
export const generateAIExperienceBullets = async (params: {
    title: string;
    company: string;
    description: string;
    level: string;
}): Promise<string[]> => {
    initializeAI();
    
    try {
        const enhancer = new AIExperienceEnhancer();
        return await enhancer.enhance(params);
    } catch (error) {
        console.error('AI Experience enhancement failed, using fallback:', error);
        if (params.description) {
            return params.description.split('\n').filter(b => b.trim());
        }
        return [
            `• ${params.title} at ${params.company}`,
            '• Delivered high-quality results',
            '• Collaborated with cross-functional teams',
            '• Achieved project milestones'
        ];
    }
};

// ============================================
// 🆕 AI GENERATE SKILLS WITH AI PROVIDER - FIXED: Languages Filtered
// ============================================
export const generateAISkills = async (params: {
    jobTitle: string;
    profession: string;
    existingSkills: string[];
    industry: string;
}): Promise<string[]> => {
    initializeAI();
    
    try {
        const skillsGenerator = new AISkillsGenerator();
        const generatedSkills = await skillsGenerator.generate(params);
        
        // ✅ FILTER: Remove languages from AI-generated skills
        return filterLanguagesFromSkills(generatedSkills);
    } catch (error) {
        console.error('AI Skills generation failed, using fallback:', error);
        
        // ✅ IMPROVED FALLBACK - Deduplicate with existing skills AND filter languages
        const fallbackSkills: Record<string, string[]> = {
            developer: ['JavaScript', 'React', 'Node.js', 'Python', 'Git', 'SQL', 'TypeScript', 'REST APIs', 'Docker', 'AWS'],
            teacher: ['Teaching', 'Lesson Planning', 'Communication', 'Mentoring', 'Assessment', 'Curriculum Design', 'Classroom Management', 'Educational Technology'],
            doctor: ['Patient Care', 'Diagnosis', 'Communication', 'EMR Systems', 'Clinical Skills', 'Treatment Planning', 'Medical Documentation', 'Patient Safety'],
            accountant: ['QuickBooks', 'Financial Reporting', 'Tax Preparation', 'Excel', 'Auditing', 'Compliance', 'Budgeting', 'Financial Analysis'],
            sales: ['Sales Strategy', 'CRM Software', 'Negotiation', 'Communication', 'Lead Generation', 'Closing', 'Account Management', 'Prospecting'],
            hr: ['Recruiting', 'Onboarding', 'Employee Relations', 'Performance Management', 'Compliance', 'Training', 'Talent Acquisition', 'HRIS'],
            general: ['Communication', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Leadership', 'Adaptability', 'Critical Thinking', 'Emotional Intelligence']
        };
        
        const fallback = fallbackSkills[params.profession] || fallbackSkills.general;
        
        // Deduplicate with existing skills (case insensitive)
        const existingLower = params.existingSkills.map(s => s.toLowerCase().trim());
        let uniqueFallback = fallback.filter(s => !existingLower.includes(s.toLowerCase().trim()));
        
        // ✅ FILTER: Remove languages from fallback skills
        uniqueFallback = filterLanguagesFromSkills(uniqueFallback);
        
        return uniqueFallback;
    }
};

// ✅ MAIN GENERATION FUNCTION (UPDATED - With enhancers + AI)
export const generateDescriptionFromData = (params: any): string => {
    const { type, jobTitle, companyName, currentStartDate, currentEndDate, userData, projectName, achievementTitle } = params;

    // ✅ PROJECT - Title-based description
    if (type === 'project') {
        const tech = userData?.projects?.find((p: any) => p.name === projectName)?.tech || '';
        const desc = generateSmartProjectDescription(projectName || 'Project', tech);
        let polished = polishText(desc);
        return enhanceCVText(polished);
    }

    // ✅ ACHIEVEMENT - Title-based description
    if (type === 'achievement') {
        const desc = generateSmartAchievementDescription(achievementTitle || 'Achievement');
        let polished = polishText(desc);
        return enhanceCVText(polished);
    }

    // ✅ EXPERIENCE - Profession-based bullets with AI + Fallback
    if (type === 'experience') {
        const title = jobTitle || '';
        const company = companyName || 'the organization';
        let profession = detectProfession(title);
        
        let years = 0;
        if (currentStartDate) {
            years = getYearsForCurrentExp(currentStartDate, currentEndDate || '');
        } else {
            years = getYears(userData?.experiences || []);
        }
        
        const level = getLevel(title, years);
        
        let bullets = getBulletsByProfession(profession, level, company);
        
        if (!bullets || bullets.length === 0 || bullets[0].includes('Supported the team')) {
            const fallbackBullets = generateFallbackBullets(title, level, company);
            if (fallbackBullets && fallbackBullets.length > 0) {
                bullets = fallbackBullets;
            } else {
                bullets = getGeneralBullets(level === 'director' || level === 'manager' ? 'senior' : level, company);
            }
        }
        
        let polished = polishBullets(bullets).join('\n');
        return enhanceCVText(polished);
    }

    // ✅ SUMMARY - Professional Summary (FIXED - No Diary/Emotion)
    if (type === 'summary') {
        const title = jobTitle || '';
        const company = companyName || 'the organization';
        const profession = detectProfession(title);
        const years = getYears(userData?.experiences || []);
        const level = getLevel(title, years);
        
        let summary = getProfessionalSummary(profession, level, years, title, company);
        
        if (!summary || summary.includes('learning, growing, and contributing') && years > 2) {
            summary = generateFallbackSummary(title, level, company, years);
        }
        
        let polished = polishText(summary);
        return enhanceCVText(polished);
    }

    return '';
};

// ============================================
// OTHER UTILITY EXPORTS
// ============================================

export const generateSkillsFromData = (): string => {
    return `• JavaScript\n• React\n• Node.js\n• Python\n• Git\n• SQL`;
};

export const fixJobTitleSpelling = (title: string): string => title;

export const validateAndSuggestEmail = (email: string): { isValid: boolean } => {
    return { isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) };
};

export const formatLanguageProficiency = (lang: string, level: string): string => {
    const map: Record<string, string> = {
        'Beginner': 'Beginner',
        'Intermediate': 'Professional Working',
        'Advanced': 'Advanced Professional',
        'Fluent': 'Native/Bilingual'
    };
    
    const levelText = map[level] || level;
    return `${lang}: ${levelText}`;
};

export const resetExperienceCache = (): void => {};