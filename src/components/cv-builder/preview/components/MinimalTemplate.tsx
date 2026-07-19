import React from 'react';
import { CVPreviewProps } from '../types/previewTypes';
import { getContactInfo } from '../utils/contactHelpers';
import {
    renderBulletPoints,
    renderInlineItems,
    renderLanguagesInline,
    safeText,
    hasContent,
    hasStringContent,
    filterValidItems
} from '../utils/renderHelpers';
import { useTemplateStyles } from '../hooks/useTemplateStyles';

const MinimalTemplate: React.FC<CVPreviewProps> = (props) => {
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

    const contactInfo = getContactInfo(personalInfo, phoneNumber, selectedCountryCode);
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
    const validProjects = filterValidItems(projects, ['name']);
    const validCertifications = filterValidItems(certifications, ['name']);
    const validAchievements = filterValidItems(achievements, ['title']);
    const validLanguages = filterValidItems(languages, ['language']);

    return (
        <div className="bg-white shadow-lg px-8 py-8 max-w-3xl mx-auto overflow-hidden w-full">
            {/* HEADER - Photo + Name/Title/Contact INLINE */}
            <div className="flex items-start gap-6 mb-6 w-full">
                {profilePhoto && (
                    <div className="flex-shrink-0">
                        <img src={profilePhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-gray-300" />
                    </div>
                )}
                <div className="flex-1 min-w-0 w-full">
                    <h1 className="text-3xl font-light text-gray-900 tracking-[0.5px] break-words overflow-wrap-anywhere w-full">
                        {safeText(personalInfo.name?.toUpperCase() || 'YOUR NAME')}
                    </h1>
                    <p className="text-base font-light text-gray-600 tracking-[0.3px] mb-1.5 break-words overflow-wrap-anywhere w-full">
                        {safeText(personalInfo.title || 'JOB TITLE')}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 max-w-full w-full">
                        {contactInfo.map((c, i) => (
                            <span key={i} className="break-words overflow-wrap-anywhere max-w-full">
                                {safeText(c)}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* PROFILE SECTION */}
            {hasAbout && (
                <div className="w-full mb-6">
                    <h2 className={styles.heading}>PROFILE</h2>
                    <p className="text-gray-700 text-sm leading-relaxed break-words overflow-wrap-anywhere w-full">
                        {safeText(professionalSummary)}
                    </p>
                </div>
            )}

            {/* EXPERIENCE - Timeline Layout */}
            {hasExperience && (
                <div className="w-full mb-6">
                    <h2 className={styles.heading}>EXPERIENCE</h2>
                    <div className="space-y-5 w-full">
                        {validExperiences.map((exp, i) => (
                            <div key={i} className="relative pl-4 border-l-2 border-gray-300 ml-1 w-full">
                                <div className="text-xs font-medium text-gray-500 mb-0.5 break-words overflow-wrap-anywhere">
                                    {safeText(exp.startDate || 'Start')} — {safeText(exp.endDate || 'Present')}
                                </div>
                                <div className="font-bold text-gray-900 text-sm break-words overflow-wrap-anywhere w-full">
                                    {safeText(exp.title || 'Position')}
                                </div>
                                <div className="text-gray-600 text-sm break-words overflow-wrap-anywhere w-full">
                                    {safeText(exp.company || 'Company')}
                                </div>
                                {exp.description && (
                                    <div className="mt-1.5 space-y-0.5 overflow-hidden w-full">
                                        {renderBulletPoints(exp.description)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* EDUCATION */}
            {hasEducation && (
                <div className="w-full mb-6">
                    <h2 className={styles.heading}>EDUCATION</h2>
                    {validEducations.map((edu, i) => (
                        <div key={i} className="mb-3 last:mb-0 overflow-hidden w-full">
                            <div className="font-bold text-gray-900 text-sm break-words overflow-wrap-anywhere w-full">
                                {safeText(edu.degree || 'Degree')}
                            </div>
                            <div className="text-gray-700 text-sm break-words overflow-wrap-anywhere w-full">
                                {safeText(edu.institution || 'Institution')}
                            </div>
                            <div className="text-xs text-gray-500 break-words overflow-wrap-anywhere w-full">
                                {safeText(edu.year || 'Year')}{edu.grade && ` | Grade: ${safeText(edu.grade)}`}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* PROJECTS */}
            {hasProjects && (
                <div className="w-full mb-6">
                    <h2 className={styles.heading}>PROJECTS</h2>
                    {validProjects.map((p, i) => (
                        <div key={i} className="mb-3 last:mb-0 overflow-hidden w-full">
                            <div className="font-bold text-gray-900 text-sm break-words overflow-wrap-anywhere w-full">
                                {safeText(p.name)}
                                {p.tech && <span className="font-normal text-gray-500 text-xs ml-2 break-words overflow-wrap-anywhere">({safeText(p.tech)})</span>}
                            </div>
                            {p.description && (
                                <div className="space-y-0.5 overflow-hidden w-full">
                                    {renderBulletPoints(p.description)}
                                </div>
                            )}
                            {p.github && (
                                <a href={p.github} target="_blank" rel="noopener noreferrer" 
                                   className="text-blue-600 text-xs hover:text-blue-800 inline-block mt-1 break-words overflow-wrap-anywhere">
                                    GitHub
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* SKILLS - Inline Format */}
            {hasSkills && (
                <div className="w-full mb-6">
                    <h2 className={styles.heading}>SKILLS</h2>
                    {renderInlineItems(skills)}
                </div>
            )}

            {/* LANGUAGES - Inline Format */}
            {hasLanguages && (
                <div className="w-full mb-6">
                    <h2 className={styles.heading}>LANGUAGES</h2>
                    {renderLanguagesInline(validLanguages)}
                </div>
            )}

            {/* CERTIFICATIONS - Clean Executive Style */}
            {hasCertifications && (
                <div className="w-full mb-6">
                    <h2 className={styles.heading}>CERTIFICATIONS</h2>
                    {validCertifications.map((c, i) => (
                        <div key={i} className="text-gray-700 text-sm mb-1.5 last:mb-0 break-words overflow-wrap-anywhere w-full">
                            <span className="font-medium">{safeText(c.name)}</span>
                            {c.issuer && ` - ${safeText(c.issuer)}`}
                            {c.date && ` (${safeText(c.date)})`}
                        </div>
                    ))}
                </div>
            )}

            {/* ACHIEVEMENTS - Clean Bullet System */}
            {hasAchievements && (
                <div className="w-full">
                    <h2 className={styles.heading}>ACHIEVEMENTS</h2>
                    {validAchievements.map((a, i) => (
                        <div key={i} className="mb-3 last:mb-0 overflow-hidden w-full">
                            <div className="font-semibold text-gray-900 text-sm break-words overflow-wrap-anywhere w-full">
                                {safeText(a.title)}
                                {a.date && <span className="font-normal text-gray-500 text-xs ml-2 break-words overflow-wrap-anywhere">({safeText(a.date)})</span>}
                            </div>
                            {a.description && (
                                <div className="space-y-0.5 mt-0.5 overflow-hidden w-full">
                                    {renderBulletPoints(a.description)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MinimalTemplate;