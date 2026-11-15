// src/components/cv-builder/services/cvService.ts
// Plain-text (TXT / Copy) export.
// ✅ Section order, hidden sections, custom sections, interests, references and
//    "+ Add Field" custom fields all come from the same registry the preview/PDF use.
// ✅ Backward compatible: every new field on CVData is optional.

import {
    ExperienceItem, EducationItem, ProjectItem,
    CertificationItem, LanguageItem, AchievementItem
} from '../types/cvTypes';
import type { CustomField, CustomSection, ReferencesData, SectionLayout } from '../types/cvExtraTypes';
import { formatDescriptionText, getDescriptionFormat } from '../utils/descriptionFormat';
import { getVisibleSectionOrder, isCustomSectionId, customIdToSectionId } from '../constants/sectionRegistry';
import {
    getUsableCustomFields, getUsableCustomSections, getUsableInterests, getUsableReferences,
} from '../utils/cvExtras';

export interface CVData {
    personalInfo: any;
    phoneNumber: string;
    selectedCountryCode: string;
    professionalSummary: string;
    experiences: ExperienceItem[];
    educations: EducationItem[];
    projects: ProjectItem[];
    certifications: CertificationItem[];
    languages: LanguageItem[];
    achievements: AchievementItem[];
    skills: string;
    // ✅ Optional extras (old callers keep working)
    template?: string;
    customSections?: CustomSection[];
    interests?: string[];
    references?: ReferencesData;
    sectionLayout?: SectionLayout;
}

const RULE = '-'.repeat(40);

/** "Label: Value" lines for custom fields (label optional). */
const fieldLines = (item: { customFields?: CustomField[] } | undefined | null, indent = ''): string => {
    return getUsableCustomFields(item)
        .map((f) => `${indent}${f.label.trim() ? `${f.label.trim()}: ` : ''}${f.value.trim()}\n`)
        .join('');
};

const heading = (title: string): string => `${title.toUpperCase()}\n${RULE}\n`;

