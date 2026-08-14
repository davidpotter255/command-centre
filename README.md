# ⚽ Command Centre — Football Betting Dashboard

Dave's personal football picks dashboard. BrainScript-inspired dark theme with sortable data tables, xG data, form guides, and result tracking.

## Deploy to Vercel (2 minutes)

### Option A: From GitHub (recommended)

1. Push this folder to a new GitHub repo:
```bash
cd command-centre
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/davidpotter255/command-centre.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" → Import your `command-centre` repo
4. Framework: **Vite** (auto-detected)
5. Click **Deploy**
6. Done — you'll get a URL like `command-centre-xyz.vercel.app`

### Option B: Vercel CLI

```bash
npm i -g vercel
cd command-centre
npm install
vercel
```

## Local Development

```bash
npm install
npm run dev
```

## Features

- **Dashboard** — Overview with stats, best picks strip, sortable fixtures table
- **Picks** — Full data table with xG, form, H2H, league/market/confidence filters
- **Fixtures** — Games grouped by league
- **Results** — Settled picks with P&L tracking
- **Import** — Paste script output (JSON or pipe-delimited) or add manually
- **Video Studio** — Turn any pick into a social-ready vertical video (see below)
- **PWA** — Add to home screen on iPhone for app-like experience
- **Persistent** — All data saved to localStorage, survives browser refresh

## Video Engine (Remotion)

Four templates that turn one pick into a 9:16 short for Reels / TikTok / Shorts.

| Template | Composition id | Runtime |
|---|---|---|
| Best Bet / 3 Reasons | `BestBet-9x16` | ~11s |
| Bet Builder Reveal | `BetBuilder-9x16` | ~8.5s |
| Model Edge | `ModelEdge-9x16` | ~10s |
| Yesterday Won → Today | `ResultToNextPick-9x16` | ~7.5s |

`4x5` and `1x1` variants of each are registered too. Duration is computed from the
data, not hardcoded — a five-leg builder runs longer than a three-leg one.

### Preview

In the app: **Video Studio** in the sidebar. Pick a template, pick a saved pick,
edit the hook/CTA, preview live, choose a format.

In the Remotion studio (better for iterating on animation):

```bash
npm run studio
```

### Render

```bash
npm run render -- BestBet-9x16 out/best-bet.mp4
```

To render the exact thing you previewed: hit **Download props JSON** in the Video
Studio, drop `video-props.json` in the project root, then:

```bash
npx remotion render src/remotion/index.ts BestBet-9x16 out/video.mp4 --props=./video-props.json
```

### Structure

```
src/remotion/
  types.ts             BettingVideo — the one data contract
  theme.ts             palette, type scale, spring presets
  fonts.ts             DM Sans + JetBrains Mono, loaded for render parity
  components/          Backdrop, MatchHeader, BetCard, BetSlip, EdgeComparison, …
  templates/           the four compositions + their timelines
  data/examples.ts     realistic sample data, one per template
  utils/pickToVideo.ts Command Centre pick -> video data
  Root.tsx             composition registry
```

### Branding

Nothing is baked in. Set `branding` on the data — `logo`, `handle`, `accent`
(hex or `green|blue|purple|amber|cyan|red`), `watermark` — and the same engine
runs a second brand.

### Team crests

Optional. Without one, `TeamCrest` renders a three-letter code (LIV, BHA). To use
real crests, drop PNGs in `public/crests/` and set
`crest: staticFile('crests/liverpool.png')` on the team.

### Licensing note

Remotion is free for individuals and companies of up to three people; larger
companies need a paid company licence. Worth checking before this runs for
clients. See https://remotion.dev/license

## Import Format

### JSON
```json
[
  {
    "league": "Premier League",
    "home": "Arsenal",
    "away": "Chelsea",
    "kickoff": "15:00",
    "market": "Match Winner",
    "pick": "Arsenal Win",
    "odds": 1.85,
    "confidence": "high",
    "edge": 12.4,
    "xgHome": 1.8,
    "xgAway": 1.1,
    "formHome": "WWDWW",
    "formAway": "LWDLW",
    "h2h": "3W 1D 1L",
    "reasoning": "Arsenal strong at home"
  }
]
```

### Pipe-delimited
```
Premier League | Arsenal vs Chelsea | 15:00 | Match Winner | Arsenal Win | 1.85 | high | 12.4 | Arsenal strong at home
```
