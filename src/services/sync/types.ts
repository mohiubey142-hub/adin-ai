// src/services/sync/docsync/types.ts
import type { DocKind } from './constants';

export type StaleReason = 'conflict' | 'remote-update' | 'remote-deleted';

// Per-document sync bookkeeping (stored locally, tiny)
export interface DocSyncState {
  baseVersion: number;        // cloud version this device last saw / uploaded
  contentHash: string;        // hash of the content at that moment
  dirty: boolean;             // local content not yet confirmed in the cloud
  stale?: boolean;            // cloud has something this device has not applied → saves are paused
  staleReason?: StaleReason;
  cloudVersion?: number;      // newest cloud version seen while stale
  pendingDelete?: boolean;    // deleted locally, cloud delete not confirmed yet
  archived?: boolean;         // removed from this device on purpose, keep in cloud
}

export interface CloudIndexRow {
  id: string;
  version: number;
  updatedAt: number;
  deleted: boolean;
}

export interface CloudDocRow extends CloudIndexRow {
  data: any;
  title: string;
  template: string;
  createdAt: number;
  pinned?: boolean;
}

export interface LocalDoc {
  data: any;
  meta: any;
}

export type CloudSaveResult =
  | { status: 'ok'; version: number }
  | { status: 'conflict'; version: number }
  | { status: 'deleted' }
  | { status: 'auth_required' }
  | { status: 'error'; message: string };

export interface StaleDocInfo {
  kind: DocKind;
  id: string;
  title: string;
  reason: StaleReason;
}

export interface PullSummary {
  ok: boolean;
  updated: number;
  removed: number;
  stale: number;
}
