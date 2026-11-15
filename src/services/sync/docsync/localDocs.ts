// src/services/sync/docsync/localDocs.ts
// Read / write documents in the SAME localStorage keys the builders use.
import {
  LOCAL_DOC_KEY_PREFIX,
  LOCAL_INDEX_KEY_PREFIX,
  DEFAULT_TITLE,
  DEFAULT_TEMPLATE,
  COVER_LETTER_META_KIND,
  MIN_REAL_PHOTO_LENGTH,
} from './constants';
import type { DocKind } from './constants';
import type { CloudDocRow, LocalDoc } from './types';
import { saveImageToIDB, deleteImageFromIDB, getPhotoKey } from '../../../components/cv-builder/utils/imageUtils';

const docKey = (kind: DocKind, userId: string, id: string): string =>
  `${LOCAL_DOC_KEY_PREFIX[kind]}${userId}_${id}`;
const indexKey = (kind: DocKind, userId: string): string => `${LOCAL_INDEX_KEY_PREFIX[kind]}${userId}`;

const parseJson = (raw: string | null): any => {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

export const readLocalIndex = (kind: DocKind, userId: string): any[] => {
  const parsed = parseJson(localStorage.getItem(indexKey(kind, userId)));
  return Array.isArray(parsed) ? parsed : [];
};

const writeLocalIndex = (kind: DocKind, userId: string, index: any[]): void => {
  try { localStorage.setItem(indexKey(kind, userId), JSON.stringify(index)); } catch { /* quota — ignore */ }
};

// A document counts only if it has BOTH an index entry and stored data
export const readLocalDoc = (kind: DocKind, userId: string, id: string): LocalDoc | null => {
  const meta = readLocalIndex(kind, userId).find((m) => m?.id === id);
  if (!meta) return null;
  const data = parseJson(localStorage.getItem(docKey(kind, userId, id)));
  if (!data || typeof data !== 'object') return null;
  return { data, meta };
};

export const removeLocalDoc = async (kind: DocKind, userId: string, id: string): Promise<void> => {
  try { localStorage.removeItem(docKey(kind, userId, id)); } catch { /* ignore */ }
  writeLocalIndex(kind, userId, readLocalIndex(kind, userId).filter((m) => m?.id !== id));
  try { await deleteImageFromIDB(getPhotoKey(id)); } catch { /* image may not exist */ }
};

const parseDocData = (raw: any): any => {
  let data = raw;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { data = {}; }
  }
  return data && typeof data === 'object' ? data : {};
};

// Apply a cloud document onto this device (data + index entry)
export const writeRemoteToLocal = async (kind: DocKind, userId: string, row: CloudDocRow): Promise<void> => {
  const existing = readLocalDoc(kind, userId, row.id);
  const data = parseDocData(row.data);

  // Photos live in IndexedDB, never in localStorage
  let hasPhoto = !!data.hasPhoto || !!existing?.data?.hasPhoto;
  const photoHolder = kind === 'cv' ? data.personalInfo : data;
  const photoField = kind === 'cv' ? 'photo' : 'profilePhoto';
  const photo = photoHolder?.[photoField];
  if (typeof photo === 'string' && photo.length > (kind === 'cv' ? 0 : MIN_REAL_PHOTO_LENGTH)) {
    try {
      await saveImageToIDB(getPhotoKey(row.id), photo);
      hasPhoto = true;
    } catch { /* keep going without the image */ }
    photoHolder[photoField] = null;
  }

  localStorage.setItem(
    docKey(kind, userId, row.id),
    JSON.stringify({ ...data, hasPhoto, lastUpdated: Date.now() }),
  );

  const jobTitle = kind === 'cv' ? data?.personalInfo?.title || '' : data?.jobTitle || '';
  const meta = {
    id: row.id,
    title: row.title || DEFAULT_TITLE[kind],
    jobTitle,
    template: row.template || data?.template || DEFAULT_TEMPLATE[kind],
    lastEdited: row.updatedAt,
    createdAt: row.createdAt,
    pinned: row.pinned ?? existing?.meta?.pinned ?? false,
    ...(kind === 'cl' ? { kind: COVER_LETTER_META_KIND } : {}),
  };

  const index = readLocalIndex(kind, userId);
  const at = index.findIndex((m) => m?.id === row.id);
  if (at >= 0) index[at] = meta;
  else index.push(meta);
  writeLocalIndex(kind, userId, index);
};
