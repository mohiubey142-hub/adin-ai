// src/components/cover-letter/components/ModernPreview.tsx
// ------------------------------------------------------------------
// Live preview that mirrors ModernTemplate.ts (the jsPDF generator).
// Header = dark band + photo + white name/title + contact line (no dividers).
//
// HOW IT STAYS IDENTICAL TO THE PDF
//  1. The PDF's layout algorithm is ported 1:1 into buildLayout(): same
//     Y cursor, same header nudges, same body line pitch, same
//     compress / extend-page / add-page rules, same signature block.
//     It outputs every text line with its page, anchor x and BASELINE
//     (mm) - exactly what jsPDF receives.
//  2. Text is wrapped with the same greedy rule as pdf.splitTextToSize,
//     measured with real font metrics (canvas), so line breaks match.
//  3. Each line is drawn on an A4 sheet at that exact position, in CSS
//     mm / pt units (the PDF's own units).
//  4. The text clean-up (cleanText, cleanEmail, cleanLetterBody, ...)
//     is the SAME helper set the PDF uses, imported from pdfHelpers.
//
// No loose numbers: every value below is a named constant that points
// to the line of ModernTemplate.ts it comes from. If you change a value
// in ModernTemplate.ts, change the same constant here.
// ------------------------------------------------------------------

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  cleanText,
  cleanEmail,
  cleanPhoneNumber,
  cleanLinkedin,
  cleanLetterBody,
} from '../utils/pdfHelpers';

interface ModernPreviewProps {
  letter: string;
  photo: string | null;
  name: string;
  title: string;
  email: string;
  phone: string;
  countryCode: string;
  userAddress: string;
  linkedinUrl: string;
  companyName: string;
  hiringManagerName?: string;
  // Same two options the PDF reads from its data object (both optional)
  preferredFont?: string;
  showBulletPoints?: boolean;
}

// ====================================================================
// UNITS
// ====================================================================
const MM_PER_INCH = 25.4;
const PT_PER_INCH = 72; // jsPDF font sizes are in pt
const CSS_PX_PER_INCH = 96;
const PT_TO_MM = MM_PER_INCH / PT_PER_INCH;
const MM_TO_PX = CSS_PX_PER_INCH / MM_PER_INCH;

const mm = (n: number) => `${n}mm`;
const pt = (n: number) => `${n}pt`;

// ====================================================================
// PAGE (jsPDF: unit 'mm', format 'a4', portrait)
// ====================================================================
const PAGE_WIDTH = 210;
const BASE_PAGE_HEIGHT = 297; // BASE_PAGE_HEIGHT
const MARGIN_X = 22; // marginX
const TOP_MARGIN = 6; // TOP_MARGIN
const BOTTOM_MARGIN = 22; // BOTTOM_MARGIN
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2; // MAX_TEXT_WIDTH

// ====================================================================
// COLORS (RGB triplets exactly as passed to jsPDF)
// ====================================================================
type Rgb = [number, number, number];
const DARK_RGB: Rgb = [31, 41, 55]; // DARK_COLOR
const LIGHT_GRAY_RGB: Rgb = [156, 163, 175]; // LIGHT_GRAY
const HEADER_BACKGROUND_RGB: Rgb = [13, 43, 43]; // HEADER_BACKGROUND_COLOR
const HEADER_NAME_RGB: Rgb = [255, 255, 255]; // HEADER_NAME_COLOR
const HEADER_TITLE_RGB: Rgb = [255, 255, 255]; // HEADER_TITLE_COLOR
const HEADER_CONTACT_RGB: Rgb = [200, 220, 220]; // HEADER_CONTACT_COLOR
const PLACEHOLDER_RGB: Rgb = LIGHT_GRAY_RGB; // preview-only empty state
const PAGE_BACKGROUND = '#ffffff';
const PAGE_SHADOW = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; // preview-only sheet shadow

const rgb = ([r, g, b]: Rgb) => `rgb(${r}, ${g}, ${b})`;

// ====================================================================
// FONTS (FONT_CHOICES in the template; metrics = ascent/descent in em)
// ====================================================================
type PdfFont = 'helvetica' | 'times' | 'courier';

const FONT_CHOICES: Record<string, PdfFont> = {
  Helvetica: 'helvetica',
  Times: 'times',
  Courier: 'courier',
  'Helvetica-Bold': 'helvetica',
  'Times-Bold': 'times',
};
const DEFAULT_FONT_CHOICE = 'Helvetica';
const DEFAULT_PDF_FONT: PdfFont = 'helvetica';

const FONT_CSS: Record<PdfFont, { family: string; ascent: number; descent: number }> = {
  helvetica: { family: 'Helvetica, Arial, "Liberation Sans", sans-serif', ascent: 0.905, descent: 0.212 },
  times: { family: '"Times New Roman", Times, "Liberation Serif", serif', ascent: 0.891, descent: 0.216 },
  courier: { family: '"Courier New", Courier, "Liberation Mono", monospace', ascent: 0.833, descent: 0.3 },
};

