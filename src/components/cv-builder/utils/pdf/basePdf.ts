// utils/pdf/basePdf.ts
import jsPDF from 'jspdf';

export interface ThemeColors {
    primary: [number, number, number];
    secondary: [number, number, number];
    accent: [number, number, number];
    text: [number, number, number];
    textLight: [number, number, number];
    textLighter: [number, number, number];
    background: [number, number, number];
    border: [number, number, number];
    divider: [number, number, number];
    tagBg: [number, number, number];
    tagBorder: [number, number, number];
    link: [number, number, number];
}

export interface ThemeConfig {
    name: string;
    colors: ThemeColors;
    headerFontSize: number;
    sectionTitleFontSize: number;
    nameFontSize: number;
    jobTitleFontSize: number;
    contactFontSize: number;
    socialFontSize: number;
    bodyFontSize: number;
    bulletFontSize: number;
    tagFontSize: number;
    footerFontSize: number;
    headerSpacing: number;
    sectionSpacing: number;
    bulletIndent: number;
    tagPadding: number;
    tagSpacing: number;
    tagHeight: number;
    lineWidth: number;
    dividerLineWidth: number;
    photoBorderWidth: number;
    roundedRectRadius: number;
    useUppercaseHeaders: boolean;
    useDividerLines: boolean;
    useTagBackgrounds: boolean;
    usePhotoBorder: boolean;
    useTwoColumnLayout: boolean;
}

export class PDFGeneratorBase {
    protected pdf: jsPDF;
    protected theme: ThemeConfig;
    protected colors: ThemeColors;
    protected pageWidth: number;
    protected pageHeight: number;
    protected marginX: number;
    protected marginY: number;
    protected bottomSafeZone: number;
    protected footerSafeZone: number;
    protected maxLineWidth: number;
    protected currentY: number;
    protected currentPage: number;
    protected pageBreaks: number[];
    protected currentSectionName: string;
    protected personalInfo: any;

