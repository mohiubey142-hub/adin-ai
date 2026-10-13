// ExecutiveTemplate.tsx
// ------------------------------------------------------------------
// Live preview that mirrors executivePdf.ts (the jsPDF generator) 1:1.
//
// ✅ PNG export: each visible page carries `data-page`.
// ✅ Label position: bottom-left corner of the section.
// ✅ HIGHLIGHT (mouse-driven): ring on hover; click opens editor.
//
// ✅ FIX (cut-off): BODY_TOP_PADDING + RING_ROOM_PX.
// ✅ FIX (mouse detection): mousemove-based gate.
//
// Executive-specific design preserved: navy+gold header band with
// serif name, badge section headings, timeline experience; Education,
// Certifications and Languages are separate single-column sections.
// ------------------------------------------------------------------

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CVPreviewProps } from '../types/previewTypes';
import { safeText } from '../utils/renderHelpers';

// ====================================================================
// PAGE (A4, same numbers as executivePdf.ts)
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

const FONT_FAMILY = 'Arial, Helvetica, "Liberation Sans", sans-serif';
const SERIF_FAMILY = '"Times New Roman", Times, "Liberation Serif", serif';

// ====================================================================
// COLORS
// ====================================================================
const COLOR_NAME = '#ffffff';
const COLOR_TITLE = '#b8a46a';
const COLOR_CONTACT = '#c8dcdc';
const COLOR_HEADER_BG = '#0d1b2a';
const COLOR_GOLD = '#c6a75e';
const COLOR_SECTION = '#1a3a5c';
const COLOR_HEADING = '#0a0a0f';
const COLOR_BODY = '#1a1a2e';
const COLOR_METADATA = '#4a4a5a';
const COLOR_BULLET = '#0d1b2a';
const COLOR_LINK = '#0d1b2a';
const COLOR_TIMELINE = COLOR_TITLE;

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

// ✅ Ring reservation
const BODY_TOP_PADDING = HOVER_RING_WIDTH;
const RING_ROOM_PX = HOVER_RING_WIDTH;

// ====================================================================
// SPACING (pt)
// ====================================================================
const NAME_TO_TITLE_GAP = 6;
const TITLE_TO_CONTACT_GAP = 10;
const SECTION_GAP = 18;
const DIVIDER_SIDE_GAP = 4 * MM_TO_PT;
const SECTION_DIVIDER_THICKNESS = 0.75 + 0.35 * MM_TO_PT;
const TITLE_TO_SUBTITLE_GAP = 3;
const SUBTITLE_TO_DESCRIPTION_GAP = 6;
const ENTRY_GAP = 14;
const BULLET_DOT_TO_TEXT_GAP = 3 * MM_TO_PT;
const TITLE_TO_DATE_GAP = 3 * MM_TO_PT;

const HEADER_TOP_EXTRA_PADDING = 3 * MM_TO_PT;
const HEADER_TOP_SIZE_REDUCTION = 4 * MM_TO_PT;

// Extra top area removed from the header band. Subtracted from the
// header's own start Y (same mechanism as HEADER_TOP_SIZE_REDUCTION), so
// the band shrinks by exactly this much from the top while its gold
// border frame, the gaps inside the header and every section gap below
// are unchanged -- the band bottom and everything after it simply move
// up by this same amount.
const HEADER_TOP_CUT_MM = 3;
const HEADER_TOP_CUT = HEADER_TOP_CUT_MM * MM_TO_PT;
const HEADER_TEXT_HORIZONTAL_SHIFT = 3 * MM_TO_PT;
const NAME_DRAW_DOWN = (2 + 2 + 4) * MM_TO_PT;
const TITLE_DRAW_DOWN = (2 + 2 + 2.5) * MM_TO_PT;
const NAME_LETTER_SPACING = 1 * MM_TO_PT;
const TITLE_LETTER_SPACING = 0.6 * MM_TO_PT;
const CONTACT_Y_OFFSET = 2 * MM_TO_PT;
const CONTACT_X_OFFSET = 0.5 * MM_TO_PT;
const CONTACT_SEPARATOR = '       ';
const CONTACT_PHOTO_SAFETY_GAP = 3 * MM_TO_PT;
const BAND_BELOW_CONTACT = (4.5 + 3 + 3.5) * MM_TO_PT;
const HEADER_BORDER_LINE_WIDTH = 0.65 * MM_TO_PT;
const HEADER_BORDER_DRAWN_INSET = (HEADER_BORDER_LINE_WIDTH / 2) * Math.SQRT2;
const HEADER_BORDER_OUTER_OFFSET = HEADER_BORDER_DRAWN_INSET - HEADER_BORDER_LINE_WIDTH / 2;

const PHOTO_BASE_SIZE = 75;
const PHOTO_RENDER_SIZE = (PHOTO_BASE_SIZE + 7 * (72 / 96)) * 1.05;
const PHOTO_VERTICAL_SHIFT = 10 * MM_TO_PT;
const PHOTO_HORIZONTAL_SHIFT = 3 * MM_TO_PT;
const PHOTO_TO_CONTACT_GAP = 0.5 * MM_TO_PT;
const PHOTO_X = PAGE_WIDTH - RIGHT_MARGIN - PHOTO_RENDER_SIZE + PHOTO_HORIZONTAL_SHIFT;

const BADGE_DIAMETER = 7 * MM_TO_PT;
const BADGE_RADIUS = BADGE_DIAMETER / 2;
const ICON_TEXT_SHIFT = BADGE_DIAMETER + 2.2 * MM_TO_PT;
const ICON_GLYPH_LINE_WIDTH = 0.9;

const TIMELINE_COLUMN_SHIFT = 5 * MM_TO_PT;
const TIMELINE_LINE_X = 1 * MM_TO_PT;
const TIMELINE_DOT_RADIUS = 1 * MM_TO_PT;
const TIMELINE_LINE_WIDTH = 0.75;
const TIMELINE_START_EXTENSION = 0.5 * MM_TO_PT;
const TIMELINE_END_REDUCTION = 3 * MM_TO_PT;

const SKILLS_SEPARATOR = '   •   ';

const PDF_ASCENT = 0.718;
const PDF_DESCENT = 0.207;

// ====================================================================
// PDF (jsPDF baselines) -> CSS (line boxes) CONVERSION
// ====================================================================
const CSS_ASCENT = 0.905;
const CSS_DESCENT = 0.212;
const baselineIn = (lh: number, fs: number) => lh / 2 + ((CSS_ASCENT - CSS_DESCENT) / 2) * fs;
const baselineInSerif = (lh: number, fs: number) => lh / 2 + ((0.891 - 0.216) / 2) * fs;

