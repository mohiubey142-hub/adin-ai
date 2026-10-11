// utils/skills-suggester/it.ts
// ============================================
// IT SKILLS - 194 Professions
// ============================================

export const itSkills: Record<string, string[]> = {
    // ============================================
    // CORE IT (34) — EXISTING
    // ============================================
    'developer': [
        'JavaScript', 'TypeScript', 'React.js', 'Node.js', 'Python',
        'Git', 'REST APIs', 'Docker', 'AWS', 'SQL',
        'MongoDB', 'Express.js', 'Problem Solving', 'Team Collaboration',
        'Agile Methodologies', 'CI/CD', 'Linux', 'HTML5',
        'CSS3', 'Webpack', 'Unit Testing', 'Debugging', 'System Design'
    ],
    'frontend': [
        'React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux',
        'Figma', 'Webpack', 'Performance Optimization', 'Responsive Design', 'UI/UX',
        'HTML5', 'CSS3', 'JavaScript', 'Vue.js', 'Angular',
        'SASS/SCSS', 'REST APIs', 'GraphQL', 'Git', 'Jest',
        'Web Accessibility', 'Browser DevTools', 'State Management'
    ],
    'backend': [
        'Node.js', 'Python', 'Java', 'Spring Boot', 'SQL',
        'NoSQL', 'Docker', 'AWS', 'REST APIs', 'GraphQL',
        'Microservices', 'System Design', 'Redis', 'PostgreSQL', 'MongoDB',
        'Express.js', 'Django', 'Linux', 'Git', 'CI/CD',
        'Message Queues', 'Caching', 'API Security'
    ],
    'full-stack': [
        'React.js', 'Node.js', 'TypeScript', 'Python', 'SQL',
        'MongoDB', 'Docker', 'AWS', 'Git', 'REST APIs',
        'GraphQL', 'System Architecture', 'Next.js', 'Express.js', 'PostgreSQL',
        'Redux', 'Tailwind CSS', 'CI/CD', 'Microservices', 'Redis',
        'Web Security', 'Performance Optimization', 'Agile'
    ],
    'devops': [
        'AWS', 'Azure', 'Google Cloud Platform', 'Docker', 'Kubernetes',
        'Jenkins', 'GitLab CI', 'Terraform', 'Prometheus', 'Grafana',
        'Linux', 'Python', 'CI/CD', 'Ansible', 'Bash Scripting',
        'Monitoring', 'Logging', 'Networking', 'Security', 'Git',
        'Infrastructure as Code', 'Configuration Management', 'Incident Response'
    ],
    'cloud': [
        'AWS', 'Azure', 'Google Cloud Platform', 'Docker', 'Kubernetes',
        'Terraform', 'Cloud Architecture', 'Serverless', 'DevOps', 'Python',
        'Infrastructure as Code', 'Cloud Security', 'Cost Optimization', 'Networking',
        'CI/CD', 'Monitoring', 'Linux', 'Scripting', 'Microservices',
        'Load Balancing', 'Auto Scaling', 'Disaster Recovery'
    ],
    'data-scientist': [
        'Python', 'R', 'SQL', 'Pandas', 'NumPy',
        'Scikit-learn', 'TensorFlow', 'PyTorch', 'Data Visualization', 'Machine Learning',
        'Statistics', 'Deep Learning', 'NLP', 'Computer Vision', 'Data Mining',
        'Feature Engineering', 'Model Deployment', 'Jupyter', 'Tableau', 'Power BI',
        'Big Data', 'Spark', 'A/B Testing'
    ],
    'data-analyst': [
        'SQL', 'Python', 'Tableau', 'Power BI', 'Excel',
        'Data Visualization', 'Statistics', 'Business Intelligence', 'Communication', 'Analytical Thinking',
        'Pandas', 'NumPy', 'Data Cleaning', 'Reporting', 'Dashboards',
        'A/B Testing', 'Google Analytics', 'Data Mining', 'Problem Solving', 'Critical Thinking',
        'ETL', 'Data Warehousing', 'Stakeholder Management'
    ],
    'cybersecurity': [
        'Network Security', 'Firewalls', 'SIEM', 'Penetration Testing', 'CISSP',
        'Security Analysis', 'Cloud Security', 'Compliance', 'Risk Management', 'Incident Response',
        'Vulnerability Assessment', 'Ethical Hacking', 'Encryption', 'Identity Management', 'Threat Intelligence',
        'Security Auditing', 'Forensics', 'SOC Operations', 'Malware Analysis', 'Zero Trust',
        'Security Automation', 'Python', 'Linux'
    ],
    'game-developer': [
        'Unity', 'C#', 'Unreal Engine', 'C++', '3D Modeling',
        'Game Design', 'Animation', 'Physics', 'Multiplayer Networking', 'Problem Solving',
        'Shader Programming', 'Game Physics', 'Level Design', 'UI/UX', 'Version Control',
        'Performance Optimization', 'Mobile Games', 'VR/AR', 'Sound Design', 'AI Programming',
        'Storyboarding', 'Playtesting', 'Game Analytics'
    ],
    'mobile': [
        'React Native', 'Flutter', 'iOS', 'Android', 'Swift',
        'Kotlin', 'Firebase', 'App Store Optimization', 'Mobile UI/UX', 'Cross-platform Development',
        'REST APIs', 'Push Notifications', 'Mobile Security', 'Performance Optimization', 'Git',
        'App Testing', 'CI/CD', 'State Management', 'Offline Storage', 'In-app Purchases',
        'Analytics', 'Deep Linking', 'App Publishing'
    ],
    'ai-ml': [
        'Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Machine Learning',
        'Deep Learning', 'NLP', 'Computer Vision', 'MLOps', 'SQL',
        'Data Engineering', 'Feature Engineering', 'Model Deployment', 'Statistics', 'Mathematics',
        'Reinforcement Learning', 'Generative AI', 'LLMs', 'Prompt Engineering', 'Model Evaluation',
        'Big Data', 'Cloud ML', 'Research'
    ],
    'blockchain': [
        'Solidity', 'Web3.js', 'Ethereum', 'Blockchain Architecture', 'Smart Contracts',
        'Cryptography', 'Node.js', 'Distributed Systems', 'DeFi', 'NFTs',
        'Hardhat', 'Truffle', 'IPFS', 'Consensus Mechanisms', 'Token Standards',
        'Security Auditing', 'Gas Optimization', 'Layer 2 Solutions', 'Wallet Integration', 'DApps',
        'Rust', 'Go', 'Cryptocurrency'
    ],
    'qa': [
        'Selenium', 'JUnit', 'TestNG', 'Cypress', 'Postman',
        'API Testing', 'Automation', 'Manual Testing', 'JIRA', 'SQL',
        'Bug Tracking', 'Test Planning', 'Regression Testing', 'Performance Testing', 'Load Testing',
        'Mobile Testing', 'CI/CD', 'Agile Testing', 'Test Cases', 'Defect Management',
        'Security Testing', 'Accessibility Testing', 'Test Automation Frameworks'
    ],
    'salesforce': [
        'Salesforce CRM', 'Apex', 'Visualforce', 'Lightning Components', 'SOQL',
        'SOSL', 'Salesforce Administration', 'Salesforce Development', 'Sales Cloud', 'Service Cloud',
        'Marketing Cloud', 'Salesforce Integration', 'REST APIs', 'Salesforce Security', 'Workflows',
        'Process Builder', 'Flow Builder', 'Reports & Dashboards', 'Data Management', 'User Management',
        'Salesforce Certified', 'Agile', 'Problem Solving'
    ],
    'it-support': [
        'Technical Support', 'Troubleshooting', 'Help Desk', 'Ticketing Systems', 'Windows',
        'Linux', 'Networking', 'Hardware', 'Software Installation', 'Active Directory',
        'Remote Support', 'Customer Service', 'Communication', 'Problem Solving', 'Time Management',
        'ITIL', 'Documentation', 'Team Collaboration', 'Office 365', 'VPN',
        'Antivirus', 'Backup Recovery', 'Asset Management'
    ],
    'system-administrator': [
        'Windows Server', 'Linux', 'Active Directory', 'Networking', 'VMware',
        'Hyper-V', 'PowerShell', 'Bash', 'Backup Recovery', 'Monitoring',
        'Security', 'Firewall', 'DNS', 'DHCP', 'Group Policy',
        'Cloud Services', 'Scripting', 'Troubleshooting', 'Documentation', 'ITIL',
        'Storage Management', 'Virtualization', 'Disaster Recovery'
    ],
    'network-engineer': [
        'Cisco', 'Routing', 'Switching', 'Firewalls', 'VPN',
        'Network Security', 'TCP/IP', 'DNS', 'DHCP', 'LAN/WAN',
        'Wireless Networking', 'Network Monitoring', 'Load Balancing', 'SD-WAN', 'MPLS',
        'Network Design', 'Troubleshooting', 'BGP', 'OSPF', 'VLANs',
        'Network Automation', 'Python', 'CCNA'
    ],
    'software-architect': [
        'System Design', 'Microservices', 'Cloud Architecture', 'AWS', 'Azure',
        'Docker', 'Kubernetes', 'Design Patterns', 'Scalability', 'Performance Optimization',
        'API Design', 'Database Design', 'Security Architecture', 'DevOps', 'CI/CD',
        'Technical Leadership', 'Communication', 'Problem Solving', 'Agile', 'Enterprise Architecture',
        'Event-Driven Architecture', 'Domain-Driven Design', 'Technology Roadmap'
    ],
    'software-engineer': [
        'Java', 'Python', 'C++', 'Data Structures', 'Algorithms',
        'System Design', 'Agile', 'Git', 'CI/CD', 'Cloud Computing',
        'Microservices', 'Problem Solving', 'REST APIs', 'SQL', 'NoSQL',
        'Docker', 'Kubernetes', 'Unit Testing', 'Code Review', 'Debugging',
        'Design Patterns', 'Software Development Lifecycle', 'Team Collaboration'
    ],
    'ai-research-engineer': [
        'Python', 'TensorFlow', 'PyTorch', 'Deep Learning', 'NLP',
        'Computer Vision', 'Reinforcement Learning', 'Mathematical Modeling', 'Research Methodology', 'Data Science',
        'MLOps', 'Statistics', 'Mathematics', 'Generative AI', 'LLMs',
        'Prompt Engineering', 'Model Evaluation', 'Research Papers', 'Experiment Design', 'Data Analysis',
        'Scientific Writing', 'Cloud ML', 'Big Data'
    ],
    'embedded-systems-engineer': [
        'C', 'C++', 'Python', 'RTOS', 'Microcontrollers',
        'Device Drivers', 'IoT', 'ARM Architecture', 'Firmware Development', 'Hardware-Software Integration',
        'Debugging', 'Embedded Linux', 'Communication Protocols', 'Sensors', 'Actuators',
        'PCB Design', 'Oscilloscope', 'Logic Analyzer', 'Low Power Design', 'Bootloaders',
        'UART', 'SPI', 'I2C'
    ],
    'database-administrator': [
        'SQL Server', 'Oracle', 'PostgreSQL', 'MySQL', 'MongoDB',
        'Database Design', 'Performance Tuning', 'Backup & Recovery', 'High Availability', 'Security',
        'Data Migration', 'Replication', 'Clustering', 'Indexing', 'Query Optimization',
        'Stored Procedures', 'Triggers', 'Database Monitoring', 'Capacity Planning', 'Disaster Recovery',
        'Cloud Databases', 'Data Warehousing', 'ETL'
    ],
    'mechatronics-engineer': [
        'C++', 'Python', 'PLC', 'Arduino', 'Raspberry Pi',
        'ROS', 'Control Systems', 'Sensors', 'Actuators', 'Circuit Design',
        'Mechanical Design', 'System Integration', 'CAD', 'MATLAB', 'Simulink',
        'Automation', 'Robotics', 'Embedded Systems', 'Pneumatics', 'Hydraulics',
        'Industrial Automation', 'SCADA', 'HMI'
    ],
    'data-engineer': [
        'Python', 'SQL', 'ETL', 'Apache Spark', 'Airflow',
        'Data Warehousing', 'AWS', 'Azure', 'Data Modeling', 'Pipeline Orchestration',
        'Big Data', 'Data Quality', 'Kafka', 'Hadoop', 'Snowflake',
        'Databricks', 'Data Lakes', 'Streaming Data', 'Data Governance', 'Cloud Data Services',
        'Docker', 'Kubernetes', 'CI/CD'
    ],
    'computer-hardware-technician': [
        'Hardware Diagnosis', 'Computer Repair', 'Motherboard', 'RAM', 'Hard Drives',
        'Power Supply', 'Laptop Repair', 'Desktop Assembly', 'BIOS', 'Device Drivers',
        'OS Installation', 'Data Recovery', 'Network Cards', 'Troubleshooting', 'Component Replacement',
        'Soldering', 'Multimeter', 'Hardware Testing', 'Customer Service', 'Documentation',
        'Preventive Maintenance', 'Inventory Management', 'Technical Support'
    ],
    'computer-programmer': [
        'Java', 'Python', 'C++', 'C#', 'JavaScript',
        'Data Structures', 'Algorithms', 'Object-Oriented Programming', 'Debugging', 'Version Control',
        'SQL', 'REST APIs', 'Unit Testing', 'Problem Solving', 'Software Development',
        'Code Review', 'Design Patterns', 'Git', 'Agile', 'Documentation',
        'Scripting', 'Database Design', 'System Analysis'
    ],
    'electronics-technician': [
        'Circuit Analysis', 'PCB Repair', 'Soldering', 'Multimeter', 'Oscilloscope',
        'Electronic Components', 'Troubleshooting', 'Wiring', 'Control Systems', 'Power Electronics',
        'Motor Controls', 'PLC', 'Instrumentation', 'Calibration', 'Electrical Safety',
        'Schematic Reading', 'Panel Wiring', 'Preventive Maintenance', 'Testing', 'Documentation',
        'Automation', 'Sensors', 'Actuators'
    ],
    'it-technician': [
        'Technical Support', 'Hardware Repair', 'Software Installation', 'Windows', 'Linux',
        'Networking', 'Active Directory', 'Office 365', 'Troubleshooting', 'Ticketing Systems',
        'Printer Support', 'VPN', 'Antivirus', 'Backup Recovery', 'Remote Support',
        'Customer Service', 'Communication', 'Documentation', 'Asset Management', 'ITIL',
        'Mobile Device Management', 'Cloud Services', 'Security'
    ],
    'software-tester': [
        'Manual Testing', 'Automation Testing', 'Selenium', 'JUnit', 'TestNG',
        'Cypress', 'Postman', 'API Testing', 'Test Cases', 'Test Plans',
        'Bug Tracking', 'JIRA', 'Regression Testing', 'Performance Testing', 'Load Testing',
        'Mobile Testing', 'Agile Testing', 'SQL', 'CI/CD', 'Defect Management',
        'Test Automation Frameworks', 'Security Testing', 'Accessibility Testing'
    ],
    'web': [
        'HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React.js',
        'Vue.js', 'Angular', 'Node.js', 'Express.js', 'REST APIs',
        'Responsive Design', 'Web Performance', 'Git', 'Webpack', 'SASS/SCSS',
        'Bootstrap', 'Tailwind CSS', 'SEO', 'Web Accessibility', 'Cross-Browser Compatibility',
        'Chrome DevTools', 'CMS', 'WordPress', 'E-commerce'
    ],
    'blockchain-developer': [
        'Solidity', 'Web3.js', 'Ethereum', 'Blockchain Architecture', 'Smart Contracts',
        'Cryptography', 'Node.js', 'Distributed Systems', 'DeFi', 'NFTs',
        'Hardhat', 'Truffle', 'IPFS', 'Consensus Mechanisms', 'Token Standards',
        'Security Auditing', 'Gas Optimization', 'Layer 2 Solutions', 'Wallet Integration', 'DApps',
        'Rust', 'Go', 'Cryptocurrency'
    ],
    'salesforce-developer': [
        'Salesforce CRM', 'Apex', 'Visualforce', 'Lightning Components', 'SOQL',
        'SOSL', 'Salesforce Administration', 'Salesforce Development', 'Sales Cloud', 'Service Cloud',
        'Marketing Cloud', 'Salesforce Integration', 'REST APIs', 'Salesforce Security', 'Workflows',
        'Process Builder', 'Flow Builder', 'Reports & Dashboards', 'Data Management', 'User Management',
        'Salesforce Certified', 'Agile', 'Problem Solving'
    ],

    // ============================================
    // ✅ NEW BATCH 1 — AI & ML (10)
    // ============================================
    'ai-product-manager': [
        'AI Product Strategy', 'Product Management', 'Machine Learning',
        'User Research', 'Roadmap Planning', 'Data Analysis',
        'Agile', 'Stakeholder Management', 'Communication',
        'Problem Solving', 'A/B Testing', 'Product Metrics',
        'AI Ethics', 'Prompt Engineering', 'Generative AI',
        'Cross-functional Leadership', 'Time Management', 'Team Collaboration',
        'Market Analysis', 'Customer Insights'
    ],
    'ai-engineer': [
        'Python', 'TensorFlow', 'PyTorch', 'Machine Learning',
        'Deep Learning', 'NLP', 'Computer Vision', 'MLOps',
        'Docker', 'Kubernetes', 'AWS', 'SQL',
        'Data Engineering', 'Feature Engineering', 'Model Deployment',
        'API Development', 'System Design', 'Problem Solving',
        'Team Collaboration', 'Research'
    ],
    'machine-learning-engineer': [
        'Python', 'TensorFlow', 'PyTorch', 'Scikit-learn',
        'Machine Learning', 'Deep Learning', 'MLOps', 'Docker',
        'Kubernetes', 'AWS', 'SQL', 'Data Engineering',
        'Feature Engineering', 'Model Deployment', 'Model Evaluation',
        'Statistics', 'Mathematics', 'Problem Solving',
        'Team Collaboration', 'Research'
    ],
    'machine-learning-researcher': [
        'Python', 'TensorFlow', 'PyTorch', 'Deep Learning',
        'Machine Learning', 'NLP', 'Computer Vision', 'Mathematics',
        'Statistics', 'Research Methodology', 'Experiment Design',
        'Scientific Writing', 'Research Papers', 'Data Analysis',
        'Reinforcement Learning', 'Generative AI', 'LLMs',
        'Problem Solving', 'Critical Thinking', 'Continuous Learning'
    ],
    'deep-learning-engineer': [
        'Python', 'TensorFlow', 'PyTorch', 'Deep Learning',
        'Neural Networks', 'CNN', 'RNN', 'Transformers',
        'NLP', 'Computer Vision', 'MLOps', 'Docker',
        'Kubernetes', 'AWS', 'Model Deployment', 'Feature Engineering',
        'Mathematics', 'Statistics', 'Problem Solving', 'Team Collaboration'
    ],
    'nlp-engineer': [
        'Python', 'NLP', 'Transformers', 'BERT',
        'GPT', 'spaCy', 'NLTK', 'Hugging Face',
        'TensorFlow', 'PyTorch', 'Text Mining', 'Sentiment Analysis',
        'Named Entity Recognition', 'Machine Translation', 'Language Models',
        'Deep Learning', 'Data Preprocessing', 'Model Evaluation',
        'Problem Solving', 'Team Collaboration'
    ],
    'computer-vision-engineer': [
        'Python', 'OpenCV', 'TensorFlow', 'PyTorch',
        'Computer Vision', 'Image Processing', 'Object Detection',
        'Image Segmentation', 'CNN', 'YOLO', 'Deep Learning',
        'Data Augmentation', 'Model Deployment', 'C++',
        'Mathematics', 'Statistics', 'Problem Solving',
        'Team Collaboration', 'Research'
    ],
    'generative-ai-engineer': [
        'Python', 'Generative AI', 'LLMs', 'GPT',
        'Stable Diffusion', 'LangChain', 'Hugging Face', 'Prompt Engineering',
        'Fine-tuning', 'RAG', 'Vector Databases', 'TensorFlow',
        'PyTorch', 'API Integration', 'Model Deployment', 'MLOps',
        'Problem Solving', 'Critical Thinking', 'Team Collaboration', 'Research'
    ],
    'prompt-engineer': [
        'Prompt Engineering', 'LLMs', 'GPT', 'Claude',
        'Chain of Thought', 'Few-Shot Learning', 'RAG',
        'LangChain', 'Python', 'API Integration',
        'Content Creation', 'Quality Assurance', 'A/B Testing',
        'Documentation', 'Problem Solving', 'Critical Thinking',
        'Communication', 'Time Management', 'Team Collaboration', 'Continuous Learning'
    ],
    'ai-solutions-architect': [
        'AI Architecture', 'Machine Learning', 'Cloud AI',
        'AWS', 'Azure', 'Google Cloud', 'MLOps',
        'System Design', 'Python', 'TensorFlow',
        'PyTorch', 'API Design', 'Microservices',
        'Data Engineering', 'Security', 'Technical Leadership',
        'Communication', 'Problem Solving', 'Strategic Planning', 'Team Collaboration'
    ],
    'ai-consultant': [
        'AI Consulting', 'Machine Learning', 'Data Science',
        'Business Analysis', 'Strategic Planning', 'Client Management',
        'Python', 'SQL', 'Data Analysis',
        'Communication', 'Presentation Skills', 'Problem Solving',
        'Critical Thinking', 'Project Management', 'Change Management',
        'Stakeholder Management', 'Time Management', 'Team Collaboration',
        'Research', 'Report Writing'
    ],
    
        // ============================================
    // ✅ NEW BATCH 1 — DATA (15)
    // ============================================
    'data-architect': [
        'Data Architecture', 'Data Modeling', 'Database Design',
        'SQL', 'NoSQL', 'Data Warehousing', 'ETL',
        'Big Data', 'AWS', 'Azure', 'Snowflake',
        'Databricks', 'Data Governance', 'System Design',
        'Python', 'Cloud Data Services', 'Communication',
        'Problem Solving', 'Strategic Planning', 'Team Collaboration'
    ],
    'data-warehouse-engineer': [
        'Data Warehousing', 'ETL', 'SQL', 'Snowflake',
        'Redshift', 'BigQuery', 'Data Modeling', 'Airflow',
        'Python', 'Apache Spark', 'Data Pipelines', 'Performance Tuning',
        'Data Quality', 'AWS', 'Azure', 'Cloud Data Services',
        'Problem Solving', 'Team Collaboration', 'Documentation', 'Continuous Improvement'
    ],
    'data-warehouse-developer': [
        'Data Warehousing', 'SQL', 'ETL', 'SSIS',
        'Informatica', 'Snowflake', 'Redshift', 'Data Modeling',
        'Python', 'Airflow', 'Data Pipelines', 'Performance Tuning',
        'Data Quality', 'Problem Solving', 'Team Collaboration', 'Documentation',
        'Reporting', 'Data Analysis', 'Continuous Improvement', 'Communication'
    ],
    'data-quality-analyst': [
        'Data Quality', 'Data Analysis', 'SQL',
        'Excel', 'Data Profiling', 'Data Validation',
        'Data Cleansing', 'Data Governance', 'ETL',
        'Python', 'Data Visualization', 'Power BI',
        'Tableau', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Reporting', 'Documentation'
    ],
    'data-governance-analyst': [
        'Data Governance', 'Data Quality', 'Metadata Management',
        'Data Catalog', 'SQL', 'Excel',
        'Data Analysis', 'Data Stewardship', 'Policy Development',
        'Compliance', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Reporting', 'Documentation',
        'Stakeholder Management', 'Data Privacy'
    ],
    'data-governance-manager': [
        'Data Governance', 'Data Management', 'Team Leadership',
        'Data Quality', 'Metadata Management', 'Policy Development',
        'Compliance', 'Data Privacy', 'Stakeholder Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Strategic Planning', 'Leadership', 'Project Management',
        'Data Analysis', 'Reporting', 'Documentation',
        'Change Management', 'Risk Management'
    ],
    'business-intelligence-analyst': [
        'Business Intelligence', 'SQL', 'Tableau',
        'Power BI', 'Data Analysis', 'Data Visualization',
        'Excel', 'Reporting', 'Dashboards',
        'ETL', 'Data Warehousing', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Stakeholder Management',
        'KPI Tracking', 'Business Analysis'
    ],
    'bi-developer': [
        'Business Intelligence', 'Tableau', 'Power BI',
        'SQL', 'ETL', 'Data Modeling',
        'Data Warehousing', 'Python', 'Dashboards',
        'Reporting', 'Data Visualization', 'Excel',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Documentation',
        'Performance Tuning', 'Stakeholder Management'
    ],
    'bi-engineer': [
        'Business Intelligence', 'Data Warehousing', 'ETL',
        'SQL', 'Snowflake', 'Redshift', 'BigQuery',
        'Airflow', 'Python', 'Data Modeling',
        'Tableau', 'Power BI', 'Cloud Data Services',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Documentation', 'Performance Tuning', 'Continuous Improvement', 'Data Quality'
    ],
    'analytics-engineer': [
        'Analytics Engineering', 'SQL', 'dbt',
        'Python', 'Data Modeling', 'ETL',
        'Data Warehousing', 'Snowflake', 'BigQuery',
        'Redshift', 'Airflow', 'Data Quality',
        'Git', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Team Collaboration', 'Documentation',
        'Performance Tuning', 'Continuous Improvement'
    ],
    'quantitative-analyst': [
        'Quantitative Analysis', 'Statistics', 'Mathematics',
        'Python', 'R', 'SQL', 'Excel',
        'Financial Modeling', 'Data Analysis', 'Risk Modeling',
        'Monte Carlo Simulation', 'Time Series Analysis', 'Machine Learning',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration', 'Reporting'
    ],
    'statistician': [
        'Statistics', 'Statistical Analysis', 'R',
        'Python', 'SAS', 'SPSS', 'Excel',
        'Data Analysis', 'Experimental Design', 'Regression Analysis',
        'Hypothesis Testing', 'Bayesian Statistics', 'Data Visualization',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration', 'Research'
    ],
    'statistician-analyst': [
        'Statistics', 'Statistical Analysis', 'R',
        'Python', 'SAS', 'SPSS', 'Excel',
        'Data Analysis', 'Regression Analysis', 'Hypothesis Testing',
        'Data Visualization', 'Reporting', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Documentation', 'Research'
    ],
    'database-developer': [
        'SQL', 'Database Design', 'Stored Procedures',
        'Triggers', 'Query Optimization', 'Performance Tuning',
        'SQL Server', 'Oracle', 'PostgreSQL',
        'MySQL', 'MongoDB', 'ETL',
        'Python', 'Data Modeling', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Team Collaboration',
        'Documentation', 'Continuous Improvement'
    ],
    'sql-developer': [
        'SQL', 'Query Optimization', 'Stored Procedures',
        'Functions', 'Triggers', 'Database Design',
        'SQL Server', 'Oracle', 'PostgreSQL',
        'MySQL', 'Performance Tuning', 'ETL',
        'Data Modeling', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Team Collaboration', 'Documentation',
        'Reporting', 'Data Analysis'
    ],
    'oracle-developer': [
        'Oracle Database', 'PL/SQL', 'SQL',
        'Stored Procedures', 'Triggers', 'Performance Tuning',
        'Oracle Forms', 'Oracle Reports', 'Data Modeling',
        'Query Optimization', 'Database Design', 'ETL',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Team Collaboration', 'Documentation', 'Reporting',
        'Oracle APEX', 'Continuous Improvement'
    ],

    // ============================================
    // ✅ NEW BATCH 1 — SAP & ERP (8)
    // ============================================
    'sap-developer': [
        'SAP ABAP', 'SAP HANA', 'SAP Fiori',
        'SAP UI5', 'SAP Modules', 'SQL',
        'Debugging', 'Performance Tuning', 'Integration',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Team Collaboration', 'Documentation', 'Reporting',
        'Agile', 'Time Management', 'Continuous Learning',
        'Business Process', 'ERP Systems'
    ],
    'sap-consultant': [
        'SAP Consulting', 'SAP Modules', 'SAP HANA',
        'SAP FICO', 'SAP MM', 'SAP SD',
        'SAP PP', 'Business Process', 'Requirements Gathering',
        'Configuration', 'Testing', 'Communication',
        'Problem Solving', 'Client Management', 'Team Collaboration',
        'Documentation', 'Training', 'Project Management',
        'Stakeholder Management', 'Change Management'
    ],
    'salesforce-administrator': [
        'Salesforce CRM', 'Salesforce Administration', 'User Management',
        'Reports & Dashboards', 'Workflows', 'Process Builder',
        'Flow Builder', 'Data Management', 'Security',
        'Sales Cloud', 'Service Cloud', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Team Collaboration',
        'Training', 'Documentation', 'Salesforce Certified',
        'Custom Objects', 'Validation Rules'
    ],
    'salesforce-consultant': [
        'Salesforce Consulting', 'Salesforce CRM', 'Business Analysis',
        'Requirements Gathering', 'Solution Design', 'Configuration',
        'Communication', 'Problem Solving', 'Client Management',
        'Project Management', 'Stakeholder Management', 'Training',
        'Documentation', 'Team Collaboration', 'Agile',
        'Sales Cloud', 'Service Cloud', 'Marketing Cloud',
        'Reports & Dashboards', 'Salesforce Certified'
    ],
    'salesforce-architect': [
        'Salesforce Architecture', 'Salesforce CRM', 'System Design',
        'Integration', 'Apex', 'Lightning Components',
        'API Design', 'Security Architecture', 'Technical Leadership',
        'Communication', 'Problem Solving', 'Strategic Planning',
        'Team Collaboration', 'Documentation', 'Agile',
        'Salesforce Certified', 'Enterprise Architecture', 'Multi-Cloud',
        'Data Architecture', 'Stakeholder Management'
    ],
    'crm-administrator': [
        'CRM Administration', 'Salesforce', 'HubSpot',
        'Zoho CRM', 'User Management', 'Data Management',
        'Reports & Dashboards', 'Workflows', 'Automation',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Team Collaboration', 'Training', 'Documentation',
        'Data Quality', 'Integrations', 'Reporting',
        'Customer Support', 'Continuous Improvement'
    ],
    'crm-developer': [
        'CRM Development', 'Salesforce', 'Apex',
        'Visualforce', 'Lightning Components', 'JavaScript',
        'REST APIs', 'SOAP APIs', 'Integration',
        'SQL', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Team Collaboration', 'Documentation',
        'Testing', 'Debugging', 'Custom Objects',
        'Workflows', 'Reports & Dashboards'
    ],
    'erp-consultant': [
        'ERP Consulting', 'ERP Systems', 'SAP',
        'Oracle', 'Microsoft Dynamics', 'NetSuite',
        'Business Analysis', 'Requirements Gathering', 'Process Mapping',
        'Configuration', 'Communication', 'Problem Solving',
        'Client Management', 'Project Management', 'Team Collaboration',
        'Documentation', 'Training', 'Testing',
        'Change Management', 'Stakeholder Management'
    ],
    'erp-administrator': [
        'ERP Administration', 'ERP Systems', 'SAP',
        'Oracle', 'Microsoft Dynamics', 'User Management',
        'Data Management', 'System Configuration', 'Troubleshooting',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Team Collaboration', 'Documentation', 'Training',
        'Security', 'Reporting', 'Integrations',
        'Backup Recovery', 'Continuous Improvement'
    ],
    'erp-developer': [
        'ERP Development', 'SAP ABAP', 'Oracle PL/SQL',
        'Microsoft Dynamics', 'Java', 'C#',
        'SQL', 'REST APIs', 'Integration',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Team Collaboration', 'Documentation', 'Testing',
        'Debugging', 'Performance Tuning', 'Customization',
        'Reports', 'Workflows'
    ],
    'sharepoint-developer': [
        'SharePoint', 'SharePoint Online', 'SPFx',
        'PowerShell', 'JavaScript', 'TypeScript',
        'C#', 'REST APIs', 'Power Automate',
        'Power Apps', 'Microsoft 365', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Team Collaboration',
        'Documentation', 'Testing', 'Deployment',
        'Custom Solutions', 'Workflows'
    ],
    'microsoft-365-administrator': [
        'Microsoft 365', 'Office 365', 'Exchange Online',
        'SharePoint Online', 'Teams', 'Azure AD',
        'PowerShell', 'Intune', 'Security',
        'Compliance', 'User Management', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Team Collaboration',
        'Documentation', 'Troubleshooting', 'Reporting',
        'Licensing', 'Backup Recovery'
    ],

    // ============================================
    // ✅ NEW BATCH 1 — CLOUD & DEVOPS (25)
    // ============================================
    'cloud-architect': [
        'Cloud Architecture', 'AWS', 'Azure',
        'Google Cloud', 'Kubernetes', 'Docker',
        'Terraform', 'Serverless', 'Microservices',
        'System Design', 'Security', 'Networking',
        'Communication', 'Problem Solving', 'Strategic Planning',
        'Team Collaboration', 'Cost Optimization', 'Disaster Recovery',
        'Technical Leadership', 'Documentation'
    ],
    'cloud-security-engineer': [
        'Cloud Security', 'AWS', 'Azure',
        'Google Cloud', 'IAM', 'Encryption',
        'Compliance', 'Security Monitoring', 'Penetration Testing',
        'Kubernetes', 'Docker', 'Terraform',
        'Python', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Team Collaboration',
        'Incident Response', 'CISSP'
    ],
    'cloud-solutions-architect': [
        'Cloud Solutions', 'AWS', 'Azure',
        'Google Cloud', 'Kubernetes', 'Terraform',
        'Microservices', 'Serverless', 'System Design',
        'Client Management', 'Communication', 'Problem Solving',
        'Presales', 'Solution Design', 'Presentation Skills',
        'Team Collaboration', 'Cost Optimization', 'Technical Leadership',
        'Documentation', 'Strategic Planning'
    ],
    'cloud-consultant': [
        'Cloud Consulting', 'AWS', 'Azure',
        'Google Cloud', 'Migration', 'Cloud Strategy',
        'Client Management', 'Communication', 'Problem Solving',
        'Solution Design', 'Presales', 'Project Management',
        'Team Collaboration', 'Documentation', 'Training',
        'Change Management', 'Cost Optimization', 'Stakeholder Management',
        'Technical Leadership', 'Presentation Skills'
    ],
    'cloud-administrator': [
        'Cloud Administration', 'AWS', 'Azure',
        'Google Cloud', 'User Management', 'Networking',
        'Monitoring', 'Troubleshooting', 'Security',
        'Cost Management', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Team Collaboration', 'Documentation',
        'Automation', 'Scripting', 'Backup Recovery',
        'Incident Response', 'Reporting'
    ],
    'platform-engineer': [
        'Platform Engineering', 'Kubernetes', 'Docker',
        'AWS', 'Azure', 'Terraform',
        'CI/CD', 'Jenkins', 'GitLab CI',
        'Monitoring', 'Prometheus', 'Grafana',
        'Linux', 'Python', 'Go',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Automation', 'Infrastructure as Code'
    ],
    'site-reliability-engineer': [
        'SRE', 'Kubernetes', 'Docker',
        'AWS', 'Terraform', 'CI/CD',
        'Prometheus', 'Grafana', 'Linux',
        'Python', 'Go', 'Bash',
        'Monitoring', 'Incident Response', 'Communication',
        'Problem Solving', 'Team Collaboration', 'Automation',
        'Capacity Planning', 'Reliability Engineering'
    ],
    'infrastructure-engineer': [
        'Infrastructure', 'Linux', 'Windows Server',
        'VMware', 'Networking', 'AWS',
        'Azure', 'Terraform', 'Ansible',
        'Docker', 'Kubernetes', 'Monitoring',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Automation', 'Documentation', 'Security',
        'Backup Recovery', 'Disaster Recovery'
    ],
    'infrastructure-architect': [
        'Infrastructure Architecture', 'Cloud', 'AWS',
        'Azure', 'Data Center', 'Networking',
        'Virtualization', 'System Design', 'Security',
        'Communication', 'Problem Solving', 'Strategic Planning',
        'Team Collaboration', 'Technical Leadership', 'Documentation',
        'Cost Optimization', 'Disaster Recovery', 'Automation',
        'Stakeholder Management', 'Innovation'
    ],
    'release-engineer': [
        'Release Engineering', 'CI/CD', 'Jenkins',
        'GitLab CI', 'GitHub Actions', 'Docker',
        'Kubernetes', 'Bash', 'Python',
        'Version Control', 'Git', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Team Collaboration',
        'Automation', 'Documentation', 'Deployment',
        'Monitoring', 'Continuous Improvement'
    ],
    'build-engineer': [
        'Build Engineering', 'CI/CD', 'Jenkins',
        'Bazel', 'Maven', 'Gradle',
        'Docker', 'Kubernetes', 'Bash',
        'Python', 'Git', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Team Collaboration',
        'Automation', 'Documentation', 'Performance Tuning',
        'Monitoring', 'Continuous Improvement'
    ],
    'automation-engineer': [
        'Automation', 'Python', 'Bash',
        'Ansible', 'Terraform', 'Jenkins',
        'Docker', 'Kubernetes', 'CI/CD',
        'Linux', 'Networking', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Team Collaboration',
        'Scripting', 'Documentation', 'Monitoring',
        'Continuous Improvement', 'Innovation'
    ],
    'devsecops-engineer': [
        'DevSecOps', 'Security', 'CI/CD',
        'Jenkins', 'Docker', 'Kubernetes',
        'AWS', 'Terraform', 'Ansible',
        'SAST', 'DAST', 'Vulnerability Scanning',
        'Python', 'Bash', 'Communication',
        'Problem Solving', 'Team Collaboration', 'Automation',
        'Compliance', 'Incident Response'
    ],
    'kubernetes-engineer': [
        'Kubernetes', 'Docker', 'Helm',
        'Kustomize', 'Istio', 'Prometheus',
        'Grafana', 'AWS', 'Azure',
        'Terraform', 'Linux', 'Python',
        'CI/CD', 'Communication', 'Problem Solving',
        'Team Collaboration', 'Automation', 'Monitoring',
        'Networking', 'Security'
    ],
    'container-engineer': [
        'Containerization', 'Docker', 'Kubernetes',
        'Podman', 'Containerd', 'Helm',
        'AWS ECS', 'AWS EKS', 'Azure AKS',
        'Linux', 'Networking', 'Security',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Automation', 'Monitoring', 'CI/CD',
        'Documentation', 'Performance Tuning'
    ],
    'linux-administrator': [
        'Linux', 'Ubuntu', 'CentOS',
        'Red Hat', 'Bash', 'Shell Scripting',
        'Networking', 'DNS', 'DHCP',
        'Firewall', 'Monitoring', 'Security',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Team Collaboration', 'Documentation', 'Troubleshooting',
        'Backup Recovery', 'Performance Tuning'
    ],
    'windows-system-administrator': [
        'Windows Server', 'Active Directory', 'Group Policy',
        'PowerShell', 'DNS', 'DHCP',
        'Hyper-V', 'Exchange Server', 'Networking',
        'Security', 'Backup Recovery', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Team Collaboration',
        'Documentation', 'Troubleshooting', 'Monitoring',
        'ITIL', 'Automation'
    ],
    'network-administrator': [
        'Network Administration', 'Cisco', 'Routing',
        'Switching', 'Firewalls', 'VPN',
        'TCP/IP', 'DNS', 'DHCP',
        'VLANs', 'Network Monitoring', 'Wireless Networking',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Team Collaboration', 'Documentation', 'Troubleshooting',
        'CCNA', 'Network Security'
    ],
    'network-security-engineer': [
        'Network Security', 'Firewalls', 'IDS/IPS',
        'VPN', 'Cisco', 'Palo Alto',
        'Fortinet', 'SIEM', 'Encryption',
        'Penetration Testing', 'Vulnerability Assessment', 'Incident Response',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Team Collaboration', 'Documentation',
        'CISSP', 'Zero Trust'
    ],
    'security-analyst': [
        'Security Analysis', 'SIEM', 'Splunk',
        'Incident Response', 'Threat Detection', 'Vulnerability Assessment',
        'Firewalls', 'IDS/IPS', 'Encryption',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Documentation', 'Reporting', 'Security Operations',
        'CompTIA Security+', 'Continuous Learning'
    ],
    'security-engineer': [
        'Security Engineering', 'Firewalls', 'IDS/IPS',
        'SIEM', 'Encryption', 'IAM',
        'Penetration Testing', 'Vulnerability Assessment', 'Security Architecture',
        'Python', 'Bash', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Team Collaboration', 'Documentation', 'Incident Response',
        'CISSP', 'Zero Trust'
    ],
    'security-architect': [
        'Security Architecture', 'Zero Trust', 'IAM',
        'Encryption', 'Security Design', 'Risk Assessment',
        'Compliance', 'Cloud Security', 'Network Security',
        'Communication', 'Problem Solving', 'Strategic Planning',
        'Technical Leadership', 'Team Collaboration', 'Documentation',
        'CISSP', 'CISM', 'Security Frameworks',
        'Stakeholder Management', 'Innovation'
    ],
    'information-security-analyst': [
        'Information Security', 'Risk Assessment', 'Compliance',
        'SIEM', 'Incident Response', 'Vulnerability Assessment',
        'Firewalls', 'Encryption', 'Security Policies',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Team Collaboration', 'Documentation',
        'Reporting', 'Security Auditing', 'ISO 27001',
        'Continuous Learning', 'Ethics'
    ],
    'information-security-manager': [
        'Information Security Management', 'Team Leadership', 'Security Strategy',
        'Risk Management', 'Compliance', 'Security Policies',
        'Incident Response', 'Budget Management', 'Stakeholder Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Strategic Planning', 'Leadership', 'Project Management',
        'Team Collaboration', 'CISSP', 'CISM',
        'Reporting', 'Change Management'
    ],
    'soc-analyst': [
        'SOC Operations', 'SIEM', 'Splunk',
        'Incident Response', 'Threat Detection', 'Log Analysis',
        'Firewalls', 'IDS/IPS', 'Malware Analysis',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Documentation', 'Reporting', 'Threat Intelligence',
        'Shift Work', 'Continuous Learning'
    ],
    'soc-engineer': [
        'SOC Engineering', 'SIEM', 'Splunk',
        'QRadar', 'Sentinel', 'Log Management',
        'Automation', 'Python', 'Bash',
        'Incident Response', 'Threat Detection', 'Detection Engineering',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Documentation', 'Monitoring', 'Security Operations',
        'Continuous Improvement', 'CISSP'
    ],
    'penetration-tester': [
        'Penetration Testing', 'Ethical Hacking', 'Kali Linux',
        'Metasploit', 'Burp Suite', 'Nmap',
        'OWASP', 'Vulnerability Assessment', 'Exploit Development',
        'Web Application Security', 'Network Security', 'Social Engineering',
        'Python', 'Bash', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Report Writing',
        'OSCP', 'CEH'
    ],
    'ethical-hacker': [
        'Ethical Hacking', 'Penetration Testing', 'Kali Linux',
        'Metasploit', 'Burp Suite', 'Wireshark',
        'Nmap', 'OWASP', 'Web Application Security',
        'Network Security', 'Reverse Engineering', 'Malware Analysis',
        'Python', 'Bash', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Report Writing',
        'CEH', 'OSCP'
    ],
    'cybersecurity-consultant': [
        'Cybersecurity Consulting', 'Risk Assessment', 'Compliance',
        'Security Auditing', 'ISO 27001', 'NIST',
        'GDPR', 'Client Management', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Project Management',
        'Team Collaboration', 'Documentation', 'Report Writing',
        'Presentation Skills', 'Stakeholder Management', 'CISSP',
        'CISM', 'Business Development'
    ],
    'digital-forensics-analyst': [
        'Digital Forensics', 'Incident Response', 'Evidence Collection',
        'EnCase', 'FTK', 'Autopsy',
        'Memory Forensics', 'Network Forensics', 'Malware Analysis',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Team Collaboration', 'Documentation',
        'Report Writing', 'Legal Knowledge', 'Chain of Custody',
        'Continuous Learning', 'Ethics'
    ],
    'incident-response-analyst': [
        'Incident Response', 'SIEM', 'Threat Detection',
        'Malware Analysis', 'Forensics', 'Containment',
        'Eradication', 'Recovery', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Documentation',
        'Reporting', 'Threat Intelligence', 'Playbooks',
        'Continuous Improvement', 'GCIH'
    ],
    'threat-intelligence-analyst': [
        'Threat Intelligence', 'OSINT', 'Dark Web Monitoring',
        'Malware Analysis', 'Threat Hunting', 'SIEM',
        'MITRE ATT&CK', 'IOC Analysis', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Team Collaboration', 'Documentation', 'Reporting',
        'Python', 'Threat Modeling', 'Continuous Learning',
        'Research', 'CISSP'
    ],
    'vulnerability-analyst': [
        'Vulnerability Assessment', 'Vulnerability Management', 'Nessus',
        'Qualys', 'Rapid7', 'CVSS',
        'Patch Management', 'Risk Assessment', 'Remediation',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Team Collaboration', 'Documentation',
        'Reporting', 'Compliance', 'Security Scanning',
        'Continuous Learning', 'CISSP'
    ],
    'application-security-engineer': [
        'Application Security', 'OWASP', 'SAST',
        'DAST', 'Secure Coding', 'Threat Modeling',
        'Penetration Testing', 'Code Review', 'SDLC',
        'Python', 'Java', 'JavaScript',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Documentation', 'Security Testing',
        'CI/CD', 'DevSecOps'
    ],
    'security-operations-manager': [
        'Security Operations', 'Team Leadership', 'SOC Management',
        'Incident Response', 'SIEM', 'Threat Detection',
        'Security Strategy', 'Budget Management', 'Communication',
        'Problem Solving', 'Decision Making', 'Strategic Planning',
        'Leadership', 'Team Collaboration', 'CISSP',
        'CISM', 'Reporting', 'Stakeholder Management',
        'Change Management', 'Continuous Improvement'
    ],
    'devops-architect': [
        'DevOps Architecture', 'CI/CD', 'Kubernetes',
        'Docker', 'Terraform', 'AWS',
        'Azure', 'Jenkins', 'GitLab CI',
        'Ansible', 'Prometheus', 'Grafana',
        'Communication', 'Problem Solving', 'Strategic Planning',
        'Technical Leadership', 'Team Collaboration', 'Automation',
        'Microservices', 'System Design'
    ],
    'solutions-architect': [
        'Solutions Architecture', 'System Design', 'Cloud',
        'AWS', 'Azure', 'Microservices',
        'API Design', 'Security', 'Scalability',
        'Client Management', 'Communication', 'Problem Solving',
        'Presales', 'Solution Design', 'Presentation Skills',
        'Team Collaboration', 'Technical Leadership', 'Documentation',
        'Cost Optimization', 'Strategic Planning'
    ],
    'technical-architect': [
        'Technical Architecture', 'System Design', 'Cloud',
        'Microservices', 'API Design', 'Security',
        'Performance Optimization', 'Scalability', 'Communication',
        'Problem Solving', 'Strategic Planning', 'Technical Leadership',
        'Team Collaboration', 'Mentoring', 'Documentation',
        'Stakeholder Management', 'Innovation', 'Cost Optimization',
        'Roadmap Planning', 'Agile'
    ],
    'enterprise-architect': [
        'Enterprise Architecture', 'TOGAF', 'Business Architecture',
        'IT Strategy', 'System Design', 'Cloud',
        'Integration', 'Governance', 'Communication',
        'Problem Solving', 'Strategic Planning', 'Technical Leadership',
        'Stakeholder Management', 'Team Collaboration', 'Documentation',
        'Change Management', 'Roadmap Planning', 'Innovation',
        'Cost Optimization', 'Risk Management'
    ],
    'systems-architect': [
        'Systems Architecture', 'System Design', 'Cloud',
        'Microservices', 'API Design', 'Security',
        'Performance Optimization', 'Scalability', 'Integration',
        'Communication', 'Problem Solving', 'Technical Leadership',
        'Team Collaboration', 'Mentoring', 'Documentation',
        'Stakeholder Management', 'Innovation', 'Roadmap Planning',
        'Agile', 'Cost Optimization'
    ],

    // ============================================
    // ✅ NEW BATCH 1 — DEVELOPERS (30)
    // ============================================
    'software-developer': [
        'Software Development', 'Java', 'Python',
        'JavaScript', 'Data Structures', 'Algorithms',
        'System Design', 'Git', 'CI/CD',
        'Agile', 'Unit Testing', 'Debugging',
        'Code Review', 'REST APIs', 'SQL',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Design Patterns', 'Documentation'
    ],
    'application-developer': [
        'Application Development', 'Java', 'C#',
        'Python', 'JavaScript', 'REST APIs',
        'SQL', 'Git', 'CI/CD',
        'Agile', 'Unit Testing', 'Debugging',
        'Code Review', 'Design Patterns', 'Communication',
        'Problem Solving', 'Team Collaboration', 'Documentation',
        'Performance Optimization', 'Security'
    ],
    'java-developer': [
        'Java', 'Spring Boot', 'Spring Framework',
        'Hibernate', 'JPA', 'Maven',
        'Gradle', 'REST APIs', 'Microservices',
        'SQL', 'NoSQL', 'Docker',
        'Kubernetes', 'Git', 'CI/CD',
        'Unit Testing', 'JUnit', 'Communication',
        'Problem Solving', 'Team Collaboration'
    ],
    'python-developer': [
        'Python', 'Django', 'Flask',
        'FastAPI', 'REST APIs', 'SQL',
        'PostgreSQL', 'MongoDB', 'Redis',
        'Docker', 'Kubernetes', 'AWS',
        'Git', 'CI/CD', 'Unit Testing',
        'Pytest', 'Communication', 'Problem Solving',
        'Team Collaboration', 'Code Review'
    ],
    'cpp-developer': [
        'C++', 'STL', 'Object-Oriented Programming',
        'Data Structures', 'Algorithms', 'Multithreading',
        'Memory Management', 'CMake', 'Git',
        'Debugging', 'Performance Optimization', 'Linux',
        'Unit Testing', 'Communication', 'Problem Solving',
        'Team Collaboration', 'Code Review', 'Design Patterns',
        'System Design', 'Documentation'
    ],
    'csharp-developer': [
        'C#', '.NET', 'ASP.NET Core',
        'Entity Framework', 'LINQ', 'REST APIs',
        'SQL Server', 'Azure', 'Docker',
        'Git', 'CI/CD', 'Unit Testing',
        'xUnit', 'Communication', 'Problem Solving',
        'Team Collaboration', 'Code Review', 'Design Patterns',
        'Microservices', 'Documentation'
    ],
    'dotnet-developer': [
        '.NET', 'C#', 'ASP.NET Core',
        'Entity Framework', 'LINQ', 'REST APIs',
        'SQL Server', 'Azure', 'Docker',
        'Kubernetes', 'Git', 'CI/CD',
        'Unit Testing', 'xUnit', 'Communication',
        'Problem Solving', 'Team Collaboration', 'Design Patterns',
        'Microservices', 'Documentation'
    ],
    'php-developer': [
        'PHP', 'Laravel', 'Symfony',
        'CodeIgniter', 'MySQL', 'REST APIs',
        'HTML5', 'CSS3', 'JavaScript',
        'jQuery', 'Git', 'Composer',
        'Docker', 'Unit Testing', 'PHPUnit',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'MVC', 'Performance Optimization'
    ],
    'laravel-developer': [
        'Laravel', 'PHP', 'Eloquent ORM',
        'Blade Templates', 'MySQL', 'REST APIs',
        'Vue.js', 'Livewire', 'Composer',
        'Git', 'Docker', 'Unit Testing',
        'PHPUnit', 'Communication', 'Problem Solving',
        'Team Collaboration', 'MVC', 'Code Review',
        'Performance Optimization', 'Security'
    ],
    'nodejs-developer': [
        'Node.js', 'Express.js', 'NestJS',
        'TypeScript', 'JavaScript', 'REST APIs',
        'GraphQL', 'MongoDB', 'PostgreSQL',
        'Redis', 'Docker', 'AWS',
        'Git', 'CI/CD', 'Unit Testing',
        'Jest', 'Communication', 'Problem Solving',
        'Team Collaboration', 'Microservices'
    ],
    'react-developer': [
        'React.js', 'Redux', 'Hooks',
        'TypeScript', 'JavaScript', 'Next.js',
        'HTML5', 'CSS3', 'Tailwind CSS',
        'REST APIs', 'GraphQL', 'Git',
        'Webpack', 'Jest', 'React Testing Library',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Responsive Design', 'Performance Optimization'
    ],
    'angular-developer': [
        'Angular', 'TypeScript', 'RxJS',
        'NgRx', 'HTML5', 'CSS3',
        'SCSS', 'REST APIs', 'GraphQL',
        'Git', 'Webpack', 'Jasmine',
        'Karma', 'Communication', 'Problem Solving',
        'Team Collaboration', 'Responsive Design', 'Performance Optimization',
        'Unit Testing', 'Code Review'
    ],
    'vuejs-developer': [
        'Vue.js', 'Vuex', 'Vue Router',
        'Nuxt.js', 'JavaScript', 'TypeScript',
        'HTML5', 'CSS3', 'Tailwind CSS',
        'REST APIs', 'GraphQL', 'Git',
        'Webpack', 'Vite', 'Jest',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Responsive Design', 'Performance Optimization'
    ],
    'flutter-developer': [
        'Flutter', 'Dart', 'Mobile Development',
        'iOS', 'Android', 'Firebase',
        'REST APIs', 'State Management', 'BLoC',
        'Provider', 'Git', 'CI/CD',
        'Unit Testing', 'Widget Testing', 'Communication',
        'Problem Solving', 'Team Collaboration', 'UI/UX',
        'Performance Optimization', 'App Publishing'
    ],
    'react-native-developer': [
        'React Native', 'JavaScript', 'TypeScript',
        'React.js', 'Redux', 'React Navigation',
        'iOS', 'Android', 'Firebase',
        'REST APIs', 'GraphQL', 'Git',
        'Jest', 'Detox', 'Communication',
        'Problem Solving', 'Team Collaboration', 'Mobile UI/UX',
        'Performance Optimization', 'App Publishing'
    ],
    'ios-developer': [
        'iOS', 'Swift', 'SwiftUI',
        'UIKit', 'Objective-C', 'Xcode',
        'Core Data', 'REST APIs', 'Firebase',
        'Git', 'CI/CD', 'Unit Testing',
        'XCTest', 'Communication', 'Problem Solving',
        'Team Collaboration', 'Mobile UI/UX', 'App Store',
        'Performance Optimization', 'Memory Management'
    ],
    'android-developer': [
        'Android', 'Kotlin', 'Java',
        'Jetpack Compose', 'Android Studio', 'Room',
        'Retrofit', 'REST APIs', 'Firebase',
        'Git', 'CI/CD', 'Unit Testing',
        'JUnit', 'Espresso', 'Communication',
        'Problem Solving', 'Team Collaboration', 'Mobile UI/UX',
        'Performance Optimization', 'Play Store'
    ],
    'kotlin-developer': [
        'Kotlin', 'Android', 'Jetpack Compose',
        'Coroutines', 'Flow', 'Room',
        'Retrofit', 'REST APIs', 'Firebase',
        'Git', 'CI/CD', 'Unit Testing',
        'JUnit', 'Mockk', 'Communication',
        'Problem Solving', 'Team Collaboration', 'Mobile UI/UX',
        'Performance Optimization', 'Play Store'
    ],
    'swift-developer': [
        'Swift', 'iOS', 'SwiftUI',
        'UIKit', 'Combine', 'Core Data',
        'Xcode', 'REST APIs', 'Firebase',
        'Git', 'CI/CD', 'Unit Testing',
        'XCTest', 'Communication', 'Problem Solving',
        'Team Collaboration', 'Mobile UI/UX', 'App Store',
        'Performance Optimization', 'Memory Management'
    ],
    'wordpress-developer': [
        'WordPress', 'PHP', 'MySQL',
        'JavaScript', 'jQuery', 'HTML5',
        'CSS3', 'WooCommerce', 'Elementor',
        'ACF', 'Git', 'REST APIs',
        'Theme Development', 'Plugin Development', 'Communication',
        'Problem Solving', 'Team Collaboration', 'SEO',
        'Performance Optimization', 'Security'
    ],
    'shopify-developer': [
        'Shopify', 'Liquid', 'JavaScript',
        'HTML5', 'CSS3', 'Shopify APIs',
        'Theme Development', 'App Development', 'E-commerce',
        'Payment Gateways', 'Git', 'Communication',
        'Problem Solving', 'Team Collaboration', 'SEO',
        'Performance Optimization', 'Analytics', 'Customer Experience',
        'Conversion Optimization', 'Shopify Plus'
    ],
    'magento-developer': [
        'Magento', 'PHP', 'MySQL',
        'JavaScript', 'Knockout.js', 'RequireJS',
        'HTML5', 'CSS3', 'REST APIs',
        'GraphQL', 'Git', 'Composer',
        'E-commerce', 'Payment Gateways', 'Communication',
        'Problem Solving', 'Team Collaboration', 'Performance Optimization',
        'Security', 'Magento 2'
    ],
    'ecommerce-developer': [
        'E-commerce', 'Shopify', 'WooCommerce',
        'Magento', 'BigCommerce', 'JavaScript',
        'PHP', 'REST APIs', 'Payment Gateways',
        'HTML5', 'CSS3', 'Git',
        'SEO', 'Analytics', 'Communication',
        'Problem Solving', 'Team Collaboration', 'Conversion Optimization',
        'Performance Optimization', 'Customer Experience'
    ],
    'game-programmer': [
        'Game Programming', 'C++', 'C#',
        'Unity', 'Unreal Engine', 'Game Physics',
        'AI Programming', 'Multiplayer Networking', 'Graphics Programming',
        'Shader Programming', 'Version Control', 'Debugging',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Performance Optimization', 'Math', 'Algorithm Design',
        'Playtesting', 'Game Design'
    ],
    'game-designer': [
        'Game Design', 'Level Design', 'Game Mechanics',
        'Storyboarding', 'Playtesting', 'Balancing',
        'Unity', 'Unreal Engine', 'Game Analytics',
        'Documentation', 'Communication', 'Creativity',
        'Problem Solving', 'Team Collaboration', 'Player Experience',
        'Prototyping', 'Narrative Design', 'UI/UX',
        'Project Management', 'Iteration'
    ],
    'technical-game-designer': [
        'Technical Game Design', 'Game Design', 'Scripting',
        'Unity', 'Unreal Engine', 'C#',
        'C++', 'Game Mechanics', 'Level Design',
        'Prototyping', 'Playtesting', 'Communication',
        'Problem Solving', 'Team Collaboration', 'Documentation',
        'Performance Optimization', 'Game Analytics', 'AI Programming',
        'Multiplayer Systems', 'UI/UX'
    ],
    'ar-developer': [
        'Augmented Reality', 'ARCore', 'ARKit',
        'Unity', 'Unreal Engine', 'C#',
        'C++', '3D Modeling', 'Computer Vision',
        'Mobile Development', 'REST APIs', 'Git',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'UI/UX', 'Performance Optimization', 'User Experience',
        'Testing', 'Deployment'
    ],
    'vr-developer': [
        'Virtual Reality', 'Oculus SDK', 'SteamVR',
        'Unity', 'Unreal Engine', 'C#',
        'C++', '3D Modeling', 'Physics Simulation',
        'Spatial Computing', 'REST APIs', 'Git',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'UI/UX', 'Performance Optimization', 'User Experience',
        'Testing', 'Deployment'
    ],
    'xr-developer': [
        'Extended Reality', 'AR', 'VR',
        'MR', 'Unity', 'Unreal Engine',
        'C#', 'C++', '3D Modeling',
        'Computer Vision', 'Spatial Computing', 'Git',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'UI/UX', 'Performance Optimization', 'User Experience',
        'Testing', 'Deployment'
    ],
    'unity-developer': [
        'Unity', 'C#', 'Game Development',
        '3D Modeling', 'Animation', 'Physics',
        'Shader Programming', 'Multiplayer', 'Mobile Games',
        'Git', 'Debugging', 'Performance Optimization',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Playtesting', 'Game Design', 'UI/UX',
        'AR/VR', 'Publishing'
    ],
    'unreal-engine-developer': [
        'Unreal Engine', 'C++', 'Blueprints',
        'Game Development', '3D Modeling', 'Animation',
        'Physics', 'Multiplayer', 'Shader Programming',
        'Git', 'Debugging', 'Performance Optimization',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Playtesting', 'Game Design', 'UI/UX',
        'AR/VR', 'Publishing'
    ],
    'embedded-software-developer': [
        'Embedded C', 'C++', 'RTOS',
        'Microcontrollers', 'Firmware', 'Device Drivers',
        'Communication Protocols', 'UART', 'SPI',
        'I2C', 'Debugging', 'Oscilloscope',
        'Git', 'Communication', 'Problem Solving',
        'Team Collaboration', 'Hardware-Software Integration', 'Low Power Design',
        'PCB Design', 'Documentation'
    ],
    'firmware-engineer': [
        'Firmware', 'Embedded C', 'C++',
        'RTOS', 'Microcontrollers', 'Device Drivers',
        'Bootloaders', 'Communication Protocols', 'UART',
        'SPI', 'I2C', 'Debugging',
        'Oscilloscope', 'Logic Analyzer', 'Git',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Low Power Design', 'Documentation'
    ],
    'firmware-developer': [
        'Firmware Development', 'Embedded C', 'C++',
        'RTOS', 'Microcontrollers', 'Device Drivers',
        'Bootloaders', 'Communication Protocols', 'UART',
        'SPI', 'I2C', 'Debugging',
        'Oscilloscope', 'Git', 'Communication',
        'Problem Solving', 'Team Collaboration', 'Low Power Design',
        'Testing', 'Documentation'
    ],
    'iot-engineer': [
        'IoT', 'Embedded Systems', 'Sensors',
        'Microcontrollers', 'MQTT', 'CoAP',
        'REST APIs', 'Cloud Platforms', 'AWS IoT',
        'Azure IoT', 'Edge Computing', 'Python',
        'C++', 'Communication', 'Problem Solving',
        'Team Collaboration', 'Security', 'Data Analytics',
        'Networking', 'Documentation'
    ],
    'iot-developer': [
        'IoT Development', 'Embedded C', 'Python',
        'MQTT', 'CoAP', 'REST APIs',
        'AWS IoT', 'Azure IoT', 'Sensors',
        'Microcontrollers', 'Edge Computing', 'Cloud Platforms',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Security', 'Data Analytics', 'Networking',
        'Testing', 'Documentation'
    ],
    'iot-solutions-architect': [
        'IoT Architecture', 'Embedded Systems', 'Cloud Platforms',
        'AWS IoT', 'Azure IoT', 'Edge Computing',
        'MQTT', 'CoAP', 'Security',
        'Data Analytics', 'System Design', 'Communication',
        'Problem Solving', 'Strategic Planning', 'Technical Leadership',
        'Team Collaboration', 'Documentation', 'Scalability',
        'Cost Optimization', 'Innovation'
    ],
    'robotics-software-engineer': [
        'Robotics', 'ROS', 'C++',
        'Python', 'Robot Kinematics', 'Robot Dynamics',
        'Control Systems', 'Computer Vision', 'SLAM',
        'Path Planning', 'Sensor Fusion', 'Machine Learning',
        'Git', 'Communication', 'Problem Solving',
        'Team Collaboration', 'Simulation', 'Embedded Systems',
        'Testing', 'Research'
    ],
    'computer-scientist': [
        'Computer Science', 'Algorithms', 'Data Structures',
        'Python', 'C++', 'Java',
        'Operating Systems', 'Networking', 'Databases',
        'Machine Learning', 'Cryptography', 'Research',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Documentation', 'Mathematics',
        'Scientific Writing', 'Continuous Learning'
    ],
    'research-scientist': [
        'Research', 'Python', 'R',
        'Machine Learning', 'Deep Learning', 'Statistics',
        'Mathematics', 'Experiment Design', 'Scientific Writing',
        'Data Analysis', 'Research Methodology', 'Literature Review',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Grant Writing', 'Publication',
        'Conference Presentations', 'Continuous Learning'
    ],
    'computational-scientist': [
        'Computational Science', 'Python', 'C++',
        'MATLAB', 'Numerical Methods', 'Simulation',
        'High-Performance Computing', 'Parallel Computing', 'Data Analysis',
        'Machine Learning', 'Mathematics', 'Statistics',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Scientific Writing', 'Research',
        'Documentation', 'Continuous Learning'
    ],
    'devops-consultant': [
        'DevOps Consulting', 'CI/CD', 'Kubernetes',
        'Docker', 'AWS', 'Azure',
        'Terraform', 'Jenkins', 'GitLab CI',
        'Client Management', 'Communication', 'Problem Solving',
        'Solution Design', 'Presales', 'Project Management',
        'Team Collaboration', 'Documentation', 'Training',
        'Change Management', 'Stakeholder Management'
    ],
    'technical-support-engineer': [
        'Technical Support', 'Troubleshooting', 'Customer Service',
        'Ticketing Systems', 'Jira', 'Zendesk',
        'Windows', 'Linux', 'Networking',
        'SQL', 'REST APIs', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Documentation', 'Escalation Management',
        'SLA Management', 'Customer Satisfaction'
    ],
    'application-support-analyst': [
        'Application Support', 'Troubleshooting', 'SQL',
        'Log Analysis', 'Ticketing Systems', 'Jira',
        'Monitoring Tools', 'Windows', 'Linux',
        'REST APIs', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Documentation', 'Incident Management', 'Root Cause Analysis',
        'Customer Service', 'ITIL'
    ],
    'it-service-manager': [
        'IT Service Management', 'ITIL', 'Team Leadership',
        'Incident Management', 'Change Management', 'Problem Management',
        'SLA Management', 'Communication', 'Problem Solving',
        'Decision Making', 'Strategic Planning', 'Leadership',
        'Project Management', 'Team Collaboration', 'Stakeholder Management',
        'KPI Management', 'Reporting', 'Continuous Improvement',
        'Budget Management', 'Vendor Management'
    ],
    'it-project-coordinator': [
        'IT Project Coordination', 'Project Management', 'Agile',
        'Scrum', 'Jira', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Documentation', 'Reporting',
        'Stakeholder Management', 'Risk Management', 'MS Project',
        'Meeting Facilitation', 'Resource Planning', 'Budget Tracking',
        'Change Management', 'Continuous Improvement'
    ],
    'it-business-analyst': [
        'IT Business Analysis', 'Requirements Gathering', 'Process Mapping',
        'SQL', 'Data Analysis', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Documentation',
        'Stakeholder Management', 'User Stories', 'Agile',
        'Jira', 'Visio', 'BPMN',
        'Testing', 'Change Management'
    ],
    'it-consultant': [
        'IT Consulting', 'Business Analysis', 'Solution Design',
        'Client Management', 'Communication', 'Problem Solving',
        'Project Management', 'Presales', 'Presentation Skills',
        'Strategic Planning', 'Team Collaboration', 'Documentation',
        'Stakeholder Management', 'Change Management', 'Technology Assessment',
        'Cloud', 'Digital Transformation', 'Cost Optimization',
        'Business Development', 'Time Management'
    ],
    'technology-consultant': [
        'Technology Consulting', 'Business Analysis', 'Solution Design',
        'Client Management', 'Communication', 'Problem Solving',
        'Project Management', 'Presales', 'Presentation Skills',
        'Strategic Planning', 'Team Collaboration', 'Documentation',
        'Stakeholder Management', 'Change Management', 'Digital Transformation',
        'Cloud', 'Data Analytics', 'Innovation',
        'Business Development', 'Time Management'
    ]
};