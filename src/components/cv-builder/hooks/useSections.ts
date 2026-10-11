// src/components/cv-builder/hooks/useSections.ts
// =====================================================
// ✅ OPTIMIZED: Saare functions useCallback mein wrap
// ✅ OPTIMIZED: Immutable updates (no mutation)
// ✅ OPTIMIZED: Stable function references (kam re-renders)
// ✅ KICKRESUME STYLE: Fast typing, no jank
// =====================================================

import { useState, useCallback } from 'react';
import {
    ExperienceItem, EducationItem, ProjectItem,
    CertificationItem, LanguageItem, AchievementItem
} from '../types/cvTypes';
import {
    defaultExperience, defaultEducation, defaultProject,
    defaultCertification, defaultLanguage, defaultAchievement
} from '../constants/cvDefaults';

export const useSections = (initialData: any) => {
    // =====================================================
    // EXPERIENCES
    // =====================================================
    const [experiences, setExperiences] = useState<ExperienceItem[]>(
        initialData?.experiences || [{ ...defaultExperience }]
    );

    const addExperience = useCallback(() => {
        setExperiences(prev => [...prev, { ...defaultExperience }]);
    }, []);

    const removeExperience = useCallback((i: number) => {
        setExperiences(prev => prev.filter((_, idx) => idx !== i));
    }, []);

    const updateExperience = useCallback((i: number, field: keyof ExperienceItem, value: string) => {
        setExperiences(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], [field]: value };  // ✅ Immutable
            return updated;
        });
    }, []);

    // =====================================================
    // EDUCATIONS
    // =====================================================
    const [educations, setEducations] = useState<EducationItem[]>(
        initialData?.educations || [{ ...defaultEducation }]
    );

    const addEducation = useCallback(() => {
        setEducations(prev => [...prev, { ...defaultEducation }]);
    }, []);

    const removeEducation = useCallback((i: number) => {
        setEducations(prev => prev.filter((_, idx) => idx !== i));
    }, []);

    const updateEducation = useCallback((i: number, field: keyof EducationItem, value: string) => {
        setEducations(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], [field]: value };  // ✅ Immutable
            return updated;
        });
    }, []);

    // =====================================================
    // PROJECTS
    // =====================================================
    const [projects, setProjects] = useState<ProjectItem[]>(
        initialData?.projects || [{ ...defaultProject }]
    );

    const addProject = useCallback(() => {
        setProjects(prev => [...prev, { ...defaultProject }]);
    }, []);

    const removeProject = useCallback((i: number) => {
        setProjects(prev => prev.filter((_, idx) => idx !== i));
    }, []);

    const updateProject = useCallback((i: number, field: keyof ProjectItem, value: string) => {
        setProjects(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], [field]: value };  // ✅ Immutable
            return updated;
        });
    }, []);

    // =====================================================
    // CERTIFICATIONS
    // =====================================================
    const [certifications, setCertifications] = useState<CertificationItem[]>(
        initialData?.certifications || [{ ...defaultCertification }]
    );

    const addCertification = useCallback(() => {
        setCertifications(prev => [...prev, { ...defaultCertification }]);
    }, []);

    const removeCertification = useCallback((i: number) => {
        setCertifications(prev => prev.filter((_, idx) => idx !== i));
    }, []);

    const updateCertification = useCallback((i: number, field: keyof CertificationItem, value: string) => {
        setCertifications(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], [field]: value };  // ✅ Immutable
            return updated;
        });
    }, []);

    // =====================================================
    // LANGUAGES
    // =====================================================
    const [languages, setLanguages] = useState<LanguageItem[]>(
        initialData?.languages || [{ ...defaultLanguage }]
    );

    const addLanguage = useCallback(() => {
        setLanguages(prev => [...prev, { ...defaultLanguage }]);
    }, []);

    const removeLanguage = useCallback((i: number) => {
        setLanguages(prev => prev.filter((_, idx) => idx !== i));
    }, []);

    const updateLanguage = useCallback((i: number, field: keyof LanguageItem, value: string) => {
        setLanguages(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], [field]: value };  // ✅ Immutable
            return updated;
        });
    }, []);

    // =====================================================
    // ACHIEVEMENTS
    // =====================================================
    const [achievements, setAchievements] = useState<AchievementItem[]>(
        initialData?.achievements || [{ ...defaultAchievement }]
    );

    const addAchievement = useCallback(() => {
        setAchievements(prev => [...prev, { ...defaultAchievement }]);
    }, []);

    const removeAchievement = useCallback((i: number) => {
        setAchievements(prev => prev.filter((_, idx) => idx !== i));
    }, []);

    const updateAchievement = useCallback((i: number, field: keyof AchievementItem, value: string) => {
        setAchievements(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], [field]: value };  // ✅ Immutable
            return updated;
        });
    }, []);

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