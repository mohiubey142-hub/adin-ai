// src/components/cv-builder/utils/storage/indexedDB.ts
// Single app-wide IndexedDB wrapper. Uses native IndexedDB (no deps).

const DB_NAME = 'adin-ai-storage';
const DB_VERSION = 1;

export type StoreName = 'documents' | 'legacy' | 'images' | 'misc';

const STORES: StoreName[] = ['documents', 'legacy', 'images', 'misc'];

let dbPromise: Promise<IDBDatabase> | null = null;

const isIndexedDBAvailable = (): boolean => {
    try {
        return typeof indexedDB !== 'undefined' && indexedDB !== null;
    } catch {
        return false;
    }
};

const openDB = (): Promise<IDBDatabase> => {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        if (!isIndexedDBAvailable()) {
            reject(new Error('IndexedDB not available'));
            return;
        }

        let request: IDBOpenDBRequest;
        try {
            request = indexedDB.open(DB_NAME, DB_VERSION);
        } catch (e) {
            reject(e);
            return;
        }

        request.onupgradeneeded = () => {
            const db = request.result;
            STORES.forEach((store) => {
                if (!db.objectStoreNames.contains(store)) {
                    db.createObjectStore(store);
                }
            });
        };

        request.onsuccess = () => {
            const db = request.result;
            db.onversionchange = () => {
                try { db.close(); } catch { /* noop */ }
                dbPromise = null;
            };
            resolve(db);
        };

        request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));
        request.onblocked = () => {
            reject(new Error('IndexedDB upgrade blocked'));
        };
    });

    dbPromise.catch(() => { dbPromise = null; });

    return dbPromise;
};

const tx = <T>(
    store: StoreName,
    mode: IDBTransactionMode,
    fn: (s: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
    return openDB().then(
        (db) =>
            new Promise<T>((resolve, reject) => {
                let transaction: IDBTransaction;
                try {
                    transaction = db.transaction(store, mode);
                } catch (e) {
                    reject(e);
                    return;
                }
                const objectStore = transaction.objectStore(store);
                let req: IDBRequest<T>;
                try {
                    req = fn(objectStore);
                } catch (e) {
                    reject(e);
                    return;
                }
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error || new Error('IndexedDB request failed'));
                transaction.onerror = () => reject(transaction.error || new Error('IndexedDB tx failed'));
                transaction.onabort = () => reject(transaction.error || new Error('IndexedDB tx aborted'));
            })
    );
};

// ---------- Public API ----------

export const idbSet = <T>(store: StoreName, key: string, value: T): Promise<void> =>
    tx<void>(store, 'readwrite', (s) => s.put(value, key) as unknown as IDBRequest<void>);

export const idbGet = <T>(store: StoreName, key: string): Promise<T | undefined> =>
    tx<T | undefined>(store, 'readonly', (s) => s.get(key) as IDBRequest<T | undefined>);

export const idbDelete = (store: StoreName, key: string): Promise<void> =>
    tx<void>(store, 'readwrite', (s) => s.delete(key) as unknown as IDBRequest<void>);

export const idbHas = async (store: StoreName, key: string): Promise<boolean> => {
    const v = await idbGet(store, key);
    return v !== undefined;
};

export const idbIsAvailable = isIndexedDBAvailable;

export const idbWarmup = async (): Promise<boolean> => {
    try {
        await openDB();
        return true;
    } catch (e) {
        if (import.meta.env?.DEV) {
            console.warn('[IndexedDB] unavailable:', e);
        }
        return false;
    }
};