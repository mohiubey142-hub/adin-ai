// src/components/cv-builder/utils/storage/storageService.ts
// Hybrid storage: small → localStorage, large → IndexedDB with safe migration.

import {
    idbSet, idbGet, idbDelete, idbHas, idbIsAvailable, idbWarmup,
} from './indexedDB';
import {
    safeLocalStorageGet, safeLocalStorageRemove,
    safeLocalStorageParse, safeLocalStorageSetJSON, safeLocalStorageSet,
} from './localStorage';

// ---------- Keys ----------
export const KEYS = {
    legacySingle: (userId: string) => `adin_cv_builder_data_${userId || 'anonymous_user'}`,
    index: (userId: string) => `adin_cv_documents_index_${userId || 'anonymous_user'}`,
    document: (userId: string, documentId: string) =>
        `adin_cv_document_${userId || 'anonymous_user'}_${documentId}`,
    migratedFlag: (userId: string) => `adin_cv_migrated_${userId || 'anonymous_user'}`,
} as const;

const IDB_NS = {
    legacy: (userId: string) => `legacy:${userId || 'anonymous_user'}`,
    document: (userId: string, documentId: string) =>
        `doc:${userId || 'anonymous_user'}:${documentId}`,
} as const;

// ---------- Helpers ----------
const isLargeEnoughToWorry = (raw: string | null): boolean =>
    !!raw && raw.length > 2000; // ~4KB of UTF-16 — safe threshold

// ---------- LEGACY SINGLE-CV ----------
export const loadLegacyCV = async (userId: string): Promise<unknown | null> => {
    if (!userId) return null;

    if (idbIsAvailable()) {
        try {
            const fromIdb = await idbGet<unknown>('legacy', IDB_NS.legacy(userId));
            if (fromIdb !== undefined && fromIdb !== null) return fromIdb;
        } catch { /* fall through */ }
    }

    const raw = safeLocalStorageGet(KEYS.legacySingle(userId));
    if (!raw) return null;
    const parsed = safeLocalStorageParse<unknown | null>(KEYS.legacySingle(userId), null);
    if (parsed === null) return null;

    if (isLargeEnoughToWorry(raw) && idbIsAvailable()) {
        void migrateLegacyCV(userId, parsed, raw);
    }
    return parsed;
};

export const saveLegacyCV = async (userId: string, data: unknown): Promise<void> => {
    if (!userId) return;
    const payload = JSON.stringify(data);

    if (!isLargeEnoughToWorry(payload) && safeLocalStorageSetJSON(KEYS.legacySingle(userId), data)) {
        return;
    }

    if (idbIsAvailable()) {
        try {
            await idbSet('legacy', IDB_NS.legacy(userId), data);
            const back = await idbGet<unknown>('legacy', IDB_NS.legacy(userId));
            if (back !== undefined) {
                safeLocalStorageRemove(KEYS.legacySingle(userId));
                return;
            }
        } catch (e) {
            if (import.meta.env?.DEV) console.warn('[storage] saveLegacyCV → IDB failed', e);
        }
    }
    safeLocalStorageSetJSON(KEYS.legacySingle(userId), data);
};

const migrateLegacyCV = async (userId: string, data: unknown, rawFromLs: string): Promise<void> => {
    try {
        await idbSet('legacy', IDB_NS.legacy(userId), data);
        const back = await idbGet<unknown>('legacy', IDB_NS.legacy(userId));
        if (back !== undefined) {
            if (JSON.stringify(back) === JSON.stringify(data)) {
                safeLocalStorageRemove(KEYS.legacySingle(userId));
                if (import.meta.env?.DEV) {
                    console.log(`[storage] Migrated legacy CV for ${userId} (${rawFromLs.length} chars).`);
                }
            }
        }
    } catch (e) {
        if (import.meta.env?.DEV) console.warn('[storage] migrateLegacyCV failed — data preserved in localStorage', e);
    }
};

export const clearLegacyCV = async (userId: string): Promise<void> => {
    if (!userId) return;
    safeLocalStorageRemove(KEYS.legacySingle(userId));
    if (idbIsAvailable()) {
        try { await idbDelete('legacy', IDB_NS.legacy(userId)); } catch { /* noop */ }
    }
};

// ---------- DOCUMENTS ----------
export const loadDocument = async (userId: string, documentId: string): Promise<unknown | null> => {
    if (!userId || !documentId) return null;

    if (idbIsAvailable()) {
        try {
            const fromIdb = await idbGet<unknown>('documents', IDB_NS.document(userId, documentId));
            if (fromIdb !== undefined && fromIdb !== null) return fromIdb;
        } catch { /* fall through */ }
    }

    const key = KEYS.document(userId, documentId);
    const raw = safeLocalStorageGet(key);
    if (!raw) return null;
    const parsed = safeLocalStorageParse<unknown | null>(key, null);
    if (parsed === null) return null;

    if (isLargeEnoughToWorry(raw) && idbIsAvailable()) {
        void migrateDocument(userId, documentId, parsed);
    }
    return parsed;
};

