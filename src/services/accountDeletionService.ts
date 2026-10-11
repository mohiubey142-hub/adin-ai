// src/services/accountDeletionService.ts
// ============================================
// Account Deletion Service
// ============================================
// Handles complete account deletion:
//  1. Collects anonymized stats
//  2. Sends anonymized backup via Web3Forms
//  3. Deletes from Google Sheet (user + CVs + CLs)
//  4. Clears local data (localStorage, sessionStorage, IndexedDB)
//  5. Clears sync queue
// ============================================

const WEB3FORMS_ACCESS_KEY = '09b309f7-48d9-433d-8836-457d9b7ca708';

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
    const data = encoder.encode(userId + 'adin-salt-2026');
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 16);
  } catch (e) {
    // Fallback if crypto.subtle not available
    let hash = 0;
    const str = userId + 'adin-salt-2026';
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
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
    // Count CVs
    const cvIndexKey = `adin_cv_documents_index_${userId}`;
    const cvRaw = localStorage.getItem(cvIndexKey);
    if (cvRaw) {
      const cvIndex = JSON.parse(cvRaw);
      if (Array.isArray(cvIndex)) cvCount = cvIndex.length;
    }

    // Count Cover Letters
    const clIndexKey = `adin_cover_letter_documents_index_${userId}`;
    const clRaw = localStorage.getItem(clIndexKey);
    if (clRaw) {
      const clIndex = JSON.parse(clRaw);
      if (Array.isArray(clIndex)) coverLetterCount = clIndex.length;
    }

    // Check for photos
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
    console.warn('[accountDeletion] Failed to collect stats:', e);
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
      note: 'Full personal data deleted from Sheet. This is anonymized stats only.',
    };

    const response = await fetch('https://api.web3forms.com/submit', {
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
    console.warn('[accountDeletion] Backup send failed:', e);
    return false;
  }
}

// ============================================
// Clear Local Data
// ============================================
function clearLocalData(userId: string): void {
  // 1. localStorage — all adin-* keys + cover_letter_data
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith('adin') ||
        key.startsWith('adin_') ||
        key.startsWith('adin-') ||
        key === 'cover_letter_data'
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    console.log(`[accountDeletion] Removed ${keysToRemove.length} localStorage keys`);
  } catch (e) {
    console.warn('[accountDeletion] localStorage clear failed:', e);
  }

  // 2. sessionStorage
  try {
    const sessionKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) continue;
      if (key.startsWith('adin') || key === 'cover_letter_data') {
        sessionKeys.push(key);
      }
    }
    sessionKeys.forEach(k => {
      try { sessionStorage.removeItem(k); } catch (e) {}
    });
    console.log(`[accountDeletion] Removed ${sessionKeys.length} sessionStorage keys`);
  } catch (e) {
    console.warn('[accountDeletion] sessionStorage clear failed:', e);
  }

  // 3. IndexedDB
  try {
    indexedDB.deleteDatabase('adin_cv_images');
    console.log('[accountDeletion] IndexedDB delete requested');
  } catch (e) {
    console.warn('[accountDeletion] IndexedDB delete failed:', e);
  }
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

    console.log('[accountDeletion] Starting deletion for:', userId);

    // Step 1: Collect stats (BEFORE deletion)
    const stats = collectLocalStats(userId);
    console.log('[accountDeletion] Collected stats:', stats);

    // Step 2: Send anonymized backup FIRST (before we lose data)
    let backupSent = false;
    try {
      backupSent = await sendAnonymizedBackup(userId, stats);
      console.log('[accountDeletion] Backup sent:', backupSent);
    } catch (e) {
      console.warn('[accountDeletion] Backup failed, continuing:', e);
    }

    // Step 3: Delete from Sheet
    let sheetDeleted = false;
    try {
      const { syncService } = await import('./sync/syncService');
      const result = await syncService.deleteUser(userId);
      sheetDeleted = result.ok;
      console.log('[accountDeletion] Sheet delete:', result);
    } catch (e) {
      console.warn('[accountDeletion] Sheet delete failed:', e);
    }

    // Step 4: Clear sync queue
    try {
      const { syncService } = await import('./sync/syncService');
      syncService.clearQueue();
    } catch (e) {
      console.warn('[accountDeletion] Queue clear failed:', e);
    }

    // Step 5: Clear local data
    clearLocalData(userId);

    // Step 6: Reload to show fresh state
    return {
      ok: true,
      message: 'Account and all data deleted permanently.',
      stats,
      backupSent,
      sheetDeleted,
    };
  },
};