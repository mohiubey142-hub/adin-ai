// src/components/cv-builder/utils/pdf/extrasPdfShared.ts
// ------------------------------------------------------------------
// Template-agnostic PDF helpers for the "extensible sections" system.
// A PDF generator supplies a tiny ExtrasPdfCtx (how ITS heading / entry looks);
// this file does the iteration, so custom sections, references and custom
// fields behave identically in every template.
//
// Cursor convention (same as every *Pdf.ts): `y` is the baseline where the
// NEXT line would be drawn. Every callback receives such a y and returns one.
// ------------------------------------------------------------------

import { customIdToSectionId, isCustomSectionId } from '../../constants/sectionRegistry';
import {
    buildExtrasPlan,
    getCustomSectionEntries,
    getItemCustomLines,
    REFERENCES_ON_REQUEST_TEXT,
    type ExtrasInput,
    type ExtrasPlan,
    type NormalizedEntry,
} from '../extrasModel';

export { formatCustomField, getItemCustomLines, getPersonalCustomContactParts, REFERENCES_ON_REQUEST_TEXT } from '../extrasModel';
export type { NormalizedEntry } from '../extrasModel';

/** Optional extra fields every PDF data interface accepts (all optional = old payloads still work). */
export interface PdfExtrasData extends ExtrasInput {
    template?: string;
}

export interface ExtrasPdfCtx {
    /**
     * Start a section: add the section gap, keep heading + first entry together on one page,
     * draw the heading (template style; upper-case it if the template does) and return the
     * baseline of the first content line.
     * `firstEntry` lets the template estimate how much space must stay together (may be null).
     */
    beginSection(title: string, y: number, firstEntry: NormalizedEntry | null): number;
    /** Gap between two entries of the same section (current scaled value — read at call time). */
    entryGap(): number;
    /**
     * Draw one entry in the template's own entry style (title + right date / subtitle /
     * bullet description / metaLines), page-break safe, and return the next baseline,
     * normalised exactly like the template's own Achievements/Projects entries.
     */
    renderEntry(entry: NormalizedEntry, y: number): number;
    /** Plain wrapped paragraph in body style (used for "References available on request."). */
    renderParagraph(text: string, y: number): number;
    /** Extra "Label: Value" lines under an existing item (Experience, Education, ...). Returns next baseline. */
    renderMetaLines(lines: string[], y: number): number;
}

/** Custom section → uses the template's entry look. Returns the next baseline. */
export function renderCustomSectionPdf(
    ctx: ExtrasPdfCtx,
    section: { title: string; entries: { title: string; subtitle: string; date: string; description: string; customFields?: any[] }[] },
    y: number
): number {
    const entries = getCustomSectionEntries(section as any);
    if (entries.length === 0) return y;
    let cur = ctx.beginSection(section.title, y, entries[0]);
    entries.forEach((e, i) => {
        if (i > 0) cur += ctx.entryGap();
        cur = ctx.renderEntry(e, cur);
    });
    return cur;
}

export function renderReferencesPdf(ctx: ExtrasPdfCtx, plan: ExtrasPlan, y: number): number {
    if (!plan.hasReferences) return y;
    const entries = plan.referenceEntries;
    if (entries.length === 0) {
        const cur = ctx.beginSection('References', y, null);
        return ctx.renderParagraph(REFERENCES_ON_REQUEST_TEXT, cur);
    }
    let cur = ctx.beginSection('References', y, entries[0]);
    entries.forEach((e, i) => {
        if (i > 0) cur += ctx.entryGap();
        cur = ctx.renderEntry(e, cur);
    });
    return cur;
}

/** Call right AFTER an existing item's entry has been drawn. No-op when the item has no custom fields. */
export function renderItemCustomFieldsPdf(ctx: ExtrasPdfCtx, item: { customFields?: any[] } | null | undefined, y: number): number {
    const lines = getItemCustomLines(item);
    return lines.length === 0 ? y : ctx.renderMetaLines(lines, y);
}

/**
 * Draw every visible section in the user's order.
 *  - `builtin[id]` draws a built-in section and returns the next y (it must itself skip when empty).
 *    Provide: summary, experience, education, certifications, skills, languages, achievements,
 *    projects, interests, references.
 *  - custom sections are drawn through `ctx`.
 */
export function renderSectionsInOrder(
    data: PdfExtrasData,
    templateId: string,
    ctx: ExtrasPdfCtx,
    builtin: Record<string, (y: number) => number>,
    startY: number,
    /** Two-column templates draw the sidebar with `false` (custom sections belong to the main column). */
    includeCustom: boolean = true
): number {
    const plan = buildExtrasPlan(templateId, data);
    let y = startY;
    for (const id of plan.order) {
        if (isCustomSectionId(id)) {
            if (!includeCustom) continue;
            const sec = plan.customSectionById(id);
            if (sec) y = renderCustomSectionPdf(ctx, sec, y);
        } else if (builtin[id]) {
            y = builtin[id](y);
        }
    }
    return y;
}

export { buildExtrasPlan, customIdToSectionId };
