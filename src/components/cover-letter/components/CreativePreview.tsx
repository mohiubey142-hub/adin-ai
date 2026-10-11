// src/components/cover-letter/components/CreativePreview.tsx
// Live preview that mirrors CreativeTemplate.ts (same layout numbers, sizes, colors, page-break rules).

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  cleanText,
  cleanEmail,
  cleanPhoneNumber,
  cleanLinkedin,
  cleanLetterBody,
} from '../utils/pdfHelpers';

interface CreativePreviewProps {
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

type RGB = [number, number, number];

const MM_PER_INCH = 25.4;
const PT_PER_INCH = 72;
const CSS_PX_PER_INCH = 96;
const PT_TO_MM = MM_PER_INCH / PT_PER_INCH;
const MM_TO_PX = CSS_PX_PER_INCH / MM_PER_INCH;

const mm = (n: number) => `${n}mm`;
const pt = (n: number) => `${n}pt`;

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 18;
const MARGIN_Y = 18;
const BOTTOM_MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const DARK_TEXT_RGB: RGB = [15, 15, 15];
const HEADER_BG_RGB: RGB = [0, 0, 0];           // flat matte black header band (no gradient / no shine)
const HEADER_NAME_RGB: RGB = [255, 255, 255];
const HEADER_SUB_RGB: RGB = [214, 221, 232];    // title on the band
const HEADER_CONTACT_RGB: RGB = [235, 235, 235]; // contact: soft white (slightly dimmed)
const PLACEHOLDER_RGB: RGB = [156, 163, 175];
const PAGE_BACKGROUND = '#ffffff';
const PAGE_SHADOW = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';

const rgb = ([r, g, b]: RGB) => `rgb(${r}, ${g}, ${b})`;

const FONT_HELVETICA = 'Helvetica, Arial, "Liberation Sans", sans-serif';
const FONT_TIMES = '"Times New Roman", Times, "Liberation Serif", serif';
const FONT_ASCENT_EM = 0.905;
const FONT_DESCENT_EM = 0.212;
const HALF_LEADING_K = (FONT_ASCENT_EM - FONT_DESCENT_EM) / 2;
const MEASURE_REFERENCE_PX = 100;

// ---- header band (photo 35mm on the right, original text sizes) ----
const PHOTO_SIZE = 35;
const PHOTO_TOP = 9;
const PHOTO_TO_TEXT_GAP = 6;
const NAME_BASELINE_WITH_PHOTO = 19;
const NAME_BASELINE_NO_PHOTO = 20;
const SIZE_NAME_WITH_PHOTO = 15.84;
const SIZE_TITLE_WITH_PHOTO = 8.8;
const PREVIEW_CONTACT_SCALE = 1.1 * 1.15; // preview only (PDF keeps original contact size)
const SIZE_CONTACT_WITH_PHOTO = 8.25 * PREVIEW_CONTACT_SCALE;
const SIZE_NAME_NO_PHOTO = 17.6;
const SIZE_TITLE_NO_PHOTO = 9.68;
const SIZE_CONTACT_NO_PHOTO = 8.8 * PREVIEW_CONTACT_SCALE;
const NAME_LINE_FACTOR = 1.1;
const TITLE_LETTER_SPACING = 0.45; // mm
const GAP_NAME_TO_TITLE = 6.5;
const GAP_TITLE_TO_CONTACT = 6;
const CONTACT_LINE_HEIGHT = 4.5;
const CONTACT_GAP = 7; // mm between contact items
const BAND_PADDING_BOTTOM = 9;
const GAP_AFTER_BAND = 9;
const GAP_AFTER_DATE = 9;

// ---- letter ----
const SIZE_DATE = 9.5;
const SIZE_RECIPIENT = 10.5;
const SIZE_COMPANY = 10;
const SIZE_SUBJECT = 10;
const SIZE_SALUTATION = 10.5;
const SIZE_BODY = 10;
const SIZE_CLOSING = 10;
const SIGNATURE_NAME_ORIGINAL_FONT_SIZE = 12; // SIGNATURE_NAME_ORIGINAL_FONT_SIZE
const SIGNATURE_NAME_FONT_SIZE_INCREASE = 0.4; // SIGNATURE_NAME_FONT_SIZE_INCREASE (+40%)
const SIGNATURE_NAME_FONT_SIZE_DECREASE = 0.3; // SIGNATURE_NAME_FONT_SIZE_DECREASE (30% total)
const SIGNATURE_NAME_BASE_FONT_SIZE = SIGNATURE_NAME_ORIGINAL_FONT_SIZE * (1 + SIGNATURE_NAME_FONT_SIZE_INCREASE);
const SIZE_SIGNATURE_SCRIPT = SIGNATURE_NAME_BASE_FONT_SIZE * (1 - SIGNATURE_NAME_FONT_SIZE_DECREASE);

const WRAPPED_LINE_HEIGHT_PER_PT = 0.55;
const JSPDF_LINE_HEIGHT_FACTOR = 1.15;

const GAP_AFTER_RECIPIENT = 5;
const GAP_AFTER_COMPANY = 2;
const GAP_BEFORE_SUBJECT = 2;
const SUBJECT_LINE_ADVANCE = 4.5;
const GAP_AFTER_SUBJECT = 5;
const GAP_AFTER_SALUTATION = 6;
const BODY_LINE_ADVANCE = 5;
const GAP_AFTER_PARAGRAPH = 3;
const PAGE_BREAK_SAFETY = 3;
const GAP_BEFORE_SIGNATURE = 4;
const SIGNATURE_NAME_SHIFT_DOWN = 1.5; // name only, not 'Sincerely,'
const SIGNATURE_NAME_SHIFT_LEFT = 0.5; // name only, not 'Sincerely,'
const SIGNATURE_MIN_SPACE = 20;
const SIGNATURE_BLOCK_H = 22; // last paragraph keeps this much free so the signature never lands alone on a page
const JUSTIFY_BODY = true; // false = plain left-aligned lines (safest for ATS text extraction)
const GAP_AFTER_CLOSING = 6.5;

const DEFAULT_NAME = 'Your Name';
const DEFAULT_TITLE = 'Job Title';
const DEFAULT_SUBJECT_POSITION = 'Position';
const DEFAULT_HIRING_MANAGER = 'Hiring Manager';
const SUBJECT_PREFIX = 'RE: Application for ';
const SALUTATION_PREFIX = 'Dear ';
const SALUTATION_SUFFIX = ',';
const CLOSING_TEXT = 'Sincerely,';
const PHOTO_DATA_PREFIX = 'data:image';
const DATE_LOCALE = 'en-US';
const DATE_FORMAT: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
const PLACEHOLDER_TEXT = 'No content yet. Generate your letter to see the preview.';

const DATE_ONLY_PATTERN = /^\w+ \d{1,2}, \d{4}$/;
const DEAR_HIRING_MANAGER = 'dear hiring manager';
const DEAR_PREFIX = 'dear ';
const EMAIL_MARK = '@';
const EMAIL_LINE_MARKS = ['|', 'gmail'];
const PARAGRAPH_SPLIT = /\n\n+/;
const LINE_BREAK_PATTERN = /\r\n|\r|\n/;

const PAGE_GAP = 4;
const MAX_SCALE = 1;

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
  ctx.font = `${bold ? 'bold' : 'normal'} ${MEASURE_REFERENCE_PX}px ${FONT_HELVETICA}`;
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

interface TextOp {
  page: number;
  x: number;
  baseline: number;
  text: string;
  fontSize: number;
  bold: boolean;
  muted?: boolean;
  serifItalic?: boolean;
  letterSpacing?: number; // mm
  color?: RGB;
  wordSpacing?: number;   // mm (extra, added to normal space)
}

interface PhotoOp {
  x: number;
  y: number;
  size: number;
}

interface Layout {
  texts: TextOp[];
  bandHeight: number;
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
  const { userName, email, phoneNumber, selectedCountryCode, address, linkedin, jobTitle, company, generatedLetter, hasPhoto } = input;

