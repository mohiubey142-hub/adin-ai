// ============================================
// SENIORITY DETECTOR - STRICT RULES
// ============================================

export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'manager' | 'director';

// ============================================
// STRICT SENIORITY DETECTION
// ============================================
export const detectSeniority = (jobTitle: string, yearsOfExperience?: number): SeniorityLevel => {
    const t = jobTitle.toLowerCase();
    
    // ===== DIRECTOR / EXECUTIVE / C-LEVEL =====
    if (t.includes('director') || t.includes('vp') || t.includes('vice president') || 
        t.includes('chief') || t.includes('cto') || t.includes('ceo') || t.includes('cfo') ||
        t.includes('cmo') || t.includes('cso') || t.includes('head of') || 
        t.includes('executive') || t.includes('president') || t.includes('partner')) {
        return 'director';
    }
    
    // ===== MANAGER / LEAD / SUPERVISOR =====
    if (t.includes('manager') || t.includes('lead') || t.includes('team lead') || 
        t.includes('supervisor') || t.includes('principal') || t.includes('senior manager') ||
        t.includes('general manager') || t.includes('gm') || t.includes('assistant manager')) {
        return 'manager';
    }
    
    // ===== SENIOR =====
    if (t.includes('senior') || t.includes('sr') || t.includes('sr.') || 
        t.includes('architect') || t.includes('staff') || t.includes('expert') ||
        t.includes('specialist') || t.includes('consultant')) {
        return 'senior';
    }
    
    // ===== MID =====
    if (t.includes('mid') || t.includes('mid-level') || t.includes('associate') ||
        t.includes('professional') || t.includes('analyst')) {
        return 'mid';
    }
    
    // ===== JUNIOR / ENTRY =====
    if (t.includes('junior') || t.includes('jr') || t.includes('jr.') || 
        t.includes('entry') || t.includes('trainee') || t.includes('intern') ||
        t.includes('fresher') || t.includes('graduate') || t.includes('apprentice')) {
        return 'junior';
    }
    
    // ===== DETECT BY YEARS OF EXPERIENCE =====
    if (yearsOfExperience !== undefined && yearsOfExperience > 0) {
        if (yearsOfExperience >= 10) return 'director';
        if (yearsOfExperience >= 7) return 'senior';
        if (yearsOfExperience >= 3) return 'mid';
        if (yearsOfExperience >= 1) return 'junior';
        return 'junior';
    }
    
    // ===== DEFAULT =====
    // Agar kuch bhi match na ho toh "mid" return karo (safest option)
    return 'mid';
};

// ============================================
// GET SENIORITY LABEL (Human Readable)
// ============================================
export const getSeniorityLabel = (level: SeniorityLevel): string => {
    const map: Record<SeniorityLevel, string> = {
        'junior': 'Junior (0-2 years)',
        'mid': 'Mid-Level (3-6 years)',
        'senior': 'Senior (7-10 years)',
        'manager': 'Manager (5+ years)',
        'director': 'Director/Executive (10+ years)'
    };
    return map[level] || 'Mid-Level';
};

// ============================================
// GET SENIORITY YEARS RANGE
// ============================================
export const getSeniorityYears = (level: SeniorityLevel): { min: number; max: number } => {
    const map: Record<SeniorityLevel, { min: number; max: number }> = {
        'junior': { min: 0, max: 2 },
        'mid': { min: 3, max: 6 },
        'senior': { min: 7, max: 10 },
        'manager': { min: 5, max: 15 },
        'director': { min: 10, max: 99 }
    };
    return map[level] || { min: 3, max: 6 };
};

// ============================================
// IS SENIORITY LEVEL VALID
// ============================================
export const isValidSeniority = (level: string): level is SeniorityLevel => {
    return ['junior', 'mid', 'senior', 'manager', 'director'].includes(level);
};

// ============================================
// GET SENIORITY FROM YEARS
// ============================================
export const getSeniorityFromYears = (years: number): SeniorityLevel => {
    if (years >= 10) return 'director';
    if (years >= 7) return 'senior';
    if (years >= 3) return 'mid';
    if (years >= 1) return 'junior';
    return 'junior';
};

// ============================================
// DETECT SENIORITY WITH BOTH TITLE & YEARS
// ============================================
export const detectSeniorityStrict = (jobTitle: string, yearsOfExperience: number): SeniorityLevel => {
    // First try title-based detection
    const titleBased = detectSeniority(jobTitle, yearsOfExperience);
    
    // Then validate with years
    const yearsBased = getSeniorityFromYears(yearsOfExperience);
    
    // If title says "senior" but years are less than 3, downgrade
    if (titleBased === 'senior' && yearsOfExperience < 3) {
        return 'mid';
    }
    
    // If title says "director" but years are less than 7, downgrade
    if (titleBased === 'director' && yearsOfExperience < 7) {
        return 'senior';
    }
    
    // If title says "manager" but years are less than 3, downgrade
    if (titleBased === 'manager' && yearsOfExperience < 3) {
        return 'mid';
    }
    
    // If title says "junior" but years are more than 3, upgrade
    if (titleBased === 'junior' && yearsOfExperience >= 3) {
        return 'mid';
    }
    
    return titleBased;
};

// ============================================
// GET SENIORITY LEVEL NUMBER (For scoring)
// ============================================
export const getSeniorityScore = (level: SeniorityLevel): number => {
    const map: Record<SeniorityLevel, number> = {
        'junior': 1,
        'mid': 2,
        'senior': 3,
        'manager': 4,
        'director': 5
    };
    return map[level] || 2;
};

// ============================================
// TEST FUNCTION
// ============================================
export const testSeniorityDetector = (): void => {
    console.log('🧪 TESTING SENIORITY DETECTOR');
    
    const testCases = [
        { title: 'Senior Software Engineer', years: 8 },
        { title: 'Junior Developer', years: 1 },
        { title: 'Product Manager', years: 5 },
        { title: 'CTO', years: 12 },
        { title: 'Software Engineer', years: 4 },
        { title: 'Director of Engineering', years: 8 },
        { title: 'Team Lead', years: 6 },
        { title: 'Intern', years: 0 },
        { title: 'VP of Sales', years: 15 },
        { title: 'UX Designer', years: 3 }
    ];
    
    for (const test of testCases) {
        const result = detectSeniorityStrict(test.title, test.years);
        console.log(`📌 ${test.title} (${test.years} yrs) → ${result} (${getSeniorityLabel(result)})`);
    }
};