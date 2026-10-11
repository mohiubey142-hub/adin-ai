// MinimalTemplate.tsx
// ------------------------------------------------------------------
// Live preview that mirrors minimalPdf.ts (the jsPDF generator) 1:1.
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
// ------------------------------------------------------------------

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CVPreviewProps } from '../types/previewTypes';
import { safeText } from '../utils/renderHelpers';

// ====================================================================
// PAGE (A4, same numbers as minimalPdf.ts)
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
const LANGUAGE_SEPARATOR_SIZE = ENTRY_TITLE_SIZE + 2;

const FONT_FAMILY = 'Arial, Helvetica, "Liberation Sans", sans-serif';

// ====================================================================
// COLORS (same RGB values as minimalPdf.ts)
// ====================================================================
const COLOR_NAME = '#28282d';
const COLOR_TITLE = '#46464b';
const COLOR_METADATA = '#46464b';
const COLOR_DIVIDER = '#c3c3c8';
const COLOR_HEADING = '#19191e';
const COLOR_SECTION_HEADING = '#28282d';
const COLOR_BODY = '#19191e';
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
const ENTRY_TITLE_TO_SUBTITLE_GAP = 3;
const ENTRY_SUBTITLE_TO_DESCRIPTION_GAP = 6;
const ENTRY_GAP = 14;
const BULLET_DOT_TO_TEXT_GAP = 3 * MM_TO_PT;
const TITLE_TO_DATE_GAP = 3 * MM_TO_PT;
const TIMELINE_CONTENT_INDENT = BULLET_DOT_TO_TEXT_GAP;
const TIMELINE_START_EXTENSION = 0.5 * MM_TO_PT;
const NO_PHOTO_NAME_DOWN_SHIFT = 2 * MM_TO_PT;
const NO_PHOTO_TITLE_DOWN_SHIFT = 1 * MM_TO_PT;

// With a profile photo the whole header block (photo, name, title,
// contact) starts this much lower. Everything in the header is derived
// from the same start Y, so the divider and all sections below move by
// the same amount and no gap changes. No photo -> shift is 0 (unchanged).
const PHOTO_CONTENT_DOWN_SHIFT_MM = 3;
const PHOTO_CONTENT_DOWN_SHIFT = PHOTO_CONTENT_DOWN_SHIFT_MM * MM_TO_PT;
const NO_PHOTO_CONTENT_DOWN_SHIFT = 0;

// Header photo (same model as ATSProTemplate / atsProPdf.ts)
const PHOTO_BASE = 75; // layout slot the photo is centred inside
const PHOTO_BLEED = 6; // extra size drawn beyond the slot
const PHOTO_SIZE = PHOTO_BASE + PHOTO_BLEED;
const PHOTO_TO_TEXT_GAP = 15;
const PHOTO_LEFT_OFFSET = 0; // flush with the header wrapper's left edge
const PHOTO_BORDER_RADIUS = '50%';
const NAME_LEFT_SHIFT = 0.1 * MM_TO_PT; // name nudged left; photo, title and contact stay put

const SKILLS_SEPARATOR = '   •   ';
const LANGUAGE_SPACE_GAP = 0.278 * ENTRY_TITLE_SIZE;

// ====================================================================
// PDF (jsPDF baselines) -> CSS (line boxes) CONVERSION
// ====================================================================
const CSS_ASCENT = 0.905;
const CSS_DESCENT = 0.212;
const PDF_ASCENT = 0.718;
const PDF_DESCENT = 0.207;
const K = (CSS_ASCENT - CSS_DESCENT) / 2;

const baselineInBox = (lineHeight: number, fontSize: number) => lineHeight / 2 + K * fontSize;
const baselineDelta = (fsPrev: number, fsNext: number) => BODY_LINE_HEIGHT + K * (fsNext - fsPrev);

