// src/components/cover-letter/components/MinimalPreview.tsx
// ✅ Mirrors MinimalTemplate.ts (PDF) 1:1:
//    centered name + title, thin line, PHONE/EMAIL (left) + ADDRESS/LINKEDIN (right) grid, thin line,
//    TO / FROM / DATE column on the left, salutation + body + signature in the right column.
// ✅ Same colours, sizes, spacing numbers, paragraph filters and page-break rules as the template.
// ✅ No photo support (same as the template).

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  cleanText,
  cleanEmail,
  cleanPhoneNumber,
  cleanLinkedin,
  cleanLetterBody,
} from '../utils/pdfHelpers';

interface MinimalPreviewProps {
  letter: string;
  photo?: string | null; // accepted for compatibility, Minimal never shows a photo
  name: string;
  title: string;
  email: string;
  phone: string;
  countryCode: string;
  userAddress: string;
  linkedinUrl: string;
  companyName: string;
  hiringManagerName?: string;
}

// ====================================================================
// UNITS
// ====================================================================
const MM_PER_INCH = 25.4;
const PT_PER_INCH = 72;
const CSS_PX_PER_INCH = 96;
const PT_TO_MM = MM_PER_INCH / PT_PER_INCH;
const MM_TO_PX = CSS_PX_PER_INCH / MM_PER_INCH;
const PT = 0.3528; // same 1pt constant the PDF template uses

const mm = (n: number) => `${n}mm`;
const pt = (n: number) => `${n}pt`;

// ====================================================================
// PAGE
// ====================================================================
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 20;
const MARGIN_Y = 18;
const BOTTOM_MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const CENTER_X = PAGE_WIDTH / 2;

// ====================================================================
// COLORS (same as MinimalTemplate.ts)
// ====================================================================
const DARK_TEXT_RGB: [number, number, number] = [15, 15, 15];
const MUTED_RGB: [number, number, number] = DARK_TEXT_RGB; // company / job title (template: MUTED_COLOR)
const LINE_RGB: [number, number, number] = [200, 205, 210];
const PLACEHOLDER_RGB: [number, number, number] = [156, 163, 175];
const PAGE_BACKGROUND = '#ffffff';
const PAGE_SHADOW = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';

const rgb = ([r, g, b]: [number, number, number]) => `rgb(${r}, ${g}, ${b})`;

// ====================================================================
// FONT
// ====================================================================
const FONT_FAMILY = 'Helvetica, Arial, "Liberation Sans", sans-serif';
const FONT_WEIGHT_BOLD = 'bold';
const FONT_WEIGHT_NORMAL = 'normal';
const FONT_ASCENT_EM = 0.905;
const FONT_DESCENT_EM = 0.212;
const HALF_LEADING_K = (FONT_ASCENT_EM - FONT_DESCENT_EM) / 2;
const TEXT_BOX_LINE_HEIGHT_EM = 1;
const MEASURE_REFERENCE_PX = 100;

// ====================================================================
// TYPOGRAPHY (same as MinimalTemplate.ts)
// ====================================================================
const NAME_MAX_SIZE = 18;
const NAME_MIN_SIZE = 12;
const TITLE_SIZE = 9.5;
const LABEL_SIZE = 6.8;
const VALUE_SIZE = 8.8;
const BODY_SIZE = 10;
const SIG_NAME_BASE_SIZE = 11; // original size (pt)
const SIG_NAME_SCALE_UP = 1.3; // +30% enlargement
const SIG_NAME_REDUCE_PERCENT = 30; // total reduction on top of the enlarged size
const SIG_NAME_SIZE = SIG_NAME_BASE_SIZE * SIG_NAME_SCALE_UP * (1 - SIG_NAME_REDUCE_PERCENT / 100);
const VALUE_STEP = 4.2; // line step inside label / value blocks
const LABEL_SPACING = 0.3; // letter-spacing of labels (mm)

