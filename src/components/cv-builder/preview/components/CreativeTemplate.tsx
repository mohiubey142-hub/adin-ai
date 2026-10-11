// CreativeTemplate.tsx
// ------------------------------------------------------------------
// Live preview that mirrors creativePdf.ts (the jsPDF generator) 1:1.
//
// ✅ PNG export: each visible page carries `data-page`.
// ✅ Label position: bottom-left corner of the section.
// ✅ HIGHLIGHT (mouse-driven): ring on hover; click opens editor.
//
// ✅ FIX (cut-off): RING_ROOM_PX + page-window expansion on pages 2+.
//    Photo wrapper + section wrappers get their own ring room via
//    padding + negative margin so the ring never clips.
//
// ✅ FIX (mouse detection): movementX/Y gate.
//
// Creative-specific design preserved: two columns (dark sidebar + body),
// independent pagination, centred UPPERCASE name, contact/skills/
// languages/certifications in sidebar, summary/experience/education/
// projects/achievements in body.
// ------------------------------------------------------------------

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CVPreviewProps } from '../types/previewTypes';
import { safeText } from '../utils/renderHelpers';

// ====================================================================
// PAGE + COLUMNS (same numbers as creativePdf.ts)
// ====================================================================
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const RIGHT_MARGIN = 50;
const TOP_MARGIN = 50;
const BOTTOM_MARGIN = 40;
const MM_TO_PT = 72 / 25.4;

const LEFT_COLUMN_WIDTH = PAGE_WIDTH * 0.32;
const SIDEBAR_PAD_X = 7 * MM_TO_PT;
const BODY_PAD_X = 10 * MM_TO_PT;
const LEFT_COLUMN_X = SIDEBAR_PAD_X;
const LEFT_COLUMN_TEXT_WIDTH = LEFT_COLUMN_WIDTH - SIDEBAR_PAD_X * 2;
const RIGHT_COLUMN_X = LEFT_COLUMN_WIDTH + BODY_PAD_X;
const RIGHT_COLUMN_WIDTH = PAGE_WIDTH - RIGHT_MARGIN - RIGHT_COLUMN_X;

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
const NAME_LETTER_SPACING = 1.2;
const TITLE_LETTER_SPACING = 0.8;

const FONT_FAMILY = 'Arial, Helvetica, "Liberation Sans", sans-serif';

// ====================================================================
// COLORS
// ====================================================================
const COLOR_NAME = '#1a1a1a';
const COLOR_TITLE = '#3c3c3c';
const COLOR_METADATA = '#35383f';
const COLOR_SECTION_HEADING = '#1a1a1a';
const COLOR_SECTION_DIVIDER = '#1a1a1a';
const COLOR_HEADING = '#1f2937';
const COLOR_BODY = '#272e39';
const COLOR_ACHIEVEMENT_DATE = '#0f141b';
const COLOR_LINK = '#1f2937';

const COLOR_SIDEBAR_BG = '#161616';
const COLOR_SIDEBAR_HEADING = '#ffffff';
const COLOR_SIDEBAR_DIVIDER = '#3a3a3a';
const COLOR_SIDEBAR_TEXT = '#ffffff';
const COLOR_SIDEBAR_VALUE = '#d1d5db';
const COLOR_SIDEBAR_BODY = '#e5e7eb';

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
const BODY_TOP_PADDING = HOVER_RING_WIDTH;
const RING_ROOM_PX = HOVER_RING_WIDTH;

// ====================================================================
// SPACING (pt)
// ====================================================================
const NAME_TO_TITLE_GAP = 6;
const SECTION_GAP = 18;
const ITEM_GAP = 10;
const BULLET_GAP = 4;
const DIVIDER_SIDE_GAP = 4 * MM_TO_PT;
const SECTION_DIVIDER_THICKNESS = 0.75 + 0.2 * MM_TO_PT;

const ENTRY_TITLE_TO_SUBTITLE_GAP = 3;
const ENTRY_SUBTITLE_TO_DESCRIPTION_GAP = 6;
const ENTRY_GAP_PDF = 14;
const BULLET_DOT_TO_TEXT_GAP = 3 * MM_TO_PT;
const TITLE_TO_DATE_GAP = 3 * MM_TO_PT;
const ACHIEVEMENT_TITLE_MIN_SHARE = 0.5;

const HEADER_PHOTO_SIZE = 75;
const PHOTO_TO_TEXT_GAP = 15;
const PHOTO_RENDER_SIZE = HEADER_PHOTO_SIZE + 28 * (72 / 96);
const PHOTO_UPWARD_SHIFT = 11 * MM_TO_PT;

// The whole left sidebar content (photo + Contact + every sidebar
// section) always starts this much lower, with or without a photo. Only
// the sidebar's own start Y is shifted (name/title and the body column
// are untouched), and everything in the sidebar derives from it, so no
// gap inside the sidebar changes.
const SIDEBAR_CONTENT_DOWN_SHIFT_MM = 2;
const SIDEBAR_CONTENT_DOWN_SHIFT = SIDEBAR_CONTENT_DOWN_SHIFT_MM * MM_TO_PT;

// Labels for the sidebar's contact fields (same labels as creativePdf.ts).
// Address and Location are separate fields.
const CONTACT_LABELS = {
    email: 'Email:',
    phone: 'Phone:',
    address: 'Address:',
    location: 'Location:',
    linkedin: 'LinkedIn:',
    github: 'GitHub:',
    website: 'Portfolio:'
} as const;
const BULLET_MARKER = '•';

