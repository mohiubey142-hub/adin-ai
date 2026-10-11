// src/components/cover-letter/components/ExecutivePreview.tsx
// Live preview that mirrors ExecutiveTemplate.ts (same layout numbers, same page-break rules).

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  cleanText,
  cleanEmail,
  cleanPhoneNumber,
  cleanLinkedin,
  cleanLetterBody,
} from '../utils/pdfHelpers';

interface ExecutivePreviewProps {
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
const rgb = ([r, g, b]: RGB) => `rgb(${r}, ${g}, ${b})`;

// ---------- Page geometry (same as PDF) ----------
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 20;
const MARGIN_Y = 18;
const BOTTOM_MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

// ---------- Design tokens (same as PDF) ----------
const DARK_TEXT_RGB: RGB = [20, 22, 28];
const NAVY_RGB: RGB = [27, 42, 74];
const PAGE_BG_RGB: RGB = [238, 241, 245];
const GOLD_RGB: RGB = [212, 175, 55];
const PLACEHOLDER_RGB: RGB = [156, 163, 175];
const PAGE_SHADOW = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
const BAR_HEIGHT = 7;

const FONT_FAMILY = 'Helvetica, Arial, "Liberation Sans", sans-serif';
const FONT_WEIGHT_BOLD = 'bold';
const FONT_WEIGHT_NORMAL = 'normal';
const FONT_ASCENT_EM = 0.905;
const FONT_DESCENT_EM = 0.212;
const HALF_LEADING_K = (FONT_ASCENT_EM - FONT_DESCENT_EM) / 2;
const TEXT_BOX_LINE_HEIGHT_EM = 1;
const MEASURE_REFERENCE_PX = 100;

// ---------- Sizes / spacing (same as PDF) ----------
const PT_MM = 0.3528;
const SIZE_BODY = 10;
const SIZE_CONTACT = 8.8;
const SIZE_NAME_START = 27.2;
const SIZE_NAME_MIN = 16;
const SIGNATURE_NAME_BASE_FONT_SIZE = 12 * 1.3; // SIGNATURE_NAME_BASE_FONT_SIZE (12pt + 30%)
const SIGNATURE_NAME_FONT_SIZE_DECREASE = 0.3; // SIGNATURE_NAME_FONT_SIZE_DECREASE (30% total)
const SIZE_SIGNATURE_NAME = SIGNATURE_NAME_BASE_FONT_SIZE * (1 - SIGNATURE_NAME_FONT_SIZE_DECREASE);

const BODY_LINE_ADVANCE = 5;
const GAP_AFTER_PARAGRAPH = 3;
const PAGE_BREAK_SAFETY = 3;
const CONTACT_LINE_ADVANCE = 4.6;
const CONTACT_ITEM_GAP = 6;
const NAME_TO_CONTACT = 8; // used only when there is no job title
const CAP_HEIGHT_RATIO = 0.72;
const SIZE_TITLE = 12;
const TITLE_LINE_HEIGHT_FACTOR = 1.2;
const HEADER_ROW_GAP = 3.5; // equal white space: name -> title and title -> contact (mm)
const CONTACT_SHIFT_RIGHT = 0.5; // contact block only: nudged right (mm)
const PHOTO_SIZE = 34;
const PHOTO_TO_TEXT_GAP = 9;
const HEADER_TOP = BAR_HEIGHT + 8;
const DIVIDER_THICKNESS = 1.2;
const GAP_AFTER_HEADER = 6;
const GAP_AFTER_DIVIDER = 9;
const GAP_AFTER_DATE = 11;
const GAP_AFTER_RECIPIENT = 5.5;
const GAP_AFTER_COMPANY = 11;
const GAP_AFTER_SALUTATION = 10;
const SIGNATURE_MIN_SPACE = 28;
const GAP_AFTER_CLOSING = 7;
const SIGNATURE_NAME_SHIFT_DOWN = 1; // name only, not 'Sincerely,'
const SIGNATURE_NAME_SHIFT_LEFT = 0.5; // name only, not 'Sincerely,'

const WRAPPED_LINE_HEIGHT_PER_PT = 0.55;
const JSPDF_LINE_HEIGHT_FACTOR = 1.15;

const SHOW_SUBJECT = false; // keep in sync with ExecutiveTemplate.ts
const SUBJECT_LINE_ADVANCE = 4.5;
const GAP_AFTER_SUBJECT = 5;

const DEFAULT_NAME = 'Your Name';
const DEFAULT_TITLE = 'Job Title';
const DEFAULT_SUBJECT_POSITION = 'Position';
const DEFAULT_HIRING_MANAGER = 'Hiring Manager';
const SUBJECT_PREFIX = 'RE: Application for ';
const CLOSING_TEXT = 'Sincerely,';
const PHOTO_DATA_PREFIX = 'data:image';
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

// ---------- Layout ops ----------
interface TextOp {
  page: number;
  x: number;
  baseline: number;
  text: string;
  fontSize: number;
  bold: boolean;
  color: RGB;
  muted?: boolean;
}

interface RectOp {
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: RGB;
}

interface PhotoOp {
  x: number;
  y: number;
  size: number;
}

interface Layout {
  texts: TextOp[];
  rects: RectOp[];
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

interface ContactItem { label: string; text: string; }

const buildLayout = (input: LayoutInput): Layout => {
  const { userName, email, phoneNumber, selectedCountryCode, address, linkedin, jobTitle, company, generatedLetter, hasPhoto } = input;

  const texts: TextOp[] = [];
  const rects: RectOp[] = [];
  let photo: PhotoOp | null = null;
  let page = 0;
  let currentY = MARGIN_Y;

  const cleanHiringManager = cleanText(input.hiringManagerName || DEFAULT_HIRING_MANAGER);

  const push = (text: string, x: number, baseline: number, fontSize: number, bold: boolean, color: RGB = DARK_TEXT_RGB, muted?: boolean) => {
    texts.push({ page, x, baseline, text, fontSize, bold, color, muted });
  };

  const renderWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, bold: boolean): number => {
    if (!text) return y;
    const lines = splitTextToSize(text, maxWidth, fontSize, bold);
    const lineHeight = fontSize * WRAPPED_LINE_HEIGHT_PER_PT;
    lines.forEach((line, i) => push(line, x, y + i * lineHeight, fontSize, bold));
    return y + lines.length * lineHeight;
  };

