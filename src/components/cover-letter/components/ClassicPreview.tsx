// src/components/cover-letter/components/ClassicPreview.tsx
// ------------------------------------------------------------------
// Live preview that mirrors ClassicTemplate.ts (the jsPDF generator).
//
// HOW IT STAYS IDENTICAL TO THE PDF
//  1. The PDF's layout algorithm is ported 1:1 into buildLayout(): same
//     cursor (currentY), same gaps, same wrap width, same page-break
//     rules. It outputs every text line with its page, x and BASELINE
//     (mm) - exactly what jsPDF receives.
//  2. Text is wrapped with the same greedy rule as pdf.splitTextToSize,
//     measured with real font metrics (canvas), so line breaks match.
//  3. Each line is then drawn on an A4 sheet at that exact position, in
//     CSS mm / pt units (the PDF's own units).
//  4. The text clean-up (cleanText, cleanEmail, cleanLetterBody, ...) is
//     the SAME helper set the PDF uses, imported from pdfHelpers.
//
// No loose numbers: every value below is a named constant that points
// to the line of ClassicTemplate.ts it comes from. If you change a value
// in ClassicTemplate.ts, change the same constant here.
// ------------------------------------------------------------------

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  cleanText,
  cleanEmail,
  cleanPhoneNumber,
  cleanLinkedin,
  cleanLetterBody,
} from '../utils/pdfHelpers';

