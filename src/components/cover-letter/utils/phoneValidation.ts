// src/components/cover-letter/utils/phoneValidation.ts

import { countryCodes } from '../constants/cvDefaults';

export const validatePhoneNumber = (phone: string, countryCode: string): { isValid: boolean; message: string } => {
    if (!phone) return { isValid: false, message: 'Phone number is required' };
    
    const country = countryCodes.find(c => c.code === countryCode);
    if (!country) return { isValid: true, message: '' };
    
    const digitsOnly = phone.replace(/\D/g, '');
    const isValid = country.pattern.test(digitsOnly);
    
    if (!isValid) {
        return { 
            isValid: false, 
            message: `${country.flag} ${country.country} phone number should be ${country.length} digits (e.g., ${country.example})` 
        };
    }
    
    return { isValid: true, message: '✓ Valid phone number' };
};

export const getFullPhoneNumber = (phoneNumber: string, selectedCountryCode: string): string => {
    if (!phoneNumber) return '';
    return `${selectedCountryCode} ${phoneNumber}`;
};