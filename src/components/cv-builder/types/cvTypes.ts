// src/components/cv-builder/types/cvTypes.ts

import React from 'react';
import { countryCodes } from '../constants/cvDefaults';
import { getFullPhoneNumber } from '../utils/phoneValidation';

// ✅ EXPANDED: Template type with all 11 templates
export type TemplateType = 'modern' | 'classic' | 'minimal' | 'executive' | 'creative' | 'academic' | 'teal-curve' | 'standard' | 'corporate' | 'ats-pro';

// ✅ UPDATED: CVBuilderProps with initialTemplateId, onBackToHome, documentId, onBackToDocuments, onDocumentCreated
// ✅ NEW: onDownloadId, onSetPin (for BackupReminderPopup)
export interface CVBuilderProps {
    userId: string;
    initialTemplateId?: string;
    onBackToHome?: () => void;
    /** ✅ agar set ho to specific document load/save karo (multi-CV flow) */
    documentId?: string;
    /** ✅ My Documents par wapas jaane ke liye */
    onBackToDocuments?: () => void;
    /** ✅ NEW: Jab pehli baar document create ho (user ne meaningful data bhara) */
    onDocumentCreated?: (documentId: string) => void;
    /** ✅ NEW: Trigger download of user's backup ID (from BackupReminderPopup) */
    onDownloadId?: () => void;
    /** ✅ NEW: Trigger Set PIN modal (from BackupReminderPopup) */
    onSetPin?: () => void;
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
    jobLevel?: string;
    photo?: string;
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
    jobLevel?: string;
    isValid?: boolean;
    yearsOfExperience?: number;
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
    /**
     * ✅ NEW: user-provided free-form project information used ONLY as AI context
     * for bullet generation. It is a separate field from `description` so that
     * the AI Suggestor output (which merges into `description`) never overwrites
     * or is confused with the user's own project details.
     *
     * Optional for backward compatibility — old saved projects default to "".
     */
    details?: string;
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

// ✅ UPDATED: AchievementItem with shortDescription (AI context only)
export interface AchievementItem {
    id?: string;
    title: string;
    date?: string;
    /** ⚠️ AI-context only — NEVER rendered in CV/PDF/TXT. Helps Groq generate accurate bullets. */
    shortDescription?: string;
    /** ✅ Rendered in CV/PDF/TXT (AI-generated bullets) */
    description: string;
}

export interface SectionStatus {
    isComplete: boolean;
    score: number;
    weakPoints: string[];
}

export interface ExperienceValidationResult {
    isValid: boolean;
    years: number;
    expectedLevel: string;
    selectedLevel: string;
    message: string;
}

export type SummaryLevel = 'fresher' | 'junior' | 'mid' | 'senior' | 'manager' | 'director';

export interface SummaryVariables {
    years: number;
    company: string;
    title: string;
    skills: string[];
    degree: string;
    institution: string;
    graduationYear: string;
    profession: string;
    isFresher: boolean;
}

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
    theme?: TemplateType;
    profilePhoto?: string | null;
}