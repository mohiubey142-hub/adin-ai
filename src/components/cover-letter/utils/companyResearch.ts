// src/components/cover-letter/utils/companyResearch.ts

import { companyDatabase } from '../constants/companyDatabase';
import { getRandomItem } from './textHelpers'; // ✅ Yeh ab sahi se import ho ga

export const getCompanyResearch = (companyName: string): string => {
  if (!companyName) return 'innovation and excellence';
  const lowerCompany = companyName.toLowerCase();

  let matchedKey = '';
  for (const key in companyDatabase) {
    if (lowerCompany.includes(key)) {
      matchedKey = key;
      break;
    }
  }

  if (matchedKey && companyDatabase[matchedKey]) {
    return getRandomItem(companyDatabase[matchedKey]);
  }

  const genericOptions = [
    'innovation, quality, and forward-thinking approach',
    'technological excellence and continuous innovation',
    'industry leadership and innovation commitment',
    'quality and excellence in technology delivery',
    'innovation-driven culture and technological leadership',
    'forward-thinking solutions and quality excellence'
  ];
  return getRandomItem(genericOptions);
};