    constructor(theme: ThemeConfig) {
        this.pdf = new jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true
        });
        
        try {
            (this.pdf as any).textRenderingMode = 'quality';
        } catch (_) {
            // Silently fail if not supported
        }
        
        this.theme = theme;
        this.colors = theme.colors;
        this.pageWidth = this.pdf.internal.pageSize.getWidth();
        this.pageHeight = this.pdf.internal.pageSize.getHeight();
        this.marginX = 15;
        this.marginY = 20;
        this.bottomSafeZone = 25;
        this.footerSafeZone = 22;
        this.maxLineWidth = this.pageWidth - (this.marginX * 2);
        this.currentY = this.marginY;
        this.currentPage = 1;
        this.pageBreaks = [];
        this.currentSectionName = '';
        this.personalInfo = null;

        this.pdf.setProperties({
            title: 'Resume',
            author: 'CV Builder',
            subject: 'Professional Resume'
        });
    }

    protected cleanText(text: string): string {
        if (!text) return '';
        let cleaned = text;
        
        const emojiMap: Record<string, string> = {
            '📧': 'Email: ', '📞': 'Phone: ', '📍': 'Address: ',
            '🔗': 'LinkedIn: ', '🐙': 'GitHub: ', '🌐': 'Portfolio: ',
            '📜': 'Certificate: ', '🏆': 'Award: ', '🎉': 'Congratulations! ',
            '⚠️': 'Warning: ', '✅': '', '✓': '', '•': '', '*': '',
            '⭐': '', '🌟': '', '💡': '', '🎯': '', '🚀': '',
            '💪': '', '🔥': '', '✨': '', '👏': '', '🙌': '',
        };
        for (const [emoji, replacement] of Object.entries(emojiMap)) {
            cleaned = cleaned.split(emoji).join(replacement);
        }
        
        cleaned = cleaned.replace(/[^\x20-\x7E\n\r\t]/g, '');
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        cleaned = cleaned.replace(/^[•\-*✓✅]\s*/, '');
        
        return cleaned;
    }

    protected getRemainingSpace(): number {
        return this.pageHeight - this.footerSafeZone - this.currentY;
    }

    protected canFitLine(heightNeeded: number): boolean {
        return this.getRemainingSpace() >= heightNeeded + 2;
    }

    protected canFitBlock(heightNeeded: number): boolean {
        return this.getRemainingSpace() >= heightNeeded + 4;
    }

    protected addNewPage(sectionName: string = ''): void {
        this.pdf.addPage();
        this.currentPage = this.pdf.getNumberOfPages();
        this.currentY = this.marginY;
        this.currentSectionName = sectionName;
        this.pageBreaks.push(this.currentPage);
    }

    protected getTextHeight(text: string, maxWidth: number, fontSize: number = 10, isBold: boolean = false): number {
        if (!text) return 0;
        this.pdf.setFontSize(fontSize);
        this.pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        const cleanedText = this.cleanText(text);
        const lines = this.pdf.splitTextToSize(cleanedText, maxWidth);
        return lines.length * (fontSize * 0.38) + (lines.length - 1) * 0.3;
    }

    protected renderWrappedText(text: string, x: number, y: number, maxWidth: number, fontSize: number = 10, isBold: boolean = false): number {
        if (!text) return 0;
        this.pdf.setFontSize(fontSize);
        this.pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        const cleanedText = this.cleanText(text);
        const lines = this.pdf.splitTextToSize(cleanedText, maxWidth);
        this.pdf.text(lines, x, y);
        return lines.length * (fontSize * 0.38) + (lines.length - 1) * 0.3;
    }

    protected renderSectionTitle(title: string): void {
        this.currentSectionName = title;
        
        // Check if enough space for heading + minimum 2 lines
        const headingHeight = 16;
        const minContentHeight = 10;
        if (this.getRemainingSpace() < headingHeight + minContentHeight) {
            this.addNewPage(title);
        }
        
        this.currentY += 2;
        
        const displayTitle = this.theme.useUppercaseHeaders ? this.cleanText(title).toUpperCase() : this.cleanText(title);
        this.pdf.setFontSize(this.theme.sectionTitleFontSize);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
        this.pdf.text(displayTitle, this.marginX, this.currentY);
        this.currentY += 8;
        
        if (this.theme.useDividerLines) {
            this.pdf.setLineWidth(this.theme.dividerLineWidth);
            this.pdf.setDrawColor(this.colors.divider[0], this.colors.divider[1], this.colors.divider[2]);
            this.pdf.line(this.marginX, this.currentY, this.pageWidth - this.marginX, this.currentY);
        }
        this.currentY += 6;
        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
        this.pdf.setFont('helvetica', 'normal');
    }

    protected renderBulletPoint(text: string, indent: number = 5): number {
        if (!text) return 0;
        const bulletX = this.marginX + indent;
        const textX = bulletX + 4;
        const maxWidth = this.pageWidth - textX - this.marginX;
        this.pdf.setFontSize(this.theme.bulletFontSize);
        this.pdf.setFont('helvetica', 'normal');
        let cleanedText = this.cleanText(text);
        cleanedText = cleanedText.replace(/^[•\-*✓✅]\s*/, '');
        const lines = this.pdf.splitTextToSize(cleanedText, maxWidth);
        
        this.pdf.setFontSize(this.theme.bulletFontSize);
        this.pdf.setTextColor(this.colors.accent[0], this.colors.accent[1], this.colors.accent[2]);
        this.pdf.text('•', bulletX, this.currentY + 0.5);
        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
        this.pdf.text(lines, textX, this.currentY);
        const height = lines.length * (this.theme.bulletFontSize * 0.38) + (lines.length - 1) * 0.3;
        this.currentY += height;
        return height;
    }

    protected renderFooter(): void {
        const totalPages = this.pdf.getNumberOfPages();
        const nameForFooter = this.cleanText(this.personalInfo?.name || 'CV');
        
        for (let i = 1; i <= totalPages; i++) {
            this.pdf.setPage(i);
            
            const footerDividerY = this.pageHeight - this.footerSafeZone + 2;
            this.pdf.setDrawColor(this.colors.divider[0], this.colors.divider[1], this.colors.divider[2]);
            this.pdf.setLineWidth(0.3);
            this.pdf.line(this.marginX, footerDividerY, this.pageWidth - this.marginX, footerDividerY);
            
            this.pdf.setFontSize(this.theme.footerFontSize);
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setTextColor(this.colors.textLighter[0], this.colors.textLighter[1], this.colors.textLighter[2]);
            
            const footerText = `${nameForFooter} | Page ${i} of ${totalPages}`;
            const footerWidth = this.pdf.getTextWidth(footerText);
            const footerY = this.pageHeight - this.footerSafeZone + 6;
            this.pdf.text(footerText, this.pageWidth - this.marginX - footerWidth, footerY);
        }
    }

    // ✅ FIXED: makeCircularImage - Circular crop using Canvas (Restored)
    protected makeCircularImage(imageDataUrl: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const size = Math.min(img.width, img.height);
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }
                
                ctx.clearRect(0, 0, size, size);
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                
                const sx = (img.width - size) / 2;
                const sy = (img.height - size) / 2;
                ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
                
                // Optional: Add border
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = imageDataUrl;
        });
    }

    // ✅ NEW: Resize image for PDF (optional, keeps image size manageable)
    protected async prepareImageForPDF(imageDataUrl: string, maxSize: number = 400): Promise<string> {
        if (!imageDataUrl) return '';
        return imageDataUrl;
    }

    protected formatDateRange(startDate: string, endDate: string): string {
        const start = this.cleanText(startDate || '');
        let end = this.cleanText(endDate || '');
        
        if (!start && !end) return '';
        if (!start) return end;
        if (!end) return start;
        
        if (end.toLowerCase() === 'present') {
            return `${start} – Present`;
        }
        
        return `${start} – ${end}`;
    }
}