// utils/pools/schoolCounselorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSchoolCounselorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided counseling to 300+ students on academic and personal issues at ${company}`,
            `• Conducted 500+ individual and group counseling sessions`,
            `• Developed 50+ career guidance programs for students`,
            `• Assisted 200+ students with college applications and career planning`,
            `• Documented 400+ counseling sessions with 100% confidentiality`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led counseling department of 5 counselors at ${company}`,
            `• Developed comprehensive counseling program improving student well-being by 40%`,
            `• Trained 10 teachers in student mental health support`,
            `• Implemented crisis intervention reducing incidents by 50%`,
            `• Improved student academic performance by 35% through guidance`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led counseling team of 15 counselors, serving 2,000+ students at ${company}`,
            `• Defined counseling standards adopted across 5 schools`,
            `• Drove student well-being improvement by 55%`,
            `• Built relationships with 25+ mental health organizations`,
            `• Published 10+ articles on school counseling best practices`
        ];
    }
    return [
        `• Served as Director of Counseling at ${company}, overseeing 30+ counselors and $3M budget`,
        `• Led counseling transformation improving student outcomes by 60%`,
        `• Built counseling department from ground up, hiring 25+ counselors`,
        `• Presented counseling strategy to board and secured $2M for student support`,
        `• Mentored 15 counseling leaders who now run their own departments`
    ];
};