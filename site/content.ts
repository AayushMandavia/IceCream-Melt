// All text + data for Melt Theory. Prices are samples (it's a concept site).
// Photos: `photo` is empty until the real image is in public/images/melt/; the <Photo> placeholder shows `tone` + `hint` meanwhile.

export const STUDIO = "Triozen Tech";

/** Flavour fills (never used for buttons: the UI accent is always strawberry). */
export const FLAVOUR = {
  pistachio: "#bfe3a6",
  mango: "#ffcf4d",
  strawberry: "#ffc2d4",
  coffee: "#ecd3b4",
  cocoa: "#6b3a2a",
  meetha: "#ffe2ad",
  blueberry: "#a9bfff",
};

export type PhotoSlot = { photo?: string; tone: string; hint: string };

export const nav = {
  logo: "Melt Theory",
  links: [
    { label: "Flavours", href: "#flavours" },
    { label: "Build a cone", href: "#build" },
    { label: "Treats", href: "#treats" },
    { label: "Deals", href: "#deals" },
    { label: "Parlours", href: "#parlours" },
  ],
  cta: { label: "Order", href: "#build" },
};

export const hero = {
  word: "MELT",
  pill: { label: "Flavour of the week", value: "Double ka Meetha" },
  heading: ["Small batch.", "*Big* feelings."],
  text: "Hand-churned in Hyderabad every morning, never more than 20 litres at a time. Real fruit, real milk, no shortcuts.",
  ctas: [
    { label: "Pick your scoop", href: "#flavours" },
    { label: "Find a parlour", href: "#parlours" },
  ],
  cone: "/images/melt/cone-hero.webp",
  toppings: [
    { src: "/images/melt/topping-strawberry.webp", alt: "", className: "left-[2%] top-[33%] w-[clamp(70px,10vw,170px)] rotate-[-12deg] md:left-[6%] md:top-[22%]", depth: 0.35 },
    { src: "/images/melt/topping-pistachio.webp", alt: "", className: "right-[4%] top-[30%] w-[clamp(56px,7vw,120px)] rotate-[10deg] md:right-[9%] md:top-[18%]", depth: 0.55 },
    { src: "/images/melt/topping-waffle.webp", alt: "", className: "right-[3%] top-[54%] w-[clamp(60px,8vw,140px)] rotate-[18deg] md:top-auto md:right-[4%] md:bottom-[30%]", depth: 0.25 },
    { src: "/images/melt/topping-chocolate.webp", alt: "", className: "left-[5%] top-[57%] w-[clamp(50px,6vw,110px)] rotate-[-20deg] md:top-auto md:left-[12%] md:bottom-[34%]", depth: 0.45 },
  ],
};

export const wave = {
  top: ["Pistachio Malai", "Alphonso Mango", "Filter Coffee", "Double ka Meetha", "Sitaphal", "Belgian Cocoa"],
  bottom: ["Hand-churned daily", "Small batch", "Made in Hyderabad", "No shortcuts"],
};

export type Flavour = {
  id: string;
  name: string;
  note: string;
  price: number;
  tag?: string;
  fill: string;
  ink: string; // text colour on the fill
  image: string;
};

export const flavours: Flavour[] = [
  { id: "pistachio", name: "Pistachio Malai", note: "Roasted pistachios folded into slow-cooked malai", price: 140, tag: "Bestseller", fill: FLAVOUR.pistachio, ink: "#2b1233", image: "/images/melt/scoop-pistachio.webp" },
  { id: "mango", name: "Alphonso Mango", note: "Ratnagiri Alphonsos, only while the season lasts", price: 140, tag: "Seasonal", fill: FLAVOUR.mango, ink: "#2b1233", image: "/images/melt/scoop-mango.webp" },
  { id: "strawberry", name: "Strawberry Cream", note: "Fresh berries with a ripple of homemade jam", price: 140, tag: "Kids' pick", fill: FLAVOUR.strawberry, ink: "#2b1233", image: "/images/melt/scoop-strawberry.webp" },
  { id: "coffee", name: "Filter Coffee", note: "Real decoction, a little jaggery, very Hyderabad", price: 150, tag: "New", fill: FLAVOUR.coffee, ink: "#2b1233", image: "/images/melt/scoop-coffee.webp" },
  { id: "cocoa", name: "Belgian Cocoa", note: "70% dark chocolate with fudgy chunks", price: 160, tag: "Vegan", fill: FLAVOUR.cocoa, ink: "#fff1e6", image: "/images/melt/scoop-cocoa.webp" },
  { id: "meetha", name: "Double ka Meetha", note: "Saffron cream, caramelised bread, toasted almonds", price: 160, tag: "Only here", fill: FLAVOUR.meetha, ink: "#2b1233", image: "/images/melt/scoop-meetha.webp" },
];

