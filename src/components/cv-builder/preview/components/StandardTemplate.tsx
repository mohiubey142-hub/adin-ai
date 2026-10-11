// StandardTemplate.tsx
// ------------------------------------------------------------------
// Live preview that mirrors standardPdf.ts (the jsPDF generator) 1:1.
//
// ✅ Click-to-focus: header + sections are click targets.
// ✅ Hover highlight: mouse-driven with movement gate.
// ✅ PNG export: each page carries `data-page`.
// ✅ Cut-off fix: ring via box-shadow (never clipped).
// ✅ Photo (this pass): anchored to the text start like MinimalTemplate, so it
//    can't overlap name / job title. Ring opened 4px -> 6px sideways only
//    (height + thickness unchanged). Photo top is relative to the ring wrapper,
//    which the name's margin-top pushes down, so nameMarginTop is subtracted.
//
// Standard-specific design preserved: Times font, centred name + title,
// gray band behind section headings, `|` separator contact row, serif.
// ------------------------------------------------------------------

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CVPreviewProps } from '../types/previewTypes';
import { safeText } from '../utils/renderHelpers';

// ====================================================================
// PAGE (A4, same numbers as standardPdf.ts)
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
const HEADING_SIZE = 10.5;
const BODY_SIZE = 10.5;
const ENTRY_TITLE_SIZE = 11;
const ENTRY_SUB_SIZE = 10;
const BODY_LINE_HEIGHT = BODY_SIZE * 1.4;
const LANGUAGE_SEPARATOR_SIZE = ENTRY_TITLE_SIZE + 2;

const ENTRY_TITLE_FONT_WEIGHT = 'bold';
const SECTION_HEADING_FONT_WEIGHT = 'bold';
const SECTION_HEADING_CHAR_SPACE = 0.8;

const FONT_FAMILY = '"Times New Roman", Times, "Liberation Serif", "Nimbus Roman", serif';

// ====================================================================
// COLORS (same RGB values as standardPdf.ts)
// ====================================================================
const COLOR_NAME = '#28282d';
const COLOR_TITLE = '#46464b';
const COLOR_METADATA = '#46464b';
const COLOR_DIVIDER = '#c3c3c8';
const COLOR_HEADING = '#19191e';
const COLOR_SECTION_HEADING = '#28282d';
const COLOR_BODY = '#19191e';
const COLOR_LINK = '#28282d';
const COLOR_SECTION_BAND = '#ececef';

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

const ROUNDED_RADIUS = '6px';

// ✅ Ring reservation
// RING_GAP = sideways (left/right) clear space in px between content and the
// ring: 4 -> 6. Only the WIDTH opens; ring height and thickness (2px) are unchanged.
const RING_GAP = 12; // was 6: ring opened ~6px more per side (width only)
const BODY_TOP_PADDING = HOVER_RING_WIDTH;
const RING_ROOM_PX = HOVER_RING_WIDTH;

// ====================================================================
// SPACING FROM THE PDF (pt)
// ====================================================================
const NAME_TO_TITLE_GAP = 4;
const TITLE_TO_CONTACT_GAP = 8;
const SECTION_GAP = 16;
const DIVIDER_SIDE_GAP = 2.5 * MM_TO_PT;
const SECTION_DIVIDER_THICKNESS = 0.75;
const ENTRY_TITLE_TO_SUBTITLE_GAP = 3;
const NAME_TO_DETAIL_EXTRA_GAP = 0.5 * MM_TO_PT;
const ENTRY_SUBTITLE_TO_DESCRIPTION_GAP = 6;
const ENTRY_GAP = 10;
const BULLET_DOT_TO_TEXT_GAP = 3 * MM_TO_PT;
const TITLE_TO_DATE_GAP = 3 * MM_TO_PT;
const NO_PHOTO_NAME_DOWN_SHIFT = 2 * MM_TO_PT;
const NO_PHOTO_TITLE_DOWN_SHIFT = 1 * MM_TO_PT;
// Job Title painted 0.5mm higher / Name 0.5mm further right (photo and
// no-photo). Same values as HEADER_TITLE_UP_SHIFT_PT / HEADER_NAME_RIGHT_SHIFT_PT
// in standardPdf.ts. Ink-position only: Contact, divider and everything
// below keep their exact positions.
const HEADER_TITLE_UP_SHIFT_MM = 0.5;
const HEADER_TITLE_UP_SHIFT = HEADER_TITLE_UP_SHIFT_MM * MM_TO_PT;
const HEADER_NAME_RIGHT_SHIFT_MM = 0.5;
const HEADER_NAME_RIGHT_SHIFT = HEADER_NAME_RIGHT_SHIFT_MM * MM_TO_PT;

const SECTION_BAND_VERTICAL_PAD = 3.5; // layout pad (also drives heading -> content spacing)
// VISUAL-ONLY extra band height (same values as the PDF): total px added, split above/below.
// Not part of SECTION_BAND_VERTICAL_PAD, so text position and all spacing stay unchanged.
const PX_TO_PT = 72 / 96;
const SECTION_BAND_HEIGHT_INCREASE_PX = 5;
const SECTION_BAND_VERTICAL_BLEED = (SECTION_BAND_HEIGHT_INCREASE_PX * PX_TO_PT) / 2;
const SECTION_BAND_SIDE_PAD = 4;

