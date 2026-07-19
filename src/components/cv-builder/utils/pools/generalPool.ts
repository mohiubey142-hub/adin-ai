// utils/pools/generalPool.ts

import { SeniorityLevel } from '../seniorityDetector';
import { getSocialSciencesBullets } from './socialSciencesPool';
import { getBusinessBullets } from './businessPool';
import { getNaturalSciencesBullets } from './naturalSciencesPool';
import { getArtsBullets } from './artsPool';
import { getLawBullets } from './lawPool';
import { getEngineeringBullets } from './engineeringPool';
import { getDoctorBullets } from './doctorPool';
import { getTeacherBullets } from './teacherPool';
import { getAccountantBullets } from './accountantPool';
import { getSalesBullets } from './salesPool';
import { getHrBullets } from './hrPool';
import { getDesignerBullets } from './designerPool';
import { getFrontendBullets } from './frontendPool';
import { getDeveloperBullets } from './developerPool';

// ============================================
// ✅ SMART PROFESSION DETECTION (80+ Keywords)
// ============================================
const detectGeneralProfession = (title: string): string => {
    const t = title.toLowerCase();
    
    // ===== MEDICAL =====
    if (t.includes('doctor') || t.includes('mbbs') || t.includes('physician') || 
        t.includes('medical') || t.includes('surgeon') || t.includes('dentist') ||
        t.includes('pharma') || t.includes('dpt') || t.includes('nurse') ||
        t.includes('physical therapy') || t.includes('radiologist') || 
        t.includes('cardiologist') || t.includes('pediatrician') ||
        t.includes('gynecologist') || t.includes('psychiatrist') ||
        t.includes('pharmacist') || t.includes('medical technologist')) {
        return 'medical';
    }
    
    // ===== IT & TECHNOLOGY =====
    if (t.includes('developer') || t.includes('software') || t.includes('programmer') || 
        t.includes('web') || t.includes('backend') || t.includes('frontend') ||
        t.includes('react') || t.includes('angular') || t.includes('vue') ||
        t.includes('node') || t.includes('python') || t.includes('java') ||
        t.includes('devops') || t.includes('cloud') || t.includes('aws') ||
        t.includes('azure') || t.includes('gcp') || t.includes('kubernetes') ||
        t.includes('docker') || t.includes('jenkins') || t.includes('ci/cd') ||
        t.includes('data scientist') || t.includes('data analyst') ||
        t.includes('machine learning') || t.includes('ai') || t.includes('artificial intelligence') ||
        t.includes('cybersecurity') || t.includes('security engineer') ||
        t.includes('blockchain') || t.includes('game developer') ||
        t.includes('mobile developer') || t.includes('ios') || t.includes('android') ||
        t.includes('salesforce') || t.includes('engineer') && t.includes('software')) {
        return 'developer';
    }
    
    // ===== ENGINEERING =====
    if (t.includes('engineering') || t.includes('civil') || t.includes('electrical') || 
        t.includes('mechanical') || t.includes('chemical') || t.includes('industrial') ||
        t.includes('petroleum') || t.includes('telecommunication') ||
        t.includes('architect') || t.includes('structural') ||
        t.includes('environmental') || t.includes('biomedical') ||
        t.includes('robotics') || t.includes('automation') ||
        t.includes('quality engineer') || t.includes('process engineer')) {
        return 'engineering';
    }
    
    // ===== BUSINESS & MANAGEMENT =====
    if (t.includes('bba') || t.includes('mba') || t.includes('business administration') || 
        t.includes('business management') || t.includes('marketing') || 
        t.includes('supply chain') || t.includes('operations manager') ||
        t.includes('project manager') || t.includes('product manager') ||
        t.includes('general manager') || t.includes('regional manager') ||
        t.includes('director') || t.includes('executive') ||
        t.includes('entrepreneur') || t.includes('founder') ||
        t.includes('ceo') || t.includes('cto') || t.includes('cfo')) {
        return 'business';
    }
    
    // ===== EDUCATION =====
    if (t.includes('teacher') || t.includes('professor') || t.includes('lecturer') || 
        t.includes('educator') || t.includes('school') || t.includes('b.ed') || t.includes('bed') ||
        t.includes('principal') || t.includes('vice principal') ||
        t.includes('academic') || t.includes('curriculum') ||
        t.includes('physics teacher') || t.includes('chemistry teacher') ||
        t.includes('math teacher') || t.includes('biology teacher') ||
        t.includes('english teacher') || t.includes('urdu teacher') ||
        t.includes('computer teacher') || t.includes('islamic studies') ||
        t.includes('pakistan studies') || t.includes('history teacher')) {
        return 'education';
    }
    
    // ===== FINANCE =====
    if (t.includes('accountant') || t.includes('accounting') || t.includes('finance') || 
        t.includes('commerce') || t.includes('auditor') || t.includes('quickbooks') ||
        t.includes('tax') || t.includes('banker') || t.includes('investment') ||
        t.includes('financial advisor') || t.includes('bank manager')) {
        return 'commerce';
    }
    
    // ===== SALES =====
    if (t.includes('sales') || t.includes('business development') || 
        t.includes('account executive') || t.includes('sales manager') ||
        t.includes('sales representative') || t.includes('sales specialist')) {
        return 'sales';
    }
    
    // ===== HR =====
    if (t.includes('hr') || t.includes('human resources') || t.includes('recruiter') ||
        t.includes('talent acquisition') || t.includes('hr manager')) {
        return 'hr';
    }
    
    // ===== DESIGN =====
    if (t.includes('designer') || t.includes('graphic') || t.includes('visual') ||
        t.includes('ui') || t.includes('ux') || t.includes('user experience') ||
        t.includes('creative director') || t.includes('art director') ||
        t.includes('motion designer') || t.includes('3d artist') ||
        t.includes('video editor') || t.includes('photographer') ||
        t.includes('illustrator') || t.includes('animator') ||
        t.includes('content creator') || t.includes('copywriter')) {
        return 'designer';
    }
    
    // ===== LAW =====
    if (t.includes('law') || t.includes('llb') || t.includes('legal') || t.includes('advocate') ||
        t.includes('attorney') || t.includes('barrister') || t.includes('legal advisor') ||
        t.includes('lawyer') || t.includes('judge')) {
        return 'law';
    }
    
    // ===== SOCIAL SCIENCES =====
    if (t.includes('social sciences') || t.includes('sociology') || 
        t.includes('political science') || t.includes('anthropology') || 
        t.includes('psychology') || t.includes('economics') ||
        t.includes('social work') || t.includes('international relations')) {
        return 'social-sciences';
    }
    
    // ===== NATURAL SCIENCES =====
    if (t.includes('physics') || t.includes('chemistry') || t.includes('biology') || 
        t.includes('natural sciences') || t.includes('biochemistry') || 
        t.includes('microbiology') || t.includes('zoology') || t.includes('botany')) {
        return 'natural-sciences';
    }
    
    // ===== ARTS =====
    if (t.includes('english') || t.includes('urdu') || t.includes('islamic studies') || 
        t.includes('arts') || t.includes('history') || t.includes('philosophy') ||
        t.includes('literature') || t.includes('journalism') ||
        t.includes('mass communication') || t.includes('media') ||
        t.includes('fine arts') || t.includes('performing arts')) {
        return 'arts';
    }
    
    return 'general';
};

