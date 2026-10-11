// src/components/cover-letter/hooks/useCoverLetters.ts
// ✅ NEW: Google Sheet sync on remove/togglePin/rename (fire-and-forget)
// ✅ NEW: archiveDocument — remove from device, keep in cloud

import { useCallback, useEffect, useState } from 'react';
import { CoverLetterMeta } from '../types/coverLetterTypes';
import { localStorageCoverLetterService } from '../services/coverLetterService';
import { syncService } from '../../../services/sync/syncService';

export const useCoverLetters = (userId: string) => {
    const [documents, setDocuments] = useState<CoverLetterMeta[]>([]);
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
            const list = await localStorageCoverLetterService.list(userId);
            setDocuments(list);
        } catch (e: any) {
            console.error(e);
            setError(e?.message || 'Failed to load cover letters');
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
            await localStorageCoverLetterService.remove(userId, documentId);
            if (userId) {
                syncService.deleteCoverLetter(userId, documentId).catch(err => {
                    console.warn('[useCoverLetters] Sheet delete failed (queued):', err);
                });
            }
            setRefreshKey((k) => k + 1);
        },
        [userId]
    );

    // ✅ NEW: Archive — remove from device only, keep in cloud
    const archiveDocument = useCallback(
        async (documentId: string) => {
            await localStorageCoverLetterService.remove(userId, documentId);
            if (userId) {
                syncService.updateCoverLetterMeta(userId, documentId, {
                    archived: true,
                }).catch(err => {
                    console.warn('[useCoverLetters] Sheet archive sync failed (queued):', err);
                });
            }
            setRefreshKey((k) => k + 1);
        },
        [userId]
    );

    const createNew = useCallback(async () => {
        const meta = await localStorageCoverLetterService.createEmpty(userId);
        setRefreshKey((k) => k + 1);
        return meta;
    }, [userId]);

    const togglePin = useCallback(
        async (documentId: string) => {
            await localStorageCoverLetterService.togglePin(userId, documentId);
            if (userId) {
                const doc = findDoc(documentId);
                if (doc) {
                    syncService.updateCoverLetterMeta(userId, documentId, {
                        pinned: !doc.pinned,
                    }).catch(err => {
                        console.warn('[useCoverLetters] Sheet pin sync failed (queued):', err);
                    });
                }
            }
            setRefreshKey((k) => k + 1);
        },
        [userId, findDoc]
    );

    const renameDocument = useCallback(
        async (documentId: string, newTitle: string) => {
            await localStorageCoverLetterService.rename(userId, documentId, newTitle);
            if (userId) {
                syncService.updateCoverLetterMeta(userId, documentId, {
                    title: newTitle,
                }).catch(err => {
                    console.warn('[useCoverLetters] Sheet rename sync failed (queued):', err);
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