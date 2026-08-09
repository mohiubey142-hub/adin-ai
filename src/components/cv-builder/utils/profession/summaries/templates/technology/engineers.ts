// utils/profession/summaries/templates/technology/engineers.ts
// ============================================
// ENGINEERS PROFESSIONS TEMPLATES - 3 Professions
// ============================================
//
// Professions: aiResearchEngineer, embeddedSystemsEngineer, mechatronicsEngineer
// ============================================

export const ENGINEERS_TEMPLATES: Record<string, Record<string, string[]>> = {
    // ==========================================
    // AI RESEARCH ENGINEER
    // ==========================================
    aiResearchEngineer: {
        junior: [
            "AI Research Engineer with {years}+ years of experience building machine learning models and translating research papers into working code. Implements neural network architectures in PyTorch and TensorFlow, cleans and preprocesses large-scale datasets, and runs systematic model evaluations using cross-validation and ablation studies. Reviews relevant literature, reproduces published results, and works closely with research teams to apply findings to real-world problems.",
            "AI Research Engineer with {years}+ years of experience supporting model development and experimental research in machine learning. Builds and trains neural network architectures such as CNNs, Transformers, and RNNs, tunes hyperparameters through Bayesian optimization, and analyzes results with careful statistical review. Develops data processing pipelines, documents findings clearly, and contributes to projects spanning computer vision, NLP, and reinforcement learning."
        ],
        mid: [
            "AI Research Engineer with {years}+ years of experience designing novel ML architectures and improving model performance through independent research. Designs rigorous experiments with proper controls and baselines, builds and refines algorithms, and troubleshoots complex training and evaluation issues. Reviews technical papers, coordinates with product teams, and helps transition research prototypes into production-ready systems.",
            "AI Research Engineer with {years}+ years of experience in deep learning and applied AI research across computer vision, natural language processing, or reinforcement learning. Builds and evaluates models with strong attention to experimental rigor, contributes to publications and open-source projects, and presents findings at technical conferences. Works cross-functionally with engineering and product teams to bring research into deployable solutions."
        ],
        senior: [
            "Senior AI Research Engineer with {years}+ years of experience architecting machine learning systems and leading research initiatives from prototype to production. Designs scalable experimentation frameworks, implements robust evaluation methodologies, and optimizes model performance for real-world deployment. Mentors junior researchers, collaborates with product teams on feature development, and contributes to architectural decisions that balance research innovation with production stability.",
            "Senior AI Research Engineer with {years}+ years of experience driving applied machine learning projects across computer vision, NLP, and reinforcement learning. Leads technical design reviews, establishes best practices for model validation and reproducibility, and improves model inference efficiency and monitoring systems. Reviews research papers, mentors team members, and collaborates with engineering teams to ensure smooth integration of research models into production environments."
        ]
    },

    // ==========================================
    // EMBEDDED SYSTEMS ENGINEER
    // ==========================================
    embeddedSystemsEngineer: {
        junior: [
            "Embedded Systems Engineer with {years}+ years of experience writing firmware for microcontrollers and embedded platforms in C and C++. Implements device drivers for I2C, SPI, UART, and CAN protocols, builds real-time applications, and debugs hardware-software issues using logic analyzers and oscilloscopes. Follows hardware design specifications, supports system integration efforts, and assists with board bring-up.",
            "Embedded Systems Engineer with {years}+ years of experience developing embedded software for consumer and industrial products. Builds RTOS-based applications using FreeRTOS or Zephyr, configures communication protocols, and implements secure bootloaders. Works alongside hardware engineers during board bring-up and validation, maintains a version-controlled codebase, and runs unit tests on target hardware."
        ],
        mid: [
            "Embedded Systems Engineer with {years}+ years of experience designing firmware for complex, resource-constrained embedded products. Designs low-level device drivers, implements security features such as secure boot and encryption, and optimizes code for power efficiency and memory usage. Conducts thorough code reviews, ensures compliance with safety standards such as ISO 26262 and IEC 61508, and carries firmware development from requirements through to production release.",
            "Embedded Systems Engineer with {years}+ years of experience in RTOS development, system integration, and production bring-up for connected devices. Specializes in IoT security, wireless protocols such as BLE, Zigbee, and LoRa, and power optimization techniques including sleep modes. Coordinates firmware releases, performs comprehensive system testing, and works with certification bodies to support regulatory approval. Contributes to ongoing improvements in development processes and tooling."
        ],
        senior: [
            "Senior Embedded Systems Engineer with {years}+ years of experience architecting firmware solutions for complex, resource-constrained embedded systems. Designs modular, maintainable firmware architectures, optimizes real-time performance and power consumption, and implements robust error handling and recovery mechanisms. Mentors junior engineers, conducts thorough code reviews, and collaborates with hardware and product teams on system-level decisions and trade-offs.",
            "Senior Embedded Systems Engineer with {years}+ years of experience leading firmware development for connected devices and safety-critical systems. Improves system reliability through comprehensive testing strategies, implements security best practices for firmware updates and communication, and optimizes memory usage and boot times. Reviews technical designs, provides technical guidance to team members, and collaborates with infrastructure teams on deployment and monitoring tooling."
        ]
    },

    // ==========================================
    // MECHATRONICS ENGINEER
    // ==========================================
    mechatronicsEngineer: {
        junior: [
            "Mechatronics Engineer with {years}+ years of experience integrating mechanical, electrical, and software systems in automation and robotics. Builds control systems using PLCs such as Siemens and Allen-Bradley or microcontrollers, develops automation logic, and tests electromechanical components for performance and reliability. Uses CAD software such as SolidWorks and AutoCAD for mechanical design and collaborates with multidisciplinary teams on system integration.",
            "Mechatronics Engineer with {years}+ years of experience in industrial automation, robotics, and control systems for manufacturing environments. Develops control algorithms including PID controllers, helps select sensors and actuators, and programs embedded controllers for precision motion control. Performs system integration, conducts performance testing, and troubleshoots electromechanical issues methodically. Supports prototype development and contributes to manufacturing handoff."
        ],
        mid: [
            "Mechatronics Engineer with {years}+ years of experience designing complex electromechanical systems for industrial and robotics applications. Develops control architectures including cascade and feedforward control, optimizes system performance through careful tuning, and ensures reliability through FMEA testing. Conducts detailed design reviews, manages technical deliverables, and collaborates with manufacturing and quality teams on product deployment.",
            "Mechatronics Engineer with {years}+ years of experience in robotics, industrial automation, and advanced manufacturing systems. Specializes in Industry 4.0 solutions, integration of collaborative robots, and smart manufacturing systems with IoT connectivity. Coordinates technical projects, explores new automation technologies, and improves system efficiency through data-driven optimization. Works closely with engineers on control system design and best practices."
        ],
        senior: [
            "Senior Mechatronics Engineer with {years}+ years of experience architecting electromechanical systems for industrial automation and robotics platforms. Designs robust control architectures, optimizes system performance through advanced tuning and simulation, and improves reliability through rigorous testing and failure analysis. Mentors engineering teams, reviews technical designs, and collaborates with manufacturing partners on production-scale implementation.",
            "Senior Mechatronics Engineer with {years}+ years of experience leading the development of complex automation systems and robotic applications. Improves system efficiency through data-driven optimization, implements safety and compliance standards, and designs scalable control solutions for manufacturing environments. Provides technical guidance to cross-functional teams, conducts design reviews, and collaborates with product management on system requirements and integration."
        ]
    }
};