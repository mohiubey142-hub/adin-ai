// src/components/cv-builder/utils/pdf/pdfDescription.ts
// jsPDF helpers shared by every template's PDF generator for the Paragraph / Justify description formats.

import type { jsPDF } from 'jspdf';

/**
 * Draws ONE already-wrapped line stretched to `width` by raising the PDF word-spacing operator (Tw).
 * The text stays a normal string (selectable / ATS-readable); no per-word drawing. Falls back to a plain
 * left-aligned line when there is nothing to stretch or the gaps would look broken.
 */
export function drawJustifiedLine(doc: jsPDF, line: string, x: number, y: number, width: number): void {
  const spaces = (line.match(/ /g) || []).length;
  const extra = spaces > 0 ? (width - doc.getTextWidth(line)) / spaces : 0;
  if (spaces === 0 || extra <= 0 || extra > doc.getFontSize() * 1.2) {
    doc.text(line, x, y);
    return;
  }
  const k = doc.internal.scaleFactor;
  (doc.internal as any).write(`${(extra * k).toFixed(3)} Tw`);
  doc.text(line, x, y);
  (doc.internal as any).write('0 Tw');
}