const FONT_WEIGHT_BOLD = 'bold';
const FONT_WEIGHT_NORMAL = 'normal';
const TEXT_BOX_LINE_HEIGHT_EM = 1; // every drawn line gets a box of exactly 1em
const MEASURE_REFERENCE_PX = 100; // text is measured at this size and scaled

// ====================================================================
// TYPOGRAPHY (pt)
// ====================================================================
const SIZE_DATE = 9.5;
const SIZE_RECIPIENT = 10.5;
const SIZE_COMPANY = 10;
const SIZE_SUBJECT = 10;
const SIZE_SALUTATION = 10.5;
const SIZE_BODY = 10.5;
const SINCERELY_BASE_FONT_SIZE = 10; // SINCERELY_BASE_FONT_SIZE
const SINCERELY_FONT_SIZE_INCREASE = 0.15; // SINCERELY_FONT_SIZE_INCREASE
const SIZE_SINCERELY = SINCERELY_BASE_FONT_SIZE * (1 + SINCERELY_FONT_SIZE_INCREASE);
const SIGNATURE_NAME_BASE_FONT_SIZE = 14 * 1.3; // SIGNATURE_NAME_BASE_FONT_SIZE
const SIGNATURE_NAME_FONT_SIZE_DECREASE = 0.3; // SIGNATURE_NAME_FONT_SIZE_DECREASE (30% total)
const SIZE_SIGNATURE_NAME = SIGNATURE_NAME_BASE_FONT_SIZE * (1 - SIGNATURE_NAME_FONT_SIZE_DECREASE);

// renderCentered/LeftWrappedText: lineHeight (mm) = fontSize * 0.55
const WRAPPED_LINE_HEIGHT_PER_PT = 0.55;

// ====================================================================
// HEADER (band + photo + name/title/contact) - same values as the template
// ====================================================================
const SIZE_NAME = 22; // NAME_FONT_SIZE
const SIZE_TITLE = 13; // TITLE_FONT_SIZE
const SIZE_CONTACT = 9.5; // CONTACT_FONT_SIZE
const HEADER_PHOTO_SIZE_PT = 83; // HEADER_PHOTO_SIZE_PT
const PHOTO_TO_TEXT_GAP_PT = 15; // PHOTO_TO_TEXT_GAP_PT
const NAME_TO_TITLE_GAP_PT = 6; // NAME_TO_TITLE_GAP_PT
const PHOTO_SIZE = HEADER_PHOTO_SIZE_PT * PT_TO_MM; // photoSize
const PHOTO_TO_TEXT_GAP = PHOTO_TO_TEXT_GAP_PT * PT_TO_MM; // PHOTO_TO_TEXT_GAP
const NAME_TO_TITLE_GAP = NAME_TO_TITLE_GAP_PT * PT_TO_MM; // NAME_TO_TITLE_GAP
const HEADER_ASCENT_RATIO = 0.718; // HEADER_ASCENT_RATIO
const HEADER_DESCENT_RATIO = 0.207; // HEADER_DESCENT_RATIO
const HEADER_LINE_HEIGHT_FACTOR = 0.55; // HEADER_LINE_HEIGHT_FACTOR
const HEADER_TOP_OFFSET_BASE = 4; // HEADER_TOP_OFFSET_BASE
const HEADER_TOP_REDUCTION = 1; // HEADER_TOP_REDUCTION (whole header moves up, band gets shorter)
const HEADER_TOP_OFFSET = HEADER_TOP_OFFSET_BASE - HEADER_TOP_REDUCTION; // HEADER_TOP_OFFSET
const NAME_TITLE_EXTRA_DOWN = 1; // NAME_TITLE_EXTRA_DOWN (name + job title only)
const HEADER_CONTENT_TO_BAND_EDGE_GAP = 4; // HEADER_CONTENT_TO_BAND_EDGE_GAP
const HEADER_CONTENT_TO_BAND_EDGE_EXTRA_GAP = 1; // HEADER_CONTENT_TO_BAND_EDGE_EXTRA_GAP
const HEADER_BAND_TO_DATE_GAP = 5.5; // HEADER_BAND_TO_DATE_GAP
const CONTACT_EXTRA_RIGHT = 0.5; // CONTACT_EXTRA_RIGHT (contact line only)

// ====================================================================
// DATE (mm)
// ====================================================================
const DATE_BASELINE_PULL_UP = 1.5; // currentY - 1.5
const GAP_AFTER_DATE = 4.5;

// ====================================================================
// RECIPIENT / SUBJECT / SALUTATION (mm)
// ====================================================================
const GAP_AFTER_RECIPIENT = 1.5;
const GAP_AFTER_COMPANY = 1.5;
const GAP_BEFORE_SUBJECT = 1;
const GAP_AFTER_SUBJECT = 3;
const GAP_AFTER_SALUTATION = 4;

