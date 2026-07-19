import toast from 'react-hot-toast';
import { clearStorage } from '../utils/storageUtils';
import { 
    defaultPersonalInfo, defaultExperience, defaultEducation, 
    defaultProject, defaultCertification, defaultLanguage, defaultAchievement 
} from '../constants/cvDefaults';

export const createCVActions = (
    userId: string,
    setPersonalInfo: (info: any) => void,
    setProfessionalSummary: (summary: string) => void,
    setExperiences: (exp: any[]) => void,
    setEducations: (edu: any[]) => void,
    setSkills: (skills: string) => void,
    setProjects: (projects: any[]) => void,
    setCertifications: (certs: any[]) => void,
    setLanguages: (langs: any[]) => void,
    setAchievements: (achs: any[]) => void,
    setProfilePhoto: (photo: string | null) => void,
    setSelectedCountryCode: (code: string) => void,
    setPhoneNumber: (phone: string) => void,
    setStep: (step: number) => void,
    setTemplate: (template: 'modern' | 'minimal') => void,
    setHasReachedPreview: (value: boolean) => void,
    setShowSuccessCard: (value: boolean) => void,
    setErrors: (errors: any) => void,
    setValidationErrors: (errors: string[]) => void,
    setIsEnhancerUsed: (value: boolean) => void,
    setOriginalSummary: (summary: string) => void,
    professionalSummary: string,
    originalSummary: string,
    isEnhancerUsed: boolean
) => {

    const clearAllData = () => {
        if (window.confirm('Are you sure? This will clear ALL your CV data!')) {
            setPersonalInfo({ ...defaultPersonalInfo });
            setProfessionalSummary('');
            setExperiences([{ ...defaultExperience }]);
            setEducations([{ ...defaultEducation }]);
            setSkills('');
            setProjects([{ ...defaultProject }]);
            setCertifications([{ ...defaultCertification }]);
            setLanguages([{ ...defaultLanguage }]);
            setAchievements([{ ...defaultAchievement }]);
            setProfilePhoto(null);
            setSelectedCountryCode('PK');
            setPhoneNumber('');
            setStep(1);
            setTemplate('modern');
            setHasReachedPreview(false);
            setShowSuccessCard(false);
            setErrors({ name: false, title: false, email: false, phone: false });
            setValidationErrors([]);
            setIsEnhancerUsed(false);
            setOriginalSummary('');
            clearStorage(userId);
            
            toast.success('All CV data cleared successfully!', { 
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                }
            });
        }
    };

    const restoreOriginalSummary = () => {
        if (originalSummary) {
            setProfessionalSummary(originalSummary);
            setIsEnhancerUsed(false);
            toast.success('Original summary restored!', { 
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                }
            });
        } else {
            toast.error('No original summary to restore', { 
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
        }
    };

    const updatePersonalInfo = (field: string, value: string, setErrors: (errors: any) => void, errors: any) => {
        setPersonalInfo((prev: any) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev: any) => ({ ...prev, [field]: false }));
        }
    };

    const handlePhoneChange = (value: string, setErrors: (errors: any) => void, errors: any) => {
        setPhoneNumber(value);
        if (errors.phone) {
            setErrors((prev: any) => ({ ...prev, phone: false }));
        }
    };

    const handlePhotoUpload = (
        e: React.ChangeEvent<HTMLInputElement>, 
        setProfilePhoto: (photo: string | null) => void
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProfilePhoto(reader.result as string);
            reader.readAsDataURL(file);
            toast.success('Profile photo added', { 
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                }
            });
        }
    };

    return {
        clearAllData,
        restoreOriginalSummary,
        updatePersonalInfo,
        handlePhoneChange,
        handlePhotoUpload
    };
};