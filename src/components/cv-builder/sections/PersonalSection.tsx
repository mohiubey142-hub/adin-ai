// src/components/cv-builder/sections/PersonalSection.tsx
// =====================================================
// ✅ HYBRID IMAGE STORAGE — Compress on upload + IndexedDB save
// ✅ ZERO feature break: phone validation, email suggestion, cropper — all intact
// ✅ Image compress: 3MB → ~100KB (canvas, JPEG 0.75, max 400x400)
// ✅ Profile Photo section moved to TOP
// ✅ UPDATED: Smaller upload/remove buttons, bigger photo circle
// =====================================================

import React, { RefObject, useState, useRef } from 'react';
import {
    User, Briefcase, Mail, Phone, MapPin, Linkedin, Github, Globe,
    Camera, CheckCircle2, AlertCircle, Upload, Trash2, Loader2,
} from 'lucide-react';
import { PersonalInfo } from '../types/cvTypes';
import { countryCodes } from '../constants/cvDefaults';
import { formatPhoneNumber, getCountryFormat } from '../utils/phoneValidation';
import { validateAndSuggestEmail } from '../utils/aiGenerators';
import ImageCropperModal from '../components/ImageCropperModal';
import CountrySelect, { getDialCode } from '../components/CountrySelect';
// ✅ NEW: Compression helper
import { compressImage } from '../utils/imageUtils';

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
    onRemovePhoto?: () => void;
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
    onRemovePhoto,
    errors,
    phoneError,
}) => {
    const currentCountry = countryCodes.find(c => c.code === selectedCountryCode);
    const dialCode = currentCountry ? getDialCode(currentCountry) : selectedCountryCode;
    // ✅ FIX: formatters already put the dial code inside phoneNumber ("+92 312 ..."),
    // so strip it for display — the input prepends dialCode itself (no duplicate).
    const displayPhone = (() => {
        const dialDigits = dialCode.replace(/\D/g, '');
        const n = (phoneNumber || '').trim();
        if (n.startsWith('+' + dialDigits)) return n.slice(dialDigits.length + 1).trim();
        if (n.startsWith('+')) return n.replace(/^\+\d{1,4}\s+/, '').trim();
        return n;
    })();
    const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);
    // ✅ NEW: loading state during compression
    const [isCompressing, setIsCompressing] = useState(false);

    // =====================================================
    // Phone helpers — UNCHANGED
    // =====================================================
    const getPhonePlaceholder = (): string => {
        const countryFormat = getCountryFormat(selectedCountryCode);
        if (countryFormat) return countryFormat.example;
        return currentCountry?.example || '3123456789';
    };

    // =====================================================
    // Email helpers — UNCHANGED
    // =====================================================
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

    // =====================================================
    // Phone handlers — UNCHANGED
    // =====================================================
    // Input shows "+92 3123456789"; we strip the dial-code prefix before formatting
    const handlePhoneInputChange = (raw: string) => {
        let rest = raw;
        if (raw.startsWith(dialCode)) {
            rest = raw.slice(dialCode.length);
        } else {
            const i = raw.indexOf(' ');
            rest = i >= 0 ? raw.slice(i) : '';
        }
        const formatted = formatPhoneNumber(rest.replace(/\D/g, ''), selectedCountryCode);
        handlePhoneChange(formatted);
    };

    const handleCountryChange = (code: string) => {
        setSelectedCountryCode(code);
        if (phoneNumber) {
            const digitsOnly = phoneNumber.replace(/\D/g, '');
            const formatted = formatPhoneNumber(digitsOnly, code);
            handlePhoneChange(formatted);
        }
    };

    // =====================================================
    // ✅ UPDATED: File select with size validation
    // =====================================================
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // ✅ Hard limit: 10MB (before compression)
            if (file.size > 10 * 1024 * 1024) {
                alert('Image too large (max 10MB). Please choose a smaller image.');
                e.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setIsCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    // =====================================================
    // ✅ UPDATED: Crop save — compress then pass to parent
    // =====================================================
    const handleCropSave = async (croppedImage: string) => {
        setIsCompressing(true);
        try {
            // ✅ Step 1: Compress (3MB → ~100KB)
            const result = await compressImage(croppedImage, {
                maxWidth: 400,
                maxHeight: 400,
                quality: 0.75,
                format: 'image/jpeg',
            });

            console.log(
                `📸 Image compressed: ${result.originalKB}KB → ${result.sizeKB}KB (${result.savedPercent}% saved)`
            );

            // ✅ Step 2: Convert compressed dataURL → File → pass to parent
            const blob = await fetch(result.dataUrl).then(r => r.blob());
            const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            const newEvent = {
                target: { files: dataTransfer.files },
            } as unknown as React.ChangeEvent<HTMLInputElement>;

            handlePhotoUpload(newEvent);

            // ✅ Show compression info (only if meaningful savings)
            if (result.savedPercent >= 30) {
                console.log(
                    `✅ Photo optimized: ${result.originalKB}KB → ${result.sizeKB}KB`
                );
            }

            // ✅ Close crop modal
            setTempImage(null);
            setIsCropModalOpen(false);
        } catch (err) {
            console.error('Failed to compress image:', err);
            alert('Failed to process image. Please try a different photo.');
        } finally {
            setIsCompressing(false);
        }
    };

    const handleCropCancel = () => {
        setTempImage(null);
        setIsCropModalOpen(false);
    };

    // =====================================================
    // Remove photo — UNCHANGED (parent handles IndexedDB delete)
    // =====================================================
    const handleRemovePhotoClick = () => {
        if (onRemovePhoto) {
            onRemovePhoto();
        } else {
            console.warn('[PersonalSection] onRemovePhoto handler not connected from parent yet.');
        }
    };

    // =====================================================
    // Input styles
    // =====================================================
    const baseInput =
        'w-full rounded-xl bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-4 py-3 text-sm';
    const normalInput =
        'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-slate-300';
    const errorInput =
        'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10';

    return (
        <div className="space-y-5">
            {/* ============ PROFILE PHOTO (MOVED TO TOP) ============ */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Profile Photo
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    {/* ✅ BIGGER PHOTO CIRCLE: 16 → 24 (64px → 96px) */}
                    {profilePhoto ? (
                        <div className="relative flex-shrink-0">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 p-0.5 shadow-md shadow-purple-600/20">
                                <img
                                    src={profilePhoto}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover bg-white"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                                <CheckCircle2 size={13} className="text-white" strokeWidth={3} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-shrink-0 w-24 h-24 rounded-full bg-white border-2 border-dashed border-slate-200 flex items-center justify-center">
                            <Camera size={28} className="text-slate-400" />
                        </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* ✅ SMALLER UPLOAD BUTTON: px-4 py-2.5 → px-3 py-1.5 */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isCompressing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-xs font-semibold transition-all duration-200 shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 focus:outline-none focus:ring-4 focus:ring-purple-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isCompressing ? (
                                <>
                                    <Loader2 size={12} className="animate-spin" />
                                    Optimizing...
                                </>
                            ) : (
                                <>
                                    <Upload size={12} />
                                    {profilePhoto ? 'Replace' : 'Upload'}
                                </>
                            )}
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {profilePhoto && (
                            <button
                                onClick={handleRemovePhotoClick}
                                disabled={isCompressing}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 text-red-600 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-500/15 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Trash2 size={12} />
                                Remove
                            </button>
                        )}

                        {!profilePhoto && !isCompressing && (
                            <span className="text-[10px] text-slate-400">
                                PNG, JPEG, WEBP
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ============ FULL NAME ============ */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                    <User size={14} className="text-purple-600" />
                    Full Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    placeholder="e.g., Ahmed Khan"
                    value={personalInfo.name}
                    onChange={e => updatePersonalInfo('name', e.target.value)}
                    className={`${baseInput} ${errors.name ? errorInput : normalInput}`}
                />
                {errors.name && (
                    <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
                        <AlertCircle size={13} />
                        Full Name is required
                    </p>
                )}
            </div>

            {/* ============ JOB TITLE ============ */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                    <Briefcase size={14} className="text-purple-600" />
                    Job Title <span className="text-red-500">*</span>
                </label>
                <input
                    ref={titleInputRef}
                    type="text"
                    placeholder="e.g., Software Engineer"
                    value={personalInfo.title}
                    onChange={e => updatePersonalInfo('title', e.target.value)}
                    className={`${baseInput} ${errors.title ? errorInput : normalInput}`}
                />
                {errors.title && (
                    <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
                        <AlertCircle size={13} />
                        Job Title is required
                    </p>
                )}
            </div>

            {/* ============ EMAIL ============ */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                    <Mail size={14} className="text-purple-600" />
                    Email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    placeholder="you@example.com"
                    value={personalInfo.email}
                    onChange={e => handleEmailChange(e.target.value)}
                    className={`${baseInput} ${errors.email ? errorInput : normalInput}`}
                />
                {errors.email && (
                    <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
                        <AlertCircle size={13} />
                        Email is required
                    </p>
                )}
                {emailSuggestion && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                        <AlertCircle size={13} className="flex-shrink-0" />
                        <span>
                            Did you mean{' '}
                            <button
                                onClick={applyEmailSuggestion}
                                className="font-semibold text-purple-700 underline decoration-purple-300 hover:decoration-purple-600 underline-offset-2 transition-colors"
                            >
                                {emailSuggestion}
                            </button>
                            ?
                        </span>
                    </div>
                )}
            </div>

            {/* ============ PHONE ============ */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                    <Phone size={14} className="text-purple-600" />
                    Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                    <CountrySelect value={selectedCountryCode} onChange={handleCountryChange} />
                    <input
                        type="tel"
                        placeholder={getPhonePlaceholder()}
                        value={`${dialCode} ${displayPhone}`}
                        onChange={e => handlePhoneInputChange(e.target.value)}
                        className={`${baseInput} text-center tracking-wide ${
                            (errors.phone || phoneError) && phoneNumber ? errorInput : normalInput
                        }`}
                    />
                    <div className="flex justify-center">
                        {phoneNumber ? (
                            phoneError ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-xs font-medium text-red-600">
                                    <AlertCircle size={12} />
                                    {phoneError}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-600">
                                    <CheckCircle2 size={12} />
                                    Valid {currentCountry?.country} number
                                </span>
                            )
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-100 text-xs text-slate-500">
                                <span>{currentCountry?.flag}</span>
                                <span>{currentCountry?.country} • Example: {currentCountry?.example || '3123456789'}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ============ ADDRESS ============ */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                    <MapPin size={14} className="text-purple-600" />
                    Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                    type="text"
                    placeholder="e.g., Faisalabad, Pakistan"
                    value={personalInfo.address}
                    onChange={e => updatePersonalInfo('address', e.target.value)}
                    className={`${baseInput} ${normalInput}`}
                />
            </div>

            {/* ============ ONLINE PRESENCE ============ */}
            <div className="pt-1">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Online Presence
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                            <Linkedin size={14} className="text-purple-600" />
                            LinkedIn URL <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="https://linkedin.com/in/username"
                            value={personalInfo.linkedin}
                            onChange={e => updatePersonalInfo('linkedin', e.target.value)}
                            className={`${baseInput} ${normalInput}`}
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                            <Github size={14} className="text-purple-600" />
                            GitHub URL <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="https://github.com/username"
                            value={personalInfo.github}
                            onChange={e => updatePersonalInfo('github', e.target.value)}
                            className={`${baseInput} ${normalInput}`}
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                            <Globe size={14} className="text-purple-600" />
                            Portfolio URL <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="https://yourportfolio.com"
                            value={personalInfo.portfolio}
                            onChange={e => updatePersonalInfo('portfolio', e.target.value)}
                            className={`${baseInput} ${normalInput}`}
                        />
                    </div>
                </div>
            </div>

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