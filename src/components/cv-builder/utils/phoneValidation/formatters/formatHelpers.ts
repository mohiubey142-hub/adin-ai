// utils/phoneValidation/formatters/formatHelpers.ts
// ============================================
// FORMAT HELPERS
// ============================================

import { countryPhoneFormats, CountryPhoneFormat } from '../data';

export const getCountryFormat = (countryCode: string): CountryPhoneFormat | null => {
    return countryPhoneFormats[countryCode] || null;
};