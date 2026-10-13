// AcademicTemplate.tsx
// ------------------------------------------------------------------
// Live preview that mirrors academicPdf.ts (the jsPDF generator) 1:1.
//
// ✅ PNG export: each visible page carries `data-page`.
// ✅ Label position: bottom-left corner of the section.
// ✅ HIGHLIGHT (mouse-driven): ring on hover; click opens editor.
// ✅ FIX (cut-off): BODY_TOP_PADDING + RING_ROOM_PX.
// ✅ FIX (mouse detection): mousemove-based gate.
//
// Academic-specific design preserved: centered header with photo on
// top, NORMAL-weight name, 3-column Skills, Languages with name +
// level below, black & white palette.
// ------------------------------------------------------------------

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CVPreviewProps } from '../types/previewTypes';
import { safeText } from '../utils/renderHelpers';

// ====================================================================
// PAGE (A4, same numbers as academicPdf.ts)
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
// COLORS (same RGB values as academicPdf.ts)
// ====================================================================
const COLOR_NAME = '#000000';
const COLOR_TITLE = '#000000';
const COLOR_METADATA = '#333333';
const COLOR_HEADING = '#111111';
const COLOR_BODY = '#111111';
const COLOR_SECTION_HEADING = '#000000';
const COLOR_DIVIDER = '#000000';
const COLOR_LINK = '#000000';

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
const SECTION_GAP = 18;
const ENTRY_GAP = 14;
const TITLE_TO_SUBTITLE_GAP = 3;
const SUBTITLE_TO_DESCRIPTION_GAP = 6;
const DIVIDER_SIDE_GAP = 4 * MM_TO_PT;
const SUMMARY_EXTRA_GAP = 1 * MM_TO_PT;
const DIVIDER_THICKNESS = 0.75 + 0.2 * MM_TO_PT;
const BULLET_TEXT_INDENT = 3 * MM_TO_PT;
const TITLE_TO_DATE_GAP = 3 * MM_TO_PT;
const CONTACT_ITEM_GAP = 15;

const HEADER_PHOTO_SIZE = 75;
const PHOTO_TO_TEXT_GAP = 15;
const PHOTO_RENDER_SIZE = HEADER_PHOTO_SIZE * 1.05 + 4;
const PHOTO_VERTICAL_SHIFT = (2 + 1) * MM_TO_PT;
const NAME_VERTICAL_OFFSET = 3 * MM_TO_PT;
const NAME_HORIZONTAL_OFFSET = 0.1 * MM_TO_PT;

const BULLET_MARKER = '•';
const BULLET_MARKER_PATTERN = /^[•●◦▪‣∙‧–—*-]\s+/;

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
const CSS_HALF_LEADING_K = (CSS_ASCENT - CSS_DESCENT) / 2;

const baselineIn = (lineHeight: number, fontSize: number) => lineHeight / 2 + CSS_HALF_LEADING_K * fontSize;

type RowKind = 'title' | 'sub' | 'body';

const ROW: Record<RowKind, { fs: number; lh: number }> = {
    title: { fs: ENTRY_TITLE_SIZE, lh: ENTRY_TITLE_SIZE },
    sub: { fs: ENTRY_SUB_SIZE, lh: ENTRY_SUB_SIZE },
    body: { fs: BODY_SIZE, lh: BODY_LINE_HEIGHT }
};
const rowBaseline = (k: RowKind) => baselineIn(ROW[k].lh, ROW[k].fs);
const rowBelow = (k: RowKind) => ROW[k].lh - rowBaseline(k);
const advanceOf = (k: RowKind) => ROW[k].lh;

const FIRST_BASELINE = rowBaseline('body');
const HEADING_BASELINE = baselineIn(BODY_LINE_HEIGHT, HEADING_SIZE);

const blockTail = (last: RowKind) => BODY_LINE_HEIGHT - FIRST_BASELINE - rowBelow(last);

const SECTION_TOP_MARGIN = SECTION_GAP - HEADING_BASELINE + FIRST_BASELINE;
const HEADER_TO_FIRST_SECTION_SPACER = BODY_LINE_HEIGHT - FIRST_BASELINE;

