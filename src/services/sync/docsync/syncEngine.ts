// src/services/sync/docsync/syncEngine.ts
// ============================================
// Adin AI — Document Sync Engine (v2)
// ============================================
// Rules:
//  1. Cloud is the source of truth, localStorage is a cache.
//  2. Every cloud save carries the version this device last saw. If the cloud moved on,
//     the server refuses (conflict) — nothing is ever silently overwritten.
//  3. A save happens only when the CONTENT really changed (hash), never because a page was opened.
//  4. Changes from other devices are pulled on app open / focus / online / every few minutes.
//  5. A document that is open in an editor is never rewritten under the user — a banner asks first.

import {
  DOC_KINDS,
  NEW_DOC_BASE_VERSION,
  DEFAULT_TITLE,
  DEFAULT_TEMPLATE,
  SAVE_DEBOUNCE_MS,
  MIN_PULL_GAP_MS,
  PULL_INTERVAL_MS,
  EVENT_DOCS_UPDATED,
  EVENT_DOCS_STALE,
} from './constants';
import type { DocKind } from './constants';
import type { DocSyncState, CloudDocRow, StaleDocInfo, PullSummary, StaleReason } from './types';
import { hashDocContent } from './hash';
import { getState, getAllStates, patchState, setState, removeState, cleanState } from './localState';
import { readLocalDoc, readLocalIndex, removeLocalDoc, writeRemoteToLocal } from './localDocs';
import * as cloud from './cloudApi';
import type { MetaPatch } from './cloudApi';

// ── runtime registries (memory only) ──
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
const inFlight = new Map<string, Promise<void>>();
const activeDocs: Record<DocKind, string | null> = { cv: null, cl: null };

const docRef = (kind: DocKind, id: string): string => `${kind}:${id}`;

const emit = (eventName: string, detail?: object): void => {
  try { window.dispatchEvent(new CustomEvent(eventName, { detail })); } catch { /* non-browser */ }
};

export const setActiveDoc = (kind: DocKind, id: string | null): void => { activeDocs[kind] = id; };
export const isActiveDoc = (kind: DocKind, id: string): boolean => activeDocs[kind] === id;

const markStale = (
  userId: string, kind: DocKind, id: string, reason: StaleReason, cloudVersion: number, dirty: boolean,
): void => {
  const fallback: DocSyncState = { baseVersion: NEW_DOC_BASE_VERSION, contentHash: '', dirty };
  patchState(userId, kind, id, { stale: true, staleReason: reason, cloudVersion, dirty }, fallback);
  emit(EVENT_DOCS_STALE, { kind, id });
};

const buildPayload = (kind: DocKind, local: { data: any; meta: any }) => ({
  data: local.data,
  title: local.meta?.title || DEFAULT_TITLE[kind],
  template: local.meta?.template || local.data?.template || DEFAULT_TEMPLATE[kind],
});

// ============================================
// SAVE (local → cloud)
// ============================================
async function saveNow(kind: DocKind, userId: string, id: string): Promise<void> {
  let state = getState(userId, kind, id);
  if (state?.pendingDelete || state?.archived || state?.stale) return;

  const local = readLocalDoc(kind, userId, id);
  if (!local) return;

  const hash = hashDocContent(local.data);
  if (state && !state.dirty && state.contentHash === hash) return;   // nothing changed → no network at all

  // First time this device sees this document: find out how it relates to the cloud
  if (!state) {
    const rows = await cloud.fetchDocs(kind, [id]);
    if (rows === null) return;                                         // offline → retry later
    const row = rows[0];
    if (row) {
      if (row.deleted) { markStale(userId, kind, id, 'remote-deleted', row.version, true); return; }
      if (hashDocContent(row.data) === hash) {
        setState(userId, kind, id, cleanState(row.version, hash));     // identical → just adopt version
        return;
      }
      const localIsNewer = (Number(local.meta?.lastEdited) || 0) > row.updatedAt;
      if (!localIsNewer) { markStale(userId, kind, id, 'conflict', row.version, true); return; }
      state = { baseVersion: row.version, contentHash: '', dirty: true };
    } else {
      state = { baseVersion: NEW_DOC_BASE_VERSION, contentHash: '', dirty: true };
    }
    setState(userId, kind, id, state);
  }

  patchState(userId, kind, id, { dirty: true });
  const res = await cloud.saveDoc(kind, id, state.baseVersion, buildPayload(kind, local));

  switch (res.status) {
    case 'ok':
      setState(userId, kind, id, cleanState(res.version, hash, state));
      break;
    case 'conflict':
      markStale(userId, kind, id, 'conflict', res.version, true);
      break;
    case 'deleted':
      markStale(userId, kind, id, 'remote-deleted', state.baseVersion, true);
      break;
    default:
      break;   // auth / network → stays dirty, retried by retryPending()
  }
}

