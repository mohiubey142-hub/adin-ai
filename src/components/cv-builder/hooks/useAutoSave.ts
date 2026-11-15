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
// ✅ NEW: "Kuch badla hi nahi" check — write-back loop band
// =====================================================
// Pehle ye hook page open / reload / cloud-restore ke baad 1 sec mein SAME data dobara save kar deta tha
// (loadedRef pehle effect me true ho jata hai, isliye mount par skip nahi hota tha).
// Is write-back se lastEdited = abhi ho jata tha aur cloud par naya upload chala jata tha:
//   • dusre device ke naye updates "recent local edit" ban kar 2 min block hote the
//   • B ka purana state, A ke naye edit ko cloud par overwrite kar sakta tha
// Ab agar saved data me koi asli farq nahi hai to kuch likha / sync nahi hota.
const DOC_KEY_PREFIX = 'adin_cv_document_';
const IGNORED_COMPARE_KEYS: ReadonlySet<string> = new Set(['lastUpdated', 'hasPhoto']);

// Keys sorted — Postgres jsonb key order badal deta hai, isliye normal JSON.stringify compare galat hota
const stableStringify = (value: any, isRoot = true): string => {
    if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
    if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v, false)).join(',')}]`;
    const keys = Object.keys(value)
        .filter((k) => !(isRoot && IGNORED_COMPARE_KEYS.has(k)))
        .sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k], false)}`).join(',')}}`;
};

const isSameAsStored = (userId: string, documentId: string, candidate: any): boolean => {
    try {
        const raw = localStorage.getItem(`${DOC_KEY_PREFIX}${userId}_${documentId}`);
        if (!raw) return false;
        return stableStringify(JSON.parse(raw)) === stableStringify(candidate);
    } catch {
        return false;   // shak ho to save karo (purana behaviour)
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
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

            // ✅ Koi asli change nahi → na local write, na lastEdited bump, na cloud upload
            if (documentId && !skipSave && isSameAsStored(userId, documentId, dataToSave)) {
                setSaveStatus('saved');
                return;
            }

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