const HEADING_TO_DIVIDER_MARGIN = DIVIDER_SIDE_GAP + HEADING_BASELINE - BODY_LINE_HEIGHT;
const headingToContentMargin = (firstContentFontSize: number) =>
    DIVIDER_SIDE_GAP + firstContentFontSize * PDF_ASCENT - FIRST_BASELINE;

// ====================================================================
// PAGINATION
// ====================================================================
const PX = 96 / 72;
const PAGE_GAP_PX = 16;
const PAGE_CONTENT_TOP = TOP_MARGIN - FIRST_BASELINE + BODY_TOP_PADDING;
const PAGE_CONTENT_BOTTOM = PAGE_HEIGHT - BOTTOM_MARGIN + 1.5;

interface PageWindow {
    start: number;
    end: number;
    top: number;
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
    let top = 0;
    const newPage = (cut: number, isHeading = false) => {
        pages.push({ start, end: cut, top });
        start = cut;
        limit = cut + windowH;
        top = (TOP_MARGIN - (isHeading ? HEADING_BASELINE : FIRST_BASELINE)) * PX + BODY_TOP_PADDING;
    };
    const lineCut = (unitTop: number) => {
        const cut = unitTop + Math.floor((limit - unitTop) / LH) * LH;
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

    pages.push({ start, end: limit, top });
    return { pages, contentBottom };
};

// ====================================================================
// HEADER LAYOUT
// ====================================================================
const NAME_LH = NAME_SIZE * 1.2;
const TITLE_LH = TITLE_SIZE * 1.2;

const getHeaderLayout = (hasPhoto: boolean, hasTitle: boolean, hasContact: boolean, lastContactHasDescender: boolean) => {
    const y0 = TOP_MARGIN + BODY_TOP_PADDING + (hasPhoto ? HEADER_PHOTO_SIZE + PHOTO_TO_TEXT_GAP : 0);

    const nameBase = y0 + NAME_VERTICAL_OFFSET;
    const afterName = y0 + NAME_SIZE + NAME_TO_TITLE_GAP;
    const titleBase = afterName;
    const contactBase = hasTitle ? afterName + TITLE_SIZE + TITLE_TO_CONTACT_GAP : afterName;

    const nameTop = nameBase - baselineIn(NAME_LH, NAME_SIZE);
    const titleTop = titleBase - baselineIn(TITLE_LH, TITLE_SIZE);
    const contactTop = contactBase - baselineIn(BODY_LINE_HEIGHT, METADATA_SIZE);

    const contactBelowBaseline = BODY_LINE_HEIGHT - baselineIn(BODY_LINE_HEIGHT, METADATA_SIZE);
    const ruleMarginTop = hasContact
        ? DIVIDER_SIDE_GAP + (lastContactHasDescender ? METADATA_SIZE * PDF_DESCENT : 0) - contactBelowBaseline
        : DIVIDER_SIDE_GAP;

    const photoCenterY = TOP_MARGIN + BODY_TOP_PADDING + HEADER_PHOTO_SIZE / 2 - PHOTO_VERTICAL_SHIFT;
    const photoTop = photoCenterY - PHOTO_RENDER_SIZE / 2;

    return {
        nameTop,
        titleTop,
        spacerHeight: hasContact ? contactTop : contactBase,
        ruleMarginTop,
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

const sanitizeText = (text: string): string =>
    text
        .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-')
        .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
        .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"')
        .replace(/\u2026/g, '...')
        .replace(/[\u00A0\u2000-\u200A\u202F\u205F]/g, ' ')
        .replace(/[\u200B\u200C\u200D\uFEFF]/g, '');

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const txt = (v: unknown): string => sanitizeText(clean(v));

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

const parseBulletLines = (text: string): string[] =>
    text
        .split('\n')
        .map((raw) => {
            const trimmed = raw.trim();
            const m = trimmed.match(BULLET_MARKER_PATTERN);
            return m ? trimmed.slice(m[0].length).trim() : trimmed;
        })
        .filter(Boolean);

const usableExperience = (e: any) => !!(txt(e?.title) || txt(e?.company) || txt(e?.startDate) || txt(e?.endDate) || txt(e?.description));
const usableEducation = (e: any) => !!(txt(e?.degree) || txt(e?.institution) || txt(e?.year) || txt(e?.grade));
const usableCertification = (c: any) => !!(txt(c?.name) || txt(c?.date) || txt(c?.credentialId));
const usableProject = (p: any) => !!(txt(p?.name) || txt(p?.tech) || txt(p?.description) || txt(p?.github));
const usableAchievement = (a: any) => !!(txt(a?.title) || txt(a?.date) || txt(a?.description));
const usableLanguage = (l: any) => !!(txt(l?.language) || txt(l?.proficiency));

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
                color: COLOR_SECTION_HEADING
            }}
        >
            {title}
        </h2>
        <div
            style={{
                marginTop: pt(HEADING_TO_DIVIDER_MARGIN),
                width: '100%',
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
    firstContentFontSize: number;
    extraTop?: number;
    onEditSection?: (key: string) => void;
    activeSection?: string | null;
    gate: MouseGateApi;
    hoveredKey: string | null;
    setHoveredKey: (key: string) => void;
    clearHovered: (key: string) => void;
    children: React.ReactNode;
}> = ({ title, sectionKey, firstContentFontSize, extraTop = 0, onEditSection, activeSection, gate, hoveredKey, setHoveredKey, clearHovered, children }) => {
    // ✅ Shared across ALL page copies (state lives in AcademicTemplate)
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
                display: 'flow-root',
                marginTop: pt(SECTION_TOP_MARGIN + extraTop)
            }}
        >
            {showLabel && <SectionEditLabel />}
            <SectionHeading title={title} />
            <div style={{ display: 'flow-root', marginTop: pt(headingToContentMargin(firstContentFontSize)) }}>
                {children}
            </div>
        </section>
    );
};

