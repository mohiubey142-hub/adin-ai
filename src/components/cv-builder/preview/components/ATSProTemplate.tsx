// ATSProTemplate.tsx
// ------------------------------------------------------------------
// Live preview that mirrors atsProPdf.ts (the jsPDF generator) 1:1.
//
// ✅ PNG export: each visible page carries `data-page`.
// ✅ Label position: bottom-left corner of the section.
// ✅ HIGHLIGHT (mouse-driven): ring on hover; click opens editor.
//
// ✅ FIX (cut-off): BODY_TOP_PADDING + RING_ROOM_PX.
// ✅ FIX (mouse detection): mousemove-based gate.
//
// ATS-Pro design preserved: maroon/near-black palette, first-3-letters
// maroon heading + divider after text, two-column Skills, maroon
// right-aligned dates, 8pt bullet indent.
// ------------------------------------------------------------------

import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CVPreviewProps } from '../types/previewTypes';
import { safeText } from '../utils/renderHelpers';

// ====================================================================
// PAGE (A4, same numbers as atsProPdf.ts)
// ====================================================================
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const LEFT_MARGIN = 50;
const RIGHT_MARGIN = 50;
const TOP_MARGIN = 50;
const BOTTOM_MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;
const MM_TO_PT = 72 / 25.4;

const pt = (n: number) => `${n}pt`;

// ====================================================================
// TYPOGRAPHY (pt)
// ====================================================================
const NAME_SIZE = 22;
const TITLE_SIZE = 13;
const METADATA_SIZE = 9.5;
const HEADING_SIZE = 12;
const BODY_SIZE = 10.5;
const ENTRY_TITLE_SIZE = 11;
const ENTRY_SUB_SIZE = 10;
const BODY_LINE_HEIGHT = BODY_SIZE * 1.4;
const NORMAL_CONTENT_LINE_GAP = BODY_LINE_HEIGHT - BODY_SIZE;

const FONT_FAMILY = 'Arial, Helvetica, "Liberation Sans", sans-serif';

// ====================================================================
// COLORS
// ====================================================================
const COLOR_NAME = '#111827';
const COLOR_BODY = '#1f2937';
const COLOR_HEADING = '#111827';
const COLOR_METADATA = '#5a5a5a';
const COLOR_ACCENT = '#800000';
const COLOR_HEADING_ACCENT = COLOR_ACCENT;
const COLOR_HEADING_REST = '#111827';
const COLOR_DATE = COLOR_ACCENT;
const COLOR_TITLE = COLOR_ACCENT;
const COLOR_BULLET = COLOR_ACCENT;
const COLOR_DIVIDER = '#c3c3c8';

// ------------------------------------------------------------------
// ✅ Highlight styling
// ------------------------------------------------------------------
const COLOR_EDIT_ACCENT = '#f87171';
const COLOR_EDIT_LABEL_BG = COLOR_EDIT_ACCENT;
const COLOR_EDIT_LABEL_TEXT = '#ffffff';

const HOVER_RING_WIDTH = 2;
const HOVER_RING_COLOR = COLOR_EDIT_ACCENT;

const EDIT_LABEL_FONT_SIZE = '15.6px';
const EDIT_LABEL_FONT_WEIGHT = 600;
const EDIT_LABEL_PADDING_Y = '7.2px';
const EDIT_LABEL_PADDING_X = '16.8px';
const EDIT_LABEL_TEXT = 'Click to edit this section';

const HEADER_WRAPPER_PADDING = 6;
const HEADER_WRAPPER_MARGIN = -6;

const ROUNDED_RADIUS = '6px';

// ====================================================================
// SPACING FROM THE PDF (pt)
// ====================================================================
const NAME_TO_TITLE_GAP = 6;
const TITLE_TO_CONTACT_GAP = 10;
const NO_IMAGE_NAME_Y_OFFSET = 2 * MM_TO_PT;
const NO_IMAGE_TITLE_Y_OFFSET = 1 * MM_TO_PT;

// With a profile photo the whole header block (photo, name, title,
// contact) starts this much lower. Everything in the photo branch of
// getHeaderLayout() derives from the same nameBase, so the divider and
// all sections below move by the same amount and no gap changes.
// No photo -> unchanged (this shift is not applied).
const PHOTO_CONTENT_DOWN_SHIFT_MM = 3;
const PHOTO_CONTENT_DOWN_SHIFT = PHOTO_CONTENT_DOWN_SHIFT_MM * MM_TO_PT;
const CONTACT_Y_OFFSET = 1 * MM_TO_PT;
const DIVIDER_SIDE_GAP = 1 * MM_TO_PT;

const SECTION_GAP = 18 + 1 * MM_TO_PT;
const CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP = 2.5 * MM_TO_PT;

const TITLE_TO_SUB_GAP = 3;
const SUB_TO_DESC_GAP = 6;
const ENTRY_GAP = 14;
const TITLE_TO_DATE_GAP = 3 * MM_TO_PT;
const BULLET_DOT_TO_TEXT_GAP = 8;

const DIVIDER_LAYOUT_THICKNESS = 0.75;
const DIVIDER_THICKNESS = 0.75 + 0.3 * MM_TO_PT;
const DIVIDER_WIDTH_REDUCTION = 0.1 * MM_TO_PT;
const SECTION_HEADING_TO_DIVIDER_GAP = 1.5 * MM_TO_PT;
const SECTION_DIVIDER_BASELINE_OFFSET_RATIO = 0.03;
const SECTION_DIVIDER_TO_CONTENT_GAP = 3 * MM_TO_PT;

const PHOTO_SIZE = 75 + 6;
const PHOTO_BASE = 75;
const PHOTO_TO_TEXT_GAP = 15;
const NAME_LEFT_SHIFT = 0.1 * MM_TO_PT; // name nudged left; photo, title and contact stay put

const CONTACT_ITEM_GAP = (6 * 0.278 + 0.35) * METADATA_SIZE;

const BULLET_MARKER = '•';
const LANGUAGE_NAME_LEVEL_SEPARATOR = ' — ';
const DATE_RANGE_SEPARATOR = ' – ';

// ✅ Ring reservation
const BODY_TOP_PADDING = HOVER_RING_WIDTH;
const RING_ROOM_PX = HOVER_RING_WIDTH;

// ====================================================================
// PDF (jsPDF baselines) -> CSS (line boxes) CONVERSION
// ====================================================================
const CSS_ASCENT = 0.905;
const CSS_DESCENT = 0.212;
const PDF_ASCENT = 0.718;
const PDF_DESCENT = 0.207;

interface M {
    L: number;
    F: number;
}

const bIn = (m: M) => m.L / 2 + ((CSS_ASCENT - CSS_DESCENT) / 2) * m.F;

const M_BODY: M = { L: BODY_LINE_HEIGHT, F: BODY_SIZE };
const M_TITLE: M = { L: ENTRY_TITLE_SIZE, F: ENTRY_TITLE_SIZE };
const M_SUB: M = { L: ENTRY_SUB_SIZE, F: ENTRY_SUB_SIZE };
const M_HEAD: M = { L: BODY_LINE_HEIGHT, F: HEADING_SIZE };
const M_CONTACT: M = { L: BODY_LINE_HEIGHT, F: METADATA_SIZE };

const hasDescender = (text: string) => /[gjpqy]/.test(text);
const penalty = (text: string | undefined, fontSize: number) =>
    text === undefined || hasDescender(text) ? 0 : fontSize * PDF_DESCENT;

const inner = (prev: M, next: M, gap: number) => gap + bIn(prev) - bIn(next);

