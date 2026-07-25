import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { enhanceUserSkills, detectProfession } from '../utils/aiGenerators';
import { 
    Loader2, 
    CheckCircle, AlertCircle, XCircle, Layers, Star, Wrench,
    Users, Code, Database, Cloud, Shield, Palette, BookOpen,
    GraduationCap, Briefcase, Award, TrendingUp, BarChart3,
    Plus, Settings, List, Hash, Sparkles, Zap, Cpu, Brain
} from 'lucide-react';

interface SkillsSectionProps {
    skills: string;
    setSkills: (skills: string) => void;
    enhanceSkills: () => void;
    expandSkills: () => void;
    generating: boolean;
    personalInfo?: any;
}

// Adin AI Brand Icon Component
const AdinAIIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg 
        className={className} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Glow effect */}
        <circle cx="12" cy="12" r="10" fill="rgba(59,130,246,0.08)" />
        
        {/* Center Core */}
        <circle cx="12" cy="12" r="4" fill="white" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
        
        {/* Top Diamond */}
        <path 
            d="M12 2L14 6L12 10L10 6L12 2Z" 
            fill="#A855F7" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        
        {/* Bottom Diamond */}
        <path 
            d="M12 14L14 18L12 22L10 18L12 14Z" 
            fill="#A855F7" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        
        {/* Left Hexagon */}
        <path 
            d="M5 9L7 7L10 8L10 11L7 13L5 11L5 9Z" 
            fill="#3B82F6" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        
        {/* Right Hexagon */}
        <path 
            d="M19 9L17 7L14 8L14 11L17 13L19 11L19 9Z" 
            fill="#3B82F6" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
    </svg>
);

// Loading variant with rotation
const AdinAILoadingIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg 
        className={`${className} animate-spin`} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="12" cy="12" r="10" fill="rgba(59,130,246,0.08)" />
        <circle cx="12" cy="12" r="4" fill="white" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
        <path 
            d="M12 2L14 6L12 10L10 6L12 2Z" 
            fill="#A855F7" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        <path 
            d="M12 14L14 18L12 22L10 18L12 14Z" 
            fill="#A855F7" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        <path 
            d="M5 9L7 7L10 8L10 11L7 13L5 11L5 9Z" 
            fill="#3B82F6" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        <path 
            d="M19 9L17 7L14 8L14 11L17 13L19 11L19 9Z" 
            fill="#3B82F6" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
    </svg>
);