const HEADER_PHOTO_SIZE_BASE = 75;
const HEADER_PHOTO_SIZE = (75 + 4 + 6) * 0.9;
const PHOTO_TO_TEXT_GAP = 15;

const SKILLS_SEPARATOR = '   •   ';
// Labels shown before each contact value (same labels/order as standardPdf.ts).
const CONTACT_LABELS = {
    email: 'Email: ',
    phone: 'Phone: ',
    address: 'Address: ',
    location: 'Location: ',
    linkedin: 'LinkedIn: ',
    github: 'GitHub: ',
    website: 'Portfolio URL: '
} as const;
const LANGUAGE_SPACE_GAP = 0.25 * ENTRY_TITLE_SIZE;

// ====================================================================
// PDF -> CSS CONVERSION
// ====================================================================
const CSS_ASCENT = 0.891;
const CSS_DESCENT = 0.216;
const PDF_ASCENT = 0.683;
const PDF_DESCENT = 0.217;
const K = (CSS_ASCENT - CSS_DESCENT) / 2;

const baselineInBox = (lineHeight: number, fontSize: number) => lineHeight / 2 + K * fontSize;
const baselineDelta = (fsPrev: number, fsNext: number) => BODY_LINE_HEIGHT + K * (fsNext - fsPrev);

const FIRST_SECTION_TOP_MARGIN = BODY_LINE_HEIGHT + SECTION_GAP - baselineInBox(BODY_LINE_HEIGHT, HEADING_SIZE);
const sectionTopMargin = (prevLastFs: number) => SECTION_GAP + K * (prevLastFs - HEADING_SIZE);

const HEADING_BOX_BELOW_BASELINE = BODY_LINE_HEIGHT - baselineInBox(BODY_LINE_HEIGHT, HEADING_SIZE);
const SECTION_BAND_TOP =
    baselineInBox(BODY_LINE_HEIGHT, HEADING_SIZE) - HEADING_SIZE * PDF_ASCENT - SECTION_BAND_VERTICAL_PAD - SECTION_BAND_VERTICAL_BLEED;
const SECTION_BAND_BOTTOM = HEADING_BOX_BELOW_BASELINE - SECTION_BAND_VERTICAL_PAD - SECTION_BAND_VERTICAL_BLEED;

const headingToContentMargin = (offsetFs: number, actualFirstFs: number) =>
    SECTION_BAND_VERTICAL_PAD +
    DIVIDER_SIDE_GAP +
    offsetFs * PDF_ASCENT -
    baselineInBox(BODY_LINE_HEIGHT, actualFirstFs) -
    HEADING_BOX_BELOW_BASELINE;

const entryMarginTop = (prevLastFs: number, nextFirstFs: number, gap: number) =>
    BODY_LINE_HEIGHT + gap - baselineDelta(prevLastFs, nextFirstFs);

// ====================================================================
// PAGINATION
// ====================================================================
const PX = 96 / 72;
const PAGE_GAP_PX = 16;
const PAGE_CONTENT_TOP = TOP_MARGIN - baselineInBox(BODY_LINE_HEIGHT, ENTRY_TITLE_SIZE) + BODY_TOP_PADDING;
const PAGE_CONTENT_BOTTOM = PAGE_HEIGHT - BOTTOM_MARGIN + 1.5;
const HEAD_RULE_BLEED_PX = Math.max(0, Math.ceil(-SECTION_BAND_TOP * PX)) + 2;

