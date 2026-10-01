import DripEdge from "./DripEdge";
import Heading from "./Heading";
import Photo from "./Photo";
import { parlours } from "../content";

const PIN = "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z";

/** Store locations: the parlour in a tall arch on the left, three rounded parlour cards on the right. */
export default function Parlours() {
  return (
    <section
      id="parlours"
      className="relative z-[1] pt-[clamp(120px,13vw,200px)] pb-[clamp(90px,10vw,150px)]"
      data-record-label="Parlours (hold)"
      data-record-time="1.5"
      data-record-hold="2.5"
      data-record-align="center"
      data-record-align-mobile="bottom"
    >
      <DripEdge color="var(--blueberry)" layout={2} />
      <div className="container-x grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div data-reveal className="arch relative mx-auto aspect-[4/5] w-full max-w-[min(520px,59vh)] overflow-hidden">
          <Photo photo={parlours.photo.photo} tone={parlours.photo.tone} hint={parlours.photo.hint} alt="Inside a Melt Theory parlour" />
        </div>

        <div>
          <p className="eyebrow">{parlours.eyebrow}</p>
          <Heading lines={parlours.heading} className="mt-5 text-[clamp(48px,6vw,104px)]" />
          <p className="mt-5 max-w-[420px] text-[17px] leading-relaxed text-muted">{parlours.text}</p>

          <ul data-reveal="stagger" className="mt-8 flex flex-col gap-3 md:mt-10">
            {parlours.items.map((p) => (
              <li key={p.name} className="group flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[28px] bg-white p-4 pr-5 shadow-[var(--soft-shadow)] transition-transform duration-500 hover:-translate-y-1 md:p-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--strawberry)] text-accent">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d={PIN} fillRule="evenodd" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-display block text-[24px] md:text-[28px]">{p.name}</span>
                  <span className="hidden text-[14px] text-muted sm:block">{p.note}</span>
                </span>
                <span className="order-last w-full pl-[68px] text-[14px] sm:order-none sm:w-auto sm:pl-0 md:text-right">
                  <span className="tnum block font-extrabold">{p.hours}</span>
                  <span className="block font-bold text-accent">{p.late}</span>
                </span>
                <a href="#parlours" className="rounded-full bg-[var(--bg)] px-4 py-2.5 text-[14px] font-extrabold transition-colors group-hover:bg-accent group-hover:text-white">
                  Directions
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
