// src/services/accountDeletionService.ts
// ============================================
// Account Deletion Service (Supabase + Vercel API)
// ============================================
// 1. Collects anonymized stats
// 2. Calls /api/delete-user (Server-side deletion)
// 3. Sends anonymized log
// 4. Clears local data & queue

import { supabase } from './sync/supabaseClient';

const DEFAULT_WEB3FORMS_ACCESS_KEY = '09b309f7-48d9-433d-8836-457d9b7ca708';
const WEB3FORMS_ACCESS_KEY: string =
  (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined) || DEFAULT_WEB3FORMS_ACCESS_KEY;
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

const USER_ID_HASH_SALT = 'adin-salt-2026';
const HASHED_ID_LENGTH = 16;
const LOCAL_KEY_PREFIXES = ['adin', 'adin_', 'adin-'];
const COVER_LETTER_DRAFT_KEY = 'cover_letter_data';
const IMAGE_DB_NAME = 'adin_cv_images';

const DELETE_FAILED_DEFAULT = 'Could not delete your cloud data. Please try again.';
const DELETE_SUCCESS_MESSAGE = 'Account and all data deleted permanently.';

export interface DeletionStats {
  cvCount: number;
  coverLetterCount: number;
  hadPhoto: boolean;
  totalDocuments: number;
}

// ============================================
// Hash User ID (irreversible)
// ============================================
async function hashUserId(userId: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(userId + USER_ID_HASH_SALT);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, HASHED_ID_LENGTH);
  } catch (e) {
    let hash = 0;
    const str = userId + USER_ID_HASH_SALT;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(HASHED_ID_LENGTH, '0');
  }
}

// ============================================
// Collect Stats
// ============================================
function collectLocalStats(userId: string): DeletionStats {
  let cvCount = 0;
  let coverLetterCount = 0;
  let hadPhoto = false;

  try {
    const cvIndexKey = `adin_cv_documents_index_${userId}`;
    const cvRaw = localStorage.getItem(cvIndexKey);
    if (cvRaw) {
      const cvIndex = JSON.parse(cvRaw);
      if (Array.isArray(cvIndex)) cvCount = cvIndex.length;
    }

    const clIndexKey = `adin_cover_letter_documents_index_${userId}`;
    const clRaw = localStorage.getItem(clIndexKey);
    if (clRaw) {
      const clIndex = JSON.parse(clRaw);
      if (Array.isArray(clIndex)) coverLetterCount = clIndex.length;
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith(`adin_cv_document_${userId}_`) ||
          key.startsWith(`adin_cover_letter_document_${userId}_`)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw);
            if (data?.hasPhoto === true) {
              hadPhoto = true;
              break;
            }
          }
        } catch (e) {}
      }
    }
  } catch (e) {
    console.warn('[accountDeletion] Failed to collect stats');
  }

  return {
    cvCount,
    coverLetterCount,
    hadPhoto,
    totalDocuments: cvCount + coverLetterCount,
  };
}

// ============================================
// Send Anonymized Backup
// ============================================
async function sendAnonymizedBackup(
  userId: string,
  stats: DeletionStats,
): Promise<boolean> {
  try {
    const hashedUserId = await hashUserId(userId);
    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `Adin AI — Account Deletion Log (${new Date().toISOString().split('T')[0]})`,
      from_name: 'Adin AI System',
      event_type: 'account_deletion',
      deleted_at: new Date().toISOString(),
      hashed_user_id: hashedUserId,
      stats_cv_count: stats.cvCount,
      stats_cover_letter_count: stats.coverLetterCount,
      stats_had_photo: stats.hadPhoto,
      stats_total_documents: stats.totalDocuments,
      note: 'Full personal data deleted from database. This is anonymized stats only.',
    };

    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result.success === true;
  } catch (e) {
    console.warn('[accountDeletion] Backup send failed');
    return false;
  }
}

// ============================================
// Clear Local Data
// ============================================
function clearLocalData(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (LOCAL_KEY_PREFIXES.some(prefix => key.startsWith(prefix)) || key === COVER_LETTER_DRAFT_KEY) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  } catch (e) {}

  try {
    const sessionKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) continue;
      if (key.startsWith('adin') || key === COVER_LETTER_DRAFT_KEY) {
        sessionKeys.push(key);
      }
    }
    sessionKeys.forEach(k => {
      try { sessionStorage.removeItem(k); } catch (e) {}
    });
  } catch (e) {}

  try {
    indexedDB.deleteDatabase(IMAGE_DB_NAME);
  } catch (e) {}
}

// ============================================
// Main: Delete Account
// ============================================
export interface DeletionResult {
  ok: boolean;
  message: string;
  stats?: DeletionStats;
  backupSent?: boolean;
  sheetDeleted?: boolean;
}

export const accountDeletionService = {
  async deleteAccount(userId: string): Promise<DeletionResult> {
    if (!userId) {
      return { ok: false, message: 'Invalid user ID' };
    }

    console.log('[accountDeletion] Starting deletion');
    const stats = collectLocalStats(userId);

    // ✅ Step 1: Server API call (permanent auth delete)
    try {
      const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Server deletion failed');
      }
    } catch (e: any) {
      console.warn('[accountDeletion] Cloud delete failed:', e.message);
      return {
        ok: false,
        message: DELETE_FAILED_DEFAULT,
        stats,
        sheetDeleted: false,
      };
    }

    // ✅ Step 2: Anonymized deletion log
    let backupSent = false;
    try {
      backupSent = await sendAnonymizedBackup(userId, stats);
    } catch (e) {}

    // ✅ Step 3: Clear sync queue
    try {
      const { syncService } = await import('./sync/syncService');
      syncService.clearQueue();
    } catch (e) {}

    // ✅ Step 4: Clear local data
    clearLocalData();
    
    // ✅ Step 5: Sign out from Supabase
    try {
      await supabase.auth.signOut();
    } catch (e) {}

    return {
      ok: true,
      message: DELETE_SUCCESS_MESSAGE,
      stats,
      backupSent,
      sheetDeleted: true,
    };
  },
};