const endToNext = (prev: M, prevPen: number, next: M, gap: number) =>
    BODY_LINE_HEIGHT - prevPen + gap - (prev.L - bIn(prev)) - bIn(next);

const headingToContentOffset = (firstContentFontSize: number) =>
    -(HEADING_SIZE * SECTION_DIVIDER_BASELINE_OFFSET_RATIO) +
    DIVIDER_LAYOUT_THICKNESS / 2 +
    SECTION_DIVIDER_TO_CONTENT_GAP +
    firstContentFontSize * PDF_ASCENT;

const headingToContentMargin = (first: M, offsetFont: number) =>
    headingToContentOffset(offsetFont) - bIn(first) - (M_HEAD.L - bIn(M_HEAD));

const headerRuleToFirstSectionMargin = (isSummary: boolean) =>
    BODY_LINE_HEIGHT -
    DIVIDER_LAYOUT_THICKNESS +
    SECTION_GAP +
    (isSummary ? CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP : 0) -
    bIn(M_HEAD) -
    DIVIDER_THICKNESS / 2;

// ====================================================================
// PAGINATION
// ====================================================================
const PX = 96 / 72;
const PAGE_GAP_PX = 16;
const PAGE_CONTENT_TOP = TOP_MARGIN + BODY_TOP_PADDING;
const PAGE_CONTENT_BOTTOM = PAGE_HEIGHT - BOTTOM_MARGIN + 1.5;

interface PageWindow {
    start: number;
    end: number;
    top: number;
    // Extra strip rendered ABOVE `start` so the hover ring of a section that begins
    // exactly at the page top is not clipped. Must be 0 when the page starts in the
    // middle of a text block, otherwise the previous line's tail shows up there.
    ring: number;
}

// Each visible page copy tells its sections which slice of the document it shows, so the
// "Click to edit" label is drawn ONLY on the page that holds the section's bottom edge.
// Otherwise the top of the label (it is taller than a short section tail) pokes into the
// previous page and looks like the ring is trying to close there.
interface PageCtxValue {
    start: number;
    end: number;
    bottoms: Record<string, number>;
}
const PageCtx = createContext<PageCtxValue | null>(null);

type UnitKind = 'keep' | 'flow' | 'head';
const unit = (kind: UnitKind, first: M) => ({ 'data-unit': kind, 'data-b': bIn(first) } as const);

// Safety distance (px) a page cut is moved up into the blank gap above a block.
const CUT_LIFT_PX = 2;

const AUTO_FIT_MIN_SCALE = 0.85;
const AUTO_FIT_STEP = 0.02;
const AUTO_FIT_MAX_OVERFLOW_PT = (PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN) * 0.35;

// ✅ Real line boundaries (root coordinates, same space as unit.top).
// A page may only be cut BETWEEN two rendered text lines, never through one.
const collectLineBreaks = (root: HTMLElement): number[] => {
    if (typeof document === 'undefined') return [];
    const rootRect = root.getBoundingClientRect();
    const k = root.offsetWidth > 0 && rootRect.width > 0 ? rootRect.width / root.offsetWidth : 1;
    const rects: { top: number; bottom: number }[] = [];
    const range = document.createRange();

    root.querySelectorAll<HTMLElement>('[data-unit]').forEach((el) => {
        if (el.dataset.unit === 'head') return;
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node: Node | null = walker.nextNode();
        while (node) {
            if (node.textContent && node.textContent.trim()) {
                range.selectNodeContents(node);
                const list = range.getClientRects();
                for (let i = 0; i < list.length; i++) {
                    const r = list[i];
                    if (r.height > 0) rects.push({ top: (r.top - rootRect.top) / k, bottom: (r.bottom - rootRect.top) / k });
                }
            }
            node = walker.nextNode();
        }
    });

    rects.sort((a, b) => a.top - b.top);
    const breaks: number[] = [];
    let gTop = 0;
    let gBottom = 0;
    let have = false;
    rects.forEach((r) => {
        if (!have) {
            gTop = r.top;
            gBottom = r.bottom;
            have = true;
            return;
        }
        // same visual line (mixed fonts / marker + text): starts within the top 60% of current line
        if (r.top < gTop + (gBottom - gTop) * 0.6) {
            gBottom = Math.max(gBottom, r.bottom);
            return;
        }
        // Text rects are font content-areas. With line-height ~1em (entry titles / sub-lines)
        // consecutive rects OVERLAP. Cutting at the upper rect's bottom leaves ~0px between the
        // upper line's descenders and the next line's tops, so a sliver of the next line leaks
        // onto the previous page. Cut in the middle of the real glyph gap instead:
        // between the upper bottom and the next line's cap-height (~17% below its rect top).
        if (r.top < gBottom) {
            const nextGlyphTop = r.top + (r.bottom - r.top) * 0.17;
            breaks.push(nextGlyphTop > gBottom ? (gBottom + nextGlyphTop) / 2 : gBottom);
        } else {
            breaks.push((gBottom + r.top) / 2);
        }
        gTop = r.top;
        gBottom = r.bottom;
    });
    return breaks;
};

const computePages = (
    root: HTMLElement,
    fit: number
): { pages: PageWindow[]; contentBottom: number; sectionBottoms: Record<string, number> } => {
    // ✅ Exact geometry (same space as collectLineBreaks): offsetTop is integer-rounded and the
    // error adds up through nested elements, which put a cut a few px INSIDE a line.
    const rootRect = root.getBoundingClientRect();
    const k = root.offsetWidth > 0 && rootRect.width > 0 ? rootRect.width / root.offsetWidth : 1;
    const LH = BODY_LINE_HEIGHT * PX * fit;
    const bodyB = bIn(M_BODY);
    const bottomPx = PAGE_CONTENT_BOTTOM * PX;
    const topFor = (firstB: number) => (TOP_MARGIN - firstB) * PX + BODY_TOP_PADDING;
    const windowFor = (firstB: number) => bottomPx - topFor(firstB);

    const units = Array.from(root.querySelectorAll<HTMLElement>('[data-unit]')).map((el) => {
        const r = el.getBoundingClientRect();
        return {
            kind: el.dataset.unit as UnitKind,
            b: parseFloat(el.dataset.b || '') || bodyB,
            top: (r.top - rootRect.top) / k,
            height: r.height / k
        };
    });
    const contentBottom = units.reduce((max, u) => Math.max(max, u.top + u.height), 0);

    const pages: PageWindow[] = [];
    let start = 0;
    let curTop = 0;
    let curRing = 0;
    let limit = bottomPx;
    // `lift`: when a page starts at the top of a block (heading / entry / paragraph) the cut is
    // moved a few px UP into the blank gap above it. The previous page then can never show the
    // top of the first line, and the new page can never lose it. `top` is compensated, so the
    // block still lands exactly where it did before.
    const newPage = (cut: number, firstB: number, ring: number, lift = 0) => {
        const at = cut - lift;
        pages.push({ start, end: at, top: curTop, ring: curRing });
        start = at;
        curRing = ring;
        curTop = topFor(firstB) - lift;
        limit = cut + windowFor(firstB);
    };
    const lineBreaks = collectLineBreaks(root);
    const lineCut = (top: number) => {
        let best = -1;
        for (let i = 0; i < lineBreaks.length; i++) {
            const b = lineBreaks[i];
            if (b > limit) break;
            if (b > top + 1 && b > start + 1) best = b;
        }
        if (best > 0) return best;
        const cut = top + Math.floor((limit - top) / LH) * LH;
        return cut > start + 1 ? cut : limit;
    };

    units.forEach((u, i) => {
        const bottom = u.top + u.height;

        if (u.kind === 'head') {
            const next = units[i + 1];
            let needed = bottom;
            if (next) {
                needed = next.kind === 'flow' ? next.top + LH : Math.min(next.top + next.height, u.top + windowFor(u.b));
            }
            if (Math.max(needed, bottom) > limit && u.top > start + 1) newPage(u.top, u.b, RING_ROOM_PX, CUT_LIFT_PX);
            return;
        }

        if (u.kind === 'keep') {
            if (bottom > limit && u.top > start + 1) newPage(u.top, u.b, RING_ROOM_PX, CUT_LIFT_PX);
            while (bottom > limit) newPage(lineCut(u.top), bodyB, RING_ROOM_PX);
            return;
        }

        while (bottom > limit) {
            if (u.top > limit - LH && u.top > start + 1) newPage(u.top, u.b, RING_ROOM_PX, CUT_LIFT_PX);
            else newPage(lineCut(u.top), bodyB, RING_ROOM_PX);
        }
    });

    pages.push({ start, end: limit, top: curTop, ring: curRing });

    const sectionBottoms: Record<string, number> = {};
    root.querySelectorAll<HTMLElement>('section[data-section]').forEach((el) => {
        const r = el.getBoundingClientRect();
        sectionBottoms[el.dataset.section || ''] = (r.bottom - rootRect.top) / k;
    });

    return { pages, contentBottom, sectionBottoms };
};

