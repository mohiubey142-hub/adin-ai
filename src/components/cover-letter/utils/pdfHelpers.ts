// src/components/cover-letter/utils/pdfHelpers.ts
import jsPDF from 'jspdf';

// ============================================
// CLEAN TEXT - Remove emojis and special chars
// ============================================
export const cleanText = (text: string): string => {
    if (!text) return '';
    let cleaned = text;
    
    const emojiMap: Record<string, string> = {
        '📧': '', '📞': '', '📍': '', '🔗': '', '🐙': '', '🌐': '',
        '📜': '', '🏆': '', '🎉': '', '⚠️': '', '✅': '', '✓': '',
        '•': '', '*': '', '✨': '', '🎓': '', '💼': '', '⚡': '',
        '📋': '', '📄': '', '✏️': '', '📥': '', '👁️': '', '📊': '',
        '💻': '', '🚀': '', '🎯': '', '⭐': '', '**': '', '__': '',
        '>': '', '|': '',
    };
    
    for (const [emoji, replacement] of Object.entries(emojiMap)) {
        cleaned = cleaned.split(emoji).join(replacement);
    }
    
    cleaned = cleaned.replace(/[^\x20-\x7E\n\r]/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
};

// ============================================
// CLEAN EMAIL
// ============================================
export const cleanEmail = (email: string): string => {
    if (!email) return '';
    let cleaned = email.replace(/\s/g, '');
    cleaned = cleaned.replace(/[^a-zA-Z0-9@.\-_]/g, '');
    return cleaned.trim();
};

// ============================================
// CLEAN LINKEDIN
// ============================================
export const cleanLinkedin = (linkedin: string): string => {
    if (!linkedin) return '';
    let cleaned = linkedin.replace(/\s/g, '');
    cleaned = cleaned.replace(/[^a-zA-Z0-9@.:\/\-_]/g, '');
    return cleaned.trim();
};

// ============================================
// CLEAN PHONE
// ============================================
export const cleanPhoneNumber = (phone: string, countryCode: string): string => {
    if (!phone) return '';
    const cleanPhone = phone.replace(/\s/g, '');
    const digitsOnly = cleanPhone.replace(/[^0-9+]/g, '');
    return `${countryCode} ${digitsOnly}`;
};

// ============================================
// CIRCULAR IMAGE
// ============================================
export const makeCircularImage = (imageDataUrl: string): Promise<string> => {
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
            
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 0.8;
            ctx.stroke();
            
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = imageDataUrl;
    });
};

// ============================================
// ADD FOOTER
// ============================================
export const addFooter = (pdf: jsPDF, pageWidth: number, pageHeight: number, marginX: number, userName: string, totalPages: number, footerText: string = 'Cover Letter') => {
    const nameForFooter = cleanText(userName || 'CV');
    
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        pdf.setDrawColor(220, 225, 230);
        pdf.setLineWidth(0.15);
        pdf.line(marginX, pageHeight - 13, pageWidth - marginX, pageHeight - 13);
        
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(180, 180, 180);
        
        const pageText = `Page ${i} of ${totalPages}`;
        const pageWidth_ = pdf.getTextWidth(pageText);
        pdf.text(pageText, pageWidth - marginX - pageWidth_, pageHeight - 7.5);
        
        pdf.setTextColor(185, 185, 185);
        const leftText = `${nameForFooter} · ${footerText}`;
        pdf.text(leftText, marginX, pageHeight - 7.5);
    }
};

// ============================================
// CLEAN LETTER BODY - Remove duplicate dates
// ============================================
export const cleanLetterBody = (letter: string): string => {
    let cleaned = letter;
    
    // Remove any date line from the beginning (e.g., "July 1, 2026")
    cleaned = cleaned.replace(/^\w+ \d{1,2}, \d{4}\s*\n/, '');
    
    // Remove "Hiring Manager" if it appears as first line
    cleaned = cleaned.replace(/^Hiring Manager\s*\n/, '');
    
    // Remove "RE:" line if it appears as first line
    cleaned = cleaned.replace(/^RE:.*\n/, '');
    
    // Remove "Dear Hiring Manager" if it appears as first line
    cleaned = cleaned.replace(/^Dear Hiring Manager,\s*\n/, '');
    
    return cleaned.trim();
};