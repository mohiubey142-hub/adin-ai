// src/components/cover-letter/utils/coverLetterStorage.ts

import { CoverLetterMeta, CoverLetterData } from '../types/coverLetterTypes';

// ---------- Keys ----------
export const OLD_COVER_KEY = (userId: string) =>
    `cover_letter_data_${userId || 'anonymous_user'}`;

/** Purana single key (bina userId ke) — backward compat */
export const LEGACY_COVER_KEY = 'cover_letter_data';

export const CL_INDEX_KEY = (userId: string) =>
    `adin_cover_letter_documents_index_${userId || 'anonymous_user'}`;

export const CL_DOC_KEY = (userId: string, documentId: string) =>
    `adin_cover_letter_document_${userId || 'anonymous_user'}_${documentId}`;

export const CL_MIGRATION_FLAG = (userId: string) =>
    `adin_cl_migrated_${userId || 'anonymous_user'}`;

// ---------- ID generator ----------
export const generateCoverLetterId = (): string => {
    return `cl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};

// ---------- Index ----------
export const readCLIndex = (userId: string): CoverLetterMeta[] => {
    if (!userId) return [];
    try {
        const raw = localStorage.getItem(CL_INDEX_KEY(userId));
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('readCLIndex failed', e);
        return [];
    }
};

export const writeCLIndex = (userId: string, index: CoverLetterMeta[]): void => {
    if (!userId) return;
    try {
        localStorage.setItem(CL_INDEX_KEY(userId), JSON.stringify(index));
    } catch (e) {
        console.error('writeCLIndex failed', e);
    }
};

// ---------- Document data ----------
export const readCLDocument = (userId: string, documentId: string): CoverLetterData | null => {
    if (!userId || !documentId) return null;
    try {
        const raw = localStorage.getItem(CL_DOC_KEY(userId, documentId));
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error('readCLDocument failed', e);
        return null;
    }
};

export const writeCLDocument = (userId: string, documentId: string, data: CoverLetterData): void => {
    if (!userId || !documentId) return;
    try {
        localStorage.setItem(CL_DOC_KEY(userId, documentId), JSON.stringify(data));
    } catch (e) {
        console.error('writeCLDocument failed', e);
    }
};

export const deleteCLDocument = (userId: string, documentId: string): void => {
    if (!userId || !documentId) return;
    try {
        localStorage.removeItem(CL_DOC_KEY(userId, documentId));
    } catch (e) {
        console.error('deleteCLDocument failed', e);
    }
};

// ---------- Migration ----------
export const migrateLegacyCoverLetterIfNeeded = (userId: string): void => {
    if (!userId) return;
    try {
        const alreadyMigrated = localStorage.getItem(CL_MIGRATION_FLAG(userId));
        if (alreadyMigrated === 'true') return;

        // Try old key with userId, then without
        let legacyRaw = localStorage.getItem(OLD_COVER_KEY(userId));
        if (!legacyRaw) {
            legacyRaw = localStorage.getItem(LEGACY_COVER_KEY);
        }

        if (!legacyRaw) {
            localStorage.setItem(CL_MIGRATION_FLAG(userId), 'true');
            return;
        }

        const legacyData = JSON.parse(legacyRaw) as CoverLetterData;

        // Only migrate if user had actual content
        const hasContent =
            legacyData?.userName?.trim() ||
            legacyData?.generatedLetter?.trim() ||
            legacyData?.jobTitle?.trim();

        if (!hasContent) {
            localStorage.setItem(CL_MIGRATION_FLAG(userId), 'true');
            return;
        }

        const now = Date.now();
        const docId = generateCoverLetterId();

        const title = legacyData?.jobTitle?.trim()
            ? `${legacyData.jobTitle.trim()} Cover Letter`
            : 'My Cover Letter';

        const meta: CoverLetterMeta = {
            id: docId,
            title,
            jobTitle: legacyData?.jobTitle || '',
            template: legacyData?.selectedTemplate || 'classic',
            lastEdited: legacyData?.lastUpdated || now,
            createdAt: now,
            pinned: false,
            kind: 'cover-letter',
        };

        writeCLDocument(userId, docId, legacyData);
        writeCLIndex(userId, [meta]);

        localStorage.setItem(CL_MIGRATION_FLAG(userId), 'true');
        console.log('[cover-letter migration] Legacy migrated to document', docId);
    } catch (e) {
        console.error('migrateLegacyCoverLetterIfNeeded failed', e);
    }
};

export const deriveCLTitle = (data: CoverLetterData): string => {
    const t = data?.jobTitle?.trim();
    if (t) return `${t} Cover Letter`;
    const n = data?.userName?.trim();
    if (n) return `${n}'s Cover Letter`;
    return 'Untitled Cover Letter';
};