// src/components/cover-letter/services/coverLetterService.ts
// ✅ UPDATED: IndexedDB image delete on document remove
// ✅ Zero feature break

import {
    CoverLetterDocument,
    CoverLetterData,
    CoverLetterMeta,
    CoverLetterService,
} from '../types/coverLetterTypes';
import {
    deleteCLDocument,
    deriveCLTitle,
    generateCoverLetterId,
    migrateLegacyCoverLetterIfNeeded,
    readCLDocument,
    readCLIndex,
    writeCLDocument,
    writeCLIndex,
    OLD_COVER_KEY,
    LEGACY_COVER_KEY,
} from '../utils/coverLetterStorage';
// ✅ NEW: IndexedDB image helpers
import { deleteImageFromIDB, getPhotoKey } from '../../cv-builder/utils/imageUtils';

export const localStorageCoverLetterService: CoverLetterService = {
    async list(userId) {
        if (!userId) return [];
        migrateLegacyCoverLetterIfNeeded(userId);
        const index = readCLIndex(userId);
        return [...index].sort((a, b) => {
            if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
            return b.lastEdited - a.lastEdited;
        });
    },

    async get(userId, documentId) {
        if (!userId || !documentId) return null;
        migrateLegacyCoverLetterIfNeeded(userId);
        const data = readCLDocument(userId, documentId);
        if (!data) return null;
        const index = readCLIndex(userId);
        const meta = index.find((m) => m.id === documentId);
        if (!meta) return null;
        return { ...meta, data };
    },

    async create(userId, data, title) {
        if (!userId) throw new Error('userId required');
        migrateLegacyCoverLetterIfNeeded(userId);
        const now = Date.now();
        const id = generateCoverLetterId();
        const meta: CoverLetterMeta = {
            id,
            title: title || deriveCLTitle(data),
            jobTitle: data?.jobTitle || '',
            template: data?.selectedTemplate || 'classic',
            lastEdited: now,
            createdAt: now,
            pinned: false,
            kind: 'cover-letter',
        };
        writeCLDocument(userId, id, data);
        const index = readCLIndex(userId);
        writeCLIndex(userId, [...index, meta]);
        return meta;
    },

    async update(userId, documentId, data) {
        if (!userId || !documentId) return;
        migrateLegacyCoverLetterIfNeeded(userId);
        writeCLDocument(userId, documentId, data);
        const index = readCLIndex(userId);
        const updated = index.map((m) =>
            m.id === documentId
                ? {
                      ...m,
                      title: m.title && m.title !== 'Untitled Cover Letter' && m.title !== 'My Cover Letter'
                          ? m.title
                          : deriveCLTitle(data),
                      jobTitle: data?.jobTitle || '',
                      template: data?.selectedTemplate || m.template,
                      lastEdited: Date.now(),
                  }
                : m
        );
        writeCLIndex(userId, updated);
    },

    async remove(userId, documentId) {
        if (!userId || !documentId) return;
        migrateLegacyCoverLetterIfNeeded(userId);

        // 1. Delete doc
        deleteCLDocument(userId, documentId);

        // ✅ 2. Delete the image from IndexedDB too
        try {
            await deleteImageFromIDB(getPhotoKey(documentId));
            console.log('[remove] Deleted image from IndexedDB for cover letter:', documentId);
        } catch (e) {
            console.error('[remove] Failed to delete image from IndexedDB:', e);
        }

        // 3. Update index
        const index = readCLIndex(userId);
        const newIndex = index.filter((m) => m.id !== documentId);
        writeCLIndex(userId, newIndex);

        // ✅ 4. Last doc delete hone pe legacy keys clear karo
        if (newIndex.length === 0) {
            try {
                localStorage.removeItem(OLD_COVER_KEY(userId));
                localStorage.removeItem(LEGACY_COVER_KEY);
                console.log('[remove] Last cover letter deleted — cleared legacy keys');
            } catch (e) {
                console.error('[remove] Failed to clear legacy keys:', e);
            }

            // ✅ 5. Migration flag reset
            try {
                localStorage.setItem(`adin_cl_migrated_${userId}`, 'true');
            } catch (e) {
                console.error('[remove] Failed to reset migration flag:', e);
            }
        }
    },

    async createEmpty(userId) {
        const emptyData: CoverLetterData = {
            userName: '',
            email: '',
            phoneNumber: '',
            selectedCountryCode: '+92',
            address: '',
            linkedin: '',
            education: '',
            experience: '',
            skills: '',
            jobTitle: '',
            company: '',
            jobDescription: '',
            additionalInfo: '',
            profilePhoto: null,
            selectedStyle: 'professional',
            selectedTemplate: 'classic',
            generatedLetter: '',
            originalLetter: '',
            step: 1,
            projects: '',
            isEnhanced: false,
            currentPosition: '',
        };
        return this.create(userId, emptyData, 'Untitled Cover Letter');
    },

    async togglePin(userId, documentId) {
        if (!userId || !documentId) return;
        migrateLegacyCoverLetterIfNeeded(userId);
        const index = readCLIndex(userId);
        const updated = index.map((m) =>
            m.id === documentId ? { ...m, pinned: !m.pinned } : m
        );
        writeCLIndex(userId, updated);
    },

    async rename(userId, documentId, newTitle) {
        if (!userId || !documentId || !newTitle?.trim()) return;
        migrateLegacyCoverLetterIfNeeded(userId);
        const index = readCLIndex(userId);
        const updated = index.map((m) =>
            m.id === documentId ? { ...m, title: newTitle.trim() } : m
        );
        writeCLIndex(userId, updated);
    },
};