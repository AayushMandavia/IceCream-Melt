import DripEdge from "./DripEdge";
import Heading from "./Heading";
import { flavours, shelf } from "../content";

/** ProductGrid → capsule cards: each flavour in its own colour, round top, the scoop sitting in the dome, price in a white pill. */
export default function ScoopShelf() {
  return (
    <section id="flavours" className="relative z-[1] pt-[clamp(110px,13vw,200px)] pb-[clamp(80px,10vw,150px)]">
      <DripEdge color="var(--pistachio)" layout={1} />
      <div className="container-x">
        <div
          className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="eyebrow">{shelf.eyebrow}</p>
            <Heading lines={shelf.heading} className="mt-5 text-[clamp(48px,6vw,104px)]" />
          </div>
          <p className="max-w-[340px] text-[17px] leading-relaxed text-muted">{shelf.text}</p>
        </div>

        <div data-reveal="stagger" className="mt-12 grid grid-cols-2 gap-x-3 gap-y-5 md:mt-16 lg:grid-cols-3 lg:gap-7">
          {flavours.map((f, k) => (
            <article
              key={f.id}
              {...(k === 0 && {
                // ?record=1 stop: the whole first row (names + prices) just above the bottom of the screen.
                // Measured before the card's reveal (it starts 48px lower), so the offsets are the gap wanted minus 48.
                "data-record-label": "Today's scoops (hold)",
                "data-record-time": "1.5",
                "data-record-hold": "2",
                "data-record-align": "bottom",
                "data-record-offset": "40",
                "data-record-offset-mobile": "80",
              })}
              className="capsule group relative flex flex-col pt-[9%] transition-transform duration-500 hover:-translate-y-2" style={{ background: f.fill, color: f.ink }} data-cursor="Add">
              <div className="relative mx-auto w-[70%]">
                <img src={f.image} alt={`${f.name} scoop`} width={1000} height={1000} className="aspect-square w-full object-contain object-bottom drop-shadow-[0_22px_18px_rgba(60,10,30,.2)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-2 group-hover:-rotate-6" />
              </div>
              <div className="flex flex-1 flex-col px-4 pt-4 pb-4 md:px-7 md:pt-6 md:pb-7">
                {f.tag && <span className="tag self-start !text-[#2b1233]">{f.tag}</span>}
                <h3 className="font-display mt-3 text-[clamp(22px,2.3vw,36px)]">{f.name}</h3>
                <p className="mt-2 hidden text-[15px] leading-snug opacity-85 md:block">{f.note}</p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-4 md:pt-6">
                  <span className="rounded-full bg-white px-3 py-2 text-[14px] font-extrabold text-[#2b1233] md:px-4 md:text-[16px]">
                    <span className="tnum">₹{f.price}</span> <span className="hidden font-bold text-muted sm:inline">{shelf.unit}</span>
                  </span>
                  <button aria-label={`Add ${f.name}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-[22px] leading-none font-bold text-white shadow-[0_4px_0_var(--accent-deep)] transition-transform hover:translate-y-[2px] md:h-12 md:w-12">
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
