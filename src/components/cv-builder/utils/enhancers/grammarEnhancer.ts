// utils/enhancers/grammarEnhancer.ts
// ============================================
// GRAMMAR ENHANCER - Wrapper around grammarExpert
// ============================================

import { 
    polishText, 
    polishBullets, 
    fixGrammar, 
    needsPolishing,
    getPolishingSuggestions
} from '../grammarExpert';

import { enhanceCVText, enhanceCVBullets } from './cvEnhancer';

export const polishGrammar = (text: string): string => {
    if (!text || text.trim() === '') return '';
    return polishText(text);
};

export { 
    polishText,
    polishBullets,
    fixGrammar,
    needsPolishing,
    getPolishingSuggestions
};

export { enhanceCVText, enhanceCVBullets } from './cvEnhancer';