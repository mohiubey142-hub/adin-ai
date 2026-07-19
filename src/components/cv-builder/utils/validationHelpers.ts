import { validatePhoneNumber as validatePhone } from './phoneValidation';

export const validatePhoneNumber = (phone: string, countryCode: string) => {
    return validatePhone(phone, countryCode);
};

export const validateEmail = (email: string): boolean => {
    return email.includes('@') && email.includes('.');
};

export const hasValidPhone = (phone: string, countryCode: string): boolean => {
    if (!phone.trim()) return false;
    const validation = validatePhoneNumber(phone, countryCode);
    return validation.isValid;
};

export const isTextLengthValid = (text: string, min: number = 0, max?: number): boolean => {
    const length = text.trim().length;
    if (length < min) return false;
    if (max !== undefined && length > max) return false;
    return true;
};

export const parseSkillsToArray = (skillsStr: string): string[] => {
    if (!skillsStr.trim()) return [];
    if (skillsStr.includes(',')) {
        return skillsStr.split(',').map(s => s.trim()).filter(s => s);
    }
    return skillsStr.split('\n')
        .map(s => s.trim().replace(/^[•\-*]\s*/, ''))
        .filter(s => s);
};