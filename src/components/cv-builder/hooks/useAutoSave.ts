// src/components/cv-builder/hooks/useAutoSave.ts
// =====================================================
// ✅ Image (profilePhoto) skip karta hai — IndexedDB mein save hoti hai
// ✅ LocalStorage mein sirf text data jata hai
// ✅ FIXED: hasPhoto flag never downgraded from true to false
// ✅ NEW: QuotaExceededError detection — dispatches global event
// ✅ KICKRESUME STYLE: "Saving" indicator turant dikhe (throttled 300ms)
// ✅ KICKRESUME STYLE: setSaveStatus('saving') outer — user ko feedback
// ✅ OPTIMIZED: Throttle 300ms — re-render storm nahi
// ✅ OPTIMIZED: Default delay 1000ms
// =====================================================

import { useEffect, useRef, useState } from 'react';
import { saveData, saveDocumentData } from '../utils/storageUtils';

// =====================================================
// ✅ GLOBAL EVENT: Storage quota exceeded
// =====================================================
export const STORAGE_QUOTA_EXCEEDED_EVENT = 'adin:storage-quota-exceeded';

export const dispatchStorageQuotaExceeded = (): void => {
  try {
    window.dispatchEvent(new CustomEvent(STORAGE_QUOTA_EXCEEDED_EVENT));
  } catch (e) {
    console.warn('[useAutoSave] Failed to dispatch quota event:', e);
  }
};

// =====================================================
// ✅ HELPER: Preserve hasPhoto flag — never downgrade true → false
// =====================================================
const preserveHasPhotoFlag = (
    userId: string,
    documentId: string | null | undefined,
    incoming: boolean
): boolean => {
    if (incoming === true) return true;
    if (!documentId || !userId) return incoming;

    try {
        const key = `adin_cv_document_${userId}_${documentId}`;
        const raw = localStorage.getItem(key);
        if (!raw) return incoming;

        const existing = JSON.parse(raw);
        if (existing?.hasPhoto === true) {
            return true;
        }
        return incoming;
    } catch (e) {
        return incoming;
    }
};

// =====================================================
// ✅ HELPER: Detect QuotaExceededError
// =====================================================
const isQuotaError = (e: any): boolean => {
    if (!e) return false;
    return (
        e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        e.code === 22 ||
        e.code === 1014 ||
        (typeof e.message === 'string' && e.message.toLowerCase().includes('quota'))
    );
};

// =====================================================
// ✅ HELPER: Safe save with quota detection
// =====================================================
const safeSave = (
    saveFn: () => void,
    label: string
): { ok: boolean; quotaExceeded: boolean } => {
    try {
        saveFn();
        return { ok: true, quotaExceeded: false };
    } catch (e: any) {
        if (isQuotaError(e)) {
            console.error(`[useAutoSave] QuotaExceededError during ${label}`);
            return { ok: false, quotaExceeded: true };
        }
        console.error(`[useAutoSave] Save failed during ${label}:`, e);
        return { ok: false, quotaExceeded: false };
    }
};

// =====================================================
// ✅ THROTTLE HELPER — "Saving" indicator ke liye
// =====================================================
// Yeh function ensure karta hai ki `setSaveStatus('saving')` sirf
// ek baar call ho within THROTTLE_MS. Isse re-render storm nahi hota,
// lekin user ko "Saving..." turant dikhta hai.
const SAVING_THROTTLE_MS = 300;

export const useAutoSave = (
    userId: string,
    data: any,
    dependencies: any[],
    delay: number = 1000,  // ✅ Default 1000ms (Kickresume style)
    documentId?: string | null,
    skipSave: boolean = false
) => {
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const loadedRef = useRef(false);
    const quotaDispatchedRef = useRef(false);
    const lastSavingTimeRef = useRef(0);  // ✅ Throttle tracking

    useEffect(() => {
        loadedRef.current = true;
    }, []);

    useEffect(() => {
        if (!userId || !loadedRef.current) return;

        // =====================================================
        // ✅ KICKRESUME STYLE: "Saving" indicator TURANT dikhao
        // =====================================================
        // User type kare → "Saving..." turant dikhe
        // Lekin THROTTLED — 300ms mein sirf 1 baar (re-render storm nahi)
        // =====================================================
        const now = Date.now();
        if (now - lastSavingTimeRef.current > SAVING_THROTTLE_MS) {
            setSaveStatus('saving');
            lastSavingTimeRef.current = now;
        }

        // Reset debounce timer
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        // =====================================================
        // ✅ Debounced save — 1000ms baad actual save
        // =====================================================
        saveTimeoutRef.current = setTimeout(() => {
            const { profilePhoto, ...dataWithoutPhoto } = data;

            const incomingHasPhoto = !!dataWithoutPhoto?.hasPhoto;
            const finalHasPhoto = preserveHasPhotoFlag(userId, documentId, incomingHasPhoto);

            const dataToSave = {
                ...dataWithoutPhoto,
                hasPhoto: finalHasPhoto,
                lastUpdated: Date.now()
            };

            let result = { ok: true, quotaExceeded: false };

            if (documentId && !skipSave) {
                result = safeSave(
                    () => saveDocumentData(userId, documentId, dataToSave),
                    `saveDocumentData(${documentId})`
                );
            } else if (!documentId) {
                result = safeSave(
                    () => saveData(userId, dataToSave),
                    'saveData (no doc)'
                );
            } else {
                result = safeSave(
                    () => saveData(userId, dataToSave),
                    'saveData (skip)'
                );
            }

            // ✅ If quota exceeded, dispatch global event (once per session)
            if (result.quotaExceeded && !quotaDispatchedRef.current) {
                quotaDispatchedRef.current = true;
                dispatchStorageQuotaExceeded();

                setTimeout(() => {
                    quotaDispatchedRef.current = false;
                }, 5 * 60 * 1000);
            }

            setSaveStatus('saved');
        }, delay);

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [userId, documentId, skipSave, ...dependencies]);

    return { saveStatus };
};