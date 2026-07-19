// src/components/cover-letter/templates/ModernTemplate.ts
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

export class ModernTemplate implements PDFTemplate {
    async render(data: CoverLetterData): Promise<Blob> {
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
            footerSize,
        } = data;

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
        const GRAY_COLOR = [107, 114, 128];
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
            const clean = cleanLetterBody(text);
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
                    const bulletChar = bulletMatch[1];
                    const content = bulletMatch[2];
                    formattedLines.push(`• ${content}`);
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
        // HELPER: Render centered wrapped text
        // ============================================
        const renderCenteredWrappedText = (
            text: string,
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
                const line = wrappedLines[i];
                const lineWidth = pdf.getTextWidth(line);
                pdf.text(line, pageWidth / 2 - lineWidth / 2, y + (i * lineHeight));
            }
            
            return y + (wrappedLines.length * lineHeight);
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
        const centerX = pageWidth / 2;
        const MAX_TEXT_WIDTH = pageWidth - marginX * 2;

        const contactParts1: string[] = [];
        const contactParts2: string[] = [];

        if (email) {
            const cleanEmailStr = cleanEmail(email);
            if (cleanEmailStr) contactParts1.push(cleanEmailStr);
        }
        if (phoneNumber && selectedCountryCode) {
            const cleanPhone = cleanPhoneNumber(phoneNumber, selectedCountryCode);
            if (cleanPhone) contactParts1.push(cleanPhone);
        }

        if (address) {
            const cleanAddress = cleanText(address);
            if (cleanAddress) contactParts2.push(cleanAddress);
        }
        if (linkedin) {
            const cleanLinkedinStr = cleanLinkedin(linkedin);
            if (cleanLinkedinStr) contactParts2.push(cleanLinkedinStr);
        }

        const contactLine1 = contactParts1.join(' • ');
        const contactLine2 = contactParts2.join(' • ');

        // ============================================
        // 1. PROFILE IMAGE - OPTIONAL ONLY
        // ============================================
        const photoSize = 28;
        let imageAdded = false;
        const IDENTITY_BLOCK_OFFSET = 4.5;
        let identityBlockY = currentY + IDENTITY_BLOCK_OFFSET;

        // ✅ FIX: Image OPTIONAL - Sirf tab show ho jab user ne di ho
        if (profilePhoto && profilePhoto.startsWith('data:image')) {
            try {
                const circularImage = await makeCircularImage(profilePhoto);
                const imgX = centerX - photoSize / 2;
                const imgY = identityBlockY - 4.5;
                
                pdf.addImage(circularImage, 'PNG', imgX, imgY, photoSize, photoSize);
                identityBlockY += photoSize + 6;
                imageAdded = true;
            } catch (err) {
                console.error('Failed to add profile photo to PDF:', err);
                imageAdded = false;
            }
        }

        // ✅ FIX: Agar image nahi hai toh sirf 3.5 units gap set karo (no initials)
        if (!imageAdded) {
            // ✅ Sirf gap add karo - koi initials/circle nahi
            identityBlockY += 3.5; // Top se 3.5 units gap
        }

        // ============================================
        // 2. NAME - With professional wrapping
        // ============================================
        const nameY = renderCenteredWrappedText(
            cleanName,
            identityBlockY - 2.5,
            15,
            'bold',
            DARK_COLOR,
            MAX_TEXT_WIDTH
        );
        identityBlockY = nameY + 3.5;

        // ============================================
        // 3. JOB TITLE - With professional wrapping
        // ============================================
        const titleY = renderCenteredWrappedText(
            cleanTitle,
            identityBlockY - 3.5,
            12,
            'bold',
            PRIMARY_COLOR,
            MAX_TEXT_WIDTH
        );
        identityBlockY = titleY + 1.5;

        // ============================================
        // 4. CONTACT - With professional wrapping
        // ============================================
        pdf.setFontSize(8.5);
        pdf.setFont(fontFamily, 'normal');
        pdf.setTextColor(GRAY_COLOR[0], GRAY_COLOR[1], GRAY_COLOR[2]);

        if (contactLine1) {
            const contactY = renderCenteredWrappedText(
                contactLine1,
                identityBlockY - 1.5,
                8.5,
                'normal',
                GRAY_COLOR,
                MAX_TEXT_WIDTH
            );
            identityBlockY = contactY + 1;
        }