  // jsPDF-style multi-line text with explicit advance
  const renderTextLines = (lines: string[], x: number, y: number, fontSize: number, bold: boolean, advance?: number) => {
    const step = advance ?? fontSize * PT_TO_MM * JSPDF_LINE_HEIGHT_FACTOR;
    lines.forEach((line, i) => push(line, x, y + i * step, fontSize, bold));
  };

  const getRemainingSpace = () => PAGE_HEIGHT - BOTTOM_MARGIN - currentY;
  const addPage = () => { page += 1; currentY = MARGIN_Y; };
  const checkAndAddPage = (neededHeight: number) => {
    if (getRemainingSpace() < neededHeight + PAGE_BREAK_SAFETY) addPage();
  };

  // ---------- Header ----------
  const textX = hasPhoto ? MARGIN_X + PHOTO_SIZE + PHOTO_TO_TEXT_GAP : MARGIN_X;
  const textMaxW = PAGE_WIDTH - textX - MARGIN_X;

  if (hasPhoto) {
    photo = { x: MARGIN_X, y: HEADER_TOP, size: PHOTO_SIZE };
  }

  // Name (auto-shrinks to fit one line)
  const nameText = cleanText(userName || DEFAULT_NAME).toUpperCase();
  let nameSize = SIZE_NAME_START;
  while (nameSize > SIZE_NAME_MIN) {
    if (textWidthMm(nameText, nameSize, true) <= textMaxW) break;
    nameSize -= 1;
  }
  const nameLines = splitTextToSize(nameText, textMaxW, nameSize, true);
  const nameCap = nameSize * PT_MM * CAP_HEIGHT_RATIO;
  const nameLH = nameSize * PT_MM * 1.1;

  // Contact items: Email, Phone, LinkedIn, Address
  const contactItems: ContactItem[] = [];
  if (email) { const v = cleanEmail(email); if (v) contactItems.push({ label: 'Email:', text: v }); }
  if (phoneNumber && selectedCountryCode) { const v = cleanPhoneNumber(phoneNumber, selectedCountryCode); if (v) contactItems.push({ label: 'Phone:', text: v }); }
  if (linkedin) { const v = cleanLinkedin(linkedin); if (v) contactItems.push({ label: 'LinkedIn:', text: v }); }
  if (address) { const v = cleanText(address); if (v) contactItems.push({ label: 'Address:', text: v }); }

  const labelWidth = (item: ContactItem) => textWidthMm(item.label + ' ', SIZE_CONTACT, true);
  const itemWidth = (item: ContactItem) => labelWidth(item) + textWidthMm(item.text, SIZE_CONTACT, false);

