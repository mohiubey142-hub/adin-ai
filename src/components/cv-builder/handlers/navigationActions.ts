import toast from 'react-hot-toast';
import { validatePersonalSection, validateEducationSection, validateSkillsSection } from '../utils/sectionValidator';

export const createNavigationActions = (
    step: number,
    setStep: (step: number) => void,
    setHasReachedPreview: (value: boolean) => void,
    personalInfo: any,
    phoneNumber: string,
    selectedCountryCode: string,
    educations: any[],
    skills: string,
    experiences: any[],
    hasReachedPreview: boolean,
    areRequiredSectionsComplete: () => boolean,
    validateStep: (step: number) => boolean
) => {
    
    const canNavigateToStep = (targetStep: number): boolean => {
        if (hasReachedPreview) return true;
        
        if (targetStep === 10) {
            const requiredComplete = areRequiredSectionsComplete();
            if (!requiredComplete) {
                toast.error('Please complete Personal, Education, Skills, and Summary sections first', { 
                    position: 'top-center',
                    style: {
                        background: '#1a1a2e',
                        color: '#fff',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                    }
                });
                return false;
            }
            return true;
        }
        
        if (targetStep > step) {
            if (targetStep > 1) {
                const personalStatus = validatePersonalSection(personalInfo, phoneNumber, selectedCountryCode);
                if (!personalStatus.isComplete) {
                    toast.error('Please complete Personal Information first', { 
                        position: 'top-center',
                        style: {
                            background: '#1a1a2e',
                            color: '#fff',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                        }
                    });
                    return false;
                }
            }
            if (targetStep > 3) {
                const educationStatus = validateEducationSection(educations);
                if (!educationStatus.isComplete) {
                    toast.error('Please complete Education section first', { 
                        position: 'top-center',
                        style: {
                            background: '#1a1a2e',
                            color: '#fff',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                        }
                    });
                    return false;
                }
            }
            if (targetStep > 5) {
                const skillsStatus = validateSkillsSection(skills);
                if (skillsStatus.score === 0) {
                    toast.error('Please add at least one skill first', { 
                        position: 'top-center',
                        style: {
                            background: '#1a1a2e',
                            color: '#fff',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                        }
                    });
                    return false;
                }
            }
        }
        
        return true;
    };

    const navigateToStep = (targetStep: number) => {
        if (canNavigateToStep(targetStep)) {
            setStep(targetStep);
        }
    };

    const nextStep = () => {
        if (validateStep(step)) {
            const next = Math.min(step + 1, 10);
            if (canNavigateToStep(next)) {
                setStep(next);
                if (next === 10) setHasReachedPreview(true);
            }
        }
    };
    
    const prevStep = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    return {
        canNavigateToStep,
        navigateToStep,
        nextStep,
        prevStep
    };
};