import type { SiteMeta, Theme } from "@/lib/site";

// Settings for THIS site: Melt Theory, a (concept) handcrafted ice-cream brand. Direction: site/DESIGN.md.

export const meta: SiteMeta = {
  name: "Melt Theory",
  title: "Melt Theory — Small batch. Big feelings.",
  description: "Hand-churned, small-batch ice cream. Pistachio malai, Alphonso mango, double ka meetha and more, in scoops, sundaes and family tubs.",
  loaderText: "MELT THEORY",
  loader: false, // site/components/ScoopLoader.tsx replaces the engine loader
  // ?record=1 uses the section timeline (data-record-* attributes on the sections, docs/RECORDING.md): 37 s + the 2.5 s loader.
  // duration is only the fallback for constant-speed mode.
  record: { duration: 37 },
};

export const theme: Theme = {
  bg: "#fff1f4",
  surface: "#ffffff",
  text: "#2b1233",
  muted: "#6f5569",
  accent: "#d61c5d",
  accentText: "#ffffff",
  line: "#f4d3dd",
  fontDisplay: "'Fredoka Variable', 'Fredoka', system-ui, sans-serif",
  fontBody: "'Nunito Variable', 'Nunito', system-ui, sans-serif",
  radius: 999,
  uppercaseHeadings: false,
  heroText: "#2b1233",
};
