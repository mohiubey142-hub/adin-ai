// src/components/cover-letter/steps/Step1Details.tsx
// =====================================================
// ✅ Profile photo / image upload feature REMOVED
// =====================================================

import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Linkedin,
  Briefcase, FileText, Building, ChevronDown,
  CheckCircle2, AlertCircle, SendHorizontal,
  Award, Clock, UserCheck, Zap,
} from 'lucide-react';
import { countryCodes } from '../constants/cvDefaults';

import SkillsSection from '../../cv-builder/sections/SkillsSection';
import AccordionSection from '../components/AccordionSection';

interface Step1DetailsProps {
  userName: string;
  setUserName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  selectedCountryCode: string;
  setSelectedCountryCode: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  linkedin: string;
  setLinkedin: (value: string) => void;

  education?: string;
  setEducation?: (value: string) => void;
  experience?: string;
  setExperience?: (value: string) => void;
  additionalInfo?: string;
  setAdditionalInfo?: (value: string) => void;
  projects?: string;
  setProjects?: (value: string) => void;
  currentPosition?: string;
  setCurrentPosition?: (value: string) => void;

  skills: string;
  setSkills: (value: string) => void;
  jobTitle: string;
  setJobTitle: (value: string) => void;
  company: string;
  setCompany: (value: string) => void;
  jobDescription: string;
  setJobDescription: (value: string) => void;

  // Deprecated: photo upload removed (kept optional so parent props don't break)
  profilePhoto?: string | null;
  setProfilePhoto?: (value: string | null) => void;

  onNext?: () => void;
  generating?: boolean;

  hiringManagerName: string;
  setHiringManagerName: (value: string) => void;
  currentTitle: string;
  setCurrentTitle: (value: string) => void;
  currentCompany: string;
  setCurrentCompany: (value: string) => void;
  yearsOfExperience: string;
  setYearsOfExperience: (value: string) => void;

  openSections: {
    personal: boolean;
    job: boolean;
    experience: boolean;
    skills: boolean;
  };
  toggleSection: (key: 'personal' | 'job' | 'experience' | 'skills') => void;
}

