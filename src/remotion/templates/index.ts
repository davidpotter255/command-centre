import type { BettingVideo, TemplateId } from '../types'
import { BestBetVideo, bestBetDuration } from './BestBetVideo'
import { BetBuilderVideo, betBuilderDuration } from './BetBuilderVideo'
import { ModelEdgeVideo, modelEdgeDuration } from './ModelEdgeVideo'
import { ResultToNextPickVideo, resultToNextPickDuration } from './ResultToNextPickVideo'

export type TemplateDefinition = {
  id: TemplateId
  /** Composition id prefix in the Remotion studio, e.g. BestBet-9x16. */
  key: string
  label: string
  blurb: string
  component: React.FC<{ data: BettingVideo }>
  /** Duration is data-dependent — more legs means a longer slip build. */
  duration: (data: BettingVideo) => number
}

export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  'best-bet': {
    id: 'best-bet',
    key: 'BestBet',
    label: 'Best Bet / 3 Reasons',
    blurb: 'Hook, match, three animated reasons, the bet, the edge. The daily format.',
    component: BestBetVideo,
    duration: bestBetDuration,
  },
  'bet-builder': {
    id: 'bet-builder',
    key: 'BetBuilder',
    label: 'Bet Builder Reveal',
    blurb: 'Legs land in the slip one at a time, then the combined price.',
    component: BetBuilderVideo,
    duration: betBuilderDuration,
  },
  'model-edge': {
    id: 'model-edge',
    key: 'ModelEdge',
    label: 'Model Edge',
    blurb: 'Model vs market probability, the gap, then the market it points to.',
    component: ModelEdgeVideo,
    duration: modelEdgeDuration,
  },
  'result-next-pick': {
    id: 'result-next-pick',
    key: 'ResultToNextPick',
    label: 'Yesterday Won → Today',
    blurb: 'Settled slip with the stamp, then straight into today.',
    component: ResultToNextPickVideo,
    duration: resultToNextPickDuration,
  },
}

export const TEMPLATE_LIST = Object.values(TEMPLATES)

export { BestBetVideo, BetBuilderVideo, ModelEdgeVideo, ResultToNextPickVideo }
