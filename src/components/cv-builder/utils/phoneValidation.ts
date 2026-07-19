// utils/phoneValidation.ts
// ============================================
// PHONE VALIDATION - ENTRY POINT
// ============================================
// 
// 🚀 Complete phone validation and formatting for 60+ countries
// 
// ============================================

// ============================================
// DATA - Country Formats
// ============================================
export { countryPhoneFormats } from './phoneValidation/data';
export type { CountryPhoneFormat } from './phoneValidation/data';

// ============================================
// FORMATTERS - Phone Formatting
// ============================================
export {
    getCountryFormat,
    removeNonDigits,
    removeLeadingZeros,
    removeCountryCodeIfPresent,
    cleanPhoneInput,
    countryFormatters,
    getCountryFormatter,
    formatPakistan,
    formatIndia,
    formatUSCanada,
    formatUK,
    formatUAE,
    formatSaudi,
    formatAustralia,
    formatGermany,
    formatFrance,
    formatJapan,
    formatKorea,
    formatChina,
    formatBrazil,
    formatRussia,
    formatGeneric
} from './phoneValidation/formatters';

// ============================================
// VALIDATORS - Phone Validation
// ============================================
export { validatePhoneNumber } from './phoneValidation/validators';

// ============================================
// UTILITIES - Full Phone Number
// ============================================
export { getFullPhoneNumber } from './phoneValidation/utils';

// ============================================
// MAIN FORMATTING FUNCTION - Re-export for convenience
// ============================================
import { 
    getCountryFormat,
    getCountryFormatter,
    removeNonDigits,
    removeCountryCodeIfPresent,
    removeLeadingZeros,
    formatGeneric
} from './phoneValidation/formatters';

export const formatPhoneNumber = (value: string, countryCode: string): string => {
    if (!value) return '';

    // Remove all non-digits
    let cleaned = removeNonDigits(value);
    if (!cleaned) return '';

    // Remove leading zeros
    cleaned = removeLeadingZeros(cleaned);

    const countryFormat = getCountryFormat(countryCode);
    if (!countryFormat) return `+${cleaned}`;

    const dialCode = countryFormat.code;

    // Remove country code if present
    if (cleaned.startsWith(dialCode)) {
        cleaned = removeCountryCodeIfPresent(cleaned, dialCode);
    }

    // Get country-specific formatter or use generic
    const formatter = getCountryFormatter(countryCode);
    if (formatter) {
        return formatter(cleaned, countryFormat);
    }

    // Generic format
    return formatGeneric(cleaned, dialCode);
};