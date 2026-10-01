# Design direction: Melt Theory (Day 3)

**Brief:** Melt Theory, a handcrafted small-batch ice-cream brand in Hyderabad. Audience: young people, families, date nights. Mood: playful, fresh, colourful. Must look nothing like the last two sites (both dark): **light, bright background and soft rounded shapes**. Assets: none yet.

**The idea in one line:** *a strawberry-milk parlour that melts.* A soft pink page, round chunky type, scoops that drop and squish, and sections that **drip** into each other like a scoop on a hot Hyderabad afternoon. Everything is round: pills, capsules, circles, blobs. No hard corners anywhere.

## Choices (codes from docs/DESIGN-MENU.md)

| | Choice | Why |
|---|---|---|
| Look | **L3 Candy playful**: flat pastel colour blocks, rounded everything, chunky type, a few floating toppings | The brand is joy in a cone: bright, sweet, friendly |
| Palette | **Strawberry milk** (new): bg `#fff1f4` · surface `#ffffff` · text `#2b1233` (deep berry) · muted `#6f5569` · accent `#d61c5d` (strawberry; darkened from #e8266a so white button text and pink prices pass 4.5:1) · accent-fg `#ffffff`. **Flavour colours** (used only as section/card fills, never for buttons): pistachio `#bfe3a6`, mango `#ffcf4d`, blueberry `#a9bfff`, cocoa `#6b3a2a` | Light and bright from the first frame. One UI accent (strawberry); the flavour colours are the "scoops". Contrast checked in Round 1 |
| Type pair | **T12 Fredoka (600–700) + Nunito**, plus **Caveat** script for one hand-written word per heading ("*handmade*", "*yours*") | Round, soft, friendly letters that match the rounded shapes |
| Nav | **N2 Floating centre pill** (`NavPill` → `ScoopNav`): white pill with soft shadow, small wordmark · Flavours · Sundaes · Tubs · Parlours · pink "Order" pill with a scoop count. The active link fills with a pink blob. Phone: pill with wordmark + "Menu" → full pink sheet with huge round links | Light and friendly; the Order count gives it a real-shop feel |
| Hero | **H5 Giant brand word behind a centred product**: huge "MELT" in Fredoka (outlined pink over a pink blob), a big triple-scoop waffle cone floating in front of it, a few toppings (pistachio, strawberry, waffle bits, sprinkles) drifting around it. Line: "Small batch. *Big* feelings." + "Pick your scoop" / "Find a parlour". Bottom edge **drips** into the next section | The brand name and the product in one frame. No video, so it looks sharp from frame one |
| Section shape | **S2 Waves, "melt drip" version** (new custom `DripEdge`): sections meet with a dripping edge, as if the colour above is melting onto the one below. Drips stretch a little with scroll | Melting ice cream is the brand story; it ties every section together |
| Cards | **C2 Rounded "capsule"**: tall cards with a fully round top, each filled with its flavour colour, the scoop cut-out sitting on top, price in a white pill. Categories use **C8 circles** | The round tops echo scoops and cones; each card is its flavour colour |
| Signature moment | **"Build your cone"** (new, custom `ScoopStacker`): a pinned section. As you scroll, 3 scoops drop one by one onto an empty waffle cone with a soft squish, the background colour follows each flavour, and a little receipt on the right adds up ("Pistachio Malai ₹140 + Alphonso Mango ₹140 + Belgian Cocoa ₹160 = ₹440"). Driven by scroll, so it plays by itself in `?record=1`. Supporting: **wavy flavour marquee** (text running along a wave) + **the drip edges** | It *adds* scoops rather than switching, and it ends on a price, so a client sees "shop" and "wow" at once |
| Loader | **Scoop drop** (new, fixed-length loader like `patterns/StartLightsLoader`): a waffle cone on pink, a scoop drops in with a squish, "MELT THEORY" pops up, then a pink circle expands from the cone and opens the page (I5 circle). Fixed ~2.5 s, supports `&at=` | Shows the brand and the product before the page opens |

**About "one accent":** buttons, prices, links and the nav are always strawberry. The flavour colours only fill cards and colour bands (pistachio marquee, mango deals band, blueberry notes band). That is on purpose and makes it read as an ice-cream counter.

**Motion feel: playful but calm.** Soft floats and drifts (slow `sine.inOut`), reveals with `power3.out`. The only "bounce" allowed is **one small squish** when a scoop lands (scaleY 0.9 → 1, no wobbling). One thing moves at a time per section.

## Section plan (11)

| # | Section | Kind | Starts from | How it's restyled |
|---|---|---|---|---|
| 1 | **Nav** | — | NavPill → `ScoopNav` | White floating pill, pink blob behind the active link, "Order (0)" pill; the count bumps when the cone is built in #5. Phone: pink full-screen sheet |
| 2 | **Hero: "Small batch. Big feelings."** | cinematic | custom → `MeltHero` | Pink bg + soft blob, giant outlined "MELT" behind the cone, cone floats gently, toppings drift with a little parallax. On scroll the cone lifts and "MELT" slides apart. Pill "Flavour of the week: Double ka Meetha". Drip edge at the bottom |
| 3 | **Flavour wave** | cinematic (supporting) | Marquee → `FlavourWave` | Pistachio band; flavour names run **along a wavy line** (SVG text path), a second smaller row in the other direction. Scroll speeds it up. "PISTACHIO MALAI · ALPHONSO MANGO · FILTER COFFEE · DOUBLE KA MEETHA · SITAPHAL ·" |
| 4 | **Today's scoops** | shop | ProductGrid → `ScoopShelf` | 6 capsule cards in 2 rows of 3 (phone: sideways swipe row), each in its flavour colour, scoop on top, tags ("BESTSELLER", "VEGAN", "NEW"), "₹140 / scoop" in a white pill. Cards drift up in a stagger; on hover the scoop tilts |
| 5 | **Build your cone** (signature) | cinematic + shop | custom → `ScoopStacker` | Pinned ~2.5 screens. See the signature row above. Step dots "1 · 2 · 3", ends on "Your cone: ₹440 · Add to order" and the nav count bumps to 1 |
| 6 | **Made slow** | cinematic | FrameScrub → `SlowChurn` | A big rounded panel (32 px corners) inside the page. **Scroll video** of warm chocolate being poured over a scoop (optional, see assets), with 3 captions that pop in as round stickers: "Fresh milk, every morning" · "Churned for 40 minutes" · "Never more than 20 litres a batch". If there's no video, the same panel uses a photo with a slow zoom |
| 7 | **Pick a treat** | shop | custom → `TreatBubbles` | 6 circle photos (C8) on a white band: Scoops · Sundaes · Family tubs · Thick shakes · Ice-cream cakes · Kulfi, each with a count ("12 flavours"). They pop in one by one; the circle grows a pink ring on hover |
| 8 | **Sweet deals** | shop | Bento → `SweetDeals` | **Colour flip: mango band.** Rounded bento of blobs: "Family tub night · 4 tubs ₹999" (big), "Date night sundae for two · ₹449", "4–6 PM: second scoop free", "Birthday cakes · order 24 h ahead". Each tile has a round badge sticker that slowly spins |
| 9 | **Love notes** | shop | PolaroidWall → `LoveNotes` | Blueberry band. 4 rounded photo stickers (friends, a kid, a couple on a date night, a family) slightly tilted, each with a short hand-written (Caveat) note and a star rating. They settle into place as you scroll |
| 10 | **Our parlours** | shop | custom → `Parlours` | Parlour photo in a big arch-rounded frame on the left; right: 3 round-cornered cards: Jubilee Hills · Gachibowli · Banjara Hills, hours ("Open till midnight on weekends"), "Directions" pill (no real addresses / phones) |
| 11 | **Footer** | — | WordmarkFooter → `MeltFooter` | Huge "MELT THEORY" in pink whose letters **drip** longer as you scroll to the end; newsletter "Get the new flavour first", link columns, "Concept website by <studio>" |

Unchanged patterns imported: 0 (everything copied + restyled).

## Record timeline (section timeline, docs/RECORDING.md)

Final: **37 s after the 2.5 s loader** (~39.5 s in all), the same seconds on laptop and phone.

| Stop | Move (s) | Hold (s) | What plays |
|---|---|---|---|
| Hero | 0 | 3 | cone floats, toppings drift |
| Flavour wave | 1.5 | | wave text speeds up |
| Today's scoops | 1.5 | 2 | cards drift in |
| Build your cone (pin) | 1 → 6 | | 3 scoops drop, receipt adds up, nav count bumps |
| Made slow | 1.5 → 3.5 | | pour video scrubs, 3 captions |
| Pick a treat | 1.5 | 1.5 | circles pop in |
| Sweet deals | 1.5 | 2 | badges spin |
| Love notes | 1.5 | 1.5 | stickers settle |
| Parlours | 1.5 | 2.5 | phone: all 3 cards on screen |
| Footer | 1.5 | 2 | letters drip, then rest on MELT THEORY |

## Uniqueness check

Compared with the last 3 sites: 8 of 8 choices different (look, palette, type pair, nav, hero, section shape, cards, signature). The comparison table is in `docs/SITES-LOG.md`.

## Assets needed

Nothing exists yet. Tool: **Google Flow**, images with **Nano Banana Pro**.

**Style words for every photo** (one mood): `bright soft daylight, high-key, pastel strawberry-pink background, creamy textures, fresh and playful, soft natural shadows, vibrant but soft colours, photorealistic, no text, no logos`

### A. Cut-outs (transparent PNG, background removed in Photoroom / Adobe Express, full-size download, **at least 1500 px tall**) → `raw/` (I'll convert to WebP in Round 1)

Make them in **one chat** so the scoops share one angle and light. Start with:
`Single scoop of [FLAVOUR] ice cream, round hand-scooped ball with soft ridges and a slightly melting base, seen from the front and slightly above, centred, whole scoop in frame with space around it, plain pure white background, soft studio light, sharp, no cone, no bowl, no shadow, no text, 4K resolution`

1. `scoop-pistachio.png`: *pistachio malai: pale green, flecks of chopped pistachio*
2. `scoop-mango.png`: *Alphonso mango: bright sunny yellow-orange, silky*
3. `scoop-strawberry.png`: *strawberry cream: soft pink with red strawberry swirls*
4. `scoop-coffee.png`: *filter coffee: light caramel brown, creamy*
5. `scoop-cocoa.png`: *Belgian dark cocoa: deep chocolate brown with chocolate chunks*
6. `scoop-meetha.png`: *double ka meetha: saffron cream with caramelised bread pieces and a few almonds*
7. `cone-empty.png`: `Empty crisp golden waffle cone standing upright, seen from the front and slightly above so the open top is visible, same angle and light as the scoops, plain pure white background, no shadow, no text, 4K resolution`
8. `cone-hero.png`: `Tall waffle cone with three stacked scoops (pistachio green at the bottom, strawberry pink in the middle, mango yellow on top), a drizzle of white chocolate and a few chopped pistachios, one slow drip running down the cone, front view, centred, plain pure white background, soft studio light, sharp, no shadow, no text, 4K resolution`
9. `toppings`: 4 small cut-outs, same light: `a halved fresh strawberry` · `a small pile of shelled pistachios` · `a broken piece of waffle cone` · `a chunk of dark chocolate` (each: `…floating, plain pure white background, no shadow, no text`)

### B. Photos (landscape 3:2 unless noted, add the style words) → `raw/`

10. **Category circles (square 1:1)**, each on a solid pastel background:
    `scoops in a pink paper cup` · `a tall sundae glass with scoops, sauce and a cherry` · `a 500 ml ice-cream tub with the lid off, top-down` · `a thick milkshake in a glass with whipped cream and a paper straw` · `a round ice-cream cake with pastel frosting and sprinkles` · `two kulfi sticks with pistachio crumbs on a small plate`
11. **Deals (2)**: `a family of four sharing ice-cream tubs at a pastel table, laughing, bright afternoon` · `a date-night sundae for two with two spoons on a marble table, warm fairy lights, evening`
12. **Love notes (4, portrait 4:5)**: `a group of college friends laughing with ice-cream cones on a sunny street` · `a little girl with a pink scoop on her nose, candid` · `a young couple sharing a cone at night under warm string lights` · `grandparents and a grandchild with cups of ice cream on a parlour bench`
13. **Parlour (portrait 4:5)**: `Inside a small modern ice-cream parlour, pastel pink and pistachio walls, rounded counter, glass freezer with colourful tubs of gelato, round pendant lights, bright and airy, no people, no readable text`

### C. Video (optional but recommended, for #6 "Made slow")

Key image first: `A single scoop of vanilla bean ice cream in a pink ceramic bowl, on the right half of the frame, pastel pink background, calm empty space on the left, bright soft studio light, photorealistic, shallow depth of field, no text, no logos`

Then video (template F / A):
`Start exactly from the reference image. Warm glossy melted dark chocolate is slowly poured from above onto the scoop and flows down its sides, a few chopped pistachios fall onto it. Slow motion, the camera pushes in slowly and smoothly the whole time. One continuous shot, no cuts, no camera shake. no text, no logos`
8 s, 16:9 → save as `raw/pour.mp4`. I'll run `npm run frames -- raw/pour.mp4 frames/melt-pour --zoom 1.2 --max 160`.

**Total: 9 cut-outs (+4 small toppings), 13 photos, 1 optional video.** If that's too many for today, the minimum set is: the 6 scoops + empty cone + hero cone (the signature and the hero need them); the rest can start as flat colour placeholders and be swapped in later.

## Assets status (29 Sep)

All in. 12 cut-outs + 13 photos converted to WebP in `public/images/melt/` (photos auto-oriented; the cut-outs trimmed to their edges). `pour.mp4` → `public/frames/melt-pour` (160 frames, `--zoom 1.25`, 5.6 MB).

**Made slow, changed from the plan:** the pour video is light pink, not dark, and the camera pushes in until the scoop fills the frame. So the panel is now the video's own pink (no dark overlay, dark text), the video sits in the right ~64% (phone: bottom ~56%) and fades into the panel, and the crop follows the scoop from right to centre (`slow.focus` in content.ts). The three stickers live on the empty pink left side (phone: a row under the heading), so they never cover the scoop.
