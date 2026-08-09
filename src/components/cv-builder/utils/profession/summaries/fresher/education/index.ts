// utils/profession/summaries/fresher/education/index.ts
// ============================================
// EDUCATION FRESHER TEMPLATES - Combined Exports
// ============================================

import { TEACHER_FRESHER } from './teacher.fresher';
import { PROFESSOR_FRESHER } from './professor.fresher';
import { PHYSICS_TEACHER_FRESHER } from './physicsTeacher.fresher';
import { CHEMISTRY_TEACHER_FRESHER } from './chemistryTeacher.fresher';
import { MATH_TEACHER_FRESHER } from './mathTeacher.fresher';
import { BIOLOGY_TEACHER_FRESHER } from './biologyTeacher.fresher';
import { ENGLISH_TEACHER_FRESHER } from './englishTeacher.fresher';
import { URDU_TEACHER_FRESHER } from './urduTeacher.fresher';
import { COMPUTER_TEACHER_FRESHER } from './computerTeacher.fresher';
import { ISLAMIC_STUDIES_TEACHER_FRESHER } from './islamicStudiesTeacher.fresher';
import { PAKISTAN_STUDIES_TEACHER_FRESHER } from './pakistanStudiesTeacher.fresher';
import { HISTORY_TEACHER_FRESHER } from './historyTeacher.fresher';

// ===== NEW IMPORT =====
import { LECTURER_FRESHER } from './lecturer.fresher';

export const EDUCATION_FRESHER_TEMPLATES: Record<string, string[]> = {
    teacher: TEACHER_FRESHER,
    professor: PROFESSOR_FRESHER,
    physicsTeacher: PHYSICS_TEACHER_FRESHER,
    chemistryTeacher: CHEMISTRY_TEACHER_FRESHER,
    mathTeacher: MATH_TEACHER_FRESHER,
    biologyTeacher: BIOLOGY_TEACHER_FRESHER,
    englishTeacher: ENGLISH_TEACHER_FRESHER,
    urduTeacher: URDU_TEACHER_FRESHER,
    computerTeacher: COMPUTER_TEACHER_FRESHER,
    islamicStudiesTeacher: ISLAMIC_STUDIES_TEACHER_FRESHER,
    pakistanStudiesTeacher: PAKISTAN_STUDIES_TEACHER_FRESHER,
    historyTeacher: HISTORY_TEACHER_FRESHER,
    
    // ===== NEW PROFESSION =====
    lecturer: LECTURER_FRESHER
};