// ====================================================================
// BODY + PAGE-FIT ENGINE (mm)
// ====================================================================
const BODY_LINE_PITCH = 5.5; // lines * 5.5
const GAP_AFTER_PARAGRAPH = 2.5;
const PARAGRAPH_NEEDED_PAD = 3; // neededHeight = lines * 5.5 + 3
const NORMAL_SECTION_SAFETY = 3; // requiredSpace pad (normal paragraph)
const LAST_SECTION_SAFETY = 8; // requiredSpace pad (signature section)
const COMPRESS_MAX = 2; // Math.min(2, ...)
const COMPRESS_PAD = 2; // ... + 2
const COMPRESS_ACCEPT_SLACK = 2; // requiredSpace - 2
const EXTEND_MAX = 4; // Math.min(4, ...)
const EXTEND_PAD = 3; // ... + 3 (paragraph)
const BULLET_INDENT = 2; // xOffset for bullet lines

// ====================================================================
// SIGNATURE (mm)
// ====================================================================
const GAP_BEFORE_SIGNATURE = 2.5;
const SIGNATURE_NEEDED = 35; // signatureNeeded
const SIGNATURE_COMPRESS_PAD = 5; // compressionNeeded = needed - remaining + 5
const SIGNATURE_COMPRESS_ONLY_LIMIT = 3; // compressionNeeded <= 3
const SIGNATURE_EXTEND_PAD = 2; // Math.min(4, compressionNeeded + 2)
const SINCERELY_PRE_GAP = 2; // signatureBlockBaseline + 2
const SINCERELY_EXTRA_DOWN = 3; // SINCERELY_EXTRA_DOWN
const SINCERELY_EXTRA_RIGHT = 1; // SINCERELY_EXTRA_RIGHT
const SINCERELY_POST_GAP = 1.5; // sincerelyY - extra + 1.5
const SIGNATURE_NAME_PRE_GAP = 2; // sincerelyBlockEndY + 2
const SIGNATURE_NAME_EXTRA_DOWN = 2; // SIGNATURE_NAME_EXTRA_DOWN

// ====================================================================
// TEXT CONSTANTS (same literals the PDF uses)
// ====================================================================
const DEFAULT_NAME = 'Your Name';
const DEFAULT_TITLE = 'Job Title';
const DEFAULT_HIRING_MANAGER = 'Hiring Manager';
const SUBJECT_PREFIX = 'RE: Application for ';
const SALUTATION_PREFIX = 'Dear ';
const SALUTATION_SUFFIX = ',';
const CLOSING_TEXT = 'Sincerely,';
const BULLET_MARKER = '\u2022';
const CONTACT_SEPARATOR = ' '.repeat(5); // contactParts.join('     ')
const PHOTO_DATA_PREFIX = 'data:image';
const DATE_LOCALE = 'en-US';
const DATE_FORMAT: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
const PLACEHOLDER_TEXT = 'No content yet. Generate your letter to see the preview.';

// Patterns / filters the PDF applies to the letter body
const DATE_ONLY_PATTERN = /^\w+ \d{1,2}, \d{4}$/;
const SUBJECT_MARKERS = ['RE:', 'Application for'];
const DEAR_HIRING_MANAGER = 'dear hiring manager';
const DEAR_PREFIX = 'dear ';
const EMAIL_MARK = '@';
const EMAIL_LINE_EXCLUDES = ['dear', 'sincerely'];
const EMAIL_LINE_MAX_WORDS = 10;
const SIGNATURE_WORDS = ['sincerely', 'thank you', 'regards'];
const PARAGRAPH_SPLIT = /\n\n+/;
const LINE_BREAK_PATTERN = /\r\n|\r|\n/;
const BULLET_LINE_PATTERN = /^[\u2022\-*]\s/m;
const NUMBERED_LINE_PATTERN = /^\d+\.\s/m;
const BULLET_PARSE_PATTERN = /^([\u2022\-*]|\d+\.)\s+(.*)/;
const BULLET_START_CHARS = ['\u2022', '-', '*'];
const UPPERCASE_START = /^[A-Z]/;
const SECTION_COLON = ':';

// ====================================================================
// PREVIEW SHEET (screen only)
// ====================================================================
const PAGE_GAP = 4; // mm between two sheets on screen
const MAX_SCALE = 1; // never enlarge above real size

// ====================================================================
// PDF TEXT SANITIZER (same rules as sanitizeTextForPdf in the template)
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
// TEXT MEASURING + WRAPPING (mirrors pdf.splitTextToSize)
// ====================================================================
let measureContext: CanvasRenderingContext2D | null = null;
const getMeasureContext = (): CanvasRenderingContext2D | null => {
  if (!measureContext && typeof document !== 'undefined') {
    measureContext = document.createElement('canvas').getContext('2d');
  }
  return measureContext;
};