export const shelf = {
  eyebrow: "Today's counter",
  heading: ["Today's", "*scoops*"],
  text: "Six flavours on the counter today. Churned this morning, gone by tonight.",
  unit: "/ scoop",
};

const byId = (id: string) => flavours.find((f) => f.id === id)!;

export const builder = {
  eyebrow: "Build your cone",
  heading: ["Build your", "*cone*"],
  text: "Pick three scoops. We stack them on a waffle cone baked the same morning.",
  cone: "/images/melt/cone-empty.webp",
  coneLine: { name: "Waffle cone", price: "Free" },
  scoops: [byId("pistachio"), byId("mango"), byId("cocoa")],
  tints: ["#fff1f4", "#e9f5e0", "#fff2c9", "#f6e3d8"], // empty cone, then one per scoop
  cta: "Add to order",
};

export const slow = {
  eyebrow: "How it's made",
  heading: ["Made the", "*slow* way"],
  text: "No premix, no powder. Milk comes in at 6 AM and the first batch is on the counter by noon.",
  frames: "/frames/melt-pour",
  alt: "Warm chocolate poured over a vanilla scoop, topped with pistachios",
  panel: "linear-gradient(180deg, #e2c4c6, #ebd7dd)", // the video's own background, so the panel and the video blend
  // [scroll progress, scoop centre as a fraction of the frame width]: the crop follows the scoop as the camera pushes in
  focus: [
    [0, 0.74],
    [0.33, 0.66],
    [0.66, 0.57],
    [1, 0.52],
  ] as [number, number][],
  // stickers stay on the pink left side (desktop) / in a row above the video (phone), never over the scoop
  captions: [
    { title: "Fresh milk", text: "every single morning", at: 0.1, pos: "md:left-[4%] md:bottom-[24%]", fill: "#ffffff" },
    { title: "40 minutes", text: "of slow churning", at: 0.35, pos: "md:left-[13%] md:bottom-[6%]", fill: FLAVOUR.mango },
    { title: "20 litres", text: "max per batch", at: 0.6, pos: "md:left-[21%] md:bottom-[33%]", fill: FLAVOUR.pistachio },
  ],
};

export const treats = {
  eyebrow: "The menu",
  heading: ["Pick a", "*treat*"],
  items: [
    { name: "Scoops", count: "12 flavours", tone: FLAVOUR.strawberry, hint: "Scoops in a cup", photo: "/images/melt/cat-scoops.webp" },
    { name: "Sundaes", count: "8 sundaes", tone: FLAVOUR.mango, hint: "Sundae glass", photo: "/images/melt/cat-sundae.webp" },
    { name: "Family tubs", count: "500 ml · 1 L", tone: FLAVOUR.pistachio, hint: "Tub, top-down", photo: "/images/melt/cat-tub.webp" },
    { name: "Thick shakes", count: "6 shakes", tone: FLAVOUR.coffee, hint: "Milkshake", photo: "/images/melt/cat-shake.webp" },
    { name: "Ice-cream cakes", count: "Order 24 h ahead", tone: FLAVOUR.blueberry, hint: "Ice-cream cake", photo: "/images/melt/cat-cake.webp" },
    { name: "Kulfi", count: "4 kinds", tone: FLAVOUR.meetha, hint: "Kulfi sticks", photo: "/images/melt/cat-kulfi.webp" },
  ],
};

