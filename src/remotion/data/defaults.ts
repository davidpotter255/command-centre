import type { BettingVideo, TemplateId } from '../types'

/**
 * Copy fallbacks. A pick that only carries teams, a market and a price still
 * produces a complete video — the template fills the words in rather than
 * rendering an empty slot.
 */
const HOOKS: Record<TemplateId, string> = {
  'best-bet': "Tonight's Best Bet 👀",
  'bet-builder': "Tonight's Bet Builder",
  'model-edge': 'The market has this wrong',
  'result-next-pick': 'Yesterday ✅',
}

const CTAS: Record<TemplateId, string> = {
  'best-bet': 'Would you back it?',
  'bet-builder': 'Backing it?',
  'model-edge': 'More edges inside Mission Control.',
  'result-next-pick': "Follow for tomorrow's pick.",
}

export const resolveHook = (data: BettingVideo): string => data.hook?.trim() || HOOKS[data.template]

export const resolveCTA = (data: BettingVideo): string =>
  data.callToAction?.trim() || CTAS[data.template]

/** Fixture as one line — used where a full MatchHeader would be too heavy. */
export const fixtureLine = (data: BettingVideo): string =>
  `${data.homeTeam.shortName || data.homeTeam.name} v ${data.awayTeam.shortName || data.awayTeam.name}`
