// src/components/cv-builder/components/DocumentThumbnail.tsx
// ------------------------------------------------------------------
// Backend-ready thumbnail component.
// ✅ NEW: Intersection Observer — only render live preview when visible
// ------------------------------------------------------------------

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { FileText, Mail } from 'lucide-react';
import {
    getTemplateTheme,
    getTemplateLabel,
} from '../constants/templateThemes';

import ModernTemplate from '../preview/components/ModernTemplate';
import ClassicTemplate from '../preview/components/ClassicTemplate';
import MinimalTemplate from '../preview/components/MinimalTemplate';
import TealCurveTemplate from '../preview/components/TealCurveTemplate';
import ExecutiveTemplate from '../preview/components/ExecutiveTemplate';
import CreativeTemplate from '../preview/components/CreativeTemplate';
import AcademicTemplate from '../preview/components/AcademicTemplate';
import StandardTemplate from '../preview/components/StandardTemplate';
import ATSProTemplate from '../preview/components/ATSProTemplate';

import {
    ClassicPreview as ClassicCoverPreview,
    ModernPreview as ModernCoverPreview,
    MinimalPreview as MinimalCoverPreview,
    ProfessionalPreview as ProfessionalCoverPreview,
    ExecutivePreview as ExecutiveCoverPreview,
    CreativePreview as CreativeCoverPreview,
} from '../../cover-letter/components';

interface DocumentThumbnailProps {
    documentId: string;
    template: string;
    kind: 'resume' | 'cover-letter';
    data?: any | null;
    thumbnailUrl?: string | null;
    title?: string;
    jobTitle?: string;
}

const ColoredBandFallback: React.FC<{
    template: string;
    kind: 'resume' | 'cover-letter';
    title?: string;
    jobTitle?: string;
}> = ({ template, kind, title, jobTitle }) => {
    const theme = getTemplateTheme(template, kind);
    const templateLabel = getTemplateLabel(template);
    const isCover = kind === 'cover-letter';

    return (
        <div
            className="w-full h-full flex items-center justify-center"
            style={{
                background: `linear-gradient(135deg, ${theme.cardBandFrom} 0%, ${theme.cardBandTo} 100%)`,
            }}
        >
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                {isCover ? (
                    <Mail size={20} style={{ color: theme.cardText }} />
                ) : (
                    <FileText size={20} style={{ color: theme.cardText }} />
                )}
            </div>
        </div>
    );
};

const LiveResumePreview: React.FC<{ template: string; data: any }> = ({ template, data }) => {
    const commonProps = {
        personalInfo: data?.personalInfo || {},
        phoneNumber: data?.phoneNumber || '',
        selectedCountryCode: data?.selectedCountryCode || '',
        professionalSummary: data?.professionalSummary || '',
        experiences: data?.experiences || [],
        educations: data?.educations || [],
        projects: data?.projects || [],
        certifications: data?.certifications || [],
        languages: data?.languages || [],
        achievements: data?.achievements || [],
        skills: data?.skills || '',
        profilePhoto: data?.profilePhoto || null,
        template: template as any,
        atsScore: 0,
        strength: { text: '', color: '', bg: '', icon: '' },
        onEditSection: undefined,
        activeSection: null,
    };

    switch (template) {
        case 'minimal':
            return <MinimalTemplate {...commonProps} />;
        case 'classic':
            return <ClassicTemplate {...commonProps} />;
        case 'teal-curve':
            return <TealCurveTemplate {...commonProps} />;
        case 'executive':
            return <ExecutiveTemplate {...commonProps} />;
        case 'creative':
            return <CreativeTemplate {...commonProps} />;
        case 'academic':
            return <AcademicTemplate {...commonProps} />;
        case 'standard':
            return <StandardTemplate {...commonProps} />;
        case 'ats-pro':
            return <ATSProTemplate {...commonProps} />;
        case 'modern':
        default:
            return <ModernTemplate {...commonProps} />;
    }
};

const LiveCoverPreview: React.FC<{ template: string; data: any }> = ({ template, data }) => {
    const commonProps = {
        letter: data?.generatedLetter || data?.originalLetter || '',
        photo: data?.profilePhoto || null,
        name: data?.userName || '',
        title: data?.jobTitle || '',
        email: data?.email || '',
        phone: data?.phoneNumber || '',
        countryCode: data?.selectedCountryCode || '',
        userAddress: data?.address || '',
        linkedinUrl: data?.linkedin || '',
        companyName: data?.company || '',
        hiringManagerName: data?.hiringManagerName || '',
    };

    switch (template) {
        case 'modern':
            return <ModernCoverPreview {...commonProps} />;
        case 'minimal':
            return <MinimalCoverPreview {...commonProps} />;
        case 'professional':
            return <ProfessionalCoverPreview {...commonProps} />;
        case 'executive':
            return <ExecutiveCoverPreview {...commonProps} />;
        case 'creative':
            return <CreativeCoverPreview {...commonProps} />;
        case 'classic':
        default:
            return <ClassicCoverPreview {...commonProps} />;
    }
};

const DocumentThumbnail: React.FC<DocumentThumbnailProps> = ({
    documentId,
    template,
    kind,
    data,
    thumbnailUrl,
    title,
    jobTitle,
}) => {
    const hasThumbnailUrl = !!thumbnailUrl && thumbnailUrl.trim().length > 0;
    const hasLiveData = data != null;

    // ✅ Intersection Observer — only render live preview when visible
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only setup observer if we have live data to render
        if (!hasLiveData) return;
        if (!containerRef.current) return;

        // If IntersectionObserver not supported → render immediately (safe fallback)
        if (typeof IntersectionObserver === 'undefined') {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        // Once visible, keep it rendered — disconnect observer
                        observer.disconnect();
                    }
                });
            },
            {
                // Start rendering 200px BEFORE the thumbnail enters the viewport
                rootMargin: '200px',
                threshold: 0.01,
            }
        );

        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
        };
    }, [hasLiveData]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-hidden bg-white"
            aria-hidden="true"
            style={{ pointerEvents: 'none' }}
        >
            {hasThumbnailUrl ? (
                // ── MODE 1: pre-rendered image (backend-ready path) ──
                <img
                    src={thumbnailUrl!}
                    alt=""
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                    decoding="async"
                />
            ) : hasLiveData && isVisible ? (
                // ── MODE 2: live preview (only when visible) ──
                <div className="w-full h-full overflow-hidden">
                    {kind === 'cover-letter' ? (
                        <LiveCoverPreview template={template} data={data} />
                    ) : (
                        <LiveResumePreview template={template} data={data} />
                    )}
                </div>
            ) : (
                // ── MODE 3: fallback (loading or off-screen) ──
                <ColoredBandFallback
                    template={template}
                    kind={kind}
                    title={title}
                    jobTitle={jobTitle}
                />
            )}
        </div>
    );
};

export default React.memo(DocumentThumbnail);