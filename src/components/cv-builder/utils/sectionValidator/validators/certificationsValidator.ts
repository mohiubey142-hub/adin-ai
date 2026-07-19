// utils/sectionValidator/validators/certificationsValidator.ts
// ============================================
// CERTIFICATIONS VALIDATOR
// ============================================

import { CertificationItem, SectionStatus } from '../../types/cvTypes';

export const validateCertificationsSection = (certifications: CertificationItem[]): SectionStatus => {
    const validCerts = certifications.filter(c => c.name?.trim().length > 0);

    if (validCerts.length === 0) {
        return { isComplete: true, score: 100, weakPoints: [] };
    }

    let completed = 0;
    const total = validCerts.length * 3;

    validCerts.forEach(cert => {
        if (cert.name?.trim()) completed++;
        if (cert.issuer?.trim()) completed++;
        if (cert.date?.trim()) completed++;
    });

    const score = Math.min(Math.round((completed / total) * 100), 100);
    return { isComplete: true, score, weakPoints: [] };
};