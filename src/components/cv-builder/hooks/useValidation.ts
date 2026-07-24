// src/components/cv-builder/hooks/useValidation.ts

import { useState, useEffect, useMemo } from 'react';
import { 
    validatePersonalSection,
    validateExperienceSection,
    validateEducationSection,
    validateProjectsSection,
    validateSkillsSection,
    validateCertificationsSection,
    validateLanguagesSection,
    validateAchievementsSection,
    validateSummarySection,
} from '../utils/sectionValidator';
import { validatePhoneNumber } from '../utils/phoneValidation';
import { SectionStatus, ExperienceItem, ExperienceValidationResult, EXPERIENCE_LEVELS } from '../types/cvTypes';

// ✅ Validate experience years
const validateExperienceYearsFn = (level: string, startDate: string, endDate: string): ExperienceValidationResult => {
    const defaultResult: ExperienceValidationResult = {
        isValid: true,
        years: 0,
        expectedLevel: '',
        selectedLevel: level,
        message: ''
    };

    if (!level || !startDate || !endDate) {
        return defaultResult;
    }

    const startYearMatch = startDate.match(/\d{4}/);
    const endYearMatch = endDate.match(/\d{4}/);

    if (!startYearMatch || !endYearMatch) {
        return defaultResult;
    }

    const startYear = parseInt(startYearMatch[0]);
    const endYear = parseInt(endYearMatch[0]);

    if (startYear > endYear) {
        return {
            ...defaultResult,
            isValid: false,
            years: 0,
            expectedLevel: '',
            selectedLevel: level,
            message: 'Start year cannot be after end year'
        };
    }

    const years = endYear - startYear;
    let expectedLevel = '';

    if (years <= 2) expectedLevel = EXPERIENCE_LEVELS.JUNIOR;
    else if (years >= 3 && years <= 6) expectedLevel = EXPERIENCE_LEVELS.MID;
    else if (years >= 7) expectedLevel = EXPERIENCE_LEVELS.SENIOR;

    const isValid = level === expectedLevel;

    const levelDisplayNames: Record<string, string> = {
        'Junior': 'Junior (0-2 years)',
        'Mid': 'Mid Level (3-6 years)',
        'Senior': 'Senior (7+ years)'
    };

    const expectedDisplay = levelDisplayNames[expectedLevel] || expectedLevel;

    return {
        isValid,
        years,
        expectedLevel,
        selectedLevel: level,
        message: isValid 
            ? `✓ ${years} years matches ${level} level`
            : `⚠ ${level} Level mismatch: ${years} years (Expected: ${expectedDisplay})`
    };
};

// ✅ Validate a single experience item
const validateExperienceItem = (exp: ExperienceItem): boolean => {
    if (!exp.jobLevel || !exp.startDate || !exp.endDate) {
        return true;
    }
    const result = validateExperienceYearsFn(exp.jobLevel, exp.startDate, exp.endDate);
    return result.isValid;
};