// ============================================
// ✅ GRAMMAR & SPELLING FIXER
// ============================================
const fixSkillGrammar = (skill: string): string => {
    const corrections: Record<string, string> = {
        'javascrpt': 'JavaScript',
        'javasript': 'JavaScript',
        'js': 'JavaScript',
        'reactjs': 'React.js',
        'react js': 'React.js',
        'nextjs': 'Next.js',
        'next js': 'Next.js',
        'nodejs': 'Node.js',
        'node js': 'Node.js',
        'typescript': 'TypeScript',
        'typscript': 'TypeScript',
        'python': 'Python',
        'pythn': 'Python',
        'aws': 'AWS',
        'azure': 'Azure',
        'gcp': 'Google Cloud Platform',
        'docker': 'Docker',
        'kubernetes': 'Kubernetes',
        'k8s': 'Kubernetes',
        'git': 'Git',
        'github': 'GitHub',
        'mysql': 'MySQL',
        'postgresql': 'PostgreSQL',
        'mongodb': 'MongoDB',
        'redis': 'Redis',
        'figma': 'Figma',
        'photoshop': 'Adobe Photoshop',
        'illustrator': 'Adobe Illustrator',
        'premier': 'Adobe Premiere Pro',
        'after effects': 'Adobe After Effects',
        'excel': 'Microsoft Excel',
        'powerpoint': 'Microsoft PowerPoint',
        'word': 'Microsoft Word',
        'outlook': 'Microsoft Outlook',
        'quickbooks': 'QuickBooks',
        'salesforce': 'Salesforce',
        'hubspot': 'HubSpot',
        'wordpress': 'WordPress',
        'shopify': 'Shopify',
        'seo': 'SEO',
        'ppc': 'PPC',
        'google ads': 'Google Ads',
        'meta ads': 'Meta Ads',
        'crm': 'CRM',
        'erp': 'ERP',
        'agile': 'Agile Methodologies',
        'scrum': 'Scrum',
        'kanban': 'Kanban',
        'jira': 'Jira',
        'jenkins': 'Jenkins',
        'terraform': 'Terraform',
        'ansible': 'Ansible',
        'linux': 'Linux',
        'unix': 'Unix',
        'windows': 'Windows Server',
        'sql': 'SQL',
        'nosql': 'NoSQL',
        'rest': 'REST APIs',
        'graphql': 'GraphQL',
        'html': 'HTML5',
        'css': 'CSS3',
        'sass': 'SASS/SCSS',
        'tailwind': 'Tailwind CSS',
        'bootstrap': 'Bootstrap',
        'mui': 'Material-UI',
        'ant design': 'Ant Design'
    };
    
    const lower = skill.toLowerCase();
    for (const [wrong, correct] of Object.entries(corrections)) {
        if (lower === wrong || lower.includes(wrong)) {
            return correct;
        }
    }
    
    return skill.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

// ============================================
// ✅ CATEGORIZE SKILLS
// ============================================
const categorizeSkill = (skill: string): 'technical' | 'soft' | 'tools' | 'other' => {
    const technical = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'Java', 'C++', 'Rust', 'Go'];
    const tools = ['Figma', 'Adobe', 'Jira', 'Git', 'GitHub', 'Slack', 'Photoshop', 'Illustrator', 'Premiere', 'QuickBooks', 'Salesforce', 'Excel'];
    const soft = ['Communication', 'Leadership', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Adaptability', 'Creativity', 'Decision Making'];
    
    const lower = skill.toLowerCase();
    if (technical.some(t => lower.includes(t.toLowerCase()) || skill.includes(t))) return 'technical';
    if (tools.some(t => lower.includes(t.toLowerCase()) || skill.includes(t))) return 'tools';
    if (soft.some(s => lower.includes(s.toLowerCase()) || skill.includes(s))) return 'soft';
    return 'other';
};

// ============================================
// ✅ PROFESSION-SPECIFIC SKILL SUGGESTIONS (80+)
// ============================================
const professionSkills: Record<string, string[]> = {
    // ===== MEDICAL =====
    'doctor': ['Clinical Diagnosis', 'Patient Care', 'Medical Documentation', 'EMR Systems', 'Treatment Planning', 'Medical Research', 'Patient Communication', 'Emergency Response', 'Critical Thinking'],
    'nurse': ['Patient Care', 'Vital Signs Monitoring', 'Medication Administration', 'EMR Systems', 'Patient Education', 'Emergency Response', 'Clinical Assessment', 'Team Collaboration'],
    'dentist': ['Dental Surgery', 'Patient Care', 'Radiology', 'Oral Health Education', 'Treatment Planning', 'Anesthesia Administration', 'Precision', 'Communication'],
    'pharmacist': ['Medication Management', 'Patient Counseling', 'Pharmacy Software', 'Drug Interaction Knowledge', 'Inventory Management', 'Clinical Pharmacy', 'Attention to Detail'],
    
    // ===== NEW HEALTHCARE (9) =====
    'physiotherapist': ['Manual Therapy', 'Exercise Prescription', 'Patient Rehabilitation', 'Neurological Assessment', 'Orthopedic Assessment', 'Pain Management', 'Patient Education', 'Treatment Planning', 'Clinical Documentation'],
    'nutritionist': ['Nutritional Assessment', 'Diet Planning', 'Clinical Nutrition', 'Health Education', 'Weight Management', 'Public Health', 'Food Science', 'Patient Counseling', 'Research'],
    'medical-lab-technologist': ['Laboratory Testing', 'Hematology', 'Microbiology', 'Clinical Chemistry', 'Quality Control', 'Medical Equipment', 'Sample Analysis', 'Documentation', 'Safety Compliance'],
    'radiology-technologist': ['Radiographic Imaging', 'CT Scanning', 'MRI Procedures', 'Radiation Safety', 'Patient Positioning', 'Image Quality Assurance', 'Equipment Maintenance', 'Anatomy Knowledge', 'Patient Care'],
    'occupational-therapist': ['Functional Assessment', 'Rehabilitation', 'Therapeutic Activities', 'Patient Education', 'Home Modifications', 'Assistive Technology', 'Occupational Health', 'Mental Health', 'Pediatric Therapy'],
    'speech-therapist': ['Speech Assessment', 'Language Therapy', 'Articulation Disorders', 'Voice Disorders', 'Fluency Therapy', 'Neurogenic Disorders', 'Pediatric Speech Therapy', 'Swallowing Disorders', 'Patient Education'],
    'optometrist': ['Eye Examinations', 'Refraction', 'Ocular Disease Management', 'Contact Lens Fitting', 'Low Vision Assessment', 'Optical Prescriptions', 'Patient Education', 'Diagnostic Equipment', 'Binocular Vision'],
    'veterinary-doctor': ['Animal Health', 'Surgery', 'Diagnostic Imaging', 'Pharmacology', 'Emergency Medicine', 'Preventive Care', 'Client Education', 'Surgical Procedures', 'Animal Welfare'],
    'healthcare-administrator': ['Healthcare Operations', 'Medical Records', 'Compliance', 'Strategic Planning', 'Budget Management', 'Healthcare Regulations', 'Staff Management', 'Quality Improvement', 'Healthcare Technology'],
    
    // ===== IT & TECHNOLOGY =====
    'developer': ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'Python', 'Git', 'REST APIs', 'Docker', 'AWS', 'SQL', 'Problem Solving', 'Team Collaboration', 'Agile Methodologies'],
    'frontend': ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'Figma', 'Webpack', 'Performance Optimization', 'Responsive Design', 'UI/UX', 'HTML5', 'CSS3'],
    'backend': ['Node.js', 'Python', 'Java', 'Spring Boot', 'SQL', 'NoSQL', 'Docker', 'AWS', 'REST APIs', 'GraphQL', 'Microservices', 'System Design'],
    'full-stack': ['React.js', 'Node.js', 'TypeScript', 'Python', 'SQL', 'MongoDB', 'Docker', 'AWS', 'Git', 'REST APIs', 'GraphQL', 'System Architecture'],
    'devops': ['AWS', 'Azure', 'Google Cloud Platform', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'Terraform', 'Prometheus', 'Grafana', 'Linux', 'Python', 'CI/CD'],
    'cloud': ['AWS', 'Azure', 'Google Cloud Platform', 'Docker', 'Kubernetes', 'Terraform', 'Cloud Architecture', 'Serverless', 'DevOps', 'Python', 'Infrastructure as Code'],
    'data-scientist': ['Python', 'R', 'SQL', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Data Visualization', 'Machine Learning', 'Statistics', 'Deep Learning'],
    'data-analyst': ['SQL', 'Python', 'Tableau', 'Power BI', 'Excel', 'Data Visualization', 'Statistics', 'Business Intelligence', 'Communication', 'Analytical Thinking'],
    'cybersecurity': ['Network Security', 'Firewalls', 'SIEM', 'Penetration Testing', 'CISSP', 'Security Analysis', 'Cloud Security', 'Compliance', 'Risk Management', 'Incident Response'],
    'game-developer': ['Unity', 'C#', 'Unreal Engine', 'C++', '3D Modeling', 'Game Design', 'Animation', 'Physics', 'Multiplayer Networking', 'Problem Solving'],
    'mobile': ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin', 'Firebase', 'App Store Optimization', 'Mobile UI/UX', 'Cross-platform Development'],
    'ai-ml': ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'MLOps', 'SQL', 'Data Engineering'],
    'blockchain': ['Solidity', 'Web3.js', 'Ethereum', 'Blockchain Architecture', 'Smart Contracts', 'Cryptography', 'Node.js', 'Distributed Systems'],
    'qa': ['Selenium', 'JUnit', 'TestNG', 'Cypress', 'Postman', 'API Testing', 'Automation', 'Manual Testing', 'JIRA', 'SQL', 'Bug Tracking'],
    
    // ===== NEW IT (5) =====
    'software-engineer': ['Java', 'Python', 'C++', 'Data Structures', 'Algorithms', 'System Design', 'Agile', 'Git', 'CI/CD', 'Cloud Computing', 'Microservices', 'Problem Solving'],
    'ai-research-engineer': ['Python', 'TensorFlow', 'PyTorch', 'Deep Learning', 'NLP', 'Computer Vision', 'Reinforcement Learning', 'Mathematical Modeling', 'Research Methodology', 'Data Science', 'MLOps'],
    'embedded-systems-engineer': ['C', 'C++', 'Python', 'RTOS', 'Microcontrollers', 'Device Drivers', 'IoT', 'ARM Architecture', 'Firmware Development', 'Hardware-Software Integration', 'Debugging'],
    'database-administrator': ['SQL Server', 'Oracle', 'PostgreSQL', 'MySQL', 'MongoDB', 'Database Design', 'Performance Tuning', 'Backup & Recovery', 'High Availability', 'Security', 'Data Migration'],
    'mechatronics-engineer': ['C++', 'Python', 'PLC', 'Arduino', 'Raspberry Pi', 'ROS', 'Control Systems', 'Sensors', 'Actuators', 'Circuit Design', 'Mechanical Design', 'System Integration'],
    
    // ===== BUSINESS & MANAGEMENT =====
    'business': ['Strategic Planning', 'Business Development', 'Market Analysis', 'Financial Management', 'Leadership', 'Communication', 'Project Management', 'CRM', 'Negotiation'],
    'project-manager': ['Agile Methodologies', 'Scrum', 'Jira', 'Project Management', 'Stakeholder Management', 'Risk Management', 'Budgeting', 'Leadership', 'Communication', 'Kanban'],
    'product-manager': ['Product Strategy', 'User Research', 'Roadmap Planning', 'Agile', 'Data Analysis', 'Cross-functional Leadership', 'Communication', 'UX/UI', 'Market Analysis'],
    'operations-manager': ['Operations Management', 'Process Optimization', 'Supply Chain', 'Budgeting', 'Team Leadership', 'KPI Management', 'Lean Six Sigma', 'Strategic Planning'],
    'entrepreneur': ['Business Planning', 'Fundraising', 'Investor Relations', 'Product Development', 'Marketing Strategy', 'Leadership', 'Sales', 'Networking', 'Resilience'],
    'business-analyst': ['SQL', 'Data Analysis', 'Tableau', 'Business Intelligence', 'Project Management', 'Agile', 'Documentation', 'Communication', 'Problem Solving'],
    
    // ===== NEW BUSINESS (6) =====
    'finance-analyst': ['Advanced Excel', 'Financial Modeling', 'Data Analysis', 'Power BI', 'Financial Reporting', 'Valuation', 'Investment Analysis', 'Budgeting', 'Forecasting', 'Risk Analysis'],
    'financial-advisor': ['Wealth Management', 'Investment Strategy', 'Retirement Planning', 'Estate Planning', 'Tax Planning', 'Risk Assessment', 'Client Relationship', 'Portfolio Management', 'Insurance', 'Estate Planning'],
    'supply-chain-manager': ['Supply Chain Strategy', 'Procurement', 'Inventory Management', 'Logistics', 'Warehousing', 'Vendor Management', 'ERP Systems', 'Process Improvement', 'Data Analysis'],
    'procurement-officer': ['Strategic Sourcing', 'Vendor Management', 'Contract Negotiation', 'Purchasing', 'Inventory Control', 'Supplier Evaluation', 'Cost Reduction', 'Supply Chain', 'Compliance', 'ERP Systems'],
    'logistics-manager': ['Transportation Management', 'Warehousing', 'Distribution', 'Fleet Management', 'Supply Chain', 'Route Optimization', 'Warehouse Management Systems', 'Inventory Management', 'Customer Service'],
    'business-development-executive': ['Business Development', 'Sales Strategy', 'Market Research', 'Lead Generation', 'Client Acquisition', 'Relationship Management', 'Negotiation', 'Strategic Planning', 'CRM', 'Proposal Writing'],
    
    // ===== ENGINEERING =====
    'engineering': ['AutoCAD', 'MATLAB', 'Project Management', 'Technical Analysis', 'Problem Solving', 'Communication', 'Documentation', 'Quality Control', 'Team Collaboration'],
    'civil-engineer': ['AutoCAD', 'SAP2000', 'ETABS', 'Project Management', 'Structural Analysis', 'Site Management', 'Quality Control', 'Communication', 'Problem Solving'],
    'electrical-engineer': ['AutoCAD', 'MATLAB', 'PLC Programming', 'Electrical Design', 'Power Systems', 'Circuit Design', 'Project Management', 'Problem Solving'],
    'mechanical-engineer': ['SolidWorks', 'AutoCAD', 'MATLAB', 'CFD', 'Thermal Analysis', 'Project Management', 'Mechanical Design', 'Problem Solving'],
    'architect': ['AutoCAD', 'Revit', '3ds Max', 'Architectural Design', 'SketchUp', 'Building Codes', 'Construction Management', 'Project Management', 'Creativity'],
    
    // ===== NEW ENGINEERING (2) =====
    'automobile-engineer': ['AutoCAD', 'CATIA', 'SolidWorks', 'Vehicle Dynamics', 'Powertrain', 'Vehicle Safety', 'Engine Design', 'Electric Vehicles', 'Automotive Electronics', 'Project Management', 'MATLAB'],
    'mining-engineer': ['Mine Planning', 'Geology', 'Rock Mechanics', 'Mine Operations', 'Safety Management', 'Ventilation', 'Explosives Engineering', 'Resource Estimation', 'Environmental Management', 'Mining Software'],
    
    // ===== COMMERCE & FINANCE =====
    'accountant': ['QuickBooks', 'Advanced Excel', 'Financial Analysis', 'Auditing', 'Tax Preparation', 'GAAP', 'Financial Reporting', 'Accounting Software', 'Attention to Detail'],
    'banker': ['Financial Analysis', 'Risk Management', 'Banking Software', 'Customer Relationship Management', 'Loan Processing', 'Financial Reporting', 'Communication'],
    'financial-analyst': ['Advanced Excel', 'Financial Modeling', 'Data Analysis', 'Valuation', 'Financial Reporting', 'Investment Analysis', 'Power BI', 'Analytical Thinking'],
    
    // ===== SALES & MARKETING =====
    'sales': ['Sales', 'Negotiation', 'CRM', 'Lead Generation', 'Cold Calling', 'Account Management', 'Communication', 'Closing Skills', 'Relationship Building'],
    'marketing': ['Digital Marketing', 'Content Marketing', 'SEO', 'Social Media', 'Google Analytics', 'Email Marketing', 'Brand Management', 'Communication', 'Creativity'],
    'digital-marketing': ['SEO', 'Google Ads', 'Meta Ads', 'Analytics', 'Content Marketing', 'Email Marketing', 'Social Media', 'Conversion Optimization', 'PPC'],
    'seo': ['SEO', 'Google Analytics', 'Search Console', 'Keyword Research', 'Link Building', 'Content Strategy', 'Technical SEO', 'SEMrush', 'Data Analysis'],
    'content-creator': ['Content Writing', 'Editing', 'Storytelling', 'SEO', 'Social Media', 'Content Strategy', 'WordPress', 'Creativity', 'Research'],
    'copywriter': ['Copywriting', 'Persuasive Writing', 'SEO', 'Content Strategy', 'Brand Voice', 'Email Marketing', 'Creativity', 'Editing'],
    
    // ===== NEW SALES & MARKETING (1) =====
    'customer-support-specialist': ['Customer Service', 'Problem Solving', 'Communication', 'CRM', 'Technical Support', 'Ticket Management', 'Team Collaboration', 'Active Listening', 'Negotiation', 'Empathy'],
    
    // ===== CREATIVE & DESIGN =====
    'designer': ['Figma', 'Adobe Creative Suite', 'Design Thinking', 'UI/UX', 'Creativity', 'Communication', 'Problem Solving', 'Typography', 'Color Theory'],
    'graphic-designer': ['Adobe Creative Suite', 'Figma', 'Canva', 'Brand Identity', 'Typography', 'Color Theory', 'Creativity', 'Communication', 'Layout Design'],
    'ui-ux': ['Figma', 'Adobe XD', 'Sketch', 'UX Research', 'User Testing', 'Prototyping', 'Design Systems', 'UI Design', 'Interaction Design'],
    
    // ===== EDUCATION =====
    'teacher': ['Teaching', 'Lesson Planning', 'Classroom Management', 'Student Assessment', 'Communication', 'Curriculum Development', 'Mentoring'],
    'professor': ['Teaching', 'Research', 'Academic Writing', 'Curriculum Development', 'Mentoring', 'Student Assessment', 'Communication', 'Leadership', 'Subject Matter Expertise'],
    
    // ===== GENERAL =====
    'general': ['Communication', 'Team Collaboration', 'Problem Solving', 'Time Management', 'Adaptability', 'Leadership', 'Critical Thinking']
};

