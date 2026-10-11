// TealCurveTemplate.tsx
// ------------------------------------------------------------------
// Live preview that mirrors tealCurvePdf.ts (the jsPDF generator) 1:1.
//
// ✅ PNG export: each visible page carries `data-page`.
// ✅ Label position: bottom-left corner of the section.
// ✅ HIGHLIGHT (mouse-driven): ring on hover; click opens editor.
//
// ✅ FIX (cut-off): BODY_TOP_PADDING + RING_ROOM_PX so the header ring
//    and every page's first-section ring stay inside the page clip.
//
// ✅ FIX (mouse detection): mouseenter with no movement (layout shift)
//    blocks that section until a real mousemove / mousedown fires.
//
// ✅ TealCurve-specific geometry (dark band header, 83pt photo, right-
//    aligned date in section color, plain-text Skills) preserved 1:1
//    with tealCurvePdf.ts.
// ------------------------------------------------------------------

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CVPreviewProps } from '../types/previewTypes';
import { safeText } from '../utils/renderHelpers';

// ====================================================================
// PAGE (A4, same numbers as tealCurvePdf.ts)
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

// ====================================================================
// COLORS
// ====================================================================
const COLOR_NAME = '#ffffff';
const COLOR_TITLE = '#ffffff';
const COLOR_CONTACT = '#c8dcdc';
const COLOR_BAND = '#0d2b2b';
const COLOR_SECTION = '#0d2b2b';
const COLOR_HEADING = '#19191e';
const COLOR_BODY = '#19191e';
const COLOR_METADATA = '#46464b';
const COLOR_BULLET = '#28282d';
const COLOR_LINK = '#28282d';

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

// ====================================================================
// SPACING
// ====================================================================
const NAME_TO_TITLE_GAP = 6;
const TITLE_TO_CONTACT_GAP = 10;
const SECTION_GAP = 18;
const DIVIDER_SIDE_GAP = 4 * MM_TO_PT;
const SECTION_DIVIDER_THICKNESS = 0.75 + 0.2 * MM_TO_PT;
const TITLE_TO_SUBTITLE_GAP = 3;
const SUBTITLE_TO_DESCRIPTION_GAP = 6;
const ENTRY_GAP = 14;
const BULLET_DOT_TO_TEXT_GAP = 3 * MM_TO_PT;
const TITLE_TO_DATE_GAP = 3 * MM_TO_PT;

const HEADER_CONTACT_TO_DIVIDER_EXTRA_GAP = 1 * MM_TO_PT;
const NO_PHOTO_NAME_DOWN_SHIFT = 2 * MM_TO_PT;
const NO_PHOTO_TITLE_DOWN_SHIFT = 1 * MM_TO_PT;
const CONTACT_DOWN_SHIFT = 0.5 * MM_TO_PT;
const CONTACT_RIGHT_SHIFT = 0.5 * MM_TO_PT;

// The whole header block (photo, name, title, contact) is moved as one
// unit: LOWER with a photo, HIGHER without one. Because the band height
// is derived from the block, everything below moves by the same amount,
// so the gaps between sections are untouched.
const PHOTO_CONTENT_DOWN_SHIFT_MM = 2;
const PHOTO_CONTENT_DOWN_SHIFT = PHOTO_CONTENT_DOWN_SHIFT_MM * MM_TO_PT;
const NO_PHOTO_CONTENT_UP_SHIFT_MM = 2;
const NO_PHOTO_CONTENT_UP_SHIFT = NO_PHOTO_CONTENT_UP_SHIFT_MM * MM_TO_PT;

// Photo geometry: one diameter, used for drawing AND vertical centring.
const HEADER_PHOTO_SIZE = 83;
const PHOTO_TO_TEXT_GAP = 15;

const SKILLS_SEPARATOR = '   •   ';
// Labels shown before each contact value (same labels/order as tealCurvePdf.ts).
const CONTACT_LABELS = {
    email: 'Email: ',
    phone: 'Phone: ',
    location: 'Location: ',
    address: 'Address: ',
    linkedin: 'LinkedIn: ',
    github: 'GitHub: ',
    website: 'Portfolio URL: '
} as const;
const LANGUAGE_NAME_LEVEL_SEPARATOR = ' — ';