// ====================================================================
// PDF (jsPDF baselines) -> CSS (line boxes) CONVERSION
// ====================================================================
const CSS_ASCENT = 0.905;
const CSS_DESCENT = 0.212;
const PDF_ASCENT = 0.718;

const bIn = (lineHeight: number, fontSize: number) =>
    lineHeight / 2 + ((CSS_ASCENT - CSS_DESCENT) / 2) * fontSize;

const bBelow = (lineHeight: number, fontSize: number) => lineHeight - bIn(lineHeight, fontSize);

const stepGap = (delta: number, prevLH: number, prevFS: number, nextLH: number, nextFS: number) =>
    delta - bBelow(prevLH, prevFS) - bIn(nextLH, nextFS);

const lineGap = (delta: number, prevFS: number, nextFS: number) =>
    stepGap(delta, BODY_LINE_HEIGHT, prevFS, BODY_LINE_HEIGHT, nextFS);

const tightLine = (fontSize: number): React.CSSProperties => ({
    fontSize: pt(fontSize),
    lineHeight: pt(fontSize),
    paddingTop: pt((BODY_LINE_HEIGHT - fontSize) / 2),
    paddingBottom: pt((BODY_LINE_HEIGHT - fontSize) / 2)
});

const SECTION_TOP_MARGIN = lineGap(BODY_LINE_HEIGHT + SECTION_GAP, BODY_SIZE, HEADING_SIZE);
const HEADING_TO_DIVIDER_MARGIN = DIVIDER_SIDE_GAP - bBelow(BODY_LINE_HEIGHT, HEADING_SIZE);

const contentMargin = (firstFontSize: number) =>
    DIVIDER_SIDE_GAP + firstFontSize * PDF_ASCENT - bIn(BODY_LINE_HEIGHT, firstFontSize);

// ====================================================================
// PAGINATION
// ====================================================================
const PX = 96 / 72;
const PAGE_GAP_PX = 16;
const PAGE_CONTENT_TOP = TOP_MARGIN - bIn(BODY_LINE_HEIGHT, ENTRY_TITLE_SIZE) + BODY_TOP_PADDING;
const PAGE_CONTENT_BOTTOM = PAGE_HEIGHT - BOTTOM_MARGIN + 1.5;

interface PageWindow {
    start: number;
    end: number;
}

const keepProps = { 'data-unit': 'keep' } as const;
const flowProps = { 'data-unit': 'flow' } as const;
const headProps = { 'data-unit': 'head' } as const;

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

const wrapLikePdf = (text: string, maxWidth: number, fontSize: number, bold: boolean): string[] => {
    const lines: string[] = [];
    let current = '';
    const push = () => {
        lines.push(current);
        current = '';
    };
    for (const word of text.split(/\s+/).filter(Boolean)) {
        const candidate = current ? `${current} ${word}` : word;
        if (measureTextPt(candidate, fontSize, bold) <= maxWidth) {
            current = candidate;
            continue;
        }
        if (current) push();
        if (measureTextPt(word, fontSize, bold) <= maxWidth) {
            current = word;
            continue;
        }
        for (const ch of word) {
            if (current && measureTextPt(current + ch, fontSize, bold) > maxWidth) push();
            current += ch;
        }
    }
    if (current || lines.length === 0) push();
    return lines;
};

// ====================================================================
// TEXT HELPERS
// ====================================================================
const sanitizeTextForPdf = (text: string): string => {
    if (!text) return text;
    return text
        .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-')
        .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
        .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
        .replace(/\u2026/g, '...')
        .replace(/[\u00A0\u2000-\u200A\u202F\u205F]/g, ' ')
        .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
        .replace(/[^\x00-\xFF]/g, '');
};

const clean = (v: unknown): string => (typeof v === 'string' ? sanitizeTextForPdf(safeText(v)).trim() : '');

const parseSkillsList = (skillsRaw: string | undefined): string[] => {
    const skills = sanitizeTextForPdf(skillsRaw || '');
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

const BULLET_MARKER_PATTERN = /^[•\-*]\s*/;
const parseBulletLines = (text?: string): string[] =>
    sanitizeTextForPdf(text || '')
        .trim()
        .split('\n')
        .map((raw) => {
            const trimmed = raw.trim();
            const match = trimmed.match(BULLET_MARKER_PATTERN);
            return match ? trimmed.slice(match[0].length).trim() : trimmed;
        })
        .filter(Boolean);

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

type Column = 'left' | 'right';

const SectionHeading: React.FC<{ title: string; column: Column; fit: number }> = ({ title, column, fit }) => (
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
                color: column === 'left' ? COLOR_SIDEBAR_HEADING : COLOR_SECTION_HEADING
            }}
        >
            {title}
        </h2>
        <div
            style={{
                marginTop: pt(HEADING_TO_DIVIDER_MARGIN),
                width: '100%',
                height: pt(SECTION_DIVIDER_THICKNESS / fit),
                backgroundColor: column === 'left' ? COLOR_SIDEBAR_DIVIDER : COLOR_SECTION_DIVIDER,
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
    column: Column;
    fit: number;
    firstFontSize: number;
    first?: boolean;
    onEditSection?: (key: string) => void;
    activeSection?: string | null;
    gate: MouseGateApi;
    children: React.ReactNode;
}> = ({ title, sectionKey, column, fit, firstFontSize, first, onEditSection, activeSection, gate, children }) => {
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

    // ✅ Ring room: padding + negative margin
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
                marginTop: first ? -ringPad : pt(SECTION_TOP_MARGIN) - ringPad,
                marginLeft: -ringPad,
                marginRight: -ringPad,
            }}
        >
            <div style={{ ...interactiveWrapperStyle(isHovered, interactive), position: 'relative' }}>
                {showLabel && <SectionEditLabel />}
                <SectionHeading title={title} column={column} fit={fit} />
                <div style={{ marginTop: pt(contentMargin(firstFontSize)) }}>{children}</div>
            </div>
        </section>
    );
};

