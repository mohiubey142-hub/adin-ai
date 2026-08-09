// utils/profession/summaries/helpers.ts
// ============================================
// HELPERS - Deterministic Selection, Degree Info & Level Detection
// ============================================

import { detectSeniorityStrict } from '../seniorityDetector';

// ============================================
// HELPER: Deterministic Selection (No Random)
// ============================================
export const getDeterministicIndex = (profession: string, level: string, seed: string): number => {
    const combined = profession + level + seed;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash);
};

// ============================================
// HELPER: Get Degree from Educations
// ============================================
export const getDegreeInfo = (educations: any[]): { degree: string; institution: string; year: string } => {
    if (!educations || educations.length === 0) {
        return { degree: '', institution: '', year: '' };
    }
    const firstEdu = educations[0];
    return {
        degree: firstEdu.degree || '',
        institution: firstEdu.institution || '',
        year: firstEdu.year || firstEdu.endDate || ''
    };
};

// ============================================
// ✅ GET LEVEL - Uses strict detection (Title + Years)
// ============================================
export const getLevel = (title: string, years: number): string => {
    console.log('🔴🔴🔴 getLevel INPUT:', { title, years });
    const result = detectSeniorityStrict(title, years);
    console.log('🔴🔴🔴 getLevel RESULT:', result);
    return result;
};

// ============================================
// ✅ FIXED: GET YEARS - Supports "Jan 2022", "Present", "2022" formats
// ============================================
export const getYears = (experiences: any[]): number => {
    console.log('🔴🔴🔴 getYears INPUT:', experiences);
    
    if (!experiences || experiences.length === 0) {
        console.log('🔴🔴🔴 getYears: No experiences, returning 0');
        return 0;
    }
    
    // ✅ Month name to number mapping
    const monthMap: Record<string, number> = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
    };
    
    // ✅ Helper function to parse date string
    const parseDate = (dateStr: string): Date | null => {
        if (!dateStr) return null;
        
        const trimmed = dateStr.trim();
        
        // ✅ Check for "Present" or "Current"
        if (trimmed.toLowerCase() === 'present' || trimmed.toLowerCase() === 'current') {
            return new Date();
        }
        
        // ✅ Try normal Date parsing first
        let date = new Date(trimmed);
        if (!isNaN(date.getTime())) {
            return date;
        }
        
        // ✅ Try parsing "Jan 2022" format
        const parts = trimmed.split(' ');
        if (parts.length === 2) {
            const month = parts[0].toLowerCase().slice(0, 3);
            const year = parseInt(parts[1]);
            if (monthMap[month] !== undefined && !isNaN(year)) {
                return new Date(year, monthMap[month], 1);
            }
        }
        
        // ✅ Try parsing "2022" format (only year)
        if (parts.length === 1 && /^\d{4}$/.test(parts[0])) {
            return new Date(parseInt(parts[0]), 0, 1);
        }
        
        return null;
    };
    
    let totalMonths = 0;
    for (const exp of experiences) {
        console.log('🔴🔴🔴 getYears - experience:', { 
            title: exp.title, 
            startDate: exp.startDate, 
            endDate: exp.endDate 
        });
        
        if (exp.startDate && exp.endDate) {
            const start = parseDate(exp.startDate);
            const end = parseDate(exp.endDate);
            
            console.log('🔴🔴🔴 getYears - parsed:', { 
                start: start?.toString(), 
                end: end?.toString(),
                valid: start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())
            });
            
            if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                              (end.getMonth() - start.getMonth());
                console.log('🔴🔴🔴 getYears - months added:', months);
                totalMonths += Math.max(0, months);
            }
        }
    }
    
    const result = Math.floor(totalMonths / 12);
    console.log('🔴🔴🔴 getYears RESULT:', result);
    return result;
};

// ============================================
// ✅ FIXED: GET YEARS FOR CURRENT EXPERIENCE
// ============================================
export const getYearsForCurrentExp = (startDate: string, endDate: string): number => {
    if (!startDate) return 0;
    
    // ✅ Month name to number mapping
    const monthMap: Record<string, number> = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
    };
    
    // ✅ Helper function to parse date string
    const parseDate = (dateStr: string): Date | null => {
        if (!dateStr) return null;
        
        const trimmed = dateStr.trim();
        
        // ✅ Check for "Present" or "Current"
        if (trimmed.toLowerCase() === 'present' || trimmed.toLowerCase() === 'current') {
            return new Date();
        }
        
        // ✅ Try normal Date parsing first
        let date = new Date(trimmed);
        if (!isNaN(date.getTime())) {
            return date;
        }
        
        // ✅ Try parsing "Jan 2022" format
        const parts = trimmed.split(' ');
        if (parts.length === 2) {
            const month = parts[0].toLowerCase().slice(0, 3);
            const year = parseInt(parts[1]);
            if (monthMap[month] !== undefined && !isNaN(year)) {
                return new Date(year, monthMap[month], 1);
            }
        }
        
        // ✅ Try parsing "2022" format (only year)
        if (parts.length === 1 && /^\d{4}$/.test(parts[0])) {
            return new Date(parseInt(parts[0]), 0, 1);
        }
        
        return null;
    };
    
    const start = parseDate(startDate);
    const end = endDate ? parseDate(endDate) : new Date();
    
    if (!start || isNaN(start.getTime())) return 0;
    if (!end || isNaN(end.getTime())) return 0;
    
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