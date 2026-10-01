---
name: new-site
description: Build a new showcase website in this Showreel Kit from a short brief (brand, mood, assets), with a fresh design every time. Use when the user asks for a new site, a new brand, "today's site", or to redesign a site.
---

# New showcase site

The user gives a brief like: *"Day [N] — [Brand], a sneaker brand. Black and neon green, energetic. Hero video in raw/hero.mp4."*

Follow `CLAUDE.md` → "Building a new site — Round 0 + 3 rounds". Never skip a round, and stop after each round for the user's "ok". Explain things in plain simple language.

**The repo shows only the current project** (see `CLAUDE.md`): old sites live in their own day folders; git holds only today's site, the engine, the pattern library and the kit docs.

- **Round 0 — Design direction:** first delete the previous site's images and frames (`public/images/<old-slug>/`, `public/frames/<old-slug>-*`) and any demo assets, so only the new site's assets exist. Read `docs/SITES-LOG.md` + `docs/DESIGN-MENU.md`, pick one option per menu (≥ 6 of 8 different from each of the last 3 sites), plan 9–12 sections (hero + cinematic + shop-style), write `site/DESIGN.md`, list missing assets with prompts. The "different from the last sites" table goes in `docs/SITES-LOG.md` only (never in `DESIGN.md`, so old names never enter the repo). Wait for approval.
- **Round 1 — Structure:** archive the old site, frames + images into per-site folders, install fonts, write `site/` from scratch (copy patterns into `site/components/` and restyle them), `npm run check` + `npm run build`. User reviews `http://localhost:3000/?static=1` (laptop + phone).
- **Round 2 — Motion:** tune hero + signature moment; everything interactive also plays by itself on screen. User sends a slow screen recording.
- **Round 3 — Polish:** readability, hover, phone, loader, console clean, set `meta.record.duration` (25–40 s), add a row to `docs/SITES-LOG.md`, `npm run archive -- <day-NN-slug>`. Then run `git ls-files` and confirm the repo holds only the current site's assets, the engine, the pattern library and the kit docs (no other brand names or images); report the list and total size. Reply with the filming steps from `docs/RECORDING.md`.
- **Pattern library:** demos on `/patterns` use plain colour placeholders or the current site's images, never an old site's.
