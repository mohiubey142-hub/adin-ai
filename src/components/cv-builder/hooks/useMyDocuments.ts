// src/components/cv-builder/hooks/useMyDocuments.ts
// ✅ NEW: Google Sheet sync on remove/togglePin/rename (fire-and-forget)
// ✅ NEW: archiveDocument — remove from device, keep in cloud

import { useCallback, useEffect, useState } from 'react';
import { CVDocumentMeta } from '../types/documentTypes';
import { localStorageDocumentService } from '../services/documentService';
import { syncService } from '../../../services/sync/syncService';

export const useMyDocuments = (userId: string) => {
    const [documents, setDocuments] = useState<CVDocumentMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = useCallback(async () => {
        if (!userId) {
            setDocuments([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const list = await localStorageDocumentService.list(userId);
            console.log('[useMyDocuments] loaded', list.length, 'documents');
            setDocuments(list);
        } catch (e: any) {
            console.error('[useMyDocuments] error:', e);
            setError(e?.message || 'Failed to load documents');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        refresh();
    }, [refresh, refreshKey]);

    const findDoc = useCallback(
        (documentId: string) => documents.find(d => d.id === documentId),
        [documents]
    );

    const removeDocument = useCallback(
        async (documentId: string) => {
            await localStorageDocumentService.remove(userId, documentId);
            if (userId) {
                syncService.deleteCV(userId, documentId).catch(err => {
                    console.warn('[useMyDocuments] Sheet delete failed (queued):', err);
                });
            }
            setRefreshKey((k) => k + 1);
        },
        [userId]
    );

    // ✅ NEW: Archive — remove from device only, keep in cloud
    const archiveDocument = useCallback(
        async (documentId: string) => {
            await localStorageDocumentService.remove(userId, documentId);
            if (userId) {
                syncService.updateCVMeta(userId, documentId, {
                    archived: true,
                }).catch(err => {
                    console.warn('[useMyDocuments] Sheet archive sync failed (queued):', err);
                });
            }
            setRefreshKey((k) => k + 1);
        },
        [userId]
    );

    const createNew = useCallback(async () => {
        const meta = await localStorageDocumentService.createEmpty(userId);
        setRefreshKey((k) => k + 1);
        return meta;
    }, [userId]);

    const togglePin = useCallback(
        async (documentId: string) => {
            console.log('[useMyDocuments] togglePin called for', documentId);
            await localStorageDocumentService.togglePin(userId, documentId);
            if (userId) {
                const doc = findDoc(documentId);
                if (doc) {
                    syncService.updateCVMeta(userId, documentId, {
                        pinned: !doc.pinned,
                    }).catch(err => {
                        console.warn('[useMyDocuments] Sheet pin sync failed (queued):', err);
                    });
                }
            }
            setRefreshKey((k) => k + 1);
        },
        [userId, findDoc]
    );

    const renameDocument = useCallback(
        async (documentId: string, newTitle: string) => {
            console.log('[useMyDocuments] renameDocument called:', documentId, newTitle);
            await localStorageDocumentService.rename(userId, documentId, newTitle);
            if (userId) {
                syncService.updateCVMeta(userId, documentId, {
                    title: newTitle,
                }).catch(err => {
                    console.warn('[useMyDocuments] Sheet rename sync failed (queued):', err);
                });
            }
            setRefreshKey((k) => k + 1);
        },
        [userId]
    );

    return {
        documents,
        loading,
        error,
        refresh,
        removeDocument,
        archiveDocument,   // ✅ NEW
        createNew,
        togglePin,
        renameDocument,
    };
};