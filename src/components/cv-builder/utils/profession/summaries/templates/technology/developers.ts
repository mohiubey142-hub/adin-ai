// utils/profession/summaries/templates/technology/developers.ts
// ============================================
// DEVELOPERS PROFESSIONS TEMPLATES - 5 Professions
// ============================================
//
// Professions: developer, softwareEngineer, frontend, backend, fullStack
// ============================================

export const DEVELOPERS_TEMPLATES: Record<string, Record<string, string[]>> = {
    // ==========================================
    // DEVELOPER
    // ==========================================
    developer: {
        junior: [
            "Junior Developer with {years}+ years of experience building web applications using JavaScript, Python, and Java. Writes clean, maintainable code, participates in agile ceremonies and collaborates with senior developers to deliver features from requirements gathering through deployment. Supports code reviews and contributes to writing unit tests to ensure quality and reliability.",
            "Junior Developer with {years}+ years of experience in full-stack and backend development using Node.js, Django, and Spring Boot. Builds secure RESTful APIs, maintains database schemas with PostgreSQL and MongoDB and writes unit tests with Jest and PyTest under senior guidance. Uses Git for version control and works closely with cross-functional teams to support production-ready features."
        ],
        mid: [
            "Software Developer with {years}+ years of experience designing and implementing scalable, high-performing applications using modern frameworks. Builds features from concept to production with an emphasis on performance, reliability, and maintainability, and conducts thorough code reviews to uphold quality standards. Partners closely with product managers on requirements and QA teams on testing strategies to deliver dependable releases.",
            "Software Developer with {years}+ years of experience building production-grade applications with a focus on system design, API architecture, and database optimization. Contributes to technical discussions, implements CI/CD pipelines using GitHub Actions and Jenkins, and troubleshoots production issues using logging and monitoring tools. Balances feature delivery with ongoing improvements to reduce technical debt."
        ],
        senior: [
            "Senior Developer with {years}+ years of experience architecting scalable applications and leading technical implementation across development teams. Reviews code, mentors junior developers and collaborates with product and operations stakeholders to deliver reliable, maintainable systems. Improves application performance through optimization and drives adoption of development best practices.",
            "Senior Developer with {years}+ years of experience designing distributed systems and improving system performance across the stack. Leads technical planning sessions, evaluates tools and frameworks, and implements caching, profiling and query optimization strategies. Mentors engineers on coding standards, troubleshoots production issues and strengthens CI/CD workflows."
        ]
    },

    // ==========================================
    // SOFTWARE ENGINEER
    // ==========================================
    softwareEngineer: {
        junior: [
    "Junior Software Engineer with {years}+ years of experience delivering features across the technology stack using Java, Python and C#. Writes clean, maintainable and testable code following established design patterns and SOLID principles. Participates in agile development processes, contributes to code reviews, maintains technical documentation and works under senior guidance to build reliable software solutions.",
    "Junior Software Engineer with {years}+ years of experience building and maintaining enterprise applications using Spring Boot, Django and ASP.NET Core. Implements RESTful services, integrates third-party APIs using authentication protocols such as OAuth2 and writes database queries with ORM frameworks to support application functionality. Uses version control systems, develops automated tests with JUnit and NUnit and collaborates with engineering teams to improve software quality."
],
        mid: [
            "Software Engineer with {years}+ years of experience designing scalable systems and driving feature delivery from inception to production. Designs solutions that balance performance, reliability, maintainability, and cost-efficiency. Conducts thorough code reviews and pairing sessions to support engineering best practices, and partners with stakeholders to translate business requirements into robust solutions.",
            "Software Engineer with {years}+ years of experience building distributed systems and optimizing application performance for high-throughput workloads. Designs well-documented APIs with OpenAPI and Swagger, implements caching strategies using Redis and Memcached, and strengthens system resilience through redundancy and fault-tolerant design. Contributes to technical design sessions and collaborates with operations teams on deployment strategies."
        ],
        senior: [
            "Senior Software Engineer with {years}+ years of experience architecting scalable, fault-tolerant systems using event-driven and distributed computing patterns. Leads technical design sessions, reviews code and mentors engineers on system design and implementation best practices. Collaborates with product and infrastructure teams to deliver resilient software and optimize performance through monitoring and testing.",
            "Senior Software Engineer with {years}+ years of experience designing high-availability systems and improving engineering workflows across product teams. Guides architectural decisions, promotes testing and observability best practices, and troubleshoots production incidents. Mentors junior engineers, improves CI/CD pipelines and advocates for maintainable, well-documented solutions."
        ]
    },

    // ==========================================
    // FRONTEND DEVELOPER
    // ==========================================
    frontend: {
        junior: [
            "Junior Frontend Developer with {years}+ years of experience building responsive web interfaces using React, Vue, and Angular. Translates design mockups into functional implementations with HTML5, CSS3 (SASS/SCSS), and modern JavaScript (ES6+). Ensures cross-browser compatibility and accessibility standards (WCAG 2.1) while collaborating with designers and backend teams under senior guidance.",
            "Junior Frontend Developer with {years}+ years of experience creating performant web applications with a focus on user experience and component reusability. Builds reusable components using React hooks and the Vue Composition API, manages application state with Redux, Zustand, or Pinia and integrates REST APIs. Uses modern frontend tooling including Webpack, Vite, and npm/yarn and participates in sprint planning."
        ],
        mid: [
            "Frontend Developer with {years}+ years of experience building scalable, maintainable frontend applications for complex requirements. Contributes to frontend architecture decisions, implements robust state management, and optimizes performance for Core Web Vitals, including LCP, FID, and CLS. Reviews code from teammates, helps establish component libraries with Storybook, and enforces code quality through ESLint and Prettier. Partners with product and design teams to deliver exceptional experiences.",
            "Frontend Developer with {years}+ years of experience building complex single-page applications and design systems at scale. Specializes in performance optimization through code splitting and lazy loading, bundle size reduction, and progressive web app development with service workers. Sets up CI/CD workflows for frontend deployments, ensures responsive experiences across devices, and champions accessibility through ARIA implementation."
        ],
        senior: [
            "Senior Frontend Developer with {years}+ years of experience architecting scalable frontend applications and component libraries for product teams. Leads frontend technical initiatives, reviews code and mentors developers on performance, accessibility and maintainability. Implements testing strategies with Jest, Cypress and Playwright, and collaborates with product and design partners to deliver seamless user experiences.",
            "Senior Frontend Developer with {years}+ years of experience building high-performance web applications and design systems at enterprise scale. Guides frontend architecture decisions including state management, API integration and build tooling. Mentors team members, establishes CI/CD workflows and ensures applications meet accessibility standards and Core Web Vitals performance targets."
        ]
    },

    // ==========================================
    // BACKEND DEVELOPER
    // ==========================================
    backend: {
        junior: [
            "Junior Backend Developer with {years}+ years of experience building secure, scalable APIs and server-side applications using Node.js, Python, and Java. Implements RESTful endpoints with modern backend frameworks, writes optimized SQL queries and integrates third-party APIs. Follows established coding standards, writes unit tests and participates in code reviews while collaborating with frontend teams on API contracts.",
            "Junior Backend Developer with {years}+ years of experience developing scalable web services and microservices using Node.js, FastAPI, and Spring. Builds robust APIs with proper error handling, implements authentication and authorization using OAuth2 and JWT and ensures strict input validation and data integrity. Uses ORM frameworks to maintain efficient database schemas and delivers backend features on schedule."
        ],
        mid: [
            "Backend Developer with {years}+ years of experience designing distributed systems and optimizing server performance for high-traffic applications. Designs microservices architectures with service discovery and API gateways, implements message queues using RabbitMQ or Apache Kafka, and strengthens system reliability through monitoring and alerting. Reviews code from peers, contributes to technical design discussions, and improves code quality across the codebase.",
            "Backend Developer with {years}+ years of experience building high-throughput, low-latency applications for demanding environments. Specializes in database optimization through indexing and query planning, caching strategies using Redis and Memcached, and API gateway design patterns. Implements comprehensive test coverage, including unit, integration, and contract tests, establishes performance benchmarks and SLAs, and collaborates with product teams on scalable solutions."
        ],
        senior: [
            "Senior Backend Developer with {years}+ years of experience architecting resilient backend systems for high-volume, distributed applications. Leads technical design reviews, mentors junior engineers and collaborates with infrastructure teams to improve scalability, observability and system performance. Optimizes database queries, caching layers and message-driven services while promoting best practices through code reviews.",
            "Senior Backend Developer with {years}+ years of experience designing event-driven architectures and microservices for large-scale applications. Guides implementation of reliable APIs, establishes monitoring and alerting practices, and troubleshoots production performance issues. Mentors engineers on backend best practices, improves CI/CD pipelines and advocates for maintainable, well-tested solutions."
        ]
    },

    // ==========================================
    // FULL STACK DEVELOPER
    // ==========================================
    fullStack: {
        junior: [
            "Junior Full Stack Developer with {years}+ years of experience building web applications across the entire technology stack. Develops responsive, accessible frontends using React or Angular and builds robust, secure APIs using Node.js, Python, or Java. Implements database schemas with PostgreSQL and MongoDB, writes optimized queries and ensures seamless end-to-end functionality under senior guidance.",
            "Junior Full Stack Developer with {years}+ years of experience delivering complete features from database design to UI implementation. Builds clean, maintainable code across frontend and backend layers with attention to performance and security. Integrates frontend applications with REST and GraphQL APIs, writes comprehensive unit and integration tests and uses Git for version control while collaborating with product owners and QA teams."
        ],
        mid: [
            "Full Stack Developer with {years}+ years of experience building end-to-end applications and coordinating feature development for product teams. Designs robust, documented APIs with OpenAPI, builds responsive, performant frontends with React or Vue, and optimizes database performance through indexing and query tuning. Reviews code rigorously, helps uphold quality standards across the team, and implements CI/CD pipelines to ensure seamless deployment.",
            "Full Stack Developer with {years}+ years of experience building scalable, secure applications with a focus on system design and performance optimization. Contributes to technical initiatives, collaborates with product managers and designers, and translates business requirements into robust solutions. Improves development workflows through automation, reduces technical debt, and supports adoption of modern development practices, including containerization."
        ],
        senior: [
            "Senior Full Stack Developer with {years}+ years of experience architecting end-to-end applications across frontend, backend and database layers. Leads technical initiatives, reviews code and mentors developers on both frontend and backend best practices. Collaborates with product and design stakeholders to deliver scalable, maintainable systems while improving performance and development workflows.",
            "Senior Full Stack Developer with {years}+ years of experience designing full-stack solutions and guiding teams through architectural decisions and implementation trade-offs. Establishes coding standards, promotes testing and observability practices, and improves system reliability through monitoring and optimization. Mentors engineers across disciplines and drives continuous improvements in deployment processes and code quality."
        ]
    }
};