const runSerial = (kind: DocKind, userId: string, id: string): Promise<void> => {
  const key = docRef(kind, id);
  const run = (inFlight.get(key) ?? Promise.resolve())
    .then(() => saveNow(kind, userId, id))
    .catch((e) => console.warn('[docsync] save failed', e));
  inFlight.set(key, run);
  void run.finally(() => { if (inFlight.get(key) === run) inFlight.delete(key); });
  return run;
};

export const scheduleSave = (kind: DocKind, userId: string, id: string): void => {
  if (!userId || !id) return;
  const key = docRef(kind, id);
  const existing = saveTimers.get(key);
  if (existing) clearTimeout(existing);
  saveTimers.set(key, setTimeout(() => { saveTimers.delete(key); void runSerial(kind, userId, id); }, SAVE_DEBOUNCE_MS));
};

export const cancelAllTimers = (): void => {
  saveTimers.forEach((t) => clearTimeout(t));
  saveTimers.clear();
};

// ============================================
// DELETE / META
// ============================================
const tryCloudDelete = async (kind: DocKind, userId: string, id: string): Promise<void> => {
  if (await cloud.softDeleteDoc(kind, id)) removeState(userId, kind, id);
};

export const deleteDoc = async (kind: DocKind, userId: string, id: string): Promise<void> => {
  const timer = saveTimers.get(docRef(kind, id));
  if (timer) { clearTimeout(timer); saveTimers.delete(docRef(kind, id)); }
  const fallback: DocSyncState = { baseVersion: NEW_DOC_BASE_VERSION, contentHash: '', dirty: false };
  patchState(userId, kind, id, { pendingDelete: true, dirty: false, stale: false }, fallback);
  await tryCloudDelete(kind, userId, id);
};

export const updateMeta = async (kind: DocKind, userId: string, id: string, patch: MetaPatch & { archived?: boolean }): Promise<void> => {
  if (patch.archived) {
    // "Remove from this device only" — remember it so the next pull does not bring it back
    const fallback: DocSyncState = { baseVersion: NEW_DOC_BASE_VERSION, contentHash: '', dirty: false };
    patchState(userId, kind, id, { archived: true }, fallback);
    return;
  }
  const { archived: _ignored, ...cloudPatch } = patch;
  if (Object.keys(cloudPatch).length === 0) return;

  const state = getState(userId, kind, id);
  if (!state || state.stale || state.baseVersion <= NEW_DOC_BASE_VERSION) {
    scheduleSave(kind, userId, id);          // not in the cloud yet — the normal save carries title/template
    return;
  }
  const result = await cloud.updateMeta(kind, id, state.baseVersion, cloudPatch);
  if (typeof result === 'number') patchState(userId, kind, id, { baseVersion: result });
  else if (result === 'conflict') markStale(userId, kind, id, 'conflict', state.baseVersion, state.dirty);
};

