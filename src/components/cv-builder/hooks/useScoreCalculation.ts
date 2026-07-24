// src/components/cv-builder/hooks/useScoreCalculation.ts

import { useMemo } from 'react';
import { ExperienceItem } from '../types/cvTypes';

export const useScoreCalculation = (
    personalInfo: any,
    phoneNumber: string,
    experiences: ExperienceItem[],
    educations: any[],
    projects: any[],
    skills: string,
    languages: any[],
    certifications: any[],
    achievements: any[],
    professionalSummary: string,
    selectedCountryCode: string
) => {
    // ✅ Filter out invalid experiences for ATS
    const validExperiencesForATS = useMemo(() => {
        return experiences.filter(exp => {
            // If no level selected, treat as valid
            if (!exp.jobLevel) return true;
            // If no dates, treat as valid
            if (!exp.startDate || !exp.endDate) return true;
            // Otherwise, check validation status
            return exp.isValid !== false;
        });
    }, [experiences]);

    const calculatePersonalScore = (): number => {
        let score = 0;
        if (personalInfo.name?.trim()) score += 25;
        if (personalInfo.title?.trim()) score += 25;
        if (personalInfo.email?.includes('@') && personalInfo.email?.includes('.')) score += 25;
        if (phoneNumber?.trim().length >= 7) score += 25;
        return score;
    };

    const calculateExperienceScore = (): number => {
        // ✅ Use only valid experiences for ATS
        const validExperiences = validExperiencesForATS.filter(exp => 
            exp.title?.trim() && exp.company?.trim()
        );
        if (validExperiences.length === 0) return 0;
        let score = Math.min(validExperiences.length * 50, 100);
        const hasDescriptions = validExperiences.some(exp => exp.description?.trim().length > 20);
        if (hasDescriptions && validExperiences.length >= 1) score = Math.min(score + 20, 100);
        return score;
    };

    const calculateEducationScore = (): number => {
        const validEducations = educations.filter(edu => 
            edu.degree?.trim() && edu.institution?.trim()
        );
        if (validEducations.length === 0) return 0;
        return Math.min(validEducations.length * 50, 100);
    };

    const calculateProjectsScore = (): number => {
        const validProjects = projects.filter(proj => proj.name?.trim());
        if (validProjects.length === 0) return 0;
        let score = Math.min(validProjects.length * 33, 100);
        const hasDetails = validProjects.some(proj => 
            (proj.description?.trim().length > 10) || 
            (proj.tech?.trim().length > 0)
        );
        if (hasDetails) score = Math.min(score + 20, 100);
        return score;
    };

    const calculateSkillsScore = (): number => {
        if (!skills?.trim()) return 0;
        const skillArray = skills.includes(',') 
            ? skills.split(',').map(s => s.trim()).filter(s => s)
            : skills.split('\n').map(s => s.trim().replace(/^[•\-*]\s*/, '')).filter(s => s);
        if (skillArray.length === 0) return 0;
        if (skillArray.length === 1) return 20;
        if (skillArray.length === 2) return 40;
        if (skillArray.length >= 3 && skillArray.length <= 5) return 70;
        if (skillArray.length >= 6) return 100;
        return 0;
    };

    const calculateSummaryScore = (): number => {
        if (!professionalSummary?.trim()) return 0;
        const length = professionalSummary.trim().length;
        if (length < 30) return 30;
        if (length < 60) return 60;
        if (length < 100) return 80;
        return 100;
    };

    const calculateLanguagesScore = (): number => {
        const validLanguages = languages.filter(l => l.language?.trim());
        if (validLanguages.length === 0) return 0;
        return Math.min(validLanguages.length * 35, 100);
    };

    const calculateCertificationsScore = (): number => {
        const validCerts = certifications.filter(c => c.name?.trim());
        if (validCerts.length === 0) return 0;
        return Math.min(validCerts.length * 34, 100);
    };

    const calculateAchievementsScore = (): number => {
        const validAchievements = achievements.filter(a => a.title?.trim());
        if (validAchievements.length === 0) return 0;
        return Math.min(validAchievements.length * 34, 100);
    };

    const realSectionScores = useMemo(() => ({
        Personal: calculatePersonalScore(),
        Experience: calculateExperienceScore(),
        Education: calculateEducationScore(),
        Projects: calculateProjectsScore(),
        Skills: calculateSkillsScore(),
        Summary: calculateSummaryScore(),
        Languages: calculateLanguagesScore(),
        Certifications: calculateCertificationsScore(),
        Achievements: calculateAchievementsScore()
    }), [personalInfo, phoneNumber, validExperiencesForATS, educations, projects, skills, languages, certifications, achievements, professionalSummary]);

    const getATSBreakdown = () => {
        let keywords = 0;
        if (professionalSummary?.length > 50) keywords += 50;
        else if (professionalSummary?.length > 0) keywords += 25;
        
        const skillCount = skills ? (skills.includes(',') ? skills.split(',').length : skills.split('\n').length) : 0;
        if (skillCount >= 5) keywords += 50;
        else if (skillCount >= 3) keywords += 30;
        else if (skillCount >= 1) keywords += 15;
        keywords = Math.min(keywords, 100);
        
        let structure = 0;
        if (personalInfo.name?.trim()) structure += 25;
        if (personalInfo.title?.trim()) structure += 25;
        if (personalInfo.email?.includes('@')) structure += 25;
        if (phoneNumber?.length >= 7) structure += 25;
        
        const completeness = Math.round((realSectionScores.Personal + realSectionScores.Education + realSectionScores.Skills + realSectionScores.Summary) / 4);
        
        return { 
            keywords, 
            structure, 
            experience: realSectionScores.Experience, 
            skills: realSectionScores.Skills, 
            completeness 
        };
    };

    const realBreakdown = getATSBreakdown();
    const realWeightedAverage = Math.round((realBreakdown.keywords + realBreakdown.structure + realBreakdown.experience + realBreakdown.skills + realBreakdown.completeness) / 5);
    const realCompletionPercentage = Math.round((realSectionScores.Personal + realSectionScores.Education + realSectionScores.Skills + realSectionScores.Summary) / 4);

    const getQualityRating = (score: number) => {
        if (score >= 90) return { text: 'Excellent', color: 'text-emerald-400', icon: '🌟' };
        if (score >= 70) return { text: 'Very Good', color: 'text-blue-400', icon: '⭐' };
        if (score >= 50) return { text: 'Good', color: 'text-yellow-400', icon: '👍' };
        if (score >= 30) return { text: 'Needs Improvement', color: 'text-orange-400', icon: '📈' };
        return { text: 'Needs Work', color: 'text-red-400', icon: '⚠️' };
    };

    const realQuality = getQualityRating(realWeightedAverage);

    const getImprovementSuggestions = (): string[] => {
        const suggestions: string[] = [];
        if (!personalInfo.name?.trim()) suggestions.push('Add your full name');
        if (!personalInfo.title?.trim()) suggestions.push('Add your job title');
        if (!personalInfo.email?.trim()) suggestions.push('Add your email address');
        if (!phoneNumber) suggestions.push('Add your phone number');
        
        const hasEducation = educations.some(e => e.degree?.trim() && e.institution?.trim());
        if (!hasEducation) suggestions.push('Add at least one education entry');
        
        const hasExperience = validExperiencesForATS.some(e => e.title?.trim() && e.company?.trim());
        if (!hasExperience) suggestions.push('Add work experience');
        
        if (!skills.trim()) suggestions.push('Add your skills');
        
        if (!professionalSummary?.trim() || professionalSummary.trim().length < 50) {
            suggestions.push('Write a detailed professional summary (minimum 50 characters)');
        }
        
        const hasProjects = projects.some(p => p.name?.trim() && p.description?.trim());
        if (!hasProjects) suggestions.push('Add projects to showcase your work');
        
        const hasCertifications = certifications.some(c => c.name?.trim());
        if (!hasCertifications) suggestions.push('Add certifications to boost credibility');
        
        const hasLanguages = languages.some(l => l.language?.trim() && l.proficiency?.trim());
        if (!hasLanguages) suggestions.push('Add languages you speak');
        
        const hasAchievements = achievements.some(a => a.title?.trim() && a.description?.trim());
        if (!hasAchievements) suggestions.push('Add achievements to highlight your successes');
        
        return suggestions;
    };

    return {
        realSectionScores,
        realBreakdown,
        realWeightedAverage,
        realCompletionPercentage,
        realQuality,
        realSuggestions: getImprovementSuggestions(),
        getScoreColor: (score: number) => {
            if (score >= 80) return 'text-emerald-400';
            if (score >= 60) return 'text-blue-400';
            if (score >= 40) return 'text-yellow-400';
            return 'text-red-400';
        },
        getScoreBg: (score: number) => {
            if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
            if (score >= 60) return 'bg-blue-500/20 border-blue-500/30';
            if (score >= 40) return 'bg-yellow-500/20 border-yellow-500/30';
            return 'bg-red-500/20 border-red-500/30';
        }
    };
};