  const contactLines: ContactItem[][] = [];
  let cur: ContactItem[] = [];
  let curW = 0;
  for (const item of contactItems) {
    const w = itemWidth(item);
    const add = cur.length ? CONTACT_ITEM_GAP + w : w;
    if (cur.length && curW + add > textMaxW) {
      contactLines.push(cur);
      cur = [item];
      curW = w;
    } else {
      cur.push(item);
      curW += add;
    }
  }
  if (cur.length) contactLines.push(cur);

  // Job title sits between name and contact
  const titleText = cleanText(jobTitle || '').trim();
  const titleLines = titleText ? splitTextToSize(titleText, textMaxW, SIZE_TITLE, false) : [];
  const hasTitle = titleLines.length > 0;
  const titleCap = SIZE_TITLE * PT_MM * CAP_HEIGHT_RATIO;
  const titleLH = SIZE_TITLE * PT_MM * TITLE_LINE_HEIGHT_FACTOR;
  const contactCap = SIZE_CONTACT * PT_MM * CAP_HEIGHT_RATIO;

  // Equal visible gaps: (name -> title) == (title -> contact)
  const nameToTitle = HEADER_ROW_GAP + titleCap;
  const titleToContact = HEADER_ROW_GAP + contactCap;
  const contactGap = hasTitle ? titleToContact : NAME_TO_CONTACT;
  const titleBlockH = hasTitle ? nameToTitle + (titleLines.length - 1) * titleLH : 0;

  const blockH = nameCap + (nameLines.length - 1) * nameLH + titleBlockH +
    (contactLines.length ? contactGap + (contactLines.length - 1) * CONTACT_LINE_ADVANCE : 0);
  const areaH = hasPhoto ? PHOTO_SIZE : blockH;
  const topY = HEADER_TOP + Math.max(0, (areaH - blockH) / 2);

  let baseY = topY + nameCap;
  nameLines.forEach((line, i) => push(line, textX, baseY + i * nameLH, nameSize, true, NAVY_RGB));
  baseY += (nameLines.length - 1) * nameLH;

  if (hasTitle) {
    baseY += nameToTitle;
    titleLines.forEach((line, i) => push(line, textX, baseY + i * titleLH, SIZE_TITLE, false, NAVY_RGB));
    baseY += (titleLines.length - 1) * titleLH;
  }

  if (contactLines.length) {
    baseY += contactGap;
    let lineY = baseY;
    contactLines.forEach((line) => {
      let x = textX + CONTACT_SHIFT_RIGHT;
      line.forEach((item) => {
        push(item.label, x, lineY, SIZE_CONTACT, true);
        push(item.text, x + labelWidth(item), lineY, SIZE_CONTACT, false);
        x += itemWidth(item) + CONTACT_ITEM_GAP;
      });
      lineY += CONTACT_LINE_ADVANCE;
    });
    baseY = lineY - CONTACT_LINE_ADVANCE;
  }

  const headerBottom = Math.max(hasPhoto ? HEADER_TOP + areaH : 0, baseY + 2);
  currentY = headerBottom + GAP_AFTER_HEADER;

  // ---------- Gold divider ----------
  rects.push({ page, x: MARGIN_X, y: currentY, w: CONTENT_WIDTH, h: DIVIDER_THICKNESS, color: GOLD_RGB });
  currentY += DIVIDER_THICKNESS + GAP_AFTER_DIVIDER;

  // ---------- Date ----------
  const today = new Date().toLocaleDateString(DATE_LOCALE, DATE_FORMAT);
  push(today, MARGIN_X, currentY, SIZE_BODY, false);
  currentY += GAP_AFTER_DATE;

  // ---------- Recipient ----------
  // Show the name line only when a real name was given; with no name the
  // recipient block starts with the company, and the salutation stays
  // "Dear Hiring Manager," (no duplicate "Hiring Manager" line).
  const hasRealHiringManagerName =
    !!(input.hiringManagerName && input.hiringManagerName.trim()) &&
    cleanHiringManager.trim().toLowerCase() !== DEFAULT_HIRING_MANAGER.toLowerCase();
  if (hasRealHiringManagerName) {
    push(`${cleanHiringManager},`, MARGIN_X, currentY, SIZE_BODY, false);
    currentY += GAP_AFTER_RECIPIENT;
  }

  if (company) {
    const companyLines = splitTextToSize(cleanText(company), CONTENT_WIDTH, SIZE_BODY, true);
    renderTextLines(companyLines, MARGIN_X, currentY, SIZE_BODY, true);
    currentY += (companyLines.length - 1) * GAP_AFTER_RECIPIENT;
  }
  currentY += GAP_AFTER_COMPANY;