  const texts: TextOp[] = [];
  let bandHeight = 0;
  let photo: PhotoOp | null = null;
  let page = 0;
  let currentY = MARGIN_Y;

  const cleanHiringManager = cleanText(input.hiringManagerName || DEFAULT_HIRING_MANAGER);

  const push = (text: string, x: number, baseline: number, fontSize: number, bold: boolean, extra: Partial<TextOp> = {}) => {
    texts.push({ page, x, baseline, text, fontSize, bold, ...extra });
  };

  const lineHeightOf = (fontSize: number) => fontSize * WRAPPED_LINE_HEIGHT_PER_PT;

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

  // justified lines (last line of the paragraph stays left-aligned)
  const renderJustifiedLines = (lines: string[], x: number, y: number, width: number, fontSize: number) => {
    if (!JUSTIFY_BODY) { lines.forEach((l, i) => push(l, x, y + i * BODY_LINE_ADVANCE, fontSize, false)); return; }
    const spaceW = textWidthMm(' ', fontSize, false);
    lines.forEach((line, i) => {
      const yy = y + i * BODY_LINE_ADVANCE;
      const words = line.trim().split(/\s+/);
      const isLast = i === lines.length - 1;
      if (isLast || words.length < 2) { push(line, x, yy, fontSize, false); return; }
      const wordsW = words.reduce((s, w) => s + textWidthMm(w, fontSize, false), 0);
      const gap = (width - wordsW) / (words.length - 1);
      if (gap < spaceW * 0.8 || gap > spaceW * 3.5) { push(line, x, yy, fontSize, false); return; }
      push(words.join(' '), x, yy, fontSize, false, { wordSpacing: gap - spaceW });
    });
  };

