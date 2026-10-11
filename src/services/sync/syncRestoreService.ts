// src/services/sync/syncRestoreService.ts
// ============================================
// Adin AI — Restore Service (Sheet → localStorage)
// ============================================
// ✅ NEW: Accepts all 3 ID formats (8-char, 8-char-hyphen, 16-char)

import { syncService } from './syncService';
import { saveImageToIDB, getPhotoKey } from '../../components/cv-builder/utils/imageUtils';
import type { UserProfile, CVRecord, CoverLetterRecord } from './types';

// ✅ Single source of truth for ID validation
const ID_REGEX = /^ADN-[A-Z0-9]{8}$|^ADN-[A-Z0-9]{4}-[A-Z0-9]{4}$|^ADN-[A-Z0-9]{16}$/;

export interface RestoreResult {
  ok: boolean;
  error?: string;
  user: UserProfile | null;
  cvsRestored: number;
  coverLettersRestored: number;
  photosRestored: number;
  message: string;
}

const hasMeaningfulCvContent = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  const pi = data.personalInfo || {};
  if (pi.name?.trim()) return true;
  if (pi.email?.trim()) return true;
  if (pi.title?.trim()) return true;
  if (pi.address?.trim()) return true;
  if (data.professionalSummary?.trim()) return true;
  if (data.skills?.trim()) return true;
  if (Array.isArray(data.experiences) && data.experiences.some((e: any) => e?.title?.trim() || e?.company?.trim())) return true;
  if (Array.isArray(data.educations) && data.educations.some((e: any) => e?.degree?.trim() || e?.institution?.trim())) return true;
  if (Array.isArray(data.projects) && data.projects.some((p: any) => p?.name?.trim())) return true;
  return false;
};

const hasMeaningfulClContent = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  if (data.userName?.trim()) return true;
  if (data.email?.trim()) return true;
  if (data.jobTitle?.trim()) return true;
  if (data.company?.trim()) return true;
  if (data.generatedLetter?.trim()) return true;
  return false;
};