interface PageWindow {
    start: number;
    end: number;
    headStart: boolean;
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
    let startIsHead = false;
    let limit = firstLimit;
    const newPage = (cut: number, isHead = false) => {
        pages.push({ start, end: cut, headStart: startIsHead });
        start = cut;
        startIsHead = isHead;
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
            if (Math.max(needed, bottom) > limit && u.top > start + 1) newPage(u.top, true);
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

    pages.push({ start, end: limit, headStart: startIsHead });
    return { pages, contentBottom };
};

let measureCanvas: HTMLCanvasElement | null = null;
const measureTextPt = (text: string, sizePt: number): number => {
    if (typeof document === 'undefined') return text.length * sizePt * 0.5;
    if (!measureCanvas) measureCanvas = document.createElement('canvas');
    const ctx = measureCanvas.getContext('2d');
    if (!ctx) return text.length * sizePt * 0.5;
    ctx.font = `${sizePt}pt ${FONT_FAMILY}`;
    return ctx.measureText(text).width / PX;
};

// ====================================================================
// HEADER LAYOUT
// ====================================================================
const NAME_LH = NAME_SIZE * 1.2;
const TITLE_LH = TITLE_SIZE * 1.2;

const getHeaderLayout = (hasPhoto: boolean, hasTitle: boolean) => {
    const y0 = TOP_MARGIN + BODY_TOP_PADDING;
    const afterName = y0 + NAME_SIZE + NAME_TO_TITLE_GAP;

    const nameBase = hasPhoto ? y0 : y0 + NO_PHOTO_NAME_DOWN_SHIFT;
    const titleBase = hasTitle
        ? (hasPhoto ? afterName : afterName + NO_PHOTO_TITLE_DOWN_SHIFT) - HEADER_TITLE_UP_SHIFT
        : null;

    const titleSlotBottom = afterName + TITLE_SIZE + TITLE_TO_CONTACT_GAP;
    let cursor = hasPhoto || hasTitle ? titleSlotBottom : afterName;

    let photoTop = 0;
    if (hasPhoto) {
        const blockTop = y0 - NAME_SIZE * PDF_ASCENT;
        const blockBottom = afterName + TITLE_SIZE * PDF_DESCENT;
        const blockHeight = blockBottom - blockTop;
        const photoBottom = blockTop + (blockHeight - HEADER_PHOTO_SIZE_BASE) / 2 + HEADER_PHOTO_SIZE_BASE;
        photoTop = photoBottom - HEADER_PHOTO_SIZE;
        cursor += Math.max(0, photoBottom - blockBottom);
    }
    const contactBase = cursor;

    const nameTop = nameBase - baselineInBox(NAME_LH, NAME_SIZE);
    const nameBottom = nameTop + NAME_LH;
    const titleTop = titleBase !== null ? titleBase - baselineInBox(TITLE_LH, TITLE_SIZE) : nameBottom;
    const titleBottom = titleBase !== null ? titleTop + TITLE_LH : nameBottom;
    const contactTop = contactBase - baselineInBox(BODY_LINE_HEIGHT, METADATA_SIZE);
    const contactBoxBelowBaseline = BODY_LINE_HEIGHT - baselineInBox(BODY_LINE_HEIGHT, METADATA_SIZE);

    return {
        nameMarginTop: nameTop,
        titleMarginTop: titleTop - nameBottom,
        contactMarginTop: contactTop - titleBottom,
        ruleMarginTopWithContact: (hasDescender: boolean) =>
            (hasDescender ? METADATA_SIZE * PDF_DESCENT : 0) + DIVIDER_SIDE_GAP - contactBoxBelowBaseline,
        ruleMarginTopNoContact: contactBase + DIVIDER_SIDE_GAP - titleBottom,
        photoTop,
        textLeft: hasPhoto ? HEADER_PHOTO_SIZE + PHOTO_TO_TEXT_GAP : 0
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

const hasDescenderChar = (text: string) => /[gjpqy]/.test(text);

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

const usableExperience = (e: any) =>
    !!e && !!(clean(e.title) || clean(e.company) || clean(e.startDate) || clean(e.endDate) || clean(e.description));
const usableEducation = (e: any) =>
    !!e && !!(clean(e.degree) || clean(e.institution) || clean(e.year) || clean(e.grade));
const usableLanguage = (e: any) => !!e && !!(clean(e.language) || clean(e.proficiency));
const usableAchievement = (e: any) => !!e && !!(clean(e.title) || clean(e.date) || clean(e.description));
const usableCertification = (e: any) => !!e && !!(clean(e.name) || clean(e.date) || clean(e.credentialId));
const usableProject = (e: any) =>
    !!e && !!(clean(e.name) || clean(e.tech) || clean(e.description) || clean(e.github));

const buildSkillLines = (skills: string[], maxWidth: number): string[] => {
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

const wrapTextToWidth = (text: string, sizePt: number, maxWidth: number): string[] => {
    const tokens = text.match(/\s+|\S+/g) || [];
    const lines: string[] = [];
    let current = '';
    const pushWord = (word: string) => {
        if (measureTextPt(word, sizePt) <= maxWidth) {
            current = word;
            return;
        }
        let chunk = '';
        for (const ch of word) {
            if (chunk && measureTextPt(chunk + ch, sizePt) > maxWidth) {
                lines.push(chunk);
                chunk = '';
            }
            chunk += ch;
        }
        current = chunk;
    };
    for (const tok of tokens) {
        if (/^\s+$/.test(tok)) {
            if (current) current += tok;
            continue;
        }
        if (!current) {
            pushWord(tok);
        } else if (measureTextPt(current + tok, sizePt) <= maxWidth) {
            current += tok;
        } else {
            lines.push(current.replace(/\s+$/, ''));
            current = '';
            pushWord(tok);
        }
    }
    if (current) lines.push(current.replace(/\s+$/, ''));
    return lines;
};

// ====================================================================
// SMALL COMPONENTS
// ====================================================================

const lineStyle = (fontSize: number, color: string): React.CSSProperties => ({
    fontSize: pt(fontSize),
    lineHeight: pt(BODY_LINE_HEIGHT),
    fontWeight: 'normal',
    color,
    minWidth: 0,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere'
});

interface StackLine {
    key: string;
    fs: number;
    lastFs?: number;
    dist: number;
    node: React.ReactNode;
}

const Stack: React.FC<{ lines: StackLine[] }> = ({ lines }) => (
    <>
        {lines.map((l, i) => {
            const prev = i > 0 ? lines[i - 1] : null;
            const prevFs = prev ? (prev.lastFs !== undefined ? prev.lastFs : prev.fs) : 0;
            const marginTop = prev ? l.dist - baselineDelta(prevFs, l.fs) : 0;
            return (
                <div key={l.key} style={{ marginTop: marginTop ? pt(marginTop) : undefined, minWidth: 0 }}>
                    {l.node}
                </div>
            );
        })}
    </>
);

const stackFirstFs = (lines: StackLine[]) => lines[0].fs;
const stackLastFs = (lines: StackLine[]) => {
    const last = lines[lines.length - 1];
    return last.lastFs !== undefined ? last.lastFs : last.fs;
};

// ✅ Kickresume-style label
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

// ====================================================================
// MOUSE GATE
// ====================================================================
interface MouseGateApi {
    shouldBlockEnter: (key: string, e: React.MouseEvent) => boolean;
    onMove: (key: string, e: React.MouseEvent) => boolean;
    onPress: (key: string) => void;
    onLeave: (key: string) => void;
}

// ✅ Section: click-to-focus + hover ring + gray band heading
const Section: React.FC<{
    title: string;
    sectionKey: string;
    marginTop: number;
    contentMarginTop: number;
    onEditSection?: (key: string) => void;
    gate: MouseGateApi;
    children: React.ReactNode;
}> = ({ title, sectionKey, marginTop, contentMarginTop, onEditSection, gate, children }) => {
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
                padding: ringPad,
                // The ring padding (ringPad) is only room for the hover ring: it must not add layout
                // space. The top margin and the bottom margin each cancel their side of it, so the gap
                // between sections is exactly the PDF's gap. (pt() returns a string, so
                // `pt(marginTop) - ringPad` was NaN and React dropped the whole margin; calc() mixes
                // the pt gap with the px ring padding instead.)
                marginTop: `calc(${pt(marginTop)} - ${ringPad}px)`,
                marginBottom: -ringPad,
                marginLeft: -ringPad,
                marginRight: -ringPad,
            }}
        >
            <div
                style={{
                    ...interactiveWrapperStyle(isHovered, interactive),
                    position: 'relative',
                    // sideways only: padding + equal negative margin keeps layout identical
                    padding: `0 ${RING_GAP}px`,
                    margin: `0 ${-RING_GAP}px`
                }}
            >
                {showLabel && <SectionEditLabel />}
                <div
                    data-unit="head"
                    style={{ position: 'relative', display: 'flow-root', breakInside: 'avoid', pageBreakInside: 'avoid' }}
                >
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            left: pt(-SECTION_BAND_SIDE_PAD),
                            right: pt(-SECTION_BAND_SIDE_PAD),
                            top: pt(SECTION_BAND_TOP),
                            bottom: pt(SECTION_BAND_BOTTOM),
                            backgroundColor: COLOR_SECTION_BAND,
                            borderRadius: ROUNDED_RADIUS
                        }}
                    />
                    <h2
                        style={{
                            position: 'relative',
                            margin: 0,
                            padding: 0,
                            border: 'none',
                            fontSize: pt(HEADING_SIZE),
                            fontWeight: SECTION_HEADING_FONT_WEIGHT,
                            lineHeight: pt(BODY_LINE_HEIGHT),
                            letterSpacing: pt(SECTION_HEADING_CHAR_SPACE),
                            textAlign: 'left',
                            whiteSpace: 'nowrap',
                            color: COLOR_SECTION_HEADING
                        }}
                    >
                        {title}
                    </h2>
                </div>
                <div style={{ marginTop: pt(contentMarginTop) }}>{children}</div>
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
                    color: COLOR_BODY,
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid'
                }}
            >
                <span style={{ flexShrink: 0, width: pt(BULLET_DOT_TO_TEXT_GAP), color: COLOR_SECTION_HEADING }}>•</span>
                <span style={{ minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{safeText(line)}</span>
            </div>
        ))}
    </div>
);

