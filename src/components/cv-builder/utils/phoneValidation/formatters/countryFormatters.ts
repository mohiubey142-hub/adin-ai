// utils/phoneValidation/formatters/countryFormatters.ts
// ============================================
// COUNTRY-SPECIFIC FORMATTERS
// ============================================

import { CountryPhoneFormat } from '../data';
import { removeNonDigits, removeLeadingZeros, removeCountryCodeIfPresent } from './baseFormatter';

export const formatPakistan = (cleaned: string, format: CountryPhoneFormat): string => {
    // Pakistan: +92 3XX XXXXXXX
    if (cleaned.startsWith('3') && cleaned.length >= 10) {
        return `+92 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 10)}`;
    } else if (cleaned.length > 0) {
        if (cleaned.length <= 3) {
            return `+92 ${cleaned}`;
        } else {
            return `+92 ${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
        }
    }
    return cleaned;
};

export const formatIndia = (cleaned: string, format: CountryPhoneFormat): string => {
    // India: +91 XXXXX XXXXX
    if (cleaned.length >= 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
    } else if (cleaned.length > 0) {
        if (cleaned.length <= 5) {
            return `+91 ${cleaned}`;
        } else {
            return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
        }
    }
    return cleaned;
};

export const formatUSCanada = (cleaned: string, format: CountryPhoneFormat): string => {
    // USA/Canada: +1 (XXX) XXX-XXXX
    if (cleaned.length >= 10) {
        return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length > 0) {
        if (cleaned.length <= 3) {
            return `+1 (${cleaned}`;
        } else if (cleaned.length <= 6) {
            return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        } else {
            return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
    }
    return cleaned;
};

export const formatUK = (cleaned: string, format: CountryPhoneFormat): string => {
    // UK: +44 XXXX XXXXXX
    if (cleaned.length >= 10) {
        return `+44 ${cleaned.slice(0, 4)} ${cleaned.slice(4, 10)}`;
    } else if (cleaned.length > 0) {
        if (cleaned.length <= 4) {
            return `+44 ${cleaned}`;
        } else {
            return `+44 ${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
        }
    }
    return cleaned;
};

export const formatUAE = (cleaned: string, format: CountryPhoneFormat): string => {
    // UAE: +971 XX XXX XXXX
    if (cleaned.length >= 9) {
        return `+971 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)}`;
    } else if (cleaned.length > 0) {
        if (cleaned.length <= 2) {
            return `+971 ${cleaned}`;
        } else if (cleaned.length <= 5) {
            return `+971 ${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
        } else {
            return `+971 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
        }
    }
    return cleaned;
};

export const formatSaudi = (cleaned: string, format: CountryPhoneFormat): string => {
    // Saudi: +966 XX XXX XXXX
    if (cleaned.length >= 9) {
        return `+966 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)}`;
    } else if (cleaned.length > 0) {
        if (cleaned.length <= 2) {
            return `+966 ${cleaned}`;
        } else if (cleaned.length <= 5) {
            return `+966 ${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
        } else {
            return `+966 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
        }
    }
    return cleaned;
};

export const formatAustralia = (cleaned: string, format: CountryPhoneFormat): string => {
    // Australia: +61 X XXXX XXXX
    if (cleaned.length >= 9) {
        return `+61 ${cleaned.slice(0, 1)} ${cleaned.slice(1, 5)} ${cleaned.slice(5, 9)}`;
    } else if (cleaned.length > 0) {
        if (cleaned.length <= 1) {
            return `+61 ${cleaned}`;
        } else if (cleaned.length <= 5) {
            return `+61 ${cleaned.slice(0, 1)} ${cleaned.slice(1)}`;
        } else {
            return `+61 ${cleaned.slice(0, 1)} ${cleaned.slice(1, 5)} ${cleaned.slice(5)}`;
        }
    }
    return cleaned;
};

export const formatGermany = (cleaned: string, format: CountryPhoneFormat): string => {
    // Germany: +49 XXX XXXXXXXX
    if (cleaned.length >= 10) {
        return `+49 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 10)}`;
    } else if (cleaned.length > 0) {
        if (cleaned.length <= 3) {
            return `+49 ${cleaned}`;
        } else {
            return `+49 ${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
        }
    }
    return cleaned;
};

export const formatFrance = (cleaned: string, format: CountryPhoneFormat): string => {
    // France: +33 X XX XX XX XX
    if (cleaned.length >= 9) {
        return `+33 ${cleaned.slice(0, 1)} ${cleaned.slice(1, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
    } else if (cleaned.length > 0) {
        if (cleaned.length <= 1) {
            return `+33 ${cleaned}`;
        } else if (cleaned.length <= 3) {
            return `+33 ${cleaned.slice(0, 1)} ${cleaned.slice(1)}`;
        } else if (cleaned.length <= 5) {
            return `+33 ${cleaned.slice(0, 1)} ${cleaned.slice(1, 3)} ${cleaned.slice(3)}`;
        } else if (cleaned.length <= 7) {
            return `+33 ${cleaned.slice(0, 1)} ${cleaned.slice(1, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`;
        } else {
            return `+33 ${cleaned.slice(0, 1)} ${cleaned.slice(1, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
        }
    }
    return cleaned;
};

export const formatJapan = (cleaned: string, format: CountryPhoneFormat): string => {
    // Japan: +81 XX XXXX XXXX
    if (cleaned.length >= 10) {
        return `+81 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6, 10)}`;
    } else if (cleaned.length > 0) {
        if (cleaned.length <= 2) {
            return `+81 ${cleaned}`;
        } else if (cleaned.length <= 6) {
            return `+81 ${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
        } else {
            return `+81 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
        }
    }
    return cleaned;
};

export const formatKorea = (cleaned: string, format: CountryPhoneFormat): string => {
    // South Korea: +82 XX XXXX XXXX
    if (cleaned.length >= 10) {
        return `+82 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6, 10)}`;
    } else if (cleaned.length > 0) {
        if (cleaned.length <= 2) {
            return `+82 ${cleaned}`;
        } else if (cleaned.length <= 6) {
            return `+82 ${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
        } else {
            return `+82 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
        }
    }
    return cleaned;
};

export const formatChina = (cleaned: string, format: CountryPhoneFormat): string => {
    // China: +86 XXX XXXX XXXX
    if (cleaned.length >= 11) {
        return `+86 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7, 11)}`;
    } else if (cleaned.length > 0) {
        if (cleaned.length <= 3) {
            return `+86 ${cleaned}`;
        } else if (cleaned.length <= 7) {
            return `+86 ${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
        } else {
            return `+86 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
        }
    }
    return cleaned;
};

export const formatBrazil = (cleaned: string, format: CountryPhoneFormat): string => {
    // Brazil: +55 XX XXXXX XXXX
    if (cleaned.length >= 11) {
        return `+55 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7, 11)}`;
    } else if (cleaned.length > 0) {
        if (cleaned.length <= 2) {
            return `+55 ${cleaned}`;
        } else if (cleaned.length <= 7) {
            return `+55 ${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
        } else {
            return `+55 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
        }
    }
    return cleaned;
};

export const formatRussia = (cleaned: string, format: CountryPhoneFormat): string => {
    // Russia: +7 XXX XXX XX XX
    if (cleaned.length >= 10) {
        return `+7 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
    } else if (cleaned.length > 0) {
        if (cleaned.length <= 3) {
            return `+7 ${cleaned}`;
        } else if (cleaned.length <= 6) {
            return `+7 ${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
        } else if (cleaned.length <= 8) {
            return `+7 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        } else {
            return `+7 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
        }
    }
    return cleaned;
};

export const formatGeneric = (cleaned: string, dialCode: string): string => {
    // Generic format: +[code] [number]
    if (dialCode) {
        return `+${dialCode} ${cleaned}`;
    }
    return cleaned;
};

// Country formatter map
export const countryFormatters: Record<string, (cleaned: string, format: CountryPhoneFormat) => string> = {
    'PK': formatPakistan,
    'IN': formatIndia,
    'US': formatUSCanada,
    'CA': formatUSCanada,
    'UK': formatUK,
    'AE': formatUAE,
    'SA': formatSaudi,
    'AU': formatAustralia,
    'DE': formatGermany,
    'FR': formatFrance,
    'JP': formatJapan,
    'KR': formatKorea,
    'CN': formatChina,
    'BR': formatBrazil,
    'RU': formatRussia,
};

export const getCountryFormatter = (countryCode: string): ((cleaned: string, format: CountryPhoneFormat) => string) | null => {
    return countryFormatters[countryCode] || null;
};