const PDF_ASCENT = 0.718;
const PDF_DESCENT = 0.207;

// ✅ Ring reservation values
const BODY_TOP_PADDING = HOVER_RING_WIDTH;
const RING_ROOM_PX = HOVER_RING_WIDTH;

// ====================================================================
// PDF -> CSS CONVERSION
// ====================================================================
const CSS_ASCENT = 0.905;
const CSS_DESCENT = 0.212;
const baselineIn = (lh: number, fs: number) => lh / 2 + ((CSS_ASCENT - CSS_DESCENT) / 2) * fs;

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
const FIRST_SECTION_EXTRA = below(L_BODY);
const DIVIDER_MARGIN_TOP = DIVIDER_SIDE_GAP - below(L_HEAD);
const contentTopMargin = (first: Line) => DIVIDER_SIDE_GAP + first.fs * PDF_ASCENT - above(first);
const entryGapAfter = (last: Line) => BODY_LINE_HEIGHT + ENTRY_GAP - below(last) - above(L_TITLE);
const languageGapAfter = BODY_LINE_HEIGHT - below(L_TITLE) - above(L_TITLE);

// ====================================================================
// PAGINATION
// ====================================================================
const PX = 96 / 72;
const PAGE_GAP_PX = 16;
const PAGE_CONTENT_TOP = TOP_MARGIN - above(L_BODY) + BODY_TOP_PADDING;
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

