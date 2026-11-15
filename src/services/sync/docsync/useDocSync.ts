// src/services/sync/docsync/useDocSync.ts
import { useEffect } from 'react';
import { isSyncReady } from '../config';
import { startDocSync } from './syncEngine';

// One call in App.tsx: starts pull-on-open/focus/online + retry of unsaved edits.
export const useDocSync = (userId: string, enabled: boolean): void => {
  useEffect(() => {
    if (!userId || !enabled || !isSyncReady()) return;
    return startDocSync(userId);
  }, [userId, enabled]);
};
