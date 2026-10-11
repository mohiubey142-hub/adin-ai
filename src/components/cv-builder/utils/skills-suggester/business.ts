// utils/skills-suggester/business.ts
// ============================================
// BUSINESS SKILLS - 80 Professions
// ============================================

export const businessSkills: Record<string, string[]> = {
    // ============================================
    // CORE BUSINESS (15) — EXISTING
    // ============================================
    'business': [
        'Strategic Planning', 'Business Development', 'Market Analysis',
        'Financial Management', 'Leadership', 'Communication',
        'Project Management', 'CRM', 'Negotiation',
        'Business Strategy', 'Operations Management', 'Data Analysis',
        'Team Management', 'Customer Relationship', 'Problem Solving',
        'Decision Making', 'Time Management', 'Presentation Skills',
        'Microsoft Office', 'Business Intelligence', 'Risk Management',
        'Change Management', 'Stakeholder Management'
    ],
    'project-manager': [
        'Agile Methodologies', 'Scrum', 'Jira', 'Project Management',
        'Stakeholder Management', 'Risk Management', 'Budgeting',
        'Leadership', 'Communication', 'Kanban',
        'Resource Planning', 'Timeline Management', 'Team Coordination',
        'MS Project', 'Quality Assurance', 'Change Management',
        'Conflict Resolution', 'Reporting', 'Documentation',
        'Vendor Management', 'Cost Control', 'Scope Management',
        'PMBOK', 'Waterfall Methodology'
    ],
    'product-manager': [
        'Product Strategy', 'User Research', 'Roadmap Planning',
        'Agile', 'Data Analysis', 'Cross-functional Leadership',
        'Communication', 'UX/UI', 'Market Analysis',
        'Product Lifecycle', 'A/B Testing', 'Customer Insights',
        'Competitive Analysis', 'Stakeholder Management', 'Prioritization',
        'Product Metrics', 'Go-to-Market Strategy', 'Wireframing',
        'Jira', 'Confluence', 'Analytics Tools',
        'User Stories', 'Product Vision'
    ],
    'operations-manager': [
        'Operations Management', 'Process Optimization', 'Supply Chain',
        'Budgeting', 'Team Leadership', 'KPI Management',
        'Lean Six Sigma', 'Strategic Planning', 'Resource Allocation',
        'Quality Control', 'Performance Management', 'Inventory Management',
        'Vendor Management', 'Project Management', 'Data Analysis',
        'Continuous Improvement', 'Risk Management', 'Compliance',
        'ERP Systems', 'Reporting', 'Cost Reduction',
        'Workforce Planning', 'Change Management'
    ],
    'entrepreneur': [
        'Business Planning', 'Fundraising', 'Investor Relations',
        'Product Development', 'Marketing Strategy', 'Leadership',
        'Sales', 'Networking', 'Resilience',
        'Financial Management', 'Team Building', 'Strategic Thinking',
        'Market Research', 'Business Development', 'Negotiation',
        'Pitching', 'Bootstrapping', 'Growth Hacking',
        'Customer Discovery', 'Problem Solving', 'Adaptability',
        'Time Management', 'Risk Taking'
    ],
    'business-analyst': [
        'SQL', 'Data Analysis', 'Tableau', 'Business Intelligence',
        'Project Management', 'Agile', 'Documentation',
        'Communication', 'Problem Solving', 'Requirements Gathering',
        'Process Mapping', 'Stakeholder Management', 'Use Cases',
        'Gap Analysis', 'Power BI', 'Excel',
        'Visio', 'BPMN', 'User Stories',
        'Testing', 'Change Management', 'CRM',
        'Wireframing', 'Jira'
    ],
    'supply-chain': [
        'Supply Chain Management', 'Procurement', 'Inventory Management',
        'Logistics', 'Warehousing', 'Vendor Management',
        'ERP Systems', 'Process Improvement', 'Data Analysis',
        'Demand Planning', 'Production Planning', 'Distribution',
        'Transportation', 'Cost Optimization', 'Risk Management',
        'SAP', 'Oracle', 'Excel',
        'Negotiation', 'Contract Management', 'Quality Control',
        'Lean Principles', 'Six Sigma', 'Forecasting'
    ],
    'consultant': [
        'Business Consulting', 'Strategic Planning', 'Market Analysis',
        'Data Analysis', 'Problem Solving', 'Communication',
        'Project Management', 'Client Management', 'Presentation Skills',
        'Financial Modeling', 'Process Improvement', 'Change Management',
        'Stakeholder Management', 'Research', 'Report Writing',
        'Excel', 'PowerPoint', 'Tableau',
        'Business Development', 'Negotiation', 'Team Leadership',
        'Critical Thinking', 'Time Management'
    ],
    'finance-analyst': [
        'Advanced Excel', 'Financial Modeling', 'Data Analysis',
        'Power BI', 'Financial Reporting', 'Valuation',
        'Investment Analysis', 'Budgeting', 'Forecasting',
        'Risk Analysis', 'SQL', 'Tableau',
        'Variance Analysis', 'Cost Analysis', 'Financial Statements',
        'SAP', 'Oracle', 'ERP Systems',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management'
    ],
    'financial-advisor': [
        'Wealth Management', 'Investment Strategy', 'Retirement Planning',
        'Estate Planning', 'Tax Planning', 'Risk Assessment',
        'Client Relationship', 'Portfolio Management', 'Insurance',
        'Financial Planning', 'Mutual Funds', 'Stocks',
        'Bonds', 'Asset Allocation', 'Financial Analysis',
        'CRM', 'Communication', 'Presentation Skills',
        'Negotiation', 'Regulatory Compliance', 'Market Research',
        'Client Education', 'Goal Setting'
    ],
    'supply-chain-manager': [
        'Supply Chain Strategy', 'Procurement', 'Inventory Management',
        'Logistics', 'Warehousing', 'Vendor Management',
        'ERP Systems', 'Process Improvement', 'Data Analysis',
        'Demand Planning', 'Production Planning', 'Distribution',
        'Transportation', 'Cost Optimization', 'Risk Management',
        'SAP', 'Oracle', 'Excel',
        'Negotiation', 'Contract Management', 'Quality Control',
        'Lean Principles', 'Six Sigma', 'Forecasting'
    ],
    'procurement-officer': [
        'Strategic Sourcing', 'Vendor Management', 'Contract Negotiation',
        'Purchasing', 'Inventory Control', 'Supplier Evaluation',
        'Cost Reduction', 'Supply Chain', 'Compliance',
        'ERP Systems', 'Purchase Orders', 'RFQ',
        'Tendering', 'Contract Management', 'Supplier Relationship',
        'Negotiation', 'Data Analysis', 'Excel',
        'Market Research', 'Risk Management', 'Quality Assurance',
        'Documentation', 'Communication', 'Time Management'
    ],
    'logistics-manager': [
        'Transportation Management', 'Warehousing', 'Distribution',
        'Fleet Management', 'Supply Chain', 'Route Optimization',
        'Warehouse Management Systems', 'Inventory Management', 'Customer Service',
        'Logistics Software', 'Freight Forwarding', 'Customs Clearance',
        'Cost Optimization', 'Vendor Management', 'Team Leadership',
        'Data Analysis', 'Excel', 'SAP',
        'Problem Solving', 'Communication', 'Negotiation',
        'Risk Management', 'Continuous Improvement'
    ],
    'business-development-executive': [
        'Business Development', 'Sales Strategy', 'Market Research',
        'Lead Generation', 'Client Acquisition', 'Relationship Management',
        'Negotiation', 'Strategic Planning', 'CRM',
        'Proposal Writing', 'Cold Calling', 'Networking',
        'Presentation Skills', 'Communication', 'Time Management',
        'Target Achievement', 'Market Analysis', 'Competitive Analysis',
        'Pipeline Management', 'Account Management', 'Sales Forecasting',
        'Client Retention', 'Upselling'
    ],
    'supply-chain-analyst': [
        'Data Analysis', 'Supply Chain Analytics', 'Inventory Optimization',
        'Forecasting', 'Excel', 'Power BI',
        'Procurement', 'Logistics', 'Vendor Management',
        'Process Improvement', 'SQL', 'Tableau',
        'Demand Planning', 'Cost Analysis', 'KPI Tracking',
        'ERP Systems', 'SAP', 'Reporting',
        'Problem Solving', 'Communication', 'Critical Thinking',
        'Attention to Detail', 'Time Management'
    ],

    // ============================================
    // ✅ NEW BATCH 2 — PRODUCT & PROGRAM (12)
    // ============================================
    'product-owner': [
        'Product Ownership', 'Agile', 'Scrum',
        'Backlog Management', 'User Stories', 'Stakeholder Management',
        'Prioritization', 'Roadmap Planning', 'Jira',
        'Confluence', 'Communication', 'Problem Solving',
        'Decision Making', 'Team Collaboration', 'Product Vision',
        'Acceptance Criteria', 'Sprint Planning', 'KPI Tracking',
        'Customer Insights', 'Time Management'
    ],
    'product-operations-manager': [
        'Product Operations', 'Team Leadership', 'Process Improvement',
        'Data Analysis', 'KPI Management', 'Cross-functional Collaboration',
        'Agile', 'Project Management', 'Communication',
        'Problem Solving', 'Strategic Planning', 'Leadership',
        'Team Collaboration', 'Stakeholder Management', 'Reporting',
        'Change Management', 'Documentation', 'Time Management',
        'Product Analytics', 'Operations Management'
    ],
    'product-operations-specialist': [
        'Product Operations', 'Process Improvement', 'Data Analysis',
        'KPI Tracking', 'Agile', 'Jira',
        'Confluence', 'Documentation', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Cross-functional Collaboration', 'Reporting',
        'Project Support', 'Product Analytics', 'CRM',
        'MS Office', 'Continuous Improvement'
    ],
    'product-analyst': [
        'Product Analytics', 'SQL', 'Data Analysis',
        'A/B Testing', 'Excel', 'Tableau',
        'Power BI', 'User Research', 'Product Metrics',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Reporting', 'Dashboard Creation', 'KPI Tracking',
        'Customer Insights', 'Product Strategy'
    ],
    'product-marketing-manager': [
        'Product Marketing', 'Go-to-Market Strategy', 'Market Research',
        'Positioning', 'Messaging', 'Competitive Analysis',
        'Content Marketing', 'Sales Enablement', 'Product Launch',
        'Communication', 'Presentation Skills', 'Problem Solving',
        'Strategic Planning', 'Team Collaboration', 'Stakeholder Management',
        'Analytics', 'CRM', 'Marketing Automation',
        'Copywriting', 'Time Management'
    ],
    'product-marketing-specialist': [
        'Product Marketing', 'Market Research', 'Content Creation',
        'Positioning', 'Messaging', 'Competitive Analysis',
        'Copywriting', 'Sales Enablement', 'Product Launch',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Analytics',
        'CRM', 'Marketing Automation', 'Social Media',
        'Presentation Skills', 'Reporting'
    ],
    'program-manager': [
        'Program Management', 'Strategic Planning', 'Team Leadership',
        'Project Management', 'Portfolio Management', 'Stakeholder Management',
        'Budget Management', 'Risk Management', 'KPI Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Change Management',
        'Agile', 'Reporting', 'Time Management',
        'Resource Planning', 'Cross-functional Collaboration'
    ],
    'program-coordinator': [
        'Program Coordination', 'Project Support', 'Scheduling',
        'Documentation', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'MS Office', 'Meeting Facilitation', 'Reporting',
        'Data Entry', 'Stakeholder Management', 'Budget Tracking',
        'Event Coordination', 'Resource Coordination', 'CRM',
        'Organizational Skills', 'Multitasking'
    ],
    'project-coordinator': [
        'Project Coordination', 'Scheduling', 'Documentation',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'MS Project',
        'Jira', 'Meeting Facilitation', 'Reporting',
        'Stakeholder Management', 'Budget Tracking', 'Resource Coordination',
        'Risk Tracking', 'Data Entry', 'MS Office',
        'Organizational Skills', 'Multitasking'
    ],
    'project-administrator': [
        'Project Administration', 'Documentation', 'Scheduling',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'MS Project',
        'Jira', 'Reporting', 'Stakeholder Management',
        'Budget Tracking', 'Data Entry', 'MS Office',
        'Meeting Minutes', 'File Management', 'Vendor Coordination',
        'Organizational Skills', 'Multitasking'
    ],
    'pmo-analyst': [
        'PMO Operations', 'Project Management', 'Portfolio Management',
        'Data Analysis', 'KPI Tracking', 'Reporting',
        'Excel', 'Power BI', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Stakeholder Management', 'Documentation',
        'Process Improvement', 'Governance', 'Risk Management',
        'Resource Planning', 'Change Management'
    ],
    'pmo-manager': [
        'PMO Leadership', 'Portfolio Management', 'Project Management',
        'Team Leadership', 'Governance', 'KPI Management',
        'Strategic Planning', 'Communication', 'Problem Solving',
        'Decision Making', 'Leadership', 'Team Collaboration',
        'Stakeholder Management', 'Change Management', 'Reporting',
        'Process Improvement', 'Risk Management', 'Budget Management',
        'Agile', 'Resource Planning'
    ],
    'scrum-master': [
        'Scrum', 'Agile', 'Sprint Planning',
        'Daily Standups', 'Retrospectives', 'Backlog Refinement',
        'Jira', 'Confluence', 'Team Facilitation',
        'Communication', 'Problem Solving', 'Conflict Resolution',
        'Team Collaboration', 'Coaching', 'Servant Leadership',
        'Removing Impediments', 'KPI Tracking', 'Continuous Improvement',
        'Stakeholder Management', 'Time Management'
    ],
    'agile-coach': [
        'Agile Coaching', 'Scrum', 'Kanban',
        'SAFe', 'Team Coaching', 'Agile Transformation',
        'Training', 'Facilitation', 'Communication',
        'Problem Solving', 'Conflict Resolution', 'Leadership',
        'Team Collaboration', 'Mentoring', 'Change Management',
        'Continuous Improvement', 'Stakeholder Management', 'KPI Tracking',
        'Workshop Facilitation', 'Agile Metrics'
    ],
    'delivery-manager': [
        'Delivery Management', 'Team Leadership', 'Project Management',
        'Agile', 'Scrum', 'Stakeholder Management',
        'Risk Management', 'Budget Management', 'KPI Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Client Management',
        'Resource Planning', 'Reporting', 'Time Management',
        'Change Management', 'Continuous Improvement'
    ],
    'technical-project-manager': [
        'Technical Project Management', 'Agile', 'Scrum',
        'Jira', 'Technical Leadership', 'Stakeholder Management',
        'Risk Management', 'Budget Management', 'Communication',
        'Problem Solving', 'Decision Making', 'Leadership',
        'Team Collaboration', 'Resource Planning', 'Reporting',
        'SDLC', 'Change Management', 'Time Management',
        'Client Management', 'Technical Documentation'
    ],
    'program-director': [
        'Program Leadership', 'Strategic Planning', 'Team Leadership',
        'Portfolio Management', 'Budget Management', 'Stakeholder Management',
        'Governance', 'Communication', 'Problem Solving',
        'Decision Making', 'Leadership', 'Team Collaboration',
        'Change Management', 'Risk Management', 'KPI Management',
        'Reporting', 'Executive Presence', 'Cross-functional Collaboration',
        'Business Development', 'Strategic Thinking'
    ],

    // ============================================
    // ✅ NEW BATCH 2 — OPERATIONS (15)
    // ============================================
    'operations-analyst': [
        'Operations Analysis', 'Data Analysis', 'Process Improvement',
        'Excel', 'SQL', 'Power BI',
        'Tableau', 'KPI Tracking', 'Reporting',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Process Mapping', 'Cost Analysis', 'Dashboard Creation',
        'Continuous Improvement', 'Stakeholder Management'
    ],
    'operations-coordinator': [
        'Operations Coordination', 'Scheduling', 'Process Improvement',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'MS Office',
        'Data Entry', 'Reporting', 'Vendor Coordination',
        'Inventory Management', 'Documentation', 'CRM',
        'Organizational Skills', 'Multitasking', 'Customer Service',
        'Budget Tracking', 'Meeting Facilitation'
    ],
    'operations-executive': [
        'Operations Management', 'Process Improvement', 'Team Coordination',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'MS Office',
        'Data Analysis', 'Reporting', 'Vendor Management',
        'KPI Tracking', 'Client Communication', 'Documentation',
        'Project Support', 'Organizational Skills', 'Multitasking',
        'Continuous Improvement', 'Customer Service'
    ],
    'operations-director': [
        'Operations Leadership', 'Strategic Planning', 'Team Leadership',
        'Budget Management', 'KPI Management', 'Process Improvement',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Stakeholder Management',
        'Change Management', 'Risk Management', 'Reporting',
        'Continuous Improvement', 'Cost Optimization', 'Resource Planning',
        'Executive Presence', 'Business Strategy'
    ],
    'business-operations-manager': [
        'Business Operations', 'Team Leadership', 'Process Improvement',
        'Budget Management', 'KPI Management', 'Strategic Planning',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Stakeholder Management',
        'Data Analysis', 'Reporting', 'Change Management',
        'Vendor Management', 'Resource Planning', 'Continuous Improvement',
        'ERP Systems', 'Project Management'
    ],
    'business-operations-analyst': [
        'Business Operations', 'Data Analysis', 'Process Improvement',
        'SQL', 'Excel', 'Power BI',
        'Tableau', 'KPI Tracking', 'Reporting',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Dashboard Creation', 'Cost Analysis', 'Process Mapping',
        'Continuous Improvement', 'Stakeholder Management'
    ],
    'process-analyst': [
        'Process Analysis', 'Process Mapping', 'Data Analysis',
        'Excel', 'Visio', 'BPMN',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Process Improvement', 'Documentation', 'Reporting',
        'KPI Tracking', 'Root Cause Analysis', 'Lean Principles',
        'Stakeholder Management', 'Continuous Improvement'
    ],
    'process-improvement-specialist': [
        'Process Improvement', 'Lean', 'Six Sigma',
        'Process Mapping', 'Data Analysis', 'Excel',
        'Minitab', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'KPI Tracking', 'Root Cause Analysis',
        'Change Management', 'Documentation', 'Reporting',
        'Continuous Improvement', 'Stakeholder Management'
    ],
    'process-improvement-manager': [
        'Process Improvement', 'Team Leadership', 'Lean',
        'Six Sigma', 'Strategic Planning', 'Project Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Stakeholder Management',
        'Change Management', 'KPI Management', 'Reporting',
        'Root Cause Analysis', 'Continuous Improvement', 'Cost Optimization',
        'Training', 'Process Design'
    ],
    'management-consultant': [
        'Management Consulting', 'Strategic Planning', 'Business Analysis',
        'Data Analysis', 'Client Management', 'Communication',
        'Presentation Skills', 'Problem Solving', 'Critical Thinking',
        'Project Management', 'Change Management', 'Stakeholder Management',
        'Team Collaboration', 'Excel', 'PowerPoint',
        'Financial Modeling', 'Market Research', 'Report Writing',
        'Business Development', 'Time Management'
    ],
    'strategy-consultant': [
        'Strategy Consulting', 'Strategic Planning', 'Market Analysis',
        'Data Analysis', 'Financial Modeling', 'Client Management',
        'Communication', 'Presentation Skills', 'Problem Solving',
        'Critical Thinking', 'Project Management', 'Change Management',
        'Stakeholder Management', 'Team Collaboration', 'Excel',
        'PowerPoint', 'Tableau', 'Market Research',
        'Business Development', 'Report Writing'
    ],
    'strategy-analyst': [
        'Strategy Analysis', 'Market Research', 'Data Analysis',
        'Financial Modeling', 'Excel', 'PowerPoint',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Competitive Analysis', 'Reporting', 'Presentation Skills',
        'Business Intelligence', 'SQL', 'Tableau',
        'Strategic Planning', 'Research'
    ],
    'business-consultant': [
        'Business Consulting', 'Strategic Planning', 'Business Analysis',
        'Data Analysis', 'Client Management', 'Communication',
        'Presentation Skills', 'Problem Solving', 'Critical Thinking',
        'Project Management', 'Change Management', 'Stakeholder Management',
        'Team Collaboration', 'Excel', 'PowerPoint',
        'Report Writing', 'Market Research', 'Business Development',
        'Time Management', 'Financial Modeling'
    ],
    'business-intelligence-consultant': [
        'Business Intelligence', 'Data Analysis', 'Tableau',
        'Power BI', 'SQL', 'ETL',
        'Data Warehousing', 'Client Management', 'Communication',
        'Presentation Skills', 'Problem Solving', 'Critical Thinking',
        'Project Management', 'Stakeholder Management', 'Team Collaboration',
        'Dashboard Creation', 'Reporting', 'Business Analysis',
        'Data Modeling', 'Time Management'
    ],
    'organizational-development-consultant': [
        'Organizational Development', 'Change Management', 'Team Development',
        'Leadership Development', 'Training', 'Workshop Facilitation',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Strategic Planning', 'Stakeholder Management', 'Team Collaboration',
        'Client Management', 'Presentation Skills', 'Coaching',
        'Culture Transformation', 'Talent Management', 'HR Analytics',
        'Project Management', 'Time Management'
    ],
    'change-management-consultant': [
        'Change Management', 'ADKAR', 'Kotter',
        'Communication', 'Stakeholder Management', 'Training',
        'Workshop Facilitation', 'Project Management', 'Problem Solving',
        'Critical Thinking', 'Strategic Planning', 'Team Collaboration',
        'Client Management', 'Presentation Skills', 'Coaching',
        'Resistance Management', 'Culture Transformation', 'Leadership Development',
        'Reporting', 'Time Management'
    ],
    'transformation-consultant': [
        'Digital Transformation', 'Change Management', 'Strategic Planning',
        'Business Analysis', 'Client Management', 'Communication',
        'Presentation Skills', 'Problem Solving', 'Critical Thinking',
        'Project Management', 'Stakeholder Management', 'Team Collaboration',
        'Technology Assessment', 'Process Improvement', 'Data Analysis',
        'Change Leadership', 'Business Development', 'Report Writing',
        'Innovation', 'Time Management'
    ],

    // ============================================
    // ✅ NEW BATCH 2 — ADMIN & ASSISTANT (9)
    // ============================================
    'management-trainee': [
        'Management Training', 'Leadership', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Data Analysis',
        'Project Management', 'Time Management', 'Team Collaboration',
        'MS Office', 'Excel', 'PowerPoint',
        'Presentation Skills', 'Adaptability', 'Continuous Learning',
        'Attention to Detail', 'Organizational Skills', 'Willingness to Learn',
        'Networking', 'Business Acumen'
    ],
    'executive-assistant': [
        'Executive Support', 'Calendar Management', 'Travel Arrangements',
        'Email Management', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Confidentiality',
        'MS Office', 'Excel', 'PowerPoint',
        'Meeting Coordination', 'Document Preparation', 'Expense Reports',
        'Event Planning', 'Stakeholder Management', 'Professionalism',
        'Multitasking', 'Organizational Skills'
    ],
    'personal-assistant': [
        'Personal Assistance', 'Calendar Management', 'Travel Arrangements',
        'Email Management', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Confidentiality',
        'MS Office', 'Meeting Coordination', 'Document Preparation',
        'Expense Reports', 'Event Planning', 'Errands',
        'Professionalism', 'Multitasking', 'Organizational Skills',
        'Reliability', 'Adaptability'
    ],
    'administrative-officer': [
        'Administrative Management', 'Office Operations', 'Team Coordination',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'MS Office',
        'Data Entry', 'Record Keeping', 'Filing',
        'Scheduling', 'Reporting', 'Vendor Coordination',
        'Budget Tracking', 'Documentation', 'Customer Service',
        'Organizational Skills', 'Multitasking'
    ],
    'administrative-assistant': [
        'Administrative Support', 'Data Entry', 'Filing',
        'Scheduling', 'Email Management', 'Phone Handling',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'MS Office',
        'Document Preparation', 'Record Keeping', 'Customer Service',
        'Expense Reports', 'Calendar Management', 'Organizational Skills',
        'Multitasking', 'Professionalism'
    ],
    'administration-manager': [
        'Administration Management', 'Team Leadership', 'Office Operations',
        'Budget Management', 'Process Improvement', 'Communication',
        'Problem Solving', 'Decision Making', 'Leadership',
        'Team Collaboration', 'Stakeholder Management', 'Vendor Management',
        'Reporting', 'Compliance', 'MS Office',
        'Change Management', 'Resource Planning', 'Time Management',
        'Continuous Improvement', 'Facilities Management'
    ],

    // ============================================
    // ✅ NEW BATCH 2 — SUPPLY CHAIN (6)
    // ============================================
    'supply-chain-specialist': [
        'Supply Chain Management', 'Procurement', 'Inventory Management',
        'Logistics', 'Vendor Management', 'Data Analysis',
        'Excel', 'ERP Systems', 'SAP',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Reporting',
        'Cost Optimization', 'Process Improvement', 'Negotiation',
        'Forecasting', 'Continuous Improvement'
    ],
    'supply-chain-coordinator': [
        'Supply Chain Coordination', 'Inventory Management', 'Logistics',
        'Vendor Coordination', 'Data Entry', 'Excel',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'ERP Systems',
        'Documentation', 'Reporting', 'Order Processing',
        'Shipping Coordination', 'Customer Service', 'Multitasking',
        'Organizational Skills', 'Continuous Improvement'
    ],
    'supply-chain-planner': [
        'Supply Chain Planning', 'Demand Planning', 'Inventory Optimization',
        'Forecasting', 'Excel', 'SQL',
        'ERP Systems', 'SAP', 'Data Analysis',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'KPI Tracking', 'Reporting', 'Process Improvement',
        'Continuous Improvement', 'S&OP'
    ],
    'supply-chain-consultant': [
        'Supply Chain Consulting', 'Strategic Planning', 'Process Improvement',
        'Data Analysis', 'Client Management', 'Communication',
        'Presentation Skills', 'Problem Solving', 'Critical Thinking',
        'Project Management', 'Stakeholder Management', 'Team Collaboration',
        'Excel', 'PowerPoint', 'Tableau',
        'Supply Chain Analytics', 'Report Writing', 'Business Development',
        'Change Management', 'Time Management'
    ],
    'demand-planner': [
        'Demand Planning', 'Forecasting', 'Statistical Analysis',
        'Excel', 'SQL', 'ERP Systems',
        'SAP', 'Data Analysis', 'S&OP',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'KPI Tracking', 'Reporting', 'Inventory Optimization',
        'Continuous Improvement', 'Supply Chain'
    ],
    'demand-planning-manager': [
        'Demand Planning', 'Team Leadership', 'Forecasting',
        'Strategic Planning', 'S&OP', 'Data Analysis',
        'Excel', 'SQL', 'ERP Systems',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Stakeholder Management',
        'KPI Management', 'Reporting', 'Continuous Improvement',
        'Supply Chain', 'Process Improvement'
    ],
    'supply-planner': [
        'Supply Planning', 'Inventory Management', 'Forecasting',
        'Excel', 'SQL', 'ERP Systems',
        'SAP', 'Data Analysis', 'S&OP',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'KPI Tracking',
        'Reporting', 'Process Improvement', 'Vendor Management',
        'Continuous Improvement', 'Supply Chain'
    ],
    'inventory-analyst': [
        'Inventory Analysis', 'Inventory Optimization', 'Data Analysis',
        'Excel', 'SQL', 'ERP Systems',
        'SAP', 'Forecasting', 'KPI Tracking',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Reporting', 'Dashboard Creation', 'Process Improvement',
        'Continuous Improvement', 'Supply Chain'
    ],
    'inventory-manager': [
        'Inventory Management', 'Team Leadership', 'Inventory Optimization',
        'Data Analysis', 'Excel', 'ERP Systems',
        'SAP', 'KPI Management', 'Communication',
        'Problem Solving', 'Decision Making', 'Leadership',
        'Team Collaboration', 'Vendor Management', 'Reporting',
        'Process Improvement', 'Continuous Improvement', 'Budget Management',
        'Supply Chain', 'Strategic Planning'
    ],
    'inventory-controller': [
        'Inventory Control', 'Stock Management', 'Data Entry',
        'Excel', 'ERP Systems', 'SAP',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Inventory Audits',
        'Record Keeping', 'Reporting', 'Order Processing',
        'Vendor Coordination', 'Process Improvement', 'Continuous Improvement',
        'Organizational Skills', 'Supply Chain'
    ],
    'inventory-officer': [
        'Inventory Management', 'Stock Control', 'Data Entry',
        'Excel', 'ERP Systems', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Record Keeping', 'Reporting',
        'Inventory Audits', 'Order Processing', 'Vendor Coordination',
        'Documentation', 'MS Office', 'Organizational Skills',
        'Reliability', 'Continuous Improvement'
    ],
    'warehouse-coordinator': [
        'Warehouse Coordination', 'Inventory Management', 'Logistics',
        'Data Entry', 'Excel', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Record Keeping', 'Reporting',
        'Shipping Coordination', 'Receiving', 'Order Processing',
        'Safety Compliance', 'MS Office', 'Organizational Skills',
        'Multitasking', 'Continuous Improvement'
    ],
    'warehouse-operations-manager': [
        'Warehouse Operations', 'Team Leadership', 'Inventory Management',
        'Logistics', 'Safety Management', 'Process Improvement',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'KPI Management',
        'Budget Management', 'Reporting', 'Vendor Management',
        'Continuous Improvement', 'WMS', 'Supply Chain',
        'Resource Planning', 'Strategic Planning'
    ],
    'warehouse-officer': [
        'Warehouse Operations', 'Inventory Management', 'Data Entry',
        'Excel', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Record Keeping', 'Reporting', 'Shipping Coordination',
        'Receiving', 'Order Processing', 'Safety Compliance',
        'MS Office', 'Organizational Skills', 'Physical Stamina',
        'Reliability', 'Continuous Improvement'
    ],
    'warehouse-operator': [
        'Warehouse Operations', 'Material Handling', 'Order Picking',
        'Packing', 'Shipping', 'Inventory Management',
        'Data Entry', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Safety Compliance', 'Equipment Operation', 'Physical Stamina',
        'Reliability', 'MS Office', 'Organizational Skills',
        'Multitasking', 'Continuous Improvement'
    ],
    'logistics-specialist': [
        'Logistics Management', 'Transportation', 'Warehousing',
        'Supply Chain', 'Data Analysis', 'Excel',
        'ERP Systems', 'SAP', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Vendor Management', 'Reporting',
        'Cost Optimization', 'Process Improvement', 'Negotiation',
        'Customer Service', 'Continuous Improvement'
    ],
    'logistics-officer': [
        'Logistics Coordination', 'Transportation', 'Shipping',
        'Data Entry', 'Excel', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Vendor Coordination', 'Record Keeping',
        'Reporting', 'Order Processing', 'Customer Service',
        'MS Office', 'Organizational Skills', 'Multitasking',
        'Reliability', 'Continuous Improvement'
    ],
    'logistics-analyst': [
        'Logistics Analysis', 'Data Analysis', 'Excel',
        'SQL', 'Power BI', 'Tableau',
        'KPI Tracking', 'Reporting', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Cost Analysis',
        'Process Improvement', 'Dashboard Creation', 'Supply Chain',
        'Continuous Improvement', 'Stakeholder Management'
    ],
    'logistics-planner': [
        'Logistics Planning', 'Route Optimization', 'Forecasting',
        'Excel', 'SQL', 'ERP Systems',
        'Data Analysis', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'KPI Tracking', 'Reporting',
        'Vendor Management', 'Process Improvement', 'Cost Optimization',
        'Continuous Improvement', 'Supply Chain'
    ],
    'logistics-executive': [
        'Logistics Management', 'Transportation', 'Warehousing',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'MS Office',
        'Data Analysis', 'Reporting', 'Vendor Management',
        'KPI Tracking', 'Client Communication', 'Documentation',
        'Cost Optimization', 'Process Improvement', 'Customer Service',
        'Organizational Skills', 'Multitasking'
    ],
    'logistics-operations-manager': [
        'Logistics Operations', 'Team Leadership', 'Transportation',
        'Warehousing', 'Budget Management', 'KPI Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Vendor Management',
        'Reporting', 'Process Improvement', 'Cost Optimization',
        'Continuous Improvement', 'Supply Chain', 'Strategic Planning',
        'Resource Planning', 'Change Management'
    ],
    'transport-manager': [
        'Transportation Management', 'Fleet Management', 'Route Optimization',
        'Team Leadership', 'Budget Management', 'KPI Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Vendor Management',
        'Reporting', 'Safety Compliance', 'Process Improvement',
        'Cost Optimization', 'Continuous Improvement', 'Logistics',
        'Resource Planning', 'Strategic Planning'
    ],
    'transport-coordinator': [
        'Transportation Coordination', 'Route Planning', 'Scheduling',
        'Fleet Management', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Data Entry', 'Excel', 'Reporting',
        'Vendor Coordination', 'Driver Coordination', 'Safety Compliance',
        'Documentation', 'Customer Service', 'Organizational Skills',
        'Multitasking', 'Continuous Improvement'
    ],
    'fleet-manager': [
        'Fleet Management', 'Team Leadership', 'Vehicle Maintenance',
        'Budget Management', 'KPI Management', 'Safety Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Vendor Management',
        'Reporting', 'Route Optimization', 'Compliance',
        'Cost Optimization', 'Continuous Improvement', 'Data Analysis',
        'Resource Planning', 'Strategic Planning'
    ],
    'fleet-coordinator': [
        'Fleet Coordination', 'Scheduling', 'Vehicle Maintenance',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Data Entry',
        'Excel', 'Reporting', 'Driver Coordination',
        'Safety Compliance', 'Documentation', 'Cost Tracking',
        'MS Office', 'Organizational Skills', 'Multitasking',
        'Customer Service', 'Continuous Improvement'
    ],
    'fleet-supervisor': [
        'Fleet Supervision', 'Team Management', 'Scheduling',
        'Vehicle Maintenance', 'Safety Compliance', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Reporting', 'Driver Coordination',
        'Cost Tracking', 'Documentation', 'MS Office',
        'Leadership', 'Conflict Resolution', 'Continuous Improvement',
        'Adaptability', 'Reliability'
    ],
    'fleet-officer': [
        'Fleet Operations', 'Vehicle Management', 'Scheduling',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Data Entry',
        'Excel', 'Reporting', 'Driver Coordination',
        'Safety Compliance', 'Documentation', 'Maintenance Tracking',
        'MS Office', 'Organizational Skills', 'Multitasking',
        'Reliability', 'Continuous Improvement'
    ],
    'dispatch-coordinator': [
        'Dispatch Coordination', 'Scheduling', 'Route Planning',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Data Entry',
        'Excel', 'Reporting', 'Driver Coordination',
        'Customer Service', 'Logistics', 'MS Office',
        'Organizational Skills', 'Multitasking', 'Adaptability',
        'Reliability', 'Continuous Improvement'
    ],
    'dispatch-officer': [
        'Dispatch Operations', 'Scheduling', 'Route Planning',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Data Entry',
        'Excel', 'Reporting', 'Driver Coordination',
        'Customer Service', 'Logistics', 'MS Office',
        'Organizational Skills', 'Multitasking', 'Adaptability',
        'Reliability', 'Continuous Improvement'
    ],
    'distribution-manager': [
        'Distribution Management', 'Team Leadership', 'Warehousing',
        'Logistics', 'Budget Management', 'KPI Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Vendor Management',
        'Reporting', 'Process Improvement', 'Cost Optimization',
        'Continuous Improvement', 'Supply Chain', 'Strategic Planning',
        'Resource Planning', 'Data Analysis'
    ],
    'distribution-coordinator': [
        'Distribution Coordination', 'Scheduling', 'Warehousing',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Data Entry',
        'Excel', 'Reporting', 'Vendor Coordination',
        'Shipping Coordination', 'Inventory Management', 'MS Office',
        'Organizational Skills', 'Multitasking', 'Customer Service',
        'Adaptability', 'Continuous Improvement'
    ],
    'distribution-officer': [
        'Distribution Operations', 'Scheduling', 'Warehousing',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Data Entry',
        'Excel', 'Reporting', 'Vendor Coordination',
        'Shipping Coordination', 'Inventory Management', 'MS Office',
        'Organizational Skills', 'Multitasking', 'Customer Service',
        'Adaptability', 'Continuous Improvement'
    ],
    'shipping-coordinator': [
        'Shipping Coordination', 'Logistics', 'Documentation',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Data Entry',
        'Excel', 'Reporting', 'Vendor Coordination',
        'Customs Clearance', 'Freight Forwarding', 'MS Office',
        'Organizational Skills', 'Multitasking', 'Customer Service',
        'Adaptability', 'Continuous Improvement'
    ],
    'shipping-officer': [
        'Shipping Operations', 'Logistics', 'Documentation',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Data Entry',
        'Excel', 'Reporting', 'Vendor Coordination',
        'Customs Clearance', 'Freight Forwarding', 'MS Office',
        'Organizational Skills', 'Multitasking', 'Customer Service',
        'Adaptability', 'Continuous Improvement'
    ],
    'import-officer': [
        'Import Operations', 'Customs Clearance', 'Documentation',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Data Entry',
        'Excel', 'Reporting', 'Vendor Coordination',
        'Freight Forwarding', 'Incoterms', 'MS Office',
        'Regulatory Compliance', 'Organizational Skills', 'Multitasking',
        'Customer Service', 'Continuous Improvement'
    ],
    'export-officer': [
        'Export Operations', 'Customs Clearance', 'Documentation',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Data Entry',
        'Excel', 'Reporting', 'Vendor Coordination',
        'Freight Forwarding', 'Incoterms', 'MS Office',
        'Regulatory Compliance', 'Organizational Skills', 'Multitasking',
        'Customer Service', 'Continuous Improvement'
    ],
    'import-export-manager': [
        'Import Export Management', 'Team Leadership', 'Customs Clearance',
        'Logistics', 'Documentation', 'Regulatory Compliance',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Vendor Management',
        'Reporting', 'Process Improvement', 'Cost Optimization',
        'Continuous Improvement', 'Incoterms', 'Freight Forwarding',
        'Strategic Planning', 'Data Analysis'
    ],
    'import-export-specialist': [
        'Import Export Operations', 'Customs Clearance', 'Documentation',
        'Logistics', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Excel', 'Reporting', 'Vendor Coordination',
        'Freight Forwarding', 'Incoterms', 'MS Office',
        'Regulatory Compliance', 'Organizational Skills', 'Multitasking',
        'Customer Service', 'Continuous Improvement'
    ],
    'customs-officer': [
        'Customs Clearance', 'Regulatory Compliance', 'Documentation',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Data Entry',
        'Excel', 'Reporting', 'Tariff Classification',
        'Import Export', 'Freight Forwarding', 'MS Office',
        'Customer Service', 'Organizational Skills', 'Multitasking',
        'Legal Knowledge', 'Continuous Improvement'
    ],
    'customs-clearance-agent': [
        'Customs Clearance', 'Documentation', 'Regulatory Compliance',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Data Entry',
        'Excel', 'Reporting', 'Client Communication',
        'Import Export', 'Freight Forwarding', 'MS Office',
        'Tariff Classification', 'Customer Service', 'Organizational Skills',
        'Multitasking', 'Continuous Improvement'
    ],
    'customs-broker': [
        'Customs Brokerage', 'Customs Clearance', 'Documentation',
        'Regulatory Compliance', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Client Management', 'Excel', 'Reporting',
        'Import Export', 'Freight Forwarding', 'MS Office',
        'Tariff Classification', 'Negotiation', 'Business Development',
        'Customer Service', 'Continuous Improvement'
    ],
    'freight-broker': [
        'Freight Brokerage', 'Logistics', 'Negotiation',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Client Management',
        'Excel', 'Reporting', 'Carrier Management',
        'Shipping Coordination', 'Cost Optimization', 'CRM',
        'Sales', 'Business Development', 'Customer Service',
        'Market Research', 'Continuous Improvement'
    ],
    'freight-coordinator': [
        'Freight Coordination', 'Logistics', 'Shipping',
        'Documentation', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Data Entry', 'Excel', 'Reporting',
        'Vendor Coordination', 'Customs Clearance', 'MS Office',
        'Organizational Skills', 'Multitasking', 'Customer Service',
        'Adaptability', 'Continuous Improvement'
    ],
    'freight-operations-specialist': [
        'Freight Operations', 'Logistics', 'Shipping',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Data Analysis',
        'Excel', 'Reporting', 'Vendor Management',
        'Cost Optimization', 'Process Improvement', 'MS Office',
        'Customer Service', 'KPI Tracking', 'Continuous Improvement',
        'Adaptability', 'Reliability'
    ],
    'cargo-operations-officer': [
        'Cargo Operations', 'Logistics', 'Shipping',
        'Documentation', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Data Entry', 'Excel', 'Reporting',
        'Vendor Coordination', 'Customs Clearance', 'MS Office',
        'Safety Compliance', 'Organizational Skills', 'Multitasking',
        'Customer Service', 'Continuous Improvement'
    ],
    'cargo-agent': [
        'Cargo Handling', 'Logistics', 'Shipping',
        'Documentation', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Data Entry', 'Excel', 'Reporting',
        'Vendor Coordination', 'Customer Service', 'MS Office',
        'Safety Compliance', 'Organizational Skills', 'Multitasking',
        'Physical Stamina', 'Continuous Improvement'
    ],
    'air-cargo-specialist': [
        'Air Cargo Operations', 'Logistics', 'Shipping',
        'Documentation', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Data Entry', 'Excel', 'Reporting',
        'Customs Clearance', 'Freight Forwarding', 'MS Office',
        'Regulatory Compliance', 'Customer Service', 'Organizational Skills',
        'Multitasking', 'Continuous Improvement'
    ],
    'shipping-agent': [
        'Shipping Agency', 'Logistics', 'Documentation',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Client Management',
        'Excel', 'Reporting', 'Customs Clearance',
        'Freight Forwarding', 'Port Operations', 'MS Office',
        'Regulatory Compliance', 'Negotiation', 'Customer Service',
        'Business Development', 'Continuous Improvement'
    ],
    'clearing-agent': [
        'Clearing Operations', 'Customs Clearance', 'Documentation',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Client Management',
        'Excel', 'Reporting', 'Regulatory Compliance',
        'Freight Forwarding', 'Import Export', 'MS Office',
        'Tariff Classification', 'Negotiation', 'Customer Service',
        'Business Development', 'Continuous Improvement'
    ]
};