interface RowSpec {
    kind: RowKind;
    advance: number;
    node: React.ReactNode;
}

const rowStyleByKind: Record<RowKind, React.CSSProperties> = {
    title: { fontWeight: 'bold', color: COLOR_HEADING },
    sub: { fontWeight: 'normal', color: COLOR_METADATA },
    body: { fontWeight: 'normal', color: COLOR_BODY }
};

const Entry: React.FC<{ rows: RowSpec[]; unit: 'keep' | 'flow' }> = ({ rows, unit }) => {
    if (rows.length === 0) return null;
    const first = rows[0];
    const last = rows[rows.length - 1];
    const unitProps = unit === 'keep' ? keepProps : flowProps;
    return (
        <div
            {...unitProps}
            style={{
                minWidth: 0,
                paddingTop: pt(FIRST_BASELINE - rowBaseline(first.kind)),
                marginBottom: pt(blockTail(last.kind)),
                breakInside: 'avoid',
                pageBreakInside: 'avoid'
            }}
        >
            {rows.map((r, i) => (
                <div
                    key={i}
                    style={{
                        marginTop: i === 0 ? 0 : pt(r.advance - rowBelow(rows[i - 1].kind) - rowBaseline(r.kind)),
                        fontSize: pt(ROW[r.kind].fs),
                        lineHeight: pt(ROW[r.kind].lh),
                        minWidth: 0,
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        ...rowStyleByKind[r.kind]
                    }}
                >
                    {r.node}
                </div>
            ))}
        </div>
    );
};

const Bullets: React.FC<{ lines: string[] }> = ({ lines }) => (
    <div>
        {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex' }}>
                <span style={{ flexShrink: 0, width: pt(BULLET_TEXT_INDENT), color: COLOR_SECTION_HEADING }}>
                    {BULLET_MARKER}
                </span>
                <span style={{ minWidth: 0, flex: 1, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {safeText(line)}
                </span>
            </div>
        ))}
    </div>
);

