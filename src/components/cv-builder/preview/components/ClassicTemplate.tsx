// ClassicTemplate.tsx
// ------------------------------------------------------------------
// Live preview that mirrors classicPdf.ts (the jsPDF generator) 1:1.
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
// ✅ Classic-specific design preserved: (header rule removed),
//    "——— HEADING ———" dividers, right-aligned photo, Timeline-style
//    Experience with date column, all colors 1:1 with classicPdf.ts.
// ------------------------------------------------------------------

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CVPreviewProps } from '../types/previewTypes';
import {
    safeText,
    hasContent,
    hasStringContent,
    filterValidItems
} from '../utils/renderHelpers';

// ====================================================================
// PAGE (A4, same numbers as classicPdf.ts)
// ====================================================================
const PAGE_WIDTH = 595.28;
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
// COLORS (same RGB values as classicPdf.ts)
// ====================================================================
const COLOR_NAME = '#0f766e';
const COLOR_TITLE = '#0d9488';
const COLOR_METADATA = '#4b5563';
const COLOR_HEADING = '#111827';
const COLOR_BODY = '#374151';
const COLOR_SECTION = '#0f766e';
const COLOR_ACCENT = '#0d9488';
const COLOR_LINK = '#2563eb';

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

// ✅ Header wrapper padding / margin — used by the header div.
const HEADER_WRAPPER_PADDING = 6;
const HEADER_WRAPPER_MARGIN = -6;

const ROUNDED_RADIUS = '6px';

// ====================================================================
// SPACING FROM THE PDF (pt)
// ====================================================================
const NAME_TO_TITLE_GAP = 6;
const TITLE_TO_CONTACT_GAP = 10;
const HEADER_RULE_GAP = 12;
const HEADER_RULE_THICKNESS = 0.75;
const SECTION_GAP = 20;
const DIVIDER_SIDE_GAP = 1 * MM_TO_PT;
const SECTION_DIVIDER_THICKNESS = 0.75 + 0.2 * MM_TO_PT;
const DATE_TEXT_GAP = 14;
const EXPERIENCE_CONTENT_EXTRA_GAP = 2 * MM_TO_PT;
const PHOTO_TOP_SPACING = 3 * MM_TO_PT;
const NO_IMAGE_NAME_Y_OFFSET = 2 * MM_TO_PT;
const NO_IMAGE_TITLE_Y_OFFSET = 1 * MM_TO_PT;
const CONTACT_PHOTO_SAFETY_GAP = 3 * MM_TO_PT;
const NAME_X_SHIFT_LEFT = 0.2 * MM_TO_PT;

const PHOTO_SIZE_BASE = 65 * 1.13;
const PHOTO_SIZE = (PHOTO_SIZE_BASE + 7 - 4) * 1.05;
const PHOTO_VERTICAL_SHIFT = 0; // extra nudge on top of centring (same knob as ExecutiveTemplate)
const PHOTO_HORIZONTAL_SHIFT = 0; // outward nudge past the right margin (same knob as ExecutiveTemplate)

const BULLET_TEXT_INDENT = (0.35 + 0.278) * BODY_SIZE + 0.4 * MM_TO_PT;
const CONTACT_ITEM_GAP = (6 * 0.278 + 0.35) * METADATA_SIZE;
const SKILLS_SEPARATOR = '   •   ';

const BULLET_MARKER = '•';
const LANGUAGE_NAME_LEVEL_SEPARATOR = ' — ';

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
const baselineInBox = (lineHeight: number, fontSize: number) =>
    lineHeight / 2 + ((CSS_ASCENT - CSS_DESCENT) / 2) * fontSize;

const SECTION_TOP_MARGIN =
    (BODY_LINE_HEIGHT + SECTION_GAP) -
    (BODY_LINE_HEIGHT - baselineInBox(BODY_LINE_HEIGHT, BODY_SIZE)) -
    baselineInBox(BODY_LINE_HEIGHT, HEADING_SIZE);

const HEADING_TO_CONTENT_MARGIN = 6.1;
const ENTRY_GAP = 13.8;

const GAP_AFTER_TITLE = 2.5;
const GAP_AFTER_SUBTITLE = 1.1;
const GAP_DESC_TO_LINK = 6.2;

