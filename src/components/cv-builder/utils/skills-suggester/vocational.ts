// utils/skills-suggester/vocational.ts
// ============================================
// VOCATIONAL SKILLS - 68 Professions
// ============================================

export const vocationalSkills: Record<string, string[]> = {
    // ============================================
    // CORE VOCATIONAL (23) — EXISTING
    // ============================================
    'electrician': [
        'Electrical Installation', 'Wiring', 'Circuit Testing',
        'Electrical Safety', 'Troubleshooting', 'Motor Controls',
        'Panel Wiring', 'Conduit Bending', 'Blueprint Reading',
        'NEC Codes', 'Voltage Testing', 'Lighting Installation',
        'Power Distribution', 'Switchgear', 'Grounding',
        'Preventive Maintenance', 'Multimeter', 'Hand Tools',
        'Power Tools', 'Problem Solving', 'Attention to Detail',
        'Physical Stamina', 'Time Management', 'Safety Compliance'
    ],
    'plumber': [
        'Pipe Fitting', 'Plumbing Installation', 'Pipe Threading',
        'Soldering', 'Drain Cleaning', 'Leak Detection',
        'Fixture Installation', 'Water Heaters', 'Blueprint Reading',
        'Plumbing Codes', 'Pipe Cutting', 'Copper Piping',
        'PVC Piping', 'PEX Piping', 'Gas Line Installation',
        'Troubleshooting', 'Preventive Maintenance', 'Hand Tools',
        'Power Tools', 'Problem Solving', 'Attention to Detail',
        'Physical Stamina', 'Time Management', 'Safety Compliance'
    ],
    'carpenter': [
        'Woodworking', 'Carpentry', 'Furniture Making',
        'Framing', 'Cabinet Making', 'Blueprint Reading',
        'Measuring', 'Cutting', 'Sanding',
        'Finishing', 'Joinery', 'Wood Selection',
        'Hand Tools', 'Power Tools', 'Table Saw',
        'Router', 'Drill', 'Nail Gun',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Creativity'
    ],
    'welder': [
        'MIG Welding', 'TIG Welding', 'Arc Welding',
        'Fabrication', 'Welding Symbols', 'Metal Preparation',
        'Dimensional Accuracy', 'Inspection', 'Safety Procedures',
        'Equipment Maintenance', 'Blueprint Reading', 'Cutting',
        'Grinding', 'Soldering', 'Brazing',
        'Pipe Welding', 'Structural Welding', 'Stainless Steel',
        'Aluminum Welding', 'Problem Solving', 'Attention to Detail',
        'Physical Stamina', 'Time Management', 'Safety Compliance'
    ],
    'mason': [
        'Brickwork', 'Block Work', 'Concrete Work',
        'Plastering', 'Masonry', 'Construction Drawings',
        'Measurements', 'Material Handling', 'Site Safety',
        'Finishing', 'Construction Quality', 'Mortar Mixing',
        'Tiling', 'Stone Work', 'Reinforcement',
        'Scaffolding', 'Hand Tools', 'Power Tools',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration'
    ],
    'construction-worker': [
        'Construction', 'Site Preparation', 'Material Handling',
        'Concrete Work', 'Scaffolding', 'Demolition',
        'Excavation', 'Safety Procedures', 'Hand Tools',
        'Power Tools', 'Equipment Operation', 'Blueprint Reading',
        'Measurements', 'Site Cleanup', 'Masonry Support',
        'Carpentry Support', 'Problem Solving', 'Attention to Detail',
        'Physical Stamina', 'Time Management', 'Safety Compliance',
        'Team Collaboration', 'Adaptability', 'Reliability'
    ],
    'cnc-operator': [
        'CNC Operation', 'Machine Setup', 'G-code',
        'M-code', 'Tooling', 'Production Drawings',
        'Dimensional Inspection', 'Precision Machining', 'Machine Maintenance',
        'Quality Control', 'Calipers', 'Micrometers',
        'Blueprint Reading', 'CAD/CAM', 'Milling',
        'Turning', 'Drilling', 'Grinding',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration'
    ],
    'machine-operator': [
        'Machine Operation', 'Production Processes', 'Equipment Setup',
        'Production Targets', 'Quality Checks', 'Machine Safety',
        'Preventive Maintenance', 'Troubleshooting', 'Manufacturing Operations',
        'Material Handling', 'Measuring Tools', 'Blueprint Reading',
        'Quality Control', 'Production Reporting', 'Lean Manufacturing',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Adaptability', 'Reliability', 'Continuous Improvement'
    ],
    'computer-operator': [
        'Computer Operations', 'Data Entry', 'MS Office',
        'Typing', 'File Management', 'Data Processing',
        'Printer Operation', 'Scanner Operation', 'Email Management',
        'Internet Research', 'Basic Troubleshooting', 'Customer Service',
        'Documentation', 'Data Verification', 'Record Keeping',
        'Communication', 'Attention to Detail', 'Time Management',
        'Problem Solving', 'Team Collaboration', 'Confidentiality',
        'Organizational Skills', 'Multitasking', 'Reliability'
    ],
    'electrical-technician': [
        'Electrical Installation', 'Wiring', 'Preventive Maintenance',
        'Troubleshooting', 'Electrical Testing', 'Control Panels',
        'Safety Procedures', 'Equipment Maintenance', 'Circuit Testing',
        'Repair', 'Multimeter', 'Oscilloscope',
        'Blueprint Reading', 'Motor Controls', 'PLC',
        'Instrumentation', 'Calibration', 'Power Distribution',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration'
    ],
    'stitching-machine-operator': [
        'Industrial Sewing Machines', 'Garment Production', 'Stitching',
        'Machine Setup', 'Fabric Handling', 'Quality Inspection',
        'Production Targets', 'Garment Finishing', 'Workplace Safety',
        'Threading', 'Bobbin Winding', 'Seam Types',
        'Pattern Reading', 'Measurement', 'Cutting',
        'Pressing', 'Quality Control', 'Problem Solving',
        'Attention to Detail', 'Physical Stamina', 'Time Management',
        'Safety Compliance', 'Team Collaboration', 'Reliability'
    ],
    'civil-technician': [
        'Site Inspection', 'Construction Measurements', 'AutoCAD',
        'Quantity Estimation', 'Drawings', 'Material Inspection',
        'Site Documentation', 'Surveying Support', 'Quality Control',
        'Concrete Testing', 'Soil Testing', 'Blueprint Reading',
        'MS Project', 'Excel', 'Report Writing',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Physical Stamina', 'Adaptability', 'Reliability'
    ],
    'auto-mechanic': [
        'Vehicle Diagnostics', 'Engine Maintenance', 'Brake Systems',
        'Suspension', 'Electrical Troubleshooting', 'Preventive Maintenance',
        'Repair Procedures', 'Diagnostic Tools', 'Oil Changes',
        'Transmission Repair', 'Cooling Systems', 'Exhaust Systems',
        'Steering Systems', 'Battery Service', 'Tire Service',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Customer Service', 'Adaptability', 'Reliability'
    ],
    'hvac-technician': [
        'HVAC Installation', 'Air-conditioning Systems', 'Refrigeration',
        'Preventive Maintenance', 'Troubleshooting', 'Ducting',
        'Electrical Controls', 'System Inspection', 'Safety Procedures',
        'Refrigerant Handling', 'Thermostats', 'Compressors',
        'Condensers', 'Evaporators', 'Heating Systems',
        'Ventilation', 'Load Calculation', 'Blueprint Reading',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration'
    ],
    'agricultural-technician': [
        'Crop Production', 'Irrigation Support', 'Soil Testing',
        'Agricultural Equipment', 'Field Inspection', 'Pest Management Support',
        'Farm Records', 'Agricultural Practices', 'Seed Selection',
        'Fertilizer Application', 'Harvesting', 'Livestock Support',
        'Greenhouse Management', 'Organic Farming', 'Precision Agriculture',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Physical Stamina', 'Adaptability', 'Reliability'
    ],
    'packaging-operator': [
        'Packaging Operations', 'Machine Operation', 'Quality Control',
        'Production Targets', 'Material Handling', 'Labeling',
        'Sealing', 'Inspection', 'Safety Procedures',
        'Equipment Maintenance', 'Production Reporting', 'GMP',
        'Clean Room', 'Problem Solving', 'Attention to Detail',
        'Physical Stamina', 'Time Management', 'Safety Compliance',
        'Team Collaboration', 'Adaptability', 'Reliability',
        'Continuous Improvement', 'Documentation', 'Efficiency'
    ],
    'production-manager': [
        'Production Management', 'Manufacturing Operations', 'Team Leadership',
        'Production Planning', 'Quality Control', 'Lean Manufacturing',
        'Six Sigma', 'Process Improvement', 'Inventory Management',
        'Supply Chain', 'Budget Management', 'KPI Management',
        'Safety Management', 'ERP Systems', 'SAP',
        'Communication', 'Problem Solving', 'Decision Making',
        'Time Management', 'Attention to Detail', 'Team Collaboration',
        'Leadership', 'Strategic Thinking', 'Continuous Improvement'
    ],
    'production-supervisor': [
        'Production Supervision', 'Team Management', 'Production Planning',
        'Quality Control', 'Safety Management', 'Process Improvement',
        'Inventory Management', 'Production Reporting', 'KPI Tracking',
        'Lean Manufacturing', 'Six Sigma', 'Shift Management',
        'Training', 'Communication', 'Problem Solving',
        'Decision Making', 'Time Management', 'Attention to Detail',
        'Team Collaboration', 'Leadership', 'Conflict Resolution',
        'Continuous Improvement', 'Adaptability', 'Reliability'
    ],
    'quality-control-inspector': [
        'Quality Inspection', 'Quality Control', 'Testing',
        'Measurement', 'Calipers', 'Micrometers',
        'Visual Inspection', 'Defect Identification', 'Documentation',
        'Quality Standards', 'ISO 9001', 'Statistical Analysis',
        'Sampling', 'Reporting', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Communication',
        'Team Collaboration', 'Safety Compliance', 'Reliability',
        'Analytical Thinking', 'Continuous Improvement', 'Ethics'
    ],
    'quality-control-engineer': [
        'Quality Engineering', 'Quality Control', 'Quality Assurance',
        'ISO 9001', 'Six Sigma', 'Statistical Process Control',
        'Root Cause Analysis', 'CAPA', 'FMEA',
        'Quality Auditing', 'Testing', 'Measurement',
        'Documentation', 'Process Improvement', 'Supplier Quality',
        'Problem Solving', 'Data Analysis', 'Attention to Detail',
        'Communication', 'Team Collaboration', 'Time Management',
        'Leadership', 'Continuous Improvement', 'Analytical Thinking'
    ],
    'solar-technician': [
        'Solar Installation', 'Solar Panels', 'Inverters',
        'Wiring', 'Electrical Testing', 'System Design',
        'Preventive Maintenance', 'Troubleshooting', 'Safety Procedures',
        'Roof Mounting', 'Battery Systems', 'Charge Controllers',
        'Net Metering', 'Energy Monitoring', 'Blueprint Reading',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Customer Service', 'Adaptability', 'Reliability'
    ],
    'driver': [
        'Driving', 'Route Planning', 'Vehicle Maintenance',
        'Traffic Laws', 'GPS Navigation', 'Safety Procedures',
        'Delivery', 'Time Management', 'Customer Service',
        'Defensive Driving', 'Vehicle Inspection', 'Documentation',
        'Loading/Unloading', 'Fuel Management', 'Accident Prevention',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Punctuality', 'Communication', 'Team Collaboration',
        'Adaptability', 'Reliability', 'Stress Management'
    ],
    'tailor': [
        'Tailoring', 'Stitching', 'Pattern Making',
        'Measurement', 'Cutting', 'Fitting',
        'Alterations', 'Garment Construction', 'Fabric Selection',
        'Hand Stitching', 'Machine Stitching', 'Embroidery',
        'Buttonholes', 'Zippers', 'Lining',
        'Pressing', 'Finishing', 'Quality Control',
        'Problem Solving', 'Attention to Detail', 'Creativity',
        'Time Management', 'Customer Service', 'Reliability'
    ],

    // ============================================
    // ✅ NEW BATCH 4 — CONSTRUCTION & TRADES (15)
    // ============================================
    'painter': [
        'Painting', 'Surface Preparation', 'Priming',
        'Brush Application', 'Roller Application', 'Spray Painting',
        'Color Mixing', 'Wallpaper Installation', 'Drywall Finishing',
        'Caulking', 'Sanding', 'Safety Procedures',
        'Hand Tools', 'Power Tools', 'Blueprint Reading',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Customer Service',
        'Reliability', 'Adaptability', 'Team Collaboration'
    ],
    'tiler': [
        'Tile Installation', 'Tile Cutting', 'Grouting',
        'Adhesive Application', 'Surface Preparation', 'Floor Tiling',
        'Wall Tiling', 'Marble Installation', 'Waterproofing',
        'Leveling', 'Measuring', 'Hand Tools',
        'Power Tools', 'Blueprint Reading', 'Problem Solving',
        'Attention to Detail', 'Physical Stamina', 'Time Management',
        'Safety Compliance', 'Customer Service', 'Reliability',
        'Adaptability', 'Team Collaboration', 'Quality Control'
    ],
    'roofer': [
        'Roofing Installation', 'Roof Repair', 'Waterproofing',
        'Roof Inspection', 'Shingle Installation', 'Metal Roofing',
        'Flat Roofing', 'Roof Coating', 'Gutters',
        'Safety Procedures', 'Hand Tools', 'Power Tools',
        'Ladder Safety', 'Blueprint Reading', 'Problem Solving',
        'Attention to Detail', 'Physical Stamina', 'Time Management',
        'Safety Compliance', 'Customer Service', 'Reliability',
        'Adaptability', 'Team Collaboration', 'Quality Control'
    ],
    'glazier': [
        'Glass Installation', 'Glass Cutting', 'Window Installation',
        'Door Installation', 'Mirror Installation', 'Shower Enclosures',
        'Glass Measurement', 'Sealant Application', 'Safety Procedures',
        'Hand Tools', 'Power Tools', 'Blueprint Reading',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Customer Service',
        'Reliability', 'Adaptability', 'Team Collaboration',
        'Quality Control', 'Precision Work', 'Auto Glass'
    ],
    'steel-fixer': [
        'Steel Fixing', 'Rebar Installation', 'Reinforcement',
        'Steel Cutting', 'Steel Bending', 'Tying',
        'Blueprint Reading', 'Bar Bending Schedule', 'Safety Procedures',
        'Hand Tools', 'Power Tools', 'Measurements',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Reliability', 'Adaptability', 'Quality Control',
        'Concrete Work', 'Site Safety', 'Construction Drawings'
    ],
    'scaffolder': [
        'Scaffolding', 'Scaffold Erection', 'Scaffold Dismantling',
        'Safety Procedures', 'Height Work', 'Load Calculation',
        'Hand Tools', 'Blueprint Reading', 'Scaffold Inspection',
        'Fall Protection', 'Rigging', 'Problem Solving',
        'Attention to Detail', 'Physical Stamina', 'Time Management',
        'Safety Compliance', 'Team Collaboration', 'Reliability',
        'Adaptability', 'Quality Control', 'Equipment Inspection',
        'Site Safety', 'Confined Space', 'Emergency Response'
    ],
    'heavy-equipment-operator': [
        'Heavy Equipment Operation', 'Excavator Operation', 'Bulldozer Operation',
        'Crane Operation', 'Loader Operation', 'Safety Procedures',
        'Equipment Maintenance', 'Rigging', 'Blueprint Reading',
        'Site Preparation', 'Excavation', 'Grading',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Reliability', 'Adaptability', 'Equipment Inspection',
        'Site Safety', 'Heavy Lifting', 'Machine Controls'
    ],
    'crane-operator': [
        'Crane Operation', 'Lifting Operations', 'Rigging',
        'Load Charts', 'Safety Procedures', 'Hand Signals',
        'Equipment Inspection', 'Maintenance', 'Blueprint Reading',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Reliability', 'Adaptability', 'Lift Planning',
        'Site Safety', 'Height Work', 'Emergency Response',
        'Communication', 'Coordination', 'Precision Control'
    ],
    'excavator-operator': [
        'Excavator Operation', 'Excavation', 'Trenching',
        'Grading', 'Site Preparation', 'Safety Procedures',
        'Equipment Maintenance', 'Blueprint Reading', 'Surveying Support',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Reliability', 'Adaptability', 'Equipment Inspection',
        'Site Safety', 'Soil Types', 'Utility Location',
        'Communication', 'Coordination', 'Machine Controls'
    ],
    'concrete-mixer': [
        'Concrete Mixing', 'Concrete Pouring', 'Concrete Finishing',
        'Mix Ratios', 'Cement Handling', 'Aggregate Handling',
        'Safety Procedures', 'Hand Tools', 'Power Tools',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Reliability', 'Adaptability', 'Quality Control',
        'Curing', 'Site Safety', 'Construction Drawings',
        'Equipment Maintenance', 'Measurements', 'Precision Work'
    ],
    'demolition-worker': [
        'Demolition', 'Site Preparation', 'Debris Removal',
        'Safety Procedures', 'Hand Tools', 'Power Tools',
        'Heavy Equipment Operation', 'Asbestos Awareness', 'Hazardous Materials',
        'Physical Stamina', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Reliability', 'Adaptability', 'Site Safety',
        'Recycling', 'Waste Management', 'PPE Usage',
        'Emergency Response', 'Communication', 'Coordination'
    ],
    'insulation-worker': [
        'Insulation Installation', 'Thermal Insulation', 'Acoustic Insulation',
        'Pipe Insulation', 'Wall Insulation', 'Roof Insulation',
        'Material Handling', 'Measuring', 'Cutting',
        'Safety Procedures', 'Hand Tools', 'Power Tools',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Reliability', 'Adaptability', 'Quality Control',
        'Blueprint Reading', 'Energy Efficiency', 'Fire Safety',
        'Site Safety', 'PPE Usage', 'Customer Service'
    ],
    'drywall-installer': [
        'Drywall Installation', 'Drywall Finishing', 'Drywall Taping',
        'Measuring', 'Cutting', 'Framing',
        'Mudding', 'Sanding', 'Safety Procedures',
        'Hand Tools', 'Power Tools', 'Blueprint Reading',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Reliability', 'Adaptability', 'Quality Control',
        'Site Safety', 'Lifting', 'Precision Work',
        'Customer Service', 'Ceiling Installation', 'Metal Framing'
    ],
    'flooring-installer': [
        'Flooring Installation', 'Hardwood Flooring', 'Laminate Flooring',
        'Tile Flooring', 'Vinyl Flooring', 'Carpet Installation',
        'Subfloor Preparation', 'Measuring', 'Cutting',
        'Safety Procedures', 'Hand Tools', 'Power Tools',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Reliability', 'Adaptability', 'Quality Control',
        'Blueprint Reading', 'Site Safety', 'Customer Service',
        'Finishing', 'Moisture Testing', 'Leveling'
    ],

    // ============================================
    // ✅ NEW BATCH 4 — MECHANICAL & AUTO (10)
    // ============================================
    'auto-electrician': [
        'Auto Electrical Systems', 'Diagnostics', 'Wiring',
        'Battery Systems', 'Starting Systems', 'Charging Systems',
        'Lighting Systems', 'Computer Diagnostics', 'Multimeter',
        'Oscilloscope', 'Problem Solving', 'Attention to Detail',
        'Physical Stamina', 'Time Management', 'Safety Compliance',
        'Team Collaboration', 'Customer Service', 'Adaptability',
        'Reliability', 'Continuous Learning', 'Repair Procedures',
        'Blueprint Reading', 'Electrical Schematics', 'Vehicle Inspection'
    ],
    'auto-body-technician': [
        'Auto Body Repair', 'Dent Repair', 'Panel Beating',
        'Welding', 'Frame Straightening', 'Spray Painting',
        'Color Matching', 'Buffing', 'Sanding',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Customer Service', 'Adaptability', 'Reliability',
        'Equipment Operation', 'Quality Control', 'Estimation',
        'Blueprint Reading', 'Materials Knowledge', 'Hand Tools'
    ],
    'diesel-mechanic': [
        'Diesel Engine Repair', 'Engine Diagnostics', 'Fuel Systems',
        'Transmission Repair', 'Brake Systems', 'Suspension',
        'Electrical Troubleshooting', 'Preventive Maintenance', 'Diagnostic Tools',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Customer Service', 'Adaptability', 'Reliability',
        'Hydraulics', 'Pneumatics', 'Equipment Maintenance',
        'Blueprint Reading', 'Welding', 'Heavy Equipment'
    ],
    'motorcycle-mechanic': [
        'Motorcycle Repair', 'Engine Diagnostics', 'Carburetor Repair',
        'Fuel Injection', 'Brake Systems', 'Suspension',
        'Electrical Troubleshooting', 'Preventive Maintenance', 'Diagnostic Tools',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Customer Service', 'Adaptability', 'Reliability',
        'Engine Tuning', 'Chain Maintenance', 'Tire Service',
        'Hand Tools', 'Power Tools', 'Workshop Safety'
    ],
    'tire-technician': [
        'Tire Installation', 'Tire Repair', 'Tire Balancing',
        'Wheel Alignment', 'Tire Rotation', 'Puncture Repair',
        'Tire Pressure', 'Hand Tools', 'Power Tools',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Customer Service', 'Adaptability', 'Reliability',
        'Equipment Operation', 'Vehicle Lifting', 'Diagnostics',
        'Inventory Management', 'Workshop Safety', 'Quality Control'
    ],
    'lubrication-technician': [
        'Oil Changes', 'Lubrication', 'Fluid Checks',
        'Filter Replacement', 'Vehicle Inspection', 'Preventive Maintenance',
        'Hand Tools', 'Power Tools', 'Problem Solving',
        'Attention to Detail', 'Physical Stamina', 'Time Management',
        'Safety Compliance', 'Team Collaboration', 'Customer Service',
        'Adaptability', 'Reliability', 'Equipment Operation',
        'Oil Disposal', 'Workshop Safety', 'Record Keeping',
        'Inventory Management', 'Quality Control', 'Continuous Learning'
    ],
    'hvac-installer': [
        'HVAC Installation', 'Air Conditioning Installation', 'Heating Systems',
        'Refrigeration', 'Ductwork', 'Ventilation',
        'Electrical Connections', 'Refrigerant Handling', 'Thermostats',
        'Hand Tools', 'Power Tools', 'Blueprint Reading',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Customer Service', 'Adaptability', 'Reliability',
        'Equipment Installation', 'Commissioning', 'Testing'
    ],
    'appliance-repair-technician': [
        'Appliance Repair', 'Diagnostics', 'Electrical Troubleshooting',
        'Mechanical Repair', 'Refrigeration', 'Washing Machines',
        'Dryers', 'Dishwashers', 'Refrigerators',
        'Microwaves', 'Ovens', 'Hand Tools',
        'Multimeter', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Safety Compliance', 'Customer Service',
        'Team Collaboration', 'Adaptability', 'Reliability',
        'Parts Replacement', 'Technical Manuals', 'Workshop Safety'
    ],
    'elevator-technician': [
        'Elevator Installation', 'Elevator Maintenance', 'Elevator Repair',
        'Electrical Systems', 'Mechanical Systems', 'Hydraulics',
        'Control Systems', 'Safety Procedures', 'Troubleshooting',
        'Hand Tools', 'Power Tools', 'Multimeter',
        'Blueprint Reading', 'Problem Solving', 'Attention to Detail',
        'Physical Stamina', 'Time Management', 'Safety Compliance',
        'Team Collaboration', 'Customer Service', 'Adaptability',
        'Reliability', 'Technical Manuals', 'Emergency Response'
    ],
    'refrigeration-technician': [
        'Refrigeration Systems', 'Installation', 'Maintenance',
        'Repair', 'Refrigerant Handling', 'Compressors',
        'Condensers', 'Evaporators', 'Thermostats',
        'Diagnostics', 'Hand Tools', 'Power Tools',
        'Multimeter', 'Blueprint Reading', 'Problem Solving',
        'Attention to Detail', 'Physical Stamina', 'Time Management',
        'Safety Compliance', 'Customer Service', 'Adaptability',
        'Reliability', 'Team Collaboration', 'Continuous Learning'
    ],

    // ============================================
    // ✅ NEW BATCH 4 — UTILITY & TECHNICAL (12)
    // ============================================
    'pipefitter': [
        'Pipe Fitting', 'Pipe Installation', 'Pipe Threading',
        'Soldering', 'Welding', 'Blueprint Reading',
        'Measurements', 'Hand Tools', 'Power Tools',
        'Pipe Cutting', 'Valve Installation', 'Safety Procedures',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Reliability', 'Adaptability', 'Quality Control',
        'Steam Systems', 'Hydraulic Systems', 'Maintenance'
    ],
    'steamfitter': [
        'Steam Systems', 'Pipe Installation', 'Pipe Fitting',
        'Welding', 'Soldering', 'Blueprint Reading',
        'Measurements', 'Hand Tools', 'Power Tools',
        'Boiler Systems', 'Valve Installation', 'Safety Procedures',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Reliability', 'Adaptability', 'Quality Control',
        'Maintenance', 'Pressure Testing', 'Insulation'
    ],
    'sheet-metal-worker': [
        'Sheet Metal Fabrication', 'Cutting', 'Bending',
        'Forming', 'Welding', 'Soldering',
        'Blueprint Reading', 'Measurements', 'Hand Tools',
        'Power Tools', 'Metal Shears', 'Brakes',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Reliability', 'Adaptability', 'Quality Control',
        'HVAC Ductwork', 'Roofing', 'Maintenance'
    ],
    'millwright': [
        'Millwright Work', 'Machine Installation', 'Machine Maintenance',
        'Mechanical Repair', 'Alignment', 'Welding',
        'Blueprint Reading', 'Hand Tools', 'Power Tools',
        'Hydraulics', 'Pneumatics', 'Conveyors',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Reliability', 'Adaptability', 'Quality Control',
        'Preventive Maintenance', 'Troubleshooting', 'Equipment Assembly'
    ],
    'boilermaker': [
        'Boilermaking', 'Boiler Installation', 'Boiler Repair',
        'Welding', 'Rigging', 'Blueprint Reading',
        'Measurements', 'Hand Tools', 'Power Tools',
        'Pressure Vessels', 'Steam Systems', 'Safety Procedures',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Team Collaboration',
        'Reliability', 'Adaptability', 'Quality Control',
        'Maintenance', 'Hydro Testing', 'Inspection'
    ],
    'locksmith': [
        'Locksmithing', 'Lock Installation', 'Lock Repair',
        'Key Cutting', 'Key Duplication', 'Lock Picking',
        'Safe Opening', 'Access Control', 'Hand Tools',
        'Power Tools', 'Customer Service', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Safety Compliance',
        'Team Collaboration', 'Reliability', 'Adaptability',
        'Automotive Locks', 'Master Key Systems', 'Emergency Services',
        'Networking', 'Business Development', 'Continuous Learning'
    ],
    'security-system-installer': [
        'Security Systems', 'CCTV Installation', 'Alarm Systems',
        'Access Control', 'Intercom Systems', 'Fire Alarm Systems',
        'Wiring', 'Electrical Testing', 'Hand Tools',
        'Power Tools', 'Blueprint Reading', 'Problem Solving',
        'Attention to Detail', 'Physical Stamina', 'Time Management',
        'Safety Compliance', 'Customer Service', 'Team Collaboration',
        'Reliability', 'Adaptability', 'Quality Control',
        'Network Cabling', 'Programming', 'Maintenance'
    ],
    'solar-panel-installer': [
        'Solar Panel Installation', 'Solar Panels', 'Inverters',
        'Mounting Systems', 'Wiring', 'Electrical Testing',
        'Roof Work', 'Safety Procedures', 'Blueprint Reading',
        'Hand Tools', 'Power Tools', 'Multimeter',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Customer Service',
        'Team Collaboration', 'Reliability', 'Adaptability',
        'Quality Control', 'Energy Monitoring', 'Net Metering'
    ],
    'wind-turbine-technician': [
        'Wind Turbine Installation', 'Wind Turbine Maintenance', 'Blade Inspection',
        'Gearbox Maintenance', 'Hydraulic Systems', 'Electrical Systems',
        'Troubleshooting', 'Safety Procedures', 'Climbing',
        'Mechanical Maintenance', 'SCADA Systems', 'Vibration Analysis',
        'Preventive Maintenance', 'Technical Documentation', 'Problem Solving',
        'Attention to Detail', 'Physical Stamina', 'Time Management',
        'Safety Compliance', 'Team Collaboration', 'Adaptability',
        'Reliability', 'Continuous Learning', 'Environmental Compliance'
    ],
    'locksmith-technician': [
        'Locksmithing', 'Lock Installation', 'Lock Repair',
        'Key Cutting', 'Key Duplication', 'Lock Picking',
        'Safe Opening', 'Access Control', 'Hand Tools',
        'Power Tools', 'Customer Service', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Safety Compliance',
        'Team Collaboration', 'Reliability', 'Adaptability',
        'Automotive Locks', 'Master Key Systems', 'Emergency Services',
        'Networking', 'Business Development', 'Continuous Learning'
    ],
    'water-treatment-plant-operator': [
        'Water Treatment', 'Water Quality Testing', 'Chemical Treatment',
        'Equipment Operation', 'Maintenance', 'Safety Procedures',
        'Data Recording', 'Monitoring', 'Problem Solving',
        'Attention to Detail', 'Physical Stamina', 'Time Management',
        'Safety Compliance', 'Team Collaboration', 'Reliability',
        'Adaptability', 'Regulatory Compliance', 'Documentation',
        'Pumps', 'Valves', 'Filtration',
        'Disinfection', 'Lab Testing', 'Environmental Compliance'
    ],
    'wastewater-treatment-operator': [
        'Wastewater Treatment', 'Water Quality Testing', 'Chemical Treatment',
        'Equipment Operation', 'Maintenance', 'Safety Procedures',
        'Data Recording', 'Monitoring', 'Problem Solving',
        'Attention to Detail', 'Physical Stamina', 'Time Management',
        'Safety Compliance', 'Team Collaboration', 'Reliability',
        'Adaptability', 'Regulatory Compliance', 'Documentation',
        'Pumps', 'Valves', 'Aeration',
        'Sludge Treatment', 'Lab Testing', 'Environmental Compliance'
    ],

    // ============================================
    // ✅ NEW BATCH 4 — OTHER TRADES (8)
    // ============================================
    'upholsterer': [
        'Upholstery', 'Furniture Repair', 'Fabric Cutting',
        'Sewing', 'Foam Cutting', 'Spring Installation',
        'Padding', 'Stapling', 'Hand Tools',
        'Power Tools', 'Measurements', 'Problem Solving',
        'Attention to Detail', 'Creativity', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Customer Service',
        'Team Collaboration', 'Reliability', 'Adaptability',
        'Quality Control', 'Fabric Selection', 'Automotive Upholstery'
    ],
    'shoe-repairer': [
        'Shoe Repair', 'Leather Working', 'Sole Replacement',
        'Heel Replacement', 'Stitching', 'Gluing',
        'Polishing', 'Hand Tools', 'Machine Operation',
        'Problem Solving', 'Attention to Detail', 'Creativity',
        'Time Management', 'Customer Service', 'Reliability',
        'Adaptability', 'Quality Control', 'Leather Selection',
        'Color Matching', 'Material Knowledge', 'Business Operations',
        'Pricing', 'Inventory Management', 'Continuous Learning'
    ],
    'watch-repairer': [
        'Watch Repair', 'Watch Movement', 'Battery Replacement',
        'Cleaning', 'Lubrication', 'Parts Replacement',
        'Precision Work', 'Hand Tools', 'Magnification',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Customer Service', 'Reliability', 'Adaptability',
        'Quality Control', 'Watch Knowledge', 'Tool Maintenance',
        'Restoration', 'Antique Watches', 'Brand Knowledge',
        'Inventory Management', 'Business Operations', 'Continuous Learning'
    ],
    'jeweler': [
        'Jewelry Making', 'Jewelry Repair', 'Metalworking',
        'Stone Setting', 'Soldering', 'Polishing',
        'Design', 'Hand Tools', 'Precision Work',
        'Problem Solving', 'Attention to Detail', 'Creativity',
        'Time Management', 'Customer Service', 'Reliability',
        'Adaptability', 'Quality Control', 'Gemstone Knowledge',
        'Metal Knowledge', 'CAD/CAM', 'Casting',
        'Engraving', 'Business Operations', 'Continuous Learning'
    ],
    'florist': [
        'Floral Design', 'Flower Arrangement', 'Bouquet Making',
        'Wreath Making', 'Centerpiece Design', 'Plant Care',
        'Customer Service', 'Creativity', 'Color Theory',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Inventory Management', 'Event Decoration', 'Wedding Flowers',
        'Funeral Flowers', 'Business Operations', 'Pricing',
        'Vendor Relations', 'Reliability', 'Adaptability',
        'Physical Stamina', 'Sales', 'Continuous Learning'
    ],
    'baker': [
        'Baking', 'Bread Making', 'Pastry Making',
        'Cake Decorating', 'Recipe Development', 'Dough Preparation',
        'Oven Operation', 'Food Safety', 'Hygiene',
        'Portion Control', 'Inventory Management', 'Quality Control',
        'Creativity', 'Attention to Detail', 'Time Management',
        'Physical Stamina', 'Team Collaboration', 'Customer Service',
        'Reliability', 'Adaptability', 'Pricing',
        'Packaging', 'Display', 'Continuous Learning'
    ],
    'butcher': [
        'Meat Cutting', 'Meat Processing', 'Deboning',
        'Portioning', 'Grinding', 'Sausage Making',
        'Meat Inspection', 'Food Safety', 'Hygiene',
        'Knife Skills', 'Hand Tools', 'Cutting Equipment',
        'Problem Solving', 'Attention to Detail', 'Physical Stamina',
        'Time Management', 'Safety Compliance', 'Customer Service',
        'Team Collaboration', 'Reliability', 'Adaptability',
        'Quality Control', 'Inventory Management', 'Continuous Learning'
    ],
    'barber': [
        'Barbering', 'Haircut', 'Beard Trim',
        'Shaving', 'Fade Cut', 'Hair Styling',
        'Customer Service', 'Communication', 'Creativity',
        'Hand Tools', 'Clippers', 'Scissors',
        'Sterilization', 'Hygiene', 'Safety Procedures',
        'Time Management', 'Attention to Detail', 'Physical Stamina',
        'Sales', 'Upselling', 'Appointment Scheduling',
        'Business Operations', 'Reliability', 'Continuous Learning'
    ],
    'hairdresser': [
        'Hairdressing', 'Haircut', 'Hair Coloring',
        'Hair Styling', 'Perming', 'Hair Treatment',
        'Customer Service', 'Communication', 'Creativity',
        'Hand Tools', 'Clippers', 'Scissors',
        'Blow Dryer', 'Straightener', 'Hygiene',
        'Safety Procedures', 'Time Management', 'Attention to Detail',
        'Sales', 'Upselling', 'Appointment Scheduling',
        'Business Operations', 'Reliability', 'Continuous Learning'
    ],
    'beautician': [
        'Beauty Therapy', 'Facial Treatment', 'Skin Care',
        'Makeup Application', 'Waxing', 'Threading',
        'Manicure', 'Pedicure', 'Massage',
        'Customer Service', 'Communication', 'Creativity',
        'Hygiene', 'Safety Procedures', 'Product Knowledge',
        'Time Management', 'Attention to Detail', 'Sales',
        'Upselling', 'Appointment Scheduling', 'Business Operations',
        'Reliability', 'Adaptability', 'Continuous Learning'
    ],
    'massage-therapist': [
        'Massage Therapy', 'Swedish Massage', 'Deep Tissue Massage',
        'Sports Massage', 'Hot Stone Massage', 'Aromatherapy',
        'Anatomy Knowledge', 'Customer Service', 'Communication',
        'Empathy', 'Time Management', 'Attention to Detail',
        'Physical Stamina', 'Hygiene', 'Safety Procedures',
        'Product Knowledge', 'Sales', 'Appointment Scheduling',
        'Business Operations', 'Reliability', 'Adaptability',
        'Record Keeping', 'Client Assessment', 'Continuous Learning'
    ]
};