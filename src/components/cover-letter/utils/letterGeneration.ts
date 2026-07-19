// src/components/cover-letter/utils/letterGeneration.ts

import toast from 'react-hot-toast';
import { generateCoverLetterWithAI, isGroqConfigured } from '../services/groqService';
import { 
  extractSkillsList, 
  formatSkillsForLetter, 
  capitalizeWords, 
  getRandomItem,
  getRandomInt 
} from './textHelpers';
import { getCompanyResearch } from './companyResearch';
import { canGenerate, isEducationValid, getEducationError } from './validation';

// ============================================================
// ===== COUNT WORDS =====
// ============================================================
export const countWords = (text: string): number => {
  return text.split(/\s+/).filter(w => w.length > 0).length;
};

// ============================================================
// ===== FALLBACK LETTER GENERATION =====
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
  currentPosition: string, // ✅ NEW
  setGeneratedLetter: (val: string) => void,
  setOriginalLetter: (val: string) => void,
  setIsEnhanced: (val: boolean) => void,
  setStep: (val: number) => void
) => {
  const skillsList = extractSkillsList(skills);
  const formattedSkills = formatSkillsForLetter(skillsList);
  const userProjects = projects?.trim() || '';
  const formattedJobTitle = capitalizeWords(jobTitle);
  const formattedCompany = capitalizeWords(company);
  const experienceText = experience || '';
  const additionalInfoText = additionalInfo || '';
  const currentPositionText = currentPosition?.trim() || '';

  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // ✅ Build current role description based on available info
  let currentRoleDescription = '';
  if (currentPositionText) {
    currentRoleDescription = `my current role at ${currentPositionText}`;
  } else if (experienceText) {
    // ✅ Extract industry from experience if possible
    const industryKeywords = ['banking', 'finance', 'technology', 'software', 'development', 'engineering', 'retail', 'healthcare', 'education'];
    let industryFound = '';
    for (const keyword of industryKeywords) {
      if (experienceText.toLowerCase().includes(keyword)) {
        industryFound = keyword;
        break;
      }
    }
    if (industryFound) {
      currentRoleDescription = `my career in ${industryFound}`;
    } else {
      currentRoleDescription = 'my professional career';
    }
  } else {
    currentRoleDescription = 'my professional career';
  }

  const introTemplates = [
    `I am excited to apply for the ${formattedJobTitle} position at ${formattedCompany}. With a strong background in ${experienceText || 'software engineering'} and a passion for solving complex problems, I am eager to bring my expertise to your team.`,
    `I am writing to express my strong interest in the ${formattedJobTitle} role at ${formattedCompany}. My experience in ${experienceText || 'technology'} has equipped me with the skills to make meaningful contributions to your organization.`,
    `The ${formattedJobTitle} position at ${formattedCompany} is an exciting opportunity that aligns with my professional goals. With my background in ${experienceText || 'software development'}, I am confident in my ability to add value to your team.`,
    `I am thrilled to apply for the ${formattedJobTitle} position at ${formattedCompany}. My journey in ${experienceText || 'technology'} has prepared me to take on challenges and deliver impactful results.`
  ];

  // ✅ NEW: Experience templates that NEVER assume target company as current employer
  const experienceTemplates = [
    `Throughout ${currentRoleDescription}, I have focused on delivering high-quality solutions. I have worked on ${userProjects || 'various projects'} that required ${formattedSkills || 'technical expertise and problem-solving'}. My approach combines technical excellence with a commitment to understanding user needs.`,
    `My professional experience includes ${experienceText || 'software development and project management'}. I have successfully ${userProjects || 'delivered multiple projects'} using ${formattedSkills || 'modern technologies'}. I take pride in writing clean, efficient code.`,
    `I bring ${experienceText || 'extensive experience'} in ${formattedSkills || 'full-stack development'}. My work on ${userProjects || 'challenging projects'} has taught me the importance of ${getRandomItem(['collaboration', 'innovation', 'quality', 'efficiency'])}.`,
    `With a strong foundation in ${experienceText || 'software engineering'}, I have developed ${formattedSkills || 'various technical skills'}. I have worked on ${userProjects || 'projects that made a difference'}, focusing on ${getRandomItem(['performance', 'usability', 'scalability', 'security'])}.`
  ];

  const companyResearch = getCompanyResearch(formattedCompany);
  const companyTemplates = [
    `I am particularly drawn to ${formattedCompany} because of its reputation for ${companyResearch}. I believe in ${getRandomItem(['continuous learning', 'innovation', 'teamwork', 'quality'])} and would be proud to contribute to your success.`,
    `${formattedCompany} stands out as a leader in ${companyResearch}. I share the company's values of ${getRandomItem(['innovation', 'excellence', 'integrity', 'collaboration'])} and am excited about the opportunity to join your team.`,
    `What attracts me to ${formattedCompany} is its commitment to ${companyResearch}. I am inspired by organizations that ${getRandomItem(['prioritize innovation', 'value employees', 'make a difference', 'deliver quality'])}.`,
    `I have long admired ${formattedCompany} for ${companyResearch}. The chance to work with talented professionals and contribute to ${getRandomItem(['meaningful projects', 'company growth', 'industry innovation', 'team success'])} excites me.`
  ];

  const qualitiesTemplates = [
    `Beyond technical skills, I bring ${additionalInfoText || 'strong communication and teamwork abilities'}. I am ${getRandomItem(['adaptable', 'detail-oriented', 'creative', 'collaborative'])} and committed to ${getRandomItem(['continuous improvement', 'delivering value', 'team success', 'quality outcomes'])}.`,
    `I am known for my ${additionalInfoText || 'dedication and work ethic'}. My approach to work is characterized by ${getRandomItem(['attention to detail', 'creative problem-solving', 'reliability', 'adaptability'])}, and I always strive to exceed expectations.`,
    `In addition to my professional experience, I offer ${additionalInfoText || 'strong interpersonal skills and a collaborative mindset'}. I believe in ${getRandomItem(['open communication', 'teamwork', 'continuous learning', 'quality work'])} and am always ready to help others succeed.`,
    `My work philosophy centers around ${additionalInfoText || 'delivering value and building relationships'}. I am ${getRandomItem(['dedicated', 'proactive', 'resourceful', 'enthusiastic'])} and take pride in ${getRandomItem(['solving problems', 'helping others', 'delivering results', 'improving processes'])}.`
  ];

  const closingTemplates = [
    `Thank you for considering my application. I would welcome the opportunity to discuss how my skills and experience can benefit ${formattedCompany}.`,
    `I appreciate your time and consideration. I am eager to discuss how I can contribute to the continued success of ${formattedCompany}.`,
    `Thank you for reviewing my application. I look forward to the possibility of joining ${formattedCompany} and contributing to your team.`,
    `I would be delighted to discuss my qualifications further. Thank you for considering me for this exciting opportunity at ${formattedCompany}.`
  ];

  const introText = getRandomItem(introTemplates);
  const experienceText2 = getRandomItem(experienceTemplates);
  const companyText = getRandomItem(companyTemplates);
  const qualitiesText = getRandomItem(qualitiesTemplates);
  const closingText = getRandomItem(closingTemplates);

  let fullLetter = `${currentDate}

Hiring Manager
${formattedCompany}

RE: Application for ${formattedJobTitle}

Dear Hiring Manager,

${introText}

${experienceText2}

${companyText}

${qualitiesText}

${closingText}`;

  fullLetter = fullLetter.replace(/\n{3,}/g, '\n\n');
  fullLetter = fullLetter.trim();

  const wordCount = fullLetter.split(/\s+/).filter(w => w.length > 0).length;
  console.log(`📊 Fallback letter word count: ${wordCount}`);

  if (wordCount > 300) {
    console.log('⚠️ Fallback exceeds 300 words, compressing...');
    
    const paragraphs = fullLetter.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    if (paragraphs.length > 7) {
      const headerParts = paragraphs.slice(0, 4);
      const bodyParts = paragraphs.slice(4, -1);
      const closingPart = paragraphs[paragraphs.length - 1];
      
      let compressedBody: string[] = [];
      if (bodyParts.length > 3) {
        const sorted = bodyParts.sort((a, b) => 
          b.split(/\s+/).filter(w => w.length > 0).length - 
          a.split(/\s+/).filter(w => w.length > 0).length
        );
        compressedBody = sorted.slice(0, 3);
      } else {
        compressedBody = bodyParts;
      }
      
      fullLetter = [...headerParts, ...compressedBody, closingPart].join('\n\n');
      
      const newWordCount = fullLetter.split(/\s+/).filter(w => w.length > 0).length;
      console.log(`📊 After fallback compression: ${newWordCount} words`);
    }
  }

  const finalWordCount = fullLetter.split(/\s+/).filter(w => w.length > 0).length;
  if (finalWordCount > 300) {
    const sentences = fullLetter.match(/[^.!?]+[.!?]+/g) || [fullLetter];
    let truncated = '';
    let count = 0;
    for (const sentence of sentences) {
      const sentenceWords = sentence.split(/\s+/).filter(w => w.length > 0).length;
      if (count + sentenceWords <= 280) {
        truncated += sentence + ' ';
        count += sentenceWords;
      } else {
        break;
      }
    }
    if (truncated.trim().length > 0) {
      fullLetter = truncated.trim();
      console.log(`📊 Final fallback truncated to: ${fullLetter.split(/\s+/).filter(w => w.length > 0).length} words`);
    }
  }

  setGeneratedLetter(fullLetter);
  setOriginalLetter(fullLetter);
  setIsEnhanced(false);
  
  const finalCount = fullLetter.split(/\s+/).filter(w => w.length > 0).length;
  toast.success(`✨ AI cover letter generated! (${finalCount} words)`, { id: 'cover' });
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
  currentPosition?: string; // ✅ NEW
  setGenerating: (val: boolean) => void;
  setGeneratedLetter: (val: string) => void;
  setOriginalLetter: (val: string) => void;
  setIsEnhanced: (val: boolean) => void;
  setStep: (val: number) => void;
}

