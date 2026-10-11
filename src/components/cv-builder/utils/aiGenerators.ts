// utils/aiGenerators.ts
// ============================================
// AI GENERATOR - ENTRY POINT (UPDATED)
// ============================================
// 
// 🚀 UPDATED: Fresher Detection Support
// 🚀 UPDATED: Level-aware Groq (junior/mid/senior)
// 🚀 FIXED: Experience bullets — level properly passed
// ✅ UPDATED: Existing profession → system templates DIRECTLY (no AI)
// ✅ UPDATED: Unknown profession → Groq (level-aware)
// ✅ NEW: Fresher experience bullets → ALWAYS Groq AI (profession-aware)
// ✅ UPDATED: Summary logic — sanitizer added (level keywords removed)
// ✅ UPDATED: Project bullets → Groq (6-7 bullets)
// ✅ UPDATED: Achievement bullets → Groq (3 bullets, shortDescription context)
// ============================================

console.log("🚀 AI GENERATOR - PAKISTAN EDITION (80+ Professions) 🚀");

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
import { 
    normalizeJobTitle, 
    getLevel, 
    getYears, 
    getYearsForCurrentExp, 
    generateSmartProjectDescription, 
    generateSmartAchievementDescription 
} from './profession/summaries/helpers';

export {
    normalizeJobTitle,
    getLevel,
    getYears,
    getYearsForCurrentExp,
    generateSmartProjectDescription,
    generateSmartAchievementDescription
};

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
import { isUnknownProfession } from './profession/detection';
import { fixGrammar, polishText, polishBullets, enhanceCVText } from './enhancers';
import { generateFallbackBullets, generateFallbackSummary } from './fallback/guidedQAFallback';
import { getGeneralBullets } from './pools/generalPool';
import { AISummaryGenerator, AISkillsGenerator } from './providers';
import { AIExperienceGenerator } from '../services/aiExperienceGenerator';
import { AIProjectGenerator } from '../services/aiProjectGenerator';
import { AIAchievementGenerator } from '../services/aiAchievementGenerator';
import { initializeAI } from './config';

// ============================================
// 🆕 LANGUAGE FILTER - Remove languages from skills
// ============================================
const LANGUAGE_KEYWORDS = [
    'english', 'urdu', 'hindi', 'arabic', 'french', 'german', 'spanish', 
    'chinese', 'japanese', 'korean', 'russian', 'italian', 'turkish', 
    'portuguese', 'bengali', 'punjabi', 'sindhi', 'pashto', 'persian',
    'dutch', 'swedish', 'norwegian', 'danish', 'finnish', 'polish', 
    'greek', 'hebrew', 'thai', 'vietnamese', 'indonesian', 'malay',
    
    'language proficiency', 'language skills', 'communication language',
    'spoken language', 'written language', 'native language',
    'fluent english', 'native english', 'business english',
    'spoken english', 'written english', 'english proficiency',
    'english language', 'professional english', 'academic english',
    'conversational english', 'technical english', 'medical english',
    'legal english', 'financial english', 'english communication',
    'english speaking', 'english writing', 'english reading',
    'english comprehension', 'english vocabulary', 'english grammar',
    
    'fluent', 'native', 'bilingual', 'trilingual', 'multilingual',
    'conversational', 'intermediate', 'advanced', 'proficient',
    'beginner', 'elementary', 'limited working', 'professional working',
    'full professional', 'native or bilingual', 'elementary proficiency',
    'limited working proficiency', 'professional working proficiency',
    'full professional proficiency', 'native or bilingual proficiency'
];