  // ---------- Optional subject ----------
  if (SHOW_SUBJECT) {
    const subject = `${SUBJECT_PREFIX}${cleanText(jobTitle || DEFAULT_SUBJECT_POSITION)}`;
    const wrappedSubject = splitTextToSize(subject, CONTENT_WIDTH, SIZE_BODY, false);
    renderTextLines(wrappedSubject, MARGIN_X, currentY, SIZE_BODY, false);
    currentY += wrappedSubject.length * SUBJECT_LINE_ADVANCE + GAP_AFTER_SUBJECT;
  }

  // ---------- Salutation ----------
  push(`Dear ${cleanHiringManager},`, MARGIN_X, currentY, SIZE_BODY, false);
  currentY += GAP_AFTER_SALUTATION;

  // ---------- Body ----------
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

    const lines = splitTextToSize(trimmed, CONTENT_WIDTH, SIZE_BODY, false);
    checkAndAddPage(lines.length * BODY_LINE_ADVANCE + GAP_AFTER_PARAGRAPH);
    renderTextLines(lines, MARGIN_X, currentY, SIZE_BODY, false, BODY_LINE_ADVANCE);
    currentY += lines.length * BODY_LINE_ADVANCE + GAP_AFTER_PARAGRAPH;
    drewAnyParagraph = true;
  });

  if (!drewAnyParagraph) {
    push(PLACEHOLDER_TEXT, MARGIN_X, currentY, SIZE_BODY, false, PLACEHOLDER_RGB, true);
  }

  // ---------- Sign-off ----------
  if (getRemainingSpace() < SIGNATURE_MIN_SPACE) addPage();

  push(CLOSING_TEXT, MARGIN_X, currentY, SIZE_BODY, false);
  currentY += GAP_AFTER_CLOSING;

  renderWrappedText(cleanText(userName || DEFAULT_NAME), MARGIN_X - SIGNATURE_NAME_SHIFT_LEFT, currentY + SIGNATURE_NAME_SHIFT_DOWN, CONTENT_WIDTH, SIZE_SIGNATURE_NAME, true);

  return { texts, rects, photo, pageCount: page + 1 };
};

const baselineToTop = (baseline: number, fontSize: number): number => {
  const boxHeight = fontSize * PT_TO_MM * TEXT_BOX_LINE_HEIGHT_EM;
  const baselineInsideBox = boxHeight / 2 + HALF_LEADING_K * fontSize * PT_TO_MM;
  return baseline - baselineInsideBox;
};

export const ExecutivePreview = ({
  letter, photo, name, title, email, phone, countryCode, userAddress, linkedinUrl, companyName, hiringManagerName,
}: ExecutivePreviewProps) => {
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
            <div key={pageIndex} style={{ position: 'relative', flexShrink: 0, width: mm(PAGE_WIDTH), height: mm(PAGE_HEIGHT), overflow: 'hidden', backgroundColor: rgb(PAGE_BG_RGB), boxShadow: PAGE_SHADOW, fontFamily: FONT_FAMILY }}>
              {/* Navy top bar on every page */}
              <div style={{ position: 'absolute', left: 0, top: 0, width: mm(PAGE_WIDTH), height: mm(BAR_HEIGHT), backgroundColor: rgb(NAVY_RGB) }} />

              {/* Clean circular photo: no border, no ring */}
              {pageIndex === 0 && layout.photo && photo && (
                <img src={photo} alt="" style={{ position: 'absolute', left: mm(layout.photo.x), top: mm(layout.photo.y), width: mm(layout.photo.size), height: mm(layout.photo.size), borderRadius: '50%', objectFit: 'cover', border: 'none', outline: 'none', boxShadow: 'none' }} />
              )}

              {/* Gold divider (flat) */}
              {layout.rects.filter((r) => r.page === pageIndex).map((r, i) => (
                <div key={`rect-${i}`} style={{ position: 'absolute', left: mm(r.x), top: mm(r.y), width: mm(r.w), height: mm(r.h), backgroundColor: rgb(r.color) }} />
              ))}

              {layout.texts.filter((t) => t.page === pageIndex).map((t, i) => (
                <span key={`text-${i}`} style={{ position: 'absolute', left: mm(t.x), top: mm(baselineToTop(t.baseline, t.fontSize)), fontSize: pt(t.fontSize), lineHeight: TEXT_BOX_LINE_HEIGHT_EM, fontWeight: t.bold ? FONT_WEIGHT_BOLD : FONT_WEIGHT_NORMAL, fontStyle: t.muted ? 'italic' : 'normal', color: rgb(t.color), whiteSpace: 'pre' }}>
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