const TitleDate: React.FC<{ title?: string; date?: string }> = ({ title, date }) => (
    <div style={{ display: 'flex', alignItems: 'baseline', columnGap: pt(TITLE_TO_DATE_GAP), width: '100%' }}>
        {title && (
            <span style={{ flex: '1 1 0', minWidth: 0, fontWeight: 'bold', color: COLOR_HEADING }}>{safeText(title)}</span>
        )}
        {date && (
            <span
                style={{
                    marginLeft: 'auto',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    fontSize: pt(ENTRY_SUB_SIZE),
                    lineHeight: pt(ENTRY_SUB_SIZE),
                    fontWeight: 'normal',
                    color: COLOR_METADATA
                }}
            >
                {safeText(date)}
            </span>
        )}
    </div>
);

const entryList = (gap: number): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    rowGap: pt(gap),
    width: '100%'
});

const buildExperienceRows = (exp: any): RowSpec[] => {
    const title = txt(exp.title);
    const company = txt(exp.company);
    const dateRange = [txt(exp.startDate), txt(exp.endDate)].filter(Boolean).join(' – ');
    const bullets = parseBulletLines(txt(exp.description));

    const rows: RowSpec[] = [];
    const headKind: RowKind | null = title ? 'title' : dateRange ? 'sub' : null;
    if (headKind) {
        rows.push({ kind: headKind, advance: 0, node: <TitleDate title={title} date={dateRange} /> });
    }
    if (company) {
        rows.push({
            kind: 'sub',
            advance: headKind ? advanceOf(headKind) + TITLE_TO_SUBTITLE_GAP : 0,
            node: safeText(company)
        });
    }
    if (bullets.length > 0) {
        const prev = rows[rows.length - 1];
        rows.push({
            kind: 'body',
            advance: prev ? advanceOf(prev.kind) + SUBTITLE_TO_DESCRIPTION_GAP : 0,
            node: <Bullets lines={bullets} />
        });
    }
    return rows;
};

const buildEducationRows = (edu: any): RowSpec[] => {
    const degree = txt(edu.degree);
    const institution = txt(edu.institution);
    const grade = txt(edu.grade);
    const year = txt(edu.year);

    const rows: RowSpec[] = [];
    if (degree) rows.push({ kind: 'title', advance: 0, node: safeText(degree) });
    if (institution) {
        rows.push({
            kind: 'sub',
            advance: degree ? advanceOf('title') + TITLE_TO_SUBTITLE_GAP : 0,
            node: safeText(institution)
        });
    }
    if (year) rows.push({ kind: 'sub', advance: rows.length ? BODY_LINE_HEIGHT : 0, node: safeText(year) });
    if (grade) rows.push({ kind: 'sub', advance: rows.length ? BODY_LINE_HEIGHT : 0, node: safeText(`Grade: ${grade}`) });
    return rows;
};

const buildCertificationRows = (cert: any): RowSpec[] => {
    const name = txt(cert.name);
    const date = txt(cert.date);
    const credentialId = txt(cert.credentialId);

    const rows: RowSpec[] = [];
    if (name) rows.push({ kind: 'title', advance: 0, node: safeText(name) });
    if (date) {
        rows.push({ kind: 'sub', advance: name ? advanceOf('title') + TITLE_TO_SUBTITLE_GAP : 0, node: safeText(date) });
    }
    if (credentialId) {
        rows.push({
            kind: 'sub',
            advance: date ? BODY_LINE_HEIGHT : name ? advanceOf('title') + TITLE_TO_SUBTITLE_GAP : 0,
            node: safeText(credentialId)
        });
    }
    return rows;
};

const buildLanguageRows = (lang: any): RowSpec[] => {
    const language = txt(lang.language);
    const proficiencyRaw = txt(lang.proficiency);
    const level = proficiencyRaw ? getProficiencyDisplayLabel(proficiencyRaw) : '';

    const rows: RowSpec[] = [];
    if (language) rows.push({ kind: 'title', advance: 0, node: safeText(language) });
    if (level) {
        rows.push({ kind: 'sub', advance: language ? advanceOf('title') + TITLE_TO_SUBTITLE_GAP : 0, node: safeText(level) });
    }
    return rows;
};

