import React from 'react';
import { CVPreviewProps } from '../types/previewTypes';
import { getContactInfoWithEmojis } from '../utils/contactHelpers';
import {
    renderBulletPoints,
    safeText,
    cleanBulletText,
    hasContent,
    hasStringContent,
    filterValidItems
} from '../utils/renderHelpers';
import { useTemplateStyles } from '../hooks/useTemplateStyles';

const ClassicTemplate: React.FC<CVPreviewProps> = (props) => {
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
    const validProjects = filterValidItems(projects, ['name']);
    const validCertifications = filterValidItems(certifications, ['name']);
    const validAchievements = filterValidItems(achievements, ['title']);
    const validLanguages = filterValidItems(languages, ['language']);

    // Parse skills for bullet rendering
    const skillsLines = skills ? skills.split('\n').map(line => cleanBulletText(line)).filter(s => s) : [];

    return (
        <div className="bg-white shadow-lg px-8 py-8 max-w-3xl mx-auto overflow-hidden w-full">
            {/* HEADER: Photo + Name/Title/Contact INLINE */}
            <div className="flex items-start gap-6 mb-6 w-full">
                {profilePhoto && (
                    <div className="flex-shrink-0">
                        <img src={profilePhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-gray-300" />
                    </div>
                )}
                <div className="flex-1 min-w-0 w-full">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-[0.3px] break-words overflow-wrap-anywhere w-full">
                        {safeText(personalInfo.name?.toUpperCase() || 'YOUR NAME')}
                    </h1>
                    <p className="text-base text-gray-600 mb-1.5 break-words overflow-wrap-anywhere w-full">
                        {safeText(personalInfo.title || 'JOB TITLE')}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 max-w-full w-full">
                        {contactInfo.map((c, i) => (
                            <span key={i} className="flex items-center gap-1 break-words overflow-wrap-anywhere min-w-0 max-w-full">
                                {safeText(c)}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ABOUT SECTION - Full Width */}
            {hasAbout && (
                <>
                    <h2 className={styles.heading}>ABOUT</h2>
                    <p className="text-gray-700 text-sm leading-relaxed mb-6 break-words overflow-wrap-anywhere w-full">
                        {safeText(professionalSummary)}
                    </p>
                </>
            )}

            {/* TWO COLUMN LAYOUT WITH PROFESSIONAL DIVIDER */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 w-full">
                {/* LEFT COLUMN */}
                <div className="pr-6 space-y-6 min-w-0 overflow-hidden w-full">
                    {/* EXPERIENCE */}
                    {hasExperience && (
                        <div className="w-full">
                            <h2 className={styles.heading}>EXPERIENCE</h2>
                            {validExperiences.map((exp, i) => (
                                <div key={i} className="mb-4 last:mb-0 overflow-hidden w-full">
                                    <div className="flex flex-wrap items-baseline gap-2 w-full">
                                        <span className="font-bold text-gray-900 text-sm break-words overflow-wrap-anywhere min-w-0 flex-1">
                                            {safeText(exp.title || 'Position')}
                                        </span>
                                        <span className="text-gray-600 text-sm break-words overflow-wrap-anywhere">
                                            | {safeText(exp.company || 'Company')}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-1.5 break-words overflow-wrap-anywhere">
                                        {safeText(exp.startDate || 'Start')} — {safeText(exp.endDate || 'Present')}
                                    </div>
                                    {exp.description && (
                                        <div className="space-y-0.5 overflow-hidden w-full">
                                            {renderBulletPoints(exp.description)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* PROJECTS - Left Column */}
                    {hasProjects && (
                        <div className="w-full">
                            <h2 className={styles.heading}>PROJECTS</h2>
                            {validProjects.map((p, i) => (
                                <div key={i} className="mb-3 last:mb-0 overflow-hidden w-full">
                                    <div className="font-bold text-gray-900 text-sm break-words overflow-wrap-anywhere w-full">
                                        {safeText(p.name)}
                                        {p.tech && <span className="font-normal text-gray-600 text-xs ml-2 break-words overflow-wrap-anywhere">({safeText(p.tech)})</span>}
                                    </div>
                                    {p.description && (
                                        <div className="space-y-0.5 overflow-hidden w-full">
                                            {renderBulletPoints(p.description)}
                                        </div>
                                    )}
                                    {p.github && (
                                        <a href={p.github} target="_blank" rel="noopener noreferrer" 
                                           className="text-blue-600 text-xs hover:text-blue-800 inline-block mt-1 break-words overflow-wrap-anywhere">
                                            🔗 GitHub
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* DIVIDER */}
                <div className="hidden md:block px-0">
                    <div className="h-full w-px bg-[rgba(124,58,237,0.12)] mx-auto"></div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="pl-6 space-y-6 min-w-0 overflow-hidden w-full">
                    {/* EDUCATION */}
                    {hasEducation && (
                        <div className="w-full">
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

                    {/* SKILLS */}
                    {hasSkills && (
                        <div className="w-full">
                            <h2 className={styles.heading}>SKILLS</h2>
                            <div className="text-gray-700 text-sm leading-relaxed overflow-hidden w-full">
                                {skillsLines.map((line, idx) => (
                                    <div key={idx} className="flex items-start gap-1.5 overflow-hidden w-full">
                                        <span className="text-gray-500 flex-shrink-0">•</span>
                                        <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                            {safeText(line)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* LANGUAGES */}
                    {hasLanguages && (
                        <div className="w-full">
                            <h2 className={styles.heading}>LANGUAGES</h2>
                            <ul className="text-gray-700 text-sm space-y-0.5 overflow-hidden w-full">
                                {validLanguages.map((l, i) => (
                                    <li key={i} className="flex items-start gap-1.5 overflow-hidden w-full">
                                        <span className="text-gray-500 flex-shrink-0">•</span>
                                        <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                            <span className="font-medium">{safeText(l.language)}</span>: {safeText(l.proficiency)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* CERTIFICATIONS */}
                    {hasCertifications && (
                        <div className="w-full">
                            <h2 className={styles.heading}>CERTIFICATIONS</h2>
                            {validCertifications.map((c, i) => (
                                <div key={i} className="text-gray-700 text-sm mb-1.5 last:mb-0 break-words overflow-wrap-anywhere overflow-hidden w-full">
                                    <span className="font-medium">📜 {safeText(c.name)}</span>
                                    {c.issuer && ` - ${safeText(c.issuer)}`}
                                    {c.date && ` (${safeText(c.date)})`}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ACHIEVEMENTS */}
                    {hasAchievements && (
                        <div className="w-full">
                            <h2 className={styles.heading}>ACHIEVEMENTS</h2>
                            {validAchievements.map((a, i) => (
                                <div key={i} className="mb-3 last:mb-0 overflow-hidden w-full">
                                    <div className="flex items-center gap-2 flex-wrap w-full">
                                        <span className="font-bold text-gray-900 text-sm break-words overflow-wrap-anywhere min-w-0 flex-1">
                                            🏆 {safeText(a.title)}
                                        </span>
                                        {a.date && <span className="text-xs text-gray-500 break-words overflow-wrap-anywhere flex-shrink-0">({safeText(a.date)})</span>}
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
            </div>
        </div>
    );
};

export default ClassicTemplate;