const TitleDateRow: React.FC<{ title?: string; date?: string }> = ({ title, date }) => (
    <div style={{ position: 'relative', width: '100%' }}>
        <div
            style={{
                display: 'flex',
                alignItems: 'baseline',
                columnGap: pt(TITLE_TO_DATE_GAP),
                width: '100%',
                lineHeight: pt(BODY_LINE_HEIGHT)
            }}
        >
            {title && (
                <span
                    style={{
                        flex: '1 1 0',
                        minWidth: 0,
                        fontSize: pt(ENTRY_TITLE_SIZE),
                        fontWeight: ENTRY_TITLE_FONT_WEIGHT,
                        lineHeight: pt(BODY_LINE_HEIGHT),
                        color: COLOR_HEADING,
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere'
                    }}
                >
                    {title}
                </span>
            )}
            {date && (
                <span
                    style={{
                        marginLeft: 'auto',
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                        fontSize: pt(ENTRY_SUB_SIZE),
                        lineHeight: title ? pt(ENTRY_SUB_SIZE) : pt(BODY_LINE_HEIGHT),
                        fontWeight: 'normal',
                        color: COLOR_METADATA
                    }}
                >
                    {date}
                </span>
            )}
        </div>
    </div>
);

const subLine = (text: string) => <div style={lineStyle(ENTRY_SUB_SIZE, COLOR_BODY)}>{safeText(text)}</div>;

interface EntryItem {
    firstFs: number;
    lastFs: number;
    node: React.ReactNode;
}

const entryBlock: React.CSSProperties = {
    position: 'relative',
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
    minWidth: 0
};

const renderEntries = (items: EntryItem[], gap: number, keyPrefix: string) =>
    items.map((it, i) => {
        const marginTop = i === 0 ? 0 : entryMarginTop(items[i - 1].lastFs, it.firstFs, gap);
        return (
            <div
                key={i}
                {...keepProps}
                data-key={`${keyPrefix}-${i}`}
                style={{ ...entryBlock, marginTop: marginTop ? pt(marginTop) : undefined }}
            >
                {it.node}
            </div>
        );
    });

