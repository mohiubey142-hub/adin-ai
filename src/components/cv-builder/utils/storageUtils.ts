// src/components/cv-builder/utils/storageUtils.ts
// ✅ NEW: Crash-proof save — QuotaExceededError handled, never throws
// ✅ NEW: safeSaveDocument() wrapper with auto-cleanup + retry
// ✅ NEW: Thresholds updated to 3.5 / 4.2 / 4.8 MB

import toast from 'react-hot-toast';

// =====================================================
// Storage size thresholds (MB)
// =====================================================
const THRESHOLD_WARNING = 3.5;
const THRESHOLD_CRITICAL = 4.2;
const THRESHOLD_HARD_LIMIT = 4.8;

// =====================================================
// LEGACY (single CV) — UNTOUCHED for backward compat
// =====================================================

export const getStorageKey = (userId: string) =>
    `adin_cv_builder_data_${userId || 'anonymous_user'}`;

export const loadSavedData = (userId: string) => {
    if (!userId) return null;
    try {
        const saved = localStorage.getItem(getStorageKey(userId));
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error('Failed to load CV data:', e);
    }
    return null;
};

// =====================================================
// ✅ Crash-proof save result type
// =====================================================
export interface SaveResult {
    ok: boolean;
    error?: 'quota_exceeded' | 'unknown';
    sizeMB?: number;
    message?: string;
}

// =====================================================
// ✅ NEW: safeSaveData — for legacy single-CV save
// =====================================================
export const safeSaveData = (userId: string, data: any): SaveResult => {
    if (!userId) return { ok: false, error: 'unknown', message: 'No userId' };
    try {
        const stripped = stripImageFromData(data);
        localStorage.setItem(getStorageKey(userId), JSON.stringify(stripped));
        return { ok: true };
    } catch (e: any) {
        return handleSaveError(e, userId, 'legacy save');
    }
};

// Keep the old function for backward compat, but make it non-throwing
export const saveData = (userId: string, data: any): SaveResult => {
    return safeSaveData(userId, data);
};

export const clearStorage = (userId: string) => {
    if (!userId) return;
    try {
        localStorage.removeItem(getStorageKey(userId));
    } catch (e) {
        console.error('Failed to clear CV data:', e);
    }
};

// =====================================================
// HELPER — Strip heavy image data before localStorage
// =====================================================
const stripImageFromData = (data: any) => {
    if (!data || typeof data !== 'object') return data;
    const copy = { ...data };
    if (copy.profilePhoto && typeof copy.profilePhoto === 'string' && copy.profilePhoto.length > 500) {
        copy.profilePhoto = null;
        copy.hasPhoto = true;
    }
    return copy;
};

// =====================================================
// NEW multi-CV helpers
// =====================================================

export const getIndexKey = (userId: string) =>
    `adin_cv_documents_index_${userId || 'anonymous_user'}`;

export const getDocumentKey = (userId: string, documentId: string) =>
    `adin_cv_document_${userId || 'anonymous_user'}_${documentId}`;

export const getMigrationFlagKey = (userId: string) =>
    `adin_cv_migrated_${userId || 'anonymous_user'}`;

export const loadDocumentData = (userId: string, documentId: string) => {
    if (!userId || !documentId) return null;
    try {
        const raw = localStorage.getItem(getDocumentKey(userId, documentId));
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to load document data:', e);
        return null;
    }
};

// =====================================================
// ✅ NEW: Central error handler for save failures
// =====================================================
const handleSaveError = (e: any, userId: string, context: string): SaveResult => {
    if (e?.name === 'QuotaExceededError' || e?.code === 22) {
        const sizeMB = getStorageUsageMB();
        console.error(`❌ localStorage FULL (${sizeMB} MB) — ${context} failed`);

        // Try one cleanup pass
        try {
            autoCleanupOldDocuments(userId);
        } catch {}

        // Show user-visible toast (non-blocking)
        try {
            toast.error(
                `Storage full! (${sizeMB.toFixed(1)} MB used) — ` +
                `your data is still safe in the cloud. ` +
                `Delete old CVs or clear cache to free space.`,
                { duration: 7000, id: 'storage-full' }
            );
        } catch {}

        return { ok: false, error: 'quota_exceeded', sizeMB };
    }

    console.error(`❌ Save failed (${context}):`, e);
    return { ok: false, error: 'unknown', message: e?.message };
};

// =====================================================
// ✅ Crash-proof saveDocumentData (KEEP OLD SIGNATURE)
// =====================================================
export const saveDocumentData = (
    userId: string,
    documentId: string,
    data: any
): SaveResult => {
    if (!userId || !documentId) {
        return { ok: false, error: 'unknown', message: 'Missing userId or documentId' };
    }

    try {
        const stripped = stripImageFromData(data);
        const serialized = JSON.stringify(stripped);

        if (serialized.length > 2 * 1024 * 1024) {
            console.warn(
                `⚠️ Document ${documentId} is ${(serialized.length / 1024 / 1024).toFixed(2)}MB — very large!`
            );
        }

        localStorage.setItem(getDocumentKey(userId, documentId), serialized);

        // Index update
        const indexRaw = localStorage.getItem(getIndexKey(userId));
        if (indexRaw) {
            const index = JSON.parse(indexRaw);
            if (Array.isArray(index)) {
                const title =
                    data?.personalInfo?.title?.trim()
                        ? `${data.personalInfo.title.trim()} CV`
                        : (data?.personalInfo?.name?.trim()
                            ? `${data.personalInfo.name.trim()}'s CV`
                            : 'Untitled CV');

                const updated = index.map((m: any) =>
                    m.id === documentId
                        ? {
                            ...m,
                            title,
                            jobTitle: data?.personalInfo?.title || '',
                            template: data?.template || m.template,
                            lastEdited: Date.now(),
                        }
                        : m
                );
                localStorage.setItem(getIndexKey(userId), JSON.stringify(updated));
            }
        }

        return { ok: true };
    } catch (e: any) {
        // ✅ CRITICAL: Do NOT throw. Return result instead.
        return handleSaveError(e, userId, `save document ${documentId}`);
    }
};

