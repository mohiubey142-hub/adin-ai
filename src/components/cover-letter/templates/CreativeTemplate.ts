// src/components/cover-letter/templates/CreativeTemplate.ts
// Design: dark black full-width header band (name + title + contact in light text, circular photo on the right),
// date right-aligned under the band, bold recipient, justified body, styled signature.
// Logic (sanitizing, cleaning helpers, paragraph filters, page-break rules) is unchanged.

import jsPDF from 'jspdf';
import { 
    cleanText, 
    cleanEmail, 
    cleanPhoneNumber, 
    cleanLinkedin,
    cleanLetterBody
} from '../utils/pdfHelpers';
import { CoverLetterData, PDFTemplate } from './BaseTemplate';

type RGB = [number, number, number];

function sanitizeTextForPdf(text: string): string {
  if (!text) return text;
  return text
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[\u00A0\u2000-\u200A\u202F\u205F]/g, ' ')
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
    .replace(/[^\x00-\xFF]/g, '');
}

function deepSanitizeForPdf<T>(value: T): T {
  if (typeof value === 'string') return sanitizeTextForPdf(value) as unknown as T;
  if (Array.isArray(value)) return value.map((item) => deepSanitizeForPdf(item)) as unknown as T;
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      result[key] = deepSanitizeForPdf((value as Record<string, unknown>)[key]);
    }
    return result as T;
  }
  return value;
}

// Circular crop with NO shadow / border (own helper, replaces makeCircularImage for this template)
function makeCircularImageNoShadow(src: string, bg: RGB = [255, 255, 255], sizePx = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = sizePx;
      canvas.height = sizePx;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      // opaque background matching the header band -> no transparent/alpha edge, so no dark fringe in PDF viewers
      ctx.fillStyle = `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`;
      ctx.fillRect(0, 0, sizePx, sizePx);
      ctx.beginPath();
      ctx.arc(sizePx / 2, sizePx / 2, sizePx / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      // cover-fit (centered crop)
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, sizePx, sizePx);
      resolve(canvas.toDataURL('image/jpeg', 0.98));
    };
    img.onerror = () => reject(new Error('Failed to load profile photo'));
    img.src = src;
  });
}

