// src/components/cover-letter/components/ProfessionalPreview.tsx
// Preview of ProfessionalTemplate.ts (teal top bar, name left, contact block on the right starting on the name's line; no photo)

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  cleanText,
  cleanEmail,
  cleanPhoneNumber,
  cleanLinkedin,
  cleanLetterBody,
} from '../utils/pdfHelpers';

interface ProfessionalPreviewProps {
  letter: string;
  photo?: string | null; // ignored - this template has no photo
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

const mm = (n: number) => `${n}mm`;
const pt = (n: number) => `${n}pt`;

// ====================================================================
// PAGE
// ====================================================================
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 20;
const MARGIN_RIGHT = 15;
const MARGIN_Y = 18;
const BOTTOM_MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

// ====================================================================
// COLORS
// ====================================================================
const DARK_TEXT_RGB: [number, number, number] = [15, 15, 15];
const DARK_TEAL_RGB: [number, number, number] = [0, 51, 51];
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
// TYPOGRAPHY
// ====================================================================
const SIZE_NAME_MAX = 22;
const SIZE_NAME_MIN = 12;
const SIZE_SUBTITLE = 9.5;
const SIZE_CONTACT_VALUE = 8.5 * 1.05; // +5% (preview only)
const SIZE_DATE = 9.5;
const SIZE_RECIPIENT = 10.5;
const SIZE_COMPANY = 10;
const SIZE_SUBJECT = 10;
const SIZE_SALUTATION = 10.5;
const SIZE_BODY = 10;
const SIZE_CLOSING = 10;
const SIGNATURE_NAME_BASE_SIZE = 17.16; // size before the reduction
const SIGNATURE_NAME_REDUCE_PERCENT = 30; // total reduction
const SIZE_SIGNATURE_NAME = SIGNATURE_NAME_BASE_SIZE * (1 - SIGNATURE_NAME_REDUCE_PERCENT / 100); // SIGNATURE_NAME_SIZE

// ====================================================================
// LINE HEIGHTS
// ====================================================================
const WRAPPED_LINE_HEIGHT_PER_PT = 0.55;
const WRAPPED_LINE_HEIGHT_MULTIPLIER = 1.0;
const JSPDF_LINE_HEIGHT_FACTOR = 1.15;

// ====================================================================
// SPACING
// ====================================================================
const HEADER_TOP = 14;
const TOP_BAR_HEIGHT = 4;
const NAME_TO_SIDEBAR_GAP = 6;
const NAME_BASELINE_OFFSET = 8;
const SIDEBAR_ANCHOR_CENTER_X = PAGE_WIDTH - MARGIN_RIGHT - 14.4;
const SIDEBAR_SHIFT_RATIO = 0.2;
const SUBTITLE_OFFSET = 7;
const GAP_AFTER_HEADER = 10;
const SIDEBAR_MAX_WIDTH = 38;
const SIDEBAR_COLUMN_GAP = 8;
const SIDEBAR_EDGE_MARGIN = 8;
const SIDEBAR_LINE_ADVANCE = 3.8;
const SIDEBAR_ITEM_GAP = 4.5;
const GAP_AFTER_DATE = 7;
const GAP_AFTER_RECIPIENT = 5;
const GAP_AFTER_COMPANY = 2;
const GAP_BEFORE_SUBJECT = 5;
const SUBJECT_LINE_ADVANCE = 4.5;
const GAP_AFTER_SUBJECT = 5;
const GAP_AFTER_SALUTATION = 6;
const BODY_LINE_ADVANCE = 5;
const GAP_AFTER_PARAGRAPH = 3;
const PAGE_BREAK_SAFETY = 3;
const GAP_BEFORE_SIGNATURE = 4;
const SIGNATURE_MIN_SPACE = 20;
const GAP_AFTER_CLOSING = 7;

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
const DATE_FORMAT: Intl.DateTimeFormatOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };
const RECIPIENT_PREFIX = 'To: ';
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

