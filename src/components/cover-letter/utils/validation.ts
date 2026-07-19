import { countryCodes } from '../constants/cvDefaults';

export const validatePhoneForCountry = (phone: string, countryCode: string): boolean => {
  if (!phone) return false;
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (!/^\d+$/.test(digitsOnly)) return false;
  
  const country = countryCodes.find(c => c.code === countryCode);
  if (!country) {
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
  }
  
  return digitsOnly.length === country.length;
};

export const getPhoneValidationMessage = (phone: string, countryCode: string): string => {
  if (!phone) return 'Phone number is required';
  const digitsOnly = phone.replace(/\D/g, '');
  const country = countryCodes.find(c => c.code === countryCode);
  
  if (!country) {
    return 'Please enter a valid phone number (7-15 digits)';
  }
  
  if (digitsOnly.length === 0) {
    return 'Please enter a phone number';
  }
  
  if (digitsOnly.length !== country.length) {
    return `${country.flag} ${country.country} phone number must be ${country.length} digits (e.g., ${country.example})`;
  }
  
  return '✓ Valid phone number';
};

export const isEducationValid = (education: string): boolean => {
  if (!education) return false;
  const parts = education.split(',');
  const hasDegree = parts.length > 0 && parts[0].trim().length > 0;
  const hasUniversity = parts.length > 1 && parts[1].trim().length > 0;
  return hasDegree && hasUniversity;
};

export const getEducationError = (education: string): string | null => {
  if (!education) return 'Education is required';
  const parts = education.split(',');
  if (parts.length < 1 || !parts[0].trim()) return 'Degree is required';
  if (parts.length < 2 || !parts[1].trim()) return 'University is required';
  return null;
};

export const canGenerate = (
  userName: string,
  email: string,
  phoneNumber: string,
  education: string,
  jobTitle: string,
  company: string,
  isPhoneValid: boolean
): boolean => {
  return !!(
    userName && 
    jobTitle && 
    company && 
    email && 
    email.includes('@gmail.com') && 
    isPhoneValid && 
    isEducationValid(education)
  );
};