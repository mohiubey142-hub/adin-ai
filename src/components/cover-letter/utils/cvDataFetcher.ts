// src/components/cover-letter/utils/cvDataFetcher.ts
// =====================================================
// ✅ PHASE 2 — CV DATA FETCHER (UPDATED)
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
//   - Current Job Title       (from latest experience ONLY — not personalInfo.title)
//   - Current Company         (from latest experience)                ← NEW
//   - Skills (comma-separated)
//   - Years of Experience     (calculated from experience dates)      ← NEW
//   - Total Experience Months (backup, for accuracy)                  ← NEW
//
// Does NOT extract:
//   - Full experience history
//   - Education
//   - Projects
//   - Achievements
//   - Full CV data
// =====================================================

import { localStorageDocumentService } from '../../cv-builder/services/documentService';
import { CVDocumentMeta } from '../../cv-builder/types/documentTypes';

/**
 * Result of CV data extraction.
 * Sab fields optional hain — agar CV mein nahi hain to empty string / 0.
 */
export interface CVExtractedData {
    // Personal
    name: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;

    // Job context
    currentTitle: string;      // ✅ UPDATED — From latest experience only
    currentCompany: string;    // ✅ NEW — From latest experience
    yearsOfExperience: number; // ✅ NEW — Calculated from experiences
    totalExperienceMonths: number; // ✅ NEW — Backup, for accuracy

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
    currentCompany: '',
    yearsOfExperience: 0,
    totalExperienceMonths: 0,
    skills: '',
    sourceId: '',
    sourceTitle: '',
};

// =====================================================
// ✅ DATE PARSING HELPERS
// =====================================================

/**
 * Parse a date string into a Date object.
 * Supports formats:
 *   - "Jan 2022", "January 2022", "Jan 22"
 *   - "2022", "01/2022", "2022-01", "2022-01-15"
 *   - "Present", "Current", "Now", "" → today
 *
 * Returns null if unparseable.
 */
const MONTH_MAP: Record<string, number> = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
};

const PRESENT_KEYWORDS = ['present', 'current', 'now', 'till date', 'to date', 'ongoing'];

const parseDate = (raw: string | undefined | null, fallbackToNow = false): Date | null => {
    if (!raw) return fallbackToNow ? new Date() : null;

    const s = String(raw).trim().toLowerCase();
    if (!s) return fallbackToNow ? new Date() : null;

    // "Present" / "Current" / etc → today
    if (PRESENT_KEYWORDS.some(k => s === k || s.includes(k))) {
        return new Date();
    }

    // Format: "Jan 2022" / "January 2022"
    const monthYearMatch = s.match(/^([a-z]+)[\s,.-]+(\d{2,4})$/i);
    if (monthYearMatch) {
        const monthKey = monthYearMatch[1].slice(0, 3).toLowerCase();
        const month = MONTH_MAP[monthKey];
        let year = parseInt(monthYearMatch[2], 10);
        if (year < 100) year += year < 50 ? 2000 : 1900;
        if (month !== undefined && !isNaN(year)) {
            return new Date(year, month, 1);
        }
    }

    // Format: "2022" (year only)
    const yearOnly = s.match(/^(\d{4})$/);
    if (yearOnly) {
        const year = parseInt(yearOnly[1], 10);
        return new Date(year, 0, 1);
    }

    // Format: "01/2022" or "1-2022"
    const numericMonthYear = s.match(/^(\d{1,2})[\/\-.](\d{2,4})$/);
    if (numericMonthYear) {
        const month = parseInt(numericMonthYear[1], 10) - 1;
        let year = parseInt(numericMonthYear[2], 10);
        if (year < 100) year += year < 50 ? 2000 : 1900;
        if (month >= 0 && month <= 11 && !isNaN(year)) {
            return new Date(year, month, 1);
        }
    }

    // Format: "2022-01" or "2022-01-15" (ISO)
    const isoMatch = s.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/);
    if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const month = parseInt(isoMatch[2], 10) - 1;
        const day = isoMatch[3] ? parseInt(isoMatch[3], 10) : 1;
        if (month >= 0 && month <= 11) {
            return new Date(year, month, day);
        }
    }

    // Last resort: try native Date parsing
    const native = new Date(raw);
    if (!isNaN(native.getTime())) return native;

    return fallbackToNow ? new Date() : null;
};

/**
 * Calculate total unique experience in months.
 * Overlaps are merged — same period is counted once.
 * Returns 0 if no valid date ranges.
 */
