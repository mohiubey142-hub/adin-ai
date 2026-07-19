// utils/fallback/guidedQAFallback.ts

import { SeniorityLevel } from '../seniorityDetector';

// ============================================
// ✅ EXPORT INTERFACES
// ============================================
export interface QAResponse {
  role: string;
  responsibilities: string;
  achievement: string;
  tools: string;
  impact: string;
}

export interface GeneratedContent {
  summary: string;
  bullets: string[];
  achievements: string[];
  skills: string[];
}

// ============================================
// GUIDED Q&A FALLBACK SYSTEM — PROFESSIONAL VERSION
// ============================================

export const generateSmartQuestions = (jobTitle: string): Array<{
  id: string;
  question: string;
  placeholder: string;
  options?: string[];
}> => {
  const title = jobTitle.toLowerCase();
  
  if (title.includes('engineer') || title.includes('developer') || title.includes('programmer')) {
    return [
      { id: 'role', question: 'What kind of software/systems do you build?', placeholder: 'e.g., Web apps, Mobile apps, APIs, Cloud infrastructure' },
      { id: 'responsibilities', question: 'What are your main technical responsibilities?', placeholder: 'e.g., Writing code, Designing architecture, Code reviews' },
      { id: 'achievement', question: 'What is your proudest technical achievement?', placeholder: 'e.g., Scaled system to 1M users, Reduced load time by 50%' },
      { id: 'tools', question: 'What technologies and tools do you use?', placeholder: 'e.g., React, Python, AWS, Docker, Git' },
      { id: 'impact', question: 'How does your work impact the business or users?', placeholder: 'e.g., Increased revenue, Improved user experience, Reduced costs' }
    ];
  }
  
  if (title.includes('teacher') || title.includes('professor') || title.includes('educator')) {
    return [
      { id: 'role', question: 'What subjects do you teach?', placeholder: 'e.g., Mathematics, Physics, English, Computer Science' },
      { id: 'responsibilities', question: 'What are your main teaching responsibilities?', placeholder: 'e.g., Lesson planning, Grading, Student mentoring' },
      { id: 'achievement', question: 'What is your proudest teaching achievement?', placeholder: 'e.g., Improved student grades by 30%, Won Best Teacher Award' },
      { id: 'tools', question: 'What teaching methods and tools do you use?', placeholder: 'e.g., Interactive whiteboard, Online platforms, Project-based learning' },
      { id: 'impact', question: 'How have you impacted your students\' lives?', placeholder: 'e.g., Inspired students to pursue STEM, Improved confidence' }
    ];
  }
  
  if (title.includes('doctor') || title.includes('physician') || title.includes('medical') || title.includes('nurse')) {
    return [
      { id: 'role', question: 'What is your medical specialty?', placeholder: 'e.g., General Medicine, Pediatrics, Surgery, Cardiology' },
      { id: 'responsibilities', question: 'What are your main clinical responsibilities?', placeholder: 'e.g., Patient diagnosis, Treatment planning, Surgery' },
      { id: 'achievement', question: 'What is your proudest medical achievement?', placeholder: 'e.g., Saved 50+ lives, Developed treatment protocol' },
      { id: 'tools', question: 'What medical tools and technologies do you use?', placeholder: 'e.g., EMR systems, Diagnostic equipment, Surgical instruments' },
      { id: 'impact', question: 'How have you impacted patient lives?', placeholder: 'e.g., Improved recovery rates, Reduced readmissions' }
    ];
  }
  
  if (title.includes('manager') || title.includes('director') || title.includes('lead')) {
    return [
      { id: 'role', question: 'What kind of team/department do you lead?', placeholder: 'e.g., Engineering team, Sales team, Operations department' },
      { id: 'responsibilities', question: 'What are your main leadership responsibilities?', placeholder: 'e.g., Team management, Strategic planning, Budget management' },
      { id: 'achievement', question: 'What is your proudest leadership achievement?', placeholder: 'e.g., Grew team from 10 to 50, Increased revenue by 40%' },
      { id: 'tools', question: 'What management tools and methodologies do you use?', placeholder: 'e.g., Agile, Jira, OKRs, Performance reviews' },
      { id: 'impact', question: 'How has your leadership impacted the organization?', placeholder: 'e.g., Improved efficiency, Reduced turnover, Increased profitability' }
    ];
  }
  
  return [
    { id: 'role', question: 'What is your current job title and what do you do?', placeholder: 'e.g., Software Engineer, Marketing Manager, School Teacher' },
    { id: 'responsibilities', question: 'What are your day-to-day responsibilities?', placeholder: 'e.g., Writing code, Managing projects, Teaching students' },
    { id: 'achievement', question: 'What is one achievement you are most proud of?', placeholder: 'e.g., Launched a successful product, Mentored 10 juniors' },
    { id: 'tools', question: 'What tools, software, or skills do you use?', placeholder: 'e.g., React, Excel, Public speaking, Leadership' },
    { id: 'impact', question: 'What impact do you make in your organization?', placeholder: 'e.g., Solved critical problems, Improved processes' }
  ];
};