const wrapToWidth = (text: string, sizePt: number, maxWidth: number): string[] => {
    const lines: string[] = [];
    let current = '';
    for (const word of text.split(/\s+/).filter(Boolean)) {
        let w = word;
        while (w.length > 1 && measureTextPt(w, sizePt) > maxWidth) {
            let n = w.length - 1;
            while (n > 1 && measureTextPt(w.slice(0, n), sizePt) > maxWidth) n--;
            if (current) {
                lines.push(current);
                current = '';
            }
            lines.push(w.slice(0, n));
            w = w.slice(n);
        }
        const candidate = current ? `${current} ${w}` : w;
        if (current && measureTextPt(candidate, sizePt) > maxWidth) {
            lines.push(current);
            current = w;
        } else {
            current = candidate;
        }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [text];
};

// ====================================================================
// HEADER
// ====================================================================
const NAME_LH = NAME_SIZE * 1.2;
const TITLE_LH = TITLE_SIZE * 1.2;

const layoutContactLines = (parts: string[], itemGap: number): string[][] => {
    const lines: string[][] = [[]];
    const contactRight = LEFT_MARGIN + CONTENT_WIDTH;
    let cursorX = LEFT_MARGIN;
    const startNewLine = () => {
        lines.push([]);
        cursorX = LEFT_MARGIN;
    };

    for (const part of parts) {
        const itemWidth = measureTextPt(part, METADATA_SIZE);

        if (itemWidth > CONTENT_WIDTH) {
            if (cursorX > LEFT_MARGIN) startNewLine();
            const wrapped = wrapToWidth(part, METADATA_SIZE, CONTENT_WIDTH);
            wrapped.forEach((wl, idx) => {
                if (idx > 0) startNewLine();
                lines[lines.length - 1].push(wl);
            });
            cursorX = LEFT_MARGIN + measureTextPt(wrapped[wrapped.length - 1], METADATA_SIZE) + itemGap;
            continue;
        }

        if (cursorX > LEFT_MARGIN && cursorX + itemWidth > contactRight) startNewLine();
        lines[lines.length - 1].push(part);
        cursorX += itemWidth + itemGap;
    }
    return lines;
};

const getHeaderLayout = (hasPhoto: boolean, hasTitle: boolean, contactLines: string[][], fit: number) => {
    const lh = BODY_LINE_HEIGHT * fit;
    const dividerSideGap = DIVIDER_SIDE_GAP * fit;

    const contentOffsetY = hasPhoto ? PHOTO_CONTENT_DOWN_SHIFT : -NO_PHOTO_CONTENT_UP_SHIFT;

    let y = TOP_MARGIN + BODY_TOP_PADDING + contentOffsetY;
    let nameBaseline: number;
    let titleBaseline: number | null = null;
    let photoTop = 0;

    if (hasPhoto) {
        nameBaseline = y;

        const titleSlotBaseline = nameBaseline + NAME_SIZE + NAME_TO_TITLE_GAP;
        titleBaseline = hasTitle ? titleSlotBaseline : null;

        const blockTop = nameBaseline - NAME_SIZE * PDF_ASCENT;
        const blockBottom = titleSlotBaseline + TITLE_SIZE * PDF_DESCENT;
        const blockHeight = blockBottom - blockTop;

        photoTop = blockTop + (blockHeight - HEADER_PHOTO_SIZE) / 2;
        const photoBottom = photoTop + HEADER_PHOTO_SIZE;

        y = titleSlotBaseline + TITLE_SIZE + TITLE_TO_CONTACT_GAP + Math.max(0, photoBottom - blockBottom);
    } else {
        nameBaseline = y + NO_PHOTO_NAME_DOWN_SHIFT;
        y += NAME_SIZE + NAME_TO_TITLE_GAP;
        if (hasTitle) {
            titleBaseline = y + NO_PHOTO_TITLE_DOWN_SHIFT;
            y += TITLE_SIZE + TITLE_TO_CONTACT_GAP;
        }
    }

    const contactFirstBaseline = y + CONTACT_DOWN_SHIFT;
    let contactInkBottom = y;
    if (contactLines.length > 0) {
        const lastBaseline = y + (contactLines.length - 1) * lh + CONTACT_DOWN_SHIFT;
        const lastText = contactLines[contactLines.length - 1].join('');
        contactInkBottom = lastBaseline + (/[gjpqy]/.test(lastText) ? METADATA_SIZE * PDF_DESCENT : 0);
    }

    const dividerTop = contactInkBottom + dividerSideGap + HEADER_CONTACT_TO_DIVIDER_EXTRA_GAP;
    const bandBottom = dividerTop + SECTION_DIVIDER_THICKNESS;

    return { lh, nameBaseline, titleBaseline, photoTop, contactFirstBaseline, bandBottom };
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

// ====================================================================
// TITLE ROW
// ====================================================================
type RowKind = 'none' | 'title' | 'shared' | 'stacked' | 'dateOnly';

const analyzeTitleRow = (title: string, date: string, cw: number): { kind: RowKind; last: Line } => {
    if (!title && !date) return { kind: 'none', last: L_SUB };
    if (!date) return { kind: 'title', last: L_TITLE };
    if (!title) return { kind: 'dateOnly', last: L_SUB };

    const dateWidth = measureTextPt(date, ENTRY_SUB_SIZE);
    const sharedRowTitleWidth = Math.max(0, cw - dateWidth - TITLE_TO_DATE_GAP);
    const longestWord = title
        .split(/\s+/)
        .filter(Boolean)
        .reduce((max, word) => Math.max(max, measureTextPt(word, ENTRY_TITLE_SIZE, true)), 0);
    const shares = sharedRowTitleWidth >= longestWord && sharedRowTitleWidth >= cw / 2;
    return shares ? { kind: 'shared', last: L_TITLE } : { kind: 'stacked', last: L_SUB };
};

const titleStyle: React.CSSProperties = {
    fontSize: pt(ENTRY_TITLE_SIZE),
    fontWeight: 'bold',
    lineHeight: pt(ENTRY_TITLE_SIZE),
    color: COLOR_HEADING,
    minWidth: 0,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere'
};

const dateStyle: React.CSSProperties = {
    fontSize: pt(ENTRY_SUB_SIZE),
    fontWeight: 'normal',
    lineHeight: pt(ENTRY_SUB_SIZE),
    color: COLOR_SECTION,
    whiteSpace: 'nowrap'
};

const subStyle: React.CSSProperties = {
    fontSize: pt(ENTRY_SUB_SIZE),
    lineHeight: pt(ENTRY_SUB_SIZE),
    color: COLOR_METADATA,
    minWidth: 0,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere'
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
                    marginTop: pt(gapBetween(BODY_LINE_HEIGHT, L_TITLE, L_SUB))
                }}
            >
                {safeText(date)}
            </div>
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
                textTransform: 'none',
                whiteSpace: 'nowrap',
                color: COLOR_SECTION
            }}
        >
            {title}
        </h2>
        <div
            style={{
                height: pt(SECTION_DIVIDER_THICKNESS),
                marginTop: pt(DIVIDER_MARGIN_TOP),
                backgroundColor: COLOR_SECTION,
                borderRadius: ROUNDED_RADIUS
            }}
        />
    </div>
);

