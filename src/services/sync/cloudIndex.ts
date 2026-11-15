// src/services/sync/cloudIndex.ts
// ============================================
// Adin AI — Light cloud index (for fast, cheap syncing)
// ============================================
// Instead of downloading every CV / cover letter (with all its data) on every sync,
// we first ask the cloud for a tiny LIST: id + updated time + "deleted?" flag.
// Full data is then downloaded ONLY for the documents this device really needs.
// → almost no egress (free-tier friendly) and the UI stays fast.
//
// Every function returns `null` when the cloud could not be reached / we are not signed in,
// so callers can tell "request failed" apart from "really empty" (never delete on failure).

import { supabase, getCurrentUserId } from './supabaseClient';
import type { CVRecord, CoverLetterRecord } from './types';

export interface CloudIndexEntry {
  id: string;
  updatedAt: number;
  deleted: boolean;
}

export type CloudDocTable = 'cvs' | 'cover_letters';

const ID_COLUMN: Record<CloudDocTable, 'cv_id' | 'cl_id'> = {
  cvs: 'cv_id',
  cover_letters: 'cl_id',
};

const FETCH_CHUNK_SIZE = 50;

const currentUserId = getCurrentUserId;

// ============================================
// "Last seen cloud version" registry (per user, per table, localStorage)
// ============================================
// Har document ke liye wo `updated_at` yaad rakhta hai jo is device ne cloud se dekha ya khud upload kiya.
// Restore isi se pehchanta hai ke cloud ki copy ISSE NAYI hai (kisi aur device ne edit kiya) → pull karo.
const CLOUD_VERSIONS_KEY_PREFIX = 'adin_sync_cloud_versions_';
export const UNKNOWN_CLOUD_VERSION = 0;

type CloudVersions = Record<string, number>;

const versionsKey = (userId: string, table: CloudDocTable): string =>
  `${CLOUD_VERSIONS_KEY_PREFIX}${userId}_${table}`;

const readVersions = (userId: string, table: CloudDocTable): CloudVersions => {
  try {
    const parsed = JSON.parse(localStorage.getItem(versionsKey(userId, table)) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const getCloudVersion = (userId: string, table: CloudDocTable, id: string): number => {
  const v = Number(readVersions(userId, table)[id]);
  return Number.isFinite(v) && v > 0 ? v : UNKNOWN_CLOUD_VERSION;
};

export const setCloudVersion = (userId: string, table: CloudDocTable, id: string, updatedAt: number): void => {
  if (!userId || !id || !Number.isFinite(updatedAt)) return;
  try {
    const versions = readVersions(userId, table);
    versions[id] = updatedAt;
    localStorage.setItem(versionsKey(userId, table), JSON.stringify(versions));
  } catch {
    // storage unavailable / full — best-effort
  }
};

// Tiny list: which documents exist (and which are marked deleted) in the cloud.
export async function fetchCloudIndex(table: CloudDocTable): Promise<CloudIndexEntry[] | null> {
  try {
    const uid = await currentUserId();
    if (!uid) return null;
    const idCol = ID_COLUMN[table];

    let hasDeletedColumn = true;
    let res: { data: any[] | null; error: { message: string } | null } = await supabase
      .from(table)
      .select(`${idCol}, updated_at, deleted_at`)
      .eq('user_id', uid);

    if (res.error && /deleted_at/i.test(res.error.message)) {
      // Migration (deleted_at column) abhi nahi chali → purana mode: koi "deleted" flag nahi
      hasDeletedColumn = false;
      res = await supabase.from(table).select(`${idCol}, updated_at`).eq('user_id', uid);
    }
    if (res.error || !res.data) return null;

    return res.data
      .map((r: any) => ({
        id: String(r[idCol] || ''),
        updatedAt: new Date(r.updated_at).getTime(),
        deleted: hasDeletedColumn ? !!r.deleted_at : false,
      }))
      .filter((e) => !!e.id);
  } catch {
    return null;
  }
}

async function fetchRowsByIds(table: CloudDocTable, ids: string[]): Promise<any[]> {
  if (ids.length === 0) return [];
  const uid = await currentUserId();
  if (!uid) return [];
  const idCol = ID_COLUMN[table];
  const rows: any[] = [];

  for (let i = 0; i < ids.length; i += FETCH_CHUNK_SIZE) {
    const chunk = ids.slice(i, i + FETCH_CHUNK_SIZE);
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', uid)
        .in(idCol, chunk);
      if (!error && data) rows.push(...data);
    } catch {
      // this chunk failed — it will simply be retried on the next sync round
    }
  }
  return rows;
}

// Full data for ONLY the CVs we ask for.
export async function fetchCloudCvsByIds(ids: string[]): Promise<CVRecord[]> {
  const rows = await fetchRowsByIds('cvs', ids);
  return rows.map((r) => ({
    userId: r.user_id,
    cvId: r.cv_id,
    data: r.data,
    title: r.title,
    template: r.template,
    createdAt: new Date(r.created_at).getTime(),
    updatedAt: new Date(r.updated_at).getTime(),
  }));
}

// Full data for ONLY the cover letters we ask for.
export async function fetchCloudCoverLettersByIds(ids: string[]): Promise<CoverLetterRecord[]> {
  const rows = await fetchRowsByIds('cover_letters', ids);
  return rows.map((r) => ({
    userId: r.user_id,
    clId: r.cl_id,
    data: r.data,
    title: r.title,
    template: r.template,
    createdAt: new Date(r.created_at).getTime(),
    updatedAt: new Date(r.updated_at).getTime(),
  }));
}