export class CreativeTemplate implements PDFTemplate {
    async render(data: CoverLetterData): Promise<Blob> {
        const sanitizedData = deepSanitizeForPdf(data);
        const { 
            userName, email, phoneNumber, selectedCountryCode, address, linkedin, 
            jobTitle, company, generatedLetter, profilePhoto, hiringManagerName,
        } = sanitizedData;

        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const marginX = 18;
        const marginY = 18;
        let currentY = marginY;
        const BOTTOM_MARGIN = 16;
        const PT = 0.3528; // 1pt in mm

        const DARK_TEXT_COLOR: RGB = [15, 15, 15];
        const HEADER_BG: RGB = [0, 0, 0];               // flat matte black header band (no gradient / no shine)
        const HEADER_NAME_COLOR: RGB = [255, 255, 255];
        const HEADER_SUB_COLOR: RGB = [214, 221, 232];  // title on the band
        const HEADER_CONTACT_COLOR: RGB = [235, 235, 235]; // contact: soft white (slightly dimmed)
        const cleanHiringManager = cleanText(hiringManagerName || 'Hiring Manager');

        // body metrics
        const BODY_FS = 10;
        const LINE_H = 5;
        const PARA_GAP = 3;
        // true = justified body (word-by-word placement); false = plain left-aligned lines
        // (safest for ATS / copy-paste text extraction).
        const JUSTIFY_BODY = true;
        // Space the last paragraph keeps free so "Sincerely," + name never land alone on a new page.
        const SIGNATURE_BLOCK_H = 22;

        const setText = (size: number, style: 'normal' | 'bold' | 'italic' = 'normal', font = 'helvetica', color: RGB = DARK_TEXT_COLOR) => {
            pdf.setFont(font, style);
            pdf.setFontSize(size);
            pdf.setTextColor(color[0], color[1], color[2]);
        };

        const renderWrappedText = (
            text: string, x: number, y: number, maxWidth: number, fontSize: number,
            fontStyle: 'normal' | 'bold', color: RGB, lineHeightMultiplier = 1.0
        ) => {
            if (!text) return y;
            pdf.setFontSize(fontSize);
            pdf.setFont('helvetica', fontStyle);
            pdf.setTextColor(color[0], color[1], color[2]);
            const wrappedLines = pdf.splitTextToSize(text, maxWidth);
            const lineHeight = fontSize * 0.55 * lineHeightMultiplier;
            for (let i = 0; i < wrappedLines.length; i++) {
                pdf.text(wrappedLines[i], x, y + (i * lineHeight));
            }
            return y + (wrappedLines.length * lineHeight);
        };

        const getRemainingSpace = () => pageHeight - BOTTOM_MARGIN - currentY;

        const checkAndAddPageLocal = (neededHeight: number) => {
            if (getRemainingSpace() < neededHeight + 3) {
                pdf.addPage();
                currentY = marginY;
                return true;
            }
            return false;
        };

        // ---------- design helpers ----------

        // justified lines (last line of paragraph stays left-aligned)
        const drawJustifiedLines = (lines: string[], x: number, y: number, width: number) => {
            if (!JUSTIFY_BODY) { lines.forEach((l, i) => pdf.text(l, x, y + i * LINE_H)); return; }
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const yy = y + i * LINE_H;
                const words = line.trim().split(/\s+/);
                const isLast = i === lines.length - 1;
                if (isLast || words.length < 2) { pdf.text(line, x, yy); continue; }
                const spaceW = pdf.getTextWidth(' ');
                const wordsW = words.reduce((s, w) => s + pdf.getTextWidth(w), 0);
                const gap = (width - wordsW) / (words.length - 1);
                if (gap < spaceW * 0.8 || gap > spaceW * 3.5) { pdf.text(line, x, yy); continue; }
                let cx = x;
                for (const w of words) {
                    pdf.text(w, cx, yy);
                    cx += pdf.getTextWidth(w) + gap;
                }
            }
        };

        // ---------- HEADER (dark band) ----------
        const photoSize = 35;
        const photoTop = 9;
        const photoX = pageWidth - marginX - photoSize;

        let circularImage: string | null = null;
        if (profilePhoto && profilePhoto.startsWith('data:image')) {
            try {
                circularImage = await makeCircularImageNoShadow(profilePhoto, HEADER_BG);
            } catch (err) {
                console.error('Failed to add profile photo to PDF:', err);
                circularImage = null;
            }
        }

        const textX = marginX;
        const textMaxWidth = circularImage ? photoX - 6 - textX : pageWidth - marginX * 2;

        // name (auto-shrinks to fit)
        const name = cleanText(userName || 'Your Name');
        let nameSize = circularImage ? 15.84 : 17.6;
        pdf.setFont('helvetica', 'bold');
        while (nameSize > 9) {
            pdf.setFontSize(nameSize);
            if (pdf.getTextWidth(name) <= textMaxWidth) break;
            nameSize -= 0.5;
        }
        pdf.setFontSize(nameSize);
        const nameLines: string[] = pdf.splitTextToSize(name, textMaxWidth);
        const nameLH = nameSize * PT * 1.1;
        const nameBaseline = circularImage ? 19 : 20;
        const nameLastY = nameBaseline + (nameLines.length - 1) * nameLH;

        // title (letter-spaced)
        const title = cleanText(jobTitle || 'Job Title').toUpperCase();
        let titleSize = circularImage ? 8.8 : 9.68;
        pdf.setFont('helvetica', 'normal');
        while (titleSize > 6) {
            pdf.setFontSize(titleSize);
            if (pdf.getTextWidth(title) + title.length * 0.45 <= textMaxWidth) break;
            titleSize -= 0.25;
        }
        const titleY = nameLastY + 6.5;

