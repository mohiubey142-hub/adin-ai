// Yeh default values hain jab user naya CV banayega

import { ExperienceItem, EducationItem, ProjectItem, CertificationItem, LanguageItem, AchievementItem, PersonalInfo } from '../types/cvTypes';

export const defaultPersonalInfo: PersonalInfo = {
    name: '',
    title: '',
    email: '',
    address: '',
    linkedin: '',
    github: '',
    portfolio: ''
};

export const defaultExperience: ExperienceItem = {
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    description: ''
};

export const defaultEducation: EducationItem = {
    degree: '',
    institution: '',
    year: '',
    grade: ''
};

export const defaultProject: ProjectItem = {
    name: '',
    tech: '',
    description: '',
    github: ''
};

export const defaultCertification: CertificationItem = {
    name: '',
    issuer: '',
    date: '',
    credentialId: ''
};

export const defaultLanguage: LanguageItem = {
    language: '',
    proficiency: 'Intermediate'
};

export const defaultAchievement: AchievementItem = {
    title: '',
    date: '',
    description: ''
};

// ============================================
// ✅ FIXED: Country codes with ISO codes
// ============================================
export const countryCodes = [
    { code: 'PK', country: 'Pakistan', flag: '🇵🇰', dialCode: '+92', pattern: /^\d{10}$/, example: '3123456789', length: 10 },
    { code: 'US', country: 'USA', flag: '🇺🇸', dialCode: '+1', pattern: /^\d{10}$/, example: '2125551234', length: 10 },
    { code: 'CA', country: 'Canada', flag: '🇨🇦', dialCode: '+1', pattern: /^\d{10}$/, example: '4165551234', length: 10 },
    { code: 'UK', country: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', pattern: /^\d{10}$/, example: '7123456789', length: 10 },
    { code: 'IN', country: 'India', flag: '🇮🇳', dialCode: '+91', pattern: /^\d{10}$/, example: '9876543210', length: 10 },
    { code: 'CN', country: 'China', flag: '🇨🇳', dialCode: '+86', pattern: /^\d{11}$/, example: '13812345678', length: 11 },
    { code: 'JP', country: 'Japan', flag: '🇯🇵', dialCode: '+81', pattern: /^\d{10}$/, example: '9012345678', length: 10 },
    { code: 'DE', country: 'Germany', flag: '🇩🇪', dialCode: '+49', pattern: /^\d{10,11}$/, example: '15123456789', length: 11 },
    { code: 'FR', country: 'France', flag: '🇫🇷', dialCode: '+33', pattern: /^\d{9}$/, example: '612345678', length: 9 },
    { code: 'IT', country: 'Italy', flag: '🇮🇹', dialCode: '+39', pattern: /^\d{10}$/, example: '3123456789', length: 10 },
    { code: 'ES', country: 'Spain', flag: '🇪🇸', dialCode: '+34', pattern: /^\d{9}$/, example: '612345678', length: 9 },
    { code: 'BR', country: 'Brazil', flag: '🇧🇷', dialCode: '+55', pattern: /^\d{10,11}$/, example: '11987654321', length: 11 },
    { code: 'MX', country: 'Mexico', flag: '🇲🇽', dialCode: '+52', pattern: /^\d{10}$/, example: '5512345678', length: 10 },
    { code: 'AU', country: 'Australia', flag: '🇦🇺', dialCode: '+61', pattern: /^\d{9}$/, example: '412345678', length: 9 },
    { code: 'NZ', country: 'New Zealand', flag: '🇳🇿', dialCode: '+64', pattern: /^\d{9}$/, example: '212345678', length: 9 },
    { code: 'KR', country: 'South Korea', flag: '🇰🇷', dialCode: '+82', pattern: /^\d{10,11}$/, example: '1012345678', length: 10 },
    { code: 'MY', country: 'Malaysia', flag: '🇲🇾', dialCode: '+60', pattern: /^\d{9,10}$/, example: '123456789', length: 9 },
    { code: 'SG', country: 'Singapore', flag: '🇸🇬', dialCode: '+65', pattern: /^\d{8}$/, example: '91234567', length: 8 },
    { code: 'AE', country: 'UAE', flag: '🇦🇪', dialCode: '+971', pattern: /^\d{9}$/, example: '501234567', length: 9 },
    { code: 'SA', country: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966', pattern: /^\d{9}$/, example: '512345678', length: 9 },
    { code: 'EG', country: 'Egypt', flag: '🇪🇬', dialCode: '+20', pattern: /^\d{10}$/, example: '1012345678', length: 10 },
    { code: 'ZA', country: 'South Africa', flag: '🇿🇦', dialCode: '+27', pattern: /^\d{9}$/, example: '712345678', length: 9 },
    { code: 'RU', country: 'Russia', flag: '🇷🇺', dialCode: '+7', pattern: /^\d{10}$/, example: '9123456789', length: 10 },
    { code: 'NL', country: 'Netherlands', flag: '🇳🇱', dialCode: '+31', pattern: /^\d{9}$/, example: '612345678', length: 9 },
    { code: 'SE', country: 'Sweden', flag: '🇸🇪', dialCode: '+46', pattern: /^\d{9}$/, example: '701234567', length: 9 },
    { code: 'NO', country: 'Norway', flag: '🇳🇴', dialCode: '+47', pattern: /^\d{8}$/, example: '41234567', length: 8 },
    { code: 'DK', country: 'Denmark', flag: '🇩🇰', dialCode: '+45', pattern: /^\d{8}$/, example: '22123456', length: 8 },
    { code: 'FI', country: 'Finland', flag: '🇫🇮', dialCode: '+358', pattern: /^\d{9}$/, example: '401234567', length: 9 },
    { code: 'CH', country: 'Switzerland', flag: '🇨🇭', dialCode: '+41', pattern: /^\d{9}$/, example: '781234567', length: 9 },
    { code: 'BE', country: 'Belgium', flag: '🇧🇪', dialCode: '+32', pattern: /^\d{9}$/, example: '471234567', length: 9 },
    { code: 'AT', country: 'Austria', flag: '🇦🇹', dialCode: '+43', pattern: /^\d{10}$/, example: '6641234567', length: 10 },
    { code: 'PL', country: 'Poland', flag: '🇵🇱', dialCode: '+48', pattern: /^\d{9}$/, example: '501234567', length: 9 },
    { code: 'CZ', country: 'Czech Republic', flag: '🇨🇿', dialCode: '+420', pattern: /^\d{9}$/, example: '601123456', length: 9 },
    { code: 'HU', country: 'Hungary', flag: '🇭🇺', dialCode: '+36', pattern: /^\d{9}$/, example: '201234567', length: 9 },
    { code: 'RO', country: 'Romania', flag: '🇷🇴', dialCode: '+40', pattern: /^\d{9}$/, example: '712345678', length: 9 },
    { code: 'BG', country: 'Bulgaria', flag: '🇧🇬', dialCode: '+359', pattern: /^\d{9}$/, example: '881234567', length: 9 },
    { code: 'GR', country: 'Greece', flag: '🇬🇷', dialCode: '+30', pattern: /^\d{10}$/, example: '6912345678', length: 10 },
    { code: 'TR', country: 'Turkey', flag: '🇹🇷', dialCode: '+90', pattern: /^\d{10}$/, example: '5012345678', length: 10 },
    { code: 'IR', country: 'Iran', flag: '🇮🇷', dialCode: '+98', pattern: /^\d{10}$/, example: '9123456789', length: 10 },
    { code: 'LK', country: 'Sri Lanka', flag: '🇱🇰', dialCode: '+94', pattern: /^\d{9}$/, example: '712345678', length: 9 },
    { code: 'BD', country: 'Bangladesh', flag: '🇧🇩', dialCode: '+880', pattern: /^\d{10}$/, example: '1712345678', length: 10 },
    { code: 'NP', country: 'Nepal', flag: '🇳🇵', dialCode: '+977', pattern: /^\d{10}$/, example: '9812345678', length: 10 },
    { code: 'ID', country: 'Indonesia', flag: '🇮🇩', dialCode: '+62', pattern: /^\d{10,11}$/, example: '8123456789', length: 10 },
    { code: 'PH', country: 'Philippines', flag: '🇵🇭', dialCode: '+63', pattern: /^\d{10}$/, example: '9123456789', length: 10 },
    { code: 'VN', country: 'Vietnam', flag: '🇻🇳', dialCode: '+84', pattern: /^\d{9}$/, example: '912345678', length: 9 },
    { code: 'TH', country: 'Thailand', flag: '🇹🇭', dialCode: '+66', pattern: /^\d{9}$/, example: '812345678', length: 9 },
    { code: 'MM', country: 'Myanmar', flag: '🇲🇲', dialCode: '+95', pattern: /^\d{9}$/, example: '912345678', length: 9 },
    { code: 'KH', country: 'Cambodia', flag: '🇰🇭', dialCode: '+855', pattern: /^\d{8}$/, example: '12345678', length: 8 },
    { code: 'LA', country: 'Laos', flag: '🇱🇦', dialCode: '+856', pattern: /^\d{10}$/, example: '2021234567', length: 10 },
    { code: 'GH', country: 'Ghana', flag: '🇬🇭', dialCode: '+233', pattern: /^\d{9}$/, example: '201234567', length: 9 },
    { code: 'KE', country: 'Kenya', flag: '🇰🇪', dialCode: '+254', pattern: /^\d{9}$/, example: '712345678', length: 9 },
    { code: 'NG', country: 'Nigeria', flag: '🇳🇬', dialCode: '+234', pattern: /^\d{10}$/, example: '8021234567', length: 10 },
    { code: 'ET', country: 'Ethiopia', flag: '🇪🇹', dialCode: '+251', pattern: /^\d{9}$/, example: '912345678', length: 9 },
    { code: 'UG', country: 'Uganda', flag: '🇺🇬', dialCode: '+256', pattern: /^\d{9}$/, example: '712345678', length: 9 },
    { code: 'TZ', country: 'Tanzania', flag: '🇹🇿', dialCode: '+255', pattern: /^\d{9}$/, example: '712345678', length: 9 },
    { code: 'ZM', country: 'Zambia', flag: '🇿🇲', dialCode: '+260', pattern: /^\d{9}$/, example: '966123456', length: 9 },
    { code: 'ZW', country: 'Zimbabwe', flag: '🇿🇼', dialCode: '+263', pattern: /^\d{9}$/, example: '712345678', length: 9 },
    { code: 'AR', country: 'Argentina', flag: '🇦🇷', dialCode: '+54', pattern: /^\d{10}$/, example: '91123456789', length: 11 },
    { code: 'CO', country: 'Colombia', flag: '🇨🇴', dialCode: '+57', pattern: /^\d{10}$/, example: '3123456789', length: 10 },
    { code: 'CL', country: 'Chile', flag: '🇨🇱', dialCode: '+56', pattern: /^\d{9}$/, example: '912345678', length: 9 },
    { code: 'PE', country: 'Peru', flag: '🇵🇪', dialCode: '+51', pattern: /^\d{9}$/, example: '912345678', length: 9 },
    { code: 'VE', country: 'Venezuela', flag: '🇻🇪', dialCode: '+58', pattern: /^\d{10}$/, example: '4121234567', length: 10 },
    { code: 'CU', country: 'Cuba', flag: '🇨🇺', dialCode: '+53', pattern: /^\d{8}$/, example: '51234567', length: 8 },
    { code: 'PA', country: 'Panama', flag: '🇵🇦', dialCode: '+507', pattern: /^\d{8}$/, example: '61234567', length: 8 },
    { code: 'CR', country: 'Costa Rica', flag: '🇨🇷', dialCode: '+506', pattern: /^\d{8}$/, example: '83123456', length: 8 },
    { code: 'SV', country: 'El Salvador', flag: '🇸🇻', dialCode: '+503', pattern: /^\d{8}$/, example: '70123456', length: 8 },
    { code: 'HN', country: 'Honduras', flag: '🇭🇳', dialCode: '+504', pattern: /^\d{8}$/, example: '91234567', length: 8 },
    { code: 'NI', country: 'Nicaragua', flag: '🇳🇮', dialCode: '+505', pattern: /^\d{8}$/, example: '81234567', length: 8 },
];

export const steps = [
    { num: 1, name: 'Personal', icon: '👤' },
    { num: 2, name: 'Experience', icon: '💼' },
    { num: 3, name: 'Education', icon: '🎓' },
    { num: 4, name: 'Projects', icon: '🚀' },
    { num: 5, name: 'Skills', icon: '⚡' },
    { num: 6, name: 'Certifications', icon: '📜' },
    { num: 7, name: 'Languages', icon: '🗣️' },
    { num: 8, name: 'Achievements', icon: '🏅' },
    { num: 9, name: 'Preview', icon: '👁️' }
];

// ✅ EXPANDED: 6 templates (Modern, Classic, Minimal, Executive, Creative, Academic)
export const templates = [
    { id: 'modern' as const, name: 'Modern', gradient: 'from-purple-500 to-blue-500' },
    { id: 'classic' as const, name: 'Classic', gradient: 'from-gray-600 to-gray-800' },
    { id: 'minimal' as const, name: 'Minimal', gradient: 'from-slate-500 to-slate-700' },
    // ✅ ADDED: 3 new templates
    { id: 'executive' as const, name: 'Executive', gradient: 'from-amber-600 to-orange-500' },
    { id: 'creative' as const, name: 'Creative', gradient: 'from-pink-600 to-rose-500' },
    { id: 'academic' as const, name: 'Academic', gradient: 'from-emerald-600 to-teal-500' }
];