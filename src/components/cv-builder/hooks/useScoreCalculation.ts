// src/components/cv-builder/hooks/useScoreCalculation.ts
// =====================================================
// ✅ OPTIMIZED: Har function ab useMemo mein hai
// ✅ OPTIMIZED: Skills sirf ek baar parse hoti hai (pre-computed)
// ✅ OPTIMIZED: ATS breakdown + final scores memoized
// ✅ OPTIMIZED: Suggestions memoized
// ✅ OPTIMIZED: getScoreColor / getScoreBg useCallback
// =====================================================

import { useMemo, useCallback } from 'react';
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
    // ✅ STEP 1: Valid experiences filter (memoized)
    const validExperiencesForATS = useMemo(() => {
        return experiences.filter(exp => {
            if (!exp.jobLevel) return true;
            if (!exp.startDate || !exp.endDate) return true;
            return exp.isValid !== false;
        });
    }, [experiences]);

    // ✅ STEP 2: Skills parse ONCE (pehle har keystroke pe hoti thi)
    const skillsArray = useMemo(() => {
        if (!skills?.trim()) return [];
        return skills.includes(',')
            ? skills.split(',').map(s => s.trim()).filter(s => s)
            : skills.split('\n')
                .map(s => s.trim().replace(/^[•\-*]\s*/, ''))
                .filter(s => s);
    }, [skills]);

    // ✅ STEP 3: All 9 scores in ONE useMemo
    const realSectionScores = useMemo(() => {
        // --- Personal ---
        let personalScore = 0;
        if (personalInfo.name?.trim()) personalScore += 25;
        if (personalInfo.title?.trim()) personalScore += 25;
        if (personalInfo.email?.includes('@') && personalInfo.email?.includes('.')) personalScore += 25;
        if (phoneNumber?.trim().length >= 7) personalScore += 25;

        // --- Experience ---
        const validExp = validExperiencesForATS.filter(exp =>
            exp.title?.trim() && exp.company?.trim()
        );
        let experienceScore = 0;
        if (validExp.length > 0) {
            experienceScore = Math.min(validExp.length * 50, 100);
            const hasDescriptions = validExp.some(exp => exp.description?.trim().length > 20);
            if (hasDescriptions) experienceScore = Math.min(experienceScore + 20, 100);
        }

        // --- Education ---
        const validEdu = educations.filter(edu =>
            edu.degree?.trim() && edu.institution?.trim()
        );
        const educationScore = validEdu.length === 0 ? 0 : Math.min(validEdu.length * 50, 100);

        // --- Projects ---
        const validProj = projects.filter(proj => proj.name?.trim());
        let projectsScore = 0;
        if (validProj.length > 0) {
            projectsScore = Math.min(validProj.length * 33, 100);
            const hasDetails = validProj.some(proj =>
                (proj.description?.trim().length > 10) ||
                (proj.tech?.trim().length > 0)
            );
            if (hasDetails) projectsScore = Math.min(projectsScore + 20, 100);
        }

        // --- Skills (uses pre-parsed skillsArray) ---
        let skillsScore = 0;
        const skCount = skillsArray.length;
        if (skCount === 1) skillsScore = 20;
        else if (skCount === 2) skillsScore = 40;
        else if (skCount >= 3 && skCount <= 5) skillsScore = 70;
        else if (skCount >= 6) skillsScore = 100;

        // --- Summary ---
        let summaryScore = 0;
        if (professionalSummary?.trim()) {
            const len = professionalSummary.trim().length;
            if (len < 30) summaryScore = 30;
            else if (len < 60) summaryScore = 60;
            else if (len < 100) summaryScore = 80;
            else summaryScore = 100;
        }

        // --- Languages ---
        const validLang = languages.filter(l => l.language?.trim());
        const languagesScore = validLang.length === 0 ? 0 : Math.min(validLang.length * 35, 100);

        // --- Certifications ---
        const validCerts = certifications.filter(c => c.name?.trim());
        const certificationsScore = validCerts.length === 0 ? 0 : Math.min(validCerts.length * 34, 100);

        // --- Achievements ---
        const validAch = achievements.filter(a => a.title?.trim());
        const achievementsScore = validAch.length === 0 ? 0 : Math.min(validAch.length * 34, 100);

        return {
            Personal: personalScore,
            Experience: experienceScore,
            Education: educationScore,
            Projects: projectsScore,
            Skills: skillsScore,
            Summary: summaryScore,
            Languages: languagesScore,
            Certifications: certificationsScore,
            Achievements: achievementsScore,
        };
    }, [
        personalInfo,
        phoneNumber,
        validExperiencesForATS,
        educations,
        projects,
        skillsArray,
        languages,
        certifications,
        achievements,
        professionalSummary,
    ]);

    // ✅ STEP 4: ATS breakdown in useMemo
    const realBreakdown = useMemo(() => {
        // Keywords
        let keywords = 0;
        if (professionalSummary?.length > 50) keywords += 50;
        else if (professionalSummary?.length > 0) keywords += 25;

        const skillCount = skillsArray.length;
        if (skillCount >= 5) keywords += 50;
        else if (skillCount >= 3) keywords += 30;
        else if (skillCount >= 1) keywords += 15;
        keywords = Math.min(keywords, 100);

        // Structure
        let structure = 0;
        if (personalInfo.name?.trim()) structure += 25;
        if (personalInfo.title?.trim()) structure += 25;
        if (personalInfo.email?.includes('@')) structure += 25;
        if (phoneNumber?.length >= 7) structure += 25;

        // Completeness
        const completeness = Math.round(
            (realSectionScores.Personal +
                realSectionScores.Education +
                realSectionScores.Skills +
                realSectionScores.Summary) / 4
        );

        return {
            keywords,
            structure,
            experience: realSectionScores.Experience,
            skills: realSectionScores.Skills,
            completeness,
        };
    }, [professionalSummary, skillsArray, personalInfo, phoneNumber, realSectionScores]);

    // ✅ STEP 5: Final weighted average
    const realWeightedAverage = useMemo(() => {
        return Math.round(
            (realBreakdown.keywords +
                realBreakdown.structure +
                realBreakdown.experience +
                realBreakdown.skills +
                realBreakdown.completeness) / 5
        );
    }, [realBreakdown]);

    // ✅ STEP 6: Completion percentage
    const realCompletionPercentage = useMemo(() => {
        return Math.round(
            (realSectionScores.Personal +
                realSectionScores.Education +
                realSectionScores.Skills +
                realSectionScores.Summary) / 4
        );
    }, [realSectionScores]);

    // ✅ STEP 7: Quality rating
    const realQuality = useMemo(() => {
        if (realWeightedAverage >= 90) {
            return { text: 'Excellent', color: 'text-emerald-400', icon: '🌟' };
        }
        if (realWeightedAverage >= 70) {
            return { text: 'Very Good', color: 'text-blue-400', icon: '⭐' };
        }
        if (realWeightedAverage >= 50) {
            return { text: 'Good', color: 'text-yellow-400', icon: '👍' };
        }
        if (realWeightedAverage >= 30) {
            return { text: 'Needs Improvement', color: 'text-orange-400', icon: '📈' };
        }
        return { text: 'Needs Work', color: 'text-red-400', icon: '⚠️' };
    }, [realWeightedAverage]);

    // ✅ STEP 8: Suggestions memoized
    const realSuggestions = useMemo(() => {
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
    }, [
        personalInfo,
        phoneNumber,
        validExperiencesForATS,
        educations,
        projects,
        skills,
        professionalSummary,
        certifications,
        languages,
        achievements,
    ]);

    // ✅ STEP 9: Stable callbacks (useCallback — pehle naya function har render pe banta tha)
    const getScoreColor = useCallback((score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-blue-400';
        if (score >= 40) return 'text-yellow-400';
        return 'text-red-400';
    }, []);

    const getScoreBg = useCallback((score: number) => {
        if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
        if (score >= 60) return 'bg-blue-500/20 border-blue-500/30';
        if (score >= 40) return 'bg-yellow-500/20 border-yellow-500/30';
        return 'bg-red-500/20 border-red-500/30';
    }, []);

    return {
        realSectionScores,
        realBreakdown,
        realWeightedAverage,
        realCompletionPercentage,
        realQuality,
        realSuggestions,
        getScoreColor,
        getScoreBg,
    };
};