  const getRemainingSpace = () => PAGE_HEIGHT - BOTTOM_MARGIN - currentY;
  const addPage = () => { page += 1; currentY = MARGIN_Y; };
  const checkAndAddPage = (neededHeight: number) => {
    if (getRemainingSpace() < neededHeight + PAGE_BREAK_SAFETY) addPage();
  };

  // ---------- header band ----------
  const photoX = PAGE_WIDTH - MARGIN_X - PHOTO_SIZE;
  if (hasPhoto) photo = { x: photoX, y: PHOTO_TOP, size: PHOTO_SIZE };

  const textX = MARGIN_X;
  const textMaxWidth = hasPhoto ? photoX - PHOTO_TO_TEXT_GAP - textX : CONTENT_WIDTH;
  const nameBaseline = hasPhoto ? NAME_BASELINE_WITH_PHOTO : NAME_BASELINE_NO_PHOTO;

  // name (auto-shrinks to fit)
  const name = cleanText(userName || DEFAULT_NAME);
  let nameSize = hasPhoto ? SIZE_NAME_WITH_PHOTO : SIZE_NAME_NO_PHOTO;
  while (nameSize > 9) {
    if (textWidthMm(name, nameSize, true) <= textMaxWidth) break;
    nameSize -= 0.5;
  }
  const nameLines = splitTextToSize(name, textMaxWidth, nameSize, true);
  const nameLH = nameSize * PT_TO_MM * NAME_LINE_FACTOR;
  nameLines.forEach((l, i) => push(l, textX, nameBaseline + i * nameLH, nameSize, true, { color: HEADER_NAME_RGB }));
  const nameLastY = nameBaseline + (nameLines.length - 1) * nameLH;

  // title (letter-spaced)
  const title = cleanText(jobTitle || DEFAULT_TITLE).toUpperCase();
  let titleSize = hasPhoto ? SIZE_TITLE_WITH_PHOTO : SIZE_TITLE_NO_PHOTO;
  while (titleSize > 6) {
    if (textWidthMm(title, titleSize, false) + title.length * TITLE_LETTER_SPACING <= textMaxWidth) break;
    titleSize -= 0.25;
  }
  const titleY = nameLastY + GAP_NAME_TO_TITLE;
  push(title, textX, titleY, titleSize, false, { letterSpacing: TITLE_LETTER_SPACING, color: HEADER_SUB_RGB });

