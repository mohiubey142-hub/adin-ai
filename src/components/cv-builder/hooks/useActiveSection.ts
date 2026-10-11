// src/components/cv-builder/hooks/useActiveSection.ts
// ------------------------------------------------------------------
// Tracks which [data-section] element inside `previewRef` is currently
// the most visible one in the preview's viewport, so the editor can
// highlight the matching section.
//
// Uses IntersectionObserver rather than a scroll listener:
//   - No work on every scroll event (the browser does the visibility
//     math off the main thread and only calls us when something
//     actually changes).
//   - Handles "which section is MOST visible" naturally by keeping a
//     running visibility score per section and picking the max, so a
//     tall section doesn't get unfairly beaten by a tiny one that
//     happens to be peeking in at the bottom.
//
// ✅ FIX (this pass):
//
//    1. HIDDEN MEASURE COPIES were competing for "active". Every
//       template renders its content twice — once into a hidden
//       measure copy (to compute pagination), once per rendered A4
//       sheet. The measure copy has `visibility: hidden`, but
//       `visibility: hidden` does NOT exclude an element from
//       IntersectionObserver on all browsers — the hidden copy still
//       has a real bounding box, so its `intersectionRatio` can come
//       back as 1.0 and win the "most visible" race even though it's
//       not on screen. Fixed with `isActuallyVisible()`: skip any
//       element that has a `visibility: hidden` or `display: none`
//       ancestor (walking up to the preview root). Skipped elements
//       are also removed from the running ratios map, so they can't
//       linger as stale entries after a previous callback.
//
//    2. MULTIPLE VISIBLE COPIES of the same section key (e.g. the
//       Creative sidebar renders its content once per A4 sheet, and
//       the ATS-Pro / Executive / Academic / TealCurve / Modern /
//       Classic / Minimal measure copies sit behind the visible
//       sheets) all report the same `data-section`. Keying the ratios
//       map by the ELEMENT (not by the section key) keeps them from
//       overwriting each other; the "most visible" pick then
//       naturally chooses the one that is actually on screen.
//
// ✅ FIX (PNG bug — this pass):
//
//    3. Added a `paused` flag. While `paused` is true (e.g. during a
//       PNG capture triggered by `usePNGDownload`), the observer
//       callback bails out IMMEDIATELY — it never touches `ratios`
//       and never calls `setActiveSection`. And when `paused`
//       transitions to true, we also CLEAR the active section right
//       away, so any existing "Click to edit" label is unmounted
//       before the capture begins. This is what prevents React from
//       re-rendering a fresh label mid-capture, which used to sneak
//       a coral-red label into the PNG.
//
// The public API is now `useActiveSection(previewRef, enabled, paused)`
// — existing 2-arg call-sites keep working (paused defaults to false).
// ------------------------------------------------------------------

import { useEffect, useRef, useState, type RefObject } from 'react';

export function useActiveSection(
    previewRef: RefObject<HTMLElement>,
    enabled: boolean = true,
    paused: boolean = false
): string | null {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    // ✅ Only true after the user has scrolled or clicked inside the
    //    preview pane. Before that, we never mark a section as active —
    //    this prevents the header from auto-highlighting on page load.
    const hasInteractedRef = useRef(false);

    // ✅ Live mirror of the `paused` prop so the observer callback
    //    (created once) always reads the latest value without us
    //    having to re-create the observer on every pause toggle.
    const pausedRef = useRef(paused);

    // ✅ Keep the ref in sync; when we PAUSE, also clear the active
    //    section immediately so no label lingers while we capture.
    useEffect(() => {
        pausedRef.current = paused;
        if (paused) {
            setActiveSection(null);
            hasInteractedRef.current = false;
        }
    }, [paused]);

    useEffect(() => {
        if (!enabled) return;
        const root = previewRef.current;
        if (!root) return;

        // Mark as interacted on the first scroll or click inside the pane.
        const markInteracted = () => {
            hasInteractedRef.current = true;
        };
        root.addEventListener('scroll', markInteracted, { once: true, passive: true });
        root.addEventListener('click', markInteracted, { once: true, passive: true });
        root.addEventListener('touchstart', markInteracted, { once: true, passive: true });

        // Every observed element we know about, keyed by the ELEMENT
        // (not by the section key), so repeated keys across copies
        // don't clash.
        const ratios = new Map<Element, number>();

        // Walk up the ancestors: if any has `visibility: hidden` or
        // `display: none`, this element is a hidden measure-copy (or a
        // collapsed tree) and must never count as "active".
        const isActuallyVisible = (el: Element): boolean => {
            let node: HTMLElement | null = el as HTMLElement;
            while (node && node !== root) {
                const cs = window.getComputedStyle(node);
                if (cs.visibility === 'hidden' || cs.display === 'none') return false;
                node = node.parentElement;
            }
            return true;
        };

        const observer = new IntersectionObserver(
            (entries) => {
                // ✅ HARD STOP while paused (e.g. during a PNG capture).
                //    We don't even touch `ratios` here — this guarantees
                //    React never re-renders a label mid-capture.
                if (pausedRef.current) return;

                for (const entry of entries) {
                    if (!isActuallyVisible(entry.target)) {
                        // Hidden measure copy — drop it entirely so it
                        // can't linger as a stale high-ratio entry.
                        ratios.delete(entry.target);
                        continue;
                    }
                    ratios.set(entry.target, entry.intersectionRatio);
                }

                // Pick the section with the highest intersectionRatio.
                let bestKey: string | null = null;
                let bestRatio = 0;
                for (const [el, ratio] of ratios) {
                    if (ratio > bestRatio) {
                        bestRatio = ratio;
                        bestKey = (el as HTMLElement).dataset.section ?? null;
                    }
                }
                // Only update state if something is actually visible
                // (ratio > 0), AND only after the user has interacted
                // with the preview at least once.
                if (bestKey && bestRatio > 0 && hasInteractedRef.current) {
                    setActiveSection((prev) => (prev === bestKey ? prev : bestKey));
                }
            },
            {
                root,
                // Shrink the observation window slightly so a section
                // that's barely peeking in at the top/bottom doesn't
                // win over one that's actually on screen.
                rootMargin: '-10% 0px -10% 0px',
                threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
            }
        );

        // Observe every element with a data-section attribute.
        const sections = root.querySelectorAll<HTMLElement>('[data-section]');
        sections.forEach((el) => observer.observe(el));

        return () => {
            observer.disconnect();
            root.removeEventListener('scroll', markInteracted);
            root.removeEventListener('click', markInteracted);
            root.removeEventListener('touchstart', markInteracted);
        };
    }, [previewRef, enabled]);

    return activeSection;
}