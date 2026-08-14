/**
 * The single data contract for every video template.
 *
 * Everything except `template` and the two teams is optional, so a partially
 * populated pick still renders — templates degrade gracefully rather than
 * throwing or showing empty boxes. Populate it from Mission Control, a JSON
 * file, a sheet or an API; the components never know the difference.
 */

export type TemplateId = 'best-bet' | 'bet-builder' | 'model-edge' | 'result-next-pick'

export type Team = {
  name: string
  /** Used when `name` is too long for the layout — e.g. "Man Utd", "Spurs". */
  shortName?: string
  /** URL, data URI, or a `staticFile()` path in /public. */
  crest?: string
}

export type Bet = {
  market: string
  selection: string
  /** Free-form so both "10/11" and "1.91" work. */
  odds: string
}

export type Reason = {
  label: string
  value?: string
  /**
   * Drives which animation the reason gets. Omit and the template picks one
   * per row so three reasons never animate identically.
   */
  viz?: 'tick' | 'bar' | 'ring' | 'count'
  /** 0–100. Required for `bar` and `ring`. */
  percent?: number
}

export type Stat = {
  label: string
  value: string | number
}

export type BetBuilderLeg = {
  selection: string
  odds?: string
}

export type PreviousResult = {
  fixture: string
  selection: string
  odds: string
  result: 'won' | 'lost' | 'void'
  score?: string
}

export type Branding = {
  logo?: string
  handle?: string
  /** Hex, or a palette token name: green | blue | purple | amber | cyan | red. */
  accent?: string
  /** Small always-on watermark, top right. */
  watermark?: string
}

export type BettingVideo = {
  template: TemplateId

  competition?: string
  kickoff?: string

  homeTeam: Team
  awayTeam: Team

  hook?: string

  bet?: Bet
  reasons?: Reason[]

  /** 0–100. */
  modelProbability?: number
  /** 0–100. */
  impliedProbability?: number
  /** Percentage points. Derived from the two above when omitted. */
  edge?: number
  /** 0–100. */
  confidence?: number

  stats?: Stat[]

  betBuilderLegs?: BetBuilderLeg[]
  combinedOdds?: string

  previousResult?: PreviousResult

  callToAction?: string
  branding?: Branding
}

export type FormatId = '9:16' | '4:5' | '1:1'

export type Format = {
  id: FormatId
  label: string
  width: number
  height: number
}

export const FORMATS: Record<FormatId, Format> = {
  '9:16': { id: '9:16', label: 'Reels / TikTok / Shorts', width: 1080, height: 1920 },
  '4:5': { id: '4:5', label: 'Instagram Feed', width: 1080, height: 1350 },
  '1:1': { id: '1:1', label: 'Square / X', width: 1080, height: 1080 },
}

export const FPS = 30