const FIRST_SECTION_TOP_MARGIN = BODY_LINE_HEIGHT + SECTION_GAP - baselineInBox(BODY_LINE_HEIGHT, HEADING_SIZE);
const sectionTopMargin = (prevLastFs: number) => SECTION_GAP + K * (prevLastFs - HEADING_SIZE);
const HEADING_TO_DIVIDER_MARGIN = DIVIDER_SIDE_GAP - (BODY_LINE_HEIGHT - baselineInBox(BODY_LINE_HEIGHT, HEADING_SIZE));

const dividerToContentMargin = (offsetFs: number, actualFirstFs: number) =>
    DIVIDER_SIDE_GAP + offsetFs * PDF_ASCENT - baselineInBox(BODY_LINE_HEIGHT, actualFirstFs);

const entryMarginTop = (prevLastFs: number, nextFirstFs: number, gap: number) =>
    BODY_LINE_HEIGHT + gap - baselineDelta(prevLastFs, nextFirstFs);

// ✅ Ring reservation values
const BODY_TOP_PADDING = HOVER_RING_WIDTH;
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

const computePages = (
    root: HTMLElement,
    fit: number
): { pages: PageWindow[]; contentBottom: number; breaks: string[] } => {
    const wrap = root.querySelector<HTMLElement>('[data-scale-wrap]');
    const wrapTop = wrap ? offsetTopWithin(wrap, root) : 0;
    const LH = BODY_LINE_HEIGHT * PX * fit;
    const contentTop = PAGE_CONTENT_TOP * PX;
    const firstLimit = PAGE_CONTENT_BOTTOM * PX;
    const windowH = PAGE_CONTENT_BOTTOM * PX - contentTop;

    const units = Array.from(root.querySelectorAll<HTMLElement>('[data-unit]')).map((el) => ({
        kind: el.dataset.unit as 'keep' | 'flow' | 'head',
        key: el.dataset.key || '',
        top: wrap ? wrapTop + offsetTopWithin(el, wrap) * fit : offsetTopWithin(el, root),
        height: el.offsetHeight * fit
    }));
    const contentBottom = units.reduce((max, u) => Math.max(max, u.top + u.height), 0);

    const pages: PageWindow[] = [];
    const breaks: string[] = [];
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
            if (bottom > limit && u.top > start + 1) {
                newPage(u.top);
                if (u.key) breaks.push(u.key);
            }
            while (bottom > limit) newPage(lineCut(u.top));
            return;
        }

        while (bottom > limit) {
            if (u.top > limit - LH && u.top > start + 1) newPage(u.top);
            else newPage(lineCut(u.top));
        }
    });

    pages.push({ start, end: limit });
    return { pages, contentBottom, breaks };
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
    const contentDownShift = hasPhoto ? PHOTO_CONTENT_DOWN_SHIFT : NO_PHOTO_CONTENT_DOWN_SHIFT;
    const y0 = TOP_MARGIN + BODY_TOP_PADDING + contentDownShift;
    const afterName = y0 + NAME_SIZE + NAME_TO_TITLE_GAP;

    const nameBase = hasPhoto ? y0 : y0 + NO_PHOTO_NAME_DOWN_SHIFT;
    const titleBase = hasTitle ? (hasPhoto ? afterName : afterName + NO_PHOTO_TITLE_DOWN_SHIFT) : null;

    const titleSlotBottom = afterName + TITLE_SIZE + TITLE_TO_CONTACT_GAP;
    let cursor = hasPhoto || hasTitle ? titleSlotBottom : afterName;

    let photoTop = 0;
    if (hasPhoto) {
        const blockTop = y0 - NAME_SIZE * PDF_ASCENT;
        const blockBottom = afterName + TITLE_SIZE * PDF_DESCENT;
        const photoCenterY = blockTop + (blockBottom - blockTop) / 2;
        photoTop = photoCenterY - PHOTO_SIZE / 2;
        cursor += Math.max(0, photoCenterY + PHOTO_BASE / 2 - blockBottom);
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
        textLeft: hasPhoto ? PHOTO_SIZE + PHOTO_TO_TEXT_GAP : 0
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

interface ContactLine {
    items: string[];
    oversized: boolean;
}
const buildContactLines = (items: string[]): { lines: ContactLine[]; itemGap: number } => {
    const itemGap = measureTextPt(SKILLS_SEPARATOR, METADATA_SIZE);
    const lines: ContactLine[] = [{ items: [], oversized: false }];
    let cursorX = 0;
    const startNewLine = () => {
        lines.push({ items: [], oversized: false });
        cursorX = 0;
    };
    for (const part of items) {
        const width = measureTextPt(part, METADATA_SIZE);
        if (width > CONTENT_WIDTH) {
            if (cursorX > 0) startNewLine();
            lines[lines.length - 1] = { items: [part], oversized: true };
            cursorX = CONTENT_WIDTH;
            continue;
        }
        if (cursorX > 0 && cursorX + width > CONTENT_WIDTH) startNewLine();
        lines[lines.length - 1].items.push(part);
        cursorX += width + itemGap;
    }
    return { lines, itemGap };
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

const lineStyle = (fontSize: number, color: string, bold = false): React.CSSProperties => ({
    fontSize: pt(fontSize),
    lineHeight: pt(BODY_LINE_HEIGHT),
    fontWeight: bold ? 'bold' : 'normal',
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

const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
    <div data-unit="head" style={{ display: 'flow-root', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <h2
            style={{
                margin: 0,
                padding: 0,
                border: 'none',
                fontSize: pt(HEADING_SIZE),
                fontWeight: 'bold',
                lineHeight: pt(BODY_LINE_HEIGHT),
                letterSpacing: 0,
                whiteSpace: 'nowrap',
                color: COLOR_SECTION_HEADING
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
    marginTop: number;
    contentMarginTop: number;
    onEditSection?: (key: string) => void;
    activeSection?: string | null;
    gate: MouseGateApi;
    children: React.ReactNode;
}> = ({ title, sectionKey, marginTop, contentMarginTop, onEditSection, activeSection, gate, children }) => {
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
            style={{ ...interactiveWrapperStyle(isHovered, interactive), marginTop: pt(marginTop) }}
        >
            {showLabel && <SectionEditLabel />}
            <SectionHeading title={title} />
            <div style={{ marginTop: pt(contentMarginTop) }}>{children}</div>
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
                    fontSize: pt(ENTRY_SUB_SIZE),
                    color: COLOR_BODY
                }}
            >
                {date}
            </span>
        )}
    </div>
);

const titleLine = (text: string) => <div style={lineStyle(ENTRY_TITLE_SIZE, COLOR_HEADING, true)}>{safeText(text)}</div>;
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
const MinimalTemplate: React.FC<CVPreviewProps> = (props) => {
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
    if (clean(pi?.github)) contactParts.push(`GitHub: ${clean(pi.github)}`);
    const webLink = clean(pi?.website) || clean(pi?.portfolio);
    if (webLink) contactParts.push(`Portfolio URL: ${webLink}`);
    const contactItems = contactParts.map((p) => stripEmojis(safeText(p))).filter(Boolean);

    const layout = getHeaderLayout(hasPhoto, hasTitle);
    const { lines: contactLines, itemGap: contactItemGap } = buildContactLines(contactItems);
    const lastContactText = contactItems.length > 0 ? contactLines[contactLines.length - 1].items.join('') : '';

    const measureRef = useRef<HTMLDivElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [fit, setFit] = useState(1);
    const fitState = useRef({ sig: '', active: false, locked: false });
    const { profilePhoto: _photo, ...propsWithoutPhoto } = props as any;
    const contentSig = JSON.stringify(propsWithoutPhoto) + (profilePhoto ? profilePhoto.length : 0);
    const [pages, setPages] = useState<PageWindow[]>([{ start: 0, end: PAGE_CONTENT_BOTTOM * PX }]);
    const [breaks, setBreaks] = useState<string[]>([]);
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

        const { pages: next, contentBottom, breaks: nextBreaks } = computePages(measureRef.current, fit);
        setPages((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
        setBreaks((prev) => (JSON.stringify(prev) === JSON.stringify(nextBreaks) ? prev : nextBreaks));

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
                contentMarginTop={dividerToContentMargin(offsetFs, firstFs)}
                onEditSection={onEditSection}
                activeSection={activeSection}
                gate={gateApi}
            >
                {children}
            </Section>
        );
    };

    // Experience entries
    const experienceItems: EntryItem[] = validExperiences.map((exp: any, i: number) => {
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
                dist: hasTitleRow ? rowFs + ENTRY_TITLE_TO_SUBTITLE_GAP : 0,
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

        const firstFs = stackFirstFs(lines);
        const lastFs = stackLastFs(lines);

        const isLast = i === validExperiences.length - 1;
        const connectToNext = !isLast && !breaks.includes(`exp-${i + 1}`);
        const ruleTop = baselineInBox(BODY_LINE_HEIGHT, firstFs) - PDF_ASCENT * firstFs - TIMELINE_START_EXTENSION;
        const ruleBottom = connectToNext
            ? -(ENTRY_GAP + baselineInBox(BODY_LINE_HEIGHT, lastFs))
            : BODY_LINE_HEIGHT / 2 - K * lastFs - PDF_DESCENT * lastFs;

        return {
            firstFs,
            lastFs,
            node: (
                <>
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            left: pt(-SECTION_DIVIDER_THICKNESS / 2),
                            top: pt(ruleTop),
                            bottom: pt(ruleBottom),
                            width: pt(SECTION_DIVIDER_THICKNESS),
                            backgroundColor: COLOR_DIVIDER
                        }}
                    />
                    <div style={{ paddingLeft: pt(TIMELINE_CONTENT_INDENT), minWidth: 0 }}>
                        <Stack lines={lines} />
                    </div>
                </>
            )
        };
    });

    // Education entries
    const educationItems: EntryItem[] = validEducations.map((edu: any) => {
        const degree = clean(edu.degree);
        const institution = clean(edu.institution);
        const year = clean(edu.year);
        const grade = clean(edu.grade);
        const yearAttachesToInstitution = !!institution;

        const lines: StackLine[] = [];
        if (degree) {
            lines.push({ key: 'degree', fs: ENTRY_TITLE_SIZE, dist: 0, node: titleLine(degree) });
        } else if (year && !yearAttachesToInstitution) {
            lines.push({ key: 'yearAlone', fs: ENTRY_SUB_SIZE, dist: 0, node: subLine(year) });
        }
        if (institution) {
            lines.push({
                key: 'institution',
                fs: ENTRY_SUB_SIZE,
                dist: degree ? ENTRY_TITLE_SIZE + ENTRY_TITLE_TO_SUBTITLE_GAP : 0,
                node: subLine(institution)
            });
        }
        if (year && (institution || degree)) {
            lines.push({ key: 'year', fs: ENTRY_SUB_SIZE, dist: BODY_LINE_HEIGHT, node: subLine(year) });
        }
        if (grade) {
            const dist = lines.length === 0
                ? 0
                : year
                    ? BODY_LINE_HEIGHT
                    : institution
                        ? ENTRY_SUB_SIZE + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP
                        : ENTRY_TITLE_SIZE + ENTRY_SUBTITLE_TO_DESCRIPTION_GAP;
            lines.push({ key: 'grade', fs: ENTRY_SUB_SIZE, dist, node: subLine(`Grade: ${grade}`) });
        }
        return { firstFs: stackFirstFs(lines), lastFs: stackLastFs(lines), node: <Stack lines={lines} /> };
    });

    // Certification entries
    const certificationItems: EntryItem[] = validCertifications.map((c: any) => {
        const certName = clean(c.name);
        const date = clean(c.date);
        const credentialId = clean(c.credentialId);

        const lines: StackLine[] = [];
        if (certName) lines.push({ key: 'name', fs: ENTRY_TITLE_SIZE, dist: 0, node: titleLine(certName) });
        if (date) {
            lines.push({
                key: 'date',
                fs: ENTRY_SUB_SIZE,
                dist: lines.length > 0 ? stackLastFs(lines) + ENTRY_TITLE_TO_SUBTITLE_GAP : 0,
                node: subLine(date)
            });
        }
        if (credentialId) {
            lines.push({
                key: 'credential',
                fs: ENTRY_SUB_SIZE,
                dist: lines.length > 0 ? stackLastFs(lines) + ENTRY_TITLE_TO_SUBTITLE_GAP : 0,
                node: subLine(credentialId)
            });
        }
        return { firstFs: stackFirstFs(lines), lastFs: stackLastFs(lines), node: <Stack lines={lines} /> };
    });

    // Language entries
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
                        color: COLOR_HEADING,
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere'
                    }}
                >
                    {language && level ? (
                        <>
                            <span style={{ fontWeight: 'bold', color: COLOR_HEADING }}>{safeText(language)}</span>
                            <span
                                style={{
                                    marginLeft: pt(LANGUAGE_SPACE_GAP),
                                    fontSize: pt(LANGUAGE_SEPARATOR_SIZE),
                                    lineHeight: 1,
                                    fontWeight: 'bold',
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
                        <span style={{ fontWeight: 'bold', color: COLOR_HEADING }}>
                            {language ? safeText(language) : `: ${safeText(level)}`}
                        </span>
                    )}
                </div>
            )
        };
    });

    // Achievement entries
    const achievementItems: EntryItem[] = validAchievements.map((a: any) => {
        const title = clean(a.title);
        const date = clean(a.date);
        const bullets = parseBulletLines(a.description);

        const lines: StackLine[] = [];
        if (title) lines.push({ key: 'title', fs: ENTRY_TITLE_SIZE, dist: 0, node: titleLine(title) });
        if (date) {
            lines.push({
                key: 'date',
                fs: ENTRY_SUB_SIZE,
                dist: title ? BODY_LINE_HEIGHT : 0,
                node: subLine(date)
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

    // Project entries
    const projectItems: EntryItem[] = validProjects.map((p: any) => {
        const projectName = clean(p.name);
        const tech = clean(p.tech);
        const bullets = parseBulletLines(p.description);
        const github = clean(p.github);

        const lines: StackLine[] = [];
        if (projectName) lines.push({ key: 'name', fs: ENTRY_TITLE_SIZE, dist: 0, node: titleLine(projectName) });
        if (tech) {
            lines.push({
                key: 'tech',
                fs: ENTRY_SUB_SIZE,
                dist: lines.length > 0 ? ENTRY_TITLE_SIZE + ENTRY_TITLE_TO_SUBTITLE_GAP : 0,
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
                            left: pt(PHOTO_LEFT_OFFSET),
                            width: pt(PHOTO_SIZE),
                            height: pt(PHOTO_SIZE),
                            borderRadius: PHOTO_BORDER_RADIUS,
                            objectFit: 'cover'
                        }}
                    />
                )}

                <h1
                    style={{
                        margin: 0,
                        marginTop: pt(layout.nameMarginTop),
                        marginLeft: pt(layout.textLeft - NAME_LEFT_SHIFT),
                        maxWidth: pt(CONTENT_WIDTH - layout.textLeft + NAME_LEFT_SHIFT),
                        fontSize: pt(NAME_SIZE),
                        fontWeight: 'normal',
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
                            marginLeft: layout.textLeft ? pt(layout.textLeft) : 0,
                            maxWidth: pt(CONTENT_WIDTH - layout.textLeft),
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
                            width: '100%',
                            fontSize: pt(METADATA_SIZE),
                            lineHeight: pt(BODY_LINE_HEIGHT),
                            color: COLOR_METADATA
                        }}
                    >
                        {contactLines.map((line, li) => (
                            <div
                                key={li}
                                style={{
                                    display: 'flex',
                                    columnGap: pt(contactItemGap),
                                    width: '100%',
                                    whiteSpace: line.oversized ? 'normal' : 'nowrap'
                                }}
                            >
                                {line.items.map((item, ii) => (
                                    <span key={ii} style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                                        {item}
                                    </span>
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

export default MinimalTemplate;