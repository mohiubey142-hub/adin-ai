// src/components/LoadingScreen.tsx
// Premium light theme — matches Adin AI brand (purple + slate)
// ✅ UPDATED (Nov 2026): Animated SVG logo (sirf SVG + Web Animations API, koi library nahi)
//    - Logo transparent hai (nila badge nahi), design logo ke apne rang (purple -> blue) me hai
//    - EK hi jagah se, EK line ki tarah draw hota hai: pehle ek hissa poora, phir agla, phir agla (sab ek sath nahi)
//      Rang lakeer ke saath saath bharta hai
//    - Pehli baar UPAR se shuru, doosri baar NEECHE se, phir dobara upar se... (har baar shuruaat ki jagah badalti hai)
//    - Draw -> thora hold -> usi order me ek ek karke mit jana -> agla draw turant shuru (beech me khaali delay nahi)
//    - "Adin AI" text ek baar likha jata hai aur screen par rehta hai
// ZERO dependency on props, drop-in replacement (named export `LoadingScreen` wahi hai)

import { useEffect, useRef } from 'react';

// Logo ke 3 hisse (icon-1024x1024.png se trace kiye hue, 1024x1024 viewBox)
// `top` = upar se shuru hone wala path, `bottom` = wahi shape neeche se shuru hone wala.
const SHAPES = [
  { top: 'M688 472 L644 542 L805 808 L884 808 Z', bottom: 'M805 808 L884 808 L688 472 L644 542 Z' },
  { top: 'M469 551 L315 807 L708 808 L604 624 L536 736 L441 735 L533 581 Z', bottom: 'M708 808 L604 624 L536 736 L441 735 L533 581 L469 551 L315 807 Z' },
  { top: 'M512 172 L135 808 L218 806 L388 526 L511 314 L560 397 L489 518 L552 546 L557 541 L642 395 Z', bottom: 'M135 808 L218 806 L388 526 L511 314 L560 397 L489 518 L552 546 L557 541 L642 395 L512 172 Z' }
];

// Draw ka order: UPAR se (bada "A" -> daayin patti -> beech ka "U") aur NEECHE se (ulta)
const ORDER_TOP = [2, 0, 1];
const ORDER_BOTTOM = [1, 0, 2];

const LOOP_MS = 4400; // ek loop = 2 pass (ek upar se, ek neeche se)

const CSS = `
.adin-ls-line { fill: none; stroke: url(#adin-ls-grad); stroke-width: 20; stroke-linejoin: round; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; }
.adin-ls-mask { fill: none; stroke: #fff; stroke-width: 150; stroke-linejoin: round; stroke-linecap: butt; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; }
.adin-ls-text { clip-path: inset(0 100% 0 0); }
`;

type Frame = Keyframe & { offset: number };

// Shape ki lambai (perimeter) — taake har hissa barabar raftaar se draw ho (ek hi line ki tarah)
const shapeLength = (d: string) => {
  const n = (d.match(/-?\d+/g) || []).map(Number);
  let total = 0;
  for (let i = 0; i < n.length; i += 2) {
    const j = (i + 2) % n.length;
    total += Math.hypot(n[j] - n[i], n[j + 1] - n[i + 1]);
  }
  return total;
};
const LENGTHS = SHAPES.map((s) => shapeLength(s.top));

// Half-pass ke andar: draw [0, 0.5], hold [0.5, 0.72], mitna [0.72, 1] — sab ek ek hissa karke
const DRAW_END = 0.5;
const ERASE_START = 0.72;

// Ek shape ke liye keyframes. `at` = pass loop me kab shuru hota hai (0 ya 0.5), order = hissa kis number par.
function shapeFrames(at: number, order: number[], shapeIndex: number): Frame[] {
  const E = 0.0003;
  const total = order.reduce((sum, i) => sum + LENGTHS[i], 0);
  let before = 0;
  for (const i of order) { if (i === shapeIndex) break; before += LENGTHS[i]; }
  const p0 = before / total;
  const p1 = (before + LENGTHS[shapeIndex]) / total;

  const toLoop = (t: number) => at + t * 0.5; // half-pass ka waqt -> loop ka hissa
  const drawA = toLoop(DRAW_END * p0);
  const drawB = toLoop(DRAW_END * p1);
  const eraseA = toLoop(ERASE_START + (1 - ERASE_START) * p0);
  const eraseB = toLoop(ERASE_START + (1 - ERASE_START) * p1);

  const f: Frame[] = [];
  if (drawA > E) {
    f.push({ offset: 0, opacity: 0, strokeDashoffset: 1 });
    f.push({ offset: drawA - E, opacity: 0, strokeDashoffset: 1 });
  }
  f.push({ offset: drawA, opacity: 1, strokeDashoffset: 1, easing: 'linear' });
  f.push({ offset: drawB, opacity: 1, strokeDashoffset: 0 });
  f.push({ offset: eraseA, opacity: 1, strokeDashoffset: 0, easing: 'linear' });
  f.push({ offset: Math.min(eraseB, 1), opacity: 1, strokeDashoffset: -1 });
  if (eraseB + E < 1) {
    f.push({ offset: eraseB + E, opacity: 0, strokeDashoffset: 1 });
    f.push({ offset: 1, opacity: 0, strokeDashoffset: 1 });
  }
  return f;
}

