import ScoopLoader from "./components/ScoopLoader";
import ScoopNav from "./components/ScoopNav";
import MeltHero from "./components/MeltHero";
import FlavourWave from "./components/FlavourWave";
import ScoopShelf from "./components/ScoopShelf";
import ScoopStacker from "./components/ScoopStacker";
import SlowChurn from "./components/SlowChurn";
import TreatBubbles from "./components/TreatBubbles";
import SweetDeals from "./components/SweetDeals";
import LoveNotes from "./components/LoveNotes";
import Parlours from "./components/Parlours";
import MeltFooter from "./components/MeltFooter";
import { builder, flavours } from "./content";
import { meta } from "./site";

const ICON = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="16" fill="#ffc2d4"/><path d="M11.5 16 16 28l4.5-12Z" fill="#e9b170"/><circle cx="16" cy="13" r="7" fill="#d61c5d"/></svg>',
)}`;

/** Melt Theory: a strawberry-milk parlour that melts. Plan + reasons: site/DESIGN.md. */
export default function Page() {
  return (
    <>
      {/* never restore the old scroll position on reload · ?record=1: hide the mouse arrow from the very first frame */}
      <script
        dangerouslySetInnerHTML={{
          __html: `history.scrollRestoration="manual";if(/[?&]record/.test(location.search)){var s=document.createElement("style");s.textContent="*,*::before,*::after{cursor:none!important}html{scrollbar-width:none}html::-webkit-scrollbar{display:none}";document.head.appendChild(s)}`,
        }}
      />
      <link rel="icon" type="image/svg+xml" href={ICON} />
      <ScoopLoader name={meta.loaderText ?? meta.name} cone={builder.cone} scoop={flavours[2].image} />
      <ScoopNav />
      <main className="relative z-[1] overflow-x-clip">
        <MeltHero />
        <FlavourWave />
        <ScoopShelf />
        <ScoopStacker />
        <SlowChurn />
        <TreatBubbles />
        <SweetDeals />
        <LoveNotes />
        <Parlours />
      </main>
      <MeltFooter />
    </>
  );
}
