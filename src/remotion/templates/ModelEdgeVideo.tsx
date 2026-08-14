import { BetCard } from '../components/BetCard'
import { BrandingFooter } from '../components/BrandingFooter'
import { CTA } from '../components/CTA'
import { EdgeComparison } from '../components/EdgeComparison'
import { Frame, Safe } from '../components/Frame'
import { Hook } from '../components/Hook'
import { MatchHeader } from '../components/MatchHeader'
import { Section } from '../components/Section'
import { StatStrip } from '../components/StatStrip'
import { fixtureLine, resolveCTA, resolveHook } from '../data/defaults'
import { fonts, numeric } from '../fonts'
import { palette, resolveAccent, tint } from '../theme'
import type { BettingVideo } from '../types'
import { impliedProbability, resolveEdge } from '../utils/odds'
import { useEnter, useLayout } from '../utils/timing'

export const modelEdgeTimeline = (data: BettingVideo) => {
  const stats = (data.stats ?? []).slice(0, 3)

  const openLength = 58
  // Long enough for the two bars to diverge and the edge badge to hold.
  const edgeLength = 120
  const marketLength = stats.length > 0 ? 82 : 66
  const outroLength = 44
  const overlap = 8

  const edgeStart = openLength - overlap
  const marketStart = edgeStart + edgeLength - overlap
  const outroStart = marketStart + marketLength - overlap

  return {
    stats,
    open: { from: 0, length: openLength },
    edge: { from: edgeStart, length: edgeLength },
    market: { from: marketStart, length: marketLength },
    outro: { from: outroStart, length: outroLength },
    total: outroStart + outroLength,
  }
}

export const modelEdgeDuration = (data: BettingVideo) => modelEdgeTimeline(data).total

/** Mono readout strip — the detail that makes this read as a terminal, not a tipster graphic. */
const Readout: React.FC<{ label: string; accent: string; delay?: number }> = ({ label, accent, delay = 0 }) => {
  const { t, v } = useLayout()
  const enter = useEnter(delay)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: t(14),
        padding: `${v(12)}px ${t(20)}px`,
        borderRadius: 8,
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${palette.line}`,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 12}px)`,
      }}
    >
      <span
        style={{
          width: t(8),
          height: t(8),
          borderRadius: '50%',
          background: accent,
          boxShadow: `0 0 ${t(10)}px ${accent}`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          ...numeric,
          fontWeight: 500,
          fontSize: t(22),
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: palette.textSecondary,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </span>
    </div>
  )
}

export const ModelEdgeVideo: React.FC<{ data: BettingVideo }> = ({ data }) => {
  const accent = resolveAccent(data.branding?.accent)
  const { t, v } = useLayout()
  const tl = modelEdgeTimeline(data)

  const implied = data.impliedProbability ?? impliedProbability(data.bet?.odds) ?? 0
  const model = data.modelProbability ?? 0
  const edge = resolveEdge(data.edge, model, implied) ?? 0

  return (
    <Frame accent={accent} branding={data.branding}>
      {/* Open — the claim, then who it's about. */}
      <Section from={tl.open.from} durationInFrames={tl.open.length}>
        <Safe justify="center" gap={58}>
          <Hook text={resolveHook(data)} accent={accent} eyebrow="Model Edge Found" />
          <MatchHeader
            home={data.homeTeam}
            away={data.awayTeam}
            competition={data.competition}
            accent={accent}
            delay={18}
            compact
          />
        </Safe>
      </Section>

      {/* The evidence. */}
      <Section from={tl.edge.from} durationInFrames={tl.edge.length}>
        <Safe justify="center" gap={40}>
          <Readout label={`${fixtureLine(data)} · model v market`} accent={accent} />
          <EdgeComparison
            modelProbability={model}
            impliedProbability={implied}
            edge={edge}
            accent={accent}
            delay={8}
          />
        </Safe>
      </Section>

      {/* The market it points to, with the numbers behind it. */}
      <Section from={tl.market.from} durationInFrames={tl.market.length}>
        <Safe justify="center" gap={30}>
          {data.bet && <BetCard bet={data.bet} accent={accent} delay={4} eyebrow="The Bet" compact />}
          {tl.stats.length > 0 && <StatStrip stats={tl.stats} accent={accent} delay={26} />}
        </Safe>
      </Section>

      {/* Outro. */}
      <Section from={tl.outro.from} durationInFrames={tl.outro.length} exit={0}>
        <Safe justify="center" gap={28}>
          <div
            style={{
              alignSelf: 'center',
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: t(16),
              padding: `${v(16)}px ${t(34)}px`,
              borderRadius: 999,
              border: `2px solid ${tint(accent, 0.45)}`,
              background: tint(accent, 0.1),
            }}
          >
            <span
              style={{
                ...numeric,
                fontWeight: 700,
                fontSize: t(56),
                color: accent,
                letterSpacing: '-1.5px',
              }}
            >
              {edge >= 0 ? '+' : '−'}
              {Math.abs(edge).toFixed(Math.abs(edge) % 1 === 0 ? 0 : 1)}%
            </span>
            <span
              style={{
                fontFamily: fonts.display,
                fontWeight: 800,
                fontSize: t(28),
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: accent,
              }}
            >
              Edge
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CTA text={resolveCTA(data)} accent={accent} delay={10} />
          </div>
          <BrandingFooter branding={data.branding} accent={accent} delay={16} />
        </Safe>
      </Section>
    </Frame>
  )
}