// =====================================================
// ✅ NEW: safeSaveDocument wrapper with retry after cleanup
// =====================================================
export const safeSaveDocument = (
    userId: string,
    documentId: string,
    data: any
): SaveResult => {
    const first = saveDocumentData(userId, documentId, data);
    if (first.ok) return first;

    // Only retry on quota error
    if (first.error !== 'quota_exceeded') return first;

    // Try harder: cleanup orphans, then auto-delete old, then retry
    try {
        cleanupOrphanDocuments(userId);
        autoCleanupOldDocuments(userId);
    } catch {}

    const second = saveDocumentData(userId, documentId, data);
    if (second.ok) return second;

    return second;  // Still failed — user sees the toast
};

export const deleteDocumentData = (userId: string, documentId: string) => {
    if (!userId || !documentId) return;
    try {
        localStorage.removeItem(getDocumentKey(userId, documentId));

        const indexRaw = localStorage.getItem(getIndexKey(userId));
        if (indexRaw) {
            const index = JSON.parse(indexRaw);
            if (Array.isArray(index)) {
                const filtered = index.filter((m: any) => m.id !== documentId);
                localStorage.setItem(getIndexKey(userId), JSON.stringify(filtered));
            }
        }
    } catch (e) {
        console.error('Failed to delete document:', e);
    }
};

// =====================================================
// Storage Health & Cleanup Utilities
// =====================================================

export const getStorageUsageBytes = (): number => {
    try {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            const value = localStorage.getItem(key);
            if (value) {
                total += key.length + value.length;
            }
        }
        return total * 2;
    } catch {
        return 0;
    }
};

export const getStorageUsageMB = (): number => {
    return Math.round((getStorageUsageBytes() / 1024 / 1024) * 100) / 100;
};

// ✅ UPDATED thresholds
export const isStorageNearlyFull = (): boolean => {
    return getStorageUsageMB() > THRESHOLD_WARNING;   // 3.5 MB
};

export const isStorageCritical = (): boolean => {
    return getStorageUsageMB() > THRESHOLD_CRITICAL;  // 4.2 MB
};

export const isStorageAtHardLimit = (): boolean => {
    return getStorageUsageMB() > THRESHOLD_HARD_LIMIT; // 4.8 MB
};

export const cleanupOrphanDocuments = (userId: string): number => {
    if (!userId) return 0;
    try {
        const indexRaw = localStorage.getItem(getIndexKey(userId));
        const index = indexRaw ? JSON.parse(indexRaw) : [];
        const validIds = new Set(
            Array.isArray(index) ? index.map((m: any) => m.id) : []
        );

        const prefix = `adin_cv_document_${userId || 'anonymous_user'}_`;
        const toDelete: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith(prefix)) continue;
            const docId = key.substring(prefix.length);
            if (!validIds.has(docId)) {
                toDelete.push(key);
            }
        }

        toDelete.forEach((k) => localStorage.removeItem(k));
        if (toDelete.length > 0) {
            console.log(`🧹 Cleaned ${toDelete.length} orphan documents`);
        }
        return toDelete.length;
    } catch (e) {
        console.error('cleanupOrphanDocuments failed', e);
        return 0;
    }
};

export const autoCleanupOldDocuments = (userId: string): number => {
    if (!userId) return 0;
    try {
        const indexRaw = localStorage.getItem(getIndexKey(userId));
        if (!indexRaw) return 0;
        const index = JSON.parse(indexRaw);
        if (!Array.isArray(index)) return 0;

        const candidates = index
            .filter((m: any) => !m.pinned)
            .sort((a: any, b: any) => (a.lastEdited || 0) - (b.lastEdited || 0));

        let deleted = 0;
        const remainingIndex = [...index];

        for (const doc of candidates) {
            if (!isStorageCritical()) break;

            localStorage.removeItem(getDocumentKey(userId, doc.id));
            const idx = remainingIndex.findIndex((m: any) => m.id === doc.id);
            if (idx >= 0) remainingIndex.splice(idx, 1);
            deleted++;

            if (deleted >= 5) break;
        }

        if (deleted > 0) {
            localStorage.setItem(getIndexKey(userId), JSON.stringify(remainingIndex));
            console.log(`🧹 Auto-cleaned ${deleted} old documents`);
        }
        return deleted;
    } catch (e) {
        console.error('autoCleanupOldDocuments failed', e);
        return 0;
    }
};