export const saveDocument = async (
    userId: string,
    documentId: string,
    data: unknown
): Promise<void> => {
    if (!userId || !documentId) return;
    const payload = JSON.stringify(data);

    if (!isLargeEnoughToWorry(payload) && safeLocalStorageSetJSON(KEYS.document(userId, documentId), data)) {
        return;
    }

    if (idbIsAvailable()) {
        try {
            await idbSet('documents', IDB_NS.document(userId, documentId), data);
            const back = await idbGet<unknown>('documents', IDB_NS.document(userId, documentId));
            if (back !== undefined) {
                safeLocalStorageRemove(KEYS.document(userId, documentId));
                return;
            }
        } catch (e) {
            if (import.meta.env?.DEV) console.warn('[storage] saveDocument → IDB failed', e);
        }
    }

    safeLocalStorageSetJSON(KEYS.document(userId, documentId), data);
};

const migrateDocument = async (
    userId: string,
    documentId: string,
    data: unknown
): Promise<void> => {
    try {
        await idbSet('documents', IDB_NS.document(userId, documentId), data);
        const back = await idbGet<unknown>('documents', IDB_NS.document(userId, documentId));
        if (back !== undefined && JSON.stringify(back) === JSON.stringify(data)) {
            safeLocalStorageRemove(KEYS.document(userId, documentId));
            if (import.meta.env?.DEV) {
                console.log(`[storage] Migrated document ${documentId} for ${userId}.`);
            }
        }
    } catch (e) {
        if (import.meta.env?.DEV) {
            console.warn(`[storage] migrateDocument ${documentId} failed — data preserved in localStorage`, e);
        }
    }
};

export const deleteDocumentStorage = async (userId: string, documentId: string): Promise<void> => {
    if (!userId || !documentId) return;
    safeLocalStorageRemove(KEYS.document(userId, documentId));
    if (idbIsAvailable()) {
        try { await idbDelete('documents', IDB_NS.document(userId, documentId)); } catch { /* noop */ }
    }
};

// ---------- INDEX (metadata, always localStorage) ----------
export const readIndex = <T>(userId: string): T[] => {
    if (!userId) return [];
    const parsed = safeLocalStorageParse<T[]>(KEYS.index(userId), []);
    return Array.isArray(parsed) ? parsed : [];
};

export const writeIndex = <T>(userId: string, index: T[]): boolean => {
    if (!userId) return false;
    return safeLocalStorageSetJSON(KEYS.index(userId), index);
};

// ---------- Migration flag ----------
export const isMigrationFlagSet = (userId: string): boolean =>
    safeLocalStorageGet(KEYS.migratedFlag(userId)) === 'true';

export const setMigrationFlag = (userId: string): void => {
    if (!userId) return;
    safeLocalStorageSet(KEYS.migratedFlag(userId), 'true');
};

// ---------- Startup migration ----------
export const runStartupMigration = async (userId: string): Promise<void> => {
    if (!userId) return;
    if (!idbIsAvailable()) return;
    if (isMigrationFlagSet(userId)) return;

    try {
        const ok = await idbWarmup();
        if (!ok) return;

        // 1) Legacy single-CV
        const legacyRaw = safeLocalStorageGet(KEYS.legacySingle(userId));
        if (legacyRaw && isLargeEnoughToWorry(legacyRaw)) {
            const parsed = safeLocalStorageParse<unknown | null>(KEYS.legacySingle(userId), null);
            if (parsed !== null) {
                await idbSet('legacy', IDB_NS.legacy(userId), parsed);
                const back = await idbGet<unknown>('legacy', IDB_NS.legacy(userId));
                if (back !== undefined && JSON.stringify(back) === JSON.stringify(parsed)) {
                    safeLocalStorageRemove(KEYS.legacySingle(userId));
                }
            }
        }

        // 2) Multi-CV documents
        const index = readIndex<{ id?: string }>(userId);
        for (const meta of index) {
            const docId = meta?.id;
            if (!docId) continue;
            const docKey = KEYS.document(userId, docId);
            const raw = safeLocalStorageGet(docKey);
            if (!raw || !isLargeEnoughToWorry(raw)) continue;

            const parsed = safeLocalStorageParse<unknown | null>(docKey, null);
            if (parsed === null) continue;

            try {
                await idbSet('documents', IDB_NS.document(userId, docId), parsed);
                const back = await idbGet<unknown>('documents', IDB_NS.document(userId, docId));
                if (back !== undefined && JSON.stringify(back) === JSON.stringify(parsed)) {
                    safeLocalStorageRemove(docKey);
                }
            } catch (e) {
                if (import.meta.env?.DEV) {
                    console.warn(`[storage] Startup migration failed for doc ${docId} — preserved in localStorage`, e);
                }
            }
        }

        setMigrationFlag(userId);
        if (import.meta.env?.DEV) console.log(`[storage] Startup migration complete for ${userId}.`);
    } catch (e) {
        if (import.meta.env?.DEV) console.warn('[storage] runStartupMigration failed', e);
    }
};

// ---------- Re-export safe primitives ----------
export {
    safeLocalStorageGet,
    safeLocalStorageSet,
    safeLocalStorageRemove,
    safeLocalStorageParse,
    safeLocalStorageSetJSON,
};

export const hasIndexedDB = idbIsAvailable;
export const hasInIdb = idbHas;