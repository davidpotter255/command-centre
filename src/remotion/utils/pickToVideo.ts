import type { BettingVideo, Branding, Reason, Stat, TemplateId } from '../types'
import { impliedProbability } from './odds'

/**
 * A pick as Command Centre stores it (see SAMPLE_PICKS in App.jsx).
 * Typed loosely on purpose — picks arrive from paste-import as well as the
 * form, so most fields can be missing or empty strings.
 */
export type Pick = {
  id?: string
  league?: string
  home?: string
  away?: string
  kickoff?: string
  market?: string
  pick?: string
  odds?: number
  confidence?: 'high' | 'medium' | 'low' | string
  edge?: number | null
  xgHome?: number | null
  xgAway?: number | null
  formHome?: string
  formAway?: string
  h2h?: string
  reasoning?: string
  result?: 'won' | 'lost' | 'void' | null
  score?: string
}

/** Wins in a form string as a percentage — "WWDWW" -> 80. */
const formWinRate = (form?: string): number | null => {
  if (!form) return null
  const chars = form.toUpperCase().replace(/[^WDL]/g, '').split('')
  if (chars.length === 0) return null
  return Math.round((chars.filter((c) => c === 'W').length / chars.length) * 100)
}

/**
 * Supporting reasons, built only from fields the pick actually carries.
 *
 * Nothing here is invented: every row restates a stored number. If a pick has
 * no xG, form or H2H, it falls back to the first sentence of the written
 * reasoning rather than filling the slot with a made-up stat.
 */
export const reasonsFromPick = (pick: Pick): Reason[] => {
  const reasons: Reason[] = []

  if (typeof pick.xgHome === 'number' && typeof pick.xgAway === 'number') {
    reasons.push({
      label: 'Projected combined xG',
      value: (pick.xgHome + pick.xgAway).toFixed(2),
      viz: 'count',
    })
  }

  const homeForm = formWinRate(pick.formHome)
  if (homeForm !== null && pick.home) {
    reasons.push({
      label: `${pick.home} form: ${pick.formHome}`,
      value: `${homeForm}%`,
      percent: homeForm,
      viz: 'bar',
    })
  }

  const awayForm = formWinRate(pick.formAway)
  if (reasons.length < 3 && awayForm !== null && pick.away) {
    reasons.push({
      label: `${pick.away} form: ${pick.formAway}`,
      value: `${awayForm}%`,
      percent: awayForm,
      viz: 'bar',
    })
  }

  if (reasons.length < 3 && pick.h2h) {
    reasons.push({ label: `Head-to-head: ${pick.h2h}`, viz: 'tick' })
  }

  if (reasons.length === 0 && pick.reasoning) {
    const firstSentence = pick.reasoning.split(/(?<=\.)\s+/)[0]
    reasons.push({ label: firstSentence, viz: 'tick' })
  }

  return reasons.slice(0, 3)
}

const statsFromPick = (pick: Pick): Stat[] => {
  const stats: Stat[] = []
  if (typeof pick.xgHome === 'number' && typeof pick.xgAway === 'number') {
    stats.push({ label: 'Combined xG', value: (pick.xgHome + pick.xgAway).toFixed(2) })
  }
  const homeForm = formWinRate(pick.formHome)
  if (homeForm !== null) stats.push({ label: 'Home form', value: `${homeForm}%` })
  if (pick.h2h) stats.push({ label: 'H2H', value: pick.h2h })
  return stats.slice(0, 3)
}

/**
 * Pick -> video data.
 *
 * Two deliberate omissions:
 *
 * - `confidence` is only set when the pick carries a real number. Command
 *   Centre stores high/medium/low, and turning "high" into "MODEL CONFIDENCE
 *   78%" on a public post would be inventing a figure the model never produced.
 * - `modelProbability` is derived as implied + edge, which is the definition of
 *   edge, so it restates stored data rather than adding to it. With no stored
 *   edge, both probabilities are left off and the template drops that section.
 */
export const pickToVideo = (
  pick: Pick,
  template: TemplateId,
  overrides: Partial<BettingVideo> = {},
  branding?: Branding,
): BettingVideo => {
  const oddsNumber = typeof pick.odds === 'number' && pick.odds > 1 ? pick.odds : null
  const implied = oddsNumber ? impliedProbability(oddsNumber) : null
  const edge = typeof pick.edge === 'number' && Number.isFinite(pick.edge) ? pick.edge : null
  const model = implied !== null && edge !== null ? Math.round((implied + edge) * 10) / 10 : undefined

  const base: BettingVideo = {
    template,
    competition: pick.league,
    kickoff: pick.kickoff && pick.kickoff !== 'TBD' ? pick.kickoff : undefined,
    homeTeam: { name: pick.home || 'Home' },
    awayTeam: { name: pick.away || 'Away' },
    bet: {
      market: pick.market || '',
      selection: pick.pick || pick.market || '',
      odds: oddsNumber ? oddsNumber.toFixed(2) : '',
    },
    reasons: reasonsFromPick(pick),
    stats: statsFromPick(pick),
    modelProbability: model,
    impliedProbability: implied !== null ? Math.round(implied * 10) / 10 : undefined,
    edge: edge ?? undefined,
    confidence: typeof pick.confidence === 'number' ? pick.confidence : undefined,
    branding,
  }

  return { ...base, ...overrides, branding: overrides.branding ?? branding }
}

/** A settled pick -> the "yesterday" half of the result template. */
export const previousResultFromPick = (pick: Pick): BettingVideo['previousResult'] | undefined => {
  if (!pick.result || pick.result === null) return undefined
  return {
    fixture: `${pick.home || 'Home'} v ${pick.away || 'Away'}`,
    selection: pick.pick || '',
    odds: typeof pick.odds === 'number' ? pick.odds.toFixed(2) : '',
    result: pick.result,
    score: pick.score,
  }
}
