// utils/profession/summaries/templates/technology/infrastructure.ts
// ============================================
// INFRASTRUCTURE PROFESSIONS TEMPLATES - 4 Professions
// ============================================
//
// Professions: databaseAdministrator, cybersecurity, cloud, devops
// ============================================

export const INFRASTRUCTURE_TEMPLATES: Record<string, Record<string, string[]>> = {
    // ==========================================
    // DATABASE ADMINISTRATOR
    // ==========================================
    databaseAdministrator: {
        junior: [
            "Database Administrator with {years}+ years of experience supporting relational database platforms including SQL Server, Oracle, and PostgreSQL. Installs and configures database instances, runs scheduled backups and restores, and tracks performance using built-in monitoring dashboards. Applies security controls such as encryption and access permissions, resolves database issues, and works with development teams on schema design and query tuning.",
            "Database Administrator with {years}+ years of experience providing day-to-day database maintenance and support for production systems. Runs routine health checks, applies patches and updates, and manages storage allocation across database instances. Writes and tunes SQL queries, builds indexes to improve performance, and maintains data integrity through validation checks. Takes part in on-call rotations and resolves incidents within service-level targets."
        ],
        mid: [
            "Database Administrator with {years}+ years of experience managing database environments that support high-availability production workloads. Designs replication and clustering setups such as AlwaysOn Availability Groups, builds backup and recovery procedures aligned to RPO/RTO targets, and tunes queries and indexes to improve throughput. Contributes to database migration projects, including moves to cloud platforms, and troubleshoots complex performance issues across multiple environments.",
            "Database Administrator with {years}+ years of experience in database operations and cloud migration projects. Works with cloud-managed databases such as AWS RDS, Azure SQL, and GCP Cloud SQL, applies security hardening including encryption and audit logging, and automates provisioning with Terraform. Supports multi-region database deployments, builds monitoring dashboards for proactive issue detection, and helps ensure compliance with data regulations such as GDPR and HIPAA."
        ],
        senior: [
            "Senior Database Administrator with {years}+ years of experience architecting high-availability database solutions and leading database performance optimization for large-scale production environments. Designs replication, clustering and disaster recovery strategies, tunes complex queries and indexes, and implements automation for provisioning and monitoring. Mentors database engineering teams, collaborates with infrastructure and development teams to improve data reliability, and evaluates emerging database technologies.",
            "Senior Database Administrator with {years}+ years of experience managing enterprise database platforms and driving operational excellence across critical systems. Designs backup and recovery frameworks, optimizes query performance, and implements security controls including encryption and access management. Collaborates with development teams on schema design and migration strategies, mentors junior administrators, and contributes to cloud migration and modernization initiatives."
        ]
    },

    // ==========================================
    // CYBERSECURITY ENGINEER
    // ==========================================
    cybersecurity: {
        junior: [
            "Cybersecurity Engineer with {years}+ years of experience in security monitoring, incident response, and threat analysis. Reviews alerts in SIEM platforms such as Splunk, Sentinel, and QRadar, investigates suspicious activity, and cross-references findings with threat intelligence feeds. Runs vulnerability scans using Nessus or Qualys, documents findings from security assessments, and maintains firewall configurations. Follows incident response runbooks and supports compliance with security policies.",
            "Cybersecurity Engineer with {years}+ years of experience supporting network and endpoint security operations. Configures firewall rules on Palo Alto and Fortinet platforms, applies role-based access controls, and deploys security patches across systems. Delivers security awareness sessions and assists with internal and external audits. Supports incident response activities, including basic forensic analysis, and contributes ideas for security process improvements."
        ],
        mid: [
            "Cybersecurity Engineer with {years}+ years of experience designing security controls for enterprise environments. Performs penetration testing and participates in red team exercises, evaluates risk using threat modeling frameworks such as STRIDE and DREAD, and implements controls aligned to NIST and CIS standards. Leads investigations into security incidents, applies mitigation strategies, and works with DevOps teams to build security checks into CI/CD pipelines.",
            "Cybersecurity Engineer with {years}+ years of experience in cloud security, application security, or identity and access management. Implements Zero Trust principles through network segmentation, conducts risk assessments across cloud environments, and builds automation workflows using SOAR platforms. Manages security incidents from detection through resolution, improves detection tooling, and supports regulatory compliance efforts including GDPR, HIPAA, and SOC 2."
        ],
        senior: [
            "Senior Security Engineer with {years}+ years of experience designing and implementing security architectures for complex enterprise and cloud environments. Leads security reviews, threat modeling and penetration testing efforts, and drives improvements to detection, response and vulnerability management processes. Mentors security engineers, collaborates with infrastructure and application teams to embed security controls, and guides incident investigations from detection through resolution.",
            "Senior Cybersecurity Engineer with {years}+ years of experience building and maintaining security controls across cloud, network and application layers. Architects identity and access management solutions, implements Zero Trust architectures, and develops automation for security operations and compliance monitoring. Reviews security code and configurations, mentors team members on secure development practices, and drives continuous improvement of security tooling and processes."
        ]
    },

    // ==========================================
    // CLOUD ENGINEER
    // ==========================================
    cloud: {
        junior: [
            "Cloud Engineer with {years}+ years of experience managing cloud infrastructure on AWS, Azure, or GCP. Deploys and scales virtual machines, configures networking components including VPCs, subnets, and route tables, and sets up cloud storage solutions. Uses infrastructure-as-code tools such as Terraform and CloudFormation to standardize deployments. Monitors cloud resource usage, manages costs through tagging and rightsizing, and applies IAM best practices.",
            "Cloud Engineer with {years}+ years of experience in cloud operations across multiple providers. Configures IAM policies following least-privilege principles, sets up load balancers, and builds monitoring and alerting workflows. Supports cost optimization through rightsizing and reserved instance planning, assists with capacity planning for scaling needs, and helps maintain high availability through multi-AZ deployments. Partners with development teams on cloud-native application support."
        ],
        mid: [
            "Cloud Engineer with {years}+ years of experience designing cost-optimized cloud solutions for production workloads. Builds cloud-native architectures using microservices and serverless patterns, sets up disaster recovery with automated failover, and tunes infrastructure for performance. Leads cloud migration efforts, automates infrastructure provisioning with Terraform or Pulumi, and improves deployment workflows. Reviews infrastructure code and helps establish team-level cloud practices.",
            "Cloud Engineer with {years}+ years of experience working across multi-cloud environments. Manages container orchestration with Kubernetes, builds serverless architectures, and integrates DevOps tooling into cloud workflows. Implements cost optimization strategies including spot instance usage, strengthens observability using Datadog or New Relic, and evaluates new cloud technologies. Coordinates with stakeholders to align cloud solutions with project requirements."
        ],
        senior: [
            "Senior Cloud Engineer with {years}+ years of experience architecting scalable, resilient cloud infrastructure and leading cloud adoption initiatives for production workloads. Designs multi-region architectures, implements disaster recovery and auto-scaling strategies, and drives infrastructure automation using Terraform and other IaC tools. Mentors cloud engineering teams, collaborates with development and infrastructure teams to improve reliability and performance, and evaluates new cloud services.",
            "Senior Cloud Engineer with {years}+ years of experience designing and optimizing cloud-native solutions across AWS, Azure and GCP. Architects containerized applications with Kubernetes, implements service mesh and observability pipelines, and builds cost-efficient, high-performance infrastructure. Leads technical discussions on architecture and deployment strategies, mentors junior cloud engineers, and drives continuous improvement of cloud operations and engineering workflows."
        ]
    },

    // ==========================================
    // DEVOPS ENGINEER
    // ==========================================
    devops: {
        junior: [
            "DevOps Engineer with {years}+ years of experience building and maintaining CI/CD pipelines using Jenkins, GitLab CI, or GitHub Actions. Automates build, test, and deployment steps to speed up release cycles. Manages infrastructure using configuration management tools such as Ansible, Chef, or Terraform. Monitors system health with Prometheus and Grafana, and supports development teams with deployment strategies including blue-green releases.",
            "DevOps Engineer with {years}+ years of experience supporting infrastructure automation for agile development teams. Builds CI/CD pipelines with automated testing stages, writes automation scripts in Python or Bash, and manages cloud resource provisioning. Sets up monitoring and logging using the ELK stack. Troubleshoots deployment failures, works to improve deployment reliability, and participates in sprint planning and other agile ceremonies."
        ],
        mid: [
            "DevOps Engineer with {years}+ years of experience building CI/CD architecture for growing engineering teams. Designs pipelines with parallel build stages and automated testing, implements containerization using Docker and Kubernetes, and configures automated rollback strategies. Supports engineering teams in adopting DevOps practices, strengthens monitoring and observability, and helps define service-level objectives. Contributes to Infrastructure as Code and GitOps adoption.",
            "DevOps Engineer with {years}+ years of experience in cloud-native DevOps and platform engineering. Manages Kubernetes clusters using Helm charts, configures service mesh tools such as Istio or Linkerd, and integrates observability tooling including Prometheus, Grafana, and Jaeger. Implements security scanning across SAST, DAST, and container images, improves release velocity, and configures auto-scaling for high availability. Collaborates across teams to streamline delivery workflows."
        ],
        senior: [
            "Senior DevOps Engineer with {years}+ years of experience architecting CI/CD pipelines and infrastructure automation for large-scale engineering organizations. Designs deployment strategies including blue-green and canary releases, implements container orchestration with Kubernetes, and builds observability and monitoring frameworks. Mentors DevOps and development teams on automation and reliability practices, drives improvements to release velocity and system stability, and contributes to technical roadmaps.",
            "Senior DevOps Engineer with {years}+ years of experience leading infrastructure automation and platform reliability initiatives across product engineering teams. Builds self-service CI/CD capabilities, implements GitOps workflows, and designs scalable monitoring, logging and alerting solutions. Collaborates with development teams to improve deployment processes and system performance, reviews infrastructure code, and promotes operational excellence through automated testing and progressive delivery."
        ]
    }
};