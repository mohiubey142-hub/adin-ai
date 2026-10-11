import React from 'react';
import { CVPreviewProps } from '../types/previewTypes';
import {
    renderBulletPoints,
    safeText,
    cleanBulletText,
    hasContent,
    hasStringContent,
    filterValidItems
} from '../utils/renderHelpers';
import { useTemplateStyles } from '../hooks/useTemplateStyles';

// ✅ getContactInfo — Directly defined here
const getContactInfo = (personalInfo: any, phoneNumber: string, selectedCountryCode: string): string[] => {
    const contacts: string[] = [];
    if (personalInfo?.email) contacts.push(personalInfo.email);
    if (phoneNumber) contacts.push(phoneNumber);
    if (personalInfo?.address) contacts.push(personalInfo.address);
    if (personalInfo?.linkedin) contacts.push(personalInfo.linkedin);
    if (personalInfo?.github) contacts.push(personalInfo.github);
    if (personalInfo?.portfolio) contacts.push(personalInfo.portfolio);
    return contacts;
};

const ExecutiveTemplate: React.FC<CVPreviewProps> = (props) => {
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

    // ===== Executive Color Palette =====
    const primaryColor = '#0d1b2a';        // Dark Blue
    const primaryAccent = '#d4a843';       // Gold
    const textPrimary = '#1a1a2e';
    const textSecondary = '#4a4a5a';
    const textMeta = '#7a7a8a';
    const bgWhite = '#ffffff';
    const dividerColor = 'rgba(13, 27, 42, 0.12)';
    const goldLight = '#d4c4a0';            // Lighter muted gold
    const goldMedium = '#b8a46a';           // Muted champagne/gold

    // ===== PLAIN Typography Styles =====
    const headingStyle = {
        color: primaryColor,
        fontSize: '13px',
        fontWeight: 'normal' as const,
        letterSpacing: '0px',
        textTransform: 'none' as const,
        borderBottom: `2.5px solid ${primaryColor}`,
        paddingBottom: '6px',
        marginBottom: '10px',
    };

    // ===== Contact item style =====
    const contactItemStyle = {
        fontSize: '11px',
        color: '#c8dcdc',
        lineHeight: 1.6,
        letterSpacing: '0px',
    };

    return (
        <div className="bg-white shadow-lg overflow-hidden w-full max-w-3xl mx-auto" style={{ border: `1px solid ${dividerColor}` }}>
            
            {/* ============================================================
                HEADER — Dark Blue with Gold Accents
                ============================================================ */}
            <div style={{ backgroundColor: primaryColor, position: 'relative' }}>
                
                {/* ═══════════════════════════════════════════════════════════
                    TOP DECORATIVE LINES
                    ═══════════════════════════════════════════════════════════ */}
                <div 
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 0 0 0',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {/* Top-left diagonal accent */}
                    <div style={{
                        width: '24px',
                        height: '1px',
                        transform: 'rotate(-45deg)',
                        transformOrigin: 'right center',
                        backgroundColor: goldMedium,
                        marginRight: '-1px',
                        flexShrink: 0,
                    }} />
                    
                    {/* Top double lines */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        flex: 1,
                        maxWidth: '90%',
                    }}>
                        <div style={{
                            height: '1px',
                            backgroundColor: goldMedium,
                            width: '100%',
                        }} />
                        <div style={{
                            height: '1px',
                            backgroundColor: goldLight,
                            width: '100%',
                        }} />
                    </div>
                    
                    {/* Top-right diagonal accent */}
                    <div style={{
                        width: '24px',
                        height: '1px',
                        transform: 'rotate(45deg)',
                        transformOrigin: 'left center',
                        backgroundColor: goldMedium,
                        marginLeft: '-1px',
                        flexShrink: 0,
                    }} />
                </div>

                {/* Content Area */}
                <div className="flex items-start gap-5 px-7 pt-5 pb-4">
                    
                    {/* Profile Photo */}
                    {profilePhoto && (
                        <div className="flex-shrink-0" style={{ marginTop: '-2px' }}>
                            <div style={{ 
                                padding: '2px',
                                borderRadius: '50%',
                                border: `2px solid ${primaryAccent}40`,
                            }}>
                                <img 
                                    src={profilePhoto} 
                                    alt="Profile" 
                                    className="w-[115px] h-[115px] rounded-full object-cover"
                                    style={{ border: `2px solid ${primaryColor}` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Name + Title + Contact */}
                    <div className="flex-1 min-w-0" style={{ marginTop: '6px', marginLeft: '-1%' }}>
                        {/* Name — White */}
                        <h1 
                            className="text-2xl md:text-[23px] break-words overflow-wrap-anywhere w-full"
                            style={{ color: '#ffffff', letterSpacing: '0px', fontWeight: 'normal' }}
                        >
                            {safeText(
                                personalInfo?.name 
                                    ? personalInfo.name.split(' ').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                      ).join(' ')
                                    : 'Your Name'
                            )}
                        </h1>
                        
                        {/* Title — Gold */}
                        <h2 
                            className="text-base md:text-lg break-words overflow-wrap-anywhere w-full mt-1"
                            style={{ color: primaryAccent, letterSpacing: '0px', fontWeight: 'normal' }}
                        >
                            {safeText(personalInfo?.title || 'Professional Title')}
                        </h2>
                        
                        {/* Contact — Light Gray */}
                        <div className="flex flex-wrap gap-x-5 gap-y-0.5 w-full mt-2">
                            {contactInfo.map((c, i) => (
                                <span key={i} style={contactItemStyle}>
                                    {safeText(c)}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    BOTTOM DECORATIVE LINES
                    ═══════════════════════════════════════════════════════════ */}
                <div 
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 0 12px 0',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {/* Bottom-left diagonal accent */}
                    <div style={{
                        width: '24px',
                        height: '1px',
                        transform: 'rotate(45deg)',
                        transformOrigin: 'right center',
                        backgroundColor: goldLight,
                        marginRight: '-1px',
                        flexShrink: 0,
                    }} />
                    
                    {/* Bottom double lines */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        flex: 1,
                        maxWidth: '90%',
                    }}>
                        <div style={{
                            height: '1px',
                            backgroundColor: goldLight,
                            width: '100%',
                        }} />
                        <div style={{
                            height: '1px',
                            backgroundColor: goldMedium,
                            width: '100%',
                        }} />
                    </div>
                    
                    {/* Bottom-right diagonal accent */}
                    <div style={{
                        width: '24px',
                        height: '1px',
                        transform: 'rotate(-45deg)',
                        transformOrigin: 'left center',
                        backgroundColor: goldLight,
                        marginLeft: '-1px',
                        flexShrink: 0,
                    }} />
                </div>
            </div>

            {/* ============================================================
                BODY — Clean White Content
                ============================================================ */}
            <div className="px-6 md:px-7 pb-6 pt-4" style={{ backgroundColor: bgWhite }}>

                {/* ===== PROFESSIONAL SUMMARY ===== */}
                {hasAbout && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={headingStyle}>Executive Summary</h3>
                        <p 
                            className="text-sm leading-relaxed break-words overflow-wrap-anywhere w-full max-w-full"
                            style={{ color: textPrimary, lineHeight: 1.8, fontSize: '13px', fontWeight: 'normal' }}
                        >
                            {safeText(professionalSummary)}
                        </p>
                    </div>
                )}

                {/* ===== WORK EXPERIENCE ===== */}
                {hasExperience && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={headingStyle}>Professional Experience</h3>
                        
                        {validExperiences.map((exp, i) => (
                            <div key={i} style={{ marginBottom: i === validExperiences.length - 1 ? 0 : '18px' }}>
                                {/* Job Title + Company + Date */}
                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    {/* Job Title - Bold */}
                                    <h4 
                                        className="text-sm break-words overflow-wrap-anywhere"
                                        style={{ color: textPrimary, fontSize: '14px', fontWeight: 'bold' }}
                                    >
                                        {safeText(exp.title || 'Position')}
                                    </h4>
                                    <span style={{ color: textSecondary, fontSize: '12px' }}>|</span>
                                    {/* Company - Plain */}
                                    <span 
                                        className="text-sm break-words overflow-wrap-anywhere"
                                        style={{ color: textSecondary, fontSize: '13px', fontWeight: 'normal' }}
                                    >
                                        {safeText(exp.company || 'Company')}
                                    </span>
                                    {/* Date - Right aligned */}
                                    <span style={{ color: textMeta, fontSize: '11px', marginLeft: 'auto', fontWeight: 'normal' }}>
                                        {safeText(exp.startDate || '')} 
                                        {exp.startDate && exp.endDate ? ' — ' : ''} 
                                        {safeText(exp.endDate || 'Present')}
                                    </span>
                                </div>

                                {/* Description Bullets - Plain */}
                                {exp.description && (
                                    <div className="mt-1.5 text-sm">
                                        {exp.description.split('\n').map((line: string, idx: number) => {
                                            const clean = cleanBulletText(line);
                                            if (!clean) return null;
                                            return (
                                                <div key={idx} className="flex items-start gap-2 w-full" style={{ marginBottom: '2px' }}>
                                                    <span style={{ color: primaryColor, fontSize: '13px', lineHeight: 1.6 }}>•</span>
                                                    <span 
                                                        className="break-words overflow-wrap-anywhere min-w-0 flex-1"
                                                        style={{ color: textPrimary, lineHeight: 1.7, fontSize: '12.5px', fontWeight: 'normal' }}
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
                        
                        {validEducations.map((edu, i) => (
                            <div key={i} style={{ marginBottom: i === validEducations.length - 1 ? 0 : '10px' }}>
                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    {/* Degree - Bold */}
                                    <h4 
                                        className="text-sm break-words overflow-wrap-anywhere"
                                        style={{ color: textPrimary, fontSize: '14px', fontWeight: 'bold' }}
                                    >
                                        {safeText(edu.degree || 'Degree')}
                                    </h4>
                                    <span style={{ color: textSecondary, fontSize: '12px' }}>|</span>
                                    {/* Institution - Plain */}
                                    <span 
                                        className="text-sm break-words overflow-wrap-anywhere"
                                        style={{ color: textSecondary, fontSize: '13px', fontWeight: 'normal' }}
                                    >
                                        {safeText(edu.institution || 'Institution')}
                                    </span>
                                    {/* Date - Right aligned */}
                                    <span style={{ color: textMeta, fontSize: '11px', marginLeft: 'auto', fontWeight: 'normal' }}>
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

                {/* ===== SKILLS / COMPETENCIES ===== */}
                {hasSkills && skillItems.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={headingStyle}>Core Competencies</h3>
                        
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 w-full max-w-full">
                            {skillItems.map((skill, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <span style={{ color: primaryColor, fontSize: '13px', lineHeight: 1.6 }}>•</span>
                                    <span 
                                        className="text-sm break-words overflow-wrap-anywhere"
                                        style={{ color: textPrimary, lineHeight: 1.7, fontSize: '13px', fontWeight: 'normal' }}
                                    >
                                        {safeText(skill)}
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
                        
                        {validCertifications.map((c, i) => (
                            <div 
                                key={i} 
                                className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
                                style={{ marginBottom: i === validCertifications.length - 1 ? 0 : '6px' }}
                            >
                                <span style={{ color: textPrimary, fontSize: '13px', fontWeight: 'normal' }}>{safeText(c.name)}</span>
                                {c.issuer && (
                                    <span style={{ color: textSecondary, fontSize: '12px', fontWeight: 'normal' }}>— {safeText(c.issuer)}</span>
                                )}
                                {c.date && (
                                    <span style={{ color: textMeta, fontSize: '11px', fontWeight: 'normal' }}>({safeText(c.date)})</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ===== LANGUAGES ===== */}
                {hasLanguages && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={headingStyle}>Languages</h3>
                        
                        <div className="text-sm w-full max-w-full">
                            {validLanguages.map((l, i) => (
                                <div key={i} className="flex items-start gap-2 w-full" style={{ marginBottom: '2px' }}>
                                    <span style={{ color: primaryColor, fontSize: '13px', lineHeight: 1.6 }}>•</span>
                                    <span 
                                        className="break-words overflow-wrap-anywhere min-w-0 flex-1"
                                        style={{ color: textPrimary, lineHeight: 1.7, fontSize: '13px', fontWeight: 'normal' }}
                                    >
                                        <span style={{ color: textPrimary }}>{safeText(l.language)}</span>
                                        <span style={{ color: textSecondary }}> — {safeText(l.proficiency)}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== ACHIEVEMENTS ===== */}
                {hasAchievements && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={headingStyle}>Key Achievements</h3>
                        
                        {validAchievements.map((a, i) => (
                            <div key={i} style={{ marginBottom: i === validAchievements.length - 1 ? 0 : '12px' }}>
                                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                    {/* Achievement Title - Bold */}
                                    <h4 
                                        className="text-sm break-words overflow-wrap-anywhere"
                                        style={{ color: textPrimary, fontSize: '14px', fontWeight: 'bold' }}
                                    >
                                        {safeText(a.title)}
                                    </h4>
                                    {a.date && (
                                        <span className="text-sm" style={{ color: textMeta, fontSize: '11px', fontWeight: 'normal' }}>
                                            ({safeText(a.date)})
                                        </span>
                                    )}
                                </div>

                                {/* Description - Plain */}
                                {a.description && (
                                    <div className="mt-1 text-sm">
                                        {a.description.split('\n').map((line: string, idx: number) => {
                                            const clean = cleanBulletText(line);
                                            if (!clean) return null;
                                            return (
                                                <div key={idx} className="flex items-start gap-2 w-full" style={{ marginBottom: '2px' }}>
                                                    <span style={{ color: primaryColor, fontSize: '13px', lineHeight: 1.6 }}>•</span>
                                                    <span 
                                                        className="break-words overflow-wrap-anywhere min-w-0 flex-1"
                                                        style={{ color: textPrimary, lineHeight: 1.7, fontSize: '12.5px', fontWeight: 'normal' }}
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

                {/* ===== PROJECTS ===== */}
                {hasProjects && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={headingStyle}>Projects</h3>
                        
                        {validProjects.map((p, i) => (
                            <div key={i} style={{ marginBottom: i === validProjects.length - 1 ? 0 : '14px' }}>
                                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                    {/* Project Name - Bold */}
                                    <h4 
                                        className="text-sm break-words overflow-wrap-anywhere"
                                        style={{ color: textPrimary, fontSize: '14px', fontWeight: 'bold' }}
                                    >
                                        {safeText(p.name)}
                                    </h4>
                                    {p.tech && (
                                        <span className="text-sm break-words overflow-wrap-anywhere" style={{ color: textSecondary, fontSize: '12px', fontWeight: 'normal' }}>
                                            ({safeText(p.tech)})
                                        </span>
                                    )}
                                </div>

                                {/* Description - Plain */}
                                {p.description && (
                                    <div className="mt-1 text-sm">
                                        {p.description.split('\n').map((line: string, idx: number) => {
                                            const clean = cleanBulletText(line);
                                            if (!clean) return null;
                                            return (
                                                <div key={idx} className="flex items-start gap-2 w-full" style={{ marginBottom: '2px' }}>
                                                    <span style={{ color: primaryColor, fontSize: '13px', lineHeight: 1.6 }}>•</span>
                                                    <span 
                                                        className="break-words overflow-wrap-anywhere min-w-0 flex-1"
                                                        style={{ color: textPrimary, lineHeight: 1.7, fontSize: '12.5px', fontWeight: 'normal' }}
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
                                        className="text-sm hover:underline inline-block mt-1 break-words overflow-wrap-anywhere"
                                        style={{ color: primaryColor, fontSize: '11px', fontWeight: 'normal' }}
                                    >
                                        View Project →
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExecutiveTemplate;