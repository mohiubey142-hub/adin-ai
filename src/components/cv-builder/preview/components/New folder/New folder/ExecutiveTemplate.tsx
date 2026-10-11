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
    const hasContact = contactInfo.length > 0;

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

    // Split skills into two columns
    const midPoint = Math.ceil(skillItems.length / 2);
    const firstColumnSkills = skillItems.slice(0, midPoint);
    const secondColumnSkills = skillItems.slice(midPoint);

    // ===== Executive Color Palette =====
    const primaryColor = '#0d1b2a';        // Dark Blue
    const primaryAccent = '#b8a46a';       // Muted Champagne Gold
    const frameColor = '#c6a75e';          // Premium Champagne Gold for frame
    const navyColor = '#1a3a5c';           // Navy for primary headings
    const textPrimary = '#1a1a2e';         // Black
    const glowingBlack = '#0a0a0f';        // Dark glowing black for secondary headings
    const textSecondary = '#4a4a5a';
    const textMeta = '#7a7a8a';
    const bgWhite = '#ffffff';
    const dividerColor = 'rgba(13, 27, 42, 0.12)';
    const timelineColor = 'rgba(184, 164, 106, 0.80)'; // 80% golden
    const goldColor = 'rgba(184, 164, 106, 0.80)'; // 80% golden for section lines

    // ===== PRIMARY SECTION HEADING STYLES =====
    const headingStyle = {
        color: navyColor,
        fontSize: '19px',
        fontWeight: '600' as const,
        letterSpacing: '0px',
        textTransform: 'none' as const,
        borderBottom: `2.625px solid ${goldColor}`,
        paddingBottom: '6px',
        marginBottom: '14px',
    };

    // ===== SECONDARY HEADING STYLES =====
    const secondaryHeadingStyle = {
        color: glowingBlack,
        fontSize: '12px',
        fontWeight: '600' as const,
        textShadow: '0 0 6px rgba(0, 0, 0, 0.30), 0 0 12px rgba(0, 0, 0, 0.08)',
    };

    const secondarySubStyle = {
        color: textSecondary,
        fontSize: '11px',
        fontWeight: '400' as const,
    };

    // ===== Contact item style =====
    const contactItemStyle = {
        fontSize: '11px',
        color: '#c8dcdc',
        lineHeight: 1.6,
        letterSpacing: '0px',
    };

    // Fixed timeline column styles to ensure alignment across all experiences
    const timelineColumnStyle = {
        width: '16px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        position: 'relative' as const,
        marginLeft: '-4px',
    };

    const verticalLineStyle = {
        position: 'absolute' as const,
        top: '0',
        bottom: '0',
        left: '50%',
        width: '2px',
        backgroundColor: timelineColor,
        transform: 'translateX(-50%)',
    };

    const dotStyle = {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: primaryAccent,
        border: `1.5px solid ${primaryAccent}`,
        position: 'relative' as const,
        zIndex: 2,
        marginTop: '0px',
        flexShrink: 0,
        boxShadow: '0 0 4px rgba(184, 164, 106, 0.15)',
    };

    return (
        <div className="bg-white shadow-lg overflow-hidden w-full max-w-3xl mx-auto" style={{ border: `1px solid ${dividerColor}` }}>
            
            {/* ============================================================
                HEADER — FROZEN & LOCKED — DO NOT MODIFY
                ============================================================ */}
            <div style={{ 
                backgroundColor: primaryColor, 
                position: 'relative',
                padding: '12px',
            }}>
                {/* ===== SINGLE GOLDEN RECTANGULAR FRAME — LOCKED ===== */}
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    right: '8px',
                    bottom: '8px',
                    border: `1px solid ${frameColor}`,
                    borderRadius: '0px',
                    boxShadow: `
                        0 0 4px rgba(198, 167, 94, 0.30),
                        0 0 8px rgba(198, 167, 94, 0.10)
                    `,
                    pointerEvents: 'none',
                    zIndex: 1,
                }} />
                
                {/* ===== HEADER CONTENT — LOCKED ===== */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                    
                    {/* Content Area — LOCKED */}
                    <div className="flex items-center gap-5 px-7 pt-5 pb-4">
                        
                        {/* Profile Photo — LOCKED */}
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

                        {/* Name + Title — MOVED 12% LEFT using negative margin */}
                        <div className="flex-1 min-w-0" style={{ marginTop: '6px', marginLeft: '-11%' }}>
                            {/* Name — 13% LARGER (39px → 44px) */}
                            <h1 
                                className="text-4xl md:text-[44px] break-words overflow-wrap-anywhere w-full text-center"
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
                            
                            {/* Title — 8% LARGER (18px → 19.5px) */}
                            <h2 
                                className="text-base md:text-[19.5px] break-words overflow-wrap-anywhere w-full mt-1 text-center"
                                style={{ color: primaryAccent, letterSpacing: '0px', fontWeight: 'normal' }}
                            >
                                {safeText(personalInfo?.title || 'Professional Title')}
                            </h2>
                            
                            {/* REMOVED: Contact info section */}
                        </div>
                    </div>
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

                {/* ============================================================
                    PROFESSIONAL EXPERIENCE — FIXED ALIGNMENT
                    ============================================================ */}
                {hasExperience && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={headingStyle}>Professional Experience</h3>
                        
                        <div style={{ position: 'relative' }}>
                            {/* Timeline entries - each experience with consistent timeline column */}
                            {validExperiences.map((exp, expIndex) => {
                                const isLast = expIndex === validExperiences.length - 1;
                                
                                return (
                                    <div key={expIndex} style={{ position: 'relative', marginBottom: isLast ? '0' : '20px' }}>
                                        
                                        {/* ===== TIMELINE ROW with consistent alignment ===== */}
                                        <div style={{ 
                                            display: 'flex',
                                            alignItems: 'stretch',
                                            position: 'relative',
                                            marginLeft: '0',
                                        }}>
                                            {/* Left Column - Dates - FIXED WIDTH */}
                                            <div style={{ 
                                                width: '80px',
                                                flexShrink: 0,
                                                paddingRight: '4px',
                                                textAlign: 'left',
                                                paddingTop: '2px',
                                            }}>
                                                {/* Date range - ONLY THIS SHOWS, NO DUPLICATE */}
                                                <div style={{ 
                                                    fontSize: '11px', 
                                                    fontWeight: '500',
                                                    color: textMeta,
                                                    lineHeight: 1.3,
                                                }}>
                                                    {safeText(exp.startDate || '')} 
                                                    {exp.startDate && exp.endDate ? ' — ' : ''} 
                                                    {safeText(exp.endDate || 'Present')}
                                                </div>
                                                {/* REMOVED: Duplicate specific date block */}
                                            </div>
                                            
                                            {/* ===== TIMELINE COLUMN - FIXED WIDTH & POSITION ===== */}
                                            <div style={timelineColumnStyle}>
                                                {/* Vertical timeline line */}
                                                <div style={verticalLineStyle} />
                                                
                                                {/* Dot on timeline - at top center */}
                                                <div style={dotStyle} />
                                                
                                                {/* Spacer below dot to push content down */}
                                                <div style={{ flex: 1 }} />
                                            </div>
                                            
                                            {/* ===== RIGHT COLUMN — JOB CONTENT ===== */}
                                            <div style={{ 
                                                flex: 1,
                                                paddingLeft: '4px',
                                                paddingTop: '1px',
                                            }}>
                                                {/* Job Title */}
                                                <h4 
                                                    className="text-sm break-words overflow-wrap-anywhere"
                                                    style={{ 
                                                        color: glowingBlack,
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        textShadow: '0 0 6px rgba(0, 0, 0, 0.30), 0 0 12px rgba(0, 0, 0, 0.08)',
                                                        lineHeight: 1.3,
                                                        marginBottom: '2px',
                                                    }}
                                                >
                                                    {safeText(exp.title || 'Position')}
                                                </h4>
                                                
                                                {/* Company / Location */}
                                                <div style={{ 
                                                    fontSize: '11px', 
                                                    fontWeight: '400',
                                                    color: textSecondary,
                                                    lineHeight: 1.4,
                                                    marginBottom: '4px',
                                                    paddingLeft: '0.5%',
                                                }}>
                                                    {safeText(exp.company || 'Company')}
                                                    {exp.location && ` / ${safeText(exp.location)}`}
                                                </div>
                                                
                                                {/* Description Bullets */}
                                                {exp.description && (
                                                    <div className="text-sm" style={{ marginTop: '2px' }}>
                                                        {exp.description.split('\n').map((line: string, idx: number) => {
                                                            const clean = cleanBulletText(line);
                                                            if (!clean) return null;
                                                            return (
                                                                <div key={idx} className="flex items-start gap-2 w-full" style={{ marginBottom: '2px' }}>
                                                                    <span style={{ color: primaryColor, fontSize: '11px', lineHeight: 1.6 }}>•</span>
                                                                    <span 
                                                                        className="break-words overflow-wrap-anywhere min-w-0 flex-1"
                                                                        style={{ color: textPrimary, lineHeight: 1.6, fontSize: '12px', fontWeight: 'normal' }}
                                                                    >
                                                                        {safeText(clean)}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ============================================================
                    EDUCATION & CERTIFICATIONS — SAME ROW WITH CONTINUOUS LINE
                    ============================================================ */}
                {(hasEducation || hasCertifications) && (
                    <div style={{ marginBottom: '20px' }}>
                        {/* Headings with continuous line */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '40px',
                            borderBottom: `2.625px solid ${goldColor}`,
                            paddingBottom: '6px',
                            marginBottom: '14px',
                        }}>
                            {hasEducation && (
                                <h3 style={{ 
                                    color: navyColor,
                                    fontSize: '19px',
                                    fontWeight: '600',
                                    letterSpacing: '0px',
                                    textTransform: 'none',
                                    flex: 1,
                                    margin: 0,
                                    padding: 0,
                                    borderBottom: 'none',
                                }}>
                                    Education
                                </h3>
                            )}
                            {hasCertifications && (
                                <h3 style={{ 
                                    color: navyColor,
                                    fontSize: '19px',
                                    fontWeight: '600',
                                    letterSpacing: '0px',
                                    textTransform: 'none',
                                    flex: 1,
                                    margin: 0,
                                    padding: 0,
                                    borderBottom: 'none',
                                    paddingLeft: '40%',
                                }}>
                                    Certifications
                                </h3>
                            )}
                        </div>

                        {/* Content */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '40px',
                            flexWrap: 'wrap',
                        }}>
                            {/* ===== EDUCATION COLUMN ===== */}
                            {hasEducation && (
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    {validEducations.map((edu, i) => (
                                        <div key={i} style={{ marginBottom: i === validEducations.length - 1 ? 0 : '10px' }}>
                                            <div className="flex flex-col gap-y-0.5">
                                                {/* Degree - First row */}
                                                <h4 
                                                    className="text-sm break-words overflow-wrap-anywhere"
                                                    style={{ color: glowingBlack, fontSize: '12px', fontWeight: '600', textShadow: '0 0 6px rgba(0,0,0,0.30), 0 0 12px rgba(0,0,0,0.08)' }}
                                                >
                                                    {safeText(edu.degree || 'Degree')}
                                                </h4>
                                                
                                                {/* Institution - Second row */}
                                                <span 
                                                    className="text-sm break-words overflow-wrap-anywhere"
                                                    style={{ color: textSecondary, fontSize: '11px', fontWeight: '400' }}
                                                >
                                                    {safeText(edu.institution || 'Institution')}
                                                </span>
                                                
                                                {/* Date and Grade - Third row */}
                                                <span style={{ color: textMeta, fontSize: '10px', fontWeight: 'normal', marginTop: '1px' }}>
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

                            {/* ===== CERTIFICATIONS COLUMN ===== */}
                            {hasCertifications && (
                                <div style={{ flex: 1, minWidth: '200px', paddingLeft: '33%' }}>
                                    {validCertifications.map((c, i) => (
                                        <div 
                                            key={i} 
                                            className="flex flex-col"
                                            style={{ marginBottom: i === validCertifications.length - 1 ? 0 : '6px' }}
                                        >
                                            <span style={{ color: glowingBlack, fontSize: '12px', fontWeight: '600', textShadow: '0 0 6px rgba(0,0,0,0.30), 0 0 12px rgba(0,0,0,0.08)' }}>
                                                {safeText(c.name)}
                                            </span>
                                            {c.issuer && (
                                                <span style={{ color: textSecondary, fontSize: '11px', fontWeight: 'normal' }}>
                                                    {safeText(c.issuer)}
                                                </span>
                                            )}
                                            {c.date && (
                                                <span style={{ color: textMeta, fontSize: '10px', fontWeight: 'normal' }}>
                                                    {safeText(c.date)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ============================================================
                    SKILLS / COMPETENCIES — WITH SECOND COLUMN MOVED 45% RIGHT
                    ============================================================ */}
                {hasSkills && skillItems.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={headingStyle}>Core Competencies</h3>
                        
                        <div style={{ 
                            display: 'flex',
                            gap: '0px',
                            flexWrap: 'wrap',
                        }}>
                            {/* First Column - Left aligned */}
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                {firstColumnSkills.map((skill, idx) => (
                                    <div key={idx} className="flex items-start gap-2" style={{ marginBottom: '2px' }}>
                                        <span style={{ color: primaryColor, fontSize: '12px', lineHeight: 1.6 }}>•</span>
                                        <span 
                                            className="text-sm break-words overflow-wrap-anywhere"
                                            style={{ color: textPrimary, lineHeight: 1.7, fontSize: '12px', fontWeight: 'normal' }}
                                        >
                                            {safeText(skill)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Second Column - 45% right move */}
                            <div style={{ flex: 1, minWidth: '150px', paddingLeft: '45%' }}>
                                {secondColumnSkills.map((skill, idx) => (
                                    <div key={idx} className="flex items-start gap-2" style={{ marginBottom: '2px' }}>
                                        <span style={{ color: primaryColor, fontSize: '12px', lineHeight: 1.6 }}>•</span>
                                        <span 
                                            className="text-sm break-words overflow-wrap-anywhere"
                                            style={{ color: textPrimary, lineHeight: 1.7, fontSize: '12px', fontWeight: 'normal' }}
                                        >
                                            {safeText(skill)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================
                    LANGUAGES & CONTACT INFO — SAME ROW WITH CONTINUOUS LINE
                    ============================================================ */}
                {(hasLanguages || hasContact) && (
                    <div style={{ marginBottom: '20px' }}>
                        {/* Headings with continuous line */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '40px',
                            borderBottom: `2.625px solid ${goldColor}`,
                            paddingBottom: '6px',
                            marginBottom: '14px',
                        }}>
                            {hasLanguages && (
                                <h3 style={{ 
                                    color: navyColor,
                                    fontSize: '19px',
                                    fontWeight: '600',
                                    letterSpacing: '0px',
                                    textTransform: 'none',
                                    flex: 1,
                                    margin: 0,
                                    padding: 0,
                                    borderBottom: 'none',
                                }}>
                                    Languages
                                </h3>
                            )}
                            {hasContact && (
                                <h3 style={{ 
                                    color: navyColor,
                                    fontSize: '19px',
                                    fontWeight: '600',
                                    letterSpacing: '0px',
                                    textTransform: 'none',
                                    flex: 1,
                                    margin: 0,
                                    padding: 0,
                                    borderBottom: 'none',
                                    paddingLeft: '40%',
                                }}>
                                    Contact
                                </h3>
                            )}
                        </div>

                        {/* Content */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '40px',
                            flexWrap: 'wrap',
                        }}>
                            {/* ===== LANGUAGES COLUMN ===== */}
                            {hasLanguages && (
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <div className="text-sm w-full max-w-full">
                                        {validLanguages.map((l, i) => (
                                            <div key={i} className="flex items-start gap-2 w-full" style={{ marginBottom: '2px' }}>
                                                <span style={{ color: primaryColor, fontSize: '12px', lineHeight: 1.6 }}>•</span>
                                                <span 
                                                    className="break-words overflow-wrap-anywhere min-w-0 flex-1"
                                                    style={{ color: textPrimary, lineHeight: 1.7, fontSize: '12px', fontWeight: 'normal' }}
                                                >
                                                    <span style={{ color: glowingBlack, fontSize: '12px', fontWeight: '600', textShadow: '0 0 6px rgba(0,0,0,0.30), 0 0 12px rgba(0,0,0,0.08)' }}>
                                                        {safeText(l.language)}
                                                    </span>
                                                    <span style={{ color: textSecondary, fontSize: '11px' }}>
                                                        {l.proficiency ? ` — ${safeText(l.proficiency)}` : ''}
                                                    </span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ===== CONTACT INFO COLUMN ===== */}
                            {hasContact && (
                                <div style={{ flex: 1, minWidth: '200px', paddingLeft: '33%' }}>
                                    <div className="flex flex-col gap-y-1">
                                        {contactInfo.map((c, i) => (
                                            <span 
                                                key={i} 
                                                style={{ 
                                                    color: textSecondary, 
                                                    fontSize: '12px', 
                                                    fontWeight: '400',
                                                    lineHeight: 1.6,
                                                }}
                                            >
                                                {safeText(c)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                                    <h4 
                                        className="text-sm break-words overflow-wrap-anywhere"
                                        style={{ color: glowingBlack, fontSize: '12px', fontWeight: '600', textShadow: '0 0 6px rgba(0,0,0,0.30), 0 0 12px rgba(0,0,0,0.08)' }}
                                    >
                                        {safeText(a.title)}
                                    </h4>
                                    {a.date && (
                                        <span className="text-sm" style={{ color: textMeta, fontSize: '10px', fontWeight: 'normal' }}>
                                            ({safeText(a.date)})
                                        </span>
                                    )}
                                </div>

                                {a.description && (
                                    <div className="mt-1 text-sm">
                                        {a.description.split('\n').map((line: string, idx: number) => {
                                            const clean = cleanBulletText(line);
                                            if (!clean) return null;
                                            return (
                                                <div key={idx} className="flex items-start gap-2 w-full" style={{ marginBottom: '2px' }}>
                                                    <span style={{ color: primaryColor, fontSize: '12px', lineHeight: 1.6 }}>•</span>
                                                    <span 
                                                        className="break-words overflow-wrap-anywhere min-w-0 flex-1"
                                                        style={{ color: textPrimary, lineHeight: 1.7, fontSize: '12px', fontWeight: 'normal' }}
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
                                    <h4 
                                        className="text-sm break-words overflow-wrap-anywhere"
                                        style={{ color: glowingBlack, fontSize: '12px', fontWeight: '600', textShadow: '0 0 6px rgba(0,0,0,0.30), 0 0 12px rgba(0,0,0,0.08)' }}
                                    >
                                        {safeText(p.name)}
                                    </h4>
                                    {p.tech && (
                                        <span className="text-sm break-words overflow-wrap-anywhere" style={{ color: textSecondary, fontSize: '11px', fontWeight: 'normal' }}>
                                            ({safeText(p.tech)})
                                        </span>
                                    )}
                                </div>

                                {p.description && (
                                    <div className="mt-1 text-sm">
                                        {p.description.split('\n').map((line: string, idx: number) => {
                                            const clean = cleanBulletText(line);
                                            if (!clean) return null;
                                            return (
                                                <div key={idx} className="flex items-start gap-2 w-full" style={{ marginBottom: '2px' }}>
                                                    <span style={{ color: primaryColor, fontSize: '12px', lineHeight: 1.6 }}>•</span>
                                                    <span 
                                                        className="break-words overflow-wrap-anywhere min-w-0 flex-1"
                                                        style={{ color: textPrimary, lineHeight: 1.7, fontSize: '12px', fontWeight: 'normal' }}
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