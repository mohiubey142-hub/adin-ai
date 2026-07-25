// utils/profession/detection.ts
// ============================================
// PROFESSION DETECTION - 80+ Professions
// ============================================

export const detectProfession = (title: string): string => {
    const t = title.toLowerCase();
    
    // ============================================
    // MEDICAL & HEALTH SCIENCES
    // ============================================
    if (t.includes('doctor') || t.includes('mbbs') || t.includes('physician') || 
        t.includes('medical') || t.includes('surgeon') || t.includes('pharma') ||
        t.includes('dpt') || t.includes('physical therapy') || t.includes('dentist')) {
        return 'doctor';
    }
    
    // ============================================
    // HEALTHCARE ALLIED - NEW (9)
    // ============================================
    if (t.includes('physiotherapist') || t.includes('physical therapist')) return 'physiotherapist';
    if (t.includes('nutritionist') || t.includes('dietitian')) return 'nutritionist';
    if (t.includes('medical lab') || t.includes('laboratory technologist') || 
        t.includes('lab technologist') || t.includes('medical laboratory')) return 'medical-lab-technologist';
    if (t.includes('radiology technologist') || t.includes('radiologic technologist') || 
        t.includes('imaging technologist') || t.includes('x-ray technologist')) return 'radiology-technologist';
    if (t.includes('occupational therapist') || t.includes('occupational therapy')) return 'occupational-therapist';
    if (t.includes('speech therapist') || t.includes('speech-language') || 
        t.includes('speech pathologist')) return 'speech-therapist';
    if (t.includes('optometrist') || t.includes('eye doctor')) return 'optometrist';
    if (t.includes('veterinary') || t.includes('veterinarian') || t.includes('vet doctor')) return 'veterinary-doctor';
    if (t.includes('healthcare admin') || t.includes('hospital admin') || 
        t.includes('medical admin') || t.includes('healthcare administrator')) return 'healthcare-administrator';
    
    // ============================================
    // COMPUTER SCIENCE & IT
    // ============================================
    if (t.includes('developer') || t.includes('engineer') || t.includes('software') || 
        t.includes('web') || t.includes('backend') || t.includes('frontend') ||
        t.includes('react') || t.includes('angular') || t.includes('vue')) {
        return 'developer';
    }
    
    // ============================================
    // IT - NEW (5)
    // ============================================
    if (t.includes('software engineer') && !t.includes('embedded')) return 'software-engineer';
    if (t.includes('ai research') || (t.includes('research engineer') && t.includes('ai')) || 
        t.includes('machine learning researcher')) return 'ai-research-engineer';
    if (t.includes('embedded') || t.includes('firmware') || t.includes('embedded systems')) return 'embedded-systems-engineer';
    if (t.includes('database administrator') || t.includes('dba') || 
        t.includes('database admin')) return 'database-administrator';
    if (t.includes('mechatronics') || t.includes('mechatronic')) return 'mechatronics-engineer';
    
    // ============================================
    // BUSINESS ADMINISTRATION
    // ============================================
    if (t.includes('bba') || t.includes('mba') || t.includes('business administration') || 
        t.includes('business management') || t.includes('marketing') || t.includes('supply chain') ||
        t.includes('operations manager')) {
        return 'business';
    }
    
    // ============================================
    // BUSINESS - NEW (6)
    // ============================================
    if (t.includes('finance analyst') || t.includes('financial analyst')) return 'finance-analyst';
    if (t.includes('financial advisor') || t.includes('wealth advisor') || 
        t.includes('financial planner')) return 'financial-advisor';
    if (t.includes('supply chain manager') || t.includes('supply chain management')) return 'supply-chain-manager';
    if (t.includes('procurement') || t.includes('procurement officer') || 
        t.includes('purchasing officer') || t.includes('purchasing manager')) return 'procurement-officer';
    if (t.includes('logistics manager') || t.includes('logistics')) return 'logistics-manager';
    if (t.includes('business development executive') || t.includes('business development manager') ||
        t.includes('bdm') || t.includes('bde')) return 'business-development-executive';
    
    // ============================================
    // ENGINEERING
    // ============================================
    if (t.includes('engineering') || t.includes('civil') || t.includes('electrical') || 
        t.includes('mechanical') || t.includes('chemical') || t.includes('industrial') ||
        t.includes('petroleum') || t.includes('telecommunication')) {
        return 'engineering';
    }
    
    // ============================================
    // ENGINEERING - NEW (2)
    // ============================================
    if (t.includes('automobile engineer') || t.includes('automotive engineer') || 
        t.includes('vehicle engineer')) return 'automobile-engineer';
    if (t.includes('mining engineer') || t.includes('mine engineer')) return 'mining-engineer';
    
    // ============================================
    // EDUCATION
    // ============================================
    if (t.includes('teacher') || t.includes('professor') || t.includes('lecturer') || 
        t.includes('educator') || t.includes('school') || t.includes('b.ed') || t.includes('bed')) {
        return 'teacher';
    }
    
    // ============================================
    // COMMERCE, ACCOUNTING & FINANCE
    // ============================================
    if (t.includes('accountant') || t.includes('accounting') || t.includes('finance') || 
        t.includes('commerce') || t.includes('auditor') || t.includes('quickbooks') ||
        t.includes('tax')) {
        return 'accountant';
    }
    
    // ============================================
    // SALES & MARKETING - NEW (1)
    // ============================================
    if (t.includes('customer support') || t.includes('customer service') || 
        t.includes('support specialist') || t.includes('customer care')) return 'customer-support-specialist';
    
    // ============================================
    // LAW
    // ============================================
    if (t.includes('law') || t.includes('llb') || t.includes('legal') || t.includes('advocate') ||
        t.includes('attorney') || t.includes('barrister') || t.includes('legal advisor')) {
        return 'law';
    }
    
    // ============================================
    // SOCIAL SCIENCES
    // ============================================
    if (t.includes('social sciences') || t.includes('sociology') || t.includes('political science') || 
        t.includes('anthropology') || t.includes('psychology') || t.includes('economics') ||
        t.includes('social work') || t.includes('international relations')) {
        return 'social-sciences';
    }
    
    // ============================================
    // NATURAL SCIENCES
    // ============================================
    if (t.includes('physics') || t.includes('chemistry') || t.includes('biology') || 
        t.includes('natural sciences') || t.includes('biochemistry') || t.includes('microbiology') ||
        t.includes('zoology') || t.includes('botany')) {
        return 'natural-sciences';
    }
    
    // ============================================
    // ARTS & HUMANITIES
    // ============================================
    if (t.includes('english') || t.includes('urdu') || t.includes('islamic studies') || 
        t.includes('arts') || t.includes('history') || t.includes('philosophy') ||
        t.includes('literature') || t.includes('journalism')) {
        return 'arts';
    }
    
    // ============================================
    // SALES
    // ============================================
    if (t.includes('sales') || t.includes('business development') || t.includes('account executive')) {
        return 'sales';
    }
    
    // ============================================
    // HR
    // ============================================
    if (t.includes('hr') || t.includes('human resources') || t.includes('recruiter')) {
        return 'hr';
    }
    
    // ============================================
    // DESIGNER
    // ============================================
    if (t.includes('designer') || t.includes('graphic') || t.includes('visual')) {
        return 'designer';
    }
    
    // ============================================
    // FRONTEND (specific)
    // ============================================
    if (t.includes('frontend') || t.includes('react') || t.includes('vue') || t.includes('angular')) {
        return 'frontend';
    }
    
    // ============================================
    // SUBJECT TEACHERS
    // ============================================
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
    
    // ============================================
    // EXISTING PROFESSIONS
    // ============================================
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