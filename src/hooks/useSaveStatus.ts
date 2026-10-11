// src/hooks/useSaveStatus.ts
// ============================================
// Combined Save + Sync Status Hook
// ============================================
// Combines LOCAL save status (from useAutoSave) and
// CLOUD sync status (from syncService queue) into a
// single user-friendly status.
//
// States:
//   'saved'    → everything safe (local + cloud)
//   'saving'   → local save in progress
//   'syncing'  → cloud sync in progress (queue pending)
//   'failed'   → cloud sync failed (dead-letters)
//   'offline'  → no network (local only)
// ============================================

import { useEffect, useState } from 'react';
import { syncService } from '../services/sync/syncService';

export type CombinedSaveStatus =
  | 'saved'
  | 'saving'
  | 'syncing'
  | 'failed'
  | 'offline';

interface UseSaveStatusOptions {
  localSaveStatus: 'saved' | 'saving';
  pollIntervalMs?: number;
}

export function useSaveStatus({
  localSaveStatus,
  pollIntervalMs = 5000,
}: UseSaveStatusOptions): CombinedSaveStatus {
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queueInfo, setQueueInfo] = useState<{
    size: number;
    deadLetters: number;
  }>({ size: 0, deadLetters: 0 });

  // -------- Network online/offline --------
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // -------- Poll sync queue status --------
  useEffect(() => {
    let cancelled = false;

    const check = () => {
      try {
        const status = syncService.getQueueStatus();
        if (!cancelled) {
          setQueueInfo({
            size: status.size,
            deadLetters: status.deadLetters,
          });
        }
      } catch (e) {
        // Silent — syncService may not be ready yet
      }
    };

    check(); // immediate
    const interval = setInterval(check, pollIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pollIntervalMs]);

  // -------- Priority logic --------
  // 1. Offline (highest — user needs to know)
  // 2. Dead-letters (sync failed permanently)
  // 3. Local saving
  // 4. Queue pending (syncing)
  // 5. All saved
  if (!online) return 'offline';
  if (queueInfo.deadLetters > 0) return 'failed';
  if (localSaveStatus === 'saving') return 'saving';
  if (queueInfo.size > 0) return 'syncing';
  return 'saved';
}