// ============================================
// PULL (cloud → local)
// ============================================
const applyRemote = async (kind: DocKind, userId: string, row: CloudDocRow, tally: PullSummary): Promise<void> => {
  const local = readLocalDoc(kind, userId, row.id);
  const state = getState(userId, kind, row.id);

  if (!local) {
    await writeRemoteToLocal(kind, userId, row);
    const written = readLocalDoc(kind, userId, row.id);
    setState(userId, kind, row.id, cleanState(row.version, hashDocContent(written?.data ?? row.data), state));
    tally.updated++;
    return;
  }

  const localHash = hashDocContent(local.data);
  if (hashDocContent(row.data) === localHash) {
    setState(userId, kind, row.id, cleanState(row.version, localHash, state));   // same content, only version moved
    return;
  }

  // Do we hold edits the cloud has not seen?
  const hasLocalEdits = state
    ? state.dirty || localHash !== state.contentHash
    : (Number(local.meta?.lastEdited) || 0) > row.updatedAt;

  if (hasLocalEdits) {
    markStale(userId, kind, row.id, 'conflict', row.version, true);
    tally.stale++;
    return;
  }
  if (isActiveDoc(kind, row.id)) {
    markStale(userId, kind, row.id, 'remote-update', row.version, false);
    tally.stale++;
    return;
  }

  await writeRemoteToLocal(kind, userId, row);
  const written = readLocalDoc(kind, userId, row.id);
  setState(userId, kind, row.id, cleanState(row.version, hashDocContent(written?.data ?? row.data), state));
  tally.updated++;
};

const handleRemoteDeleted = async (kind: DocKind, userId: string, id: string, version: number, tally: PullSummary): Promise<void> => {
  const local = readLocalDoc(kind, userId, id);
  if (!local) { removeState(userId, kind, id); return; }

  const state = getState(userId, kind, id);
  const hasLocalEdits = !!state && (state.dirty || hashDocContent(local.data) !== state.contentHash);
  if (hasLocalEdits || isActiveDoc(kind, id)) {
    markStale(userId, kind, id, 'remote-deleted', version, hasLocalEdits);
    tally.stale++;
    return;
  }
  await removeLocalDoc(kind, userId, id);
  removeState(userId, kind, id);
  tally.removed++;
};

export async function pullChanges(userId: string): Promise<PullSummary> {
  const tally: PullSummary = { ok: true, updated: 0, removed: 0, stale: 0 };

  for (const kind of DOC_KINDS) {
    const index = await cloud.fetchIndex(kind);
    if (index === null) { tally.ok = false; continue; }          // never treat a failed request as "empty"

    const states = getAllStates(userId, kind);
    const localIds = new Set(readLocalIndex(kind, userId).map((m) => m?.id).filter(Boolean));
    const cloudIds = new Set(index.map((r) => r.id));
    const toFetch: string[] = [];

    for (const row of index) {
      const state = states[row.id];
      if (state?.archived || state?.pendingDelete) continue;
      if (row.deleted) { await handleRemoteDeleted(kind, userId, row.id, row.version, tally); continue; }
      if (localIds.has(row.id) && state) {
        if (state.baseVersion === row.version) continue;                          // already in sync
        if (state.stale && state.cloudVersion === row.version) continue;          // already flagged
      }
      toFetch.push(row.id);
    }

    const rows = await cloud.fetchDocs(kind, toFetch);
    if (rows === null) tally.ok = false;
    else for (const row of rows) if (!row.deleted) await applyRemote(kind, userId, row, tally);

    // Local documents the cloud does not know
    for (const id of localIds) {
      if (cloudIds.has(id)) continue;
      const state = states[id];
      if (!state || state.baseVersion === NEW_DOC_BASE_VERSION || state.dirty) scheduleSave(kind, userId, id);   // created on this device → upload
      else if (!isActiveDoc(kind, id)) { await removeLocalDoc(kind, userId, id); removeState(userId, kind, id); tally.removed++; }
    }
  }

  if (tally.updated > 0 || tally.removed > 0) emit(EVENT_DOCS_UPDATED, { updated: tally.updated, removed: tally.removed });
  return tally;
}

