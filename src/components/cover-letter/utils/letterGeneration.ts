// src/components/cover-letter/utils/letterGeneration.ts
// =====================================================
// ✅ FINAL POLISH — Human fallback with realistic 3.5-4s loading delay
// ✅ BODY-ONLY OUTPUT: PDF template renders date/recipient/RE/greeting/signature.
// ✅ SILENT MODE: No toasts. Letter is the feedback.
// ✅ HUMAN FALLBACK: Specific, natural wording (250+ words).
// =====================================================

import toast from 'react-hot-toast';
import { generateCoverLetterWithAI, isGroqConfigured } from '../services/groqService';
import {
  extractSkillsList,
  formatSkillsForLetter,
  capitalizeWords,
} from './textHelpers';
import { canGenerate, isEducationValid, getEducationError } from './validation';

export const countWords = (text: string): number => {
  return text.split(/\s+/).filter(w => w.length > 0).length;
};

// ============================================================
// ===== NORMALIZE JOB TITLE =====
// ============================================================
const normalizeJobTitle = (title: string): string => {
  if (!title) return '';
  const corrections: Record<string, string> = {
    'software enginner': 'Software Engineer',
    'sotware engineer': 'Software Engineer',
    'software engenier': 'Software Engineer',
    'frontend developer': 'Frontend Developer',
    'front end developer': 'Frontend Developer',
    'backend developer': 'Backend Developer',
    'back end developer': 'Backend Developer',
    'full stack developer': 'Full Stack Developer',
    'fullstack developer': 'Full Stack Developer',
    'web developer': 'Web Developer',
    'mobile developer': 'Mobile Developer',
    'data analyst': 'Data Analyst',
    'data scientist': 'Data Scientist',
    'project manager': 'Project Manager',
    'product manager': 'Product Manager',
    'ui designer': 'UI Designer',
    'ux designer': 'UX Designer',
    'ui ux designer': 'UI/UX Designer',
    'graphic designer': 'Graphic Designer',
  };

  const lower = title.toLowerCase().trim();
  if (corrections[lower]) return corrections[lower];

  return title
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

// ============================================================
// ===== DETECT LEVEL =====
// ============================================================
const getLevel = (years?: number, title?: string): 'Fresher' | 'Mid-level' | 'Senior' => {
  const lowerTitle = (title || '').toLowerCase();
  const isSeniorTitle = /senior|lead|principal|head|manager|director|architect|vp|chief/.test(lowerTitle);
  const isFresherTitle = /junior|intern|trainee|graduate|entry|fresher/.test(lowerTitle);

  if (years && years >= 6) return 'Senior';
  if (isSeniorTitle && (!years || years >= 1)) return 'Senior';
  if (!years || years === 0) {
    if (isSeniorTitle) return 'Senior';
    return 'Fresher';
  }
  if (isFresherTitle) return 'Fresher';
  if (years >= 1 && years <= 5) return 'Mid-level';
  return 'Fresher';
};

// ============================================================
// ===== SKILLS PHRASING HELPERS =====
// ============================================================
const pickTopSkills = (skillsList: string[], max: number = 3): string[] => {
  if (skillsList.length <= max) return skillsList;
  return skillsList.slice(0, max);
};

const joinSkills = (skills: string[]): string => {
  if (skills.length === 0) return '';
  if (skills.length === 1) return skills[0];
  if (skills.length === 2) return `${skills[0]} and ${skills[1]}`;
  return `${skills.slice(0, -1).join(', ')}, and ${skills[skills.length - 1]}`;
};

// ============================================================
// ===== FALLBACK LETTER GENERATION (BODY-ONLY) =====
// ============================================================
export const generateFallbackLetter = (
  userName: string,
  jobTitle: string,
  company: string,
  experience: string,
  skills: string,
  education: string,
  projects: string,
  additionalInfo: string,
  currentPosition: string,
  setGeneratedLetter: (val: string) => void,
  setOriginalLetter: (val: string) => void,
  setIsEnhanced: (val: boolean) => void,
  setStep: (val: number) => void,
  hiringManagerName?: string,
  currentTitle?: string,
  currentCompany?: string,
  yearsOfExperience?: number,
  jobDescription?: string,
) => {
  const skillsList = extractSkillsList(skills);
  const formattedSkills = formatSkillsForLetter(skillsList);
  const formattedCompany = capitalizeWords(company);
  const formattedJobTitle = normalizeJobTitle(jobTitle);

  const level = getLevel(yearsOfExperience, currentTitle);
  const isFresher = level === 'Fresher';
  const hasCurrentRole = !!(currentTitle?.trim() || currentCompany?.trim());
  const hasSkills = formattedSkills && formattedSkills !== 'my skills' && skillsList.length > 0;

  const topSkills = hasSkills ? pickTopSkills(skillsList, 3) : [];
  const topSkillPhrase = topSkills.length > 0 ? joinSkills(topSkills) : '';

  // ============================================================
  // PARAGRAPH 1 — OPENING (~3 sentences)
  // ============================================================
  let opening = '';

  if (isFresher) {
    opening =
      `I came across the ${formattedJobTitle} opening at ${formattedCompany} and felt compelled to apply. ` +
      `I am at the beginning of my career, and this is exactly the kind of role I have been working toward. ` +
      `The opportunity to grow with ${formattedCompany} genuinely excites me.`;
  } else if (hasCurrentRole && currentTitle && currentCompany) {
    opening =
      `I am reaching out regarding the ${formattedJobTitle} opening at ${formattedCompany}. ` +
      `I currently work as a ${currentTitle} at ${currentCompany}, and I have been looking for a role that better matches where I want my career to go. ` +
      `This position feels like the right next step.`;
  } else if (hasCurrentRole && currentTitle) {
    opening =
      `I am reaching out regarding the ${formattedJobTitle} opening at ${formattedCompany}. ` +
      `As a ${currentTitle}, I have been keeping an eye out for a role like this one. ` +
      `The chance to contribute to ${formattedCompany} is something I would genuinely welcome.`;
  } else if (!isFresher && yearsOfExperience) {
    opening =
      `I am writing to apply for the ${formattedJobTitle} position at ${formattedCompany}. ` +
      `With ${yearsOfExperience} years of experience behind me, I have been looking for a role that offers both stability and room to grow. ` +
      `This opening caught my attention right away.`;
  } else {
    opening =
      `I am writing to apply for the ${formattedJobTitle} position at ${formattedCompany}. ` +
      `After reading about the role, I felt it was worth reaching out. ` +
      `I would welcome the opportunity to be part of your team.`;
  }

  // ============================================================
  // PARAGRAPH 2 — BACKGROUND & SKILLS (~4 sentences)
  // ============================================================
  let background = '';

  if (topSkills.length > 0) {
    if (isFresher) {
      background =
        `My foundation is built around ${topSkillPhrase}. ` +
        `I have spent time practicing these skills through small, focused projects, and I keep looking for ways to sharpen them. ` +
        `I enjoy the process of figuring things out — trying something, seeing what works, and adjusting from there. ` +
        `I am comfortable learning new tools and I pick things up quickly when I have a real problem to solve.`;
    } else if (hasCurrentRole && currentTitle) {
      background =
        `In my day-to-day work as a ${currentTitle}, I rely heavily on ${topSkillPhrase}. ` +
        `I have learned to balance hands-on work with clear communication, especially when timelines are tight. ` +
        `Most of what I know comes from doing the work itself — trying things, fixing what breaks, and improving as I go. ` +
        `I care about getting the details right and about leaving things better than I found them.`;
    } else {
      background =
        `Most of my experience has been built around ${topSkillPhrase}. ` +
        `I have learned to work steadily, communicate honestly, and approach each task with care. ` +
        `Over time, I have figured out how to manage my own work while staying aligned with the people around me. ` +
        `I take a measured approach — steady, careful, and focused on getting things done well.`;
    }
  } else {
    background =
      `I bring a strong work ethic, a willingness to learn, and a real interest in growing within this field. ` +
      `I pick up new tools and processes quickly, and I value doing steady, reliable work. ` +
      `I approach each task with care and I am always looking for small ways to improve. ` +
      `Wherever the team needs support, I am ready to step in.`;
  }

  // ============================================================
  // PARAGRAPH 3 — FIT & VALUE (~4 sentences)
  // ============================================================
  let fit = '';

  if (topSkills.length > 0) {
    const skillFocus = topSkills.length === 1
      ? `my background in ${topSkills[0]}`
      : `my background in ${joinSkills(topSkills)}`;

    fit =
      `What draws me to this role is the chance to bring ${skillFocus} to a team that values doing things well. ` +
      `I understand that every role has its own way of working, and I am ready to learn yours. ` +
      `I am not looking to reinvent anything on day one — I want to understand what the team needs, then contribute steadily from there. ` +
      `I would bring a calm, dependable presence and a real willingness to grow into the responsibilities over time.`;
  } else {
    fit =
      `What draws me to this role is the chance to contribute to a team that clearly cares about doing things well. ` +
      `I am ready to learn the specifics of the role and to grow into it with the right guidance. ` +
      `I am not looking to make big changes on day one — I want to understand the work first, then contribute where I can. ` +
      `I would bring a steady, focused, and dependable presence to the team.`;
  }

  // ============================================================
  // PARAGRAPH 4 — CLOSING (~3 sentences)
  // ============================================================
  const closing =
    `Thank you for taking the time to read my application. ` +
    `I would really value the chance to talk through how I can contribute to what ${formattedCompany} is building. ` +
    `I am available whenever it works for you, and I would be glad to continue the conversation.`;

  // ============================================================
  // ASSEMBLE — BODY ONLY
  // ============================================================
  let fullLetter = `${opening}

${background}

${fit}

${closing}`;

  fullLetter = fullLetter.replace(/\n{3,}/g, '\n\n').trim();

  const wordCount = fullLetter.split(/\s+/).filter(w => w.length > 0).length;
  console.log(`📊 Fallback letter word count: ${wordCount} (level: ${level})`);

  setGeneratedLetter(fullLetter);
  setOriginalLetter(fullLetter);
  setIsEnhanced(false);

  // ✅ Silent — no success toast
  toast.dismiss('cover');
  setStep(3);
};

// ============================================================
// ===== MAIN GENERATE LETTER FUNCTION =====
// ============================================================
interface GenerateLetterParams {
  userName: string;
  email: string;
  phoneNumber: string;
  education: string;
  jobTitle: string;
  company: string;
  experience: string;
  skills: string;
  projects: string;
  additionalInfo: string;
  selectedStyle: string;
  isPhoneValid: boolean;
  currentPosition?: string;
  hiringManagerName?: string;
  currentTitle?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  jobDescription?: string;
  setGenerating: (val: boolean) => void;
  setGeneratedLetter: (val: string) => void;
  setOriginalLetter: (val: string) => void;
  setIsEnhanced: (val: boolean) => void;
  setStep: (val: number) => void;
}

export const generateLetter = async (params: GenerateLetterParams) => {
  const {
    userName, email, phoneNumber, education,
    jobTitle, company, experience, skills, projects, additionalInfo,
    selectedStyle, isPhoneValid, currentPosition,
    hiringManagerName, currentTitle, currentCompany,
    yearsOfExperience, jobDescription,
    setGenerating, setGeneratedLetter, setOriginalLetter,
    setIsEnhanced, setStep
  } = params;

  console.log('🚀 generateLetter called with values:', {
    userName, jobTitle, company, experience, skills, education, projects,
    additionalInfo, currentPosition, hiringManagerName, currentTitle,
    currentCompany, yearsOfExperience, hasJobDescription: !!jobDescription,
  });

  const validationErrors: string[] = [];
  if (!userName) validationErrors.push('Name');
  if (!email || !email.includes('@gmail.com')) validationErrors.push('Valid Gmail');
  if (!phoneNumber) validationErrors.push('Phone');
  if (!isPhoneValid) validationErrors.push('Valid Phone');
  if (!jobTitle) validationErrors.push('Target Job Title');
  if (!company) validationErrors.push('Target Company');

  if (validationErrors.length > 0) {
    toast.error(`Please fill: ${validationErrors.join(', ')}`);
    return;
  }

  setGenerating(true);

  const groqAvailable = isGroqConfigured();

  // ============================================================
  // ✅ FIX: Realistic 3.5-4.2 sec delay before fallback letter
  // ============================================================
  // Random between 3500-4200ms → feels natural, like real AI thinking
  const FALLBACK_DELAY_MS = 3500 + Math.floor(Math.random() * 700);

  if (!groqAvailable) {
    console.log(`📝 API key not found. Using fallback template after ${FALLBACK_DELAY_MS}ms...`);
    setTimeout(() => {
      generateFallbackLetter(
        userName, jobTitle, company, experience, skills, education,
        projects, additionalInfo, currentPosition || '',
        setGeneratedLetter, setOriginalLetter, setIsEnhanced, setStep,
        hiringManagerName, currentTitle, currentCompany,
        yearsOfExperience, jobDescription,
      );
      setGenerating(false);
    }, FALLBACK_DELAY_MS);
    return;
  }

  // ✅ Silent — no loading toast. Button spinner is enough.
  try {
    const aiBody = await generateCoverLetterWithAI({
      userName, jobTitle, company, experience, skills, education,
      projects, additionalInfo, selectedStyle,
      hiringManagerName, currentTitle, currentCompany,
      yearsOfExperience, jobDescription,
    });

    let cleanedLetter = (aiBody || '').replace(/\n{3,}/g, '\n\n').trim();

    if (cleanedLetter && cleanedLetter.length > 50) {
      setGeneratedLetter(cleanedLetter);
      setOriginalLetter(cleanedLetter);
      setIsEnhanced(false);
      setStep(3);
    } else {
      throw new Error('AI returned empty response');
    }

  } catch (error) {
    console.error('AI generation error:', error);
    console.log(`⚠️ AI failed. Generating fallback after ${FALLBACK_DELAY_MS}ms...`);
    setTimeout(() => {
      generateFallbackLetter(
        userName, jobTitle, company, experience, skills, education,
        projects, additionalInfo, currentPosition || '',
        setGeneratedLetter, setOriginalLetter, setIsEnhanced, setStep,
        hiringManagerName, currentTitle, currentCompany,
        yearsOfExperience, jobDescription,
      );
      setGenerating(false);
    }, FALLBACK_DELAY_MS);
    return;
  }

  setGenerating(false);
};