// ============================================
// SENIORITY DETECTOR - PERFECT (International Standards)
// ============================================
// 🎯 Years = PRIMARY source of truth
// 🎯 Title = SECONDARY (sirf 2 extreme exceptions)
// 🎯 Fresher = alag category (0 years)
// ============================================

export type SeniorityLevel =
    | 'fresher'
    | 'junior'
    | 'mid'
    | 'senior'
    | 'manager'
    | 'director';

// ============================================
// YEARS → LEVEL (Primary Source of Truth)
// ============================================
export const getSeniorityFromYears = (years: number): SeniorityLevel => {
    const y = Number.isFinite(years) ? Math.max(0, years) : 0;
    if (y >= 10) return 'director';
    if (y >= 7) return 'senior';
    if (y >= 3) return 'mid';
    if (y >= 1) return 'junior';
    return 'fresher';
};

// ============================================
// TITLE EXCEPTIONS (Sirf 2 Extreme Cases)
// ============================================
const TITLE_EXCEPTIONS: Array<{ match: RegExp; force: SeniorityLevel }> = [
    {
        match: /\b(intern|internship|trainee|apprentice)\b/i,
        force: 'fresher',
    },
    {
        match: /\b(ceo|cto|cfo|coo|cmo|cso|founder|co-founder|cofounder|president|owner|managing director|md)\b/i,
        force: 'director',
    },
];

// ============================================
// BASE DETECTION (Title-based — kept for backward compat)
// ============================================
export const detectSeniority = (
    jobTitle: string,
    yearsOfExperience?: number
): SeniorityLevel => {
    const t = (jobTitle || '').toLowerCase().trim();

    for (const ex of TITLE_EXCEPTIONS) {
        if (ex.match.test(t)) return ex.force;
    }

    if (yearsOfExperience !== undefined && yearsOfExperience > 0) {
        return getSeniorityFromYears(yearsOfExperience);
    }

    if (t.includes('director') || t.includes('vp') || t.includes('vice president') ||
        t.includes('chief') || t.includes('head of') || t.includes('executive')) {
        return 'director';
    }
    if (t.includes('manager') || t.includes('supervisor') ||
        t.includes('general manager') || t.includes('assistant manager')) {
        return 'manager';
    }
    if (t.includes('senior') || t.includes('sr') || t.includes('sr.') ||
        t.includes('architect') || t.includes('staff') || t.includes('expert') ||
        t.includes('specialist') || t.includes('consultant') || t.includes('principal') ||
        t.includes('lead')) {
        return 'senior';
    }
    if (t.includes('mid') || t.includes('mid-level') || t.includes('associate') ||
        t.includes('professional') || t.includes('analyst')) {
        return 'mid';
    }
    if (t.includes('junior') || t.includes('jr') || t.includes('jr.') ||
        t.includes('entry') || t.includes('graduate')) {
        return 'junior';
    }

    return 'fresher';
};

// ============================================
// ✅ STRICT DETECTION (Perfect — Years Primary)
// ============================================
export const detectSeniorityStrict = (
    jobTitle: string,
    yearsOfExperience: number
): SeniorityLevel => {
    const t = (jobTitle || '').toLowerCase().trim();

    for (const ex of TITLE_EXCEPTIONS) {
        if (ex.match.test(t)) return ex.force;
    }

    return getSeniorityFromYears(yearsOfExperience);
};

// ============================================
// LABEL (Human Readable)
// ============================================
export const getSeniorityLabel = (level: SeniorityLevel): string => {
    const map: Record<SeniorityLevel, string> = {
        'fresher': 'Fresher (0 years)',
        'junior': 'Junior (1-2 years)',
        'mid': 'Mid-Level (3-6 years)',
        'senior': 'Senior (7-9 years)',
        'manager': 'Manager',
        'director': 'Director/Executive (10+ years)',
    };
    return map[level] || 'Mid-Level';
};

// ============================================
// YEARS RANGE
// ============================================
export const getSeniorityYears = (
    level: SeniorityLevel
): { min: number; max: number } => {
    const map: Record<SeniorityLevel, { min: number; max: number }> = {
        'fresher': { min: 0, max: 0 },
        'junior': { min: 1, max: 2 },
        'mid': { min: 3, max: 6 },
        'senior': { min: 7, max: 9 },
        'manager': { min: 5, max: 15 },
        'director': { min: 10, max: 99 },
    };
    return map[level] || { min: 3, max: 6 };
};

// ============================================
// IS VALID
// ============================================
export const isValidSeniority = (level: string): level is SeniorityLevel => {
    return (
        ['fresher', 'junior', 'mid', 'senior', 'manager', 'director'] as string[]
    ).includes(level);
};

// ============================================
// SCORE (For sorting/filtering)
// ============================================
export const getSeniorityScore = (level: SeniorityLevel): number => {
    const map: Record<SeniorityLevel, number> = {
        'fresher': 0,
        'junior': 1,
        'mid': 2,
        'senior': 3,
        'manager': 4,
        'director': 5,
    };
    return map[level] ?? 2;
};

// ============================================
// TEST FUNCTION
// ============================================
export const testSeniorityDetector = (): void => {
    console.log('🧪 TESTING SENIORITY DETECTOR (PERFECT)');
    console.log('====================================');

    const testCases = [
        { title: 'Software Engineer', years: 0, expect: 'fresher' },
        { title: 'Senior Developer', years: 0, expect: 'fresher' },
        { title: 'Manager', years: 0, expect: 'fresher' },
        { title: 'Software Engineer', years: 1, expect: 'junior' },
        { title: 'Senior Developer', years: 2, expect: 'junior' },
        { title: 'Software Engineer', years: 3, expect: 'mid' },
        { title: 'Senior Developer', years: 5, expect: 'mid' },
        { title: 'Software Engineer', years: 7, expect: 'senior' },
        { title: 'Senior Developer', years: 8, expect: 'senior' },
        { title: 'Software Engineer', years: 10, expect: 'director' },
        { title: 'Intern', years: 5, expect: 'fresher' },
        { title: 'CEO', years: 2, expect: 'director' },
    ];

    let pass = 0;
    let fail = 0;

    for (const tc of testCases) {
        const result = detectSeniorityStrict(tc.title, tc.years);
        const ok = result === tc.expect;
        if (ok) pass++;
        else fail++;
        console.log(
            `${ok ? '✅' : '❌'} ${tc.title} (${tc.years} yrs) → ${result} ${
                ok ? '' : `(expected: ${tc.expect})`
            }`
        );
    }

    console.log('====================================');
    console.log(`✅ Pass: ${pass}  ❌ Fail: ${fail}`);
    console.log('====================================');
};