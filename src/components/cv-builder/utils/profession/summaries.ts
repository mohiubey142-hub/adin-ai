// utils/profession/summaries.ts
// ============================================
// PROFESSION SUMMARIES - 60+ Professions
// ============================================

export const getProfessionalSummary = (profession: string, level: string, years: number, title: string, company: string): string => {
    const yearText = years > 0 ? `${years}+ years of experience` : 'proven experience';
    const companyText = company && company !== 'the organization' ? ` at ${company}` : '';

    const summaries: Record<string, Record<string, string[]>> = {
        doctor: {
            junior: [
                `Medical professional with ${yearText}${companyText}. Focused on patient-centered care and clinical excellence. Demonstrated ability to manage diverse medical cases while maintaining high standards of treatment quality and patient safety. Dedicated to evidence-based practice and lifelong learning.`,
                `Healthcare provider with ${yearText}${companyText}. Specializing in comprehensive patient assessment, treatment planning, and follow-up care. Committed to improving health outcomes through compassionate service and clinical best practices.`
            ],
            mid: [
                `Physician with ${yearText}${companyText}. Expert in managing complex medical cases, developing treatment protocols, and leading patient care teams. Proven track record of improving patient satisfaction and clinical outcomes through quality initiatives.`,
                `Medical professional with ${yearText}${companyText}. Specialized in preventive medicine, chronic disease management, and clinical leadership. Demonstrated success in optimizing patient care pathways and enhancing treatment effectiveness.`
            ],
            senior: [
                `Senior physician with ${yearText}${companyText}. Distinguished leader in clinical management, protocol development, and healthcare operations. Proven ability to reduce readmission rates and improve patient outcomes through strategic quality initiatives.`,
                `Medical leader with ${yearText}${companyText}. Expert in clinical governance, staff mentoring, and healthcare transformation. Demonstrated success in driving operational excellence and delivering superior patient care.`
            ]
        },
        teacher: {
            junior: [
                `Educator with ${yearText}${companyText}. Focused on creating engaging learning experiences and fostering student success. Adept at curriculum delivery, student assessment, and inclusive teaching practices. Committed to educational excellence and continuous professional growth.`,
                `Teacher with ${yearText}${companyText}. Specializing in differentiated instruction, classroom management, and academic support. Dedicated to helping students reach their full potential through personalized learning approaches.`
            ],
            mid: [
                `Experienced teacher with ${yearText}${companyText}. Expert in curriculum development, instructional leadership, and student achievement. Successfully implemented innovative teaching strategies that improved learning outcomes and student engagement.`,
                `Education professional with ${yearText}${companyText}. Specialized in teacher mentoring, assessment design, and data-driven instruction. Proven ability to enhance educational quality and drive student success.`
            ],
            senior: [
                `Senior educator with ${yearText}${companyText}. Distinguished leader in curriculum innovation, academic administration, and teacher development. Designed and implemented frameworks that significantly improved student performance and graduation rates.`,
                `Education leader with ${yearText}${companyText}. Expert in strategic educational planning, faculty development, and institutional excellence. Demonstrated success in transforming academic programs and achieving outstanding student outcomes.`
            ]
        },
        developer: {
            junior: [
                `Software developer with ${yearText}${companyText}. Focused on writing clean, efficient code and delivering high-quality software solutions. Collaborative team player with a passion for learning new technologies and best practices.`,
                `Developer with ${yearText}${companyText}. Specializing in frontend development, testing, and version control. Committed to creating intuitive user experiences and maintaining code quality standards.`
            ],
            mid: [
                `Senior developer with ${yearText}${companyText}. Expert in system architecture, API design, and performance optimization. Proven ability to lead feature development and deliver scalable technical solutions.`,
                `Software engineer with ${yearText}${companyText}. Specialized in full-stack development, database optimization, and CI/CD pipelines. Demonstrated success in mentoring teams and improving system reliability.`
            ],
            senior: [
                `Lead engineer with ${yearText}${companyText}. Distinguished technical leader with expertise in microservices, cloud computing, and distributed systems. Proven ability to scale platforms and drive engineering excellence.`,
                `Senior engineering leader with ${yearText}${companyText}. Expert in technical strategy, team building, and engineering culture. Demonstrated success in delivering complex technical initiatives and organizational transformation.`
            ]
        },
        business: {
            junior: [
                `Business professional with ${yearText}${companyText}. Focused on driving operational efficiency and supporting strategic initiatives. Strong analytical skills with a collaborative approach to problem-solving and stakeholder engagement.`,
                `Business administrator with ${yearText}${companyText}. Specializing in project coordination, data analysis, and process improvement. Committed to delivering value through effective business operations.`
            ],
            mid: [
                `Business manager with ${yearText}${companyText}. Expert in strategic planning, team leadership, and business development. Proven ability to drive revenue growth and optimize operational performance.`,
                `Business leader with ${yearText}${companyText}. Specialized in operations management, client relationships, and process optimization. Demonstrated success in achieving business objectives and exceeding performance targets.`
            ],
            senior: [
                `Senior business leader with ${yearText}${companyText}. Distinguished executive with expertise in P&L management, organizational transformation, and market expansion. Proven ability to drive strategic growth and build high-performance organizations.`,
                `Business executive with ${yearText}${companyText}. Expert in corporate strategy, business development, and stakeholder management. Demonstrated success in leading complex business transformations and achieving exceptional results.`
            ]
        },
        general: {
            junior: [
                `Professional with ${yearText}${companyText}. Strong team collaboration and project coordination capabilities. Committed to delivering quality results and contributing to organizational success through effective communication and problem-solving.`,
                `Team member with ${yearText}${companyText}. Focused on operational excellence and continuous improvement. Dedicated to learning and professional development while supporting team objectives.`
            ],
            mid: [
                `Experienced professional with ${yearText}${companyText}. Proven ability to lead initiatives, improve processes, and mentor team members. Expert in stakeholder engagement and project delivery with a focus on operational excellence.`,
                `Project lead with ${yearText}${companyText}. Specialized in strategic planning, process improvement, and team development. Demonstrated success in delivering results and exceeding performance expectations.`
            ],
            senior: [
                `Senior leader with ${yearText}${companyText}. Distinguished executive with expertise in strategic planning, organizational development, and team building. Proven ability to drive growth and deliver sustainable business results.`,
                `Executive leader with ${yearText}${companyText}. Expert in business transformation, operational excellence, and leadership development. Demonstrated success in building high-performance organizations and achieving strategic objectives.`
            ]
        }
    };
    
    const levelKey = level === 'director' || level === 'manager' ? 'senior' : level;
    const professionSummaries = summaries[profession] || summaries.general;
    const levelSummaries = professionSummaries[levelKey as keyof typeof professionSummaries] || professionSummaries.mid || professionSummaries.junior;
    
    const selectedSummary = levelSummaries[Math.floor(Math.random() * levelSummaries.length)];
    
    return selectedSummary;
};