// ====================================================================
// SPACING (same numbers as MinimalTemplate.ts)
// ====================================================================
const LINE_H = 5.2; // body line step
const PARA_GAP = 4; // gap between paragraphs
const NAME_BASELINE_OFFSET = 6.5;
const NAME_LINE_FACTOR = 1.2;
const GAP_NAME_TO_TITLE = 3.5;
const TITLE_LINE_FACTOR = 1.3;
const HEADER_RULE_GAP = 8;
const GRID_TOP_GAP = 7;
const GRID_FIELD_GAP = 6;
const GRID_RULE_GAP = 5;
const COLUMNS_TOP_GAP = 8;
const SIDE_LABEL_TO_TEXT = 5;
const SIDE_BLOCK_GAP = 5;
const DATE_TEXT_OFFSET = 5;
const SUBJECT_STEP = 4.5;
const SUBJECT_TRAILING = 5;
const GAP_AFTER_SALUTATION = 9;
const PAGE_BREAK_SAFETY = 3;
const NEW_PAGE_TOP_OFFSET = 4;
const GAP_BEFORE_SIGNATURE = 3;
const SIGNATURE_MIN_SPACE = 20;
const GAP_AFTER_CLOSING = 7;
const SIGNATURE_STEP = 5;
const SIGNATURE_NAME_EXTRA_LEFT = 0.5; // name only moves 0.5mm left, 'Sincerely,' stays
const SIGNATURE_NAME_EXTRA_DOWN = 1; // name only moves 1mm down, 'Sincerely,' stays
const RULE_THICKNESS = 0.2;

// ====================================================================
// COLUMNS
// ====================================================================
const BODY_X = MARGIN_X + 39; // right column (salutation + body)
const BODY_W = PAGE_WIDTH - MARGIN_X - BODY_X;
const SIDE_W = BODY_X - MARGIN_X - 5; // left column width
const GRID_LEFT_LABEL_X = MARGIN_X;
const GRID_RIGHT_LABEL_X = 112;
const LABEL_VALUE_GAP = 2; // space between "LABEL:" and its value

// ====================================================================
// FLAGS (keep equal to MinimalTemplate.ts)
// ====================================================================
const SHOW_SUBJECT = false;
const SHOW_SIGNATURE = true;

// ====================================================================
// TEXT CONSTANTS
// ====================================================================
const DEFAULT_NAME = 'Your Name';
const DEFAULT_TITLE = 'Job Title';
const DEFAULT_SUBJECT_POSITION = 'Position';
const DEFAULT_HIRING_MANAGER = 'Hiring Manager';
const SUBJECT_PREFIX = 'RE: Application for ';
const SALUTATION_PREFIX = 'Dear ';
const SALUTATION_SUFFIX = ',';
const CLOSING_TEXT = 'Sincerely,';
const DATE_LOCALE = 'en-US';
const DATE_FORMAT: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
const PLACEHOLDER_TEXT = 'No content yet. Generate your letter to see the preview.';

const DATE_ONLY_PATTERN = /^\w+ \d{1,2}, \d{4}$/;
const SUBJECT_MARKERS = ['RE:', 'Application for'];
const DEAR_HIRING_MANAGER = 'dear hiring manager';
const DEAR_PREFIX = 'dear ';
const EMAIL_MARK = '@';
const EMAIL_LINE_MARKS = ['|', 'gmail'];
const PARAGRAPH_SPLIT = /\n\n+/;
const LINE_BREAK_PATTERN = /\r\n|\r|\n/;

// ====================================================================
// PREVIEW SHEET
// ====================================================================
const PAGE_GAP = 4;
const MAX_SCALE = 1;

// ====================================================================
// PDF TEXT SANITIZER
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

// ====================================================================
// TEXT MEASURING + WRAPPING
// ====================================================================
let measureContext: CanvasRenderingContext2D | null = null;
const getMeasureContext = (): CanvasRenderingContext2D | null => {
  if (!measureContext && typeof document !== 'undefined') {
    measureContext = document.createElement('canvas').getContext('2d');
  }
  return measureContext;
};

