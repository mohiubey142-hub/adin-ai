// ============================================
// SENIORITY DETECTOR - STRICT RULES (FIXED)
// ============================================

export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'manager' | 'director';

// ============================================
// BASE DETECTION (Title-based only)
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
    
    return 'mid';
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
// ✅ FIXED: STRICT DETECTION - Title + Years Both Check
// ============================================
export const detectSeniorityStrict = (jobTitle: string, yearsOfExperience: number): SeniorityLevel => {
    // First get title-based detection
    const titleBased = detectSeniority(jobTitle, yearsOfExperience);
    
    // Get years-based detection
    const yearsBased = getSeniorityFromYears(yearsOfExperience);
    
    // ============================================
    // ✅ FIX 1: "Senior" in title but years < 7 → DOWNGRADE
    // ============================================
    if (titleBased === 'senior' && yearsOfExperience < 7) {
        // 3-6 years → MID
        if (yearsOfExperience >= 3) {
            return 'mid';
        }
        // 0-2 years → JUNIOR
        return 'junior';
    }
    
    // ============================================
    // ✅ FIX 2: "Manager" in title but years < 5 → DOWNGRADE
    // ============================================
    if (titleBased === 'manager' && yearsOfExperience < 5) {
        // 3-4 years → MID
        if (yearsOfExperience >= 3) {
            return 'mid';
        }
        // 0-2 years → JUNIOR
        return 'junior';
    }
    
    // ============================================
    // ✅ FIX 3: "Director" in title but years < 7 → DOWNGRADE
    // ============================================
    if (titleBased === 'director' && yearsOfExperience < 7) {
        // 5-6 years → MANAGER
        if (yearsOfExperience >= 5) {
            return 'manager';
        }
        // 3-4 years → MID
        if (yearsOfExperience >= 3) {
            return 'mid';
        }
        // 0-2 years → JUNIOR
        return 'junior';
    }
    
    // ============================================
    // ✅ FIX 4: "Junior" in title but years >= 3 → UPGRADE
    // ============================================
    if (titleBased === 'junior' && yearsOfExperience >= 3) {
        // 7+ years → SENIOR
        if (yearsOfExperience >= 7) {
            return 'senior';
        }
        // 3-6 years → MID
        return 'mid';
    }
    
    // ============================================
    // ✅ FIX 5: "Specialist" or "Consultant" with low years
    // ============================================
    const t = jobTitle.toLowerCase();
    if ((t.includes('specialist') || t.includes('consultant')) && yearsOfExperience < 5) {
        // 3-4 years → MID
        if (yearsOfExperience >= 3) {
            return 'mid';
        }
        // 0-2 years → JUNIOR
        return 'junior';
    }
    
    // ============================================
    // DEFAULT: Use years-based detection
    // ============================================
    return yearsBased;
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
    console.log('====================================');
    
    const testCases = [
        { title: 'Senior Dentist', years: 4 },
        { title: 'Senior Software Engineer', years: 4 },
        { title: 'Senior Developer', years: 2 },
        { title: 'Senior Developer', years: 7 },
        { title: 'Senior Manager', years: 3 },
        { title: 'Senior Manager', years: 6 },
        { title: 'Senior Consultant', years: 3 },
        { title: 'Senior Specialist', years: 2 },
        { title: 'Senior Architect', years: 8 },
        { title: 'Product Manager', years: 3 },
        { title: 'Product Manager', years: 5 },
        { title: 'Product Manager', years: 2 },
        { title: 'Director of Engineering', years: 6 },
        { title: 'Director of Engineering', years: 8 },
        { title: 'Director of Engineering', years: 4 },
        { title: 'Junior Developer', years: 1 },
        { title: 'Junior Developer', years: 4 },
        { title: 'Junior Developer', years: 8 },
        { title: 'Software Engineer', years: 4 },
        { title: 'Software Engineer', years: 8 },
        { title: 'Software Engineer', years: 2 },
    ];
    
    console.log('📋 RESULTS:');
    console.log('------------------------------------');
    for (const test of testCases) {
        const result = detectSeniorityStrict(test.title, test.years);
        const label = getSeniorityLabel(result);
        console.log(`📌 ${test.title} (${test.years} yrs) → ${result} (${label})`);
    }
    console.log('====================================');
};