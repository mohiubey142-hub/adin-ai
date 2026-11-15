// src/components/sync/DocSyncBanner.tsx
// Shown only when a document changed on another device and this device has to decide.
// Nothing is ever overwritten silently — the user picks.
import { useCallback, useEffect, useState } from 'react';
import { getCurrentUserId } from '../../services/sync/supabaseClient';
import { getStaleDocs, resolveUseCloud, resolveKeepMine, isActiveDoc } from '../../services/sync/docsync/syncEngine';
import { EVENT_DOCS_STALE, EVENT_DOCS_UPDATED } from '../../services/sync/docsync/constants';
import type { StaleDocInfo, StaleReason } from '../../services/sync/docsync/types';

const BANNER_Z_INDEX = 999998;

const COPY: Record<StaleReason, { text: string; useCloud: string; keepMine: string }> = {
  'remote-update': {
    text: 'was updated on another device.',
    useCloud: 'Load latest',
    keepMine: 'Keep this version',
  },
  conflict: {
    text: 'was changed on another device and also here.',
    useCloud: 'Use other device',
    keepMine: 'Keep this version',
  },
  'remote-deleted': {
    text: 'was deleted on another device.',
    useCloud: 'Delete here too',
    keepMine: 'Keep & restore',
  },
};

export const DocSyncBanner = () => {
  const [doc, setDoc] = useState<StaleDocInfo | null>(null);
  const [userId, setUserId] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const uid = userId || (await getCurrentUserId()) || '';
    if (uid && uid !== userId) setUserId(uid);
    setDoc(uid ? getStaleDocs(uid)[0] ?? null : null);
  }, [userId]);

  useEffect(() => {
    void refresh();
    const onChange = () => { void refresh(); };
    window.addEventListener(EVENT_DOCS_STALE, onChange);
    window.addEventListener(EVENT_DOCS_UPDATED, onChange);
    return () => {
      window.removeEventListener(EVENT_DOCS_STALE, onChange);
      window.removeEventListener(EVENT_DOCS_UPDATED, onChange);
    };
  }, [refresh]);

  if (!doc || !userId) return null;
  const copy = COPY[doc.reason];

  const act = async (useCloud: boolean) => {
    setBusy(true);
    try {
      const wasOpen = isActiveDoc(doc.kind, doc.id);
      const ok = useCloud
        ? await resolveUseCloud(doc.kind, userId, doc.id)
        : await resolveKeepMine(doc.kind, userId, doc.id);
      if (ok && useCloud && wasOpen) window.location.reload();   // open editor must re-read the document
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="alert"
      style={{ zIndex: BANNER_Z_INDEX }}
      className="fixed bottom-4 left-1/2 w-[92%] max-w-xl -translate-x-1/2 rounded-xl border border-purple-300 bg-white p-4 text-sm text-slate-900 shadow-xl dark:border-purple-500/40 dark:bg-slate-800 dark:text-slate-100"
    >
      <p className="mb-3">
        <strong>“{doc.title}”</strong> {copy.text}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void act(true)}
          className="rounded-lg bg-purple-600 px-3 py-1.5 font-medium text-white disabled:opacity-60"
        >
          {copy.useCloud}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void act(false)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium disabled:opacity-60 dark:border-slate-600"
        >
          {copy.keepMine}
        </button>
      </div>
    </div>
  );
};

export default DocSyncBanner;
