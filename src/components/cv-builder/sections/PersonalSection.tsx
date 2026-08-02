// PersonalSection.tsx - Phone Input with Dynamic Hint + Image Cropper

import React, { RefObject, useState, useRef, useEffect } from 'react';
import { PersonalInfo } from '../types/cvTypes';
import { countryCodes } from '../constants/cvDefaults';
import { validatePhoneNumber, formatPhoneNumber, getCountryFormat } from '../utils/phoneValidation';
import { validateAndSuggestEmail } from '../utils/aiGenerators';
import ImageCropperModal from '../components/ImageCropperModal';

interface PersonalSectionProps {
    personalInfo: PersonalInfo;
    updatePersonalInfo: (field: string, value: string) => void;
    selectedCountryCode: string;
    setSelectedCountryCode: (code: string) => void;
    phoneNumber: string;
    handlePhoneChange: (value: string) => void;
    profilePhoto: string | null;
    fileInputRef: RefObject<HTMLInputElement>;
    handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleChangePhoto: () => void;
    errors: { name: boolean; title: boolean; email: boolean; phone: boolean };
    phoneError: string;
}

const PersonalSection: React.FC<PersonalSectionProps> = ({
    personalInfo,
    updatePersonalInfo,
    selectedCountryCode,
    setSelectedCountryCode,
    phoneNumber,
    handlePhoneChange,
    profilePhoto,
    fileInputRef,
    handlePhotoUpload,
    handleChangePhoto,
    errors,
    phoneError
}) => {
    const currentCountry = countryCodes.find(c => c.code === selectedCountryCode);
    const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    // ✅ Image Cropper State
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);

    // ✅ Get dynamic placeholder based on country
    const getPhonePlaceholder = (): string => {
        const countryFormat = getCountryFormat(selectedCountryCode);
        if (countryFormat) {
            return countryFormat.example;
        }
        return currentCountry?.example || "3123456789";
    };

    const handleEmailChange = (value: string) => {
        updatePersonalInfo('email', value);
        if (value) {
            const validation = validateAndSuggestEmail(value);
            if (!validation.isValid && validation.suggestion) {
                setEmailSuggestion(validation.suggestion);
            } else {
                setEmailSuggestion(null);
            }
        } else {
            setEmailSuggestion(null);
        }
    };

    const applyEmailSuggestion = () => {
        if (emailSuggestion) {
            updatePersonalInfo('email', emailSuggestion);
            setEmailSuggestion(null);
        }
    };

    // ✅ Handle phone change with formatting
    const handlePhoneInputChange = (value: string) => {
        const formatted = formatPhoneNumber(value, selectedCountryCode);
        handlePhoneChange(formatted);
    };

    // ✅ Handle country change with re-formatting
    const handleCountryChange = (code: string) => {
        setSelectedCountryCode(code);
        if (phoneNumber) {
            const digitsOnly = phoneNumber.replace(/\D/g, '');
            const formatted = formatPhoneNumber(digitsOnly, code);
            handlePhoneChange(formatted);
        }
    };

    // ✅ Handle file selection - open cropper instead of saving directly
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

    // ✅ Save cropped image
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
                handlePhotoUpload(newEvent);
            });
    };

    // ✅ Cancel crop
    const handleCropCancel = () => {
        setTempImage(null);
        setIsCropModalOpen(false);
    };

    return (
        <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
            <p className="text-xs text-gray-500 mb-2">Fields marked with <span className="text-red-400">*</span> are required</p>
            
            {/* Full Name - Required */}
            <div>
                <label className="text-sm text-gray-300 mb-1 block">Full Name <span className="text-red-400">*</span></label>
                <input 
                    type="text" 
                    placeholder="e.g., Ahmed Khan" 
                    value={personalInfo.name} 
                    onChange={e => updatePersonalInfo('name', e.target.value)} 
                    className={`w-full p-3 rounded-xl bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-700'} text-white outline-none focus:border-purple-500`} 
                />
                {errors.name && <p className="text-xs text-red-400 mt-1">⚠ Full Name is required</p>}
            </div>
            
            {/* ✅ Job Title - Simple text input (Level removed) */}
            <div>
                <label className="text-sm text-gray-300 mb-1 block">Job Title <span className="text-red-400">*</span></label>
                <input 
                    ref={titleInputRef}
                    type="text" 
                    placeholder="e.g., Software Engineer" 
                    value={personalInfo.title} 
                    onChange={e => updatePersonalInfo('title', e.target.value)} 
                    className={`w-full p-3 rounded-xl bg-gray-800 border ${errors.title ? 'border-red-500' : 'border-gray-700'} text-white outline-none focus:border-purple-500`} 
                />
                {errors.title && <p className="text-xs text-red-400 mt-1">⚠ Job Title is required</p>}
            </div>
            
            {/* Email - Required with validation */}
            <div>
                <label className="text-sm text-gray-300 mb-1 block">Email <span className="text-red-400">*</span></label>
                <input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={personalInfo.email} 
                    onChange={e => handleEmailChange(e.target.value)} 
                    className={`w-full p-3 rounded-xl bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-700'} text-white outline-none focus:border-purple-500`} 
                />
                {errors.email && <p className="text-xs text-red-400 mt-1">⚠ Email is required</p>}
                {emailSuggestion && (
                    <p className="text-xs text-yellow-400 mt-1 flex items-center gap-2">
                        ⚠ Did you mean <button onClick={applyEmailSuggestion} className="text-purple-400 underline">{emailSuggestion}</button>?
                    </p>
                )}
            </div>
            
            {/* ✅ Phone Number - Full width centered country select */}
            <div>
                <label className="text-sm text-gray-300 mb-1 block">Phone Number <span className="text-red-400">*</span></label>
                <div className="space-y-2">
                    {/* Line 1: Dial code - Full width, centered text */}
                    <select 
                        value={selectedCountryCode} 
                        onChange={e => handleCountryChange(e.target.value)} 
                        className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-center outline-none focus:border-purple-500 appearance-none"
                        style={{ textAlignLast: 'center' }}
                    >
                        {countryCodes.map(cc => (
                            <option key={cc.code} value={cc.code} className="text-left">
                                {cc.flag} {cc.dialCode} ({cc.country})
                            </option>
                        ))}
                    </select>
                    
                    {/* Line 2: Number input - Full width */}
                    <input 
                        type="tel" 
                        placeholder={getPhonePlaceholder()} 
                        value={phoneNumber} 
                        onChange={e => handlePhoneInputChange(e.target.value)} 
                        className={`w-full p-3 rounded-xl bg-gray-800 border ${(errors.phone || phoneError) && phoneNumber ? 'border-red-500' : 'border-gray-700'} text-white text-center outline-none focus:border-purple-500`} 
                    />
                    
                    {/* Line 3: Validation message - Center aligned */}
                    <div className="flex justify-center items-center gap-2">
                        {phoneNumber ? (
                            phoneError ? (
                                <span className="text-xs text-red-400">⚠ {phoneError}</span>
                            ) : (
                                <span className="text-xs text-green-400">✓ Valid {currentCountry?.country} number</span>
                            )
                        ) : (
                            <span className="text-xs text-gray-500">
                                {currentCountry?.flag} {currentCountry?.country} • Example: {currentCountry?.example || "3123456789"}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Address - Optional */}
            <div>
                <label className="text-sm text-gray-300 mb-1 block">Address <span className="text-gray-500">(Optional)</span></label>
                <input 
                    type="text" 
                    placeholder="e.g., Faisalabad, Pakistan" 
                    value={personalInfo.address} 
                    onChange={e => updatePersonalInfo('address', e.target.value)} 
                    className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500" 
                />
            </div>
            
            {/* LinkedIn - Optional */}
            <div>
                <label className="text-sm text-gray-300 mb-1 block">LinkedIn URL <span className="text-gray-500">(Optional)</span></label>
                <input 
                    type="text" 
                    placeholder="https://linkedin.com/in/username" 
                    value={personalInfo.linkedin} 
                    onChange={e => updatePersonalInfo('linkedin', e.target.value)} 
                    className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500" 
                />
            </div>
            
            {/* GitHub - Optional */}
            <div>
                <label className="text-sm text-gray-300 mb-1 block">GitHub URL <span className="text-gray-500">(Optional)</span></label>
                <input 
                    type="text" 
                    placeholder="https://github.com/username" 
                    value={personalInfo.github} 
                    onChange={e => updatePersonalInfo('github', e.target.value)} 
                    className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500" 
                />
            </div>
            
            {/* Portfolio - Optional */}
            <div>
                <label className="text-sm text-gray-300 mb-1 block">Portfolio URL <span className="text-gray-500">(Optional)</span></label>
                <input 
                    type="text" 
                    placeholder="https://yourportfolio.com" 
                    value={personalInfo.portfolio} 
                    onChange={e => updatePersonalInfo('portfolio', e.target.value)} 
                    className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500" 
                />
            </div>
            
            {/* ✅ Profile Photo - Updated with Cropper */}
            <div>
                <label className="text-sm text-gray-300 mb-1 block">Profile Photo <span className="text-gray-500">(Optional)</span></label>
                <div className="flex items-center gap-3 flex-wrap">
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition text-sm"
                    >
                        📸 Upload Image
                    </button>
                    <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileSelect} 
                        className="hidden" 
                    />
                    {profilePhoto && (
                        <>
                            <span className="text-green-400 text-sm">✓ Photo added</span>
                            <button 
                                onClick={handleChangePhoto} 
                                className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-sm transition"
                            >
                                🔄 Change Image
                            </button>
                        </>
                    )}
                    {!profilePhoto && (
                        <span className="text-xs text-gray-500">PNG, JPEG, WEBP supported</span>
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
        </div>
    );
};

export default PersonalSection;