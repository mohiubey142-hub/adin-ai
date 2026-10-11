// src/components/cover-letter/utils/pdfHelpers.ts
// =====================================================
// ✅ UPDATED: cleanLetterBody — aggressive Dear/name/greeting removal
// Handles:
//   - "Dear Midhat Sultan," / "Dear Midhat Sultan"
//   - "Dear Hiring Manager," / "Dear Hiring Team,"
//   - Bare "Dear\n"
//   - "Dear I am writing..." (no name)
//   - Multiple "Dear" leaks (5-pass safety net)
//   - Hiring manager name at start (full + first name)
//   - Duplicate date/RE/company lines
// =====================================================

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
// ✅ UPGRADED: CLEAN LETTER BODY
// ============================================
// Removes (in order):
//   1. Leading date (multiple formats)
//   2. "Hiring Manager" literal
//   3. "RE: ..." line
//   4. "Dear [Name],", "Dear Hiring Manager,", "Dear Hiring Team,"
//   5. Bare "Dear" (no name)
//   6. "Dear I am..." (no name, direct body)
//   7. Hiring manager name at start (full name + first name + safety net)
//   8. Final "Dear" safety net (5 passes)
//   9. Leading punctuation/whitespace
//
// Ensures body starts with a letter.
// ============================================
export const cleanLetterBody = (
    letter: string,
    hiringManagerName?: string
): string => {
    if (!letter) return '';
    
    let cleaned = letter;
    
    // ============================================
    // Step 1: Remove leading DATE (multiple formats)
    // ============================================
    for (let i = 0; i < 3; i++) {
        const before = cleaned;
        // "September 27, 2026" / "Sept 27, 2026"
        cleaned = cleaned.replace(
            /^\s*(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\s*[\n\r]+/i,
            ''
        );
        // "27 September 2026" / "27 Sept 2026"
        cleaned = cleaned.replace(
            /^\s*\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+\d{4}\s*[\n\r]+/i,
            ''
        );
        // Fallback: any "Word 27, 2026"
        cleaned = cleaned.replace(
            /^\s*\w+\s+\d{1,2},?\s+\d{4}\s*[\n\r]+/,
            ''
        );
        if (cleaned === before) break;
    }
    
    // ============================================
    // Step 2: Remove "Hiring Manager" literal (own line)
    // ============================================
    for (let i = 0; i < 2; i++) {
        const before = cleaned;
        cleaned = cleaned.replace(/^\s*Hiring Manager\s*[\n\r]+/i, '');
        if (cleaned === before) break;
    }
    
    // ============================================
    // Step 3: Remove "RE: ..." line
    // ============================================
    for (let i = 0; i < 2; i++) {
        const before = cleaned;
        cleaned = cleaned.replace(/^\s*RE:\s*[^\n\r]*[\n\r]+/i, '');
        cleaned = cleaned.replace(/^\s*RE:\s*[^\n\r]*$/im, '');
        if (cleaned === before) break;
    }
    
    // ============================================
    // Step 4: Remove "Dear [Name]," (case-sensitive name match)
    // Handles: "Dear Midhat Sultan,", "Dear Midhat Sultan", "Dear Sarah Johnson,"
    // ============================================
    for (let i = 0; i < 3; i++) {
        const before = cleaned;
        cleaned = cleaned.replace(
            /^\s*Dear\s+(?:[A-Z][A-Za-z.'-]*(?:\s+[A-Z][A-Za-z.'-]*)*)\s*[,:]?\s*[\n\r]+/,
            ''
        );
        if (cleaned === before) break;
    }
    
    // ============================================
    // Step 4.1: Remove "Dear Hiring Manager," / "Dear Hiring Team," / etc.
    // ============================================
    for (let i = 0; i < 3; i++) {
        const before = cleaned;
        cleaned = cleaned.replace(
            /^\s*Dear\s+Hiring\s+(?:Manager|Team|Committee|Director|Recruiter|HR|Personnel)\s*[,:]?\s*[\n\r]+/i,
            ''
        );
        if (cleaned === before) break;
    }
    
    // ============================================
    // Step 4.5: Remove BARE "Dear" (no name after)
    // Handles: "Dear\n", "Dear,", "Dear \n"
    // ============================================
    for (let i = 0; i < 3; i++) {
        const before = cleaned;
        cleaned = cleaned.replace(/^\s*Dear\s*[,:]?\s*[\n\r]+/i, '');
        if (cleaned === before) break;
    }
    
    // ============================================
    // Step 4.6: Remove "Dear I am..." / "Dear We are..." (no name, direct body)
    // ============================================
    cleaned = cleaned.replace(
        /^\s*Dear\s+(?=(?:I|We|My|Our|This|Thank|As|With|Having|Being|It)\b)/i,
        ''
    );
    
    // ============================================
    // Step 4.7: Remove "Dear [any lowercase word]" (fallback)
    // Handles edge cases where name has lowercase
    // ============================================
    cleaned = cleaned.replace(
        /^\s*Dear\s+[a-z][A-Za-z.'-]*\s*[,:]?\s*[\n\r]+/i,
        ''
    );
    
    // ============================================
    // Step 5: Remove HIRING MANAGER NAME at start (if provided)
    // ============================================
    if (hiringManagerName && hiringManagerName.trim()) {
        const name = hiringManagerName.trim();
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        for (let i = 0; i < 3; i++) {
            const before = cleaned;
            
            // Full name at start (case-insensitive)
            cleaned = cleaned.replace(
                new RegExp(`^\\s*${escapedName}\\s*[,:.\\-]?[\\s\\n]+`, 'i'),
                ''
            );
            
            // First name only at start (if >= 3 chars)
            const firstName = name.split(/\s+/)[0];
            if (firstName && firstName.length >= 3) {
                const escapedFirst = firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                cleaned = cleaned.replace(
                    new RegExp(`^\\s*${escapedFirst}\\s*[,:.\\-]?[\\s\\n]+`, 'i'),
                    ''
                );
            }
            
            if (cleaned === before) break;
        }
        
        // Safety net: search full name in first 150 chars
        const firstChunk = cleaned.slice(0, 150);
        const lowerName = name.toLowerCase();
        const idx = firstChunk.toLowerCase().indexOf(lowerName);
        
        if (idx >= 0 && idx < 80) {
            cleaned =
                cleaned.slice(0, idx) +
                cleaned.slice(idx + name.length).replace(/^[\s,.:;\-]+/, '');
        }
    }
    
    // ============================================
    // Step 6: FINAL SAFETY — 5-pass force strip anything starting with "Dear"
    // Handles pathological cases: multiple "Dear" leaks
    // ============================================
    for (let i = 0; i < 5; i++) {
        const before = cleaned;
        // Strip "Dear" + anything up to first newline (max 60 chars)
        cleaned = cleaned.replace(/^\s*Dear\b[\s\S]{0,60}?[\n\r]+/i, '');
        // Also try: just "Dear" with no newline after
        cleaned = cleaned.replace(/^\s*Dear\b\s*[,:]?\s*/i, '');
        if (cleaned === before) break;
    }
    
    // ============================================
    // Step 7: Ensure body starts with a letter
    // ============================================
    cleaned = cleaned.replace(/^[^A-Za-z]+/, '');
    
    // ============================================
    // Step 8: Normalize newlines
    // ============================================
    cleaned = cleaned.replace(/\r\n/g, '\n');
    cleaned = cleaned.replace(/\r/g, '\n');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // ============================================
    // Step 9: FINAL FINAL SAFETY — if still starts with "Dear", just strip it
    // ============================================
    cleaned = cleaned.replace(/^\s*Dear\b[\s\S]{0,80}?(?=[A-Z][a-z])/, '').trim();
    
    return cleaned.trim();
};