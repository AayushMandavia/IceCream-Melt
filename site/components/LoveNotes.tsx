"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { onSiteReady } from "@/lib/loading";
import DripEdge from "./DripEdge";
import Heading from "./Heading";
import Photo from "./Photo";
import { notes } from "../content";

/** PolaroidWall → rounded photo stickers with hand-written notes on a blueberry band. They settle into their tilt as you scroll. */
export default function LoveNotes() {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let ctx: gsap.Context | undefined;
    const off = onSiteReady(() => {
      ctx = gsap.context(() => {
        (gsap.utils.toArray(".note") as HTMLElement[]).forEach((el, i) => {
          const tilt = notes.items[i].tilt;
          gsap.fromTo(
            el,
            { y: 140 + (i % 2) * 90, rotate: tilt * 4 },
            { y: 0, rotate: tilt, ease: "none", scrollTrigger: { trigger: grid.current, start: "top bottom", end: "top 30%", scrub: 0.6 } },
          );
        });
      }, grid);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  return (
    <section
      className="relative z-[1] bg-[var(--blueberry)] pt-[clamp(120px,13vw,200px)] pb-[clamp(90px,10vw,150px)]"
      data-record-label="Love notes (hold)"
      data-record-time="1.5"
      data-record-hold="1.5"
      data-record-align="center"
    >
      <DripEdge color="var(--mango)" layout={1} flip />
      <div className="container-x">
        <div className="text-center">
          <p className="eyebrow">{notes.eyebrow}</p>
          <Heading lines={notes.heading} className="mt-5 text-[clamp(44px,5.4vw,96px)]" />
        </div>
        <div ref={grid} className="mt-12 grid grid-cols-2 gap-x-3 gap-y-6 md:mt-16 lg:grid-cols-4 lg:gap-7">
          {notes.items.map((n) => (
            <figure key={n.name} className="note rounded-[28px] bg-white p-2.5 shadow-[0_24px_40px_-24px_rgba(30,20,90,.55)] md:p-3.5" style={{ transform: `rotate(${n.tilt}deg)` }}>
              <div className="aspect-[4/5] overflow-hidden rounded-[20px]">
                <Photo photo={n.photo} tone={n.tone} hint={n.hint} alt={n.name} />
              </div>
              <blockquote className="px-2 pt-4 font-['Caveat_Variable'] text-[22px] leading-[1.1] font-semibold md:text-[28px]">“{n.text}”</blockquote>
              <figcaption className="flex flex-col-reverse gap-1 px-2 pt-3 pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span>
                  <span className="block text-[14px] font-extrabold md:text-[15px]">{n.name}</span>
                  <span className="text-[12px] font-bold text-muted md:text-[13px]">{n.where}</span>
                </span>
                <span aria-label={`${n.rating} out of 5`} className="text-[14px] tracking-[0.1em] whitespace-nowrap text-accent">
                  {"★".repeat(n.rating)}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
