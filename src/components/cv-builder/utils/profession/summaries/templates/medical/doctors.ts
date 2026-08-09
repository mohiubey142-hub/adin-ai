// utils/profession/summaries/templates/medical/doctors.ts
// ============================================
// DOCTORS PROFESSIONS TEMPLATES - 3 Professions
// ============================================
// 
// Professions: doctor, dentist, pharmacist
// ============================================

export const DOCTORS_TEMPLATES: Record<string, Record<string, string[]>> = {
    // ==========================================
    // DOCTOR
    // ==========================================
    doctor: {
        junior: [
    "Physician with {years}+ years of clinical experience providing patient-centered medical care through comprehensive assessments, diagnosis support and evidence-based treatment approaches. Performs patient evaluations, interprets clinical findings, develops treatment plans and maintains accurate medical documentation. Collaborates with multidisciplinary healthcare teams to deliver safe and effective care while supporting positive patient outcomes and continuous professional development.",

    "Medical Doctor with {years}+ years of experience providing healthcare services in hospital and outpatient settings. Conducts detailed patient assessments, reviews diagnostic results, supports treatment planning and manages clinical records according to medical standards. Communicates effectively with patients and healthcare professionals while delivering compassionate care, promoting preventive health practices and maintaining high standards of clinical service."
],
        mid: [
    "Physician with {years}+ years of experience in {specialty} providing comprehensive medical care through advanced patient assessment, diagnosis and treatment management. Handles complex clinical cases, develops individualized care plans, interprets diagnostic findings and applies evidence-based medical practices to improve patient outcomes. Collaborates with multidisciplinary healthcare teams, supports clinical improvement initiatives and delivers high-quality patient-centered care.",

    "Medical Professional with {years}+ years of experience in {specialty} managing diverse patient conditions and providing effective clinical solutions. Specializes in patient evaluation, preventive care strategies, chronic disease management and treatment optimization. Reviews clinical data, adapts care approaches based on patient needs and collaborates with healthcare professionals to enhance treatment outcomes and maintain excellent standards of medical care."
],
       senior: [
    "Senior Physician with {years}+ years of experience providing clinical leadership, advanced patient care and medical expertise within healthcare environments. Leads evidence-based clinical practices, develops treatment protocols, manages complex medical cases and contributes to initiatives that improve patient safety, care quality and clinical outcomes. Mentors medical professionals, supports clinical education and collaborates with healthcare leadership to enhance standards of medical practice.",

    "Medical Leader with {years}+ years of experience advancing clinical excellence, healthcare quality improvement and patient care innovation. Oversees complex medical services, supports clinical governance initiatives and implements evidence-based approaches that enhance treatment outcomes and healthcare delivery standards. Guides medical teams, contributes to professional development and drives continuous improvement across clinical programs."
],
    },

    // ==========================================
    // DENTIST - ✅ FIXED
    // ==========================================
    dentist: {
        junior: [
    "Dentist with {years}+ years of clinical experience providing comprehensive oral healthcare services through patient assessments, preventive treatments and restorative dental procedures. Performs oral examinations, diagnoses common dental conditions, develops treatment plans and educates patients on oral hygiene practices. Maintains accurate clinical documentation, follows infection control standards and collaborates with dental teams to deliver safe, effective and patient-centered dental care.",

    "General Dentist with {years}+ years of experience delivering quality dental care through routine procedures, oral health evaluations and preventive dentistry services. Conducts dental examinations, supports restorative treatments, provides patient education on oral hygiene and communicates treatment options effectively. Works collaboratively with dental assistants and healthcare professionals while maintaining clinical standards, safety protocols and a positive patient experience."
],
       mid: [
    "Dentist with {years}+ years of experience providing advanced dental care through restorative procedures, treatment planning and comprehensive oral health management. Handles complex cases involving crowns, bridges, cosmetic dentistry and restorative treatments while evaluating patient needs and developing effective care approaches. Applies evidence-based dental practices, maintains high clinical standards and collaborates with dental specialists to improve treatment outcomes.",

    "Dentist with {years}+ years of experience specializing in advanced restorative dentistry, oral health assessment and comprehensive treatment solutions. Manages complex dental cases, performs specialized procedures, evaluates treatment progress and provides patient-focused care strategies. Collaborates with dental professionals, follows clinical protocols and contributes to continuous improvement in dental service quality."
],
        senior: [
    "Senior Dentist with {years}+ years of experience providing clinical leadership in advanced dental care and improving standards of oral healthcare delivery. Develops clinical protocols, oversees quality assurance initiatives, manages complex dental cases and promotes evidence-based treatment practices. Mentors dental professionals, supports continuous improvement and collaborates with practice leadership to enhance patient care quality, safety and overall clinical excellence.",

    "Dental Practice Leader with {years}+ years of experience leading advanced dental services, clinical quality improvement and patient care initiatives. Oversees complex treatment planning, implements best practices, supports professional development and ensures compliance with dental standards and regulatory requirements. Builds collaborative dental teams, improves service delivery processes and fosters a patient-centered environment focused on trust, safety and exceptional oral healthcare outcomes."
],
    },

    // ==========================================
    // PHARMACIST
    // ==========================================
    pharmacist: {
       junior: [
    "Pharmacist with {years}+ years of experience providing safe and effective medication services in community or hospital pharmacy settings. Dispenses prescriptions accurately, reviews medication orders, provides patient counseling and supports medication safety practices. Maintains detailed pharmacy records, monitors potential drug interactions and collaborates with healthcare professionals to ensure appropriate medication use and positive patient outcomes.",

    "Registered Pharmacist with {years}+ years of clinical experience supporting medication management, prescription verification and patient-focused pharmacy care. Performs medication reviews, educates patients on proper medicine use, maintains inventory records and follows regulatory standards for pharmaceutical services. Works closely with healthcare teams to promote safe medication practices, improve treatment adherence and deliver quality pharmacy services."
],
        mid: [
    "Clinical Pharmacist with {years}+ years of experience providing advanced medication management services and supporting optimal pharmacotherapy outcomes. Evaluates medication regimens, reviews drug interactions, develops patient-specific recommendations and collaborates with healthcare providers to improve treatment effectiveness and safety. Applies evidence-based pharmacy practices, supports medication therapy optimization and contributes to quality improvement initiatives within healthcare settings.",

    "Pharmacist with {years}+ years of experience specializing in clinical pharmacy services, medication review and patient care support. Manages complex medication-related cases, analyzes prescriptions, provides drug information to healthcare professionals and supports safe medication practices. Maintains pharmaceutical standards, contributes to clinical decision-making and works collaboratively with medical teams to enhance patient outcomes."
],
        senior: [
    "Director of Pharmacy with {years}+ years of experience providing strategic leadership in pharmaceutical services, medication safety and clinical pharmacy operations. Develops pharmacy policies, oversees quality improvement initiatives, manages service standards and implements evidence-based medication management practices. Leads pharmacy teams, supports regulatory compliance and collaborates with healthcare leadership to improve patient safety, medication outcomes and overall healthcare quality.",

    "Chief Pharmacist with {years}+ years of experience overseeing pharmacy services, clinical governance and professional development within healthcare organizations. Manages pharmacy operations, establishes medication safety frameworks, drives continuous improvement initiatives and ensures compliance with pharmaceutical standards and regulations. Builds high-performing pharmacy teams, mentors pharmacy professionals and advances excellence in medication management and patient care."
],
    }
};