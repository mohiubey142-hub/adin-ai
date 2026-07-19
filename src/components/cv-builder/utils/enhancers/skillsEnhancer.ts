// utils/enhancers/skillsEnhancer.ts
// ============================================
// SKILLS ENHANCER - ENTERPRISE EDITION
// ============================================

// ============================================
// 1. SMART NORMALIZATION
// ============================================
const normalizeSkill = (skill: string): string => {
    return skill
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
};

// ============================================
// 2. SEMANTIC DUPLICATE MAPPING
// ============================================
const getSkillCanonicalForm = (skill: string): string => {
    const lower = skill.toLowerCase().trim();
    
    // Mapping of semantic duplicates to canonical form
    const canonicalMap: Record<string, string> = {
        // Communication
        'communication skills': 'Communication',
        'communication': 'Communication',
        'verbal communication': 'Communication',
        'written communication': 'Communication',
        'interpersonal communication': 'Communication',
        'effective communication': 'Communication',
        'communications': 'Communication',
        
        // Analytical
        'analytical skills': 'Analytical Thinking',
        'analytical thinking': 'Analytical Thinking',
        'analytical': 'Analytical Thinking',
        'analysis': 'Analytical Thinking',
        'critical analysis': 'Analytical Thinking',
        
        // Problem Solving
        'problem solving skills': 'Problem Solving',
        'problem solving': 'Problem Solving',
        'problem-solving': 'Problem Solving',
        'troubleshooting': 'Problem Solving',
        'solution oriented': 'Problem Solving',
        
        // Detail Oriented
        'detail oriented': 'Attention to Detail',
        'detail-oriented': 'Attention to Detail',
        'attention to detail': 'Attention to Detail',
        'meticulous': 'Attention to Detail',
        'thoroughness': 'Attention to Detail',
        
        // Teamwork
        'teamwork': 'Collaboration',
        'team player': 'Collaboration',
        'collaboration': 'Collaboration',
        'collaborative': 'Collaboration',
        'team work': 'Collaboration',
        'cross-functional collaboration': 'Collaboration',
        
        // Leadership
        'leadership skills': 'Leadership',
        'leadership': 'Leadership',
        'leading': 'Leadership',
        'team leadership': 'Leadership',
        'people management': 'People Management',
        'team management': 'Team Management',
        
        // Customer
        'customer service': 'Customer Service',
        'customer support': 'Customer Service',
        'client services': 'Customer Service',
        'customer relations': 'Customer Service',
        'client management': 'Client Management',
        
        // Decision Making
        'decision making': 'Decision Making',
        'decision-making': 'Decision Making',
        'decisions': 'Decision Making',
        
        // Adaptability
        'adaptability': 'Adaptability',
        'adaptable': 'Adaptability',
        'flexibility': 'Adaptability',
        'flexible': 'Adaptability',
        
        // Organization
        'organization': 'Organization',
        'organizational': 'Organization',
        'organised': 'Organization',
        'organized': 'Organization',
        'time management': 'Time Management',
        'time management skills': 'Time Management',
        
        // Critical Thinking
        'critical thinking': 'Critical Thinking',
        'critical thought': 'Critical Thinking',
        
        // Creativity
        'creativity': 'Creativity',
        'creative': 'Creativity',
        'creative thinking': 'Creativity',
        'innovation': 'Innovation',
        
        // Planning
        'planning': 'Planning',
        'strategic planning': 'Planning',
        'project planning': 'Planning',
        
        // Reporting
        'reporting': 'Reporting',
        'report writing': 'Reporting',
        'data reporting': 'Reporting',
        
        // Risk
        'risk management': 'Risk Management',
        'risk assessment': 'Risk Management',
        
        // Stakeholder
        'stakeholder management': 'Stakeholder Management',
        'stakeholder engagement': 'Stakeholder Management',
        
        // Negotiation
        'negotiation': 'Negotiation',
        'negotiating': 'Negotiation',
        
        // Presentation
        'presentation': 'Presentation',
        'presentation skills': 'Presentation',
        
        // Writing
        'writing': 'Writing',
        // ✅ FIXED: 'written communication' already exists above, removed duplicate
        
        // Research
        'research': 'Research',
        'research skills': 'Research',
        
        // Sales
        'sales': 'Sales',
        'selling': 'Sales',
        'business development': 'Business Development',
        'lead generation': 'Lead Generation',
        'closing': 'Closing',
    };
    
    return canonicalMap[lower] || skill;
};

