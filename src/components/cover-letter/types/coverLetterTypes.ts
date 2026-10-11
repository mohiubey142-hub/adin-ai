// src/components/cover-letter/types/coverLetterTypes.ts
// =====================================================
// ✅ PHASE 1 UPDATE
// - Added 6 new OPTIONAL fields for CV auto-fill + simplified form
// - All existing fields PRESERVED (backward compatibility)
// - Zero breaking changes
// ✅ PHASE 2 UPDATE
// - selectedTemplate type extended to support 6 templates
// =====================================================

/**
 * Valid cover letter template IDs (6 templates)
 */
export type CoverLetterTemplateId =
    | 'classic'
    | 'modern'
    | 'minimal'
    | 'professional'
    | 'executive'
    | 'creative';

/**
 * Cover Letter document meta (index mein store hoti hai)
 */
export interface CoverLetterMeta {
    id: string;
    title: string;              // "Software Engineer Cover Letter"
    jobTitle?: string;          // jobTitle field from user data
    template: CoverLetterTemplateId;
    lastEdited: number;
    createdAt: number;
    pinned?: boolean;
    kind: 'cover-letter';       // ✅ Discriminator
}

/**
 * Full cover letter document
 */
export interface CoverLetterDocument extends CoverLetterMeta {
    data: CoverLetterData;
}

/**
 * Data shape — same jo CoverLetter.tsx currently store karta hai
 * 
 * ✅ PHASE 1 CHANGES:
 * - 6 new OPTIONAL fields added (backward compatible)
 * - All existing fields preserved
 * - Old documents load karte waqt naye fields undefined rahenge (safe)
 * 
 * ✅ PHASE 2 CHANGES:
 * - selectedTemplate now supports 6 template IDs
 */
export interface CoverLetterData {
    // ============================================
    // EXISTING FIELDS (PRESERVED — backward compat)
    // ============================================
    userName: string;
    email: string;
    phoneNumber: string;
    selectedCountryCode: string;
    address: string;
    linkedin: string;
    education: string;              // ✅ Preserved — optional for freshers
    experience: string;             // ⚠️ Old free-text (deprecated but preserved)
    skills: string;                 // ✅ Comma-separated string (same as SkillsSection)
    jobTitle: string;               // Target job title (applying for)
    company: string;                // Target company
    jobDescription: string;         // Target job description
    additionalInfo: string;         // ⚠️ Old achievements (deprecated but preserved)
    profilePhoto: string | null;
    hasPhoto?: boolean;             // ✅ From hybrid image storage
    selectedStyle: string;
    selectedTemplate: CoverLetterTemplateId;
    generatedLetter: string;
    originalLetter: string;
    step: number;
    projects: string;               // ⚠️ Old (deprecated but preserved)
    isEnhanced: boolean;
    currentPosition: string;        // ⚠️ Old field (kept for backward compat)

    // ============================================
    // ✅ PHASE 1 — NEW OPTIONAL FIELDS
    // ============================================
    /** Hiring manager's name — if user knows it */
    hiringManagerName?: string;

    /** User's current / most recent job title (from CV or manual) */
    currentTitle?: string;

    /** User's current / most recent company (from CV or manual) */
    currentCompany?: string;

    /** Years of professional experience (number, optional) */
    yearsOfExperience?: number;

    /** Flag: was CV data used to auto-fill this cover letter? */
    cvDataLoaded?: boolean;

    /** ID of the CV document used as source (for multi-CV users) */
    cvSourceId?: string;

    // ============================================
    // METADATA
    // ============================================
    lastUpdated?: number;
}

export interface CoverLetterService {
    list(userId: string): Promise<CoverLetterMeta[]>;
    get(userId: string, documentId: string): Promise<CoverLetterDocument | null>;
    create(userId: string, data: CoverLetterData, title?: string): Promise<CoverLetterMeta>;
    update(userId: string, documentId: string, data: CoverLetterData): Promise<void>;
    remove(userId: string, documentId: string): Promise<void>;
    createEmpty(userId: string): Promise<CoverLetterMeta>;
    togglePin(userId: string, documentId: string): Promise<void>;
    rename(userId: string, documentId: string, newTitle: string): Promise<void>;
}