interface ClassicPreviewProps {
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
const PAGE_HEIGHT = 297;
const MARGIN_X = 20; // marginX
const MARGIN_Y = 18; // marginY
const BOTTOM_MARGIN = 16; // BOTTOM_MARGIN
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2; // maxWidth

// ====================================================================
// COLORS (RGB triplets exactly as passed to jsPDF)
// ====================================================================
const DARK_TEXT_RGB: [number, number, number] = [15, 15, 15]; // DARK_TEXT_COLOR
const DIVIDER_RGB: [number, number, number] = [200, 205, 210]; // setDrawColor
const PLACEHOLDER_RGB: [number, number, number] = [156, 163, 175]; // preview-only empty state
const PAGE_BACKGROUND = '#ffffff';
const PAGE_SHADOW = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; // preview-only sheet shadow

const rgb = ([r, g, b]: [number, number, number]) => `rgb(${r}, ${g}, ${b})`;

// ====================================================================
// FONT
// ====================================================================
// jsPDF 'helvetica' -> Helvetica/Arial (metric compatible) in the browser
const FONT_FAMILY = 'Helvetica, Arial, "Liberation Sans", sans-serif';
const FONT_WEIGHT_BOLD = 'bold';
const FONT_WEIGHT_NORMAL = 'normal';

// Font metrics (em) of Arial/Helvetica, used to convert "PDF baseline"
// positions into CSS line boxes.
const FONT_ASCENT_EM = 0.905;
const FONT_DESCENT_EM = 0.212;
const HALF_LEADING_K = (FONT_ASCENT_EM - FONT_DESCENT_EM) / 2;
const TEXT_BOX_LINE_HEIGHT_EM = 1; // every drawn line gets a box of exactly 1em

// Text is measured at this size and scaled (avoids sub-pixel rounding)
const MEASURE_REFERENCE_PX = 100;

// ====================================================================
// TYPOGRAPHY (pt)
// ====================================================================
const SIZE_NAME_WITH_PHOTO = 15.84; // NAME_FONT_SIZE
const SIZE_TITLE_WITH_PHOTO = 8.8; // TITLE_FONT_SIZE
const SIZE_CONTACT_WITH_PHOTO = 8.25; // CONTACT_FONT_SIZE
const SIZE_NAME_NO_PHOTO = 17.6;
const SIZE_TITLE_NO_PHOTO = 9.68;
const SIZE_CONTACT_NO_PHOTO = 8.8;
const SIZE_DATE = 9.5;
const SIZE_RECIPIENT = 10.5;
const SIZE_COMPANY = 10;
const SIZE_SUBJECT = 10;
const SIZE_SALUTATION = 10.5;
const SIZE_BODY = 10;
const SIZE_CLOSING = 10;
const SIGNATURE_NAME_BASE_SIZE = 12; // signatureNameBaseSize (original size)
const SIGNATURE_NAME_SCALE_UP = 1.3; // +30% enlargement
const SIGNATURE_NAME_REDUCE_PERCENT = 30; // total reduction applied on top of the enlarged size
const SIZE_SIGNATURE_NAME =
  SIGNATURE_NAME_BASE_SIZE * SIGNATURE_NAME_SCALE_UP * (1 - SIGNATURE_NAME_REDUCE_PERCENT / 100); // SIGNATURE_NAME_SIZE

// ====================================================================
// LINE HEIGHTS (how the PDF advances between lines)
// ====================================================================
// renderWrappedText(): lineHeight (mm) = fontSize * 0.55 * multiplier(1.0)
const WRAPPED_LINE_HEIGHT_PER_PT = 0.55;
const WRAPPED_LINE_HEIGHT_MULTIPLIER = 1.0;
// pdf.text(arrayOfLines): jsPDF's default lineHeightFactor
const JSPDF_LINE_HEIGHT_FACTOR = 1.15;

// ====================================================================
// SPACING (mm) - one constant per "currentY += n" in ClassicTemplate.ts
// ====================================================================
const PHOTO_SIZE = 28; // photoSize
const PHOTO_TO_TEXT_GAP = 6; // nameX = marginX + photoSize + 6
const HEADER_TEXT_SHIFT_DOWN = 4; // "text block shifted down by 4mm"
const HEADER_NAME_EXTRA_OFFSET = 3; // HEADER_NAME_EXTRA_OFFSET
const GAP_AFTER_NAME = 2;
const GAP_AFTER_TITLE = 2;
const GAP_AFTER_CONTACT = 1;
const PHOTO_BLOCK_BOTTOM_PAD = 4; // imgY + photoSize + 4
const PHOTO_TEXT_BOTTOM_PAD = 1; // photoFlowY + 1
const NO_PHOTO_TRAILING_GAP = 1; // currentY += 1 (no-photo branch)
const HEADER_RULE_TOP_GAP = 2;
const HEADER_RULE_THICKNESS = 0.2; // setLineWidth(0.2)
const HEADER_RULE_BOTTOM_GAP = 5;
const GAP_AFTER_DATE = 6;
const GAP_AFTER_RECIPIENT = 5;
const GAP_AFTER_COMPANY = 2;
const GAP_BEFORE_SUBJECT = 2;
const SUBJECT_LINE_ADVANCE = 4.5; // wrappedSubject.length * 4.5
const GAP_AFTER_SUBJECT = 5;
const GAP_AFTER_SALUTATION = 6;
const BODY_LINE_ADVANCE = 5; // lines * 5
const GAP_AFTER_PARAGRAPH = 3; // + 3
const PAGE_BREAK_SAFETY = 3; // getRemainingSpace() < needed + 3
const GAP_BEFORE_SIGNATURE = 4;
const SIGNATURE_MIN_SPACE = 20;
const GAP_AFTER_CLOSING = 7;
const SIGNATURE_NAME_SHIFT_DOWN = 1; // name only, not 'Sincerely,'
const SIGNATURE_NAME_SHIFT_LEFT = 0.5; // name only, not 'Sincerely,'
const CONTACT_EXTRA_RIGHT = 0.3; // CONTACT_EXTRA_RIGHT: header contact only moves 0.3mm right (width unchanged)

// ====================================================================
// TEXT CONSTANTS (same literals the PDF uses)
// ====================================================================
const DEFAULT_NAME = 'Your Name';
const DEFAULT_TITLE = 'Job Title';
const DEFAULT_SUBJECT_POSITION = 'Position';
const DEFAULT_HIRING_MANAGER = 'Hiring Manager';
const SUBJECT_PREFIX = 'RE: Application for ';
const SALUTATION_PREFIX = 'Dear ';
const SALUTATION_SUFFIX = ',';
const CLOSING_TEXT = 'Sincerely,';
const CONTACT_SEPARATOR = ' '.repeat(5); // contactParts.join('     ')
const PHOTO_DATA_PREFIX = 'data:image';
const DATE_LOCALE = 'en-US';
const DATE_FORMAT: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
const PLACEHOLDER_TEXT = 'No content yet. Generate your letter to see the preview.';

// Filters the PDF applies to every body paragraph
const DATE_ONLY_PATTERN = /^\w+ \d{1,2}, \d{4}$/;
const SUBJECT_MARKERS = ['RE:', 'Application for'];
const DEAR_HIRING_MANAGER = 'dear hiring manager';
const DEAR_PREFIX = 'dear ';
const EMAIL_MARK = '@';
const EMAIL_LINE_MARKS = ['|', 'gmail'];
const PARAGRAPH_SPLIT = /\n\n+/;
const LINE_BREAK_PATTERN = /\r\n|\r|\n/;

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

// width in mm of `text` at `fontSize` (pt)
const textWidthMm = (text: string, fontSize: number, bold: boolean): number => {
  const ctx = getMeasureContext();
  if (!ctx) return 0;
  ctx.font = `${bold ? FONT_WEIGHT_BOLD : FONT_WEIGHT_NORMAL} ${MEASURE_REFERENCE_PX}px ${FONT_FAMILY}`;
  const widthAtReference = ctx.measureText(text).width;
  return (widthAtReference / MEASURE_REFERENCE_PX) * fontSize * PT_TO_MM;
};

// Greedy word wrap, one explicit line at a time; a word wider than the
// whole line is broken by characters (like jsPDF).
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

const splitTextToSize = (text: string, maxWidth: number, fontSize: number, bold: boolean): string[] =>
  text.split(LINE_BREAK_PATTERN).flatMap((p) => wrapParagraph(p, maxWidth, fontSize, bold));

// ====================================================================
// LAYOUT (the port of ClassicTemplate.render)
// ====================================================================
interface TextOp {
  page: number;
  x: number; // mm
  baseline: number; // mm from page top
  text: string;
  fontSize: number; // pt
  bold: boolean;
  muted?: boolean;
}

interface RuleOp {
  page: number;
  y: number;
  x1: number;
  x2: number;
}

interface PhotoOp {
  x: number;
  y: number;
  size: number;
}

interface Layout {
  texts: TextOp[];
  rules: RuleOp[];
  photo: PhotoOp | null;
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
  hasPhoto: boolean;
  hiringManagerName: string;
}

const buildLayout = (input: LayoutInput): Layout => {
  const { userName, email, phoneNumber, selectedCountryCode, address, linkedin, jobTitle, company, generatedLetter, hasPhoto } =
    input;

  const texts: TextOp[] = [];
  const rules: RuleOp[] = [];
  let photo: PhotoOp | null = null;
  let page = 0;
  let currentY = MARGIN_Y;

  const cleanHiringManager = cleanText(input.hiringManagerName || DEFAULT_HIRING_MANAGER);

  // ---- drawing primitives -------------------------------------------------
  const push = (text: string, x: number, baseline: number, fontSize: number, bold: boolean, muted?: boolean) => {
    texts.push({ page, x, baseline, text, fontSize, bold, muted });
  };

  const lineHeightOf = (fontSize: number) =>
    fontSize * WRAPPED_LINE_HEIGHT_PER_PT * WRAPPED_LINE_HEIGHT_MULTIPLIER;

  // renderWrappedText()
  const renderWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, bold: boolean): number => {
    if (!text) return y;
    const lines = splitTextToSize(text, maxWidth, fontSize, bold);
    const lineHeight = lineHeightOf(fontSize);
    lines.forEach((line, i) => push(line, x, y + i * lineHeight, fontSize, bold));
    return y + lines.length * lineHeight;
  };

