import { countryCodes } from '../../constants/cvDefaults';
import { getFullPhoneNumber } from '../../utils/phoneValidation';

export const getContactInfo = (
    personalInfo: any,
    phoneNumber: string,
    selectedCountryCode: string
): string[] => {
    const contacts: string[] = [];
    if (personalInfo.email) contacts.push(`${personalInfo.email}`);
    if (getFullPhoneNumber(phoneNumber, selectedCountryCode)) {
        contacts.push(`${getFullPhoneNumber(phoneNumber, selectedCountryCode)}`);
    }
    if (personalInfo.address) contacts.push(`${personalInfo.address}`);
    if (personalInfo.linkedin) contacts.push(`${personalInfo.linkedin}`);
    if (personalInfo.github) contacts.push(`${personalInfo.github}`);
    if (personalInfo.portfolio) contacts.push(`${personalInfo.portfolio}`);
    return contacts;
};

export const getContactInfoWithEmojis = (
    personalInfo: any,
    phoneNumber: string,
    selectedCountryCode: string
): string[] => {
    const country = countryCodes.find(c => c.code === selectedCountryCode);
    const contacts: string[] = [];
    if (personalInfo.email) contacts.push(`📧 ${personalInfo.email}`);
    if (getFullPhoneNumber(phoneNumber, selectedCountryCode)) {
        contacts.push(`📞 ${getFullPhoneNumber(phoneNumber, selectedCountryCode)} ${country?.flag || ''}`);
    }
    if (personalInfo.address) contacts.push(`📍 ${personalInfo.address}`);
    if (personalInfo.linkedin) contacts.push(`🔗 ${personalInfo.linkedin}`);
    if (personalInfo.github) contacts.push(`🐙 ${personalInfo.github}`);
    if (personalInfo.portfolio) contacts.push(`🌐 ${personalInfo.portfolio}`);
    return contacts;
};