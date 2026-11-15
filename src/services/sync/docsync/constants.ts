// src/services/sync/docsync/constants.ts
// ============================================
// Adin AI — Document Sync (v2) constants
// ============================================

export type DocKind = 'cv' | 'cl';
export const DOC_KINDS: readonly DocKind[] = ['cv', 'cl'];

// ── Supabase ──
export const CLOUD_TABLE: Record<DocKind, string> = { cv: 'cvs', cl: 'cover_letters' };
export const CLOUD_ID_COLUMN: Record<DocKind, string> = { cv: 'cv_id', cl: 'cl_id' };
export const SAVE_RPC: Record<DocKind, string> = { cv: 'save_cv', cl: 'save_cover_letter' };
export const FETCH_CHUNK_SIZE = 50;

// ── Local storage layout (documents stay in the SAME keys the builders already use) ──
export const LOCAL_DOC_KEY_PREFIX: Record<DocKind, string> = {
  cv: 'adin_cv_document_',
  cl: 'adin_cover_letter_document_',
};
export const LOCAL_INDEX_KEY_PREFIX: Record<DocKind, string> = {
  cv: 'adin_cv_documents_index_',
  cl: 'adin_cover_letter_documents_index_',
};
export const SYNC_STATE_KEY_PREFIX = 'adin_docsync_state_';

// ── Versioning ──
export const NEW_DOC_BASE_VERSION = 0;

// UI-only / noisy fields: a change in these alone is NOT a content change (no upload)
export const VOLATILE_DATA_KEYS: ReadonlySet<string> = new Set(['lastUpdated', 'openSections']);

// ── Defaults ──
export const DEFAULT_TITLE: Record<DocKind, string> = { cv: 'Untitled CV', cl: 'Untitled Cover Letter' };
export const DEFAULT_TEMPLATE: Record<DocKind, string> = { cv: 'modern', cl: 'classic' };
export const COVER_LETTER_META_KIND = 'cover-letter';
export const MIN_REAL_PHOTO_LENGTH = 500;

// ── Timing ──
export const SAVE_DEBOUNCE_MS = 5 * 1000;       // edit ke kitni der baad cloud save
export const MIN_PULL_GAP_MS = 15 * 1000;       // focus / visibility par pull ke beech gap
export const PULL_INTERVAL_MS = 2 * 60 * 1000;  // visible tab par heartbeat pull

// ── Events (UI listens to these) ──
export const EVENT_DOCS_UPDATED = 'adin:docsync-updated';
export const EVENT_DOCS_STALE = 'adin:docsync-stale';
