// utils/phoneValidation/utils/fullPhone.ts
// ============================================
// FULL PHONE NUMBER
// ============================================

import { getCountryFormat } from '../formatters';

export const getFullPhoneNumber = (
    phoneNumber: string,
    selectedCountryCode: string
): string => {
    if (!phoneNumber) return '';

    // If phone already has +, return as is
    if (phoneNumber.startsWith('+')) {
        return phoneNumber;
    }

    const countryFormat = getCountryFormat(selectedCountryCode);
    if (countryFormat) {
        return `+${countryFormat.code} ${phoneNumber}`;
    }

    return `${selectedCountryCode} ${phoneNumber}`;
};