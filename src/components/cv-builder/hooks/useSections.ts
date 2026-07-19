import { useState } from 'react';
import { 
    ExperienceItem, EducationItem, ProjectItem, 
    CertificationItem, LanguageItem, AchievementItem 
} from '../types/cvTypes';
import { 
    defaultExperience, defaultEducation, defaultProject, 
    defaultCertification, defaultLanguage, defaultAchievement 
} from '../constants/cvDefaults';

export const useSections = (initialData: any) => {
    // Experiences
    const [experiences, setExperiences] = useState<ExperienceItem[]>(
        initialData?.experiences || [{ ...defaultExperience }]
    );
    
    const addExperience = () => setExperiences([...experiences, { ...defaultExperience }]);
    const removeExperience = (i: number) => setExperiences(experiences.filter((_, idx) => idx !== i));
    const updateExperience = (i: number, field: keyof ExperienceItem, value: string) => {
        const updated = [...experiences];
        updated[i][field] = value;
        setExperiences(updated);
    };

    // Educations
    const [educations, setEducations] = useState<EducationItem[]>(
        initialData?.educations || [{ ...defaultEducation }]
    );
    
    const addEducation = () => setEducations([...educations, { ...defaultEducation }]);
    const removeEducation = (i: number) => setEducations(educations.filter((_, idx) => idx !== i));
    const updateEducation = (i: number, field: keyof EducationItem, value: string) => {
        const updated = [...educations];
        updated[i][field] = value;
        setEducations(updated);
    };

    // Projects
    const [projects, setProjects] = useState<ProjectItem[]>(
        initialData?.projects || [{ ...defaultProject }]
    );
    
    const addProject = () => setProjects([...projects, { ...defaultProject }]);
    const removeProject = (i: number) => setProjects(projects.filter((_, idx) => idx !== i));
    const updateProject = (i: number, field: keyof ProjectItem, value: string) => {
        const updated = [...projects];
        updated[i][field] = value;
        setProjects(updated);
    };

    // Certifications
    const [certifications, setCertifications] = useState<CertificationItem[]>(
        initialData?.certifications || [{ ...defaultCertification }]
    );
    
    const addCertification = () => setCertifications([...certifications, { ...defaultCertification }]);
    const removeCertification = (i: number) => setCertifications(certifications.filter((_, idx) => idx !== i));
    const updateCertification = (i: number, field: keyof CertificationItem, value: string) => {
        const updated = [...certifications];
        updated[i][field] = value;
        setCertifications(updated);
    };

    // Languages
    const [languages, setLanguages] = useState<LanguageItem[]>(
        initialData?.languages || [{ ...defaultLanguage }]
    );
    
    const addLanguage = () => setLanguages([...languages, { ...defaultLanguage }]);
    const removeLanguage = (i: number) => setLanguages(languages.filter((_, idx) => idx !== i));
    const updateLanguage = (i: number, field: keyof LanguageItem, value: string) => {
        const updated = [...languages];
        updated[i][field] = value;
        setLanguages(updated);
    };

    // Achievements
    const [achievements, setAchievements] = useState<AchievementItem[]>(
        initialData?.achievements || [{ ...defaultAchievement }]
    );
    
    const addAchievement = () => setAchievements([...achievements, { ...defaultAchievement }]);
    const removeAchievement = (i: number) => setAchievements(achievements.filter((_, idx) => idx !== i));
    const updateAchievement = (i: number, field: keyof AchievementItem, value: string) => {
        const updated = [...achievements];
        updated[i][field] = value;
        setAchievements(updated);
    };

    return {
        // Experiences
        experiences, setExperiences,
        addExperience, removeExperience, updateExperience,
        
        // Educations
        educations, setEducations,
        addEducation, removeEducation, updateEducation,
        
        // Projects
        projects, setProjects,
        addProject, removeProject, updateProject,
        
        // Certifications
        certifications, setCertifications,
        addCertification, removeCertification, updateCertification,
        
        // Languages
        languages, setLanguages,
        addLanguage, removeLanguage, updateLanguage,
        
        // Achievements
        achievements, setAchievements,
        addAchievement, removeAchievement, updateAchievement,
    };
};