  // contact: one row of plain "Label: value" items (wraps to next row only if needed)
  const contactItems: string[] = [];
  if (email) { const v = cleanEmail(email); if (v) contactItems.push(`Email: ${v}`); }
  if (phoneNumber && selectedCountryCode) { const v = cleanPhoneNumber(phoneNumber, selectedCountryCode); if (v) contactItems.push(`Phone: ${v}`); }
  if (linkedin) { const v = cleanLinkedin(linkedin); if (v) contactItems.push(`LinkedIn: ${v}`); }
  if (address) { const v = cleanText(address); if (v) contactItems.push(`Address: ${v}`); }

  const contactSize = hasPhoto ? SIZE_CONTACT_WITH_PHOTO : SIZE_CONTACT_NO_PHOTO;
  const contactStartY = titleY + GAP_TITLE_TO_CONTACT;
  let contactX = textX;
  let contactLine = 0;
  const placeContact = (text: string, x: number, line: number) =>
    push(text, x, contactStartY + line * CONTACT_LINE_HEIGHT, contactSize, false, { color: HEADER_CONTACT_RGB });

  contactItems.forEach((item) => {
    const w = textWidthMm(item, contactSize, false);
    if (contactX > textX && contactX + w > textX + textMaxWidth) { contactLine += 1; contactX = textX; }
    if (w > textMaxWidth) {
      const parts = wrapParagraph(item, textMaxWidth, contactSize, false);
      parts.forEach((part, k) => {
        if (k > 0) contactLine += 1;
        placeContact(part, textX, contactLine);
      });
      contactX = textX + textWidthMm(parts[parts.length - 1], contactSize, false) + CONTACT_GAP;
      return;
    }
    placeContact(item, contactX, contactLine);
    contactX += w + CONTACT_GAP;
  });
  const textBottom = contactItems.length ? contactStartY + contactLine * CONTACT_LINE_HEIGHT : titleY;

  const photoBottom = hasPhoto ? PHOTO_TOP + PHOTO_SIZE : 0;
  bandHeight = Math.max(photoBottom + BAND_PADDING_BOTTOM, textBottom + BAND_PADDING_BOTTOM);
  currentY = bandHeight + GAP_AFTER_BAND;

  // ---------- letter meta ----------
  const now = new Date();
  const today = `${String(now.getDate()).padStart(2, '0')} ${now.toLocaleDateString(DATE_LOCALE, { month: 'long' })} ${now.getFullYear()}`;
  push(today, PAGE_WIDTH - MARGIN_X - textWidthMm(today, SIZE_DATE, true), currentY, SIZE_DATE, true);
  currentY += GAP_AFTER_DATE;

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

  push(`${SALUTATION_PREFIX}${cleanHiringManager}${SALUTATION_SUFFIX}`, MARGIN_X, currentY, SIZE_SALUTATION, false);
  currentY += GAP_AFTER_SALUTATION;

  // ---------- body (same filters / page-break rules) ----------
  const cleanLetter = cleanLetterBody(generatedLetter, cleanHiringManager).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const paragraphs = cleanLetter.split(PARAGRAPH_SPLIT);
  const upperUserName = userName?.toUpperCase();
  let drewAnyParagraph = false;

  const shouldSkipParagraph = (p: string): boolean => {
    const wordCount = p.split(/\s+/).length;
    if (p.match(DATE_ONLY_PATTERN)) return true;
    if (p === DEFAULT_HIRING_MANAGER) return true;
    if (p === cleanHiringManager) return true;
    // Subject-like lines only: starts with "RE:" or is a short "Application for ..." line.
    // A real body paragraph that merely mentions "Application for" is kept.
    if (/^re:/i.test(p) || (p.includes('Application for') && wordCount <= 12)) return true;
    if (p === company) return true;
    if (p === cleanText(company)) return true;
    if (p === userName || p === upperUserName) return true;
    if (p === jobTitle) return true;
    if (p.toLowerCase().includes(DEAR_HIRING_MANAGER)) return true;
    if (p.toLowerCase().startsWith(DEAR_PREFIX)) return true;
    if (p.startsWith(DEFAULT_HIRING_MANAGER)) return true;
    // Contact-style lines only: a long paragraph that mentions an email is kept.
    if (p.includes(EMAIL_MARK) && EMAIL_LINE_MARKS.some((m) => p.includes(m)) && wordCount < 10) return true;
    return false;
  };

