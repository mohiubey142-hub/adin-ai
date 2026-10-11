// src/components/cv-builder/utils/multiCVStorage.ts

import { CVDocumentMeta, CVDocumentData } from '../types/documentTypes';
import { TemplateType } from '../types/cvTypes';

// ---------- Keys ----------
export const OLD_SINGLE_KEY = (userId: string) =>
    `adin_cv_builder_data_${userId || 'anonymous_user'}`;

export const INDEX_KEY = (userId: string) =>
    `adin_cv_documents_index_${userId || 'anonymous_user'}`;

export const DOC_KEY = (userId: string, documentId: string) =>
    `adin_cv_document_${userId || 'anonymous_user'}_${documentId}`;

export const MIGRATION_FLAG = (userId: string) =>
    `adin_cv_migrated_${userId || 'anonymous_user'}`;

// ---------- ID generator ----------
export const generateDocumentId = (): string => {
    return `cv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};

// ---------- Index ----------
export const readIndex = (userId: string): CVDocumentMeta[] => {
    if (!userId) return [];
    try {
        const raw = localStorage.getItem(INDEX_KEY(userId));
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('readIndex failed', e);
        return [];
    }
};

export const writeIndex = (userId: string, index: CVDocumentMeta[]): void => {
    if (!userId) return;
    try {
        localStorage.setItem(INDEX_KEY(userId), JSON.stringify(index));
        console.log('[writeIndex]', userId, '→', index.length, 'docs');
    } catch (e) {
        console.error('writeIndex failed', e);
    }
};

// ---------- Document data ----------
export const readDocument = (userId: string, documentId: string): CVDocumentData | null => {
    if (!userId || !documentId) return null;
    try {
        const raw = localStorage.getItem(DOC_KEY(userId, documentId));
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error('readDocument failed', e);
        return null;
    }
};

export const writeDocument = (userId: string, documentId: string, data: CVDocumentData): void => {
    if (!userId || !documentId) return;
    try {
        localStorage.setItem(DOC_KEY(userId, documentId), JSON.stringify(data));
    } catch (e) {
        console.error('writeDocument failed', e);
    }
};

export const deleteDocument = (userId: string, documentId: string): void => {
    if (!userId || !documentId) return;
    try {
        localStorage.removeItem(DOC_KEY(userId, documentId));
    } catch (e) {
        console.error('deleteDocument failed', e);
    }
};

// ---------- Migration ----------
export const migrateLegacyIfNeeded = (userId: string): void => {
    if (!userId) return;
    try {
        const alreadyMigrated = localStorage.getItem(MIGRATION_FLAG(userId));
        if (alreadyMigrated === 'true') return;

        const legacyRaw = localStorage.getItem(OLD_SINGLE_KEY(userId));
        if (!legacyRaw) {
            localStorage.setItem(MIGRATION_FLAG(userId), 'true');
            return;
        }

        const legacyData = JSON.parse(legacyRaw) as CVDocumentData & {
            lastUpdated?: number;
            template?: TemplateType;
        };

        const now = Date.now();
        const docId = generateDocumentId();

        const title =
            legacyData?.personalInfo?.title?.trim()
                ? `${legacyData.personalInfo.title.trim()} Resume`
                : 'My Resume';

        const meta: CVDocumentMeta = {
            id: docId,
            title,
            jobTitle: legacyData?.personalInfo?.title || '',
            template: (legacyData?.template as TemplateType) || 'modern',
            lastEdited: legacyData?.lastUpdated || now,
            createdAt: now,
            pinned: false,
        };

        writeDocument(userId, docId, legacyData);
        writeIndex(userId, [meta]);

        localStorage.setItem(MIGRATION_FLAG(userId), 'true');
        console.log('[migration] Legacy CV migrated to document', docId);
    } catch (e) {
        console.error('migrateLegacyIfNeeded failed', e);
    }
};

// ---------- Title derive helper ----------
export const deriveTitle = (data: CVDocumentData): string => {
    const t = data?.personalInfo?.title?.trim();
    if (t) return `${t} Resume`;
    const n = data?.personalInfo?.name?.trim();
    if (n) return `${n}'s Resume`;
    return 'Untitled Resume';
};