// ====================================================================
// MOUSE GATE — same pattern as ModernTemplate.
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
    first: Line;
    onEditSection?: (key: string) => void;
    activeSection?: string | null;
    gate: MouseGateApi;
    children: React.ReactNode;
}> = ({ title, sectionKey, first, onEditSection, activeSection, gate, children }) => {
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
            style={{ ...interactiveWrapperStyle(isHovered, interactive), marginTop: pt(SECTION_TOP_MARGIN) }}
        >
            {showLabel && <SectionEditLabel />}
            <SectionHeading title={title} />
            <div style={{ marginTop: pt(contentTopMargin(first)) }}>{children}</div>
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
                <span style={{ minWidth: 0, color: COLOR_BODY, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {safeText(line)}
                </span>
            </div>
        ))}
    </div>
);

const entryBlock: React.CSSProperties = {
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
    minWidth: 0
};

// ====================================================================
// TEMPLATE
// ====================================================================
const TealCurveTemplate: React.FC<CVPreviewProps> = (props) => {
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
        activeSection,
    } = props;

    const pi = personalInfo as any;

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

    const contactParts: string[] = [];
    if (clean(pi?.email)) contactParts.push(`${CONTACT_LABELS.email}${clean(pi.email)}`);
    if (phoneNumber) {
        const dialPrefix = selectedCountryCode ? `${selectedCountryCode} ` : '';
        contactParts.push(`${CONTACT_LABELS.phone}${dialPrefix}${phoneNumber}`.trim());
    }
    const location = clean(pi?.location) || clean(pi?.city);
    if (location) contactParts.push(`${CONTACT_LABELS.location}${location}`);
    const address = clean(pi?.address) || clean(pi?.streetAddress);
    if (address) contactParts.push(`${CONTACT_LABELS.address}${address}`);
    if (clean(pi?.linkedin)) contactParts.push(`${CONTACT_LABELS.linkedin}${clean(pi.linkedin)}`);
    if (clean(pi?.github)) contactParts.push(`${CONTACT_LABELS.github}${clean(pi.github)}`);
    const webLink = clean(pi?.website) || clean(pi?.portfolio);
    if (webLink) contactParts.push(`${CONTACT_LABELS.website}${webLink}`);
    const contactItems = contactParts.map((p) => stripEmojis(safeText(p))).filter(Boolean);

    const contactItemGap = measureTextPt(SKILLS_SEPARATOR, METADATA_SIZE);
    const contactLines = layoutContactLines(contactItems, contactItemGap);
    const header = getHeaderLayout(hasPhoto, hasTitle, contactItems.length > 0 ? contactLines : [], fit);
    const textStartX = hasPhoto ? LEFT_MARGIN + HEADER_PHOTO_SIZE + PHOTO_TO_TEXT_GAP : LEFT_MARGIN;

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
                        backgroundColor: COLOR_BAND
                    }}
                >
                    {hasPhoto && (
                        <img
                            src={photoSrc}
                            alt=""
                            style={{
                                position: 'absolute',
                                left: pt(LEFT_MARGIN),
                                top: pt(header.photoTop),
                                width: pt(HEADER_PHOTO_SIZE),
                                height: pt(HEADER_PHOTO_SIZE),
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }}
                        />
                    )}

                    <div
                        style={{
                            position: 'absolute',
                            left: pt(textStartX),
                            top: pt(header.nameBaseline - baselineIn(NAME_LH, NAME_SIZE)),
                            fontSize: pt(NAME_SIZE),
                            fontWeight: 'normal',
                            lineHeight: pt(NAME_LH),
                            letterSpacing: 0,
                            whiteSpace: 'nowrap',
                            color: COLOR_NAME
                        }}
                    >
                        {name}
                    </div>

                    {hasTitle && header.titleBaseline !== null && (
                        <div
                            style={{
                                position: 'absolute',
                                left: pt(textStartX),
                                top: pt(header.titleBaseline - baselineIn(TITLE_LH, TITLE_SIZE)),
                                fontSize: pt(TITLE_SIZE),
                                fontWeight: 'normal',
                                lineHeight: pt(TITLE_LH),
                                whiteSpace: 'nowrap',
                                color: COLOR_TITLE
                            }}
                        >
                            {jobTitle}
                        </div>
                    )}

                    {contactItems.length > 0 &&
                        contactLines.map((items, i) => (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    left: pt(LEFT_MARGIN + CONTACT_RIGHT_SHIFT),
                                    top: pt(header.contactFirstBaseline + i * header.lh - baselineIn(header.lh, METADATA_SIZE)),
                                    display: 'flex',
                                    columnGap: pt(contactItemGap),
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
                        title="PROFESSIONAL SUMMARY"
                        sectionKey="summary"
                        first={L_BODY}
                        onEditSection={onEditSection}
                        activeSection={activeSection}
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
                            {safeText(summary)}
                        </p>
                    </Section>
                )}

                {validExperiences.length > 0 && (
                    <Section
                        title="EXPERIENCE"
                        sectionKey="experience"
                        first={L_TITLE}
                        onEditSection={onEditSection}
                        activeSection={activeSection}
                        gate={gateApi}
                    >
                        {validExperiences.map((exp: any, i: number) => {
                            const title = clean(exp.title);
                            const company = clean(exp.company);
                            const dateRange = [clean(exp.startDate), clean(exp.endDate)].filter(Boolean).join(' – ');
                            const bullets = parseBulletLines(exp.description);
                            const row = analyzeTitleRow(title, dateRange, CW);
                            const hasHeader = row.kind !== 'none' || !!company;

                            const companyGap =
                                row.kind !== 'none' ? gapBetween(row.last.fs + TITLE_TO_SUBTITLE_GAP, row.last, L_SUB) : 0;
                            const descPrev = company ? L_SUB : row.last;
                            const descGap = hasHeader
                                ? gapBetween(descPrev.fs + SUBTITLE_TO_DESCRIPTION_GAP, descPrev, L_BODY)
                                : 0;
                            const last = bullets.length > 0 ? L_BODY : company ? L_SUB : row.last;

                            return (
                                <div
                                    key={i}
                                    {...keepProps}
                                    style={{
                                        ...entryBlock,
                                        marginBottom: i < validExperiences.length - 1 ? pt(entryGapAfter(last)) : 0
                                    }}
                                >
                                    <TitleRow title={safeText(title)} date={safeText(dateRange)} kind={row.kind} />
                                    {company && (
                                        <div style={{ ...subStyle, marginTop: pt(companyGap) }}>{safeText(company)}</div>
                                    )}
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

                {validEducations.length > 0 && (
                    <Section
                        title="EDUCATION"
                        sectionKey="education"
                        first={L_TITLE}
                        onEditSection={onEditSection}
                        activeSection={activeSection}
                        gate={gateApi}
                    >
                        {validEducations.map((edu: any, i: number) => {
                            const degree = clean(edu.degree);
                            const institution = clean(edu.institution);
                            const year = clean(edu.year);
                            const grade = clean(edu.grade);
                            const row = analyzeTitleRow(degree, year, CW);

                            const institutionGap =
                                row.kind !== 'none' ? gapBetween(row.last.fs + TITLE_TO_SUBTITLE_GAP, row.last, L_SUB) : 0;
                            const gradeGap = institution
                                ? gapBetween(BODY_LINE_HEIGHT, L_SUB, L_SUB)
                                : row.kind !== 'none'
                                    ? gapBetween(row.last.fs + SUBTITLE_TO_DESCRIPTION_GAP, row.last, L_SUB)
                                    : 0;
                            const last = grade || institution ? L_SUB : row.last;

                            return (
                                <div
                                    key={i}
                                    {...keepProps}
                                    style={{
                                        ...entryBlock,
                                        marginBottom: i < validEducations.length - 1 ? pt(entryGapAfter(last)) : 0
                                    }}
                                >
                                    <TitleRow title={safeText(degree)} date={safeText(year)} kind={row.kind} />
                                    {institution && (
                                        <div style={{ ...subStyle, marginTop: pt(institutionGap) }}>
                                            {safeText(institution)}
                                        </div>
                                    )}
                                    {grade && <div style={{ ...subStyle, marginTop: pt(gradeGap) }}>{safeText(`Grade: ${grade}`)}</div>}
                                </div>
                            );
                        })}
                    </Section>
                )}

                {validCertifications.length > 0 && (
                    <Section
                        title="CERTIFICATIONS"
                        sectionKey="certifications"
                        first={L_TITLE}
                        onEditSection={onEditSection}
                        activeSection={activeSection}
                        gate={gateApi}
                    >
                        {validCertifications.map((c: any, i: number) => {
                            const certName = clean(c.name);
                            const date = clean(c.date);
                            const credentialId = clean(c.credentialId);
                            const row = analyzeTitleRow(certName, date, CW);

                            const credentialGap =
                                row.kind !== 'none' ? gapBetween(row.last.fs + TITLE_TO_SUBTITLE_GAP, row.last, L_SUB) : 0;
                            const last = credentialId ? L_SUB : row.last;

                            return (
                                <div
                                    key={i}
                                    {...keepProps}
                                    style={{
                                        ...entryBlock,
                                        marginBottom: i < validCertifications.length - 1 ? pt(entryGapAfter(last)) : 0
                                    }}
                                >
                                    <TitleRow title={safeText(certName)} date={safeText(date)} kind={row.kind} />
                                    {credentialId && (
                                        <div style={{ ...subStyle, marginTop: pt(credentialGap) }}>
                                            {safeText(credentialId)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </Section>
                )}

                {skillLines.length > 0 && (
                    <Section
                        title="SKILLS"
                        sectionKey="skills"
                        first={L_BODY}
                        onEditSection={onEditSection}
                        activeSection={activeSection}
                        gate={gateApi}
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

                {validLanguages.length > 0 && (
                    <Section
                        title="LANGUAGES"
                        sectionKey="languages"
                        first={L_TITLE}
                        onEditSection={onEditSection}
                        activeSection={activeSection}
                        gate={gateApi}
                    >
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
                                        fontSize: pt(ENTRY_TITLE_SIZE),
                                        lineHeight: pt(ENTRY_TITLE_SIZE),
                                        marginBottom: i < validLanguages.length - 1 ? pt(languageGapAfter) : 0,
                                        wordBreak: 'break-word',
                                        overflowWrap: 'anywhere'
                                    }}
                                >
                                    <span style={{ fontWeight: 'bold', color: COLOR_HEADING }}>{safeText(language)}</span>
                                    {level && (
                                        <span
                                            style={{
                                                fontSize: pt(ENTRY_SUB_SIZE),
                                                lineHeight: pt(ENTRY_SUB_SIZE),
                                                fontWeight: 'normal',
                                                color: COLOR_METADATA
                                            }}
                                        >
                                            {language ? LANGUAGE_NAME_LEVEL_SEPARATOR : ''}
                                            {safeText(level)}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </Section>
                )}

                {validAchievements.length > 0 && (
                    <Section
                        title="ACHIEVEMENTS"
                        sectionKey="achievements"
                        first={L_TITLE}
                        onEditSection={onEditSection}
                        activeSection={activeSection}
                        gate={gateApi}
                    >
                        {validAchievements.map((a: any, i: number) => {
                            const title = clean(a.title);
                            const date = clean(a.date);
                            const bullets = parseBulletLines(a.description);
                            const row = analyzeTitleRow(title, date, CW);

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
                                        marginBottom: i < validAchievements.length - 1 ? pt(entryGapAfter(last)) : 0
                                    }}
                                >
                                    <TitleRow title={safeText(title)} date={safeText(date)} kind={row.kind} />
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
                        title="PROJECTS"
                        sectionKey="projects"
                        first={L_TITLE}
                        onEditSection={onEditSection}
                        activeSection={activeSection}
                        gate={gateApi}
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
                                        marginBottom: i < validProjects.length - 1 ? pt(entryGapAfter(last)) : 0
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

export default TealCurveTemplate;