  // pdf.text(arrayOfLines, ...) - uses jsPDF's own line height factor
  const renderTextLines = (lines: string[], x: number, y: number, fontSize: number, bold: boolean) => {
    const step = fontSize * PT_TO_MM * JSPDF_LINE_HEIGHT_FACTOR;
    lines.forEach((line, i) => push(line, x, y + i * step, fontSize, bold));
  };

  const measureBlockHeight = (text: string, maxWidth: number, fontSize: number, bold: boolean): number => {
    if (!text) return 0;
    return splitTextToSize(text, maxWidth, fontSize, bold).length * fontSize * WRAPPED_LINE_HEIGHT_PER_PT;
  };

  const getRemainingSpace = () => PAGE_HEIGHT - BOTTOM_MARGIN - currentY;
  const addPage = () => {
    page += 1;
    currentY = MARGIN_Y;
  };
  const checkAndAddPage = (neededHeight: number) => {
    if (getRemainingSpace() < neededHeight + PAGE_BREAK_SAFETY) addPage();
  };

  // ---- contact text (same order as the PDF) -------------------------------
  const contactParts: string[] = [];
  if (email) {
    const v = cleanEmail(email);
    if (v) contactParts.push(v);
  }
  if (phoneNumber && selectedCountryCode) {
    const v = cleanPhoneNumber(phoneNumber, selectedCountryCode);
    if (v) contactParts.push(v);
  }
  if (address) {
    const v = cleanText(address);
    if (v) contactParts.push(v);
  }
  if (linkedin) {
    const v = cleanLinkedin(linkedin);
    if (v) contactParts.push(v);
  }
  const contactText = contactParts.join(CONTACT_SEPARATOR);