let measureCanvas: HTMLCanvasElement | null = null;
const measureTextPt = (text: string, sizePt: number, bold = false): number => {
    if (typeof document === 'undefined') return text.length * sizePt * 0.5;
    if (!measureCanvas) measureCanvas = document.createElement('canvas');
    const ctx = measureCanvas.getContext('2d');
    if (!ctx) return text.length * sizePt * 0.5;
    ctx.font = `${bold ? 'bold ' : ''}${sizePt}pt ${FONT_FAMILY}`;
    return ctx.measureText(text).width / PX;
};

const wrapText = (text: string, widthPt: number, sizePt: number, bold = false): string[] => {
    const out: string[] = [];
    text.split('\n').forEach((para) => {
        const words = para.split(/\s+/).filter(Boolean);
        if (words.length === 0) {
            out.push('');
            return;
        }
        let cur = '';
        words.forEach((w) => {
            const test = cur ? `${cur} ${w}` : w;
            if (!cur || measureTextPt(test, sizePt, bold) <= widthPt) cur = test;
            else {
                out.push(cur);
                cur = w;
            }
        });
        out.push(cur);
    });
    return out;
};

const lastLineOf = (text: string, widthPt: number, sizePt: number, bold = false): string => {
    const lines = wrapText(text, widthPt, sizePt, bold);
    return lines.length > 0 ? lines[lines.length - 1] : '';
};

// ====================================================================
// HEADER LAYOUT
// ====================================================================
const NAME_LH = NAME_SIZE * 1.2;
const TITLE_LH = TITLE_SIZE * 1.2;

const getHeaderLayout = (hasPhoto: boolean, hasTitle: boolean) => {
    const bName = bIn({ L: NAME_LH, F: NAME_SIZE });
    const bTitle = bIn({ L: TITLE_LH, F: TITLE_SIZE });

    let nameBase: number;
    let titleBase: number | null = null;
    let y1: number;
    let photoTop = 0;

    if (hasPhoto) {
        nameBase = TOP_MARGIN + BODY_TOP_PADDING + PHOTO_CONTENT_DOWN_SHIFT;

        const titleSlotBase = nameBase + NAME_SIZE + NAME_TO_TITLE_GAP;
        titleBase = hasTitle ? titleSlotBase : null;
        const blockTop = nameBase - NAME_SIZE * PDF_ASCENT;
        const blockBottom = titleSlotBase + TITLE_SIZE * PDF_DESCENT;
        const photoCenterY = blockTop + (blockBottom - blockTop) / 2;
        photoTop = photoCenterY - PHOTO_SIZE / 2;
        y1 = titleSlotBase + TITLE_SIZE + TITLE_TO_CONTACT_GAP;
        y1 += Math.max(0, photoCenterY + PHOTO_BASE / 2 - blockBottom);
    } else {
        nameBase = TOP_MARGIN + BODY_TOP_PADDING + NO_IMAGE_NAME_Y_OFFSET;
        let y = TOP_MARGIN + BODY_TOP_PADDING + NAME_SIZE + NAME_TO_TITLE_GAP;
        if (hasTitle) {
            titleBase = y + NO_IMAGE_TITLE_Y_OFFSET;
            y += TITLE_SIZE + TITLE_TO_CONTACT_GAP;
        }
        y1 = y;
    }

    const nameTop = nameBase - bName;
    const nameBottom = nameTop + NAME_LH;
    const titleTop = titleBase !== null ? titleBase - bTitle : nameBottom;
    const titleBottom = titleBase !== null ? titleTop + TITLE_LH : nameBottom;
    const contactTop = y1 + CONTACT_Y_OFFSET - bIn(M_CONTACT);
    const ruleCenterNoContact = y1 + DIVIDER_SIDE_GAP;

    return {
        nameMarginTop: nameTop,
        titleMarginTop: titleTop - nameBottom,
        contactMarginTop: contactTop - titleBottom,
        ruleMarginTopWithContact: bIn(M_CONTACT) - DIVIDER_THICKNESS / 2,
        ruleMarginTopNoContact: ruleCenterNoContact - DIVIDER_THICKNESS / 2 - titleBottom,
        photoTop
    };
};

// ====================================================================
// HELPERS
// ====================================================================
const stripEmojis = (str: string): string => {
    if (!str) return str;
    return str
        .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\uFE0F\u200D]/gu, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
};

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const txt = (v: unknown): string => stripEmojis(safeText(clean(v)));

const parseSkillsList = (skillsRaw: string | undefined): string[] => {
    const skills = skillsRaw || '';
    if (!skills.trim()) return [];
    if (skills.includes(',')) {
        return skills.split(',').map((s) => stripEmojis(s.trim())).filter((s) => s);
    }
    return skills
        .split('\n')
        .map((s) => s.trim())
        .map((s) => s.replace(/^[•\-*]\s*/, ''))
        .map((s) => stripEmojis(s))
        .filter((s) => s);
};

const getProficiencyDisplayLabel = (proficiency: string): string => {
    const labels: Record<string, string> = {
        Beginner: 'Beginner',
        Intermediate: 'Professional Working Proficiency',
        Advanced: 'Advanced Professional Proficiency',
        Fluent: 'Native/Bilingual Proficiency'
    };
    return labels[proficiency] || proficiency;
};

const BULLET_MARKER_PATTERN = /^[•●◦▪‣∙‧–—*-]\s+/;
const parseBulletLines = (text?: string): string[] =>
    (text || '')
        .trim()
        .split('\n')
        .map((raw) => {
            const trimmed = raw.trim();
            const match = trimmed.match(BULLET_MARKER_PATTERN);
            return txt(match ? trimmed.slice(match[0].length) : trimmed);
        })
        .filter(Boolean);

interface EntryDef {
    first: M;
    last: M;
    pen: number;
    content: React.ReactNode;
}

// ====================================================================
// SMALL COMPONENTS
// ====================================================================

const DIVIDER_CENTER_IN_HEADING = bIn(M_HEAD) - HEADING_SIZE * SECTION_DIVIDER_BASELINE_OFFSET_RATIO;