const isLanguageSkill = (skill: string): boolean => {
    const lower = skill.toLowerCase().trim();
    if (LANGUAGE_KEYWORDS.includes(lower)) return true;
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
// ✅ SCALABLE: Summary Title Sanitizer
// ============================================
// AI ya system templates level keyword (Junior/Senior/Mid) title mein inject kar dete hain.
// Yeh function unhe remove karta hai — agar user ke title mein nahi hain.
// ============================================
const sanitizeSummaryTitle = (summary: string, userTitle: string): string => {
    if (!summary || !userTitle) return summary;
    
    const userTitleLower = userTitle.toLowerCase().trim();
    
    const levelKeywords = [
        'junior', 'senior', 'mid-level', 'mid level', 'midlevel',
        'entry-level', 'entry level', 'entrylevel',
        'lead', 'principal', 'staff', 'associate',
        'fresher', 'trainee'
    ];
    
    let sanitized = summary;
    
    for (const keyword of levelKeywords) {
        // Agar user ke title mein keyword hai → skip (user ne dala hai)
        if (userTitleLower.includes(keyword)) continue;
        
        // ✅ Starting se remove karo (title ke roop mein)
        const startRegex = new RegExp(`^${keyword}\\s+`, 'i');
        sanitized = sanitized.replace(startRegex, '');
    }
    
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    return sanitized;
};

// ============================================
// 🆕 FRESHER DETECTION HELPER (PURANA — UNTOUCHED)
// ============================================
const isFresher = (experiences: any[]): boolean => {
    if (!experiences || experiences.length === 0) return true;
    
    const hasRealExperience = experiences.some(exp => 
        exp.title?.trim() && 
        exp.company?.trim() && 
        exp.startDate?.trim() && 
        exp.endDate?.trim() &&
        exp.title.toLowerCase() !== 'intern' &&
        exp.title.toLowerCase() !== 'internship' &&
        exp.title.toLowerCase() !== 'trainee'
    );
    
    return !hasRealExperience;
};

// ============================================
// 🆕 AI GENERATE SUMMARY WITH AI PROVIDER (PURANA — UNTOUCHED)
// ============================================
export const generateAISummary = async (params: {
    jobTitle: string;
    company?: string;
    years: number;
    profession: string;
    skills: string[];
    experiences: any[];
    educations?: any[];
}): Promise<string> => {
    initializeAI();
    
    const hasExperience = params.experiences && params.experiences.length > 0;
    const hasRealExperience = params.experiences?.some(exp => 
        exp.title?.trim() && 
        exp.company?.trim() && 
        exp.startDate?.trim() && 
        exp.endDate?.trim()
    );
    const isFresherStatus = !hasRealExperience || params.years < 1;
    
    const isUnknown = isUnknownProfession(params.jobTitle);
    const level = isFresherStatus ? 'fresher' : getLevel(params.jobTitle, params.years);
    
    // ✅ CASE 1: FRESHER + UNKNOWN PROFESSION → GROQ
    if (isFresherStatus && isUnknown) {
        console.log('🎓🔀 Unknown fresher detected → using Groq (level: fresher)');
        
        try {
            const summaryGenerator = new AISummaryGenerator();
            return await summaryGenerator.generate(
                { ...params, level: 'fresher' },
                'groq'
            );
        } catch (error) {
            console.error('Groq failed for unknown fresher, using fallback:', error);
            return getProfessionalSummary(
                params.profession,
                'fresher',
                params.years,
                params.jobTitle,
                params.company || '',
                params.skills || [],
                params.educations || []
            );
        }
    }
    
    // ✅ CASE 2: FRESHER + EXISTING PROFESSION → FRESHER TEMPLATE
    if (isFresherStatus) {
        console.log('🎓 Fresher detected → using fresher system templates (no AI)');
        return getProfessionalSummary(
            params.profession,
            'fresher',
            params.years,
            params.jobTitle,
            params.company || '',
            params.skills || [],
            params.educations || []
        );
    }
    
    // ✅ CASE 3: NON-FRESHER + EXISTING PROFESSION → SYSTEM TEMPLATE
    if (!isUnknown) {
        console.log(`📋 Existing profession → using system templates (level: ${level}) (no AI)`);
        return getProfessionalSummary(
            params.profession,
            level,
            params.years,
            params.jobTitle,
            params.company || '',
            params.skills || [],
            params.educations || []
        );
    }
    
    // ✅ CASE 4: NON-FRESHER + UNKNOWN PROFESSION → GROQ
    console.log(`🔀 Unknown profession detected → using Groq (level: ${level})`);
    
    try {
        const summaryGenerator = new AISummaryGenerator();
        return await summaryGenerator.generate(
            { ...params, level },
            'groq'
        );
    } catch (error) {
        console.error('Groq failed, using fallback:', error);
        const { jobTitle, company, years, profession, skills, educations } = params;
        
        return getProfessionalSummary(
            profession, 
            level, 
            years, 
            jobTitle, 
            company || '',
            skills || [],
            educations || []
        );
    }
};

// ============================================
// 🆕 AI GENERATE EXPERIENCE BULLETS (Level-Aware)
// ============================================
// ✅ NEW: Fresher → ALWAYS Groq AI (profession-aware)
// ✅ UNCHANGED: Junior/Mid/Senior/Manager/Director → system bullets
// ============================================
export const generateAIExperienceBullets = async (params: {
    title: string;
    company: string;
    description: string;
    level: string;
    years?: number;
}): Promise<string[]> => {
    initializeAI();
    
    const isUnknown = isUnknownProfession(params.title);
    
    // ============================================
    // ✅ NEW: FRESHER → ALWAYS USE AI (Groq)
    // ============================================
    if (params.level === 'fresher') {
        console.log(`🎓 Fresher detected → using Groq AI (level: fresher)`);
        
        // ✅ Profession detect karo (profession-specific bullets ke liye)
        const profession = detectProfession(params.title);
        console.log(`📋 Detected profession: ${profession}`);
        
        try {
            const experienceGenerator = new AIExperienceGenerator();
            return await experienceGenerator.generate({
                title: params.title,
                company: params.company,
                description: params.description,
                level: 'fresher',
                years: params.years ?? 0,
                profession: profession  // ✅ NEW: profession pass karo
            }, 'groq-experience');
        } catch (error) {
            console.error('Groq fresher failed, using fallback:', error);
            return getBulletsByProfession(profession, 'fresher', params.company);
        }
    }
    
    // ✅ CASE 1: EXISTING PROFESSION → SYSTEM BULLETS (NO AI)
    if (!isUnknown) {
        console.log(`📋 Existing profession → using system bullets (level: ${params.level}) (no AI)`);
        const profession = detectProfession(params.title);
        return getBulletsByProfession(profession, params.level, params.company);
    }
    
    // ✅ CASE 2: UNKNOWN PROFESSION → GROQ (EXPERIENCE KEYS)
    console.log(`🔀 Unknown profession detected → using Groq (level: ${params.level}) for experience bullets`);
    
    try {
        const experienceGenerator = new AIExperienceGenerator();
        return await experienceGenerator.generate({
            title: params.title,
            company: params.company,
            description: params.description,
            level: params.level,
            years: params.years
        }, 'groq-experience');
    } catch (error) {
        console.error('Groq experience failed, using fallback:', error);
        const profession = detectProfession(params.title);
        return getBulletsByProfession(profession, params.level, params.company);
    }
};

// ============================================
// 🆕 AI GENERATE PROJECT BULLETS (Groq, 6-7 bullets)
// ============================================
export const generateAIProjectBullets = async (params: {
    projectName: string;
    tech: string;
    description?: string;
}): Promise<string[]> => {
    initializeAI();
    
    console.log('🔀 Project bullets → using Groq (groq-project)');
    
    try {
        const projectGenerator = new AIProjectGenerator();
        return await projectGenerator.generate({
            projectName: params.projectName,
            tech: params.tech,
            description: params.description
        }, 'groq-project');
    } catch (error) {
        console.error('Groq project failed, using fallback:', error);
        
        const name = params.projectName || 'Project';
        const tech = params.tech || 'modern technologies';
        
        return [
            `• Built ${name} using ${tech}`,
            '• Implemented core features and functionality',
            '• Designed scalable and maintainable architecture',
            '• Integrated essential APIs and services',
            '• Tested and optimized for performance',
            '• Documented technical specifications'
        ];
    }
};

// ============================================
// 🆕 AI GENERATE ACHIEVEMENT BULLETS (Groq, 3 bullets)
// ============================================
// 
// ✅ NEW: shortDescription param — user's context for AI
// ✅ shortDescription is NOT rendered in CV/PDF/TXT
// 
// ============================================
export const generateAIAchievementBullets = async (params: {
    title: string;
    date?: string;
    shortDescription?: string;   // ✅ User-provided context for AI
}): Promise<string[]> => {
    initializeAI();
    
    console.log('🔀 Achievement bullets → using Groq (groq-achievement)');
    
    try {
        const achievementGenerator = new AIAchievementGenerator();
        return await achievementGenerator.generate({
            title: params.title,
            date: params.date,
            details: params.shortDescription   // ✅ shortDescription as "details" in prompt
        }, 'groq-achievement');
    } catch (error) {
        console.error('Groq achievement failed, using fallback:', error);
        
        const title = params.title || 'Achievement';
        const date = params.date || '';
        
        return [
            `• Recognized as ${title}${date ? ` in ${date}` : ''} for professional excellence`,
            '• Consistently delivered high-quality work and exceeded expectations',
            '• Demonstrated reliability and dedication to team objectives'
        ];
    }
};

// ============================================
// 🆕 AI GENERATE SKILLS
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
        return filterLanguagesFromSkills(generatedSkills);
    } catch (error) {
        console.error('AI Skills generation failed, using fallback:', error);
        
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
        const existingLower = params.existingSkills.map(s => s.toLowerCase().trim());
        let uniqueFallback = fallback.filter(s => !existingLower.includes(s.toLowerCase().trim()));
        uniqueFallback = filterLanguagesFromSkills(uniqueFallback);
        return uniqueFallback;
    }
};