const HEADER_RULE_BOTTOM_MARGIN =
    (BODY_LINE_HEIGHT + SECTION_GAP) -
    baselineInBox(BODY_LINE_HEIGHT, HEADING_SIZE) -
    HEADER_RULE_THICKNESS / 2 -
    SECTION_TOP_MARGIN;

// ====================================================================
// PAGINATION
// ====================================================================
const PX = 96 / 72;

// Distance from the header wrapper's right edge to the content's right margin edge (wrapper padding is in px).
// The photo sits flush with that margin, so it can never intrude into the contact column.
const HEADER_WRAPPER_PADDING_PT = HEADER_WRAPPER_PADDING / PX;
const PHOTO_RIGHT = HEADER_WRAPPER_PADDING_PT - PHOTO_HORIZONTAL_SHIFT;
const PAGE_HEIGHT = 841.89;
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
    const y0 = TOP_MARGIN + BODY_TOP_PADDING + (hasPhoto ? PHOTO_TOP_SPACING : 0);
    const afterName = y0 + NAME_SIZE + NAME_TO_TITLE_GAP;

    const titleBase = hasTitle ? afterName + (hasPhoto ? 0 : NO_IMAGE_TITLE_Y_OFFSET) : null;
    const contactBase = hasTitle ? afterName + TITLE_SIZE + TITLE_TO_CONTACT_GAP : afterName;

    let nameBase: number;
    if (titleBase !== null) {
        const visibleGap = (contactBase - METADATA_SIZE * PDF_ASCENT) - titleBase;
        nameBase = (titleBase - TITLE_SIZE * PDF_ASCENT) - visibleGap;
    } else {
        nameBase = hasPhoto ? y0 : y0 + NO_IMAGE_NAME_Y_OFFSET;
    }

    const nameTop = nameBase - baselineInBox(NAME_LH, NAME_SIZE);
    const nameBottom = nameTop + NAME_LH;
    const titleTop = titleBase !== null ? titleBase - baselineInBox(TITLE_LH, TITLE_SIZE) : nameBottom;
    const titleBottom = titleBase !== null ? titleTop + TITLE_LH : nameBottom;
    const contactTop = contactBase - baselineInBox(BODY_LINE_HEIGHT, METADATA_SIZE);

    // Photo is centred on the real ink block (name ascent -> title/name descent),
    // independent of photo size and of whether a title exists (ExecutiveTemplate logic).
    const blockTop = nameBase - NAME_SIZE * PDF_ASCENT;
    const blockBottom =
        titleBase !== null ? titleBase + TITLE_SIZE * PDF_DESCENT : nameBase + NAME_SIZE * PDF_DESCENT;
    const blockHeight = blockBottom - blockTop;
    const photoTop = blockTop + (blockHeight - PHOTO_SIZE) / 2 + PHOTO_VERTICAL_SHIFT;

    return {
        nameMarginTop: nameTop,
        titleMarginTop: titleTop - nameBottom,
        contactMarginTop: contactTop - titleBottom,
        ruleMarginTopWithContact:
            HEADER_RULE_GAP + baselineInBox(BODY_LINE_HEIGHT, METADATA_SIZE) - HEADER_RULE_THICKNESS / 2,
        ruleMarginTopNoContact: contactBase + HEADER_RULE_GAP - HEADER_RULE_THICKNESS / 2 - titleBottom,
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

const parseBulletLines = (text?: string): string[] =>
    (text || '')
        .trim()
        .split('\n')
        .map((line) => line.trim().replace(/^[•\-*]\s*/, ''))
        .filter(Boolean);

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

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

// "——— HEADING ———" : line on each side of the heading
const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
    <div
        data-unit="head"
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: pt(DIVIDER_SIDE_GAP),
            width: '100%',
            breakInside: 'avoid',
            pageBreakInside: 'avoid'
        }}
    >
        <div style={{
            flex: 1,
            height: pt(SECTION_DIVIDER_THICKNESS),
            backgroundColor: COLOR_SECTION,
            borderRadius: ROUNDED_RADIUS,
        }} />
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
                whiteSpace: 'nowrap',
                color: COLOR_SECTION
            }}
        >
            {title}
        </h2>
        <div style={{
            flex: 1,
            height: pt(SECTION_DIVIDER_THICKNESS),
            backgroundColor: COLOR_SECTION,
            borderRadius: ROUNDED_RADIUS,
        }} />
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
    onEditSection?: (key: string) => void;
    activeSection?: string | null;
    gate: MouseGateApi;
    children: React.ReactNode;
}> = ({ title, sectionKey, onEditSection, activeSection, gate, children }) => {
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
            <div style={{ marginTop: pt(HEADING_TO_CONTENT_MARGIN) }}>{children}</div>
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
                <span style={{ flexShrink: 0, width: pt(BULLET_TEXT_INDENT), color: COLOR_SECTION }}>
                    {BULLET_MARKER}
                </span>
                <span style={{ minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {safeText(line)}
                </span>
            </div>
        ))}
    </div>
);

