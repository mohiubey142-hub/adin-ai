// src/components/cv-builder/hooks/useScrollSync.ts
// ------------------------------------------------------------------
// Bidirectional scroll sync between two scrollable panes (editor <-> preview).
//
// ROOT-CAUSE of the classic "ping-pong" / infinite-loop bug this hook
// exists to prevent: scrolling pane A programmatically scrolls pane B,
// which fires B's own scroll event, which would scroll A again, and so
// on. Fixed here with TWO independent guards:
//   1. A per-pane `isSyncingRef` flag: set true right before we write
//      B's scrollTop, cleared on the next animation frame — so the
//      scroll event B fires in response is ignored, not re-broadcast.
//   2. A tiny epsilon on the target value: if the pane is already
//      within ~1px of where we'd put it, we don't touch it at all —
//      eliminating the last sub-pixel jitter that could otherwise
//      keep re-triggering tiny corrections forever.
//
// Also uses requestAnimationFrame instead of writing on every scroll
// event, so a fast trackpad flick produces one write per frame, not
// hundreds per second.
// ------------------------------------------------------------------

import { useEffect, useRef, type RefObject } from 'react';

interface UseScrollSyncOptions {
    /** Master switch — set false to disable syncing (e.g. while editing on mobile) */
    enabled?: boolean;
    /** How far (in px) a pane must be from the target before we bother writing */
    epsilon?: number;
    /**
     * Optional live "pause" flag. While `pausedRef.current` is true, scroll
     * events from either pane are ignored (and any already-queued sync is
     * dropped). Used by the parent while IT animates the panes (click-to-focus
     * glide) so the sync doesn't drag the other pane a second time.
     * A ref (not state) so it takes effect on the very same frame — no
     * re-render, no effect re-subscription. Omitted → behaves exactly as before.
     */
    pausedRef?: RefObject<boolean>;
}

export function useScrollSync(
    editorRef: RefObject<HTMLElement>,
    previewRef: RefObject<HTMLElement>,
    options: UseScrollSyncOptions = {}
): void {
    const { enabled = true, epsilon = 1, pausedRef } = options;

    // Per-pane "we are the one who caused this scroll, ignore the event" flag.
    const editorSyncingRef = useRef(false);
    const previewSyncingRef = useRef(false);

    // Pending rAF handles, so we can cancel on cleanup.
    const editorRafRef = useRef<number | null>(null);
    const previewRafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const editor = editorRef.current;
        const preview = previewRef.current;
        if (!editor || !preview) return;

        // Ratio-based sync: 0 at the top, 1 at the bottom. This means the
        // two panes don't need matching heights — a 3x taller editor still
        // maps cleanly onto a shorter preview.
        const ratioOf = (el: HTMLElement): number => {
            const max = el.scrollHeight - el.clientHeight;
            return max <= 0 ? 0 : el.scrollTop / max;
        };

        const writeScroll = (el: HTMLElement, ratio: number, syncingRef: React.MutableRefObject<boolean>) => {
            const max = el.scrollHeight - el.clientHeight;
            if (max <= 0) return;
            const target = ratio * max;
            // Epsilon guard: do nothing if we're already close enough.
            // This is the second line of defense against tiny oscillation.
            if (Math.abs(el.scrollTop - target) <= epsilon) return;
            syncingRef.current = true;
            el.scrollTop = target;
            // Clear the flag on the NEXT frame — after the browser has
            // dispatched the scroll event this write causes.
            requestAnimationFrame(() => {
                syncingRef.current = false;
            });
        };

        const onEditorScroll = () => {
            // If this scroll was caused by US writing to preview, ignore it.
            if (editorSyncingRef.current) return;
            if (pausedRef?.current) return;
            if (editorRafRef.current !== null) return;
            editorRafRef.current = requestAnimationFrame(() => {
                editorRafRef.current = null;
                if (pausedRef?.current) return;
                writeScroll(preview, ratioOf(editor), previewSyncingRef);
            });
        };

        const onPreviewScroll = () => {
            if (previewSyncingRef.current) return;
            if (pausedRef?.current) return;
            if (previewRafRef.current !== null) return;
            previewRafRef.current = requestAnimationFrame(() => {
                previewRafRef.current = null;
                if (pausedRef?.current) return;
                writeScroll(editor, ratioOf(preview), editorSyncingRef);
            });
        };

        editor.addEventListener('scroll', onEditorScroll, { passive: true });
        preview.addEventListener('scroll', onPreviewScroll, { passive: true });

        return () => {
            editor.removeEventListener('scroll', onEditorScroll);
            preview.removeEventListener('scroll', onPreviewScroll);
            if (editorRafRef.current !== null) cancelAnimationFrame(editorRafRef.current);
            if (previewRafRef.current !== null) cancelAnimationFrame(previewRafRef.current);
        };
    }, [editorRef, previewRef, enabled, epsilon, pausedRef]);
}