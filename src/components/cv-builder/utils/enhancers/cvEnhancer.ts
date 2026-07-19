// utils/enhancers/cvEnhancer.ts
// ============================================
// ✅ FULL ENGLISH EXPERT - Combines All Fixes
// ============================================

import { cleanCVText } from './cvCleaner';
import { normalizeCVText } from './professionNormalizer';

// ============================================
// 🔥 MAIN FUNCTION: ENHANCE CV TEXT
// ============================================
export const enhanceCVText = (text: string): string => {
  if (!text) return '';

  let enhanced = text;

  // Step 1: Clean diary style and patterns (Fixes #1-6, #9-17, #18-19, #24-25)
  enhanced = cleanCVText(enhanced);
  
  // Step 2: Normalize formatting (Fixes #7, #8, #20-23, #26)
  enhanced = normalizeCVText(enhanced);

  // Step 3: Final cleanup
  enhanced = enhanced.replace(/\s{2,}/g, ' ');
  enhanced = enhanced.replace(/\n{3,}/g, '\n\n');

  return enhanced.trim();
};

// ============================================
// ✅ ENHANCE BULLETS
// ============================================
export const enhanceCVBullets = (bullets: string[]): string[] => {
  return bullets.map(bullet => enhanceCVText(bullet));
};

// ============================================
// ✅ CHECK IF TEXT NEEDS ENHANCEMENT
// ============================================
export const needsEnhancement = (text: string): boolean => {
  if (!text) return false;

  const diaryPhrases = [
    'I am motivated by',
    'I believe in',
    'What drives me is',
    'I am inspired by',
    'I am grateful for',
    'I find meaning in'
  ];

  const lowerText = text.toLowerCase();

  for (const phrase of diaryPhrases) {
    if (lowerText.includes(phrase.toLowerCase())) {
      return true;
    }
  }

  return false;
};

// ============================================
// ✅ GET ENHANCEMENT SUGGESTIONS
// ============================================
export const getEnhancementSuggestions = (text: string): string[] => {
  if (!text) return ['Add content first'];

  const suggestions: string[] = [];

  const diaryPhrases = [
    'I am motivated by',
    'I believe in',
    'What drives me is',
    'I am inspired by',
    'I am grateful for',
    'I find meaning in'
  ];

  for (const phrase of diaryPhrases) {
    if (text.toLowerCase().includes(phrase.toLowerCase())) {
      suggestions.push(`Remove "${phrase}" - use direct action verb instead`);
    }
  }

  if (suggestions.length === 0) {
    suggestions.push('✅ Text looks professional! No diary style found.');
  }

  return suggestions;
};