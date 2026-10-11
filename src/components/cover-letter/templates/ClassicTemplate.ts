// src/components/cover-letter/templates/ClassicTemplate.ts
// ✅ FIXED: cleanLetterBody now receives cleanHiringManager
// ✅ Dynamic greeting via hiringManagerName

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

// ====================================================================
// TEXT SANITIZATION (WinAnsi-safety pass)
// ====================================================================
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

export class ClassicTemplate implements PDFTemplate {
    async render(data: CoverLetterData): Promise<Blob> {
        const sanitizedData = deepSanitizeForPdf(data);
        const { 
            userName, 
            email, 
            phoneNumber, 
            selectedCountryCode, 
            address, 
            linkedin, 
            jobTitle, 
            company, 
            generatedLetter, 
            profilePhoto,
            hiringManagerName,
        } = sanitizedData;

        const pdf = new jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const marginX = 20;
        const marginY = 18;
        let currentY = marginY;
        const BOTTOM_MARGIN = 16;

        // ✅ Unified dark/black text color (replaces the old navy [44,62,80] and gray
        // [127,140,141] / [80,80,80] / [100,100,100] tones used across the template)
        const DARK_TEXT_COLOR: [number, number, number] = [15, 15, 15];
        // ✅ Extra downward offset (mm) applied ONLY to the header name — title and
        // contact info keep their original position.
        const HEADER_NAME_EXTRA_OFFSET = 3;
        // ✅ Header contact line only moves 0.3mm to the right (name + job title unchanged)
        const CONTACT_EXTRA_RIGHT = 0.3;
        // ✅ Signature name size (pt) - change ONLY these to resize it
        const SIGNATURE_NAME_BASE_SIZE = 12;          // original size
        const SIGNATURE_NAME_SCALE_UP = 1.3;          // +30% enlargement
        const SIGNATURE_NAME_REDUCE_PERCENT = 30;     // total reduction applied on top of the enlarged size
        const SIGNATURE_NAME_SIZE =
            SIGNATURE_NAME_BASE_SIZE * SIGNATURE_NAME_SCALE_UP * (1 - SIGNATURE_NAME_REDUCE_PERCENT / 100);

        // ✅ Dynamic hiring manager
        const cleanHiringManager = cleanText(hiringManagerName || 'Hiring Manager');

        // ============================================
        // HELPER: Render wrapped text
        // ============================================
        const renderWrappedText = (
            text: string,
            x: number,
            y: number,
            maxWidth: number,
            fontSize: number,
            fontStyle: string,
            color: [number, number, number],
            lineHeightMultiplier: number = 1.0
        ): number => {
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

        const getRemainingSpace = (): number => {
            return pageHeight - BOTTOM_MARGIN - currentY;
        };

        const checkAndAddPageLocal = (neededHeight: number) => {
            if (getRemainingSpace() < neededHeight + 3) {
                pdf.addPage();
                currentY = marginY;
                return true;
            }
            return false;
        };

        // ============================================
        // HEADER - Classic Left Aligned
        // ============================================
        // ✅ Increased 40% (20mm -> 28mm). nameX below adds a fixed 6mm gap on
        // top of photoSize, so growing the photo does NOT shrink the gap to text.
        const photoSize = 28;
        let headerY = currentY;
        let headerHandled = false;

        if (profilePhoto && profilePhoto.startsWith('data:image')) {
            try {
                const circularImage = await makeCircularImage(profilePhoto);
                const imgX = marginX;
                const imgY = headerY;
                
                pdf.addImage(circularImage, 'PNG', imgX, imgY, photoSize, photoSize);
                
                const nameX = marginX + photoSize + 6;
                const maxWidth = pageWidth - nameX - marginX;
                
                // Prepare text content first (no drawing yet) so its total
                // height can be measured and centered against the photo.
                const name = cleanText(userName || 'Your Name').toUpperCase();
                const title = cleanText(jobTitle || 'Job Title');
                
                const contactParts: string[] = [];
                if (email) {
                    const cleanEmailStr = cleanEmail(email);
                    if (cleanEmailStr) contactParts.push(cleanEmailStr);
                }
                if (phoneNumber && selectedCountryCode) {
                    const cleanPhone = cleanPhoneNumber(phoneNumber, selectedCountryCode);
                    if (cleanPhone) contactParts.push(cleanPhone);
                }
                if (address) {
                    const cleanAddress = cleanText(address);
                    if (cleanAddress) contactParts.push(cleanAddress);
                }
                if (linkedin) {
                    const cleanLinkedinStr = cleanLinkedin(linkedin);
                    if (cleanLinkedinStr) contactParts.push(cleanLinkedinStr);
                }
                const contactText = contactParts.join('     ');
                
                const NAME_FONT_SIZE = 15.84;
                const TITLE_FONT_SIZE = 8.8;
                const CONTACT_FONT_SIZE = 8.25;
                
                // Measures a block's rendered height (same math as
                // renderWrappedText) WITHOUT drawing anything.
                const measureBlockHeight = (text: string, fontSize: number, fontStyle: string): number => {
                    if (!text) return 0;
                    pdf.setFontSize(fontSize);
                    pdf.setFont('helvetica', fontStyle);
                    const lines = pdf.splitTextToSize(text, maxWidth);
                    return lines.length * fontSize * 0.55;
                };
                
                const nameHeight = measureBlockHeight(name, NAME_FONT_SIZE, 'bold');
                const titleHeight = measureBlockHeight(title, TITLE_FONT_SIZE, 'bold');
                const contactHeight = contactText ? measureBlockHeight(contactText, CONTACT_FONT_SIZE, 'normal') : 0;
                
                const totalTextBlockHeight =
                    nameHeight + 2 +
                    titleHeight +
                    (contactText ? 2 + contactHeight + 1 : 0);
                
                // ✅ FIXED: vertically center the name/title/contact block
                // against the photo, instead of starting flush at its top —
                // otherwise a bigger photo leaves the text floating too high.
                const verticalCenterOffset = Math.max(0, (photoSize - totalTextBlockHeight) / 2);
                // ✅ Shifted whole text block down by 4mm (photo untouched)
                const headerFlowStartY = imgY + verticalCenterOffset + 4;
                
                const nameY = renderWrappedText(
                    name, nameX, headerFlowStartY + HEADER_NAME_EXTRA_OFFSET, maxWidth, NAME_FONT_SIZE, 'bold', DARK_TEXT_COLOR
                );
                const nameBlockHeight = nameY - (headerFlowStartY + HEADER_NAME_EXTRA_OFFSET);
                let photoFlowY = headerFlowStartY + nameBlockHeight + 2;
                
                const titleY = renderWrappedText(title, nameX, photoFlowY, maxWidth, TITLE_FONT_SIZE, 'bold', DARK_TEXT_COLOR);
                photoFlowY = titleY + 2;
                
                if (contactText) {
                    const contactY = renderWrappedText(
                        contactText, nameX + CONTACT_EXTRA_RIGHT, photoFlowY, maxWidth, CONTACT_FONT_SIZE, 'normal', DARK_TEXT_COLOR
                    );
                    photoFlowY = contactY + 1;
                }
                
                // Use whichever is taller: the photo itself, or the text block
                // beside it — so nothing overlaps the divider line below.
                currentY = Math.max(imgY + photoSize + 4, photoFlowY + 1);
                headerHandled = true;
                
            } catch (err) {
                console.error('Failed to add profile photo to PDF:', err);
                headerHandled = false;
            }
        }

        if (!headerHandled) {
            const maxWidth = pageWidth - marginX * 2;
            
            // Name is rendered with an extra downward offset, but the flow below
            // (title/contact) continues from the un-shifted position so only the
            // name itself moves down.
            const headerFlowStartY = currentY;
            const name = cleanText(userName || 'Your Name').toUpperCase();
            // ✅ Font size reduced 20% (20 -> 16)
            const nameY = renderWrappedText(
                name, marginX, headerFlowStartY + HEADER_NAME_EXTRA_OFFSET, maxWidth, 17.6, 'bold', DARK_TEXT_COLOR
            );
            const nameBlockHeight = nameY - (headerFlowStartY + HEADER_NAME_EXTRA_OFFSET);
            currentY = headerFlowStartY + nameBlockHeight + 2;
            
            const title = cleanText(jobTitle || 'Job Title');
            // ✅ Font size reduced 20% (11 -> 8.8)
            const titleY = renderWrappedText(title, marginX, currentY, maxWidth, 9.68, 'bold', DARK_TEXT_COLOR);
            currentY = titleY + 2;
            
            const contactParts: string[] = [];
            if (email) {
                const cleanEmailStr = cleanEmail(email);
                if (cleanEmailStr) contactParts.push(cleanEmailStr);
            }
            if (phoneNumber && selectedCountryCode) {
                const cleanPhone = cleanPhoneNumber(phoneNumber, selectedCountryCode);
                if (cleanPhone) contactParts.push(cleanPhone);
            }
            if (address) {
                const cleanAddress = cleanText(address);
                if (cleanAddress) contactParts.push(cleanAddress);
            }
            if (linkedin) {
                const cleanLinkedinStr = cleanLinkedin(linkedin);
                if (cleanLinkedinStr) contactParts.push(cleanLinkedinStr);
            }
            
            const contactText = contactParts.join('     ');
            if (contactText) {
                const contactY = renderWrappedText(contactText, marginX + CONTACT_EXTRA_RIGHT, currentY, maxWidth, 8.8, 'normal', DARK_TEXT_COLOR);
                currentY = contactY + 1;
            }
            
            currentY += 1;
        }

        currentY += 2;
        pdf.setDrawColor(200, 205, 210);
        pdf.setLineWidth(0.2);
        pdf.line(marginX, currentY, pageWidth - marginX, currentY);
        currentY += 5;

        // ============================================
        // DATE - Left
        // ============================================
        pdf.setFontSize(9.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
        const today = new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        pdf.text(today, marginX, currentY);
        currentY += 6;

        // ============================================
        // RECIPIENT & SUBJECT
        // ============================================
        pdf.setFontSize(10.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
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
        
        const maxWidth = pageWidth - marginX * 2;
        
        if (company) {
            const companyY = renderWrappedText(
                cleanText(company), marginX, currentY, maxWidth, 10, 'normal', DARK_TEXT_COLOR
            );
            currentY = companyY + 2;
        }
        
        currentY += 2;
        
        const subject = `RE: Application for ${cleanText(jobTitle || 'Position')}`;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
        const wrappedSubject = pdf.splitTextToSize(subject, maxWidth);
        pdf.text(wrappedSubject, marginX, currentY);
        currentY += wrappedSubject.length * 4.5 + 5;

        // ============================================
        // SALUTATION
        // ============================================
        pdf.setFontSize(10.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
        pdf.text(`Dear ${cleanHiringManager},`, marginX, currentY);
        currentY += 6;

        // ============================================
        // LETTER BODY
        // ============================================
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);

        // ✅ FIXED: Pass cleanHiringManager to cleanLetterBody
        let cleanLetter = cleanLetterBody(generatedLetter, cleanHiringManager);
        cleanLetter = cleanLetter.replace(/\r\n/g, '\n');
        cleanLetter = cleanLetter.replace(/\r/g, '\n');
        
        const paragraphs = cleanLetter.split(/\n\n+/);
        
        for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
            const paragraph = paragraphs[pIndex];
            const trimmedParagraph = paragraph.trim();
            
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
            const neededHeight = estimatedLines.length * 5 + 3;
            checkAndAddPageLocal(neededHeight);
            
            const wrappedLines = pdf.splitTextToSize(trimmedParagraph, maxWidth);
            pdf.text(wrappedLines, marginX, currentY);
            currentY += wrappedLines.length * 5 + 3;
        }

        // ============================================
        // SIGNATURE
        // ============================================
        currentY += 4;

        if ((pageHeight - BOTTOM_MARGIN - currentY) < 20) {
            pdf.addPage();
            currentY = marginY;
        }

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(DARK_TEXT_COLOR[0], DARK_TEXT_COLOR[1], DARK_TEXT_COLOR[2]);
        pdf.text('Sincerely,', marginX, currentY);
        currentY += 7;

        // signature name: size comes from SIGNATURE_NAME_SIZE (see constants at top), 1mm lower than 'Sincerely,'; no job title below
        renderWrappedText(
            cleanText(userName || 'Your Name'), marginX - 0.5, currentY + 1, maxWidth, SIGNATURE_NAME_SIZE, 'bold', DARK_TEXT_COLOR
        );

        return pdf.output('blob');
    }
}