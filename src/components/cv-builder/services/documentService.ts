// src/components/cv-builder/services/documentService.ts

import {
    CVDocument,
    CVDocumentData,
    CVDocumentMeta,
    DocumentService,
} from '../types/documentTypes';
import {
    deleteDocument,
    deriveTitle,
    generateDocumentId,
    migrateLegacyIfNeeded,
    readDocument,
    readIndex,
    writeDocument,
    writeIndex,
} from '../utils/multiCVStorage';
// ✅ Legacy key helpers
import { getStorageKey, getIndexKey } from '../utils/storageUtils';
// ✅ NEW: IndexedDB image helpers
import { deleteImageFromIDB, getPhotoKey } from '../utils/imageUtils';

export const localStorageDocumentService: DocumentService = {
    // ============================================
    // LIST — saare documents (index se)
    // ============================================
    async list(userId) {
        if (!userId) return [];
        migrateLegacyIfNeeded(userId);
        const index = readIndex(userId);
        return [...index].sort((a, b) => {
            if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
            return b.lastEdited - a.lastEdited;
        });
    },

    // ============================================
    // GET — ek document ka meta + data
    // ============================================
    async get(userId, documentId) {
        if (!userId || !documentId) return null;
        migrateLegacyIfNeeded(userId);
        const data = readDocument(userId, documentId);
        if (!data) return null;
        const index = readIndex(userId);
        const meta = index.find((m) => m.id === documentId);
        if (!meta) return null;
        return { ...meta, data };
    },

    // ============================================
    // CREATE — naya document
    // ============================================
    async create(userId, data, title) {
        if (!userId) throw new Error('userId required');
        migrateLegacyIfNeeded(userId);
        const now = Date.now();
        const id = generateDocumentId();
        const meta: CVDocumentMeta = {
            id,
            title: title || deriveTitle(data),
            jobTitle: data?.personalInfo?.title || '',
            template: data?.template || 'modern',
            lastEdited: now,
            createdAt: now,
            pinned: false,
        };
        writeDocument(userId, id, data);
        const index = readIndex(userId);
        writeIndex(userId, [...index, meta]);
        return meta;
    },

    // ============================================
    // UPDATE — existing document
    // ============================================
    async update(userId, documentId, data) {
        if (!userId || !documentId) return;
        migrateLegacyIfNeeded(userId);
        writeDocument(userId, documentId, data);
        const index = readIndex(userId);
        const updated = index.map((m) =>
            m.id === documentId
                ? {
                      ...m,
                      title: deriveTitle(data),
                      jobTitle: data?.personalInfo?.title || '',
                      template: data?.template || m.template,
                      lastEdited: Date.now(),
                  }
                : m
        );
        writeIndex(userId, updated);
    },

    // ============================================
    // REMOVE — document + image (IndexedDB) + index
    // ============================================
    async remove(userId, documentId) {
        if (!userId || !documentId) return;
        migrateLegacyIfNeeded(userId);

        // 1. Delete the document data from localStorage
        deleteDocument(userId, documentId);

        // ✅ 2. Delete the image from IndexedDB too
        try {
            await deleteImageFromIDB(getPhotoKey(documentId));
            console.log('[remove] Deleted image from IndexedDB for doc:', documentId);
        } catch (e) {
            console.error('[remove] Failed to delete image from IndexedDB:', e);
        }

        // 3. Update index
        const index = readIndex(userId);
        const newIndex = index.filter((m) => m.id !== documentId);
        writeIndex(userId, newIndex);

        // 4. If last doc deleted, clear legacy + reset migration flag
        if (newIndex.length === 0) {
            try {
                localStorage.removeItem(getStorageKey(userId));
                console.log('[remove] Last doc deleted — cleared legacy key');
            } catch (e) {
                console.error('[remove] Failed to clear legacy key:', e);
            }

            try {
                localStorage.setItem(`adin_cv_migrated_${userId}`, 'true');
            } catch (e) {
                console.error('[remove] Failed to reset migration flag:', e);
            }
        }
    },

    // ============================================
    // CREATE EMPTY — fresh CV with defaults
    // ============================================
    async createEmpty(userId) {
        const emptyData: CVDocumentData = {
            personalInfo: {
                name: '',
                title: '',
                email: '',
                phone: '',
                address: '',
                linkedin: '',
                github: '',
                portfolio: '',
            },
            professionalSummary: '',
            experiences: [],
            educations: [],
            skills: '',
            selectedCountryCode: 'PK',
            phoneNumber: '',
            step: 1,
            template: 'modern',
            projects: [],
            certifications: [],
            languages: [],
            achievements: [],
            profilePhoto: null,
            hasReachedPreview: false,
            selectedProvider: 'openrouter',
        };
        return this.create(userId, emptyData, 'Untitled Resume');
    },

    // ============================================
    // TOGGLE PIN
    // ============================================
    async togglePin(userId, documentId) {
        console.log('[togglePin] called:', { userId, documentId });
        if (!userId || !documentId) {
            console.warn('[togglePin] missing userId or documentId');
            return;
        }
        migrateLegacyIfNeeded(userId);
        const index = readIndex(userId);
        let found = false;
        const updated = index.map((m) => {
            if (m.id === documentId) {
                found = true;
                const newPinned = !m.pinned;
                return { ...m, pinned: newPinned };
            }
            return m;
        });
        if (!found) {
            console.warn('[togglePin] document not found in index:', documentId);
            return;
        }
        writeIndex(userId, updated);
    },

    // ============================================
    // RENAME
    // ============================================
    async rename(userId, documentId, newTitle) {
        console.log('[rename] called:', { userId, documentId, newTitle });
        if (!userId || !documentId || !newTitle?.trim()) {
            console.warn('[rename] missing params');
            return;
        }
        migrateLegacyIfNeeded(userId);
        const index = readIndex(userId);
        let found = false;
        const updated = index.map((m) => {
            if (m.id === documentId) {
                found = true;
                return { ...m, title: newTitle.trim() };
            }
            return m;
        });
        if (!found) {
            console.warn('[rename] document not found in index:', documentId);
            return;
        }
        writeIndex(userId, updated);
    },
};