const SectionEditLabel: React.FC = () => (
    <div
        aria-hidden="true"
        data-edit-label
        style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            background: COLOR_EDIT_LABEL_BG,
            color: COLOR_EDIT_LABEL_TEXT,
            fontSize: EDIT_LABEL_FONT_SIZE,
            fontWeight: EDIT_LABEL_FONT_WEIGHT,
            letterSpacing: '0.01em',
            padding: `${EDIT_LABEL_PADDING_Y} ${EDIT_LABEL_PADDING_X}`,
            borderRadius: '0 4px 0 0',
            pointerEvents: 'none',
            zIndex: 10,
            whiteSpace: 'nowrap',
            boxShadow: '0 -2px 6px rgba(248, 113, 113, 0.35)',
        }}
    >
        {EDIT_LABEL_TEXT}
    </div>
);

const ringStyle = (isHovered: boolean, interactive: boolean): React.CSSProperties => {
    if (!interactive) return {};
    if (isHovered) {
        return { boxShadow: `0 0 0 ${HOVER_RING_WIDTH}px ${HOVER_RING_COLOR}` };
    }
    return {};
};

const interactiveWrapperStyle = (
    isHovered: boolean,
    interactive: boolean
): React.CSSProperties => ({
    position: 'relative',
    cursor: interactive ? 'pointer' : undefined,
    borderRadius: ROUNDED_RADIUS,
    backgroundColor: 'transparent',
    transition: 'box-shadow 0.18s ease',
    ...ringStyle(isHovered, interactive),
});

const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
    <div
        {...unit('head', M_HEAD)}
        style={{
            display: 'flex',
            alignItems: 'flex-start',
            columnGap: pt(SECTION_HEADING_TO_DIVIDER_GAP),
            width: '100%',
            breakInside: 'avoid',
            pageBreakInside: 'avoid'
        }}
    >
        <h2
            style={{
                margin: 0,
                padding: 0,
                border: 'none',
                fontSize: pt(HEADING_SIZE),
                fontWeight: 'bold',
                lineHeight: pt(BODY_LINE_HEIGHT),
                letterSpacing: 0,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0
            }}
        >
            <span style={{ color: COLOR_HEADING_ACCENT }}>{title.slice(0, 3)}</span>
            <span style={{ color: COLOR_HEADING_REST }}>{title.slice(3)}</span>
        </h2>
        <div
            style={{
                flex: 1,
                minWidth: 0,
                marginTop: pt(DIVIDER_CENTER_IN_HEADING - DIVIDER_THICKNESS / 2),
                marginRight: pt(DIVIDER_WIDTH_REDUCTION),
                height: pt(DIVIDER_THICKNESS),
                backgroundColor: COLOR_DIVIDER,
                borderRadius: ROUNDED_RADIUS
            }}
        />
    </div>
);

// ====================================================================
// MOUSE GATE
// ====================================================================
interface MouseGateApi {
    shouldBlockEnter: (key: string, e: React.MouseEvent) => boolean;
    onMove: (key: string, e: React.MouseEvent) => boolean;
    onPress: (key: string) => void;
    onLeave: (key: string) => void;
}

const Section: React.FC<{
    title: string;
    sectionKey: string;
    marginTop: number;
    first: M;
    offsetFont: number;
    onEditSection?: (key: string) => void;
    activeSection?: string | null;
    gate: MouseGateApi;
    hoveredKey: string | null;
    setHoveredKey: (key: string) => void;
    clearHovered: (key: string) => void;
    children: React.ReactNode;
}> = ({ title, sectionKey, marginTop, first, offsetFont, onEditSection, activeSection, gate, hoveredKey, setHoveredKey, clearHovered, children }) => {
    // ✅ Shared across ALL page copies (state lives in ATSProTemplate)
    const isHovered = hoveredKey === sectionKey;
    const interactive = !!onEditSection;
    const pageCtx = useContext(PageCtx);
    const sectionBottom = pageCtx ? pageCtx.bottoms[sectionKey] : undefined;
    const labelOnThisPage =
        !pageCtx || sectionBottom === undefined || (sectionBottom > pageCtx.start && sectionBottom <= pageCtx.end + 2);
    const showLabel = interactive && isHovered && labelOnThisPage;

    const handleClick = () => {
        if (!interactive) return;
        onEditSection!(sectionKey);
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (!interactive) return;
        if (gate.shouldBlockEnter(sectionKey, e)) return;
        setHoveredKey(sectionKey);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!interactive || isHovered) return;
        if (gate.onMove(sectionKey, e)) setHoveredKey(sectionKey);
    };

    const handleMouseDown = () => {
        if (!interactive) return;
        gate.onPress(sectionKey);
        setHoveredKey(sectionKey);
    };

    const handleMouseLeave = () => {
        if (!interactive) return;
        gate.onLeave(sectionKey);
        clearHovered(sectionKey);
    };

    return (
        <section
            data-section={sectionKey}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseLeave={interactive ? handleMouseLeave : undefined}
            style={{ ...interactiveWrapperStyle(isHovered, interactive), marginTop: pt(marginTop) }}
        >
            {showLabel && <SectionEditLabel />}
            <SectionHeading title={title} />
            <div style={{ marginTop: pt(headingToContentMargin(first, offsetFont)) }}>{children}</div>
        </section>
    );
};

const BulletList: React.FC<{ lines: string[] }> = ({ lines }) => (
    <div>
        {lines.map((line, i) => (
            <div
                key={i}
                style={{
                    display: 'flex',
                    fontSize: pt(BODY_SIZE),
                    lineHeight: pt(BODY_LINE_HEIGHT),
                    color: COLOR_BODY
                }}
            >
                <span style={{ flexShrink: 0, width: pt(BULLET_DOT_TO_TEXT_GAP), color: COLOR_BULLET }}>
                    {BULLET_MARKER}
                </span>
                <span style={{ minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{line}</span>
            </div>
        ))}
    </div>
);

const TitleDateRow: React.FC<{ title?: string; date?: string }> = ({ title, date }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'baseline',
            columnGap: pt(TITLE_TO_DATE_GAP),
            width: '100%'
        }}
    >
        {title && (
            <div
                style={{
                    flex: '1 1 0',
                    minWidth: 0,
                    fontSize: pt(ENTRY_TITLE_SIZE),
                    lineHeight: pt(ENTRY_TITLE_SIZE),
                    fontWeight: 'bold',
                    color: COLOR_HEADING,
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere'
                }}
            >
                {title}
            </div>
        )}
        {date && (
            <span
                style={{
                    marginLeft: 'auto',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    fontSize: pt(ENTRY_SUB_SIZE),
                    lineHeight: pt(ENTRY_SUB_SIZE),
                    fontWeight: 'bold',
                    color: COLOR_DATE
                }}
            >
                {date}
            </span>
        )}
    </div>
);

const subLineStyle = (color: string): React.CSSProperties => ({
    fontSize: pt(ENTRY_SUB_SIZE),
    lineHeight: pt(ENTRY_SUB_SIZE),
    color,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere'
});

const renderEntryList = (entries: EntryDef[], gap: number) =>
    entries.map((e, i) => {
        const mt = i === 0 ? 0 : endToNext(entries[i - 1].last, entries[i - 1].pen, e.first, gap);
        return (
            <div key={i} {...unit('keep', e.first)} style={{ marginTop: pt(mt), minWidth: 0 }}>
                {e.content}
            </div>
        );
    });

