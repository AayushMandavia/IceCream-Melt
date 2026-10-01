import DripEdge from "./DripEdge";
import Heading from "./Heading";
import Photo from "./Photo";
import { deals } from "../content";

/** A round sticker with its text running around the edge, slowly spinning. */
function Badge({ text, className = "" }: { text: string; className?: string }) {
  const ring = `${text} • ${text} • `.toUpperCase();
  const id = `badge-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <span className={`absolute z-[2] grid h-[104px] w-[104px] place-items-center rounded-full bg-accent text-white shadow-[0_10px_20px_-10px_rgba(163,19,74,.8)] md:h-[108px] md:w-[108px] ${className}`}>
      <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0 h-full w-full" aria-hidden>
        <path id={id} d="M50 50m-36 0a36 36 0 1 1 72 0a36 36 0 1 1-72 0" fill="none" />
        <text fontSize="12" fontWeight="800" letterSpacing="0.8" fill="currentColor">
          <textPath href={`#${id}`} textLength="222">
            {ring}
          </textPath>
        </text>
      </svg>
      <span className="text-[22px]" aria-hidden>
        ★
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

/** Bento → a mango colour band with rounded offer tiles, each with a spinning badge. */
export default function SweetDeals() {
  const [family, date, happy, cake] = deals.items;
  return (
    <section
      id="deals"
      className="relative z-[1] bg-[var(--mango)] pt-[clamp(120px,13vw,200px)] pb-[clamp(80px,9vw,140px)]"
      data-record-label="Sweet deals (hold)"
      data-record-time="1.5"
      data-record-hold="2"
      data-record-align="center"
      data-record-align-mobile="top"
      data-record-offset-mobile="-60"
    >
      <DripEdge color="var(--surface)" layout={0} flip />
      <div className="container-x">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">{deals.eyebrow}</p>
            <Heading lines={deals.heading} className="mt-5 text-[clamp(48px,6vw,104px)]" />
          </div>
          <p className="max-w-[320px] text-[17px] font-semibold leading-relaxed text-[#2b1233]/80">{deals.text}</p>
        </div>

        <div data-reveal="stagger" className="mt-10 grid gap-4 md:mt-14 lg:h-[min(62vh,600px)] lg:grid-cols-4 lg:grid-rows-2 lg:gap-5">
          {/* big: family tub night */}
          <article className="relative flex flex-col overflow-hidden rounded-[36px] bg-white lg:col-span-2 lg:row-span-2">
            <Badge text={family.badge} className="top-5 right-5" />
            <div className="relative h-[220px] shrink-0 overflow-hidden lg:h-auto lg:flex-1">
              <Photo photo={family.photo} tone={family.tone} hint={family.hint} />
            </div>
            <div className="flex items-end justify-between gap-4 p-6 md:p-8">
              <div>
                <h3 className="font-display text-[clamp(30px,3vw,48px)]">{family.title}</h3>
                <p className="mt-2 max-w-[360px] text-[15px] text-muted md:text-[16px]">{family.text}</p>
              </div>
              <p className="shrink-0 text-right">
                <span className="block text-[14px] font-bold text-muted line-through">{family.was}</span>
                <span className="font-display tnum text-[clamp(36px,3.4vw,54px)] text-accent">{family.price}</span>
              </p>
            </div>
          </article>

          {/* date night */}
          <article className="relative grid overflow-hidden rounded-[36px] bg-accent text-white sm:grid-cols-2 lg:col-span-2">
            <div className="relative h-[180px] sm:h-auto">
              <Photo photo={date.photo} tone={date.tone} hint={date.hint} />
            </div>
            <div className="flex flex-col justify-between gap-4 p-6 md:p-7">
              <div>
                <span className="tag !bg-white/20 !text-white">{date.badge}</span>
                <h3 className="font-display mt-3 text-[clamp(26px,2.3vw,36px)]">{date.title}</h3>
                <p className="mt-2 text-[15px] opacity-90">{date.text}</p>
              </div>
              <p className="font-display tnum text-[clamp(32px,2.8vw,44px)]">{date.price}</p>
            </div>
          </article>

          {/* happy hour */}
          <article className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-[36px] p-6 text-[#fff1e6] md:p-7" style={{ background: happy.tone }}>
            <span className="tag self-start !bg-white/15 !text-[#fff1e6]">{happy.badge}</span>
            <div>
              <p className="font-display text-[clamp(40px,3.6vw,60px)] leading-none">{happy.price}</p>
              <h3 className="font-display mt-2 text-[24px]">{happy.title}</h3>
              <p className="mt-1 text-[14px] opacity-85">{happy.text}</p>
            </div>
          </article>

          {/* cakes */}
          <article className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-[36px] p-6 md:p-7" style={{ background: cake.tone }}>
            <Badge text={cake.badge} className="-top-3 -right-3 scale-[0.8]" />
            <span className="tag self-start">{cake.badge}</span>
            <div>
              <h3 className="font-display text-[24px] md:text-[28px]">{cake.title}</h3>
              <p className="mt-1 text-[14px] text-[#2b1233]/80">{cake.text}</p>
              <p className="font-display tnum mt-3 text-[28px] md:text-[32px]">{cake.price}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
