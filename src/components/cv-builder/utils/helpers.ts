// src/components/cv-builder/utils/helpers.ts
// ============================================
// HELPERS - Seniority Detection, Level Detection, etc.
// ============================================

import { detectSeniorityStrict } from './profession/seniorityDetector';

// ============================================
// ✅ GET LEVEL - Uses strict detection (Title + Years)
// ============================================
export const getLevel = (title: string, years: number): string => {
    // ✅ Uses detectSeniorityStrict which checks BOTH title AND years
    return detectSeniorityStrict(title, years);
};

// ============================================
// GET YEARS - From experiences array
// ============================================
export const getYears = (experiences: any[]): number => {
    if (!experiences || experiences.length === 0) return 0;
    
    let totalMonths = 0;
    for (const exp of experiences) {
        if (exp.startDate && exp.endDate) {
            const start = new Date(exp.startDate);
            const end = new Date(exp.endDate);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                              (end.getMonth() - start.getMonth());
                totalMonths += Math.max(0, months);
            }
        }
    }
    return Math.floor(totalMonths / 12);
};

// ============================================
// GET YEARS FOR CURRENT EXPERIENCE
// ============================================
export const getYearsForCurrentExp = (startDate: string, endDate: string): number => {
    if (!startDate) return 0;
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(start.getTime())) return 0;
    if (isNaN(end.getTime())) return 0;
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth());
    return Math.max(0, Math.floor(months / 12));
};

// ============================================
// NORMALIZE JOB TITLE
// ============================================
export const normalizeJobTitle = (title: string): string => {
    if (!title) return '';
    
    let normalized = title.trim().replace(/\s+/g, ' ');
    
    normalized = normalized
        .replace(/\bSr\.?\b/gi, 'Senior')
        .replace(/\bJr\.?\b/gi, 'Junior')
        .replace(/\bAssoc\.?\b/gi, 'Associate')
        .replace(/\bMgr\.?\b/gi, 'Manager')
        .replace(/\bDir\.?\b/gi, 'Director');
    
    return normalized;
};

// ============================================
// GENERATE SMART PROJECT DESCRIPTION
// ============================================
export const generateSmartProjectDescription = (projectName: string, tech: string): string => {
    const techStr = tech || 'modern technologies';
    return `Led the development of "${projectName}" using ${techStr}. Delivered a scalable, high-performance solution that improved user experience and operational efficiency.`;
};

// ============================================
// GENERATE SMART ACHIEVEMENT DESCRIPTION
// ============================================
export const generateSmartAchievementDescription = (achievementTitle: string): string => {
    return `Successfully achieved "${achievementTitle}" through strategic planning, cross-functional collaboration, and execution excellence.`;
};