// ============================================
// Retry anything that did not reach the cloud
// ============================================
export async function retryPending(userId: string): Promise<void> {
  if (!userId) return;
  for (const kind of DOC_KINDS) {
    const states = getAllStates(userId, kind);
    for (const [id, state] of Object.entries(states)) {
      if (state.pendingDelete) { await tryCloudDelete(kind, userId, id); continue; }
      if (state.stale || state.archived) continue;
      const local = readLocalDoc(kind, userId, id);
      if (!local) continue;
      // dirty, or edited since the last confirmed save (e.g. tab closed before the debounce fired)
      if (state.dirty || hashDocContent(local.data) !== state.contentHash) await runSerial(kind, userId, id);
    }
  }
}

export const getPendingCount = (userId: string): number => {
  let count = 0;
  for (const kind of DOC_KINDS) {
    for (const s of Object.values(getAllStates(userId, kind))) {
      if (s.dirty || s.pendingDelete) count++;
    }
  }
  return count;
};

// ============================================
// Stale documents + user decisions (used by the banner)
// ============================================
export const getStaleDocs = (userId: string): StaleDocInfo[] => {
  const out: StaleDocInfo[] = [];
  for (const kind of DOC_KINDS) {
    for (const [id, state] of Object.entries(getAllStates(userId, kind))) {
      if (!state.stale || !state.staleReason) continue;
      const meta = readLocalIndex(kind, userId).find((m) => m?.id === id);
      out.push({ kind, id, title: meta?.title || DEFAULT_TITLE[kind], reason: state.staleReason });
    }
  }
  return out;
};

// User chose the other device's version (or "delete here too")
export async function resolveUseCloud(kind: DocKind, userId: string, id: string): Promise<boolean> {
  const rows = await cloud.fetchDocs(kind, [id]);
  if (rows === null) return false;
  const row = rows[0];
  if (!row || row.deleted) {
    await removeLocalDoc(kind, userId, id);
    removeState(userId, kind, id);
  } else {
    await writeRemoteToLocal(kind, userId, row);
    const written = readLocalDoc(kind, userId, id);
    setState(userId, kind, id, cleanState(row.version, hashDocContent(written?.data ?? row.data)));
  }
  emit(EVENT_DOCS_UPDATED, { updated: 1, removed: 0 });
  return true;
}

// User chose "keep this version" → explicit, forced overwrite of the cloud copy
export async function resolveKeepMine(kind: DocKind, userId: string, id: string): Promise<boolean> {
  const local = readLocalDoc(kind, userId, id);
  if (!local) return false;
  const hash = hashDocContent(local.data);
  const res = await cloud.saveDoc(kind, id, NEW_DOC_BASE_VERSION, buildPayload(kind, local), true);
  if (res.status !== 'ok') return false;
  setState(userId, kind, id, cleanState(res.version, hash));
  emit(EVENT_DOCS_UPDATED, { updated: 0, removed: 0 });
  return true;
}

// ============================================
// Runner: pull on open / focus / online / interval
// ============================================
export const startDocSync = (userId: string): (() => void) => {
  let lastRun = 0;
  let running = false;

  const run = async (force: boolean): Promise<void> => {
    if (running) return;
    if (!force) {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastRun < MIN_PULL_GAP_MS) return;
    }
    running = true;
    lastRun = Date.now();
    try {
      await retryPending(userId);
      await pullChanges(userId);
    } catch (e) {
      console.warn('[docsync] run failed', e);
    } finally {
      running = false;
    }
  };

  const onVisibility = (): void => {
    if (document.visibilityState === 'visible') void run(false);
    else void retryPending(userId).catch(() => {});      // tab hidden → push unsaved edits now
  };
  const onFocus = (): void => { void run(false); };
  const onOnline = (): void => { void run(true); };

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('focus', onFocus);
  window.addEventListener('online', onOnline);
  const intervalId = window.setInterval(() => { void run(false); }, PULL_INTERVAL_MS);
  void run(true);

  return () => {
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('focus', onFocus);
    window.removeEventListener('online', onOnline);
    window.clearInterval(intervalId);
    cancelAllTimers();
  };
};
