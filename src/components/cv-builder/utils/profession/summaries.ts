// utils/profession/summaries.ts
// ============================================
// PROFESSION SUMMARIES - 80+ Professions
// ============================================

export const getProfessionalSummary = (profession: string, level: string, years: number, title: string, company: string): string => {
    const yearText = years > 0 ? `${years}+ years of experience` : 'proven experience';
    const companyText = company && company !== 'the organization' ? ` at ${company}` : '';

    const summaries: Record<string, Record<string, string[]>> = {
        // ===== DOCTOR =====
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

        // ===== TEACHER =====
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

        // ===== DEVELOPER =====
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

        // ===== BUSINESS =====
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

        // ===== GENERAL =====
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
        },

        // ============================================
        // ===== NEW HEALTHCARE SUMMARIES (9) =====
        // ============================================
        physiotherapist: {
            junior: [
                `Physiotherapist with ${yearText}${companyText}. Dedicated to helping patients recover mobility and improve quality of life through evidence-based rehabilitation. Skilled in manual therapy, exercise prescription, and patient education. Passionate about restoring function and reducing pain.`,
                `Physical therapy professional with ${yearText}${companyText}. Specialized in musculoskeletal and neurological rehabilitation. Committed to delivering patient-centered care and achieving optimal functional outcomes.`
            ],
            mid: [
                `Senior physiotherapist with ${yearText}${companyText}. Expert in developing comprehensive rehabilitation programs for diverse patient populations. Proven ability to lead therapy teams and implement evidence-based protocols improving patient outcomes by 35%.`,
                `Rehabilitation specialist with ${yearText}${companyText}. Specialized in orthopedic and sports rehabilitation. Demonstrated success in mentoring junior therapists and optimizing treatment pathways.`
            ],
            senior: [
                `Lead physiotherapist with ${yearText}${companyText}. Distinguished leader in rehabilitation services, clinical protocol development, and team management. Proven ability to transform therapy departments and achieve exceptional patient outcomes.`,
                `Director of rehabilitation with ${yearText}${companyText}. Expert in strategic planning, quality improvement, and professional development. Demonstrated success in building high-performing therapy teams.`
            ]
        },
        nutritionist: {
            junior: [
                `Nutritionist with ${yearText}${companyText}. Passionate about promoting health through evidence-based nutrition education and counseling. Skilled in developing personalized meal plans and conducting nutritional assessments. Committed to helping clients achieve their health goals.`,
                `Dietetics professional with ${yearText}${companyText}. Specialized in weight management, disease prevention, and nutritional therapy. Dedicated to improving community health through nutrition education.`
            ],
            mid: [
                `Senior nutritionist with ${yearText}${companyText}. Expert in clinical nutrition, program development, and patient education. Proven ability to lead nutrition services and implement health promotion initiatives reaching 1,000+ clients annually.`,
                `Dietitian with ${yearText}${companyText}. Specialized in nutrition therapy for chronic conditions. Demonstrated success in improving patient outcomes through evidence-based interventions.`
            ],
            senior: [
                `Director of nutrition services with ${yearText}${companyText}. Distinguished leader in clinical nutrition, program development, and team management. Proven ability to transform nutrition departments and improve community health outcomes.`,
                `Nutrition leader with ${yearText}${companyText}. Expert in strategic planning, quality improvement, and professional development. Demonstrated success in building high-performing nutrition teams.`
            ]
        },
        medicalLabTechnologist: {
            junior: [
                `Medical laboratory technologist with ${yearText}${companyText}. Skilled in performing diagnostic tests and maintaining laboratory quality standards. Dedicated to accurate results and patient safety. Passionate about contributing to healthcare through precise laboratory analysis.`,
                `Clinical laboratory professional with ${yearText}${companyText}. Specialized in hematology, microbiology, and clinical chemistry. Committed to excellence in laboratory medicine.`
            ],
            mid: [
                `Senior medical laboratory technologist with ${yearText}${companyText}. Expert in laboratory operations, quality management, and team leadership. Proven ability to implement quality systems and improve testing efficiency by 30%.`,
                `Laboratory supervisor with ${yearText}${companyText}. Specialized in molecular diagnostics and laboratory quality assurance. Demonstrated success in achieving accreditation and improving patient care.`
            ],
            senior: [
                `Director of laboratory services with ${yearText}${companyText}. Distinguished leader in laboratory medicine, quality management, and strategic planning. Proven ability to transform laboratory operations and achieve excellence in diagnostic services.`,
                `Laboratory medicine leader with ${yearText}${companyText}. Expert in laboratory management, quality improvement, and professional development. Demonstrated success in building high-performing laboratory teams.`
            ]
        },
        radiologyTechnologist: {
            junior: [
                `Radiology technologist with ${yearText}${companyText}. Skilled in performing diagnostic imaging examinations with precision and patient care. Dedicated to producing high-quality images while ensuring radiation safety. Committed to excellence in medical imaging.`,
                `Medical imaging professional with ${yearText}${companyText}. Specialized in X-ray, CT, and MRI procedures. Passionate about diagnostic accuracy and patient comfort.`
            ],
            mid: [
                `Senior radiology technologist with ${yearText}${companyText}. Expert in advanced imaging techniques, patient positioning, and quality assurance. Proven ability to lead imaging teams and improve diagnostic quality by 35%.`,
                `Radiology supervisor with ${yearText}${companyText}. Specialized in CT, MRI, and interventional radiology. Demonstrated success in optimizing imaging protocols and patient care.`
            ],
            senior: [
                `Director of radiology services with ${yearText}${companyText}. Distinguished leader in medical imaging, quality assurance, and strategic planning. Proven ability to transform radiology departments and achieve excellence in diagnostic services.`,
                `Radiology leader with ${yearText}${companyText}. Expert in imaging operations, quality improvement, and professional development. Demonstrated success in building high-performing imaging teams.`
            ]
        },
        occupationalTherapist: {
            junior: [
                `Occupational therapist with ${yearText}${companyText}. Dedicated to helping individuals achieve independence through meaningful activities. Skilled in functional assessments, treatment planning, and patient education. Committed to improving quality of life through occupational therapy.`,
                `Occupational therapy professional with ${yearText}${companyText}. Specialized in activities of daily living and rehabilitation. Passionate about patient-centered care and functional outcomes.`
            ],
            mid: [
                `Senior occupational therapist with ${yearText}${companyText}. Expert in developing comprehensive rehabilitation programs and leading therapy teams. Proven ability to improve patient functional outcomes by 40% through evidence-based interventions.`,
                `Occupational therapy supervisor with ${yearText}${companyText}. Specialized in neurorehabilitation and pediatric therapy. Demonstrated success in mentoring therapists and optimizing care pathways.`
            ],
            senior: [
                `Director of occupational therapy with ${yearText}${companyText}. Distinguished leader in rehabilitation services, program development, and team management. Proven ability to transform therapy departments and achieve exceptional patient outcomes.`,
                `Occupational therapy leader with ${yearText}${companyText}. Expert in strategic planning, quality improvement, and professional development. Demonstrated success in building high-performing therapy teams.`
            ]
        },
        speechTherapist: {
            junior: [
                `Speech-language pathologist with ${yearText}${companyText}. Dedicated to improving communication and swallowing abilities for individuals of all ages. Skilled in assessment, intervention, and patient education. Committed to helping clients achieve optimal communication.`,
                `Speech therapy professional with ${yearText}${companyText}. Specialized in speech and language disorders. Passionate about evidence-based practice and patient-centered care.`
            ],
            mid: [
                `Senior speech-language pathologist with ${yearText}${companyText}. Expert in diagnosis and treatment of complex communication disorders. Proven ability to lead therapy teams and implement innovative protocols improving patient outcomes by 35%.`,
                `Speech therapy supervisor with ${yearText}${companyText}. Specialized in pediatric and neurogenic disorders. Demonstrated success in mentoring therapists and optimizing treatment pathways.`
            ],
            senior: [
                `Director of speech-language pathology with ${yearText}${companyText}. Distinguished leader in communication disorders, program development, and team management. Proven ability to transform therapy services and achieve exceptional patient outcomes.`,
                `Speech therapy leader with ${yearText}${companyText}. Expert in strategic planning, quality improvement, and professional development. Demonstrated success in building high-performing therapy teams.`
            ]
        },
        optometrist: {
            junior: [
                `Optometrist with ${yearText}${companyText}. Dedicated to providing comprehensive eye care and vision correction. Skilled in eye examinations, diagnosis, and treatment of ocular conditions. Committed to improving vision and eye health for all patients.`,
                `Eye care professional with ${yearText}${companyText}. Specialized in refractive error correction and ocular disease management. Passionate about preventive eye care and patient education.`
            ],
            mid: [
                `Senior optometrist with ${yearText}${companyText}. Expert in diagnosing and managing ocular diseases. Proven ability to lead optometry teams and implement clinical protocols improving patient outcomes by 30%.`,
                `Optometry supervisor with ${yearText}${companyText}. Specialized in contact lens fitting and low vision rehabilitation. Demonstrated success in mentoring junior optometrists.`
            ],
            senior: [
                `Director of optometry with ${yearText}${companyText}. Distinguished leader in eye care, clinical excellence, and practice management. Proven ability to transform optometry practices and achieve exceptional patient care.`,
                `Optometry leader with ${yearText}${companyText}. Expert in strategic planning, quality improvement, and professional development. Demonstrated success in building high-performing eye care teams.`
            ]
        },
        veterinaryDoctor: {
            junior: [
                `Veterinarian with ${yearText}${companyText}. Dedicated to providing compassionate care for animals and promoting animal welfare. Skilled in diagnosis, treatment, and preventive care for diverse species. Committed to excellence in veterinary medicine.`,
                `Veterinary professional with ${yearText}${companyText}. Specialized in small animal medicine and surgery. Passionate about animal health and client education.`
            ],
            mid: [
                `Senior veterinarian with ${yearText}${companyText}. Expert in advanced surgical procedures and complex medical cases. Proven ability to lead veterinary teams and implement clinical protocols improving patient outcomes by 35%.`,
                `Veterinary supervisor with ${yearText}${companyText}. Specialized in emergency medicine and critical care. Demonstrated success in mentoring junior veterinarians.`
            ],
            senior: [
                `Director of veterinary medicine with ${yearText}${companyText}. Distinguished leader in animal healthcare, clinical excellence, and practice management. Proven ability to transform veterinary practices and achieve exceptional patient care.`,
                `Veterinary leader with ${yearText}${companyText}. Expert in strategic planning, quality improvement, and professional development. Demonstrated success in building high-performing veterinary teams.`
            ]
        },
        healthcareAdministrator: {
            junior: [
                `Healthcare administrator with ${yearText}${companyText}. Dedicated to optimizing healthcare operations and improving patient care. Skilled in facility management, staff coordination, and regulatory compliance. Committed to excellence in healthcare administration.`,
                `Healthcare management professional with ${yearText}${companyText}. Specialized in operations, quality improvement, and patient experience. Passionate about efficient healthcare delivery.`
            ],
            mid: [
                `Senior healthcare administrator with ${yearText}${companyText}. Expert in strategic planning, operations management, and quality improvement. Proven ability to lead healthcare teams and implement initiatives improving patient satisfaction by 25%.`,
                `Healthcare operations manager with ${yearText}${companyText}. Specialized in financial management and regulatory compliance. Demonstrated success in optimizing healthcare operations.`
            ],
            senior: [
                `Director of healthcare administration with ${yearText}${companyText}. Distinguished leader in healthcare management, strategic planning, and organizational development. Proven ability to transform healthcare organizations and achieve operational excellence.`,
                `Healthcare executive with ${yearText}${companyText}. Expert in healthcare strategy, quality improvement, and leadership development. Demonstrated success in building high-performing healthcare teams.`
            ]
        },

        // ============================================
        // ===== NEW IT SUMMARIES (5) =====
        // ============================================
        softwareEngineer: {
            junior: [
                `Software engineer with ${yearText}${companyText}. Skilled in designing, developing, and maintaining software solutions. Strong understanding of programming languages and software development methodologies. Committed to writing clean code and delivering quality software.`,
                `Software development professional with ${yearText}${companyText}. Specialized in software design patterns and collaborative development. Passionate about technology and continuous learning.`
            ],
            mid: [
                `Senior software engineer with ${yearText}${companyText}. Expert in architecting scalable systems and optimizing performance. Proven ability to lead engineering teams and deliver complex software solutions on time and within budget.`,
                `Lead software engineer with ${yearText}${companyText}. Specialized in cloud architecture and system integration. Demonstrated success in mentoring junior engineers and improving development processes.`
            ],
            senior: [
                `Principal software engineer with ${yearText}${companyText}. Distinguished technical leader with expertise in system architecture, performance optimization, and engineering excellence. Proven ability to drive technical strategy and organizational transformation.`,
                `Software engineering leader with ${yearText}${companyText}. Expert in technical strategy, team building, and engineering culture. Demonstrated success in delivering complex technical initiatives.`
            ]
        },
        aiResearchEngineer: {
            junior: [
                `AI research engineer with ${yearText}${companyText}. Skilled in machine learning, deep learning, and data science. Passionate about advancing artificial intelligence and solving complex problems. Committed to rigorous research and innovation.`,
                `Artificial intelligence researcher with ${yearText}${companyText}. Specialized in neural networks and natural language processing. Dedicated to pushing the boundaries of AI technology.`
            ],
            mid: [
                `Senior AI research engineer with ${yearText}${companyText}. Expert in developing novel ML architectures and algorithms. Proven ability to lead research projects and transition prototypes to production with measurable impact.`,
                `AI research lead with ${yearText}${companyText}. Specialized in computer vision and reinforcement learning. Demonstrated success in publishing research and collaborating with product teams.`
            ],
            senior: [
                `Principal AI research engineer with ${yearText}${companyText}. Distinguished researcher with expertise in AI innovation, strategy, and team leadership. Proven ability to drive breakthrough AI solutions and organizational transformation.`,
                `AI research director with ${yearText}${companyText}. Expert in research strategy, innovation management, and talent development. Demonstrated success in building world-class AI research teams.`
            ]
        },
        embeddedSystemsEngineer: {
            junior: [
                `Embedded systems engineer with ${yearText}${companyText}. Skilled in firmware development, hardware-software integration, and real-time systems. Dedicated to building reliable and efficient embedded solutions. Passionate about IoT and connected devices.`,
                `Firmware engineer with ${yearText}${companyText}. Specialized in C/C++ programming and microcontrollers. Committed to quality and performance in embedded systems.`
            ],
            mid: [
                `Senior embedded systems engineer with ${yearText}${companyText}. Expert in RTOS, device drivers, and system optimization. Proven ability to lead firmware teams and deliver reliable embedded products on schedule.`,
                `Embedded software lead with ${yearText}${companyText}. Specialized in IoT security and power optimization. Demonstrated success in mentoring junior engineers and improving development processes.`
            ],
            senior: [
                `Principal embedded systems engineer with ${yearText}${companyText}. Distinguished technical leader with expertise in embedded architecture, firmware development, and engineering excellence. Proven ability to drive technical strategy and product innovation.`,
                `Embedded systems director with ${yearText}${companyText}. Expert in technical strategy, team building, and engineering culture. Demonstrated success in building high-performing embedded teams.`
            ]
        },
        databaseAdministrator: {
            junior: [
                `Database administrator with ${yearText}${companyText}. Skilled in database installation, configuration, and maintenance. Dedicated to ensuring data integrity, security, and availability. Committed to continuous learning and database excellence.`,
                `DBA professional with ${yearText}${companyText}. Specialized in SQL Server, Oracle, and PostgreSQL. Passionate about data management and performance optimization.`
            ],
            mid: [
                `Senior database administrator with ${yearText}${companyText}. Expert in database performance tuning, backup/recovery, and high availability. Proven ability to manage enterprise databases and lead DBA teams to achieve 99.99% uptime.`,
                `Database operations lead with ${yearText}${companyText}. Specialized in cloud migration and data security. Demonstrated success in optimizing database operations and mentoring team members.`
            ],
            senior: [
                `Principal database administrator with ${yearText}${companyText}. Distinguished technical leader with expertise in database architecture, performance optimization, and data management. Proven ability to drive data strategy and organizational transformation.`,
                `Database director with ${yearText}${companyText}. Expert in data strategy, team building, and operational excellence. Demonstrated success in building high-performing database teams.`
            ]
        },
        mechatronicsEngineer: {
            junior: [
                `Mechatronics engineer with ${yearText}${companyText}. Skilled in designing integrated mechanical, electrical, and software systems. Passionate about automation, robotics, and smart systems. Committed to innovation and engineering excellence.`,
                `Mechatronic engineering professional with ${yearText}${companyText}. Specialized in system integration and control systems. Dedicated to building intelligent and efficient solutions.`
            ],
            mid: [
                `Senior mechatronics engineer with ${yearText}${companyText}. Expert in automation system design, control algorithms, and robotics integration. Proven ability to lead engineering teams and deliver innovative solutions that increase productivity by 40%.`,
                `Mechatronics lead with ${yearText}${companyText}. Specialized in Industry 4.0 and smart manufacturing. Demonstrated success in mentoring junior engineers and driving engineering excellence.`
            ],
            senior: [
                `Principal mechatronics engineer with ${yearText}${companyText}. Distinguished technical leader with expertise in robotics, automation, and systems integration. Proven ability to drive innovation and organizational transformation.`,
                `Mechatronics director with ${yearText}${companyText}. Expert in technical strategy, team building, and engineering culture. Demonstrated success in building high-performing mechatronics teams.`
            ]
        },

        // ============================================
        // ===== NEW BUSINESS SUMMARIES (6) =====
        // ============================================
        financeAnalyst: {
            junior: [
                `Finance analyst with ${yearText}${companyText}. Skilled in financial modeling, data analysis, and reporting. Dedicated to providing actionable insights for strategic decision-making. Committed to accuracy and analytical excellence.`,
                `Financial analysis professional with ${yearText}${companyText}. Specialized in budgeting, forecasting, and variance analysis. Passionate about driving business performance through data-driven insights.`
            ],
            mid: [
                `Senior finance analyst with ${yearText}${companyText}. Expert in financial modeling, strategic planning, and business analysis. Proven ability to lead financial planning processes and support major investment decisions.`,
                `Finance lead with ${yearText}${companyText}. Specialized in investment analysis and risk management. Demonstrated success in driving business performance and mentoring junior analysts.`
            ],
            senior: [
                `Principal finance analyst with ${yearText}${companyText}. Distinguished finance leader with expertise in strategic planning, business partnership, and organizational transformation. Proven ability to drive business performance and financial excellence.`,
                `Finance director with ${yearText}${companyText}. Expert in financial strategy, team leadership, and business performance. Demonstrated success in building high-performing finance teams.`
            ]
        },
        financialAdvisor: {
            junior: [
                `Financial advisor with ${yearText}${companyText}. Dedicated to helping clients achieve their financial goals through personalized planning and investment guidance. Skilled in wealth management, retirement planning, and portfolio construction.`,
                `Financial planning professional with ${yearText}${companyText}. Specialized in comprehensive wealth management and client relationship building. Committed to fiduciary excellence.`
            ],
            mid: [
                `Senior financial advisor with ${yearText}${companyText}. Expert in wealth management, estate planning, and tax strategies. Proven ability to manage significant client portfolios and lead advisory teams to achieve 95% client retention.`,
                `Wealth management lead with ${yearText}${companyText}. Specialized in high-net-worth client services and investment strategy. Demonstrated success in building client relationships and mentoring junior advisors.`
            ],
            senior: [
                `Principal financial advisor with ${yearText}${companyText}. Distinguished wealth management leader with expertise in strategic planning, practice management, and team development. Proven ability to grow practices and build high-performing teams.`,
                `Wealth management director with ${yearText}${companyText}. Expert in financial strategy, business development, and professional excellence. Demonstrated success in building world-class advisory practices.`
            ]
        },
        supplyChainManager: {
            junior: [
                `Supply chain professional with ${yearText}${companyText}. Skilled in procurement, logistics, and inventory management. Dedicated to optimizing supply chain operations and ensuring efficient delivery. Committed to continuous improvement and operational excellence.`,
                `Supply chain specialist with ${yearText}${companyText}. Specialized in vendor management and demand forecasting. Passionate about building efficient and resilient supply chains.`
            ],
            mid: [
                `Senior supply chain manager with ${yearText}${companyText}. Expert in strategic sourcing, logistics optimization, and supply chain planning. Proven ability to lead supply chain teams and reduce costs by 20% while improving service levels.`,
                `Supply chain lead with ${yearText}${companyText}. Specialized in digital supply chain transformation. Demonstrated success in optimizing operations and mentoring team members.`
            ],
            senior: [
                `Director of supply chain with ${yearText}${companyText}. Distinguished leader with expertise in global supply chain strategy, operations management, and organizational transformation. Proven ability to build resilient and efficient supply chains.`,
                `Supply chain executive with ${yearText}${companyText}. Expert in strategic planning, team building, and operational excellence. Demonstrated success in building high-performing supply chain organizations.`
            ]
        },
        procurementOfficer: {
            junior: [
                `Procurement officer with ${yearText}${companyText}. Skilled in strategic sourcing, vendor management, and contract negotiation. Dedicated to optimizing procurement operations and achieving cost savings. Committed to procurement best practices.`,
                `Sourcing professional with ${yearText}${companyText}. Specialized in supplier evaluation and procurement processes. Passionate about building strong supplier relationships.`
            ],
            mid: [
                `Senior procurement officer with ${yearText}${companyText}. Expert in strategic sourcing, contract negotiation, and supplier relationship management. Proven ability to lead procurement teams and achieve significant cost savings while maintaining quality.`,
                `Procurement lead with ${yearText}${companyText}. Specialized in category management and procurement transformation. Demonstrated success in building supplier relationships and mentoring team members.`
            ],
            senior: [
                `Director of procurement with ${yearText}${companyText}. Distinguished leader with expertise in global sourcing, strategic procurement, and organizational transformation. Proven ability to build world-class procurement organizations.`,
                `Procurement executive with ${yearText}${companyText}. Expert in procurement strategy, team building, and operational excellence. Demonstrated success in achieving exceptional procurement outcomes.`
            ]
        },
        logisticsManager: {
            junior: [
                `Logistics professional with ${yearText}${companyText}. Skilled in transportation management, warehouse operations, and distribution planning. Dedicated to ensuring efficient and timely delivery. Committed to operational excellence and customer satisfaction.`,
                `Logistics specialist with ${yearText}${companyText}. Specialized in route optimization and supply chain coordination. Passionate about building efficient logistics networks.`
            ],
            mid: [
                `Senior logistics manager with ${yearText}${companyText}. Expert in distribution network optimization, transportation management, and warehouse operations. Proven ability to lead logistics teams and reduce costs by 18% while improving delivery performance.`,
                `Logistics lead with ${yearText}${companyText}. Specialized in 3PL management and performance optimization. Demonstrated success in streamlining operations and mentoring team members.`
            ],
            senior: [
                `Director of logistics with ${yearText}${companyText}. Distinguished leader with expertise in global logistics strategy, operations management, and organizational transformation. Proven ability to build efficient and customer-centric logistics organizations.`,
                `Logistics executive with ${yearText}${companyText}. Expert in strategic planning, team building, and operational excellence. Demonstrated success in building world-class logistics capabilities.`
            ]
        },
        businessDevelopmentExecutive: {
            junior: [
                `Business development professional with ${yearText}${companyText}. Skilled in lead generation, relationship building, and market analysis. Dedicated to driving business growth and expanding market presence. Committed to sales excellence and strategic partnership.`,
                `BD specialist with ${yearText}${companyText}. Specialized in business planning and client acquisition. Passionate about building strategic business relationships.`
            ],
            mid: [
                `Senior business development executive with ${yearText}${companyText}. Expert in strategic sales, market expansion, and partnership development. Proven ability to lead business development teams and generate significant revenue growth of 30%+ annually.`,
                `BD lead with ${yearText}${companyText}. Specialized in market strategy and high-value negotiation. Demonstrated success in building strategic partnerships and mentoring team members.`
            ],
            senior: [
                `Director of business development with ${yearText}${companyText}. Distinguished leader with expertise in market strategy, business growth, and organizational transformation. Proven ability to build high-performing business development organizations.`,
                `BD executive with ${yearText}${companyText}. Expert in strategic planning, team building, and market expansion. Demonstrated success in driving exceptional business growth.`
            ]
        },

        // ============================================
        // ===== NEW ENGINEERING SUMMARIES (2) =====
        // ============================================
        automobileEngineer: {
            junior: [
                `Automobile engineer with ${yearText}${companyText}. Skilled in vehicle design, development, and testing. Passionate about automotive innovation and engineering excellence. Committed to building safe, efficient, and sustainable vehicles.`,
                `Automotive engineering professional with ${yearText}${companyText}. Specialized in vehicle dynamics and powertrain systems. Dedicated to advancing automotive technology.`
            ],
            mid: [
                `Senior automobile engineer with ${yearText}${companyText}. Expert in vehicle systems integration, performance optimization, and project leadership. Proven ability to lead engineering teams and deliver vehicle programs on schedule and budget.`,
                `Automotive lead with ${yearText}${companyText}. Specialized in electric vehicle technology and product development. Demonstrated success in mentoring junior engineers and driving engineering excellence.`
            ],
            senior: [
                `Principal automobile engineer with ${yearText}${companyText}. Distinguished technical leader with expertise in vehicle engineering, innovation, and team leadership. Proven ability to drive automotive innovation and organizational transformation.`,
                `Automotive director with ${yearText}${companyText}. Expert in engineering strategy, team building, and product development. Demonstrated success in building world-class engineering teams.`
            ]
        },
        miningEngineer: {
            junior: [
                `Mining engineer with ${yearText}${companyText}. Skilled in mine planning, operations, and safety management. Dedicated to efficient and responsible mineral extraction. Committed to operational excellence and continuous improvement.`,
                `Mining engineering professional with ${yearText}${companyText}. Specialized in mine design and resource estimation. Passionate about sustainable mining practices.`
            ],
            mid: [
                `Senior mining engineer with ${yearText}${companyText}. Expert in mine operations, safety management, and project leadership. Proven ability to lead mining teams and improve productivity by 25% while ensuring safety compliance.`,
                `Mining lead with ${yearText}${companyText}. Specialized in mine optimization and resource management. Demonstrated success in improving operational efficiency and mentoring team members.`
            ],
            senior: [
                `Principal mining engineer with ${yearText}${companyText}. Distinguished technical leader with expertise in mine planning, operations strategy, and team leadership. Proven ability to drive mining excellence and organizational transformation.`,
                `Mining director with ${yearText}${companyText}. Expert in strategic planning, team building, and operational excellence. Demonstrated success in building high-performing mining organizations.`
            ]
        },

        // ============================================
        // ===== NEW SALES & MARKETING SUMMARY (1) =====
        // ============================================
        customerSupportSpecialist: {
            junior: [
                `Customer support specialist with ${yearText}${companyText}. Skilled in problem-solving, communication, and customer relationship management. Dedicated to providing exceptional service and resolving issues with empathy and efficiency.`,
                `Customer service professional with ${yearText}${companyText}. Specialized in technical support and issue resolution. Committed to delivering outstanding customer experiences.`
            ],
            mid: [
                `Senior customer support specialist with ${yearText}${companyText}. Expert in customer service excellence, team leadership, and process improvement. Proven ability to lead support teams and achieve high customer satisfaction scores of 95%+.`,
                `Support lead with ${yearText}${companyText}. Specialized in customer experience optimization and knowledge management. Demonstrated success in building high-performing support teams.`
            ],
            senior: [
                `Director of customer support with ${yearText}${companyText}. Distinguished leader with expertise in customer experience strategy, operations management, and organizational transformation. Proven ability to build world-class customer support organizations.`,
                `Customer support executive with ${yearText}${companyText}. Expert in strategic planning, team building, and customer excellence. Demonstrated success in delivering exceptional customer experiences.`
            ]
        }
    };
    
    const levelKey = level === 'director' || level === 'manager' ? 'senior' : level;
    const professionSummaries = summaries[profession] || summaries.general;
    const levelSummaries = professionSummaries[levelKey as keyof typeof professionSummaries] || professionSummaries.mid || professionSummaries.junior;
    
    const selectedSummary = levelSummaries[Math.floor(Math.random() * levelSummaries.length)];
    
    return selectedSummary;
};