  const name = cleanText(userName || DEFAULT_NAME).toUpperCase();
  const title = cleanText(jobTitle || DEFAULT_TITLE);

  // ---- HEADER --------------------------------------------------------------
  if (hasPhoto) {
    const imgX = MARGIN_X;
    const imgY = currentY;
    photo = { x: imgX, y: imgY, size: PHOTO_SIZE };

    const nameX = MARGIN_X + PHOTO_SIZE + PHOTO_TO_TEXT_GAP;
    const maxWidth = PAGE_WIDTH - nameX - MARGIN_X;

    const nameHeight = measureBlockHeight(name, maxWidth, SIZE_NAME_WITH_PHOTO, true);
    const titleHeight = measureBlockHeight(title, maxWidth, SIZE_TITLE_WITH_PHOTO, true);
    const contactHeight = contactText ? measureBlockHeight(contactText, maxWidth, SIZE_CONTACT_WITH_PHOTO, false) : 0;

    const totalTextBlockHeight =
      nameHeight +
      GAP_AFTER_NAME +
      titleHeight +
      (contactText ? GAP_AFTER_TITLE + contactHeight + GAP_AFTER_CONTACT : 0);

    // text block is centered against the photo, then shifted down
    const verticalCenterOffset = Math.max(0, (PHOTO_SIZE - totalTextBlockHeight) / 2);
    const headerFlowStartY = imgY + verticalCenterOffset + HEADER_TEXT_SHIFT_DOWN;

    const nameY = renderWrappedText(
      name,
      nameX,
      headerFlowStartY + HEADER_NAME_EXTRA_OFFSET,
      maxWidth,
      SIZE_NAME_WITH_PHOTO,
      true
    );
    const nameBlockHeight = nameY - (headerFlowStartY + HEADER_NAME_EXTRA_OFFSET);
    let photoFlowY = headerFlowStartY + nameBlockHeight + GAP_AFTER_NAME;

    const titleY = renderWrappedText(title, nameX, photoFlowY, maxWidth, SIZE_TITLE_WITH_PHOTO, true);
    photoFlowY = titleY + GAP_AFTER_TITLE;

    if (contactText) {
      const contactY = renderWrappedText(contactText, nameX + CONTACT_EXTRA_RIGHT, photoFlowY, maxWidth, SIZE_CONTACT_WITH_PHOTO, false);
      photoFlowY = contactY + GAP_AFTER_CONTACT;
    }

    // whichever is taller: the photo or the text beside it
    currentY = Math.max(imgY + PHOTO_SIZE + PHOTO_BLOCK_BOTTOM_PAD, photoFlowY + PHOTO_TEXT_BOTTOM_PAD);
  } else {
    const headerFlowStartY = currentY;
    const nameY = renderWrappedText(
      name,
      MARGIN_X,
      headerFlowStartY + HEADER_NAME_EXTRA_OFFSET,
      CONTENT_WIDTH,
      SIZE_NAME_NO_PHOTO,
      true
    );
    const nameBlockHeight = nameY - (headerFlowStartY + HEADER_NAME_EXTRA_OFFSET);
    currentY = headerFlowStartY + nameBlockHeight + GAP_AFTER_NAME;

    const titleY = renderWrappedText(title, MARGIN_X, currentY, CONTENT_WIDTH, SIZE_TITLE_NO_PHOTO, true);
    currentY = titleY + GAP_AFTER_TITLE;

    if (contactText) {
      const contactY = renderWrappedText(contactText, MARGIN_X + CONTACT_EXTRA_RIGHT, currentY, CONTENT_WIDTH, SIZE_CONTACT_NO_PHOTO, false);
      currentY = contactY + GAP_AFTER_CONTACT;
    }
    currentY += NO_PHOTO_TRAILING_GAP;
  }