// ============================================
// ✅ GET SMART SUGGESTIONS (Removed: Patience, Empathy, English Proficiency)
// ============================================
const getSmartSuggestions = (profession: string, existingSkills: string[]): string[] => {
    const suggestions = professionSkills[profession] || professionSkills['general'];
    const existingLower = existingSkills.map(s => s.toLowerCase());
    
    const newSkills = suggestions.filter(s => {
        const lower = s.toLowerCase();
        return !existingLower.some(existing => 
            existing.includes(lower) || lower.includes(existing) ||
            existing.split(' ').some(w => lower.includes(w)) ||
            lower.split(' ').some(w => existing.includes(w))
        );
    });
    
    return newSkills.slice(0, 6);
};

// ============================================
// ✅ MAIN COMPONENT
// ============================================
const SkillsSection: React.FC<SkillsSectionProps> = ({
    skills,
    setSkills,
    enhanceSkills,
    expandSkills,
    generating,
    personalInfo
}) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [profession, setProfession] = useState('');
    const [showCategory, setShowCategory] = useState(false);

    useEffect(() => {
        const title = personalInfo?.title || '';
        const detected = detectProfession(title);
        setProfession(detected);
    }, [personalInfo]);

    const getSkillArray = (): string[] => {
        if (!skills.trim()) return [];
        if (skills.includes(',')) {
            return skills.split(',').map(s => s.trim()).filter(s => s);
        }
        return skills.split('\n')
            .map(s => s.trim())
            .map(s => s.replace(/^[•\-*]\s*/, ''))
            .filter(s => s);
    };

    const getSkillCount = (): number => getSkillArray().length;
    const skillCount = getSkillCount();
    const skillArray = getSkillArray();
    const hasSkills = skillCount > 0;

    // ============================================
    // ✅ AUTO FIX DUPLICATES & GRAMMAR
    // ============================================
    const fixSkills = (): void => {
        if (!hasSkills) {
            toast.error('Add some skills first');
            return;
        }
        
        let fixedSkills = skillArray.map(s => fixSkillGrammar(s));
        
        const seen = new Set();
        fixedSkills = fixedSkills.filter(s => {
            const lower = s.toLowerCase();
            if (seen.has(lower)) return false;
            seen.add(lower);
            return true;
        });
        
        fixedSkills = fixedSkills.map(s => {
            return s.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        });
        
        const formattedSkills = skills.includes(',') 
            ? fixedSkills.join(', ')
            : fixedSkills.map(s => `• ${s}`).join('\n');
        
        setSkills(formattedSkills);
        const removedCount = skillArray.length - fixedSkills.length;
        toast.success(`✅ Fixed ${removedCount > 0 ? removedCount + ' duplicate' + (removedCount > 1 ? 's' : '') + ' and ' : ''}grammar!`);
    };

    // ============================================
    // ✅ CATEGORIZE SKILLS
    // ============================================
    const getCategoryStats = () => {
        const stats = { technical: 0, soft: 0, tools: 0, other: 0 };
        skillArray.forEach(skill => {
            const cat = categorizeSkill(skill);
            stats[cat] = (stats[cat] || 0) + 1;
        });
        return stats;
    };

    // ============================================
    // ✅ SMART SUGGESTIONS
    // ============================================
    const handleGetSuggestions = () => {
        const existingSkills = skillArray;
        const newSuggestions = getSmartSuggestions(profession, existingSkills);
        
        if (newSuggestions.length === 0) {
            toast.success('You already have all recommended skills!');
            return;
        }
        
        setSuggestions(newSuggestions);
        setSelectedSuggestions(newSuggestions);
        setIsSuggesting(true);
        toast.success(`💡 ${newSuggestions.length} new skills found!`);
    };

    const handleAddSuggestions = () => {
        if (selectedSuggestions.length === 0) {
            toast.error('Select at least one skill');
            return;
        }
        
        const existingSkills = skillArray;
        const newSkills = [...existingSkills, ...selectedSuggestions];
        const formattedSkills = skills.includes(',') 
            ? newSkills.join(', ')
            : newSkills.map(s => `• ${s}`).join('\n');
        
        setSkills(formattedSkills);
        setIsSuggesting(false);
        setSuggestions([]);
        toast.success(`✅ Added ${selectedSuggestions.length} skills!`);
    };

    const toggleSuggestion = (skill: string) => {
        setSelectedSuggestions(prev => 
            prev.includes(skill) 
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    };

    const selectAll = () => setSelectedSuggestions([...suggestions]);
    const clearSuggestions = () => {
        setIsSuggesting(false);
        setSuggestions([]);
        setSelectedSuggestions([]);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2.5 tracking-tight">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-blue-500/20">
                            <Code size={18} className="text-blue-400" />
                        </div>
                        Skills
                    </h2>
                    {profession && profession !== 'general' && (
                        <p className="text-xs text-blue-400/80 mt-0.5 tracking-tight font-medium">
                            {profession.replace('-', ' ').toUpperCase()}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {hasSkills && (
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium tracking-wide backdrop-blur-sm border ${
                            skillCount >= 10 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            skillCount >= 7 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            skillCount >= 4 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                            {skillCount >= 10 ? 'Elite' :
                             skillCount >= 7 ? 'Expert' :
                             skillCount >= 4 ? 'Proficient' :
                             'Developing'}
                        </span>
                    )}
                    <button
                        onClick={() => setShowCategory(!showCategory)}
                        className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-gray-800/50"
                    >
                        {showCategory ? 'Hide Stats' : 'Show Stats'}
                    </button>
                </div>
            </div>

            {/* Category Stats */}
            {showCategory && hasSkills && (
                <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
                    {Object.entries(getCategoryStats()).map(([cat, count]) => (
                        <div key={cat} className="text-center">
                            <p className="text-lg font-semibold text-white">{count}</p>
                            <p className="text-[9px] text-gray-500 uppercase tracking-wider">{cat}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
                <button 
                    onClick={() => {
                        if (!hasSkills) {
                            toast.error('Add some skills first');
                            return;
                        }
                        enhanceSkills();
                    }}
                    disabled={generating || !hasSkills}
                    className="h-9 px-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium text-xs tracking-tight flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 active:scale-98 backdrop-blur-sm border border-white/10 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                    {generating ? <AdinAILoadingIcon className="w-3.5 h-3.5" /> : <AdinAIIcon className="w-3.5 h-3.5" />}
                    {generating ? 'Enhancing...' : 'AI Enhance'}
                </button>

                <button 
                    onClick={expandSkills}
                    disabled={generating || skillCount < 2}
                    className="h-9 px-3.5 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-medium text-xs tracking-tight flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-98 backdrop-blur-sm border border-white/10 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                    <Plus size={14} />
                    Smart Expand
                </button>

                <button 
                    onClick={fixSkills}
                    disabled={!hasSkills || generating}
                    className="h-9 px-3.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-medium text-xs tracking-tight flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/20 active:scale-98 backdrop-blur-sm border border-white/10 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                    <CheckCircle size={14} />
                    Fix Skills
                </button>

                <button 
                    onClick={handleGetSuggestions}
                    disabled={isSuggesting || generating}
                    className="h-9 px-3.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs tracking-tight flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-98 backdrop-blur-sm border border-white/10 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                    <List size={14} />
                    Suggestions
                </button>

                {hasSkills && (
                    <span className="text-[10px] text-gray-500 ml-auto font-medium tracking-wide">
                        {skillCount} skill{skillCount > 1 ? 's' : ''}
                        {skillCount >= 10 && ' • Complete'}
                    </span>
                )}
            </div>

            {/* Suggestions Panel */}
            {isSuggesting && suggestions.length > 0 && (
                <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">Smart Suggestions</span>
                            <span className="text-[10px] text-gray-500 font-medium">
                                ({selectedSuggestions.length}/{suggestions.length})
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={selectAll} className="text-[10px] text-gray-400 hover:text-white transition-colors duration-200 font-medium">
                                Select All
                            </button>
                            <button onClick={clearSuggestions} className="text-[10px] text-gray-400 hover:text-white transition-colors duration-200 font-medium">
                                Clear
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {suggestions.map((skill, idx) => (
                            <button
                                key={idx}
                                onClick={() => toggleSuggestion(skill)}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-200 ${
                                    selectedSuggestions.includes(skill)
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                                        : 'bg-gray-700/30 text-gray-400 border border-transparent hover:bg-gray-700/50 hover:text-gray-200'
                                }`}
                            >
                                {selectedSuggestions.includes(skill) && '✓ '}
                                {skill}
                            </button>
                        ))}
                    </div>
                    
                    <button
                        onClick={handleAddSuggestions}
                        disabled={selectedSuggestions.length === 0}
                        className="w-full py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs tracking-tight transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-98 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        Add {selectedSuggestions.length} Skill{selectedSuggestions.length > 1 ? 's' : ''}
                    </button>
                </div>
            )}

            {/* Text Area */}
            <textarea 
                value={skills} 
                onChange={(e) => setSkills(e.target.value)} 
                rows={8} 
                placeholder="Type your skills here...
Example: SEO, Google Ads, PPC, Analytics

Or each skill on a new line:
• JavaScript
• React
• Node.js"
                className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white outline-none resize-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 font-mono text-sm transition-all duration-300 placeholder:text-gray-500"
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-lg bg-gray-800/30 border border-gray-700/50 text-center backdrop-blur-sm">
                    <p className="text-lg font-semibold text-white">{skillCount}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">Total</p>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-800/30 border border-gray-700/50 text-center backdrop-blur-sm">
                    <p className="text-lg font-semibold text-white">
                        {skillCount >= 10 ? '⚡' : skillCount >= 7 ? '💪' : skillCount >= 4 ? '📈' : '📝'}
                    </p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">Level</p>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-800/30 border border-gray-700/50 text-center backdrop-blur-sm">
                    <p className="text-lg font-semibold text-white">
                        {profession !== 'general' ? '💻' : '🌐'}
                    </p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">
                        {profession !== 'general' ? profession.replace('-', ' ').toUpperCase() : 'General'}
                    </p>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-800/30 border border-gray-700/50 text-center backdrop-blur-sm">
                    <p className="text-lg font-semibold text-white">
                        {skillCount >= 7 ? '🏆' : '⏳'}
                    </p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">
                        {skillCount >= 7 ? 'Excellent' : `${7 - skillCount} more needed`}
                    </p>
                </div>
            </div>

            {/* Duplicate Warning */}
            {skillArray.length !== new Set(skillArray.map(s => s.toLowerCase())).size && (
                <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/20 backdrop-blur-sm">
                    <p className="text-xs text-red-400 flex items-center gap-2">
                        <AlertCircle size={14} />
                        Duplicate skills detected! Click <strong className="font-semibold">"Fix Skills"</strong> to remove them.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SkillsSection;