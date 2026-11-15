// src/components/cv-builder/constants/sectionRegistry.ts
// ------------------------------------------------------------------
// SINGLE SOURCE OF TRUTH for section ids, labels and ordering.
// Editor, preview templates, PDF generators and TXT export all read from here,
// so adding / reordering a section never needs a change in 20 files again.
// ------------------------------------------------------------------

import type { CustomSection, SectionLayout } from '../types/cvExtraTypes';

export const BUILTIN_SECTION_IDS = [
    'summary',
    'experience',
    'education',
    'certifications',
    'skills',
    'languages',
    'achievements',
    'projects',
    'interests',
    'references',
] as const;

export type BuiltinSectionId = (typeof BUILTIN_SECTION_IDS)[number];

/** Default heading text (templates may upper-case / restyle it). */
export const SECTION_LABELS: Record<BuiltinSectionId, string> = {
    summary: 'Professional Summary',
    experience: 'Experience',
    education: 'Education',
    certifications: 'Certifications',
    skills: 'Skills',
    languages: 'Languages',
    achievements: 'Achievements',
    projects: 'Projects',
    interests: 'Interests',
    references: 'References',
};

/**
 * Fallback order — matches the order used by ATS Pro / Classic / Academic today
 * (Summary → Experience → Education → Certifications → Skills → Languages →
 *  Achievements → Projects), with the new sections after Projects.
 */
export const DEFAULT_SECTION_ORDER: readonly string[] = [...BUILTIN_SECTION_IDS];

/**
 * Per-template default order. A template that is not listed uses
 * DEFAULT_SECTION_ORDER. When a template is migrated we record ITS CURRENT order
 * here so existing CVs look exactly the same until the user reorders.
 */
export const TEMPLATE_DEFAULT_ORDER: Record<string, readonly string[]> = {
    // Summary → Experience → Education → Certifications → Skills → Languages → Achievements → Projects
    'ats-pro': DEFAULT_SECTION_ORDER,
    classic: DEFAULT_SECTION_ORDER,
    academic: DEFAULT_SECTION_ORDER,
    minimal: DEFAULT_SECTION_ORDER,
    standard: DEFAULT_SECTION_ORDER,
    'teal-curve': DEFAULT_SECTION_ORDER,
    // Executive prints Languages before Skills
    executive: ['summary', 'experience', 'education', 'certifications', 'languages', 'skills', 'achievements', 'projects', 'interests', 'references'],
    // Modern prints Skills last (as tags)
    modern: ['summary', 'experience', 'education', 'certifications', 'languages', 'achievements', 'projects', 'skills', 'interests', 'references'],
    // Creative is two-column: main column = summary/experience/education/projects/achievements/references/custom,
    // dark sidebar = skills/languages/certifications/interests. Order applies inside each column.
    creative: ['summary', 'experience', 'education', 'projects', 'achievements', 'skills', 'languages', 'certifications', 'interests', 'references'],
};

export const getTemplateDefaultOrder = (template: string): readonly string[] =>
    TEMPLATE_DEFAULT_ORDER[template] || DEFAULT_SECTION_ORDER;

// ---------- custom section ids ----------
export const CUSTOM_PREFIX = 'custom:';
export const customSectionId = (id: string): string => `${CUSTOM_PREFIX}${id}`;
export const isCustomSectionId = (id: string): boolean => id.startsWith(CUSTOM_PREFIX);
export const customIdToSectionId = (sectionId: string): string => sectionId.slice(CUSTOM_PREFIX.length);

export const EMPTY_LAYOUT: SectionLayout = { order: null, hidden: [] };

/**
 * Full ordered list of every section id that EXISTS for this template
 * (hidden ones included — the editor uses this for its reorder list).
 *  1. user's saved order first (ids that no longer exist are dropped)
 *  2. then anything the user has not placed yet, in the template's default order
 *  3. custom sections not yet placed go last, in creation order
 */
export const resolveSectionOrder = (
    template: string,
    layout: SectionLayout | undefined | null,
    customSections: CustomSection[] | undefined | null
): string[] => {
    const customIds = (customSections || []).map((s) => customSectionId(s.id));
    const universe = [...getTemplateDefaultOrder(template), ...customIds];
    const valid = new Set(universe);
    const seen = new Set<string>();
    const out: string[] = [];
    const push = (id: string) => {
        if (valid.has(id) && !seen.has(id)) {
            seen.add(id);
            out.push(id);
        }
    };
    (layout?.order || []).forEach(push);
    universe.forEach(push);
    return out;
};

/** Same as resolveSectionOrder but without the sections the user hid. This is what
 *  preview / PDF / TXT should iterate over. */
export const getVisibleSectionOrder = (
    template: string,
    layout: SectionLayout | undefined | null,
    customSections: CustomSection[] | undefined | null
): string[] => {
    const hidden = new Set(layout?.hidden || []);
    return resolveSectionOrder(template, layout, customSections).filter((id) => !hidden.has(id));
};

/** Human title for any section id (custom sections use the user's title). */
export const getSectionTitle = (
    id: string,
    customSections: CustomSection[] | undefined | null
): string => {
    if (isCustomSectionId(id)) {
        const cs = (customSections || []).find((s) => s.id === customIdToSectionId(id));
        return cs?.title?.trim() || 'Additional Information';
    }
    return SECTION_LABELS[id as BuiltinSectionId] || id;
};

/**
 * Templates whose PREVIEW and PDF already render by `getVisibleSectionOrder`
 * (new sections, custom sections, custom fields, order, hide/show).
 * The editor shows a notice for any template not listed here.
 * When a template is migrated, add its id here — nothing else to change.
 */
export const LAYOUT_READY_TEMPLATES: readonly string[] = ['ats-pro', 'classic', 'minimal', 'academic', 'modern', 'standard', 'teal-curve', 'executive', 'creative'];

export const isLayoutReadyTemplate = (template: string): boolean =>
    LAYOUT_READY_TEMPLATES.includes(template);