const buildAchievementRows = (ach: any): RowSpec[] => {
    const title = txt(ach.title);
    const date = txt(ach.date);
    const bullets = parseBulletLines(txt(ach.description));

    const rows: RowSpec[] = [];
    if (title) rows.push({ kind: 'title', advance: 0, node: safeText(title) });
    if (date) rows.push({ kind: 'sub', advance: title ? BODY_LINE_HEIGHT : 0, node: safeText(date) });
    if (bullets.length > 0) {
        const prev = rows[rows.length - 1];
        rows.push({
            kind: 'body',
            advance: prev ? advanceOf(prev.kind) + SUBTITLE_TO_DESCRIPTION_GAP : 0,
            node: <Bullets lines={bullets} />
        });
    }
    return rows;
};

const buildProjectRows = (project: any): RowSpec[] => {
    const name = txt(project.name);
    const tech = txt(project.tech);
    const github = txt(project.github);
    const bullets = parseBulletLines(txt(project.description));

    const rows: RowSpec[] = [];
    if (name) rows.push({ kind: 'title', advance: 0, node: safeText(name) });
    if (tech) {
        rows.push({ kind: 'sub', advance: name ? advanceOf('title') + TITLE_TO_SUBTITLE_GAP : 0, node: safeText(tech) });
    }
    if (bullets.length > 0) {
        const prev = rows[rows.length - 1];
        rows.push({
            kind: 'body',
            advance: prev ? advanceOf(prev.kind) + SUBTITLE_TO_DESCRIPTION_GAP : 0,
            node: <Bullets lines={bullets} />
        });
    }
    if (github) {
        const prev = rows[rows.length - 1];
        rows.push({
            kind: 'sub',
            advance: prev ? advanceOf(prev.kind) + SUBTITLE_TO_DESCRIPTION_GAP : 0,
            node: (
                <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: COLOR_LINK, textDecoration: 'none' }}
                >
                    {safeText(github)}
                </a>
            )
        });
    }
    return rows;
};

const SkillColumn: React.FC<{ items: string[] }> = ({ items }) =>
    items.length === 0 ? (
        <div style={{ width: pt(BULLET_TEXT_INDENT), flexShrink: 0 }} />
    ) : (
        <div style={{ flex: '0 0 auto' }}>
            {items.map((skill, i) => (
                <div key={i} style={{ display: 'flex', whiteSpace: 'nowrap' }}>
                    <span style={{ flexShrink: 0, width: pt(BULLET_TEXT_INDENT), color: COLOR_SECTION_HEADING }}>
                        {BULLET_MARKER}
                    </span>
                    <span>{safeText(skill)}</span>
                </div>
            ))}
        </div>
    );

const SkillsGrid: React.FC<{ skills: string[] }> = ({ skills }) => {
    const third = Math.ceil(skills.length / 3);
    const left = skills.slice(0, third);
    const center = skills.slice(third, third * 2);
    const right = skills.slice(third * 2);
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <SkillColumn items={left} />
            <SkillColumn items={center} />
            <SkillColumn items={right} />
        </div>
    );
};

