import toast from 'react-hot-toast';
import { 
    enhanceUserSkills, 
    detectProfession,
    generateDescriptionFromData,
    generateAISummary,
    generateAIExperienceBullets
} from '../utils/aiGenerators';
import { 
    aiEnhancerOptions 
} from '../constants/aiConfig';

// ============================================
// 8 AI ENHANCEMENT FUNCTIONS (Restored)
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
    }, 1200);
};

export const createAIActions = (
    personalInfo: any,
    experiences: any[],
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
    setGenerating: (generating: boolean) => void,
    setAiGenerating: (id: string | null) => void,
    setAiEnhancerLoading: (id: string | null) => void,
    setIsEnhancerUsed: (value: boolean) => void,
    setOriginalSummary: (summary: string) => void,
    originalSummary: string,
    isEnhancerUsed: boolean
) => {

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
        setGenerating(true);
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
            setGenerating(false);
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
        
        setGenerating(true);
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
            setGenerating(false);
        }, 1000);
    };

    // AI Generate Summary
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
            return;
        }

        setAiGenerating('summary');
        toast.loading(`Generating summary with AI...`, { id: 'ai-summary' });

        try {
            const profession = detectProfession(title);
            const years = getYears(experiences);
            const skillsArray = skills ? skills.split(',').map(s => s.trim()).filter(s => s) : [];
            
            const summary = await generateAISummary({
                jobTitle: title,
                company: personalInfo.company || '',
                years: years,
                profession: profession,
                skills: skillsArray,
                experiences: experiences
            });

            if (!originalSummary && !isEnhancerUsed) {
                setOriginalSummary(professionalSummary);
            }
            
            setProfessionalSummary(summary);
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
            // Fallback
            const desc = generateDescriptionFromData({
                type: 'summary',
                jobTitle: personalInfo.title,
                companyName: personalInfo.company || '',
                userData: { personalInfo, experiences, educations, projects, skills, certifications, achievements }
            });
            setProfessionalSummary(desc);
        }
        setAiGenerating(null);
    };

    // AI Generate Experience
    const handleAIGenerateExperience = async (index: number, exp: any) => {
        if (!exp.title.trim() || !exp.company.trim()) {
            toast.error('Please add job title and company first', {
                position: 'top-center',
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
            return;
        }

        setAiGenerating(`exp-${index}`);
        toast.loading(`Enhancing experience with AI...`, { id: `ai-exp-${index}` });

        try {
            const level = getLevel(exp.title, 0);
            const bullets = await generateAIExperienceBullets({
                title: exp.title,
                company: exp.company,
                description: exp.description,
                level: level
            });

            const updated = [...experiences];
            updated[index].description = bullets.join('\n');
            setExperiences(updated);

            toast.success('✅ Experience enhanced with AI!', {
                id: `ai-exp-${index}`,
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                }
            });
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
            // Fallback
            const desc = generateDescriptionFromData({
                type: 'experience',
                jobTitle: personalInfo.title,
                companyName: exp.company,
                currentStartDate: exp.startDate,
                currentEndDate: exp.endDate,
                userData: { personalInfo, experiences, educations, projects, skills, certifications, achievements }
            });
            const updated = [...experiences];
            updated[index].description = desc;
            setExperiences(updated);
        }
        setAiGenerating(null);
    };

    // Generate Description for field
    const generateDescriptionForField = async (type: 'experience' | 'project' | 'achievement' | 'summary', index?: number, currentData?: any) => {
        setGenerating(true);
        toast.loading(`Generating professional ${type} content...`, { id: 'desc' });
        
        setTimeout(() => {
            const generatedDesc = generateDescriptionFromData({
                type,
                jobTitle: personalInfo.title,
                companyName: type === 'experience' && currentData?.company,
                projectName: type === 'project' && currentData?.name,
                achievementTitle: type === 'achievement' && currentData?.title,
                currentStartDate: type === 'experience' && currentData?.startDate,
                currentEndDate: type === 'experience' && currentData?.endDate,
                userData: { personalInfo, experiences, educations, projects, skills, certifications, achievements }
            });
            
            if (type === 'summary') {
                setProfessionalSummary(generatedDesc);
            } else if (type === 'experience' && index !== undefined) {
                const updated = [...experiences];
                updated[index].description = generatedDesc;
                setExperiences(updated);
            } else if (type === 'project' && index !== undefined) {
                const updated = [...projects];
                updated[index].description = generatedDesc;
                setProjects(updated);
            } else if (type === 'achievement' && index !== undefined) {
                const updated = [...achievements];
                updated[index].description = generatedDesc;
                setAchievements(updated);
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
            setGenerating(false);
        }, 1500);
    };

    // ✅ AI ENHANCER - 8 Options (applyAIEnhancement)
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

    // Helper functions
    const getYears = (experiences: any[]): number => {
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

    const getLevel = (title: string, years: number): string => {
        const t = title.toLowerCase();
        if (t.includes('director') || t.includes('chief') || t.includes('head')) return 'director';
        if (t.includes('lead') || t.includes('manager')) return 'manager';
        if (t.includes('senior') || t.includes('sr')) return 'senior';
        if (t.includes('junior') || t.includes('jr')) return 'junior';
        if (years >= 7) return 'senior';
        if (years >= 3) return 'mid';
        return 'junior';
    };

    return {
        enhanceSkills,
        expandSkills,
        handleAIGenerateSummary,
        handleAIGenerateExperience,
        generateDescriptionForField,
        applyAIEnhancement,  // ✅ ADDED: AI Enhancer function
        getYears,
        getLevel
    };
};