        // contact: one row of plain "Label: value" items (wraps to next row only if needed)
        const contactItems: string[] = [];
        if (email) { const v = cleanEmail(email); if (v) contactItems.push(`Email: ${v}`); }
        if (phoneNumber && selectedCountryCode) { const v = cleanPhoneNumber(phoneNumber, selectedCountryCode); if (v) contactItems.push(`Phone: ${v}`); }
        if (linkedin) { const v = cleanLinkedin(linkedin); if (v) contactItems.push(`LinkedIn: ${v}`); }
        if (address) { const v = cleanText(address); if (v) contactItems.push(`Address: ${v}`); }

        const CONTACT_FS = circularImage ? 8.25 : 8.8;
        const CONTACT_LH = 4.5;
        const CONTACT_GAP = 7; // mm between items
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(CONTACT_FS);
        const contactPieces: { text: string; x: number; line: number }[] = [];
        let contactX = textX;
        let contactLine = 0;
        for (const item of contactItems) {
            const w = pdf.getTextWidth(item);
            if (contactX > textX && contactX + w > textX + textMaxWidth) { contactLine++; contactX = textX; }
            if (w > textMaxWidth) {
                const parts = pdf.splitTextToSize(item, textMaxWidth) as string[];
                parts.forEach((part, k) => {
                    if (k > 0) contactLine++;
                    contactPieces.push({ text: part, x: textX, line: contactLine });
                });
                contactX = textX + pdf.getTextWidth(parts[parts.length - 1]) + CONTACT_GAP;
                continue;
            }
            contactPieces.push({ text: item, x: contactX, line: contactLine });
            contactX += w + CONTACT_GAP;
        }
        const contactStartY = titleY + 6;
        const textBottom = contactItems.length ? contactStartY + contactLine * CONTACT_LH : titleY;

        const photoBottom = circularImage ? photoTop + photoSize : 0;
        const bandHeight = Math.max(photoBottom + 9, textBottom + 9);

        // draw band, photo, header text
        pdf.setFillColor(HEADER_BG[0], HEADER_BG[1], HEADER_BG[2]);
        pdf.rect(0, 0, pageWidth, bandHeight, 'F');

        if (circularImage) {
            pdf.addImage(circularImage, 'JPEG', photoX, photoTop, photoSize, photoSize);
        }

        setText(nameSize, 'bold', 'helvetica', HEADER_NAME_COLOR);
        nameLines.forEach((l, i) => pdf.text(l, textX, nameBaseline + i * nameLH));

        setText(titleSize, 'normal', 'helvetica', HEADER_SUB_COLOR);
        pdf.text(title, textX, titleY, { charSpace: 0.45 });

        setText(CONTACT_FS, 'normal', 'helvetica', HEADER_CONTACT_COLOR);
        contactPieces.forEach((c) => pdf.text(c.text, c.x, contactStartY + c.line * CONTACT_LH));

        currentY = bandHeight + 9;

        // ---------- LETTER META ----------
        const maxWidth = pageWidth - marginX * 2;

        const now = new Date();
        const today = `${String(now.getDate()).padStart(2, '0')} ${now.toLocaleDateString('en-US', { month: 'long' })} ${now.getFullYear()}`;
        setText(9.5, 'bold');
        pdf.text(today, pageWidth - marginX, currentY, { align: 'right' });
        currentY += 9;

        setText(10.5, 'bold');
        // Show the name line only when a real name was given; with no name the
        // recipient block starts with the company, and the salutation stays
        // "Dear Hiring Manager," (no duplicate "Hiring Manager" line).
        const hasRealHiringManagerName =
            !!(hiringManagerName && hiringManagerName.trim()) &&
            cleanHiringManager.trim().toLowerCase() !== 'hiring manager';
        if (hasRealHiringManagerName) {
            pdf.text(cleanHiringManager, marginX, currentY);
            currentY += 5;
        }

        if (company) {
            const companyY = renderWrappedText(cleanText(company), marginX, currentY, maxWidth, 10, 'normal', DARK_TEXT_COLOR);
            currentY = companyY + 2;
        }
        currentY += 2;

        const subject = `RE: Application for ${cleanText(jobTitle || 'Position')}`;
        setText(BODY_FS, 'normal');
        const wrappedSubject = pdf.splitTextToSize(subject, maxWidth);
        pdf.text(wrappedSubject, marginX, currentY);
        currentY += wrappedSubject.length * 4.5 + 5;

