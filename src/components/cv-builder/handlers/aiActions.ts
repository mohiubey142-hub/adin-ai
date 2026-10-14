// src/components/cv-builder/handlers/aiActions.ts

import toast from 'react-hot-toast';
import { 
    enhanceUserSkills, 
    detectProfession,
    generateDescriptionFromData,
    generateAISummary,
    generateAIExperienceBullets,
    generateAIProjectBullets,
    generateAIAchievementBullets,
    getYearsForCurrentExp
} from '../utils/aiGenerators';
import { isUnknownProfession } from '../utils/profession/detection';
import { detectSeniorityStrict } from '../utils/profession/seniorityDetector';
import { 
    aiEnhancerOptions 
} from '../constants/aiConfig';
import { ExperienceItem } from '../types/cvTypes';

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
// HELPER: Minimum Delay
// ============================================
const withMinimumDelay = async <T,>(
    promise: Promise<T>,
    minDelay: number = 3000
): Promise<T> => {
    const startTime = Date.now();
    const result = await promise;
    const elapsed = Date.now() - startTime;
    if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
    }
    return result;
};

// ============================================
// 8 AI ENHANCEMENT FUNCTIONS
// ============================================
const enhanceProfessional = (text: string): string => {
    return text
        .replace(/I'm/g, 'I am')
        .replace(/I've/g, 'I have')
        .replace(/I'd/g, 'I would')
        .replace(/thrilled/g, 'enthusiastic')
        .replace(/excited/g, 'interested')
        .replace(/super/g, 'very')
        .replace(/really/g, 'truly')
        .replace(/great/g, 'excellent')
        .replace(/good/g, 'strong');
};

const enhancePersuasive = (text: string): string => {
    return text
        .replace(/I have experience in/g, 'I bring proven expertise in')
        .replace(/I am skilled in/g, 'I excel at')
        .replace(/I can/g, 'I am capable of')
        .replace(/I want/g, 'I am committed to')
        .replace(/I think/g, 'I am confident that')
        .replace(/My skills include/g, 'My core strengths include');
};

const enhanceATS = (text: string): string => {
    return text
        .replace(/I have experience in/g, 'Demonstrated expertise in')
        .replace(/My skills include/g, 'Core competencies include')
        .replace(/I have worked on/g, 'Successfully delivered')
        .replace(/I am good at/g, 'Excel at')
        .replace(/I know/g, 'Proficient in')
        .replace(/I can/g, 'Able to');
};

const enhanceFormal = (text: string): string => {
    return text
        .replace(/I'm/g, 'I am')
        .replace(/I've/g, 'I have')
        .replace(/I'd/g, 'I would')
        .replace(/can't/g, 'cannot')
        .replace(/won't/g, 'will not')
        .replace(/don't/g, 'do not')
        .replace(/shouldn't/g, 'should not');
};

const enhanceHuman = (text: string): string => {
    return text
        .replace(/I have experience in/g, 'I have had the privilege of working in')
        .replace(/My skills include/g, 'What I truly enjoy is')
        .replace(/I am skilled in/g, 'I am passionate about')
        .replace(/I can/g, 'I love to')
        .replace(/I want/g, 'I am eager to')
        .replace(/I think/g, 'I believe');
};

const enhanceShorten = (text: string): string => {
    let shortened = text;
    const unnecessaryPhrases = [
        'I am writing to', 'I would like to', 'I want to', 
        'I think that', 'I believe that', 'In my opinion'
    ];
    for (const phrase of unnecessaryPhrases) {
        shortened = shortened.replace(new RegExp(phrase, 'gi'), '');
    }
    const words = shortened.split(' ');
    if (words.length > 30) {
        shortened = words.slice(0, 30).join(' ') + '...';
    }
    return shortened.replace(/\s+/g, ' ').trim();
};

const enhanceClosing = (text: string): string => {
    let enhanced = text;
    if (!enhanced.includes('contribute to your organization')) {
        enhanced = enhanced + ' I am confident that I can make a meaningful contribution to your organization.';
    }
    return enhanced;
};

const enhanceGrammar = (text: string): string => {
    return text
        .replace(/\s+/g, ' ')
        .replace(/ ,/g, ',')
        .replace(/ \./g, '.')
        .replace(/I have a degree in/g, 'I hold a degree in')
        .replace(/a experience/g, 'an experience')
        .replace(/a honor/g, 'an honor')
        .replace(/a MBA/g, 'an MBA')
        .trim();
};

// ============================================
// APPLY AI ENHANCEMENT - 8 Options
// ============================================
const applyAIEnhancementLogic = (
    professionalSummary: string,
    setProfessionalSummary: (summary: string) => void,
    setOriginalSummary: (summary: string) => void,
    setAiEnhancerLoading: (loading: string | null) => void,
    setIsEnhancerUsed: (used: boolean) => void,
    originalSummary: string,
    isEnhancerUsed: boolean,
    type: string
) => {
    if (!professionalSummary || professionalSummary.trim().length < 10) {
        toast.error('Please write a summary first (minimum 10 characters)', { 
            position: 'top-center',
            style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid rgba(239, 68, 68, 0.3)',
            }
        });
        return;
    }

    if (!isEnhancerUsed && !originalSummary) {
        setOriginalSummary(professionalSummary);
    }

    setAiEnhancerLoading(type);
    toast.loading(`Applying ${type} enhancement...`, { id: 'ai-enhancer' });
    
    setTimeout(() => {
        let enhancedText = professionalSummary;
        
        switch(type) {
            case 'professional':
                enhancedText = enhanceProfessional(professionalSummary);
                break;
            case 'persuasive':
                enhancedText = enhancePersuasive(professionalSummary);
                break;
            case 'ats':
                enhancedText = enhanceATS(professionalSummary);
                break;
            case 'formal':
                enhancedText = enhanceFormal(professionalSummary);
                break;
            case 'human':
                enhancedText = enhanceHuman(professionalSummary);
                break;
            case 'shorten':
                enhancedText = enhanceShorten(professionalSummary);
                break;
            case 'closing':
                enhancedText = enhanceClosing(professionalSummary);
                break;
            case 'grammar':
                enhancedText = enhanceGrammar(professionalSummary);
                break;
            default:
                enhancedText = professionalSummary;
        }
        
        setProfessionalSummary(enhancedText);
        setIsEnhancerUsed(true);
        const optionLabel = aiEnhancerOptions.find(o => o.id === type)?.label || type;
        toast.success(`✅ ${optionLabel} applied successfully!`, { 
            id: 'ai-enhancer', 
            position: 'top-center',
            duration: 3000,
            style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid rgba(168, 85, 247, 0.3)',
            }
        });
        setAiEnhancerLoading(null);
    }, 3000);
};

export const createAIActions = (
    personalInfo: any,
    experiences: ExperienceItem[],
    educations: any[],
    projects: any[],
    skills: string,
    certifications: any[],
    achievements: any[],
    professionalSummary: string,
    setProfessionalSummary: (summary: string) => void,
    setExperiences: (exp: any[]) => void,
    setSkills: (skills: string) => void,
    setProjects: (projects: any[]) => void,
    setAchievements: (achievements: any[]) => void,
    // ✅ FIX: ab boolean nahi — section-specific key ('summary', 'exp-0', 'proj-1', 'ach-0', 'skills')
    //    taake ek section ka Gen button dabane se baaki sections ke buttons loading na dikhayein.
    setGenerating: (value: string | null | ((prev: string | null) => string | null)) => void,
    setAiGenerating: (id: string | null) => void,
    setAiEnhancerLoading: (id: string | null) => void,
    setIsEnhancerUsed: (value: boolean) => void,
    setOriginalSummary: (summary: string) => void,
    originalSummary: string,
    isEnhancerUsed: boolean
) => {

    const canGenerateForExperience = (exp: ExperienceItem): boolean => {
        if (!exp.jobLevel || !exp.startDate || !exp.endDate) {
            return true;
        }
        return exp.isValid !== false;
    };

    // ✅ FIX: Section-specific loading helpers.
    //    start → apni key set karo. stop → sirf tab clear karo jab key abhi bhi wahi ho
    //    (taake agar doosra section beech mein start ho gaya ho to uski loading na toote).
    const startGenerating = (key: string) => setGenerating(key);
    const stopGenerating = (key: string) =>
        setGenerating(prev => (prev === key ? null : prev));

    // Skills Enhancement
    const enhanceSkills = () => {
        if (!skills.trim()) {
            toast.error('Please add some skills first', { 
                position: 'top-center',
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
            return;
        }
        startGenerating('skills');
        toast.loading('Enhancing your skills...', { id: 'skills' });
        
        setTimeout(() => {
            const enhancedSkills = enhanceUserSkills(skills, personalInfo.title);
            setSkills(enhancedSkills);
            toast.success('Skills enhanced!', { 
                id: 'skills', 
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                }
            });
            stopGenerating('skills');
        }, 800);
    };

    // Expand Skills
    const expandSkills = () => {
        const existingSkills = skills.includes(',') 
            ? skills.split(',').map(s => s.trim()).filter(s => s)
            : skills.split('\n').map(s => s.trim().replace(/^[•\-*]\s*/, '')).filter(s => s);
        
        if (existingSkills.length < 2) {
            toast.error('Please add at least 2 skills first', { 
                position: 'top-center',
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
            return;
        }
        
        startGenerating('skills');
        toast.loading('Analyzing your skills...', { id: 'skills' });
        
        setTimeout(() => {
            const lowerSkills = existingSkills.map(s => s.toLowerCase());
            const newSkills = [...existingSkills];
            const profession = detectProfession(personalInfo.title || '');
            
            const complementary: Record<string, string[]> = {
                marketing: ['SEO', 'Google Analytics', 'Content Strategy'],
                software: ['TypeScript', 'Git', 'REST APIs'],
                medical: ['Patient Communication', 'Medical Documentation', 'EMR Systems'],
                design: ['Figma', 'Adobe Creative Suite', 'Prototyping'],
                education: ['Lesson Planning', 'Student Assessment', 'Classroom Management'],
                sales: ['CRM', 'Negotiation', 'Lead Generation'],
                product: ['Product Strategy', 'Roadmap Planning', 'User Stories'],
                finance: ['Excel', 'Financial Analysis', 'Budgeting'],
                hr: ['Recruitment', 'Onboarding', 'Employee Relations'],
                general: ['Problem Solving', 'Communication', 'Team Collaboration']
            };
            
            const suggested = complementary[profession] || complementary.general;
            
            for (const skill of suggested) {
                if (!lowerSkills.includes(skill.toLowerCase()) && newSkills.length < 10) {
                    newSkills.push(skill);
                }
            }
            
            const uniqueSkills = [...new Map(newSkills.map(s => [s.toLowerCase(), s])).values()];
            const formattedSkills = skills.includes(',') 
                ? uniqueSkills.join(', ')
                : uniqueSkills.join('\n');
            
            setSkills(formattedSkills);
            toast.success(`Added ${uniqueSkills.length - existingSkills.length} complementary skills!`, { 
                id: 'skills', 
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                }
            });
            stopGenerating('skills');
        }, 1000);
    };

    // ✅ AI Generate Summary
    const handleAIGenerateSummary = async () => {
        const title = personalInfo.title;
        if (!title.trim()) {
            toast.error('Please add your job title first', {
                position: 'top-center',
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
            setAiGenerating(null);
            return;
        }

        setAiGenerating('summary');
        toast.loading(`Generating summary with AI...`, { id: 'ai-summary' });

        try {
            const profession = detectProfession(title);
            const years = getYears(experiences);
            const skillsArray = skills ? skills.split(',').map(s => s.trim()).filter(s => s) : [];
            
            const summary = await withMinimumDelay(
                generateAISummary({
                    jobTitle: title,
                    company: personalInfo.company || '',
                    years: years,
                    profession: profession,
                    skills: skillsArray,
                    experiences: experiences,
                    educations: educations
                }),
                3000
            );

            // ✅ SANITIZE: Level keywords remove karo (agar user ke title mein nahi hain)
            const sanitizedSummary = sanitizeSummaryTitle(summary, title);

            if (!originalSummary && !isEnhancerUsed) {
                setOriginalSummary(professionalSummary);
            }
            
            setProfessionalSummary(sanitizedSummary);
            setIsEnhancerUsed(true);
            
            toast.success('✅ AI Summary generated!', {
                id: 'ai-summary',
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                }
            });
        } catch (error) {
            toast.error('AI Summary failed. Using fallback.', {
                id: 'ai-summary',
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
            const desc = generateDescriptionFromData({
                type: 'summary',
                jobTitle: personalInfo.title,
                companyName: personalInfo.company || '',
                userData: { personalInfo, experiences, educations, projects, skills, certifications, achievements }
            });
            // ✅ SANITIZE fallback summary bhi
            const sanitizedDesc = sanitizeSummaryTitle(desc, personalInfo.title);
            setProfessionalSummary(sanitizedDesc);
        }
        setAiGenerating(null);
    };

    // ✅ AI Generate Experience — LEVEL-AWARE
    const handleAIGenerateExperience = async (index: number, exp: ExperienceItem) => {
        if (!canGenerateForExperience(exp)) {
            toast.error('Please fix the Experience Level mismatch before generating AI content.', {
                position: 'top-center',
                duration: 4000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
            setAiGenerating(null);
            return;
        }

        if (!exp.title.trim() || !exp.company.trim()) {
            toast.error('Please add job title and company first', {
                position: 'top-center',
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
            setAiGenerating(null);
            return;
        }

        setAiGenerating(`exp-${index}`);
        toast.loading(`Enhancing experience with AI...`, { id: `ai-exp-${index}` });

        try {
            const actualYears = getYearsForCurrentExp(exp.startDate || '', exp.endDate || '');
            const level = detectSeniorityStrict(exp.title, actualYears);
            
            console.log(`🎯 Experience level detected: ${level} (years: ${actualYears})`);
            
            const bullets = await withMinimumDelay(
                generateAIExperienceBullets({
                    title: exp.title,
                    company: exp.company,
                    description: exp.description,
                    level: level,
                    years: actualYears
                }),
                3000
            );

            toast.success('✅ Bullets generated! Pick as many as you like.', {
                id: `ai-exp-${index}`,
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                }
            });

            return bullets;
        } catch (error) {
            toast.error('AI enhancement failed. Using fallback.', {
                id: `ai-exp-${index}`,
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
            const desc = generateDescriptionFromData({
                type: 'experience',
                jobTitle: exp.title || personalInfo.title,
                companyName: exp.company,
                currentStartDate: exp.startDate,
                currentEndDate: exp.endDate,
                userData: { personalInfo, experiences, educations, projects, skills, certifications, achievements }
            });
            const updated = [...experiences];
            updated[index].description = desc;
            setExperiences(updated);
            return undefined;
        } finally {
            setAiGenerating(null);
        }
    };

    // ✅ AI Generate Project — Groq-powered (5 bullets, AI Suggestor modal)
    const handleAIGenerateProject = async (
        index: number,
        proj: any,
    ): Promise<string[] | undefined> => {
        if (!proj.name?.trim()) {
            toast.error('Please add project name first', {
                position: 'top-center',
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
            setAiGenerating(null);
            return undefined;
        }

        if (!proj.tech?.trim()) {
            toast.error('Please add Technologies / Tools Used first', {
                position: 'top-center',
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
            setAiGenerating(null);
            return undefined;
        }

        setAiGenerating(`proj-${index}`);
        toast.loading('Generating project bullets with AI...', { id: `ai-proj-${index}` });

        try {
            const bullets = await withMinimumDelay(
                generateAIProjectBullets({
                    projectName: proj.name,
                    tech: proj.tech || '',
                    description: proj.details || '',
                }),
                3000
            );

            console.log(
                `[aiActions] handleAIGenerateProject: generator returned ${bullets?.length ?? 0} bullets`
            );

            toast.success('✅ Project bullets generated! Pick up to 3 to add.', {
                id: `ai-proj-${index}`,
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                }
            });

            return bullets;
        } catch (error) {
            toast.error('AI generation failed. Using fallback.', {
                id: `ai-proj-${index}`,
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
            const desc = generateDescriptionFromData({
                type: 'project',
                jobTitle: proj.name,
                projectName: proj.name,
                userData: { personalInfo, experiences, educations, projects, skills, certifications, achievements }
            });
            const updated = [...projects];
            updated[index].description = desc;
            setProjects(updated);
            return undefined;
        } finally {
            setAiGenerating(null);
        }
    };

    // ✅ AI Generate Achievement — Groq-powered (3 bullets, shortDescription as AI context)
    const handleAIGenerateAchievement = async (index: number, ach: any) => {
        if (!ach.title?.trim()) {
            toast.error('Please add achievement title first', {
                position: 'top-center',
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
            setAiGenerating(null);
            return;
        }

        setAiGenerating(`ach-${index}`);
        toast.loading('Generating achievement bullets with AI...', { id: `ai-ach-${index}` });

        try {
            const bullets = await withMinimumDelay(
                generateAIAchievementBullets({
                    title: ach.title,
                    date: ach.date || '',
                    shortDescription: ach.shortDescription || ''
                }),
                3000
            );

            toast.success('✅ Achievement bullets generated! Pick up to 2.', {
                id: `ai-ach-${index}`,
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                }
            });

            return bullets;
        } catch (error) {
            toast.error('AI generation failed. Using fallback.', {
                id: `ai-ach-${index}`,
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
            const desc = generateDescriptionFromData({
                type: 'achievement',
                achievementTitle: ach.title,
                userData: { personalInfo, experiences, educations, projects, skills, certifications, achievements }
            });
            const updated = [...achievements];
            updated[index].description = desc;
            setAchievements(updated);
            return undefined;
        } finally {
            setAiGenerating(null);
        }
    };

    // ✅ Generate Description for field — LEVEL-AWARE
    const generateDescriptionForField = async (type: 'experience' | 'project' | 'achievement' | 'summary', index?: number, currentData?: any) => {
        if (type === 'experience' && currentData) {
            if (!canGenerateForExperience(currentData)) {
                toast.error('Please fix the Experience Level mismatch before generating AI content.', {
                    position: 'top-center',
                    duration: 4000,
                    style: {
                        background: '#1a1a2e',
                        color: '#fff',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                    }
                });
                return;
            }
        }

        // ✅ FIX: section-specific key — Summary page ke Summary button ke liye 'summary',
        //    baaki ke liye exp-/proj-/ach- + index (same keys jo AI handlers aiGenerating mein use karte hain)
        const genKey =
            type === 'summary'
                ? 'summary'
                : `${type === 'experience' ? 'exp' : type === 'project' ? 'proj' : 'ach'}-${index ?? 0}`;
        startGenerating(genKey);
        toast.loading(`Generating professional ${type} content...`, { id: 'desc' });
        
        // ✅ EXPERIENCE — Special handling
        if (type === 'experience' && index !== undefined && currentData) {
            try {
                const isUnknown = isUnknownProfession(currentData.title || '');
                const actualYears = getYearsForCurrentExp(currentData.startDate || '', currentData.endDate || '');
                const level = detectSeniorityStrict(currentData.title || '', actualYears);
                
                console.log(`🎯 Experience level: ${level} (years: ${actualYears})`);
                
                let generatedDesc: string;
                
                if (!isUnknown) {
                    console.log(`📋 Existing profession → using system bullets (level: ${level})`);
                    generatedDesc = await withMinimumDelay(
                        Promise.resolve(generateDescriptionFromData({
                            type: 'experience',
                            jobTitle: currentData.title || personalInfo.title,
                            companyName: currentData.company || '',
                            currentStartDate: currentData.startDate,
                            currentEndDate: currentData.endDate,
                            userData: { personalInfo, experiences, educations, projects, skills, certifications, achievements }
                        })),
                        3000
                    );
                } else {
                    console.log(`🔀 Unknown profession detected → using Groq (level: ${level})`);
                    const bullets = await withMinimumDelay(
                        generateAIExperienceBullets({
                            title: currentData.title || '',
                            company: currentData.company || '',
                            description: currentData.description || '',
                            level: level,
                            years: actualYears
                        }),
                        3000
                    );
                    generatedDesc = bullets.join('\n');
                }
                
                const updated = [...experiences];
                updated[index].description = generatedDesc;
                setExperiences(updated);
                
                toast.success('Content generated!', { 
                    id: 'desc', 
                    position: 'top-center',
                    duration: 3000,
                    style: {
                        background: '#1a1a2e',
                        color: '#fff',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                    }
                });
            } catch (error) {
                console.error('Experience generation failed:', error);
                toast.error('Failed to generate content', {
                    id: 'desc',
                    position: 'top-center',
                    duration: 3000,
                    style: {
                        background: '#1a1a2e',
                        color: '#fff',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                    }
                });
            }
            stopGenerating(genKey);
            return;
        }
        
        // ✅ PROJECT — Special handling (Groq-powered)
        if (type === 'project' && index !== undefined && currentData) {
            try {
                console.log('🔀 Project → using Groq (6-7 bullets)');
                const bullets = await withMinimumDelay(
                    generateAIProjectBullets({
                        projectName: currentData.name || '',
                        tech: currentData.tech || '',
                        description: currentData.description || ''
                    }),
                    3000
                );
                
                const updated = [...projects];
                updated[index].description = bullets.join('\n');
                setProjects(updated);
                
                toast.success('Content generated!', { 
                    id: 'desc', 
                    position: 'top-center',
                    duration: 3000,
                    style: {
                        background: '#1a1a2e',
                        color: '#fff',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                    }
                });
            } catch (error) {
                console.error('Project generation failed:', error);
                toast.error('Failed to generate content', {
                    id: 'desc',
                    position: 'top-center',
                    duration: 3000,
                    style: {
                        background: '#1a1a2e',
                        color: '#fff',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                    }
                });
            }
            stopGenerating(genKey);
            return;
        }
        
        // ✅ ACHIEVEMENT — Special handling (Groq-powered, 3 bullets, shortDescription context)
        if (type === 'achievement' && index !== undefined && currentData) {
            try {
                console.log('🔀 Achievement → using Groq (3 bullets)');
                const bullets = await withMinimumDelay(
                    generateAIAchievementBullets({
                        title: currentData.title || '',
                        date: currentData.date || '',
                        shortDescription: currentData.shortDescription || ''
                    }),
                    3000
                );
                
                const updated = [...achievements];
                updated[index].description = bullets.join('\n');
                setAchievements(updated);
                
                toast.success('Content generated!', { 
                    id: 'desc', 
                    position: 'top-center',
                    duration: 3000,
                    style: {
                        background: '#1a1a2e',
                        color: '#fff',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                    }
                });
            } catch (error) {
                console.error('Achievement generation failed:', error);
                toast.error('Failed to generate content', {
                    id: 'desc',
                    position: 'top-center',
                    duration: 3000,
                    style: {
                        background: '#1a1a2e',
                        color: '#fff',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                    }
                });
            }
            stopGenerating(genKey);
            return;
        }
        
        // ✅ OTHER TYPES (summary)
        const generateContent = async (): Promise<string> => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    let jobTitle = personalInfo.title;
                    let companyName = '';
                    
                    const generatedDesc = generateDescriptionFromData({
                        type,
                        jobTitle: jobTitle,
                        companyName: companyName,
                        userData: { personalInfo, experiences, educations, projects, skills, certifications, achievements }
                    });
                    resolve(generatedDesc);
                }, 1500);
            });
        };

        try {
            const generatedDesc = await withMinimumDelay(generateContent(), 3000);
            
            if (type === 'summary') {
                // ✅ SANITIZE: Level keywords remove karo
                const sanitizedDesc = sanitizeSummaryTitle(generatedDesc, personalInfo.title);
                setProfessionalSummary(sanitizedDesc);
            }
            
            toast.success('Content generated!', { 
                id: 'desc', 
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                }
            });
        } catch (error) {
            toast.error('Failed to generate content', {
                id: 'desc',
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
        }
        stopGenerating(genKey);
    };

    // ✅ AI ENHANCER
    const applyAIEnhancement = (type: string) => {
        applyAIEnhancementLogic(
            professionalSummary,
            setProfessionalSummary,
            setOriginalSummary,
            setAiEnhancerLoading,
            setIsEnhancerUsed,
            originalSummary,
            isEnhancerUsed,
            type
        );
    };

    // ✅ getYears
    const getYears = (experiences: ExperienceItem[]): number => {
        if (!experiences || experiences.length === 0) return 0;
        const currentYear = new Date().getFullYear();
        let totalYears = 0;
        for (const exp of experiences) {
            const startMatch = exp.startDate?.match(/\d{4}/);
            if (startMatch) {
                const startYear = parseInt(startMatch[0]);
                let endYear = currentYear;
                if (exp.endDate && exp.endDate.toLowerCase() !== 'present') {
                    const endMatch = exp.endDate.match(/\d{4}/);
                    if (endMatch) endYear = parseInt(endMatch[0]);
                }
                const years = endYear - startYear;
                if (years > 0) totalYears += years;
            }
        }
        return totalYears;
    };

    // ✅ getLevel — seniorityDetector se (single source of truth)
    const getLevel = (title: string, years: number): string => {
        return detectSeniorityStrict(title, years);
    };

    return {
        enhanceSkills,
        expandSkills,
        handleAIGenerateSummary,
        handleAIGenerateExperience,
        handleAIGenerateProject,
        handleAIGenerateAchievement,
        generateDescriptionForField,
        applyAIEnhancement,
        getYears,
        getLevel,
        canGenerateForExperience,
    };
};