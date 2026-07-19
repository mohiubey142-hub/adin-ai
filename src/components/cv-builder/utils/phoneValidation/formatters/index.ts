// utils/phoneValidation/formatters/index.ts
// ============================================
// FORMATTERS EXPORTS
// ============================================

export { getCountryFormat } from './formatHelpers';
export { removeNonDigits, removeLeadingZeros, removeCountryCodeIfPresent, cleanPhoneInput } from './baseFormatter';
export { 
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
} from './countryFormatters';