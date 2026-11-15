// src/services/sync/docsync/localState.ts
import { SYNC_STATE_KEY_PREFIX } from './constants';
import type { DocKind } from './constants';
import type { DocSyncState } from './types';

type StateMap = Record<string, DocSyncState>;

const stateKey = (userId: string, kind: DocKind): string => `${SYNC_STATE_KEY_PREFIX}${userId}_${kind}`;

const readAll = (userId: string, kind: DocKind): StateMap => {
  try {
    const parsed = JSON.parse(localStorage.getItem(stateKey(userId, kind)) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeAll = (userId: string, kind: DocKind, map: StateMap): void => {
  try {
    localStorage.setItem(stateKey(userId, kind), JSON.stringify(map));
  } catch {
    // storage full / unavailable — bookkeeping is best-effort, next pull re-derives it
  }
};

export const getState = (userId: string, kind: DocKind, id: string): DocSyncState | undefined =>
  readAll(userId, kind)[id];

export const getAllStates = (userId: string, kind: DocKind): StateMap => readAll(userId, kind);

// Merge `patch` into the existing state. `base` is used only when no state exists yet.
export const patchState = (
  userId: string,
  kind: DocKind,
  id: string,
  patch: Partial<DocSyncState>,
  base?: DocSyncState,
): DocSyncState | undefined => {
  if (!userId || !id) return undefined;
  const map = readAll(userId, kind);
  const current = map[id] ?? base;
  if (!current) return undefined;
  const next: DocSyncState = { ...current, ...patch };
  map[id] = next;
  writeAll(userId, kind, map);
  return next;
};

export const setState = (userId: string, kind: DocKind, id: string, state: DocSyncState): void => {
  if (!userId || !id) return;
  const map = readAll(userId, kind);
  map[id] = state;
  writeAll(userId, kind, map);
};

export const removeState = (userId: string, kind: DocKind, id: string): void => {
  const map = readAll(userId, kind);
  if (!(id in map)) return;
  delete map[id];
  writeAll(userId, kind, map);
};

// Clean (fully synced, nothing stale) state for a version + content
export const cleanState = (version: number, contentHash: string, keep?: Partial<DocSyncState>): DocSyncState => ({
  baseVersion: version,
  contentHash,
  dirty: false,
  stale: false,
  staleReason: undefined,
  cloudVersion: undefined,
  pendingDelete: false,
  archived: keep?.archived,
});
