// src/services/sync/types.ts
// ============================================
// Adin AI — Sync Types (Stable Contract)
// ============================================
// ✅ `gender`, `country`, `dob` optional (Onboarding only collects name)
// ✅ SECURE: PIN is verified on the server — adapter sends the raw PIN over HTTPS,
//    never a hash. `pinHash` is kept only as a truthy "PIN is set" flag for old callers.
// ✅ NEW: `login`, `checkAccount`, `setPin` on SyncAdapter
// ✅ `verifyPin(userId, pin)` is now a server-side check (step-up for delete)

export interface SyncResult {
  ok: boolean;
  error?: string;
  message?: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  gender?: string;        // Optional (filled later in CV Builder)
  country?: string;       // Optional (filled later in CV Builder)
  dob?: string;           // Optional (filled later in CV Builder)
  /** @deprecated Real hash never leaves the server. Truthy only means "PIN is set". */
  pinHash?: string;
  hasPin?: boolean;
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

// Result of a status-aware user lookup
export interface GetUserStatus {
  ok: boolean;                 // true = server answered and user exists
  user: UserProfile | null;    // user profile when ok
  error?: string;              // 'not_found' | 'network' | 'invalid_secret' | 'rate_limited' | ...
  message?: string;
}

export type AccountStatus = 'not_found' | 'has_pin' | 'no_pin';

// Public (no token needed) account lookup used by the Restore flow
export interface CheckAccountResult {
  ok: boolean;
  status?: AccountStatus;
  error?: string;
  message?: string;
}

export interface VerifyPinResult {
  ok: boolean;
  verified?: boolean;
  error?: string;
  message?: string;
}

export interface SyncAdapter {
  upsertUser(profile: UserProfile): Promise<SyncResult>;
  deleteUser(userId: string): Promise<SyncResult>;
  getUser(userId: string): Promise<UserProfile | null>;

  // Like getUser, but tells you WHY it failed (needs auth token)
  getUserWithStatus(userId: string): Promise<GetUserStatus>;

  // Public: does this ID exist, and does it have a PIN?
  checkAccount(userId: string): Promise<CheckAccountResult>;

  // Server-side PIN login → server returns a token (stored automatically)
  login(userId: string, pin: string): Promise<SyncResult>;

  // Server-side PIN check (also arms a short "step-up" window for account deletion)
  verifyPin(userId: string, pin: string): Promise<VerifyPinResult>;

  // Server validates + hashes the PIN. Creates the account if it does not exist yet.
  setPin(userId: string, pin: string, name?: string): Promise<SyncResult>;

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
