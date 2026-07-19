// utils/sectionValidator/validators/projectsValidator.ts
// ============================================
// PROJECTS VALIDATOR
// ============================================

import { ProjectItem, SectionStatus } from '../../types/cvTypes';

export const validateProjectsSection = (projects: ProjectItem[]): SectionStatus => {
    const validProjects = projects.filter(p => p.name?.trim().length > 0);

    if (validProjects.length === 0) {
        return { isComplete: true, score: 100, weakPoints: [] };
    }

    let completed = 0;
    const total = validProjects.length * 4;

    validProjects.forEach(proj => {
        if (proj.name?.trim()) completed++;
        if (proj.tech?.trim()) completed++;
        if (proj.description?.trim().length > 30) completed++;
        if (proj.github?.trim()) completed++;
    });

    const score = Math.min(Math.round((completed / total) * 100), 100);
    return { isComplete: true, score, weakPoints: [] };
};