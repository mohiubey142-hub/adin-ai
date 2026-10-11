// src/components/cover-letter/templates/ExecutiveTemplate.ts
// Design: navy top bar, circular photo with ring, big navy name, pipe-separated contact,
// gold gradient divider, light grey-blue page background. Logic/page-break rules unchanged.

import jsPDF from 'jspdf';
import { 
    cleanText, 
    cleanEmail, 
    cleanPhoneNumber, 
    cleanLinkedin,
    makeCircularImage,
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


// Clean circular crop: no border, no ring, no outline - just the photo cut into a circle
function makeCleanCircle(dataUrl: string, size = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.clearRect(0, 0, size, size);
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = dataUrl;
  });
}

type RGB = [number, number, number];
type ContactItem = { label: string; text: string; isLink: boolean; url?: string };

export class ExecutiveTemplate implements PDFTemplate {
    async render(data: CoverLetterData): Promise<Blob> {
        const sanitizedData = deepSanitizeForPdf(data);
        const { 
            userName, email, phoneNumber, selectedCountryCode, address, linkedin, 
            jobTitle, company, generatedLetter, profilePhoto, hiringManagerName,
        } = sanitizedData;

        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const marginX = 20;
        const marginY = 18;
        let currentY = marginY;
        const BOTTOM_MARGIN = 16;

        // ---------- Design tokens ----------
        const DARK_TEXT_COLOR: RGB = [20, 22, 28];
        const NAVY: RGB = [27, 42, 74];
        const PAGE_BG: RGB = [238, 241, 245];
        const GOLD: RGB = [212, 175, 55];
        const BAR_HEIGHT = 7;

        const BODY_FONT = 10;
        const BODY_LH = 5;          // mm between body lines
        const PARA_GAP = 3;         // extra mm between paragraphs
        const CONTACT_FONT = 8.8;
        const CONTACT_LH = 4.6;
        const PT = 0.3528;          // 1pt in mm
        const CAP_HEIGHT_RATIO = 0.72;          // cap height as a fraction of font size
        const TITLE_FONT = 12;                  // job title size (pt)
        const TITLE_LINE_HEIGHT_FACTOR = 1.2;   // wrapped title line advance
        const HEADER_ROW_GAP = 3.5;             // equal white space: name -> title and title -> contact (mm)
        const CONTACT_SHIFT_RIGHT = 0.5;        // contact block only: nudged right (mm)

        const SHOW_SUBJECT = false; // image has no "RE:" line; set true to bring it back

        const cleanHiringManager = cleanText(hiringManagerName || 'Hiring Manager');

        // ---------- Page decoration (background + top bar) ----------
        const drawPageDecor = () => {
            pdf.setFillColor(PAGE_BG[0], PAGE_BG[1], PAGE_BG[2]);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
            pdf.rect(0, 0, pageWidth, BAR_HEIGHT, 'F');
        };
        drawPageDecor();

        const addNewPage = () => {
            pdf.addPage();
            drawPageDecor();
            currentY = marginY;
        };

        const renderWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, fontStyle: string, color: RGB, lineHeightMultiplier = 1.0) => {
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
                addNewPage();
                return true;
            }
            return false;
        };

        // ---------- Header ----------
        const photoSize = 34;
        const ringPad = 0;
        const headerTop = BAR_HEIGHT + 8;
        let hasPhoto = false;

        if (profilePhoto && profilePhoto.startsWith('data:image')) {
            try {
                let circularImage: string;
                try { circularImage = await makeCleanCircle(profilePhoto); }
                catch { circularImage = await makeCircularImage(profilePhoto); }
                const imgX = marginX + ringPad;
                const imgY = headerTop + ringPad;
                pdf.addImage(circularImage, 'PNG', imgX, imgY, photoSize, photoSize);
                hasPhoto = true;
            } catch (err) {
                console.error('Failed to add profile photo to PDF:', err);
                hasPhoto = false;
            }
        }

        const textX = hasPhoto ? marginX + photoSize + 9 : marginX;
        const textMaxW = pageWidth - textX - marginX;

        // Name (auto-shrinks to fit one line)
        const nameText = cleanText(userName || 'Your Name').toUpperCase();
        let nameSize = 27.2; // 15% smaller than 32
        pdf.setFont('helvetica', 'bold');
        while (nameSize > 16) {
            pdf.setFontSize(nameSize);
            if (pdf.getTextWidth(nameText) <= textMaxW) break;
            nameSize -= 1;
        }
        pdf.setFontSize(nameSize);
        const nameLines: string[] = pdf.splitTextToSize(nameText, textMaxW);
        const nameCap = nameSize * PT * CAP_HEIGHT_RATIO;
        const nameLH = nameSize * PT * 1.1;

        // Contact items with plain headings: Email, Phone, LinkedIn, Address
        const contactItems: ContactItem[] = [];
        if (email) { const v = cleanEmail(email); if (v) contactItems.push({ label: 'Email:', text: v, isLink: false }); }
        if (phoneNumber && selectedCountryCode) { const v = cleanPhoneNumber(phoneNumber, selectedCountryCode); if (v) contactItems.push({ label: 'Phone:', text: v, isLink: false }); }
        if (linkedin) {
            const v = cleanLinkedin(linkedin);
            if (v) {
                let url: string | undefined;
                if (/^https?:\/\//i.test(v)) url = v;
                else if (/linkedin\.com/i.test(v)) url = 'https://' + v.replace(/^\/+/, '');
                contactItems.push({ label: 'LinkedIn:', text: v, isLink: true, url });
            }
        }
        if (address) { const v = cleanText(address); if (v) contactItems.push({ label: 'Address:', text: v, isLink: false }); }

        // Wrap contact items into lines, item-by-item, separated by a plain gap
        const ITEM_GAP = 6; // mm between items
        const measureItem = (item: ContactItem) => {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(CONTACT_FONT);
            const lw = pdf.getTextWidth(item.label + ' ');
            pdf.setFont('helvetica', 'normal');
            return { lw, total: lw + pdf.getTextWidth(item.text) };
        };
        const contactLines: ContactItem[][] = [];
        let cur: ContactItem[] = [];
        let curW = 0;
        for (const item of contactItems) {
            const w = measureItem(item).total;
            const add = cur.length ? ITEM_GAP + w : w;
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
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(TITLE_FONT);
        const titleText = cleanText(jobTitle || '').trim();
        const titleLines: string[] = titleText ? pdf.splitTextToSize(titleText, textMaxW) : [];
        const hasTitle = titleLines.length > 0;
        const titleCap = TITLE_FONT * PT * CAP_HEIGHT_RATIO;
        const titleLH = TITLE_FONT * PT * TITLE_LINE_HEIGHT_FACTOR;
        const contactCap = CONTACT_FONT * PT * CAP_HEIGHT_RATIO;

        // Equal visible gaps: (name -> title) == (title -> contact)
        const NAME_TO_TITLE = HEADER_ROW_GAP + titleCap;
        const TITLE_TO_CONTACT = HEADER_ROW_GAP + contactCap;
        const NAME_TO_CONTACT = 8; // used only when there is no job title
        const contactGap = hasTitle ? TITLE_TO_CONTACT : NAME_TO_CONTACT;
        const titleBlockH = hasTitle ? NAME_TO_TITLE + (titleLines.length - 1) * titleLH : 0;

        // Block height + vertical centering next to photo
        const blockH = nameCap + (nameLines.length - 1) * nameLH + titleBlockH +
            (contactLines.length ? contactGap + (contactLines.length - 1) * CONTACT_LH : 0);
        const areaH = hasPhoto ? photoSize + ringPad * 2 : blockH;
        const topY = headerTop + Math.max(0, (areaH - blockH) / 2);

        // Draw name
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(nameSize);
        pdf.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        let baseY = topY + nameCap;
        for (let i = 0; i < nameLines.length; i++) {
            pdf.text(nameLines[i], textX, baseY + i * nameLH);
        }
        baseY += (nameLines.length - 1) * nameLH;

        // Draw job title
        if (hasTitle) {
            baseY += NAME_TO_TITLE;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(TITLE_FONT);
            pdf.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
            for (let i = 0; i < titleLines.length; i++) {
                pdf.text(titleLines[i], textX, baseY + i * titleLH);
            }
            baseY += (titleLines.length - 1) * titleLH;
        }

        // Draw contact
        if (contactLines.length) {
            baseY += contactGap;
            let lineY = baseY;
            contactLines.forEach((line) => {
                let x = textX + CONTACT_SHIFT_RIGHT;
                line.forEach((item) => {
                    const { lw, total } = measureItem(item);
                    pdf.setFontSize(CONTACT_FONT);
                    pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(item.label, x, lineY);
                    pdf.setFont('helvetica', 'normal');
                    pdf.text(item.text, x + lw, lineY);
                    if (item.isLink && item.url) {
                        try { pdf.link(x + lw, lineY - 4, total - lw, 5, { url: item.url }); } catch { /* ignore */ }
                    }
                    x += total + ITEM_GAP;
                });
                lineY += CONTACT_LH;
            });
            baseY = lineY - CONTACT_LH;
        }

        const headerBottom = Math.max(hasPhoto ? headerTop + areaH : 0, baseY + 2);
        currentY = headerBottom + 6;

        // ---------- Gold divider (flat, pure gold, no shine) ----------
        const lineH = 1.2;
        pdf.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
        pdf.rect(marginX, currentY, pageWidth - marginX * 2, lineH, 'F');
        currentY += lineH + 9;

        // ---------- Date ----------
        pdf.setFontSize(BODY_FONT);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
        const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        pdf.text(today, marginX, currentY);
        currentY += 11;

        // ---------- Recipient ----------
        pdf.setFontSize(BODY_FONT);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
        // Show the name line only when a real name was given; with no name the
        // recipient block starts with the company, and the salutation stays
        // "Dear Hiring Manager," (no duplicate "Hiring Manager" line).
        const hasRealHiringManagerName =
            !!(hiringManagerName && hiringManagerName.trim()) &&
            cleanHiringManager.trim().toLowerCase() !== 'hiring manager';
        if (hasRealHiringManagerName) {
            pdf.text(`${cleanHiringManager},`, marginX, currentY);
            currentY += 5.5;
        }

        const maxWidth = pageWidth - marginX * 2;

        if (company) {
            pdf.setFont('helvetica', 'bold');
            const companyLines: string[] = pdf.splitTextToSize(cleanText(company), maxWidth);
            pdf.text(companyLines, marginX, currentY);
            currentY += (companyLines.length - 1) * 5.5;
        }
        currentY += 11;

        // ---------- Optional subject ----------
        if (SHOW_SUBJECT) {
            const subject = `RE: Application for ${cleanText(jobTitle || 'Position')}`;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const wrappedSubject = pdf.splitTextToSize(subject, maxWidth);
            pdf.text(wrappedSubject, marginX, currentY);
            currentY += wrappedSubject.length * 4.5 + 5;
        }

        // ---------- Salutation ----------
        pdf.setFontSize(BODY_FONT);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
        pdf.text(`Dear ${cleanHiringManager},`, marginX, currentY);
        currentY += 10;

        // ---------- Body ----------
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(BODY_FONT);
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
        pdf.setLineHeightFactor((BODY_LH * 2.8346) / BODY_FONT);

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
            
            const estimatedLines = pdf.splitTextToSize(trimmedParagraph, maxWidth);
            checkAndAddPageLocal(estimatedLines.length * BODY_LH + PARA_GAP);
            
            const wrappedLines = pdf.splitTextToSize(trimmedParagraph, maxWidth);
            pdf.text(wrappedLines, marginX, currentY);
            currentY += wrappedLines.length * BODY_LH + PARA_GAP;
        }
        pdf.setLineHeightFactor(1.15);

        // ---------- Sign-off ----------
        if ((pageHeight - BOTTOM_MARGIN - currentY) < 28) {
            addNewPage();
        }

        pdf.setFontSize(BODY_FONT);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
        pdf.text('Sincerely,', marginX, currentY);
        currentY += 7;

        // Signer's name: 12pt + 30%, then reduced by 30% in total, nudged 1mm down and 0.5mm left (only the name, not "Sincerely,").
        // No job title below the signature.
        const SIGNATURE_NAME_BASE_FONT_SIZE = 12 * 1.3;
        const SIGNATURE_NAME_FONT_SIZE_DECREASE = 0.30;
        const SIGNATURE_NAME_FONT_SIZE = SIGNATURE_NAME_BASE_FONT_SIZE * (1 - SIGNATURE_NAME_FONT_SIZE_DECREASE);
        const SIGNATURE_NAME_EXTRA_DOWN = 1;
        const SIGNATURE_NAME_EXTRA_LEFT = 0.5;
        renderWrappedText(cleanText(userName || 'Your Name'), marginX - SIGNATURE_NAME_EXTRA_LEFT, currentY + SIGNATURE_NAME_EXTRA_DOWN, maxWidth, SIGNATURE_NAME_FONT_SIZE, 'bold', DARK_TEXT_COLOR);

        return pdf.output('blob');
    }
}
