// src/components/cover-letter/utils/cvDataFetcher.ts
// =====================================================
// ✅ PHASE 2 — CV DATA FETCHER
// =====================================================
// Purpose: Extract ONLY required data from user's saved CV
//          for auto-filling the cover letter form.
//
// Extracts:
//   - Full Name
//   - Email
//   - Phone
//   - Location (address)
//   - LinkedIn
//   - Current Job Title
//   - Skills (comma-separated)
//
// Does NOT extract:
//   - Experience history
//   - Education
//   - Projects
//   - Achievements
//   - Full CV data
// =====================================================

import { localStorageDocumentService } from '../../cv-builder/services/documentService';
import { CVDocumentMeta } from '../../cv-builder/types/documentTypes';

/**
 * Result of CV data extraction.
 * Sab fields optional hain — agar CV mein nahi hain to empty string.
 */
export interface CVExtractedData {
    // Personal
    name: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;

    // Job context
    currentTitle: string;      // From personalInfo.title

    // Skills
    skills: string;            // Comma-separated

    // Metadata
    sourceId: string;          // CV document ID
    sourceTitle: string;       // CV title (for display)
}

/**
 * Empty result — when no CV available or user skips.
 */
export const EMPTY_CV_DATA: CVExtractedData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    currentTitle: '',
    skills: '',
    sourceId: '',
    sourceTitle: '',
};

/**
 * Check if user has any saved CVs.
 */
export const hasAnyCV = async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
        const list = await localStorageDocumentService.list(userId);
        return list.length > 0;
    } catch (e) {
        console.error('[cvDataFetcher] Failed to check CVs:', e);
        return false;
    }
};

/**
 * Get list of user's CVs (meta only — for dropdown).
 */
export const listUserCVs = async (userId: string): Promise<CVDocumentMeta[]> => {
    if (!userId) return [];
    try {
        return await localStorageDocumentService.list(userId);
    } catch (e) {
        console.error('[cvDataFetcher] Failed to list CVs:', e);
        return [];
    }
};

/**
 * Extract required fields from a specific CV.
 */
export const extractDataFromCV = async (
    userId: string,
    documentId: string
): Promise<CVExtractedData | null> => {
    if (!userId || !documentId) return null;

    try {
        const doc = await localStorageDocumentService.get(userId, documentId);
        if (!doc?.data) {
            console.warn('[cvDataFetcher] CV not found:', documentId);
            return null;
        }

        const data: any = doc.data;
        const pi: any = data?.personalInfo || {};

        // ✅ Extract only required fields
        const extracted: CVExtractedData = {
            name: (pi.name || '').trim(),
            email: (pi.email || '').trim(),
            phone: (pi.phone || data?.phoneNumber || '').trim(),
            address: (pi.address || '').trim(),
            linkedin: (pi.linkedin || '').trim(),
            currentTitle: (pi.title || '').trim(),
            skills: (data?.skills || '').trim(),
            sourceId: documentId,
            sourceTitle: doc.title || 'Untitled CV',
        };

        console.log('[cvDataFetcher] Extracted from CV:', {
            sourceId: documentId,
            hasName: !!extracted.name,
            hasEmail: !!extracted.email,
            hasPhone: !!extracted.phone,
            hasTitle: !!extracted.currentTitle,
            skillsCount: extracted.skills ? extracted.skills.split(',').filter(s => s.trim()).length : 0,
        });

        return extracted;
    } catch (e) {
        console.error('[cvDataFetcher] Failed to extract CV data:', e);
        return null;
    }
};

/**
 * Auto-fetch the MOST RECENT CV's data.
 * Useful when user has only 1 CV, or as default selection.
 */
export const fetchMostRecentCVData = async (
    userId: string
): Promise<CVExtractedData | null> => {
    if (!userId) return null;

    try {
        const list = await localStorageDocumentService.list(userId);
        if (list.length === 0) {
            console.log('[cvDataFetcher] No CVs available');
            return null;
        }

        // list is already sorted by lastEdited (most recent first) in service
        const mostRecent = list[0];
        return await extractDataFromCV(userId, mostRecent.id);
    } catch (e) {
        console.error('[cvDataFetcher] Failed to fetch most recent CV:', e);
        return null;
    }
};

/**
 * Get count of user's CVs.
 */
export const getCVCount = async (userId: string): Promise<number> => {
    if (!userId) return 0;
    try {
        const list = await localStorageDocumentService.list(userId);
        return list.length;
    } catch (e) {
        console.error('[cvDataFetcher] Failed to count CVs:', e);
        return 0;
    }
};