export const useValidation = (
    personalInfo: any,
    phoneNumber: string,
    selectedCountryCode: string,
    experiences: ExperienceItem[],
    educations: any[],
    projects: any[],
    skills: string,
    certifications: any[],
    languages: any[],
    achievements: any[],
    professionalSummary: string
) => {
    const [sectionStatuses, setSectionStatuses] = useState<Record<number, SectionStatus>>({});
    const [phoneError, setPhoneError] = useState('');
    const [errors, setErrors] = useState({ name: false, title: false, email: false, phone: false });
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // ✅ NEW: Validate all experiences
    const validatedExperiences = useMemo(() => {
        return experiences.map(exp => ({
            ...exp,
            isValid: validateExperienceItem(exp)
        }));
    }, [experiences]);

    // ✅ NEW: Check if all experiences are valid
    const areAllExperiencesValid = useMemo(() => {
        return validatedExperiences.every(exp => exp.isValid !== false);
    }, [validatedExperiences]);

    // ✅ NEW: Get only valid experiences for ATS
    const validExperiences = useMemo(() => {
        return validatedExperiences.filter(exp => exp.isValid !== false);
    }, [validatedExperiences]);

    // Phone validation
    useEffect(() => {
        const validation = validatePhoneNumber(phoneNumber, selectedCountryCode);
        setPhoneError(validation.isValid && phoneNumber ? '' : validation.message);
    }, [phoneNumber, selectedCountryCode]);

    // Check if required sections are complete
    const areRequiredSectionsComplete = (): boolean => {
        const personalStatus = validatePersonalSection(personalInfo, phoneNumber, selectedCountryCode);
        const educationStatus = validateEducationSection(educations);
        const skillsStatus = validateSkillsSection(skills);
        const summaryStatus = validateSummarySection(professionalSummary);
        
        return personalStatus.isComplete && educationStatus.isComplete && 
               skillsStatus.isComplete && summaryStatus.isComplete;
    };

    // Section statuses
    useEffect(() => {
        const personalStatus = validatePersonalSection(personalInfo, phoneNumber, selectedCountryCode);
        const experienceStatus = validateExperienceSection(experiences);
        const educationStatus = validateEducationSection(educations);
        const projectsStatus = validateProjectsSection(projects);
        const skillsStatus = validateSkillsSection(skills);
        const certificationsStatus = validateCertificationsSection(certifications);
        const languagesStatus = validateLanguagesSection(languages);
        const achievementsStatus = validateAchievementsSection(achievements);
        const summaryStatus = validateSummarySection(professionalSummary);
        
        setSectionStatuses({
            1: personalStatus,
            2: experienceStatus,
            3: educationStatus,
            4: languagesStatus,
            5: skillsStatus,
            6: certificationsStatus,
            7: projectsStatus,
            8: achievementsStatus,
            9: summaryStatus,
            10: { isComplete: areRequiredSectionsComplete(), score: 100, weakPoints: [] }
        });
    }, [personalInfo, phoneNumber, selectedCountryCode, experiences, educations, projects, skills, certifications, languages, achievements, professionalSummary]);

    // Validate current step
    const validateStep = (step: number): boolean => {
        const newErrors: string[] = [];
        const newFieldErrors = { name: false, title: false, email: false, phone: false };
        
        if (step === 1) {
            if (!personalInfo.name.trim()) { 
                newFieldErrors.name = true; 
                newErrors.push('Full Name is required'); 
            }
            if (!personalInfo.title.trim()) { 
                newFieldErrors.title = true; 
                newErrors.push('Job Title is required'); 
            }
            if (!personalInfo.email.trim()) { 
                newFieldErrors.email = true; 
                newErrors.push('Email is required'); 
            } else if (!personalInfo.email.includes('@') || !personalInfo.email.includes('.')) {
                newFieldErrors.email = true;
                newErrors.push('Please enter a valid email address');
            }
            const phoneValidation = validatePhoneNumber(phoneNumber, selectedCountryCode);
            if (!phoneNumber.trim()) { 
                newFieldErrors.phone = true; 
                newErrors.push('Phone number is required'); 
            } else if (!phoneValidation.isValid) { 
                newFieldErrors.phone = true; 
                newErrors.push(phoneValidation.message); 
            }
        }
        
        if (step === 3) {
            const validEducations = educations.filter(edu => edu.degree?.trim() && edu.institution?.trim());
            if (validEducations.length === 0) {
                newErrors.push('At least one complete education entry is required');
            }
        }
        
        if (step === 5) {
            const parseSkillsToArray = (skillsStr: string): string[] => {
                if (!skillsStr.trim()) return [];
                if (skillsStr.includes(',')) {
                    return skillsStr.split(',').map(s => s.trim()).filter(s => s);
                }
                return skillsStr.split('\n').map(s => s.trim().replace(/^[•\-*]\s*/, '')).filter(s => s);
            };
            if (parseSkillsToArray(skills).length < 1) {
                newErrors.push('Please add at least one skill');
            }
        }
        
        if (step === 9) {
            if (!professionalSummary.trim()) {
                newErrors.push('Professional Summary is required');
            } else if (professionalSummary.trim().length < 50) {
                newErrors.push('Professional Summary should be at least 50 characters');
            }
        }
        
        setErrors(newFieldErrors);
        setValidationErrors(newErrors);
        
        return newErrors.length === 0;
    };

    const clearValidationErrors = () => setValidationErrors([]);

    return {
        sectionStatuses,
        phoneError,
        errors,
        setErrors,
        validationErrors,
        setValidationErrors,
        clearValidationErrors,
        areRequiredSectionsComplete,
        validateStep,
        validatedExperiences,
        areAllExperiencesValid,
        validExperiences,
    };
};