// ====================================================================
// TEMPLATE
// ====================================================================
const AcademicTemplate: React.FC<CVPreviewProps> = (props) => {
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

    const summaryText = txt(professionalSummary);
    const validExperiences = ((experiences as any[]) || []).filter(usableExperience);
    const validEducations = ((educations as any[]) || []).filter(usableEducation);
    const validCertifications = ((certifications as any[]) || []).filter(usableCertification);
    const validLanguages = ((languages as any[]) || []).filter(usableLanguage);
    const validAchievements = ((achievements as any[]) || []).filter(usableAchievement);
    const validProjects = ((projects as any[]) || []).filter(usableProject);
    const skillsList = parseSkillsList(typeof skills === 'string' ? sanitizeText(skills) : undefined);

    const name = stripEmojis(safeText(txt(pi?.name))) || 'Your Name';
    const jobTitle = stripEmojis(safeText(txt(pi?.title) || txt(pi?.jobTitle)));
    const hasPhoto = !!profilePhoto && profilePhoto.startsWith('data:image');
    const hasTitle = !!jobTitle;

    const contactParts: string[] = [];
    if (txt(pi?.email)) contactParts.push(txt(pi.email));
    if (phoneNumber) {
        const dialPrefix = selectedCountryCode ? `${selectedCountryCode} ` : '';
        contactParts.push(`${dialPrefix}${phoneNumber}`.trim());
    }
    if (txt(pi?.address)) contactParts.push(txt(pi.address));
    const location = txt(pi?.location) || txt(pi?.city);
    if (location) contactParts.push(location);
    if (txt(pi?.linkedin)) contactParts.push(txt(pi.linkedin));
    if (txt(pi?.github)) contactParts.push(txt(pi.github));
    const webLink = txt(pi?.website) || txt(pi?.portfolio);
    if (webLink) contactParts.push(webLink);
    const contactItems = contactParts.map((p) => stripEmojis(safeText(p))).filter(Boolean);

    const lastContactHasDescender = /[gjpqy]/.test(contactItems[contactItems.length - 1] || '');
    const layout = getHeaderLayout(hasPhoto, hasTitle, contactItems.length > 0, lastContactHasDescender);

    const measureRef = useRef<HTMLDivElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [fit, setFit] = useState(1);
    const fitState = useRef({ sig: '', active: false, locked: false });
    const { profilePhoto: _photo, ...propsWithoutPhoto } = props as any;
    const contentSig = JSON.stringify(propsWithoutPhoto) + (profilePhoto ? profilePhoto.length : 0);
    const [pages, setPages] = useState<PageWindow[]>([{ start: 0, end: PAGE_CONTENT_BOTTOM * PX, top: 0 }]);
    const [, setFontTick] = useState(0);
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
            {/* ============ HEADER (centered, clickable) ============ */}
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

                <div style={{ position: 'relative', width: '100%', flexShrink: 0 }}>
                    {hasPhoto && (
                        <img
                            src={profilePhoto}
                            alt=""
                            style={{
                                position: 'absolute',
                                top: pt(layout.photoTop),
                                left: pt(CONTENT_WIDTH / 2 - PHOTO_RENDER_SIZE / 2),
                                width: pt(PHOTO_RENDER_SIZE),
                                height: pt(PHOTO_RENDER_SIZE),
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }}
                        />
                    )}

                    <h1
                        style={{
                            position: 'absolute',
                            top: pt(layout.nameTop),
                            left: pt(NAME_HORIZONTAL_OFFSET),
                            width: '100%',
                            margin: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            fontSize: pt(NAME_SIZE),
                            fontWeight: 'normal',
                            lineHeight: pt(NAME_LH),
                            letterSpacing: 0,
                            whiteSpace: 'nowrap',
                            color: COLOR_NAME
                        }}
                    >
                        <span>{name}</span>
                    </h1>

                    {hasTitle && (
                        <div
                            style={{
                                position: 'absolute',
                                top: pt(layout.titleTop),
                                left: 0,
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                fontSize: pt(TITLE_SIZE),
                                fontWeight: 'normal',
                                lineHeight: pt(TITLE_LH),
                                whiteSpace: 'nowrap',
                                color: COLOR_TITLE
                            }}
                        >
                            <span>{jobTitle}</span>
                        </div>
                    )}

                    <div style={{ height: pt(layout.spacerHeight) }} />

                    {contactItems.length > 0 && (
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                textAlign: 'center',
                                columnGap: pt(CONTACT_ITEM_GAP),
                                width: '100%',
                                fontSize: pt(METADATA_SIZE),
                                lineHeight: pt(BODY_LINE_HEIGHT),
                                color: COLOR_METADATA
                            }}
                        >
                            {contactItems.map((item, i) => (
                                <span key={i} style={{ minWidth: 0, maxWidth: '100%', overflowWrap: 'anywhere' }}>
                                    {item}
                                </span>
                            ))}
                        </div>
                    )}

                    <div
                        style={{
                            marginTop: pt(layout.ruleMarginTop),
                            width: '100%',
                            height: pt(DIVIDER_THICKNESS),
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
                <div style={{ height: pt(HEADER_TO_FIRST_SECTION_SPACER) }} />

                {summaryText && (
                    <Section
                        title="PROFESSIONAL SUMMARY"
                        sectionKey="summary"
                        firstContentFontSize={BODY_SIZE}
                        extraTop={SUMMARY_EXTRA_GAP}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        <Entry unit="flow" rows={[{ kind: 'body', advance: 0, node: safeText(summaryText) }]} />
                    </Section>
                )}

                {validExperiences.length > 0 && (
                    <Section
                        title="EXPERIENCE"
                        sectionKey="experience"
                        firstContentFontSize={ENTRY_TITLE_SIZE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        <div style={entryList(ENTRY_GAP)}>
                            {validExperiences.map((exp: any, i: number) => (
                                <Entry key={i} unit="keep" rows={buildExperienceRows(exp)} />
                            ))}
                        </div>
                    </Section>
                )}

                {validEducations.length > 0 && (
                    <Section
                        title="EDUCATION"
                        sectionKey="education"
                        firstContentFontSize={ENTRY_TITLE_SIZE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        <div style={entryList(ENTRY_GAP)}>
                            {validEducations.map((edu: any, i: number) => (
                                <Entry key={i} unit="keep" rows={buildEducationRows(edu)} />
                            ))}
                        </div>
                    </Section>
                )}

                {validCertifications.length > 0 && (
                    <Section
                        title="CERTIFICATIONS"
                        sectionKey="certifications"
                        firstContentFontSize={ENTRY_TITLE_SIZE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        <div style={entryList(ENTRY_GAP)}>
                            {validCertifications.map((c: any, i: number) => (
                                <Entry key={i} unit="keep" rows={buildCertificationRows(c)} />
                            ))}
                        </div>
                    </Section>
                )}

                {skillsList.length > 0 && (
                    <Section
                        title="SKILLS"
                        sectionKey="skills"
                        firstContentFontSize={BODY_SIZE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        <Entry unit="flow" rows={[{ kind: 'body', advance: 0, node: <SkillsGrid skills={skillsList} /> }]} />
                    </Section>
                )}

                {validLanguages.length > 0 && (
                    <Section
                        title="LANGUAGES"
                        sectionKey="languages"
                        firstContentFontSize={ENTRY_TITLE_SIZE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        <div style={entryList(0)}>
                            {validLanguages.map((l: any, i: number) => (
                                <Entry key={i} unit="keep" rows={buildLanguageRows(l)} />
                            ))}
                        </div>
                    </Section>
                )}

                {validAchievements.length > 0 && (
                    <Section
                        title="ACHIEVEMENTS"
                        sectionKey="achievements"
                        firstContentFontSize={ENTRY_TITLE_SIZE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        <div style={entryList(ENTRY_GAP)}>
                            {validAchievements.map((a: any, i: number) => (
                                <Entry key={i} unit="keep" rows={buildAchievementRows(a)} />
                            ))}
                        </div>
                    </Section>
                )}

                {validProjects.length > 0 && (
                    <Section
                        title="PROJECTS"
                        sectionKey="projects"
                        firstContentFontSize={ENTRY_TITLE_SIZE}
                        onEditSection={onEditSection}
                        gate={gateApi}
                        hoveredKey={hoveredKey}
                        setHoveredKey={setHoveredKey}
                        clearHovered={clearHovered}
                    >
                        <div style={entryList(ENTRY_GAP)}>
                            {validProjects.map((p: any, i: number) => (
                                <Entry key={i} unit="keep" rows={buildProjectRows(p)} />
                            ))}
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
                                    top: k === 0 ? `${w.top}px` : `${w.top - RING_ROOM_PX}px`,
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

export default AcademicTemplate;