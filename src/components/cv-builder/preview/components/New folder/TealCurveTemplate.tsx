import React from 'react';
import { CVPreviewProps } from '../types/previewTypes';
import { getContactInfo } from '../utils/contactHelpers';
import {
    renderBulletPoints,
    safeText,
    cleanBulletText,
    hasContent,
    hasStringContent,
    filterValidItems
} from '../utils/renderHelpers';
import { useTemplateStyles } from '../hooks/useTemplateStyles';

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

    // Contact info - without emojis
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

    // Parse skills for column display
    const skillItems = skills 
        ? skills.split('\n')
            .map(line => cleanBulletText(line))
            .filter(s => s && s.length > 0)
        : [];

    // ===== Premium Color Palette =====
    const primaryColor = '#0d2b2b';      // Deep dark green
    const primaryAccent = '#4a9e9e';     // Muted teal accent
    const textPrimary = '#1a1a2e';       // Near-black for main text
    const textSecondary = '#3d3d4a';     // Dark charcoal for secondary
    const textMeta = '#7a7a8a';          // Soft gray for metadata
    const bgWhite = '#ffffff';           // Clean white background
    const dividerColor = 'rgba(13, 43, 43, 0.10)';

    // ===== Premium Heading Style =====
    const headingStyle = {
        color: primaryColor,
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '1.5px',
        textTransform: 'uppercase' as const,
        borderBottom: `2.5px solid ${primaryColor}`,
        paddingBottom: '6px',
        marginBottom: '10px',
    };

    // ===== Secondary divider =====
    const secondaryDivider = {
        borderBottom: `1px solid ${dividerColor}`,
        marginBottom: '12px',
    };

    return (
        <div className="bg-white shadow-lg overflow-hidden w-full max-w-3xl mx-auto" style={{ border: `1px solid ${dividerColor}` }}>
            
            {/* ============================================================
                HEADER — Premium Dark Green
                ============================================================ */}
            <div style={{ backgroundColor: primaryColor }}>
                <div className="flex items-start gap-5 px-7 pt-7 pb-4">
                    
                    {/* Profile Photo */}
                    {profilePhoto && (
                        <div className="flex-shrink-0">
                            <div style={{ 
                                padding: '2px',
                                borderRadius: '50%',
                                border: `2px solid ${primaryAccent}40`,
                            }}>
                                <div style={{
                                    padding: '1px',
                                    borderRadius: '50%',
                                    border: `2px solid ${primaryColor}`,
                                }}>
                                    <img 
                                        src={profilePhoto} 
                                        alt="Profile" 
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Name + Title + Contact */}
                    <div className="flex-1 min-w-0">
                        {/* Name - Strong, Premium */}
                        <h1 
                            className="text-2xl md:text-3xl font-bold break-words overflow-wrap-anywhere w-full tracking-wide"
                            style={{ color: '#ffffff', letterSpacing: '1.5px' }}
                        >
                            {safeText(personalInfo.name?.toUpperCase() || 'YOUR NAME')}
                        </h1>
                        
                        {/* Title - Elegant, Subtle */}
                        <h2 
                            className="text-sm md:text-base font-light break-words overflow-wrap-anywhere w-full mt-0.5"
                            style={{ color: primaryAccent, letterSpacing: '0.5px' }}
                        >
                            {safeText(personalInfo.title || 'PROFESSIONAL TITLE')}
                        </h2>
                        
                        {/* Contact Info - Clean, Compact */}
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 w-full mt-1.5">
                            {contactInfo.map((c, i) => (
                                <span 
                                    key={i} 
                                    className="text-[11px] break-words overflow-wrap-anywhere"
                                    style={{ color: '#c8dcdc', letterSpacing: '0.2px' }}
                                >
                                    {safeText(c)}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Subtle divider below header */}
                <div className="px-7 pb-3">
                    <div style={{
                        width: '100%',
                        height: '1px',
                        background: `linear-gradient(to right, ${primaryAccent}25, transparent)`,
                    }} />
                </div>
            </div>

            {/* ============================================================
                BODY — Clean White Content
                ============================================================ */}
            <div className="px-6 md:px-7 pb-6 pt-3" style={{ backgroundColor: bgWhite }}>

                {/* ===== PROFESSIONAL SUMMARY ===== */}
                {hasAbout && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={headingStyle}>Professional Summary</h3>
                        <div style={secondaryDivider} />
                        <p 
                            className="text-[11.5px] break-words overflow-wrap-anywhere w-full max-w-full"
                            style={{ color: textPrimary, lineHeight: 1.8, letterSpacing: '0.2px' }}
                        >
                            {safeText(professionalSummary)}
                        </p>
                    </div>
                )}

                {/* ===== WORK EXPERIENCE ===== */}
                {hasExperience && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={headingStyle}>Work Experience</h3>
                        <div style={secondaryDivider} />
                        
                        {validExperiences.map((exp, i) => (
                            <div key={i} style={{ marginBottom: i === validExperiences.length - 1 ? 0 : '18px' }}>
                                {/* Job Title + Company + Date */}
                                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                    <h4 
                                        className="text-[12px] font-bold break-words overflow-wrap-anywhere"
                                        style={{ color: textPrimary, letterSpacing: '0.2px' }}
                                    >
                                        {safeText(exp.title || 'Position')}
                                    </h4>
                                    <span style={{ color: textMeta, fontSize: '11px' }}>|</span>
                                    <span 
                                        className="text-[11px] font-medium break-words overflow-wrap-anywhere"
                                        style={{ color: textSecondary }}
                                    >
                                        {safeText(exp.company || 'Company')}
                                    </span>
                                    <span style={{ color: textMeta, fontSize: '10px', marginLeft: 'auto', letterSpacing: '0.3px' }}>
                                        {safeText(exp.startDate || '')} 
                                        {exp.startDate && exp.endDate ? ' — ' : ''} 
                                        {safeText(exp.endDate || 'Present')}
                                    </span>
                                </div>

                                {/* Description Bullets */}
                                {exp.description && (
                                    <div className="mt-1.5 text-[11px]">
                                        {exp.description.split('\n').map((line: string, idx: number) => {
                                            const clean = cleanBulletText(line);
                                            if (!clean) return null;
                                            return (
                                                <div key={idx} className="flex items-start gap-2 w-full" style={{ marginBottom: '2px' }}>
                                                    <span style={{ color: primaryColor, fontSize: '12px', lineHeight: 1.6 }}>•</span>
                                                    <span 
                                                        className="break-words overflow-wrap-anywhere min-w-0 flex-1"
                                                        style={{ color: textPrimary, lineHeight: 1.7, letterSpacing: '0.1px' }}
                                                    >
                                                        {safeText(clean)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ===== EDUCATION ===== */}
                {hasEducation && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={headingStyle}>Education</h3>
                        <div style={secondaryDivider} />
                        
                        {validEducations.map((edu, i) => (
                            <div key={i} style={{ marginBottom: i === validEducations.length - 1 ? 0 : '10px' }}>
                                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                    <h4 
                                        className="text-[12px] font-bold break-words overflow-wrap-anywhere"
                                        style={{ color: textPrimary, letterSpacing: '0.2px' }}
                                    >
                                        {safeText(edu.degree || 'Degree')}
                                    </h4>
                                    <span style={{ color: textMeta, fontSize: '11px' }}>|</span>
                                    <span 
                                        className="text-[11px] font-medium break-words overflow-wrap-anywhere"
                                        style={{ color: textSecondary }}
                                    >
                                        {safeText(edu.institution || 'Institution')}
                                    </span>
                                    <span style={{ color: textMeta, fontSize: '10px', marginLeft: 'auto', letterSpacing: '0.3px' }}>
                                        {safeText(edu.startDate || '')} 
                                        {edu.startDate && edu.endDate ? ' — ' : ''} 
                                        {safeText(edu.endDate || '')}
                                        {edu.year && !edu.startDate && !edu.endDate ? safeText(edu.year) : ''}
                                        {edu.grade && ` | ${safeText(edu.grade)}`}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ===== LANGUAGES ===== */}
                {hasLanguages && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={headingStyle}>Languages</h3>
                        <div style={secondaryDivider} />
                        
                        <div className="text-[11px] w-full max-w-full">
                            {validLanguages.map((l, i) => (
                                <div key={i} className="flex items-start gap-2 w-full" style={{ marginBottom: '2px' }}>
                                    <span style={{ color: primaryColor, fontSize: '12px', lineHeight: 1.6 }}>•</span>
                                    <span 
                                        className="break-words overflow-wrap-anywhere min-w-0 flex-1"
                                        style={{ color: textPrimary, lineHeight: 1.7, letterSpacing: '0.1px' }}
                                    >
                                        <span style={{ fontWeight: 600, color: textPrimary }}>{safeText(l.language)}</span>
                                        <span style={{ color: textSecondary }}> — {safeText(l.proficiency)}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== CERTIFICATIONS ===== */}
                {hasCertifications && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={headingStyle}>Certifications</h3>
                        <div style={secondaryDivider} />
                        
                        {validCertifications.map((c, i) => (
                            <div 
                                key={i} 
                                className="text-[11px] flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
                                style={{ marginBottom: i === validCertifications.length - 1 ? 0 : '5px' }}
                            >
                                <span style={{ fontWeight: 600, color: textPrimary, letterSpacing: '0.2px' }}>{safeText(c.name)}</span>
                                {c.issuer && (
                                    <span style={{ color: textSecondary }}>— {safeText(c.issuer)}</span>
                                )}
                                {c.date && (
                                    <span style={{ color: textMeta, fontSize: '10px', letterSpacing: '0.3px' }}>({safeText(c.date)})</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ===== PROJECTS ===== */}
                {hasProjects && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={headingStyle}>Projects</h3>
                        <div style={secondaryDivider} />
                        
                        {validProjects.map((p, i) => (
                            <div key={i} style={{ marginBottom: i === validProjects.length - 1 ? 0 : '14px' }}>
                                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                    <h4 
                                        className="text-[12px] font-bold break-words overflow-wrap-anywhere"
                                        style={{ color: textPrimary, letterSpacing: '0.2px' }}
                                    >
                                        {safeText(p.name)}
                                    </h4>
                                    {p.tech && (
                                        <span className="text-[10px] font-normal break-words overflow-wrap-anywhere" style={{ color: textSecondary }}>
                                            ({safeText(p.tech)})
                                        </span>
                                    )}
                                </div>

                                {p.description && (
                                    <div className="mt-1 text-[11px]">
                                        {p.description.split('\n').map((line: string, idx: number) => {
                                            const clean = cleanBulletText(line);
                                            if (!clean) return null;
                                            return (
                                                <div key={idx} className="flex items-start gap-2 w-full" style={{ marginBottom: '2px' }}>
                                                    <span style={{ color: primaryColor, fontSize: '12px', lineHeight: 1.6 }}>•</span>
                                                    <span 
                                                        className="break-words overflow-wrap-anywhere min-w-0 flex-1"
                                                        style={{ color: textPrimary, lineHeight: 1.7, letterSpacing: '0.1px' }}
                                                    >
                                                        {safeText(clean)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {p.link && (
                                    <a 
                                        href={p.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-[10px] font-medium hover:underline inline-block mt-0.5 break-words overflow-wrap-anywhere"
                                        style={{ color: primaryColor, letterSpacing: '0.2px' }}
                                    >
                                        View Project →
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ===== ACHIEVEMENTS ===== */}
                {hasAchievements && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={headingStyle}>Achievements</h3>
                        <div style={secondaryDivider} />
                        
                        {validAchievements.map((a, i) => (
                            <div key={i} style={{ marginBottom: i === validAchievements.length - 1 ? 0 : '12px' }}>
                                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                    <h4 
                                        className="text-[12px] font-bold break-words overflow-wrap-anywhere"
                                        style={{ color: textPrimary, letterSpacing: '0.2px' }}
                                    >
                                        {safeText(a.title)}
                                    </h4>
                                    {a.date && (
                                        <span className="text-[10px] font-normal" style={{ color: textMeta, letterSpacing: '0.3px' }}>
                                            ({safeText(a.date)})
                                        </span>
                                    )}
                                </div>

                                {a.description && (
                                    <div className="mt-1 text-[11px]">
                                        {a.description.split('\n').map((line: string, idx: number) => {
                                            const clean = cleanBulletText(line);
                                            if (!clean) return null;
                                            return (
                                                <div key={idx} className="flex items-start gap-2 w-full" style={{ marginBottom: '2px' }}>
                                                    <span style={{ color: primaryColor, fontSize: '12px', lineHeight: 1.6 }}>•</span>
                                                    <span 
                                                        className="break-words overflow-wrap-anywhere min-w-0 flex-1"
                                                        style={{ color: textPrimary, lineHeight: 1.7, letterSpacing: '0.1px' }}
                                                    >
                                                        {safeText(clean)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ===== SKILLS ===== */}
                {hasSkills && skillItems.length > 0 && (
                    <div>
                        <h3 style={headingStyle}>Skills</h3>
                        <div style={secondaryDivider} />
                        
                        <div className="grid grid-cols-2 gap-x-5 gap-y-1 w-full max-w-full">
                            {skillItems.map((skill, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <span style={{ color: primaryColor, fontSize: '12px', lineHeight: 1.6 }}>•</span>
                                    <span 
                                        className="text-[11px] break-words overflow-wrap-anywhere"
                                        style={{ color: textPrimary, lineHeight: 1.7, letterSpacing: '0.1px' }}
                                    >
                                        {safeText(skill)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TealCurveTemplate;