const calculateExperienceMonths = (experiences: any[]): number => {
    if (!Array.isArray(experiences) || experiences.length === 0) return 0;

    const ranges: Array<{ start: number; end: number }> = [];

    for (const exp of experiences) {
        if (!exp) continue;

        const start = parseDate(exp.startDate, false);
        // endDate fallback: agar "currentlyWorking" true hai ya endDate missing hai → aaj
        const end = parseDate(
            exp.endDate,
            !!(exp.currentlyWorking || !exp.endDate)
        );

        if (!start || !end) continue;
        if (end.getTime() < start.getTime()) continue; // invalid range

        ranges.push({ start: start.getTime(), end: end.getTime() });
    }

    if (ranges.length === 0) return 0;

    // Sort by start date
    ranges.sort((a, b) => a.start - b.start);

    // Merge overlapping ranges
    const merged: Array<{ start: number; end: number }> = [];
    for (const r of ranges) {
        const last = merged[merged.length - 1];
        if (last && r.start <= last.end) {
            // Overlap → merge
            last.end = Math.max(last.end, r.end);
        } else {
            merged.push({ ...r });
        }
    }

    // Sum durations in months
    const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.4375;
    let totalMs = 0;
    for (const r of merged) {
        totalMs += r.end - r.start;
    }

    return Math.max(0, Math.round(totalMs / MS_PER_MONTH));
};

/**
 * Pick the most recent experience from an array.
 * Priority:
 *   1. currentlyWorking === true  →  sabse recent (latest start)
 *   2. No endDate / "Present"     →  sabse recent (latest start)
 *   3. Latest endDate
 */
const pickLatestExperience = (experiences: any[]): any | null => {
    if (!Array.isArray(experiences) || experiences.length === 0) return null;

    const withDates = experiences
        .map(exp => ({
            exp,
            start: parseDate(exp?.startDate, false),
            end: parseDate(exp?.endDate, !!(exp?.currentlyWorking || !exp?.endDate)),
        }))
        .filter(x => x.exp);

    if (withDates.length === 0) return experiences[0] || null;

    // Prefer ongoing jobs
    const ongoing = withDates.filter(x => x.exp?.currentlyWorking);
    if (ongoing.length > 0) {
        ongoing.sort((a, b) => (b.start?.getTime() || 0) - (a.start?.getTime() || 0));
        return ongoing[0].exp;
    }

    // Then prefer jobs with no end date (assumed ongoing)
    const noEnd = withDates.filter(x => !x.exp?.endDate);
    if (noEnd.length > 0) {
        noEnd.sort((a, b) => (b.start?.getTime() || 0) - (a.start?.getTime() || 0));
        return noEnd[0].exp;
    }

    // Otherwise: latest end date
    withDates.sort((a, b) => (b.end?.getTime() || 0) - (a.end?.getTime() || 0));
    return withDates[0].exp;
};

// =====================================================
// ✅ PUBLIC API
// =====================================================

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
 * Returns ALL CVs (no limit).
 */
export const listUserCVs = async (userId: string): Promise<CVDocumentMeta[]> => {
    if (!userId) return [];
    try {
        const all = await localStorageDocumentService.list(userId);
        return Array.isArray(all) ? all : [];
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

        // ✅ Experiences — pick latest for current title/company + calculate total years
        const experiences: any[] = Array.isArray(data?.experiences) ? data.experiences : [];
        const latestExp = pickLatestExperience(experiences);
        const totalExperienceMonths = calculateExperienceMonths(experiences);
        const yearsOfExperience = Math.floor(totalExperienceMonths / 12);

        // ✅ UPDATED: Current title comes ONLY from the latest experience entry
        //    (personalInfo.title is no longer used)
        const currentTitle = (latestExp?.title || '').trim();

        // ✅ Current company — from latest experience
        const currentCompany = (latestExp?.company || '').trim();

        const extracted: CVExtractedData = {
            name: (pi.name || '').trim(),
            email: (pi.email || '').trim(),
            phone: (pi.phone || data?.phoneNumber || '').trim(),
            address: (pi.address || '').trim(),
            linkedin: (pi.linkedin || '').trim(),

            currentTitle,
            currentCompany,
            yearsOfExperience,
            totalExperienceMonths,

            skills: (data?.skills || '').trim(),

            sourceId: documentId,
            sourceTitle: doc.title || 'Untitled CV',
        };

        console.log('[cvDataFetcher] Extracted from CV:', {
            sourceId: documentId,
            hasName: !!extracted.name,
            hasEmail: !!extracted.email,
            hasPhone: !!extracted.phone,
            currentTitle: extracted.currentTitle,
            currentCompany: extracted.currentCompany,
            yearsOfExperience: extracted.yearsOfExperience,
            totalExperienceMonths: extracted.totalExperienceMonths,
            experienceCount: experiences.length,
            skillsCount: extracted.skills
                ? extracted.skills.split(',').filter(s => s.trim()).length
                : 0,
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