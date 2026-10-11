// src/components/cover-letter/templates/ModernTemplate.ts
// ✅ FIXED: cleanLetterBody now receives cleanHiringManager to strip name/Dear
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

// Recursively walks any value and sanitizes every string
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

export class ModernTemplate implements PDFTemplate {
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
            preferredFont,
            showBulletPoints,
        } = sanitizedData;

        // ===== FONT CONFIGURATION =====
        const FONT_CHOICES = {
            'Helvetica': 'helvetica',
            'Times': 'times',
            'Courier': 'courier',
            'Helvetica-Bold': 'helvetica',
            'Times-Bold': 'times',
        };
        const selectedFont = preferredFont || 'Helvetica';
        const fontFamily = FONT_CHOICES[selectedFont] || 'helvetica';
        const isBold = selectedFont.includes('Bold');

        // ===== LAYOUT ENGINE: Page configuration =====
        const BASE_PAGE_HEIGHT = 297;
        let pageHeight = BASE_PAGE_HEIGHT;
        let pageExtended = false;

        const pdf = new jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const marginX = 22;
        const TOP_MARGIN = 6;
        const BOTTOM_MARGIN = 22;
        let currentY = TOP_MARGIN;

        // ===== MODERN COLORS =====
        const PRIMARY_COLOR = [124, 58, 237];
        const SECONDARY_COLOR = [168, 85, 247];
        const DARK_COLOR = [31, 41, 55];
        const LIGHT_GRAY = [156, 163, 175];

        // ===== LAYOUT ENGINE: Intelligent spacing optimization =====
        const optimizeSpacing = (content: string): { 
            optimized: string; 
            compression: number 
        } => {
            const lines = content.split('\n');
            let optimizedLines: string[] = [];
            let compression = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
                
                if (line.trim() === '' && i > 0 && i < lines.length - 1) {
                    const prevLine = lines[i - 1];
                    const nextNonEmpty = lines.slice(i + 1).find(l => l.trim() !== '');
                    
                    if (prevLine.trim() !== '' && nextNonEmpty && nextNonEmpty.trim() !== '') {
                        const isSectionBreak = 
                            prevLine.match(/^[A-Z]/) && 
                            nextNonEmpty.match(/^[A-Z]/) &&
                            !prevLine.includes(':') &&
                            !nextNonEmpty.includes(':');
                        
                        if (isSectionBreak) {
                            optimizedLines.push(line);
                        } else {
                            compression += 0.5;
                        }
                        continue;
                    }
                }
                
                optimizedLines.push(line);
            }
            
            return {
                optimized: optimizedLines.join('\n'),
                compression: Math.min(compression, 3)
            };
        };

        // ===== LAYOUT ENGINE: Enhanced content analysis =====
        const analyzeContent = (text: string): {
            paragraphs: string[];
            totalLines: number;
            hasSignature: boolean;
            hasBulletPoints: boolean;
            needsFormatting: boolean;
        } => {
            // ✅ UPDATED: Pass cleanHiringManager (uses outer scope var)
            const clean = cleanLetterBody(text, cleanHiringManager);
            const paragraphs = clean.split(/\n\n+/).filter(p => p.trim() !== '');
            let totalLines = 0;
            let hasSignature = false;
            let hasBulletPoints = false;
            let needsFormatting = false;
            
            for (const p of paragraphs) {
                const lines = p.split('\n').filter(l => l.trim() !== '');
                totalLines += lines.length;
                
                if (p.match(/^[•\-*]\s/m) || p.match(/^\d+\.\s/m)) {
                    hasBulletPoints = true;
                    needsFormatting = true;
                }
                
                if (p.toLowerCase().includes('sincerely') || 
                    p.toLowerCase().includes('thank you') ||
                    p.toLowerCase().includes('regards')) {
                    hasSignature = true;
                }
            }
            
            return { paragraphs, totalLines, hasSignature, hasBulletPoints, needsFormatting };
        };

        // ===== LAYOUT ENGINE: Bullet point formatter =====
        const formatBulletPoints = (text: string): string[] => {
            const lines = text.split('\n');
            const formattedLines: string[] = [];
            
            for (const line of lines) {
                const trimmed = line.trim();
                const bulletMatch = trimmed.match(/^([•\-*]|\d+\.)\s+(.*)/);
                if (bulletMatch && showBulletPoints !== false) {
                    const bulletContent = bulletMatch[2];
                    formattedLines.push(`• ${bulletContent}`);
                } else {
                    formattedLines.push(trimmed);
                }
            }
            
            return formattedLines;
        };

        const getRemainingSpace = (): number => {
            return pageHeight - BOTTOM_MARGIN - currentY;
        };

        // ===== LAYOUT ENGINE: Enhanced page check =====
        const checkAndAddPageLocal = (neededHeight: number, isLastSection: boolean = false) => {
            const remaining = getRemainingSpace();
            const requiredSpace = neededHeight + (isLastSection ? 8 : 3);
            
            if (remaining < requiredSpace) {
                if (!pageExtended && isLastSection) {
                    const compressionAmount = Math.min(2, requiredSpace - remaining + 2);
                    currentY -= compressionAmount;
                    
                    if (getRemainingSpace() >= requiredSpace - 2) {
                        return false;
                    }
                }
                
                if (!pageExtended && isLastSection) {
                    const extendAmount = Math.min(4, requiredSpace - remaining + 3);
                    pageHeight += extendAmount;
                    pageExtended = true;
                    pdf.internal.pageSize.setHeight(pageHeight);
                    return false;
                }
                
                pdf.addPage();
                currentY = TOP_MARGIN;
                return true;
            }
            return false;
        };

        // ============================================
        // HELPER: Render left-aligned wrapped text
        // ============================================
        const renderLeftWrappedText = (
            text: string,
            x: number,
            y: number,
            fontSize: number,
            fontStyle: string,
            color: [number, number, number],
            maxWidth: number
        ): number => {
            if (!text) return y;
            
            pdf.setFontSize(fontSize);
            const fontFamily_ = fontStyle.includes('bold') ? fontFamily : fontFamily;
            pdf.setFont(fontFamily_, fontStyle);
            pdf.setTextColor(color[0], color[1], color[2]);
            
            const wrappedLines = pdf.splitTextToSize(text, maxWidth);
            const lineHeight = fontSize * 0.55;
            
            for (let i = 0; i < wrappedLines.length; i++) {
                pdf.text(wrappedLines[i], x, y + (i * lineHeight));
            }
            
            return y + (wrappedLines.length * lineHeight);
        };

        // ============================================
        // CLEAN DATA
        // ============================================
        const cleanName = cleanText(userName || 'Your Name');
        const cleanTitle = cleanText(jobTitle || 'Job Title');
        const cleanCompany = cleanText(company || '');
        const cleanHiringManager = cleanText(hiringManagerName || 'Hiring Manager');
        const MAX_TEXT_WIDTH = pageWidth - marginX * 2;

        // Contact items keep their order (email, phone, linkedin, address).
        // They flow across the FULL content width (see section 4 below).
        const contactItems: string[] = [];

        if (email) {
            const cleanEmailStr = cleanEmail(email);
            if (cleanEmailStr) contactItems.push(`Email: ${cleanEmailStr}`);
        }
        if (phoneNumber && selectedCountryCode) {
            const cleanPhone = cleanPhoneNumber(phoneNumber, selectedCountryCode);
            if (cleanPhone) contactItems.push(`Phone: ${cleanPhone}`);
        }
        if (linkedin) {
            const cleanLinkedinStr = cleanLinkedin(linkedin);
            if (cleanLinkedinStr) contactItems.push(`LinkedIn: ${cleanLinkedinStr}`);
        }
        if (address) {
            const cleanAddress = cleanText(address);
            if (cleanAddress) contactItems.push(`Address: ${cleanAddress}`);
        }

        // ============================================
        // 1-5. HEADER - TealCurve style: full-width dark band across the top,
        //      circular photo beside Name + Job Title (white), contact line
        //      below it. No dividers anywhere in the header.
        //      Every size / gap / color is the TealCurve value, named once.
        // ============================================

        // This document works in mm, TealCurve works in pt - one conversion factor.
        const PT_TO_MM = 1 / pdf.internal.scaleFactor;

        // TealCurve header colors
        const HEADER_BACKGROUND_COLOR: [number, number, number] = [13, 43, 43];
        const HEADER_NAME_COLOR: [number, number, number] = [255, 255, 255];
        const HEADER_TITLE_COLOR: [number, number, number] = [255, 255, 255];
        const HEADER_CONTACT_COLOR: [number, number, number] = [200, 220, 220];

        // TealCurve header typography (pt)
        const NAME_FONT_SIZE = 22;
        const TITLE_FONT_SIZE = 13;
        const CONTACT_FONT_SIZE = 9.5;
        // Contact line only: nudged 0.5mm to the right (name + job title unchanged)
        const CONTACT_EXTRA_RIGHT = 0.5;

        // TealCurve header geometry (pt, converted to mm through PT_TO_MM)
        const HEADER_PHOTO_SIZE_PT = 83;
        const PHOTO_TO_TEXT_GAP_PT = 15;
        const NAME_TO_TITLE_GAP_PT = 6;
        const photoSize = HEADER_PHOTO_SIZE_PT * PT_TO_MM;
        const PHOTO_TO_TEXT_GAP = PHOTO_TO_TEXT_GAP_PT * PT_TO_MM;
        const NAME_TO_TITLE_GAP = NAME_TO_TITLE_GAP_PT * PT_TO_MM;

        // Helvetica ink geometry as a fraction of font size (same ratios TealCurve uses)
        const HEADER_ASCENT_RATIO = 0.718;
        const HEADER_DESCENT_RATIO = 0.207;

        // Wrapped-line spacing, same factor renderLeftWrappedText() draws with
        const HEADER_LINE_HEIGHT_FACTOR = 0.55;

        // Spacing (mm): header top inset, content -> band bottom edge
        // (TealCurve's 4mm side gap + 1mm extra), band bottom edge -> date
        // Header top inset: base value minus a 1mm reduction. Photo, name, title,
        // contact, band bottom edge and everything below follow it upward.
        const HEADER_TOP_OFFSET_BASE = 4;
        const HEADER_TOP_REDUCTION = 1;
        const HEADER_TOP_OFFSET = HEADER_TOP_OFFSET_BASE - HEADER_TOP_REDUCTION;
        // Name + job title only: nudged 1mm down (contact, photo and band are NOT moved)
        const NAME_TITLE_EXTRA_DOWN = 1;
        const HEADER_CONTENT_TO_BAND_EDGE_GAP = 4;
        const HEADER_CONTENT_TO_BAND_EDGE_EXTRA_GAP = 1;
        const HEADER_BAND_TO_DATE_GAP = 5.5;
        const headerStartY = currentY + HEADER_TOP_OFFSET;

        let headerImage: string | null = null;
        if (profilePhoto && profilePhoto.startsWith('data:image')) {
            try {
                headerImage = await makeCircularImage(profilePhoto);
            } catch (err) {
                console.error('Failed to add profile photo to PDF:', err);
                headerImage = null;
            }
        }
        const hasHeaderPhoto = !!headerImage;

        const headerTextX = hasHeaderPhoto ? marginX + photoSize + PHOTO_TO_TEXT_GAP : marginX;
        const headerTextW = pageWidth - headerTextX - marginX;

        const headerName = cleanName;

        // Contact items flow across the text column (same column as name/title);
        // an item is never cut in the middle, a new line starts only when the
        // next one won't fit.
        pdf.setFontSize(CONTACT_FONT_SIZE);
        pdf.setFont(fontFamily, 'normal');
        const CONTACT_SEPARATOR = '     ';
        const contactLines: string[] = [];
        let currentContactLine = '';
        for (const item of contactItems) {
            const candidate = currentContactLine ? `${currentContactLine}${CONTACT_SEPARATOR}${item}` : item;
            if (!currentContactLine || pdf.getTextWidth(candidate) <= headerTextW) {
                currentContactLine = candidate;
            } else {
                contactLines.push(currentContactLine);
                currentContactLine = item;
            }
        }
        if (currentContactLine) contactLines.push(currentContactLine);
        const contactText = contactLines.join('\n');

        const measureLineCount = (text: string, fontSize: number, fontStyle: string, maxWidth: number): number => {
            if (!text) return 0;
            pdf.setFontSize(fontSize);
            pdf.setFont(fontFamily, fontStyle);
            return pdf.splitTextToSize(text, maxWidth).length;
        };

        const nameLineCount = measureLineCount(headerName, NAME_FONT_SIZE, 'normal', headerTextW);
        const titleLineCount = measureLineCount(cleanTitle, TITLE_FONT_SIZE, 'normal', headerTextW);
        const contactLineCount = measureLineCount(contactText, CONTACT_FONT_SIZE, 'normal', headerTextW);

        const nameAscent = NAME_FONT_SIZE * HEADER_ASCENT_RATIO * PT_TO_MM;
        const nameAdvance = NAME_FONT_SIZE * PT_TO_MM;
        const nameLineHeight = NAME_FONT_SIZE * HEADER_LINE_HEIGHT_FACTOR;
        const titleAscent = TITLE_FONT_SIZE * HEADER_ASCENT_RATIO * PT_TO_MM;
        const titleLineHeight = TITLE_FONT_SIZE * HEADER_LINE_HEIGHT_FACTOR;
        const titleDescent = TITLE_FONT_SIZE * HEADER_DESCENT_RATIO * PT_TO_MM;
        const contactAscent = CONTACT_FONT_SIZE * HEADER_ASCENT_RATIO * PT_TO_MM;
        const contactDescent = CONTACT_FONT_SIZE * HEADER_DESCENT_RATIO * PT_TO_MM;
        const contactLineHeight = CONTACT_FONT_SIZE * HEADER_LINE_HEIGHT_FACTOR;

        // One visible gap between lines: the whitespace between the name and the
        // job title. The job title -> contact gap reuses this SAME value, so the
        // two gaps can never differ.
        const HEADER_LINE_GAP = nameAdvance + NAME_TO_TITLE_GAP - titleAscent;

        // Name + title + contact block, measured relative to the name's first baseline.
        const titleBaselineRel = (nameLineCount - 1) * nameLineHeight + nameAdvance + NAME_TO_TITLE_GAP;
        const titleLastBaselineRel = titleBaselineRel + (titleLineCount - 1) * titleLineHeight;
        const contactBaselineRel = titleLastBaselineRel + HEADER_LINE_GAP + contactAscent;
        const blockTopRel = -nameAscent;
        const blockBottomRel = contactLineCount > 0
            ? contactBaselineRel + (contactLineCount - 1) * contactLineHeight + contactDescent
            : titleLastBaselineRel + titleDescent;
        const textBlockHeight = blockBottomRel - blockTopRel;

        // Same start position with or without a photo: the text block is always
        // centered against the (reserved) photo area, so the letter starts at the
        // same height either way.
        const textBlockTopY = headerStartY + Math.max(0, (photoSize - textBlockHeight) / 2);
        const nameBaselineY = textBlockTopY - blockTopRel;
        const titleBaselineY = nameBaselineY + titleBaselineRel;
        const contactBaselineY = nameBaselineY + contactBaselineRel;
        const textBlockBottomY = textBlockTopY + textBlockHeight;

        const photoBottomY = headerStartY + photoSize;
        const headerContentBottomY = Math.max(photoBottomY, textBlockBottomY);
        const headerBandBottomY =
            headerContentBottomY + HEADER_CONTENT_TO_BAND_EDGE_GAP + HEADER_CONTENT_TO_BAND_EDGE_EXTRA_GAP;

        // Band is painted first so photo/text land on top of it.
        pdf.setFillColor(HEADER_BACKGROUND_COLOR[0], HEADER_BACKGROUND_COLOR[1], HEADER_BACKGROUND_COLOR[2]);
        pdf.rect(0, 0, pageWidth, headerBandBottomY, 'F');

        if (headerImage) {
            pdf.addImage(headerImage, 'PNG', marginX, headerStartY, photoSize, photoSize);
        }

        renderLeftWrappedText(
            headerName,
            headerTextX,
            nameBaselineY + NAME_TITLE_EXTRA_DOWN,
            NAME_FONT_SIZE,
            'normal',
            HEADER_NAME_COLOR,
            headerTextW
        );

        renderLeftWrappedText(
            cleanTitle,
            headerTextX,
            titleBaselineY + NAME_TITLE_EXTRA_DOWN,
            TITLE_FONT_SIZE,
            'normal',
            HEADER_TITLE_COLOR,
            headerTextW
        );

        if (contactText) {
            renderLeftWrappedText(
                contactText,
                headerTextX + CONTACT_EXTRA_RIGHT,
                contactBaselineY,
                CONTACT_FONT_SIZE,
                'normal',
                HEADER_CONTACT_COLOR,
                headerTextW
            );
        }

        currentY = headerBandBottomY + HEADER_BAND_TO_DATE_GAP;

        // ============================================
        // 6. DATE - RIGHT Aligned
        // ============================================
        pdf.setFontSize(9.5);
        pdf.setFont(fontFamily, 'normal');
        pdf.setTextColor(DARK_COLOR[0], DARK_COLOR[1], DARK_COLOR[2]);
        const today = new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        const dateWidth = pdf.getTextWidth(today);
        pdf.text(today, pageWidth - marginX - dateWidth, currentY - 1.5);
        currentY += 4.5;

        // ============================================
        // 7. RECIPIENT
        // ============================================
        // Show the name line only when a real name was given. With no name,
        // the recipient block starts with the company and the salutation
        // stays "Dear Hiring Manager," (no duplicate "Hiring Manager" line).
        const hasRealHiringManagerName =
            !!(hiringManagerName && hiringManagerName.trim()) &&
            cleanHiringManager.trim().toLowerCase() !== 'hiring manager';

        if (hasRealHiringManagerName) {
            const hiringManagerY = renderLeftWrappedText(
                cleanHiringManager,
                marginX,
                currentY,
                10.5,
                'bold',
                DARK_COLOR,
                MAX_TEXT_WIDTH
            );
            currentY = hiringManagerY + 1.5;
        }

        if (cleanCompany) {
            const companyY = renderLeftWrappedText(
                cleanCompany,
                marginX,
                currentY,
                10,
                'normal',
                DARK_COLOR,
                MAX_TEXT_WIDTH
            );
            currentY = companyY + 1.5;
        }

        currentY += 1;

        const subject = `RE: Application for ${cleanTitle}`;
        const subjectY = renderLeftWrappedText(
            subject,
            marginX,
            currentY,
            10,
            'normal',
            DARK_COLOR,
            MAX_TEXT_WIDTH
        );
        currentY = subjectY + 3;

        // ============================================
        // 8. SALUTATION
        // ============================================
        const salutationY = renderLeftWrappedText(
            `Dear ${cleanHiringManager},`,
            marginX,
            currentY,
            10.5,
            'bold',
            DARK_COLOR,
            MAX_TEXT_WIDTH
        );
        currentY = salutationY + 4;

        // ============================================
        // 9. LETTER BODY - Enhanced with bullet support
        // ============================================
        pdf.setFont(fontFamily, 'normal');
        pdf.setFontSize(10.5);
        pdf.setLineHeightFactor(1.6);
        pdf.setTextColor(DARK_COLOR[0], DARK_COLOR[1], DARK_COLOR[2]);

        // ✅ FIXED: Pass cleanHiringManager to cleanLetterBody
        let cleanLetter = cleanLetterBody(generatedLetter, cleanHiringManager);
        cleanLetter = cleanLetter.replace(/\r\n/g, '\n');
        cleanLetter = cleanLetter.replace(/\r/g, '\n');

        const contentAnalysis = analyzeContent(cleanLetter);
        
        const optimizedResult = optimizeSpacing(cleanLetter);
        cleanLetter = optimizedResult.optimized;

        const paragraphs = cleanLetter.split(/\n\n+/);
        const totalParagraphs = paragraphs.length;
        
        for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
            const paragraph = paragraphs[pIndex];
            const trimmedParagraph = paragraph.trim();

            if (!trimmedParagraph) continue;

            if (trimmedParagraph.match(/^\w+ \d{1,2}, \d{4}$/)) continue;
            if (trimmedParagraph === 'Hiring Manager') continue;
            if (trimmedParagraph === cleanHiringManager) continue;
            if (trimmedParagraph.includes('RE:') || trimmedParagraph.includes('Application for')) continue;
            if (trimmedParagraph === cleanCompany) continue;
            if (trimmedParagraph === cleanName) continue;
            if (trimmedParagraph === cleanTitle) continue;
            if (trimmedParagraph.toLowerCase().includes('dear hiring manager')) continue;
            if (trimmedParagraph.toLowerCase().startsWith('dear ')) continue;
            if (trimmedParagraph.startsWith('Hiring Manager')) continue;
            
            if (trimmedParagraph.includes('@') && 
                !trimmedParagraph.toLowerCase().includes('dear') &&
                !trimmedParagraph.toLowerCase().includes('sincerely') &&
                trimmedParagraph.split(' ').length < 10) {
                continue;
            }

            const isLastParagraph = pIndex === paragraphs.length - 1;
            const isSignatureSection = isLastParagraph || 
                trimmedParagraph.toLowerCase().includes('sincerely') ||
                trimmedParagraph.toLowerCase().includes('thank you') ||
                trimmedParagraph.toLowerCase().includes('regards');

            let formattedText = trimmedParagraph;
            if (contentAnalysis.hasBulletPoints && showBulletPoints !== false) {
                const bulletLines = formatBulletPoints(trimmedParagraph);
                formattedText = bulletLines.join('\n');
            }

            const estimatedLines = pdf.splitTextToSize(formattedText, MAX_TEXT_WIDTH);
            const neededHeight = estimatedLines.length * 5.5 + 3;
            
            checkAndAddPageLocal(neededHeight, isSignatureSection);

            const wrappedLines = pdf.splitTextToSize(formattedText, MAX_TEXT_WIDTH);
            
            for (let i = 0; i < wrappedLines.length; i++) {
                const line = wrappedLines[i];
                const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*');
                const xOffset = isBullet ? 2 : 0;
                pdf.text(line, marginX + xOffset, currentY + (i * 5.5));
            }
            
            currentY += wrappedLines.length * 5.5 + 2.5;
        }

        // ============================================
        // 10. SIGNATURE
        // ============================================
        currentY += 2.5;

        const signatureNeeded = 35;
        const remainingAfterBody = getRemainingSpace();
        
        if (remainingAfterBody < signatureNeeded && !pageExtended) {
            const compressionNeeded = signatureNeeded - remainingAfterBody + 5;
            if (compressionNeeded <= 3) {
                currentY -= compressionNeeded;
            } else {
                const extendAmount = Math.min(4, compressionNeeded + 2);
                pageHeight += extendAmount;
                pageExtended = true;
                pdf.internal.pageSize.setHeight(pageHeight);
            }
        }

        // Extra nudges (mm) for the "Sincerely," line and the signer's name only —
        // named so nothing here is a bare magic number. Everything downstream keeps
        // flowing from the un-nudged baseline.
        const SINCERELY_EXTRA_DOWN = 3;
        const SINCERELY_EXTRA_RIGHT = 1;
        const SIGNATURE_NAME_EXTRA_DOWN = 2;
        // Signature name size: original 14pt increased by 30%, then reduced by 30% in total
        const SIGNATURE_NAME_BASE_FONT_SIZE = 14 * 1.3;
        const SIGNATURE_NAME_FONT_SIZE_DECREASE = 0.30;
        const SIGNATURE_NAME_FONT_SIZE = SIGNATURE_NAME_BASE_FONT_SIZE * (1 - SIGNATURE_NAME_FONT_SIZE_DECREASE);

        // Sincerely's font size, bumped 10% above the original base size.
        const SINCERELY_BASE_FONT_SIZE = 10;
        const SINCERELY_FONT_SIZE_INCREASE = 0.15;
        const SINCERELY_FONT_SIZE = SINCERELY_BASE_FONT_SIZE * (1 + SINCERELY_FONT_SIZE_INCREASE);

        // No divider above the signature any more, so the space it used to take
        // is not kept as empty gap: the block starts right where the body ends.
        // Baseline the rest of the signature block continues from (un-nudged).
        const signatureBlockBaseline = currentY;

        const sincerelyBaseY = signatureBlockBaseline + 2;
        const sincerelyY = renderLeftWrappedText(
            'Sincerely,',
            marginX + SINCERELY_EXTRA_RIGHT,
            sincerelyBaseY + SINCERELY_EXTRA_DOWN,
            SINCERELY_FONT_SIZE,
            'normal',
            DARK_COLOR,
            MAX_TEXT_WIDTH
        );
        // Continue the flow as if unshifted (subtract the nudge back out) so the
        // name's baseline isn't thrown off by the "Sincerely," move.
        const sincerelyBlockEndY = sincerelyY - SINCERELY_EXTRA_DOWN + 1.5;

        const sigNameBaseY = sincerelyBlockEndY + 2;
        const sigNameY = renderLeftWrappedText(
            cleanName,
            marginX,
            sigNameBaseY + SIGNATURE_NAME_EXTRA_DOWN,
            SIGNATURE_NAME_FONT_SIZE,
            'bold',
            DARK_COLOR,
            MAX_TEXT_WIDTH
        );
        // Strip the name's extra nudge back out; no job title below the signature.
        const sigNameBlockEndY = sigNameY - SIGNATURE_NAME_EXTRA_DOWN + 0.5;
        currentY = sigNameBlockEndY;

        return pdf.output('blob');
    }

}