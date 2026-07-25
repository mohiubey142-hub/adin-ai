// utils/pools/aiResearchEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getAiResearchEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted research on 10+ state-of-the-art AI models, publishing findings in internal reports at ${company}`,
            `• Implemented and evaluated 15+ deep learning architectures using PyTorch and TensorFlow`,
            `• Processed and curated 10+ large-scale datasets for training and benchmarking AI models`,
            `• Collaborated with 5+ research teams to reproduce results from 20+ academic papers`,
            `• Documented research methodologies and created 10+ technical presentations for team meetings`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led AI research projects across 3 domains, publishing 5+ papers in top-tier conferences at ${company}`,
            `• Designed novel neural network architectures achieving 15% improvement over SOTA benchmarks`,
            `• Developed proprietary algorithms that reduced training time by 40% for 10+ models`,
            `• Mentored 4 junior researchers and led weekly research seminars for 20+ team members`,
            `• Partnered with product teams to transition 3+ research prototypes into production systems`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed AI research division of 15+ researchers at ${company}, with $8M annual research budget`,
            `• Defined long-term research strategy in NLP, Computer Vision, and Reinforcement Learning`,
            `• Published 15+ papers in top conferences and filed 10+ patents for AI innovations`,
            `• Established research partnerships with 5+ universities, collaborating on 8+ joint projects`,
            `• Presented research findings to executive leadership, influencing product strategy and innovation`
        ];
    }
    return [
        `• Served as Director of AI Research, overseeing $20M research portfolio and 40+ researchers across 3 labs`,
        `• Led groundbreaking research resulting in 25+ publications and 30+ patents filed`,
        `• Built AI research organization from ground up, hiring 35+ PhD-level researchers`,
        `• Secured $15M in grants and research partnerships with leading universities and governments`,
        `• Mentored 12 research leads who now lead their own AI research groups`
    ];
};