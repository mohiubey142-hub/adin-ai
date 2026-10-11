// utils/skills-suggester/legal.ts
// ============================================
// LEGAL SKILLS - 38 Professions
// ============================================

export const legalSkills: Record<string, string[]> = {
    // ============================================
    // CORE LEGAL (7) — EXISTING
    // ============================================
    'law': [
        'Legal Research', 'Legal Writing', 'Contract Law',
        'Litigation', 'Legal Analysis', 'Client Counseling',
        'Negotiation', 'Communication', 'Critical Thinking',
        'Legal Drafting', 'Case Management', 'Court Procedures',
        'Legal Ethics', 'Regulatory Compliance', 'Dispute Resolution',
        'Intellectual Property', 'Corporate Law', 'Criminal Law',
        'Civil Law', 'Family Law', 'Real Estate Law',
        'Westlaw', 'LexisNexis', 'MS Office',
        'Time Management', 'Attention to Detail'
    ],
    'lawyer': [
        'Legal Research', 'Legal Writing', 'Litigation',
        'Court Representation', 'Client Counseling', 'Contract Drafting',
        'Negotiation', 'Legal Analysis', 'Case Management',
        'Criminal Law', 'Civil Law', 'Corporate Law',
        'Family Law', 'Real Estate Law', 'Intellectual Property',
        'Legal Ethics', 'Regulatory Compliance', 'Dispute Resolution',
        'Depositions', 'Trial Advocacy', 'Appellate Practice',
        'Westlaw', 'LexisNexis', 'Communication',
        'Critical Thinking', 'Time Management'
    ],
    'advocate': [
        'Court Representation', 'Legal Advocacy', 'Litigation',
        'Legal Research', 'Legal Writing', 'Client Counseling',
        'Negotiation', 'Public Speaking', 'Legal Analysis',
        'Criminal Law', 'Civil Law', 'Constitutional Law',
        'Human Rights Law', 'Legal Ethics', 'Case Management',
        'Trial Advocacy', 'Appellate Practice', 'Dispute Resolution',
        'Legal Drafting', 'Regulatory Compliance', 'Westlaw',
        'LexisNexis', 'Communication', 'Critical Thinking',
        'Time Management', 'Attention to Detail'
    ],
    'attorney': [
        'Legal Research', 'Legal Writing', 'Litigation',
        'Contract Law', 'Corporate Law', 'Client Counseling',
        'Negotiation', 'Legal Analysis', 'Compliance',
        'Intellectual Property', 'Mergers & Acquisitions', 'Securities Law',
        'Employment Law', 'Real Estate Law', 'Tax Law',
        'Legal Ethics', 'Regulatory Compliance', 'Dispute Resolution',
        'Due Diligence', 'Legal Drafting', 'Westlaw',
        'LexisNexis', 'Communication', 'Critical Thinking',
        'Time Management', 'Attention to Detail'
    ],
    'barrister': [
        'Court Advocacy', 'Legal Research', 'Legal Writing',
        'Litigation', 'Client Counseling', 'Legal Analysis',
        'Public Speaking', 'Negotiation', 'Case Management',
        'Criminal Law', 'Civil Law', 'Constitutional Law',
        'Human Rights Law', 'Legal Ethics', 'Trial Advocacy',
        'Appellate Practice', 'Dispute Resolution', 'Legal Drafting',
        'Cross-Examination', 'Evidence Law', 'Westlaw',
        'LexisNexis', 'Communication', 'Critical Thinking',
        'Time Management', 'Attention to Detail'
    ],
    'legal-advisor': [
        'Legal Advisory', 'Legal Research', 'Contract Review',
        'Compliance', 'Risk Assessment', 'Legal Writing',
        'Regulatory Affairs', 'Corporate Governance', 'Legal Drafting',
        'Client Counseling', 'Negotiation', 'Legal Analysis',
        'Intellectual Property', 'Employment Law', 'Data Privacy',
        'Legal Ethics', 'Dispute Resolution', 'Policy Development',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Time Management', 'Attention to Detail', 'Team Collaboration',
        'MS Office', 'Westlaw'
    ],
    'judge': [
        'Judicial Decision Making', 'Legal Analysis', 'Court Procedures',
        'Case Management', 'Legal Research', 'Legal Writing',
        'Judgment Drafting', 'Evidence Law', 'Constitutional Law',
        'Criminal Law', 'Civil Law', 'Legal Ethics',
        'Court Administration', 'Dispute Resolution', 'Mediation',
        'Critical Thinking', 'Impartiality', 'Communication',
        'Public Speaking', 'Time Management', 'Attention to Detail',
        'Legal Interpretation', 'Sentencing', 'Case Law Analysis',
        'Judicial Conduct', 'Continuing Education'
    ],

    // ============================================
    // ✅ NEW BATCH 5 — LEGAL SUPPORT (10)
    // ============================================
    'legal-secretary': [
        'Legal Administration', 'Document Preparation', 'Filing',
        'Scheduling', 'Client Communication', 'Legal Terminology',
        'MS Office', 'Legal Software', 'Data Entry',
        'Communication', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Confidentiality', 'Organizational Skills',
        'Multitasking', 'Phone Handling', 'Email Management',
        'Record Keeping', 'Professionalism'
    ],
    'legal-assistant': [
        'Legal Support', 'Document Preparation', 'Legal Research',
        'Filing', 'Client Communication', 'Legal Terminology',
        'MS Office', 'Legal Software', 'Data Entry',
        'Communication', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Confidentiality', 'Organizational Skills',
        'Multitasking', 'Scheduling', 'Record Keeping',
        'Professionalism', 'Continuous Learning'
    ],
    'paralegal': [
        'Paralegal Work', 'Legal Research', 'Legal Writing',
        'Document Preparation', 'Case Management', 'Client Communication',
        'Court Filing', 'Legal Drafting', 'Discovery',
        'Westlaw', 'LexisNexis', 'MS Office',
        'Communication', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Confidentiality',
        'Organizational Skills', 'Professionalism'
    ],
    'legal-executive': [
        'Legal Support', 'Legal Research', 'Document Review',
        'Client Communication', 'Legal Drafting', 'Compliance',
        'MS Office', 'Legal Software', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Confidentiality', 'Organizational Skills',
        'Multitasking', 'Reporting', 'Record Keeping',
        'Professionalism', 'Continuous Learning'
    ],
    'legal-officer': [
        'Legal Compliance', 'Contract Review', 'Legal Research',
        'Legal Drafting', 'Regulatory Affairs', 'Risk Assessment',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Confidentiality', 'MS Office', 'Reporting',
        'Documentation', 'Policy Development', 'Dispute Resolution',
        'Professionalism', 'Continuous Learning'
    ],
    'corporate-lawyer': [
        'Corporate Law', 'Mergers & Acquisitions', 'Contract Drafting',
        'Corporate Governance', 'Securities Law', 'Compliance',
        'Legal Research', 'Legal Writing', 'Due Diligence',
        'Client Counseling', 'Negotiation', 'Legal Analysis',
        'Westlaw', 'LexisNexis', 'Communication',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Professionalism'
    ],
    'corporate-legal-advisor': [
        'Corporate Legal Advisory', 'Corporate Governance', 'Contract Review',
        'Compliance', 'Risk Assessment', 'Regulatory Affairs',
        'Legal Drafting', 'Legal Research', 'Client Counseling',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'MS Office', 'Reporting', 'Policy Development',
        'Confidentiality', 'Professionalism'
    ],
    'litigation-lawyer': [
        'Litigation', 'Court Representation', 'Trial Advocacy',
        'Legal Research', 'Legal Writing', 'Client Counseling',
        'Negotiation', 'Case Management', 'Discovery',
        'Depositions', 'Appellate Practice', 'Dispute Resolution',
        'Westlaw', 'LexisNexis', 'Communication',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Public Speaking', 'Professionalism'
    ],
    'criminal-lawyer': [
        'Criminal Law', 'Criminal Defense', 'Court Representation',
        'Legal Research', 'Legal Writing', 'Client Counseling',
        'Negotiation', 'Case Management', 'Trial Advocacy',
        'Evidence Law', 'Criminal Procedure', 'Dispute Resolution',
        'Westlaw', 'LexisNexis', 'Communication',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Public Speaking', 'Professionalism'
    ],
    'family-lawyer': [
        'Family Law', 'Divorce Proceedings', 'Child Custody',
        'Legal Research', 'Legal Writing', 'Client Counseling',
        'Negotiation', 'Mediation', 'Case Management',
        'Court Representation', 'Dispute Resolution', 'Document Drafting',
        'Westlaw', 'LexisNexis', 'Communication',
        'Empathy', 'Critical Thinking', 'Attention to Detail',
        'Confidentiality', 'Professionalism'
    ],
    'immigration-lawyer': [
        'Immigration Law', 'Visa Applications', 'Client Counseling',
        'Legal Research', 'Legal Writing', 'Case Management',
        'Regulatory Compliance', 'Court Representation', 'Document Preparation',
        'Westlaw', 'LexisNexis', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Cultural Competence', 'Confidentiality',
        'Multilingual', 'Professionalism'
    ],
    'tax-lawyer': [
        'Tax Law', 'Tax Planning', 'Tax Compliance',
        'Legal Research', 'Legal Writing', 'Client Counseling',
        'Tax Returns', 'Dispute Resolution', 'Regulatory Compliance',
        'Westlaw', 'LexisNexis', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Confidentiality',
        'Financial Analysis', 'Professionalism'
    ],
    'intellectual-property-lawyer': [
        'Intellectual Property', 'Patent Law', 'Trademark Law',
        'Copyright Law', 'Legal Research', 'Legal Writing',
        'Client Counseling', 'Contract Drafting', 'Licensing',
        'Litigation', 'Regulatory Compliance', 'Due Diligence',
        'Westlaw', 'LexisNexis', 'Communication',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Technical Knowledge', 'Professionalism'
    ],
    'patent-attorney': [
        'Patent Law', 'Patent Prosecution', 'Patent Applications',
        'Intellectual Property', 'Legal Research', 'Legal Writing',
        'Client Counseling', 'Technical Analysis', 'Licensing',
        'Litigation', 'Regulatory Compliance', 'Due Diligence',
        'Westlaw', 'USPTO', 'Communication',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Technical Knowledge', 'Professionalism'
    ],
    'trademark-attorney': [
        'Trademark Law', 'Trademark Registration', 'Trademark Prosecution',
        'Intellectual Property', 'Legal Research', 'Legal Writing',
        'Client Counseling', 'Brand Protection', 'Licensing',
        'Litigation', 'Regulatory Compliance', 'Due Diligence',
        'Westlaw', 'USPTO', 'Communication',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Brand Knowledge', 'Professionalism'
    ],
    'constitutional-lawyer': [
        'Constitutional Law', 'Fundamental Rights', 'Judicial Review',
        'Legal Research', 'Legal Writing', 'Client Counseling',
        'Litigation', 'Court Representation', 'Public Interest',
        'Case Management', 'Dispute Resolution', 'Regulatory Compliance',
        'Westlaw', 'LexisNexis', 'Communication',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Public Speaking', 'Professionalism'
    ],
    'employment-lawyer': [
        'Employment Law', 'Labor Law', 'Contract Drafting',
        'Legal Research', 'Legal Writing', 'Client Counseling',
        'Negotiation', 'Dispute Resolution', 'Compliance',
        'Regulatory Affairs', 'Court Representation', 'Mediation',
        'Westlaw', 'LexisNexis', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Professionalism'
    ],
    'commercial-lawyer': [
        'Commercial Law', 'Contract Law', 'Business Transactions',
        'Legal Research', 'Legal Writing', 'Client Counseling',
        'Negotiation', 'Due Diligence', 'Compliance',
        'Regulatory Affairs', 'Dispute Resolution', 'Corporate Governance',
        'Westlaw', 'LexisNexis', 'Communication',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Professionalism'
    ],
    'contract-lawyer': [
        'Contract Law', 'Contract Drafting', 'Contract Review',
        'Legal Research', 'Legal Writing', 'Client Counseling',
        'Negotiation', 'Compliance', 'Risk Assessment',
        'Dispute Resolution', 'Regulatory Affairs', 'Due Diligence',
        'Westlaw', 'LexisNexis', 'Communication',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Professionalism'
    ],
    'legal-researcher': [
        'Legal Research', 'Case Law Analysis', 'Statutory Analysis',
        'Westlaw', 'LexisNexis', 'Legal Writing',
        'Documentation', 'Data Analysis', 'Communication',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Reporting', 'MS Office',
        'Legal Databases', 'Research Methodology', 'Confidentiality',
        'Organizational Skills', 'Continuous Learning'
    ],
    'legal-research-assistant': [
        'Legal Research', 'Case Law Analysis', 'Document Review',
        'Westlaw', 'LexisNexis', 'Data Entry',
        'Documentation', 'Communication', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Reporting',
        'MS Office', 'Legal Databases', 'Organizational Skills',
        'Multitasking', 'Confidentiality', 'Professionalism',
        'Reliability', 'Continuous Learning'
    ],
    'court-clerk': [
        'Court Administration', 'Case Management', 'Records Management',
        'Legal Research', 'Documentation', 'Scheduling',
        'Communication', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Confidentiality', 'MS Office',
        'Data Entry', 'Filing', 'Reporting',
        'Organizational Skills', 'Multitasking', 'Professionalism',
        'Reliability', 'Continuous Learning'
    ],
    'court-officer': [
        'Court Administration', 'Case Management', 'Court Procedures',
        'Documentation', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Confidentiality', 'MS Office', 'Reporting',
        'Filing', 'Scheduling', 'Record Keeping',
        'Organizational Skills', 'Multitasking', 'Professionalism',
        'Reliability', 'Continuous Learning'
    ],
    'judicial-assistant': [
        'Judicial Support', 'Legal Research', 'Case Management',
        'Legal Writing', 'Document Review', 'Court Procedures',
        'Communication', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Confidentiality',
        'MS Office', 'Reporting', 'Legal Databases',
        'Organizational Skills', 'Professionalism', 'Reliability',
        'Ethics', 'Continuous Learning'
    ],
    'law-clerk': [
        'Legal Research', 'Legal Writing', 'Case Analysis',
        'Document Review', 'Court Procedures', 'Westlaw',
        'LexisNexis', 'Communication', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'MS Office', 'Reporting', 'Legal Drafting',
        'Organizational Skills', 'Professionalism', 'Ethics',
        'Confidentiality', 'Continuous Learning'
    ],
    'prosecutor': [
        'Criminal Prosecution', 'Criminal Law', 'Court Representation',
        'Legal Research', 'Legal Writing', 'Case Management',
        'Evidence Law', 'Trial Advocacy', 'Negotiation',
        'Dispute Resolution', 'Public Speaking', 'Critical Thinking',
        'Westlaw', 'LexisNexis', 'Communication',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Ethics', 'Professionalism'
    ],
    'public-prosecutor': [
        'Criminal Prosecution', 'Criminal Law', 'Court Representation',
        'Legal Research', 'Legal Writing', 'Case Management',
        'Evidence Law', 'Trial Advocacy', 'Negotiation',
        'Dispute Resolution', 'Public Speaking', 'Critical Thinking',
        'Westlaw', 'LexisNexis', 'Communication',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Ethics', 'Public Service'
    ],
    'legal-compliance-officer': [
        'Legal Compliance', 'Regulatory Compliance', 'Policy Development',
        'Risk Assessment', 'Auditing', 'Compliance Monitoring',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'MS Office', 'Reporting', 'Documentation',
        'Training', 'Investigations', 'Confidentiality',
        'Ethics', 'Continuous Learning'
    ],
    'contract-specialist': [
        'Contract Management', 'Contract Drafting', 'Contract Review',
        'Negotiation', 'Compliance', 'Risk Assessment',
        'Legal Research', 'Legal Writing', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'MS Office', 'Reporting',
        'Documentation', 'Vendor Management', 'Procurement',
        'Confidentiality', 'Professionalism'
    ],
    'contract-manager': [
        'Contract Management', 'Team Leadership', 'Contract Drafting',
        'Negotiation', 'Compliance', 'Risk Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'KPI Management',
        'Reporting', 'Legal Research', 'MS Office',
        'Documentation', 'Vendor Management', 'Stakeholder Management',
        'Strategic Planning', 'Continuous Improvement'
    ]
};