        setText(10.5, 'normal');
        pdf.text(`Dear ${cleanHiringManager},`, marginX, currentY);
        currentY += 6;

        setText(BODY_FS, 'normal');

        // ---------- BODY (rules / filters / page breaks unchanged) ----------
        let cleanLetter = cleanLetterBody(generatedLetter, cleanHiringManager).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const paragraphs = cleanLetter.split(/\n\n+/);

        const shouldSkipParagraph = (p: string): boolean => {
            const wordCount = p.split(/\s+/).length;
            if (p.match(/^\w+ \d{1,2}, \d{4}$/)) return true;
            if (p === 'Hiring Manager') return true;
            if (p === cleanHiringManager) return true;
            // Subject-like lines only: starts with "RE:" or is a short "Application for ..." line.
            // A real body paragraph that merely mentions "Application for" is kept.
            if (/^re:/i.test(p) || (p.includes('Application for') && wordCount <= 12)) return true;
            if (p === company) return true;
            if (p === cleanText(company)) return true;
            if (p === userName || p === userName?.toUpperCase()) return true;
            if (p === jobTitle) return true;
            if (p.toLowerCase().includes('dear hiring manager')) return true;
            if (p.toLowerCase().startsWith('dear ')) return true;
            if (p.startsWith('Hiring Manager')) return true;
            // Contact-style lines only: a long paragraph that mentions an email is kept.
            if (p.includes('@') && (p.includes('|') || p.includes('gmail')) && wordCount < 10) return true;
            return false;
        };

        const keptParagraphs = paragraphs.map((p) => p.trim()).filter((p) => p && !shouldSkipParagraph(p));

        for (let pIndex = 0; pIndex < keptParagraphs.length; pIndex++) {
            const trimmedParagraph = keptParagraphs[pIndex];
            const isLastParagraph = pIndex === keptParagraphs.length - 1;

            const estimatedLines = pdf.splitTextToSize(trimmedParagraph, maxWidth);
            // Last paragraph travels together with the signature block.
            checkAndAddPageLocal(estimatedLines.length * LINE_H + PARA_GAP + (isLastParagraph ? SIGNATURE_BLOCK_H : 0));
            
            setText(BODY_FS, 'normal');
            const wrappedLines: string[] = pdf.splitTextToSize(trimmedParagraph, maxWidth);
            drawJustifiedLines(wrappedLines, marginX, currentY, maxWidth);
            currentY += wrappedLines.length * LINE_H + PARA_GAP;
        }

        // ---------- SIGNATURE ----------
        currentY += 4;
        if ((pageHeight - BOTTOM_MARGIN - currentY) < 20) {
            pdf.addPage();
            currentY = marginY;
        }

        setText(BODY_FS, 'normal');
        pdf.text('Sincerely,', marginX, currentY);
        currentY += 6.5;

        // single signature line: Times italic, 12pt + 40%, then reduced by 30% in total,
        // nudged down and left of 'Sincerely,' (name only)
        const SIGNATURE_NAME_ORIGINAL_FONT_SIZE = 12;
        const SIGNATURE_NAME_FONT_SIZE_INCREASE = 0.40;
        const SIGNATURE_NAME_FONT_SIZE_DECREASE = 0.30;
        const SIGNATURE_NAME_BASE_FONT_SIZE = SIGNATURE_NAME_ORIGINAL_FONT_SIZE * (1 + SIGNATURE_NAME_FONT_SIZE_INCREASE);
        const SIGNATURE_NAME_FONT_SIZE = SIGNATURE_NAME_BASE_FONT_SIZE * (1 - SIGNATURE_NAME_FONT_SIZE_DECREASE);
        const SIGNATURE_NAME_EXTRA_DOWN = 1.5;
        const SIGNATURE_NAME_EXTRA_LEFT = 0.5;
        setText(SIGNATURE_NAME_FONT_SIZE, 'italic', 'times');
        pdf.text(cleanText(userName || 'Your Name'), marginX - SIGNATURE_NAME_EXTRA_LEFT, currentY + SIGNATURE_NAME_EXTRA_DOWN);

        return pdf.output('blob');
    }
}
