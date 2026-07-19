// src/components/cover-letter/templates/ClassicTemplate.ts
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

export class ClassicTemplate implements PDFTemplate {
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
        const marginX = 20;
        const marginY = 18;
        let currentY = marginY;
        const BOTTOM_MARGIN = 16;

        // ============================================
        // HELPER: Render wrapped text with proper spacing
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
        const photoSize = 20;
        let headerY = currentY;
        let headerHandled = false;

        if (profilePhoto && profilePhoto.startsWith('data:image')) {
            try {
                const circularImage = await makeCircularImage(profilePhoto);
                const imgX = marginX;
                const imgY = headerY; // Image stays at original position - NOT TOUCHED
                
                pdf.addImage(circularImage, 'PNG', imgX, imgY, photoSize, photoSize);
                
                const nameX = marginX + photoSize + 6;
                const maxWidth = pageWidth - nameX - marginX;
                
                // FIX: All text elements shifted DOWN by 3mm (added +3 to each Y coordinate)
                const TEXT_SHIFT = 3; // 3 units down
                
                // Name - with wrapping (shifted down by 3mm)
                const name = cleanText(userName || 'Your Name').toUpperCase();
                const nameY = renderWrappedText(
                    name,
                    nameX,
                    imgY + 5 + TEXT_SHIFT, // WAS: imgY + 5
                    maxWidth,
                    18,
                    'bold',
                    [44, 62, 80]
                );
                
                // Job Title - with wrapping (shifted down by 3mm)
                const title = cleanText(jobTitle || 'Job Title');
                const titleY = renderWrappedText(
                    title,
                    nameX,
                    imgY + 10.5 + TEXT_SHIFT, // WAS: imgY + 10.5
                    maxWidth,
                    10,
                    'bold',
                    [127, 140, 141]
                );
                
                // Contact - with wrapping (shifted down by 3mm)
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
                if (contactText) {
                    const contactY = renderWrappedText(
                        contactText,
                        nameX,
                        imgY + 16 + TEXT_SHIFT, // WAS: imgY + 16
                        maxWidth,
                        7.5,
                        'normal',
                        [80, 80, 80]
                    );
                }
                
                currentY = imgY + photoSize + 4;
                headerHandled = true;
                
            } catch (err) {
                console.error('Failed to add profile photo to PDF:', err);
                headerHandled = false;
            }
        }

        if (!headerHandled) {
            const maxWidth = pageWidth - marginX * 2;
            
            // Name - with wrapping
            const name = cleanText(userName || 'Your Name').toUpperCase();
            const nameY = renderWrappedText(
                name,
                marginX,
                currentY,
                maxWidth,
                20,
                'bold',
                [44, 62, 80]
            );
            currentY = nameY + 2;
            
            // Job Title - with wrapping
            const title = cleanText(jobTitle || 'Job Title');
            const titleY = renderWrappedText(
                title,
                marginX,
                currentY,
                maxWidth,
                11,
                'bold',
                [127, 140, 141]
            );
            currentY = titleY + 2;
            
            // Contact - with wrapping
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
            if (contactText) {
                const contactY = renderWrappedText(
                    contactText,
                    marginX,
                    currentY,
                    maxWidth,
                    8,
                    'normal',
                    [80, 80, 80]
                );
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
        pdf.setTextColor(100, 100, 100);
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
        pdf.setTextColor(44, 62, 80);
        pdf.text('Hiring Manager', marginX, currentY);
        currentY += 5;
        
        const maxWidth = pageWidth - marginX * 2;
        
        // Company - with wrapping
        if (company) {
            const companyY = renderWrappedText(
                cleanText(company),
                marginX,
                currentY,
                maxWidth,
                10,
                'normal',
                [80, 80, 80]
            );
            currentY = companyY + 2;
        }
        
        currentY += 2;
        
        const subject = `RE: Application for ${cleanText(jobTitle || 'Position')}`;
        const wrappedSubject = pdf.splitTextToSize(subject, maxWidth);
        pdf.text(wrappedSubject, marginX, currentY);
        currentY += wrappedSubject.length * 4.5 + 5;

        // ============================================
        // SALUTATION
        // ============================================
        pdf.setFontSize(10.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(44, 62, 80);
        pdf.text('Dear Hiring Manager,', marginX, currentY);
        currentY += 6;

        // ============================================
        // LETTER BODY
        // ============================================
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(30, 30, 30);

        let cleanLetter = cleanLetterBody(generatedLetter);
        cleanLetter = cleanLetter.replace(/\r\n/g, '\n');
        cleanLetter = cleanLetter.replace(/\r/g, '\n');
        
        const paragraphs = cleanLetter.split(/\n\n+/);
        
        for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
            const paragraph = paragraphs[pIndex];
            const trimmedParagraph = paragraph.trim();
            
            if (!trimmedParagraph) continue;
            
            // Skip headers that might have been left
            if (trimmedParagraph.match(/^\w+ \d{1,2}, \d{4}$/)) continue;
            if (trimmedParagraph === 'Hiring Manager') continue;
            if (trimmedParagraph.includes('RE:') || trimmedParagraph.includes('Application for')) continue;
            if (trimmedParagraph === company) continue;
            if (trimmedParagraph === cleanText(company)) continue;
            if (trimmedParagraph === userName || trimmedParagraph === userName?.toUpperCase()) continue;
            if (trimmedParagraph === jobTitle) continue;
            if (trimmedParagraph.toLowerCase().includes('dear hiring manager')) continue;
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
        // SIGNATURE - FIXED GAP ISSUE
        // ============================================
        currentY += 4;

        if ((pageHeight - BOTTOM_MARGIN - currentY) < 20) {
            pdf.addPage();
            currentY = marginY;
        }

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(30, 30, 30);
        pdf.text('Sincerely,', marginX, currentY);
        currentY += 7;

        // Signature Name - with wrapping
        const sigNameY = renderWrappedText(
            cleanText(userName || 'Your Name'),
            marginX,
            currentY,
            maxWidth,
            12,
            'bold',
            [44, 62, 80]
        );
        currentY = sigNameY + 2;

        // Signature Title - with wrapping
        const sigTitleY = renderWrappedText(
            cleanText(jobTitle || 'Job Title'),
            marginX,
            currentY - 2,
            maxWidth,
            9,
            'normal',
            [127, 140, 141]
        );
        currentY = sigTitleY - 2;

        // ============================================
        // FOOTER
        // ============================================
        const totalPages = pdf.getNumberOfPages();
        addFooter(pdf, pageWidth, pageHeight, marginX, userName, totalPages, 'Cover Letter');

        return pdf.output('blob');
    }
}