// ============================================
// 3. NON-SKILL FILTER
// ============================================
const isNonSkill = (skill: string): boolean => {
    const lower = skill.toLowerCase().trim();
    
    // Languages
    const languages = [
        'english', 'urdu', 'hindi', 'arabic', 'french', 'german', 'spanish',
        'chinese', 'japanese', 'korean', 'russian', 'italian', 'turkish',
        'portuguese', 'bengali', 'punjabi', 'sindhi', 'pashto', 'persian',
        'dutch', 'swedish', 'norwegian', 'danish', 'finnish', 'polish',
        'greek', 'hebrew', 'thai', 'vietnamese', 'indonesian', 'malay',
        'language', 'languages', 'proficiency', 'fluent', 'native',
        'bilingual', 'trilingual', 'multilingual', 'conversational',
        'english proficiency', 'spoken english', 'written english',
        'business english', 'native english', 'english language',
        'urdu language', 'hindi language', 'arabic language'
    ];
    if (languages.some(l => lower.includes(l))) return true;
    
    // Education & Degrees
    const education = [
        'bachelor', 'bscs', 'bs', 'b.s', 'b.a', 'bba', 'mba', 'msc', 'ms',
        'bachelor of science', 'master of science', 'bachelor of arts',
        'master of business administration', 'phd', 'doctorate',
        'degree', 'certificate', 'diploma', 'matric', 'intermediate',
        'fsc', 'fa', 'ics', 'icom', 'b.ed', 'm.ed', 'dpt', 'mbbs',
        'm.phil', 'ph.d'
    ];
    if (education.some(e => lower.includes(e))) return true;
    
    // Personal Traits (Weak Fillers)
    const personalTraits = [
        'hardworking', 'hard working', 'honest', 'punctual', 'dedicated',
        'passionate', 'self motivated', 'self-motivated', 'motivated',
        'positive thinking', 'positive attitude', 'optimistic',
        'quick learner', 'fast learner', 'eager to learn', 'enthusiastic',
        'team player', 'creative', 'reliable', 'trustworthy', 'loyal',
        'friendly', 'polite', 'professional', 'good attitude',
        'willing to learn', 'adaptable', 'flexible', 'responsible'
    ];
    if (personalTraits.some(t => lower.includes(t))) return true;
    
    // Weak Generic Fillers
    const weakFillers = [
        'good communication', 'basic computer', 'internet', 'email',
        'ms office', 'microsoft office', 'microsoft word', 'microsoft excel',
        'powerpoint', 'ms powerpoint', 'excel', 'word', 'outlook',
        'typing', 'keyboard', 'computer skills', 'it skills'
    ];
    if (weakFillers.some(f => lower.includes(f))) return true;
    
    return false;
};