// ============================================
// 🔥 PROFESSIONAL + HUMAN — ULTIMATE FALLBACK
// ============================================
const getUltimateFallbackBullets = (
    level: SeniorityLevel,
    company: string,
    professionName: string
): string[] => {
    // ===== JUNIOR (0-2 years) =====
    if (level === 'junior') {
        return [
            `• Supported daily operations and project coordination across 5+ teams at ${company}`,
            `• Collaborated with cross-functional team members to achieve project milestones for 10+ projects`,
            `• Completed 50+ assigned tasks within deadlines and documented processes`,
            `• Learned and applied industry best practices while contributing to team objectives`,
            `• Assisted senior team members with research and report preparation for 20+ projects`
        ];
    }
    
    // ===== MID (3-6 years) =====
    if (level === 'mid') {
        return [
            `• Led 10+ key initiatives that delivered measurable business impact at ${company}`,
            `• Collaborated with stakeholders across 5+ departments to define requirements for 15+ projects`,
            `• Improved operational efficiency by 20% through process optimization and automation`,
            `• Mentored 5+ junior team members and contributed to team skill development`,
            `• Recognized for consistently exceeding performance expectations by 25%`
        ];
    }
    
    // ===== SENIOR (7-10 years) =====
    if (level === 'senior') {
        return [
            `• Led strategic initiatives that drove 30% business growth at ${company}`,
            `• Established best practices and standards adopted across 10+ departments`,
            `• Mentored 15+ team members and conducted performance reviews`,
            `• Drove roadmap planning and cross-functional collaboration for 5+ major projects`,
            `• Delivered measurable improvements in efficiency and team productivity by 25%`
        ];
    }
    
    // ===== DIRECTOR (11+ years) =====
    return [
        `• Served as Executive Leader at ${company}, driving organizational strategy and transformation`,
        `• Managed multi-department operations with $10M+ annual budget and 50+ team members`,
        `• Led team of 50+ professionals across 4 business units, achieving 95% retention rate`,
        `• Achieved 30% revenue growth through strategic initiatives and market expansion`,
        `• Built high-performance culture recognized industry-wide with 90% employee satisfaction`
    ];
};

