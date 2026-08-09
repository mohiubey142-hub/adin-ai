// utils/profession/summaries/templates/technology/data.ts
// ============================================
// DATA PROFESSIONS TEMPLATES - 2 Professions
// ============================================
//
// Professions: dataScientist, aiMl
// ============================================

export const DATA_TEMPLATES: Record<string, Record<string, string[]>> = {
    // ==========================================
    // DATA SCIENTIST
    // ==========================================
    dataScientist: {
       junior: [
    "Data Scientist with {years}+ years of experience assisting with data analysis, statistical modeling and predictive analytics projects. Supports senior data scientists in cleaning, preparing and analyzing structured and unstructured datasets, performs exploratory data analysis and builds visualizations to identify trends and patterns. Uses analytical techniques and programming tools to help transform raw data into meaningful insights for business decisions.",
    "Data Scientist with {years}+ years of experience applying statistical methods and machine learning techniques to support data-driven business solutions. Assists in developing predictive models using Python, R and SQL, prepares datasets, evaluates model results and documents findings clearly for technical stakeholders. Collaborates with data teams to analyze patterns, improve reporting and support machine learning initiatives."
],
        mid: [
            "Data Scientist with {years}+ years of experience taking ML projects from data collection through to deployment. Focuses on predictive modeling, time series forecasting, and A/B testing, and builds data pipelines using Apache Spark or Dask. Tunes model hyperparameters, tracks performance with precision, recall, and F1 metrics, and works alongside engineering to ship models via APIs or batch scoring.",
            "Data Scientist with {years}+ years of experience designing experiments, building recommendation systems, and moving ML models into production. Develops and selects features, applies model explainability techniques such as SHAP or LIME, and builds retraining workflows to manage model drift. Translates business requirements into technical specifications and reviews peer work to keep model quality high."
        ],
        senior: [
    "Senior Data Scientist with {years}+ years of experience designing, deploying and optimizing production-grade machine learning systems. Drives technical projects from experimentation through implementation, improves model performance through advanced analysis and feature engineering and reviews code and analytical approaches to maintain quality standards. Mentors junior data scientists, collaborates with engineering teams and helps scale reliable data science solutions across products and platforms.",
    "Senior Data Scientist with {years}+ years of experience developing advanced statistical models and leading data science initiatives across product teams. Builds scalable data pipelines, improves model accuracy through feature engineering and optimization techniques and ensures reproducibility of analytical workflows. Collaborates with stakeholders to define success metrics, translates complex analysis into actionable insights and supports data-driven product decisions."
]
    },

    // ==========================================
    // AI/ML ENGINEER
    // ==========================================
    aiMl: {junior: [
    "AI/ML Engineer with {years}+ years of experience assisting in building and deploying machine learning solutions. Collaborates with senior engineers to prepare data preprocessing pipelines, train models, evaluate performance metrics and support model improvement workflows. Writes clean, testable Python code, contributes to experiment tracking and documentation and helps integrate ML features into applications.",
    "AI/ML Engineer with {years}+ years of experience implementing machine learning solutions using modern frameworks and development practices. Supports model training, validation and deployment workflows, contributes to experiment tracking and analyzes model performance results. Works with cross-functional teams to understand requirements, improve AI components and deliver reliable machine learning features."
],
        mid: [
            "AI/ML Engineer with {years}+ years of experience building production-grade ML systems and shipping AI-driven features. Designs scalable pipelines for batch and real-time inference, implements model monitoring with drift detection and performance alerting, and drives improvement through structured experimentation. Conducts thorough code reviews and tunes inference infrastructure for latency and cost.",
            "AI/ML Engineer with {years}+ years of experience in MLOps, distributed training, and production system reliability. Specializes in model serving architectures, A/B testing frameworks, and inference optimization for low-latency applications. Builds feature stores, monitors model drift and data quality, and strengthens system reliability through better observability."
        ],
        senior: [
            "Senior AI/ML Engineer with {years}+ years of experience leading technical design and implementation of machine learning platforms. Builds scalable model training and serving infrastructure, optimizes performance, and implements robust monitoring. Mentors engineers, enforces best practices, and ensures system reliability across teams.",
            "Senior AI/ML Engineer with {years}+ years of experience designing and evolving large-scale AI systems. Leads development of distributed training pipelines and real-time inference services, and improves engineering workflows for model delivery. Reviews system designs, troubleshoots complex issues, and champions high-quality code and documentation."
        ]
    }
};