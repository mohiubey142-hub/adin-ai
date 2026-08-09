// utils/aiGenerators.ts
// ============================================
// AI GENERATOR - ENTRY POINT
// ============================================
// 
// 🚀 UPDATED: Fresher Detection Support
// 🚀 UPDATED: Passes hasExperience to summary generator
// 🚀 FIXED: Import path for helpers (now uses ./profession/summaries/helpers)
// 🔍 DEBUG: Added console logs for debugging
// ✅ FIXED: Summary capitalization bug — using fixGrammar instead of polishText/enhanceCVText
// 
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
// HELPERS - ✅ FIXED: Now imports from correct path
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
import { fixGrammar, polishText, polishBullets, enhanceCVText } from './enhancers';
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
// 🆕 FRESHER DETECTION HELPER
// ============================================
const isFresher = (experiences: any[]): boolean => {
    if (!experiences || experiences.length === 0) return true;
    
    // Check if any experience has actual professional content
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
// 🆕 AI GENERATE SUMMARY WITH AI PROVIDER (UPDATED)
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
    
    // ✅ FRESHER DETECTION
    const hasExperience = params.experiences && params.experiences.length > 0;
    const hasRealExperience = params.experiences?.some(exp => 
        exp.title?.trim() && 
        exp.company?.trim() && 
        exp.startDate?.trim() && 
        exp.endDate?.trim()
    );
    const isFresherStatus = !hasRealExperience || params.years < 1;
    
    try {
        const summaryGenerator = new AISummaryGenerator();
        return await summaryGenerator.generate(params);
    } catch (error) {
        console.error('AI Summary failed, using fallback:', error);
        const { jobTitle, company, years, profession, skills, educations } = params;
        
        // ✅ Pass fresher info to fallback
        const level = isFresherStatus ? 'fresher' : getLevel(jobTitle, years);
        
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

// ============================================
// ✅ MAIN GENERATION FUNCTION (UPDATED - With enhancers + AI)
// ✅ FIXED: Summary case now uses fixGrammar() instead of polishText() + enhanceCVText()
// ============================================
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

    // ✅ SUMMARY - Professional Summary (UPDATED: Fresher Support)
    // ✅ FIXED: Using fixGrammar() instead of polishText() + enhanceCVText()
    // ✅ fixGrammar() only fixes spelling mistakes and preserves capitalization
    if (type === 'summary') {
        // ============================================
        // 🔍 DEBUG STEP 1: Raw Input
        // ============================================
        console.log('🔍🔍🔍 DEBUG STEP 1: Raw Input');
        console.log('📌 jobTitle:', jobTitle);
        console.log('📌 companyName:', companyName);
        console.log('📌 userData:', userData);
        
        const title = jobTitle || '';
        const company = companyName || 'the organization';
        const profession = detectProfession(title);
        
        // ============================================
        // 🔍 DEBUG STEP 2: Profession Detection
        // ============================================
        console.log('🔍🔍🔍 DEBUG STEP 2: Profession Detection');
        console.log('📌 Detected profession:', profession);
        
        const years = getYears(userData?.experiences || []);
        
        // ============================================
        // 🔍 DEBUG STEP 3: Years Calculation
        // ============================================
        console.log('🔍🔍🔍 DEBUG STEP 3: Years Calculation');
        console.log('📌 Raw experiences:', userData?.experiences);
        console.log('📌 Calculated years:', years);
        
        // ✅ CHECK: Is this a fresher?
        const experiences = userData?.experiences || [];
        const hasRealExperience = experiences.some((exp: any) => 
            exp.title?.trim() && 
            exp.company?.trim() && 
            exp.startDate?.trim() && 
            exp.endDate?.trim()
        );
        const isFresherStatus = !hasRealExperience || years < 1;
        
        // ============================================
        // 🔍 DEBUG STEP 4: Level Detection
        // ============================================
        console.log('🔍🔍🔍 DEBUG STEP 4: Level Detection');
        console.log('📌 hasRealExperience:', hasRealExperience);
        console.log('📌 isFresherStatus:', isFresherStatus);
        
        // ✅ Pass fresher info to getProfessionalSummary
        const level = isFresherStatus ? 'fresher' : getLevel(title, years);
        console.log('📌 Detected level:', level);
        
        const skills = userData?.skills ? userData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [];
        const educations = userData?.educations || [];
        
        // ============================================
        // 🔍 DEBUG STEP 5: Summary Generation Call
        // ============================================
        console.log('🔍🔍🔍 DEBUG STEP 5: Calling getProfessionalSummary');
        console.log('📌 Parameters:', {
            profession,
            level,
            years,
            title,
            company,
            skillsCount: skills.length,
            educationsCount: educations.length
        });
        
        let summary = getProfessionalSummary(
            profession, 
            level, 
            years, 
            title, 
            company,
            skills,
            educations
        );
        
        // ============================================
        // 🔍 DEBUG STEP 6: Final Summary
        // ============================================
        console.log('🔍🔍🔍 DEBUG STEP 6: Generated summary');
        console.log('📌 Summary:', summary);
        
        // ============================================
        // 🔍 DEBUG STEP 7: Fallback Check
        // ============================================
        if (!summary || (summary.includes('learning, growing, and contributing') && years > 2)) {
            console.log('🔍🔍🔍 DEBUG STEP 7: Using Fallback Summary');
            summary = generateFallbackSummary(title, level, company, years);
            console.log('📌 Fallback summary:', summary);
        } else {
            console.log('🔍🔍🔍 DEBUG STEP 7: No fallback needed');
        }
        
        // ============================================
        // ✅ FIX APPLIED HERE: STEP 8
        // ============================================
        // ✅ FIX: Sirf spelling mistakes fix karo, capitalization preserve karo
        // polishText() aur enhanceCVText() hata diya kyunke ye capitalization corrupt kar rahe hain
        // fixGrammar() only fixes spelling mistakes and preserves original capitalization
        // ============================================
        console.log('🔍🔍🔍 DEBUG STEP 8: Applying fix — using fixGrammar() instead of polishText() + enhanceCVText()');
        
        let fixed = fixGrammar(summary);
        console.log('📌 Fixed summary (capitalization preserved):', fixed);
        
        // ============================================
        // 🔍 DEBUG STEP 9: Final Output
        // ============================================
        console.log('🔍🔍🔍 DEBUG STEP 9: Final Output');
        console.log('📌 Final summary:', fixed);
        
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