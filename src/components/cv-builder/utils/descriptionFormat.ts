// src/components/cv-builder/utils/descriptionFormat.ts
// SINGLE source of truth for how a "description" box is turned into lines + how each line is marked.
// Templates / PDFs / TXT export only call these helpers; they never decide the format themselves.
//
//   bullets   -> "•  text"   (default; every pre-existing CV keeps this look)
//   numbered  -> "1. text"
//   paragraph -> plain text, no marker (each typed line is its own paragraph line)

import type { DescriptionAlign, DescriptionFormat } from '../types/cvExtraTypes';

export const DESCRIPTION_FORMATS: readonly DescriptionFormat[] = ['bullets', 'numbered', 'paragraph'];
export const DEFAULT_DESCRIPTION_FORMAT: DescriptionFormat = 'bullets';

export const DESCRIPTION_FORMAT_LABELS: Record<DescriptionFormat, string> = {
  bullets: 'Bullets',
  numbered: 'Numbering',
  paragraph: 'Paragraph',
};

/** 'justify' only counts for the Paragraph format; everything else is left aligned. */
export const getDescriptionAlign = (
  item: { descriptionFormat?: DescriptionFormat | string; descriptionAlign?: DescriptionAlign | string } | null | undefined
): DescriptionAlign =>
  getDescriptionFormat(item) === 'paragraph' && item?.descriptionAlign === 'justify' ? 'justify' : 'left';

/** Unknown / missing value -> bullets (old saved CVs). */
export const normalizeDescriptionFormat = (v: unknown): DescriptionFormat =>
  v === 'numbered' || v === 'paragraph' || v === 'bullets' ? v : DEFAULT_DESCRIPTION_FORMAT;

export const getDescriptionFormat = (
  item: { descriptionFormat?: DescriptionFormat | string } | null | undefined
): DescriptionFormat => normalizeDescriptionFormat(item?.descriptionFormat);

// A typed leading marker ("•", "-", "*", "1.", "2)") is removed so the chosen format never double-marks.
const LEADING_MARKER = /^(?:[•●◦▪‣∙‧–—*-]|\d{1,3}[.)])\s+/;

/** Non-empty trimmed lines of a description with any typed leading marker stripped. */
export const parseDescriptionLines = (text?: string | null): string[] =>
  (text || '')
    .split('\n')
    .map((raw) => raw.trim().replace(LEADING_MARKER, '').trim())
    .filter(Boolean);

/** The marker drawn before line `index` (0-based). Paragraph has none. */
export const getLineMarker = (format: DescriptionFormat, index: number, bullet = '•'): string =>
  format === 'numbered' ? `${index + 1}.` : format === 'bullets' ? bullet : '';

/**
 * Rewrites the text shown in the editor box when the user switches format:
 *   bullets -> "• line", numbered -> "1. line", paragraph -> "line".
 * Any marker the user typed before is replaced (never doubled). Empty text stays empty.
 */
export const applyDescriptionFormat = (text: string | undefined | null, format: DescriptionFormat): string =>
  parseDescriptionLines(text)
    .map((line, i) => {
      const marker = getLineMarker(format, i);
      return marker ? `${marker} ${line}` : line;
    })
    .join('\n');

/** Plain-text version used by TXT / Copy export. */
export const formatDescriptionText = (
  item: { description?: string; descriptionFormat?: DescriptionFormat | string } | null | undefined,
  indent = ''
): string => {
  const format = getDescriptionFormat(item);
  // Bullets = the original behaviour, byte-for-byte (text is exported as typed, indented).
  if (format === 'bullets') {
    return item?.description ? `${indent}${item.description.replace(/\n/g, `\n${indent}`)}\n` : '';
  }
  const lines = parseDescriptionLines(item?.description);
  if (lines.length === 0) return '';
  return lines
    .map((line, i) => {
      const marker = getLineMarker(format, i, '-');
      return `${indent}${marker ? marker + ' ' : ''}${line}\n`;
    })
    .join('');
};

/**
 * Width (same unit as `fontSize`, pt in the PDFs) reserved for the marker column.
 *   bullets   -> `bulletGap` (the template's own bullet indent; unchanged, so old CVs stay identical)
 *   numbered  -> widest number ("10.") in Helvetica metrics + half a bullet gap
 *   paragraph -> 0 (text starts at the left edge)
 * Preview and PDF both call this so their line wrapping and page breaks agree.
 */
export const getMarkerIndent = (
  format: DescriptionFormat,
  itemCount: number,
  fontSize: number,
  bulletGap: number
): number => {
  if (format === 'paragraph') return 0;
  if (format === 'numbered') {
    const digits = String(Math.max(1, itemCount)).length;
    return fontSize * (0.556 * digits + 0.278) + bulletGap * 0.5;
  }
  return bulletGap;
};