// ============================================
// 🔥 PROFESSIONAL SUMMARY (FALLBACK)
// ============================================
const getProfessionalFallbackSummary = (
    level: SeniorityLevel,
    years: number,
    title: string,
    company: string
): string => {
    const levelText = level === 'junior' ? 'Junior' : 
                      level === 'mid' ? 'Experienced' : 
                      level === 'senior' ? 'Senior' : 'Executive';
    
    const templates = [
        `${levelText} professional with ${years}+ years of experience in ${title || 'the field'}. Proven track record of delivering results, collaborating with cross-functional teams, and driving operational excellence. Committed to continuous learning and professional growth.`,
        
        `Accomplished ${title || 'professional'} with ${years} years of experience in ${company || 'the industry'}. Expertise in strategic planning, stakeholder management, and team leadership. Demonstrated ability to achieve measurable results and drive organizational success.`,
        
        `Results-driven ${title || 'professional'} with ${years}+ years of progressive experience. Skilled in project management, process optimization, and cross-functional collaboration. Passionate about creating value and delivering impactful solutions.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
};

// ============================================
// ✅ MAIN EXPORT FUNCTION
// ============================================
export const getGeneralBullets = (
    level: SeniorityLevel, 
    company: string, 
    professionName: string = '',
    originalTitle: string = '',
    years: number = 3
): string[] => {
    const detectedProfession = detectGeneralProfession(originalTitle);
    
    // ✅ Try to use specific pool first
    switch (detectedProfession) {
        case 'social-sciences': return getSocialSciencesBullets(level, company);
        case 'business': return getBusinessBullets(level, company);
        case 'natural-sciences': return getNaturalSciencesBullets(level, company);
        case 'arts': return getArtsBullets(level, company);
        case 'law': return getLawBullets(level, company);
        case 'engineering': return getEngineeringBullets(level, company);
        case 'medical': return getDoctorBullets(level, company);
        case 'education': return getTeacherBullets(level, company);
        case 'commerce': return getAccountantBullets(level, company);
        case 'sales': return getSalesBullets(level, company);
        case 'hr': return getHrBullets(level, company);
        case 'designer': return getDesignerBullets(level, company);
        case 'developer': return getDeveloperBullets(level, company);
        default: return getUltimateFallbackBullets(level, company, professionName);
    }
};

// ============================================
// ✅ PROFESSIONAL SUMMARY (EXPORT)
// ============================================
export const getGeneralSummary = (
    level: SeniorityLevel,
    years: number,
    title: string,
    company: string
): string => {
    return getProfessionalFallbackSummary(level, years, title, company);
};