interface Line {
    fs: number;
    lh: number;
}
const L_HEAD: Line = { fs: HEADING_SIZE, lh: BODY_LINE_HEIGHT };
const L_BODY: Line = { fs: BODY_SIZE, lh: BODY_LINE_HEIGHT };
const L_TITLE: Line = { fs: ENTRY_TITLE_SIZE, lh: ENTRY_TITLE_SIZE };
const L_SUB: Line = { fs: ENTRY_SUB_SIZE, lh: ENTRY_SUB_SIZE };

const above = (l: Line) => baselineIn(l.lh, l.fs);
const below = (l: Line) => l.lh - baselineIn(l.lh, l.fs);
const gapBetween = (delta: number, prev: Line, next: Line) => delta - below(prev) - above(next);

const SECTION_TOP_MARGIN = SECTION_GAP - above(L_HEAD) + above(L_BODY);
const FIRST_SECTION_EXTRA = below(L_BODY) + SECTION_DIVIDER_THICKNESS / 2;
const DIVIDER_MARGIN_TOP = DIVIDER_SIDE_GAP - below(L_HEAD);
const contentTopMargin = (first: Line) => DIVIDER_SIDE_GAP + first.fs * PDF_ASCENT - above(first);
const entryGapAfter = (last: Line) => BODY_LINE_HEIGHT + ENTRY_GAP - below(last) - above(L_TITLE);
const languageGapAfter = (last: Line) => BODY_LINE_HEIGHT - below(last) - above(L_TITLE);
// PDF topUpToLineHeight(): a section / column always ENDS one BODY_LINE_HEIGHT below its last baseline,
// whatever its last line is. SECTION_TOP_MARGIN assumes the previous block ends on a body-line box, so a
// block whose last line is a shorter title / sub line is topped up by the difference. Applied as the
// bottom margin of the LAST entry of each section / column (earlier entries use entryGapAfter()).
const sectionEndTopUp = (last: Line) => below(L_BODY) - below(last);

const TIMELINE_CONNECTOR = ENTRY_GAP - above(L_TITLE) + TIMELINE_END_REDUCTION;
const TIMELINE_DOT_DROP = (ENTRY_TITLE_SIZE * PDF_ASCENT) / 2;

// ====================================================================
// PAGINATION
// ====================================================================
const PX = 96 / 72;
const PAGE_GAP_PX = 16;
const PAGE_CONTENT_TOP = TOP_MARGIN - above(L_BODY) + BODY_TOP_PADDING;
const PAGE_CONTENT_BOTTOM = PAGE_HEIGHT - BOTTOM_MARGIN + 1.5;
const HEAD_BLEED_PX = 6 * PX;

interface PageWindow {
    start: number;
    end: number;
    bleed: number;
}

const keepProps = { 'data-unit': 'keep' } as const;
const flowProps = { 'data-unit': 'flow' } as const;

const offsetTopWithin = (el: HTMLElement, root: HTMLElement): number => {
    let y = 0;
    let node: HTMLElement | null = el;
    while (node && node !== root) {
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
    }
    return y;
};

const AUTO_FIT_MIN_SCALE = 0.85;
const AUTO_FIT_STEP = 0.02;
const AUTO_FIT_MAX_OVERFLOW_PT = (PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN) * 0.35;

const computePages = (root: HTMLElement, fit: number): { pages: PageWindow[]; contentBottom: number } => {
    const wrap = root.querySelector<HTMLElement>('[data-scale-wrap]');
    const wrapTop = wrap ? offsetTopWithin(wrap, root) : 0;
    const LH = BODY_LINE_HEIGHT * PX * fit;
    const contentTop = PAGE_CONTENT_TOP * PX;
    const firstLimit = PAGE_CONTENT_BOTTOM * PX;
    const windowH = PAGE_CONTENT_BOTTOM * PX - contentTop;

    const units = Array.from(root.querySelectorAll<HTMLElement>('[data-unit]')).map((el) => ({
        kind: el.dataset.unit as 'keep' | 'flow' | 'head',
        top: wrap ? wrapTop + offsetTopWithin(el, wrap) * fit : offsetTopWithin(el, root),
        height: el.offsetHeight * fit
    }));
    const contentBottom = units.reduce((max, u) => Math.max(max, u.top + u.height), 0);

    const pages: PageWindow[] = [];
    let start = 0;
    let bleed = 0;
    let limit = firstLimit;
    const newPage = (cut: number, nextBleed = 0) => {
        pages.push({ start, end: cut, bleed });
        start = cut;
        bleed = nextBleed;
        limit = cut + windowH;
    };
    const lineCut = (top: number) => {
        const cut = top + Math.floor((limit - top) / LH) * LH;
        return cut > start + 1 ? cut : limit;
    };

    units.forEach((u, i) => {
        const bottom = u.top + u.height;

        if (u.kind === 'head') {
            const next = units[i + 1];
            let needed = bottom;
            if (next) {
                needed = next.kind === 'flow' ? next.top + LH : Math.min(next.top + next.height, u.top + windowH);
            }
            if (Math.max(needed, bottom) > limit && u.top > start + 1) newPage(u.top, HEAD_BLEED_PX);
            return;
        }

        if (u.kind === 'keep') {
            if (bottom > limit && u.top > start + 1) newPage(u.top);
            while (bottom > limit) newPage(lineCut(u.top));
            return;
        }

        while (bottom > limit) {
            if (u.top > limit - LH && u.top > start + 1) newPage(u.top);
            else newPage(lineCut(u.top));
        }
    });

    pages.push({ start, end: limit, bleed });
    return { pages, contentBottom };
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

// ====================================================================
// HEADER LAYOUT
// ====================================================================
const NAME_LH = NAME_SIZE * 1.2;
const TITLE_LH = TITLE_SIZE * 1.2;

const buildContactLines = (items: string[], maxWidth: number, separatorWidth: number): string[][] => {
    const lines: string[][] = [];
    let current: string[] = [];
    let currentWidth = 0;
    for (const item of items) {
        const itemWidth = measureTextPt(item, METADATA_SIZE);
        const candidateWidth = current.length > 0 ? currentWidth + separatorWidth + itemWidth : itemWidth;
        if (candidateWidth <= maxWidth || current.length === 0) {
            current.push(item);
            currentWidth = candidateWidth;
        } else {
            lines.push(current);
            current = [item];
            currentWidth = itemWidth;
        }
    }
    if (current.length > 0) lines.push(current);
    return lines;
};

const getHeaderLayout = (hasTitle: boolean, contactLines: string[][], fit: number) => {
    const lh = BODY_LINE_HEIGHT * fit;

    let y = TOP_MARGIN + BODY_TOP_PADDING + HEADER_TOP_EXTRA_PADDING - HEADER_TOP_SIZE_REDUCTION - HEADER_TOP_CUT;
    const nameBaseline = y;
    const titleBaseline = hasTitle ? nameBaseline + NAME_SIZE + NAME_TO_TITLE_GAP : null;

    const blockTop = nameBaseline - NAME_SIZE * PDF_ASCENT;
    const blockBottom =
        titleBaseline !== null ? titleBaseline + TITLE_SIZE * PDF_DESCENT : nameBaseline + NAME_SIZE * PDF_DESCENT;
    const blockHeight = blockBottom - blockTop;

    const photoTop = blockTop + (blockHeight - PHOTO_RENDER_SIZE) / 2 + PHOTO_VERTICAL_SHIFT;

    y =
        titleBaseline !== null
            ? titleBaseline + TITLE_SIZE + TITLE_TO_CONTACT_GAP
            : nameBaseline + NAME_SIZE + NAME_TO_TITLE_GAP;
    const footprintTop = blockTop + (blockHeight - PHOTO_RENDER_SIZE) / 2;
    const overhang = Math.max(0, footprintTop + PHOTO_BASE_SIZE - blockBottom);
    y += overhang;
    if (overhang > 0) y += PHOTO_TO_CONTACT_GAP;

    const contactBaseline = y;
    let contactInkBottom = y;
    if (contactLines.length > 0) {
        const lastBaseline = y + (contactLines.length - 1) * lh;
        const lastText = contactLines[contactLines.length - 1].join(CONTACT_SEPARATOR);
        contactInkBottom = lastBaseline + (/[gjpqy]/.test(lastText) ? METADATA_SIZE * PDF_DESCENT : 0);
    }

    return {
        lh,
        nameDrawBaseline: nameBaseline + NAME_DRAW_DOWN,
        titleDrawBaseline: titleBaseline !== null ? titleBaseline + TITLE_DRAW_DOWN : null,
        photoTop,
        contactDrawBaseline: contactBaseline + CONTACT_Y_OFFSET,
        bandBottom: contactInkBottom + BAND_BELOW_CONTACT
    };
};

// ====================================================================
// HELPERS
// ====================================================================
const clean = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

const stripEmojis = (str: string): string => {
    if (!str) return str;
    return str
        .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\uFE0F\u200D]/gu, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
};

