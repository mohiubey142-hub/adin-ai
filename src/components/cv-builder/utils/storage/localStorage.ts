// src/components/cv-builder/utils/storage/localStorage.ts
// Safe wrappers around localStorage. NEVER throws to caller.

export const isLocalStorageAvailable = (): boolean => {
    try {
        const k = '__adin_test__';
        window.localStorage.setItem(k, '1');
        window.localStorage.removeItem(k);
        return true;
    } catch {
        return false;
    }
};

const isQuotaError = (e: unknown): boolean => {
    if (!e) return false;
    const err = e as { name?: string; code?: number; message?: string };
    return (
        err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22 ||
        err.code === 1014 ||
        /quota/i.test(err.message || '')
    );
};

export const safeLocalStorageSet = (key: string, value: string): boolean => {
    try {
        window.localStorage.setItem(key, value);
        return true;
    } catch (e) {
        if (import.meta.env?.DEV) {
            if (isQuotaError(e)) {
                console.warn(`[localStorage] Quota exceeded writing "${key}". Value kept in-memory only.`);
            } else {
                console.warn(`[localStorage] Write failed for "${key}":`, e);
            }
        }
        return false;
    }
};

export const safeLocalStorageGet = (key: string): string | null => {
    try {
        return window.localStorage.getItem(key);
    } catch (e) {
        if (import.meta.env?.DEV) console.warn(`[localStorage] Read failed for "${key}":`, e);
        return null;
    }
};

export const safeLocalStorageRemove = (key: string): void => {
    try {
        window.localStorage.removeItem(key);
    } catch (e) {
        if (import.meta.env?.DEV) console.warn(`[localStorage] Remove failed for "${key}":`, e);
    }
};

export const safeLocalStorageParse = <T>(key: string, fallback: T): T => {
    const raw = safeLocalStorageGet(key);
    if (raw === null) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch (e) {
        if (import.meta.env?.DEV) console.warn(`[localStorage] JSON parse failed for "${key}"`, e);
        return fallback;
    }
};

export const safeLocalStorageSetJSON = (key: string, value: unknown): boolean => {
    try {
        return safeLocalStorageSet(key, JSON.stringify(value));
    } catch (e) {
        if (import.meta.env?.DEV) console.warn(`[localStorage] JSON stringify failed for "${key}"`, e);
        return false;
    }
};

/**
 * Returns per-key approximate byte sizes. DEV only.
 */
export const inspectLocalStorage = (): Array<{ key: string; bytes: number }> => {
    const out: Array<{ key: string; bytes: number }> = [];
    try {
        for (let i = 0; i < window.localStorage.length; i++) {
            const k = window.localStorage.key(i);
            if (!k) continue;
            const v = window.localStorage.getItem(k) || '';
            out.push({ key: k, bytes: (k.length + v.length) * 2 });
        }
    } catch (e) {
        if (import.meta.env?.DEV) console.warn('[localStorage] inspect failed', e);
    }
    return out.sort((a, b) => b.bytes - a.bytes);
};