const Step1Details: React.FC<Step1DetailsProps> = ({
  userName, setUserName,
  email, setEmail,
  phoneNumber, setPhoneNumber,
  selectedCountryCode, setSelectedCountryCode,
  address, setAddress,
  linkedin, setLinkedin,
  skills, setSkills,
  jobTitle, setJobTitle,
  company, setCompany,
  jobDescription, setJobDescription,
  onNext,
  generating = false,
  hiringManagerName, setHiringManagerName,
  currentTitle, setCurrentTitle,
  currentCompany, setCurrentCompany,
  yearsOfExperience, setYearsOfExperience,
  openSections,
  toggleSection,
}) => {
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  // ============================================================
  // PHONE VALIDATION
  // ============================================================
  const validatePhoneForCountry = (phone: string, countryCode: string): { isValid: boolean; message: string } => {
    if (!phone) return { isValid: false, message: 'Phone number is required' };
    const digitsOnly = phone.replace(/\D/g, '');
    if (!/^\d+$/.test(digitsOnly)) return { isValid: false, message: 'Please enter a valid phone number (digits only)' };

    const country = countryCodes.find(c => c.code === countryCode);
    if (!country) {
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return { isValid: false, message: 'Please enter a valid phone number (7-15 digits)' };
      }
      return { isValid: true, message: 'Valid phone number' };
    }

    if (digitsOnly.length !== country.length) {
      return {
        isValid: false,
        message: `${country.flag} ${country.country} phone number must be exactly ${country.length} digits (e.g., ${country.example})`
      };
    }

    return { isValid: true, message: `Valid ${country.country} phone number` };
  };

  const phoneValidation = validatePhoneForCountry(phoneNumber, selectedCountryCode);
  const isPhoneValid = phoneValidation.isValid;
  const phoneValidationMessage = phoneValidation.message;

  // ============================================
  // FILTERS + VALIDATIONS
  // ============================================
  const filteredCountries = countryCodes.filter(country =>
    country.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.includes(countrySearch)
  );

  const selectedCountry = countryCodes.find(c => c.code === selectedCountryCode);

  const isSkillsValid = (): boolean => {
    if (!skills) return false;
    const skillList = skills.split(',').filter(s => s.trim().length > 0);
    return skillList.length > 0;
  };

  const canProceed =
    userName &&
    jobTitle &&
    company &&
    jobDescription &&
    email &&
    email.includes('@gmail.com') &&
    isPhoneValid &&
    isSkillsValid();

  // ============================================
  // SHARED INPUT CLASSES
  // ============================================
  const baseInput =
    'w-full rounded-xl bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-3 sm:px-4 py-2.5 text-sm sm:text-base';
  const normalInput =
    'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-slate-300';
  const errorInput =
    'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10';

  const handleSkillsChange = (value: string) => {
    let formatted = value.replace(/\s*,\s*/g, ', ').trim();
    formatted = formatted.replace(/,+/g, ',');
    formatted = formatted.replace(/\s+,/g, ',');
    formatted = formatted.replace(/,(\S)/g, ', $1');
    setSkills(formatted);
  };

  const noopEnhanceSkills = () => {};

  return (
    <div className="space-y-3">
      {/* ============================================
          SECTION 1: PERSONAL INFORMATION
      ============================================ */}
      <AccordionSection
        id="personal"
        title="Personal Information"
        subtitle="Name, contact details, and links"
        icon={<User size={16} strokeWidth={2.4} />}
        isOpen={openSections.personal}
        onToggle={() => toggleSection('personal')}
        badge="Required"
      >
        <div className="space-y-4 pt-3">
          {/* Full Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <User size={14} className="text-purple-600" />
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g., John Doe"
              className={`${baseInput} ${normalInput}`}
            />
            {userName && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1.5">
                <CheckCircle2 size={12} />
                Valid name
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Mail size={14} className="text-purple-600" />
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              className={`${baseInput} ${
                email && !email.includes('@gmail.com') ? errorInput : normalInput
              }`}
            />
            {email && (
              <p className={`flex items-center gap-1.5 text-xs mt-1.5 ${
                email.includes('@gmail.com') ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {email.includes('@gmail.com') ? (
                  <>
                    <CheckCircle2 size={12} />
                    Valid Gmail address
                  </>
                ) : (
                  <>
                    <AlertCircle size={12} />
                    Please use a Gmail address (@gmail.com)
                  </>
                )}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Phone size={14} className="text-purple-600" />
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  className="flex items-center gap-1 sm:gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 hover:border-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 w-full sm:w-auto justify-center text-sm"
                >
                  <span>{selectedCountry?.flag || '🌍'}</span>
                  <span>{selectedCountryCode}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 text-slate-400 ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCountryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 max-h-48 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-lg z-50">
                    <div className="sticky top-0 bg-white p-2 border-b border-slate-100">
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search country..."
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all"
                      />
                    </div>
                    <div className="p-1">
                      {filteredCountries.map((country) => (
                        <button
                          key={`${country.code}-${country.country}`}
                          onClick={() => {
                            setSelectedCountryCode(country.code);
                            setIsCountryDropdownOpen(false);
                            setCountrySearch('');
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all duration-150 ${
                            selectedCountryCode === country.code
                              ? 'bg-purple-50 text-purple-700'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{country.flag}</span>
                          <span className="truncate">{country.country}</span>
                          <span className="text-slate-400 text-xs ml-auto flex-shrink-0">{country.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter phone number"
                className={`flex-1 ${baseInput} ${
                  phoneNumber && !isPhoneValid ? errorInput : normalInput
                }`}
              />
            </div>

            {phoneNumber && (
              <p className={`flex items-center gap-1.5 text-xs mt-1.5 ${
                isPhoneValid ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {isPhoneValid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {phoneValidationMessage}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <MapPin size={14} className="text-purple-600" />
              Location <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="City, Country"
              className={`${baseInput} ${normalInput}`}
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Linkedin size={14} className="text-purple-600" />
              LinkedIn Profile <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className={`${baseInput} ${normalInput}`}
            />
          </div>
        </div>
      </AccordionSection>

      {/* ============================================
          SECTION 2: JOB INFORMATION
      ============================================ */}
      <AccordionSection
        id="job"
        title="Job Information"
        subtitle="Target role details"
        icon={<Briefcase size={16} strokeWidth={2.4} />}
        isOpen={openSections.job}
        onToggle={() => toggleSection('job')}
        badge="Required"
      >
        <div className="space-y-4 pt-3">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Building size={14} className="text-purple-600" />
              Target Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Google, Microsoft"
              className={`${baseInput} ${normalInput}`}
            />
            {company && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1.5">
                <CheckCircle2 size={12} />
                Company set
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Briefcase size={14} className="text-purple-600" />
              Target Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className={`${baseInput} ${normalInput}`}
            />
            {jobTitle && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1.5">
                <CheckCircle2 size={12} />
                Job title set
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <FileText size={14} className="text-purple-600" />
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here for a more personalized letter..."
              rows={5}
              className={`${baseInput} ${normalInput} resize-none`}
            />
            {jobDescription && (
              <p className="text-xs text-slate-400 mt-1">
                {jobDescription.split(/\s+/).filter(w => w.length > 0).length} words
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <UserCheck size={14} className="text-purple-600" />
              Hiring Manager Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={hiringManagerName}
              onChange={(e) => setHiringManagerName(e.target.value)}
              placeholder="e.g., Sarah Johnson"
              className={`${baseInput} ${normalInput}`}
            />
            <p className="text-xs text-slate-400 mt-1">
              If provided, letter will use "Dear [Name]", else "Dear Hiring Team"
            </p>
          </div>
        </div>
      </AccordionSection>

      {/* ============================================
          SECTION 3: YOUR EXPERIENCE
      ============================================ */}
      <AccordionSection
        id="experience"
        title="Your Experience"
        subtitle="Current role (optional)"
        icon={<Clock size={16} strokeWidth={2.4} />}
        isOpen={openSections.experience}
        onToggle={() => toggleSection('experience')}
      >
        <div className="space-y-4 pt-3">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Briefcase size={14} className="text-purple-600" />
              Current / Most Recent Job Title <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              placeholder="e.g., Software Engineer"
              className={`${baseInput} ${normalInput}`}
            />
            {currentTitle && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1.5">
                <CheckCircle2 size={12} />
                Current position set
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Building size={14} className="text-purple-600" />
              Current / Most Recent Company <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={currentCompany}
              onChange={(e) => setCurrentCompany(e.target.value)}
              placeholder="e.g., Techlogix Pakistan"
              className={`${baseInput} ${normalInput}`}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Clock size={14} className="text-purple-600" />
              Years of Experience <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={yearsOfExperience}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d{1,2}$/.test(val)) {
                  setYearsOfExperience(val);
                }
              }}
              placeholder="e.g., 5"
              className={`${baseInput} ${normalInput}`}
            />
            <p className="text-xs text-slate-400 mt-1">
              Fresher? Leave empty
            </p>
          </div>
        </div>
      </AccordionSection>

      {/* ============================================
          SECTION 4: YOUR SKILLS
      ============================================ */}
      <AccordionSection
        id="skills"
        title="Your Skills"
        subtitle="Technical and soft skills"
        icon={<Zap size={16} strokeWidth={2.4} />}
        isOpen={openSections.skills}
        onToggle={() => toggleSection('skills')}
        badge="Required"
      >
        <div className="pt-3">
          <SkillsSection
            skills={skills}
            setSkills={handleSkillsChange}
            enhanceSkills={noopEnhanceSkills}
            generating={generating}
            personalInfo={{ title: currentTitle || jobTitle }}
          />
        </div>
      </AccordionSection>

      {/* ============================================
          GENERATE BUTTON
      ============================================ */}
      <div className="pt-4 border-t border-slate-100 mt-4">
        <button
          onClick={onNext}
          disabled={!canProceed || generating}
          className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            (!canProceed || generating)
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 focus:outline-none focus:ring-4 focus:ring-purple-500/20'
          }`}
        >
          {generating ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating your letter...
            </>
          ) : (
            <>
              <SendHorizontal size={16} />
              Generate AI Letter
            </>
          )}
        </button>
        {!canProceed && !generating && (
          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-2">
            <AlertCircle size={12} />
            Please fill all required fields (*) before generating
          </p>
        )}
      </div>

    </div>
  );
};

export default Step1Details;