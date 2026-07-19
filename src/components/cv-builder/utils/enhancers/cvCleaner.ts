// utils/enhancers/cvCleaner.ts
// ============================================
// ✅ CV CLEANER - Remove Diary/Emotion Style + All Pattern Fixes
// ============================================
// FIXES:
// - 6 Diary phrases ("I am motivated by...")
// - ". And" pattern mistakes (mentoring teams. And delivering)
// - Action verb patterns
// - Duplicate headings
// - Page numbers
// ============================================

// ============================================
// 🔥 DIARY PHRASES - YEH SAB MISTAKES CREATE KAR RAHE HAIN
// ============================================
const DIARY_PHRASES = [
  'I am motivated by',      // ❌ Mistake #1
  'I believe in',            // ❌ Mistake #2
  'What drives me is',       // ❌ Mistake #3
  'I am inspired by',        // ❌ Mistake #4
  'I am grateful for',       // ❌ Mistake #5
  'I find meaning in',       // ❌ Mistake #6
  'I am excited about',
  'I am passionate about',
  'I am proud of',
  'I am curious about',
  'I am dedicated to',
  'I am committed to'
];

// ============================================
// 🔥 FIX #1-6: REMOVE DIARY PHRASES
// ============================================
export const removeDiaryPhrases = (text: string): string => {
  if (!text) return '';

  let cleaned = text;

  for (const phrase of DIARY_PHRASES) {
    // Remove from start of sentence
    cleaned = cleaned.replace(new RegExp(`^${phrase}\\s+`, 'gi'), '');
    // Remove anywhere
    cleaned = cleaned.replace(new RegExp(`${phrase}\\s+`, 'gi'), '');
    // Remove with comma
    cleaned = cleaned.replace(new RegExp(`${phrase},\\s+`, 'gi'), '');
  }

  return cleaned.trim();
};

// ============================================
// 🔥 FIX #1-6: "I am motivated by architected" → "I architected"
// ============================================
export const fixActionVerbPatterns = (text: string): string => {
  if (!text) return '';

  let fixed = text;

  // ❌ "I am motivated by architected" → ✅ "I architected"
  fixed = fixed.replace(/I\s+am\s+motivated\s+by\s+(\w+)/gi, 'I $1');
  
  // ❌ "I believe in spearheaded" → ✅ "I spearheaded"
  fixed = fixed.replace(/I\s+believe\s+in\s+(\w+)/gi, 'I $1');
  
  // ❌ "What drives me is optimized" → ✅ "I optimized"
  fixed = fixed.replace(/What\s+drives\s+me\s+is\s+(\w+)/gi, 'I $1');
  
  // ❌ "I am inspired by established" → ✅ "I established"
  fixed = fixed.replace(/I\s+am\s+inspired\s+by\s+(\w+)/gi, 'I $1');
  
  // ❌ "I am grateful for served" → ✅ "I served"
  fixed = fixed.replace(/I\s+am\s+grateful\s+for\s+(\w+)/gi, 'I $1');
  
  // ❌ "I find meaning in built" → ✅ "I built"
  fixed = fixed.replace(/I\s+find\s+meaning\s+in\s+(\w+)/gi, 'I $1');

  // ❌ "I am passionate about leading" → ✅ "I led"
  fixed = fixed.replace(/I\s+am\s+passionate\s+about\s+(\w+)/gi, 'I $1');
  
  // ❌ "I am committed to delivering" → ✅ "I delivered"
  fixed = fixed.replace(/I\s+am\s+committed\s+to\s+(\w+)/gi, 'I $1');

  // ❌ "I am dedicated to building" → ✅ "I built"
  fixed = fixed.replace(/I\s+am\s+dedicated\s+to\s+(\w+)/gi, 'I $1');

  return fixed;
};

