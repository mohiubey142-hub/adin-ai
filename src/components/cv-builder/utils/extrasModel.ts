// src/components/cv-builder/utils/extrasModel.ts
// ------------------------------------------------------------------
// Pure data helpers shared by EVERY preview template and EVERY PDF generator
// (no React, no jsPDF). One place decides:
//   • which sections print, and in what order
//   • how a custom field is shown ("Label: Value")
//   • how custom-section entries / references become a uniform "entry"
// so a template only has to know how to DRAW one entry in its own style.
// ------------------------------------------------------------------

import {
    getVisibleSectionOrder,
    isCustomSectionId,
    customIdToSectionId,
} from '../constants/sectionRegistry';
import {
    getUsableCustomFields,
    getUsableCustomSections,
    getUsableInterests,
    getUsableReferences,
    type UsableCustomSection,
    type UsableReferences,
} from './cvExtras';
import type { CustomSection, DescriptionAlign, DescriptionFormat, ReferencesData, SectionLayout } from '../types/cvExtraTypes';
import { getDescriptionAlign, getDescriptionFormat } from './descriptionFormat';

/** "Label: Value", or just "Value" when the label is empty. */
type LooseField = { label?: string; value?: string };
type WithFields = { customFields?: LooseField[] } | null | undefined;
export const formatCustomField = (f: LooseField): string => {
    const label = (f.label || '').trim();
    const value = (f.value || '').trim();
    return label ? `${label}: ${value}` : value;
};

/** Printable lines for the custom fields of ANY item (empty array when none). */
export const getItemCustomLines = (item: WithFields): string[] =>
    getUsableCustomFields(item as any).map(formatCustomField);

/** Extra items for the header's contact line (Personal Info custom fields). */
export const getPersonalCustomContactParts = (personalInfo: WithFields): string[] => getItemCustomLines(personalInfo);

/**
 * One uniform shape for "an entry" of a custom section or a reference.
 * A template draws it as:  title (+ date on the right) / subtitle / description bullets / metaLines.
 */
export interface NormalizedEntry {
    title: string;
    subtitle: string;
    date: string;
    /** Free text or bullet lines (same bullet rules as every other description). */
    description: string;
    /** bullets (default) | numbered | paragraph — how the description lines are marked. */
    descriptionFormat?: DescriptionFormat;
    descriptionAlign?: DescriptionAlign;
    /** Extra plain lines printed last, in the subtitle/meta style ("Label: Value", "Email: x"). */
    metaLines: string[];
}

export const getCustomSectionEntries = (section: UsableCustomSection): NormalizedEntry[] =>
    section.entries.map((e) => ({
        title: (e.title || '').trim(),
        subtitle: (e.subtitle || '').trim(),
        date: (e.date || '').trim(),
        description: (e.description || '').trim(),
        descriptionFormat: getDescriptionFormat(e),
        descriptionAlign: getDescriptionAlign(e),
        metaLines: getItemCustomLines(e),
    }));

export const getReferenceEntries = (refs: UsableReferences): NormalizedEntry[] =>
    refs.items.map((r) => {
        const email = (r.email || '').trim();
        const phone = (r.phone || '').trim();
        return {
            title: (r.name || '').trim(),
            subtitle: [(r.position || '').trim(), (r.company || '').trim()].filter(Boolean).join(', '),
            date: '',
            description: '',
            metaLines: [
                ...(email ? [`Email: ${email}`] : []),
                ...(phone ? [`Phone: ${phone}`] : []),
                ...getItemCustomLines(r),
            ],
        };
    });

export const REFERENCES_ON_REQUEST_TEXT = 'References available on request.';

/** Everything a template needs about the extra data, resolved once. */
export interface ExtrasPlan {
    /** Visible section ids in print order (hidden removed). Empty sections are NOT removed — skip them while drawing. */
    order: string[];
    customSections: UsableCustomSection[];
    interests: string[];
    references: UsableReferences;
    /** Entries of the references section ([] when only "available on request"). */
    referenceEntries: NormalizedEntry[];
    hasInterests: boolean;
    hasReferences: boolean;
    customSectionById: (sectionId: string) => UsableCustomSection | undefined;
}

export interface ExtrasInput {
    customSections?: CustomSection[];
    interests?: string[];
    references?: ReferencesData;
    sectionLayout?: SectionLayout;
}

export const buildExtrasPlan = (templateId: string, input: ExtrasInput | null | undefined): ExtrasPlan => {
    const src = input || {};
    const customSections = getUsableCustomSections(src.customSections);
    const interests = getUsableInterests(src.interests);
    const references = getUsableReferences(src.references);
    const order = getVisibleSectionOrder(templateId, src.sectionLayout, src.customSections);
    const referenceEntries = getReferenceEntries(references);
    return {
        order,
        customSections,
        interests,
        references,
        referenceEntries,
        hasInterests: interests.length > 0,
        hasReferences: referenceEntries.length > 0 || references.availableOnRequest,
        customSectionById: (sectionId: string) =>
            isCustomSectionId(sectionId)
                ? customSections.find((s) => s.id === customIdToSectionId(sectionId))
                : undefined,
    };
};
