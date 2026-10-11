// src/components/cv-builder/hooks/usePNGDownload.ts
// ------------------------------------------------------------------
// Reusable PNG export hook — works for CV previews and Cover Letters.
//
// KEY DESIGN:
//  1. html-to-image loads dynamically (zero initial bundle cost).
//  2. Preview's own scale() is stripped during capture → full A4.
//  3. pixelRatio: 3 → sharp, ~4K-quality PNG per page.
//
//  4. MULTI-PAGE: each [data-page] element exports as its OWN PNG.
//     - 1 page  → single .png file (plain download)
//     - 2+ pages → one .zip containing every page as its own .png
//       (avoids the browser's "multiple downloads" block, gives the
//        user ONE click instead of N clicks)
//     jszip is loaded dynamically, so it costs 0 KB on the initial
//     bundle and only downloads the first time the user actually
//     exports a multi-page CV.
//
//  5. EDIT CHROME HIDE:
//     a) Inline styles hide every [data-edit-label] and clear every
//        [data-section] outline / hover wash — belt.
//     b) html-to-image's `filter` callback rejects any node that
//        carries `data-edit-label` — suspenders. Because filter runs
//        on the CLONED tree, those nodes never land in the PNG.
//
//  6. cacheBust: false — cacheBust:true was racing on the 2nd+
//     capture: it rewrote every asset URL with a fresh ?t=... which
//     forced re-fetches, and html-to-image sometimes snapshotted the
//     clone BEFORE those completed. The visible symptom was that the
//     FIRST PNG download was clean but every SUBSEQUENT one contained
//     the "Click to edit" label + coral outline.
//
//  7. Double requestAnimationFrame wait AFTER onStateChange(true) and
//     BEFORE toBlob — so React actually commits the pause state and
//     unmounts any label that was rendering, before we snapshot.
//
//  8. onStateChange(true/false) around the whole capture lets the
//     parent pause the active-section tracker.
//
//  9. Transform is ALWAYS restored (try/finally).
// ------------------------------------------------------------------

import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

interface UsePNGDownloadOptions {
    /** A ref to the element that should be captured. */
    elementRef: React.RefObject<HTMLElement>;
    /** Base file name (without extension). Defaults to "document". */
    fileName?: string;
    /** Toast id, so concurrent calls don't stack. */
    toastId?: string;
    /**
     * Capture resolution multiplier.
     * 2 = retina, 3 = sharp/4K-ish (default), 4 = ultra.
     */
    pixelRatio?: number;
    /**
     * Called with `true` right before capture begins, `false` right
     * after it ends (success OR failure). Use this to pause any UI
     * state that could re-render the preview mid-capture (e.g. the
     * active-section highlight tracker).
     */
    onStateChange?: (isCapturing: boolean) => void;
}

/** Inline style snapshot — everything we mutate during capture. */
interface SavedStyle {
    el: HTMLElement;
    outline: string;
    outlineOffset: string;
    backgroundColor: string;
    boxShadow: string;
    display: string;
    visibility: string;
    opacity: string;
    pointerEvents: string;
}