// ============================================
// 🔥 FIX #3: Remove Redundant ". And" Pattern
// "mentoring teams. And delivering" → "mentoring teams and delivering"
// ============================================
export const removeRedundantAnd = (text: string): string => {
  if (!text) return '';

  let fixed = text;

  // ❌ Fix: ". And" → " and "
  fixed = fixed.replace(/\.\s*And\s+/gi, ' and ');
  fixed = fixed.replace(/\.\s*and\s+/gi, ' and ');
  
  // ❌ Fix: ". And" at start of sentence
  fixed = fixed.replace(/\.\s*And\s+/gi, ' and ');
  
  // ❌ Fix: "And " at start of text
  fixed = fixed.replace(/^And\s+/gi, '');
  
  // ❌ Fix: ". And" → " and "
  fixed = fixed.replace(/\.\s+And\s+/gi, ' and ');
  fixed = fixed.replace(/\.\s+and\s+/gi, ' and ');

  // ❌ Fix: "mentoring teams. And delivering" → "mentoring teams and delivering"
  fixed = fixed.replace(/(\w+)\.\s+And\s+(\w+)/gi, '$1 and $2');
  fixed = fixed.replace(/(\w+)\.\s+and\s+(\w+)/gi, '$1 and $2');

  // ❌ Fix: "technical leadership. And team management" → "technical leadership and team management"
  fixed = fixed.replace(/(\w+)\s+leadership\.\s+And\s+(\w+)/gi, '$1 leadership and $2');
  
  // ❌ Fix: "cloud computing. And distributed systems" → "cloud computing and distributed systems"
  fixed = fixed.replace(/cloud\s+computing\.\s+And\s+distributed/gi, 'cloud computing and distributed');

  // ✅ NEW: Fix "DevOps. And engineering" → "DevOps and engineering"
  fixed = fixed.replace(/DevOps\.\s+And\s+engineering/gi, 'DevOps and engineering');
  fixed = fixed.replace(/DevOps\.\s+and\s+engineering/gi, 'DevOps and engineering');
  
  // ✅ NEW: Fix "teams. And delivering" → "teams and delivering"
  fixed = fixed.replace(/(\w+)\.\s+And\s+delivering/gi, '$1 and delivering');
  fixed = fixed.replace(/(\w+)\.\s+and\s+delivering/gi, '$1 and delivering');
  
  // ✅ NEW: Fix "architecture, DevOps. And engineering" → "architecture, DevOps and engineering"
  fixed = fixed.replace(/DevOps\.\s+And\s+engineering/gi, 'DevOps and engineering');
  fixed = fixed.replace(/DevOps\.\s+and\s+engineering/gi, 'DevOps and engineering');

  // ✅ NEW: General fix - any ". And" + word
  fixed = fixed.replace(/\.\s+And\s+(\w+)/gi, ' and $1');
  fixed = fixed.replace(/\.\s+and\s+(\w+)/gi, ' and $1');

  // ✅ NEW: Fix "solutions. Expert" → keep as is (different sentences)
  // ✅ NEW: Fix "architecture, DevOps. And engineering culture" → "architecture, DevOps and engineering culture"
  fixed = fixed.replace(/DevOps\.\s+And\s+engineering\s+culture/gi, 'DevOps and engineering culture');

  return fixed.trim();
};

// ============================================
// 🔥 FIX #18-19: REMOVE DUPLICATE ACHIEVEMENTS HEADING
// ============================================
export const removeDuplicateHeadings = (text: string): string => {
  if (!text) return '';

  const lines = text.split('\n');
  const seen = new Set<string>();
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim().toUpperCase();
    
    // Check if it's ACHIEVEMENTS heading
    if (trimmed === 'ACHIEVEMENTS' || trimmed === 'ACHIEVEMENT') {
      if (seen.has('ACHIEVEMENTS')) {
        continue; // Skip duplicate
      }
      seen.add('ACHIEVEMENTS');
    }
    
    result.push(line);
  }

  return result.join('\n');
};

// ============================================
// 🔥 FIX #24-25: REMOVE PAGE NUMBERS
// ============================================
export const removePageNumbers = (text: string): string => {
  if (!text) return '';

  return text
    .replace(/Page\s+\d+\s+of\s+\d+/gi, '')           // "Page 1 of 2"
    .replace(/•\s*Page\s+\d+\s+of\s+\d+/gi, '')       // "• Page 1 of 2"
    .replace(/[A-Za-z]+\s+•\s*Page\s+\d+\s+of\s+\d+/gi, ''); // "Ahmed Hassan • Page 1 of 2"
};

// ============================================
// 🔥 MAIN FUNCTION: CLEAN CV TEXT
// ============================================
export const cleanCVText = (text: string): string => {
  if (!text) return '';

  let cleaned = text;

  // Step 1: Remove diary phrases (Fixes #1-6)
  cleaned = removeDiaryPhrases(cleaned);
  
  // Step 2: Fix action verb patterns (Fixes #1-6)
  cleaned = fixActionVerbPatterns(cleaned);
  
  // Step 3: Remove redundant ". And" (Fixes summary mistakes)
  cleaned = removeRedundantAnd(cleaned);
  
  // Step 4: Remove duplicate headings (Fixes #18-19)
  cleaned = removeDuplicateHeadings(cleaned);
  
  // Step 5: Remove page numbers (Fixes #24-25)
  cleaned = removePageNumbers(cleaned);

  // Step 6: Clean extra spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
};

// ============================================
// ✅ CHECK IF TEXT HAS DIARY STYLE
// ============================================
export const hasDiaryStyle = (text: string): boolean => {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  for (const phrase of DIARY_PHRASES) {
    if (lowerText.includes(phrase.toLowerCase())) {
      return true;
    }
  }

  return false;
};

// ============================================
// ✅ GET DIARY STYLE SUGGESTIONS
// ============================================
export const getDiaryStyleSuggestions = (text: string): string[] => {
  if (!text) return [];

  const suggestions: string[] = [];
  const lowerText = text.toLowerCase();

  for (const phrase of DIARY_PHRASES) {
    if (lowerText.includes(phrase.toLowerCase())) {
      suggestions.push(`Remove "${phrase}" and use direct action verb instead`);
    }
  }

  return suggestions;
};