const parseSkillsList = (skillsRaw: string | undefined): string[] => {
    const skills = skillsRaw || '';
    if (!skills.trim()) return [];
    if (skills.includes(',')) {
        return skills.split(',').map((s) => s.trim()).filter((s) => s);
    }
    return skills
        .split('\n')
        .map((s) => s.trim())
        .map((s) => s.replace(/^[•\-*]\s*/, ''))
        .filter((s) => s);
};

const packSkillLines = (skills: string[], maxWidth: number): string[] => {
    const lines: string[] = [];
    let current = '';
    for (const skill of skills) {
        const candidate = current ? `${current}${SKILLS_SEPARATOR}${skill}` : skill;
        if (measureTextPt(candidate, BODY_SIZE) <= maxWidth || !current) {
            current = candidate;
        } else {
            lines.push(current);
            current = skill;
        }
    }
    if (current) lines.push(current);
    return lines;
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

const BULLET_MARKER_REGEX = /^[•\-*‣◦●·]\s+/;
const parseBulletLines = (text?: string): string[] =>
    (text || '')
        .trim()
        .split('\n')
        .map((raw) => raw.trim().replace(BULLET_MARKER_REGEX, '').trim())
        .filter(Boolean);

// ====================================================================
// TITLE ROW
// ====================================================================
type RowKind = 'none' | 'title' | 'shared' | 'stacked' | 'dateOnly';

const analyzeTitleRow = (
    title: string,
    date: string,
    cw: number,
    allowStacked: boolean
): { kind: RowKind; last: Line } => {
    if (!title && !date) return { kind: 'none', last: L_SUB };
    if (!date) return { kind: 'title', last: L_TITLE };
    if (!title) return { kind: 'dateOnly', last: L_SUB };
    if (!allowStacked) return { kind: 'shared', last: L_TITLE };

    const dateWidth = measureTextPt(date, ENTRY_SUB_SIZE);
    const sharedRowTitleWidth = Math.max(0, cw - dateWidth - TITLE_TO_DATE_GAP);
    const longestWord = title
        .split(/\s+/)
        .filter(Boolean)
        .reduce((max, word) => Math.max(max, measureTextPt(word, ENTRY_TITLE_SIZE, true)), 0);
    const sameRow = sharedRowTitleWidth > 0 && sharedRowTitleWidth >= longestWord;
    return sameRow ? { kind: 'shared', last: L_TITLE } : { kind: 'stacked', last: L_SUB };
};

const wrapStyle: React.CSSProperties = { minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' };

const titleStyle: React.CSSProperties = {
    ...wrapStyle,
    fontSize: pt(ENTRY_TITLE_SIZE),
    fontWeight: 'bold',
    lineHeight: pt(ENTRY_TITLE_SIZE),
    color: COLOR_HEADING
};

const dateStyle: React.CSSProperties = {
    fontSize: pt(ENTRY_SUB_SIZE),
    fontWeight: 'normal',
    lineHeight: pt(ENTRY_SUB_SIZE),
    color: COLOR_BODY,
    whiteSpace: 'nowrap'
};

const subStyle: React.CSSProperties = {
    ...wrapStyle,
    fontSize: pt(ENTRY_SUB_SIZE),
    lineHeight: pt(ENTRY_SUB_SIZE),
    color: COLOR_METADATA
};

const TitleRow: React.FC<{ title: string; date: string; kind: RowKind }> = ({ title, date, kind }) => {
    if (kind === 'none') return null;

    if (kind === 'title') return <div style={titleStyle}>{safeText(title)}</div>;

    if (kind === 'dateOnly') return <div style={{ ...dateStyle, textAlign: 'right' }}>{safeText(date)}</div>;

    if (kind === 'shared') {
        return (
            <div style={{ display: 'flex', alignItems: 'flex-start', columnGap: pt(TITLE_TO_DATE_GAP), width: '100%' }}>
                <div style={{ ...titleStyle, flex: '1 1 0' }}>{safeText(title)}</div>
                <div
                    style={{
                        ...dateStyle,
                        flexShrink: 0,
                        marginTop: pt(above(L_TITLE) - above(L_SUB))
                    }}
                >
                    {safeText(date)}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={titleStyle}>{safeText(title)}</div>
            <div
                style={{
                    ...dateStyle,
                    textAlign: 'right',
                    marginTop: pt(gapBetween(ENTRY_TITLE_SIZE + TITLE_TO_SUBTITLE_GAP, L_TITLE, L_SUB))
                }}
            >
                {safeText(date)}
            </div>
        </div>
    );
};

// ====================================================================
// SECTION ICON BADGES
// ====================================================================
type SectionIconType =
    | 'summary'
    | 'experience'
    | 'education'
    | 'certifications'
    | 'languages'
    | 'skills'
    | 'achievements'
    | 'projects';

const SectionBadge: React.FC<{ icon: SectionIconType; left: number; top: number }> = ({ icon, left, top }) => {
    const r = BADGE_RADIUS;
    const cx = r;
    const cy = r;
    const G = '#ffffff';
    const sw = ICON_GLYPH_LINE_WIDTH;
    const fillRect = (x: number, y: number, w: number, h: number, rad: number) => (
        <rect x={x} y={y} width={w} height={h} rx={rad} ry={rad} fill={G} />
    );
    const tri = (a: number[], b: number[], c: number[]) => (
        <polygon points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${c[0]},${c[1]}`} fill={G} />
    );

    let glyph: React.ReactNode = null;
    switch (icon) {
        case 'summary':
            glyph = (
                <>
                    <circle cx={cx} cy={cy - r * 0.32} r={r * 0.26} fill={G} />
                    {fillRect(cx - r * 0.42, cy + r * 0.06, r * 0.84, r * 0.5, r * 0.18)}
                </>
            );
            break;
        case 'experience':
            glyph = (
                <>
                    <rect
                        x={cx - r * 0.22}
                        y={cy - r * 0.42}
                        width={r * 0.44}
                        height={r * 0.24}
                        rx={r * 0.06}
                        fill="none"
                        stroke={G}
                        strokeWidth={sw}
                    />
                    {fillRect(cx - r * 0.5, cy - r * 0.16, r, r * 0.62, r * 0.08)}
                    <line
                        x1={cx - r * 0.5}
                        y1={cy + r * 0.15}
                        x2={cx + r * 0.5}
                        y2={cy + r * 0.15}
                        stroke={COLOR_HEADER_BG}
                        strokeWidth={sw}
                    />
                </>
            );
            break;
        case 'education':
            glyph = (
                <>
                    {tri([cx - r * 0.55, cy - r * 0.08], [cx, cy - r * 0.38], [cx + r * 0.55, cy - r * 0.08])}
                    {tri([cx - r * 0.55, cy - r * 0.08], [cx, cy + r * 0.18], [cx + r * 0.55, cy - r * 0.08])}
                    {fillRect(cx - r * 0.16, cy - r * 0.06, r * 0.32, r * 0.16, r * 0.03)}
                    <line
                        x1={cx + r * 0.32}
                        y1={cy - r * 0.02}
                        x2={cx + r * 0.44}
                        y2={cy + r * 0.34}
                        stroke={G}
                        strokeWidth={sw}
                    />
                    <circle cx={cx + r * 0.44} cy={cy + r * 0.4} r={r * 0.07} fill={G} />
                </>
            );
            break;
        case 'certifications':
            glyph = (
                <>
                    {tri([cx - r * 0.28, cy + r * 0.08], [cx - r * 0.06, cy + r * 0.5], [cx - r * 0.4, cy + r * 0.5])}
                    {tri([cx + r * 0.28, cy + r * 0.08], [cx + r * 0.06, cy + r * 0.5], [cx + r * 0.4, cy + r * 0.5])}
                    <circle cx={cx} cy={cy - r * 0.1} r={r * 0.36} fill="none" stroke={G} strokeWidth={sw} />
                    <circle cx={cx} cy={cy - r * 0.1} r={r * 0.16} fill={G} />
                </>
            );
            break;
        case 'languages':
            glyph = (
                <>
                    <circle cx={cx} cy={cy} r={r * 0.42} fill="none" stroke={G} strokeWidth={sw} />
                    <line x1={cx - r * 0.42} y1={cy} x2={cx + r * 0.42} y2={cy} stroke={G} strokeWidth={sw} />
                    <ellipse cx={cx} cy={cy} rx={r * 0.18} ry={r * 0.42} fill="none" stroke={G} strokeWidth={sw} />
                </>
            );
            break;
        case 'skills': {
            const toothCount = 8;
            const inner = r * 0.5;
            const outer = r * 0.74;
            const hw = r * 0.12;
            const teeth: React.ReactNode[] = [];
            for (let i = 0; i < toothCount; i += 1) {
                const a = (i / toothCount) * Math.PI * 2;
                const cosA = Math.cos(a);
                const sinA = Math.sin(a);
                const px = -sinA;
                const py = cosA;
                const ix = cx + cosA * inner;
                const iy = cy + sinA * inner;
                const ox = cx + cosA * outer;
                const oy = cy + sinA * outer;
                const pts = [
                    [ix + px * hw, iy + py * hw],
                    [ox + px * hw, oy + py * hw],
                    [ox - px * hw, oy - py * hw],
                    [ix - px * hw, iy - py * hw]
                ];
                teeth.push(<polygon key={i} points={pts.map((p) => `${p[0]},${p[1]}`).join(' ')} fill={G} />);
            }
            glyph = (
                <>
                    <circle cx={cx} cy={cy} r={r * 0.5} fill="none" stroke={G} strokeWidth={sw} />
                    <circle cx={cx} cy={cy} r={r * 0.14} fill={G} />
                    {teeth}
                </>
            );
            break;
        }
        case 'achievements':
            glyph = (
                <>
                    {fillRect(cx - r * 0.34, cy - r * 0.4, r * 0.68, r * 0.4, r * 0.1)}
                    <rect x={cx - r * 0.07} y={cy} width={r * 0.14} height={r * 0.22} fill={G} />
                    {fillRect(cx - r * 0.26, cy + r * 0.22, r * 0.52, r * 0.12, r * 0.03)}
                </>
            );
            break;
        case 'projects':
            glyph = (
                <>
                    {fillRect(cx - r * 0.45, cy - r * 0.32, r * 0.4, r * 0.2, r * 0.05)}
                    {fillRect(cx - r * 0.45, cy - r * 0.16, r * 0.9, r * 0.56, r * 0.06)}
                </>
            );
            break;
    }

    return (
        <svg
            width={pt(2 * r)}
            height={pt(2 * r)}
            viewBox={`0 0 ${2 * r} ${2 * r}`}
            style={{ position: 'absolute', left: pt(left), top: pt(top), overflow: 'visible' }}
        >
            <circle cx={cx} cy={cy} r={r} fill={COLOR_HEADER_BG} />
            {glyph}
        </svg>
    );
};

// ====================================================================
// SMALL COMPONENTS
// ====================================================================

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

interface HeadingItem {
    title: string;
    icon: SectionIconType;
    x: number;
}

const SectionHeading: React.FC<{ items: HeadingItem[] }> = ({ items }) => (
    <div data-unit="head" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <div style={{ position: 'relative', height: pt(BODY_LINE_HEIGHT) }}>
            {items.map((item) => (
                <React.Fragment key={item.title}>
                    <SectionBadge
                        icon={item.icon}
                        left={item.x}
                        top={above(L_HEAD) - (HEADING_SIZE * PDF_ASCENT) / 2 - BADGE_RADIUS}
                    />
                    <h2
                        style={{
                            position: 'absolute',
                            left: pt(item.x + ICON_TEXT_SHIFT),
                            top: 0,
                            margin: 0,
                            padding: 0,
                            border: 'none',
                            fontSize: pt(HEADING_SIZE),
                            fontWeight: 'bold',
                            lineHeight: pt(BODY_LINE_HEIGHT),
                            letterSpacing: 0,
                            textTransform: 'none',
                            whiteSpace: 'nowrap',
                            color: COLOR_SECTION
                        }}
                    >
                        {item.title}
                    </h2>
                </React.Fragment>
            ))}
        </div>
        <div
            style={{
                height: pt(SECTION_DIVIDER_THICKNESS),
                marginTop: pt(DIVIDER_MARGIN_TOP),
                backgroundColor: COLOR_GOLD,
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
    items: HeadingItem[];
    sectionKey: string;
    first: Line;
    onEditSection?: (key: string) => void;
    activeSection?: string | null;
    gate: MouseGateApi;
    hoveredKey: string | null;
    setHoveredKey: (key: string) => void;
    clearHovered: (key: string) => void;
    children: React.ReactNode;
}> = ({ items, sectionKey, first, onEditSection, activeSection, gate, hoveredKey, setHoveredKey, clearHovered, children }) => {
    // ✅ Shared across ALL page copies (state lives in ExecutiveTemplate)
    const isHovered = hoveredKey === sectionKey;
    const interactive = !!onEditSection;
    const showLabel = interactive && isHovered;

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

    const ringPad = HOVER_RING_WIDTH;

    return (
        <section
            data-section={sectionKey}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseLeave={interactive ? handleMouseLeave : undefined}
            style={{
                position: 'relative',
                padding: ringPad,
                // The ring padding (ringPad) is only room for the hover ring, it must not add layout
                // space: the top and bottom margins each cancel their side of it, so the gap between
                // sections is exactly SECTION_TOP_MARGIN. (pt() returns a string, so
                // `pt(SECTION_TOP_MARGIN) - ringPad` was NaN and React dropped the whole margin;
                // calc() mixes the pt gap with the px ring padding instead.)
                marginTop: `calc(${pt(SECTION_TOP_MARGIN)} - ${ringPad}px)`,
                marginBottom: -ringPad,
                marginLeft: -ringPad,
                marginRight: -ringPad,
            }}
        >
            <div style={{ ...interactiveWrapperStyle(isHovered, interactive), position: 'relative' }}>
                {showLabel && <SectionEditLabel />}
                <SectionHeading items={items} />
                <div style={{ marginTop: pt(contentTopMargin(first)) }}>{children}</div>
            </div>
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
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid'
                }}
            >
                <span style={{ flexShrink: 0, width: pt(BULLET_DOT_TO_TEXT_GAP), color: COLOR_BULLET }}>•</span>
                <span style={{ ...wrapStyle, color: COLOR_BODY }}>{safeText(line)}</span>
            </div>
        ))}
    </div>
);

const entryBlock: React.CSSProperties = {
    position: 'relative',
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
    minWidth: 0
};

interface StackField {
    text: string;
    line: Line;
    style: React.CSSProperties;
    deltaFromPrev?: number;
    key?: string;
}
const StackedEntry: React.FC<{ fields: StackField[] }> = ({ fields }) => (
    <>
        {fields.map((f, i) => (
            <div
                key={i}
                style={{
                    ...f.style,
                    marginTop: i > 0 ? pt(gapBetween(f.deltaFromPrev ?? 0, fields[i - 1].line, f.line)) : 0
                }}
            >
                {safeText(f.text)}
            </div>
        ))}
    </>
);

// ====================================================================
// TEMPLATE
// ====================================================================
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
    const [pages, setPages] = useState<PageWindow[]>([{ start: 0, end: PAGE_CONTENT_BOTTOM * PX, bleed: 0 }]);
    const [, setFontTick] = useState(0);
    const [headerHovered, setHeaderHovered] = useState(false);
    // ✅ ONE hover state for every page copy of `body`
    const [hoveredKey, setHoveredKeyState] = useState<string | null>(null);
    const setHoveredKey = React.useCallback((key: string) => setHoveredKeyState(key), []);
    const clearHovered = React.useCallback(
        (key: string) => setHoveredKeyState((prev) => (prev === key ? null : prev)),
        []
    );

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

        const { pages: next, contentBottom } = computePages(measureRef.current, fit);
        setPages((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));

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

    const CW = CONTENT_WIDTH / fit;

    const summary = clean(professionalSummary);

    const validExperiences = ((experiences as any[]) || []).filter(
        (e) => e && (clean(e.title) || clean(e.company) || clean(e.startDate) || clean(e.endDate) || clean(e.description))
    );
    const validEducations = ((educations as any[]) || []).filter(
        (e) => e && (clean(e.degree) || clean(e.institution) || clean(e.year) || clean(e.grade))
    );
    const validCertifications = ((certifications as any[]) || []).filter(
        (c) => c && (clean(c.name) || clean(c.date) || clean(c.credentialId))
    );
    const validLanguages = ((languages as any[]) || []).filter((l) => l && (clean(l.language) || clean(l.proficiency)));
    const validAchievements = ((achievements as any[]) || []).filter(
        (a) => a && (clean(a.title) || clean(a.date) || clean(a.description))
    );
    const validProjects = ((projects as any[]) || []).filter(
        (p) => p && (clean(p.name) || clean(p.tech) || clean(p.description) || clean(p.github))
    );
    const skillsList = parseSkillsList(skills as string | undefined);
    const skillLines = skillsList.length > 0 ? packSkillLines(skillsList, CW) : [];

    const name = stripEmojis(safeText(clean(pi?.name) || 'Your Name')) || 'Your Name';
    const jobTitle = stripEmojis(safeText(clean(pi?.title) || clean(pi?.jobTitle)));
    const photoSrc = (typeof profilePhoto === 'string' ? profilePhoto : '') || clean(pi?.photo);
    const hasPhoto = photoSrc.trim().startsWith('data:image');
    const hasTitle = !!jobTitle;
    const textStartX = LEFT_MARGIN - HEADER_TEXT_HORIZONTAL_SHIFT;

    const contactParts: string[] = [];
    if (clean(pi?.email)) contactParts.push(`Email: ${clean(pi.email)}`);
    if (phoneNumber) {
        const dialPrefix = selectedCountryCode ? `${selectedCountryCode} ` : '';
        contactParts.push(`Phone: ${dialPrefix}${phoneNumber}`.trim());
    }
    const location = clean(pi?.location) || clean(pi?.city);
    if (location) contactParts.push(`Location: ${location}`);
    if (clean(pi?.address)) contactParts.push(`Address: ${clean(pi.address)}`);
    if (clean(pi?.linkedin)) contactParts.push(`LinkedIn: ${clean(pi.linkedin)}`);
    if (clean(pi?.github)) contactParts.push(`GitHub: ${clean(pi.github)}`);
    const webLink = clean(pi?.website) || clean(pi?.portfolio);
    if (webLink) contactParts.push(`Portfolio URL: ${webLink}`);
    const contactItems = contactParts.map((p) => stripEmojis(safeText(p))).filter(Boolean);

    const contactMaxWidth = hasPhoto ? PHOTO_X - CONTACT_PHOTO_SAFETY_GAP - LEFT_MARGIN : CONTENT_WIDTH;
    const contactSeparatorWidth = measureTextPt(CONTACT_SEPARATOR, METADATA_SIZE);
    const contactLines = buildContactLines(contactItems, contactMaxWidth, contactSeparatorWidth);
    const header = getHeaderLayout(hasTitle, contactLines, fit);

    const heading = (title: string, icon: SectionIconType): HeadingItem[] => [{ title, icon, x: 0 }];

    const renderSectionEntries = (key: 'education' | 'certifications' | 'languages') => {
        if (key === 'education') {
            return validEducations.map((edu: any, i: number) => {
                const degree = clean(edu.degree);
                const institution = clean(edu.institution);
                const grade = clean(edu.grade);
                const year = clean(edu.year);
                const fields: StackField[] = [];
                const push = (text: string, line: Line, style: React.CSSProperties, key2: string) => {
                    if (!text) return;
                    let delta = 0;
                    const prevKey = fields.length > 0 ? fields[fields.length - 1].key : '';
                    if (key2 === 'institution' && prevKey === 'degree') delta = ENTRY_TITLE_SIZE + TITLE_TO_SUBTITLE_GAP;
                    else if (prevKey === 'degree') delta = ENTRY_TITLE_SIZE + SUBTITLE_TO_DESCRIPTION_GAP;
                    else if (prevKey === 'institution') delta = BODY_LINE_HEIGHT;
                    else if (prevKey === 'date') delta = BODY_LINE_HEIGHT;
                    fields.push({ text, line, style, deltaFromPrev: delta, key: key2 });
                };
                push(degree, L_TITLE, titleStyle, 'degree');
                push(institution, L_SUB, { ...subStyle, color: COLOR_BODY }, 'institution');
                push(year, L_SUB, { ...subStyle, color: COLOR_BODY }, 'date');
                push(grade ? `Grade: ${grade}` : '', L_SUB, { ...subStyle, color: COLOR_BODY }, 'grade');
                const last = fields.length > 0 ? fields[fields.length - 1].line : L_TITLE;
                return (
                    <div
                        key={i}
                        {...keepProps}
                        style={{
                            ...entryBlock,
                            marginBottom: pt(i < validEducations.length - 1 ? entryGapAfter(last) : sectionEndTopUp(last))
                        }}
                    >
                        <StackedEntry fields={fields} />
                    </div>
                );
            });
        }

        if (key === 'certifications') {
            return validCertifications.map((c: any, i: number) => {
                const certName = clean(c.name);
                const date = clean(c.date);
                const credentialId = clean(c.credentialId);
                const fields: StackField[] = [];
                const push = (text: string, line: Line, style: React.CSSProperties, key2: string) => {
                    if (!text) return;
                    let delta = 0;
                    const prevKey = fields.length > 0 ? fields[fields.length - 1].key : '';
                    if (prevKey === 'name') delta = ENTRY_TITLE_SIZE + TITLE_TO_SUBTITLE_GAP;
                    else if (prevKey === 'date') delta = ENTRY_SUB_SIZE + TITLE_TO_SUBTITLE_GAP;
                    fields.push({ text, line, style, deltaFromPrev: delta, key: key2 });
                };
                push(certName, L_TITLE, titleStyle, 'name');
                push(date, L_SUB, { ...subStyle, color: COLOR_BODY }, 'date');
                push(credentialId ? `ID: ${credentialId}` : '', L_SUB, { ...subStyle, color: COLOR_BODY }, 'credential');
                const last = fields.length > 0 ? fields[fields.length - 1].line : L_TITLE;
                return (
                    <div
                        key={i}
                        {...keepProps}
                        style={{
                            ...entryBlock,
                            marginBottom: pt(i < validCertifications.length - 1 ? entryGapAfter(last) : sectionEndTopUp(last))
                        }}
                    >
                        <StackedEntry fields={fields} />
                    </div>
                );
            });
        }

        return validLanguages.map((l: any, i: number) => {
            const language = clean(l.language);
            const proficiencyRaw = clean(l.proficiency);
            const level = proficiencyRaw ? getProficiencyDisplayLabel(proficiencyRaw) : '';
            const fields: StackField[] = [];
            if (language) fields.push({ text: language, line: L_TITLE, style: titleStyle });
            if (level)
                fields.push({
                    text: level,
                    line: L_SUB,
                    style: subStyle,
                    deltaFromPrev: ENTRY_TITLE_SIZE + TITLE_TO_SUBTITLE_GAP
                });
            const last = fields.length > 0 ? fields[fields.length - 1].line : L_TITLE;
            return (
                <div
                    key={i}
                    {...keepProps}
                    style={{
                        ...entryBlock,
                        marginBottom: pt(i < validLanguages.length - 1 ? languageGapAfter(last) : sectionEndTopUp(last))
                    }}
                >
                    <StackedEntry fields={fields} />
                </div>
            );
        });
    };

    const headerInteractive = !!onEditSection;

    const handleHeaderClick = () => {
        if (!headerInteractive) return;
        onEditSection!('personal');
    };

    const handleHeaderEnter = (e: React.MouseEvent) => {
        if (!headerInteractive) return;
        if (gateApi.shouldBlockEnter('personal', e)) return;
        setHeaderHovered(true);
    };

    const handleHeaderMove = (e: React.MouseEvent) => {
        if (!headerInteractive || headerHovered) return;
        if (gateApi.onMove('personal', e)) setHeaderHovered(true);
    };

    const handleHeaderDown = () => {
        if (!headerInteractive) return;
        gateApi.onPress('personal');
        setHeaderHovered(true);
    };

    const handleHeaderLeave = () => {
        if (!headerInteractive) return;
        gateApi.onLeave('personal');
        setHeaderHovered(false);
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
            {/* ============ HEADER BAND (clickable → Personal Info) ============ */}
            <div
                data-section="personal"
                onClick={handleHeaderClick}
                onMouseEnter={handleHeaderEnter}
                onMouseMove={handleHeaderMove}
                onMouseDown={handleHeaderDown}
                onMouseLeave={headerInteractive ? handleHeaderLeave : undefined}
                style={{
                    ...interactiveWrapperStyle(headerHovered, headerInteractive),
                    marginLeft: pt(-LEFT_MARGIN),
                    marginRight: pt(-RIGHT_MARGIN),
                }}
            >
                {headerInteractive && headerHovered && <SectionEditLabel />}

                <div
                    style={{
                        position: 'relative',
                        flexShrink: 0,
                        boxSizing: 'border-box',
                        width: pt(PAGE_WIDTH),
                        height: pt(header.bandBottom),
                        backgroundColor: COLOR_HEADER_BG
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            boxSizing: 'border-box',
                            left: pt(HEADER_BORDER_OUTER_OFFSET),
                            top: pt(HEADER_BORDER_OUTER_OFFSET),
                            right: pt(HEADER_BORDER_OUTER_OFFSET),
                            bottom: pt(HEADER_BORDER_OUTER_OFFSET),
                            border: `${pt(HEADER_BORDER_LINE_WIDTH)} solid ${COLOR_GOLD}`,
                            pointerEvents: 'none'
                        }}
                    />

                    {hasPhoto && (
                        <img
                            src={photoSrc}
                            alt=""
                            style={{
                                position: 'absolute',
                                left: pt(PHOTO_X),
                                top: pt(header.photoTop),
                                width: pt(PHOTO_RENDER_SIZE),
                                height: pt(PHOTO_RENDER_SIZE),
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }}
                        />
                    )}

                    <div
                        style={{
                            position: 'absolute',
                            left: pt(textStartX),
                            top: pt(header.nameDrawBaseline - baselineInSerif(NAME_LH, NAME_SIZE)),
                            fontFamily: SERIF_FAMILY,
                            fontSize: pt(NAME_SIZE),
                            fontWeight: 'bold',
                            lineHeight: pt(NAME_LH),
                            letterSpacing: pt(NAME_LETTER_SPACING),
                            whiteSpace: 'nowrap',
                            color: COLOR_NAME
                        }}
                    >
                        {name}
                    </div>

                    {hasTitle && header.titleDrawBaseline !== null && (
                        <div
                            style={{
                                position: 'absolute',
                                left: pt(textStartX),
                                top: pt(header.titleDrawBaseline - baselineInSerif(TITLE_LH, TITLE_SIZE)),
                                fontFamily: SERIF_FAMILY,
                                fontSize: pt(TITLE_SIZE),
                                fontWeight: 'normal',
                                lineHeight: pt(TITLE_LH),
                                letterSpacing: pt(TITLE_LETTER_SPACING),
                                whiteSpace: 'nowrap',
                                color: COLOR_TITLE
                            }}
                        >
                            {jobTitle}
                        </div>
                    )}

                    {contactLines.map((items, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: pt(LEFT_MARGIN + CONTACT_X_OFFSET - HEADER_TEXT_HORIZONTAL_SHIFT),
                                top: pt(header.contactDrawBaseline + i * header.lh - baselineIn(header.lh, METADATA_SIZE)),
                                display: 'flex',
                                columnGap: pt(contactSeparatorWidth),
                                whiteSpace: 'nowrap',
                                fontSize: pt(METADATA_SIZE),
                                lineHeight: pt(header.lh),
                                color: COLOR_CONTACT
                            }}
                        >
                            {items.map((item, j) => (
                                <span key={j}>{item}</span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div
                data-scale-wrap
                style={{
                    position: 'relative',
                    display: 'flow-root',
                    flexShrink: 0,
                    paddingTop: pt(FIRST_SECTION_EXTRA),
                    width: pt(CW),
                    transform: fit < 1 ? `scale(${fit})` : undefined,
                    transformOrigin: 'top left'
                }}
            >
                {summary && (
                    <Section
                        items={heading('PROFESSIONAL SUMMARY', 'summary')}
                        sectionKey="summary"
                        first={L_BODY}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        <p
                            {...flowProps}
                            style={{
                                ...wrapStyle,
                                margin: 0,
                                padding: 0,
                                width: '100%',
                                fontSize: pt(BODY_SIZE),
                                lineHeight: pt(BODY_LINE_HEIGHT),
                                color: COLOR_BODY
                            }}
                        >
                            {safeText(summary)}
                        </p>
                    </Section>
                )}

                {validExperiences.length > 0 && (
                    <Section
                        items={heading('EXPERIENCE', 'experience')}
                        sectionKey="experience"
                        first={L_TITLE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        {validExperiences.map((exp: any, i: number) => {
                            const title = clean(exp.title);
                            const company = clean(exp.company);
                            const dateRange = [clean(exp.startDate), clean(exp.endDate)].filter(Boolean).join(' – ');
                            const bullets = parseBulletLines(exp.description);
                            const row = analyzeTitleRow(title, dateRange, CW - TIMELINE_COLUMN_SHIFT, false);
                            const hasHeader = row.kind !== 'none' || !!company;

                            const companyGap =
                                row.kind !== 'none' ? gapBetween(row.last.fs + TITLE_TO_SUBTITLE_GAP, row.last, L_SUB) : 0;
                            const descPrev = company ? L_SUB : row.last;
                            const descGap = hasHeader
                                ? gapBetween(descPrev.fs + SUBTITLE_TO_DESCRIPTION_GAP, descPrev, L_BODY)
                                : 0;
                            const last = bullets.length > 0 ? L_BODY : company ? L_SUB : L_TITLE;

                            const dotCentre = above(L_TITLE) - TIMELINE_DOT_DROP - (i === 0 ? TIMELINE_START_EXTENSION : 0);
                            const dotOuterRadius = TIMELINE_DOT_RADIUS + TIMELINE_LINE_WIDTH / 2;

                            return (
                                <div
                                    key={i}
                                    {...keepProps}
                                    style={{
                                        ...entryBlock,
                                        marginBottom: pt(i < validExperiences.length - 1 ? entryGapAfter(last) : sectionEndTopUp(last))
                                    }}
                                >
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: pt(TIMELINE_LINE_X - TIMELINE_LINE_WIDTH / 2),
                                            width: pt(TIMELINE_LINE_WIDTH),
                                            top: pt(i === 0 ? dotCentre : -TIMELINE_CONNECTOR),
                                            bottom: pt(below(last) + TIMELINE_END_REDUCTION - BODY_LINE_HEIGHT),
                                            backgroundColor: COLOR_TIMELINE
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: pt(TIMELINE_LINE_X - dotOuterRadius),
                                            top: pt(dotCentre - dotOuterRadius),
                                            width: pt(2 * dotOuterRadius),
                                            height: pt(2 * dotOuterRadius),
                                            borderRadius: '50%',
                                            backgroundColor: COLOR_TIMELINE
                                        }}
                                    />

                                    <div style={{ marginLeft: pt(TIMELINE_COLUMN_SHIFT) }}>
                                        <TitleRow title={title} date={dateRange} kind={row.kind} />
                                        {company && (
                                            <div style={{ ...subStyle, marginTop: pt(companyGap) }}>{safeText(company)}</div>
                                        )}
                                        {bullets.length > 0 && (
                                            <div style={{ marginTop: pt(descGap) }}>
                                                <BulletList lines={bullets} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </Section>
                )}

                {validEducations.length > 0 && (
                    <Section
                        items={heading('EDUCATION', 'education')}
                        sectionKey="education"
                        first={L_TITLE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        {renderSectionEntries('education')}
                    </Section>
                )}

                {validCertifications.length > 0 && (
                    <Section
                        items={heading('CERTIFICATIONS', 'certifications')}
                        sectionKey="certifications"
                        first={L_TITLE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        {renderSectionEntries('certifications')}
                    </Section>
                )}

                {validLanguages.length > 0 && (
                    <Section
                        items={heading('LANGUAGES', 'languages')}
                        sectionKey="languages"
                        first={L_TITLE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        {renderSectionEntries('languages')}
                    </Section>
                )}

                {skillLines.length > 0 && (
                    <Section
                        items={heading('SKILLS', 'skills')}
                        sectionKey="skills"
                        first={L_BODY}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        <div {...flowProps} style={{ width: '100%' }}>
                            {skillLines.map((line, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        whiteSpace: 'pre',
                                        fontSize: pt(BODY_SIZE),
                                        lineHeight: pt(BODY_LINE_HEIGHT),
                                        color: COLOR_BODY
                                    }}
                                >
                                    {safeText(line)}
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {validAchievements.length > 0 && (
                    <Section
                        items={heading('ACHIEVEMENTS', 'achievements')}
                        sectionKey="achievements"
                        first={L_TITLE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        {validAchievements.map((a: any, i: number) => {
                            const title = clean(a.title);
                            const date = clean(a.date);
                            const bullets = parseBulletLines(a.description);
                            const row = analyzeTitleRow(title, date, CW, true);

                            const descGap =
                                row.kind !== 'none'
                                    ? gapBetween(row.last.fs + SUBTITLE_TO_DESCRIPTION_GAP, row.last, L_BODY)
                                    : 0;
                            const last = bullets.length > 0 ? L_BODY : row.last;

                            return (
                                <div
                                    key={i}
                                    {...keepProps}
                                    style={{
                                        ...entryBlock,
                                        marginBottom: pt(i < validAchievements.length - 1 ? entryGapAfter(last) : sectionEndTopUp(last))
                                    }}
                                >
                                    <TitleRow title={title} date={date} kind={row.kind} />
                                    {bullets.length > 0 && (
                                        <div style={{ marginTop: pt(descGap) }}>
                                            <BulletList lines={bullets} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </Section>
                )}

                {validProjects.length > 0 && (
                    <Section
                        items={heading('PROJECTS', 'projects')}
                        sectionKey="projects"
                        first={L_TITLE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        {validProjects.map((p: any, i: number) => {
                            const projectName = clean(p.name);
                            const tech = clean(p.tech);
                            const bullets = parseBulletLines(p.description);
                            const github = clean(p.github);

                            const techGap = projectName ? gapBetween(ENTRY_TITLE_SIZE + TITLE_TO_SUBTITLE_GAP, L_TITLE, L_SUB) : 0;
                            const descGap = tech
                                ? gapBetween(ENTRY_SUB_SIZE + SUBTITLE_TO_DESCRIPTION_GAP, L_SUB, L_BODY)
                                : projectName
                                    ? gapBetween(ENTRY_TITLE_SIZE + SUBTITLE_TO_DESCRIPTION_GAP, L_TITLE, L_BODY)
                                    : 0;
                            const githubGap =
                                bullets.length > 0
                                    ? gapBetween(BODY_LINE_HEIGHT + SUBTITLE_TO_DESCRIPTION_GAP, L_BODY, L_SUB)
                                    : tech
                                        ? gapBetween(ENTRY_SUB_SIZE + SUBTITLE_TO_DESCRIPTION_GAP, L_SUB, L_SUB)
                                        : projectName
                                            ? gapBetween(ENTRY_TITLE_SIZE + SUBTITLE_TO_DESCRIPTION_GAP, L_TITLE, L_SUB)
                                            : 0;
                            const last = github ? L_SUB : bullets.length > 0 ? L_BODY : tech ? L_SUB : L_TITLE;
                            const githubStyle: React.CSSProperties = {
                                ...subStyle,
                                display: 'block',
                                marginTop: pt(githubGap),
                                color: COLOR_LINK,
                                textDecoration: 'none'
                            };

                            return (
                                <div
                                    key={i}
                                    {...keepProps}
                                    style={{
                                        ...entryBlock,
                                        marginBottom: pt(i < validProjects.length - 1 ? entryGapAfter(last) : sectionEndTopUp(last))
                                    }}
                                >
                                    {projectName && <div style={titleStyle}>{safeText(projectName)}</div>}
                                    {tech && <div style={{ ...subStyle, marginTop: pt(techGap) }}>{safeText(tech)}</div>}
                                    {bullets.length > 0 && (
                                        <div style={{ marginTop: pt(descGap) }}>
                                            <BulletList lines={bullets} />
                                        </div>
                                    )}
                                    {github &&
                                        (/^https?:\/\//i.test(github) ? (
                                            <a href={github} target="_blank" rel="noopener noreferrer" style={githubStyle}>
                                                {github}
                                            </a>
                                        ) : (
                                            <div style={githubStyle}>{github}</div>
                                        ))}
                                </div>
                            );
                        })}
                    </Section>
                )}
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
                        style={{ position: 'absolute', top: 0, left: 0, visibility: 'hidden', pointerEvents: 'none' }}
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
                                    top: k === 0 ? 0 : `${PAGE_CONTENT_TOP * PX - w.bleed - RING_ROOM_PX}px`,
                                    width: '100%',
                                    // FIX: clip this page's bottom by the NEXT page's bleed. That strip is the
                                    // heading badge's overhang (it belongs to the next page); without this the
                                    // top half of the badge was also painted at the bottom of this page.
                                    height: `${w.end - w.start + w.bleed + (k === 0 ? 0 : RING_ROOM_PX) - (pages[k + 1]?.bleed ?? 0)}px`,
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: `${-w.start + w.bleed + (k === 0 ? 0 : RING_ROOM_PX)}px`,
                                        width: pt(PAGE_WIDTH)
                                    }}
                                >
                                    {body}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExecutiveTemplate;