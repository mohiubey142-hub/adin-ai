// ModernTemplate.tsx
// ------------------------------------------------------------------
// Live preview that mirrors modernPdf.ts (the jsPDF generator) 1:1.
//
// ✅ PNG export: each visible page carries `data-page`.
// ✅ Label position: bottom-left corner of the section.
// ✅ HIGHLIGHT (mouse-driven): ring on hover; click opens editor.
//
// ✅ FIX (cut-off, this pass):
//     Removed the paddingTop/marginTop trick. Instead, the BODY gets
//     a real top padding equal to the ring width, and PAGE_CONTENT_TOP
//     is nudged by the same amount. This guarantees the header ring
//     and the first-section ring of every page stay inside the page's
//     `overflow: hidden` clip.
//
// ✅ FIX (mouse detection, this pass):
//     A mouseenter with no movement (layout shift) blocks that section
//     only until the user actually moves the mouse; then it highlights.
// ------------------------------------------------------------------

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CVPreviewProps } from '../types/previewTypes';
import { safeText } from '../utils/renderHelpers';

// ====================================================================
// PAGE (A4, same numbers as modernPdf.ts)
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
// Real whitespace between two consecutive normal content lines (leading on
// top of the text itself). Used so a smaller-font line pair (e.g.
// Institution -> Grade) gets the SAME visible gap as normal body lines.
const NORMAL_CONTENT_LINE_GAP = BODY_LINE_HEIGHT - BODY_SIZE;
const SKILL_TAG_FONT_SIZE = 8;

const FONT_FAMILY = 'Arial, Helvetica, "Liberation Sans", sans-serif';

// ====================================================================
// COLORS
// ====================================================================
const COLOR_PRIMARY = '#5846c8';
const COLOR_TITLE = '#46464b';
const COLOR_METADATA = '#46464b';
const COLOR_DIVIDER = '#9a92b5';
const COLOR_HEADING = '#19191e';
const COLOR_BODY = '#19191e';
const COLOR_BULLET_DOT = '#1e1e32';
const COLOR_LINK = '#28282d';
const COLOR_TAG_FILL = '#e8e4f8';
const COLOR_TAG_BORDER = '#b4aadc';

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
const SECTION_GAP = 18;
const DIVIDER_SIDE_GAP = 4 * MM_TO_PT;
const SECTION_DIVIDER_THICKNESS = 0.75 + 0.35 * MM_TO_PT;
const NO_PHOTO_NAME_DOWN_SHIFT = 2 * MM_TO_PT;
const NO_PHOTO_TITLE_DOWN_SHIFT = 1 * MM_TO_PT;

// With a profile photo the whole header block (photo, name, title,
// contact) starts this much lower. Everything in the header is derived
// from the same start Y, so the divider and all sections below move by
// the same amount and no gap changes. No photo -> shift is 0 (unchanged).
const PHOTO_CONTENT_DOWN_SHIFT_MM = 3;
const PHOTO_CONTENT_DOWN_SHIFT = PHOTO_CONTENT_DOWN_SHIFT_MM * MM_TO_PT;
const NO_PHOTO_CONTENT_DOWN_SHIFT = 0;

const HEADER_PHOTO_SIZE = 75;
const PHOTO_TO_TEXT_GAP = 15;
const PHOTO_RENDER_SIZE = HEADER_PHOTO_SIZE + 7 * (72 / 96);

const ENTRY_TITLE_TO_SUBTITLE_GAP = 3;
const ENTRY_SUBTITLE_TO_DESCRIPTION_GAP = 6;
const ENTRY_GAP_PDF = 14;
const BULLET_DOT_TO_TEXT_GAP = 3 * MM_TO_PT;
const TITLE_TO_DATE_GAP = 3 * MM_TO_PT;

const SKILL_TAG_PADDING_X = 8 * MM_TO_PT;
const SKILL_TAG_GAP = 4.5 * MM_TO_PT;
const SKILL_TAG_ROW_GAP = 5 * MM_TO_PT;
const SKILL_TAG_HEIGHT = 8.5 * MM_TO_PT;
const SKILL_TAG_RADIUS = 2 * MM_TO_PT;
const SKILL_TAG_BORDER_WIDTH = 0.08 * MM_TO_PT;

const SKILLS_SEPARATOR = '   •   ';
// Labels shown before each contact value (same labels/order as modernPdf.ts).
const CONTACT_LABELS = {
    email: 'Email: ',
    phone: 'Phone: ',
    location: 'Location: ',
    address: 'Address: ',
    linkedin: 'LinkedIn: ',
    github: 'GitHub: ',
    website: 'Portfolio URL: '
} as const;
const BULLET_MARKER = '•';
const LANGUAGE_NAME_LEVEL_SEPARATOR = ' — ';