const wrapStyle: React.CSSProperties = { wordBreak: 'break-word', overflowWrap: 'anywhere', minWidth: 0 };

const BulletList: React.FC<{ lines: string[]; flow?: boolean }> = ({ lines, flow }) => (
    <div>
        {lines.map((line, i) => (
            <div
                key={i}
                {...(flow ? flowProps : {})}
                style={{
                    display: 'flex',
                    fontSize: pt(BODY_SIZE),
                    lineHeight: pt(BODY_LINE_HEIGHT),
                    color: COLOR_BODY,
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid'
                }}
            >
                <span style={{ flexShrink: 0, width: pt(BULLET_DOT_TO_TEXT_GAP), color: COLOR_SECTION_HEADING }}>
                    {BULLET_MARKER}
                </span>
                <span style={wrapStyle}>{line}</span>
            </div>
        ))}
    </div>
);

interface EntryDef {
    key: string | number;
    firstFS: number;
    lastFS: number;
    node: React.ReactNode;
    split?: boolean;
}
const EntryStack: React.FC<{ entries: EntryDef[]; extraGap: number; step?: number }> = ({
    entries,
    extraGap,
    step = BODY_LINE_HEIGHT
}) => (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {entries.map((e, i) => (
            <div
                key={e.key}
                {...(e.split ? {} : keepProps)}
                style={{
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                    minWidth: 0,
                    marginTop: i === 0 ? 0 : pt(lineGap(step + extraGap, entries[i - 1].lastFS, e.firstFS))
                }}
            >
                {e.node}
            </div>
        ))}
    </div>
);

const titleTextStyle: React.CSSProperties = {
    ...tightLine(ENTRY_TITLE_SIZE),
    fontWeight: 'bold',
    color: COLOR_HEADING,
    ...wrapStyle
};

const metaStyle: React.CSSProperties = {
    ...tightLine(ENTRY_SUB_SIZE),
    color: COLOR_METADATA,
    ...wrapStyle
};

