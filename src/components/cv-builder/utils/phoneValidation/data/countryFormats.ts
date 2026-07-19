// utils/phoneValidation/data/countryFormats.ts
// ============================================
// COUNTRY PHONE FORMATS - All Countries
// ============================================

export interface CountryPhoneFormat {
    code: string;
    format: string;
    example: string;
    length: number;
}

export const countryPhoneFormats: Record<string, CountryPhoneFormat> = {
    'PK': { code: '92', format: '+92 3XX XXXXXXX', example: '3123456789', length: 10 },
    'IN': { code: '91', format: '+91 XXXXX XXXXX', example: '9876543210', length: 10 },
    'US': { code: '1', format: '+1 (XXX) XXX-XXXX', example: '5551234567', length: 10 },
    'CA': { code: '1', format: '+1 (XXX) XXX-XXXX', example: '4161234567', length: 10 },
    'UK': { code: '44', format: '+44 XXXX XXXXXX', example: '7911123456', length: 10 },
    'AE': { code: '971', format: '+971 XX XXX XXXX', example: '501234567', length: 9 },
    'SA': { code: '966', format: '+966 XX XXX XXXX', example: '551234567', length: 9 },
    'AU': { code: '61', format: '+61 X XXXX XXXX', example: '412345678', length: 9 },
    'DE': { code: '49', format: '+49 XXX XXXXXXXX', example: '15123456789', length: 11 },
    'FR': { code: '33', format: '+33 X XX XX XX XX', example: '612345678', length: 9 },
    'IT': { code: '39', format: '+39 XXX XXX XXXX', example: '3123456789', length: 10 },
    'ES': { code: '34', format: '+34 XXX XX XX XX', example: '612345678', length: 9 },
    'PT': { code: '351', format: '+351 XX XXX XXXX', example: '912345678', length: 9 },
    'NL': { code: '31', format: '+31 XX XXX XXXX', example: '612345678', length: 9 },
    'BE': { code: '32', format: '+32 XXX XX XX XX', example: '478123456', length: 9 },
    'CH': { code: '41', format: '+41 XX XXX XXXX', example: '781234567', length: 9 },
    'AT': { code: '43', format: '+43 XXX XXXXXXXX', example: '6641234567', length: 10 },
    'SE': { code: '46', format: '+46 XX XXX XXXX', example: '701234567', length: 9 },
    'NO': { code: '47', format: '+47 XXX XX XXX', example: '91234567', length: 8 },
    'DK': { code: '45', format: '+45 XX XX XX XX', example: '30123456', length: 8 },
    'FI': { code: '358', format: '+358 XX XXX XXXX', example: '401234567', length: 9 },
    'IE': { code: '353', format: '+353 XX XXX XXXX', example: '851234567', length: 9 },
    'NZ': { code: '64', format: '+64 XX XXX XXXX', example: '211234567', length: 9 },
    'SG': { code: '65', format: '+65 XXXX XXXX', example: '91234567', length: 8 },
    'MY': { code: '60', format: '+60 XX XXX XXXX', example: '123456789', length: 9 },
    'PH': { code: '63', format: '+63 XXXX XXX XXXX', example: '9123456789', length: 10 },
    'ID': { code: '62', format: '+62 XX XXX XXXX', example: '812345678', length: 9 },
    'TH': { code: '66', format: '+66 XX XXX XXXX', example: '812345678', length: 9 },
    'VN': { code: '84', format: '+84 XX XXX XXXX', example: '912345678', length: 9 },
    'JP': { code: '81', format: '+81 XX XXXX XXXX', example: '9012345678', length: 10 },
    'KR': { code: '82', format: '+82 XX XXXX XXXX', example: '1012345678', length: 10 },
    'CN': { code: '86', format: '+86 XXX XXXX XXXX', example: '13812345678', length: 11 },
    'RU': { code: '7', format: '+7 XXX XXX XX XX', example: '9123456789', length: 10 },
    'BR': { code: '55', format: '+55 XX XXXXX XXXX', example: '11912345678', length: 11 },
    'MX': { code: '52', format: '+52 XX XXXX XXXX', example: '5512345678', length: 10 },
    'AR': { code: '54', format: '+54 XXX XXX XXXX', example: '91112345678', length: 11 },
    'CL': { code: '56', format: '+56 X XXXX XXXX', example: '912345678', length: 9 },
    'CO': { code: '57', format: '+57 XXX XXX XXXX', example: '3101234567', length: 10 },
    'PE': { code: '51', format: '+51 XXX XXX XXXX', example: '912345678', length: 9 },
    'ZA': { code: '27', format: '+27 XX XXX XXXX', example: '712345678', length: 9 },
    'EG': { code: '20', format: '+20 XXX XXX XXXX', example: '1012345678', length: 10 },
    'NG': { code: '234', format: '+234 XXX XXX XXXX', example: '7012345678', length: 10 },
    'KE': { code: '254', format: '+254 XXX XXX XXX', example: '712345678', length: 9 },
    'TR': { code: '90', format: '+90 XXX XXX XXXX', example: '5012345678', length: 10 },
    'IL': { code: '972', format: '+972 XX XXX XXXX', example: '501234567', length: 9 },
    'IR': { code: '98', format: '+98 XXX XXX XXXX', example: '9123456789', length: 10 },
    'BD': { code: '880', format: '+880 XX XXX XXXX', example: '1712345678', length: 10 },
    'LK': { code: '94', format: '+94 XX XXX XXXX', example: '771234567', length: 9 },
    'NP': { code: '977', format: '+977 XX XXX XXXX', example: '9812345678', length: 10 },
    'MA': { code: '212', format: '+212 XX XXX XXXX', example: '612345678', length: 9 },
    'DZ': { code: '213', format: '+213 XXX XXX XXX', example: '551234567', length: 9 },
    'TN': { code: '216', format: '+216 XX XXX XXX', example: '20123456', length: 8 },
    'GH': { code: '233', format: '+233 XX XXX XXXX', example: '201234567', length: 9 },
    'ET': { code: '251', format: '+251 XX XXX XXXX', example: '911234567', length: 9 },
    'TZ': { code: '255', format: '+255 XX XXX XXXX', example: '712345678', length: 9 },
    'UG': { code: '256', format: '+256 XXX XXX XXX', example: '712345678', length: 9 },
    'ZW': { code: '263', format: '+263 XX XXX XXXX', example: '712345678', length: 9 },
    'MW': { code: '265', format: '+265 XXXX XXX XXX', example: '888123456', length: 9 },
    'ZM': { code: '260', format: '+260 XX XXX XXXX', example: '966123456', length: 9 },
};