// ============================================
// ✅ MAIN GENERATION FUNCTION
// ============================================
export const generateDescriptionFromData = (params: any): string => {
    const { type, jobTitle, companyName, currentStartDate, currentEndDate, userData, projectName, achievementTitle } = params;

    // ✅ PROJECT
    if (type === 'project') {
        const tech = userData?.projects?.find((p: any) => p.name === projectName)?.tech || '';
        const desc = generateSmartProjectDescription(projectName || 'Project', tech);
        let polished = polishText(desc);
        return enhanceCVText(polished);
    }

    // ✅ ACHIEVEMENT (fallback only — CV-rendered)
    if (type === 'achievement') {
        const desc = generateSmartAchievementDescription(achievementTitle || 'Achievement');
        let polished = polishText(desc);
        return enhanceCVText(polished);
    }

    // ✅ EXPERIENCE
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

    // ✅ SUMMARY (PURANA LOGIC — UNTOUCHED)
    if (type === 'summary') {
        const title = jobTitle || '';
        const company = companyName || 'the organization';
        const profession = detectProfession(title);
        
        const years = getYears(userData?.experiences || []);
        
        const experiences = userData?.experiences || [];
        const hasRealExperience = experiences.some((exp: any) => 
            exp.title?.trim() && 
            exp.company?.trim() && 
            exp.startDate?.trim() && 
            exp.endDate?.trim()
        );
        const isFresherStatus = !hasRealExperience || years < 1;
        
        const level = isFresherStatus ? 'fresher' : getLevel(title, years);
        
        const skills = userData?.skills ? userData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [];
        const educations = userData?.educations || [];
        
        let summary = getProfessionalSummary(
            profession, 
            level, 
            years, 
            title, 
            company,
            skills,
            educations
        );
        
        if (!summary || (summary.includes('learning, growing, and contributing') && years > 2)) {
            summary = generateFallbackSummary(title, level, company, years);
        }
        
        // ✅ SANITIZE: Level keywords remove karo (agar user ke title mein nahi hain)
        summary = sanitizeSummaryTitle(summary, title);
        
        let fixed = fixGrammar(summary);
        return fixed;
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