// ====================================================================
// PDF (jsPDF baselines) -> CSS (line boxes) CONVERSION
// ====================================================================
const CSS_ASCENT = 0.905;
const CSS_DESCENT = 0.212;
const PDF_ASCENT = 0.718;
const PDF_DESCENT = 0.207;

const baselineInBox = (lineHeight: number, fontSize: number) =>
    lineHeight / 2 + ((CSS_ASCENT - CSS_DESCENT) / 2) * fontSize;

const baselineToBoxBottom = (fontSize: number) => BODY_LINE_HEIGHT - baselineInBox(BODY_LINE_HEIGHT, fontSize);

const lineGap = (delta: number, prevFontSize: number, nextFontSize: number) =>
    delta - baselineToBoxBottom(prevFontSize) - baselineInBox(BODY_LINE_HEIGHT, nextFontSize);

const tightLine = (fontSize: number): React.CSSProperties => ({
    fontSize: pt(fontSize),
    lineHeight: pt(fontSize),
    paddingTop: pt((BODY_LINE_HEIGHT - fontSize) / 2),
    paddingBottom: pt((BODY_LINE_HEIGHT - fontSize) / 2)
});

const SECTION_TOP_MARGIN = lineGap(BODY_LINE_HEIGHT + SECTION_GAP, BODY_SIZE, HEADING_SIZE);
const HEADING_TO_DIVIDER_MARGIN = DIVIDER_SIDE_GAP - baselineToBoxBottom(HEADING_SIZE);

const contentMargin = (firstFontSize?: number) =>
    firstFontSize === undefined
        ? DIVIDER_SIDE_GAP
        : DIVIDER_SIDE_GAP + firstFontSize * PDF_ASCENT - baselineInBox(BODY_LINE_HEIGHT, firstFontSize);

const ENTRY_GAP = lineGap(BODY_LINE_HEIGHT + ENTRY_GAP_PDF, BODY_SIZE, ENTRY_TITLE_SIZE);

const HEADER_RULE_BOTTOM_MARGIN =
    BODY_LINE_HEIGHT + SECTION_GAP - baselineInBox(BODY_LINE_HEIGHT, HEADING_SIZE) - SECTION_TOP_MARGIN;

// ✅ Body gets a REAL top padding equal to the ring width, so the
//    header ring stays inside the page clip. Every other page offset
//    is bumped by the same value so the layout math lines up.
const BODY_TOP_PADDING = HOVER_RING_WIDTH;

// Extra room (px) given to the clip window of pages 2+ so the ring of a
// section that starts exactly at the page cut is not clipped.
const RING_ROOM_PX = HOVER_RING_WIDTH;

// ====================================================================
// PAGINATION
// ====================================================================
const PX = 96 / 72;
const PAGE_GAP_PX = 16;
const PAGE_CONTENT_TOP = TOP_MARGIN - baselineInBox(BODY_LINE_HEIGHT, ENTRY_TITLE_SIZE) + BODY_TOP_PADDING;
const PAGE_CONTENT_BOTTOM = PAGE_HEIGHT - BOTTOM_MARGIN + 1.5;

