// utils/profession/summaries/templates/medical/technicians.ts
// ============================================
// TECHNICIANS PROFESSIONS TEMPLATES - 2 Professions
// ============================================
// 
// ✅ EXACT COPY from original medical.ts
// ✅ No changes to content
// ✅ Only moved to sub-folder
// 
// Professions: medicalLabTechnologist, radiologyTechnologist
// ============================================

export const TECHNICIANS_TEMPLATES: Record<string, Record<string, string[]>> = {
    // ==========================================
    // MEDICAL LAB TECHNOLOGIST
    // ==========================================
    medicalLabTechnologist: {
        junior: [
    "Medical Laboratory Technologist with {years}+ years of experience supporting accurate diagnostic testing and laboratory operations within healthcare settings. Performs laboratory procedures in areas such as hematology, microbiology and clinical chemistry, prepares and analyzes samples, maintains equipment and follows quality control standards. Documents test results accurately, adheres to safety protocols and collaborates with healthcare professionals to support effective patient diagnosis and care.",

    "Clinical Laboratory Scientist with {years}+ years of experience conducting diagnostic laboratory testing and supporting reliable healthcare outcomes. Performs routine and specialized laboratory procedures, verifies test results, monitors equipment performance and maintains accurate laboratory documentation. Follows established quality assurance practices, applies laboratory safety standards and contributes to efficient diagnostic services through attention to accuracy and continuous improvement."
],
       mid: [
    "Medical Laboratory Technologist with {years}+ years of experience performing advanced diagnostic testing and supporting quality laboratory services within healthcare environments. Handles complex laboratory procedures, analyzes test results, performs equipment troubleshooting and applies quality control practices to ensure accurate reporting. Collaborates with healthcare professionals, follows laboratory standards and contributes to process improvement initiatives that enhance diagnostic accuracy and efficiency.",

    "Clinical Laboratory Technologist with {years}+ years of experience managing specialized laboratory testing, result verification and diagnostic workflow improvement. Performs advanced analyses, evaluates laboratory findings, maintains technical accuracy and supports the implementation of standard laboratory procedures. Works closely with clinical teams, ensures compliance with quality requirements and contributes to reliable patient diagnostic services."
],
        senior: [
    "Senior Medical Laboratory Technologist with {years}+ years of experience providing technical leadership in laboratory medicine and advancing diagnostic service quality. Develops quality management systems, oversees laboratory standards, supports regulatory compliance and drives continuous improvement initiatives to enhance accuracy, efficiency and patient care outcomes. Mentors laboratory professionals, promotes best practices and collaborates with healthcare teams on laboratory development and service improvement strategies.",

    "Director of Laboratory Services with {years}+ years of experience leading laboratory operations, diagnostic quality programs and professional development within healthcare organizations. Oversees laboratory performance, implements evidence-based testing protocols, manages service standards and ensures compliance with safety and regulatory requirements. Builds collaborative relationships with clinical departments, develops high-performing laboratory teams and advances excellence in diagnostic healthcare services."
],
    },

    // ==========================================
    // RADIOLOGY TECHNOLOGIST
    // ==========================================
    radiologyTechnologist: {
       junior: [
    "Radiology Technologist with {years}+ years of experience supporting diagnostic imaging services through accurate image acquisition, patient care and safe equipment operation. Performs imaging procedures including X-ray, CT and MRI, positions patients correctly, prepares examination areas and follows radiation protection standards. Collaborates with radiologists and healthcare teams to produce high-quality diagnostic images while maintaining patient safety and professional clinical standards.",

    "Medical Imaging Technologist with {years}+ years of experience delivering reliable diagnostic imaging support within healthcare environments. Conducts routine imaging examinations, operates radiologic equipment, verifies patient information and ensures proper image processing for clinical interpretation. Maintains equipment standards, follows safety protocols and provides clear patient guidance to support efficient, accurate and patient-centered diagnostic services."
],
        mid: [
    "Radiology Technologist with {years}+ years of experience performing advanced diagnostic imaging procedures and supporting high-quality radiology services. Specializes in modalities such as CT and MRI, manages complex imaging examinations, optimizes image quality and applies radiation safety principles to ensure accurate diagnostic support. Collaborates with radiologists and healthcare professionals, follows imaging protocols and contributes to quality improvement initiatives within diagnostic departments.",

    "Medical Imaging Technologist with {years}+ years of experience handling specialized imaging procedures, clinical workflow improvement and diagnostic imaging quality standards. Performs advanced examinations, evaluates image accuracy, supports protocol implementation and assists in optimizing imaging processes. Works closely with radiology teams, maintains patient safety practices and contributes to efficient, reliable and patient-focused diagnostic services."
],
        senior: [
    "Senior Radiology Technologist with {years}+ years of experience providing technical leadership in medical imaging services and advancing diagnostic imaging quality. Develops imaging protocols, supports quality assurance programs, improves workflow efficiency and promotes radiation safety standards across imaging operations. Mentors radiology professionals, collaborates with radiologists and healthcare leadership and contributes to continuous improvement initiatives that enhance patient care and diagnostic accuracy.",

    "Lead Medical Imaging Technologist with {years}+ years of experience overseeing advanced imaging services, quality improvement initiatives and operational excellence within diagnostic departments. Supports imaging standards, evaluates service performance, implements best practices and ensures compliance with safety and regulatory requirements. Builds collaborative imaging teams, promotes professional development and helps maintain high standards of patient safety, image quality and diagnostic service delivery."
],
    }
};