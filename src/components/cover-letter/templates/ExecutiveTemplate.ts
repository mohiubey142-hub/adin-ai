// src/components/cover-letter/templates/ExecutiveTemplate.ts
import jsPDF from 'jspdf';
import { 
    cleanText, 
    cleanEmail, 
    cleanPhoneNumber, 
    cleanLinkedin,
    makeCircularImage,
    addFooter,
    cleanLetterBody
} from '../utils/pdfHelpers';
import { CoverLetterData, PDFTemplate } from './BaseTemplate';

export class ExecutiveTemplate implements PDFTemplate {
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
        } = data;

        const pdf = new jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const marginX = 24;
        const marginY = 22;
        let currentY = marginY;
        const BOTTOM_MARGIN = 16;

        // ===== EXECUTIVE COLORS =====
        const GOLD_COLOR = [212, 175, 55]; // Gold
        const DARK_COLOR = [20, 20, 40]; // Dark navy
        const LIGHT_TEXT = [100, 100, 100];
        const WHITE = [255, 255, 255];

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
        // HEADER - EXECUTIVE: Centered, Luxury
        // ============================================
        const photoSize = 24;
        const cleanName = cleanText(userName || 'Your Name');
        const cleanTitle = cleanText(jobTitle || 'Job Title');
        const cleanCompany = cleanText(company || '');

        // Contact parts
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
        const contactText = contactParts.join('  |  ');

        let headerHandled = false;
        let centerX = pageWidth / 2;

        if (profilePhoto && profilePhoto.startsWith('data:image')) {
            try {
                const circularImage = await makeCircularImage(profilePhoto);
                const imgX = centerX - photoSize / 2;
                const imgY = currentY;
                
                pdf.addImage(circularImage, 'PNG', imgX, imgY, photoSize, photoSize);
                currentY += photoSize + 4;
                
                // Name - CENTERED, LARGE
                pdf.setFontSize(26);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(DARK_COLOR[0], DARK_COLOR[1], DARK_COLOR[2]);
                const nameWidth = pdf.getTextWidth(cleanName);
                pdf.text(cleanName, centerX - nameWidth / 2, currentY);
                currentY += 8;
                
                // Title - CENTERED, Gold
                pdf.setFontSize(13);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
                const titleWidth = pdf.getTextWidth(cleanTitle);
                pdf.text(cleanTitle, centerX - titleWidth / 2, currentY);
                currentY += 5;
                
                // Contact - CENTERED
                if (contactText) {
                    pdf.setFontSize(8.5);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2]);
                    const contactWidth = pdf.getTextWidth(contactText);
                    pdf.text(contactText, centerX - contactWidth / 2, currentY);
                    currentY += 6;
                }
                
                headerHandled = true;
                
            } catch (err) {
                console.error('Failed to add profile photo to PDF:', err);
                headerHandled = false;
            }
        }

        if (!headerHandled) {
            // Name - CENTERED, LARGE (no photo)
            pdf.setFontSize(26);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(DARK_COLOR[0], DARK_COLOR[1], DARK_COLOR[2]);
            const nameWidth = pdf.getTextWidth(cleanName);
            pdf.text(cleanName, centerX - nameWidth / 2, currentY);
            currentY += 8;
            
            // Title - CENTERED, Gold
            pdf.setFontSize(13);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
            const titleWidth = pdf.getTextWidth(cleanTitle);
            pdf.text(cleanTitle, centerX - titleWidth / 2, currentY);
            currentY += 5;
            
            // Contact - CENTERED
            if (contactText) {
                pdf.setFontSize(8.5);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2]);
                const contactWidth = pdf.getTextWidth(contactText);
                pdf.text(contactText, centerX - contactWidth / 2, currentY);
                currentY += 6;
            }
        }

        // ============================================
        // EXECUTIVE DOUBLE GOLD DIVIDER LINES
        // ============================================
        currentY += 3;
        
        // Main thick gold line
        pdf.setDrawColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
        pdf.setLineWidth(0.6);
        pdf.line(marginX + 10, currentY, pageWidth - marginX - 10, currentY);
        
        // Thin second gold line below
        currentY += 2;
        pdf.setDrawColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
        pdf.setLineWidth(0.2);
        pdf.line(marginX + 20, currentY, pageWidth - marginX - 20, currentY);
        currentY += 5;

        // ============================================
        // DATE - Right aligned (Executive)
        // ============================================
        pdf.setFontSize(9.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2]);
        const today = new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        const dateWidth = pdf.getTextWidth(today);
        pdf.text(today, pageWidth - marginX - dateWidth, currentY);
        currentY += 7;

        // ============================================
        // RECIPIENT & SUBJECT
        // ============================================
        pdf.setFontSize(10.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(DARK_COLOR[0], DARK_COLOR[1], DARK_COLOR[2]);
        pdf.text('Hiring Manager', marginX, currentY);
        currentY += 5;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2]);
        
        if (cleanCompany) {
            pdf.text(cleanCompany, marginX, currentY);
            currentY += 5;
        }
        
        currentY += 2;
        
        const subject = `RE: Application for ${cleanTitle}`;
        const wrappedSubject = pdf.splitTextToSize(subject, pageWidth - marginX * 2);
        pdf.text(wrappedSubject, marginX, currentY);
        currentY += wrappedSubject.length * 4.5 + 5;

        // ============================================
        // SALUTATION - Executive
        // ============================================
        pdf.setFontSize(10.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(DARK_COLOR[0], DARK_COLOR[1], DARK_COLOR[2]);
        pdf.text('Dear Hiring Manager,', marginX, currentY);
        currentY += 6;

        // ============================================
        // LETTER BODY - Executive: 1.7 line height
        // ============================================
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10.5);
        pdf.setLineHeightFactor(1.7);
        pdf.setTextColor(DARK_COLOR[0], DARK_COLOR[1], DARK_COLOR[2]);

        let cleanLetter = cleanLetterBody(generatedLetter);
        cleanLetter = cleanLetter.replace(/\r\n/g, '\n');
        cleanLetter = cleanLetter.replace(/\r/g, '\n');
        
        const paragraphs = cleanLetter.split(/\n\n+/);
        
        for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
            const paragraph = paragraphs[pIndex];
            const trimmedParagraph = paragraph.trim();
            
            if (!trimmedParagraph) continue;
            
            // Skip headers
            if (trimmedParagraph.match(/^\w+ \d{1,2}, \d{4}$/)) continue;
            if (trimmedParagraph === 'Hiring Manager') continue;
            if (trimmedParagraph.includes('RE:') || trimmedParagraph.includes('Application for')) continue;
            if (trimmedParagraph === cleanCompany) continue;
            if (trimmedParagraph === cleanName) continue;
            if (trimmedParagraph === cleanTitle) continue;
            if (trimmedParagraph.toLowerCase().includes('dear hiring manager')) continue;
            if (trimmedParagraph.startsWith('Hiring Manager')) continue;
            if (trimmedParagraph.includes('@') && (trimmedParagraph.includes('|') || trimmedParagraph.includes('gmail'))) continue;
            
            const estimatedLines = pdf.splitTextToSize(trimmedParagraph, pageWidth - marginX * 2);
            const neededHeight = estimatedLines.length * 5.5 + 4;
            checkAndAddPageLocal(neededHeight);
            
            const wrappedLines = pdf.splitTextToSize(trimmedParagraph, pageWidth - marginX * 2);
            pdf.text(wrappedLines, marginX, currentY);
            currentY += wrappedLines.length * 5.5 + 4;
        }

        // ============================================
        // SIGNATURE - Executive Luxury
        // ============================================
        currentY += 4;

        if ((pageHeight - BOTTOM_MARGIN - currentY) < 35) {
            pdf.addPage();
            currentY = marginY;
        }

        // Gold decorative line above signature
        pdf.setDrawColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
        pdf.setLineWidth(0.4);
        pdf.line(marginX, currentY, marginX + 35, currentY);
        currentY += 5;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(DARK_COLOR[0], DARK_COLOR[1], DARK_COLOR[2]);
        pdf.text('Sincerely,', marginX, currentY);
        currentY += 8;

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(DARK_COLOR[0], DARK_COLOR[1], DARK_COLOR[2]);
        pdf.text(cleanName, marginX, currentY);
        currentY += 7;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
        pdf.text(cleanTitle, marginX, currentY);
        currentY += 5;

        if (cleanCompany) {
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2]);
            pdf.text(cleanCompany, marginX, currentY);
        }

        // ============================================
        // FOOTER - Executive: CONFIDENTIAL
        // ============================================
        const totalPages = pdf.getNumberOfPages();
        addFooter(pdf, pageWidth, pageHeight, marginX, userName, totalPages, 'CONFIDENTIAL');

        return pdf.output('blob');
    }
}