  // ---- divider -------------------------------------------------------------
  currentY += HEADER_RULE_TOP_GAP;
  rules.push({ page, y: currentY, x1: MARGIN_X, x2: PAGE_WIDTH - MARGIN_X });
  currentY += HEADER_RULE_BOTTOM_GAP;

  // ---- date ----------------------------------------------------------------
  const today = new Date().toLocaleDateString(DATE_LOCALE, DATE_FORMAT);
  push(today, MARGIN_X, currentY, SIZE_DATE, false);
  currentY += GAP_AFTER_DATE;

  // ---- recipient & subject -------------------------------------------------
  // Show the name line only when a real name was given; with no name the
  // recipient block starts with the company, and the salutation stays
  // "Dear Hiring Manager," (no duplicate "Hiring Manager" line).
  const hasRealHiringManagerName =
    !!(input.hiringManagerName && input.hiringManagerName.trim()) &&
    cleanHiringManager.trim().toLowerCase() !== DEFAULT_HIRING_MANAGER.toLowerCase();
  if (hasRealHiringManagerName) {
    push(cleanHiringManager, MARGIN_X, currentY, SIZE_RECIPIENT, true);
    currentY += GAP_AFTER_RECIPIENT;
  }

  if (company) {
    const companyY = renderWrappedText(cleanText(company), MARGIN_X, currentY, CONTENT_WIDTH, SIZE_COMPANY, false);
    currentY = companyY + GAP_AFTER_COMPANY;
  }
  currentY += GAP_BEFORE_SUBJECT;

  const subject = `${SUBJECT_PREFIX}${cleanText(jobTitle || DEFAULT_SUBJECT_POSITION)}`;
  const wrappedSubject = splitTextToSize(subject, CONTENT_WIDTH, SIZE_SUBJECT, false);
  renderTextLines(wrappedSubject, MARGIN_X, currentY, SIZE_SUBJECT, false);
  currentY += wrappedSubject.length * SUBJECT_LINE_ADVANCE + GAP_AFTER_SUBJECT;

