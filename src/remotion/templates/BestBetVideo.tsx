import { BetCard } from '../components/BetCard'
import { BrandingFooter } from '../components/BrandingFooter'
import { ConfidenceMeter } from '../components/ConfidenceMeter'
import { CTA } from '../components/CTA'
import { EdgeComparison } from '../components/EdgeComparison'
import { Frame, Safe } from '../components/Frame'
import { Hook } from '../components/Hook'
import { MatchHeader } from '../components/MatchHeader'
import { OddsPill } from '../components/OddsPill'
import { Section } from '../components/Section'
import { StatRow } from '../components/StatRow'
import { fixtureLine, resolveCTA, resolveHook } from '../data/defaults'
import { fonts } from '../fonts'
import { palette, resolveAccent } from '../theme'
import type { BettingVideo } from '../types'
import { impliedProbability, resolveEdge } from '../utils/odds'
import { useLayout } from '../utils/timing'

/**
 * Timeline, in frames at 30fps. Computed from the data so a pick with no
 * reasons or no probabilities produces a tighter video rather than dead air.
 * Exported so `calculateMetadata` and the component agree on one source.
 */
export const bestBetTimeline = (data: BettingVideo) => {
  const reasons = (data.reasons ?? []).slice(0, 3)
  const hasEdgePanel =
    typeof data.confidence === 'number' ||
    (typeof data.modelProbability === 'number' && data.bet?.odds !== undefined)

  const openLength = 66
  const reasonsLength = reasons.length > 0 ? 34 + reasons.length * 22 : 0
  const betLength = 68
  // The edge badge lands 46 frames into EdgeComparison; anything shorter than
  // ~104 flashes the number and cuts, which is the one stat people screenshot.
  const edgeLength = hasEdgePanel ? 104 : 0
  const outroLength = 46

  // Sections overlap by 8 frames so one is always arriving as another leaves.
  const overlap = 8
  const open = 0
  const reasonsStart = open + openLength - overlap
  const betStart = reasonsStart + (reasonsLength || 0) - (reasonsLength ? overlap : 0)
  const edgeStart = betStart + betLength - overlap
  const outroStart = edgeStart + (edgeLength || 0) - (edgeLength ? overlap : 0)

  return {
    reasons,
    hasEdgePanel,
    open: { from: open, length: openLength },
    reasonsSection: { from: reasonsStart, length: reasonsLength },
    bet: { from: betStart, length: betLength },
    edge: { from: edgeStart, length: edgeLength },
    outro: { from: outroStart, length: outroLength },
    total: outroStart + outroLength,
  }
}

export const bestBetDuration = (data: BettingVideo) => bestBetTimeline(data).total

export const BestBetVideo: React.FC<{ data: BettingVideo }> = ({ data }) => {
  const accent = resolveAccent(data.branding?.accent)
  const { t, v } = useLayout()
  const tl = bestBetTimeline(data)

  const implied = data.impliedProbability ?? impliedProbability(data.bet?.odds) ?? undefined
  const edge = resolveEdge(data.edge, data.modelProbability, implied) ?? undefined
  const showEdgeBars =
    typeof data.modelProbability === 'number' && typeof implied === 'number' && typeof edge === 'number'

  return (
    <Frame accent={accent} branding={data.branding}>
      {/* 0.0–2.2s — hook lands on frame 1, match reveals underneath it. */}
      <Section from={tl.open.from} durationInFrames={tl.open.length}>
        <Safe justify="center" gap={70}>
          <Hook text={resolveHook(data)} accent={accent} eyebrow={data.competition} />
          <MatchHeader
            home={data.homeTeam}
            away={data.awayTeam}
            kickoff={data.kickoff}
            accent={accent}
            delay={22}
          />
        </Safe>
      </Section>

      {/* 2.2–5.0s — three reasons, each with its own visualisation. */}
      {tl.reasonsSection.length > 0 && (
        <Section from={tl.reasonsSection.from} durationInFrames={tl.reasonsSection.length}>
          <Safe justify="center" gap={16}>
            <MatchHeader
              home={data.homeTeam}
              away={data.awayTeam}
              competition={data.competition}
              accent={accent}
              compact
            />
            <div style={{ height: v(30) }} />
            {tl.reasons.map((reason, i) => (
              <StatRow
                key={`${reason.label}-${i}`}
                reason={reason}
                accent={accent}
                delay={14 + i * 22}
                index={i}
              />
            ))}
          </Safe>
        </Section>
      )}

      {/* 5.0–7.2s — the payoff. */}
      <Section from={tl.bet.from} durationInFrames={tl.bet.length}>
        <Safe justify="center" gap={34}>
          <div
            style={{
              textAlign: 'center',
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: t(28),
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: palette.textDim,
            }}
          >
            {fixtureLine(data)}
          </div>
          {data.bet && <BetCard bet={data.bet} accent={accent} delay={6} eyebrow="Best Bet" />}
        </Safe>
      </Section>

      {/* 7.2–9.5s — why the price is wrong. */}
      {tl.edge.length > 0 && (
        <Section from={tl.edge.from} durationInFrames={tl.edge.length}>
          {/* Edge bars when we have both probabilities, confidence otherwise.
              Showing both is redundant — model probability and confidence are
              usually the same number wearing a different label. */}
          <Safe justify="center" gap={44}>
            {showEdgeBars ? (
              <EdgeComparison
                modelProbability={data.modelProbability as number}
                impliedProbability={implied as number}
                edge={edge as number}
                accent={accent}
                delay={6}
              />
            ) : (
              typeof data.confidence === 'number' && (
                <ConfidenceMeter confidence={data.confidence} accent={accent} delay={6} />
              )
            )}
          </Safe>
        </Section>
      )}

      {/* Outro — the bet stays on screen so the last frame still sells it. */}
      <Section from={tl.outro.from} durationInFrames={tl.outro.length} exit={0}>
        <Safe justify="center" gap={30}>
          {data.bet && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: v(22) }}>
              <div
                style={{
                  fontFamily: fonts.display,
                  fontWeight: 900,
                  fontSize: t(54),
                  letterSpacing: '-1.5px',
                  textTransform: 'uppercase',
                  color: palette.text,
                  textAlign: 'center',
                }}
              >
                {data.bet.selection}
              </div>
              <OddsPill odds={data.bet.odds} accent={accent} delay={4} size="md" />
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CTA text={resolveCTA(data)} accent={accent} delay={12} />
          </div>
          <BrandingFooter branding={data.branding} accent={accent} delay={18} />
        </Safe>
      </Section>
    </Frame>
  )
}
