// src/components/cv-builder/preview/components/CorporateTemplate.tsx

import React from 'react';
import { CVPreviewProps } from '../types/previewTypes';
import { getContactInfoWithEmojis } from '../utils/contactHelpers';
import {
    safeText,
    cleanBulletText,
    hasContent,
    hasStringContent,
    filterValidItems
} from '../utils/renderHelpers';

const CorporateTemplate: React.FC<CVPreviewProps> = (props) => {
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
    } = props;

    // Corporate Colors - Violet/Purple Theme
    const primaryColor = '#6D28D9';      // Violet 700
    const secondaryColor = '#7C3AED';    // Violet 600
    const accentColor = '#8B5CF6';       // Violet 500
    const textColor = '#1E1E2F';
    const textLightColor = '#6B7280';
    const textLighterColor = '#9CA3AF';
    const bgLight = '#F5F3FF';           // Violet 50
    const dividerColor = '#DDD6FE';      // Violet 200
    const tagBg = '#EDE9FE';             // Violet 100
    const tagBorder = '#C4B5FD';         // Violet 300
    const sidebarBg = '#6D28D9';         // Violet 700

    const contactInfo = getContactInfoWithEmojis(personalInfo, phoneNumber, selectedCountryCode);
    const hasAbout = hasStringContent(professionalSummary);
    const hasExperience = hasContent(experiences, ['title', 'company']);
    const hasEducation = hasContent(educations, ['degree', 'institution']);
    const hasProjects = hasContent(projects, ['name']);
    const hasLanguages = hasContent(languages, ['language']);
    const hasCertifications = hasContent(certifications, ['name']);
    const hasAchievements = hasContent(achievements, ['title']);
    const hasSkills = hasStringContent(skills);

    const validExperiences = filterValidItems(experiences, ['title', 'company']);
    const validEducations = filterValidItems(educations, ['degree', 'institution']);
    const validCertifications = filterValidItems(certifications, ['name']);
    const validAchievements = filterValidItems(achievements, ['title']);
    const validLanguages = filterValidItems(languages, ['language']);
    const validProjects = filterValidItems(projects, ['name']);

    const skillItems = skills 
        ? skills.split('\n')
            .map(line => cleanBulletText(line))
            .filter(s => s && s.length > 0)
        : [];

    // Left Column Component
    const LeftColumn = () => (
        <div className="w-[30%] flex-shrink-0 bg-violet-700 rounded-l-xl p-5 text-white">
            {/* Photo */}
            {profilePhoto && (
                <div className="flex justify-center mb-4">
                    <img 
                        src={profilePhoto} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-white/30 shadow-lg" 
                    />
                </div>
            )}
            
            {/* Name */}
            <h1 className="text-xl font-bold text-center text-white break-words">
                {safeText(personalInfo.name?.toUpperCase() || 'YOUR NAME')}
            </h1>
            <h2 className="text-sm font-medium text-center text-violet-200 mt-0.5 break-words">
                {safeText(personalInfo.title || 'JOB TITLE')}
            </h2>
            
            <hr className="my-3 border-white/20" />
            
            {/* Contact */}
            <div className="text-[8px] text-violet-100 space-y-1">
                {contactInfo.map((c, i) => (
                    <div key={i} className="break-words">{safeText(c)}</div>
                ))}
            </div>
            
            <hr className="my-3 border-white/20" />
            
            {/* Skills */}
            {hasSkills && skillItems.length > 0 && (
                <>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-200 mb-2">
                        Skills
                    </h3>
                    <div className="flex flex-wrap gap-1">
                        {skillItems.map((skill, idx) => (
                            <span 
                                key={idx} 
                                className="px-2 py-0.5 text-[7px] font-medium rounded-full bg-white/20 text-white"
                            >
                                {safeText(skill)}
                            </span>
                        ))}
                    </div>
                    <hr className="my-3 border-white/20" />
                </>
            )}
            
            {/* Languages */}
            {hasLanguages && (
                <>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-200 mb-2">
                        Languages
                    </h3>
                    {validLanguages.map((l, i) => (
                        <div key={i} className="flex justify-between text-[8px] text-violet-100">
                            <span>{safeText(l.language)}</span>
                            <span>{safeText(l.proficiency)}</span>
                        </div>
                    ))}
                    <hr className="my-3 border-white/20" />
                </>
            )}
            
            {/* Certifications */}
            {hasCertifications && (
                <>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-200 mb-2">
                        Certifications
                    </h3>
                    {validCertifications.map((c, i) => (
                        <div key={i} className="text-[8px] text-violet-100 break-words">
                            {safeText(c.name)}
                            {c.issuer && <span className="text-violet-300"> – {safeText(c.issuer)}</span>}
                        </div>
                    ))}
                </>
            )}
        </div>
    );

    // Right Column Component
    const RightColumn = () => (
        <div className="flex-1 min-w-0 p-5">
            {/* Summary */}
            {hasAbout && (
                <>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-violet-700 mb-1.5">
                        Profile
                    </h3>
                    <p className="text-[10px] leading-relaxed text-gray-700 mb-3 break-words">
                        {safeText(professionalSummary)}
                    </p>
                </>
            )}
            
            {/* Experience */}
            {hasExperience && (
                <>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-violet-700 mb-1.5 mt-2">
                        Experience
                    </h3>
                    {validExperiences.map((exp, i) => (
                        <div key={i} className="mb-3">
                            <div className="flex flex-wrap justify-between items-baseline">
                                <span className="text-[11px] font-bold text-gray-800">{safeText(exp.title)}</span>
                                <span className="text-[9px] font-medium text-violet-600">{safeText(exp.company)}</span>
                            </div>
                            <div className="text-[7.5px] text-gray-400 mb-1">
                                {safeText(exp.startDate)} – {safeText(exp.endDate || 'Present')}
                            </div>
                            {exp.description && (
                                <div className="text-[8.5px] text-gray-600 space-y-0.5">
                                    {exp.description.split('\n').map((line: string, idx: number) => {
                                        const clean = cleanBulletText(line);
                                        if (!clean) return null;
                                        return (
                                            <div key={idx} className="flex items-start gap-1.5">
                                                <span className="text-violet-500">•</span>
                                                <span className="flex-1 break-words">{safeText(clean)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}
            
            {/* Education */}
            {hasEducation && (
                <>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-violet-700 mb-1.5 mt-2">
                        Education
                    </h3>
                    {validEducations.map((edu, i) => (
                        <div key={i} className="mb-2">
                            <div className="flex flex-wrap justify-between items-baseline">
                                <span className="text-[11px] font-bold text-gray-800">{safeText(edu.degree)}</span>
                                <span className="text-[9px] font-medium text-violet-600">{safeText(edu.institution)}</span>
                            </div>
                            <div className="text-[7.5px] text-gray-400">
                                {safeText(edu.year)}
                                {edu.grade && <span className="ml-2">| Grade: {safeText(edu.grade)}</span>}
                            </div>
                        </div>
                    ))}
                </>
            )}
            
            {/* Projects */}
            {hasProjects && (
                <>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-violet-700 mb-1.5 mt-2">
                        Projects
                    </h3>
                    {validProjects.map((p, i) => (
                        <div key={i} className="mb-2">
                            <div className="flex flex-wrap justify-between items-baseline">
                                <span className="text-[11px] font-bold text-gray-800">{safeText(p.name)}</span>
                                {p.tech && <span className="text-[8px] text-gray-400">{safeText(p.tech)}</span>}
                            </div>
                            {p.description && (
                                <div className="text-[8.5px] text-gray-600 space-y-0.5 mt-0.5">
                                    {p.description.split('\n').map((line: string, idx: number) => {
                                        const clean = cleanBulletText(line);
                                        if (!clean) return null;
                                        return (
                                            <div key={idx} className="flex items-start gap-1.5">
                                                <span className="text-violet-500">•</span>
                                                <span className="flex-1 break-words">{safeText(clean)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}
            
            {/* Achievements */}
            {hasAchievements && (
                <>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-violet-700 mb-1.5 mt-2">
                        Achievements
                    </h3>
                    {validAchievements.map((a, i) => (
                        <div key={i} className="mb-2">
                            <div className="flex flex-wrap justify-between items-baseline">
                                <span className="text-[10.5px] font-bold text-gray-800">🏆 {safeText(a.title)}</span>
                                {a.date && <span className="text-[7.5px] text-gray-400">{safeText(a.date)}</span>}
                            </div>
                            {a.description && (
                                <div className="text-[8.5px] text-gray-600 space-y-0.5 mt-0.5">
                                    {a.description.split('\n').map((line: string, idx: number) => {
                                        const clean = cleanBulletText(line);
                                        if (!clean) return null;
                                        return (
                                            <div key={idx} className="flex items-start gap-1.5">
                                                <span className="text-violet-500">•</span>
                                                <span className="flex-1 break-words">{safeText(clean)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-2xl border border-violet-200 overflow-hidden w-full">
            <div className="flex flex-row w-full max-w-full">
                <LeftColumn />
                <RightColumn />
            </div>
        </div>
    );
};

export default CorporateTemplate;