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
import { useTemplateStyles } from '../hooks/useTemplateStyles';

const ModernTemplate: React.FC<CVPreviewProps> = (props) => {
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
    const validCertifications = filterValidItems(certifications, ['name']);
    const validAchievements = filterValidItems(achievements, ['title']);
    const validLanguages = filterValidItems(languages, ['language']);
    const validProjects = filterValidItems(projects, ['name']);

    // Parse skills for tag rendering (PDF style)
    const skillItems = skills 
        ? skills.split('\n')
            .map(line => cleanBulletText(line))
            .filter(s => s && s.length > 0)
        : [];

    // Primary color from PDF: #5846C8
    const primaryColor = '#5846C8';
    // Text light color from PDF: #505064
    const textLightColor = '#505064';
    // Text color from PDF: #1E1E32
    const textColor = '#1E1E32';
    // Tag background from PDF: #E8E4F8
    const tagBg = '#E8E4F8';
    // Tag border from PDF: #B4AADC
    const tagBorder = '#B4AADC';
    // Divider color from PDF: #C8C3D7
    const dividerColor = '#C8C3D7';

    return (
        <div className="bg-white rounded-xl shadow-2xl border border-[#DCD7EB] p-6 overflow-hidden w-full">
            <div className="w-full max-w-full overflow-hidden">
                
                {/* ===== HEADER: Photo + Name + Title + Contacts ===== */}
                <div className="flex items-start gap-4 mb-3">
                    {profilePhoto && (
                        <div className="flex-shrink-0">
                            <img 
                                src={profilePhoto} 
                                alt="Profile" 
                                className="w-20 h-20 rounded-full object-cover border-[1.5px] border-[#5846C8] shadow-md" 
                            />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        {/* Name - 24px Bold, Primary Color */}
                        <h1 
                            className="text-2xl font-bold break-words overflow-wrap-anywhere w-full"
                            style={{ color: primaryColor }}
                        >
                            {safeText(personalInfo.name?.toUpperCase() || 'YOUR NAME')}
                        </h1>
                        {/* Title - 13.5px, TextLight Color */}
                        <h2 
                            className="text-[13.5px] font-normal break-words overflow-wrap-anywhere w-full mt-0.5"
                            style={{ color: textLightColor }}
                        >
                            {safeText(personalInfo.title || 'JOB TITLE')}
                        </h2>
                        {/* Contacts - 8.5px, TextLight Color */}
                        <div 
                            className="flex flex-wrap gap-x-3 gap-y-0.5 text-[8.5px] w-full mt-1"
                            style={{ color: textLightColor }}
                        >
                            {contactInfo.map((c, i) => (
                                <span key={i} className="break-words overflow-wrap-anywhere max-w-full">
                                    {safeText(c)}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider Line - 0.5px, Divider Color */}
                <hr className="my-3 w-full max-w-full" style={{ borderColor: dividerColor, borderWidth: '0.5px' }} />

                {/* ===== PROFESSIONAL SUMMARY ===== */}
                {hasAbout && (
                    <>
                        <h3 
                            className="text-[14px] font-bold uppercase tracking-[0.5px] mb-1.5 mt-2"
                            style={{ color: primaryColor }}
                        >
                            PROFESSIONAL SUMMARY
                        </h3>
                        <p 
                            className="text-[10px] leading-relaxed mb-3 break-words overflow-wrap-anywhere w-full max-w-full"
                            style={{ color: textColor }}
                        >
                            {safeText(professionalSummary)}
                        </p>
                    </>
                )}

                {/* ===== WORK EXPERIENCE ===== */}
                {hasExperience && (
                    <>
                        <h3 
                            className="text-[14px] font-bold uppercase tracking-[0.5px] mb-1.5 mt-2"
                            style={{ color: primaryColor }}
                        >
                            WORK EXPERIENCE
                        </h3>
                        {validExperiences.map((exp, i) => (
                            <div key={i} className="mb-2.5 overflow-hidden w-full max-w-full">
                                {/* Job Title + Company - 11.5px Bold */}
                                <div 
                                    className="text-[11.5px] font-bold break-words overflow-wrap-anywhere w-full max-w-full"
                                    style={{ color: textColor }}
                                >
                                    {safeText(exp.title || 'Position')} | {safeText(exp.company || 'Company')}
                                </div>
                                {/* Date - 9px, TextLighter */}
                                <div 
                                    className="text-[9px] mb-1 break-words overflow-wrap-anywhere w-full max-w-full"
                                    style={{ color: '#9696AA' }}
                                >
                                    {safeText(exp.startDate || 'Start')} - {safeText(exp.endDate || 'Present')}
                                </div>
                                {/* Description Bullets - 9.5px */}
                                {exp.description && (
                                    <div className="pl-0.5 text-[9.5px] whitespace-pre-wrap break-words overflow-wrap-anywhere w-full max-w-full">
                                        {exp.description.split('\n').map((line: string, idx: number) => {
                                            const clean = cleanBulletText(line);
                                            if (!clean) return null;
                                            return (
                                                <div key={idx} className="flex items-start gap-1.5 w-full">
                                                    <span className="flex-shrink-0" style={{ color: textLightColor }}>•</span>
                                                    <span className="break-words overflow-wrap-anywhere min-w-0 flex-1" style={{ color: textColor }}>
                                                        {safeText(clean)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}

                {/* ===== EDUCATION ===== */}
                {hasEducation && (
                    <>
                        <h3 
                            className="text-[14px] font-bold uppercase tracking-[0.5px] mb-1.5 mt-2"
                            style={{ color: primaryColor }}
                        >
                            EDUCATION
                        </h3>
                        {validEducations.map((edu, i) => (
                            <div key={i} className="mb-2 overflow-hidden w-full max-w-full">
                                {/* Degree - 11.5px Bold */}
                                <div 
                                    className="text-[11.5px] font-bold break-words overflow-wrap-anywhere w-full max-w-full"
                                    style={{ color: textColor }}
                                >
                                    {safeText(edu.degree || 'Degree')}
                                </div>
                                {/* Institution - 10px, Secondary Color */}
                                <div 
                                    className="text-[10px] break-words overflow-wrap-anywhere w-full max-w-full"
                                    style={{ color: '#6C5CE7' }}
                                >
                                    {safeText(edu.institution || 'Institution')}
                                </div>
                                {/* Year + Grade - 8.5px, TextLighter */}
                                <div 
                                    className="text-[8.5px] break-words overflow-wrap-anywhere w-full max-w-full"
                                    style={{ color: '#9696AA' }}
                                >
                                    {safeText(edu.year || 'Year')}{edu.grade && ` | Grade: ${safeText(edu.grade)}`}
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* ===== LANGUAGES ===== */}
                {hasLanguages && (
                    <>
                        <h3 
                            className="text-[14px] font-bold uppercase tracking-[0.5px] mb-1.5 mt-2"
                            style={{ color: primaryColor }}
                        >
                            LANGUAGES
                        </h3>
                        <div className="text-[9.5px] w-full max-w-full">
                            {validLanguages.map((l, i) => (
                                <div key={i} className="flex items-start gap-1.5 w-full mb-0.5">
                                    <span className="flex-shrink-0" style={{ color: textLightColor }}>•</span>
                                    <span className="break-words overflow-wrap-anywhere min-w-0 flex-1" style={{ color: textColor }}>
                                        <span className="font-medium">{safeText(l.language)}</span>: {safeText(l.proficiency)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ===== CERTIFICATIONS ===== */}
                {hasCertifications && (
                    <>
                        <h3 
                            className="text-[14px] font-bold uppercase tracking-[0.5px] mb-1.5 mt-2"
                            style={{ color: primaryColor }}
                        >
                            CERTIFICATIONS
                        </h3>
                        {validCertifications.map((c, i) => (
                            <div 
                                key={i} 
                                className="text-[9.5px] mb-1 break-words overflow-wrap-anywhere w-full max-w-full"
                                style={{ color: textColor }}
                            >
                                <span className="font-medium" style={{ color: primaryColor }}>📜 {safeText(c.name)}</span>
                                {c.issuer && ` – ${safeText(c.issuer)}`}
                                {c.date && ` (${safeText(c.date)})`}
                            </div>
                        ))}
                    </>
                )}

                {/* ===== PROJECTS ===== */}
                {hasProjects && (
                    <>
                        <h3 
                            className="text-[14px] font-bold uppercase tracking-[0.5px] mb-1.5 mt-2"
                            style={{ color: primaryColor }}
                        >
                            PROJECTS
                        </h3>
                        {validProjects.map((p, i) => (
                            <div key={i} className="mb-2.5 overflow-hidden w-full max-w-full">
                                {/* Project Name + Tech - 11.5px Bold */}
                                <div 
                                    className="text-[11.5px] font-bold break-words overflow-wrap-anywhere w-full max-w-full"
                                    style={{ color: textColor }}
                                >
                                    {safeText(p.name)}
                                    {p.tech && (
                                        <span className="font-normal ml-1.5" style={{ color: textLightColor }}>
                                            ({safeText(p.tech)})
                                        </span>
                                    )}
                                </div>
                                {/* Description Bullets - 9.5px */}
                                {p.description && (
                                    <div className="pl-0.5 text-[9.5px] w-full max-w-full">
                                        {p.description.split('\n').map((line: string, idx: number) => {
                                            const clean = cleanBulletText(line);
                                            if (!clean) return null;
                                            return (
                                                <div key={idx} className="flex items-start gap-1.5 w-full">
                                                    <span className="flex-shrink-0" style={{ color: textLightColor }}>•</span>
                                                    <span className="break-words overflow-wrap-anywhere min-w-0 flex-1" style={{ color: textColor }}>
                                                        {safeText(clean)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {/* GitHub Link - 7.5px */}
                                {p.github && (
                                    <a 
                                        href={p.github} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-[7.5px] hover:underline transition break-words overflow-wrap-anywhere inline-block max-w-full mt-0.5"
                                        style={{ color: primaryColor }}
                                    >
                                        GitHub: {safeText(p.github)}
                                    </a>
                                )}
                            </div>
                        ))}
                    </>
                )}

                {/* ===== ACHIEVEMENTS ===== */}
                {hasAchievements && (
                    <>
                        <h3 
                            className="text-[14px] font-bold uppercase tracking-[0.5px] mb-1.5 mt-2"
                            style={{ color: primaryColor }}
                        >
                            ACHIEVEMENTS
                        </h3>
                        {validAchievements.map((a, i) => (
                            <div key={i} className="mb-2.5 overflow-hidden w-full max-w-full">
                                {/* Achievement Title + Date - 11.5px Bold */}
                                <div 
                                    className="text-[11.5px] font-bold break-words overflow-wrap-anywhere w-full max-w-full"
                                    style={{ color: textColor }}
                                >
                                    🏆 {safeText(a.title)}
                                    {a.date && (
                                        <span className="font-normal ml-1.5" style={{ color: '#9696AA' }}>
                                            ({safeText(a.date)})
                                        </span>
                                    )}
                                </div>
                                {/* Description Bullets - 9.5px */}
                                {a.description && (
                                    <div className="pl-0.5 text-[9.5px] w-full max-w-full">
                                        {a.description.split('\n').map((line: string, idx: number) => {
                                            const clean = cleanBulletText(line);
                                            if (!clean) return null;
                                            return (
                                                <div key={idx} className="flex items-start gap-1.5 w-full">
                                                    <span className="flex-shrink-0" style={{ color: textLightColor }}>•</span>
                                                    <span className="break-words overflow-wrap-anywhere min-w-0 flex-1" style={{ color: textColor }}>
                                                        {safeText(clean)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}

                {/* ===== SKILLS - TAGS (PDF Style) ===== */}
                {hasSkills && skillItems.length > 0 && (
                    <>
                        <h3 
                            className="text-[14px] font-bold uppercase tracking-[0.5px] mb-1.5 mt-2"
                            style={{ color: primaryColor }}
                        >
                            SKILLS
                        </h3>
                        <div className="flex flex-wrap gap-1.5 w-full max-w-full">
                            {skillItems.map((skill, idx) => (
                                <span 
                                    key={idx} 
                                    className="px-2.5 py-1 text-[9.5px] font-bold rounded-[3.5px] border"
                                    style={{
                                        backgroundColor: tagBg,
                                        borderColor: tagBorder,
                                        color: textColor,
                                    }}
                                >
                                    {safeText(skill)}
                                </span>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ModernTemplate;