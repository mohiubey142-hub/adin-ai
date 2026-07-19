// utils/professionDetector/detection/education.ts
// ============================================
// EDUCATION PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectEducation = (t: string): Profession | null => {
    // ===== SPECIFIC SUBJECT TEACHERS (Pehle check) =====
    if (t.includes('physics teacher')) return 'physics-teacher';
    if (t.includes('chemistry teacher')) return 'chemistry-teacher';
    if (t.includes('math teacher') || t.includes('mathematics')) return 'math-teacher';
    if (t.includes('biology teacher')) return 'biology-teacher';
    if (t.includes('english teacher')) return 'english-teacher';
    if (t.includes('urdu teacher')) return 'urdu-teacher';
    if (t.includes('computer teacher') || t.includes('cs teacher')) return 'computer-teacher';
    if (t.includes('islamic studies') || t.includes('islamiat')) return 'islamic-studies-teacher';
    if (t.includes('pakistan studies') || t.includes('pak studies')) return 'pakistan-studies-teacher';
    if (t.includes('history teacher')) return 'history-teacher';
    
    // ===== GENERAL EDUCATION (Baad me check) =====
    if (t.includes('professor') || t.includes('lecturer')) return 'professor';
    if (t.includes('principal') || t.includes('vice principal')) return 'principal';
    
    if (t.includes('teacher') || t.includes('instructor') || t.includes('educator') || 
        t.includes('school') || t.includes('faculty') || t.includes('teaching')) {
        return 'teacher';
    }
    
    return null;
};