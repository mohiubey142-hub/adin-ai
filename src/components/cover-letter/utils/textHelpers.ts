// src/components/cover-letter/utils/textHelpers.ts

export const wrapText = (text: string, maxLength: number = 50): string[] => {
  if (!text) return [];
  if (text.length <= maxLength) return [text];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if (word.length > maxLength) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }
      for (let i = 0; i < word.length; i += maxLength) {
        lines.push(word.substring(i, i + maxLength));
      }
      continue;
    }
    
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxLength) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

export const capitalizeWords = (str: string): string => {
  if (!str) return str;
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// ✅ YEH EXPORT MISSING THA
export const getRandomItem = <T,>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const extractSkillsList = (skillsStr: string): string[] => {
  if (!skillsStr) return [];
  return skillsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

export const formatSkillsForLetter = (skillsList: string[]): string => {
  if (skillsList.length === 0) return '';
  if (skillsList.length === 1) return skillsList[0];
  if (skillsList.length === 2) return `${skillsList[0]} and ${skillsList[1]}`;
  const lastSkill = skillsList[skillsList.length - 1];
  const restSkills = skillsList.slice(0, -1);
  return `${restSkills.join(', ')}, and ${lastSkill}`;
};

export const getTechStack = (skillsList: string[]): string[] => {
  if (skillsList.length === 0) return [];
  const techs = skillsList.filter(s => 
    !/management|leadership|communication|teamwork|problem|analytical|critical|creativity|planning|assessment|mentoring|classroom|teaching|curriculum|student/i.test(s)
  );
  if (techs.length >= 3) return techs.slice(0, 3);
  if (techs.length > 0) return techs;
  return skillsList.slice(0, 2);
};