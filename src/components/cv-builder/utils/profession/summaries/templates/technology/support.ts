// utils/profession/summaries/templates/technology/support.ts
// ============================================
// SUPPORT PROFESSIONS TEMPLATES - 3 Professions
// ============================================
// 
// Professions: itSupport, productManager, gameDeveloper
// ============================================

export const SUPPORT_TEMPLATES: Record<string, Record<string, string[]>> = {
    // ==========================================
    // IT SUPPORT ENGINEER
    // ==========================================
    itSupport: {
        junior: [
            "IT Support Engineer with {years}+ years of experience providing desktop, network, and application support in fast-paced business environments. Troubleshoots hardware and software issues, manages tickets through helpdesk systems, and maintains accurate records of IT assets. Sets up user accounts in Active Directory and Azure AD, supports multi-factor authentication rollouts, and helps ensure regular data backups. Responds to service requests within SLA targets and communicates clearly with end users to resolve issues efficiently.",
            "IT Support Engineer with {years}+ years of experience delivering helpdesk and technical support services to end users. Diagnoses and resolves issues involving workstations, printers, network connectivity, and peripheral devices. Configures Office 365 and email accounts, follows established IT policies, and keeps documentation current. Escalates complex problems to senior staff and contributes updates to the internal knowledge base."
        ],
        mid: [
            "IT Support Engineer with {years}+ years of experience managing service delivery and technical support across multi-site enterprise environments. Implements and maintains endpoint management tools such as SCCM and Intune, coordinates system upgrades and security compliance efforts, and tracks performance against KPIs to improve response times. Resolves complex technical issues independently and recommends process improvements to enhance service delivery.",
            "IT Support Engineer with {years}+ years of experience in network administration and infrastructure support for enterprise operations. Configures and maintains network switches and firewalls, applies security hardening best practices, and contributes to business continuity and disaster recovery planning. Collaborates with vendors on service agreements and troubleshoots complex cross-system issues to maintain operational stability."
        ],
       senior: [
    "Senior IT Support Engineer with {years}+ years of experience architecting and optimizing enterprise IT support frameworks across global operations. Leads technical troubleshooting for complex infrastructure issues, establishes incident response procedures and drives automation initiatives to improve system reliability. Mentors support teams on advanced diagnostics while collaborating with security and network engineers to enhance operational stability.",
    "Senior IT Support Engineer with {years}+ years of experience supporting enterprise IT operations and improving infrastructure reliability across complex environments. Develops and implements endpoint management strategies, leads system migration initiatives and enhances monitoring capabilities for distributed systems. Partners with engineering and infrastructure teams to resolve complex technical challenges and maintains documentation for critical systems and operational processes."
]
    },

    // ==========================================
    // PRODUCT MANAGER
    // ==========================================
    productManager: {
        junior: [
    "Junior Product Manager with {years}+ years of experience supporting feature development from concept through launch. Conducts user research through surveys and interviews, documents requirements using user stories and acceptance criteria and helps create product roadmaps aligned with business goals. Collaborates with engineering, design and QA teams to support product releases and uses analytics to track feature performance and guide future improvements.",
    "Junior Product Manager with {years}+ years of experience supporting agile product development and lifecycle activities. Translates user needs into clear product requirements through discovery sessions, helps prioritize backlog items based on impact and supports sprint planning activities. Collaborates with cross-functional teams to coordinate product launches, gather feedback and monitor market trends to support product decisions."
],
        mid: [
            "Product Manager with {years}+ years of experience driving product strategy and feature delivery across the full product lifecycle. Owns product initiatives from discovery to launch, defines OKRs and KPIs such as user acquisition and retention, and uses frameworks such as RICE to prioritize roadmap items. Applies data-driven analysis to guide product decisions and collaborates with engineering, design, and marketing teams to improve feature performance.",
            "Product Manager with {years}+ years of experience working across complex B2B and B2C product ecosystems. Conducts user research using Jobs-to-be-Done methodology, runs product discovery through prototyping and MVP testing, and validates hypotheses with A/B testing. Collaborates with cross-functional partners to refine product-market fit and translates insights into actionable product improvements."
        ],
        senior: [
            "Senior Product Manager with {years}+ years of experience leading complex product initiatives from discovery to market launch across B2B and B2C environments. Guides product discovery through user research and prototyping, validates hypotheses with data-driven experimentation and prioritizes roadmap items based on business impact. Collaborates with engineering leadership to define technical requirements and aligns cross-functional teams on product delivery milestones.",
            "Senior Product Manager with {years}+ years of experience driving product development for high-growth platforms and optimizing user experience across multiple channels. Leads product discovery using Jobs-to-be-Done methodology, defines success metrics and analyzes feature performance to inform iteration strategies. Mentors junior product managers on prioritization frameworks and works closely with engineering and design to maintain development velocity."
        ]
    },

    // ==========================================
    // GAME DEVELOPER
    // ==========================================
    gameDeveloper: {
        junior: [
    "Game Developer with {years}+ years of experience developing engaging gameplay experiences using Unity, Unreal Engine, or custom game engines. Implements core mechanics such as movement, combat, and physics, builds levels and develops gameplay systems using languages like C++ or C#. Writes clean code, debugs platform-specific issues and collaborates with designers, artists and QA testers throughout the development cycle.",
    "Game Developer with {years}+ years of experience in interactive entertainment development for PC and mobile platforms. Develops and supports core game systems including game loops and state management, integrates assets such as 3D models, animations and audio and implements visual effects. Uses version control tools such as Perforce or Git, follows established development practices and participates in agile sprints while contributing ideas during game design discussions."
],
        mid: [
            "Game Developer with {years}+ years of experience building gameplay systems and developing features for multi-platform games. Designs and implements modular game components, optimizes rendering workflows, and helps reduce technical debt through targeted refactoring and performance improvements. Works independently to troubleshoot platform-specific issues and collaborates with designers and producers to deliver polished gameplay experiences.",
            "Game Developer with {years}+ years of experience specializing in multiplayer systems, AI programming, or engine development for PC and console platforms. Implements network synchronization, memory optimization, and pipeline improvements to enhance game stability and performance. Collaborates with cross-functional teams to troubleshoot complex bugs and coordinates technical planning to deliver quality titles on schedule."
        ],
        senior: [
            "Senior Game Developer with {years}+ years of experience architecting gameplay systems and optimizing performance for console, PC and mobile platforms. Leads technical design reviews, refactors legacy systems to improve maintainability and mentors developers on performance optimization techniques. Collaborates with designers and producers to translate creative vision into technically sound implementations while ensuring scalability and stability across releases.",
            "Senior Game Developer with {years}+ years of experience building robust multiplayer frameworks and engine-level systems for AAA titles. Drives technical planning for complex features, implements network synchronization and memory optimization strategies and improves build pipelines to enhance team productivity. Reviews code across the engineering team, promotes coding standards and troubleshoots platform-specific challenges to deliver polished gameplay experiences."
        ]
    }
};