// ============================================
// 4. PROFESSION-AWARE SKILLS DATABASE
// ============================================
const getProfessionSkills = (jobTitle: string): string[] => {
    const title = jobTitle.toLowerCase().trim();

    // ----- Software Development -----
    if (title.includes('developer') || title.includes('software') || title.includes('programmer') ||
        title.includes('react') || title.includes('angular') || title.includes('vue') ||
        title.includes('node') || title.includes('python') || title.includes('java') ||
        title.includes('full stack') || title.includes('frontend') || title.includes('backend') ||
        title.includes('mobile') || title.includes('ios') || title.includes('android')) {
        return [
            'Problem Solving',
            'Debugging',
            'Version Control',
            'Code Review',
            'REST API Development'
        ];
    }

    // ----- Data & Analytics -----
    if (title.includes('data') || title.includes('analytics') || title.includes('analyst') ||
        title.includes('scientist') || title.includes('machine learning') ||
        title.includes('ai') || title.includes('business intelligence')) {
        return [
            'Data Analysis',
            'Critical Thinking',
            'Attention to Detail',
            'Reporting',
            'Problem Solving'
        ];
    }

    // ----- Design -----
    if (title.includes('designer') || title.includes('graphic') || title.includes('ui') ||
        title.includes('ux') || title.includes('visual') || title.includes('creative') ||
        title.includes('brand') || title.includes('art director')) {
        return [
            'Creativity',
            'Visual Communication',
            'Brand Identity',
            'Attention to Detail',
            'Design Thinking'
        ];
    }

    // ----- Finance & Accounting -----
    if (title.includes('account') || title.includes('finance') || title.includes('audit') ||
        title.includes('controller') || title.includes('cpa') || title.includes('tax') ||
        title.includes('treasury') || title.includes('budget') || title.includes('banker')) {
        return [
            'Financial Analysis',
            'Attention to Detail',
            'Accuracy',
            'Reconciliation',
            'Compliance'
        ];
    }

    // ----- Education -----
    if (title.includes('teacher') || title.includes('professor') || title.includes('lecturer') ||
        title.includes('educator') || title.includes('instructor') || title.includes('principal') ||
        title.includes('academic') || title.includes('school') || title.includes('faculty')) {
        return [
            'Lesson Planning',
            'Classroom Management',
            'Student Assessment',
            'Adaptability',
            'Organization'
        ];
    }

    // ----- Sales -----
    if (title.includes('sales') || title.includes('business development') || 
        title.includes('account executive') || title.includes('bdm') ||
        title.includes('territory') || title.includes('client partner')) {
        return [
            'Negotiation',
            'Relationship Building',
            'Lead Generation',
            'Customer Engagement',
            'Problem Solving'
        ];
    }

    // ----- Customer Support -----
    if (title.includes('customer') || title.includes('support') || title.includes('helpdesk') ||
        title.includes('client services') || title.includes('technical support')) {
        return [
            'Conflict Resolution',
            'Customer Relationship Management',
            'Active Listening',
            'Problem Solving',
            'Adaptability'
        ];
    }

    // ----- Project Management -----
    if (title.includes('project manager') || title.includes('project lead') ||
        title.includes('scrum master') || title.includes('program manager') ||
        title.includes('delivery manager') || title.includes('project coordinator')) {
        return [
            'Risk Management',
            'Stakeholder Management',
            'Planning',
            'Problem Solving',
            'Decision Making'
        ];
    }

    // ----- HR -----
    if (title.includes('hr') || title.includes('human resources') || title.includes('recruiter') ||
        title.includes('talent acquisition') || title.includes('people operations') ||
        title.includes('hrbp') || title.includes('hris')) {
        return [
            'Talent Sourcing',
            'Interviewing',
            'Employee Relations',
            'Organizational Skills',
            'Communication'
        ];
    }

    // ----- Marketing -----
    if (title.includes('marketing') || title.includes('digital marketing') ||
        title.includes('seo') || title.includes('content') || title.includes('social media') ||
        title.includes('brand') || title.includes('growth') || title.includes('performance')) {
        return [
            'Strategic Thinking',
            'Content Strategy',
            'Data Analysis',
            'Creativity',
            'Project Management'
        ];
    }

    // ----- Engineering -----
    if (title.includes('engineer') || title.includes('engineering') || 
        title.includes('civil') || title.includes('electrical') || title.includes('mechanical') ||
        title.includes('chemical') || title.includes('industrial') || title.includes('petroleum') ||
        title.includes('structural') || title.includes('environmental')) {
        return [
            'Technical Analysis',
            'Problem Solving',
            'Project Coordination',
            'Attention to Detail',
            'Safety Compliance'
        ];
    }

    // ----- Medical & Healthcare -----
    if (title.includes('doctor') || title.includes('physician') || title.includes('nurse') ||
        title.includes('medical') || title.includes('dentist') || title.includes('pharmacist') ||
        title.includes('clinical') || title.includes('healthcare') || title.includes('therapist') ||
        title.includes('radiologist') || title.includes('cardiologist')) {
        return [
            'Patient Care',
            'Clinical Assessment',
            'Medical Documentation',
            'Attention to Detail',
            'Communication'
        ];
    }

    // ----- Vocational -----
    if (title.includes('electrician') || title.includes('plumber') || title.includes('carpenter') ||
        title.includes('welder') || title.includes('construction') || title.includes('mason') ||
        title.includes('technician') || title.includes('mechanic') || title.includes('maintenance')) {
        return [
            'Technical Proficiency',
            'Safety Awareness',
            'Problem Solving',
            'Quality Assurance',
            'Blueprint Reading'
        ];
    }

    // ----- Legal -----
    if (title.includes('lawyer') || title.includes('attorney') || title.includes('advocate') ||
        title.includes('legal') || title.includes('barrister') || title.includes('judge') ||
        title.includes('law') || title.includes('legal advisor')) {
        return [
            'Legal Research',
            'Analytical Thinking',
            'Attention to Detail',
            'Negotiation',
            'Client Communication'
        ];
    }

    // ----- Freelancer -----
    if (title.includes('freelancer') || title.includes('freelance')) {
        return [
            'Client Management',
            'Time Management',
            'Self-Motivation',
            'Adaptability',
            'Problem Solving'
        ];
    }

    // ===== UNIVERSAL PROFESSIONAL COMPETENCIES =====
    return [
        'Problem Solving',
        'Attention to Detail',
        'Critical Thinking',
        'Adaptability',
        'Collaboration'
    ];
};

