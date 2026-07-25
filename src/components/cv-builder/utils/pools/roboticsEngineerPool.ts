// utils/pools/roboticsEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getRoboticsEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Designed and built 10+ robotic prototypes for industrial and research applications at ${company}`,
            `• Programmed 15+ robots using Python, C++, and ROS for automation tasks`,
            `• Conducted 50+ robot performance tests, achieving 98% accuracy in pick-and-place operations`,
            `• Troubleshot 30+ robotic system issues, reducing downtime by 25%`,
            `• Collaborated with software engineers to integrate computer vision for 3+ projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led robotics engineering team of 6 engineers, delivering 5+ automation solutions at ${company}`,
            `• Designed robotic systems that increased manufacturing efficiency by 40%`,
            `• Implemented sensor fusion and SLAM algorithms for autonomous navigation in 3+ robots`,
            `• Reduced robot cycle time by 30%, saving $300K annually in production costs`,
            `• Mentored 4 junior engineers in robotics programming and system integration`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led robotics engineering division of 20+ engineers at ${company}, overseeing $10M in projects`,
            `• Architected robotics platform used across 5+ industries, generating $50M in revenue`,
            `• Defined AI/robotics strategy, increasing automation penetration by 40%`,
            `• Developed 10+ patented robotic innovations for industrial and service applications`,
            `• Partnered with universities and research labs for 3+ collaborative projects`
        ];
    }
    return [
        `• Served as Director of Robotics Engineering, overseeing $30M portfolio and 60+ engineers`,
        `• Led robotics transformation, deploying 500+ robots across 15 facilities`,
        `• Built robotics organization from ground up, hiring 50+ specialists across 6 countries`,
        `• Presented robotics strategy to CEO and secured $25M for AI robotics initiative`,
        `• Mentored 15 engineering leaders who now run their own robotics teams`
    ];
};