export const deals = {
  eyebrow: "Sweet deals",
  heading: ["Treat", "*everyone*"],
  text: "Something for the whole family, the date night and the 4 PM craving. At every parlour.",
  items: [
    { id: "family", title: "Family tub night", text: "4 tubs of 500 ml, any flavours. Enough for everyone (maybe).", price: "₹999", was: "₹1,240", badge: "Every Sunday", tone: FLAVOUR.pistachio, hint: "Family sharing tubs", photo: "/images/melt/deal-family.webp" },
    { id: "date", title: "Date-night sundae for two", text: "Two spoons, three scoops, warm brownie, hot fudge.", price: "₹449", badge: "After 7 PM", tone: FLAVOUR.strawberry, hint: "Sundae for two", photo: "/images/melt/deal-date.webp" },
    { id: "happy", title: "Second scoop free", text: "Every day between 4 and 6 PM.", price: "4–6 PM", badge: "Happy hour", tone: FLAVOUR.cocoa, hint: "" },
    { id: "cake", title: "Birthday cakes", text: "Any flavour as a cake. Order 24 hours ahead.", price: "from ₹1,199", badge: "Made to order", tone: FLAVOUR.blueberry, hint: "" },
  ],
};

export const notes = {
  eyebrow: "Love notes",
  heading: ["Sticky *fingers*,", "happy hearts"],
  items: [
    { name: "Ananya & friends", where: "Gachibowli", text: "We came for one scoop. We left with a tub each.", rating: 5, tone: FLAVOUR.mango, hint: "Friends with cones", photo: "/images/melt/note-friends.webp", tilt: -4 },
    { name: "Meher, age 7", where: "Jubilee Hills", text: "Strawberry is the best colour AND the best flavour.", rating: 5, tone: FLAVOUR.strawberry, hint: "Kid with a scoop", photo: "/images/melt/note-kid.webp", tilt: 3 },
    { name: "Rahul & Sana", where: "Banjara Hills", text: "Our Friday date is now a Melt Theory date.", rating: 5, tone: FLAVOUR.coffee, hint: "Couple at night", photo: "/images/melt/note-couple.webp", tilt: -2 },
    { name: "The Reddys", where: "Jubilee Hills", text: "Double ka meetha as ice cream. Nani approved.", rating: 5, tone: FLAVOUR.pistachio, hint: "Family on a bench", photo: "/images/melt/note-family.webp", tilt: 4 },
  ],
};

export const parlours = {
  eyebrow: "Our parlours",
  heading: ["Come say", "*hi*"],
  text: "Three pink parlours across Hyderabad. Walk in, sample everything, take your time.",
  photo: { photo: "/images/melt/parlour.webp", tone: FLAVOUR.pistachio, hint: "Parlour interior" },
  items: [
    { name: "Jubilee Hills", note: "The first one. Garden seating.", hours: "12 PM – 11 PM", late: "Till midnight Fri–Sun" },
    { name: "Gachibowli", note: "Near the offices. Fast queue.", hours: "11 AM – 11 PM", late: "Happy hour 4–6 PM" },
    { name: "Banjara Hills", note: "The big one. Cake counter inside.", hours: "12 PM – 12 AM", late: "Open late every day" },
  ],
};

export const footer = {
  word: "MELT THEORY",
  newsletter: {
    title: "Get the new flavour first",
    text: "One email when a new flavour hits the counter. That's it.",
    placeholder: "you@email.com",
  },
  columns: [
    { title: "Eat", links: ["Flavours", "Sundaes", "Family tubs", "Cakes"] },
    { title: "Visit", links: ["Jubilee Hills", "Gachibowli", "Banjara Hills"] },
    { title: "Hello", links: ["Instagram", "Parties & events", "Careers"] },
  ],
  note: `Concept website by ${STUDIO}. Melt Theory is a design concept; flavours and prices are samples.`,
};
