// src/services/sync/syncRestoreService.ts
// ============================================
// Adin AI — Restore Service (thin wrapper over docsync v2)
// ============================================
// The merge / guard / retry logic that used to live here is gone: docsync/syncEngine.ts
// pulls changes with version checks. This file only keeps the old function names working.

import { syncService } from './syncService';
import { pullChanges } from './docsync/syncEngine';
import type { UserProfile, CVRecord, CoverLetterRecord } from './types';

export interface RestoreResult {
  ok: boolean;
  error?: string;
  user: UserProfile | null;
  cvsRestored: number;
  coverLettersRestored: number;
  photosRestored: number;
  cvsRemoved?: number;
  coverLettersRemoved?: number;
  message: string;
}

export const syncRestoreService = {
  async fetchUser(userId: string): Promise<UserProfile | null> {
    return userId ? syncService.fetchUser(userId) : null;
  },
  async fetchUserCVs(userId: string): Promise<CVRecord[]> {
    return userId ? syncService.fetchUserCVs(userId) : [];
  },
  async fetchUserCoverLetters(userId: string): Promise<CoverLetterRecord[]> {
    return userId ? syncService.fetchUserCoverLetters(userId) : [];
  },

  async restoreAll(userId: string): Promise<RestoreResult> {
    const empty = { cvsRestored: 0, coverLettersRestored: 0, photosRestored: 0, cvsRemoved: 0, coverLettersRemoved: 0 };
    if (!userId) return { ok: false, error: 'invalid_id', user: null, ...empty, message: 'Invalid User ID' };
    if (!syncService.isReady()) return { ok: false, error: 'sync_disabled', user: null, ...empty, message: 'Cloud sync is disabled.' };

    const user = await this.fetchUser(userId);
    if (user?.name) {
      try { localStorage.setItem('adin_user_name', String(user.name)); } catch { /* ignore */ }
    }
    const summary = await pullChanges(userId);
    return {
      ok: summary.ok,
      error: summary.ok ? undefined : 'network',
      user,
      ...empty,
      cvsRestored: summary.updated,
      cvsRemoved: summary.removed,
      message: summary.ok
        ? `Synced: ${summary.updated} updated, ${summary.removed} removed, ${summary.stale} need your decision.`
        : 'Cloud not reachable.',
    };
  },
};
