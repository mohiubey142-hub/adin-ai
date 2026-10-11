// src/components/cover-letter/templates/MinimalTemplate.ts
// ✅ Design copied from the reference screenshot:
//    - centered name + job title
//    - thin line, then a LABEL / value contact grid (PHONE + EMAIL left, ADDRESS + LINKEDIN right), thin line
//    - left column: TO / FROM / DATE blocks (bold name + secondary line)
//    - right column: salutation + letter body
// ✅ Colours are the file's own (dark text + light grey lines) - nothing taken from the image.
// ✅ Text sizes stay compact (body 10 etc.).
// ✅ Data, contact fields, paragraph filters and page-break rules are unchanged.

import jsPDF from 'jspdf';
import { 
    cleanText, 
    cleanEmail, 
    cleanPhoneNumber, 
    cleanLinkedin,
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

type RGB = [number, number, number];
type Field = { label: string; value: string; url?: string };

export class MinimalTemplate implements PDFTemplate {
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
        const BOTTOM_MARGIN = 16;
        let currentY = marginY;

        // ============================================
        // DESIGN CONSTANTS (tune here only)
        // ============================================
        const PT = 0.3528;                                   // 1pt in mm

        // ✅ Colours kept from the file (same as Classic)
        const DARK_TEXT_COLOR: RGB = [15, 15, 15];
        const LINE_COLOR: RGB = [200, 205, 210];
        // Secondary text (company, job title) - same dark by default.
        // Set e.g. [110, 110, 110] for a softer grey like the screenshot.
        const MUTED_COLOR: RGB = DARK_TEXT_COLOR;

        // Compact sizes
        const NAME_MAX_SIZE = 18;
        const NAME_MIN_SIZE = 12;
        const TITLE_SIZE = 9.5;
        const LABEL_SIZE = 6.8;
        const VALUE_SIZE = 8.8;
        const BODY_SIZE = 10;
        const SIG_NAME_BASE_SIZE = 11;                        // original size (pt)
        const SIG_NAME_SCALE_UP = 1.3;                        // +30% enlargement
        const SIG_NAME_REDUCE_PERCENT = 30;                   // total reduction on top of the enlarged size
        const SIG_NAME_SIZE =
            SIG_NAME_BASE_SIZE * SIG_NAME_SCALE_UP * (1 - SIG_NAME_REDUCE_PERCENT / 100);
        const SIGNATURE_NAME_EXTRA_LEFT = 0.5;               // name only moves 0.5mm left, 'Sincerely,' stays
        const SIGNATURE_NAME_EXTRA_DOWN = 1;                 // name only moves 1mm down, 'Sincerely,' stays
        const VALUE_STEP = 4.2;                              // line step in label/value blocks
        const LABEL_SPACING = 0.3;                           // letter-spacing of labels (mm)

        const LINE_H = 5.2;                                  // body line step
        const PARA_GAP = 4;                                  // gap between paragraphs

        // Columns
        const bodyX = marginX + 39;                          // right column (salutation + body)
        const bodyW = pageWidth - marginX - bodyX;
        const sideW = bodyX - marginX - 5;                   // left column width
        const gridLeftLabelX = marginX;                      // left group position (unchanged)
        const gridRightLabelX = 112;                         // right group position (unchanged)
        const LABEL_VALUE_GAP = 2;                           // space between "LABEL:" and its value

        const SHOW_SUBJECT = false;                          // true -> bold "RE: Application for ..." above salutation
        const SHOW_SIGNATURE = true;                         // "Sincerely," + name at the end

        const cleanHiringManager = cleanText(hiringManagerName || 'Hiring Manager');
        const displayName = cleanText(userName || 'Your Name');
        const displayTitle = cleanText(jobTitle || 'Job Title');
        const centerX = pageWidth / 2;

        // ============================================
        // HELPERS
        // ============================================
        const setText = (style: string, size: number, color: RGB = DARK_TEXT_COLOR) => {
            pdf.setFont('helvetica', style);
            pdf.setFontSize(size);
            pdf.setTextColor(color[0], color[1], color[2]);
        };

        // Letter-spaced text drawn char by char (never leaks into other text)
        const drawSpaced = (text: string, x: number, y: number, spacing: number) => {
            let cx = x;
            for (const ch of text) {
                pdf.text(ch, cx, y);
                cx += pdf.getTextWidth(ch) + spacing;
            }
        };

        const drawLine = (y: number) => {
            pdf.setDrawColor(LINE_COLOR[0], LINE_COLOR[1], LINE_COLOR[2]);
            pdf.setLineWidth(0.2);
            pdf.line(marginX, y, pageWidth - marginX, y);
        };

        const getRemainingSpace = (): number => {
            return pageHeight - BOTTOM_MARGIN - currentY;
        };

        const startNewPage = () => {
            pdf.addPage();
            currentY = marginY + 4;
        };

        const checkAndAddPageLocal = (neededHeight: number) => {
            if (getRemainingSpace() < neededHeight + 3) {
                startNewPage();
                return true;
            }
            return false;
        };

        // ============================================
        // HEADER - centered name + title
        // ============================================
        const headerMaxW = pageWidth - 2 * marginX;

        let nameSize = NAME_MAX_SIZE;
        setText('bold', nameSize);
        while (nameSize > NAME_MIN_SIZE && pdf.getTextWidth(displayName) > headerMaxW) {
            nameSize -= 0.5;
            pdf.setFontSize(nameSize);
        }
        const nameLines: string[] = pdf.splitTextToSize(displayName, headerMaxW);
        const nameLH = nameSize * PT * 1.2;
        const nameBase = marginY + 6.5;
        nameLines.forEach((l, i) => pdf.text(l, centerX, nameBase + i * nameLH, { align: 'center' }));

        setText('normal', TITLE_SIZE, MUTED_COLOR);
        const titleLines: string[] = pdf.splitTextToSize(displayTitle, headerMaxW);
        const titleBase = nameBase + (nameLines.length - 1) * nameLH + 3.5 + TITLE_SIZE * PT;
        titleLines.forEach((l, i) => pdf.text(l, centerX, titleBase + i * TITLE_SIZE * PT * 1.3, { align: 'center' }));
        const titleBottom = titleBase + (titleLines.length - 1) * TITLE_SIZE * PT * 1.3;

        const ruleTopY = titleBottom + 8;
        drawLine(ruleTopY);

        // ============================================
        // CONTACT GRID  (LABEL: value) - phone/email left, address/linkedin right
        // ============================================
        const leftFields: Field[] = [];
        const rightFields: Field[] = [];

        if (address) {
            const cleanAddress = cleanText(address);
            if (cleanAddress) rightFields.push({ label: 'ADDRESS', value: cleanAddress });
        }
        if (linkedin) {
            const cleanLinkedinStr = cleanLinkedin(linkedin);
            if (cleanLinkedinStr) {
                const raw = String(linkedin).trim();
                let url = '';
                if (/^https?:\/\//i.test(raw)) url = raw;
                else if (raw.includes('.')) url = 'https://' + raw.replace(/^\/+/, '');
                rightFields.push({ label: 'LINKEDIN', value: cleanLinkedinStr, url: url || undefined });
            }
        }
        if (phoneNumber && selectedCountryCode) {
            const cleanPhone = cleanPhoneNumber(phoneNumber, selectedCountryCode);
            if (cleanPhone) leftFields.push({ label: 'PHONE', value: cleanPhone });
        }
        if (email) {
            const cleanEmailStr = cleanEmail(email);
            if (cleanEmailStr) leftFields.push({ label: 'EMAIL', value: cleanEmailStr });
        }

        // Longer content goes on top in each group (ties keep original order)
        const byLongerFirst = (a: Field, b: Field) => b.value.length - a.value.length;
        leftFields.sort(byLongerFirst);
        rightFields.sort(byLongerFirst);

        // Draws one field, returns the baseline of its last line
        const drawField = (f: Field, labelX: number, valueX: number, width: number, y: number): number => {
            setText('bold', LABEL_SIZE);
            drawSpaced(`${f.label}:`, labelX, y, LABEL_SPACING);

            setText('normal', VALUE_SIZE);
            const lines: string[] = pdf.splitTextToSize(f.value, width);
            lines.forEach((l, i) => {
                const ly = y + i * VALUE_STEP;
                pdf.text(l, valueX, ly);
                if (f.url) {
                    pdf.link(valueX, ly - VALUE_SIZE * PT, pdf.getTextWidth(l), VALUE_SIZE * PT + 1, { url: f.url });
                }
            });
            return y + (lines.length - 1) * VALUE_STEP;
        };

        let sectionTopY = ruleTopY;
        if (leftFields.length || rightFields.length) {
            const gridTop = ruleTopY + 7;

            // Width of the widest "LABEL:" in a column (letter-spaced, same as drawField)
            const labelBlockWidth = (fields: Field[]): number => {
                setText('bold', LABEL_SIZE);
                let max = 0;
                fields.forEach((f) => {
                    let w = 0;
                    for (const ch of `${f.label}:`) w += pdf.getTextWidth(ch) + LABEL_SPACING;
                    max = Math.max(max, w - LABEL_SPACING);
                });
                return max;
            };

            // Value starts right after the label, so it reads "ADDRESS: xxx"
            const gridLeftValueX = gridLeftLabelX + labelBlockWidth(leftFields) + LABEL_VALUE_GAP;
            const gridLeftW = gridRightLabelX - 6 - gridLeftValueX;
            const gridRightEdgeX = pageWidth - marginX;          // where the dividers end
            const gridRightMaxW = gridRightEdgeX - gridRightLabelX;

            // Right group: all lines START at the same x (labels in one column, values in one column);
            // x is chosen so the longest line ends exactly where the dividers end.
            const rLabelW = labelBlockWidth(rightFields);
            const rValueMaxW = gridRightMaxW - rLabelW - LABEL_VALUE_GAP;
            setText('normal', VALUE_SIZE);
            let rWidest = 0;
            rightFields.forEach((f) => {
                const wrapped: string[] = pdf.splitTextToSize(f.value, rValueMaxW);
                wrapped.forEach((l) => { rWidest = Math.max(rWidest, pdf.getTextWidth(l)); });
            });
            const rLabelX = gridRightEdgeX - (rLabelW + LABEL_VALUE_GAP + rWidest);
            const rValueX = rLabelX + rLabelW + LABEL_VALUE_GAP;

            let leftY = gridTop;
            let leftBottom = gridTop;
            leftFields.forEach((f) => {
                leftBottom = drawField(f, gridLeftLabelX, gridLeftValueX, gridLeftW, leftY);
                leftY = leftBottom + 6;
            });

            let rightY = gridTop;
            let rightBottom = gridTop;
            rightFields.forEach((f) => {
                rightBottom = drawField(f, rLabelX, rValueX, rValueMaxW, rightY);
                rightY = rightBottom + 6;
            });

            const gridBottom = Math.max(leftBottom, rightBottom);
            const ruleBottomY = gridBottom + 5;
            drawLine(ruleBottomY);
            sectionTopY = ruleBottomY;
        }

        const columnsTopY = sectionTopY + 8;

        // ============================================
        // LEFT COLUMN - TO / FROM / DATE
        // ============================================
        const drawSideBlock = (label: string, primary: string, secondary: string, y: number): number => {
            setText('bold', LABEL_SIZE);
            drawSpaced(label, marginX, y, LABEL_SPACING);
            let cy = y + 5;

            if (primary) {
                setText('bold', VALUE_SIZE);
                const pl: string[] = pdf.splitTextToSize(primary, sideW);
                pl.forEach((l, i) => pdf.text(l, marginX, cy + i * VALUE_STEP));
                cy += pl.length * VALUE_STEP;
            }
            if (secondary) {
                setText('normal', VALUE_SIZE, MUTED_COLOR);
                const sl: string[] = pdf.splitTextToSize(secondary, sideW);
                sl.forEach((l, i) => pdf.text(l, marginX, cy + i * VALUE_STEP));
                cy += sl.length * VALUE_STEP;
            }
            return cy;
        };

        const today = new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        let sideY = columnsTopY;
        // With no real name, the TO block shows only the company (bold) so
        // "Hiring Manager" is not repeated next to "Dear Hiring Manager,".
        const hasRealHiringManagerName =
            !!(hiringManagerName && hiringManagerName.trim()) &&
            cleanHiringManager.trim().toLowerCase() !== 'hiring manager';
        const toCompany = company ? cleanText(company) : '';
        sideY = drawSideBlock(
            'TO',
            hasRealHiringManagerName ? cleanHiringManager : toCompany,
            hasRealHiringManagerName ? toCompany : '',
            sideY
        ) + 5;
        sideY = drawSideBlock('FROM', displayName, displayTitle, sideY) + 5;
        drawSideBlock('DATE', '', '', sideY);
        setText('normal', VALUE_SIZE);
        pdf.text(today, marginX, sideY + 5);

        // ============================================
        // RIGHT COLUMN - subject (optional) + salutation
        // ============================================
        currentY = columnsTopY;

        if (SHOW_SUBJECT) {
            setText('bold', BODY_SIZE);
            const subject = `RE: Application for ${cleanText(jobTitle || 'Position')}`;
            const wrappedSubject: string[] = pdf.splitTextToSize(subject, bodyW);
            wrappedSubject.forEach((l, i) => pdf.text(l, bodyX, currentY + i * 4.5));
            currentY += wrappedSubject.length * 4.5 + 5;
        }

        setText('normal', BODY_SIZE);
        pdf.text(`Dear ${cleanHiringManager},`, bodyX, currentY);
        currentY += 9;

        // ============================================
        // LETTER BODY (same filters + page-break rules)
        // ============================================
        setText('normal', BODY_SIZE);

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
            
            setText('normal', BODY_SIZE);
            const wrappedLines: string[] = pdf.splitTextToSize(trimmedParagraph, bodyW);
            const neededHeight = wrappedLines.length * LINE_H;
            if (checkAndAddPageLocal(neededHeight)) {
                setText('normal', BODY_SIZE);
            }
            
            wrappedLines.forEach((l, i) => pdf.text(l, bodyX, currentY + i * LINE_H));
            currentY += wrappedLines.length * LINE_H + PARA_GAP;
        }

        // ============================================
        // SIGNATURE
        // ============================================
        if (SHOW_SIGNATURE) {
            currentY += 3;

            if ((pageHeight - BOTTOM_MARGIN - currentY) < 20) {
                startNewPage();
            }

            setText('normal', BODY_SIZE);
            pdf.text('Sincerely,', bodyX, currentY);
            currentY += 7;

            setText('bold', SIG_NAME_SIZE);
            const sigLines: string[] = pdf.splitTextToSize(displayName, bodyW);
            sigLines.forEach((l, i) => pdf.text(l, bodyX - SIGNATURE_NAME_EXTRA_LEFT, currentY + SIGNATURE_NAME_EXTRA_DOWN + i * 5));
        }

        return pdf.output('blob');
    }
}