const TitleDateRow: React.FC<{ title: string; date: string; dateColor?: string }> = ({
    title,
    date,
    dateColor = COLOR_METADATA
}) => {
    if (!title && !date) return null;

    if (!title) {
        return (
            <div style={{ display: 'flex', justifyContent: 'flex-end', lineHeight: pt(BODY_LINE_HEIGHT) }}>
                <span style={{ fontSize: pt(ENTRY_SUB_SIZE), color: dateColor, whiteSpace: 'nowrap' }}>{date}</span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
            <span style={{ ...titleTextStyle, flex: '1 1 0', minWidth: 0, paddingRight: date ? pt(TITLE_TO_DATE_GAP) : 0 }}>
                {title}
            </span>
            {date && (
                <span
                    style={{
                        flexShrink: 0,
                        fontSize: pt(ENTRY_SUB_SIZE),
                        lineHeight: pt(ENTRY_SUB_SIZE),
                        color: dateColor,
                        whiteSpace: 'nowrap'
                    }}
                >
                    {date}
                </span>
            )}
        </div>
    );
};

const AchievementRow: React.FC<{ title: string; date: string; columnWidth: number }> = ({ title, date, columnWidth }) => {
    if (!title && !date) return null;

    const dateWidth = date ? measureTextPt(date, ENTRY_SUB_SIZE) : 0;
    const naiveTitleWidth = date ? Math.max(0, columnWidth - dateWidth - TITLE_TO_DATE_GAP) : columnWidth;
    const widestWord = title
        .split(/\s+/)
        .filter(Boolean)
        .reduce((max, word) => Math.max(max, measureTextPt(word, ENTRY_TITLE_SIZE, true)), 0);

    let titleWidth: number;
    let dateColumnWidth: number;
    if (!date || naiveTitleWidth >= widestWord) {
        titleWidth = naiveTitleWidth;
        dateColumnWidth = dateWidth;
    } else {
        titleWidth = Math.max(widestWord, columnWidth * ACHIEVEMENT_TITLE_MIN_SHARE);
        dateColumnWidth = Math.max(0, columnWidth - titleWidth - TITLE_TO_DATE_GAP);
    }
    const dateFits = dateWidth <= dateColumnWidth;

    return (
        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
            {title && <div style={{ ...titleTextStyle, width: pt(titleWidth), flexShrink: 0 }}>{title}</div>}
            {date && (
                <div
                    style={{
                        ...tightLine(ENTRY_SUB_SIZE),
                        width: pt(dateColumnWidth),
                        marginLeft: 'auto',
                        flexShrink: 0,
                        textAlign: 'right',
                        color: COLOR_ACHIEVEMENT_DATE,
                        whiteSpace: dateFits ? 'nowrap' : 'normal',
                        overflowWrap: 'anywhere'
                    }}
                >
                    {date}
                </div>
            )}
        </div>
    );
};

// ====================================================================
// TEMPLATE
// ====================================================================
const CreativeTemplate: React.FC<CVPreviewProps> = (props) => {
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

    const leftMeasureRef = useRef<HTMLDivElement>(null);
    const rightMeasureRef = useRef<HTMLDivElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [fit, setFit] = useState(1);
    const fitState = useRef({ sig: '', active: false, locked: false });
    const { profilePhoto: _photo, ...propsWithoutPhoto } = props as any;
    const contentSig = JSON.stringify(propsWithoutPhoto) + (profilePhoto ? profilePhoto.length : 0);
    const initialPages: PageWindow[] = [{ start: 0, end: PAGE_CONTENT_BOTTOM * PX }];
    const [leftPages, setLeftPages] = useState<PageWindow[]>(initialPages);
    const [rightPages, setRightPages] = useState<PageWindow[]>(initialPages);
    const [, setFontTick] = useState(0);

    const [headerHovered, setHeaderHovered] = useState(false);
    const [photoHovered, setPhotoHovered] = useState(false);

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

    const rightWidth = RIGHT_COLUMN_WIDTH / fit;
    const leftWidth = LEFT_COLUMN_TEXT_WIDTH / fit;

    const name = (clean(pi?.name) || 'Your Name').toUpperCase();
    const jobTitle = clean(pi?.title || pi?.jobTitle).toUpperCase();
    const hasTitle = !!jobTitle;
    const nameLines = wrapLikePdf(name, RIGHT_COLUMN_WIDTH, NAME_SIZE, true);
    const titleLines = hasTitle ? wrapLikePdf(jobTitle, RIGHT_COLUMN_WIDTH, TITLE_SIZE, false) : [];
    const hasPhoto = !!profilePhoto && profilePhoto.trim().startsWith('data:image');

    const contactFields: { label: string; value: string }[] = [];
    if (clean(pi?.email)) contactFields.push({ label: CONTACT_LABELS.email, value: clean(pi.email) });
    if (phoneNumber) {
        const dialPrefix = selectedCountryCode ? `${selectedCountryCode} ` : '';
        const phone = clean(`${dialPrefix}${phoneNumber}`);
        if (phone) contactFields.push({ label: CONTACT_LABELS.phone, value: phone });
    }
    const address = clean(pi?.address) || clean(pi?.streetAddress);
    if (address) contactFields.push({ label: CONTACT_LABELS.address, value: address });
    const location = clean(pi?.location) || clean(pi?.city);
    if (location) contactFields.push({ label: CONTACT_LABELS.location, value: location });
    if (clean(pi?.linkedin)) contactFields.push({ label: CONTACT_LABELS.linkedin, value: clean(pi.linkedin) });
    if (clean(pi?.github)) contactFields.push({ label: CONTACT_LABELS.github, value: clean(pi.github) });
    const webLink = clean(pi?.website) || clean(pi?.portfolio);
    if (webLink) contactFields.push({ label: CONTACT_LABELS.website, value: webLink });

    const leftFirst: string | null = contactFields.length
        ? 'contact'
        : skillsList.length
            ? 'skills'
            : validLanguages.length
                ? 'languages'
                : validCertifications.length
                    ? 'certifications'
                    : null;
    const rightFirst: string | null = summaryText
        ? 'summary'
        : validExperiences.length
            ? 'experience'
            : validEducations.length
                ? 'education'
                : validProjects.length
                    ? 'projects'
                    : validAchievements.length
                        ? 'achievements'
                        : null;

    const leftStartBaseline = TOP_MARGIN + BODY_TOP_PADDING + SIDEBAR_CONTENT_DOWN_SHIFT + (hasPhoto ? HEADER_PHOTO_SIZE + PHOTO_TO_TEXT_GAP : 0);
    const leftFirstBaseline = leftFirst === 'contact' ? leftStartBaseline : leftStartBaseline + SECTION_GAP * fit;
    const leftWrapMarginTop = leftFirstBaseline - fit * bIn(BODY_LINE_HEIGHT, HEADING_SIZE);

    const nameMarginTop = TOP_MARGIN + BODY_TOP_PADDING - bIn(NAME_SIZE, NAME_SIZE);
    const titleMarginTop = stepGap(NAME_SIZE + NAME_TO_TITLE_GAP, NAME_SIZE, NAME_SIZE, TITLE_SIZE, TITLE_SIZE);
    const headerEndDelta = BODY_LINE_HEIGHT * fit + (hasTitle ? 0 : NAME_TO_TITLE_GAP);
    const lastHeaderLH = hasTitle ? TITLE_SIZE : NAME_SIZE;
    const rightWrapMarginTop =
        headerEndDelta + SECTION_GAP * fit - bBelow(lastHeaderLH, lastHeaderLH) - fit * bIn(BODY_LINE_HEIGHT, HEADING_SIZE);

    const photoTop = TOP_MARGIN + BODY_TOP_PADDING + SIDEBAR_CONTENT_DOWN_SHIFT - PHOTO_UPWARD_SHIFT;
    const photoLeft = (LEFT_COLUMN_WIDTH - PHOTO_RENDER_SIZE) / 2 - LEFT_COLUMN_X;

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
        if (!leftMeasureRef.current || !rightMeasureRef.current) return;
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

        const left = computePages(leftMeasureRef.current, fit);
        const right = computePages(rightMeasureRef.current, fit);
        setLeftPages((prev) => (JSON.stringify(prev) === JSON.stringify(left.pages) ? prev : left.pages));
        setRightPages((prev) => (JSON.stringify(prev) === JSON.stringify(right.pages) ? prev : right.pages));

        if (fs.locked) return;
        const totalPages = Math.max(left.pages.length, right.pages.length);
        const overflowOf = (r: { pages: PageWindow[]; contentBottom: number }) =>
            r.pages.length === totalPages ? Math.max(0, (r.contentBottom - r.pages[r.pages.length - 1].start) / PX) : 0;
        const lastOverflowPt = Math.max(overflowOf(left), overflowOf(right));

        if (!fs.active) {
            if (totalPages === 2 && lastOverflowPt <= AUTO_FIT_MAX_OVERFLOW_PT) {
                fs.active = true;
                setFit(Math.round((1 - AUTO_FIT_STEP) * 100) / 100);
            } else {
                fs.locked = true;
            }
            return;
        }

        if (totalPages === 1) {
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

    // ====================================================================
    // SIDEBAR
    // ====================================================================
    const photoInteractive = !!onEditSection;

    const handlePhotoClick = () => {
        if (!photoInteractive) return;
        onEditSection!('personal');
    };

    const handlePhotoEnter = (e: React.MouseEvent) => {
        if (!photoInteractive) return;
        if (gateApi.shouldBlockEnter('personal-photo', e)) return;
        setPhotoHovered(true);
    };

    const handlePhotoMove = (e: React.MouseEvent) => {
        if (!photoInteractive || photoHovered) return;
        if (gateApi.onMove('personal-photo', e)) setPhotoHovered(true);
    };

    const handlePhotoDown = () => {
        if (!photoInteractive) return;
        gateApi.onPress('personal-photo');
        setPhotoHovered(true);
    };

    const handlePhotoLeave = () => {
        if (!photoInteractive) return;
        gateApi.onLeave('personal-photo');
        setPhotoHovered(false);
    };

    const photoRingPad = HOVER_RING_WIDTH;

    const leftBody = (
        <div style={{ position: 'relative', display: 'flow-root', width: pt(LEFT_COLUMN_TEXT_WIDTH), fontFamily: FONT_FAMILY }}>
            {hasPhoto && (
                <div
                    data-section="personal"
                    onClick={handlePhotoClick}
                    onMouseEnter={handlePhotoEnter}
                    onMouseMove={handlePhotoMove}
                    onMouseDown={handlePhotoDown}
                    onMouseLeave={handlePhotoLeave}
                    style={{
                        position: 'absolute',
                        top: pt(photoTop - photoRingPad),
                        left: pt(photoLeft - photoRingPad),
                        width: pt(PHOTO_RENDER_SIZE + photoRingPad * 2),
                        height: pt(PHOTO_RENDER_SIZE + photoRingPad * 2),
                        cursor: photoInteractive ? 'pointer' : undefined,
                    }}
                >
                    <div
                        style={{
                            ...interactiveWrapperStyle(photoHovered, photoInteractive),
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            overflow: 'hidden',
                        }}
                    >
                        {photoInteractive && photoHovered && <SectionEditLabel />}
                        <img
                            src={profilePhoto}
                            alt=""
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                display: 'block',
                                pointerEvents: 'none',
                            }}
                        />
                    </div>
                </div>
            )}

            <div
                data-scale-wrap
                style={{
                    position: 'relative',
                    display: 'flow-root',
                    marginTop: pt(leftWrapMarginTop),
                    width: pt(leftWidth),
                    transform: fit < 1 ? `scale(${fit})` : undefined,
                    transformOrigin: 'top left'
                }}
            >
                {contactFields.length > 0 && (
                    <Section
                        title="CONTACT"
                        sectionKey="personal"
                        column="left"
                        fit={fit}
                        firstFontSize={METADATA_SIZE}
                        first={leftFirst === 'contact'}
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        <EntryStack
                            step={METADATA_SIZE}
                            extraGap={ITEM_GAP}
                            entries={contactFields.map((f, i) => ({
                                key: i,
                                firstFS: METADATA_SIZE,
                                lastFS: METADATA_SIZE,
                                node: (
                                    <>
                                        <div style={{ ...tightLine(METADATA_SIZE), fontWeight: 'bold', color: COLOR_SIDEBAR_TEXT }}>
                                            {f.label}
                                        </div>
                                        <div
                                            style={{
                                                ...tightLine(METADATA_SIZE),
                                                marginTop: pt(lineGap(METADATA_SIZE + BULLET_GAP, METADATA_SIZE, METADATA_SIZE)),
                                                color: COLOR_SIDEBAR_VALUE,
                                                ...wrapStyle
                                            }}
                                        >
                                            {f.value}
                                        </div>
                                    </>
                                )
                            }))}
                        />
                    </Section>
                )}

                {skillsList.length > 0 && (
                    <Section
                        title="SKILLS"
                        sectionKey="skills"
                        column="left"
                        fit={fit}
                        firstFontSize={BODY_SIZE}
                        first={leftFirst === 'skills'}
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        <div>
                            {skillsList.map((skill, i) => (
                                <div
                                    key={i}
                                    {...flowProps}
                                    style={{
                                        display: 'flex',
                                        fontSize: pt(BODY_SIZE),
                                        lineHeight: pt(BODY_LINE_HEIGHT)
                                    }}
                                >
                                    <span style={{ flexShrink: 0, width: pt(BULLET_DOT_TO_TEXT_GAP), color: COLOR_SIDEBAR_HEADING }}>
                                        {BULLET_MARKER}
                                    </span>
                                    <span style={{ ...wrapStyle, color: COLOR_SIDEBAR_BODY }}>{skill}</span>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {validLanguages.length > 0 && (
                    <Section
                        title="LANGUAGES"
                        sectionKey="languages"
                        column="left"
                        fit={fit}
                        firstFontSize={ENTRY_TITLE_SIZE}
                        first={leftFirst === 'languages'}
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        <EntryStack
                            extraGap={0}
                            entries={validLanguages.map((l: any, i: number) => {
                                const language = clean(l.language);
                                const proficiencyRaw = clean(l.proficiency);
                                const level = proficiencyRaw ? getProficiencyDisplayLabel(proficiencyRaw) : '';
                                return {
                                    key: i,
                                    firstFS: language ? ENTRY_TITLE_SIZE : ENTRY_SUB_SIZE,
                                    lastFS: level ? ENTRY_SUB_SIZE : ENTRY_TITLE_SIZE,
                                    node: (
                                        <>
                                            {language && (
                                                <div style={{ ...tightLine(ENTRY_TITLE_SIZE), fontWeight: 'bold', color: COLOR_SIDEBAR_TEXT, ...wrapStyle }}>
                                                    {language}
                                                </div>
                                            )}
                                            {level && (
                                                <div
                                                    style={{
                                                        ...tightLine(ENTRY_SUB_SIZE),
                                                        marginTop: language
                                                            ? pt(lineGap(ENTRY_TITLE_SIZE + ENTRY_TITLE_TO_SUBTITLE_GAP, ENTRY_TITLE_SIZE, ENTRY_SUB_SIZE))
                                                            : 0,
                                                        color: COLOR_SIDEBAR_BODY,
                                                        ...wrapStyle
                                                    }}
                                                >
                                                    {level}
                                                </div>
                                            )}
                                        </>
                                    )
                                };
                            })}
                        />
                    </Section>
                )}

                {validCertifications.length > 0 && (
                    <Section
                        title="CERTIFICATIONS"
                        sectionKey="certifications"
                        column="left"
                        fit={fit}
                        firstFontSize={ENTRY_TITLE_SIZE}
                        first={leftFirst === 'certifications'}
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        <EntryStack
                            extraGap={ENTRY_GAP_PDF}
                            entries={validCertifications.map((c: any, i: number) => {
                                const certName = clean(c.name);
                                const date = clean(c.date);
                                const credentialId = clean(c.credentialId);
                                const dateGap = lineGap(ENTRY_TITLE_SIZE + ENTRY_TITLE_TO_SUBTITLE_GAP, ENTRY_TITLE_SIZE, ENTRY_SUB_SIZE);
                                const credentialGap = date
                                    ? lineGap(ENTRY_SUB_SIZE + ENTRY_TITLE_TO_SUBTITLE_GAP, ENTRY_SUB_SIZE, ENTRY_SUB_SIZE)
                                    : certName
                                        ? lineGap(ENTRY_TITLE_SIZE + ENTRY_TITLE_TO_SUBTITLE_GAP, ENTRY_TITLE_SIZE, ENTRY_SUB_SIZE)
                                        : 0;
                                return {
                                    key: i,
                                    firstFS: certName ? ENTRY_TITLE_SIZE : ENTRY_SUB_SIZE,
                                    lastFS: credentialId || date ? ENTRY_SUB_SIZE : ENTRY_TITLE_SIZE,
                                    node: (
                                        <>
                                            {certName && (
                                                <div style={{ ...tightLine(ENTRY_TITLE_SIZE), fontWeight: 'bold', color: COLOR_SIDEBAR_TEXT, ...wrapStyle }}>
                                                    {certName}
                                                </div>
                                            )}
                                            {date && (
                                                <div
                                                    style={{
                                                        ...tightLine(ENTRY_SUB_SIZE),
                                                        marginTop: certName ? pt(dateGap) : 0,
                                                        color: COLOR_SIDEBAR_BODY,
                                                        ...wrapStyle
                                                    }}
                                                >
                                                    {date}
                                                </div>
                                            )}
                                            {credentialId && (
                                                <div
                                                    style={{
                                                        ...tightLine(ENTRY_SUB_SIZE),
                                                        marginTop: pt(credentialGap),
                                                        color: COLOR_SIDEBAR_BODY,
                                                        ...wrapStyle
                                                    }}
                                                >
                                                    {credentialId}
                                                </div>
                                            )}
                                        </>
                                    )
                                };
                            })}
                        />
                    </Section>
                )}
            </div>
        </div>
    );

    // ====================================================================
    // BODY
    // ====================================================================
    const headerInteractive = !!onEditSection;

    const handleHeaderClick = () => {
        if (!headerInteractive) return;
        onEditSection!('personal');
    };

    const handleHeaderEnter = (e: React.MouseEvent) => {
        if (!headerInteractive) return;
        if (gateApi.shouldBlockEnter('personal-header', e)) return;
        setHeaderHovered(true);
    };

    const handleHeaderMove = (e: React.MouseEvent) => {
        if (!headerInteractive || headerHovered) return;
        if (gateApi.onMove('personal-header', e)) setHeaderHovered(true);
    };

    const handleHeaderDown = () => {
        if (!headerInteractive) return;
        gateApi.onPress('personal-header');
        setHeaderHovered(true);
    };

    const handleHeaderLeave = () => {
        if (!headerInteractive) return;
        gateApi.onLeave('personal-header');
        setHeaderHovered(false);
    };

    const headerRingPad = HOVER_RING_WIDTH;

    const rightBody = (
        <div style={{ position: 'relative', display: 'flow-root', width: pt(RIGHT_COLUMN_WIDTH), fontFamily: FONT_FAMILY, color: COLOR_BODY }}>
            <div
                data-section="personal"
                onClick={handleHeaderClick}
                onMouseEnter={handleHeaderEnter}
                onMouseMove={handleHeaderMove}
                onMouseDown={handleHeaderDown}
                onMouseLeave={handleHeaderLeave}
                style={{
                    padding: headerRingPad,
                    marginTop: -headerRingPad,
                    marginLeft: -headerRingPad,
                    marginRight: -headerRingPad,
                }}
            >
                <div style={{ ...interactiveWrapperStyle(headerHovered, headerInteractive), position: 'relative' }}>
                    {headerInteractive && headerHovered && <SectionEditLabel />}

                    <h1
                        style={{
                            margin: 0,
                            marginTop: pt(nameMarginTop),
                            fontSize: pt(NAME_SIZE),
                            fontWeight: 'bold',
                            lineHeight: pt(NAME_SIZE),
                            letterSpacing: pt(NAME_LETTER_SPACING),
                            color: COLOR_NAME,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        {nameLines.map((line, i) => (
                            <div key={i} style={{ whiteSpace: 'nowrap' }}>
                                {line}
                            </div>
                        ))}
                    </h1>

                    {hasTitle && (
                        <div
                            style={{
                                marginTop: pt(titleMarginTop),
                                fontSize: pt(TITLE_SIZE),
                                fontWeight: 'normal',
                                lineHeight: pt(TITLE_SIZE),
                                letterSpacing: pt(TITLE_LETTER_SPACING),
                                color: COLOR_TITLE,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            {titleLines.map((line, i) => (
                                <div key={i} style={{ whiteSpace: 'nowrap' }}>
                                    {line}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div
                data-scale-wrap
                style={{
                    position: 'relative',
                    display: 'flow-root',
                    marginTop: pt(rightWrapMarginTop),
                    width: pt(rightWidth),
                    transform: fit < 1 ? `scale(${fit})` : undefined,
                    transformOrigin: 'top left'
                }}
            >
                {summaryText && (
                    <Section
                        title="PROFESSIONAL SUMMARY"
                        sectionKey="summary"
                        column="right"
                        fit={fit}
                        firstFontSize={BODY_SIZE}
                        first={rightFirst === 'summary'}
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
                                ...wrapStyle
                            }}
                        >
                            {summaryText}
                        </p>
                    </Section>
                )}

                {validExperiences.length > 0 && (
                    <Section
                        title="EXPERIENCE"
                        sectionKey="experience"
                        column="right"
                        fit={fit}
                        firstFontSize={ENTRY_TITLE_SIZE}
                        first={rightFirst === 'experience'}
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        <EntryStack
                            extraGap={ENTRY_GAP_PDF}
                            entries={validExperiences.map((exp: any, i: number) => {
                                const title = clean(exp.title);
                                const company = clean(exp.company);
                                const dateRange = [clean(exp.startDate), clean(exp.endDate)].filter(Boolean).join(' – ');
                                const bullets = parseBulletLines(exp.description);
                                const hasRow = !!(title || dateRange);
                                const rowFS = title ? ENTRY_TITLE_SIZE : ENTRY_SUB_SIZE;

                                const companyGap = hasRow ? lineGap(rowFS + ENTRY_TITLE_TO_SUBTITLE_GAP, rowFS, ENTRY_SUB_SIZE) : 0;
                                const bulletGap = company
                                    ? lineGap(ENTRY_SUB_SIZE + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP, ENTRY_SUB_SIZE, BODY_SIZE)
                                    : hasRow
                                        ? lineGap(rowFS + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP, rowFS, BODY_SIZE)
                                        : 0;

                                return {
                                    key: i,
                                    split: true,
                                    firstFS: hasRow ? rowFS : ENTRY_SUB_SIZE,
                                    lastFS: bullets.length ? BODY_SIZE : company ? ENTRY_SUB_SIZE : rowFS,
                                    node: (
                                        <>
                                            <div {...(bullets.length ? headProps : keepProps)}>
                                                <TitleDateRow title={title} date={dateRange} />
                                                {company && <div style={{ ...metaStyle, marginTop: pt(companyGap) }}>{company}</div>}
                                            </div>
                                            {bullets.length > 0 && (
                                                <div style={{ marginTop: pt(bulletGap) }}>
                                                    <BulletList lines={bullets} flow />
                                                </div>
                                            )}
                                        </>
                                    )
                                };
                            })}
                        />
                    </Section>
                )}

                {validEducations.length > 0 && (
                    <Section
                        title="EDUCATION"
                        sectionKey="education"
                        column="right"
                        fit={fit}
                        firstFontSize={ENTRY_TITLE_SIZE}
                        first={rightFirst === 'education'}
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        <EntryStack
                            extraGap={ENTRY_GAP_PDF}
                            entries={validEducations.map((edu: any, i: number) => {
                                const degree = clean(edu.degree);
                                const institution = clean(edu.institution);
                                const year = clean(edu.year);
                                const grade = clean(edu.grade);
                                const hasRow = !!(degree || year);
                                const rowFS = degree ? ENTRY_TITLE_SIZE : ENTRY_SUB_SIZE;

                                const institutionGap = hasRow
                                    ? lineGap(rowFS + ENTRY_TITLE_TO_SUBTITLE_GAP, rowFS, ENTRY_SUB_SIZE)
                                    : 0;
                                const gradeGap = institution
                                    ? lineGap(ENTRY_SUB_SIZE + ENTRY_TITLE_TO_SUBTITLE_GAP, ENTRY_SUB_SIZE, ENTRY_SUB_SIZE)
                                    : hasRow
                                        ? lineGap(rowFS + ENTRY_TITLE_TO_SUBTITLE_GAP, rowFS, ENTRY_SUB_SIZE)
                                        : 0;

                                return {
                                    key: i,
                                    firstFS: hasRow ? rowFS : ENTRY_SUB_SIZE,
                                    lastFS: grade || institution ? ENTRY_SUB_SIZE : rowFS,
                                    node: (
                                        <>
                                            <TitleDateRow title={degree} date={year} />
                                            {institution && (
                                                <div style={{ ...metaStyle, marginTop: pt(institutionGap) }}>{institution}</div>
                                            )}
                                            {grade && <div style={{ ...metaStyle, marginTop: pt(gradeGap) }}>{`Grade: ${grade}`}</div>}
                                        </>
                                    )
                                };
                            })}
                        />
                    </Section>
                )}

                {validProjects.length > 0 && (
                    <Section
                        title="PROJECTS"
                        sectionKey="projects"
                        column="right"
                        fit={fit}
                        firstFontSize={ENTRY_TITLE_SIZE}
                        first={rightFirst === 'projects'}
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        <EntryStack
                            extraGap={ENTRY_GAP_PDF}
                            entries={validProjects.map((p: any, i: number) => {
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
                                const githubGap = bullets.length
                                    ? lineGap(BODY_LINE_HEIGHT + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP, BODY_SIZE, ENTRY_SUB_SIZE)
                                    : tech
                                        ? lineGap(ENTRY_SUB_SIZE + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP, ENTRY_SUB_SIZE, ENTRY_SUB_SIZE)
                                        : projectName
                                            ? lineGap(ENTRY_TITLE_SIZE + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP, ENTRY_TITLE_SIZE, ENTRY_SUB_SIZE)
                                            : 0;

                                return {
                                    key: i,
                                    split: true,
                                    firstFS: projectName ? ENTRY_TITLE_SIZE : ENTRY_SUB_SIZE,
                                    lastFS: github ? ENTRY_SUB_SIZE : bullets.length ? BODY_SIZE : tech ? ENTRY_SUB_SIZE : ENTRY_TITLE_SIZE,
                                    node: (
                                        <>
                                            {(projectName || tech) && (
                                                <div {...(bullets.length ? headProps : keepProps)}>
                                                    {projectName && <div style={titleTextStyle}>{projectName}</div>}
                                                    {tech && <div style={{ ...metaStyle, marginTop: pt(techGap) }}>{tech}</div>}
                                                </div>
                                            )}
                                            {bullets.length > 0 && (
                                                <div style={{ marginTop: pt(bulletGap) }}>
                                                    <BulletList lines={bullets} flow />
                                                </div>
                                            )}
                                            {github && (
                                                <a
                                                    {...keepProps}
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
                                        </>
                                    )
                                };
                            })}
                        />
                    </Section>
                )}

                {validAchievements.length > 0 && (
                    <Section
                        title="ACHIEVEMENTS"
                        sectionKey="achievements"
                        column="right"
                        fit={fit}
                        firstFontSize={ENTRY_TITLE_SIZE}
                        first={rightFirst === 'achievements'}
                        onEditSection={onEditSection}
                        gate={gateApi}
                    >
                        <EntryStack
                            extraGap={ENTRY_GAP_PDF}
                            entries={validAchievements.map((a: any, i: number) => {
                                const title = clean(a.title);
                                const date = clean(a.date);
                                const bullets = parseBulletLines(a.description);
                                const hasRow = !!(title || date);
                                const rowFS = title ? ENTRY_TITLE_SIZE : ENTRY_SUB_SIZE;
                                const bulletGap = hasRow
                                    ? lineGap(rowFS + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP, rowFS, BODY_SIZE)
                                    : 0;

                                return {
                                    key: i,
                                    split: true,
                                    firstFS: hasRow ? rowFS : BODY_SIZE,
                                    lastFS: bullets.length ? BODY_SIZE : rowFS,
                                    node: (
                                        <>
                                            <div {...(bullets.length ? headProps : keepProps)}>
                                                <AchievementRow title={title} date={date} columnWidth={rightWidth} />
                                            </div>
                                            {bullets.length > 0 && (
                                                <div style={{ marginTop: pt(bulletGap) }}>
                                                    <BulletList lines={bullets} flow />
                                                </div>
                                            )}
                                        </>
                                    )
                                };
                            })}
                        />
                    </Section>
                )}
            </div>
        </div>
    );

    const totalPages = Math.max(leftPages.length, rightPages.length);
    const pagePx = PAGE_WIDTH * PX;
    const totalPx = totalPages * PAGE_HEIGHT * PX + (totalPages - 1) * PAGE_GAP_PX;

    const renderWindow = (
        w: PageWindow,
        k: number,
        x: number,
        content: React.ReactNode,
        windowLeft: number,
        windowWidth: number
    ) => (
        <div
            style={{
                position: 'absolute',
                left: pt(windowLeft),
                top: k === 0 ? 0 : `${PAGE_CONTENT_TOP * PX - RING_ROOM_PX}px`,
                width: pt(windowWidth),
                height: `${w.end - w.start + (k === 0 ? 0 : RING_ROOM_PX)}px`,
                overflow: 'hidden',
                pointerEvents: 'none'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    left: pt(x - windowLeft),
                    top: `${-w.start + (k === 0 ? 0 : RING_ROOM_PX)}px`,
                    pointerEvents: 'auto'
                }}
            >
                {content}
            </div>
        </div>
    );

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
                        ref={leftMeasureRef}
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
                        {leftBody}
                    </div>
                    <div
                        ref={rightMeasureRef}
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
                        {rightBody}
                    </div>

                    {Array.from({ length: totalPages }, (_, k) => (
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
                                    top: 0,
                                    width: pt(LEFT_COLUMN_WIDTH),
                                    height: '100%',
                                    backgroundColor: COLOR_SIDEBAR_BG
                                }}
                            />
                            {leftPages[k] &&
                                renderWindow(leftPages[k], k, LEFT_COLUMN_X, leftBody, 0, LEFT_COLUMN_WIDTH)}
                            {rightPages[k] &&
                                renderWindow(
                                    rightPages[k],
                                    k,
                                    RIGHT_COLUMN_X,
                                    rightBody,
                                    LEFT_COLUMN_WIDTH,
                                    PAGE_WIDTH - LEFT_COLUMN_WIDTH
                                )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CreativeTemplate;