// ============================================
// 5. SKILL QUALITY SCORE (ATS-Friendly Check)
// ============================================
const isHighQualitySkill = (skill: string): boolean => {
    const lower = skill.toLowerCase();
    
    const atsFriendly = [
        'management', 'analysis', 'development', 'planning', 'strategy',
        'leadership', 'communication', 'collaboration', 'innovation',
        'execution', 'delivery', 'operations', 'governance', 'compliance',
        'optimization', 'transformation', 'digital', 'agile', 'scrum',
        'budget', 'forecast', 'reconciliation', 'audit', 'tax',
        'curriculum', 'assessment', 'instruction', 'classroom',
        'negotiation', 'closing', 'prospecting', 'generation',
        'design', 'creative', 'visual', 'brand', 'typography',
        'coding', 'debugging', 'api', 'database', 'architecture',
        'analytical', 'critical', 'strategic', 'tactical',
        'patient', 'clinical', 'diagnostic', 'treatment'
    ];
    
    if (atsFriendly.some(term => lower.includes(term))) return true;
    
    // Skills with numbers or specific technologies are usually high quality
    if (/\d/.test(skill)) return true;
    if (/[A-Z][a-z]{2,}/.test(skill)) return true; // Proper nouns
    
    return false;
};

// ============================================
// 6. MAIN ENHANCE FUNCTION
// ============================================
export const enhanceUserSkills = (skills: string, jobTitle: string = ''): string => {
    if (!skills) return '';

    // Parse existing skills
    let list = skills.includes(',') ? skills.split(',') : skills.split('\n');
    list = list.map(s => s.trim().replace(/^[•\-*]\s*/, '')).filter(s => s);

    // ============================================
    // PHASE 1: FILTER OUT NON-SKILLS
    // ============================================
    list = list.filter(skill => !isNonSkill(skill));

    // ============================================
    // PHASE 2: NORMALIZE AND DEDUPLICATE
    // ============================================
    const normalizedMap: Map<string, string> = new Map();
    
    for (const skill of list) {
        const normalized = normalizeSkill(skill);
        const canonical = getSkillCanonicalForm(skill);
        const key = normalized;
        
        // Keep the most professional version
        const existing = normalizedMap.get(key);
        if (!existing || isHighQualitySkill(canonical)) {
            normalizedMap.set(key, canonical);
        }
    }
    
    list = Array.from(normalizedMap.values());

    // ============================================
    // PHASE 3: GAP ANALYSIS
    // ============================================
    const existingLower = list.map(s => s.toLowerCase());
    const professionSkills = getProfessionSkills(jobTitle);
    
    // Only add skills that are relevant and missing
    for (const skill of professionSkills) {
        const skillLower = skill.toLowerCase();
        // Check if skill or its semantic variant exists
        const exists = existingLower.some(s => 
            s === skillLower || 
            getSkillCanonicalForm(s).toLowerCase() === skillLower
        );
        
        if (!exists && list.length < 15) {
            // Verify it's a high-quality skill
            if (isHighQualitySkill(skill) || skill.length > 3) {
                list.push(skill);
            }
        }
    }

    // ============================================
    // PHASE 4: FINAL DEDUPLICATION
    // ============================================
    const finalMap: Map<string, string> = new Map();
    for (const skill of list) {
        const key = normalizeSkill(skill);
        const canonical = getSkillCanonicalForm(skill);
        finalMap.set(key, canonical);
    }
    
    let result = Array.from(finalMap.values());

    // ============================================
    // PHASE 5: FINAL QUALITY FILTER
    // ============================================
    result = result.filter(skill => !isNonSkill(skill));

    // ============================================
    // PHASE 6: FORMAT PRESERVATION
    // ============================================
    // Capitalize properly
    const capitalized = result.map(s => {
        // Keep acronyms like HTML, CSS, API
        if (/^[A-Z]{2,}$/.test(s)) return s;
        // Keep proper case for technologies
        if (/^(React|Angular|Vue|Node|Python|Java|C\+\+|C#|TypeScript|JavaScript)$/i.test(s)) {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
        // Default capitalization
        return s.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    });

    // Return in same format as input
    return skills.includes(',') ? capitalized.join(', ') : capitalized.map(s => `• ${s}`).join('\n');
};