interface PageWindow {
    start: number;
    end: number;
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
    let limit = firstLimit;
    const newPage = (cut: number) => {
        pages.push({ start, end: cut });
        start = cut;
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
            if (Math.max(needed, bottom) > limit && u.top > start + 1) newPage(u.top);
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

    pages.push({ start, end: limit });
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

const getLastContactLine = (items: string[]): string => {
    const gap = measureTextPt(SKILLS_SEPARATOR, METADATA_SIZE);
    let cursor = 0;
    let line = '';
    for (const part of items) {
        const w = measureTextPt(part, METADATA_SIZE);
        if (w > CONTENT_WIDTH) {
            line = part;
            cursor = Math.min(w, CONTENT_WIDTH) + gap;
            continue;
        }
        if (cursor > 0 && cursor + w > CONTENT_WIDTH) {
            line = '';
            cursor = 0;
        }
        line += part;
        cursor += w + gap;
    }
    return line;
};

const getHeaderLayout = (hasPhoto: boolean, hasTitle: boolean, contactItems: string[]) => {
    const contentDownShift = hasPhoto ? PHOTO_CONTENT_DOWN_SHIFT : NO_PHOTO_CONTENT_DOWN_SHIFT;
    const y0 = TOP_MARGIN + BODY_TOP_PADDING + contentDownShift;
    const afterName = y0 + NAME_SIZE + NAME_TO_TITLE_GAP;

    const nameBase = hasPhoto ? y0 : y0 + NO_PHOTO_NAME_DOWN_SHIFT;
    const titleBase = hasTitle ? (hasPhoto ? afterName : afterName + NO_PHOTO_TITLE_DOWN_SHIFT) : null;
    const titleSlotBottom = afterName + TITLE_SIZE + TITLE_TO_CONTACT_GAP;
    let contactBase = hasPhoto || hasTitle ? titleSlotBottom : afterName;

    const blockTop = y0 - NAME_SIZE * PDF_ASCENT;
    const blockBottom = afterName + TITLE_SIZE * PDF_DESCENT;
    const originalPhotoTop = blockTop + (blockBottom - blockTop - HEADER_PHOTO_SIZE) / 2;
    const originalPhotoBottom = originalPhotoTop + HEADER_PHOTO_SIZE;
    const photoTop = originalPhotoBottom - PHOTO_RENDER_SIZE;

    const photoLeft = 0;

    if (hasPhoto) contactBase += Math.max(0, originalPhotoBottom - blockBottom);

    const nameTop = nameBase - baselineInBox(NAME_LH, NAME_SIZE);
    const nameBottom = nameTop + NAME_LH;
    const titleTop = titleBase !== null ? titleBase - baselineInBox(TITLE_LH, TITLE_SIZE) : nameBottom;
    const titleBottom = titleBase !== null ? titleTop + TITLE_LH : nameBottom;
    const contactTop = contactBase - baselineInBox(BODY_LINE_HEIGHT, METADATA_SIZE);

    let ruleMarginTop: number;
    if (contactItems.length > 0) {
        const lastLine = getLastContactLine(contactItems);
        const descender = /[gjpqy]/.test(lastLine) ? METADATA_SIZE * PDF_DESCENT : 0;
        ruleMarginTop = descender + DIVIDER_SIDE_GAP - baselineToBoxBottom(METADATA_SIZE);
    } else {
        ruleMarginTop = contactBase + DIVIDER_SIDE_GAP - titleBottom;
    }

    return {
        nameMarginTop: nameTop,
        titleMarginTop: titleTop - nameBottom,
        contactMarginTop: contactTop - titleBottom,
        ruleMarginTop,
        photoTop,
        photoLeft
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
            return match ? trimmed.slice(match[0].length).trim() : trimmed;
        })
        .filter(Boolean);

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

const hasUsableExperience = (e: any) =>
    !!e && !!(clean(e.title) || clean(e.company) || clean(e.startDate) || clean(e.endDate) || clean(e.description));
const hasUsableEducation = (e: any) =>
    !!e && !!(clean(e.degree) || clean(e.institution) || clean(e.year) || clean(e.grade));
const hasUsableCertification = (e: any) => !!e && !!(clean(e.name) || clean(e.date) || clean(e.credentialId));
const hasUsableAchievement = (e: any) => !!e && !!(clean(e.title) || clean(e.date) || clean(e.description));
const hasUsableLanguage = (e: any) => !!e && !!(clean(e.language) || clean(e.proficiency));
const hasUsableProject = (e: any) =>
    !!e && !!(clean(e.name) || clean(e.tech) || clean(e.description) || clean(e.github));

// ====================================================================
// TITLE + DATE ROW
// ====================================================================
type TitleRowKind = 'none' | 'shared' | 'stacked' | 'dateOnly';
interface TitleRowInfo {
    kind: TitleRowKind;
    lastFontSize: number;
}

const getTitleRowInfo = (title: string, date: string, contentWidth: number): TitleRowInfo => {
    if (!title && !date) return { kind: 'none', lastFontSize: ENTRY_TITLE_SIZE };
    if (!date) return { kind: 'shared', lastFontSize: ENTRY_TITLE_SIZE };
    if (!title) return { kind: 'dateOnly', lastFontSize: ENTRY_SUB_SIZE };

    const dateWidth = measureTextPt(date, ENTRY_SUB_SIZE);
    const sharedRowTitleWidth = Math.max(0, contentWidth - dateWidth - TITLE_TO_DATE_GAP);
    const longestWord = title
        .split(/\s+/)
        .filter(Boolean)
        .reduce((max, word) => Math.max(max, measureTextPt(word, ENTRY_TITLE_SIZE, true)), 0);
    const shares = sharedRowTitleWidth >= longestWord && sharedRowTitleWidth >= contentWidth / 2;
    return shares
        ? { kind: 'shared', lastFontSize: ENTRY_TITLE_SIZE }
        : { kind: 'stacked', lastFontSize: ENTRY_SUB_SIZE };
};

const titleTextStyle: React.CSSProperties = {
    ...tightLine(ENTRY_TITLE_SIZE),
    fontWeight: 'bold',
    color: COLOR_HEADING,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere'
};

const dateTextStyle: React.CSSProperties = {
    fontSize: pt(ENTRY_SUB_SIZE),
    fontWeight: 'normal',
    color: COLOR_PRIMARY,
    whiteSpace: 'nowrap'
};

const TitleDateRow: React.FC<{ title: string; date: string; info: TitleRowInfo }> = ({ title, date, info }) => {
    if (info.kind === 'none') return null;

    if (info.kind === 'dateOnly') {
        return (
            <div style={{ display: 'flex', justifyContent: 'flex-end', lineHeight: pt(BODY_LINE_HEIGHT) }}>
                <span style={dateTextStyle}>{safeText(date)}</span>
            </div>
        );
    }

    if (info.kind === 'stacked') {
        return (
            <div>
                <div style={titleTextStyle}>{safeText(title)}</div>
                <div
                    style={{
                        ...dateTextStyle,
                        marginTop: pt(lineGap(BODY_LINE_HEIGHT, ENTRY_TITLE_SIZE, ENTRY_SUB_SIZE)),
                        textAlign: 'right',
                        lineHeight: pt(BODY_LINE_HEIGHT)
                    }}
                >
                    {safeText(date)}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
            <span
                style={{
                    ...titleTextStyle,
                    flex: '1 1 0',
                    minWidth: 0,
                    paddingRight: date ? pt(TITLE_TO_DATE_GAP) : 0
                }}
            >
                {safeText(title)}
            </span>
            {date && <span style={{ ...dateTextStyle, flexShrink: 0, lineHeight: pt(ENTRY_SUB_SIZE) }}>{safeText(date)}</span>}
        </div>
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

const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
    <div data-unit="head" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <h2
            style={{
                margin: 0,
                padding: 0,
                border: 'none',
                fontSize: pt(HEADING_SIZE),
                fontWeight: 'bold',
                lineHeight: pt(BODY_LINE_HEIGHT),
                letterSpacing: 0,
                textTransform: 'uppercase',
                color: COLOR_PRIMARY
            }}
        >
            {title}
        </h2>
        <div
            style={{
                marginTop: pt(HEADING_TO_DIVIDER_MARGIN),
                width: '100%',
                height: pt(SECTION_DIVIDER_THICKNESS),
                backgroundColor: COLOR_DIVIDER,
                borderRadius: ROUNDED_RADIUS,
            }}
        />
    </div>
);

// ====================================================================
// MOUSE GATE — only clears when the cursor ACTUALLY MOVED.
// ====================================================================
interface MouseGateApi {
    // true  -> ignore this mouseenter (it came from a layout shift, not a real mouse move)
    shouldBlockEnter: (key: string, e: React.MouseEvent) => boolean;
    // call on mousemove: returns true when the user really moved the mouse over a
    // previously blocked section, so it should highlight right away
    onMove: (key: string, e: React.MouseEvent) => boolean;
    // call on mousedown: a button press is real user input, so unblock that section
    onPress: (key: string) => void;
    // call on mouseleave: clears any block for that section
    onLeave: (key: string) => void;
}

const Section: React.FC<{
    title: string;
    sectionKey: string;
    firstFontSize?: number;
    onEditSection?: (key: string) => void;
    activeSection?: string | null;
    gate: MouseGateApi;
    children: React.ReactNode;
}> = ({ title, sectionKey, firstFontSize, onEditSection, gate, children }) => {
    const [isHovered, setIsHovered] = useState(false);
    const interactive = !!onEditSection;
    const showLabel = interactive && isHovered;

    const handleClick = () => {
        if (!interactive) return;
        onEditSection!(sectionKey);
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (!interactive) return;
        if (gate.shouldBlockEnter(sectionKey, e)) return;
        setIsHovered(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!interactive || isHovered) return;
        if (gate.onMove(sectionKey, e)) setIsHovered(true);
    };

    const handleMouseDown = () => {
        if (!interactive) return;
        gate.onPress(sectionKey);
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        if (!interactive) return;
        gate.onLeave(sectionKey);
        setIsHovered(false);
    };

    return (
        <section
            data-section={sectionKey}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseLeave={interactive ? handleMouseLeave : undefined}
            style={{
                ...interactiveWrapperStyle(isHovered, interactive),
                marginTop: pt(SECTION_TOP_MARGIN),
            }}
        >
            {showLabel && <SectionEditLabel />}
            <SectionHeading title={title} />
            <div style={{ marginTop: pt(contentMargin(firstFontSize)) }}>{children}</div>
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
                    color: COLOR_BODY,
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid'
                }}
            >
                <span style={{ flexShrink: 0, width: pt(BULLET_DOT_TO_TEXT_GAP), color: COLOR_BULLET_DOT }}>
                    {BULLET_MARKER}
                </span>
                <span style={{ minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{safeText(line)}</span>
            </div>
        ))}
    </div>
);

const entryList: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    rowGap: pt(ENTRY_GAP),
    width: '100%'
};

const entryBlock: React.CSSProperties = {
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
    minWidth: 0
};

const metaStyle: React.CSSProperties = {
    ...tightLine(ENTRY_SUB_SIZE),
    color: COLOR_METADATA,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere'
};

interface SkillTag {
    text: string;
    width: number;
}
const packSkillRows = (skills: string[], maxWidth: number): SkillTag[][] => {
    const tags: SkillTag[] = skills.map((text) => ({
        text,
        width: measureTextPt(text, SKILL_TAG_FONT_SIZE, true) + SKILL_TAG_PADDING_X * 2
    }));
    const rows: SkillTag[][] = [];
    let row: SkillTag[] = [];
    let rowWidth = 0;
    for (const tag of tags) {
        const gap = row.length > 0 ? SKILL_TAG_GAP : 0;
        if (row.length > 0 && rowWidth + gap + tag.width > maxWidth) {
            rows.push(row);
            row = [tag];
            rowWidth = tag.width;
        } else {
            row.push(tag);
            rowWidth += gap + tag.width;
        }
    }
    if (row.length > 0) rows.push(row);
    return rows;
};

// ====================================================================
// TEMPLATE
// ====================================================================
const ModernTemplate: React.FC<CVPreviewProps> = (props) => {
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

    const summaryText = clean(professionalSummary);
    const validExperiences = (experiences || []).filter(hasUsableExperience);
    const validEducations = (educations || []).filter(hasUsableEducation);
    const validCertifications = (certifications || []).filter(hasUsableCertification);
    const validLanguages = (languages || []).filter(hasUsableLanguage);
    const validAchievements = (achievements || []).filter(hasUsableAchievement);
    const validProjects = (projects || []).filter(hasUsableProject);
    const skillsList = parseSkillsList(skills);

    const measureRef = useRef<HTMLDivElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [fit, setFit] = useState(1);
    const fitState = useRef({ sig: '', active: false, locked: false });
    const { profilePhoto: _photo, ...propsWithoutPhoto } = props as any;
    const contentSig = JSON.stringify(propsWithoutPhoto) + (profilePhoto ? profilePhoto.length : 0);
    const [pages, setPages] = useState<PageWindow[]>([{ start: 0, end: PAGE_CONTENT_BOTTOM * PX }]);
    const [, setFontTick] = useState(0);
    const [headerHovered, setHeaderHovered] = useState(false);

    // ✅ Mouse gate (per-section block).
    //    A mouseenter that carries NO mouse movement (movementX/Y both 0)
    //    was produced by the browser after a layout shift, not by the user.
    //    That section is put in `blocked`. It stays un-highlightable only
    //    while the mouse is STILL. The moment the user really moves the
    //    mouse over it (mousemove with movement) or presses a mouse button
    //    on it (mousedown), it highlights at once.
    const blockedRef = useRef<Set<string>>(new Set());

    const gateApi: MouseGateApi = React.useMemo(
        () => ({
            shouldBlockEnter: (key: string, e: React.MouseEvent) => {
                const ne = e.nativeEvent as MouseEvent;
                const noMovement = !ne.movementX && !ne.movementY;
                if (noMovement) blockedRef.current.add(key);
                return blockedRef.current.has(key);
            },
            onMove: (key: string, e: React.MouseEvent) => {
                const ne = e.nativeEvent as MouseEvent;
                if (!ne.movementX && !ne.movementY) return false;
                blockedRef.current.delete(key);
                return true;
            },
            onPress: (key: string) => {
                blockedRef.current.delete(key);
            },
            onLeave: (key: string) => {
                blockedRef.current.delete(key);
            }
        }),
        []
    );

    const contentWidth = CONTENT_WIDTH / fit;

    const name = stripEmojis(safeText(clean(pi?.name) || 'Your Name')) || 'Your Name';
    const jobTitle = stripEmojis(safeText(clean(pi?.title) || clean(pi?.jobTitle)));
    const hasPhoto = !!profilePhoto && profilePhoto.startsWith('data:image');
    const hasTitle = !!jobTitle;

    const contactParts: string[] = [];
    if (clean(pi?.email)) contactParts.push(`${CONTACT_LABELS.email}${clean(pi.email)}`);
    if (phoneNumber) {
        const dialPrefix = selectedCountryCode ? `${selectedCountryCode} ` : '';
        contactParts.push(`${CONTACT_LABELS.phone}${dialPrefix}${phoneNumber}`.trim());
    }
    const location = clean(pi?.location) || clean(pi?.city);
    if (location) contactParts.push(`${CONTACT_LABELS.location}${location}`);
    if (clean(pi?.address)) contactParts.push(`${CONTACT_LABELS.address}${clean(pi.address)}`);
    if (clean(pi?.linkedin)) contactParts.push(`${CONTACT_LABELS.linkedin}${clean(pi.linkedin)}`);
    if (clean(pi?.github)) contactParts.push(`${CONTACT_LABELS.github}${clean(pi.github)}`);
    const webLink = clean(pi?.website) || clean(pi?.portfolio);
    if (webLink) contactParts.push(`${CONTACT_LABELS.website}${webLink}`);
    const contactItems = contactParts.map((p) => stripEmojis(safeText(p))).filter(Boolean);

    const layout = getHeaderLayout(hasPhoto, hasTitle, contactItems);
    const contactItemGap = measureTextPt(SKILLS_SEPARATOR, METADATA_SIZE);

    const textIndent = hasPhoto ? PHOTO_RENDER_SIZE + PHOTO_TO_TEXT_GAP : 0;

    useEffect(() => {
        let alive = true;
        (document as any).fonts?.ready?.then(() => alive && setFontTick((t) => t + 1));
        return () => { alive = false; };
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

    const skillRows = packSkillRows(skillsList, contentWidth);
    const skillGroups: SkillTag[][][] =
        skillRows.length <= 2
            ? [skillRows]
            : [...skillRows.slice(0, -2).map((r) => [r]), skillRows.slice(-2)];

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
                    // No top padding / negative top margin: the wrapper's top edge
                    // now sits at BODY_TOP_PADDING (2px), so the 2px ring fits
                    // exactly inside the page clip. Content position is unchanged
                    // (before: -4px + 6px padding = 2px; now: 2px + 0).
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
                            left: pt(layout.photoLeft),
                            width: pt(PHOTO_RENDER_SIZE),
                            height: pt(PHOTO_RENDER_SIZE),
                            borderRadius: '50%',
                            objectFit: 'cover'
                        }}
                    />
                )}

                <h1
                    style={{
                        margin: 0,
                        marginTop: pt(layout.nameMarginTop),
                        marginLeft: pt(textIndent),
                        maxWidth: pt(CONTENT_WIDTH - textIndent),
                        fontSize: pt(NAME_SIZE),
                        fontWeight: 'normal',
                        lineHeight: pt(NAME_LH),
                        letterSpacing: 0,
                        textAlign: 'left',
                        color: COLOR_PRIMARY,
                        wordBreak: 'break-word'
                    }}
                >
                    {name}
                </h1>

                {hasTitle && (
                    <div
                        style={{
                            marginTop: pt(layout.titleMarginTop),
                            marginLeft: pt(textIndent),
                            maxWidth: pt(CONTENT_WIDTH - textIndent),
                            fontSize: pt(TITLE_SIZE),
                            fontWeight: 'normal',
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
                            display: 'flex',
                            flexWrap: 'wrap',
                            columnGap: pt(contactItemGap),
                            fontSize: pt(METADATA_SIZE),
                            lineHeight: pt(BODY_LINE_HEIGHT),
                            color: COLOR_METADATA
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
                        marginTop: pt(layout.ruleMarginTop),
                        marginBottom: pt(HEADER_RULE_BOTTOM_MARGIN),
                        width: '100%',
                        height: pt(SECTION_DIVIDER_THICKNESS),
                        backgroundColor: COLOR_DIVIDER,
                        borderRadius: ROUNDED_RADIUS,
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
                {summaryText && (
                    <Section
                        title="PROFESSIONAL SUMMARY"
                        sectionKey="summary"
                        firstFontSize={BODY_SIZE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        <p
                            {...flowProps}
                            style={{
                                margin: 0,
                                padding: 0,
                                width: '100%',
                                fontSize: pt(BODY_SIZE),
                                lineHeight: pt(BODY_LINE_HEIGHT),
                                color: COLOR_BODY,
                                wordBreak: 'break-word',
                                overflowWrap: 'anywhere'
                            }}
                        >
                            {safeText(summaryText)}
                        </p>
                    </Section>
                )}

                {validExperiences.length > 0 && (
                    <Section
                        title="EXPERIENCE"
                        sectionKey="experience"
                        firstFontSize={ENTRY_TITLE_SIZE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        <div style={entryList}>
                            {validExperiences.map((exp: any, i: number) => {
                                const title = clean(exp.title);
                                const company = clean(exp.company);
                                const dateRange = [clean(exp.startDate), clean(exp.endDate)].filter(Boolean).join(' – ');
                                const bullets = parseBulletLines(exp.description);
                                const row = getTitleRowInfo(title, dateRange, contentWidth);
                                const hasRow = row.kind !== 'none';
                                const hasHeaderLine = hasRow || !!company;

                                const companyGap = hasRow
                                    ? lineGap(row.lastFontSize + ENTRY_TITLE_TO_SUBTITLE_GAP, row.lastFontSize, ENTRY_SUB_SIZE)
                                    : 0;
                                const bulletGap = !hasHeaderLine
                                    ? 0
                                    : company
                                        ? lineGap(ENTRY_SUB_SIZE + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP, ENTRY_SUB_SIZE, BODY_SIZE)
                                        : lineGap(row.lastFontSize + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP, row.lastFontSize, BODY_SIZE);

                                return (
                                    <div key={i} {...keepProps} style={entryBlock}>
                                        <TitleDateRow title={title} date={dateRange} info={row} />
                                        {company && (
                                            <div style={{ ...metaStyle, marginTop: pt(companyGap) }}>{safeText(company)}</div>
                                        )}
                                        {bullets.length > 0 && (
                                            <div style={{ marginTop: pt(bulletGap) }}>
                                                <BulletList lines={bullets} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {validEducations.length > 0 && (
                    <Section
                        title="EDUCATION"
                        sectionKey="education"
                        firstFontSize={ENTRY_TITLE_SIZE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        <div style={entryList}>
                            {validEducations.map((edu: any, i: number) => {
                                const degree = clean(edu.degree);
                                const institution = clean(edu.institution);
                                const year = clean(edu.year);
                                const grade = clean(edu.grade);
                                const row = getTitleRowInfo(degree, year, contentWidth);
                                const hasRow = row.kind !== 'none';

                                const institutionGap = hasRow
                                    ? lineGap(row.lastFontSize + ENTRY_TITLE_TO_SUBTITLE_GAP, row.lastFontSize, ENTRY_SUB_SIZE)
                                    : 0;
                                const gradeGap = institution
                                    ? lineGap(ENTRY_SUB_SIZE + NORMAL_CONTENT_LINE_GAP, ENTRY_SUB_SIZE, ENTRY_SUB_SIZE)
                                    : hasRow
                                        ? lineGap(row.lastFontSize + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP, row.lastFontSize, ENTRY_SUB_SIZE)
                                        : 0;

                                return (
                                    <div key={i} {...keepProps} style={entryBlock}>
                                        <TitleDateRow title={degree} date={year} info={row} />
                                        {institution && (
                                            <div style={{ ...metaStyle, marginTop: pt(institutionGap) }}>
                                                {safeText(institution)}
                                            </div>
                                        )}
                                        {grade && (
                                            <div style={{ ...metaStyle, marginTop: pt(gradeGap) }}>{safeText(`Grade: ${grade}`)}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {validCertifications.length > 0 && (
                    <Section
                        title="CERTIFICATIONS"
                        sectionKey="certifications"
                        firstFontSize={ENTRY_TITLE_SIZE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        <div style={entryList}>
                            {validCertifications.map((c: any, i: number) => {
                                const certName = clean(c.name);
                                const date = clean(c.date);
                                const credentialId = clean(c.credentialId);
                                const row = getTitleRowInfo(certName, date, contentWidth);
                                const credentialGap =
                                    row.kind !== 'none'
                                        ? lineGap(row.lastFontSize + ENTRY_TITLE_TO_SUBTITLE_GAP, row.lastFontSize, ENTRY_SUB_SIZE)
                                        : 0;

                                return (
                                    <div key={i} {...keepProps} style={entryBlock}>
                                        <TitleDateRow title={certName} date={date} info={row} />
                                        {credentialId && (
                                            <div style={{ ...metaStyle, marginTop: pt(credentialGap) }}>
                                                {safeText(credentialId)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {validLanguages.length > 0 && (
                    <Section
                        title="LANGUAGES"
                        sectionKey="languages"
                        firstFontSize={ENTRY_TITLE_SIZE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        <div>
                            {validLanguages.map((l: any, i: number) => {
                                const language = clean(l.language);
                                const proficiencyRaw = clean(l.proficiency);
                                const level = proficiencyRaw ? getProficiencyDisplayLabel(proficiencyRaw) : '';
                                return (
                                    <div
                                        key={i}
                                        {...keepProps}
                                        style={{
                                            ...entryBlock,
                                            ...tightLine(ENTRY_TITLE_SIZE),
                                            wordBreak: 'break-word',
                                            overflowWrap: 'anywhere'
                                        }}
                                    >
                                        {language ? (
                                            <>
                                                <span style={{ fontWeight: 'bold', color: COLOR_HEADING }}>{safeText(language)}</span>
                                                {level && (
                                                    <span
                                                        style={{
                                                            fontSize: pt(ENTRY_SUB_SIZE),
                                                            lineHeight: 1,
                                                            fontWeight: 'normal',
                                                            color: COLOR_METADATA
                                                        }}
                                                    >
                                                        {LANGUAGE_NAME_LEVEL_SEPARATOR}
                                                        {safeText(level)}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span style={{ fontWeight: 'bold', color: COLOR_HEADING }}>
                                                {LANGUAGE_NAME_LEVEL_SEPARATOR}
                                                {safeText(level)}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {validAchievements.length > 0 && (
                    <Section
                        title="ACHIEVEMENTS"
                        sectionKey="achievements"
                        firstFontSize={ENTRY_TITLE_SIZE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        <div style={entryList}>
                            {validAchievements.map((a: any, i: number) => {
                                const title = clean(a.title);
                                const date = clean(a.date);
                                const bullets = parseBulletLines(a.description);
                                const row = getTitleRowInfo(title, date, contentWidth);
                                const bulletGap =
                                    row.kind !== 'none'
                                        ? lineGap(row.lastFontSize + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP, row.lastFontSize, BODY_SIZE)
                                        : 0;

                                return (
                                    <div key={i} {...keepProps} style={entryBlock}>
                                        <TitleDateRow title={title} date={date} info={row} />
                                        {bullets.length > 0 && (
                                            <div style={{ marginTop: pt(bulletGap) }}>
                                                <BulletList lines={bullets} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {validProjects.length > 0 && (
                    <Section
                        title="PROJECTS"
                        sectionKey="projects"
                        firstFontSize={ENTRY_TITLE_SIZE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        <div style={entryList}>
                            {validProjects.map((p: any, i: number) => {
                                const projectName = clean(p.name);
                                const tech = clean(p.tech);
                                const bullets = parseBulletLines(p.description);
                                const github = clean(p.github);

                                const techGap = projectName
                                    ? lineGap(ENTRY_TITLE_SIZE + ENTRY_TITLE_TO_SUBTITLE_GAP, ENTRY_TITLE_SIZE, ENTRY_SUB_SIZE)
                                    : 0;
                                const bulletGap = tech
                                    ? lineGap(ENTRY_SUB_SIZE + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP, ENTRY_SUB_SIZE, BODY_SIZE)
                                    : projectName
                                        ? lineGap(ENTRY_TITLE_SIZE + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP, ENTRY_TITLE_SIZE, BODY_SIZE)
                                        : 0;
                                const githubGap =
                                    bullets.length > 0
                                        ? lineGap(BODY_LINE_HEIGHT + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP, BODY_SIZE, ENTRY_SUB_SIZE)
                                        : tech
                                            ? lineGap(ENTRY_SUB_SIZE + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP, ENTRY_SUB_SIZE, ENTRY_SUB_SIZE)
                                            : projectName
                                                ? lineGap(ENTRY_TITLE_SIZE + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP, ENTRY_TITLE_SIZE, ENTRY_SUB_SIZE)
                                                : 0;

                                return (
                                    <div key={i} {...keepProps} style={entryBlock}>
                                        {projectName && (
                                            <div style={titleTextStyle}>{safeText(projectName)}</div>
                                        )}
                                        {tech && <div style={{ ...metaStyle, marginTop: pt(techGap) }}>{safeText(tech)}</div>}
                                        {bullets.length > 0 && (
                                            <div style={{ marginTop: pt(bulletGap) }}>
                                                <BulletList lines={bullets} />
                                            </div>
                                        )}
                                        {github && (
                                            <a
                                                href={github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    ...metaStyle,
                                                    display: 'block',
                                                    marginTop: pt(githubGap),
                                                    color: COLOR_LINK,
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                {github}
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {skillRows.length > 0 && (
                    <Section
                        title="SKILLS"
                        sectionKey="skills"
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        {skillGroups.map((group, gi) => (
                            <div
                                key={gi}
                                {...keepProps}
                                style={{ ...entryBlock, marginTop: gi > 0 ? pt(SKILL_TAG_ROW_GAP) : 0 }}
                            >
                                {group.map((row, ri) => (
                                    <div
                                        key={ri}
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'nowrap',
                                            columnGap: pt(SKILL_TAG_GAP),
                                            marginTop: ri > 0 ? pt(SKILL_TAG_ROW_GAP) : 0
                                        }}
                                    >
                                        {row.map((tag, ti) => (
                                            <span
                                                key={ti}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    boxSizing: 'border-box',
                                                    width: pt(tag.width),
                                                    height: pt(SKILL_TAG_HEIGHT),
                                                    fontSize: pt(SKILL_TAG_FONT_SIZE),
                                                    lineHeight: 1,
                                                    fontWeight: 'bold',
                                                    whiteSpace: 'nowrap',
                                                    color: COLOR_BULLET_DOT,
                                                    backgroundColor: COLOR_TAG_FILL,
                                                    border: `${pt(SKILL_TAG_BORDER_WIDTH)} solid ${COLOR_TAG_BORDER}`,
                                                    borderRadius: pt(SKILL_TAG_RADIUS)
                                                }}
                                            >
                                                {safeText(tag.text)}
                                            </span>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
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
                                    top: k === 0 ? 0 : `${PAGE_CONTENT_TOP * PX - RING_ROOM_PX}px`,
                                    width: '100%',
                                    height: `${w.end - w.start + (k === 0 ? 0 : RING_ROOM_PX)}px`,
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: `${-w.start + (k === 0 ? 0 : RING_ROOM_PX)}px`,
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

export default ModernTemplate;