// src/services/sync/docsync/cloudApi.ts
// All Supabase calls for documents live here (nothing else talks to cvs / cover_letters).
import { supabase, getCurrentUserId } from '../supabaseClient';
import { CLOUD_TABLE, CLOUD_ID_COLUMN, SAVE_RPC, FETCH_CHUNK_SIZE } from './constants';
import type { DocKind } from './constants';
import type { CloudIndexRow, CloudDocRow, CloudSaveResult } from './types';

const toMillis = (value: any): number => {
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
};

// null = request failed / not signed in (callers must never treat that as "empty")
export async function fetchIndex(kind: DocKind): Promise<CloudIndexRow[] | null> {
  try {
    const uid = await getCurrentUserId();
    if (!uid) return null;
    const idCol = CLOUD_ID_COLUMN[kind];
    const { data, error } = await supabase
      .from(CLOUD_TABLE[kind])
      .select(`${idCol}, version, updated_at, deleted_at`)
      .eq('user_id', uid);
    if (error || !data) return null;
    return data
      .map((r: any) => ({
        id: String(r[idCol] || ''),
        version: Number(r.version) || 0,
        updatedAt: toMillis(r.updated_at),
        deleted: !!r.deleted_at,
      }))
      .filter((r) => !!r.id);
  } catch {
    return null;
  }
}

// null = request failed. Rows that were not found are simply missing from the array.
export async function fetchDocs(kind: DocKind, ids: string[]): Promise<CloudDocRow[] | null> {
  if (ids.length === 0) return [];
  try {
    const uid = await getCurrentUserId();
    if (!uid) return null;
    const idCol = CLOUD_ID_COLUMN[kind];
    const rows: CloudDocRow[] = [];
    for (let i = 0; i < ids.length; i += FETCH_CHUNK_SIZE) {
      const { data, error } = await supabase
        .from(CLOUD_TABLE[kind])
        .select('*')
        .eq('user_id', uid)
        .in(idCol, ids.slice(i, i + FETCH_CHUNK_SIZE));
      if (error || !data) return null;
      for (const r of data as any[]) {
        rows.push({
          id: String(r[idCol]),
          data: r.data,
          title: r.title,
          template: r.template,
          version: Number(r.version) || 0,
          createdAt: toMillis(r.created_at),
          updatedAt: toMillis(r.updated_at),
          deleted: !!r.deleted_at,
          pinned: typeof r.pinned === 'boolean' ? r.pinned : undefined,
        });
      }
    }
    return rows;
  } catch {
    return null;
  }
}

// Atomic, version-checked save (server function). Never overwrites newer cloud data
// unless `force` is true (the user explicitly chose "keep mine").
export async function saveDoc(
  kind: DocKind,
  id: string,
  baseVersion: number,
  payload: { data: any; title: string; template: string },
  force = false,
): Promise<CloudSaveResult> {
  try {
    const { data, error } = await supabase.rpc(SAVE_RPC[kind], {
      p_doc_id: id,
      p_base_version: baseVersion,
      p_data: payload.data,
      p_title: payload.title,
      p_template: payload.template,
      p_force: force,
    });
    if (error) return { status: 'error', message: error.message };
    const res: any = data;
    switch (res?.status) {
      case 'ok': return { status: 'ok', version: Number(res.version) };
      case 'conflict': return { status: 'conflict', version: Number(res.version) };
      case 'deleted': return { status: 'deleted' };
      case 'auth_required': return { status: 'auth_required' };
      default: return { status: 'error', message: 'unexpected_response' };
    }
  } catch (e: any) {
    return { status: 'error', message: e?.message || 'network' };
  }
}

// Soft delete (server bumps the version, other devices see "deleted")
export async function softDeleteDoc(kind: DocKind, id: string): Promise<boolean> {
  try {
    const uid = await getCurrentUserId();
    if (!uid) return false;
    const { error } = await supabase
      .from(CLOUD_TABLE[kind])
      .update({ deleted_at: new Date().toISOString(), data: {} })
      .eq('user_id', uid)
      .eq(CLOUD_ID_COLUMN[kind], id);
    return !error;
  } catch {
    return false;
  }
}

export interface MetaPatch { title?: string; template?: string; pinned?: boolean }

// Version-checked metadata update (rename / pin). Returns new version, 'conflict', or null on failure.
export async function updateMeta(
  kind: DocKind,
  id: string,
  baseVersion: number,
  patch: MetaPatch,
): Promise<number | 'conflict' | null> {
  try {
    const uid = await getCurrentUserId();
    if (!uid) return null;
    const { data, error } = await supabase
      .from(CLOUD_TABLE[kind])
      .update(patch)
      .eq('user_id', uid)
      .eq(CLOUD_ID_COLUMN[kind], id)
      .eq('version', baseVersion)
      .select('version');
    if (error) return null;
    if (!data || data.length === 0) return 'conflict';
    return Number((data[0] as any).version);
  } catch {
    return null;
  }
}