const textWidthMm = (text: string, fontSize: number, bold: boolean): number => {
  const ctx = getMeasureContext();
  if (!ctx) return 0;
  ctx.font = `${bold ? FONT_WEIGHT_BOLD : FONT_WEIGHT_NORMAL} ${MEASURE_REFERENCE_PX}px ${FONT_FAMILY}`;
  const widthAtReference = ctx.measureText(text).width;
  return (widthAtReference / MEASURE_REFERENCE_PX) * fontSize * PT_TO_MM;
};

// Letter-spaced width, same maths as the template (each char + spacing, minus the last spacing)
const spacedWidthMm = (text: string, fontSize: number, bold: boolean, spacing: number): number => {
  let w = 0;
  for (const ch of text) w += textWidthMm(ch, fontSize, bold) + spacing;
  return Math.max(0, w - spacing);
};

const wrapParagraph = (paragraph: string, maxWidth: number, fontSize: number, bold: boolean): string[] => {
  const fits = (s: string) => textWidthMm(s, fontSize, bold) <= maxWidth;
  const lines: string[] = [];
  let current = '';

  const placeWord = (word: string) => {
    const candidate = current ? `${current} ${word}` : word;
    if (fits(candidate)) {
      current = candidate;
      return;
    }
    if (current) {
      lines.push(current);
      current = '';
    }
    if (fits(word)) {
      current = word;
      return;
    }
    let piece = '';
    for (const ch of word) {
      if (piece && !fits(piece + ch)) {
        lines.push(piece);
        piece = '';
      }
      piece += ch;
    }
    current = piece;
  };

  paragraph.split(' ').forEach(placeWord);
  lines.push(current);
  return lines;
};

const splitTextToSize = (text: string, maxWidth: number, fontSize: number, bold: boolean): string[] =>
  text.split(LINE_BREAK_PATTERN).flatMap((p) => wrapParagraph(p, maxWidth, fontSize, bold));

// ====================================================================
// LAYOUT
// ====================================================================
interface TextOp {
  page: number;
  x: number;
  baseline: number;
  text: string;
  fontSize: number;
  bold: boolean;
  spacing?: number; // letter-spacing in mm
  secondary?: boolean; // uses MUTED_RGB
  muted?: boolean; // placeholder style
}

interface RuleOp {
  page: number;
  y: number;
  x1: number;
  x2: number;
}

interface Layout {
  texts: TextOp[];
  rules: RuleOp[];
  pageCount: number;
}

interface LayoutInput {
  userName: string;
  email: string;
  phoneNumber: string;
  selectedCountryCode: string;
  address: string;
  linkedin: string;
  jobTitle: string;
  company: string;
  generatedLetter: string;
  hiringManagerName: string;
}

interface Field {
  label: string;
  value: string;
}

