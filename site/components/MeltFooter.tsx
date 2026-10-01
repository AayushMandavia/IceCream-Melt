"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { onSiteReady } from "@/lib/loading";
import DripEdge from "./DripEdge";
import { ScoopMark } from "./ScoopNav";
import { footer } from "../content";

// Which letters of the wordmark drip: [letter index, left %, length em]
const DRIPS: [number, number, number][] = [
  [0, 14, 0.32],
  [2, 22, 0.5],
  [3, 50, 0.22],
  [6, 80, 0.42],
  [8, 50, 0.28],
  [10, 50, 0.46],
];

/** WordmarkFooter, restyled: a strawberry footer; the giant MELT THEORY melts (its drips run longer) as you reach the end. */
export default function MeltFooter() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let ctx: gsap.Context | undefined;
    const off = onSiteReady(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".word-drip",
          { height: 0 },
          { height: (i: number, el: HTMLElement) => el.dataset.len!, ease: "power1.out", stagger: 0.05, scrollTrigger: { trigger: root.current, start: "top 60%", end: "bottom bottom", scrub: 0.8 } },
        );
      }, root);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  let idx = -1;
  return (
    <footer
      ref={root}
      className="relative z-[1] overflow-hidden bg-accent pt-[clamp(120px,12vw,190px)] text-[#fff1f4]"
      data-record-label="Footer"
      data-record-time="1.5"
      data-record-hold="2"
      data-record-align="bottom"
    >
      <DripEdge color="var(--bg)" layout={0} />
      <div className="container-x grid gap-10 lg:grid-cols-[1.2fr_2fr] lg:gap-12">
        <div>
          <p className="font-display text-[clamp(34px,3.2vw,52px)]">{footer.newsletter.title}</p>
          <p className="mt-3 max-w-[360px] text-[15px] opacity-90">{footer.newsletter.text}</p>
          <form className="mt-6 flex max-w-[440px] gap-2" onSubmit={(e) => e.preventDefault()}>
            <label className="sr-only" htmlFor="mail">
              Email
            </label>
            <input id="mail" type="email" placeholder={footer.newsletter.placeholder} className="pill-input min-w-0 flex-1 text-[15px]" />
            <button type="submit" className="rounded-full bg-white px-6 text-[15px] font-extrabold text-accent transition-transform hover:scale-[1.04]">
              Join
            </button>
          </form>
        </div>
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          {footer.columns.map((c) => (
            <div key={c.title}>
              <p className="text-[12px] font-extrabold tracking-[0.14em] uppercase opacity-80">{c.title}</p>
              <ul className="mt-3 space-y-1.5 md:mt-4 md:space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="link-underline text-[14px] font-semibold md:text-[16px]">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* the melting wordmark */}
      <p aria-hidden className="font-display mt-12 flex flex-wrap justify-center gap-x-[0.25em] px-3 pb-[0.42em] text-center text-[22vw] leading-[0.9] font-bold tracking-[-0.02em] select-none md:mt-10 md:flex-nowrap md:text-[13.6vw]">
        {footer.word.split(" ").map((w) => (
          <span key={w} className="whitespace-nowrap">
            {w.split("").map((ch) => {
              idx++;
              const drip = DRIPS.find((d) => d[0] === idx);
              return (
                <span key={idx} className="relative inline-block">
                  {ch}
                  {drip && (
                    <span
                      data-len={`${drip[2]}em`}
                      className="word-drip absolute top-[80%] w-[0.1em] -translate-x-1/2 rounded-b-full bg-[#fff1f4] after:absolute after:bottom-[-0.03em] after:left-1/2 after:h-[0.15em] after:w-[0.15em] after:-translate-x-1/2 after:rounded-full after:bg-[#fff1f4] after:content-['']"
                      style={{ left: `${drip[1]}%`, height: `${drip[2]}em` }}
                    />
                  )}
                </span>
              );
            })}
          </span>
        ))}
      </p>

      <div className="container-x flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-white/25 py-4 text-[12px] font-semibold md:py-5 md:text-[13px]">
        <p className="flex items-center gap-2">
          <ScoopMark className="h-4 w-auto text-white" />© 2026 Melt Theory (concept)
        </p>
        <p className="opacity-90">{footer.note}</p>
      </div>
    </footer>
  );
}