const TitleDateRow: React.FC<{ title?: string; date?: string; dateSize?: number }> = ({
    title,
    date,
    dateSize = ENTRY_TITLE_SIZE
}) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'baseline',
            columnGap: pt(DATE_TEXT_GAP),
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
                    fontWeight: 'bold',
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
                    fontSize: pt(dateSize),
                    fontWeight: 'bold',
                    color: COLOR_ACCENT
                }}
            >
                {date}
            </span>
        )}
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

// ====================================================================
// TEMPLATE
// ====================================================================
const ClassicTemplate: React.FC<CVPreviewProps> = (props) => {
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

    const hasAbout = hasStringContent(professionalSummary);
    const hasExperience = hasContent(experiences, ['title', 'company']);
    const hasEducation = hasContent(educations, ['degree', 'institution']);
    const hasProjects = hasContent(projects, ['name']);
    const hasLanguages = hasContent(languages, ['language']);
    const hasCertifications = hasContent(certifications, ['name']);
    const hasAchievements = hasContent(achievements, ['title']);

    const validExperiences = filterValidItems(experiences, ['title', 'company']);
    const validEducations = filterValidItems(educations, ['degree', 'institution']);
    const validProjects = filterValidItems(projects, ['name']);
    const validCertifications = filterValidItems(certifications, ['name']);
    const validAchievements = filterValidItems(achievements, ['title']);
    const validLanguages = filterValidItems(languages, ['language']);

    const skillsList = parseSkillsList(skills);
    const hasSkills = hasStringContent(skills) && skillsList.length > 0;

    const name = stripEmojis(safeText(clean(pi?.name) || 'Your Name')) || 'Your Name';
    const jobTitle = stripEmojis(safeText(clean(pi?.title) || clean(pi?.jobTitle)));
    const hasPhoto = !!profilePhoto && profilePhoto.startsWith('data:image');
    const hasTitle = !!jobTitle;

    const contactParts: string[] = [];
    if (clean(pi?.email)) contactParts.push(`Email: ${clean(pi.email)}`);
    if (phoneNumber) {
        const dialPrefix = selectedCountryCode ? `${selectedCountryCode} ` : '';
        contactParts.push(`Phone: ${dialPrefix}${phoneNumber}`.trim());
    }
    const location = clean(pi?.location) || clean(pi?.city);
    if (location) contactParts.push(`Location: ${location}`);
    const address = clean(pi?.address) || clean(pi?.streetAddress);
    if (address) contactParts.push(`Address: ${address}`);
    if (clean(pi?.linkedin)) contactParts.push(`LinkedIn: ${clean(pi.linkedin)}`);
    const webLink = clean(pi?.website) || clean(pi?.portfolio);
    if (webLink) contactParts.push(`Portfolio URL: ${webLink}`);
    const githubUrl = clean(pi?.github) || clean(pi?.githubUrl);
    if (githubUrl) contactParts.push(`GitHub: ${githubUrl}`);
    const contactItems = contactParts.map((p) => stripEmojis(safeText(p))).filter(Boolean);
    const hasContact = contactItems.length > 0;

    const layout = getHeaderLayout(hasPhoto, hasTitle);

    const leftColumnMaxWidth = hasPhoto
        ? CONTENT_WIDTH - PHOTO_SIZE + PHOTO_HORIZONTAL_SHIFT - CONTACT_PHOTO_SAFETY_GAP
        : CONTENT_WIDTH;

    const dateRangeOf = (exp: any) =>
        `${safeText(clean(exp.startDate) || 'Start')} – ${safeText(clean(exp.endDate) || 'Present')}`;

    const dateColWidth =
        validExperiences.reduce((max: number, exp: any) => Math.max(max, measureTextPt(dateRangeOf(exp), ENTRY_SUB_SIZE)), 0) + 0.5;

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
                            right: pt(PHOTO_RIGHT),
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
                        marginLeft: pt(-NAME_X_SHIFT_LEFT),
                        maxWidth: pt(leftColumnMaxWidth),
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
                            maxWidth: pt(leftColumnMaxWidth),
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

                {hasContact && (
                    <div
                        style={{
                            marginTop: pt(layout.contactMarginTop),
                            maxWidth: pt(leftColumnMaxWidth),
                            display: 'flex',
                            flexWrap: 'wrap',
                            columnGap: pt(CONTACT_ITEM_GAP),
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

                {/* Header divider removed. With contact info, no extra spacer margin is
                    used: the first section's own SECTION_TOP_MARGIN gives the exact same
                    gap as between any two sections. The tiny offset only compensates the
                    METADATA_SIZE vs BODY_SIZE baseline difference of the contact line. */}
                {hasContact ? (
                    <div
                        aria-hidden="true"
                        style={{
                            height: 0,
                            marginTop: pt(
                                baselineInBox(BODY_LINE_HEIGHT, METADATA_SIZE) -
                                baselineInBox(BODY_LINE_HEIGHT, BODY_SIZE)
                            )
                        }}
                    />
                ) : (
                    <div
                        aria-hidden="true"
                        style={{
                            marginTop: pt(layout.ruleMarginTopNoContact),
                            marginBottom: pt(HEADER_RULE_BOTTOM_MARGIN),
                            width: '100%',
                            height: pt(HEADER_RULE_THICKNESS)
                        }}
                    />
                )}
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
                {hasAbout && (
                    <Section
                        title="PROFESSIONAL SUMMARY"
                        sectionKey="summary"
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
                            {safeText(professionalSummary)}
                        </p>
                    </Section>
                )}

                {hasExperience && (
                    <Section
                        title="EXPERIENCE"
                        sectionKey="experience"
                        onEditSection={onEditSection}
                        activeSection={activeSection}
                        gate={gateApi}
                    >
                        <div style={entryList}>
                            {validExperiences.map((exp: any, i: number) => {
                                const title = clean(exp.title);
                                const company = clean(exp.company);
                                const bullets = parseBulletLines(exp.description);
                                const hasHeader = !!(title || company);
                                return (
                                    <div
                                        key={i}
                                        {...keepProps}
                                        style={{
                                            ...entryBlock,
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            columnGap: pt(DATE_TEXT_GAP + EXPERIENCE_CONTENT_EXTRA_GAP),
                                            width: '100%'
                                        }}
                                    >
                                        <div
                                            style={{
                                                flex: `0 0 ${pt(dateColWidth)}`,
                                                whiteSpace: 'nowrap',
                                                fontSize: pt(ENTRY_SUB_SIZE),
                                                lineHeight: pt(BODY_LINE_HEIGHT),
                                                color: COLOR_ACCENT
                                            }}
                                        >
                                            {dateRangeOf(exp)}
                                        </div>
                                        <div style={{ flex: '1 1 0', minWidth: 0 }}>
                                            {title && (
                                                <div
                                                    style={{
                                                        fontSize: pt(ENTRY_TITLE_SIZE),
                                                        fontWeight: 'bold',
                                                        lineHeight: pt(BODY_LINE_HEIGHT),
                                                        color: COLOR_HEADING,
                                                        wordBreak: 'break-word',
                                                        overflowWrap: 'anywhere'
                                                    }}
                                                >
                                                    {safeText(title)}
                                                </div>
                                            )}
                                            {company && (
                                                <div
                                                    style={{
                                                        fontSize: pt(ENTRY_SUB_SIZE),
                                                        lineHeight: pt(BODY_LINE_HEIGHT),
                                                        color: COLOR_BODY,
                                                        wordBreak: 'break-word',
                                                        overflowWrap: 'anywhere'
                                                    }}
                                                >
                                                    {safeText(company)}
                                                </div>
                                            )}
                                            {bullets.length > 0 && (
                                                <div
                                                    style={{
                                                        marginTop: pt(
                                                            !hasHeader ? 0 : company ? GAP_AFTER_SUBTITLE : GAP_AFTER_TITLE
                                                        )
                                                    }}
                                                >
                                                    <BulletList lines={bullets} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {hasEducation && (
                    <Section
                        title="EDUCATION"
                        sectionKey="education"
                        onEditSection={onEditSection}
                        activeSection={activeSection}
                        gate={gateApi}
                    >
                        <div style={entryList}>
                            {validEducations.map((edu: any, i: number) => {
                                const degree = clean(edu.degree);
                                const institution = clean(edu.institution);
                                const year = clean(edu.year);
                                const grade = clean(edu.grade);
                                const hasHeaderContent = !!(degree || institution);
                                return (
                                    <div key={i} {...keepProps} style={entryBlock}>
                                        {degree && (
                                            <TitleDateRow
                                                title={safeText(degree)}
                                                date={year ? safeText(year) : undefined}
                                                dateSize={ENTRY_SUB_SIZE}
                                            />
                                        )}
                                        {institution && (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'baseline',
                                                    columnGap: pt(DATE_TEXT_GAP),
                                                    lineHeight: pt(BODY_LINE_HEIGHT)
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        flex: '1 1 0',
                                                        minWidth: 0,
                                                        fontSize: pt(ENTRY_SUB_SIZE),
                                                        color: COLOR_METADATA,
                                                        wordBreak: 'break-word',
                                                        overflowWrap: 'anywhere'
                                                    }}
                                                >
                                                    {safeText(institution)}
                                                </span>
                                                {!degree && year && (
                                                    <span
                                                        style={{
                                                            flexShrink: 0,
                                                            whiteSpace: 'nowrap',
                                                            fontSize: pt(ENTRY_SUB_SIZE),
                                                            fontWeight: 'bold',
                                                            color: COLOR_ACCENT
                                                        }}
                                                    >
                                                        {safeText(year)}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {!hasHeaderContent && year && (
                                            <div
                                                style={{
                                                    fontSize: pt(ENTRY_SUB_SIZE),
                                                    fontWeight: 'bold',
                                                    lineHeight: pt(BODY_LINE_HEIGHT),
                                                    color: COLOR_ACCENT
                                                }}
                                            >
                                                {safeText(year)}
                                            </div>
                                        )}
                                        {grade && (
                                            <div
                                                style={{
                                                    marginTop: pt(institution || !hasHeaderContent ? 0 : GAP_AFTER_TITLE),
                                                    fontSize: pt(ENTRY_SUB_SIZE),
                                                    lineHeight: pt(BODY_LINE_HEIGHT),
                                                    color: COLOR_METADATA
                                                }}
                                            >
                                                Grade: {safeText(grade)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {hasCertifications && (
                    <Section
                        title="CERTIFICATIONS"
                        sectionKey="certifications"
                        onEditSection={onEditSection}
                        activeSection={activeSection}
                        gate={gateApi}
                    >
                        <div style={entryList}>
                            {validCertifications.map((c: any, i: number) => {
                                const certName = clean(c.name);
                                const date = clean(c.date);
                                const credentialId = clean(c.credentialId);
                                return (
                                    <div key={i} {...keepProps} style={entryBlock}>
                                        {(certName || date) && (
                                            <TitleDateRow
                                                title={certName ? safeText(certName) : undefined}
                                                date={date ? safeText(date) : undefined}
                                            />
                                        )}
                                        {credentialId && (
                                            <div
                                                style={{
                                                    fontSize: pt(ENTRY_SUB_SIZE),
                                                    lineHeight: pt(BODY_LINE_HEIGHT),
                                                    color: COLOR_METADATA,
                                                    wordBreak: 'break-word',
                                                    overflowWrap: 'anywhere'
                                                }}
                                            >
                                                {safeText(credentialId)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {hasSkills && (
                    <Section
                        title="SKILLS"
                        sectionKey="skills"
                        onEditSection={onEditSection}
                        activeSection={activeSection}
                        gate={gateApi}
                    >
                        <div
                            {...flowProps}
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                width: '100%',
                                fontSize: pt(BODY_SIZE),
                                lineHeight: pt(BODY_LINE_HEIGHT),
                                color: COLOR_BODY
                            }}
                        >
                            {skillsList.map((skill, idx) => (
                                <span
                                    key={idx}
                                    style={{ display: 'inline-flex', minWidth: 0, overflowWrap: 'anywhere' }}
                                >
                                    <span>{safeText(skill)}</span>
                                    {idx < skillsList.length - 1 && (
                                        <span style={{ whiteSpace: 'pre' }}>
                                            {SKILLS_SEPARATOR.split('•')[0]}
                                            <span style={{ color: COLOR_SECTION }}>•</span>
                                            {SKILLS_SEPARATOR.split('•')[1]}
                                        </span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </Section>
                )}

                {hasLanguages && (
                    <Section
                        title="LANGUAGES"
                        sectionKey="languages"
                        onEditSection={onEditSection}
                        activeSection={activeSection}
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
                                            fontSize: pt(ENTRY_TITLE_SIZE),
                                            lineHeight: pt(BODY_LINE_HEIGHT),
                                            wordBreak: 'break-word',
                                            overflowWrap: 'anywhere'
                                        }}
                                    >
                                        <span style={{ fontWeight: 'bold', color: COLOR_HEADING }}>
                                            {safeText(language)}
                                        </span>
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
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {hasAchievements && (
                    <Section
                        title="ACHIEVEMENTS"
                        sectionKey="achievements"
                        onEditSection={onEditSection}
                        activeSection={activeSection}
                        gate={gateApi}
                    >
                        <div style={entryList}>
                            {validAchievements.map((a: any, i: number) => {
                                const title = clean(a.title);
                                const date = clean(a.date);
                                const bullets = parseBulletLines(a.description);
                                return (
                                    <div key={i} {...keepProps} style={entryBlock}>
                                        {(title || date) && (
                                            <TitleDateRow
                                                title={title ? safeText(title) : undefined}
                                                date={date ? safeText(date) : undefined}
                                            />
                                        )}
                                        {bullets.length > 0 && (
                                            <div style={{ marginTop: pt(title || date ? GAP_AFTER_TITLE : 0) }}>
                                                <BulletList lines={bullets} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {hasProjects && (
                    <Section
                        title="PROJECTS"
                        sectionKey="projects"
                        onEditSection={onEditSection}
                        activeSection={activeSection}
                        gate={gateApi}
                    >
                        <div style={entryList}>
                            {validProjects.map((p: any, i: number) => {
                                const projectName = clean(p.name);
                                const tech = clean(p.tech);
                                const bullets = parseBulletLines(p.description);
                                const github = clean(p.github);
                                const hasHeader = !!(projectName || tech);

                                const descriptionGap = !hasHeader ? 0 : tech ? GAP_AFTER_SUBTITLE : GAP_AFTER_TITLE;
                                const linkGap =
                                    bullets.length > 0
                                        ? GAP_DESC_TO_LINK
                                        : tech
                                            ? GAP_AFTER_SUBTITLE
                                            : projectName
                                                ? GAP_AFTER_TITLE
                                                : 0;

                                return (
                                    <div key={i} {...keepProps} style={entryBlock}>
                                        {projectName && (
                                            <div
                                                style={{
                                                    fontSize: pt(ENTRY_TITLE_SIZE),
                                                    fontWeight: 'bold',
                                                    lineHeight: pt(BODY_LINE_HEIGHT),
                                                    color: COLOR_HEADING,
                                                    wordBreak: 'break-word',
                                                    overflowWrap: 'anywhere'
                                                }}
                                            >
                                                {safeText(projectName)}
                                            </div>
                                        )}
                                        {tech && (
                                            <div
                                                style={{
                                                    fontSize: pt(ENTRY_SUB_SIZE),
                                                    lineHeight: pt(BODY_LINE_HEIGHT),
                                                    color: COLOR_METADATA,
                                                    wordBreak: 'break-word',
                                                    overflowWrap: 'anywhere'
                                                }}
                                            >
                                                {safeText(tech)}
                                            </div>
                                        )}
                                        {bullets.length > 0 && (
                                            <div style={{ marginTop: pt(descriptionGap) }}>
                                                <BulletList lines={bullets} />
                                            </div>
                                        )}
                                        {github && (
                                            <a
                                                href={github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'block',
                                                    marginTop: pt(linkGap),
                                                    fontSize: pt(ENTRY_SUB_SIZE),
                                                    lineHeight: pt(BODY_LINE_HEIGHT),
                                                    color: COLOR_LINK,
                                                    textDecoration: 'none',
                                                    wordBreak: 'break-word',
                                                    overflowWrap: 'anywhere'
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

export default ClassicTemplate;