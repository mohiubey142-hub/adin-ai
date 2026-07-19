import { PersonalInfo, ExperienceItem, EducationItem, ProjectItem, CertificationItem, LanguageItem, AchievementItem, SectionStatus } from '../../types/cvTypes';

export interface CVPreviewProps {
    personalInfo: PersonalInfo;
    phoneNumber: string;
    selectedCountryCode: string;
    professionalSummary: string;
    experiences: ExperienceItem[];
    educations: EducationItem[];
    projects: ProjectItem[];
    certifications: CertificationItem[];
    languages: LanguageItem[];
    achievements: AchievementItem[];
    skills: string;
    profilePhoto: string | null;
    template: 'modern' | 'classic' | 'minimal';
    atsScore: number;
    strength: { text: string; color: string; bg: string; icon: string };
    completionPercentage?: number;
    sectionStatuses?: Record<number, SectionStatus>;
}

export interface TemplateStyles {
    card: string;
    heading: string;
    name: string;
    title: string;
    contact: string;
    photoBorder: string;
    description: string;
}

export interface CircularProgressProps {
    score: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    icon?: string;
}

export interface StrengthDisplay {
    text: string;
    icon: string;
    colorClass: string;
}

export interface ATSBreakdown {
    keywords: number;
    structure: number;
    experience: number;
    skills: number;
    completeness: number;
}