const textWidthMm = (text: string, fontSize: number, bold: boolean, font: PdfFont): number => {
  const ctx = getMeasureContext();
  if (!ctx) return 0;
  ctx.font = `${bold ? FONT_WEIGHT_BOLD : FONT_WEIGHT_NORMAL} ${MEASURE_REFERENCE_PX}px ${FONT_CSS[font].family}`;
  return (ctx.measureText(text).width / MEASURE_REFERENCE_PX) * fontSize * PT_TO_MM;
};

const wrapParagraph = (paragraph: string, maxWidth: number, fontSize: number, bold: boolean, font: PdfFont): string[] => {
  const fits = (s: string) => textWidthMm(s, fontSize, bold, font) <= maxWidth;
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
    // very long word: split by characters
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

const splitTextToSize = (text: string, maxWidth: number, fontSize: number, bold: boolean, font: PdfFont): string[] =>
  text.split(LINE_BREAK_PATTERN).flatMap((p) => wrapParagraph(p, maxWidth, fontSize, bold, font));

// ====================================================================
// LAYOUT-ENGINE HELPERS PORTED FROM THE TEMPLATE
// ====================================================================
// optimizeSpacing(): drops blank lines that are not real section breaks
const optimizeSpacing = (content: string): string => {
  const lines = content.split('\n');
  const optimizedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === '' && i > 0 && i < lines.length - 1) {
      const prevLine = lines[i - 1];
      const nextNonEmpty = lines.slice(i + 1).find((l) => l.trim() !== '');

      if (prevLine.trim() !== '' && nextNonEmpty && nextNonEmpty.trim() !== '') {
        const isSectionBreak =
          UPPERCASE_START.test(prevLine) &&
          UPPERCASE_START.test(nextNonEmpty) &&
          !prevLine.includes(SECTION_COLON) &&
          !nextNonEmpty.includes(SECTION_COLON);

        if (isSectionBreak) optimizedLines.push(line);
        continue;
      }
    }
    optimizedLines.push(line);
  }
  return optimizedLines.join('\n');
};

// formatBulletPoints(): normalises every bullet / numbered line to "• text"
const formatBulletPoints = (text: string, showBulletPoints: boolean | undefined): string[] =>
  text.split('\n').map((line) => {
    const trimmed = line.trim();
    const bulletMatch = trimmed.match(BULLET_PARSE_PATTERN);
    if (bulletMatch && showBulletPoints !== false) return `${BULLET_MARKER} ${bulletMatch[2]}`;
    return trimmed;
  });

// ====================================================================
// LAYOUT (the port of ModernTemplate.render)
// ====================================================================
type Align = 'left' | 'center' | 'right';

interface TextOp {
  page: number;
  x: number; // anchor x (mm): left edge, centre or right edge, see `align`
  baseline: number; // mm from page top
  text: string;
  fontSize: number; // pt
  bold: boolean;
  color: Rgb;
  align: Align;
  muted?: boolean;
}

interface BandOp {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: Rgb;
}

interface PhotoOp {
  x: number;
  y: number;
  size: number;
}

interface Layout {
  texts: TextOp[];
  bands: BandOp[];
  photo: PhotoOp | null;
  pageHeights: number[];
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
  hasPhoto: boolean;
  hiringManagerName: string;
  font: PdfFont;
  showBulletPoints: boolean | undefined;
}

