"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { onSiteReady } from "@/lib/loading";

// Drips as [centre x, radius, depth] in a 1440 × 140 box. Three layouts so neighbouring edges don't repeat.
const LAYOUTS: [number, number, number][][] = [
  [[70, 16, 58], [210, 22, 104], [330, 14, 50], [470, 26, 128], [640, 16, 70], [770, 20, 96], [930, 14, 52], [1060, 24, 118], [1210, 16, 66], [1350, 20, 90]],
  [[40, 18, 70], [160, 14, 48], [300, 24, 120], [450, 16, 62], [590, 20, 92], [760, 26, 130], [900, 14, 56], [1030, 20, 84], [1180, 24, 112], [1330, 14, 54]],
  [[110, 22, 96], [250, 14, 54], [390, 20, 80], [540, 26, 124], [700, 14, 50], [840, 22, 104], [990, 16, 66], [1130, 26, 126], [1290, 18, 74], [1410, 14, 50]],
];
const BASE = 30;

function dripPath(drips: [number, number, number][], thick = false) {
  const f = (n: number) => n.toFixed(1);
  const BASE = thick ? 40 : 30;
  let d = `M0 0H1440V${BASE}`;
  let x = 1440;
  // walk right → left along the bottom edge: rich melted sag between drips, then down a voluptuous stem into a round bulb
  for (const [cx, rawR, rawDepth] of [...drips].sort((a, b) => b[0] - a[0])) {
    const r = thick ? Math.round(rawR * 1.5) : rawR;
    const depth = thick ? Math.round(rawDepth * 1.15) : rawDepth;
    const s = r * (thick ? 0.82 : 0.62); // thick, substantial stem
    const k = r * (thick ? 1.45 : 1.3); // wider organic shoulder
    const y = BASE + depth - r;
    d += `Q${f((x + cx + r + k) / 2)} ${BASE + (thick ? 16 : 12)} ${f(cx + r + k)} ${BASE}`;
    d += `C${f(cx + s)} ${BASE} ${f(cx + s)} ${f(BASE + k * 0.6)} ${f(cx + s)} ${f(Math.max(BASE + k * 0.6, y - r * 1.5))}`;
    d += `C${f(cx + s)} ${f(y - r * 1.05)} ${f(cx + r)} ${f(y - r * 0.75)} ${f(cx + r)} ${f(y)}`;
    d += `A${r} ${r} 0 0 1 ${f(cx - r)} ${f(y)}`;
    d += `C${f(cx - r)} ${f(y - r * 0.75)} ${f(cx - s)} ${f(y - r * 1.05)} ${f(cx - s)} ${f(Math.max(BASE + k * 0.6, y - r * 1.5))}`;
    d += `C${f(cx - s)} ${f(BASE + k * 0.6)} ${f(cx - s)} ${BASE} ${f(cx - r - k)} ${BASE}`;
    x = cx - r - k;
  }
  return `${d}Q${f(x / 2)} ${BASE + (thick ? 16 : 12)} 0 ${BASE}Z`;
}
const PATHS = LAYOUTS.map((l) => dripPath(l, false));
const THICK_PATHS = LAYOUTS.map((l) => dripPath(l, true));

/**
 * S2 "melt drip" edge: sits at the top of a section and drips the colour of the section above into it.
 * The drips stretch a little longer as the section scrolls in.
 */
export default function DripEdge({
  color,
  layout = 0,
  flip = false,
  thick = false,
}: {
  color: string;
  layout?: number;
  flip?: boolean;
  thick?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let tween: gsap.core.Tween | undefined;
    const off = onSiteReady(() => {
      tween = gsap.fromTo(
        ref.current,
        { scaleY: 0.55 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "top 25%", scrub: 0.6 } },
      );
    });
    return () => {
      off();
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, []);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-[-1px] z-[2] ${flip ? "-scale-x-100" : ""}`}>
      <svg
        ref={ref}
        viewBox={thick ? "0 0 1440 180" : "0 0 1440 160"}
        preserveAspectRatio="none"
        className={`block w-full origin-top ${thick ? "h-[clamp(70px,10vw,175px)]" : "h-[clamp(52px,9vw,150px)]"}`}
      >
        <path d={(thick ? THICK_PATHS : PATHS)[layout % PATHS.length]} fill={color} />
      </svg>
    </div>
  );
}
