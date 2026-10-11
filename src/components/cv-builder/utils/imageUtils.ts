// src/components/cv-builder/utils/imageUtils.ts
// =====================================================
// 🎯 HYBRID IMAGE STORAGE — Compress + IndexedDB
// =====================================================
// - Compress: 3MB → ~100KB (canvas, JPEG 0.75, max 400x400)
// - Store: IndexedDB (unlimited, ~50% disk)
// - Reference: LocalStorage mein sirf { hasPhoto: true, photoId }
// =====================================================

const DB_NAME = 'adin_cv_images';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

// =====================================================
// 1. IMAGE COMPRESSION (canvas)
// =====================================================

export interface CompressOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const DEFAULT_COMPRESS: Required<CompressOptions> = {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.75,
    format: 'image/jpeg',
};

/**
 * Image ko compress karo — dataURL ya File se.
 * Returns: { dataUrl, sizeKB, originalKB, savedPercent }
 */
export const compressImage = async (
    source: string | File,
    options: CompressOptions = {}
): Promise<{
    dataUrl: string;
    sizeKB: number;
    originalKB: number;
    savedPercent: number;
}> => {
    const opts = { ...DEFAULT_COMPRESS, ...options };

    // 1. Load image
    const dataUrl = typeof source === 'string'
        ? source
        : await fileToDataUrl(source);

    const img = await loadImage(dataUrl);
    const originalKB = Math.round((dataUrl.length * 3) / 4 / 1024); // base64 approx

    // 2. Calculate new dimensions (maintain aspect ratio)
    let { width, height } = img;
    if (width > opts.maxWidth || height > opts.maxHeight) {
        const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
    }

    // 3. Draw to canvas + export
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

    // White background (JPEG transparency loss fix)
    if (opts.format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0, width, height);

    const compressed = canvas.toDataURL(opts.format, opts.quality);
    const sizeKB = Math.round((compressed.length * 3) / 4 / 1024);

    return {
        dataUrl: compressed,
        sizeKB,
        originalKB,
        savedPercent: originalKB > 0
            ? Math.round(((originalKB - sizeKB) / originalKB) * 100)
            : 0,
    };
};

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

// =====================================================
// 2. INDEXEDDB — IMAGE STORAGE
// =====================================================

let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = (): Promise<IDBDatabase> => {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            reject(new Error('IndexedDB not supported'));
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    return dbPromise;
};

/**
 * Image ko IndexedDB mein save karo.
 * Key: `photo_${documentId}` (ya `photo_${userId}_draft` for unsaved)
 */
export const saveImageToIDB = async (key: string, dataUrl: string): Promise<void> => {
    try {
        const db = await getDB();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.put(dataUrl, key);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.error('[saveImageToIDB] failed:', e);
        throw e;
    }
};

/**
 * IndexedDB se image load karo.
 */
export const loadImageFromIDB = async (key: string): Promise<string | null> => {
    try {
        const db = await getDB();
        return await new Promise<string | null>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result ?? null);
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.error('[loadImageFromIDB] failed:', e);
        return null;
    }
};

/**
 * IndexedDB se image delete karo.
 */
export const deleteImageFromIDB = async (key: string): Promise<void> => {
    try {
        const db = await getDB();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.delete(key);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.error('[deleteImageFromIDB] failed:', e);
    }
};

// =====================================================
// 3. HELPER — Photo Key
// =====================================================

export const getPhotoKey = (documentId: string): string =>
    `photo_${documentId}`;

export const getDraftPhotoKey = (userId: string): string =>
    `photo_draft_${userId}`;