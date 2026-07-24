// src/components/cv-builder/types/cvTypes.ts

import React from 'react';
import { countryCodes } from '../constants/cvDefaults';
import { getFullPhoneNumber } from '../utils/phoneValidation';

// ✅ EXPANDED: Template type with all 6 templates
export type TemplateType = 'modern' | 'classic' | 'minimal' | 'executive' | 'creative' | 'academic';

// ✅ UPDATED: CVBuilderProps with initialTemplateId and onBackToHome
export interface CVBuilderProps {
    userId: string;
    initialTemplateId?: string;
    onBackToHome?: () => void;
}

// ✅ Personal Info with jobLevel
export interface PersonalInfo {
    name: string;
    title: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;
    github: string;
    portfolio: string;
    jobLevel?: string; // ✅ NEW: Junior, Mid, Senior
}

// ✅ Experience with validation fields
export interface ExperienceItem {
    id?: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    location?: string;
    currentlyWorking?: boolean;
    highlights?: string[];
    jobLevel?: string; // ✅ NEW: Junior, Mid, Senior
    isValid?: boolean; // ✅ NEW: Validation status
    yearsOfExperience?: number; // ✅ NEW: Calculated years
}

export interface EducationItem {
    id?: string;
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
    description: string;
    location?: string;
    currentlyStudying?: boolean;
    grade?: string;
    year?: string;
}

export interface ProjectItem {
    id?: string;
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    github?: string;
    startDate?: string;
    endDate?: string;
    tech?: string;
}

export interface CertificationItem {
    id?: string;
    name: string;
    issuer: string;
    date: string;
    link?: string;
    credentialId?: string;
}

export interface LanguageItem {
    id?: string;
    language: string;
    proficiency: string;
}

export interface AchievementItem {
    id?: string;
    title: string;
    description: string;
    date?: string;
}

export interface SectionStatus {
    isComplete: boolean;
    score: number;
    weakPoints: string[];
}

// ✅ NEW: Experience Level Validation Result
export interface ExperienceValidationResult {
    isValid: boolean;
    years: number;
    expectedLevel: string;
    selectedLevel: string;
    message: string;
}

// ✅ NEW: Experience Level Constants
export const EXPERIENCE_LEVELS = {
    JUNIOR: 'Junior',
    MID: 'Mid',
    SENIOR: 'Senior'
} as const;

export const EXPERIENCE_YEARS_RANGES = {
    [EXPERIENCE_LEVELS.JUNIOR]: { min: 0, max: 2 },
    [EXPERIENCE_LEVELS.MID]: { min: 3, max: 6 },
    [EXPERIENCE_LEVELS.SENIOR]: { min: 7, max: Infinity }
} as const;

export const EXPERIENCE_LEVEL_OPTIONS = [
    { value: 'Junior', label: 'Junior Level' },
    { value: 'Mid', label: 'Mid Level' },
    { value: 'Senior', label: 'Senior Level' },
];

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
    template: TemplateType;
    atsScore: number;
    strength: { text: string; color: string; bg: string; icon: string };
    completionPercentage?: number;
    sectionStatuses?: Record<number, SectionStatus>;
}

export interface PDFParams {
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
    template: TemplateType;
    profilePhoto?: string | null;
}