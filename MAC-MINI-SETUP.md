# Brief — Command Centre video engine on the Mac mini

Hand this to Claude Code on the Mac mini, or work through it manually. It assumes
nothing is set up there yet.

## What you're moving

The Command Centre football dashboard plus a Remotion video engine that turns one
pick into a 9:16 short for Reels / TikTok / Shorts. Four templates:

| Template | Composition | Runtime |
|---|---|---|
| Best Bet / 3 Reasons | `BestBet-9x16` | 11.7s |
| Bet Builder Reveal | `BetBuilder-9x16` | ~8.5s |
| Model Edge | `ModelEdge-9x16` | ~10s |
| Yesterday Won → Today | `ResultToNextPick-9x16` | ~7.5s |

`4x5` and `1x1` variants of each are registered too. In-app preview lives under
**Video Studio** in the sidebar; rendering is a CLI step.

## 1. Get the code across

The repo is `https://github.com/davidpotter255/command-centre.git`. As of writing,
`origin/main` is at the initial commit `53dc118` — **the entire video engine is
still uncommitted on the MacBook**. Nothing lands on the mini until it's pushed.

On the MacBook first:

```bash
cd ~/Downloads/command-centre && git add -A && git commit -m "Add Remotion video engine" && git push
```

Then on the Mac mini:

```bash
git clone https://github.com/davidpotter255/command-centre.git && cd command-centre
```

If a copy already exists there, `git pull` instead — don't clone a second one.

## 2. Prerequisites

- **Node 18+.** Built and verified on Node 25.8.0, npm 11.11.0. Check with `node -v`.
- **Network access.** Fonts are fetched from Google's CDN at render time, and the
  first render may pull down a headless browser.
- **~700MB free** for `node_modules` (638MB here — Remotion's compositor binary
  and webpack are most of it).
- Apple Silicon: the installed compositor is `@remotion/compositor-darwin-arm64`.
  An Intel mini will pull the x64 build on install instead — fine, just don't copy
  `node_modules` across machines. Always install fresh.

## 3. Install

```bash
npm install
```

**Two pins that matter — do not "upgrade" these:**

- `typescript@^5.9`. Installing `typescript@7` (which is what a bare
  `npm i -D typescript` gives you today) breaks Remotion's bundler with
  `TypeError: Cannot read properties of undefined (reading 'readFile')`. The
  package.json already pins 5.9; leave it.
- `@types/react@^18` / `@types/react-dom@^18`, to match React 18. npm defaults to
  the v19 types, which don't match the runtime.

If either drifts, the symptom shows up at render time, not install time.

## 4. Verify — three checks, in order

```bash
npx tsc --noEmit
```
Should print nothing.

```bash
npm run build
```
Expect two chunks: `index-*.js` ~177kB and `VideoStudio-*.js` ~332kB. If the video
studio chunk isn't separate, the lazy import in `src/App.jsx` has been broken and
the dashboard will carry the whole Remotion bundle on a phone.

```bash
npx remotion still BestBet-9x16 out/check.png --frame=290
```
The slowest step on a fresh machine — it bundles and may download a browser. The
output frame should show the two probability bars and a `+19% EDGE` badge. If the
badge is missing, section timing has drifted; see `bestBetTimeline` in
`src/remotion/templates/BestBetVideo.tsx`.

## 5. Day-to-day use

Dashboard and Video Studio:

```bash
npm run dev
```

Remotion studio — better for iterating on animation, hot-reloads the compositions:

```bash
npm run studio
```

Render with the example data:

```bash
npm run render -- BestBet-9x16 out/best-bet.mp4
```

Render exactly what you previewed: hit **Download props JSON** in the Video Studio,
put `video-props.json` in the project root, then:

```bash
npx remotion render src/remotion/index.ts BestBet-9x16 out/video.mp4 --props=./video-props.json
```

`out/` and `video-props.json` are gitignored — renders stay local.

## 6. Things to know before changing anything

- **Data is localStorage-only.** Picks on the MacBook do not appear on the mini.
  Move them via the Import page (paste JSON) or accept the two machines diverge.
  There is no backend.
- **`pickToVideo.ts` deliberately does not invent numbers.** Command Centre stores
  confidence as high/medium/low; the mapper leaves `confidence` unset rather than
  turning "high" into "MODEL CONFIDENCE 78%" on a public post. `modelProbability`
  is derived as `implied + edge`, which restates stored data rather than adding to
  it. Keep that property if you extend the mapper.
- **Text fitting is character-count based**, not DOM-measured — deliberate, so the
  studio preview and the headless render can't disagree. See `utils/text.ts`.
- **Bottom safe area is 240px at 1920.** Content sits above centre on purpose;
  TikTok and Reels overlay the lower ~15%.
- **Branding is data, not code.** Set `branding` on the video data — `logo`,
  `handle`, `accent`, `watermark`. Nothing is baked into a component, so the same
  engine runs a second brand.
- **Remotion licensing.** Free for individuals and companies up to three people;
  above that it needs a paid company licence. Check this before it renders anything
  client-facing. https://remotion.dev/license

## 7. If the mini is meant to render unattended

Not built yet, and the seams are:

- The Video Studio's export block is one component — swap it for a
  `POST /api/render` when a render service exists.
- For a batch/cron job, skip the UI entirely: write a props JSON per pick and loop
  `npx remotion render` over them. `TEMPLATES` in `src/remotion/templates/index.ts`
  gives you the composition ids and duration functions.
- Headless rendering needs the machine awake — check `pmset` / Energy Saver before
  relying on an overnight schedule.