const buildLayout = (input: LayoutInput): Layout => {
  const { userName, email, phoneNumber, selectedCountryCode, address, linkedin, jobTitle, company, generatedLetter, hasPhoto, font, showBulletPoints } =
    input;

  const texts: TextOp[] = [];
  const bands: BandOp[] = [];
  let photo: PhotoOp | null = null;
  let page = 0;
  let currentY = TOP_MARGIN;

  // pageHeight is a document-wide variable in the PDF; setHeight() resizes the current sheet
  let pageHeight = BASE_PAGE_HEIGHT;
  let pageExtended = false;
  const pageHeights: number[] = [BASE_PAGE_HEIGHT];

  // ---- clean data (same as the PDF) ---------------------------------------
  const cleanName = cleanText(userName || DEFAULT_NAME);
  const cleanTitle = cleanText(jobTitle || DEFAULT_TITLE);
  const cleanCompany = cleanText(company || '');
  const cleanHiringManager = cleanText(input.hiringManagerName || DEFAULT_HIRING_MANAGER);

  const split = (text: string, maxWidth: number, fontSize: number, bold: boolean) =>
    splitTextToSize(text, maxWidth, fontSize, bold, font);

  // ---- drawing primitives -------------------------------------------------
  const push = (text: string, x: number, baseline: number, fontSize: number, bold: boolean, color: Rgb, align: Align, muted?: boolean) => {
    texts.push({ page, x, baseline, text, fontSize, bold, color, align, muted });
  };

  // renderLeftWrappedText()
  const renderLeftWrappedText = (text: string, x: number, y: number, fontSize: number, bold: boolean, color: Rgb, maxWidth: number): number => {
    if (!text) return y;
    const lines = split(text, maxWidth, fontSize, bold);
    const lineHeight = fontSize * WRAPPED_LINE_HEIGHT_PER_PT;
    lines.forEach((line, i) => push(line, x, y + i * lineHeight, fontSize, bold, color, 'left'));
    return y + lines.length * lineHeight;
  };

  const drawBand = (x: number, y: number, width: number, height: number, color: Rgb) => {
    bands.push({ page, x, y, width, height, color });
  };

  const setPageHeight = (value: number) => {
    pageHeight = value;
    pageHeights[page] = value;
  };

  const getRemainingSpace = () => pageHeight - BOTTOM_MARGIN - currentY;

  // checkAndAddPageLocal(): may nudge the cursor up, stretch the sheet, or add a page
  const checkAndAddPageLocal = (neededHeight: number, isLastSection: boolean) => {
    const remaining = getRemainingSpace();
    const requiredSpace = neededHeight + (isLastSection ? LAST_SECTION_SAFETY : NORMAL_SECTION_SAFETY);

    if (remaining < requiredSpace) {
      if (!pageExtended && isLastSection) {
        const compressionAmount = Math.min(COMPRESS_MAX, requiredSpace - remaining + COMPRESS_PAD);
        currentY -= compressionAmount;
        if (getRemainingSpace() >= requiredSpace - COMPRESS_ACCEPT_SLACK) return;
      }

      if (!pageExtended && isLastSection) {
        const extendAmount = Math.min(EXTEND_MAX, requiredSpace - remaining + EXTEND_PAD);
        setPageHeight(pageHeight + extendAmount);
        pageExtended = true;
        return;
      }

      page += 1;
      pageHeights[page] = BASE_PAGE_HEIGHT;
      currentY = TOP_MARGIN;
    }
  };

  // ---- contact items (order: email, phone, linkedin, address) -------------
  const contactItems: string[] = [];
  if (email) {
    const v = cleanEmail(email);
    if (v) contactItems.push(`Email: ${v}`);
  }
  if (phoneNumber && selectedCountryCode) {
    const v = cleanPhoneNumber(phoneNumber, selectedCountryCode);
    if (v) contactItems.push(`Phone: ${v}`);
  }
  if (linkedin) {
    const v = cleanLinkedin(linkedin);
    if (v) contactItems.push(`LinkedIn: ${v}`);
  }
  if (address) {
    const v = cleanText(address);
    if (v) contactItems.push(`Address: ${v}`);
  }

  // ---- 1-5. HEADER: dark band, photo beside white Name + Title, contact line below ----
  const headerStartY = currentY + HEADER_TOP_OFFSET;
  const headerTextX = hasPhoto ? MARGIN_X + PHOTO_SIZE + PHOTO_TO_TEXT_GAP : MARGIN_X;
  const headerTextW = PAGE_WIDTH - headerTextX - MARGIN_X;
  const headerName = cleanName;

  // contact items flow across the text column, never cut mid-item
  const contactLines: string[] = [];
  let currentContactLine = '';
  contactItems.forEach((item) => {
    const candidate = currentContactLine ? `${currentContactLine}${CONTACT_SEPARATOR}${item}` : item;
    if (!currentContactLine || textWidthMm(candidate, SIZE_CONTACT, false, font) <= headerTextW) {
      currentContactLine = candidate;
    } else {
      contactLines.push(currentContactLine);
      currentContactLine = item;
    }
  });
  if (currentContactLine) contactLines.push(currentContactLine);
  const contactText = contactLines.join('\n');

  const measureLineCount = (text: string, fontSize: number): number =>
    text ? split(text, headerTextW, fontSize, false).length : 0;

  const nameLineCount = measureLineCount(headerName, SIZE_NAME);
  const titleLineCount = measureLineCount(cleanTitle, SIZE_TITLE);
  const contactLineCount = measureLineCount(contactText, SIZE_CONTACT);

  const nameAscent = SIZE_NAME * HEADER_ASCENT_RATIO * PT_TO_MM;
  const nameAdvance = SIZE_NAME * PT_TO_MM;
  const nameLineHeight = SIZE_NAME * HEADER_LINE_HEIGHT_FACTOR;
  const titleAscent = SIZE_TITLE * HEADER_ASCENT_RATIO * PT_TO_MM;
  const titleLineHeight = SIZE_TITLE * HEADER_LINE_HEIGHT_FACTOR;
  const titleDescent = SIZE_TITLE * HEADER_DESCENT_RATIO * PT_TO_MM;
  const contactAscent = SIZE_CONTACT * HEADER_ASCENT_RATIO * PT_TO_MM;
  const contactDescent = SIZE_CONTACT * HEADER_DESCENT_RATIO * PT_TO_MM;
  const contactLineHeight = SIZE_CONTACT * HEADER_LINE_HEIGHT_FACTOR;

  // one visible gap: name -> title; title -> contact reuses the same value
  const headerLineGap = nameAdvance + NAME_TO_TITLE_GAP - titleAscent;

  // block measured relative to the name's first baseline
  const titleBaselineRel = (nameLineCount - 1) * nameLineHeight + nameAdvance + NAME_TO_TITLE_GAP;
  const titleLastBaselineRel = titleBaselineRel + (titleLineCount - 1) * titleLineHeight;
  const contactBaselineRel = titleLastBaselineRel + headerLineGap + contactAscent;
  const blockTopRel = -nameAscent;
  const blockBottomRel =
    contactLineCount > 0
      ? contactBaselineRel + (contactLineCount - 1) * contactLineHeight + contactDescent
      : titleLastBaselineRel + titleDescent;
  const textBlockHeight = blockBottomRel - blockTopRel;

  // same start position with or without a photo (text centered against the reserved photo area)
  const textBlockTopY = headerStartY + Math.max(0, (PHOTO_SIZE - textBlockHeight) / 2);
  const nameBaselineY = textBlockTopY - blockTopRel;
  const titleBaselineY = nameBaselineY + titleBaselineRel;
  const contactBaselineY = nameBaselineY + contactBaselineRel;
  const textBlockBottomY = textBlockTopY + textBlockHeight;

  const photoBottomY = headerStartY + PHOTO_SIZE;
  const headerContentBottomY = Math.max(photoBottomY, textBlockBottomY);
  const headerBandBottomY =
    headerContentBottomY + HEADER_CONTENT_TO_BAND_EDGE_GAP + HEADER_CONTENT_TO_BAND_EDGE_EXTRA_GAP;

  // band first, so photo + text land on top of it
  drawBand(0, 0, PAGE_WIDTH, headerBandBottomY, HEADER_BACKGROUND_RGB);

  if (hasPhoto) {
    photo = { x: MARGIN_X, y: headerStartY, size: PHOTO_SIZE };
  }

  renderLeftWrappedText(headerName, headerTextX, nameBaselineY + NAME_TITLE_EXTRA_DOWN, SIZE_NAME, false, HEADER_NAME_RGB, headerTextW);
  renderLeftWrappedText(cleanTitle, headerTextX, titleBaselineY + NAME_TITLE_EXTRA_DOWN, SIZE_TITLE, false, HEADER_TITLE_RGB, headerTextW);
  if (contactText) {
    renderLeftWrappedText(
      contactText,
      headerTextX + CONTACT_EXTRA_RIGHT,
      contactBaselineY,
      SIZE_CONTACT,
      false,
      HEADER_CONTACT_RGB,
      headerTextW
    );
  }

  currentY = headerBandBottomY + HEADER_BAND_TO_DATE_GAP;

  // ---- 6. DATE (right aligned) --------------------------------------------
  const today = new Date().toLocaleDateString(DATE_LOCALE, DATE_FORMAT);
  push(today, PAGE_WIDTH - MARGIN_X, currentY - DATE_BASELINE_PULL_UP, SIZE_DATE, false, DARK_RGB, 'right');
  currentY += GAP_AFTER_DATE;

  // ---- 7. RECIPIENT, COMPANY, SUBJECT -------------------------------------
  // Show the name line only when a real name was given. With no name, the
  // recipient block starts with the company and the salutation stays
  // "Dear Hiring Manager," (no duplicate "Hiring Manager" line).
  const hasRealHiringManagerName =
    !!(input.hiringManagerName && input.hiringManagerName.trim()) &&
    cleanHiringManager.trim().toLowerCase() !== DEFAULT_HIRING_MANAGER.toLowerCase();

  if (hasRealHiringManagerName) {
    const hiringManagerY = renderLeftWrappedText(cleanHiringManager, MARGIN_X, currentY, SIZE_RECIPIENT, true, DARK_RGB, CONTENT_WIDTH);
    currentY = hiringManagerY + GAP_AFTER_RECIPIENT;
  }

  if (cleanCompany) {
    const companyY = renderLeftWrappedText(cleanCompany, MARGIN_X, currentY, SIZE_COMPANY, false, DARK_RGB, CONTENT_WIDTH);
    currentY = companyY + GAP_AFTER_COMPANY;
  }
  currentY += GAP_BEFORE_SUBJECT;

  const subject = `${SUBJECT_PREFIX}${cleanTitle}`;
  const subjectY = renderLeftWrappedText(subject, MARGIN_X, currentY, SIZE_SUBJECT, false, DARK_RGB, CONTENT_WIDTH);
  currentY = subjectY + GAP_AFTER_SUBJECT;

  // ---- 8. SALUTATION -------------------------------------------------------
  const salutationY = renderLeftWrappedText(
    `${SALUTATION_PREFIX}${cleanHiringManager}${SALUTATION_SUFFIX}`,
    MARGIN_X,
    currentY,
    SIZE_SALUTATION,
    true,
    DARK_RGB,
    CONTENT_WIDTH
  );
  currentY = salutationY + GAP_AFTER_SALUTATION;

  // ---- 9. LETTER BODY ------------------------------------------------------
  let cleanLetter = cleanLetterBody(generatedLetter, cleanHiringManager).replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // analyzeContent(): does any paragraph contain bullet / numbered lines?
  const analysisParagraphs = cleanLetterBody(cleanLetter, cleanHiringManager)
    .split(PARAGRAPH_SPLIT)
    .filter((p) => p.trim() !== '');
  const hasBulletPoints = analysisParagraphs.some((p) => BULLET_LINE_PATTERN.test(p) || NUMBERED_LINE_PATTERN.test(p));

  cleanLetter = optimizeSpacing(cleanLetter);
  const paragraphs = cleanLetter.split(PARAGRAPH_SPLIT);
  let drewAnyParagraph = false;

  paragraphs.forEach((paragraph, pIndex) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return;

    // same skip rules as the PDF
    const lower = trimmed.toLowerCase();
    if (DATE_ONLY_PATTERN.test(trimmed)) return;
    if (trimmed === DEFAULT_HIRING_MANAGER) return;
    if (trimmed === cleanHiringManager) return;
    if (SUBJECT_MARKERS.some((m) => trimmed.includes(m))) return;
    if (trimmed === cleanCompany) return;
    if (trimmed === cleanName) return;
    if (trimmed === cleanTitle) return;
    if (lower.includes(DEAR_HIRING_MANAGER)) return;
    if (lower.startsWith(DEAR_PREFIX)) return;
    if (trimmed.startsWith(DEFAULT_HIRING_MANAGER)) return;
    if (
      trimmed.includes(EMAIL_MARK) &&
      !EMAIL_LINE_EXCLUDES.some((w) => lower.includes(w)) &&
      trimmed.split(' ').length < EMAIL_LINE_MAX_WORDS
    ) {
      return;
    }

    const isLastParagraph = pIndex === paragraphs.length - 1;
    const isSignatureSection = isLastParagraph || SIGNATURE_WORDS.some((w) => lower.includes(w));

    let formattedText = trimmed;
    if (hasBulletPoints && showBulletPoints !== false) {
      formattedText = formatBulletPoints(trimmed, showBulletPoints).join('\n');
    }

    const estimatedLines = split(formattedText, CONTENT_WIDTH, SIZE_BODY, false);
    checkAndAddPageLocal(estimatedLines.length * BODY_LINE_PITCH + PARAGRAPH_NEEDED_PAD, isSignatureSection);

    const wrappedLines = split(formattedText, CONTENT_WIDTH, SIZE_BODY, false);
    wrappedLines.forEach((line, i) => {
      const lineTrimmed = line.trim();
      const isBullet = BULLET_START_CHARS.some((c) => lineTrimmed.startsWith(c));
      const xOffset = isBullet ? BULLET_INDENT : 0;
      push(line, MARGIN_X + xOffset, currentY + i * BODY_LINE_PITCH, SIZE_BODY, false, DARK_RGB, 'left');
    });

    currentY += wrappedLines.length * BODY_LINE_PITCH + GAP_AFTER_PARAGRAPH;
    drewAnyParagraph = true;
  });

  // preview-only empty state (does not move the cursor)
  if (!drewAnyParagraph) {
    push(PLACEHOLDER_TEXT, MARGIN_X, currentY, SIZE_BODY, false, PLACEHOLDER_RGB, 'left', true);
  }

  // ---- 10. SIGNATURE -------------------------------------------------------
  currentY += GAP_BEFORE_SIGNATURE;

  const remainingAfterBody = getRemainingSpace();
  if (remainingAfterBody < SIGNATURE_NEEDED && !pageExtended) {
    const compressionNeeded = SIGNATURE_NEEDED - remainingAfterBody + SIGNATURE_COMPRESS_PAD;
    if (compressionNeeded <= SIGNATURE_COMPRESS_ONLY_LIMIT) {
      currentY -= compressionNeeded;
    } else {
      const extendAmount = Math.min(EXTEND_MAX, compressionNeeded + SIGNATURE_EXTEND_PAD);
      setPageHeight(pageHeight + extendAmount);
      pageExtended = true;
    }
  }

  // no divider above the signature: the block starts right where the body ends
  const signatureBlockBaseline = currentY;

  const sincerelyBaseY = signatureBlockBaseline + SINCERELY_PRE_GAP;
  const sincerelyY = renderLeftWrappedText(
    CLOSING_TEXT,
    MARGIN_X + SINCERELY_EXTRA_RIGHT,
    sincerelyBaseY + SINCERELY_EXTRA_DOWN,
    SIZE_SINCERELY,
    false,
    DARK_RGB,
    CONTENT_WIDTH
  );
  const sincerelyBlockEndY = sincerelyY - SINCERELY_EXTRA_DOWN + SINCERELY_POST_GAP;

  const sigNameBaseY = sincerelyBlockEndY + SIGNATURE_NAME_PRE_GAP;
  renderLeftWrappedText(
    cleanName,
    MARGIN_X,
    sigNameBaseY + SIGNATURE_NAME_EXTRA_DOWN,
    SIZE_SIGNATURE_NAME,
    true,
    DARK_RGB,
    CONTENT_WIDTH
  );


  return { texts, bands, photo, pageHeights };
};

