// utils/phoneValidation/validators/phoneValidator.ts
// ============================================
// PHONE VALIDATOR
// ============================================

import { countryCodes } from '../../../constants/cvDefaults';
import { getCountryFormat, removeNonDigits, removeCountryCodeIfPresent, removeLeadingZeros } from '../formatters';

export const validatePhoneNumber = (
    phone: string,
    countryCode: string
): { isValid: boolean; message: string } => {
    // Check if phone is empty
    if (!phone) {
        return { isValid: false, message: 'Phone number is required' };
    }

    // Find country
    const country = countryCodes.find(c => c.code === countryCode);
    if (!country) {
        return { isValid: true, message: '' };
    }

    // Remove all non-digits
    const digitsOnly = removeNonDigits(phone);

    // Get country format
    const countryFormat = getCountryFormat(countryCode);

    // Remove country code if present
    let number = digitsOnly;
    if (countryFormat && number.startsWith(countryFormat.code)) {
        number = removeCountryCodeIfPresent(number, countryFormat.code);
    }

    // Remove leading zeros
    number = removeLeadingZeros(number);

    // Check if length matches country length
    const isValid = number.length === countryFormat?.length;

    if (!isValid) {
        return {
            isValid: false,
            message: `${country.flag} ${country.country} phone number should be ${countryFormat?.length || 'valid'} digits (e.g., ${countryFormat?.example || '1234567890'})`
        };
    }

    return { isValid: true, message: '✓ Valid phone number' };
};