// ====================================================================
// TEMPLATE
// ====================================================================
const StandardTemplate: React.FC<CVPreviewProps> = (props) => {
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

    const validExperiences = (experiences || []).filter(usableExperience);
    const validEducations = (educations || []).filter(usableEducation);
    const validCertifications = (certifications || []).filter(usableCertification);
    const validLanguages = (languages || []).filter(usableLanguage);
    const validAchievements = (achievements || []).filter(usableAchievement);
    const validProjects = (projects || []).filter(usableProject);

    const summaryText = clean(professionalSummary);
    const skillsList = parseSkillsList(skills);

    const name = stripEmojis(safeText(clean(pi?.name) || 'Your Name')) || 'Your Name';
    const jobTitle = stripEmojis(safeText(clean(pi?.title) || clean(pi?.jobTitle)));
    const hasPhoto = !!profilePhoto && profilePhoto.trim().startsWith('data:image');
    const hasTitle = !!jobTitle;

    const contactParts: string[] = [];
    if (clean(pi?.email)) contactParts.push(`${CONTACT_LABELS.email}${clean(pi.email)}`);
    if (phoneNumber) {
        const dialPrefix = selectedCountryCode ? `${selectedCountryCode} ` : '';
        contactParts.push(`${CONTACT_LABELS.phone}${dialPrefix}${phoneNumber}`.trim());
    }
    const address = clean(pi?.address) || clean(pi?.streetAddress);
    if (address) contactParts.push(`${CONTACT_LABELS.address}${address}`);
    const location = clean(pi?.location) || clean(pi?.city);
    if (location) contactParts.push(`${CONTACT_LABELS.location}${location}`);
    if (clean(pi?.linkedin)) contactParts.push(`${CONTACT_LABELS.linkedin}${clean(pi.linkedin)}`);
    if (clean(pi?.github)) contactParts.push(`${CONTACT_LABELS.github}${clean(pi.github)}`);
    const webLink = clean(pi?.website) || clean(pi?.portfolio);
    if (webLink) contactParts.push(`${CONTACT_LABELS.website}${webLink}`);
    const contactItems = contactParts.map((p) => stripEmojis(safeText(p))).filter(Boolean);

    // Contact layout — same algorithm as academicPdf.ts / standardPdf.ts:
    // separator-free, items separated by PHOTO_TO_TEXT_GAP, an item that
    // doesn't fit moves whole to the next line, an item wider than the
    // content width is wrapped and its last fragment stays open for the
    // next item. Each line is centered.
    const contactLines: { parts: string[]; width: number }[] = [];
    {
        let currentLine: { parts: string[]; width: number } = { parts: [], width: 0 };
        const finishCurrentLine = () => {
            contactLines.push(currentLine);
            currentLine = { parts: [], width: 0 };
        };
        for (const part of contactItems) {
            const itemWidth = measureTextPt(part, METADATA_SIZE);
            if (itemWidth > CONTENT_WIDTH) {
                if (currentLine.parts.length > 0) finishCurrentLine();
                const wrapped = wrapTextToWidth(part, METADATA_SIZE, CONTENT_WIDTH);
                wrapped.forEach((line, index) => {
                    if (index > 0) finishCurrentLine();
                    currentLine = { parts: [line], width: measureTextPt(line, METADATA_SIZE) };
                });
                continue;
            }
            const hasItems = currentLine.parts.length > 0;
            const widthWithItem = hasItems ? currentLine.width + PHOTO_TO_TEXT_GAP + itemWidth : itemWidth;
            if (hasItems && widthWithItem > CONTENT_WIDTH) {
                finishCurrentLine();
                currentLine = { parts: [part], width: itemWidth };
            } else {
                currentLine.parts.push(part);
                currentLine.width = widthWithItem;
            }
        }
        if (currentLine.parts.length > 0) finishCurrentLine();
    }
    const lastContactText =
        contactLines.length > 0 ? contactLines[contactLines.length - 1].parts.join('') : '';

    const layout = getHeaderLayout(hasPhoto, hasTitle);
    // top (pt, from page top) where the header ring starts
    const headerRingTop = hasPhoto
        ? Math.max(0, Math.min(layout.photoTop, layout.nameMarginTop))
        : layout.nameMarginTop;

    const measureRef = useRef<HTMLDivElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [fit, setFit] = useState(1);
    const fitState = useRef({ sig: '', active: false, locked: false });
    const { profilePhoto: _photo, ...propsWithoutPhoto } = props as any;
    const contentSig = JSON.stringify(propsWithoutPhoto) + (profilePhoto ? profilePhoto.length : 0);
    const [pages, setPages] = useState<PageWindow[]>([
        { start: 0, end: PAGE_CONTENT_BOTTOM * PX, headStart: false }
    ]);
    const [, setFontTick] = useState(0);
    const [headerHovered, setHeaderHovered] = useState(false);

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

    let sectionCount = 0;
    let prevLastFs = BODY_SIZE;
    const section = (
        key: string,
        title: string,
        offsetFs: number,
        firstFs: number,
        lastFs: number,
        children: React.ReactNode
    ) => {
        const marginTop = sectionCount === 0 ? FIRST_SECTION_TOP_MARGIN : sectionTopMargin(prevLastFs);
        sectionCount += 1;
        prevLastFs = lastFs;
        return (
            <Section
                key={key}
                title={title}
                sectionKey={key}
                marginTop={marginTop}
                contentMarginTop={headingToContentMargin(offsetFs, firstFs)}
                onEditSection={onEditSection}
                gate={gateApi}
            >
                {children}
            </Section>
        );
    };

    const experienceItems: EntryItem[] = validExperiences.map((exp: any) => {
        const title = clean(exp.title);
        const company = clean(exp.company);
        const dateRange = [clean(exp.startDate), clean(exp.endDate)].filter(Boolean).join(' – ');
        const bullets = parseBulletLines(exp.description);
        const hasTitleRow = !!(title || dateRange);
        const rowFs = title ? ENTRY_TITLE_SIZE : ENTRY_SUB_SIZE;

        const lines: StackLine[] = [];
        if (hasTitleRow) {
            lines.push({
                key: 'row',
                fs: rowFs,
                dist: 0,
                node: <TitleDateRow title={title ? safeText(title) : undefined} date={dateRange ? safeText(dateRange) : undefined} />
            });
        }
        if (company) {
            lines.push({
                key: 'company',
                fs: ENTRY_SUB_SIZE,
                dist: hasTitleRow ? rowFs + ENTRY_TITLE_TO_SUBTITLE_GAP + NAME_TO_DETAIL_EXTRA_GAP : 0,
                node: subLine(company)
            });
        }
        if (bullets.length > 0) {
            const prevFs = lines.length > 0 ? stackLastFs(lines) : 0;
            lines.push({
                key: 'bullets',
                fs: BODY_SIZE,
                dist: lines.length > 0 ? prevFs + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP : 0,
                node: <BulletList lines={bullets} />
            });
        }

        return { firstFs: stackFirstFs(lines), lastFs: stackLastFs(lines), node: <Stack lines={lines} /> };
    });

    const educationItems: EntryItem[] = validEducations.map((edu: any) => {
        const degree = clean(edu.degree);
        const institution = clean(edu.institution);
        const year = clean(edu.year);
        const grade = clean(edu.grade);
        const hasRow = !!(degree || year);
        const rowFs = degree ? ENTRY_TITLE_SIZE : ENTRY_SUB_SIZE;

        const lines: StackLine[] = [];
        if (hasRow) {
            lines.push({
                key: 'row',
                fs: rowFs,
                dist: 0,
                node: <TitleDateRow title={degree ? safeText(degree) : undefined} date={year ? safeText(year) : undefined} />
            });
        }
        if (institution) {
            lines.push({
                key: 'institution',
                fs: ENTRY_SUB_SIZE,
                dist: hasRow ? rowFs + ENTRY_TITLE_TO_SUBTITLE_GAP : 0,
                node: subLine(institution)
            });
        }
        if (grade) {
            lines.push({
                key: 'grade',
                fs: ENTRY_SUB_SIZE,
                dist:
                    lines.length === 0
                        ? 0
                        : institution
                            ? ENTRY_SUB_SIZE + ENTRY_TITLE_TO_SUBTITLE_GAP
                            : rowFs + ENTRY_TITLE_TO_SUBTITLE_GAP,
                node: subLine(`Grade: ${grade}`)
            });
        }
        return { firstFs: stackFirstFs(lines), lastFs: stackLastFs(lines), node: <Stack lines={lines} /> };
    });

    const certificationItems: EntryItem[] = validCertifications.map((c: any) => {
        const certName = clean(c.name);
        const date = clean(c.date);
        const credentialId = clean(c.credentialId);
        const hasRow = !!(certName || date);
        const rowFs = certName ? ENTRY_TITLE_SIZE : ENTRY_SUB_SIZE;

        const lines: StackLine[] = [];
        if (hasRow) {
            lines.push({
                key: 'row',
                fs: rowFs,
                dist: 0,
                node: <TitleDateRow title={certName ? safeText(certName) : undefined} date={date ? safeText(date) : undefined} />
            });
        }
        if (credentialId) {
            lines.push({
                key: 'credential',
                fs: ENTRY_SUB_SIZE,
                dist: hasRow ? rowFs + ENTRY_TITLE_TO_SUBTITLE_GAP + NAME_TO_DETAIL_EXTRA_GAP : 0,
                node: subLine(credentialId)
            });
        }
        return { firstFs: stackFirstFs(lines), lastFs: stackLastFs(lines), node: <Stack lines={lines} /> };
    });

    const languageItems: EntryItem[] = validLanguages.map((l: any) => {
        const language = clean(l.language);
        const proficiencyRaw = clean(l.proficiency);
        const level = proficiencyRaw ? getProficiencyDisplayLabel(proficiencyRaw) : '';
        return {
            firstFs: ENTRY_TITLE_SIZE,
            lastFs: ENTRY_TITLE_SIZE,
            node: (
                <div
                    style={{
                        fontSize: pt(ENTRY_TITLE_SIZE),
                        lineHeight: pt(BODY_LINE_HEIGHT),
                        fontWeight: ENTRY_TITLE_FONT_WEIGHT,
                        color: COLOR_HEADING,
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere'
                    }}
                >
                    {language && level ? (
                        <>
                            <span style={{ fontWeight: ENTRY_TITLE_FONT_WEIGHT, color: COLOR_HEADING }}>{safeText(language)}</span>
                            <span
                                style={{
                                    marginLeft: pt(LANGUAGE_SPACE_GAP),
                                    fontSize: pt(LANGUAGE_SEPARATOR_SIZE),
                                    lineHeight: 1,
                                    fontWeight: 'normal',
                                    color: COLOR_HEADING
                                }}
                            >
                                :
                            </span>
                            <span
                                style={{
                                    marginLeft: pt(LANGUAGE_SPACE_GAP),
                                    fontSize: pt(ENTRY_SUB_SIZE),
                                    lineHeight: 1,
                                    fontWeight: 'normal',
                                    color: COLOR_BODY
                                }}
                            >
                                {safeText(level)}
                            </span>
                        </>
                    ) : (
                        <span style={{ fontWeight: ENTRY_TITLE_FONT_WEIGHT, color: COLOR_HEADING }}>
                            {language ? safeText(language) : `: ${safeText(level)}`}
                        </span>
                    )}
                </div>
            )
        };
    });

    const achievementItems: EntryItem[] = validAchievements.map((a: any) => {
        const title = clean(a.title);
        const date = clean(a.date);
        const bullets = parseBulletLines(a.description);
        const hasRow = !!(title || date);
        const rowFs = title ? ENTRY_TITLE_SIZE : ENTRY_SUB_SIZE;

        const lines: StackLine[] = [];
        if (hasRow) {
            lines.push({
                key: 'row',
                fs: rowFs,
                dist: 0,
                node: <TitleDateRow title={title ? safeText(title) : undefined} date={date ? safeText(date) : undefined} />
            });
        }
        if (bullets.length > 0) {
            lines.push({
                key: 'bullets',
                fs: BODY_SIZE,
                dist: lines.length > 0 ? stackLastFs(lines) + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP : 0,
                node: <BulletList lines={bullets} />
            });
        }
        return { firstFs: stackFirstFs(lines), lastFs: stackLastFs(lines), node: <Stack lines={lines} /> };
    });

    const projectItems: EntryItem[] = validProjects.map((p: any) => {
        const projectName = clean(p.name);
        const tech = clean(p.tech);
        const bullets = parseBulletLines(p.description);
        const github = clean(p.github);

        const lines: StackLine[] = [];
        if (projectName) {
            lines.push({ key: 'name', fs: ENTRY_TITLE_SIZE, dist: 0, node: <TitleDateRow title={safeText(projectName)} /> });
        }
        if (tech) {
            lines.push({
                key: 'tech',
                fs: ENTRY_SUB_SIZE,
                dist: lines.length > 0 ? ENTRY_TITLE_SIZE + ENTRY_TITLE_TO_SUBTITLE_GAP + NAME_TO_DETAIL_EXTRA_GAP : 0,
                node: subLine(tech)
            });
        }
        if (bullets.length > 0) {
            lines.push({
                key: 'bullets',
                fs: BODY_SIZE,
                dist: lines.length > 0 ? stackLastFs(lines) + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP : 0,
                node: <BulletList lines={bullets} />
            });
        }
        if (github) {
            const afterBullets = bullets.length > 0;
            lines.push({
                key: 'github',
                fs: ENTRY_SUB_SIZE,
                dist: lines.length === 0
                    ? 0
                    : afterBullets
                        ? BODY_LINE_HEIGHT + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP
                        : stackLastFs(lines) + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP,
                node: (
                    <a
                        href={github}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'block',
                            ...lineStyle(ENTRY_SUB_SIZE, COLOR_LINK),
                            textDecoration: 'none'
                        }}
                    >
                        {safeText(github)}
                    </a>
                )
            });
        }
        return { firstFs: stackFirstFs(lines), lastFs: stackLastFs(lines), node: <Stack lines={lines} /> };
    });

    const skillLines = skillsList.length > 0 ? buildSkillLines(skillsList.map((s) => safeText(s)), CONTENT_WIDTH / fit) : [];

    const lastOf = (items: EntryItem[]) => items[items.length - 1].lastFs;

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
                fontWeight: 'normal',
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
                    padding: HOVER_RING_WIDTH,
                    marginLeft: -HOVER_RING_WIDTH,
                    marginRight: -HOVER_RING_WIDTH,
                }}
            >
                <div
                    style={{
                        ...interactiveWrapperStyle(headerHovered, headerInteractive),
                        position: 'relative',
                        // sideways only (width), same horizontal geometry as MinimalTemplate
                        padding: `0 ${RING_GAP}px`,
                        // flow-root: name's margin-top no longer collapses out of the ring.
                        // The ring starts at the highest of photo / name, so the photo is inside it.
                        display: 'flow-root',
                        margin: `${pt(headerRingTop)} ${-RING_GAP}px 0`
                    }}
                >
                    {headerInteractive && headerHovered && <SectionEditLabel />}

                    {hasPhoto && (
                        <img
                            src={profilePhoto}
                            alt=""
                            style={{
                                position: 'absolute',
                                top: pt(layout.photoTop - headerRingTop),
                                left: pt(layout.textLeft - HEADER_PHOTO_SIZE),
                                width: pt(HEADER_PHOTO_SIZE),
                                height: pt(HEADER_PHOTO_SIZE),
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }}
                        />
                    )}

                    <h1
                        style={{
                            margin: 0,
                            position: 'relative',
                            left: pt(HEADER_NAME_RIGHT_SHIFT),
                            marginTop: pt(layout.nameMarginTop - headerRingTop),
                            marginLeft: layout.textLeft ? pt(layout.textLeft) : 0,
                            maxWidth: pt(CONTENT_WIDTH - layout.textLeft),
                            fontSize: pt(NAME_SIZE),
                            fontWeight: 'normal',
                            lineHeight: pt(NAME_LH),
                            letterSpacing: 0,
                            textAlign: hasPhoto ? 'left' : 'center',
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
                                marginLeft: layout.textLeft ? pt(layout.textLeft) : 0,
                                maxWidth: pt(CONTENT_WIDTH - layout.textLeft),
                                fontSize: pt(TITLE_SIZE),
                                fontWeight: 'normal',
                                lineHeight: pt(TITLE_LH),
                                textAlign: hasPhoto ? 'left' : 'center',
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
                                fontSize: pt(METADATA_SIZE),
                                fontWeight: 'normal',
                                lineHeight: pt(BODY_LINE_HEIGHT),
                                color: COLOR_METADATA,
                                whiteSpace: 'pre'
                            }}
                        >
                            {contactLines.map((line, li) => (
                                <div
                                    key={li}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        columnGap: pt(PHOTO_TO_TEXT_GAP),
                                        width: '100%'
                                    }}
                                >
                                    {line.parts.map((part, pi2) => (
                                        <span key={pi2}>{part}</span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    <div
                        style={{
                            marginTop: pt(
                                contactItems.length > 0
                                    ? layout.ruleMarginTopWithContact(hasDescenderChar(lastContactText))
                                    : layout.ruleMarginTopNoContact
                            ),
                            width: '100%',
                            height: pt(SECTION_DIVIDER_THICKNESS),
                            backgroundColor: COLOR_DIVIDER,
                            borderRadius: ROUNDED_RADIUS
                        }}
                    />
                </div>
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
                {summaryText &&
                    section(
                        'summary',
                        'PROFESSIONAL SUMMARY',
                        BODY_SIZE,
                        BODY_SIZE,
                        BODY_SIZE,
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
                    )}

                {experienceItems.length > 0 &&
                    section(
                        'experience',
                        'EXPERIENCE',
                        ENTRY_TITLE_SIZE,
                        experienceItems[0].firstFs,
                        lastOf(experienceItems),
                        renderEntries(experienceItems, ENTRY_GAP, 'exp')
                    )}

                {educationItems.length > 0 &&
                    section(
                        'education',
                        'EDUCATION',
                        ENTRY_TITLE_SIZE,
                        educationItems[0].firstFs,
                        lastOf(educationItems),
                        renderEntries(educationItems, ENTRY_GAP, 'edu')
                    )}

                {certificationItems.length > 0 &&
                    section(
                        'certifications',
                        'CERTIFICATIONS',
                        ENTRY_TITLE_SIZE,
                        certificationItems[0].firstFs,
                        lastOf(certificationItems),
                        renderEntries(certificationItems, ENTRY_GAP, 'cert')
                    )}

                {skillLines.length > 0 &&
                    section(
                        'skills',
                        'SKILLS',
                        BODY_SIZE,
                        BODY_SIZE,
                        BODY_SIZE,
                        <div
                            {...flowProps}
                            style={{
                                width: '100%',
                                fontSize: pt(BODY_SIZE),
                                lineHeight: pt(BODY_LINE_HEIGHT),
                                color: COLOR_BODY
                            }}
                        >
                            {skillLines.map((line, idx) => (
                                <div key={idx} style={{ whiteSpace: 'pre' }}>
                                    {line}
                                </div>
                            ))}
                        </div>
                    )}

                {languageItems.length > 0 &&
                    section(
                        'languages',
                        'LANGUAGES',
                        ENTRY_TITLE_SIZE,
                        ENTRY_TITLE_SIZE,
                        ENTRY_TITLE_SIZE,
                        renderEntries(languageItems, 0, 'lang')
                    )}

                {achievementItems.length > 0 &&
                    section(
                        'achievements',
                        'ACHIEVEMENTS',
                        ENTRY_TITLE_SIZE,
                        achievementItems[0].firstFs,
                        lastOf(achievementItems),
                        renderEntries(achievementItems, ENTRY_GAP, 'ach')
                    )}

                {projectItems.length > 0 &&
                    section(
                        'projects',
                        'PROJECTS',
                        ENTRY_TITLE_SIZE,
                        projectItems[0].firstFs,
                        lastOf(projectItems),
                        renderEntries(projectItems, ENTRY_GAP, 'proj')
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

                    {pages.map((w, k) => {
                        const bleed = k > 0 && w.headStart ? HEAD_RULE_BLEED_PX : 0;
                        return (
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
                                        top: k === 0 ? 0 : `${PAGE_CONTENT_TOP * PX - bleed - (k > 0 ? RING_ROOM_PX : 0)}px`,
                                        width: '100%',
                                        height: `${w.end - w.start + bleed + (k > 0 ? RING_ROOM_PX : 0)}px`,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: `${-w.start + bleed + (k > 0 ? RING_ROOM_PX : 0)}px`,
                                            width: pt(PAGE_WIDTH)
                                        }}
                                    >
                                        {body}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StandardTemplate;