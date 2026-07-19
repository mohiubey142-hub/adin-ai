import { useMemo } from 'react';
import {
    calculateAllScores,
    getCompletionPercentage,
    SectionScores
} from '../utils/scoreCalculators';
import { ExperienceItem, EducationItem, ProjectItem, LanguageItem, CertificationItem, AchievementItem } from '../../types/cvTypes';

interface UseCVScoresParams {
    personalInfo: any;
    phoneNumber: string;
    experiences: ExperienceItem[];
    educations: EducationItem[];
    projects: ProjectItem[];
    skills: string;
    languages: LanguageItem[];
    certifications: CertificationItem[];
    achievements: AchievementItem[];
    professionalSummary: string;
}

export const useCVScores = (params: UseCVScoresParams) => {
    const {
        personalInfo,
        phoneNumber,
        experiences,
        educations,
        projects,
        skills,
        languages,
        certifications,
        achievements,
        professionalSummary
    } = params;

    const sectionScores = useMemo<SectionScores>(() => {
        return calculateAllScores(
            personalInfo,
            phoneNumber,
            experiences,
            educations,
            projects,
            skills,
            languages,
            certifications,
            achievements,
            professionalSummary
        );
    }, [
        personalInfo,
        phoneNumber,
        experiences,
        educations,
        projects,
        skills,
        languages,
        certifications,
        achievements,
        professionalSummary
    ]);

    const completionPercentage = useMemo(() => {
        return getCompletionPercentage(sectionScores);
    }, [sectionScores]);

    const getSectionScore = (sectionName: keyof SectionScores): number => {
        return sectionScores[sectionName] || 0;
    };

    return {
        sectionScores,
        completionPercentage,
        getSectionScore
    };
};