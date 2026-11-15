// src/services/sync/adapters/supabaseAdapter.ts
import { supabase, getCurrentUserId } from '../supabaseClient';
import { setCloudVersion } from '../cloudIndex';
import type { CloudDocTable } from '../cloudIndex';
import type {
  SyncAdapter,
  SyncResult,
  UserProfile,
  CVRecord,
  CVMeta,
  CoverLetterRecord,
  CLMeta,
  GetUserStatus,
  CheckAccountResult,
  VerifyPinResult,
} from '../types';

// Upload ke baad cloud ka ASAL stored updated_at yaad rakho (DB trigger ho to bhi sahi),
// taake apna hi upload agle sync me "naya cloud data" samajh kar wapas pull na ho.
const rememberStoredVersion = (
  uid: string,
  table: CloudDocTable,
  id: string,
  storedUpdatedAt: string | null | undefined,
  fallbackIso: string,
): void => {
  setCloudVersion(uid, table, id, new Date(storedUpdatedAt || fallbackIso).getTime());
};

const ok = (): SyncResult => ({ ok: true });
const fail = (error: string, message?: string): SyncResult => ({ ok: false, error, message });

export const supabaseAdapter: SyncAdapter = {
  // ── User ──
  async upsertUser(profile: UserProfile): Promise<SyncResult> {
    try {
      const uid = await getCurrentUserId();
      if (!uid) return fail('auth_required', 'Please sign in.');
      const { error } = await supabase.from('profiles').upsert({
        id: uid,
        email: '', // Trigger handles this, but keeping it safe
        name: profile.name,
        gender: profile.gender || '',
        country: profile.country || '',
        dob: profile.dob || '',
        consent_cloud_sync: profile.consentCloudSync,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) return fail('db_error', error.message);
      return ok();
    } catch (e: any) {
      return fail('network', e?.message);
    }
  },

  async deleteUser(_userId: string): Promise<SyncResult> {
    try {
      const uid = await getCurrentUserId();
      if (!uid) return fail('auth_required');
      const { error } = await supabase.from('profiles').delete().eq('id', uid);
      if (error) return fail('db_error', error.message);
      return ok();
    } catch (e: any) {
      return fail('network', e?.message);
    }
  },

  async getUser(_userId: string): Promise<UserProfile | null> {
    try {
      const uid = await getCurrentUserId();
      if (!uid) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
      if (error || !data) return null;
      return {
        userId: data.id,
        name: data.name || '',
        gender: data.gender || '',
        country: data.country || '',
        dob: data.dob || '',
        consentCloudSync: data.consent_cloud_sync,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
      };
    } catch {
      return null;
    }
  },

  async getUserWithStatus(_userId: string): Promise<GetUserStatus> {
    const user = await this.getUser(_userId);
    if (!user) return { ok: false, user: null, error: 'not_found' };
    return { ok: true, user };
  },

  // Legacy PIN methods (not needed for Supabase, but keeping interface happy)
  async checkAccount(_userId: string): Promise<CheckAccountResult> {
    const user = await this.getUser(_userId);
    return { ok: true, status: user ? 'has_pin' : 'not_found' };
  },
  async login(_userId: string, _pin: string): Promise<SyncResult> { return fail('not_supported'); },
  async verifyPin(_userId: string, _pin: string): Promise<VerifyPinResult> { return { ok: false, error: 'not_supported' }; },
  async setPin(_userId: string, _pin: string, _name?: string): Promise<SyncResult> { return fail('not_supported'); },

  // ── CVs ──
  async upsertCV(cv: CVRecord): Promise<SyncResult> {
    try {
      const uid = await getCurrentUserId();
      if (!uid) return fail('auth_required');
      const data = typeof cv.data === 'string' ? JSON.parse(cv.data) : cv.data;
      const nowIso = new Date().toISOString();
      const { data: saved, error } = await supabase.from('cvs').upsert({
        user_id: uid,
        cv_id: cv.cvId,
        data: data || {},
        title: cv.title,
        template: cv.template,
        created_at: cv.createdAt ? new Date(cv.createdAt).toISOString() : nowIso,
        updated_at: nowIso,
      }, { onConflict: 'user_id,cv_id' }).select('updated_at').maybeSingle();
      if (error) return fail('db_error', error.message);
      rememberStoredVersion(uid, 'cvs', cv.cvId, saved?.updated_at, nowIso);
      return ok();
    } catch (e: any) {
      return fail('network', e?.message);
    }
  },

  async deleteCV(_userId: string, cvId: string): Promise<SyncResult> {
    try {
      const uid = await getCurrentUserId();
      if (!uid) return fail('auth_required');
      // ✅ SOFT DELETE: row ko hatane ki bajaye "deleted" ka nishan lagao taake doosre devices ko
      //    saaf pata chale ke ye delete hua hai (andaza nahi lagana parta). Data khali kar dete hain.
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('cvs')
        .update({ deleted_at: now, data: {}, updated_at: now })
        .eq('user_id', uid)
        .eq('cv_id', cvId);
      if (error) {
        // Migration (deleted_at column) abhi nahi chali → purana hard delete
        if (/deleted_at/i.test(error.message)) {
          const hard = await supabase.from('cvs').delete().eq('user_id', uid).eq('cv_id', cvId);
          if (hard.error) return fail('db_error', hard.error.message);
          return ok();
        }
        return fail('db_error', error.message);
      }
      return ok();
    } catch (e: any) {
      return fail('network', e?.message);
    }
  },

  async updateCVMeta(_userId: string, cvId: string, meta: CVMeta): Promise<SyncResult> {
    try {
      const uid = await getCurrentUserId();
      if (!uid) return fail('auth_required');
      const nowIso = new Date().toISOString();
      const patch: any = { updated_at: nowIso };
      if (meta.title !== undefined) patch.title = meta.title;
      if (meta.template !== undefined) patch.template = meta.template;
      if (meta.pinned !== undefined) patch.pinned = meta.pinned;
      if (meta.lastExportedAt !== undefined) patch.last_exported_at = meta.lastExportedAt;
      const { data: saved, error } = await supabase
        .from('cvs')
        .update(patch)
        .eq('user_id', uid)
        .eq('cv_id', cvId)
        .select('updated_at')
        .maybeSingle();
      if (error) return fail('db_error', error.message);
      rememberStoredVersion(uid, 'cvs', cvId, saved?.updated_at, nowIso);
      return ok();
    } catch (e: any) {
      return fail('network', e?.message);
    }
  },

  async getUserCVs(_userId: string): Promise<CVRecord[]> {
    try {
      const uid = await getCurrentUserId();
      if (!uid) return [];
      let res = await supabase.from('cvs').select('*').eq('user_id', uid).is('deleted_at', null);
      if (res.error && /deleted_at/i.test(res.error.message)) {
        res = await supabase.from('cvs').select('*').eq('user_id', uid); // migration abhi nahi chali
      }
      const { data, error } = res;
      if (error || !data) return [];
      return data.map((r) => ({
        userId: r.user_id,
        cvId: r.cv_id,
        data: r.data,
        title: r.title,
        template: r.template,
        createdAt: new Date(r.created_at).getTime(),
        updatedAt: new Date(r.updated_at).getTime(),
      }));
    } catch {
      return [];
    }
  },

  // ── Cover Letters ──
  async upsertCoverLetter(cl: CoverLetterRecord): Promise<SyncResult> {
    try {
      const uid = await getCurrentUserId();
      if (!uid) return fail('auth_required');
      const data = typeof cl.data === 'string' ? JSON.parse(cl.data) : cl.data;
      const nowIso = new Date().toISOString();
      const { data: saved, error } = await supabase.from('cover_letters').upsert({
        user_id: uid,
        cl_id: cl.clId,
        data: data || {},
        title: cl.title,
        template: cl.template,
        created_at: cl.createdAt ? new Date(cl.createdAt).toISOString() : nowIso,
        updated_at: nowIso,
      }, { onConflict: 'user_id,cl_id' }).select('updated_at').maybeSingle();
      if (error) return fail('db_error', error.message);
      rememberStoredVersion(uid, 'cover_letters', cl.clId, saved?.updated_at, nowIso);
      return ok();
    } catch (e: any) {
      return fail('network', e?.message);
    }
  },

  async deleteCoverLetter(_userId: string, clId: string): Promise<SyncResult> {
    try {
      const uid = await getCurrentUserId();
      if (!uid) return fail('auth_required');
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('cover_letters')
        .update({ deleted_at: now, data: {}, updated_at: now })
        .eq('user_id', uid)
        .eq('cl_id', clId);
      if (error) {
        if (/deleted_at/i.test(error.message)) {
          const hard = await supabase.from('cover_letters').delete().eq('user_id', uid).eq('cl_id', clId);
          if (hard.error) return fail('db_error', hard.error.message);
          return ok();
        }
        return fail('db_error', error.message);
      }
      return ok();
    } catch (e: any) {
      return fail('network', e?.message);
    }
  },

  async updateCoverLetterMeta(_userId: string, clId: string, meta: CLMeta): Promise<SyncResult> {
    try {
      const uid = await getCurrentUserId();
      if (!uid) return fail('auth_required');
      const nowIso = new Date().toISOString();
      const patch: any = { updated_at: nowIso };
      if (meta.title !== undefined) patch.title = meta.title;
      if (meta.template !== undefined) patch.template = meta.template;
      if (meta.pinned !== undefined) patch.pinned = meta.pinned;
      if (meta.lastExportedAt !== undefined) patch.last_exported_at = meta.lastExportedAt;
      const { data: saved, error } = await supabase
        .from('cover_letters')
        .update(patch)
        .eq('user_id', uid)
        .eq('cl_id', clId)
        .select('updated_at')
        .maybeSingle();
      if (error) return fail('db_error', error.message);
      rememberStoredVersion(uid, 'cover_letters', clId, saved?.updated_at, nowIso);
      return ok();
    } catch (e: any) {
      return fail('network', e?.message);
    }
  },

  async getUserCoverLetters(_userId: string): Promise<CoverLetterRecord[]> {
    try {
      const uid = await getCurrentUserId();
      if (!uid) return [];
      let res = await supabase.from('cover_letters').select('*').eq('user_id', uid).is('deleted_at', null);
      if (res.error && /deleted_at/i.test(res.error.message)) {
        res = await supabase.from('cover_letters').select('*').eq('user_id', uid);
      }
      const { data, error } = res;
      if (error || !data) return [];
      return data.map((r) => ({
        userId: r.user_id,
        clId: r.cl_id,
        data: r.data,
        title: r.title,
        template: r.template,
        createdAt: new Date(r.created_at).getTime(),
        updatedAt: new Date(r.updated_at).getTime(),
      }));
    } catch {
      return [];
    }
  },
};