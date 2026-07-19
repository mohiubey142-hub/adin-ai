// utils/sectionValidator/feedback/atsFeedback.ts
// ============================================
// ATS FEEDBACK - Full Analysis
// ============================================

import { 
    PersonalInfo, 
    ExperienceItem, 
    EducationItem, 
    ProjectItem, 
    CertificationItem, 
    LanguageItem, 
    AchievementItem 
} from '../../types/cvTypes';
import { parseSkillsToArray } from '../helpers';
import { getFinalCVScore } from '../score';

export const getATSFeedback = (params: {
    personalInfo: PersonalInfo;
    phoneNumber: string;
    professionalSummary: string;
    experiences: ExperienceItem[];
    educations: EducationItem[];
    skills: string;
    projects: ProjectItem[];
    certifications: CertificationItem[];
    languages: LanguageItem[];
    achievements: AchievementItem[];
    profilePhoto: string | null;
}): { strengths: string[]; improvements: string[]; overall: string; score: number } => {
    const { 
        personalInfo, 
        phoneNumber, 
        professionalSummary, 
        experiences, 
        educations, 
        skills, 
        projects, 
        certifications, 
        languages, 
        achievements 
    } = params;

    const strengths: string[] = [];
    const improvements: string[] = [];

    // ============================================================
    // PERSONAL INFO
    // ============================================================
    const hasName = personalInfo.name?.trim().length > 0;
    const hasTitle = personalInfo.title?.trim().length > 0;
    const hasEmail = personalInfo.email?.includes('@') && personalInfo.email?.includes('.');
    const hasPhone = phoneNumber?.trim().length > 0;

    if (hasName && hasTitle && hasEmail && hasPhone) {
        strengths.push('Complete personal information');
    } else {
        improvements.push('Complete all required personal fields');
    }

    // ============================================================
    // SUMMARY
    // ============================================================
    if (professionalSummary && professionalSummary.length > 100) {
        strengths.push('Well-written professional summary');
    } else if (professionalSummary && professionalSummary.length > 0) {
        improvements.push('Expand your professional summary (100+ characters recommended)');
    } else {
        improvements.push('Add a professional summary');
    }

    // ============================================================
    // EDUCATION
    // ============================================================
    const validEducations = educations.filter(e => e.degree?.trim() && e.institution?.trim());
    if (validEducations.length >= 1) {
        strengths.push('Education information complete');
    } else {
        improvements.push('Add your educational background');
    }

    // ============================================================
    // SKILLS
    // ============================================================
    const skillCount = parseSkillsToArray(skills).length;
    if (skillCount >= 8) {
        strengths.push('Excellent skills section — comprehensive and relevant');
    } else if (skillCount >= 5) {
        strengths.push(`Good skills section (${skillCount} skills)`);
    } else if (skillCount >= 3) {
        strengths.push(`${skillCount} relevant skills added`);
    } else if (skillCount > 0) {
        improvements.push(`Add ${5 - skillCount} more skills for better ATS score`);
    } else {
        improvements.push('Add your technical and soft skills');
    }

    // ============================================================
    // EXPERIENCE
    // ============================================================
    const validExperiences = experiences.filter(e => e.title?.trim() && e.company?.trim());
    if (validExperiences.length >= 3) {
        strengths.push('Strong work experience with multiple roles');
    } else if (validExperiences.length === 2) {
        strengths.push('Good work experience with 2 roles');
    } else if (validExperiences.length === 1) {
        strengths.push('Work experience added');
    } else {
        improvements.push('Add work experience to strengthen your CV');
    }

    // ============================================================
    // PROJECTS
    // ============================================================
    const validProjects = projects.filter(p => p.name?.trim());
    if (validProjects.length >= 2) {
        strengths.push('Multiple projects demonstrating practical experience');
    } else if (validProjects.length === 1) {
        strengths.push('Project portfolio included');
    } else {
        improvements.push('Add projects to showcase your work');
    }

    // ============================================================
    // CERTIFICATIONS
    // ============================================================
    const validCerts = certifications.filter(c => c.name?.trim());
    if (validCerts.length >= 1) {
        strengths.push('Professional certifications added');
    } else {
        improvements.push('Add certifications to boost credibility');
    }

    // ============================================================
    // LANGUAGES
    // ============================================================
    const validLangs = languages.filter(l => l.language?.trim());
    if (validLangs.length >= 2) {
        strengths.push('Multiple languages — valuable skill');
    } else if (validLangs.length === 1) {
        strengths.push('Language skill added');
    }

    // ============================================================
    // ACHIEVEMENTS
    // ============================================================
    const validAchievements = achievements.filter(a => a.title?.trim());
    if (validAchievements.length >= 1) {
        strengths.push('Achievements and recognition highlighted');
    } else {
        improvements.push('Add achievements to highlight your successes');
    }

    // ============================================================
    // OVERALL SCORE
    // ============================================================
    const score = getFinalCVScore({
        personal: { isComplete: true, score: 0, weakPoints: [] },
        education: { isComplete: true, score: 0, weakPoints: [] },
        skills: { isComplete: true, score: 0, weakPoints: [] },
        summary: { isComplete: true, score: 0, weakPoints: [] }
    });

    // ============================================================
    // OVERALL MESSAGE
    // ============================================================
    let overall = '';
    if (score >= 85) {
        overall = 'Excellent CV! Well-structured and professionally presented. Ready for top employers.';
    } else if (score >= 70) {
        overall = 'Strong CV with good content. Minor improvements will make it excellent.';
    } else if (score >= 50) {
        overall = 'Good foundation. Add more details to strengthen your profile.';
    } else {
        overall = 'Complete the recommended sections for better results.';
    }

    return { strengths, improvements, overall, score };
};