  const keptParagraphs = paragraphs.map((p) => p.trim()).filter((p) => p && !shouldSkipParagraph(p));

  keptParagraphs.forEach((trimmed, pIndex) => {
    const isLastParagraph = pIndex === keptParagraphs.length - 1;
    const lines = splitTextToSize(trimmed, CONTENT_WIDTH, SIZE_BODY, false);
    // Last paragraph travels together with the signature block.
    checkAndAddPage(lines.length * BODY_LINE_ADVANCE + GAP_AFTER_PARAGRAPH + (isLastParagraph ? SIGNATURE_BLOCK_H : 0));
    renderJustifiedLines(lines, MARGIN_X, currentY, CONTENT_WIDTH, SIZE_BODY);
    currentY += lines.length * BODY_LINE_ADVANCE + GAP_AFTER_PARAGRAPH;
    drewAnyParagraph = true;
  });

  if (!drewAnyParagraph) {
    push(PLACEHOLDER_TEXT, MARGIN_X, currentY, SIZE_BODY, false, { muted: true });
  }

  // ---------- signature ----------
  currentY += GAP_BEFORE_SIGNATURE;
  if (getRemainingSpace() < SIGNATURE_MIN_SPACE) addPage();

  push(CLOSING_TEXT, MARGIN_X, currentY, SIZE_CLOSING, false);
  currentY += GAP_AFTER_CLOSING;

  const sigName = cleanText(userName || DEFAULT_NAME);
  push(sigName, MARGIN_X - SIGNATURE_NAME_SHIFT_LEFT, currentY + SIGNATURE_NAME_SHIFT_DOWN, SIZE_SIGNATURE_SCRIPT, false, { serifItalic: true });

  return { texts, bandHeight, photo, pageCount: page + 1 };
};

const baselineToTop = (baseline: number, fontSize: number): number => {
  const boxHeight = fontSize * PT_TO_MM;
  const baselineInsideBox = boxHeight / 2 + HALF_LEADING_K * fontSize * PT_TO_MM;
  return baseline - baselineInsideBox;
};

export const CreativePreview = ({
  letter, photo, name, title, email, phone, countryCode, userAddress, linkedinUrl, companyName, hiringManagerName,
}: CreativePreviewProps) => {
  const hasPhoto = !!photo && photo.startsWith(PHOTO_DATA_PREFIX);

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
            <div key={pageIndex} style={{ position: 'relative', flexShrink: 0, width: mm(PAGE_WIDTH), height: mm(PAGE_HEIGHT), overflow: 'hidden', backgroundColor: PAGE_BACKGROUND, boxShadow: PAGE_SHADOW, fontFamily: FONT_HELVETICA }}>
              {pageIndex === 0 && (
                <div style={{ position: 'absolute', left: 0, top: 0, width: mm(PAGE_WIDTH), height: mm(layout.bandHeight), backgroundColor: rgb(HEADER_BG_RGB) }} />
              )}

              {pageIndex === 0 && layout.photo && photo && (
                <img src={photo} alt="" style={{ position: 'absolute', left: mm(layout.photo.x), top: mm(layout.photo.y), width: mm(layout.photo.size), height: mm(layout.photo.size), borderRadius: '50%', objectFit: 'cover', boxShadow: 'none', filter: 'none', border: 'none' }} />
              )}

              {layout.texts.filter((t) => t.page === pageIndex).map((t, i) => (
                <span
                  key={`text-${i}`}
                  style={{
                    position: 'absolute',
                    left: mm(t.x),
                    top: mm(baselineToTop(t.baseline, t.fontSize)),
                    fontSize: pt(t.fontSize),
                    lineHeight: 1,
                    fontFamily: t.serifItalic ? FONT_TIMES : FONT_HELVETICA,
                    fontWeight: t.bold ? 'bold' : 'normal',
                    fontStyle: t.muted || t.serifItalic ? 'italic' : 'normal',
                    letterSpacing: t.letterSpacing ? mm(t.letterSpacing) : undefined,
                    wordSpacing: t.wordSpacing ? mm(t.wordSpacing) : undefined,
                    color: rgb(t.color ?? (t.muted ? PLACEHOLDER_RGB : DARK_TEXT_RGB)),
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