const wrapParagraph = (paragraph: string, maxWidth: number, fontSize: number, bold: boolean): string[] => {
  const fits = (s: string) => textWidthMm(s, fontSize, bold) <= maxWidth;
  const lines: string[] = [];
  let current = '';

  const placeWord = (word: string) => {
    const candidate = current ? `${current} ${word}` : word;
    if (fits(candidate)) { current = candidate; return; }
    if (current) { lines.push(current); current = ''; }
    if (fits(word)) { current = word; return; }
    let piece = '';
    for (const ch of word) {
      if (piece && !fits(piece + ch)) { lines.push(piece); piece = ''; }
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
  muted?: boolean;
  charSpace?: number;
}

interface BarOp {
  page: number;
  height: number;
}

interface Layout {
  texts: TextOp[];
  bars: BarOp[];
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

const buildLayout = (input: LayoutInput): Layout => {
  const { userName, email, phoneNumber, selectedCountryCode, address, linkedin, jobTitle, company, generatedLetter } = input;

  const texts: TextOp[] = [];
  const bars: BarOp[] = [];
  let page = 0;
  let currentY = MARGIN_Y;

  const cleanHiringManager = cleanText(input.hiringManagerName || DEFAULT_HIRING_MANAGER);

  const push = (text: string, x: number, baseline: number, fontSize: number, bold: boolean, muted?: boolean, charSpace?: number) => {
    texts.push({ page, x, baseline, text, fontSize, bold, muted, charSpace });
  };

  const lineHeightOf = (fontSize: number) =>
    fontSize * WRAPPED_LINE_HEIGHT_PER_PT * WRAPPED_LINE_HEIGHT_MULTIPLIER;

  const renderWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, bold: boolean): number => {
    if (!text) return y;
    const lines = splitTextToSize(text, maxWidth, fontSize, bold);
    const lineHeight = lineHeightOf(fontSize);
    lines.forEach((line, i) => push(line, x, y + i * lineHeight, fontSize, bold));
    return y + lines.length * lineHeight;
  };

  const renderTextLines = (lines: string[], x: number, y: number, fontSize: number, bold: boolean) => {
    const step = fontSize * PT_TO_MM * JSPDF_LINE_HEIGHT_FACTOR;
    lines.forEach((line, i) => push(line, x, y + i * step, fontSize, bold));
  };

  const getRemainingSpace = () => PAGE_HEIGHT - BOTTOM_MARGIN - currentY;
  const addPage = () => { page += 1; currentY = MARGIN_Y; };
  const checkAndAddPage = (neededHeight: number): boolean => {
    if (getRemainingSpace() < neededHeight + PAGE_BREAK_SAFETY) { addPage(); return true; }
    return false;
  };

  // contact items (values only; headlines removed)
  const contactItems: { label: string; value: string }[] = [];
  if (email) { const v = cleanEmail(email); if (v) contactItems.push({ label: 'EMAIL', value: v }); }
  if (phoneNumber && selectedCountryCode) { const v = cleanPhoneNumber(phoneNumber, selectedCountryCode); if (v) contactItems.push({ label: 'PHONE', value: v }); }
  if (linkedin) { const v = cleanLinkedin(linkedin); if (v) contactItems.push({ label: 'LINKEDIN', value: v }); }
  if (address) { const v = cleanText(address); if (v) contactItems.push({ label: 'ADDRESS', value: v }); }
  const hasSidebar = contactItems.length > 0;

  const nameBaseline = HEADER_TOP + NAME_BASELINE_OFFSET; // contact block starts on this same line

  const sidebarLayout = contactItems.map((item) => {
    // Same font size for every contact value; long values wrap onto 2-3 lines
    // (wrapParagraph already splits unbroken words by character) instead of shrinking.
    const vSize = SIZE_CONTACT_VALUE;
    const vLines = splitTextToSize(item.value, SIDEBAR_MAX_WIDTH, vSize, false);
    const vWidth = Math.max(...vLines.map((l) => textWidthMm(l, vSize, false)));
    return { ...item, vSize, vLines, width: vWidth };
  });
  const sidebarW = hasSidebar ? Math.max(...sidebarLayout.map((i) => i.width)) : 0;
  // moved 20% of the block width to the right, clamped so it never overflows the page edge
  let sidebarX = SIDEBAR_ANCHOR_CENTER_X - sidebarW / 2 + sidebarW * SIDEBAR_SHIFT_RATIO;
  if (sidebarX + sidebarW > PAGE_WIDTH - SIDEBAR_EDGE_MARGIN) sidebarX = PAGE_WIDTH - SIDEBAR_EDGE_MARGIN - sidebarW;
  const sidebarBottomY = hasSidebar
    ? nameBaseline + sidebarLayout.reduce((sum, i) => sum + i.vLines.length * SIDEBAR_LINE_ADVANCE + SIDEBAR_ITEM_GAP, 0)
    : 0;

  // beside the contact block the letter is narrower; below it (or on later pages) it is full width
  const page1Width = hasSidebar ? sidebarX - SIDEBAR_COLUMN_GAP - MARGIN_X : CONTENT_WIDTH;
  const bodyWidthNow = () => (page === 0 && currentY < sidebarBottomY ? page1Width : CONTENT_WIDTH);

  // top bar (first page)
  bars.push({ page, height: TOP_BAR_HEIGHT });

  // HEADER: name + subtitle (left)
  const nameMaxW = hasSidebar ? sidebarX - NAME_TO_SIDEBAR_GAP - MARGIN_X : CONTENT_WIDTH;
  const name = cleanText(userName || DEFAULT_NAME);
  let nameSize = SIZE_NAME_MAX;
  while (textWidthMm(name, nameSize, true) > nameMaxW && nameSize > SIZE_NAME_MIN) nameSize -= 1;

  push(name, MARGIN_X, nameBaseline, nameSize, true);

  const subtitle = cleanText(jobTitle || DEFAULT_TITLE);
  const subtitleEnd = renderWrappedText(subtitle, MARGIN_X, nameBaseline + SUBTITLE_OFFSET, nameMaxW, SIZE_SUBTITLE, false);

  currentY = subtitleEnd + GAP_AFTER_HEADER;

  // CONTACT BLOCK (values share one left edge, starts on the name's line)
  if (hasSidebar) {
    let sy = nameBaseline;
    sidebarLayout.forEach((item) => {
      item.vLines.forEach((line, i) => push(line, sidebarX, sy + i * SIDEBAR_LINE_ADVANCE, item.vSize, false));
      sy += item.vLines.length * SIDEBAR_LINE_ADVANCE + SIDEBAR_ITEM_GAP;
    });
  }

  // TO block
  // With no real name, "To:" shows the company instead, so "Hiring Manager"
  // is not repeated next to "Dear Hiring Manager,".
  const hasRealHiringManagerName =
    !!(input.hiringManagerName && input.hiringManagerName.trim()) &&
    cleanHiringManager.trim().toLowerCase() !== DEFAULT_HIRING_MANAGER.toLowerCase();
  const toCompany = company ? cleanText(company) : '';
  const toLine = hasRealHiringManagerName ? cleanHiringManager : toCompany;

  if (toLine) {
    push(`${RECIPIENT_PREFIX}${toLine}`, MARGIN_X, currentY, SIZE_RECIPIENT, true);
    currentY += GAP_AFTER_RECIPIENT;
  }

  if (hasRealHiringManagerName && toCompany) {
    const companyY = renderWrappedText(toCompany, MARGIN_X, currentY, page1Width, SIZE_COMPANY, false);
    currentY = companyY + GAP_AFTER_COMPANY;
  }
  currentY += GAP_BEFORE_SUBJECT;

  // DATE (left)
  const today = new Date().toLocaleDateString(DATE_LOCALE, DATE_FORMAT);
  push(today, MARGIN_X, currentY, SIZE_DATE, false);
  currentY += GAP_AFTER_DATE;

  // SUBJECT (bold)
  const subject = `${SUBJECT_PREFIX}${cleanText(jobTitle || DEFAULT_SUBJECT_POSITION)}`;
  const wrappedSubject = splitTextToSize(subject, page1Width, SIZE_SUBJECT, true);
  renderTextLines(wrappedSubject, MARGIN_X, currentY, SIZE_SUBJECT, true);
  currentY += wrappedSubject.length * SUBJECT_LINE_ADVANCE + GAP_AFTER_SUBJECT;

  // SALUTATION (normal)
  push(`${SALUTATION_PREFIX}${cleanHiringManager}${SALUTATION_SUFFIX}`, MARGIN_X, currentY, SIZE_SALUTATION, false);
  currentY += GAP_AFTER_SALUTATION;

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

    let lines = splitTextToSize(trimmed, bodyWidthNow(), SIZE_BODY, false);
    if (checkAndAddPage(lines.length * BODY_LINE_ADVANCE + GAP_AFTER_PARAGRAPH)) {
      // moved to a new page -> full width there
      lines = splitTextToSize(trimmed, bodyWidthNow(), SIZE_BODY, false);
    }
    renderTextLines(lines, MARGIN_X, currentY, SIZE_BODY, false);
    currentY += lines.length * BODY_LINE_ADVANCE + GAP_AFTER_PARAGRAPH;
    drewAnyParagraph = true;
  });

  if (!drewAnyParagraph) {
    push(PLACEHOLDER_TEXT, MARGIN_X, currentY, SIZE_BODY, false, true);
  }

  currentY += GAP_BEFORE_SIGNATURE;
  if (getRemainingSpace() < SIGNATURE_MIN_SPACE) addPage();

  push(CLOSING_TEXT, MARGIN_X, currentY, SIZE_CLOSING, false);
  currentY += GAP_AFTER_CLOSING;

  renderWrappedText(cleanText(userName || DEFAULT_NAME), MARGIN_X - 0.5, currentY + 1, CONTENT_WIDTH, SIZE_SIGNATURE_NAME, false);

  return { texts, bars, pageCount: page + 1 };
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
export const ProfessionalPreview = ({
  letter, name, title, email, phone, countryCode, userAddress, linkedinUrl, companyName, hiringManagerName,
}: ProfessionalPreviewProps) => {
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
      <div style={{ position: 'relative', width: PAGE_WIDTH * MM_TO_PX * scale, height: stackHeightMm * MM_TO_PX * scale, margin: '0 auto' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: mm(PAGE_WIDTH), display: 'flex', flexDirection: 'column', rowGap: mm(PAGE_GAP), transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {pages.map((pageIndex) => (
            <div key={pageIndex} style={{ position: 'relative', flexShrink: 0, width: mm(PAGE_WIDTH), height: mm(PAGE_HEIGHT), overflow: 'hidden', backgroundColor: PAGE_BACKGROUND, boxShadow: PAGE_SHADOW, fontFamily: FONT_FAMILY }}>
              {layout.bars.filter((b) => b.page === pageIndex).map((b, i) => (
                <div key={`bar-${i}`} style={{ position: 'absolute', left: 0, top: 0, width: mm(PAGE_WIDTH), height: mm(b.height), backgroundColor: rgb(DARK_TEAL_RGB) }} />
              ))}

              {layout.texts.filter((t) => t.page === pageIndex).map((t, i) => (
                <span key={`text-${i}`} style={{ position: 'absolute', left: mm(t.x), top: mm(baselineToTop(t.baseline, t.fontSize)), fontSize: pt(t.fontSize), lineHeight: TEXT_BOX_LINE_HEIGHT_EM, fontWeight: t.bold ? FONT_WEIGHT_BOLD : FONT_WEIGHT_NORMAL, fontStyle: t.muted ? 'italic' : 'normal', color: rgb(t.muted ? PLACEHOLDER_RGB : DARK_TEXT_RGB), whiteSpace: 'pre', letterSpacing: t.charSpace ? mm(t.charSpace) : undefined }}>
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