const buildLayout = (input: LayoutInput): Layout => {
  const { userName, email, phoneNumber, selectedCountryCode, address, linkedin, jobTitle, company, generatedLetter } = input;

  const texts: TextOp[] = [];
  const rules: RuleOp[] = [];
  let page = 0;
  let currentY = MARGIN_Y;

  const cleanHiringManager = cleanText(input.hiringManagerName || DEFAULT_HIRING_MANAGER);
  const displayName = cleanText(userName || DEFAULT_NAME);
  const displayTitle = cleanText(jobTitle || DEFAULT_TITLE);

  const push = (
    text: string,
    x: number,
    baseline: number,
    fontSize: number,
    bold: boolean,
    extra?: { spacing?: number; secondary?: boolean; muted?: boolean }
  ) => {
    texts.push({ page, x, baseline, text, fontSize, bold, ...extra });
  };

  const pushCentered = (text: string, baseline: number, fontSize: number, bold: boolean, secondary?: boolean) => {
    const w = textWidthMm(text, fontSize, bold);
    push(text, CENTER_X - w / 2, baseline, fontSize, bold, { secondary });
  };

  const getRemainingSpace = () => PAGE_HEIGHT - BOTTOM_MARGIN - currentY;
  const startNewPage = () => {
    page += 1;
    currentY = MARGIN_Y + NEW_PAGE_TOP_OFFSET;
  };
  const checkAndAddPage = (neededHeight: number) => {
    if (getRemainingSpace() < neededHeight + PAGE_BREAK_SAFETY) {
      startNewPage();
      return true;
    }
    return false;
  };

  const drawRule = (y: number) => rules.push({ page, y, x1: MARGIN_X, x2: PAGE_WIDTH - MARGIN_X });

  // ------------------------------------------------------------------
  // HEADER - centered name + title
  // ------------------------------------------------------------------
  const headerMaxW = CONTENT_WIDTH;

  let nameSize = NAME_MAX_SIZE;
  while (nameSize > NAME_MIN_SIZE && textWidthMm(displayName, nameSize, true) > headerMaxW) {
    nameSize -= 0.5;
  }
  const nameLines = splitTextToSize(displayName, headerMaxW, nameSize, true);
  const nameLH = nameSize * PT * NAME_LINE_FACTOR;
  const nameBase = MARGIN_Y + NAME_BASELINE_OFFSET;
  nameLines.forEach((l, i) => pushCentered(l, nameBase + i * nameLH, nameSize, true));

  const titleLines = splitTextToSize(displayTitle, headerMaxW, TITLE_SIZE, false);
  const titleLH = TITLE_SIZE * PT * TITLE_LINE_FACTOR;
  const titleBase = nameBase + (nameLines.length - 1) * nameLH + GAP_NAME_TO_TITLE + TITLE_SIZE * PT;
  titleLines.forEach((l, i) => pushCentered(l, titleBase + i * titleLH, TITLE_SIZE, false, true));
  const titleBottom = titleBase + (titleLines.length - 1) * titleLH;

  const ruleTopY = titleBottom + HEADER_RULE_GAP;
  drawRule(ruleTopY);

  // ------------------------------------------------------------------
  // CONTACT GRID  (LABEL: value) - phone/email left, address/linkedin right
  // ------------------------------------------------------------------
  const leftFields: Field[] = [];
  const rightFields: Field[] = [];

  if (address) {
    const v = cleanText(address);
    if (v) rightFields.push({ label: 'ADDRESS', value: v });
  }
  if (linkedin) {
    const v = cleanLinkedin(linkedin);
    if (v) rightFields.push({ label: 'LINKEDIN', value: v });
  }
  if (phoneNumber && selectedCountryCode) {
    const v = cleanPhoneNumber(phoneNumber, selectedCountryCode);
    if (v) leftFields.push({ label: 'PHONE', value: v });
  }
  if (email) {
    const v = cleanEmail(email);
    if (v) leftFields.push({ label: 'EMAIL', value: v });
  }

  // Longer content goes on top in each group (ties keep original order)
  const byLongerFirst = (a: Field, b: Field) => b.value.length - a.value.length;
  leftFields.sort(byLongerFirst);
  rightFields.sort(byLongerFirst);

  // Draws one field, returns the baseline of its last line
  const drawField = (f: Field, labelX: number, valueX: number, width: number, y: number): number => {
    push(`${f.label}:`, labelX, y, LABEL_SIZE, true, { spacing: LABEL_SPACING });
    const lines = splitTextToSize(f.value, width, VALUE_SIZE, false);
    lines.forEach((l, i) => push(l, valueX, y + i * VALUE_STEP, VALUE_SIZE, false));
    return y + (lines.length - 1) * VALUE_STEP;
  };

  // Width of the widest "LABEL:" in a column
  const labelBlockWidth = (fields: Field[]): number => {
    let max = 0;
    fields.forEach((f) => {
      max = Math.max(max, spacedWidthMm(`${f.label}:`, LABEL_SIZE, true, LABEL_SPACING));
    });
    return max;
  };

  let sectionTopY = ruleTopY;
  if (leftFields.length || rightFields.length) {
    const gridTop = ruleTopY + GRID_TOP_GAP;

    // Left group: value starts right after the widest label
    const gridLeftValueX = GRID_LEFT_LABEL_X + labelBlockWidth(leftFields) + LABEL_VALUE_GAP;
    const gridLeftW = GRID_RIGHT_LABEL_X - 6 - gridLeftValueX;
    const gridRightEdgeX = PAGE_WIDTH - MARGIN_X; // where the dividers end
    const gridRightMaxW = gridRightEdgeX - GRID_RIGHT_LABEL_X;

    // Right group: every line STARTS at the same x; x is picked so the longest line
    // ends exactly where the dividers end.
    const rLabelW = labelBlockWidth(rightFields);
    const rValueMaxW = gridRightMaxW - rLabelW - LABEL_VALUE_GAP;
    let rWidest = 0;
    rightFields.forEach((f) => {
      splitTextToSize(f.value, rValueMaxW, VALUE_SIZE, false).forEach((l) => {
        rWidest = Math.max(rWidest, textWidthMm(l, VALUE_SIZE, false));
      });
    });
    const rLabelX = gridRightEdgeX - (rLabelW + LABEL_VALUE_GAP + rWidest);
    const rValueX = rLabelX + rLabelW + LABEL_VALUE_GAP;

    let leftY = gridTop;
    let leftBottom = gridTop;
    leftFields.forEach((f) => {
      leftBottom = drawField(f, GRID_LEFT_LABEL_X, gridLeftValueX, gridLeftW, leftY);
      leftY = leftBottom + GRID_FIELD_GAP;
    });

    let rightY = gridTop;
    let rightBottom = gridTop;
    rightFields.forEach((f) => {
      rightBottom = drawField(f, rLabelX, rValueX, rValueMaxW, rightY);
      rightY = rightBottom + GRID_FIELD_GAP;
    });

    const gridBottom = Math.max(leftBottom, rightBottom);
    const ruleBottomY = gridBottom + GRID_RULE_GAP;
    drawRule(ruleBottomY);
    sectionTopY = ruleBottomY;
  }

  const columnsTopY = sectionTopY + COLUMNS_TOP_GAP;

  // ------------------------------------------------------------------
  // LEFT COLUMN - TO / FROM / DATE
  // ------------------------------------------------------------------
  const drawSideBlock = (label: string, primary: string, secondary: string, y: number): number => {
    push(label, MARGIN_X, y, LABEL_SIZE, true, { spacing: LABEL_SPACING });
    let cy = y + SIDE_LABEL_TO_TEXT;

    if (primary) {
      const pl = splitTextToSize(primary, SIDE_W, VALUE_SIZE, true);
      pl.forEach((l, i) => push(l, MARGIN_X, cy + i * VALUE_STEP, VALUE_SIZE, true));
      cy += pl.length * VALUE_STEP;
    }
    if (secondary) {
      const sl = splitTextToSize(secondary, SIDE_W, VALUE_SIZE, false);
      sl.forEach((l, i) => push(l, MARGIN_X, cy + i * VALUE_STEP, VALUE_SIZE, false, { secondary: true }));
      cy += sl.length * VALUE_STEP;
    }
    return cy;
  };

  const today = new Date().toLocaleDateString(DATE_LOCALE, DATE_FORMAT);

  let sideY = columnsTopY;
  // With no real name, the TO block shows only the company (bold) so
  // "Hiring Manager" is not repeated next to "Dear Hiring Manager,".
  const hasRealHiringManagerName =
    !!(input.hiringManagerName && input.hiringManagerName.trim()) &&
    cleanHiringManager.trim().toLowerCase() !== DEFAULT_HIRING_MANAGER.toLowerCase();
  const toCompany = company ? cleanText(company) : '';
  sideY = drawSideBlock(
    'TO',
    hasRealHiringManagerName ? cleanHiringManager : toCompany,
    hasRealHiringManagerName ? toCompany : '',
    sideY
  ) + SIDE_BLOCK_GAP;
  sideY = drawSideBlock('FROM', displayName, displayTitle, sideY) + SIDE_BLOCK_GAP;
  drawSideBlock('DATE', '', '', sideY);
  push(today, MARGIN_X, sideY + DATE_TEXT_OFFSET, VALUE_SIZE, false);

  // ------------------------------------------------------------------
  // RIGHT COLUMN - subject (optional) + salutation
  // ------------------------------------------------------------------
  currentY = columnsTopY;

  if (SHOW_SUBJECT) {
    const subject = `${SUBJECT_PREFIX}${cleanText(jobTitle || DEFAULT_SUBJECT_POSITION)}`;
    const wrappedSubject = splitTextToSize(subject, BODY_W, BODY_SIZE, true);
    wrappedSubject.forEach((l, i) => push(l, BODY_X, currentY + i * SUBJECT_STEP, BODY_SIZE, true));
    currentY += wrappedSubject.length * SUBJECT_STEP + SUBJECT_TRAILING;
  }

  push(`${SALUTATION_PREFIX}${cleanHiringManager}${SALUTATION_SUFFIX}`, BODY_X, currentY, BODY_SIZE, false);
  currentY += GAP_AFTER_SALUTATION;

  // ------------------------------------------------------------------
  // LETTER BODY (same filters + page-break rules as the template)
  // ------------------------------------------------------------------
  const cleanLetter = cleanLetterBody(generatedLetter, cleanHiringManager).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const paragraphs = cleanLetter.split(PARAGRAPH_SPLIT);
  const upperUserName = userName?.toUpperCase();
  let drewAnyParagraph = false;

  paragraphs.forEach((paragraph) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return;

    if (trimmed.match(DATE_ONLY_PATTERN)) return;
    if (trimmed === DEFAULT_HIRING_MANAGER) return;
    if (trimmed === cleanHiringManager) return;
    if (SUBJECT_MARKERS.some((m) => trimmed.includes(m))) return;
    if (trimmed === company) return;
    if (trimmed === cleanText(company)) return;
    if (trimmed === userName || trimmed === upperUserName) return;
    if (trimmed === jobTitle) return;
    if (trimmed.toLowerCase().includes(DEAR_HIRING_MANAGER)) return;
    if (trimmed.toLowerCase().startsWith(DEAR_PREFIX)) return;
    if (trimmed.startsWith(DEFAULT_HIRING_MANAGER)) return;
    if (trimmed.includes(EMAIL_MARK) && EMAIL_LINE_MARKS.some((m) => trimmed.includes(m))) return;

    const lines = splitTextToSize(trimmed, BODY_W, BODY_SIZE, false);
    checkAndAddPage(lines.length * LINE_H);
    lines.forEach((l, i) => push(l, BODY_X, currentY + i * LINE_H, BODY_SIZE, false));
    currentY += lines.length * LINE_H + PARA_GAP;
    drewAnyParagraph = true;
  });

  if (!drewAnyParagraph) {
    push(PLACEHOLDER_TEXT, BODY_X, currentY, BODY_SIZE, false, { muted: true });
    currentY += LINE_H + PARA_GAP;
  }

  // ------------------------------------------------------------------
  // SIGNATURE
  // ------------------------------------------------------------------
  if (SHOW_SIGNATURE) {
    currentY += GAP_BEFORE_SIGNATURE;
    if (getRemainingSpace() < SIGNATURE_MIN_SPACE) startNewPage();

    push(CLOSING_TEXT, BODY_X, currentY, BODY_SIZE, false);
    currentY += GAP_AFTER_CLOSING;

    const sigLines = splitTextToSize(displayName, BODY_W, SIG_NAME_SIZE, true);
    sigLines.forEach((l, i) => push(l, BODY_X - SIGNATURE_NAME_EXTRA_LEFT, currentY + SIGNATURE_NAME_EXTRA_DOWN + i * SIGNATURE_STEP, SIG_NAME_SIZE, true));
  }

  return { texts, rules, pageCount: page + 1 };
};

