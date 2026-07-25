// utils/pools/veterinaryDoctorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getVeterinaryDoctorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided veterinary care to 500+ animals including dogs, cats, and livestock at ${company}`,
            `• Performed 100+ surgical procedures including spaying, neutering, and minor surgeries`,
            `• Diagnosed and treated 200+ cases of infectious diseases, injuries, and chronic conditions`,
            `• Administered vaccinations and preventive care to 300+ animals annually`,
            `• Educated 200+ pet owners on proper animal care, nutrition, and disease prevention`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led veterinary team of 4 veterinarians, managing 800+ cases annually at ${company}`,
            `• Performed 150+ advanced surgical procedures including orthopedic and soft tissue surgeries`,
            `• Implemented diagnostic protocols improving disease detection rates by 40%`,
            `• Trained 6+ junior veterinarians in advanced surgical techniques and clinical care`,
            `• Collaborated with animal welfare organizations for 30+ rescue and rehabilitation cases`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed veterinary services across 3 facilities at ${company}, managing 15+ veterinarians`,
            `• Established treatment protocols for 10+ species, becoming standards for 5+ partner clinics`,
            `• Launched community outreach programs providing care to 1,000+ animals annually`,
            `• Developed continuing education program for 20+ veterinary professionals`,
            `• Led facility expansion with investment in advanced imaging and surgical equipment`
        ];
    }
    return [
        `• Served as Director of Veterinary Services, overseeing 30+ veterinarians and $8M annual operations`,
        `• Led practice transformation increasing animal care capacity by 60% across 6 locations`,
        `• Built veterinary practice from ground up, hiring 28+ specialists across 5 locations`,
        `• Presented expansion strategy and secured $5M for new veterinary hospitals`,
        `• Mentored 15 practice leads who now manage their own veterinary clinics`
    ];
};