// utils/helpers/experienceHelpers.ts
// ============================================
// EXPERIENCE HELPERS
// ============================================

// Normalize job title
export const normalizeJobTitle = (title: string): string => {
    if (!title) return '';
    return title.trim();
};

// Seniority detection
export const getLevel = (title: string, years: number = 0): string => {
    const t = title.toLowerCase();
    
    if (t.includes('director') || t.includes('chief') || t.includes('head')) return 'director';
    if (t.includes('lead') || t.includes('manager')) return 'manager';
    if (t.includes('senior') || t.includes('sr')) return 'senior';
    if (t.includes('junior') || t.includes('jr')) return 'junior';
    
    if (years >= 11) return 'director';
    if (years >= 7) return 'senior';
    if (years >= 3) return 'mid';
    if (years >= 1) return 'junior';
    
    return 'junior';
};

// Calculate total years from all experiences
export const getYears = (experiences: any[]): number => {
    if (!experiences || experiences.length === 0) return 0;
    
    let totalYears = 0;
    const currentYear = new Date().getFullYear();
    
    for (const exp of experiences) {
        let startYear: number | null = null;
        let endYear: number | null = null;
        
        if (exp.startDate) {
            const startMatch = exp.startDate.match(/\d{4}/);
            if (startMatch) startYear = parseInt(startMatch[0]);
        }
        
        if (exp.endDate) {
            if (exp.endDate.toLowerCase() === 'present') {
                endYear = currentYear;
            } else {
                const endMatch = exp.endDate.match(/\d{4}/);
                if (endMatch) endYear = parseInt(endMatch[0]);
            }
        }
        
        if (startYear && endYear) {
            let years = endYear - startYear;
            if (years < 0) years = 0;
            totalYears += years;
        } else if (startYear && !endYear) {
            let years = currentYear - startYear;
            if (years < 0) years = 0;
            totalYears += years;
        }
    }
    
    return totalYears;
};

// Calculate years for a single experience entry
export const getYearsForCurrentExp = (startDate: string, endDate: string): number => {
    if (!startDate) return 0;
    
    const startMatch = startDate.match(/\d{4}/);
    if (!startMatch) return 0;
    
    const startYear = parseInt(startMatch[0]);
    let endYear: number;
    
    if (endDate && endDate.toLowerCase() === 'present') {
        endYear = new Date().getFullYear();
    } else if (endDate) {
        const endMatch = endDate.match(/\d{4}/);
        endYear = endMatch ? parseInt(endMatch[0]) : new Date().getFullYear();
    } else {
        endYear = new Date().getFullYear();
    }
    
    let years = endYear - startYear;
    if (years < 0) years = 0;
    if (years === 0) years = 1;
    
    return years;
};