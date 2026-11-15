// src/components/cv-builder/utils/cvExtras.ts
// Factories, load-time normalisation and "usable data" helpers for the extra
// sections. Everything is defensive: saved / cloud-restored data may be old,
// partial or malformed, so nothing here ever throws.

import type {
    CustomField,
    CustomSection,
    CustomSectionEntry,
    CVExtras,
    ReferenceItem,
    ReferencesData,
    SectionLayout,
} from '../types/cvExtraTypes';
import { normalizeDescriptionFormat } from './descriptionFormat';

// ---------- ids ----------
let idCounter = 0;
export const uid = (prefix = 'x'): string =>
    `${prefix}_${Date.now().toString(36)}_${(idCounter++).toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

// ---------- factories ----------
export const createCustomField = (): CustomField => ({ id: uid('cf'), label: '', value: '' });

export const createCustomEntry = (): CustomSectionEntry => ({
    id: uid('ce'),
    title: '',
    subtitle: '',
    date: '',
    description: '',
    customFields: [],
});

export const createCustomSection = (title = ''): CustomSection => ({
    id: uid('cs'),
    title,
    entries: [createCustomEntry()],
});

export const createReference = (): ReferenceItem => ({
    id: uid('ref'),
    name: '',
    position: '',
    company: '',
    email: '',
    phone: '',
    customFields: [],
});

export const createEmptyExtras = (): CVExtras => ({
    customSections: [],
    interests: [],
    references: { availableOnRequest: false, items: [] },
    sectionLayout: { order: null, hidden: [] },
});

// ---------- normalisation (load time) ----------
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const strArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

export const normalizeCustomFields = (v: unknown): CustomField[] =>
    Array.isArray(v)
        ? v.filter(isObj).map((f) => ({ id: str(f.id) || uid('cf'), label: str(f.label), value: str(f.value) }))
        : [];

const normalizeEntry = (e: Record<string, unknown>): CustomSectionEntry => ({
    id: str(e.id) || uid('ce'),
    title: str(e.title),
    subtitle: str(e.subtitle),
    date: str(e.date),
    description: str(e.description),
    descriptionFormat: normalizeDescriptionFormat(e.descriptionFormat),
    descriptionAlign: e.descriptionAlign === 'justify' ? 'justify' : 'left',
    customFields: normalizeCustomFields(e.customFields),
});

const normalizeReference = (r: Record<string, unknown>): ReferenceItem => ({
    id: str(r.id) || uid('ref'),
    name: str(r.name),
    position: str(r.position),
    company: str(r.company),
    email: str(r.email),
    phone: str(r.phone),
    customFields: normalizeCustomFields(r.customFields),
});

/** Turns ANY saved object (old CV without these fields, cloud restore, junk) into valid CVExtras. */
export const normalizeExtras = (saved: unknown): CVExtras => {
    const base = createEmptyExtras();
    if (!isObj(saved)) return base;

    const customSections: CustomSection[] = Array.isArray(saved.customSections)
        ? saved.customSections.filter(isObj).map((s) => ({
              id: str(s.id) || uid('cs'),
              title: str(s.title),
              entries: Array.isArray(s.entries) ? s.entries.filter(isObj).map(normalizeEntry) : [],
          }))
        : [];

    const refs = isObj(saved.references) ? saved.references : null;
    const references: ReferencesData = refs
        ? {
              availableOnRequest: refs.availableOnRequest === true,
              items: Array.isArray(refs.items) ? refs.items.filter(isObj).map(normalizeReference) : [],
          }
        : base.references;

    const lay = isObj(saved.sectionLayout) ? saved.sectionLayout : null;
    const sectionLayout: SectionLayout = lay
        ? {
              order: Array.isArray(lay.order) ? strArray(lay.order) : null,
              hidden: strArray(lay.hidden),
          }
        : base.sectionLayout;

    return { customSections, interests: strArray(saved.interests), references, sectionLayout };
};

// ---------- "usable" helpers (what preview / PDF / TXT should print) ----------
const has = (v: unknown): boolean => typeof v === 'string' && v.trim().length > 0;

/** A custom field is printed only when it has a value (label is optional). */
export const getUsableCustomFields = (item: { customFields?: CustomField[] } | null | undefined): CustomField[] =>
    (item?.customFields || []).filter((f) => has(f.value));

export const isCustomEntryUsable = (e: CustomSectionEntry): boolean =>
    has(e.title) || has(e.subtitle) || has(e.date) || has(e.description) || getUsableCustomFields(e).length > 0;

export interface UsableCustomSection {
    id: string;
    title: string;
    entries: CustomSectionEntry[];
}

export const getUsableCustomSections = (sections: CustomSection[] | undefined | null): UsableCustomSection[] =>
    (sections || [])
        .map((s) => ({
            id: s.id,
            title: has(s.title) ? s.title.trim() : 'Additional Information',
            entries: (s.entries || []).filter(isCustomEntryUsable),
        }))
        .filter((s) => s.entries.length > 0);

export const getUsableInterests = (interests: string[] | undefined | null): string[] =>
    (interests || []).map((i) => i.trim()).filter(Boolean);

export const isReferenceUsable = (r: ReferenceItem): boolean =>
    has(r.name) || has(r.position) || has(r.company) || has(r.email) || has(r.phone) || getUsableCustomFields(r).length > 0;

export interface UsableReferences {
    availableOnRequest: boolean;
    items: ReferenceItem[];
}

export const getUsableReferences = (refs: ReferencesData | undefined | null): UsableReferences => ({
    availableOnRequest: refs?.availableOnRequest === true,
    items: (refs?.items || []).filter(isReferenceUsable),
});

/** True when the references section has anything to print. */
export const hasReferencesContent = (refs: ReferencesData | undefined | null): boolean => {
    const u = getUsableReferences(refs);
    return u.items.length > 0 || u.availableOnRequest;
};

/** Does section `id` have anything to print? Used by templates to skip empty sections. */
export const sectionHasExtraContent = (
    id: 'interests' | 'references' | `custom:${string}`,
    extras: Partial<CVExtras>
): boolean => {
    if (id === 'interests') return getUsableInterests(extras.interests).length > 0;
    if (id === 'references') return hasReferencesContent(extras.references);
    const cid = id.slice('custom:'.length);
    return getUsableCustomSections(extras.customSections).some((s) => s.id === cid);
};