export const generateLetter = async (params: GenerateLetterParams) => {
  const {
    userName,
    email,
    phoneNumber,
    education,
    jobTitle,
    company,
    experience,
    skills,
    projects,
    additionalInfo,
    selectedStyle,
    isPhoneValid,
    currentPosition, // ✅ NEW
    setGenerating,
    setGeneratedLetter,
    setOriginalLetter,
    setIsEnhanced,
    setStep
  } = params;

  // ✅ Debug log
  console.log('🚀 generateLetter called with values:', {
    userName, jobTitle, company, experience, skills, education, projects, additionalInfo, currentPosition
  });

  // Validation
  if (!canGenerate(userName, email, phoneNumber, education, jobTitle, company, isPhoneValid)) {
    if (!userName) toast.error('Please fill your name');
    else if (!email || !email.includes('@gmail.com')) toast.error('Please enter a valid Gmail address (@gmail.com)');
    else if (!phoneNumber) toast.error('Please enter your phone number');
    else if (!isPhoneValid) toast.error('Please enter a valid phone number');
    else if (!isEducationValid(education)) toast.error(getEducationError(education) || 'Please fill in Degree and University');
    else if (!jobTitle) toast.error('Please fill your job title');
    else if (!company) toast.error('Please fill company name');
    else toast.error('Please fill all required fields');
    return;
  }

  setGenerating(true);

  const groqAvailable = isGroqConfigured();
  
  if (!groqAvailable) {
    console.log('📝 API key not found. Using fallback template...');
    setTimeout(() => {
      generateFallbackLetter(
        userName,
        jobTitle,
        company,
        experience,
        skills,
        education,
        projects,
        additionalInfo,
        currentPosition || '', // ✅ NEW
        setGeneratedLetter,
        setOriginalLetter,
        setIsEnhanced,
        setStep
      );
      setGenerating(false);
    }, 800);
    return;
  }

  toast.loading('🤖 AI is writing your professional cover letter...', { id: 'cover' });

  try {
    const aiBody = await generateCoverLetterWithAI({
      userName,
      jobTitle,
      company,
      experience,
      skills,
      education,
      projects,
      additionalInfo,
      selectedStyle,
      currentPosition // ✅ NEW - Pass currentPosition to AI
    });

    const currentDate = new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    const fullLetter = `${currentDate}

Hiring Manager
${company}

RE: Application for ${jobTitle}

Dear Hiring Manager,

${aiBody}`;

    let cleanedLetter = fullLetter.replace(/\n{3,}/g, '\n\n');
    cleanedLetter = cleanedLetter.trim();

    if (cleanedLetter && cleanedLetter.length > 50) {
      setGeneratedLetter(cleanedLetter);
      setOriginalLetter(cleanedLetter);
      setIsEnhanced(false);
      
      const wordCount = cleanedLetter.split(/\s+/).filter(w => w.length > 0).length;
      toast.success(`✨ AI cover letter generated! (${wordCount} words)`, { id: 'cover' });
      setStep(3);
    } else {
      throw new Error('AI returned empty response');
    }
    
  } catch (error) {
    console.error('AI generation error:', error);
    console.log('⚠️ AI failed. Generating fallback...');
    setTimeout(() => {
      generateFallbackLetter(
        userName,
        jobTitle,
        company,
        experience,
        skills,
        education,
        projects,
        additionalInfo,
        currentPosition || '', // ✅ NEW
        setGeneratedLetter,
        setOriginalLetter,
        setIsEnhanced,
        setStep
      );
      setGenerating(false);
    }, 500);
    return;
  }
  
  setGenerating(false);
};