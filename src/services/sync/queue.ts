// src/services/sync/queue.ts
// ============================================
// Adin AI — Sync Queue (Retry Mechanism)
// ============================================
// Agar Sheet call fail ho jaaye (network issue, quota, etc.),
// item queue me chala jata hai.
// Har queue item ko exponential backoff ke saath retry kiya jata hai.
// 3 attempts ke baad → dead-letter (drop).
// Max 50 items — usse zyada ho to purane dead-letters drop.

import { SYNC_CONFIG } from './config';
import type { QueueItem, QueueItemType } from './types';

// A newer snapshot of the same CV / cover letter makes older queued snapshots useless,
// so only the latest one is kept (prevents dozens of big duplicate payloads).
const SUPERSEDABLE_TYPES: QueueItemType[] = ['cv', 'cl'];

function isSameDocument(item: QueueItem, type: QueueItemType, payload: any): boolean {
  if (item.type !== type) return false;
  if (item.payload?.userId !== payload?.userId) return false;
  return type === 'cv'
    ? item.payload?.cvId === payload?.cvId
    : item.payload?.clId === payload?.clId;
}

// ============================================
// Queue storage (localStorage)
// ============================================
function loadQueue(): QueueItem[] {
  try {
    const raw = localStorage.getItem(SYNC_CONFIG.queueStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.warn('[sync/queue] Failed to load queue:', e);
    return [];
  }
}

function saveQueue(items: QueueItem[]): void {
  try {
    // Cap at maxQueueSize — drop oldest dead-letters first
    let capped = items;
    if (capped.length > SYNC_CONFIG.maxQueueSize) {
      // Sort so that oldest items fall off
      const sorted = [...capped].sort((a, b) => a.createdAt - b.createdAt);
      capped = sorted.slice(-SYNC_CONFIG.maxQueueSize);
    }
    localStorage.setItem(SYNC_CONFIG.queueStorageKey, JSON.stringify(capped));
  } catch (e) {
    console.warn('[sync/queue] Failed to save queue:', e);
  }
}

// ============================================
// Public API
// ============================================
export const syncQueue = {
  // Add item to queue
  enqueue(type: QueueItemType, payload: any, error?: string): QueueItem {
    const item: QueueItem = {
      id: `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      payload,
      attempts: 0,
      nextRetryAt: Date.now(),   // try immediately on next flush
      createdAt: Date.now(),
      lastError: error,
    };
    let q = loadQueue();
    if (SUPERSEDABLE_TYPES.includes(type)) {
      q = q.filter((existing) => !isSameDocument(existing, type, payload));
    }
    q.push(item);
    saveQueue(q);
    if (SYNC_CONFIG.debug) {
      console.log('[sync/queue] Enqueued:', item.id, type, error ? `(error: ${error})` : '');
    }
    return item;
  },

  // Get all items
  all(): QueueItem[] {
    return loadQueue();
  },

  // Get items that are ready to be retried now
  ready(): QueueItem[] {
    const now = Date.now();
    return loadQueue().filter(item => item.nextRetryAt <= now);
  },

  // Item was successful → remove from queue
  remove(id: string): void {
    const q = loadQueue().filter(item => item.id !== id);
    saveQueue(q);
  },

  // Item failed → update attempts + next retry time
  markFailed(id: string, error: string): void {
    const q = loadQueue();
    const item = q.find(i => i.id === id);
    if (!item) return;

    item.attempts += 1;
    item.lastError = error;

    const backoffIndex = Math.min(item.attempts, SYNC_CONFIG.backoffDelays.length - 1);
    item.nextRetryAt = Date.now() + SYNC_CONFIG.backoffDelays[backoffIndex];

    saveQueue(q);

    if (SYNC_CONFIG.debug) {
      console.warn(
        `[sync/queue] Item ${id} failed (attempt ${item.attempts}/${SYNC_CONFIG.maxRetries}): ${error}. Next retry in ${Math.round(SYNC_CONFIG.backoffDelays[backoffIndex] / 1000)}s`
      );
    }
  },

  // Count items that are dead-lettered (attempts >= maxRetries)
  deadLetterCount(): number {
    return loadQueue().filter(item => item.attempts >= SYNC_CONFIG.maxRetries).length;
  },

  // Size of queue
  size(): number {
    return loadQueue().length;
  },

  // Clear entire queue (used on logout, etc.)
  clear(): void {
    try {
      localStorage.removeItem(SYNC_CONFIG.queueStorageKey);
    } catch (e) {
      console.warn('[sync/queue] Failed to clear queue:', e);
    }
  },
};