function useAdinLogoAnimation() {
  const lineTop = useRef<(SVGPathElement | null)[]>([]);
  const lineBottom = useRef<(SVGPathElement | null)[]>([]);
  const maskTop = useRef<(SVGPathElement | null)[]>([]);
  const maskBottom = useRef<(SVGPathElement | null)[]>([]);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const anims: Animation[] = [];
    const supportsWAAPI = typeof Element !== 'undefined' && typeof (Element.prototype as any).animate === 'function';

    if (!supportsWAAPI) {
      // Purana browser: seedha poora logo + text dikha do
      maskTop.current.forEach((el) => { if (el) { el.style.opacity = '1'; el.style.strokeDashoffset = '0'; } });
      if (textRef.current) textRef.current.style.clipPath = 'none';
      return;
    }

    const run = (el: Element | null | undefined, frames: Frame[], opts: KeyframeAnimationOptions) => {
      if (!el) return;
      try { anims.push(el.animate(frames, opts)); } catch { /* ignore */ }
    };
    const loop: KeyframeAnimationOptions = { duration: LOOP_MS, iterations: Infinity };

    SHAPES.forEach((_, i) => {
      const top = shapeFrames(0, ORDER_TOP, i);
      const bottom = shapeFrames(0.5, ORDER_BOTTOM, i);
      run(lineTop.current[i], top, loop);
      run(maskTop.current[i], top, loop);        // rang lakeer ke saath saath bharta hai
      run(lineBottom.current[i], bottom, loop);
      run(maskBottom.current[i], bottom, loop);
    });

    // Text sirf ek baar likha jata hai aur phir rehta hai
    run(textRef.current, [
      { offset: 0, clipPath: 'inset(0 100% 0 0)' }, { offset: 1, clipPath: 'inset(0 -4% 0 0)' },
    ], { duration: 700, delay: 450, iterations: 1, fill: 'both', easing: 'cubic-bezier(.45,0,.25,1)' });

    return () => { anims.forEach((a) => a.cancel()); };
  }, []);

  return { lineTop, lineBottom, maskTop, maskBottom, textRef };
}

export const LoadingScreen = () => {
  const { lineTop, lineBottom, maskTop, maskBottom, textRef } = useAdinLogoAnimation();
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center relative overflow-hidden">
      {/* Dot grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(203, 213, 225) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 text-center px-6" role="status" aria-label="Loading Adin AI">
        {/* Transparent logo — design logo ke rang me */}
        <svg
          viewBox="110 150 800 680"
          width="68"
          height="58"
          className="mx-auto mb-4 block"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="adin-ls-grad" gradientUnits="userSpaceOnUse" x1="135" y1="172" x2="884" y2="808">
              <stop offset="0" stopColor="#8558fd" />
              <stop offset="1" stopColor="#2257ed" />
            </linearGradient>
            {SHAPES.map((s, i) => (
              <mask key={`mt${i}`} id={`adin-ls-mt-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">
                <path ref={(el) => { maskTop.current[i] = el; }} className="adin-ls-mask" d={s.top} pathLength={1} />
              </mask>
            ))}
            {SHAPES.map((s, i) => (
              <mask key={`mb${i}`} id={`adin-ls-mb-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">
                <path ref={(el) => { maskBottom.current[i] = el; }} className="adin-ls-mask" d={s.bottom} pathLength={1} />
              </mask>
            ))}
          </defs>

          {SHAPES.map((s, i) => (
            <path key={`ft${i}`} d={s.top} fill="url(#adin-ls-grad)" mask={`url(#adin-ls-mt-${i})`} />
          ))}
          {SHAPES.map((s, i) => (
            <path key={`fb${i}`} d={s.top} fill="url(#adin-ls-grad)" mask={`url(#adin-ls-mb-${i})`} />
          ))}
          {SHAPES.map((s, i) => (
            <path key={`lt${i}`} ref={(el) => { lineTop.current[i] = el; }} className="adin-ls-line" d={s.top} pathLength={1} />
          ))}
          {SHAPES.map((s, i) => (
            <path key={`lb${i}`} ref={(el) => { lineBottom.current[i] = el; }} className="adin-ls-line" d={s.bottom} pathLength={1} />
          ))}
        </svg>

        {/* Brand — left se right "likha" jata hai */}
        <h2 className="text-2xl font-bold tracking-tight">
          <span
            ref={textRef}
            className="adin-ls-text inline-block bg-gradient-to-r from-[#8558fd] to-[#2257ed] bg-clip-text text-transparent"
          >
            Adin AI
          </span>
        </h2>
      </div>

      <style>{CSS}</style>
    </div>
  );
};
