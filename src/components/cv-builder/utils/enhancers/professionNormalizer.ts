// utils/enhancers/professionNormalizer.ts
// ============================================
// ✅ FIXES: Mistakes #7, #8, #20-21, #22-23, #26
// ============================================

// ============================================
// 🔥 FIX #7: COMPANY NAME FORMAT
// ============================================
export const normalizeCompanyName = (text: string): string => {
  if (!text) return '';

  let normalized = text;

  const companyFixes: Record<string, string> = {
    'devsolutions pvt ltd': 'DevSolutions Pvt Ltd',
    'devsolutions': 'DevSolutions',
    'google': 'Google',
    'microsoft': 'Microsoft',
    'amazon': 'Amazon',
    'apple': 'Apple',
    'facebook': 'Facebook',
    'meta': 'Meta',
    'netflix': 'Netflix',
    'uber': 'Uber',
    'airbnb': 'Airbnb',
    'tesla': 'Tesla',
    'spacex': 'SpaceX'
  };

  for (const [wrong, correct] of Object.entries(companyFixes)) {
    normalized = normalized.replace(new RegExp(wrong, 'gi'), correct);
  }

  return normalized;
};

// ============================================
// 🔥 FIX #8: NUMBER FORMAT (10m+ → 10M+)
// ============================================
export const normalizeNumbers = (text: string): string => {
  if (!text) return '';

  let normalized = text;

  // Fix: 10m+ → 10M+
  normalized = normalized.replace(/(\d+)m\+/gi, '$1M+');
  normalized = normalized.replace(/(\d+)k\+/gi, '$1K+');
  
  // Fix: 10m → 10M
  normalized = normalized.replace(/(\d+)m\b/gi, '$1M');
  normalized = normalized.replace(/(\d+)k\b/gi, '$1K');

  return normalized;
};

// ============================================
// 🔥 FIX #26: TECH NAME FORMAT (react. Js → React.js)
// ============================================
export const normalizeTechNames = (text: string): string => {
  if (!text) return '';

  let normalized = text;

  const techFixes: Record<string, string> = {
    'react. js': 'React.js',
    'react. Js': 'React.js',
    'react.js': 'React.js',
    'next. js': 'Next.js',
    'next. Js': 'Next.js',
    'next.js': 'Next.js',
    'node. js': 'Node.js',
    'node. Js': 'Node.js',
    'node.js': 'Node.js',
    'typescript': 'TypeScript',
    'javascript': 'JavaScript',
    'python': 'Python',
    'git': 'Git',
    'aws': 'AWS',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes'
  };

  for (const [wrong, correct] of Object.entries(techFixes)) {
    normalized = normalized.replace(new RegExp(wrong, 'gi'), correct);
  }

  return normalized;
};

// ============================================
// 🔥 FIX #22-23: LANGUAGE FORMAT
// ============================================
export const formatLanguages = (text: string): string => {
  if (!text) return '';

  let formatted = text;

  // ❌ "English Professional Working Proficiency" → ✅ "English: Professional Working Proficiency"
  formatted = formatted.replace(
    /English\s+Professional\s+Working\s+Proficiency/gi,
    'English: Professional Working Proficiency'
  );
  
  // ❌ "Urdu Native or Bilingual Proficiency" → ✅ "Urdu: Native/Bilingual"
  formatted = formatted.replace(
    /Urdu\s+Native\s+or\s+Bilingual\s+Proficiency/gi,
    'Urdu: Native/Bilingual'
  );

  // ❌ "Urdu Native or Bilingual" → ✅ "Urdu: Native/Bilingual"
  formatted = formatted.replace(
    /Urdu\s+Native\s+or\s+Bilingual/gi,
    'Urdu: Native/Bilingual'
  );

  // ❌ "English Professional Working" → ✅ "English: Professional Working"
  formatted = formatted.replace(
    /English\s+Professional\s+Working/gi,
    'English: Professional Working'
  );

  // ✅ General format: "Language Level" → "Language: Level"
  formatted = formatted.replace(
    /([A-Za-z]+)\s+(Native|Bilingual|Fluent|Professional|Working|Beginner|Intermediate|Advanced)/gi,
    '$1: $2'
  );

  // ✅ Fix: "Language : Level" (extra space remove)
  formatted = formatted.replace(/\s*:\s*/g, ': ');

  return formatted.trim();
};

// ============================================
// 🔥 FIX #20-21: ORGANIZE SKILLS BY CATEGORY
// ============================================
export const organizeSkills = (skillsText: string): string => {
  if (!skillsText) return '';

  // Split skills by comma or new line
  let skills = skillsText.includes(',') 
    ? skillsText.split(',').map(s => s.trim())
    : skillsText.split('\n').map(s => s.trim().replace(/^[•\-*]\s*/, ''));

  skills = skills.filter(s => s);

  // Categorize skills
  const frontend = skills.filter(s => 
    /react|angular|vue|html|css|javascript|typescript|frontend|ui|ux/i.test(s)
  );
  
  const backend = skills.filter(s => 
    /node|python|java|php|ruby|go|rust|backend|api|database|sql|mongo/i.test(s)
  );
  
  const tools = skills.filter(s => 
    /git|docker|kubernetes|aws|azure|jenkins|ci\/cd|linux|shell|terraform/i.test(s)
  );

  const other = skills.filter(s => 
    !frontend.includes(s) && !backend.includes(s) && !tools.includes(s)
  );

  // Build result
  const result: string[] = [];
  
  if (frontend.length > 0) result.push(`Frontend: ${frontend.join(', ')}`);
  if (backend.length > 0) result.push(`Backend: ${backend.join(', ')}`);
  if (tools.length > 0) result.push(`Tools: ${tools.join(', ')}`);
  if (other.length > 0) result.push(`Other: ${other.join(', ')}`);

  return result.join('\n');
};

// ============================================
// 🔥 MAIN FUNCTION
// ============================================
export const normalizeCVText = (text: string): string => {
  if (!text) return '';

  let normalized = text;

  // Step 1: Fix company names (#7)
  normalized = normalizeCompanyName(normalized);
  
  // Step 2: Fix numbers (#8)
  normalized = normalizeNumbers(normalized);
  
  // Step 3: Fix tech names (#26)
  normalized = normalizeTechNames(normalized);
  
  // Step 4: Fix languages (#22-23)
  normalized = formatLanguages(normalized);

  return normalized;
};