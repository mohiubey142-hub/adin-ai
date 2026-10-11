import React from 'react';
import { CVPreviewProps } from '../types/previewTypes';
// ✅ SAHI IMPORT - preview/utils/ se
import { getContactInfo } from '../utils/contactHelpers';
import {
    renderBulletPoints,
    safeText,
    cleanBulletText,
    hasContent,
    hasStringContent,
    filterValidItems
} from '../utils/renderHelpers';
import { useTemplateStyles } from '../../hooks/useTemplateStyles';

const TealCurveTemplate: React.FC<CVPreviewProps> = (props) => {
    const {
        personalInfo,
        phoneNumber,
        selectedCountryCode,
        professionalSummary,
        experiences,
        educations,
        projects,
        certifications,
        languages,
        achievements,
        skills,
        profilePhoto,
        template
    } = props;

    const { styles } = useTemplateStyles(template);

    // Contact info (without emojis for clean look)
    const contactInfo = getContactInfo(personalInfo, phoneNumber, selectedCountryCode);
    
    // Check if sections have content
    const hasAbout = hasStringContent(professionalSummary);
    const hasExperience = hasContent(experiences, ['title', 'company']);
    const hasEducation = hasContent(educations, ['degree', 'institution']);
    const hasProjects = hasContent(projects, ['name']);
    const hasLanguages = hasContent(languages, ['language']);
    const hasCertifications = hasContent(certifications, ['name']);
    const hasAchievements = hasContent(achievements, ['title']);
    const hasSkills = hasStringContent(skills);

    // Filter valid items
    const validExperiences = filterValidItems(experiences, ['title', 'company']);
    const validEducations = filterValidItems(educations, ['degree', 'institution']);
    const validProjects = filterValidItems(projects, ['name']);
    const validCertifications = filterValidItems(certifications, ['name']);
    const validAchievements = filterValidItems(achievements, ['title']);
    const validLanguages = filterValidItems(languages, ['language']);

    // Parse skills for tag rendering
    const skillItems = skills 
        ? skills.split('\n')
            .map(line => cleanBulletText(line))
            .filter(s => s && s.length > 0)
        : [];

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden font-sans max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row min-h-[600px]">
                
                {/* ===== SIDEBAR - Dark Teal ===== */}
                <div className="w-full md:w-[280px] bg-[#1a4a4a] text-white p-6 flex-shrink-0">
                    
                    {/* Profile Photo */}
                    {profilePhoto && (
                        <div className="flex justify-center mb-5">
                            <div className="w-28 h-28 rounded-full border-3 border-teal-300/40 overflow-hidden shadow-lg">
                                <img 
                                    src={profilePhoto} 
                                    alt={personalInfo.name || 'Profile'} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Name */}
                    <h1 className="text-2xl font-bold text-white text-center leading-tight">
                        {safeText(personalInfo.name?.toUpperCase() || 'YOUR NAME')}
                    </h1>
                    
                    {/* Title */}
                    <p className="text-teal-300 text-sm text-center mt-1 font-light">
                        {safeText(personalInfo.title || 'PROFESSIONAL TITLE')}
                    </p>

                    {/* Decorative Line */}
                    <div className="w-10 h-0.5 bg-teal-400/40 mx-auto my-4 rounded-full"></div>

                    {/* ===== CONTACT ===== */}
                    <div className="mt-4">
                        <h3 className="text-[10px] font-semibold text-teal-300 uppercase tracking-wider mb-3">
                            Contact
                        </h3>
                        <div className="space-y-2 text-sm text-gray-200">
                            {contactInfo.map((contact, i) => (
                                <div key={i} className="flex items-start gap-2 break-all">
                                    <span className="text-teal-300 flex-shrink-0 mt-0.5">•</span>
                                    <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                        {safeText(contact)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ===== EDUCATION ===== */}
                    {hasEducation && (
                        <div className="mt-5">
                            <h3 className="text-[10px] font-semibold text-teal-300 uppercase tracking-wider mb-3">
                                Education
                            </h3>
                            <div className="space-y-3">
                                {validEducations.map((edu, i) => (
                                    <div key={i}>
                                        <h4 className="font-semibold text-sm text-white break-words overflow-wrap-anywhere">
                                            {safeText(edu.degree || 'Degree')}
                                        </h4>
                                        <p className="text-sm text-teal-200 break-words overflow-wrap-anywhere">
                                            {safeText(edu.institution || 'Institution')}
                                        </p>
                                        {(edu.startDate || edu.endDate || edu.year) && (
                                            <p className="text-xs text-gray-300 mt-0.5">
                                                {safeText(edu.startDate || '')} 
                                                {edu.startDate && edu.endDate ? ' — ' : ''} 
                                                {safeText(edu.endDate || '')}
                                                {edu.year && !edu.startDate && !edu.endDate ? safeText(edu.year) : ''}
                                                {edu.grade && ` | ${safeText(edu.grade)}`}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== LANGUAGES ===== */}
                    {hasLanguages && (
                        <div className="mt-5">
                            <h3 className="text-[10px] font-semibold text-teal-300 uppercase tracking-wider mb-3">
                                Languages
                            </h3>
                            <div className="space-y-1 text-sm">
                                {validLanguages.map((lang, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-white break-words overflow-wrap-anywhere">
                                            {safeText(lang.language || '')}
                                        </span>
                                        {lang.proficiency && (
                                            <span className="text-teal-300 text-xs">({safeText(lang.proficiency)})</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== SKILLS ===== */}
                    {hasSkills && skillItems.length > 0 && (
                        <div className="mt-5">
                            <h3 className="text-[10px] font-semibold text-teal-300 uppercase tracking-wider mb-3">
                                Skills
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {skillItems.map((skill, i) => (
                                    <span 
                                        key={i} 
                                        className="bg-teal-700/30 text-teal-100 text-xs px-2.5 py-1 rounded-full border border-teal-500/20 break-words overflow-wrap-anywhere"
                                    >
                                        {safeText(skill)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== MAIN CONTENT ===== */}
                <div className="flex-1 p-6 bg-white min-w-0">
                    
                    {/* ===== SUMMARY ===== */}
                    {hasAbout && (
                        <div className="mb-5">
                            <h2 className="text-xs font-bold text-[#1a4a4a] uppercase tracking-wider border-b-2 border-teal-200 pb-2 mb-3">
                                Professional Summary
                            </h2>
                            <p className="text-gray-700 text-sm leading-relaxed break-words overflow-wrap-anywhere">
                                {safeText(professionalSummary)}
                            </p>
                        </div>
                    )}

                    {/* ===== EXPERIENCE ===== */}
                    {hasExperience && (
                        <div className="mb-5">
                            <h2 className="text-xs font-bold text-[#1a4a4a] uppercase tracking-wider border-b-2 border-teal-200 pb-2 mb-3">
                                Work Experience
                            </h2>
                            <div className="space-y-4">
                                {validExperiences.map((exp, i) => (
                                    <div key={i}>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-gray-800 text-sm break-words overflow-wrap-anywhere">
                                                    {safeText(exp.title || 'Position')}
                                                </h3>
                                                <p className="text-sm text-[#1a4a4a] font-medium break-words overflow-wrap-anywhere">
                                                    {safeText(exp.company || 'Company')}
                                                </p>
                                            </div>
                                            {(exp.startDate || exp.endDate) && (
                                                <p className="text-xs text-gray-500 flex-shrink-0">
                                                    {safeText(exp.startDate || '')} 
                                                    {exp.startDate && exp.endDate ? ' — ' : ''} 
                                                    {safeText(exp.endDate || 'Present')}
                                                </p>
                                            )}
                                        </div>
                                        {exp.description && (
                                            <div className="mt-1.5 text-gray-600 text-sm">
                                                {renderBulletPoints(exp.description, 'text-gray-600')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== PROJECTS ===== */}
                    {hasProjects && (
                        <div className="mb-5">
                            <h2 className="text-xs font-bold text-[#1a4a4a] uppercase tracking-wider border-b-2 border-teal-200 pb-2 mb-3">
                                Projects
                            </h2>
                            <div className="space-y-3">
                                {validProjects.map((proj, i) => (
                                    <div key={i}>
                                        <h3 className="font-semibold text-gray-800 text-sm break-words overflow-wrap-anywhere">
                                            {safeText(proj.name || 'Project')}
                                            {proj.tech && (
                                                <span className="font-normal text-teal-700 text-xs ml-2 break-words overflow-wrap-anywhere">
                                                    ({safeText(proj.tech)})
                                                </span>
                                            )}
                                        </h3>
                                        {proj.description && (
                                            <p className="text-sm text-gray-600 mt-1 break-words overflow-wrap-anywhere">
                                                {safeText(proj.description)}
                                            </p>
                                        )}
                                        {proj.link && (
                                            <a 
                                                href={proj.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-teal-700 text-xs hover:underline inline-block mt-0.5 break-words overflow-wrap-anywhere"
                                            >
                                                🔗 Link
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== CERTIFICATIONS ===== */}
                    {hasCertifications && (
                        <div className="mb-5">
                            <h2 className="text-xs font-bold text-[#1a4a4a] uppercase tracking-wider border-b-2 border-teal-200 pb-2 mb-3">
                                Certifications
                            </h2>
                            <div className="space-y-2">
                                {validCertifications.map((cert, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-800 text-sm break-words overflow-wrap-anywhere">
                                                {safeText(cert.name || 'Certification')}
                                            </p>
                                            {cert.issuer && (
                                                <p className="text-xs text-gray-500 break-words overflow-wrap-anywhere">
                                                    {safeText(cert.issuer)}
                                                </p>
                                            )}
                                        </div>
                                        {cert.date && (
                                            <p className="text-xs text-gray-400 flex-shrink-0">
                                                {safeText(cert.date)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== ACHIEVEMENTS ===== */}
                    {hasAchievements && (
                        <div>
                            <h2 className="text-xs font-bold text-[#1a4a4a] uppercase tracking-wider border-b-2 border-teal-200 pb-2 mb-3">
                                Achievements
                            </h2>
                            <div className="space-y-2">
                                {validAchievements.map((ach, i) => (
                                    <div key={i}>
                                        <p className="font-medium text-gray-800 text-sm break-words overflow-wrap-anywhere">
                                            {safeText(ach.title || 'Achievement')}
                                            {ach.date && (
                                                <span className="font-normal text-gray-500 text-xs ml-2">
                                                    ({safeText(ach.date)})
                                                </span>
                                            )}
                                        </p>
                                        {ach.description && (
                                            <p className="text-sm text-gray-600 mt-0.5 break-words overflow-wrap-anywhere">
                                                {safeText(ach.description)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TealCurveTemplate;