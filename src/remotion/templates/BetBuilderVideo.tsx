import { BetSlip } from '../components/BetSlip'
import { BrandingFooter } from '../components/BrandingFooter'
import { CTA } from '../components/CTA'
import { Frame, Safe } from '../components/Frame'
import { Hook } from '../components/Hook'
import { MatchHeader } from '../components/MatchHeader'
import { OddsPill } from '../components/OddsPill'
import { Section } from '../components/Section'
import { fixtureLine, resolveCTA, resolveHook } from '../data/defaults'
import { fonts } from '../fonts'
import { palette, resolveAccent } from '../theme'
import type { BettingVideo } from '../types'
import { combineOdds } from '../utils/odds'
import { useEnter, useLayout } from '../utils/timing'

const LEG_STAGGER = 20

export const betBuilderTimeline = (data: BettingVideo) => {
  const legs = (data.betBuilderLegs ?? []).slice(0, 6)

  const openLength = 62
  // Room for every leg to land, then a beat before the price.
  const slipLength = 26 + legs.length * LEG_STAGGER + 56
  const outroLength = 48
  const overlap = 8

  const slipStart = openLength - overlap
  const outroStart = slipStart + slipLength - overlap

  return {
    legs,
    open: { from: 0, length: openLength },
    slip: { from: slipStart, length: slipLength },
    outro: { from: outroStart, length: outroLength },
    total: outroStart + outroLength,
  }
}

export const betBuilderDuration = (data: BettingVideo) => betBuilderTimeline(data).total

export const BetBuilderVideo: React.FC<{ data: BettingVideo }> = ({ data }) => {
  const accent = resolveAccent(data.branding?.accent)
  const { t, v } = useLayout()
  const tl = betBuilderTimeline(data)

  const combined =
    data.combinedOdds ?? combineOdds(tl.legs.map((leg) => leg.odds)) ?? undefined

  return (
    <Frame accent={accent} branding={data.branding}>
      {/* Open — hook, then the fixture the builder is on. */}
      <Section from={tl.open.from} durationInFrames={tl.open.length}>
        <Safe justify="center" gap={66}>
          <Hook text={resolveHook(data)} accent={accent} eyebrow={data.competition} />
          <MatchHeader
            home={data.homeTeam}
            away={data.awayTeam}
            kickoff={data.kickoff}
            accent={accent}
            delay={20}
            compact
          />
        </Safe>
      </Section>

      {/* The slip building itself — the centrepiece of this template. */}
      <Section from={tl.slip.from} durationInFrames={tl.slip.length}>
        <Safe justify="center" gap={26}>
          <div
            style={{
              textAlign: 'center',
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: t(30),
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: palette.textDim,
            }}
          >
            {fixtureLine(data)}
          </div>
          <BetSlip
            legs={tl.legs}
            accent={accent}
            delay={14}
            stagger={LEG_STAGGER}
            combinedOdds={combined}
            title="Bet Builder"
          />
        </Safe>
      </Section>

      {/* Outro — price held large, then the ask. */}
      <Section from={tl.outro.from} durationInFrames={tl.outro.length} exit={0}>
        <Safe justify="center" gap={32}>
          <PriceOutro
            legCount={tl.legs.length}
            combined={combined}
            accent={accent}
            t={t}
            v={v}
          />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CTA text={resolveCTA(data)} accent={accent} delay={14} />
          </div>
          <BrandingFooter branding={data.branding} accent={accent} delay={20} />
        </Safe>
      </Section>
    </Frame>
  )
}

const PriceOutro: React.FC<{
  legCount: number
  combined?: string
  accent: string
  t: (px: number) => number
  v: (px: number) => number
}> = ({ legCount, combined, accent, t, v }) => {
  const enter = useEnter(2)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: v(20),
        opacity: enter,
        transform: `translateY(${(1 - enter) * 18}px)`,
      }}
    >
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: t(30),
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: palette.textSecondary,
        }}
      >
        {legCount}-Leg Builder
      </span>
      {combined && <OddsPill odds={combined} accent={accent} delay={6} size="lg" showAlternate />}
    </div>
  )
}
