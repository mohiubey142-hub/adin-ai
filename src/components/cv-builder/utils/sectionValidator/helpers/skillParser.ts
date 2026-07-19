// utils/sectionValidator/helpers/skillParser.ts
// ============================================
// SKILL PARSER
// ============================================

export const parseSkillsToArray = (skillsStr: string): string[] => {
    if (!skillsStr || !skillsStr.trim()) return [];
    
    if (skillsStr.includes(',')) {
        return skillsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    
    return skillsStr.split('\n')
        .map(s => s.trim())
        .map(s => s.replace(/^[•\-*]\s*/, ''))
        .filter(s => s.length > 0);
};