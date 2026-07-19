// src/components/cover-letter/index.ts
export { default } from './CoverLetter';
export { default as CoverLetterProgress } from './CoverLetterProgress';
export { default as Step1Details } from './steps/Step1Details';
export { default as Step2Style } from './steps/Step2Style';
export { default as Step3Preview } from './steps/Step3Preview';

// Export templates
export { templateRegistry, getTemplate, DEFAULT_TEMPLATE, VALID_TEMPLATES } from './templates';
export { ClassicTemplate } from './templates/ClassicTemplate';
export { ModernTemplate } from './templates/ModernTemplate';
export { ExecutiveTemplate } from './templates/ExecutiveTemplate';

// Export AI services
export { 
  enhanceCoverLetter, 
  isGroqConfigured,
  generateCoverLetterWithAI 
} from './services/groqService';