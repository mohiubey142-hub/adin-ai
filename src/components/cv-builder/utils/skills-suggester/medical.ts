// utils/skills-suggester/medical.ts
// ============================================
// MEDICAL SKILLS - 120 Professions
// ============================================

export const medicalSkills: Record<string, string[]> = {
    // ============================================
    // DOCTORS & SPECIALISTS (34) — EXISTING
    // ============================================
    'doctor': [
        'Clinical Diagnosis', 'Patient Care', 'Medical Documentation',
        'EMR Systems', 'Treatment Planning', 'Medical Research',
        'Patient Communication', 'Emergency Response', 'Critical Thinking',
        'Surgical Procedures', 'Pharmacology', 'Diagnostic Imaging',
        'Patient Safety', 'Healthcare Compliance', 'Medical Ethics',
        'Interpersonal Skills', 'Time Management', 'Decision Making',
        'Team Collaboration', 'Continuous Learning', 'Clinical Procedures',
        'Patient Counseling', 'Health Education'
    ],
    'nurse': [
        'Patient Care', 'Vital Signs Monitoring', 'Medication Administration',
        'EMR Systems', 'Patient Education', 'Emergency Response',
        'Clinical Assessment', 'Team Collaboration', 'Wound Care',
        'IV Therapy', 'Patient Safety', 'Infection Control',
        'Care Planning', 'Health Assessment', 'Communication',
        'Critical Thinking', 'Time Management', 'Compassion',
        'Documentation', 'Patient Advocacy', 'Clinical Procedures',
        'Medical Terminology', 'Vital Monitoring'
    ],
    'dentist': [
        'Dental Surgery', 'Patient Care', 'Radiology',
        'Oral Health Education', 'Treatment Planning', 'Anesthesia Administration',
        'Precision', 'Communication', 'Dental Implants',
        'Root Canal Therapy', 'Teeth Whitening', 'Orthodontics',
        'Periodontal Treatment', 'Cosmetic Dentistry', 'Patient Management',
        'Infection Control', 'Dental Materials', 'X-ray Interpretation',
        'Emergency Dental Care', 'Patient Counseling', 'Clinical Procedures',
        'Dental Prosthetics', 'Oral Surgery'
    ],
    'pharmacist': [
        'Medication Management', 'Patient Counseling', 'Pharmacy Software',
        'Drug Interaction Knowledge', 'Inventory Management', 'Clinical Pharmacy',
        'Attention to Detail', 'Prescription Processing', 'Compounding',
        'Pharmaceutical Care', 'Medication Therapy Management', 'Immunization',
        'Patient Safety', 'Regulatory Compliance', 'Pharmacology',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Health Education', 'Drug Information', 'Pharmacy Law',
        'Quality Assurance', 'Patient Assessment'
    ],
    'radiologist': [
        'Diagnostic Imaging', 'X-ray Interpretation', 'CT Scanning',
        'MRI Interpretation', 'Ultrasound', 'Patient Care',
        'Radiation Safety', 'Image Analysis', 'Radiology Software',
        'Clinical Reporting', 'Interventional Radiology', 'Mammography',
        'Nuclear Medicine', 'Patient Positioning', 'Quality Assurance',
        'Communication', 'Attention to Detail', 'Critical Thinking',
        'Medical Terminology', 'Radiation Physics', 'Anatomy Knowledge',
        'Emergency Radiology', 'PACS Systems'
    ],
    'cardiologist': [
        'Cardiac Diagnosis', 'Echocardiography', 'Stress Testing',
        'Cardiac Catheterization', 'ECG Interpretation', 'Patient Care',
        'Heart Failure Management', 'Interventional Cardiology', 'Cardiac Imaging',
        'Hypertension Management', 'Preventive Cardiology', 'Cardiac Rehabilitation',
        'Pacemaker Management', 'Patient Communication', 'Critical Thinking',
        'Emergency Cardiac Care', 'Clinical Research', 'Medical Documentation',
        'Team Collaboration', 'Patient Education', 'Cardiovascular Pharmacology',
        'Holter Monitoring', 'Cardiac Surgery Support'
    ],
    'pediatrician': [
        'Child Healthcare', 'Pediatric Diagnosis', 'Vaccination',
        'Growth Monitoring', 'Developmental Assessment', 'Patient Care',
        'Neonatal Care', 'Pediatric Emergency', 'Parent Counseling',
        'Child Nutrition', 'Pediatric Pharmacology', 'Childhood Diseases',
        'Behavioral Assessment', 'Pediatric Intensive Care', 'Communication',
        'Empathy', 'Child Psychology', 'Patient Education',
        'Clinical Procedures', 'Medical Documentation', 'Team Collaboration',
        'Adolescent Health', 'Pediatric Surgery Support'
    ],
    'gynecologist': [
        'Women\'s Health', 'Obstetric Care', 'Gynecological Surgery',
        'Prenatal Care', 'Labor and Delivery', 'Menopause Management',
        'Fertility Treatment', 'Patient Counseling', 'Ultrasound',
        'Gynecological Oncology', 'Laparoscopic Surgery', 'Contraception',
        'High-Risk Pregnancy', 'Reproductive Health', 'Communication',
        'Patient Care', 'Surgical Procedures', 'Emergency Obstetrics',
        'Clinical Research', 'Medical Documentation', 'Team Collaboration',
        'Patient Education', 'Hormonal Therapy'
    ],
    'psychiatrist': [
        'Psychiatric Diagnosis', 'Psychotherapy', 'Medication Management',
        'Mental Health Assessment', 'Crisis Intervention', 'Patient Counseling',
        'Cognitive Behavioral Therapy', 'Group Therapy', 'Addiction Treatment',
        'Child Psychiatry', 'Geriatric Psychiatry', 'Forensic Psychiatry',
        'Patient Communication', 'Empathy', 'Clinical Documentation',
        'Treatment Planning', 'Team Collaboration', 'Psychopharmacology',
        'Emergency Psychiatry', 'Research', 'Patient Education',
        'Behavioral Therapy', 'Mental Health Advocacy'
    ],
    'medical-technologist': [
        'Laboratory Testing', 'Hematology', 'Microbiology',
        'Clinical Chemistry', 'Quality Control', 'Medical Equipment',
        'Sample Analysis', 'Documentation', 'Safety Compliance',
        'Blood Bank', 'Immunology', 'Molecular Diagnostics',
        'Laboratory Information Systems', 'Specimen Processing', 'Microscopy',
        'Test Validation', 'Instrument Maintenance', 'Data Analysis',
        'Infection Control', 'Team Collaboration', 'Clinical Procedures',
        'Quality Assurance', 'Emergency Testing'
    ],
    'physical-therapist': [
        'Manual Therapy', 'Exercise Prescription', 'Patient Rehabilitation',
        'Neurological Assessment', 'Orthopedic Assessment', 'Pain Management',
        'Patient Education', 'Treatment Planning', 'Clinical Documentation',
        'Sports Rehabilitation', 'Geriatric Physical Therapy', 'Pediatric Physical Therapy',
        'Therapeutic Exercises', 'Gait Training', 'Post-Surgical Rehabilitation',
        'Patient Care', 'Communication', 'Team Collaboration',
        'Modalities', 'Patient Assessment', 'Home Exercise Programs',
        'Functional Training', 'Injury Prevention'
    ],
    'physiotherapist': [
        'Manual Therapy', 'Exercise Prescription', 'Patient Rehabilitation',
        'Neurological Assessment', 'Orthopedic Assessment', 'Pain Management',
        'Patient Education', 'Treatment Planning', 'Clinical Documentation',
        'Sports Physiotherapy', 'Geriatric Physiotherapy', 'Pediatric Physiotherapy',
        'Therapeutic Exercises', 'Gait Training', 'Post-Surgical Rehabilitation',
        'Patient Care', 'Communication', 'Team Collaboration',
        'Modalities', 'Patient Assessment', 'Home Exercise Programs',
        'Functional Training', 'Injury Prevention'
    ],
    'nutritionist': [
        'Nutritional Assessment', 'Diet Planning', 'Clinical Nutrition',
        'Health Education', 'Weight Management', 'Public Health',
        'Food Science', 'Patient Counseling', 'Research',
        'Medical Nutrition Therapy', 'Sports Nutrition', 'Pediatric Nutrition',
        'Geriatric Nutrition', 'Diabetes Management', 'Meal Planning',
        'Nutritional Supplements', 'Dietary Analysis', 'Communication',
        'Patient Education', 'Team Collaboration', 'Clinical Documentation',
        'Eating Disorder Management', 'Nutritional Counseling'
    ],
    'medical-lab-technologist': [
        'Laboratory Testing', 'Hematology', 'Microbiology',
        'Clinical Chemistry', 'Quality Control', 'Medical Equipment',
        'Sample Analysis', 'Documentation', 'Safety Compliance',
        'Blood Bank', 'Immunology', 'Molecular Diagnostics',
        'Laboratory Information Systems', 'Specimen Processing', 'Microscopy',
        'Test Validation', 'Instrument Maintenance', 'Data Analysis',
        'Infection Control', 'Team Collaboration', 'Clinical Procedures',
        'Quality Assurance', 'Emergency Testing'
    ],
    'radiology-technologist': [
        'Radiographic Imaging', 'CT Scanning', 'MRI Procedures',
        'Radiation Safety', 'Patient Positioning', 'Image Quality Assurance',
        'Equipment Maintenance', 'Anatomy Knowledge', 'Patient Care',
        'Interventional Radiology', 'Mammography', 'Ultrasound',
        'Nuclear Medicine', 'Bone Densitometry', 'Fluoroscopy',
        'PACS Systems', 'Contrast Administration', 'Patient Communication',
        'Emergency Imaging', 'Radiation Protection', 'Team Collaboration',
        'Documentation', 'Quality Control'
    ],
    'occupational-therapist': [
        'Functional Assessment', 'Rehabilitation', 'Therapeutic Activities',
        'Patient Education', 'Home Modifications', 'Assistive Technology',
        'Occupational Health', 'Mental Health', 'Pediatric Therapy',
        'Geriatric Therapy', 'Hand Therapy', 'Neurological Rehabilitation',
        'Adaptive Equipment', 'Workplace Assessment', 'Treatment Planning',
        'Patient Care', 'Communication', 'Team Collaboration',
        'Clinical Documentation', 'Patient Assessment', 'Community Integration',
        'Cognitive Rehabilitation', 'Sensory Integration'
    ],
    'speech-therapist': [
        'Speech Assessment', 'Language Therapy', 'Articulation Disorders',
        'Voice Disorders', 'Fluency Therapy', 'Neurogenic Disorders',
        'Pediatric Speech Therapy', 'Swallowing Disorders', 'Patient Education',
        'AAC Devices', 'Autism Spectrum Disorders', 'Hearing Impairments',
        'Cognitive Communication', 'Treatment Planning', 'Patient Care',
        'Communication', 'Team Collaboration', 'Clinical Documentation',
        'Patient Assessment', 'Parent Training', 'Group Therapy',
        'Language Development', 'Social Communication'
    ],
    'optometrist': [
        'Eye Examinations', 'Refraction', 'Ocular Disease Management',
        'Contact Lens Fitting', 'Low Vision Assessment', 'Optical Prescriptions',
        'Patient Education', 'Diagnostic Equipment', 'Binocular Vision',
        'Glaucoma Management', 'Diabetic Eye Care', 'Pediatric Optometry',
        'Geriatric Optometry', 'Contact Lens', 'Optical Dispensing',
        'Patient Care', 'Communication', 'Clinical Procedures',
        'Eye Health', 'Vision Therapy', 'Team Collaboration',
        'Documentation', 'Emergency Eye Care'
    ],
    'veterinary-doctor': [
        'Animal Health', 'Surgery', 'Diagnostic Imaging',
        'Pharmacology', 'Emergency Medicine', 'Preventive Care',
        'Client Education', 'Surgical Procedures', 'Animal Welfare',
        'Veterinary Dentistry', 'Internal Medicine', 'Exotic Animals',
        'Large Animal Medicine', 'Small Animal Medicine', 'Anesthesia',
        'Patient Care', 'Communication', 'Team Collaboration',
        'Clinical Documentation', 'Animal Nutrition', 'Vaccination',
        'Parasitology', 'Zoonotic Diseases'
    ],
    'healthcare-administrator': [
        'Healthcare Operations', 'Medical Records', 'Compliance',
        'Strategic Planning', 'Budget Management', 'Healthcare Regulations',
        'Staff Management', 'Quality Improvement', 'Healthcare Technology',
        'Patient Experience', 'Risk Management', 'Financial Management',
        'Human Resources', 'Healthcare Policy', 'Data Analysis',
        'Communication', 'Leadership', 'Problem Solving',
        'Team Collaboration', 'Project Management', 'Strategic Thinking',
        'Change Management', 'Healthcare Informatics'
    ],
    'paramedic': [
        'Emergency Medical Care', 'Patient Assessment', 'Life Support',
        'Trauma Care', 'CPR', 'Ambulance Operations',
        'Medical Documentation', 'Emergency Response', 'Patient Transport',
        'Advanced Life Support', 'Basic Life Support', 'Airway Management',
        'IV Therapy', 'Medication Administration', 'ECG Interpretation',
        'Patient Care', 'Communication', 'Critical Thinking',
        'Team Collaboration', 'Emergency Pharmacology', 'Scene Management',
        'Triage', 'Patient Stabilization'
    ],
    'medical-technician': [
        'Diagnostic Testing', 'Laboratory Procedures', 'Specimen Processing',
        'Equipment Operation', 'Quality Control', 'Medical Documentation',
        'Safety Compliance', 'Patient Care', 'Test Analysis',
        'Hematology', 'Microbiology', 'Clinical Chemistry',
        'Blood Collection', 'Phlebotomy', 'ECG',
        'Patient Preparation', 'Infection Control', 'Communication',
        'Team Collaboration', 'Instrument Maintenance', 'Data Entry',
        'Quality Assurance', 'Emergency Testing'
    ],
    'physician-assistant': [
        'Patient Assessment', 'Clinical Diagnosis', 'Treatment Planning',
        'Medical History Taking', 'Physical Examination', 'Diagnostic Interpretation',
        'Patient Education', 'Healthcare Coordination', 'Clinical Documentation',
        'Prescriptive Authority', 'Patient Care', 'Emergency Medicine',
        'Surgical Assistance', 'Primary Care', 'Specialty Care',
        'Communication', 'Critical Thinking', 'Team Collaboration',
        'Clinical Procedures', 'Patient Counseling', 'Health Promotion',
        'Disease Prevention', 'Chronic Care Management'
    ],
    'medical-sales-representative': [
        'Pharmaceutical Sales', 'Medical Terminology', 'Relationship Building',
        'Product Knowledge', 'Sales Strategy', 'CRM',
        'Territory Management', 'Negotiation', 'Healthcare Industry Knowledge',
        'Communication', 'Presentation Skills', 'Market Analysis',
        'Customer Service', 'Time Management', 'Problem Solving',
        'Team Collaboration', 'Regulatory Compliance', 'Product Training',
        'Account Management', 'Sales Reporting', 'Networking',
        'Clinical Data', 'Competitive Analysis'
    ],
    'dental-assistant': [
        'Chairside Assistance', 'Dental Procedures', 'Sterilization',
        'Patient Care', 'Dental Instruments', 'Radiology',
        'Patient Records', 'Infection Control', 'Dental Materials',
        'Patient Education', 'Scheduling', 'Inventory Management',
        'Communication', 'Team Collaboration', 'Clinical Procedures',
        'Patient Comfort', 'Dental Terminology', 'X-ray Processing',
        'Treatment Preparation', 'Patient Safety', 'Documentation',
        'Equipment Maintenance', 'Dental Software'
    ],
    'dental-technician': [
        'Dental Prosthetics', 'CAD/CAM', 'Crown and Bridge',
        'Dentures', 'Orthodontic Appliances', 'Dental Materials',
        'Laboratory Procedures', 'Precision Work', 'Quality Control',
        'Dental Impressions', '3D Printing', 'Wax Modeling',
        'Metal Finishing', 'Ceramic Work', 'Color Matching',
        'Communication', 'Team Collaboration', 'Attention to Detail',
        'Dental Anatomy', 'Equipment Maintenance', 'Documentation',
        'Infection Control', 'Dental Technology'
    ],
    'dietitian': [
        'Nutritional Assessment', 'Diet Planning', 'Clinical Nutrition',
        'Health Education', 'Weight Management', 'Medical Nutrition Therapy',
        'Food Science', 'Patient Counseling', 'Research',
        'Diabetes Management', 'Sports Nutrition', 'Pediatric Nutrition',
        'Geriatric Nutrition', 'Meal Planning', 'Nutritional Supplements',
        'Patient Care', 'Communication', 'Team Collaboration',
        'Clinical Documentation', 'Patient Education', 'Eating Disorder Management',
        'Nutritional Counseling', 'Public Health'
    ],
    'emergency-medical-technician': [
        'Emergency Medical Care', 'Patient Assessment', 'Life Support',
        'Trauma Care', 'CPR', 'Ambulance Operations',
        'Medical Documentation', 'Emergency Response', 'Patient Transport',
        'Advanced Life Support', 'Basic Life Support', 'Airway Management',
        'IV Therapy', 'Medication Administration', 'ECG Interpretation',
        'Patient Care', 'Communication', 'Critical Thinking',
        'Team Collaboration', 'Emergency Pharmacology', 'Scene Management',
        'Triage', 'Patient Stabilization'
    ],
    'lab-assistant': [
        'Sample Preparation', 'Laboratory Procedures', 'Equipment Maintenance',
        'Quality Control', 'Specimen Processing', 'Laboratory Safety',
        'Documentation', 'Inventory Management', 'Data Entry',
        'Hematology', 'Microbiology', 'Clinical Chemistry',
        'Blood Collection', 'Phlebotomy', 'Microscopy',
        'Patient Care', 'Communication', 'Team Collaboration',
        'Infection Control', 'Reagent Preparation', 'Quality Assurance',
        'Laboratory Information Systems', 'Emergency Testing'
    ],
    'medical-assistant': [
        'Patient Care', 'Clinical Procedures', 'Vital Signs',
        'Medical Records', 'EMR Systems', 'Patient Scheduling',
        'Medication Administration', 'Injections', 'ECG',
        'Phlebotomy', 'Patient Education', 'Clinical Documentation',
        'Communication', 'Team Collaboration', 'Infection Control',
        'Patient Safety', 'Medical Terminology', 'Administrative Tasks',
        'Patient Preparation', 'Equipment Maintenance', 'Sterilization',
        'Appointment Scheduling', 'Insurance Verification'
    ],
    'medical-coder': [
        'Medical Coding', 'ICD-10', 'CPT Coding',
        'Medical Terminology', 'Anatomy Knowledge', 'Medical Records',
        'Coding Software', 'Compliance', 'Quality Assurance',
        'Claim Processing', 'Revenue Cycle', 'Health Information Management',
        'Attention to Detail', 'Communication', 'Team Collaboration',
        'Documentation', 'Coding Audits', 'Physician Queries',
        'Medical Billing', 'Insurance Claims', 'Electronic Health Records',
        'Coding Guidelines', 'Continuing Education'
    ],
    'midwife': [
        'Prenatal Care', 'Labor and Delivery', 'Postpartum Care',
        'Newborn Care', 'Patient Education', 'Breastfeeding Support',
        'Family Planning', 'Patient Assessment', 'Clinical Documentation',
        'Emergency Obstetrics', 'Midwifery Care', 'Antenatal Care',
        'Communication', 'Compassion', 'Team Collaboration',
        'Patient Care', 'Health Education', 'Cervical Screening',
        'Contraception', 'Menopause Support', 'Birth Planning',
        'Water Birth', 'Home Birth'
    ],
    'public-health-officer': [
        'Public Health', 'Epidemiology', 'Health Education',
        'Disease Prevention', 'Community Health', 'Health Policy',
        'Data Analysis', 'Health Promotion', 'Outbreak Investigation',
        'Vaccination Programs', 'Environmental Health', 'Health Surveillance',
        'Communication', 'Team Collaboration', 'Problem Solving',
        'Public Health Research', 'Health Program Management', 'Biostatistics',
        'Health Communication', 'Emergency Preparedness', 'Community Outreach',
        'Policy Development', 'Health Equity'
    ],
    'caregiver': [
        'Personal Care', 'Patient Care', 'Medication Reminders',
        'Meal Preparation', 'Mobility Assistance', 'Companionship',
        'Housekeeping', 'Patient Safety', 'Communication',
        'Empathy', 'Patience', 'Team Collaboration',
        'Documentation', 'First Aid', 'CPR',
        'Dementia Care', 'Elderly Care', 'Disability Care',
        'Patient Monitoring', 'Emotional Support', 'Transportation',
        'Health Monitoring', 'Family Communication'
    ],

    // ============================================
    // ✅ NEW BATCH 3 — MEDICAL SPECIALISTS (20)
    // ============================================
    'general-practitioner': [
        'Primary Care', 'Clinical Diagnosis', 'Patient Care',
        'Treatment Planning', 'Medical Documentation', 'EMR Systems',
        'Patient Communication', 'Preventive Care', 'Health Education',
        'Chronic Disease Management', 'Referrals', 'Critical Thinking',
        'Clinical Procedures', 'Patient Counseling', 'Team Collaboration',
        'Time Management', 'Medical Ethics', 'Continuous Learning',
        'Family Medicine', 'Emergency Response'
    ],
    'family-physician': [
        'Family Medicine', 'Primary Care', 'Clinical Diagnosis',
        'Patient Care', 'Treatment Planning', 'Preventive Care',
        'Chronic Disease Management', 'Patient Communication', 'Health Education',
        'Pediatric Care', 'Geriatric Care', 'Women\'s Health',
        'EMR Systems', 'Medical Documentation', 'Referrals',
        'Critical Thinking', 'Clinical Procedures', 'Team Collaboration',
        'Medical Ethics', 'Continuous Learning'
    ],
    'internal-medicine-specialist': [
        'Internal Medicine', 'Clinical Diagnosis', 'Patient Care',
        'Treatment Planning', 'Chronic Disease Management', 'Preventive Care',
        'Medical Documentation', 'EMR Systems', 'Patient Communication',
        'Diagnostic Interpretation', 'Clinical Procedures', 'Critical Thinking',
        'Team Collaboration', 'Patient Counseling', 'Medical Ethics',
        'Research', 'Continuous Learning', 'Referrals',
        'Health Education', 'Emergency Response'
    ],
    'surgeon': [
        'Surgical Procedures', 'Patient Care', 'Pre-operative Assessment',
        'Post-operative Care', 'Surgical Techniques', 'Anesthesia Knowledge',
        'Clinical Diagnosis', 'Medical Documentation', 'Patient Communication',
        'Critical Thinking', 'Decision Making', 'Team Collaboration',
        'Sterile Technique', 'Surgical Instruments', 'Emergency Surgery',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Leadership', 'Time Management'
    ],
    'general-surgeon': [
        'General Surgery', 'Surgical Procedures', 'Patient Care',
        'Pre-operative Assessment', 'Post-operative Care', 'Laparoscopic Surgery',
        'Clinical Diagnosis', 'Medical Documentation', 'Patient Communication',
        'Critical Thinking', 'Decision Making', 'Team Collaboration',
        'Sterile Technique', 'Surgical Instruments', 'Emergency Surgery',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Leadership', 'Time Management'
    ],
    'orthopedic-surgeon': [
        'Orthopedic Surgery', 'Bone Surgery', 'Joint Replacement',
        'Fracture Management', 'Sports Medicine', 'Arthroscopy',
        'Patient Care', 'Clinical Diagnosis', 'Surgical Procedures',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Team Collaboration', 'Rehabilitation', 'Medical Ethics',
        'Continuous Learning', 'X-ray Interpretation', 'Patient Safety',
        'Leadership', 'Time Management'
    ],
    'neurosurgeon': [
        'Neurosurgery', 'Brain Surgery', 'Spine Surgery',
        'Patient Care', 'Clinical Diagnosis', 'Surgical Procedures',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Microsurgery', 'Neuroimaging', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Emergency Neurosurgery', 'Leadership', 'Time Management',
        'Research', 'Decision Making'
    ],
    'cardiothoracic-surgeon': [
        'Cardiothoracic Surgery', 'Heart Surgery', 'Lung Surgery',
        'Patient Care', 'Clinical Diagnosis', 'Surgical Procedures',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Cardiac Bypass', 'Thoracic Surgery', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Emergency Surgery', 'Leadership', 'Time Management',
        'Research', 'Decision Making'
    ],
    'plastic-surgeon': [
        'Plastic Surgery', 'Reconstructive Surgery', 'Cosmetic Surgery',
        'Patient Care', 'Clinical Diagnosis', 'Surgical Procedures',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Microsurgery', 'Aesthetic Techniques', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Patient Counseling', 'Leadership', 'Time Management',
        'Research', 'Decision Making'
    ],
    'vascular-surgeon': [
        'Vascular Surgery', 'Vascular Procedures', 'Patient Care',
        'Clinical Diagnosis', 'Surgical Procedures', 'Endovascular Surgery',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Ultrasound Interpretation', 'Team Collaboration', 'Patient Safety',
        'Medical Ethics', 'Continuous Learning', 'Emergency Surgery',
        'Leadership', 'Time Management', 'Research',
        'Decision Making', 'Patient Counseling'
    ],
    'pediatric-surgeon': [
        'Pediatric Surgery', 'Child Surgery', 'Neonatal Surgery',
        'Patient Care', 'Clinical Diagnosis', 'Surgical Procedures',
        'Medical Documentation', 'Parent Communication', 'Critical Thinking',
        'Congenital Anomalies', 'Team Collaboration', 'Patient Safety',
        'Medical Ethics', 'Continuous Learning', 'Emergency Surgery',
        'Leadership', 'Time Management', 'Research',
        'Decision Making', 'Parent Counseling'
    ],
    'urologist': [
        'Urology', 'Urological Procedures', 'Patient Care',
        'Clinical Diagnosis', 'Surgical Procedures', 'Endoscopy',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Kidney Stones', 'Prostate Care', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Urodynamics', 'Leadership', 'Time Management',
        'Research', 'Patient Counseling'
    ],
    'nephrologist': [
        'Nephrology', 'Kidney Care', 'Dialysis',
        'Patient Care', 'Clinical Diagnosis', 'Treatment Planning',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Renal Biopsy', 'Hypertension Management', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Transplant Care', 'Research', 'Patient Counseling',
        'Health Education', 'Time Management'
    ],
    'neurologist': [
        'Neurology', 'Neurological Diagnosis', 'Patient Care',
        'Clinical Assessment', 'Treatment Planning', 'Medical Documentation',
        'Patient Communication', 'Critical Thinking', 'EEG Interpretation',
        'EMG', 'Stroke Management', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Epilepsy Management', 'Headache Management', 'Research',
        'Patient Counseling', 'Time Management'
    ],
    'oncologist': [
        'Oncology', 'Cancer Diagnosis', 'Chemotherapy',
        'Patient Care', 'Treatment Planning', 'Medical Documentation',
        'Patient Communication', 'Critical Thinking', 'Immunotherapy',
        'Radiation Therapy', 'Clinical Trials', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Palliative Care', 'Research', 'Patient Counseling',
        'Health Education', 'Time Management'
    ],
    'dermatologist': [
        'Dermatology', 'Skin Diagnosis', 'Patient Care',
        'Clinical Assessment', 'Treatment Planning', 'Medical Documentation',
        'Patient Communication', 'Critical Thinking', 'Dermatological Procedures',
        'Cosmetic Dermatology', 'Skin Cancer Screening', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Laser Therapy', 'Patient Counseling', 'Research',
        'Health Education', 'Time Management'
    ],
    'endocrinologist': [
        'Endocrinology', 'Hormonal Disorders', 'Diabetes Management',
        'Patient Care', 'Clinical Diagnosis', 'Treatment Planning',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Thyroid Management', 'Osteoporosis', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Hormone Therapy', 'Patient Counseling', 'Research',
        'Health Education', 'Time Management'
    ],
    'gastroenterologist': [
        'Gastroenterology', 'Digestive Disorders', 'Endoscopy',
        'Patient Care', 'Clinical Diagnosis', 'Treatment Planning',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Colonoscopy', 'Liver Disease', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'IBD Management', 'Patient Counseling', 'Research',
        'Health Education', 'Time Management'
    ],
    'pulmonologist': [
        'Pulmonology', 'Respiratory Disorders', 'Lung Function Testing',
        'Patient Care', 'Clinical Diagnosis', 'Treatment Planning',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Bronchoscopy', 'Asthma Management', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'COPD Management', 'Patient Counseling', 'Research',
        'Health Education', 'Time Management'
    ],
    'rheumatologist': [
        'Rheumatology', 'Autoimmune Disorders', 'Arthritis Management',
        'Patient Care', 'Clinical Diagnosis', 'Treatment Planning',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Joint Assessment', 'Biologic Therapy', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Osteoporosis', 'Patient Counseling', 'Research',
        'Health Education', 'Time Management'
    ],
    'hematologist': [
        'Hematology', 'Blood Disorders', 'Anemia Management',
        'Patient Care', 'Clinical Diagnosis', 'Treatment Planning',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Bone Marrow Biopsy', 'Coagulation Disorders', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Leukemia Management', 'Patient Counseling', 'Research',
        'Health Education', 'Time Management'
    ],
    'infectious-disease-specialist': [
        'Infectious Diseases', 'Infection Diagnosis', 'Antimicrobial Therapy',
        'Patient Care', 'Clinical Diagnosis', 'Treatment Planning',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Infection Control', 'Outbreak Investigation', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'HIV Management', 'Tropical Medicine', 'Research',
        'Public Health', 'Time Management'
    ],
    'anesthesiologist': [
        'Anesthesiology', 'Anesthesia Administration', 'Patient Monitoring',
        'Patient Care', 'Pre-operative Assessment', 'Airway Management',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Regional Anesthesia', 'Pain Management', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Emergency Anesthesia', 'ICU Care', 'Research',
        'Decision Making', 'Time Management'
    ],
    'pathologist': [
        'Pathology', 'Laboratory Diagnosis', 'Tissue Analysis',
        'Patient Care', 'Microscopy', 'Medical Documentation',
        'Clinical Reporting', 'Critical Thinking', 'Histopathology',
        'Cytopathology', 'Molecular Pathology', 'Team Collaboration',
        'Quality Control', 'Medical Ethics', 'Continuous Learning',
        'Autopsy', 'Research', 'Data Analysis',
        'Attention to Detail', 'Time Management'
    ],
    'clinical-pathologist': [
        'Clinical Pathology', 'Laboratory Diagnosis', 'Blood Analysis',
        'Patient Care', 'Microscopy', 'Medical Documentation',
        'Clinical Reporting', 'Critical Thinking', 'Hematology',
        'Clinical Chemistry', 'Microbiology', 'Team Collaboration',
        'Quality Control', 'Medical Ethics', 'Continuous Learning',
        'Test Validation', 'Research', 'Data Analysis',
        'Attention to Detail', 'Time Management'
    ],
    'ophthalmologist': [
        'Ophthalmology', 'Eye Surgery', 'Eye Examination',
        'Patient Care', 'Clinical Diagnosis', 'Treatment Planning',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Cataract Surgery', 'Retina Care', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Glaucoma Management', 'Patient Counseling', 'Research',
        'Laser Therapy', 'Time Management'
    ],
    'ent-specialist': [
        'ENT', 'Ear Surgery', 'Nose Surgery',
        'Patient Care', 'Clinical Diagnosis', 'Throat Surgery',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Endoscopy', 'Hearing Assessment', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Sinus Surgery', 'Patient Counseling', 'Research',
        'Tonsillectomy', 'Time Management'
    ],
    'otolaryngologist': [
        'Otolaryngology', 'ENT Surgery', 'Ear Disorder Treatment',
        'Patient Care', 'Clinical Diagnosis', 'Throat Disorder Treatment',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Endoscopic Procedures', 'Head and Neck Surgery', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Audiology', 'Patient Counseling', 'Research',
        'Voice Disorders', 'Time Management'
    ],
    'obstetrician': [
        'Obstetrics', 'Prenatal Care', 'Labor and Delivery',
        'Patient Care', 'Clinical Diagnosis', 'Cesarean Section',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'High-Risk Pregnancy', 'Fetal Monitoring', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Postpartum Care', 'Patient Counseling', 'Research',
        'Ultrasound', 'Time Management'
    ],
    'obstetrician-gynecologist': [
        'Obstetrics', 'Gynecology', 'Prenatal Care',
        'Patient Care', 'Clinical Diagnosis', 'Labor and Delivery',
        'Medical Documentation', 'Patient Communication', 'Critical Thinking',
        'Cesarean Section', 'Gynecological Surgery', 'Team Collaboration',
        'Patient Safety', 'Medical Ethics', 'Continuous Learning',
        'Fertility Treatment', 'Patient Counseling', 'Research',
        'Ultrasound', 'Time Management'
    ],

        // ============================================
    // ✅ NEW BATCH 3 — MEDICAL OFFICERS & RESIDENTS (12)
    // ============================================
    'medical-officer': [
        'Patient Care', 'Clinical Diagnosis', 'Treatment Planning',
        'Medical Documentation', 'EMR Systems', 'Patient Communication',
        'Emergency Response', 'Clinical Procedures', 'Critical Thinking',
        'Patient Safety', 'Medical Ethics', 'Team Collaboration',
        'Time Management', 'Health Education', 'Patient Counseling',
        'Continuous Learning', 'Preventive Care', 'Referrals',
        'Vital Signs Monitoring', 'Medication Management'
    ],
    'house-officer': [
        'Patient Care', 'Clinical Assessment', 'Medical Documentation',
        'EMR Systems', 'Patient Communication', 'Vital Signs Monitoring',
        'Clinical Procedures', 'Medication Administration', 'Emergency Response',
        'Critical Thinking', 'Team Collaboration', 'Patient Safety',
        'Medical Ethics', 'Time Management', 'Continuous Learning',
        'Ward Rounds', 'Patient Counseling', 'Health Education',
        'Referrals', 'Medical Terminology'
    ],
    'resident-medical-officer': [
        'Patient Care', 'Clinical Assessment', 'Medical Documentation',
        'EMR Systems', 'Patient Communication', 'Vital Signs Monitoring',
        'Clinical Procedures', 'Medication Administration', 'Emergency Response',
        'Critical Thinking', 'Team Collaboration', 'Patient Safety',
        'Medical Ethics', 'Time Management', 'Continuous Learning',
        'Ward Rounds', 'Patient Counseling', 'Health Education',
        'Referrals', 'Medical Terminology'
    ],
    'resident-physician': [
        'Patient Care', 'Clinical Assessment', 'Medical Documentation',
        'EMR Systems', 'Patient Communication', 'Treatment Planning',
        'Clinical Procedures', 'Medication Administration', 'Emergency Response',
        'Critical Thinking', 'Team Collaboration', 'Patient Safety',
        'Medical Ethics', 'Time Management', 'Continuous Learning',
        'Ward Rounds', 'Patient Counseling', 'Research',
        'Specialty Training', 'Medical Terminology'
    ],
    'medical-registrar': [
        'Patient Care', 'Clinical Assessment', 'Medical Documentation',
        'EMR Systems', 'Patient Communication', 'Treatment Planning',
        'Clinical Procedures', 'Medication Administration', 'Emergency Response',
        'Critical Thinking', 'Team Collaboration', 'Patient Safety',
        'Medical Ethics', 'Time Management', 'Continuous Learning',
        'Ward Rounds', 'Patient Counseling', 'Teaching',
        'Research', 'Medical Terminology'
    ],
    'clinical-fellow': [
        'Patient Care', 'Clinical Assessment', 'Medical Documentation',
        'EMR Systems', 'Patient Communication', 'Treatment Planning',
        'Clinical Procedures', 'Advanced Procedures', 'Emergency Response',
        'Critical Thinking', 'Team Collaboration', 'Patient Safety',
        'Medical Ethics', 'Time Management', 'Continuous Learning',
        'Research', 'Teaching', 'Patient Counseling',
        'Subspecialty Training', 'Medical Terminology'
    ],
    'clinical-research-coordinator': [
        'Clinical Research', 'Study Coordination', 'Patient Recruitment',
        'Informed Consent', 'Data Collection', 'Regulatory Compliance',
        'IRB Submissions', 'Clinical Documentation', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'GCP', 'Clinical Trials',
        'Patient Care', 'Data Management', 'Reporting',
        'MS Office', 'Continuous Learning'
    ],
    'clinical-research-associate': [
        'Clinical Research', 'Monitoring', 'Site Visits',
        'Patient Recruitment', 'Informed Consent', 'Data Collection',
        'Regulatory Compliance', 'Clinical Documentation', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'GCP', 'Clinical Trials',
        'Data Management', 'Source Verification', 'Reporting',
        'MS Office', 'Continuous Learning'
    ],
    'clinical-research-scientist': [
        'Clinical Research', 'Study Design', 'Protocol Development',
        'Data Analysis', 'Statistics', 'SPSS',
        'R', 'Python', 'Scientific Writing',
        'Publication', 'Regulatory Compliance', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Team Collaboration',
        'GCP', 'Clinical Trials', 'Research Methodology',
        'Grant Writing', 'Continuous Learning'
    ],
    'medical-researcher': [
        'Medical Research', 'Study Design', 'Protocol Development',
        'Data Analysis', 'Statistics', 'SPSS',
        'R', 'Python', 'Scientific Writing',
        'Publication', 'Literature Review', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Team Collaboration',
        'Research Methodology', 'Clinical Trials', 'Grant Writing',
        'Conference Presentations', 'Continuous Learning'
    ],
    'medical-writer': [
        'Medical Writing', 'Regulatory Documentation', 'Clinical Study Reports',
        'Scientific Writing', 'Literature Review', 'Research',
        'AMA Style', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Regulatory Compliance', 'Manuscript Preparation', 'Publication',
        'Editing', 'Proofreading', 'MS Office',
        'Reference Management', 'Continuous Learning'
    ],
    'medical-transcriptionist': [
        'Medical Transcription', 'Medical Terminology', 'Dictation',
        'Editing', 'Proofreading', 'Attention to Detail',
        'Time Management', 'Communication', 'Problem Solving',
        'MS Office', 'Transcription Software', 'HIPAA Compliance',
        'Confidentiality', 'Typing Speed', 'Documentation',
        'Audio Editing', 'Medical Records', 'Quality Assurance',
        'Reliability', 'Continuous Learning'
    ],
    'medical-receptionist': [
        'Patient Reception', 'Appointment Scheduling', 'Patient Check-in',
        'Phone Handling', 'Insurance Verification', 'Medical Records',
        'EMR Systems', 'Communication', 'Customer Service',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'MS Office', 'Billing',
        'Patient Billing', 'Data Entry', 'Organizational Skills',
        'Multitasking', 'HIPAA Compliance'
    ],
    'medical-secretary': [
        'Medical Administration', 'Appointment Scheduling', 'Patient Records',
        'Insurance Verification', 'Medical Billing', 'EMR Systems',
        'Communication', 'Customer Service', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'MS Office', 'Medical Terminology', 'Documentation',
        'Filing', 'Data Entry', 'Organizational Skills',
        'Multitasking', 'HIPAA Compliance'
    ],
    'medical-billing-specialist': [
        'Medical Billing', 'Medical Coding', 'ICD-10',
        'CPT Coding', 'Insurance Claims', 'Reimbursement',
        'Revenue Cycle', 'EMR Systems', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'MS Office', 'Billing Software',
        'Claims Processing', 'Denial Management', 'Patient Billing',
        'HIPAA Compliance', 'Continuous Learning'
    ],

    // ============================================
    // ✅ NEW BATCH 3 — HEALTHCARE CONSULTANTS & MANAGERS (12)
    // ============================================
    'healthcare-consultant': [
        'Healthcare Consulting', 'Healthcare Operations', 'Process Improvement',
        'Data Analysis', 'Client Management', 'Communication',
        'Presentation Skills', 'Problem Solving', 'Critical Thinking',
        'Project Management', 'Change Management', 'Stakeholder Management',
        'Team Collaboration', 'Excel', 'PowerPoint',
        'Report Writing', 'Healthcare Regulations', 'Business Development',
        'Time Management', 'Continuous Learning'
    ],
    'healthcare-quality-officer': [
        'Healthcare Quality', 'Quality Improvement', 'Patient Safety',
        'Accreditation', 'Compliance', 'Data Analysis',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Reporting', 'Documentation', 'Audit',
        'Clinical Standards', 'Risk Management', 'Training',
        'MS Office', 'Continuous Improvement'
    ],
    'healthcare-quality-manager': [
        'Healthcare Quality Management', 'Team Leadership', 'Quality Improvement',
        'Patient Safety', 'Accreditation', 'Compliance',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Data Analysis',
        'Reporting', 'Strategic Planning', 'Risk Management',
        'Training', 'Change Management', 'Stakeholder Management',
        'Budget Management', 'Continuous Improvement'
    ],
    'hospital-administrator': [
        'Hospital Administration', 'Healthcare Operations', 'Team Leadership',
        'Budget Management', 'Strategic Planning', 'Compliance',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Stakeholder Management',
        'Data Analysis', 'Reporting', 'Quality Improvement',
        'Human Resources', 'Financial Management', 'Healthcare Policy',
        'Change Management', 'Continuous Improvement'
    ],
    'hospital-operations-manager': [
        'Hospital Operations', 'Team Leadership', 'Process Improvement',
        'Budget Management', 'KPI Management', 'Compliance',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Stakeholder Management',
        'Data Analysis', 'Reporting', 'Quality Improvement',
        'Staff Management', 'Resource Planning', 'Risk Management',
        'Continuous Improvement', 'Strategic Planning'
    ],
    'hospital-manager': [
        'Hospital Management', 'Healthcare Operations', 'Team Leadership',
        'Budget Management', 'Strategic Planning', 'Compliance',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Stakeholder Management',
        'Data Analysis', 'Reporting', 'Quality Improvement',
        'Human Resources', 'Financial Management', 'Patient Experience',
        'Change Management', 'Continuous Improvement'
    ],
    'clinic-manager': [
        'Clinic Management', 'Healthcare Operations', 'Team Leadership',
        'Budget Management', 'Scheduling', 'Compliance',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Patient Experience',
        'Data Analysis', 'Reporting', 'Quality Improvement',
        'Staff Management', 'EMR Systems', 'Billing',
        'Customer Service', 'Continuous Improvement'
    ],
    'medical-superintendent': [
        'Medical Administration', 'Hospital Management', 'Team Leadership',
        'Clinical Governance', 'Quality Improvement', 'Compliance',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Strategic Planning',
        'Data Analysis', 'Reporting', 'Patient Safety',
        'Budget Management', 'Healthcare Policy', 'Stakeholder Management',
        'Change Management', 'Continuous Improvement'
    ],

    // ============================================
    // ✅ NEW BATCH 3 — NURSING (15)
    // ============================================
    'nursing-assistant': [
        'Patient Care', 'Vital Signs Monitoring', 'Personal Care',
        'Mobility Assistance', 'Patient Hygiene', 'Meal Assistance',
        'Communication', 'Empathy', 'Team Collaboration',
        'Documentation', 'Patient Safety', 'Infection Control',
        'Time Management', 'Physical Stamina', 'Patient Comfort',
        'Observation', 'Report Writing', 'First Aid',
        'CPR', 'Reliability'
    ],
    'nursing-supervisor': [
        'Nursing Supervision', 'Team Leadership', 'Patient Care',
        'Staff Scheduling', 'Quality Assurance', 'Patient Safety',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Clinical Procedures',
        'Documentation', 'Training', 'Performance Management',
        'Conflict Resolution', 'Compliance', 'EMR Systems',
        'Time Management', 'Continuous Improvement'
    ],
    'nursing-manager': [
        'Nursing Management', 'Team Leadership', 'Nursing Operations',
        'Budget Management', 'Quality Improvement', 'Patient Safety',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Strategic Planning',
        'Staff Management', 'Reporting', 'Compliance',
        'Training', 'Performance Management', 'EMR Systems',
        'Change Management', 'Continuous Improvement'
    ],
    'charge-nurse': [
        'Charge Nurse Duties', 'Team Leadership', 'Patient Care',
        'Staff Scheduling', 'Shift Management', 'Patient Safety',
        'Communication', 'Problem Solving', 'Decision Making',
        'Leadership', 'Team Collaboration', 'Clinical Procedures',
        'Documentation', 'Training', 'Mentoring',
        'Conflict Resolution', 'Compliance', 'EMR Systems',
        'Time Management', 'Continuous Improvement'
    ],
    'staff-nurse': [
        'Patient Care', 'Vital Signs Monitoring', 'Medication Administration',
        'EMR Systems', 'Patient Education', 'Emergency Response',
        'Clinical Assessment', 'Team Collaboration', 'Wound Care',
        'IV Therapy', 'Patient Safety', 'Infection Control',
        'Care Planning', 'Health Assessment', 'Communication',
        'Critical Thinking', 'Time Management', 'Compassion',
        'Documentation', 'Patient Advocacy'
    ],
    'clinical-nurse': [
        'Clinical Nursing', 'Patient Care', 'Vital Signs Monitoring',
        'Medication Administration', 'EMR Systems', 'Patient Education',
        'Clinical Assessment', 'Team Collaboration', 'Wound Care',
        'IV Therapy', 'Patient Safety', 'Infection Control',
        'Care Planning', 'Health Assessment', 'Communication',
        'Critical Thinking', 'Time Management', 'Compassion',
        'Documentation', 'Patient Advocacy'
    ],
    'icu-nurse': [
        'ICU Nursing', 'Critical Care', 'Patient Monitoring',
        'Ventilator Management', 'Medication Administration', 'EMR Systems',
        'Patient Care', 'Emergency Response', 'Clinical Assessment',
        'IV Therapy', 'Patient Safety', 'Infection Control',
        'Care Planning', 'Communication', 'Critical Thinking',
        'Time Management', 'Team Collaboration', 'Documentation',
        'Compassion', 'Continuous Learning'
    ],
    'emergency-nurse': [
        'Emergency Nursing', 'Triage', 'Patient Assessment',
        'Trauma Care', 'CPR', 'Medication Administration',
        'EMR Systems', 'Patient Care', 'Emergency Response',
        'IV Therapy', 'Patient Safety', 'Infection Control',
        'Critical Thinking', 'Team Collaboration', 'Communication',
        'Time Management', 'Documentation', 'Compassion',
        'Stress Management', 'Continuous Learning'
    ],
    'operating-room-nurse': [
        'OR Nursing', 'Surgical Assistance', 'Sterile Technique',
        'Patient Care', 'Surgical Instruments', 'Anesthesia Support',
        'Patient Monitoring', 'EMR Systems', 'Patient Safety',
        'Infection Control', 'Communication', 'Critical Thinking',
        'Team Collaboration', 'Documentation', 'Time Management',
        'Surgical Procedures', 'Emergency Response', 'Compassion',
        'Attention to Detail', 'Continuous Learning'
    ],
    'pediatric-nurse': [
        'Pediatric Nursing', 'Child Care', 'Vital Signs Monitoring',
        'Medication Administration', 'EMR Systems', 'Parent Education',
        'Clinical Assessment', 'Team Collaboration', 'Wound Care',
        'IV Therapy', 'Patient Safety', 'Infection Control',
        'Care Planning', 'Communication', 'Critical Thinking',
        'Time Management', 'Compassion', 'Documentation',
        'Patient Advocacy', 'Continuous Learning'
    ],
    'community-health-nurse': [
        'Community Health', 'Patient Care', 'Health Education',
        'Vaccination', 'Screening', 'Chronic Disease Management',
        'EMR Systems', 'Communication', 'Problem Solving',
        'Patient Advocacy', 'Team Collaboration', 'Time Management',
        'Health Promotion', 'Disease Prevention', 'Home Visits',
        'Documentation', 'Cultural Competence', 'Public Health',
        'Community Outreach', 'Continuous Learning'
    ],
    'nurse-educator': [
        'Nurse Education', 'Teaching', 'Curriculum Development',
        'Clinical Training', 'Student Assessment', 'Mentoring',
        'Communication', 'Presentation Skills', 'Problem Solving',
        'Critical Thinking', 'Team Collaboration', 'Clinical Procedures',
        'Simulation Training', 'Evaluation', 'Documentation',
        'Continuous Learning', 'Research', 'Leadership',
        'Time Management', 'Innovation'
    ],
    'nurse-practitioner': [
        'Advanced Practice Nursing', 'Patient Care', 'Clinical Diagnosis',
        'Treatment Planning', 'Prescriptive Authority', 'EMR Systems',
        'Patient Communication', 'Health Assessment', 'Patient Education',
        'Critical Thinking', 'Team Collaboration', 'Clinical Procedures',
        'Preventive Care', 'Chronic Disease Management', 'Patient Counseling',
        'Documentation', 'Referrals', 'Time Management',
        'Medical Ethics', 'Continuous Learning'
    ],
    'clinical-pharmacist': [
        'Clinical Pharmacy', 'Medication Management', 'Patient Counseling',
        'Drug Interaction Knowledge', 'Pharmacotherapy', 'Patient Care',
        'EMR Systems', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Team Collaboration', 'Medication Therapy Management',
        'Patient Safety', 'Regulatory Compliance', 'Documentation',
        'Health Education', 'Time Management', 'Quality Assurance',
        'Patient Assessment', 'Continuous Learning'
    ],
    'hospital-pharmacist': [
        'Hospital Pharmacy', 'Medication Dispensing', 'Patient Counseling',
        'Drug Interaction Knowledge', 'Pharmacotherapy', 'Patient Care',
        'EMR Systems', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Team Collaboration', 'Medication Therapy Management',
        'Inventory Management', 'Regulatory Compliance', 'Documentation',
        'IV Admixtures', 'Quality Assurance', 'Patient Assessment',
        'Compounding', 'Continuous Learning'
    ],
    'community-pharmacist': [
        'Community Pharmacy', 'Medication Dispensing', 'Patient Counseling',
        'Drug Interaction Knowledge', 'Pharmacotherapy', 'Patient Care',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Medication Therapy Management', 'Immunization',
        'Inventory Management', 'Regulatory Compliance', 'Documentation',
        'Health Education', 'Quality Assurance', 'Patient Assessment',
        'OTC Medications', 'Continuous Learning'
    ],
    'pharmacy-technician': [
        'Pharmacy Support', 'Medication Dispensing', 'Prescription Processing',
        'Inventory Management', 'Patient Service', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Pharmacy Software', 'Regulatory Compliance',
        'Documentation', 'Compounding', 'Customer Service',
        'Insurance Processing', 'Quality Assurance', 'Data Entry',
        'Multitasking', 'Continuous Learning'
    ],
    'pharmacy-assistant': [
        'Pharmacy Support', 'Medication Dispensing', 'Prescription Processing',
        'Inventory Management', 'Patient Service', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Pharmacy Software', 'Regulatory Compliance',
        'Documentation', 'Customer Service', 'Insurance Processing',
        'Data Entry', 'Multitasking', 'Organizational Skills',
        'Reliability', 'Continuous Learning'
    ],
    'occupational-health-nurse': [
        'Occupational Health', 'Employee Wellness', 'Health Screening',
        'Workplace Safety', 'Vaccination', 'Patient Care',
        'EMR Systems', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Team Collaboration', 'Health Education',
        'Injury Management', 'Risk Assessment', 'Documentation',
        'First Aid', 'CPR', 'Ergonomics',
        'Compliance', 'Continuous Learning'
    ],

    // ============================================
    // ✅ NEW BATCH 3 — PUBLIC HEALTH (8)
    // ============================================
    'public-health-specialist': [
        'Public Health', 'Epidemiology', 'Health Education',
        'Disease Prevention', 'Community Health', 'Health Policy',
        'Data Analysis', 'Health Promotion', 'Outbreak Investigation',
        'Vaccination Programs', 'Environmental Health', 'Health Surveillance',
        'Communication', 'Team Collaboration', 'Problem Solving',
        'Public Health Research', 'Health Program Management', 'Biostatistics',
        'Health Communication', 'Community Outreach'
    ],
    'epidemiologist': [
        'Epidemiology', 'Disease Surveillance', 'Outbreak Investigation',
        'Data Analysis', 'Statistics', 'SPSS',
        'R', 'Python', 'Study Design',
        'Public Health', 'Research Methodology', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Team Collaboration',
        'Report Writing', 'Health Policy', 'Biostatistics',
        'Presentation Skills', 'Continuous Learning'
    ],
    'health-educator': [
        'Health Education', 'Health Promotion', 'Curriculum Development',
        'Teaching', 'Community Outreach', 'Communication',
        'Presentation Skills', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Program Planning', 'Evaluation',
        'Materials Development', 'Public Health', 'Behavior Change',
        'Documentation', 'Reporting', 'Cultural Competence',
        'Time Management', 'Continuous Learning'
    ],
    'health-promotion-officer': [
        'Health Promotion', 'Health Education', 'Community Outreach',
        'Program Planning', 'Campaign Management', 'Communication',
        'Presentation Skills', 'Problem Solving', 'Team Collaboration',
        'Public Health', 'Behavior Change', 'Social Marketing',
        'Data Analysis', 'Reporting', 'Evaluation',
        'Materials Development', 'Event Coordination', 'Networking',
        'Time Management', 'Continuous Learning'
    ],
    'health-and-safety-coordinator': [
        'Health and Safety', 'Risk Assessment', 'Safety Training',
        'Incident Investigation', 'Compliance', 'OSHA',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Documentation', 'Reporting', 'First Aid',
        'CPR', 'Emergency Response', 'Safety Audits',
        'MS Office', 'Continuous Learning'
    ],
    'medical-social-worker': [
        'Medical Social Work', 'Patient Advocacy', 'Case Management',
        'Counseling', 'Crisis Intervention', 'Resource Coordination',
        'Communication', 'Empathy', 'Problem Solving',
        'Critical Thinking', 'Team Collaboration', 'Patient Care',
        'Documentation', 'Ethics', 'Cultural Competence',
        'Family Support', 'Discharge Planning', 'Community Resources',
        'Time Management', 'Continuous Learning'
    ],
    'genetic-counselor': [
        'Genetic Counseling', 'Patient Education', 'Risk Assessment',
        'Genetic Testing', 'Family History', 'Communication',
        'Empathy', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Patient Care', 'Documentation',
        'Ethics', 'Confidentiality', 'Counseling',
        'Genetic Disorders', 'Referrals', 'Research',
        'Time Management', 'Continuous Learning'
    ],
    'clinical-psychologist': [
        'Clinical Psychology', 'Psychological Assessment', 'Psychotherapy',
        'Cognitive Behavioral Therapy', 'Mental Health Counseling', 'Patient Care',
        'Communication', 'Empathy', 'Critical Thinking',
        'Team Collaboration', 'Clinical Documentation', 'Treatment Planning',
        'Crisis Intervention', 'Psychological Testing', 'Case Management',
        'Ethics', 'Confidentiality', 'Patient Education',
        'Time Management', 'Continuous Learning'
    ],
    'psychotherapist': [
        'Psychotherapy', 'Cognitive Behavioral Therapy', 'Patient Care',
        'Mental Health Counseling', 'Assessment', 'Treatment Planning',
        'Communication', 'Empathy', 'Active Listening',
        'Critical Thinking', 'Team Collaboration', 'Clinical Documentation',
        'Crisis Intervention', 'Group Therapy', 'Family Therapy',
        'Ethics', 'Confidentiality', 'Patient Education',
        'Time Management', 'Continuous Learning'
    ],
    'counselor': [
        'Counseling', 'Patient Care', 'Mental Health Support',
        'Assessment', 'Treatment Planning', 'Communication',
        'Empathy', 'Active Listening', 'Critical Thinking',
        'Team Collaboration', 'Clinical Documentation', 'Crisis Intervention',
        'Group Counseling', 'Individual Counseling', 'Ethics',
        'Confidentiality', 'Patient Education', 'Referrals',
        'Time Management', 'Continuous Learning'
    ],
    'mental-health-counselor': [
        'Mental Health Counseling', 'Patient Care', 'Assessment',
        'Treatment Planning', 'Psychotherapy', 'Communication',
        'Empathy', 'Active Listening', 'Critical Thinking',
        'Team Collaboration', 'Clinical Documentation', 'Crisis Intervention',
        'Group Counseling', 'Individual Counseling', 'Ethics',
        'Confidentiality', 'Patient Education', 'Referrals',
        'Time Management', 'Continuous Learning'
    ],
    'rehabilitation-counselor': [
        'Rehabilitation Counseling', 'Patient Care', 'Assessment',
        'Treatment Planning', 'Career Counseling', 'Communication',
        'Empathy', 'Active Listening', 'Critical Thinking',
        'Team Collaboration', 'Clinical Documentation', 'Case Management',
        'Disability Support', 'Vocational Rehabilitation', 'Ethics',
        'Confidentiality', 'Patient Education', 'Referrals',
        'Time Management', 'Continuous Learning'
    ],
    'behavioral-therapist': [
        'Behavioral Therapy', 'ABA', 'Patient Care',
        'Behavior Assessment', 'Treatment Planning', 'Communication',
        'Empathy', 'Patience', 'Critical Thinking',
        'Team Collaboration', 'Clinical Documentation', 'Data Collection',
        'Parent Training', 'Autism Spectrum', 'Developmental Disorders',
        'Ethics', 'Confidentiality', 'Progress Monitoring',
        'Time Management', 'Continuous Learning'
    ],
    'speech-language-pathologist': [
        'Speech Therapy', 'Language Therapy', 'Patient Assessment',
        'Articulation Disorders', 'Voice Disorders', 'Fluency Therapy',
        'Neurogenic Disorders', 'Pediatric Therapy', 'Swallowing Disorders',
        'Patient Education', 'AAC Devices', 'Autism Spectrum',
        'Cognitive Communication', 'Treatment Planning', 'Patient Care',
        'Communication', 'Team Collaboration', 'Clinical Documentation',
        'Ethics', 'Continuous Learning'
    ],
    'audiologist': [
        'Audiology', 'Hearing Assessment', 'Hearing Aid Fitting',
        'Patient Care', 'Audiometry', 'Tympanometry',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Patient Education', 'Clinical Documentation',
        'Hearing Rehabilitation', 'Tinnitus Management', 'Balance Assessment',
        'Ethics', 'Patient Counseling', 'Referrals',
        'Time Management', 'Continuous Learning'
    ],
    'audiology-technician': [
        'Audiology Support', 'Hearing Testing', 'Hearing Aid Maintenance',
        'Patient Care', 'Audiometry', 'Equipment Operation',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Team Collaboration', 'Patient Education', 'Documentation',
        'Data Entry', 'Inventory Management', 'Scheduling',
        'Customer Service', 'Multitasking', 'Organizational Skills',
        'Reliability', 'Continuous Learning'
    ],

    // ============================================
    // ✅ NEW BATCH 3 — THERAPY & TECHNICIANS (20)
    // ============================================
    'occupational-therapy-assistant': [
        'Occupational Therapy Support', 'Patient Care', 'Therapeutic Activities',
        'Patient Education', 'Treatment Implementation', 'Communication',
        'Empathy', 'Problem Solving', 'Team Collaboration',
        'Clinical Documentation', 'Patient Assessment', 'Adaptive Equipment',
        'Functional Training', 'Patient Safety', 'Observation',
        'Progress Monitoring', 'Time Management', 'Physical Stamina',
        'Reliability', 'Continuous Learning'
    ],
    'physical-therapy-assistant': [
        'Physical Therapy Support', 'Patient Care', 'Therapeutic Exercises',
        'Patient Education', 'Treatment Implementation', 'Communication',
        'Empathy', 'Problem Solving', 'Team Collaboration',
        'Clinical Documentation', 'Patient Assessment', 'Modalities',
        'Functional Training', 'Gait Training', 'Patient Safety',
        'Progress Monitoring', 'Time Management', 'Physical Stamina',
        'Reliability', 'Continuous Learning'
    ],
    'physiotherapy-assistant': [
        'Physiotherapy Support', 'Patient Care', 'Therapeutic Exercises',
        'Patient Education', 'Treatment Implementation', 'Communication',
        'Empathy', 'Problem Solving', 'Team Collaboration',
        'Clinical Documentation', 'Patient Assessment', 'Modalities',
        'Functional Training', 'Gait Training', 'Patient Safety',
        'Progress Monitoring', 'Time Management', 'Physical Stamina',
        'Reliability', 'Continuous Learning'
    ],
    'respiratory-therapist': [
        'Respiratory Therapy', 'Patient Care', 'Ventilator Management',
        'Oxygen Therapy', 'Pulmonary Function Testing', 'Patient Assessment',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Clinical Documentation', 'Airway Management',
        'CPR', 'Emergency Response', 'Patient Education',
        'Equipment Maintenance', 'Patient Safety', 'Time Management',
        'Attention to Detail', 'Continuous Learning'
    ],
    'respiratory-therapy-technician': [
        'Respiratory Therapy Support', 'Patient Care', 'Oxygen Therapy',
        'Equipment Operation', 'Patient Monitoring', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Clinical Documentation', 'Equipment Maintenance',
        'Patient Safety', 'Infection Control', 'Emergency Response',
        'CPR', 'Patient Education', 'Data Entry',
        'Reliability', 'Continuous Learning'
    ],
    'dialysis-technician': [
        'Dialysis Support', 'Patient Care', 'Hemodialysis',
        'Equipment Operation', 'Patient Monitoring', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Clinical Documentation', 'Infection Control',
        'Patient Safety', 'Vital Signs Monitoring', 'Patient Education',
        'Emergency Response', 'CPR', 'Data Entry',
        'Reliability', 'Continuous Learning'
    ],
    'dialysis-nurse': [
        'Dialysis Nursing', 'Patient Care', 'Hemodialysis',
        'Patient Monitoring', 'Medication Administration', 'EMR Systems',
        'Clinical Assessment', 'Communication', 'Critical Thinking',
        'Team Collaboration', 'Patient Safety', 'Infection Control',
        'Care Planning', 'Patient Education', 'Documentation',
        'Emergency Response', 'Vital Signs Monitoring', 'Compassion',
        'Time Management', 'Continuous Learning'
    ],
    'ecg-technician': [
        'ECG Testing', 'Patient Care', 'Electrocardiography',
        'Equipment Operation', 'Patient Monitoring', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Clinical Documentation', 'Patient Preparation',
        'Data Entry', 'Patient Safety', 'Infection Control',
        'Equipment Maintenance', 'Emergency Response', 'CPR',
        'Reliability', 'Continuous Learning'
    ],
    'eeg-technician': [
        'EEG Testing', 'Patient Care', 'Electroencephalography',
        'Equipment Operation', 'Patient Monitoring', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Clinical Documentation', 'Patient Preparation',
        'Data Entry', 'Patient Safety', 'Infection Control',
        'Equipment Maintenance', 'Emergency Response', 'CPR',
        'Reliability', 'Continuous Learning'
    ],
    'ekg-technician': [
        'EKG Testing', 'Patient Care', 'Electrocardiography',
        'Equipment Operation', 'Patient Monitoring', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Clinical Documentation', 'Patient Preparation',
        'Data Entry', 'Patient Safety', 'Infection Control',
        'Equipment Maintenance', 'Emergency Response', 'CPR',
        'Reliability', 'Continuous Learning'
    ],
    'cardiovascular-technologist': [
        'Cardiovascular Technology', 'Patient Care', 'Cardiac Testing',
        'Echocardiography', 'Stress Testing', 'ECG',
        'Holter Monitoring', 'Patient Monitoring', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Team Collaboration',
        'Clinical Documentation', 'Equipment Operation', 'Patient Safety',
        'Anatomy Knowledge', 'Patient Education', 'Time Management',
        'Attention to Detail', 'Continuous Learning'
    ],
    'cardiac-perfusionist': [
        'Cardiac Perfusion', 'Heart-Lung Machine', 'Patient Care',
        'Cardiac Surgery Support', 'Equipment Operation', 'Patient Monitoring',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Clinical Documentation', 'Patient Safety',
        'Aseptic Technique', 'Emergency Response', 'Anatomy Knowledge',
        'Time Management', 'Attention to Detail', 'Continuous Learning',
        'Stress Management', 'Reliability'
    ],
    'surgical-technologist': [
        'Surgical Technology', 'Sterile Technique', 'Surgical Instruments',
        'Patient Care', 'Operating Room Support', 'Anesthesia Support',
        'Patient Monitoring', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Team Collaboration', 'Clinical Documentation',
        'Patient Safety', 'Infection Control', 'Equipment Operation',
        'Time Management', 'Attention to Detail', 'Emergency Response',
        'Physical Stamina', 'Continuous Learning'
    ],
    'operation-theatre-technician': [
        'OT Technician', 'Sterile Technique', 'Surgical Instruments',
        'Patient Care', 'Operating Room Support', 'Anesthesia Support',
        'Patient Monitoring', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Team Collaboration', 'Clinical Documentation',
        'Patient Safety', 'Infection Control', 'Equipment Operation',
        'Time Management', 'Attention to Detail', 'Emergency Response',
        'Physical Stamina', 'Continuous Learning'
    ],
    'anesthesia-technician': [
        'Anesthesia Support', 'Patient Care', 'Anesthesia Equipment',
        'Patient Monitoring', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Team Collaboration', 'Clinical Documentation',
        'Patient Safety', 'Infection Control', 'Equipment Maintenance',
        'Airway Management', 'Emergency Response', 'CPR',
        'Time Management', 'Attention to Detail', 'Physical Stamina',
        'Reliability', 'Continuous Learning'
    ],
    'medical-imaging-specialist': [
        'Medical Imaging', 'Patient Care', 'X-ray',
        'CT Scanning', 'MRI', 'Ultrasound',
        'Radiation Safety', 'Patient Positioning', 'Image Analysis',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Clinical Documentation', 'Equipment Operation',
        'Patient Safety', 'Anatomy Knowledge', 'Time Management',
        'Attention to Detail', 'Continuous Learning'
    ],
    'mri-technologist': [
        'MRI Technology', 'Patient Care', 'MRI Scanning',
        'Patient Positioning', 'Image Analysis', 'Radiation Safety',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Clinical Documentation', 'Equipment Operation',
        'Patient Safety', 'Anatomy Knowledge', 'Contrast Administration',
        'Time Management', 'Attention to Detail', 'Patient Education',
        'Emergency Response', 'Continuous Learning'
    ],
    'ct-technologist': [
        'CT Technology', 'Patient Care', 'CT Scanning',
        'Patient Positioning', 'Image Analysis', 'Radiation Safety',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Clinical Documentation', 'Equipment Operation',
        'Patient Safety', 'Anatomy Knowledge', 'Contrast Administration',
        'Time Management', 'Attention to Detail', 'Patient Education',
        'Emergency Response', 'Continuous Learning'
    ],
    'ultrasound-technologist': [
        'Ultrasound Technology', 'Patient Care', 'Sonography',
        'Patient Positioning', 'Image Analysis', 'Doppler Studies',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Clinical Documentation', 'Equipment Operation',
        'Patient Safety', 'Anatomy Knowledge', 'Patient Education',
        'Time Management', 'Attention to Detail', 'Emergency Response',
        'Physical Stamina', 'Continuous Learning'
    ],
    'sonographer': [
        'Sonography', 'Patient Care', 'Ultrasound Imaging',
        'Patient Positioning', 'Image Analysis', 'Doppler Studies',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Clinical Documentation', 'Equipment Operation',
        'Patient Safety', 'Anatomy Knowledge', 'Patient Education',
        'Time Management', 'Attention to Detail', 'Emergency Response',
        'Physical Stamina', 'Continuous Learning'
    ],
    'mammography-technologist': [
        'Mammography', 'Patient Care', 'Breast Imaging',
        'Patient Positioning', 'Image Analysis', 'Radiation Safety',
        'Communication', 'Empathy', 'Problem Solving',
        'Critical Thinking', 'Team Collaboration', 'Clinical Documentation',
        'Equipment Operation', 'Patient Safety', 'Anatomy Knowledge',
        'Time Management', 'Attention to Detail', 'Patient Education',
        'Emergency Response', 'Continuous Learning'
    ],
    'nuclear-medicine-technologist': [
        'Nuclear Medicine', 'Patient Care', 'Radiopharmaceuticals',
        'Patient Positioning', 'Image Analysis', 'Radiation Safety',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Clinical Documentation', 'Equipment Operation',
        'Patient Safety', 'Anatomy Knowledge', 'Time Management',
        'Attention to Detail', 'Patient Education', 'Emergency Response',
        'Quality Control', 'Continuous Learning'
    ],
    'radiation-therapist': [
        'Radiation Therapy', 'Patient Care', 'Treatment Planning',
        'Patient Positioning', 'Radiation Safety', 'Linear Accelerator',
        'Communication', 'Empathy', 'Problem Solving',
        'Critical Thinking', 'Team Collaboration', 'Clinical Documentation',
        'Patient Safety', 'Anatomy Knowledge', 'Patient Education',
        'Time Management', 'Attention to Detail', 'Emergency Response',
        'Quality Assurance', 'Continuous Learning'
    ],
    'radiation-therapy-technologist': [
        'Radiation Therapy', 'Patient Care', 'Treatment Delivery',
        'Patient Positioning', 'Radiation Safety', 'Linear Accelerator',
        'Communication', 'Empathy', 'Problem Solving',
        'Critical Thinking', 'Team Collaboration', 'Clinical Documentation',
        'Patient Safety', 'Anatomy Knowledge', 'Patient Education',
        'Time Management', 'Attention to Detail', 'Emergency Response',
        'Quality Assurance', 'Continuous Learning'
    ],
    'medical-laboratory-assistant': [
        'Laboratory Support', 'Sample Preparation', 'Equipment Maintenance',
        'Quality Control', 'Specimen Processing', 'Laboratory Safety',
        'Documentation', 'Inventory Management', 'Data Entry',
        'Hematology', 'Microbiology', 'Clinical Chemistry',
        'Blood Collection', 'Phlebotomy', 'Microscopy',
        'Patient Care', 'Communication', 'Team Collaboration',
        'Infection Control', 'Continuous Learning'
    ],
    'pathology-technician': [
        'Pathology Support', 'Tissue Processing', 'Microscopy',
        'Laboratory Procedures', 'Quality Control', 'Specimen Processing',
        'Documentation', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Laboratory Safety', 'Equipment Maintenance', 'Data Entry',
        'Histology', 'Staining', 'Quality Assurance',
        'Reliability', 'Continuous Learning'
    ],
    'histology-technician': [
        'Histology', 'Tissue Processing', 'Microtomy',
        'Staining', 'Microscopy', 'Laboratory Procedures',
        'Quality Control', 'Documentation', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Laboratory Safety', 'Equipment Maintenance',
        'Data Entry', 'Quality Assurance', 'Immunohistochemistry',
        'Reliability', 'Continuous Learning'
    ],
    'cytology-technician': [
        'Cytology', 'Cell Analysis', 'Microscopy',
        'Specimen Processing', 'Staining', 'Laboratory Procedures',
        'Quality Control', 'Documentation', 'Communication',
        'Problem Solving', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Laboratory Safety', 'Equipment Maintenance',
        'Data Entry', 'Quality Assurance', 'Screening',
        'Reliability', 'Continuous Learning'
    ],
    'phlebotomist': [
        'Phlebotomy', 'Blood Collection', 'Patient Care',
        'Venipuncture', 'Capillary Puncture', 'Specimen Processing',
        'Communication', 'Empathy', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Infection Control', 'Patient Safety', 'Documentation',
        'Data Entry', 'Equipment Maintenance', 'Quality Assurance',
        'Reliability', 'Continuous Learning'
    ],
    'blood-bank-technician': [
        'Blood Bank', 'Blood Typing', 'Crossmatching',
        'Blood Collection', 'Specimen Processing', 'Quality Control',
        'Communication', 'Problem Solving', 'Attention to Detail',
        'Time Management', 'Team Collaboration', 'Laboratory Safety',
        'Documentation', 'Data Entry', 'Inventory Management',
        'Equipment Maintenance', 'Quality Assurance', 'Emergency Response',
        'Reliability', 'Continuous Learning'
    ],
    'clinical-laboratory-scientist': [
        'Clinical Laboratory Science', 'Hematology', 'Microbiology',
        'Clinical Chemistry', 'Immunology', 'Molecular Diagnostics',
        'Quality Control', 'Laboratory Procedures', 'Sample Analysis',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Documentation', 'Data Analysis', 'Equipment Maintenance',
        'Quality Assurance', 'Continuous Learning'
    ],
    'clinical-laboratory-technician': [
        'Clinical Laboratory', 'Hematology', 'Microbiology',
        'Clinical Chemistry', 'Sample Analysis', 'Quality Control',
        'Laboratory Procedures', 'Communication', 'Problem Solving',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Documentation', 'Data Entry', 'Equipment Maintenance',
        'Laboratory Safety', 'Quality Assurance', 'Emergency Testing',
        'Reliability', 'Continuous Learning'
    ],
    'medical-equipment-technician': [
        'Medical Equipment', 'Equipment Maintenance', 'Calibration',
        'Troubleshooting', 'Repair', 'Preventive Maintenance',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Documentation', 'Technical Manuals', 'Electrical Safety',
        'Inventory Management', 'Quality Assurance', 'Reporting',
        'MS Office', 'Continuous Learning'
    ],
    'biomedical-equipment-technician': [
        'Biomedical Equipment', 'Equipment Maintenance', 'Calibration',
        'Troubleshooting', 'Repair', 'Preventive Maintenance',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Documentation', 'Technical Manuals', 'Electrical Safety',
        'Anatomy Knowledge', 'Quality Assurance', 'Reporting',
        'MS Office', 'Continuous Learning'
    ],
    'biomedical-service-engineer': [
        'Biomedical Engineering', 'Equipment Maintenance', 'Calibration',
        'Troubleshooting', 'Repair', 'Preventive Maintenance',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Attention to Detail', 'Time Management', 'Team Collaboration',
        'Documentation', 'Technical Manuals', 'Quality Assurance',
        'Reporting', 'Regulatory Compliance', 'Training',
        'MS Office', 'Continuous Learning'
    ],
    'medical-device-sales-specialist': [
        'Medical Device Sales', 'Product Knowledge', 'Client Relationship',
        'Territory Management', 'Negotiation', 'Communication',
        'Presentation Skills', 'Problem Solving', 'Time Management',
        'CRM', 'Salesforce', 'Reporting',
        'Target Achievement', 'Pipeline Management', 'Healthcare Industry',
        'Regulatory Compliance', 'Customer Service', 'Technical Demonstration',
        'Continuous Learning', 'Networking'
    ],
    'pharmaceutical-researcher': [
        'Pharmaceutical Research', 'Drug Discovery', 'Pharmacology',
        'Clinical Trials', 'Data Analysis', 'Statistics',
        'Python', 'R', 'SPSS',
        'Scientific Writing', 'Literature Review', 'Research Methodology',
        'Communication', 'Problem Solving', 'Critical Thinking',
        'Team Collaboration', 'Regulatory Compliance', 'Grant Writing',
        'Publication', 'Continuous Learning'
    ],
    'pharmaceutical-scientist': [
        'Pharmaceutical Science', 'Drug Development', 'Formulation',
        'Pharmacology', 'Clinical Trials', 'Data Analysis',
        'HPLC', 'Spectroscopy', 'Scientific Writing',
        'Literature Review', 'Research Methodology', 'Communication',
        'Problem Solving', 'Critical Thinking', 'Team Collaboration',
        'Regulatory Compliance', 'GMP', 'Quality Control',
        'Publication', 'Continuous Learning'
    ],
    'pharmacovigilance-specialist': [
        'Pharmacovigilance', 'Adverse Event Reporting', 'Drug Safety',
        'Case Management', 'Regulatory Compliance', 'Data Analysis',
        'Medical Terminology', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Documentation', 'Reporting',
        'MedDRA Coding', 'Signal Detection', 'Risk Management',
        'MS Office', 'Continuous Learning'
    ],
    'regulatory-affairs-specialist': [
        'Regulatory Affairs', 'Regulatory Compliance', 'Submissions',
        'FDA Regulations', 'EMA Regulations', 'Clinical Trials',
        'Documentation', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Reporting', 'Regulatory Research',
        'Quality Assurance', 'Product Registration', 'MS Office',
        'Project Management', 'Continuous Learning'
    ],
    'clinical-data-manager': [
        'Clinical Data Management', 'Data Collection', 'Data Entry',
        'Database Management', 'Clinical Trials', 'GCP',
        'Regulatory Compliance', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Attention to Detail', 'Time Management',
        'Team Collaboration', 'Documentation', 'Reporting',
        'Data Validation', 'MedDRA Coding', 'SQL',
        'MS Office', 'Continuous Learning'
    ],
    'medical-affairs-specialist': [
        'Medical Affairs', 'Medical Science Liaison', 'KOL Management',
        'Medical Education', 'Clinical Research', 'Data Analysis',
        'Communication', 'Presentation Skills', 'Problem Solving',
        'Critical Thinking', 'Team Collaboration', 'Strategic Planning',
        'Regulatory Compliance', 'Medical Writing', 'Publication',
        'MS Office', 'Project Management', 'Networking',
        'Time Management', 'Continuous Learning'
    ]
};