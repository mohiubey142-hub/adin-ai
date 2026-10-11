// src/components/cover-letter/templates/ProfessionalTemplate.ts
// Design: dark teal top bar, bold name + subtitle on the left, contact block (no headlines)
// on the right starting on the name's line, left-aligned letter. (No photo support.)
// Logic (cleaning, filters, overflow / page-break rules) is unchanged.

import jsPDF from 'jspdf';
import { 
    cleanText, 
    cleanEmail, 
    cleanPhoneNumber, 
    cleanLinkedin,
    cleanLetterBody
} from '../utils/pdfHelpers';
import { CoverLetterData, PDFTemplate } from './BaseTemplate';

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
  if (typeof value === 'string') {
    return sanitizeTextForPdf(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepSanitizeForPdf(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      result[key] = deepSanitizeForPdf((value as Record<string, unknown>)[key]);
    }
    return result as T;
  }
  return value;
}

type RGB = [number, number, number];

export class ProfessionalTemplate implements PDFTemplate {
    async render(data: CoverLetterData): Promise<Blob> {
        const sanitizedData = deepSanitizeForPdf(data);
        const { 
            userName, email, phoneNumber, selectedCountryCode, address, linkedin, 
            jobTitle, company, generatedLetter, hiringManagerName,
        } = sanitizedData;

        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const marginX = 20;
        const marginRight = 15;
        const marginY = 18;
        let currentY = marginY;
        const BOTTOM_MARGIN = 16;
        const maxWidth = pageWidth - marginX * 2;

        // ---- Colors (from design image) ----
        const DARK_TEXT_COLOR: RGB = [15, 15, 15];
        const DARK_TEAL: RGB = [0, 51, 51];

        // ---- Signature name size (pt) - change ONLY these to resize it ----
        const SIGNATURE_NAME_BASE_SIZE = 17.16;        // size before the reduction
        const SIGNATURE_NAME_REDUCE_PERCENT = 30;      // total reduction
        const SIGNATURE_NAME_SIZE =
            SIGNATURE_NAME_BASE_SIZE * (1 - SIGNATURE_NAME_REDUCE_PERCENT / 100);
        
        const cleanHiringManager = cleanText(hiringManagerName || 'Hiring Manager');

        // ---- Helpers ----
        const renderWrappedText = (
            text: string, x: number, y: number, maxW: number, fontSize: number,
            fontStyle: string, color: RGB, lineHeightMultiplier = 1.0
        ) => {
            if (!text) return y;
            pdf.setFontSize(fontSize);
            pdf.setFont('helvetica', fontStyle);
            pdf.setTextColor(color[0], color[1], color[2]);
            const wrappedLines = pdf.splitTextToSize(text, maxW);
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

        // ---- Contact items (same data rules as before) ----
        const contactItems: { label: string; value: string }[] = [];
        if (email) { const v = cleanEmail(email); if (v) contactItems.push({ label: 'EMAIL', value: v }); }
        if (phoneNumber && selectedCountryCode) { const v = cleanPhoneNumber(phoneNumber, selectedCountryCode); if (v) contactItems.push({ label: 'PHONE', value: v }); }
        if (linkedin) { const v = cleanLinkedin(linkedin); if (v) contactItems.push({ label: 'LINKEDIN', value: v }); }
        if (address) { const v = cleanText(address); if (v) contactItems.push({ label: 'ADDRESS', value: v }); }
        const hasSidebar = contactItems.length > 0;

        // ---- Layout columns ----
        const headerTop = 14;
        const nameBaseline = headerTop + 8;      // name baseline; contact block starts on this same line
        const sidebarMaxW = 38;
        const SIDEBAR_ANCHOR_CENTER_X = pageWidth - marginRight - 14.4; // base center line of contact block
        const SIDEBAR_EDGE_MARGIN = 8;           // contact never goes closer than this to the page edge
        const LINE_ADVANCE = 3.8;
        const ITEM_GAP = 4.5;

        // pre-compute contact lines/sizes
        // Every contact value keeps the SAME font size. A value that is too wide for the
        // column is wrapped onto 2-3 lines (long unbroken words such as emails / URLs are
        // split at a natural break like "@", "." or "/" , else by character) instead of
        // shrinking the font.
        const CONTACT_VALUE_SIZE = 8.5;
        const wrapContactValue = (value: string): string[] => {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(CONTACT_VALUE_SIZE);
            const out: string[] = [];
            for (const line of pdf.splitTextToSize(value, sidebarMaxW) as string[]) {
                if (pdf.getTextWidth(line) <= sidebarMaxW) { out.push(line); continue; }
                let chunk = '';
                for (const ch of line) {
                    if (chunk && pdf.getTextWidth(chunk + ch) > sidebarMaxW) {
                        const cut = Math.max(
                            chunk.lastIndexOf('@'), chunk.lastIndexOf('/'), chunk.lastIndexOf('.'),
                            chunk.lastIndexOf('-'), chunk.lastIndexOf('_')
                        );
                        if (cut >= Math.floor(chunk.length * 0.4) && cut < chunk.length - 1) {
                            out.push(chunk.slice(0, cut + 1));
                            chunk = chunk.slice(cut + 1) + ch;
                        } else {
                            out.push(chunk);
                            chunk = ch;
                        }
                    } else {
                        chunk += ch;
                    }
                }
                if (chunk) out.push(chunk);
            }
            return out;
        };

        const sidebarLayout = contactItems.map((item) => {
            const vSize = CONTACT_VALUE_SIZE;
            const vLines = wrapContactValue(item.value);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(vSize);
            const vWidth = Math.max(...vLines.map((l) => pdf.getTextWidth(l)));
            return { ...item, vSize, vLines, width: vWidth };
        });
        const sidebarW = hasSidebar ? Math.max(...sidebarLayout.map((i) => i.width)) : 0;
        // moved 20% of the block width to the right, clamped so it never overflows the page edge
        let sidebarX = SIDEBAR_ANCHOR_CENTER_X - sidebarW / 2 + sidebarW * 0.2;
        if (sidebarX + sidebarW > pageWidth - SIDEBAR_EDGE_MARGIN) sidebarX = pageWidth - SIDEBAR_EDGE_MARGIN - sidebarW;
        const sidebarBottomY = hasSidebar
            ? nameBaseline + sidebarLayout.reduce((sum, i) => sum + i.vLines.length * LINE_ADVANCE + ITEM_GAP, 0)
            : 0;

        const columnGap = 8;
        // beside the contact block the letter is narrower; below it (or on later pages) it is full width
        const page1Width = hasSidebar ? sidebarX - columnGap - marginX : maxWidth;
        const bodyWidthNow = () =>
            (pdf.getCurrentPageInfo().pageNumber === 1 && currentY < sidebarBottomY) ? page1Width : maxWidth;

        // ---- Top dark teal bar ----
        pdf.setFillColor(DARK_TEAL[0], DARK_TEAL[1], DARK_TEAL[2]);
        pdf.rect(0, 0, pageWidth, 4, 'F');

        // ---- Name + subtitle (left) ----
        const nameMaxW = hasSidebar ? sidebarX - 6 - marginX : maxWidth;
        const name = cleanText(userName || 'Your Name');
        let nameSize = 22;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(nameSize);
        while (pdf.getTextWidth(name) > nameMaxW && nameSize > 12) {
            nameSize -= 1;
            pdf.setFontSize(nameSize);
        }
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
        pdf.text(name, marginX, nameBaseline);

        const subtitle = cleanText(jobTitle || 'Job Title');
        const subtitleEnd = renderWrappedText(subtitle, marginX, nameBaseline + 7, nameMaxW, 9.5, 'normal', DARK_TEXT_COLOR);
        currentY = subtitleEnd + 10;

        // ---- Contact block (values only, share one left edge) ----
        if (hasSidebar) {
            let sy = nameBaseline;
            for (const item of sidebarLayout) {
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(item.vSize);
                pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
                for (let i = 0; i < item.vLines.length; i++) {
                    pdf.text(item.vLines[i], sidebarX, sy + i * LINE_ADVANCE);
                }
                sy += item.vLines.length * LINE_ADVANCE + ITEM_GAP;
            }
        }

        // ---- To: block ----
        pdf.setFontSize(10.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
        // With no real name, "To:" shows the company instead, so "Hiring Manager"
        // is not repeated next to "Dear Hiring Manager,".
        const hasRealHiringManagerName =
            !!(hiringManagerName && hiringManagerName.trim()) &&
            cleanHiringManager.trim().toLowerCase() !== 'hiring manager';
        const toCompany = company ? cleanText(company) : '';
        const toLine = hasRealHiringManagerName ? cleanHiringManager : toCompany;

        if (toLine) {
            pdf.text(`To: ${toLine}`, marginX, currentY);
            currentY += 5;
        }

        if (hasRealHiringManagerName && toCompany) {
            const companyY = renderWrappedText(toCompany, marginX, currentY, page1Width, 10, 'normal', DARK_TEXT_COLOR);
            currentY = companyY + 2;
        }
        currentY += 5;

        // ---- Date (left) ----
        pdf.setFontSize(9.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
        const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        pdf.text(today, marginX, currentY);
        currentY += 7;

        // ---- Subject ----
        const subject = `RE: Application for ${cleanText(jobTitle || 'Position')}`;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
        const wrappedSubject = pdf.splitTextToSize(subject, page1Width);
        pdf.text(wrappedSubject, marginX, currentY);
        currentY += wrappedSubject.length * 4.5 + 5;

        // ---- Salutation ----
        pdf.setFontSize(10.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
        pdf.text(`Dear ${cleanHiringManager},`, marginX, currentY);
        currentY += 6;

        // ---- Body (left aligned) - same filters & page-break rules ----
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);

        let cleanLetter = cleanLetterBody(generatedLetter, cleanHiringManager).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const paragraphs = cleanLetter.split(/\n\n+/);
        
        for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
            const trimmedParagraph = paragraphs[pIndex].trim();
            if (!trimmedParagraph) continue;
            
            if (trimmedParagraph.match(/^\w+ \d{1,2}, \d{4}$/)) continue;
            if (trimmedParagraph === 'Hiring Manager') continue;
            if (trimmedParagraph === cleanHiringManager) continue;
            if (trimmedParagraph.includes('RE:') || trimmedParagraph.includes('Application for')) continue;
            if (trimmedParagraph === company) continue;
            if (trimmedParagraph === cleanText(company)) continue;
            if (trimmedParagraph === userName || trimmedParagraph === userName?.toUpperCase()) continue;
            if (trimmedParagraph === jobTitle) continue;
            if (trimmedParagraph.toLowerCase().includes('dear hiring manager')) continue;
            if (trimmedParagraph.toLowerCase().startsWith('dear ')) continue;
            if (trimmedParagraph.startsWith('Hiring Manager')) continue;
            if (trimmedParagraph.includes('@') && (trimmedParagraph.includes('|') || trimmedParagraph.includes('gmail'))) continue;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);

            let wrappedLines: string[] = pdf.splitTextToSize(trimmedParagraph, bodyWidthNow());
            if (checkAndAddPageLocal(wrappedLines.length * 5 + 3)) {
                // moved to a new page -> full width there
                wrappedLines = pdf.splitTextToSize(trimmedParagraph, bodyWidthNow());
            }

            for (let i = 0; i < wrappedLines.length; i++) {
                pdf.text(wrappedLines[i], marginX, currentY + i * 5);
            }
            currentY += wrappedLines.length * 5 + 3;
        }

        currentY += 4;
        if ((pageHeight - BOTTOM_MARGIN - currentY) < 20) {
            pdf.addPage();
            currentY = marginY;
        }

        // ---- Closing ----
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
        pdf.text('Sincerely,', marginX, currentY);
        currentY += 7;

        renderWrappedText(cleanText(userName || 'Your Name'), marginX - 0.5, currentY + 1, maxWidth, SIGNATURE_NAME_SIZE, 'normal', DARK_TEXT_COLOR);

        return pdf.output('blob');
    }
}
