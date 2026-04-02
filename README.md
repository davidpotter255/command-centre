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
- **PWA** — Add to home screen on iPhone for app-like experience
- **Persistent** — All data saved to localStorage, survives browser refresh

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
