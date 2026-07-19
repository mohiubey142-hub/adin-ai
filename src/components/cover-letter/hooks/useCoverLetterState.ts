import { useState } from 'react';

export const useCoverLetterState = () => {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern'>('classic');
  
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+92');
  const [address, setAddress] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [originalLetter, setOriginalLetter] = useState('');
  const [projects, setProjects] = useState('');
  const [isEnhanced, setIsEnhanced] = useState(false);

  return {
    // State
    step, setStep,
    generating, setGenerating,
    isInitialLoad, setIsInitialLoad,
    selectedTemplate, setSelectedTemplate,
    userName, setUserName,
    email, setEmail,
    phoneNumber, setPhoneNumber,
    selectedCountryCode, setSelectedCountryCode,
    address, setAddress,
    linkedin, setLinkedin,
    education, setEducation,
    experience, setExperience,
    skills, setSkills,
    jobTitle, setJobTitle,
    company, setCompany,
    jobDescription, setJobDescription,
    additionalInfo, setAdditionalInfo,
    profilePhoto, setProfilePhoto,
    selectedStyle, setSelectedStyle,
    generatedLetter, setGeneratedLetter,
    originalLetter, setOriginalLetter,
    projects, setProjects,
    isEnhanced, setIsEnhanced,
  };
};