  // ---- salutation ----------------------------------------------------------
  push(`${SALUTATION_PREFIX}${cleanHiringManager}${SALUTATION_SUFFIX}`, MARGIN_X, currentY, SIZE_SALUTATION, true);
  currentY += GAP_AFTER_SALUTATION;

  // ---- body ----------------------------------------------------------------
  const cleanLetter = cleanLetterBody(generatedLetter, cleanHiringManager).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const paragraphs = cleanLetter.split(PARAGRAPH_SPLIT);
  const upperUserName = userName?.toUpperCase();
  let drewAnyParagraph = false;

  paragraphs.forEach((paragraph) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return;

    // same skip rules as the PDF
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

    const lines = splitTextToSize(trimmed, CONTENT_WIDTH, SIZE_BODY, false);
    checkAndAddPage(lines.length * BODY_LINE_ADVANCE + GAP_AFTER_PARAGRAPH);
    renderTextLines(lines, MARGIN_X, currentY, SIZE_BODY, false);
    currentY += lines.length * BODY_LINE_ADVANCE + GAP_AFTER_PARAGRAPH;
    drewAnyParagraph = true;
  });

  // preview-only empty state (does not move the cursor)
  if (!drewAnyParagraph) {
    push(PLACEHOLDER_TEXT, MARGIN_X, currentY, SIZE_BODY, false, true);
  }

  // ---- signature -----------------------------------------------------------
  currentY += GAP_BEFORE_SIGNATURE;
  if (getRemainingSpace() < SIGNATURE_MIN_SPACE) addPage();

  push(CLOSING_TEXT, MARGIN_X, currentY, SIZE_CLOSING, false);
  currentY += GAP_AFTER_CLOSING;

  renderWrappedText(
    cleanText(userName || DEFAULT_NAME),
    MARGIN_X - SIGNATURE_NAME_SHIFT_LEFT,
    currentY + SIGNATURE_NAME_SHIFT_DOWN,
    CONTENT_WIDTH,
    SIZE_SIGNATURE_NAME,
    true
  );

  return { texts, rules, photo, pageCount: page + 1 };
};

// ====================================================================
// RENDERING HELPERS
// ====================================================================
// A PDF baseline (mm from page top) -> the CSS `top` of a 1em line box
const baselineToTop = (baseline: number, fontSize: number): number => {
  const boxHeight = fontSize * PT_TO_MM * TEXT_BOX_LINE_HEIGHT_EM;
  const baselineInsideBox = boxHeight / 2 + HALF_LEADING_K * fontSize * PT_TO_MM;
  return baseline - baselineInsideBox;
};

// ====================================================================
// COMPONENT
// ====================================================================
export const ClassicPreview = ({
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
}: ClassicPreviewProps) => {
  const hasPhoto = !!photo && photo.startsWith(PHOTO_DATA_PREFIX);

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
      }),
    [name, email, phone, countryCode, userAddress, linkedinUrl, title, companyName, letter, hasPhoto, hiringManagerName]
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

  const stackHeightMm = layout.pageCount * PAGE_HEIGHT + (layout.pageCount - 1) * PAGE_GAP;
  const pages = Array.from({ length: layout.pageCount }, (_, i) => i);

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

              {/* divider rule(s) */}
              {layout.rules
                .filter((r) => r.page === pageIndex)
                .map((r, i) => (
                  <div
                    key={`rule-${i}`}
                    style={{
                      position: 'absolute',
                      left: mm(r.x1),
                      top: mm(r.y - HEADER_RULE_THICKNESS / 2),
                      width: mm(r.x2 - r.x1),
                      height: mm(HEADER_RULE_THICKNESS),
                      backgroundColor: rgb(DIVIDER_RGB),
                    }}
                  />
                ))}

              {/* every text line at its exact PDF baseline */}
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
                      color: rgb(t.muted ? PLACEHOLDER_RGB : DARK_TEXT_RGB),
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
