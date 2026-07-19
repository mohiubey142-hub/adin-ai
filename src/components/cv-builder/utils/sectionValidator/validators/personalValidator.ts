// utils/sectionValidator/validators/personalValidator.ts
// ============================================
// PERSONAL VALIDATOR
// ============================================

import { PersonalInfo, SectionStatus } from '../../types/cvTypes';
import { getCompletionStatus } from '../helpers';

export const validatePersonalSection = (
    personalInfo: PersonalInfo, 
    phoneNumber: string, 
    selectedCountryCode: string
): SectionStatus => {
    const weakPoints: string[] = [];
    let completed = 0;
    const total = 4;

    const hasName = personalInfo.name?.trim().length > 0;
    const hasTitle = personalInfo.title?.trim().length > 0;
    const hasEmail = personalInfo.email?.includes('@') && personalInfo.email?.includes('.');
    const hasPhone = phoneNumber?.trim().length > 0;

    if (!hasName) weakPoints.push('Full Name is required');
    else completed++;

    if (!hasTitle) weakPoints.push('Job Title is required');
    else completed++;

    if (!hasEmail) weakPoints.push('Valid Email is required');
    else completed++;

    if (!hasPhone) weakPoints.push('Phone number is required');
    else completed++;

    return getCompletionStatus(completed, total, weakPoints);
};