        if (contactLine2) {
            const contactY2 = renderCenteredWrappedText(
                contactLine2,
                identityBlockY - 1.5,
                8.5,
                'normal',
                GRAY_COLOR,
                MAX_TEXT_WIDTH
            );
            identityBlockY = contactY2 + 0.5;
        } else if (!contactLine1) {
            identityBlockY += 1;
        }

        if (contactLine1 && !contactLine2) {
            identityBlockY += 1;
        }

        currentY = identityBlockY;

        // ============================================
        // 5. PREMIUM DIVIDER - Double Lines
        // ============================================
        currentY += 0;

        pdf.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
        pdf.setLineWidth(0.8);
        pdf.line(marginX, currentY, pageWidth - marginX, currentY);

        currentY += 1;
        pdf.setDrawColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
        pdf.setLineWidth(0.2);
        pdf.line(marginX + 15, currentY, pageWidth - marginX - 15, currentY);

        currentY += 5;

        // ============================================
        // 6. DATE - RIGHT Aligned
        // ============================================
        pdf.setFontSize(9.5);
        pdf.setFont(fontFamily, 'normal');
        pdf.setTextColor(GRAY_COLOR[0], GRAY_COLOR[1], GRAY_COLOR[2]);
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

        if (cleanCompany) {
            const companyY = renderLeftWrappedText(
                cleanCompany,
                marginX,
                currentY,
                10,
                'normal',
                GRAY_COLOR,
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

        let cleanLetter = cleanLetterBody(generatedLetter);
        cleanLetter = cleanLetter.replace(/\r\n/g, '\n');
        cleanLetter = cleanLetter.replace(/\r/g, '\n');

        const contentAnalysis = analyzeContent(cleanLetter);
        
        const optimizedResult = optimizeSpacing(cleanLetter);
        cleanLetter = optimizedResult.optimized;
        
        // ✅ FIX: No compression - line spacing consistent
        // if (optimizedResult.compression > 0) {
        //     currentY -= optimizedResult.compression * 0.3; // ✅ REMOVED
        // }

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

        // Purple accent line - FULL WIDTH
        pdf.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
        pdf.setLineWidth(0.4);
        pdf.line(marginX, currentY, pageWidth - marginX, currentY);
        currentY += 3.5;

        // "Sincerely" - Left aligned
        const sincerelyY = renderLeftWrappedText(
            'Sincerely,',
            marginX,
            currentY + 2,
            10,
            'normal',
            GRAY_COLOR,
            MAX_TEXT_WIDTH
        );
        currentY = sincerelyY + 1.5;

        // Name - Large, Purple, Bold
        const sigNameY = renderLeftWrappedText(
            cleanName,
            marginX,
            currentY + 2,
            14,
            'bold',
            PRIMARY_COLOR,
            MAX_TEXT_WIDTH
        );
        currentY = sigNameY + 0.5;

        // Job Title - Gray with wrapping
        const sigTitleY = renderLeftWrappedText(
            cleanTitle,
            marginX,
            currentY + 2,
            9.5,
            'normal',
            GRAY_COLOR,
            MAX_TEXT_WIDTH
        );
        currentY = sigTitleY + 1.5;

        // ============================================
        // 11. FOOTER - Enhanced with customizable size
        // ============================================
        const totalPages = pdf.getNumberOfPages();
        const nameForFooter = cleanName;
        const footerFontSize = footerSize || 7;

        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);

            pdf.setDrawColor(220, 225, 230);
            pdf.setLineWidth(0.15);
            pdf.line(marginX, pageHeight - 13, pageWidth - marginX, pageHeight - 13);

            pdf.setFontSize(footerFontSize);
            pdf.setFont(fontFamily, 'normal');
            pdf.setTextColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);

            const pageText = `Page ${i} of ${totalPages}`;
            const pageWidth_ = pdf.getTextWidth(pageText);
            pdf.text(pageText, pageWidth - marginX - pageWidth_, pageHeight - 7.5);

            const leftText = `${nameForFooter} · ${cleanTitle || 'Cover Letter'}`;
            const wrappedLeftText = pdf.splitTextToSize(leftText, MAX_TEXT_WIDTH);
            for (let j = 0; j < wrappedLeftText.length; j++) {
                pdf.text(wrappedLeftText[j], marginX, pageHeight - 7.5 + (j * 3));
            }
        }

        return pdf.output('blob');
    }

}