// utils/profession/detection.ts
// ============================================
// PROFESSION DETECTION - 60+ Professions
// ============================================

export const detectProfession = (title: string): string => {
    const t = title.toLowerCase();
    
    // Medical & Health Sciences (MBBS, Pharma-D, DPT)
    if (t.includes('doctor') || t.includes('mbbs') || t.includes('physician') || 
        t.includes('medical') || t.includes('surgeon') || t.includes('pharma') ||
        t.includes('dpt') || t.includes('physical therapy') || t.includes('dentist')) {
        return 'doctor';
    }
    
    // Computer Science & IT
    if (t.includes('developer') || t.includes('engineer') || t.includes('software') || 
        t.includes('web') || t.includes('backend') || t.includes('frontend') ||
        t.includes('react') || t.includes('angular') || t.includes('vue')) {
        return 'developer';
    }
    
    // Business Administration (BBA/MBA)
    if (t.includes('bba') || t.includes('mba') || t.includes('business administration') || 
        t.includes('business management') || t.includes('marketing') || t.includes('supply chain') ||
        t.includes('operations manager')) {
        return 'business';
    }
    
    // Engineering
    if (t.includes('engineering') || t.includes('civil') || t.includes('electrical') || 
        t.includes('mechanical') || t.includes('chemical') || t.includes('industrial') ||
        t.includes('petroleum') || t.includes('telecommunication')) {
        return 'engineering';
    }
    
    // Education (B.Ed)
    if (t.includes('teacher') || t.includes('professor') || t.includes('lecturer') || 
        t.includes('educator') || t.includes('school') || t.includes('b.ed') || t.includes('bed')) {
        return 'teacher';
    }
    
    // Commerce, Accounting & Finance
    if (t.includes('accountant') || t.includes('accounting') || t.includes('finance') || 
        t.includes('commerce') || t.includes('auditor') || t.includes('quickbooks') ||
        t.includes('tax')) {
        return 'accountant';
    }
    
    // Law (LLB)
    if (t.includes('law') || t.includes('llb') || t.includes('legal') || t.includes('advocate') ||
        t.includes('attorney') || t.includes('barrister') || t.includes('legal advisor')) {
        return 'law';
    }
    
    // Social Sciences
    if (t.includes('social sciences') || t.includes('sociology') || t.includes('political science') || 
        t.includes('anthropology') || t.includes('psychology') || t.includes('economics') ||
        t.includes('social work') || t.includes('international relations')) {
        return 'social-sciences';
    }
    
    // Natural Sciences (Physics, Chemistry, Biology)
    if (t.includes('physics') || t.includes('chemistry') || t.includes('biology') || 
        t.includes('natural sciences') || t.includes('biochemistry') || t.includes('microbiology') ||
        t.includes('zoology') || t.includes('botany')) {
        return 'natural-sciences';
    }
    
    // Arts & Humanities
    if (t.includes('english') || t.includes('urdu') || t.includes('islamic studies') || 
        t.includes('arts') || t.includes('history') || t.includes('philosophy') ||
        t.includes('literature') || t.includes('journalism')) {
        return 'arts';
    }
    
    // Sales
    if (t.includes('sales') || t.includes('business development') || t.includes('account executive')) {
        return 'sales';
    }
    
    // HR
    if (t.includes('hr') || t.includes('human resources') || t.includes('recruiter')) {
        return 'hr';
    }
    
    // Designer
    if (t.includes('designer') || t.includes('graphic') || t.includes('visual')) {
        return 'designer';
    }
    
    // Frontend (specific)
    if (t.includes('frontend') || t.includes('react') || t.includes('vue') || t.includes('angular')) {
        return 'frontend';
    }
    
    // ===== SUBJECT TEACHERS =====
    if (t.includes('physics teacher') || t.includes('physics')) return 'physics-teacher';
    if (t.includes('chemistry teacher') || t.includes('chemistry')) return 'chemistry-teacher';
    if (t.includes('math teacher') || t.includes('mathematics') || t.includes('maths')) return 'math-teacher';
    if (t.includes('biology teacher') || t.includes('biology')) return 'biology-teacher';
    if (t.includes('english teacher') || t.includes('english literature')) return 'english-teacher';
    if (t.includes('urdu teacher') || t.includes('urdu')) return 'urdu-teacher';
    if (t.includes('computer teacher') || t.includes('computer science')) return 'computer-teacher';
    if (t.includes('islamic studies') || t.includes('islamiat')) return 'islamic-studies-teacher';
    if (t.includes('pakistan studies') || t.includes('pak studies')) return 'pakistan-studies-teacher';
    if (t.includes('history teacher') || t.includes('history')) return 'history-teacher';
    
    // ===== NEW PROFESSIONS =====
    if (t.includes('data scientist') || t.includes('machine learning')) return 'data-scientist';
    if (t.includes('cybersecurity') || t.includes('security engineer')) return 'cybersecurity';
    if (t.includes('cloud') || t.includes('aws') || t.includes('azure')) return 'cloud';
    if (t.includes('devops') || t.includes('ci/cd') || t.includes('kubernetes')) return 'devops';
    if (t.includes('product manager')) return 'product-manager';
    if (t.includes('project manager')) return 'project-manager';
    if (t.includes('marketing') || t.includes('digital marketing')) return 'marketing';
    if (t.includes('content creator') || t.includes('writer')) return 'content-creator';
    if (t.includes('ui/ux') || t.includes('ux designer')) return 'uiux';
    if (t.includes('entrepreneur') || t.includes('founder')) return 'entrepreneur';
    if (t.includes('freelancer') || t.includes('freelance')) return 'freelancer';
    if (t.includes('ai') || t.includes('ml') || t.includes('artificial intelligence')) return 'ai-ml';
    if (t.includes('full stack') || t.includes('fullstack')) return 'full-stack';
    if (t.includes('backend')) return 'backend';
    if (t.includes('graphic designer')) return 'graphic-designer';
    if (t.includes('nurse')) return 'nurse';
    if (t.includes('data analyst')) return 'data-analyst';
    if (t.includes('business analyst')) return 'business-analyst';
    if (t.includes('banker')) return 'banker';
    if (t.includes('dentist')) return 'dentist';
    if (t.includes('pharmacist')) return 'pharmacist';
    if (t.includes('pilot')) return 'pilot';
    if (t.includes('army') || t.includes('military') || t.includes('officer')) return 'army';
    if (t.includes('it support') || t.includes('system administrator')) return 'it-support';
    if (t.includes('professor') || t.includes('academic')) return 'professor';
    if (t.includes('operations manager')) return 'operations-manager';
    if (t.includes('game developer')) return 'game-developer';
    if (t.includes('solar') || t.includes('renewable')) return 'renewable';
    if (t.includes('electrician')) return 'electrician';
    if (t.includes('plumber')) return 'plumber';
    
    return 'general';
};