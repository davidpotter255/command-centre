import type { BettingVideo } from '../types'

/**
 * Realistic sample data — one per template. These are the studio defaults and
 * the seed for the Video Studio preview, so they double as documentation of
 * what each field is for.
 *
 * Crests are left undefined: TeamCrest falls back to initials, which is what
 * happens in production until a crest source is wired up. Drop PNGs into
 * /public and set `crest: staticFile('crests/arsenal.png')` to use real ones.
 */

const branding: BettingVideo['branding'] = {
  handle: '@commandcentre',
  accent: 'green',
  watermark: 'Command Centre',
}

export const bestBetExample: BettingVideo = {
  template: 'best-bet',
  competition: 'Premier League',
  kickoff: '20:00',
  homeTeam: { name: 'Arsenal' },
  awayTeam: { name: 'Chelsea' },
  hook: 'This price looks too big',
  bet: {
    market: 'Both Teams To Score',
    selection: 'BTTS — Yes',
    odds: '10/11',
  },
  reasons: [
    { label: 'Arsenal have scored in 11 straight', value: '11', viz: 'count' },
    { label: 'Chelsea BTTS in 7 of last 9', percent: 78, value: '78%', viz: 'bar' },
    { label: 'Combined xG average', value: '3.12', viz: 'count' },
  ],
  modelProbability: 71,
  impliedProbability: 52,
  confidence: 71,
  callToAction: 'Would you back it?',
  branding,
}

export const betBuilderExample: BettingVideo = {
  template: 'bet-builder',
  competition: 'Premier League',
  kickoff: '17:30',
  homeTeam: { name: 'Liverpool' },
  awayTeam: { name: 'Newcastle United', shortName: 'Newcastle' },
  hook: "Tonight's Bet Builder",
  betBuilderLegs: [
    { selection: 'Liverpool 1+ Goal', odds: '1.12' },
    { selection: 'Over 1.5 Match Goals', odds: '1.20' },
    { selection: 'Salah 1+ Shot on Target', odds: '1.30' },
    { selection: 'Newcastle 2+ Corners', odds: '1.18' },
  ],
  combinedOdds: '3.40',
  callToAction: 'Backing it?',
  branding,
}

export const modelEdgeExample: BettingVideo = {
  template: 'model-edge',
  competition: 'Premier League',
  kickoff: '16:30',
  homeTeam: { name: 'Manchester United', shortName: 'Man Utd' },
  awayTeam: { name: 'Tottenham Hotspur', shortName: 'Spurs' },
  hook: 'The market has this wrong',
  bet: {
    market: 'Total Goals',
    selection: 'Over 2.5 Goals',
    odds: '5/6',
  },
  modelProbability: 68,
  impliedProbability: 54,
  edge: 14,
  stats: [
    { label: 'Combined xG', value: '3.18' },
    { label: 'O2.5 hit rate', value: '72%' },
    { label: 'Shots on target', value: '10.4' },
  ],
  callToAction: 'More edges inside Command Centre.',
  branding,
}

export const resultToNextPickExample: BettingVideo = {
  template: 'result-next-pick',
  competition: 'Premier League',
  kickoff: '15:00',
  homeTeam: { name: 'Liverpool' },
  awayTeam: { name: 'Brighton & Hove Albion', shortName: 'Brighton' },
  hook: 'Yesterday ✅',
  previousResult: {
    fixture: 'Arsenal v Chelsea',
    selection: 'BTTS — Yes',
    odds: '10/11',
    result: 'won',
    score: '2–1',
  },
  bet: {
    market: 'Total Goals',
    selection: 'Over 2.5 Goals',
    odds: '4/5',
  },
  callToAction: "Follow for tomorrow's pick.",
  branding,
}

export const EXAMPLES = {
  'best-bet': bestBetExample,
  'bet-builder': betBuilderExample,
  'model-edge': modelEdgeExample,
  'result-next-pick': resultToNextPickExample,
} as const