// ====================================================================
// TEMPLATE
// ====================================================================
const ATSProTemplate: React.FC<CVPreviewProps> = (props) => {
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
        onEditSection,
    } = props;

    const pi = personalInfo as any;

    const measureRef = useRef<HTMLDivElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [fit, setFit] = useState(1);
    const fitState = useRef({ sig: '', active: false, locked: false });
    const { profilePhoto: _photo, ...propsWithoutPhoto } = props as any;
    const contentSig = JSON.stringify(propsWithoutPhoto) + (profilePhoto ? profilePhoto.length : 0);
    const [pages, setPages] = useState<PageWindow[]>([{ start: 0, end: PAGE_CONTENT_BOTTOM * PX, top: 0, ring: 0 }]);
    const [, setFontTick] = useState(0);
    const [secBottoms, setSecBottoms] = useState<Record<string, number>>({});
    // ✅ ONE hover state for every page copy of `body`
    const [hoveredKey, setHoveredKeyState] = useState<string | null>(null);
    const setHoveredKey = React.useCallback((key: string) => setHoveredKeyState(key), []);
    const clearHovered = React.useCallback(
        (key: string) => setHoveredKeyState((prev) => (prev === key ? null : prev)),
        []
    );
    const headerHovered = hoveredKey === 'personal';

    // ✅ Mouse gate
    const blockedRef = useRef<Set<string>>(new Set());

    const gateApi: MouseGateApi = React.useMemo(
        () => ({
            shouldBlockEnter: (key, e) => {
                const ne = e.nativeEvent as MouseEvent;
                const noMovement = !ne.movementX && !ne.movementY;
                if (noMovement) blockedRef.current.add(key);
                return blockedRef.current.has(key);
            },
            onMove: (key, e) => {
                const ne = e.nativeEvent as MouseEvent;
                if (!ne.movementX && !ne.movementY) return false;
                blockedRef.current.delete(key);
                return true;
            },
            onPress: (key) => {
                blockedRef.current.delete(key);
            },
            onLeave: (key) => {
                blockedRef.current.delete(key);
            }
        }),
        []
    );

    const W = CONTENT_WIDTH / fit;

    const name = txt(pi?.name) || 'Your Name';
    const jobTitle = txt(pi?.title) || txt(pi?.jobTitle);
    const hasPhoto = !!profilePhoto && profilePhoto.startsWith('data:image');
    const hasTitle = !!jobTitle;

    const contactParts: string[] = [];
    if (clean(pi?.email)) contactParts.push(`Email: ${clean(pi.email)}`);
    if (phoneNumber) {
        const dialPrefix = selectedCountryCode ? `${selectedCountryCode} ` : '';
        contactParts.push(`Phone: ${dialPrefix}${phoneNumber}`.trim());
    }
    if (clean(pi?.address)) contactParts.push(`Address: ${clean(pi.address)}`);
    const location = clean(pi?.location) || clean(pi?.city);
    if (location) contactParts.push(`Location: ${location}`);
    if (clean(pi?.linkedin)) contactParts.push(`LinkedIn: ${clean(pi.linkedin)}`);
    if (clean(pi?.github)) contactParts.push(`GitHub: ${clean(pi.github)}`);
    const webLink = clean(pi?.website) || clean(pi?.portfolio);
    if (webLink) contactParts.push(`Portfolio URL: ${webLink}`);
    const contactItems = contactParts.map((p) => stripEmojis(safeText(p))).filter(Boolean);

    const layout = getHeaderLayout(hasPhoto, hasTitle);
    const textLeftOffset = hasPhoto ? PHOTO_SIZE + PHOTO_TO_TEXT_GAP : 0;

    interface SectionDef {
        key: string;
        title: string;
        offsetFont: number;
        first: M;
        last: M;
        pen: number;
        isSummary?: boolean;
        body: React.ReactNode;
    }
    const sections: SectionDef[] = [];

    const summaryText = (professionalSummary || '')
        .split('\n')
        .map((l) => stripEmojis(safeText(l.trim())))
        .join('\n')
        .trim();
    if (summaryText) {
        sections.push({
            key: 'summary',
            title: 'PROFESSIONAL SUMMARY',
            offsetFont: BODY_SIZE,
            first: M_BODY,
            last: M_BODY,
            pen: penalty(lastLineOf(summaryText, W, BODY_SIZE), BODY_SIZE),
            isSummary: true,
            body: (
                <p
                    {...unit('flow', M_BODY)}
                    style={{
                        margin: 0,
                        padding: 0,
                        width: '100%',
                        whiteSpace: 'pre-line',
                        fontSize: pt(BODY_SIZE),
                        lineHeight: pt(BODY_LINE_HEIGHT),
                        color: COLOR_BODY,
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere'
                    }}
                >
                    {summaryText}
                </p>
            )
        });
    }

    const titleRowLastLine = (title: string, date: string): string => {
        if (!title) return '';
        const dateWidth = date ? measureTextPt(date, ENTRY_SUB_SIZE, true) : 0;
        const wrapW = date ? Math.max(0, W - dateWidth - TITLE_TO_DATE_GAP) : W;
        return lastLineOf(title, wrapW, ENTRY_TITLE_SIZE, true);
    };

    const experienceEntries: EntryDef[] = (experiences || [])
        .map((exp: any) => ({
            title: txt(exp?.title),
            company: txt(exp?.company),
            dateRange: [txt(exp?.startDate), txt(exp?.endDate)].filter(Boolean).join(DATE_RANGE_SEPARATOR),
            bullets: parseBulletLines(exp?.description)
        }))
        .filter((e) => e.title || e.company || e.dateRange || e.bullets.length > 0)
        .map((e) => {
            const hasTitleRow = !!(e.title || e.dateRange);
            const rowM = e.title ? M_TITLE : M_SUB;
            const hasHeader = hasTitleRow || !!e.company;
            const first = hasTitleRow ? rowM : e.company ? M_SUB : M_BODY;

            let last: M;
            let lastText: string;
            if (e.bullets.length > 0) {
                last = M_BODY;
                lastText = lastLineOf(e.bullets[e.bullets.length - 1], W - BULLET_DOT_TO_TEXT_GAP, BODY_SIZE);
            } else if (e.company) {
                last = M_SUB;
                lastText = e.company;
            } else if (e.title) {
                last = M_TITLE;
                lastText = `${titleRowLastLine(e.title, e.dateRange)}${e.dateRange}`;
            } else {
                last = M_SUB;
                lastText = e.dateRange;
            }

            return {
                first,
                last,
                pen: penalty(lastText, last.F),
                content: (
                    <>
                        {hasTitleRow && <TitleDateRow title={e.title} date={e.dateRange} />}
                        {e.company && (
                            <div
                                style={{
                                    marginTop: pt(hasTitleRow ? inner(rowM, M_SUB, TITLE_TO_SUB_GAP) : 0),
                                    ...subLineStyle(COLOR_BODY)
                                }}
                            >
                                {e.company}
                            </div>
                        )}
                        {e.bullets.length > 0 && (
                            <div
                                style={{
                                    marginTop: pt(
                                        hasHeader ? inner(e.company ? M_SUB : rowM, M_BODY, SUB_TO_DESC_GAP) : 0
                                    )
                                }}
                            >
                                <BulletList lines={e.bullets} />
                            </div>
                        )}
                    </>
                )
            };
        });
    if (experienceEntries.length > 0) {
        const lastE = experienceEntries[experienceEntries.length - 1];
        sections.push({
            key: 'experience',
            title: 'EXPERIENCE',
            offsetFont: ENTRY_TITLE_SIZE,
            first: experienceEntries[0].first,
            last: lastE.last,
            pen: lastE.pen,
            body: <div>{renderEntryList(experienceEntries, ENTRY_GAP)}</div>
        });
    }

    const educationEntries: EntryDef[] = (educations || [])
        .map((edu: any) => ({
            degree: txt(edu?.degree),
            institution: txt(edu?.institution),
            year: txt(edu?.year),
            grade: txt(edu?.grade)
        }))
        .filter((e) => e.degree || e.institution || e.year || e.grade)
        .map((e) => {
            const hasRow = !!(e.degree || e.year);
            const rowM = e.degree ? M_TITLE : M_SUB;
            const first = hasRow ? rowM : M_SUB;

            let last: M = M_SUB;
            let lastText: string;
            if (e.grade) lastText = lastLineOf(`Grade: ${e.grade}`, W, ENTRY_SUB_SIZE);
            else if (e.institution) lastText = lastLineOf(e.institution, W, ENTRY_SUB_SIZE);
            else if (e.degree) {
                last = M_TITLE;
                lastText = `${titleRowLastLine(e.degree, e.year)}${e.year}`;
            } else lastText = e.year;

            return {
                first,
                last,
                pen: penalty(lastText, last.F),
                content: (
                    <>
                        {hasRow && <TitleDateRow title={e.degree} date={e.year} />}
                        {e.institution && (
                            <div
                                style={{
                                    marginTop: pt(hasRow ? inner(rowM, M_SUB, TITLE_TO_SUB_GAP) : 0),
                                    ...subLineStyle(COLOR_BODY)
                                }}
                            >
                                {e.institution}
                            </div>
                        )}
                        {e.grade && (
                            <div
                                style={{
                                    marginTop: pt(
                                        e.institution
                                            ? inner(M_SUB, M_SUB, NORMAL_CONTENT_LINE_GAP)
                                            : hasRow
                                                ? inner(rowM, M_SUB, TITLE_TO_SUB_GAP)
                                                : 0
                                    ),
                                    ...subLineStyle(COLOR_BODY)
                                }}
                            >
                                {`Grade: ${e.grade}`}
                            </div>
                        )}
                    </>
                )
            };
        });
    if (educationEntries.length > 0) {
        const lastE = educationEntries[educationEntries.length - 1];
        sections.push({
            key: 'education',
            title: 'EDUCATION',
            offsetFont: ENTRY_TITLE_SIZE,
            first: educationEntries[0].first,
            last: lastE.last,
            pen: lastE.pen,
            body: <div>{renderEntryList(educationEntries, ENTRY_GAP)}</div>
        });
    }

    const certificationEntries: EntryDef[] = (certifications || [])
        .map((c: any) => ({
            name: txt(c?.name),
            date: txt(c?.date),
            credentialId: txt(c?.credentialId)
        }))
        .filter((c) => c.name || c.date || c.credentialId)
        .map((c) => {
            const hasRow = !!(c.name || c.date);
            const rowM = c.name ? M_TITLE : M_SUB;
            const first = hasRow ? rowM : M_SUB;

            let last: M = M_SUB;
            let lastText: string;
            if (c.credentialId) lastText = lastLineOf(c.credentialId, W, ENTRY_SUB_SIZE);
            else if (c.name) {
                last = M_TITLE;
                lastText = titleRowLastLine(c.name, c.date);
            } else lastText = c.date;

            return {
                first,
                last,
                pen: penalty(lastText, last.F),
                content: (
                    <>
                        {hasRow && <TitleDateRow title={c.name} date={c.date} />}
                        {c.credentialId && (
                            <div
                                style={{
                                    marginTop: pt(hasRow ? inner(rowM, M_SUB, TITLE_TO_SUB_GAP) : 0),
                                    ...subLineStyle(COLOR_BODY)
                                }}
                            >
                                {c.credentialId}
                            </div>
                        )}
                    </>
                )
            };
        });
    if (certificationEntries.length > 0) {
        const lastE = certificationEntries[certificationEntries.length - 1];
        sections.push({
            key: 'certifications',
            title: 'CERTIFICATIONS',
            offsetFont: ENTRY_TITLE_SIZE,
            first: certificationEntries[0].first,
            last: lastE.last,
            pen: lastE.pen,
            body: <div>{renderEntryList(certificationEntries, ENTRY_GAP)}</div>
        });
    }

    const skillsList = parseSkillsList(skills);
    if (skillsList.length > 0) {
        const halfCount = Math.ceil(skillsList.length / 2);
        const leftSkills = skillsList.slice(0, halfCount);
        const rightSkills = skillsList.slice(halfCount);
        const rowCount = Math.max(leftSkills.length, rightSkills.length);
        const lastSkillText =
            rightSkills.length > 0 && rowCount === rightSkills.length
                ? rightSkills[rightSkills.length - 1]
                : leftSkills[leftSkills.length - 1];

        const skillCell = (text: string | undefined, nowrap: boolean, key: string) => (
            <div
                key={key}
                style={{
                    display: 'flex',
                    minWidth: 0,
                    fontSize: pt(BODY_SIZE),
                    lineHeight: pt(BODY_LINE_HEIGHT),
                    color: COLOR_BODY
                }}
            >
                {text !== undefined && (
                    <>
                        <span style={{ flexShrink: 0, width: pt(BULLET_DOT_TO_TEXT_GAP), color: COLOR_BULLET }}>
                            {BULLET_MARKER}
                        </span>
                        <span
                            style={{
                                minWidth: 0,
                                whiteSpace: nowrap ? 'nowrap' : 'normal',
                                overflowWrap: nowrap ? 'normal' : 'anywhere'
                            }}
                        >
                            {text}
                        </span>
                    </>
                )}
            </div>
        );

        sections.push({
            key: 'skills',
            title: 'SKILLS',
            offsetFont: BODY_SIZE,
            first: M_BODY,
            last: M_BODY,
            pen: penalty(lastSkillText, BODY_SIZE),
            body: (
                <div
                    {...unit('flow', M_BODY)}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) auto',
                        columnGap: pt(BULLET_DOT_TO_TEXT_GAP),
                        width: '100%'
                    }}
                >
                    {Array.from({ length: rowCount }).map((_, i) => (
                        <React.Fragment key={i}>
                            {skillCell(leftSkills[i], false, `l${i}`)}
                            {skillCell(rightSkills[i], true, `r${i}`)}
                        </React.Fragment>
                    ))}
                </div>
            )
        });
    }

    const languageEntries: EntryDef[] = (languages || [])
        .map((l: any) => ({ language: txt(l?.language), proficiency: txt(l?.proficiency) }))
        .filter((l) => l.language || l.proficiency)
        .map((l) => {
            const level = l.proficiency ? getProficiencyDisplayLabel(l.proficiency) : '';
            const levelPart = level ? `${LANGUAGE_NAME_LEVEL_SEPARATOR}${level}` : '';
            const combined = `${l.language}${levelPart}`;
            const combinedLines = combined ? wrapText(combined, W, ENTRY_TITLE_SIZE, true) : [];
            const lastLineText = combinedLines.length > 0 ? combinedLines[combinedLines.length - 1] : combined;
            const mixed = combinedLines.length === 1 && !!l.language && !!levelPart;

            return {
                first: M_TITLE,
                last: M_TITLE,
                pen: penalty(lastLineText, ENTRY_TITLE_SIZE),
                content: (
                    <div
                        style={{
                            fontSize: pt(ENTRY_TITLE_SIZE),
                            lineHeight: pt(ENTRY_TITLE_SIZE),
                            fontWeight: 'bold',
                            color: COLOR_HEADING,
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere'
                        }}
                    >
                        {mixed ? (
                            <>
                                <span>{l.language}</span>
                                <span
                                    style={{
                                        fontSize: pt(ENTRY_SUB_SIZE),
                                        lineHeight: 1,
                                        fontWeight: 'normal',
                                        color: COLOR_BODY
                                    }}
                                >
                                    {levelPart}
                                </span>
                            </>
                        ) : (
                            combined
                        )}
                    </div>
                )
            };
        });
    if (languageEntries.length > 0) {
        const lastE = languageEntries[languageEntries.length - 1];
        sections.push({
            key: 'languages',
            title: 'LANGUAGES',
            offsetFont: ENTRY_TITLE_SIZE,
            first: M_TITLE,
            last: lastE.last,
            pen: lastE.pen,
            body: <div>{renderEntryList(languageEntries, 0)}</div>
        });
    }

    const achievementEntries: EntryDef[] = (achievements || [])
        .map((a: any) => ({
            title: txt(a?.title),
            date: txt(a?.date),
            bullets: parseBulletLines(a?.description)
        }))
        .filter((a) => a.title || a.date || a.bullets.length > 0)
        .map((a) => {
            const hasRow = !!(a.title || a.date);
            const rowM = a.title ? M_TITLE : M_SUB;
            const first = hasRow ? rowM : M_BODY;

            let last: M;
            let lastText: string | undefined;
            if (a.bullets.length > 0) {
                last = M_BODY;
                lastText = lastLineOf(a.bullets[a.bullets.length - 1], W - BULLET_DOT_TO_TEXT_GAP, BODY_SIZE);
            } else if (hasRow) {
                last = rowM;
                lastText = a.title ? `${titleRowLastLine(a.title, a.date)}${a.date}` : a.date;
            } else {
                last = M_TITLE;
                lastText = undefined;
            }

            return {
                first,
                last,
                pen: penalty(lastText, last.F),
                content: (
                    <>
                        {hasRow && <TitleDateRow title={a.title} date={a.date} />}
                        {a.bullets.length > 0 && (
                            <div style={{ marginTop: pt(hasRow ? inner(rowM, M_BODY, SUB_TO_DESC_GAP) : 0) }}>
                                <BulletList lines={a.bullets} />
                            </div>
                        )}
                    </>
                )
            };
        });
    if (achievementEntries.length > 0) {
        const lastE = achievementEntries[achievementEntries.length - 1];
        sections.push({
            key: 'achievements',
            title: 'ACHIEVEMENTS',
            offsetFont: ENTRY_TITLE_SIZE,
            first: achievementEntries[0].first,
            last: lastE.last,
            pen: lastE.pen,
            body: <div>{renderEntryList(achievementEntries, ENTRY_GAP)}</div>
        });
    }

    const projectEntries: EntryDef[] = (projects || [])
        .map((p: any) => ({
            name: txt(p?.name),
            tech: txt(p?.tech),
            bullets: parseBulletLines(p?.description),
            github: clean(p?.github)
        }))
        .filter((p) => p.name || p.tech || p.bullets.length > 0 || p.github)
        .map((p) => {
            type Block = { m: M; node: React.ReactNode; kind: 'name' | 'tech' | 'desc' | 'github' };
            const blocks: Block[] = [];
            if (p.name) {
                blocks.push({
                    kind: 'name',
                    m: M_TITLE,
                    node: (
                        <div
                            style={{
                                fontSize: pt(ENTRY_TITLE_SIZE),
                                lineHeight: pt(ENTRY_TITLE_SIZE),
                                fontWeight: 'bold',
                                color: COLOR_HEADING,
                                wordBreak: 'break-word',
                                overflowWrap: 'anywhere'
                            }}
                        >
                            {p.name}
                        </div>
                    )
                });
            }
            if (p.tech) {
                blocks.push({ kind: 'tech', m: M_SUB, node: <div style={subLineStyle(COLOR_BODY)}>{p.tech}</div> });
            }
            if (p.bullets.length > 0) {
                blocks.push({ kind: 'desc', m: M_BODY, node: <BulletList lines={p.bullets} /> });
            }
            if (p.github) {
                const isUrl = /^https?:\/\//i.test(p.github);
                blocks.push({
                    kind: 'github',
                    m: M_SUB,
                    node: isUrl ? (
                        <a
                            href={p.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'block', textDecoration: 'none', ...subLineStyle(COLOR_METADATA) }}
                        >
                            {p.github}
                        </a>
                    ) : (
                        <div style={subLineStyle(COLOR_METADATA)}>{p.github}</div>
                    )
                });
            }

            const lastBlock = blocks[blocks.length - 1];
            let lastText: string;
            if (lastBlock.kind === 'github') lastText = lastLineOf(p.github, W, ENTRY_SUB_SIZE);
            else if (lastBlock.kind === 'desc')
                lastText = lastLineOf(p.bullets[p.bullets.length - 1], W - BULLET_DOT_TO_TEXT_GAP, BODY_SIZE);
            else if (lastBlock.kind === 'tech') lastText = lastLineOf(p.tech, W, ENTRY_SUB_SIZE);
            else lastText = lastLineOf(p.name, W, ENTRY_TITLE_SIZE, true);

            return {
                first: blocks[0].m,
                last: lastBlock.m,
                pen: penalty(lastText, lastBlock.m.F),
                content: (
                    <>
                        {blocks.map((b, i) => {
                            const gap = b.kind === 'tech' && blocks[i - 1]?.kind === 'name' ? TITLE_TO_SUB_GAP : SUB_TO_DESC_GAP;
                            return (
                                <div key={i} style={{ marginTop: pt(i === 0 ? 0 : inner(blocks[i - 1].m, b.m, gap)) }}>
                                    {b.node}
                                </div>
                            );
                        })}
                    </>
                )
            };
        });
    if (projectEntries.length > 0) {
        const lastE = projectEntries[projectEntries.length - 1];
        sections.push({
            key: 'projects',
            title: 'PROJECTS',
            offsetFont: ENTRY_TITLE_SIZE,
            first: projectEntries[0].first,
            last: lastE.last,
            pen: lastE.pen,
            body: <div>{renderEntryList(projectEntries, ENTRY_GAP)}</div>
        });
    }

    useEffect(() => {
        let alive = true;
        (document as any).fonts?.ready?.then(() => alive && setFontTick((t) => t + 1));
        return () => {
            alive = false;
        };
    }, []);

    useLayoutEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const update = () => {
            const next = Math.min(1, el.clientWidth / (PAGE_WIDTH * PX));
            if (next > 0) setScale((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
        };
        update();
        if (typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useLayoutEffect(() => {
        if (!measureRef.current) return;
        const fs = fitState.current;

        if (fs.sig !== contentSig) {
            fs.sig = contentSig;
            fs.active = false;
            fs.locked = false;
            if (fit !== 1) {
                setFit(1);
                return;
            }
        }

        const { pages: next, contentBottom, sectionBottoms } = computePages(measureRef.current, fit);
        setPages((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
        setSecBottoms((prev) => (JSON.stringify(prev) === JSON.stringify(sectionBottoms) ? prev : sectionBottoms));

        if (fs.locked) return;
        const lastOverflowPt = (contentBottom - next[next.length - 1].start) / PX;

        if (!fs.active) {
            if (next.length === 2 && lastOverflowPt <= AUTO_FIT_MAX_OVERFLOW_PT) {
                fs.active = true;
                setFit(Math.round((1 - AUTO_FIT_STEP) * 100) / 100);
            } else {
                fs.locked = true;
            }
            return;
        }

        if (next.length === 1) {
            fs.active = false;
            fs.locked = true;
        } else if (fit - AUTO_FIT_STEP >= AUTO_FIT_MIN_SCALE - 1e-9) {
            setFit(Math.round((fit - AUTO_FIT_STEP) * 100) / 100);
        } else {
            fs.active = false;
            fs.locked = true;
            setFit(1);
        }
    });

    const headerInteractive = !!onEditSection;

    const handleHeaderClick = () => {
        if (!headerInteractive) return;
        onEditSection!('personal');
    };

    const handleHeaderEnter = (e: React.MouseEvent) => {
        if (!headerInteractive) return;
        if (gateApi.shouldBlockEnter('personal', e)) return;
        setHoveredKey('personal');
    };

    const handleHeaderMove = (e: React.MouseEvent) => {
        if (!headerInteractive || headerHovered) return;
        if (gateApi.onMove('personal', e)) setHoveredKey('personal');
    };

    const handleHeaderDown = () => {
        if (!headerInteractive) return;
        gateApi.onPress('personal');
        setHoveredKey('personal');
    };

    const handleHeaderLeave = () => {
        if (!headerInteractive) return;
        gateApi.onLeave('personal');
        clearHovered('personal');
    };

    const body = (
        <div
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                width: pt(PAGE_WIDTH),
                paddingTop: BODY_TOP_PADDING,
                paddingLeft: pt(LEFT_MARGIN),
                paddingRight: pt(RIGHT_MARGIN),
                paddingBottom: pt(BOTTOM_MARGIN),
                fontFamily: FONT_FAMILY,
                color: COLOR_BODY
            }}
        >
            {/* ============ HEADER (clickable → Personal Info) ============ */}
            <div
                data-section="personal"
                onClick={handleHeaderClick}
                onMouseEnter={handleHeaderEnter}
                onMouseMove={handleHeaderMove}
                onMouseDown={handleHeaderDown}
                onMouseLeave={headerInteractive ? handleHeaderLeave : undefined}
                style={{
                    ...interactiveWrapperStyle(headerHovered, headerInteractive),
                    padding: `0 ${HEADER_WRAPPER_PADDING}px ${HEADER_WRAPPER_PADDING}px`,
                    margin: `0 ${HEADER_WRAPPER_MARGIN}px ${HEADER_WRAPPER_MARGIN}px`,
                }}
            >
                {headerInteractive && headerHovered && <SectionEditLabel />}

                {hasPhoto && (
                    <img
                        src={profilePhoto}
                        alt=""
                        style={{
                            position: 'absolute',
                            top: pt(layout.photoTop),
                            left: pt(0),
                            width: pt(PHOTO_SIZE),
                            height: pt(PHOTO_SIZE),
                            borderRadius: '50%',
                            objectFit: 'cover'
                        }}
                    />
                )}

                <h1
                    style={{
                        margin: 0,
                        marginTop: pt(layout.nameMarginTop),
                        marginLeft: pt(textLeftOffset - NAME_LEFT_SHIFT),
                        maxWidth: pt(CONTENT_WIDTH - textLeftOffset + NAME_LEFT_SHIFT),
                        fontSize: pt(NAME_SIZE),
                        fontWeight: 'bold',
                        lineHeight: pt(NAME_LH),
                        letterSpacing: 0,
                        textAlign: 'left',
                        color: COLOR_NAME,
                        wordBreak: 'break-word'
                    }}
                >
                    {name}
                </h1>

                {hasTitle && (
                    <div
                        style={{
                            marginTop: pt(layout.titleMarginTop),
                            marginLeft: pt(textLeftOffset),
                            maxWidth: pt(CONTENT_WIDTH - textLeftOffset),
                            fontSize: pt(TITLE_SIZE),
                            fontWeight: 'bold',
                            lineHeight: pt(TITLE_LH),
                            textAlign: 'left',
                            color: COLOR_TITLE,
                            wordBreak: 'break-word'
                        }}
                    >
                        {jobTitle}
                    </div>
                )}

                {contactItems.length > 0 && (
                    <div
                        style={{
                            marginTop: pt(layout.contactMarginTop),
                            width: '100%',
                            display: 'flex',
                            flexWrap: 'wrap',
                            columnGap: pt(CONTACT_ITEM_GAP),
                            fontSize: pt(METADATA_SIZE),
                            lineHeight: pt(BODY_LINE_HEIGHT),
                            color: COLOR_BODY
                        }}
                    >
                        {contactItems.map((item, i) => (
                            <span key={i} style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                                {item}
                            </span>
                        ))}
                    </div>
                )}

                <div
                    style={{
                        marginTop: pt(
                            contactItems.length > 0 ? layout.ruleMarginTopWithContact : layout.ruleMarginTopNoContact
                        ),
                        width: pt(CONTENT_WIDTH - 2 * DIVIDER_WIDTH_REDUCTION),
                        height: pt(DIVIDER_THICKNESS),
                        flexShrink: 0,
                        backgroundColor: COLOR_DIVIDER,
                        borderRadius: ROUNDED_RADIUS
                    }}
                />
            </div>

            <div
                data-scale-wrap
                style={{
                    position: 'relative',
                    display: 'flow-root',
                    flexShrink: 0,
                    width: pt(CONTENT_WIDTH / fit),
                    transform: fit < 1 ? `scale(${fit})` : undefined,
                    transformOrigin: 'top left'
                }}
            >
                {sections.map((s, i) => {
                    const marginTop =
                        i === 0
                            ? headerRuleToFirstSectionMargin(!!s.isSummary)
                            : endToNext(sections[i - 1].last, sections[i - 1].pen, M_HEAD, SECTION_GAP);
                    return (
                        <Section
                            key={s.key}
                            title={s.title}
                            sectionKey={s.key}
                            marginTop={marginTop}
                            first={s.first}
                            offsetFont={s.offsetFont}
                            onEditSection={onEditSection}
                            gate={gateApi}
                            hoveredKey={hoveredKey}
                            setHoveredKey={setHoveredKey}
                            clearHovered={clearHovered}
                        >
                            {s.body}
                        </Section>
                    );
                })}
            </div>
        </div>
    );

    const pagePx = PAGE_WIDTH * PX;
    const totalPx = pages.length * PAGE_HEIGHT * PX + (pages.length - 1) * PAGE_GAP_PX;

    return (
        <div ref={wrapRef} style={{ width: '100%', overflow: 'hidden' }}>
            <div style={{ position: 'relative', width: pagePx * scale, height: totalPx * scale, margin: '0 auto' }}>
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: pagePx,
                        display: 'flex',
                        flexDirection: 'column',
                        rowGap: `${PAGE_GAP_PX}px`,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left'
                    }}
                >
                    <div
                        ref={measureRef}
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '-99999px',
                            visibility: 'hidden',
                            pointerEvents: 'none',
                            zIndex: -1,
                        }}
                    >
                        {body}
                    </div>

                    {pages.map((w, k) => (
                        <div
                            key={k}
                            data-page
                            style={{
                                position: 'relative',
                                flexShrink: 0,
                                width: pt(PAGE_WIDTH),
                                height: pt(PAGE_HEIGHT),
                                overflow: 'hidden',
                                backgroundColor: '#ffffff',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: `${w.top - w.ring}px`,
                                    width: '100%',
                                    height: `${w.end - w.start + w.ring}px`,
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: `${-w.start + w.ring}px`,
                                        width: pt(PAGE_WIDTH)
                                    }}
                                >
                                    <PageCtx.Provider value={{ start: w.start, end: w.end, bottoms: secBottoms }}>
                                        {body}
                                    </PageCtx.Provider>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ATSProTemplate;