export const generateFromAnswers = (
  answers: QAResponse,
  jobTitle: string,
  level: SeniorityLevel,
  company: string,
  years: number
): GeneratedContent => {
  const summary = generateProfessionalSummary(answers, jobTitle, level, company, years);
  const bullets = generateProfessionalBullets(answers, jobTitle, level, company);
  const achievements = generateProfessionalAchievements(answers, level);
  const skills = extractSkills(answers, jobTitle);
  return { summary, bullets, achievements, skills };
};

// ============================================
// ✅ PROFESSIONAL SUMMARY (No Diary/Emotion)
// ============================================
const generateProfessionalSummary = (
  answers: QAResponse,
  jobTitle: string,
  level: SeniorityLevel,
  company: string,
  years: number
): string => {
  const levelText = level === 'junior' ? 'Junior' : 
                    level === 'mid' ? 'Experienced' : 
                    level === 'senior' ? 'Senior' : 'Executive';
  const roleText = answers.role || jobTitle || 'professional';
  const impactText = answers.impact || 'delivering meaningful results';
  const achievementText = answers.achievement || 'consistently exceeding expectations';
  
  const templates = [
    `${levelText} ${roleText} with ${years}+ years of experience. Proven track record of ${answers.responsibilities?.toLowerCase() || 'delivering high-quality work'}. Key achievement: ${achievementText}. Committed to ${impactText} and creating value for the organization.`,
    
    `${levelText} professional with ${years} years of ${roleText} experience. Expertise in ${answers.responsibilities?.toLowerCase() || 'project delivery and team collaboration'}. ${achievementText} drives my approach. Skilled in ${answers.tools || 'modern tools and technologies'} with a focus on ${impactText}.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)]
    .replace(/\${years}/g, years.toString())
    .replace(/\${company}/g, company);
};

// ============================================
// ✅ PROFESSIONAL BULLETS (No Diary/Emotion)
// ============================================
const generateProfessionalBullets = (
  answers: QAResponse,
  jobTitle: string,
  level: SeniorityLevel,
  company: string
): string[] => {
  const bullets: string[] = [];
  const role = answers.role || jobTitle || 'professional';
  
  bullets.push(`• ${role} with ${answers.responsibilities?.toLowerCase() || 'comprehensive experience'} at ${company}`);
  
  if (answers.achievement) {
    bullets.push(`• ${answers.achievement}`);
  } else {
    bullets.push(`• Delivered measurable results and consistently exceeded expectations`);
  }
  
  if (answers.tools) {
    bullets.push(`• Proficient in ${answers.tools}`);
  } else {
    bullets.push(`• Developed expertise through continuous learning and hands-on experience`);
  }
  
  if (answers.impact) {
    bullets.push(`• ${answers.impact}`);
  } else {
    bullets.push(`• Made meaningful contributions to organizational success`);
  }
  
  bullets.push(`• Collaborated with cross-functional teams to achieve common goals`);
  
  return bullets;
};

// ============================================
// ✅ PROFESSIONAL ACHIEVEMENTS (No Diary/Emotion)
// ============================================
const generateProfessionalAchievements = (
  answers: QAResponse,
  level: SeniorityLevel
): string[] => {
  const achievements: string[] = [];
  
  if (answers.achievement) {
    achievements.push(`• ${answers.achievement}`);
  }
  
  if (level === 'junior') {
    achievements.push('• Recognized for learning new skills and contributing effectively');
    achievements.push('• Received positive feedback from team members and seniors');
  } else if (level === 'mid') {
    achievements.push('• Led initiatives that delivered significant results');
    achievements.push('• Mentored junior team members and contributed to their growth');
  } else if (level === 'senior') {
    achievements.push('• Led strategic initiatives that drove organizational growth');
    achievements.push('• Mentored teams and developed future leaders');
    achievements.push('• Recognized as a subject matter expert in the field');
  } else {
    achievements.push('• Led organizational transformation and drove excellence');
    achievements.push('• Built high-performing teams and developed leaders');
    achievements.push('• Recognized as an industry leader and thought expert');
  }
  
  return achievements;
};

// ============================================
// ✅ EXTRACT SKILLS (No Change)
// ============================================
const extractSkills = (answers: QAResponse, jobTitle: string): string[] => {
  const skills: string[] = [];
  const title = jobTitle.toLowerCase();
  
  if (answers.tools) {
    const toolList = answers.tools.split(',').map(t => t.trim());
    skills.push(...toolList);
  }
  
  if (title.includes('developer') || title.includes('engineer')) {
    if (!skills.some(s => s.toLowerCase().includes('communication'))) skills.push('Communication');
    if (!skills.some(s => s.toLowerCase().includes('problem'))) skills.push('Problem Solving');
    if (!skills.some(s => s.toLowerCase().includes('team'))) skills.push('Team Collaboration');
  }
  
  if (title.includes('teacher') || title.includes('professor')) {
    if (!skills.some(s => s.toLowerCase().includes('teaching'))) skills.push('Teaching');
    if (!skills.some(s => s.toLowerCase().includes('communication'))) skills.push('Communication');
    if (!skills.some(s => s.toLowerCase().includes('mentoring'))) skills.push('Mentoring');
  }
  
  if (title.includes('doctor') || title.includes('physician') || title.includes('nurse')) {
    if (!skills.some(s => s.toLowerCase().includes('clinical'))) skills.push('Clinical Skills');
    if (!skills.some(s => s.toLowerCase().includes('patient'))) skills.push('Patient Care');
    if (!skills.some(s => s.toLowerCase().includes('diagnosis'))) skills.push('Diagnosis');
  }
  
  if (title.includes('manager') || title.includes('director') || title.includes('lead')) {
    if (!skills.some(s => s.toLowerCase().includes('leadership'))) skills.push('Leadership');
    if (!skills.some(s => s.toLowerCase().includes('strategy'))) skills.push('Strategic Planning');
    if (!skills.some(s => s.toLowerCase().includes('management'))) skills.push('Team Management');
  }
  
  if (!skills.some(s => s.toLowerCase().includes('english'))) {
    skills.push('English Proficiency');
  }
  
  return [...new Set(skills)];
};

// ============================================
// ✅ GET LEVEL TEXT
// ============================================
const getLevelText = (level: SeniorityLevel): string => {
  const map: Record<SeniorityLevel, string> = {
    junior: 'Dedicated',
    mid: 'Experienced',
    senior: 'Senior',
    director: 'Strategic'
  };
  return map[level] || 'Dedicated';
};

// ============================================
// ✅ MAIN FUNCTION
// ============================================
export const generateCVFromQA = (
  answers: QAResponse,
  jobTitle: string,
  level: SeniorityLevel,
  company: string,
  years: number
): GeneratedContent => {
  return generateFromAnswers(answers, jobTitle, level, company, years);
};

// ============================================
// ✅ FALLBACK HELPERS
// ============================================

export const generateFallbackCV = (
  jobTitle: string,
  company: string = '',
  years: number = 3,
  level: SeniorityLevel = 'mid'
): GeneratedContent => {
  const answers: QAResponse = {
    role: jobTitle || 'Professional',
    responsibilities: 'delivering high-quality work and solving complex problems',
    achievement: 'consistently exceeding expectations and driving results',
    tools: 'modern tools, technologies, and best practices',
    impact: 'making meaningful contributions to organizational success'
  };
  return generateCVFromQA(answers, jobTitle, level, company, years);
};

export const generateFallbackBullets = (
  jobTitle: string,
  level: SeniorityLevel,
  company: string = ''
): string[] => {
  const answers: QAResponse = {
    role: jobTitle || 'Professional',
    responsibilities: 'delivering high-quality work and solving complex problems',
    achievement: 'consistently exceeding expectations and driving results',
    tools: 'modern tools, technologies, and best practices',
    impact: 'making meaningful contributions to organizational success'
  };
  return generateProfessionalBullets(answers, jobTitle, level, company);
};

export const generateFallbackSummary = (
  jobTitle: string,
  level: SeniorityLevel,
  company: string,
  years: number
): string => {
  const answers: QAResponse = {
    role: jobTitle || 'Professional',
    responsibilities: 'delivering high-quality work and solving complex problems',
    achievement: 'consistently exceeding expectations and driving results',
    tools: 'modern tools, technologies, and best practices',
    impact: 'making meaningful contributions to organizational success'
  };
  return generateProfessionalSummary(answers, jobTitle, level, company, years);
};

// ============================================
// ✅ TYPE EXPORTS
// ============================================
export type { QAResponse, GeneratedContent };