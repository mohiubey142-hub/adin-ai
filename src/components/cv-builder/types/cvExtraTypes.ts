// src/components/cv-builder/types/cvExtraTypes.ts
// ------------------------------------------------------------------
// Types for the "extensible sections" system:
//   • Custom fields (Label: Value) on any item
//   • Custom sections (user-titled, any number)
//   • Interests / Hobbies, References
//   • Section layout (order + hidden) — drives editor, preview, PDF, TXT
//
// This file has NO imports on purpose (avoids circular imports with cvTypes).
// Every field is OPTIONAL on the consumer side so old saved CVs keep working.
// ------------------------------------------------------------------

/** A free "Label: Value" pair the user can attach to an item. */
export interface CustomField {
    id: string;
    label: string;
    value: string;
}

/** How a description box is drawn: bullet list (default), numbered list, or plain paragraph. */
export type DescriptionFormat = 'bullets' | 'numbered' | 'paragraph';

/** Paragraph text alignment (only used when the format is 'paragraph'). Default 'left'. */
export type DescriptionAlign = 'left' | 'justify';

/** One entry inside a custom section (volunteering role, publication, course...). */
export interface CustomSectionEntry {
    id: string;
    /** Main line (bold) — e.g. "Volunteer Teacher" */
    title: string;
    /** Secondary line — e.g. "Edhi Foundation" */
    subtitle: string;
    /** Date / range shown on the right where the template has a date column */
    date: string;
    /** Free text or "• bullet" lines (same bullet rules as other sections) */
    description: string;
    descriptionFormat?: DescriptionFormat;
    descriptionAlign?: DescriptionAlign;
    customFields?: CustomField[];
}

/** A user-created section with its own title. */
export interface CustomSection {
    id: string;
    /** Heading printed on the CV, e.g. "Volunteering" */
    title: string;
    entries: CustomSectionEntry[];
}

export interface ReferenceItem {
    id: string;
    name: string;
    position: string;
    company: string;
    email: string;
    phone: string;
    customFields?: CustomField[];
}

export interface ReferencesData {
    /** When true (and no usable items) the CV prints "References available on request." */
    availableOnRequest: boolean;
    items: ReferenceItem[];
}

/**
 * User's section layout.
 *  - order:  null  → every template uses its own default order
 *            array → user's preferred order (unknown ids ignored, missing ids appended)
 *  - hidden: section ids that are kept in the editor but NOT printed on the CV
 *
 * Section ids: 'summary' | 'experience' | 'education' | 'certifications' | 'skills'
 *            | 'languages' | 'achievements' | 'projects' | 'interests' | 'references'
 *            | `custom:<customSection.id>`
 * ('personal' is the header and is never part of the order.)
 */
export interface SectionLayout {
    order: string[] | null;
    hidden: string[];
}

/** The four extra data blocks that travel together through save / sync / preview. */
export interface CVExtras {
    customSections: CustomSection[];
    interests: string[];
    references: ReferencesData;
    sectionLayout: SectionLayout;
}