export const usePNGDownload = ({
    elementRef,
    fileName = 'document',
    toastId = 'png',
    pixelRatio = 3,
    onStateChange,
}: UsePNGDownloadOptions) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const downloadPNG = useCallback(async () => {
        const element = elementRef.current;
        if (!element) {
            toast.error('Nothing to export — preview not ready');
            return;
        }

        if (isGenerating) return;
        setIsGenerating(true);

        // ✅ Notify the parent that capture is starting — this PAUSES
        //    the active-section tracker so React doesn't render a
        //    fresh "Click to edit" label mid-capture.
        onStateChange?.(true);

        toast.loading('Generating PNG...', { id: toastId });

        // ✅ Let React commit the pause state BEFORE we snapshot.
        //    Without this, the label nodes were still in the DOM at
        //    snapshot time on the 2nd+ capture.
        await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );

        const originalTransform = element.style.transform;
        const originalTransformOrigin = element.style.transformOrigin;

        // Save every inline style we are about to mutate so `finally`
        // can restore the preview to its exact previous state.
        const savedStyles: SavedStyle[] = [];
        const saveAndMutate = (el: HTMLElement, mutate: (s: CSSStyleDeclaration) => void) => {
            savedStyles.push({
                el,
                outline: el.style.outline,
                outlineOffset: el.style.outlineOffset,
                backgroundColor: el.style.backgroundColor,
                boxShadow: el.style.boxShadow,
                display: el.style.display,
                visibility: el.style.visibility,
                opacity: el.style.opacity,
                pointerEvents: el.style.pointerEvents,
            });
            mutate(el.style);
        };

        try {
            // 1. Strip the preview's scale() so we capture full A4 size.
            element.style.transform = 'none';
            element.style.transformOrigin = 'top left';

            // 2. Flag the capture root (debug + optional CSS safety net).
            element.setAttribute('data-png-capturing', 'true');

            // 3. HIDE every edit label (inline-style belt).
            element.querySelectorAll<HTMLElement>('[data-edit-label]').forEach((el) => {
                saveAndMutate(el, (s) => {
                    s.display = 'none';
                    s.visibility = 'hidden';
                    s.opacity = '0';
                    s.pointerEvents = 'none';
                });
            });

            // 4. KILL every edit outline + hover wash (inline-style belt).
            element.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => {
                saveAndMutate(el, (s) => {
                    s.outline = 'none';
                    s.outlineOffset = '0';
                    s.backgroundColor = 'transparent';
                    s.boxShadow = 'none';
                });
            });

            // 5. Dynamic import — never ships in the initial bundle.
            const { toBlob } = await import('html-to-image');

            // 6. Multi-page detection.
            const pageEls = element.querySelectorAll<HTMLElement>('[data-page]');
            const targets: HTMLElement[] =
                pageEls.length > 0 ? Array.from(pageEls) : [element];

            const baseName = fileName.replace(/\s+/g, '_') || 'document';

            // 7. Capture every page into memory first. Doing this BEFORE
            //    touching the DOM for downloads means a failure in the
            //    middle of the loop leaves the page untouched.
            const blobs: Blob[] = [];
            for (let i = 0; i < targets.length; i++) {
                const blob = await toBlob(targets[i], {
                    pixelRatio,
                    backgroundColor: '#ffffff',
                    // ✅ cacheBust disabled — see file header comment #6.
                    cacheBust: false,
                    skipFonts: true,
                    // ✅ Filter runs on the CLONED tree; rejected nodes
                    //    never make it into the final PNG.
                    filter: (node) => {
                        if (!(node instanceof HTMLElement)) return true;
                        if (node.hasAttribute('data-edit-label')) return false;
                        if (node.hasAttribute('data-edit-dot')) return false;
                        return true;
                    },
                });

                if (!blob) {
                    throw new Error(`html-to-image returned no blob for page ${i + 1}`);
                }
                blobs.push(blob);
            }

            // 8a. SINGLE-PAGE CV → plain .png download (no zip, no jszip).
            if (blobs.length === 1) {
                const url = URL.createObjectURL(blobs[0]);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${baseName}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                toast.success('PNG downloaded!', { id: toastId });
                return;
            }

            // 8b. MULTI-PAGE CV → one .zip with every page inside.
            //     jszip is loaded HERE only, so single-page users never
            //     pay for it, and multi-page users pay ~30 KB gzipped
            //     exactly once (browser caches it thereafter).
            toast.loading('Packing pages into ZIP...', { id: toastId });

            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();

            blobs.forEach((blob, i) => {
                zip.file(`${baseName}_page-${i + 1}.png`, blob);
            });

            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 },
            });

            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${baseName}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(
                `${blobs.length} pages downloaded as ZIP!`,
                { id: toastId }
            );
        } catch (err) {
            console.error('[usePNGDownload] PNG generation failed:', err);
            toast.error('Failed to generate PNG', { id: toastId });
        } finally {
            // 9. Restore every element we touched.
            savedStyles.forEach(
                ({
                    el,
                    outline,
                    outlineOffset,
                    backgroundColor,
                    boxShadow,
                    display,
                    visibility,
                    opacity,
                    pointerEvents,
                }) => {
                    el.style.outline = outline;
                    el.style.outlineOffset = outlineOffset;
                    el.style.backgroundColor = backgroundColor;
                    el.style.boxShadow = boxShadow;
                    el.style.display = display;
                    el.style.visibility = visibility;
                    el.style.opacity = opacity;
                    el.style.pointerEvents = pointerEvents;
                }
            );
            element.style.transform = originalTransform;
            element.style.transformOrigin = originalTransformOrigin;
            element.removeAttribute('data-png-capturing');

            setIsGenerating(false);

            // ✅ Notify the parent that capture has ended.
            onStateChange?.(false);
        }
    }, [elementRef, fileName, toastId, isGenerating, pixelRatio, onStateChange]);

    return { downloadPNG, isGenerating };
};