// ====================================================================
// RENDERING HELPERS
// ====================================================================
const baselineToTop = (baseline: number, fontSize: number): number => {
  const boxHeight = fontSize * PT_TO_MM * TEXT_BOX_LINE_HEIGHT_EM;
  const baselineInsideBox = boxHeight / 2 + HALF_LEADING_K * fontSize * PT_TO_MM;
  return baseline - baselineInsideBox;
};

// ====================================================================
// COMPONENT
// ====================================================================
export const MinimalPreview = ({
  letter,
  name,
  title,
  email,
  phone,
  countryCode,
  userAddress,
  linkedinUrl,
  companyName,
  hiringManagerName,
}: MinimalPreviewProps) => {
  const layout = useMemo<Layout>(
    () =>
      buildLayout({
        userName: sanitizeTextForPdf(name || ''),
        email: sanitizeTextForPdf(email || ''),
        phoneNumber: sanitizeTextForPdf(phone || ''),
        selectedCountryCode: sanitizeTextForPdf(countryCode || ''),
        address: sanitizeTextForPdf(userAddress || ''),
        linkedin: sanitizeTextForPdf(linkedinUrl || ''),
        jobTitle: sanitizeTextForPdf(title || ''),
        company: sanitizeTextForPdf(companyName || ''),
        generatedLetter: sanitizeTextForPdf(letter || ''),
        hiringManagerName: sanitizeTextForPdf(hiringManagerName || ''),
      }),
    [name, email, phone, countryCode, userAddress, linkedinUrl, title, companyName, letter, hiringManagerName]
  );

  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(MAX_SCALE);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const next = Math.min(MAX_SCALE, el.clientWidth / (PAGE_WIDTH * MM_TO_PX));
      if (next > 0) setScale((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stackHeightMm = layout.pageCount * PAGE_HEIGHT + (layout.pageCount - 1) * PAGE_GAP;
  const pages = Array.from({ length: layout.pageCount }, (_, i) => i);

  return (
    <div ref={wrapRef} style={{ width: '100%', overflow: 'hidden' }}>
      <div
        style={{
          position: 'relative',
          width: PAGE_WIDTH * MM_TO_PX * scale,
          height: stackHeightMm * MM_TO_PX * scale,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: mm(PAGE_WIDTH),
            display: 'flex',
            flexDirection: 'column',
            rowGap: mm(PAGE_GAP),
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {pages.map((pageIndex) => (
            <div
              key={pageIndex}
              style={{
                position: 'relative',
                flexShrink: 0,
                width: mm(PAGE_WIDTH),
                height: mm(PAGE_HEIGHT),
                overflow: 'hidden',
                backgroundColor: PAGE_BACKGROUND,
                boxShadow: PAGE_SHADOW,
                fontFamily: FONT_FAMILY,
              }}
            >
              {layout.rules
                .filter((r) => r.page === pageIndex)
                .map((r, i) => (
                  <div
                    key={`rule-${i}`}
                    style={{
                      position: 'absolute',
                      left: mm(r.x1),
                      top: mm(r.y - RULE_THICKNESS / 2),
                      width: mm(r.x2 - r.x1),
                      height: mm(RULE_THICKNESS),
                      backgroundColor: rgb(LINE_RGB),
                    }}
                  />
                ))}

              {layout.texts
                .filter((t) => t.page === pageIndex)
                .map((t, i) => (
                  <span
                    key={`text-${i}`}
                    style={{
                      position: 'absolute',
                      left: mm(t.x),
                      top: mm(baselineToTop(t.baseline, t.fontSize)),
                      fontSize: pt(t.fontSize),
                      lineHeight: TEXT_BOX_LINE_HEIGHT_EM,
                      fontWeight: t.bold ? FONT_WEIGHT_BOLD : FONT_WEIGHT_NORMAL,
                      fontStyle: t.muted ? 'italic' : 'normal',
                      color: rgb(t.muted ? PLACEHOLDER_RGB : t.secondary ? MUTED_RGB : DARK_TEXT_RGB),
                      letterSpacing: t.spacing ? mm(t.spacing) : undefined,
                      fontKerning: t.spacing ? 'none' : undefined,
                      whiteSpace: 'pre',
                    }}
                  >
                    {t.text}
                  </span>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
