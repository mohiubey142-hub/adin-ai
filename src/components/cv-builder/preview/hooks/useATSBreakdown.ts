import { useMemo } from 'react';
import { ATSBreakdown, StrengthDisplay } from '../types/previewTypes';
import { SectionScores } from '../utils/scoreCalculators';
import { ExperienceItem, EducationItem } from '../../types/cvTypes';

interface UseATSBreakdownParams {
    personalInfo: any;
    phoneNumber: string;
    professionalSummary: string;
    skills: string;
    experiences: ExperienceItem[];
    educations: EducationItem[];
    sectionScores: SectionScores;
}

export const useATSBreakdown = (params: UseATSBreakdownParams) => {
    const {
        personalInfo,
        phoneNumber,
        professionalSummary,
        skills,
        experiences,
        educations,
        sectionScores
    } = params;

    const breakdown = useMemo<ATSBreakdown>(() => {
        // Keywords calculation
        let keywords = 0;
        if (professionalSummary?.length > 50) keywords += 50;
        else if (professionalSummary?.length > 0) keywords += 25;
        
        const skillCount = skills ? (skills.includes(',') ? skills.split(',').length : skills.split('\n').length) : 0;
        if (skillCount >= 5) keywords += 50;
        else if (skillCount >= 3) keywords += 30;
        else if (skillCount >= 1) keywords += 15;
        keywords = Math.min(keywords, 100);
        
        // Structure calculation
        let structure = 0;
        if (personalInfo.name?.trim()) structure += 25;
        if (personalInfo.title?.trim()) structure += 25;
        if (personalInfo.email?.includes('@')) structure += 25;
        if (phoneNumber?.length >= 7) structure += 25;
        
        const completeness = Math.round(
            (sectionScores.Personal + sectionScores.Education + 
             sectionScores.Skills + sectionScores.Summary) / 4
        );
        
        return {
            keywords,
            structure,
            experience: sectionScores.Experience,
            skills: sectionScores.Skills,
            completeness
        };
    }, [personalInfo, phoneNumber, professionalSummary, skills, sectionScores]);

    const weightedAverage = useMemo(() => {
        return Math.round(
            (breakdown.keywords + breakdown.structure + 
             breakdown.experience + breakdown.skills + 
             breakdown.completeness) / 5
        );
    }, [breakdown]);

    const getStrengthDisplay = (score: number): StrengthDisplay => {
        if (score >= 90) return { text: 'Excellent', icon: '🏆', colorClass: 'text-green-400' };
        if (score >= 75) return { text: 'Very Good', icon: '🎯', colorClass: 'text-indigo-400' };
        if (score >= 60) return { text: 'Good', icon: '👍', colorClass: 'text-purple-400' };
        if (score >= 40) return { text: 'Fair', icon: '📈', colorClass: 'text-blue-400' };
        return { text: 'Needs Improvement', icon: '⚠️', colorClass: 'text-purple-300' };
    };

    const strengthDisplay = useMemo(() => {
        return getStrengthDisplay(weightedAverage);
    }, [weightedAverage]);

    const getWeakPoints = (): string[] => {
        const weakPoints: string[] = [];
        if (!personalInfo.name?.trim()) weakPoints.push("Full Name is required");
        if (!personalInfo.title?.trim()) weakPoints.push("Job Title is required");
        if (!personalInfo.email?.includes('@')) weakPoints.push("Valid Email is required");
        if (!phoneNumber || phoneNumber.length < 7) weakPoints.push("Phone number is required");
        
        const validEducations = educations.filter(edu => edu.degree?.trim() && edu.institution?.trim());
        if (validEducations.length === 0) weakPoints.push("Add at least one education entry");
        
        const skillCount = skills ? (skills.includes(',') ? skills.split(',').length : skills.split('\n').length) : 0;
        if (skillCount === 0) weakPoints.push("Add at least one skill");
        
        if (!professionalSummary || professionalSummary.length < 50) {
            weakPoints.push("Professional summary too short");
        }
        
        const validExperiences = experiences.filter(exp => exp.title?.trim() && exp.company?.trim());
        if (validExperiences.length === 0) weakPoints.push("Add work experience");
        
        return weakPoints.slice(0, 6);
    };

    const weakPoints = useMemo(() => getWeakPoints(), [
        personalInfo,
        phoneNumber,
        experiences,
        educations,
        skills,
        professionalSummary
    ]);

    return {
        breakdown,
        weightedAverage,
        strengthDisplay,
        weakPoints
    };
};