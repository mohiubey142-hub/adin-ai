// utils/skills-suggester/engineering.ts
// ============================================
// ENGINEERING SKILLS - 80 Professions
// ============================================

export const engineeringSkills: Record<string, string[]> = {
    // ============================================
    // CORE ENGINEERING (17) — EXISTING
    // ============================================
    'engineering': [
        'AutoCAD', 'MATLAB', 'Project Management', 'Technical Analysis',
        'Problem Solving', 'Communication', 'Documentation',
        'Quality Control', 'Team Collaboration', 'Engineering Design',
        'Data Analysis', 'MS Office', 'Report Writing',
        'Risk Assessment', 'Continuous Improvement', 'Attention to Detail',
        'Time Management', 'Critical Thinking', 'Leadership',
        'Cost Estimation', 'Standards Compliance', 'Innovation'
    ],
    'civil-engineer': [
        'AutoCAD', 'SAP2000', 'ETABS', 'Project Management',
        'Structural Analysis', 'Site Management', 'Quality Control',
        'Communication', 'Problem Solving', 'Quantity Estimation',
        'BOQ Preparation', 'Construction Management', 'Concrete Design',
        'Steel Design', 'Surveying', 'MS Project',
        'Cost Estimation', 'Safety Management', 'Blueprint Reading',
        'Revit', 'STAAD Pro', 'Geotechnical Engineering',
        'Transportation Engineering', 'Water Resources'
    ],
    'electrical-engineer': [
        'AutoCAD', 'MATLAB', 'PLC Programming', 'Electrical Design',
        'Power Systems', 'Circuit Design', 'Project Management',
        'Problem Solving', 'SCADA', 'Control Systems',
        'Electrical Panel Design', 'Wiring', 'Load Calculation',
        'Power Distribution', 'Transformers', 'Motors',
        'Switchgear', 'Protection Systems', 'Earthing',
        'Lighting Design', 'ETAP', 'Electrical Safety',
        'Instrumentation', 'Renewable Energy'
    ],
    'mechanical-engineer': [
        'SolidWorks', 'AutoCAD', 'MATLAB', 'CFD',
        'Thermal Analysis', 'Project Management', 'Mechanical Design',
        'Problem Solving', 'FEA', 'Manufacturing Processes',
        'Heat Transfer', 'Thermodynamics', 'Fluid Mechanics',
        'HVAC', 'Machine Design', 'CAD/CAM',
        'ANSYS', 'CATIA', 'GD&T',
        'Quality Control', 'Maintenance Planning', 'Lean Manufacturing',
        'Materials Science', 'Production Planning'
    ],
    'chemical-engineer': [
        'Process Design', 'Aspen HYSYS', 'MATLAB', 'Process Simulation',
        'Chemical Analysis', 'Safety Management', 'Quality Control',
        'Problem Solving', 'Process Optimization', 'Heat Transfer',
        'Mass Transfer', 'Thermodynamics', 'Reaction Engineering',
        'Process Control', 'Piping Design', 'P&ID',
        'ASPEN Plus', 'HAZOP', 'Environmental Compliance',
        'Plant Operations', 'Scale-up', 'Cost Estimation',
        'Materials Science', 'Corrosion Engineering'
    ],
    'industrial-engineer': [
        'Lean Manufacturing', 'Six Sigma', 'Process Improvement',
        'Production Planning', 'Quality Control', 'Project Management',
        'Data Analysis', 'AutoCAD', 'Statistical Analysis',
        'Supply Chain', 'Inventory Management', 'Work Study',
        'Time and Motion Study', 'Facility Layout', 'Operations Research',
        'Simulation', 'Ergonomics', 'Cost Analysis',
        'MS Project', 'Minitab', 'ERP Systems',
        'Continuous Improvement', 'Problem Solving'
    ],
    'petroleum-engineer': [
        'Drilling Engineering', 'Reservoir Engineering', 'Production Engineering',
        'Well Testing', 'Petroleum Geology', 'Reservoir Simulation',
        'Drilling Operations', 'Completion Design', 'Artificial Lift',
        'Enhanced Oil Recovery', 'Well Logging', 'PVT Analysis',
        'MATLAB', 'Petrel', 'Eclipse',
        'Safety Management', 'Environmental Compliance', 'Offshore Operations',
        'Problem Solving', 'Data Analysis', 'Cost Estimation',
        'Project Management', 'Team Collaboration'
    ],
    'architect': [
        'AutoCAD', 'Revit', '3ds Max', 'Architectural Design',
        'SketchUp', 'Building Codes', 'Construction Management',
        'Project Management', 'Creativity', 'Space Planning',
        '3D Visualization', 'Photoshop', 'Illustrator',
        'Building Information Modeling', 'Sustainable Design', 'Urban Planning',
        'Interior Design', 'Landscape Design', 'Construction Documentation',
        'Client Communication', 'Site Supervision', 'Material Selection',
        'Cost Estimation', 'Team Collaboration'
    ],
    'structural-engineer': [
        'SAP2000', 'ETABS', 'STAAD Pro', 'Structural Analysis',
        'Concrete Design', 'Steel Design', 'Foundation Design',
        'Seismic Design', 'AutoCAD', 'Revit',
        'Bridge Design', 'Load Calculation', 'Structural Dynamics',
        'Finite Element Analysis', 'Construction Management', 'Quality Control',
        'Project Management', 'Cost Estimation', 'Safety Management',
        'Communication', 'Problem Solving', 'Building Codes',
        'Report Writing', 'Team Collaboration'
    ],
    'environmental-engineer': [
        'Environmental Assessment', 'Water Treatment', 'Waste Management',
        'Air Quality', 'Environmental Compliance', 'Sustainability',
        'Environmental Impact Assessment', 'Pollution Control', 'Recycling',
        'Environmental Monitoring', 'GIS', 'Remote Sensing',
        'Environmental Law', 'Data Analysis', 'Report Writing',
        'Project Management', 'Communication', 'Problem Solving',
        'Water Quality', 'Soil Remediation', 'Renewable Energy',
        'Climate Change', 'Environmental Modeling'
    ],
    'biomedical-engineer': [
        'Medical Device Design', 'Biomechanics', 'Biomaterials',
        'Bioinstrumentation', 'Medical Imaging', 'Biomedical Signal Processing',
        'CAD', 'MATLAB', 'Quality Control',
        'Regulatory Compliance', 'FDA Regulations', 'ISO 13485',
        'Clinical Engineering', 'Prosthetics', 'Implants',
        'Tissue Engineering', 'Biosensors', 'Research',
        'Data Analysis', 'Problem Solving', 'Communication',
        'Project Management', 'Team Collaboration'
    ],
    'robotics-engineer': [
        'ROS', 'C++', 'Python', 'Robot Kinematics',
        'Robot Dynamics', 'Control Systems', 'Computer Vision',
        'Machine Learning', 'MATLAB', 'Simulink',
        'Path Planning', 'Sensor Fusion', 'Actuators',
        'SLAM', 'Embedded Systems', 'PLC',
        'Automation', 'Mechatronics', 'Arduino',
        'Raspberry Pi', 'PCB Design', 'Problem Solving',
        'Team Collaboration', 'Research'
    ],
    'automobile-engineer': [
        'AutoCAD', 'CATIA', 'SolidWorks', 'Vehicle Dynamics',
        'Powertrain', 'Vehicle Safety', 'Engine Design',
        'Electric Vehicles', 'Automotive Electronics', 'Project Management',
        'MATLAB', 'CFD', 'FEA',
        'Thermal Management', 'NVH Analysis', 'Braking Systems',
        'Suspension Design', 'Transmission Design', 'Emissions Control',
        'Manufacturing Processes', 'Quality Control', 'Testing',
        'Problem Solving', 'Team Collaboration'
    ],
    'mining-engineer': [
        'Mine Planning', 'Geology', 'Rock Mechanics',
        'Mine Operations', 'Safety Management', 'Ventilation',
        'Explosives Engineering', 'Resource Estimation', 'Environmental Management',
        'Mining Software', 'Surveying', 'Drilling and Blasting',
        'Mineral Processing', 'Ground Control', 'Mine Design',
        'Cost Estimation', 'Project Management', 'Data Analysis',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Equipment Selection', 'Mine Reclamation'
    ],
    'telecommunications-engineer': [
        'Network Design', 'Telecom Systems', 'Fiber Optics',
        'Wireless Communication', 'Signal Processing', 'Network Optimization',
        'RF Engineering', 'Project Management', 'Communication Protocols',
        'System Integration', '5G Technology', 'LTE',
        'VoIP', 'Network Security', 'Data Communication',
        'Antenna Design', 'Spectrum Analysis', 'MATLAB',
        'Problem Solving', 'Data Analysis', 'Team Collaboration',
        'Troubleshooting', 'Documentation'
    ],
    'quantity-surveyor': [
        'Quantity Surveying', 'Cost Estimation', 'BOQ Preparation',
        'Contract Administration', 'Cost Management', 'Procurement',
        'Project Financial Control', 'Construction Law', 'Value Engineering',
        'Risk Management', 'AutoCAD', 'Cost Planning',
        'Tendering', 'Measurement', 'Valuation',
        'Final Accounts', 'Claims Management', 'Dispute Resolution',
        'MS Project', 'Excel', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Team Collaboration'
    ],
    'mechatronics-engineer': [
        'C++', 'Python', 'PLC', 'Arduino',
        'Raspberry Pi', 'ROS', 'Control Systems',
        'Sensors', 'Actuators', 'Circuit Design',
        'Mechanical Design', 'System Integration', 'CAD',
        'MATLAB', 'Simulink', 'Automation',
        'Robotics', 'Embedded Systems', 'Pneumatics',
        'Hydraulics', 'Industrial Automation', 'SCADA',
        'HMI', 'Problem Solving'
    ],

    // ============================================
    // ✅ NEW BATCH 4 — CIVIL & CONSTRUCTION (12)
    // ============================================
    'geotechnical-engineer': [
        'Geotechnical Engineering', 'Soil Mechanics', 'Rock Mechanics',
        'Foundation Design', 'Site Investigation', 'PLAXIS',
        'GeoStudio', 'AutoCAD', 'Data Analysis',
        'Project Management', 'Problem Solving', 'Critical Thinking',
        'Communication', 'Team Collaboration', 'Report Writing',
        'Field Work', 'Laboratory Testing', 'Regulatory Compliance',
        'Research Ethics', 'Continuous Learning'
    ],
    'transportation-engineer': [
        'Transportation Engineering', 'Highway Design', 'Traffic Engineering',
        'AutoCAD', 'Civil 3D', 'GIS',
        'Data Analysis', 'Project Management', 'Problem Solving',
        'Critical Thinking', 'Communication', 'Team Collaboration',
        'Report Writing', 'Regulatory Compliance', 'Sustainability',
        'Cost Analysis', 'Field Work', 'Time Management',
        'MS Office', 'Continuous Learning'
    ],
    'highway-engineer': [
        'Highway Engineering', 'Road Design', 'Pavement Design',
        'AutoCAD', 'Civil 3D', 'GIS',
        'Data Analysis', 'Project Management', 'Problem Solving',
        'Critical Thinking', 'Communication', 'Team Collaboration',
        'Report Writing', 'Regulatory Compliance', 'Cost Analysis',
        'Field Work', 'Time Management', 'MS Office',
        'Sustainability', 'Continuous Learning'
    ],
    'traffic-engineer': [
        'Traffic Engineering', 'Traffic Analysis', 'Traffic Modeling',
        'AutoCAD', 'VISSIM', 'SYNCHRO',
        'GIS', 'Data Analysis', 'Project Management',
        'Problem Solving', 'Critical Thinking', 'Communication',
        'Team Collaboration', 'Report Writing', 'Regulatory Compliance',
        'Sustainability', 'Field Work', 'Time Management',
        'MS Office', 'Continuous Learning'
    ],
    'water-resources-engineer': [
        'Water Resources Engineering', 'Hydrology', 'Hydraulics',
        'Water Management', 'HEC-RAS', 'AutoCAD',
        'GIS', 'Data Analysis', 'Project Management',
        'Problem Solving', 'Critical Thinking', 'Communication',
        'Team Collaboration', 'Report Writing', 'Sustainability',
        'Regulatory Compliance', 'Field Work', 'Time Management',
        'MS Office', 'Continuous Learning'
    ],
    'hydraulics-engineer': [
        'Hydraulics Engineering', 'Fluid Mechanics', 'Pipe Flow',
        'Open Channel Flow', 'AutoCAD', 'HEC-RAS',
        'EPANET', 'Data Analysis', 'Project Management',
        'Problem Solving', 'Critical Thinking', 'Communication',
        'Team Collaboration', 'Report Writing', 'Sustainability',
        'Regulatory Compliance', 'Field Work', 'Time Management',
        'MS Office', 'Continuous Learning'
    ],
    'hydrology-engineer': [
        'Hydrology', 'Water Cycle', 'Rainfall Analysis',
        'Flood Modeling', 'HEC-HMS', 'GIS',
        'Remote Sensing', 'Data Analysis', 'Project Management',
        'Problem Solving', 'Critical Thinking', 'Communication',
        'Team Collaboration', 'Report Writing', 'Sustainability',
        'Regulatory Compliance', 'Field Work', 'Time Management',
        'MS Office', 'Continuous Learning'
    ],
    'environmental-civil-engineer': [
        'Environmental Engineering', 'Water Treatment', 'Wastewater Treatment',
        'Air Pollution Control', 'AutoCAD', 'Data Analysis',
        'Project Management', 'Problem Solving', 'Critical Thinking',
        'Communication', 'Team Collaboration', 'Report Writing',
        'Sustainability', 'Regulatory Compliance', 'Environmental Impact',
        'Field Work', 'Time Management', 'MS Office',
        'Research Ethics', 'Continuous Learning'
    ],
    'construction-engineer': [
        'Construction Engineering', 'Site Management', 'Construction Methods',
        'AutoCAD', 'Project Management', 'Quality Control',
        'Safety Management', 'Cost Estimation', 'BOQ Preparation',
        'Blueprint Reading', 'Communication', 'Problem Solving',
        'Team Collaboration', 'Report Writing', 'Scheduling',
        'MS Project', 'Regulatory Compliance', 'Field Work',
        'Time Management', 'Continuous Learning'
    ],
    'construction-manager': [
        'Construction Management', 'Team Leadership', 'Project Management',
        'Budget Management', 'Scheduling', 'Quality Control',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Safety Management',
        'Cost Estimation', 'Contract Management', 'Risk Management',
        'Reporting', 'Regulatory Compliance', 'Vendor Management',
        'Field Work', 'Continuous Improvement'
    ],
    'construction-project-manager': [
        'Construction Project Management', 'Team Leadership', 'Project Management',
        'Budget Management', 'Scheduling', 'Quality Control',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Safety Management',
        'Cost Estimation', 'Contract Management', 'Risk Management',
        'Reporting', 'Regulatory Compliance', 'Vendor Management',
        'Stakeholder Management', 'Continuous Improvement'
    ],
    'construction-supervisor': [
        'Construction Supervision', 'Team Management', 'Site Management',
        'Scheduling', 'Quality Control', 'Safety Management',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Blueprint Reading',
        'Cost Estimation', 'Reporting', 'MS Office',
        'Field Work', 'Physical Stamina', 'Reliability',
        'Adaptability', 'Continuous Improvement'
    ],
    'site-engineer': [
        'Site Engineering', 'Site Management', 'Construction Methods',
        'AutoCAD', 'Quality Control', 'Safety Management',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Time Management', 'Team Collaboration', 'Blueprint Reading',
        'Cost Estimation', 'Reporting', 'MS Office',
        'Field Work', 'Regulatory Compliance', 'Documentation',
        'Physical Stamina', 'Continuous Learning'
    ],
    'site-manager': [
        'Site Management', 'Team Leadership', 'Construction Methods',
        'Budget Management', 'Scheduling', 'Quality Control',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Safety Management',
        'Cost Estimation', 'Contract Management', 'Risk Management',
        'Reporting', 'Regulatory Compliance', 'Vendor Management',
        'Field Work', 'Continuous Improvement'
    ],
    'site-supervisor': [
        'Site Supervision', 'Team Management', 'Construction Methods',
        'Scheduling', 'Quality Control', 'Safety Management',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Blueprint Reading',
        'Reporting', 'MS Office', 'Field Work',
        'Physical Stamina', 'Reliability', 'Adaptability',
        'Documentation', 'Continuous Improvement'
    ],
    'resident-engineer': [
        'Resident Engineering', 'Site Management', 'Quality Control',
        'Construction Methods', 'AutoCAD', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Blueprint Reading',
        'Cost Estimation', 'Reporting', 'Regulatory Compliance',
        'Field Work', 'Documentation', 'Physical Stamina',
        'Reliability', 'Continuous Learning'
    ],
    'planning-engineer': [
        'Planning Engineering', 'Project Planning', 'Scheduling',
        'Primavera P6', 'MS Project', 'Cost Estimation',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Reporting', 'Risk Management', 'Resource Planning',
        'KPI Tracking', 'MS Office', 'Documentation',
        'Data Analysis', 'Continuous Learning'
    ],
    'planning-manager': [
        'Planning Management', 'Team Leadership', 'Project Planning',
        'Scheduling', 'Primavera P6', 'MS Project',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Cost Estimation',
        'Reporting', 'Risk Management', 'Resource Planning',
        'KPI Management', 'Strategic Planning', 'Stakeholder Management',
        'MS Office', 'Continuous Improvement'
    ],
    'estimation-engineer': [
        'Estimation Engineering', 'Cost Estimation', 'BOQ Preparation',
        'AutoCAD', 'Quantity Take-off', 'Excel',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Tendering', 'Vendor Coordination', 'Reporting',
        'Contract Management', 'MS Office', 'Documentation',
        'Cost Analysis', 'Continuous Learning'
    ],
    'estimator': [
        'Cost Estimation', 'BOQ Preparation', 'Quantity Take-off',
        'AutoCAD', 'Excel', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Tendering', 'Vendor Coordination',
        'Reporting', 'Contract Management', 'MS Office',
        'Documentation', 'Cost Analysis', 'Field Work',
        'Reliability', 'Continuous Learning'
    ],
    'cost-engineer': [
        'Cost Engineering', 'Cost Estimation', 'Cost Control',
        'BOQ Preparation', 'Excel', 'AutoCAD',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Reporting', 'Budget Management', 'Risk Analysis',
        'Variance Analysis', 'MS Office', 'Contract Management',
        'Data Analysis', 'Continuous Learning'
    ],
    'contracts-engineer': [
        'Contracts Engineering', 'Contract Management', 'Contract Administration',
        'Cost Estimation', 'Procurement', 'Negotiation',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Reporting', 'Risk Management', 'Claims Management',
        'Legal Knowledge', 'MS Office', 'Documentation',
        'Compliance', 'Continuous Learning'
    ],
    'contracts-manager': [
        'Contracts Management', 'Team Leadership', 'Contract Administration',
        'Contract Negotiation', 'Procurement', 'Cost Estimation',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Risk Management',
        'Reporting', 'Claims Management', 'Legal Knowledge',
        'Compliance', 'MS Office', 'Stakeholder Management',
        'Strategic Planning', 'Continuous Improvement'
    ],
    'contracts-administrator': [
        'Contract Administration', 'Contract Management', 'Documentation',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Reporting',
        'Compliance', 'MS Office', 'Filing',
        'Correspondence', 'Meeting Minutes', 'Data Entry',
        'Organizational Skills', 'Multitasking', 'Confidentiality',
        'Reliability', 'Continuous Learning'
    ],
    'procurement-manager': [
        'Procurement Management', 'Team Leadership', 'Strategic Sourcing',
        'Vendor Management', 'Contract Negotiation', 'Budget Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'KPI Management',
        'Reporting', 'Risk Management', 'Compliance',
        'Supply Chain', 'ERP Systems', 'Stakeholder Management',
        'Strategic Planning', 'Continuous Improvement'
    ],
    'procurement-specialist': [
        'Procurement', 'Strategic Sourcing', 'Vendor Management',
        'Contract Negotiation', 'Purchase Orders', 'RFQ',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Reporting',
        'Compliance', 'ERP Systems', 'MS Office',
        'Cost Analysis', 'Market Research', 'Supplier Evaluation',
        'Documentation', 'Continuous Learning'
    ],
    'procurement-coordinator': [
        'Procurement Coordination', 'Purchase Orders', 'Vendor Coordination',
        'Data Entry', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'MS Office', 'ERP Systems', 'Reporting',
        'Documentation', 'Filing', 'Follow-up',
        'Organizational Skills', 'Multitasking', 'Reliability',
        'Customer Service', 'Continuous Learning'
    ],
    'purchasing-officer': [
        'Purchasing', 'Vendor Management', 'Purchase Orders',
        'Negotiation', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'MS Office', 'ERP Systems', 'Reporting',
        'Documentation', 'Cost Analysis', 'Market Research',
        'Compliance', 'Supplier Evaluation', 'Follow-up',
        'Reliability', 'Continuous Learning'
    ],
    'purchasing-manager': [
        'Purchasing Management', 'Team Leadership', 'Strategic Sourcing',
        'Vendor Management', 'Contract Negotiation', 'Budget Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'KPI Management',
        'Reporting', 'Cost Optimization', 'Compliance',
        'ERP Systems', 'Supply Chain', 'Stakeholder Management',
        'Strategic Planning', 'Continuous Improvement'
    ],
    'buyer': [
        'Buying', 'Vendor Management', 'Purchase Orders',
        'Negotiation', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'MS Office', 'ERP Systems', 'Reporting',
        'Cost Analysis', 'Market Research', 'Supplier Evaluation',
        'Inventory Management', 'Compliance', 'Documentation',
        'Reliability', 'Continuous Learning'
    ],
    'strategic-sourcing-specialist': [
        'Strategic Sourcing', 'Category Management', 'Vendor Management',
        'Contract Negotiation', 'Market Analysis', 'Cost Optimization',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Strategic Planning', 'Team Collaboration', 'Reporting',
        'Compliance', 'ERP Systems', 'MS Office',
        'Data Analysis', 'Risk Management', 'Supplier Relationship',
        'Business Development', 'Continuous Learning'
    ],
    'sourcing-manager': [
        'Sourcing Management', 'Team Leadership', 'Strategic Sourcing',
        'Vendor Management', 'Contract Negotiation', 'Cost Optimization',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'KPI Management',
        'Reporting', 'Compliance', 'ERP Systems',
        'Market Research', 'Supplier Relationship', 'Stakeholder Management',
        'Strategic Planning', 'Continuous Improvement'
    ],
    'materials-engineer': [
        'Materials Engineering', 'Material Science', 'Metallurgy',
        'Material Testing', 'Quality Control', 'Data Analysis',
        'AutoCAD', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Report Writing', 'Laboratory Techniques',
        'Compliance', 'Standards Knowledge', 'Failure Analysis',
        'Research', 'Continuous Learning'
    ],
    'materials-manager': [
        'Materials Management', 'Team Leadership', 'Inventory Management',
        'Procurement', 'Warehousing', 'Budget Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'KPI Management',
        'Reporting', 'Supply Chain', 'ERP Systems',
        'Vendor Management', 'Logistics', 'Stakeholder Management',
        'Strategic Planning', 'Continuous Improvement'
    ],
    'materials-coordinator': [
        'Materials Coordination', 'Inventory Management', 'Data Entry',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'MS Office',
        'ERP Systems', 'Reporting', 'Documentation',
        'Vendor Coordination', 'Order Processing', 'Record Keeping',
        'Organizational Skills', 'Multitasking', 'Reliability',
        'Customer Service', 'Continuous Learning'
    ],
    'quantity-surveyor-assistant': [
        'Quantity Surveying Support', 'Cost Estimation', 'BOQ Preparation',
        'AutoCAD', 'Excel', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Reporting', 'Measurement',
        'Documentation', 'MS Office', 'Cost Analysis',
        'Field Work', 'Organizational Skills', 'Reliability',
        'Data Entry', 'Continuous Learning'
    ],
    'building-surveyor': [
        'Building Surveying', 'Building Inspection', 'Condition Survey',
        'AutoCAD', 'Construction Knowledge', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Report Writing',
        'Building Codes', 'Regulatory Compliance', 'Cost Estimation',
        'Client Communication', 'Field Work', 'MS Office',
        'Documentation', 'Continuous Learning'
    ],
    'land-surveyor': [
        'Land Surveying', 'Topographic Survey', 'GPS Surveying',
        'Total Station', 'AutoCAD', 'Civil 3D',
        'GIS', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Report Writing', 'Field Work',
        'Surveying Software', 'Data Analysis', 'Physical Stamina',
        'MS Office', 'Continuous Learning'
    ],
    'survey-engineer': [
        'Survey Engineering', 'Land Surveying', 'Topographic Survey',
        'Total Station', 'AutoCAD', 'Civil 3D',
        'GIS', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Report Writing', 'Field Work',
        'Surveying Software', 'Data Analysis', 'Physical Stamina',
        'MS Office', 'Continuous Learning'
    ],
    'surveyor-assistant': [
        'Survey Support', 'Field Work', 'Equipment Handling',
        'Data Recording', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Physical Stamina', 'Reliability', 'Field Notes',
        'Data Entry', 'MS Office', 'Organizational Skills',
        'Adaptability', 'Safety Compliance', 'Follow Instructions',
        'Learning Attitude', 'Continuous Learning'
    ],
    'cad-technician': [
        'CAD Drafting', 'AutoCAD', 'Revit',
        'SolidWorks', 'Technical Drawing', 'Blueprint Reading',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Documentation',
        '3D Modeling', 'MS Office', 'Reporting',
        'Design Standards', 'Quality Control', 'Organizational Skills',
        'Reliability', 'Continuous Learning'
    ],
    'cad-designer': [
        'CAD Design', 'AutoCAD', 'SolidWorks',
        'Revit', 'Technical Drawing', '3D Modeling',
        'Communication', 'Problem Solving', 'Creativity',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Documentation', 'Design Standards', 'MS Office',
        'Rendering', 'Quality Control', 'Project Support',
        'Organizational Skills', 'Continuous Learning'
    ],
    'bim-modeler': [
        'BIM Modeling', 'Revit', 'Navisworks',
        'AutoCAD', '3D Modeling', 'Clash Detection',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Documentation',
        'Design Standards', 'BIM Standards', 'MS Office',
        'Coordination', 'Quality Control', 'Reporting',
        'Organizational Skills', 'Continuous Learning'
    ],
    'bim-coordinator': [
        'BIM Coordination', 'Revit', 'Navisworks',
        'AutoCAD', 'Clash Detection', 'BIM Standards',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Documentation', 'Coordination', 'Reporting',
        'Project Management', 'Quality Control', 'Training',
        'MS Office', 'Continuous Learning'
    ],
    'bim-manager': [
        'BIM Management', 'Team Leadership', 'Revit',
        'Navisworks', 'BIM Standards', 'BIM Strategy',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'KPI Management',
        'Reporting', 'Training', 'Process Improvement',
        'Project Management', 'Stakeholder Management', 'Strategic Planning',
        'MS Office', 'Continuous Improvement'
    ],
    'revit-modeler': [
        'Revit Modeling', 'Revit', 'AutoCAD',
        '3D Modeling', 'BIM', 'Family Creation',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Documentation',
        'Design Standards', 'Clash Detection', 'MS Office',
        'Rendering', 'Quality Control', 'Project Support',
        'Organizational Skills', 'Continuous Learning'
    ],
    'architectural-technologist': [
        'Architectural Technology', 'AutoCAD', 'Revit',
        'Technical Drawing', 'Building Codes', 'Construction Documentation',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Report Writing', 'Design Standards', 'MS Office',
        'Site Supervision', 'Quality Control', 'Regulatory Compliance',
        'Documentation', 'Continuous Learning'
    ],
    'architectural-draftsman': [
        'Architectural Drafting', 'AutoCAD', 'Revit',
        'Technical Drawing', 'Blueprint Reading', 'Construction Documentation',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Documentation',
        'Design Standards', 'MS Office', 'Quality Control',
        'Organizational Skills', 'Reliability', 'Follow Instructions',
        'Learning Attitude', 'Continuous Learning'
    ],
    'civil-draftsman': [
        'Civil Drafting', 'AutoCAD', 'Civil 3D',
        'Technical Drawing', 'Blueprint Reading', 'Construction Documentation',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Documentation',
        'Surveying Support', 'MS Office', 'Quality Control',
        'Organizational Skills', 'Reliability', 'Follow Instructions',
        'Learning Attitude', 'Continuous Learning'
    ],
    'structural-draftsman': [
        'Structural Drafting', 'AutoCAD', 'Revit',
        'Technical Drawing', 'Blueprint Reading', 'Structural Drawings',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Documentation',
        'Design Standards', 'MS Office', 'Quality Control',
        'Organizational Skills', 'Reliability', 'Follow Instructions',
        'Learning Attitude', 'Continuous Learning'
    ],
    'mep-engineer': [
        'MEP Engineering', 'Mechanical Systems', 'Electrical Systems',
        'Plumbing Systems', 'AutoCAD', 'Revit',
        'HVAC Design', 'Load Calculation', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Report Writing',
        'Project Management', 'Regulatory Compliance', 'MS Office',
        'Site Supervision', 'Continuous Learning'
    ],
    'mep-coordinator': [
        'MEP Coordination', 'Mechanical Systems', 'Electrical Systems',
        'Plumbing Systems', 'AutoCAD', 'Revit',
        'Clash Detection', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Documentation', 'Coordination', 'Reporting',
        'Project Management', 'Quality Control', 'MS Office',
        'Site Supervision', 'Continuous Learning'
    ],
    'mep-manager': [
        'MEP Management', 'Team Leadership', 'Mechanical Systems',
        'Electrical Systems', 'Plumbing Systems', 'Budget Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'KPI Management',
        'Reporting', 'Project Management', 'Contract Management',
        'Regulatory Compliance', 'Stakeholder Management', 'Strategic Planning',
        'MS Office', 'Continuous Improvement'
    ],
    'mechanical-draftsman': [
        'Mechanical Drafting', 'AutoCAD', 'SolidWorks',
        'Technical Drawing', 'Blueprint Reading', 'Mechanical Drawings',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Documentation',
        'Design Standards', 'MS Office', 'Quality Control',
        'Organizational Skills', 'Reliability', 'Follow Instructions',
        'Learning Attitude', 'Continuous Learning'
    ],
    'electrical-draftsman': [
        'Electrical Drafting', 'AutoCAD', 'Electrical Design',
        'Technical Drawing', 'Blueprint Reading', 'Electrical Drawings',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Documentation',
        'Design Standards', 'MS Office', 'Quality Control',
        'Organizational Skills', 'Reliability', 'Follow Instructions',
        'Learning Attitude', 'Continuous Learning'
    ],
    'hvac-engineer': [
        'HVAC Engineering', 'HVAC Design', 'Load Calculation',
        'Duct Design', 'AutoCAD', 'Revit',
        'Energy Efficiency', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Report Writing', 'Project Management',
        'Regulatory Compliance', 'MS Office', 'Site Supervision',
        'Troubleshooting', 'Continuous Learning'
    ],
    'hvac-supervisor': [
        'HVAC Supervision', 'Team Management', 'HVAC Installation',
        'Maintenance', 'Troubleshooting', 'Safety Management',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Reporting',
        'MS Office', 'Field Work', 'Physical Stamina',
        'Reliability', 'Adaptability', 'Documentation',
        'Customer Service', 'Continuous Improvement'
    ],
    'plumbing-engineer': [
        'Plumbing Engineering', 'Plumbing Design', 'Water Supply',
        'Drainage Systems', 'AutoCAD', 'Revit',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Report Writing', 'Project Management', 'Regulatory Compliance',
        'MS Office', 'Site Supervision', 'Troubleshooting',
        'Cost Estimation', 'Continuous Learning'
    ],
    'plumbing-supervisor': [
        'Plumbing Supervision', 'Team Management', 'Plumbing Installation',
        'Maintenance', 'Troubleshooting', 'Safety Management',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Reporting',
        'MS Office', 'Field Work', 'Physical Stamina',
        'Reliability', 'Adaptability', 'Documentation',
        'Customer Service', 'Continuous Improvement'
    ],
    'fire-protection-engineer': [
        'Fire Protection Engineering', 'Fire Safety', 'Fire Suppression Systems',
        'Sprinkler Systems', 'Fire Alarm Systems', 'AutoCAD',
        'NFPA Standards', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Report Writing', 'Project Management',
        'Regulatory Compliance', 'MS Office', 'Site Supervision',
        'Cost Estimation', 'Continuous Learning'
    ],
    'fire-safety-engineer': [
        'Fire Safety Engineering', 'Fire Safety', 'Fire Risk Assessment',
        'Fire Suppression Systems', 'Fire Alarm Systems', 'AutoCAD',
        'NFPA Standards', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Report Writing', 'Project Management',
        'Regulatory Compliance', 'MS Office', 'Site Supervision',
        'Training', 'Continuous Learning'
    ],
    'fire-safety-officer': [
        'Fire Safety', 'Fire Risk Assessment', 'Fire Inspections',
        'Fire Safety Training', 'Emergency Response', 'Fire Prevention',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Report Writing', 'Regulatory Compliance', 'MS Office',
        'First Aid', 'CPR', 'Site Inspections',
        'Documentation', 'Continuous Learning'
    ],
    'building-services-engineer': [
        'Building Services Engineering', 'HVAC Design', 'Electrical Systems',
        'Plumbing Systems', 'Fire Protection', 'AutoCAD',
        'Revit', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Report Writing', 'Project Management',
        'Regulatory Compliance', 'MS Office', 'Site Supervision',
        'Cost Estimation', 'Continuous Learning'
    ],
    'facilities-manager': [
        'Facilities Management', 'Team Leadership', 'Building Operations',
        'Maintenance Management', 'Budget Management', 'Vendor Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'KPI Management',
        'Reporting', 'Health & Safety', 'Compliance',
        'Project Management', 'Stakeholder Management', 'Strategic Planning',
        'MS Office', 'Continuous Improvement'
    ],
    'facilities-coordinator': [
        'Facilities Coordination', 'Building Operations', 'Maintenance Coordination',
        'Vendor Coordination', 'Data Entry', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'MS Office', 'Reporting',
        'Documentation', 'Scheduling', 'Record Keeping',
        'Organizational Skills', 'Multitasking', 'Customer Service',
        'Reliability', 'Continuous Learning'
    ],
    'property-manager': [
        'Property Management', 'Team Leadership', 'Building Operations',
        'Tenant Relations', 'Lease Management', 'Budget Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Vendor Management',
        'Reporting', 'Health & Safety', 'Compliance',
        'Maintenance Management', 'Stakeholder Management', 'MS Office',
        'Customer Service', 'Continuous Improvement'
    ],
    'estate-manager': [
        'Estate Management', 'Team Leadership', 'Property Management',
        'Tenant Relations', 'Lease Management', 'Budget Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Vendor Management',
        'Reporting', 'Health & Safety', 'Compliance',
        'Maintenance Management', 'Stakeholder Management', 'MS Office',
        'Customer Service', 'Continuous Improvement'
    ],
    'building-manager': [
        'Building Management', 'Team Leadership', 'Building Operations',
        'Tenant Relations', 'Maintenance Management', 'Budget Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Vendor Management',
        'Reporting', 'Health & Safety', 'Compliance',
        'Project Management', 'Stakeholder Management', 'MS Office',
        'Customer Service', 'Continuous Improvement'
    ],

    // ============================================
    // ✅ NEW BATCH 4 — MECHANICAL & MANUFACTURING (18)
    // ============================================
    'manufacturing-engineer': [
        'Manufacturing Engineering', 'Production Processes', 'Lean Manufacturing',
        'Six Sigma', 'Quality Control', 'Process Improvement',
        'AutoCAD', 'SolidWorks', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Report Writing',
        'Cost Analysis', 'KPI Tracking', 'MS Office',
        'Continuous Improvement', 'Safety Management'
    ],
    'manufacturing-manager': [
        'Manufacturing Management', 'Team Leadership', 'Production Planning',
        'Budget Management', 'Quality Control', 'Lean Manufacturing',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'KPI Management',
        'Reporting', 'Safety Management', 'Process Improvement',
        'Vendor Management', 'Strategic Planning', 'Continuous Improvement',
        'MS Office', 'ERP Systems'
    ],
    'manufacturing-supervisor': [
        'Manufacturing Supervision', 'Team Management', 'Production Planning',
        'Quality Control', 'Safety Management', 'Process Improvement',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'KPI Tracking',
        'Reporting', 'Shift Management', 'Training',
        'MS Office', 'Continuous Improvement', 'Physical Stamina',
        'Reliability', 'Adaptability'
    ],
    'process-engineer': [
        'Process Engineering', 'Process Design', 'Process Optimization',
        'AutoCAD', 'MATLAB', 'Aspen HYSYS',
        'Data Analysis', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Report Writing', 'Quality Control',
        'Safety Management', 'Cost Estimation', 'MS Office',
        'Continuous Improvement', 'Regulatory Compliance'
    ],
    'process-control-engineer': [
        'Process Control', 'Control Systems', 'PLC',
        'SCADA', 'DCS', 'Instrumentation',
        'AutoCAD', 'MATLAB', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Report Writing',
        'Troubleshooting', 'Safety Management', 'MS Office',
        'Continuous Improvement', 'Regulatory Compliance'
    ],
    'production-engineer': [
        'Production Engineering', 'Production Planning', 'Lean Manufacturing',
        'Six Sigma', 'Quality Control', 'Process Improvement',
        'AutoCAD', 'SolidWorks', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Report Writing',
        'Cost Analysis', 'KPI Tracking', 'MS Office',
        'Continuous Improvement', 'Safety Management'
    ],
    'production-planner': [
        'Production Planning', 'Scheduling', 'MRP',
        'ERP Systems', 'Excel', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Reporting',
        'Inventory Management', 'KPI Tracking', 'MS Office',
        'Data Analysis', 'Cost Analysis', 'Continuous Improvement',
        'Documentation', 'Coordination'
    ],
    'production-controller': [
        'Production Control', 'Scheduling', 'MRP',
        'ERP Systems', 'Excel', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Reporting', 'Inventory Management',
        'KPI Tracking', 'MS Office', 'Data Analysis',
        'Documentation', 'Coordination', 'Continuous Improvement',
        'Reliability', 'Organizational Skills'
    ],
    'production-coordinator': [
        'Production Coordination', 'Scheduling', 'Data Entry',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'MS Office',
        'ERP Systems', 'Reporting', 'Documentation',
        'Order Processing', 'Record Keeping', 'Coordination',
        'Organizational Skills', 'Multitasking', 'Reliability',
        'Customer Service', 'Continuous Learning'
    ],
    'industrial-automation-engineer': [
        'Industrial Automation', 'PLC Programming', 'SCADA',
        'HMI', 'Robotics', 'Control Systems',
        'AutoCAD', 'MATLAB', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Report Writing',
        'Troubleshooting', 'Safety Management', 'MS Office',
        'Continuous Improvement', 'Project Management'
    ],
    'automation-technician': [
        'Automation Support', 'PLC', 'SCADA',
        'HMI', 'Instrumentation', 'Troubleshooting',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Reporting',
        'Maintenance', 'MS Office', 'Documentation',
        'Safety Compliance', 'Physical Stamina', 'Reliability',
        'Adaptability', 'Continuous Learning'
    ],
    'control-systems-engineer': [
        'Control Systems Engineering', 'Control Theory', 'PID Controllers',
        'PLC', 'SCADA', 'DCS',
        'MATLAB', 'Simulink', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Report Writing',
        'Troubleshooting', 'Safety Management', 'MS Office',
        'Continuous Improvement', 'Project Management'
    ],
    'instrumentation-engineer': [
        'Instrumentation Engineering', 'Sensors', 'Transmitters',
        'Control Valves', 'PLC', 'SCADA',
        'Calibration', 'AutoCAD', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Report Writing',
        'Troubleshooting', 'Safety Management', 'MS Office',
        'Continuous Improvement', 'Regulatory Compliance'
    ],
    'instrumentation-technician': [
        'Instrumentation Support', 'Sensors', 'Transmitters',
        'Calibration', 'Troubleshooting', 'Maintenance',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Reporting',
        'MS Office', 'Documentation', 'Safety Compliance',
        'Physical Stamina', 'Reliability', 'Adaptability',
        'Field Work', 'Continuous Learning'
    ],
    'maintenance-engineer': [
        'Maintenance Engineering', 'Preventive Maintenance', 'Predictive Maintenance',
        'CMMS', 'AutoCAD', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Report Writing',
        'Troubleshooting', 'Safety Management', 'MS Office',
        'Cost Analysis', 'KPI Tracking', 'Continuous Improvement',
        'Planning', 'Reliability Engineering'
    ],
    'maintenance-manager': [
        'Maintenance Management', 'Team Leadership', 'Preventive Maintenance',
        'Budget Management', 'CMMS', 'KPI Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Reporting',
        'Vendor Management', 'Safety Management', 'Process Improvement',
        'Strategic Planning', 'Continuous Improvement', 'MS Office',
        'Project Management', 'Cost Optimization'
    ],
    'maintenance-supervisor': [
        'Maintenance Supervision', 'Team Management', 'Preventive Maintenance',
        'Scheduling', 'CMMS', 'Troubleshooting',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Reporting',
        'Safety Management', 'Shift Management', 'Training',
        'MS Office', 'Continuous Improvement', 'Physical Stamina',
        'Reliability', 'Adaptability'
    ],
    'maintenance-technician': [
        'Maintenance Support', 'Preventive Maintenance', 'Troubleshooting',
        'Repair', 'Equipment Operation', 'CMMS',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Reporting',
        'MS Office', 'Documentation', 'Safety Compliance',
        'Physical Stamina', 'Reliability', 'Adaptability',
        'Field Work', 'Continuous Learning'
    ],
    'reliability-engineer': [
        'Reliability Engineering', 'RCM', 'FMEA',
        'Root Cause Analysis', 'Predictive Maintenance', 'CMMS',
        'Data Analysis', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Report Writing', 'KPI Tracking',
        'Continuous Improvement', 'MS Office', 'Reliability Testing',
        'Statistical Analysis', 'Project Management'
    ],
    'reliability-technician': [
        'Reliability Support', 'Predictive Maintenance', 'Vibration Analysis',
        'Thermography', 'Lubrication', 'CMMS',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Reporting',
        'MS Office', 'Documentation', 'Safety Compliance',
        'Physical Stamina', 'Reliability', 'Adaptability',
        'Field Work', 'Continuous Learning'
    ],
    'plant-engineer': [
        'Plant Engineering', 'Plant Operations', 'Maintenance Management',
        'AutoCAD', 'CMMS', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Report Writing',
        'Safety Management', 'Cost Analysis', 'KPI Tracking',
        'MS Office', 'Continuous Improvement', 'Regulatory Compliance',
        'Project Management', 'Reliability Engineering'
    ],
    'plant-manager': [
        'Plant Management', 'Team Leadership', 'Plant Operations',
        'Budget Management', 'KPI Management', 'Safety Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Reporting',
        'Process Improvement', 'Vendor Management', 'Strategic Planning',
        'Continuous Improvement', 'MS Office', 'ERP Systems',
        'Project Management', 'Regulatory Compliance'
    ],
    'plant-supervisor': [
        'Plant Supervision', 'Team Management', 'Plant Operations',
        'Production Planning', 'Safety Management', 'Process Improvement',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'KPI Tracking',
        'Reporting', 'Shift Management', 'Training',
        'MS Office', 'Continuous Improvement', 'Physical Stamina',
        'Reliability', 'Adaptability'
    ],
    'factory-manager': [
        'Factory Management', 'Team Leadership', 'Production Management',
        'Budget Management', 'KPI Management', 'Safety Management',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Reporting',
        'Process Improvement', 'Vendor Management', 'Strategic Planning',
        'Continuous Improvement', 'MS Office', 'ERP Systems',
        'Project Management', 'Regulatory Compliance'
    ],
    'factory-supervisor': [
        'Factory Supervision', 'Team Management', 'Production Management',
        'Production Planning', 'Safety Management', 'Process Improvement',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'KPI Tracking',
        'Reporting', 'Shift Management', 'Training',
        'MS Office', 'Continuous Improvement', 'Physical Stamina',
        'Reliability', 'Adaptability'
    ],
    'operations-engineer': [
        'Operations Engineering', 'Process Improvement', 'Lean Manufacturing',
        'Six Sigma', 'Quality Control', 'Data Analysis',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Report Writing', 'KPI Tracking', 'Cost Analysis',
        'MS Office', 'Continuous Improvement', 'Project Management',
        'Safety Management', 'Regulatory Compliance'
    ],
    'operations-technician': [
        'Operations Support', 'Equipment Operation', 'Process Monitoring',
        'Data Recording', 'Troubleshooting', 'CMMS',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Reporting',
        'MS Office', 'Documentation', 'Safety Compliance',
        'Physical Stamina', 'Reliability', 'Adaptability',
        'Field Work', 'Continuous Learning'
    ],
    'cnc-programmer': [
        'CNC Programming', 'G-code', 'M-code',
        'CAD/CAM', 'Mastercam', 'AutoCAD',
        'Machine Setup', 'Tooling', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Quality Control', 'Blueprint Reading',
        'Precision Machining', 'MS Office', 'Safety Compliance',
        'Continuous Improvement', 'Troubleshooting'
    ],
    'cnc-machinist': [
        'CNC Machining', 'Machine Operation', 'Machine Setup',
        'G-code', 'Tooling', 'Calipers',
        'Micrometers', 'Precision Machining', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Quality Control', 'Blueprint Reading',
        'Machine Maintenance', 'MS Office', 'Safety Compliance',
        'Continuous Improvement', 'Physical Stamina'
    ],
    'cnc-technician': [
        'CNC Support', 'Machine Operation', 'Machine Setup',
        'Troubleshooting', 'Maintenance', 'Calipers',
        'Micrometers', 'Precision Machining', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Quality Control', 'Blueprint Reading',
        'MS Office', 'Safety Compliance', 'Continuous Improvement',
        'Physical Stamina', 'Reliability'
    ],
    'machinist': [
        'Machining', 'Lathe Operation', 'Milling',
        'Drilling', 'Grinding', 'Calipers',
        'Micrometers', 'Precision Machining', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Quality Control', 'Blueprint Reading',
        'Machine Maintenance', 'MS Office', 'Safety Compliance',
        'Continuous Improvement', 'Physical Stamina'
    ],
    'machine-technician': [
        'Machine Maintenance', 'Troubleshooting', 'Repair',
        'Preventive Maintenance', 'Equipment Operation', 'CMMS',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Reporting',
        'MS Office', 'Documentation', 'Safety Compliance',
        'Physical Stamina', 'Reliability', 'Adaptability',
        'Field Work', 'Continuous Learning'
    ],
    'tool-and-die-maker': [
        'Tool and Die Making', 'Tool Design', 'Die Design',
        'Machining', 'Lathe Operation', 'Milling',
        'Grinding', 'Precision Machining', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Quality Control', 'Blueprint Reading',
        'CAD/CAM', 'MS Office', 'Safety Compliance',
        'Continuous Improvement', 'Physical Stamina'
    ],
    'tooling-engineer': [
        'Tooling Engineering', 'Tool Design', 'Die Design',
        'SolidWorks', 'AutoCAD', 'Machining',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Report Writing', 'Quality Control', 'Blueprint Reading',
        'Cost Analysis', 'MS Office', 'Safety Compliance',
        'Continuous Improvement', 'Project Management'
    ],
    'welding-engineer': [
        'Welding Engineering', 'Welding Processes', 'Weld Inspection',
        'Welding Symbols', 'NDT', 'AutoCAD',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Report Writing', 'Quality Control', 'Blueprint Reading',
        'Cost Analysis', 'MS Office', 'Safety Compliance',
        'Continuous Improvement', 'Regulatory Compliance'
    ],
    'welding-inspector': [
        'Welding Inspection', 'Weld Inspection', 'NDT',
        'Welding Symbols', 'Visual Inspection', 'Quality Control',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Report Writing',
        'Blueprint Reading', 'MS Office', 'Safety Compliance',
        'Documentation', 'Field Work', 'Continuous Improvement',
        'Physical Stamina', 'Reliability'
    ],
    'fabrication-engineer': [
        'Fabrication Engineering', 'Sheet Metal', 'Welding',
        'SolidWorks', 'AutoCAD', 'Machining',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Report Writing', 'Quality Control', 'Blueprint Reading',
        'Cost Analysis', 'MS Office', 'Safety Compliance',
        'Continuous Improvement', 'Project Management'
    ],
    'fabrication-supervisor': [
        'Fabrication Supervision', 'Team Management', 'Sheet Metal',
        'Welding', 'Scheduling', 'Quality Control',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Reporting',
        'Safety Management', 'Shift Management', 'Training',
        'MS Office', 'Continuous Improvement', 'Physical Stamina',
        'Reliability', 'Adaptability'
    ]
};