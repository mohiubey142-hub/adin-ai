// utils/phoneValidation/formatters/baseFormatter.ts
// ============================================
// BASE FORMATTER - Remove non-digits, clean
// ============================================

export const removeNonDigits = (value: string): string => {
    return value.replace(/\D/g, '');
};

export const removeLeadingZeros = (value: string): string => {
    return value.replace(/^0+/, '');
};

export const removeCountryCodeIfPresent = (value: string, dialCode: string): string => {
    if (value.startsWith(dialCode)) {
        return value.slice(dialCode.length);
    }
    return value;
};

export const cleanPhoneInput = (value: string, dialCode: string): string => {
    let cleaned = removeNonDigits(value);
    cleaned = removeCountryCodeIfPresent(cleaned, dialCode);
    cleaned = removeLeadingZeros(cleaned);
    return cleaned;
};