// ====================================================================
// RENDERING HELPERS
// ====================================================================
// A PDF baseline (mm from page top) -> the CSS `top` of a 1em line box
const baselineToTop = (baseline: number, fontSize: number, font: PdfFont): number => {
  const { ascent, descent } = FONT_CSS[font];
  const boxHeight = fontSize * PT_TO_MM * TEXT_BOX_LINE_HEIGHT_EM;
  const baselineInsideBox = boxHeight / 2 + ((ascent - descent) / 2) * fontSize * PT_TO_MM;
  return baseline - baselineInsideBox;
};

// How an anchor x maps to the box that holds the text
const ALIGN_TRANSFORM: Record<Align, string> = {
  left: 'none',
  center: 'translateX(-50%)',
  right: 'translateX(-100%)',
};

// ====================================================================
// COMPONENT
// ====================================================================
export const ModernPreview = ({
  letter,
  photo,
  name,
  title,
  email,
  phone,
  countryCode,
  userAddress,
  linkedinUrl,
  companyName,
  hiringManagerName,
  preferredFont,
  showBulletPoints,
}: ModernPreviewProps) => {
  const hasPhoto = !!photo && photo.startsWith(PHOTO_DATA_PREFIX);
  const font: PdfFont = FONT_CHOICES[preferredFont || DEFAULT_FONT_CHOICE] || DEFAULT_PDF_FONT;

  // Same input the PDF receives (deepSanitizeForPdf is applied to every string)
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
        hasPhoto,
        hiringManagerName: sanitizeTextForPdf(hiringManagerName || ''),
        font,
        showBulletPoints,
      }),
    [name, email, phone, countryCode, userAddress, linkedinUrl, title, companyName, letter, hasPhoto, hiringManagerName, font, showBulletPoints]
  );

  // fit-to-width: pages are laid out at real A4 size and shrunk with CSS scale
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

  const pageCount = layout.pageHeights.length;
  const stackHeightMm = layout.pageHeights.reduce((sum, h) => sum + h, 0) + (pageCount - 1) * PAGE_GAP;

  return (
    <div ref={wrapRef} style={{ width: '100%', overflow: 'hidden' }}>
      {/* box that takes the SCALED size so the panel lays out/scrolls correctly */}
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
          {layout.pageHeights.map((pageHeight, pageIndex) => (
            <div
              key={pageIndex}
              style={{
                position: 'relative',
                flexShrink: 0,
                width: mm(PAGE_WIDTH),
                height: mm(pageHeight),
                overflow: 'hidden',
                backgroundColor: PAGE_BACKGROUND,
                boxShadow: PAGE_SHADOW,
                fontFamily: FONT_CSS[font].family,
              }}
            >
              {/* header band (drawn first, photo + text sit on top) */}
              {layout.bands
                .filter((b) => b.page === pageIndex)
                .map((b, i) => (
                  <div
                    key={`band-${i}`}
                    style={{
                      position: 'absolute',
                      left: mm(b.x),
                      top: mm(b.y),
                      width: mm(b.width),
                      height: mm(b.height),
                      backgroundColor: rgb(b.color),
                    }}
                  />
                ))}

              {/* profile photo (first page only), circular like makeCircularImage */}
              {pageIndex === 0 && layout.photo && photo && (
                <img
                  src={photo}
                  alt=""
                  style={{
                    position: 'absolute',
                    left: mm(layout.photo.x),
                    top: mm(layout.photo.y),
                    width: mm(layout.photo.size),
                    height: mm(layout.photo.size),
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              )}

              {/* every text line at its exact PDF baseline */}
              {layout.texts
                .filter((t) => t.page === pageIndex)
                .map((t, i) => (
                  <span
                    key={`text-${i}`}
                    style={{
                      position: 'absolute',
                      left: mm(t.x),
                      top: mm(baselineToTop(t.baseline, t.fontSize, font)),
                      transform: ALIGN_TRANSFORM[t.align],
                      fontSize: pt(t.fontSize),
                      lineHeight: TEXT_BOX_LINE_HEIGHT_EM,
                      fontWeight: t.bold ? FONT_WEIGHT_BOLD : FONT_WEIGHT_NORMAL,
                      fontStyle: t.muted ? 'italic' : 'normal',
                      color: rgb(t.muted ? PLACEHOLDER_RGB : t.color),
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
