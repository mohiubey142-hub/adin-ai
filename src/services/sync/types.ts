// src/services/sync/types.ts
// ============================================
// Adin AI — Sync Types (Stable Contract)
// ============================================
// ✅ NEW: `gender`, `country`, `dob` now optional (Onboarding only collects name)
// ✅ NEW: `pinHash` field added to UserProfile
// ✅ NEW: `verifyPin` method added to SyncAdapter
// ✅ NEW: `getUserWithStatus` — distinguishes "not_found" from network/secret/rate-limit errors

export interface SyncResult {
  ok: boolean;
  error?: string;
  message?: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  gender?: string;        // ✅ Optional (filled later in CV Builder)
  country?: string;       // ✅ Optional (filled later in CV Builder)
  dob?: string;           // ✅ Optional (filled later in CV Builder)
  pinHash?: string;
  consentCloudSync: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CVRecord {
  userId: string;
  cvId: string;
  data: any;
  title: string;
  template: string;
  createdAt: number;
  updatedAt: number;
}

export interface CVMeta {
  title?: string;
  template?: string;
  pinned?: boolean;
  lastExportedAt?: number;
  archived?: boolean;
}

export interface CoverLetterRecord {
  userId: string;
  clId: string;
  data: any;
  title: string;
  template: string;
  createdAt: number;
  updatedAt: number;
}

export interface CLMeta {
  title?: string;
  template?: string;
  pinned?: boolean;
  lastExportedAt?: number;
  archived?: boolean;
}

// ✅ NEW: result of a status-aware user lookup
export interface GetUserStatus {
  ok: boolean;                 // true = server answered and user exists
  user: UserProfile | null;    // user profile when ok
  error?: string;              // 'not_found' | 'network' | 'invalid_secret' | 'rate_limited' | ...
  message?: string;
}

export interface SyncAdapter {
  upsertUser(profile: UserProfile): Promise<SyncResult>;
  deleteUser(userId: string): Promise<SyncResult>;
  getUser(userId: string): Promise<UserProfile | null>;

  // ✅ NEW: like getUser, but tells you WHY it failed
  getUserWithStatus(userId: string): Promise<GetUserStatus>;

  // ✅ NEW: PIN verification
  verifyPin(userId: string, pinHash: string): Promise<{ ok: boolean; verified?: boolean; error?: string }>;

  upsertCV(cv: CVRecord): Promise<SyncResult>;
  deleteCV(userId: string, cvId: string): Promise<SyncResult>;
  updateCVMeta(userId: string, cvId: string, meta: CVMeta): Promise<SyncResult>;
  getUserCVs(userId: string): Promise<CVRecord[]>;

  upsertCoverLetter(cl: CoverLetterRecord): Promise<SyncResult>;
  deleteCoverLetter(userId: string, clId: string): Promise<SyncResult>;
  updateCoverLetterMeta(userId: string, clId: string, meta: CLMeta): Promise<SyncResult>;
  getUserCoverLetters(userId: string): Promise<CoverLetterRecord[]>;
}

export type QueueItemType =
  | 'user' | 'delete_user'
  | 'cv' | 'delete_cv' | 'cv_meta'
  | 'cl' | 'delete_cl' | 'cl_meta';

export interface QueueItem {
  id: string;
  type: QueueItemType;
  payload: any;
  attempts: number;
  nextRetryAt: number;
  createdAt: number;
  lastError?: string;
}
