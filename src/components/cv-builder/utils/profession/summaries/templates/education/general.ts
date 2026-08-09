// utils/profession/summaries/templates/education/general.ts
// ============================================
// GENERAL EDUCATION PROFESSIONS TEMPLATES - 2 Professions
// ============================================
// 
// ✅ EXACT COPY from original education.ts
// ✅ No changes to content
// ✅ Only moved to sub-folder
// 
// Professions: teacher, professor
// ============================================

export const GENERAL_TEMPLATES: Record<string, Record<string, string[]>> = {
  // ==========================================
// TEACHER
// ==========================================
teacher: {
    junior: [
        "Teacher with {years}+ years of experience delivering engaging classroom instruction and supporting student learning across diverse educational settings. Plans and delivers curriculum-aligned lessons, applies effective classroom management strategies and evaluates student progress through fair and consistent assessment practices. Adapts teaching methods to meet diverse learning needs, provides regular academic guidance and constructive feedback and collaborates with colleagues and parents to create a positive, inclusive and supportive learning environment.",

        "Teacher with {years}+ years of experience fostering student engagement and academic development through effective classroom instruction. Develops structured lesson plans, creates interactive learning activities and monitors student performance using a variety of assessment methods. Encourages critical thinking, supports individual learning needs and works closely with school staff and families to strengthen educational outcomes and student success."
    ],

    mid: [
        "Teacher with {years}+ years of experience improving student achievement through effective instruction, curriculum planning and evidence-based teaching practices. Designs engaging learning experiences, analyzes assessment data to refine teaching strategies and mentors new teachers in lesson planning and classroom management. Collaborates with school leadership on curriculum development, student support initiatives and continuous improvement efforts that enhance overall educational quality.",

        "Teacher with {years}+ years of experience supporting curriculum development and improving educational outcomes through student-centered teaching practices. Implements differentiated instruction, evaluates academic performance and develops strategies to improve student engagement and achievement. Works collaboratively with colleagues, parents and school administrators to strengthen instructional quality, enhance learning experiences and support long-term academic success."
    ],

    senior: [
        "Teacher with {years}+ years of experience providing instructional leadership and advancing teaching excellence across educational institutions. Leads curriculum improvement initiatives, mentors teaching staff and promotes evidence-based instructional practices to improve student achievement and classroom effectiveness. Collaborates with school leadership on academic planning, professional development programs and quality improvement initiatives that strengthen educational standards and institutional success.",

        "Teacher with {years}+ years of experience leading educational improvement through curriculum innovation, teacher mentoring and academic leadership. Oversees instructional best practices, supports faculty development and contributes to school-wide planning, assessment and policy implementation. Builds collaborative learning environments, drives continuous instructional improvement and helps create sustainable strategies that promote student achievement and long-term educational excellence."
    ]
},

    // ==========================================
    // PROFESSOR
    // ==========================================
   professor: {
    junior: [
        "Professor with {years}+ years of experience delivering higher education courses and supporting student learning in academic environments. Delivers engaging lectures, facilitates interactive seminars and develops well-structured course materials aligned with institutional and accreditation standards. Advises undergraduate students on academic progression, evaluates learning outcomes through fair assessment practices and contributes to curriculum improvement while collaborating with faculty members to create an engaging learning environment.",
        "Professor with {years}+ years of experience teaching at the university level and supporting academic excellence through effective classroom instruction. Designs course syllabi, prepares learning materials and assesses student performance using clear evaluation criteria. Encourages critical thinking, provides regular academic guidance and feedback and participates in departmental activities that strengthen teaching quality and student success."
    ],

    mid: [
        "Professor with {years}+ years of experience delivering higher education programs while balancing teaching, research and academic service responsibilities. Develops innovative course content, supervises undergraduate and graduate research projects and applies evidence-based teaching practices to improve learning outcomes. Collaborates with faculty members on curriculum development, contributes to scholarly publications and participates in departmental planning and quality assurance initiatives.",
        "Professor with {years}+ years of experience improving academic programs through effective teaching, research and curriculum development. Designs engaging learning experiences, mentors student research, evaluates academic outcomes and contributes to research publications and academic conferences. Works closely with faculty colleagues to strengthen academic standards and enhance program quality across the department."
    ],

    senior: [
        "Professor with {years}+ years of experience providing academic leadership across teaching, research and curriculum development in higher education. Leads curriculum enhancement initiatives, mentors faculty members and supervises advanced student research while maintaining an active record of scholarly publications. Collaborates with academic leadership on program quality, accreditation activities and strategic initiatives that strengthen institutional excellence.",
        "Professor with {years}+ years of experience advancing teaching excellence, research impact and academic program development within higher education institutions. Oversees curriculum innovation, mentors early-career faculty and supports university research initiatives through collaboration and scholarly leadership. Contributes to institutional planning, academic governance and cross-disciplinary partnerships that enhance educational quality and long-term academic success."
    ]
} 
};