export const generatePlainTextCV = (data: CVData): string => {
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
        skills
    } = data;

    let text = `${personalInfo.name?.toUpperCase() || 'YOUR NAME'}\n`;
    text += `${'='.repeat(60)}\n`;
    text += `${personalInfo.title || 'JOB TITLE'}\n\n`;

    // Contact Information (always first — it is the header, never reordered)
    text += `CONTACT INFORMATION\n${RULE}\n`;
    if (personalInfo.email) text += `Email: ${personalInfo.email}\n`;
    if (phoneNumber) text += `Phone: ${selectedCountryCode} ${phoneNumber}\n`;
    if (personalInfo.address) text += `Address: ${personalInfo.address}\n`;
    if (personalInfo.linkedin) text += `LinkedIn: ${personalInfo.linkedin}\n`;
    if (personalInfo.github) text += `GitHub: ${personalInfo.github}\n`;
    if (personalInfo.portfolio) text += `Portfolio: ${personalInfo.portfolio}\n`;
    text += fieldLines(personalInfo);
    text += `\n`;

    // ---- one builder per section; each returns '' when there is nothing to print ----
    const builders: Record<string, () => string> = {
        summary: () =>
            professionalSummary?.trim()
                ? `${heading('Professional Summary')}${professionalSummary}\n\n`
                : '',

        experience: () => {
            const valid = (experiences || []).filter(e => e.title?.trim() && e.company?.trim());
            if (valid.length === 0) return '';
            let t = heading('Work Experience');
            valid.forEach((exp, idx) => {
                t += `${idx + 1}. ${exp.title} at ${exp.company}\n`;
                if (exp.startDate || exp.endDate) {
                    t += `   ${exp.startDate || 'Start'} - ${exp.endDate || 'Present'}\n`;
                }
                t += fieldLines(exp, '   ');
                t += formatDescriptionText(exp, '   ');
                t += `\n`;
            });
            return t;
        },

        education: () => {
            const valid = (educations || []).filter(e => e.degree?.trim() && e.institution?.trim());
            if (valid.length === 0) return '';
            let t = heading('Education');
            valid.forEach((edu, idx) => {
                t += `${idx + 1}. ${edu.degree}\n`;
                t += `   Institution: ${edu.institution}\n`;
                if (edu.year) t += `   ${edu.year}\n`;
                if (edu.grade) t += `   Grade: ${edu.grade}\n`;
                t += fieldLines(edu, '   ');
                t += `\n`;
            });
            return t;
        },

        certifications: () => {
            const valid = (certifications || []).filter(c => c.name?.trim());
            if (valid.length === 0) return '';
            let t = heading('Certifications');
            valid.forEach((c, idx) => {
                t += `${idx + 1}. ${c.name}\n`;
                if (c.issuer) t += `   Issuer: ${c.issuer}\n`;
                if (c.date) t += `   ${c.date}\n`;
                if (c.credentialId) t += `   Credential ID: ${c.credentialId}\n`;
                t += fieldLines(c, '   ');
                t += `\n`;
            });
            return t;
        },

        skills: () => {
            if (!skills?.trim()) return '';
            const skillArray = skills.includes(',')
                ? skills.split(',').map(s => s.trim()).filter(s => s)
                : skills.split('\n').map(s => s.trim().replace(/^[•\-*]\s*/, '')).filter(s => s);
            return `${heading('Skills')}${skillArray.map(s => `• ${s}\n`).join('')}\n`;
        },

        languages: () => {
            const valid = (languages || []).filter(l => l.language?.trim());
            if (valid.length === 0) return '';
            let t = heading('Languages');
            valid.forEach((lang, idx) => {
                t += `${idx + 1}. ${lang.language}${lang.proficiency ? ` - ${lang.proficiency}` : ''}\n`;
                t += fieldLines(lang, '   ');
            });
            return t + `\n`;
        },

        achievements: () => {
            const valid = (achievements || []).filter(a => a.title?.trim());
            if (valid.length === 0) return '';
            let t = heading('Achievements');
            valid.forEach((a, idx) => {
                t += `${idx + 1}. ${a.title}${a.date ? ` (${a.date})` : ''}\n`;
                t += fieldLines(a, '   ');
                t += formatDescriptionText(a, '   ');
                t += `\n`;
            });
            return t;
        },

        projects: () => {
            const valid = (projects || []).filter(p => p.name?.trim());
            if (valid.length === 0) return '';
            let t = heading('Projects');
            valid.forEach((p, idx) => {
                t += `${idx + 1}. ${p.name}\n`;
                if (p.tech) t += `   Technologies: ${p.tech}\n`;
                if (p.description) {
                    t += getDescriptionFormat(p) === 'bullets'
                        ? `   Description: ${p.description}\n`
                        : `   Description:\n${formatDescriptionText(p, '      ')}`;
                }
                if (p.github) t += `   GitHub: ${p.github}\n`;
                t += fieldLines(p, '   ');
                t += `\n`;
            });
            return t;
        },

        interests: () => {
            const list = getUsableInterests(data.interests);
            return list.length ? `${heading('Interests')}${list.join(', ')}\n\n` : '';
        },

        references: () => {
            const refs = getUsableReferences(data.references);
            if (refs.items.length === 0) {
                return refs.availableOnRequest ? `${heading('References')}Available on request.\n\n` : '';
            }
            let t = heading('References');
            refs.items.forEach((r, idx) => {
                const who = [r.name, r.position, r.company].map(s => s?.trim()).filter(Boolean).join(', ');
                t += `${idx + 1}. ${who || 'Reference'}\n`;
                if (r.email) t += `   Email: ${r.email}\n`;
                if (r.phone) t += `   Phone: ${r.phone}\n`;
                t += fieldLines(r, '   ');
                t += `\n`;
            });
            return t;
        },
    };

    const buildCustom = (sectionId: string): string => {
        const cid = customIdToSectionId(sectionId);
        const sec = getUsableCustomSections(data.customSections).find(s => s.id === cid);
        if (!sec) return '';
        let t = heading(sec.title);
        sec.entries.forEach((e, idx) => {
            const head = [e.title, e.subtitle].map(s => s?.trim()).filter(Boolean).join(' - ');
            t += `${idx + 1}. ${head || '(untitled)'}\n`;
            if (e.date?.trim()) t += `   ${e.date.trim()}\n`;
            t += fieldLines(e, '   ');
            t += formatDescriptionText(e, '   ');
            t += `\n`;
        });
        return t;
    };

    // Same order / hidden rules as preview and PDF
    const order = getVisibleSectionOrder(data.template || 'ats-pro', data.sectionLayout, data.customSections);
    for (const id of order) {
        text += isCustomSectionId(id) ? buildCustom(id) : (builders[id]?.() || '');
    }

    text += `${'='.repeat(60)}\n`;
    text += `Generated by Adin AI CV Builder\n`;

    return text;
};

export const getFileName = (name: string, extension: string): string => {
    const sanitizedName = name.replace(/\s/g, '_') || 'MyCV';
    return `CV_${sanitizedName}.${extension}`;
};

export const downloadBlob = (content: string | Blob, fileName: string, mimeType: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
};
