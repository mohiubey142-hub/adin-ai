// steps/Step1Details.tsx
import React, { useRef, useState } from 'react';
import { Upload, X, User, Mail, Phone, MapPin, Linkedin, GraduationCap, Briefcase, Wrench, Award, FolderOpen, FileText, Building, Globe, ChevronDown } from 'lucide-react';
import { countryCodes } from '../constants/cvDefaults';
import ImageCropperModal from '../components/ImageCropperModal';

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
  education: string;
  setEducation: (value: string) => void;
  experience: string;
  setExperience: (value: string) => void;
  skills: string;
  setSkills: (value: string) => void;
  jobTitle: string;
  setJobTitle: (value: string) => void;
  company: string;
  setCompany: (value: string) => void;
  jobDescription: string;
  setJobDescription: (value: string) => void;
  additionalInfo: string;
  setAdditionalInfo: (value: string) => void;
  profilePhoto: string | null;
  setProfilePhoto: (value: string | null) => void;
  projects: string;
  setProjects: (value: string) => void;
  onNext?: () => void;
  generating?: boolean;
  currentPosition?: string;
  setCurrentPosition?: (value: string) => void;
}

const Step1Details: React.FC<Step1DetailsProps> = ({
  userName,
  setUserName,
  email,
  setEmail,
  phoneNumber,
  setPhoneNumber,
  selectedCountryCode,
  setSelectedCountryCode,
  address,
  setAddress,
  linkedin,
  setLinkedin,
  education,
  setEducation,
  experience,
  setExperience,
  skills,
  setSkills,
  jobTitle,
  setJobTitle,
  company,
  setCompany,
  jobDescription,
  setJobDescription,
  additionalInfo,
  setAdditionalInfo,
  profilePhoto,
  setProfilePhoto,
  projects,
  setProjects,
  onNext,
  generating = false,
  currentPosition = '',
  setCurrentPosition = () => {},
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  // ✅ Image Cropper State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);

  // ============================================================
  // ===== PHONE VALIDATION FOR ALL COUNTRIES =====
  // ============================================================
  const validatePhoneForCountry = (phone: string, countryCode: string): { isValid: boolean; message: string } => {
    if (!phone) {
      return { isValid: false, message: 'Phone number is required' };
    }
    
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (!/^\d+$/.test(digitsOnly)) {
      return { isValid: false, message: 'Please enter a valid phone number (digits only)' };
    }
    
    const country = countryCodes.find(c => c.code === countryCode);
    if (!country) {
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return { isValid: false, message: 'Please enter a valid phone number (7-15 digits)' };
      }
      return { isValid: true, message: '✓ Valid phone number' };
    }
    
    if (digitsOnly.length !== country.length) {
      return { 
        isValid: false, 
        message: `${country.flag} ${country.country} phone number must be exactly ${country.length} digits (e.g., ${country.example})` 
      };
    }
    
    return { isValid: true, message: `✓ Valid ${country.country} phone number` };
  };

  const phoneValidation = validatePhoneForCountry(phoneNumber, selectedCountryCode);
  const isPhoneValid = phoneValidation.isValid;
  const phoneValidationMessage = phoneValidation.message;

  // ============================================
  // EDUCATION SPLIT STATE
  // ============================================
  const [degree, setDegree] = useState('');
  const [university, setUniversity] = useState('');
  const [cgpa, setCgpa] = useState('');

  const updateEducation = (deg: string, uni: string, cg: string) => {
    let edu = '';
    if (deg) edu += deg;
    if (uni) edu += `, ${uni}`;
    if (cg) edu += ` (CGPA: ${cg})`;
    setEducation(edu);
  };

  React.useEffect(() => {
    if (education) {
      const cgpaMatch = education.match(/CGPA:\s*([\d.]+)/i);
      if (cgpaMatch) {
        setCgpa(cgpaMatch[1]);
      }
      
      let eduWithoutCGPA = education.replace(/\(CGPA:\s*[\d.]+\)/i, '').trim();
      
      const parts = eduWithoutCGPA.split(',').map(s => s.trim());
      if (parts.length >= 2) {
        setDegree(parts[0]);
        setUniversity(parts.slice(1).join(', '));
      } else if (parts.length === 1) {
        setDegree(parts[0]);
      }
    }
  }, [education]);

  const handleDegreeChange = (value: string) => {
    setDegree(value);
    updateEducation(value, university, cgpa);
  };

  const handleUniversityChange = (value: string) => {
    setUniversity(value);
    updateEducation(degree, value, cgpa);
  };

  const handleCgpaChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const limited = cleaned.slice(0, 4);
    setCgpa(limited);
    updateEducation(degree, university, limited);
  };

  // ✅ UPDATED: Handle photo selection - open cropper instead of saving directly
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // ✅ Save cropped image (same as CV Builder)
  const handleCropSave = (croppedImage: string) => {
    fetch(croppedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const newEvent = {
          target: { files: dataTransfer.files }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        // ✅ Use the same flow as original handlePhotoUpload
        handlePhotoUpload(newEvent);
      });
  };

  // ✅ Keep original handlePhotoUpload for compatibility with cropper
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Cancel crop
  const handleCropCancel = () => {
    setTempImage(null);
    setIsCropModalOpen(false);
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredCountries = countryCodes.filter(country =>
    country.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.includes(countrySearch)
  );

  const selectedCountry = countryCodes.find(c => c.code === selectedCountryCode);

  const validateEducation = (edu: string): { isValid: boolean; message: string } => {
    if (!edu) {
      return { isValid: false, message: 'Education is required' };
    }
    const parts = edu.split(',');
    const hasDegree = parts.length > 0 && parts[0].trim().length > 0;
    const hasUniversity = parts.length > 1 && parts[1].trim().length > 0;
    
    if (!hasDegree) {
      return { isValid: false, message: 'Degree is required' };
    }
    if (!hasUniversity) {
      return { isValid: false, message: 'University is required' };
    }
    return { isValid: true, message: '✓ Complete' };
  };

  const educationValidation = validateEducation(education);

  // ============================================
  // ✅ VALIDATION FOR NEXT BUTTON
  // ============================================
  const isEducationValid = (): boolean => {
    if (!education) return false;
    const parts = education.split(',');
    const hasDegree = parts.length > 0 && parts[0].trim().length > 0;
    const hasUniversity = parts.length > 1 && parts[1].trim().length > 0;
    return hasDegree && hasUniversity;
  };

  // ✅ SKILLS VALIDATION - at least one skill required
  const isSkillsValid = (): boolean => {
    if (!skills) return false;
    const skillList = skills.split(',').filter(s => s.trim().length > 0);
    return skillList.length > 0;
  };

  // ✅ CURRENT POSITION VALIDATION - required
  const isCurrentPositionValid = (): boolean => {
    return !!(currentPosition && currentPosition.trim().length > 0);
  };

  // ✅ UPDATED: canProceed with currentPosition
  const canProceed = userName && jobTitle && company && email && email.includes('@gmail.com') && isPhoneValid && isEducationValid() && isSkillsValid() && isCurrentPositionValid();

  return (
    <div className="space-y-5">
      {/* ✅ Profile Photo - Updated with Cropper */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="relative flex-shrink-0">
          {profilePhoto ? (
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-lg shadow-purple-500/20">
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              <button
                onClick={removePhoto}
                className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all duration-300 shadow-lg text-xs sm:text-sm"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-purple-500/40 bg-gray-800/50 flex items-center justify-center cursor-pointer hover:border-purple-500/80 hover:bg-gray-700/50 transition-all duration-300 group"
            >
              <div className="text-center">
                <User size={24} className="text-gray-500 mx-auto group-hover:text-purple-400 transition-colors sm:size-28" />
                <span className="text-[8px] sm:text-[10px] text-gray-500 group-hover:text-purple-400 transition-colors">Add Photo</span>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm text-gray-300 font-medium">Profile Photo</p>
          <p className="text-xs text-gray-500">Upload a professional photo (optional)</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-medium transition-all duration-300 hover:scale-105"
          >
            <Upload size={12} className="inline mr-1" /> Upload
          </button>
          {profilePhoto && (
            <span className="text-xs text-green-400 ml-2">✓ Photo added</span>
          )}
        </div>
      </div>

      {/* ✅ Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropModalOpen}
        imageSrc={tempImage}
        onClose={handleCropCancel}
        onCropSave={handleCropSave}
      />

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
          <User size={16} className="text-purple-400 flex-shrink-0" />
          <span>Full Name <span className="text-red-400 text-xs">*</span></span>
        </label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="e.g., John Doe"
          className="w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm sm:text-base"
        />
        {userName && <p className="text-xs text-green-400 mt-1">✓ Valid name</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
          <Mail size={16} className="text-purple-400 flex-shrink-0" />
          <span>Email Address <span className="text-red-400 text-xs">*</span></span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gmail.com"
          className="w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm sm:text-base"
        />
        {email && (
          <p className={`text-xs mt-1 ${email.includes('@gmail.com') ? 'text-green-400' : 'text-red-400'}`}>
            {email.includes('@gmail.com') ? '✓ Valid Gmail address' : '⚠️ Please use a Gmail address (@gmail.com)'}
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
          <Phone size={16} className="text-purple-400 flex-shrink-0" />
          <span>Phone Number <span className="text-red-400 text-xs">*</span></span>
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white hover:border-purple-500 transition-all duration-300 w-full sm:w-auto justify-center"
            >
              <span>{selectedCountry?.flag || '🌍'}</span>
              <span className="text-sm">{selectedCountryCode}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCountryDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 max-h-48 overflow-y-auto rounded-xl bg-gray-800 border border-gray-700 shadow-2xl z-50">
                <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-700">
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder="Search country..."
                    className="w-full px-3 py-1.5 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none"
                  />
                </div>
                <div className="p-1">
                  {filteredCountries.map((country) => (
                    <button
                      // ✅ FIXED: Unique key using country.code + country.country to avoid duplicates
                      key={`${country.code}-${country.country}`}
                      onClick={() => {
                        setSelectedCountryCode(country.code);
                        setIsCountryDropdownOpen(false);
                        setCountrySearch('');
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all duration-200 ${
                        selectedCountryCode === country.code
                          ? 'bg-purple-600/30 text-purple-300'
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <span>{country.flag}</span>
                      <span className="truncate">{country.country}</span>
                      <span className="text-gray-500 text-xs ml-auto flex-shrink-0">{country.code}</span>
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
            className={`flex-1 px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border ${
              phoneNumber && !isPhoneValid ? 'border-red-500/50' : 'border-gray-700'
            } text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm sm:text-base`}
          />
        </div>
        
        {phoneNumber && (
          <p className={`text-xs mt-1 ${isPhoneValid ? 'text-green-400' : 'text-red-400'}`}>
            {phoneValidationMessage}
          </p>
        )}
        
        {selectedCountry && (
          <p className="text-[10px] text-gray-500 mt-0.5 truncate">
            {selectedCountry.flag} {selectedCountry.country}: {selectedCountry.length} digits (e.g., {selectedCountry.example})
          </p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
          <MapPin size={16} className="text-purple-400 flex-shrink-0" />
          <span>Address</span>
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="City, Country"
          className="w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm sm:text-base"
        />
      </div>

      {/* LinkedIn */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
          <Linkedin size={16} className="text-purple-400 flex-shrink-0" />
          <span>LinkedIn Profile</span>
        </label>
        <input
          type="url"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          placeholder="https://linkedin.com/in/yourprofile"
          className="w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm sm:text-base"
        />
      </div>

      <hr className="border-gray-700/50 my-4" />

      {/* Job Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
          <Briefcase size={16} className="text-purple-400 flex-shrink-0" />
          <span>Job Title <span className="text-red-400 text-xs">*</span></span>
        </label>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g., Software Engineer"
          className="w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm sm:text-base"
        />
        {jobTitle && <p className="text-xs text-green-400 mt-1">✓ Job title set</p>}
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
          <Building size={16} className="text-purple-400 flex-shrink-0" />
          <span>Company Name <span className="text-red-400 text-xs">*</span></span>
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g., Techlogix Pakistan"
          className="w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm sm:text-base"
        />
        {company && <p className="text-xs text-green-400 mt-1">✓ Company set</p>}
      </div>

      {/* ✅ UPDATED: Current Position - Now REQUIRED */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
          <Briefcase size={16} className="text-purple-400 flex-shrink-0" />
          <span>Current Position <span className="text-red-400 text-xs">*</span></span>
        </label>
        <input
          type="text"
          value={currentPosition}
          onChange={(e) => setCurrentPosition(e.target.value)}
          placeholder="e.g., Senior Software Engineer at Google"
          className="w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm sm:text-base"
        />
        {currentPosition && currentPosition.trim().length > 0 && (
          <p className="text-xs text-green-400 mt-1">✓ Current position set</p>
        )}
      </div>

      <hr className="border-gray-700/50 my-4" />

      {/* Education */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
          <GraduationCap size={16} className="text-purple-400 flex-shrink-0" />
          <span>Education <span className="text-red-400 text-xs">*</span></span>
        </label>
        
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Degree</label>
          <input
            type="text"
            value={degree}
            onChange={(e) => handleDegreeChange(e.target.value)}
            placeholder="e.g., BS Computer Science"
            className="w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm sm:text-base"
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">University</label>
          <input
            type="text"
            value={university}
            onChange={(e) => handleUniversityChange(e.target.value)}
            placeholder="e.g., Lahore University"
            className="w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">CGPA (Optional)</label>
          <input
            type="text"
            value={cgpa}
            onChange={(e) => handleCgpaChange(e.target.value)}
            placeholder="e.g., 3.5"
            className="w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm sm:text-base"
          />
          <p className="text-xs text-gray-500 mt-1">Format: 3.5 (max 4 characters)</p>
        </div>

        {education && (
          <p className={`text-xs mt-2 ${educationValidation.isValid ? 'text-green-400' : 'text-red-400'}`}>
            {educationValidation.message}
          </p>
        )}
      </div>

      <hr className="border-gray-700/50 my-4" />

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
          <Briefcase size={16} className="text-purple-400 flex-shrink-0" />
          <span>Experience Summary</span>
        </label>
        <textarea
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="e.g., developing full-stack applications, leading teams, building scalable solutions"
          rows={2}
          className="w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 resize-none text-sm sm:text-base"
        />
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
          <Wrench size={16} className="text-purple-400 flex-shrink-0" />
          <span>Skills <span className="text-red-400 text-xs">*</span></span>
        </label>
        <input
          type="text"
          value={skills}
          onChange={(e) => {
            let value = e.target.value;
            value = value.replace(/\s*,\s*/g, ', ');
            value = value.replace(/,+/g, ',');
            value = value.replace(/\s+,/g, ',');
            value = value.replace(/,(\S)/g, ', $1');
            setSkills(value);
          }}
          placeholder="JavaScript, React, Node.js, Python, Docker"
          className="w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm sm:text-base"
        />
        {skills && (
          <p className="text-[10px] text-gray-500 mt-1">
            {skills.split(',').filter(s => s.trim()).length} skill{skills.split(',').filter(s => s.trim()).length > 1 ? 's' : ''} listed
          </p>
        )}
      </div>

      {/* Projects */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
          <FolderOpen size={16} className="text-purple-400 flex-shrink-0" />
          <span>Projects</span>
        </label>
        <textarea
          value={projects}
          onChange={(e) => setProjects(e.target.value)}
          placeholder="e.g., built a full-stack e-commerce platform serving 500+ daily users, developed an AI chatbot that reduced response time by 30%"
          rows={2}
          className="w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 resize-none text-sm sm:text-base"
        />
        <p className="text-xs text-gray-500 mt-1">Include numbers/percentages for best results</p>
      </div>

      {/* Additional Info / Achievements */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
          <Award size={16} className="text-purple-400 flex-shrink-0" />
          <span>Achievements</span>
        </label>
        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="e.g., reduced deployment time by 35%, increased revenue by 20%, led a team of 10"
          rows={2}
          className="w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 resize-none text-sm sm:text-base"
        />
        <p className="text-xs text-gray-500 mt-1">Include numbers/percentages for best results</p>
      </div>

      {/* Job Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
          <FileText size={16} className="text-purple-400 flex-shrink-0" />
          <span>Job Description</span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here for ATS optimization..."
          rows={3}
          className="w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 resize-none text-sm sm:text-base"
        />
        {jobDescription && (
          <p className="text-[10px] text-gray-500 mt-1">
            {jobDescription.split(/\s+/).filter(w => w.length > 0).length} words
          </p>
        )}
      </div>

      {/* Required Fields Summary */}
      <div className="pt-4 border-t border-gray-700/50">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Required Fields</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${userName ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-400 truncate">Full Name</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${email && email.includes('@gmail.com') ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-400 truncate">Email (@gmail.com)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isPhoneValid ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-400 truncate">Phone Number</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${educationValidation.isValid ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-400 truncate">Education</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${jobTitle ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-400 truncate">Job Title</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${company ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-400 truncate">Company</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isSkillsValid() ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-400 truncate">Skills</span>
          </div>
          {/* ✅ CURRENT POSITION ADDED TO REQUIRED FIELDS */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isCurrentPositionValid() ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-400 truncate">Current Position</span>
          </div>
        </div>
      </div>

      {/* ============================================================
          ✅ "Next" Button - Content ke sath scroll karega
          ============================================================ */}
      <div className="pt-4 border-t border-purple-500/20">
        <button
          onClick={onNext}
          disabled={!canProceed || generating}
          className={`w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white font-medium transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 ${
            (!canProceed || generating) ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
          }`}
        >
          {generating ? 'Generating...' : 'Next →'}
        </button>
        {!canProceed && (
          <p className="text-xs text-red-400 mt-2 text-center">
            Please fill all required fields (*) before proceeding
          </p>
        )}
      </div>
    </div>
  );
};

export default Step1Details;