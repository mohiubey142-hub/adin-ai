import { useState, useEffect } from 'react';
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
import { SectionStatus } from '../types/cvTypes';

export const useValidation = (
    personalInfo: any,
    phoneNumber: string,
    selectedCountryCode: string,
    experiences: any[],
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
    };
};