export const syncRestoreService = {
  async fetchUser(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
    try {
      const raw = await syncService.fetchUser(userId);
      if (!raw) return null;
      return raw;
    } catch (e) {
      console.error('[restore] fetchUser failed:', e);
      return null;
    }
  },

  async fetchUserCVs(userId: string): Promise<CVRecord[]> {
    if (!userId) return [];
    try {
      const raw = await syncService.fetchUserCVs(userId);
      const list = Array.isArray(raw) ? raw : [];
      return list;
    } catch (e) {
      console.error('[restore] fetchUserCVs failed:', e);
      return [];
    }
  },

  async fetchUserCoverLetters(userId: string): Promise<CoverLetterRecord[]> {
    if (!userId) return [];
    try {
      const raw = await syncService.fetchUserCoverLetters(userId);
      const list = Array.isArray(raw) ? raw : [];
      return list;
    } catch (e) {
      console.error('[restore] fetchUserCoverLetters failed:', e);
      return [];
    }
  },

  async restoreAll(userId: string): Promise<RestoreResult> {
    const cleanId = userId.trim().toUpperCase();

    // ✅ Accepts all 3 formats
    if (!ID_REGEX.test(cleanId)) {
      return {
        ok: false,
        error: 'invalid_format',
        user: null,
        cvsRestored: 0,
        coverLettersRestored: 0,
        photosRestored: 0,
        message: 'Invalid User ID format',
      };
    }

    try {
      const [user, cvs, coverLetters] = await Promise.all([
        this.fetchUser(cleanId),
        this.fetchUserCVs(cleanId),
        this.fetchUserCoverLetters(cleanId),
      ]);

      if (!user && cvs.length === 0 && coverLetters.length === 0) {
        return {
          ok: false,
          error: 'not_found',
          user: null,
          cvsRestored: 0,
          coverLettersRestored: 0,
          photosRestored: 0,
          message: 'No data found for this User ID.',
        };
      }

      const result = await this.mergeIntoLocal(cleanId, user, cvs, coverLetters);

      return {
        ok: true,
        user,
        cvsRestored: result.cvsRestored,
        coverLettersRestored: result.coverLettersRestored,
        photosRestored: result.photosRestored,
        message: `Restored ${result.cvsRestored} CV(s) and ${result.coverLettersRestored} Cover Letter(s).`,
      };
    } catch (e: any) {
      console.error('[restore] restoreAll failed:', e);
      return {
        ok: false,
        error: 'network',
        user: null,
        cvsRestored: 0,
        coverLettersRestored: 0,
        photosRestored: 0,
        message: e?.message || 'Network error. Please try again.',
      };
    }
  },

  async mergeIntoLocal(
    userId: string,
    user: UserProfile | null,
    cvs: CVRecord[],
    coverLetters: CoverLetterRecord[],
  ): Promise<{ cvsRestored: number; coverLettersRestored: number; photosRestored: number }> {
    // 1. Store User ID
    try {
      localStorage.setItem('adin-user-id', userId);
      if (user?.name) {
        localStorage.setItem('adin_user_name', String(user.name));
      }
      localStorage.setItem('adin-onboarding-completed', 'true');
      localStorage.setItem(
        'adin-guest-session',
        JSON.stringify({ isGuest: true, guestCreatedAt: new Date().toISOString() }),
      );
    } catch (e) {
      console.error('[restore] failed to save user identity:', e);
    }

    // 2. Read current CV index
    const cvsIndexKey = `adin_cv_documents_index_${userId}`;
    const existingCvsIndex: any[] = (() => {
      try {
        const raw = localStorage.getItem(cvsIndexKey);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();
    const existingCvIds = new Set(existingCvsIndex.map((m: any) => m?.id).filter(Boolean));

    let cvsRestored = 0;

    // 3. Merge CVs
    for (const cv of cvs) {
      const cvId = cv.cvId;
      if (!cvId) continue;

      const docKey = `adin_cv_document_${userId}_${cvId}`;
      let localHasMeaningful = false;

      if (existingCvIds.has(cvId)) {
        try {
          const localRaw = localStorage.getItem(docKey);
          if (localRaw) {
            const localData = JSON.parse(localRaw);
            localHasMeaningful = hasMeaningfulCvContent(localData);
          }
        } catch {
          localHasMeaningful = false;
        }

        if (localHasMeaningful) continue;
      }

      try {
        let cvData: any = cv.data;
        if (typeof cvData === 'string') {
          try {
            cvData = JSON.parse(cvData);
          } catch (e) {
            cvData = {};
          }
        }
        if (!cvData || typeof cvData !== 'object') cvData = {};

        let hasPhoto = false;
        if (cvData.personalInfo?.photo && typeof cvData.personalInfo.photo === 'string') {
          try {
            await saveImageToIDB(getPhotoKey(cvId), cvData.personalInfo.photo);
            hasPhoto = true;
          } catch (e) {}
          cvData.personalInfo.photo = null;
        }

        const payload = JSON.stringify({
          ...cvData,
          hasPhoto: hasPhoto || !!cvData.hasPhoto,
          lastUpdated: Date.now(),
        });
        localStorage.setItem(docKey, payload);

        const metaIndex = existingCvsIndex.findIndex((m: any) => m?.id === cvId);
        const meta = {
          id: cvId,
          title: cv.title || 'Untitled CV',
          jobTitle: cvData?.personalInfo?.title || '',
          template: cv.template || cvData?.template || 'modern',
          lastEdited: cv.updatedAt || Date.now(),
          createdAt: cv.createdAt || Date.now(),
          pinned: metaIndex >= 0 ? !!existingCvsIndex[metaIndex].pinned : false,
        };
        if (metaIndex >= 0) {
          existingCvsIndex[metaIndex] = meta;
        } else {
          existingCvsIndex.push(meta);
        }

        existingCvIds.add(cvId);
        cvsRestored++;
      } catch (e: any) {
        console.error(`[restore] Failed to restore CV ${cvId}:`, e);
      }
    }

    if (cvsRestored > 0) {
      try {
        localStorage.setItem(cvsIndexKey, JSON.stringify(existingCvsIndex));
      } catch (e) {}
    }

    // 4. Read current CL index
    const clsIndexKey = `adin_cover_letter_documents_index_${userId}`;
    const existingClsIndex: any[] = (() => {
      try {
        const raw = localStorage.getItem(clsIndexKey);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();
    const existingClIds = new Set(existingClsIndex.map((m: any) => m?.id).filter(Boolean));

    let coverLettersRestored = 0;

    // 5. Merge Cover Letters
    for (const cl of coverLetters) {
      const clId = cl.clId;
      if (!clId) continue;

      const docKey = `adin_cover_letter_document_${userId}_${clId}`;
      let localHasMeaningful = false;

      if (existingClIds.has(clId)) {
        try {
          const localRaw = localStorage.getItem(docKey);
          if (localRaw) {
            const localData = JSON.parse(localRaw);
            localHasMeaningful = hasMeaningfulClContent(localData);
          }
        } catch {
          localHasMeaningful = false;
        }

        if (localHasMeaningful) continue;
      }

      try {
        let clData: any = cl.data;
        if (typeof clData === 'string') {
          try {
            clData = JSON.parse(clData);
          } catch (e) {
            clData = {};
          }
        }
        if (!clData || typeof clData !== 'object') clData = {};

        let hasPhoto = false;
        if (clData.profilePhoto && typeof clData.profilePhoto === 'string' && clData.profilePhoto.length > 500) {
          try {
            await saveImageToIDB(getPhotoKey(clId), clData.profilePhoto);
            hasPhoto = true;
          } catch (e) {}
          clData.profilePhoto = null;
        }

        const payload = JSON.stringify({
          ...clData,
          hasPhoto: hasPhoto || !!clData.hasPhoto,
          lastUpdated: Date.now(),
        });
        localStorage.setItem(docKey, payload);

        const metaIndex = existingClsIndex.findIndex((m: any) => m?.id === clId);
        const meta = {
          id: clId,
          title: cl.title || 'Untitled Cover Letter',
          jobTitle: clData?.jobTitle || '',
          template: cl.template || clData?.selectedTemplate || 'classic',
          lastEdited: cl.updatedAt || Date.now(),
          createdAt: cl.createdAt || Date.now(),
          pinned: metaIndex >= 0 ? !!existingClsIndex[metaIndex].pinned : false,
          kind: 'cover-letter',
        };
        if (metaIndex >= 0) {
          existingClsIndex[metaIndex] = meta;
        } else {
          existingClsIndex.push(meta);
        }

        existingClIds.add(clId);
        coverLettersRestored++;
      } catch (e: any) {
        console.error(`[restore] Failed to restore CL ${clId}:`, e);
      }
    }

    if (coverLettersRestored > 0) {
      try {
        localStorage.setItem(clsIndexKey, JSON.stringify(existingClsIndex));
      } catch (e) {}
    }

    return {
      cvsRestored,
      coverLettersRestored,
      photosRestored: cvsRestored + coverLettersRestored,
    };
  },

  // ✅ Updated for all 3 formats
  isValidIdFormat(userId: string): boolean {
    return ID_REGEX.test(userId.trim().toUpperCase());
  },
};