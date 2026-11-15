// src/services/sync/syncService.ts
// ============================================
// Adin AI — Sync Service (facade over docsync v2)
// ============================================
// Same method names the app already calls, but all document syncing is now handled by the
// version-checked engine in ./docsync. There is no retry queue any more: the local document
// itself is the "pending change" and the engine compares content hashes.

import { isSyncReady } from './config';
import { supabaseAdapter } from './adapters/supabaseAdapter';
import {
  scheduleSave,
  deleteDoc,
  updateMeta,
  retryPending,
  getPendingCount,
  cancelAllTimers,
} from './docsync/syncEngine';
import { getCurrentUserId } from './supabaseClient';
import type {
  SyncAdapter,
  SyncResult,
  UserProfile,
  CVRecord,
  CVMeta,
  CoverLetterRecord,
  CLMeta,
} from './types';

const adapter: SyncAdapter = supabaseAdapter;

const OK_RESULT: SyncResult = { ok: true };
const SYNC_DISABLED_RESULT: SyncResult = { ok: false, error: 'sync_disabled' };

interface FlushResult {
  processed: number;
  succeeded: number;
  failed: number;
}
const EMPTY_FLUSH: FlushResult = { processed: 0, succeeded: 0, failed: 0 };

const flushPending = async (): Promise<FlushResult> => {
  if (!isSyncReady()) return EMPTY_FLUSH;
  const uid = await getCurrentUserId();
  if (uid) await retryPending(uid);
  return EMPTY_FLUSH;
};

export const syncService = {
  // ── User profile (unchanged) ──
  async syncUser(profile: UserProfile): Promise<SyncResult> {
    if (!isSyncReady()) return SYNC_DISABLED_RESULT;
    return adapter.upsertUser(profile);
  },
  async deleteUser(userId: string): Promise<SyncResult> {
    if (!isSyncReady()) return SYNC_DISABLED_RESULT;
    return adapter.deleteUser(userId);
  },

  // ── CVs (the engine reads the content from local storage itself) ──
  async syncCV(cv: CVRecord): Promise<SyncResult> {
    if (!isSyncReady()) return SYNC_DISABLED_RESULT;
    scheduleSave('cv', cv.userId, cv.cvId);
    return OK_RESULT;
  },
  async deleteCV(userId: string, cvId: string): Promise<SyncResult> {
    if (!isSyncReady()) return SYNC_DISABLED_RESULT;
    await deleteDoc('cv', userId, cvId);
    return OK_RESULT;
  },
  async updateCVMeta(userId: string, cvId: string, meta: CVMeta): Promise<SyncResult> {
    if (!isSyncReady()) return SYNC_DISABLED_RESULT;
    await updateMeta('cv', userId, cvId, { title: meta.title, template: meta.template, pinned: meta.pinned, archived: meta.archived });
    return OK_RESULT;
  },

  // ── Cover letters ──
  async syncCoverLetter(cl: CoverLetterRecord): Promise<SyncResult> {
    if (!isSyncReady()) return SYNC_DISABLED_RESULT;
    scheduleSave('cl', cl.userId, cl.clId);
    return OK_RESULT;
  },
  async deleteCoverLetter(userId: string, clId: string): Promise<SyncResult> {
    if (!isSyncReady()) return SYNC_DISABLED_RESULT;
    await deleteDoc('cl', userId, clId);
    return OK_RESULT;
  },
  async updateCoverLetterMeta(userId: string, clId: string, meta: CLMeta): Promise<SyncResult> {
    if (!isSyncReady()) return SYNC_DISABLED_RESULT;
    await updateMeta('cl', userId, clId, { title: meta.title, template: meta.template, pinned: meta.pinned, archived: meta.archived });
    return OK_RESULT;
  },

  // ── Read helpers kept for existing callers ──
  async fetchUser(userId: string): Promise<UserProfile | null> {
    if (!isSyncReady()) return null;
    try { return await adapter.getUser(userId); } catch { return null; }
  },
  async fetchUserCVs(userId: string): Promise<CVRecord[]> {
    if (!isSyncReady()) return [];
    try { return await adapter.getUserCVs(userId); } catch { return []; }
  },
  async fetchUserCoverLetters(userId: string): Promise<CoverLetterRecord[]> {
    if (!isSyncReady()) return [];
    try { return await adapter.getUserCoverLetters(userId); } catch { return []; }
  },

  // ── Queue-style API kept so callers do not break ──
  flushQueue: flushPending,
  retryQueueNow: flushPending,

  async getQueueStatusAsync() {
    const uid = await getCurrentUserId();
    return { size: uid ? getPendingCount(uid) : 0, deadLetters: 0 };
  },
  getQueueStatus() {
    return { size: 0, deadLetters: 0 };
  },

  // Logout: stop timers only. Unsaved edits stay in the local documents and are picked up after login.
  clearQueue(): void {
    cancelAllTimers();
  },

  isReady: isSyncReady,
};
