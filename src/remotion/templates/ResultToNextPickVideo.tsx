import { BetCard } from '../components/BetCard'
import { BrandingFooter } from '../components/BrandingFooter'
import { CTA } from '../components/CTA'
import { Frame, Safe } from '../components/Frame'
import { Hook } from '../components/Hook'
import { MatchHeader } from '../components/MatchHeader'
import { ResultStamp } from '../components/ResultStamp'
import { Section } from '../components/Section'
import { resolveCTA, resolveHook } from '../data/defaults'
import { fonts, numeric } from '../fonts'
import { palette, radius, resolveAccent, springs, tint } from '../theme'
import type { BettingVideo, PreviousResult } from '../types'
import { fitFontSize, safeWrap } from '../utils/text'
import { useEnter, useLayout } from '../utils/timing'

export const resultToNextPickTimeline = (data: BettingVideo) => {
  const hasPrevious = Boolean(data.previousResult)

  const yesterdayLength = hasPrevious ? 92 : 0
  const todayLength = 96
  const outroLength = 46
  const overlap = 8

  const todayStart = hasPrevious ? yesterdayLength - overlap : 0
  const outroStart = todayStart + todayLength - overlap

  return {
    hasPrevious,
    yesterday: { from: 0, length: yesterdayLength },
    today: { from: todayStart, length: todayLength },
    outro: { from: outroStart, length: outroLength },
    total: outroStart + outroLength,
  }
}

export const resultToNextPickDuration = (data: BettingVideo) => resultToNextPickTimeline(data).total

/**
 * Yesterday's slip. Settled, greyed slightly, with the stamp landing on top —
 * proof rather than celebration, which is the difference between trust-building
 * and looking like a casino ad.
 */
const PreviousCard: React.FC<{ previous: PreviousResult; accent: string; delay: number }> = ({
  previous,
  accent,
  delay,
}) => {
  const { t, v } = useLayout()
  const enter = useEnter(delay, springs.heavy)
  const won = previous.result === 'won'
  const colour = won ? accent : previous.result === 'lost' ? palette.red : palette.textDim

  const selectionSize = fitFontSize(previous.selection, {
    max: t(56),
    min: t(34),
    comfortable: 18,
    overflow: 44,
  })

  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: `${v(34)}px ${t(34)}px`,
        borderRadius: radius.lg,
        background: `linear-gradient(170deg, ${palette.card}, ${palette.raised})`,
        border: `1px solid ${tint(colour, 0.28)}`,
        display: 'flex',
        flexDirection: 'column',
        gap: v(16),
        opacity: enter,
        transform: `translateY(${(1 - enter) * 30}px) scale(${0.95 + enter * 0.05})`,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t(16) }}>
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: t(26),
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: palette.textDim,
            ...safeWrap,
          }}
        >
          {previous.fixture}
        </span>
        {previous.score && (
          <span style={{ ...numeric, fontWeight: 700, fontSize: t(34), color: palette.textSecondary }}>
            {previous.score}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t(20) }}>
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: 900,
            fontSize: selectionSize,
            letterSpacing: '-1.5px',
            textTransform: 'uppercase',
            color: palette.text,
            ...safeWrap,
          }}
        >
          {previous.selection}
        </span>
        <span
          style={{
            ...numeric,
            fontWeight: 700,
            fontSize: t(46),
            color: palette.textSecondary,
            flexShrink: 0,
          }}
        >
          {previous.odds}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: v(6) }}>
        <ResultStamp result={previous.result} accent={accent} delay={delay + 18} />
      </div>
    </div>
  )
}

export const ResultToNextPickVideo: React.FC<{ data: BettingVideo }> = ({ data }) => {
  const accent = resolveAccent(data.branding?.accent)
  const { t, v } = useLayout()
  const tl = resultToNextPickTimeline(data)

  return (
    <Frame accent={accent} branding={data.branding}>
      {/* Yesterday — card lifts away as it exits, handing off to today. */}
      {tl.hasPrevious && data.previousResult && (
        <Section
          from={tl.yesterday.from}
          durationInFrames={tl.yesterday.length}
          exit={12}
          exitLift={90}
        >
          <Safe justify="center" gap={54}>
            <Hook text={resolveHook(data)} accent={accent} />
            <PreviousCard previous={data.previousResult} accent={accent} delay={16} />
          </Safe>
        </Section>
      )}

      {/* Today — condensed Best Bet. */}
      <Section from={tl.today.from} durationInFrames={tl.today.length}>
        <Safe justify="center" gap={36}>
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 900,
              fontSize: t(58),
              letterSpacing: '-1px',
              textTransform: 'uppercase',
              color: palette.text,
              textAlign: 'center',
            }}
          >
            Today 👇
          </div>
          <MatchHeader
            home={data.homeTeam}
            away={data.awayTeam}
            competition={data.competition}
            kickoff={data.kickoff}
            accent={accent}
            delay={8}
            compact
          />
          {data.bet && <BetCard bet={data.bet} accent={accent} delay={34} eyebrow="Today's Bet" compact />}
        </Safe>
      </Section>

      {/* Outro. */}
      <Section from={tl.outro.from} durationInFrames={tl.outro.length} exit={0}>
        <Safe justify="center" gap={30}>
          {data.bet && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: v(18) }}>
              <span
                style={{
                  fontFamily: fonts.display,
                  fontWeight: 900,
                  fontSize: t(52),
                  letterSpacing: '-1.5px',
                  textTransform: 'uppercase',
                  color: palette.text,
                  textAlign: 'center',
                  ...safeWrap,
                }}
              >
                {data.bet.selection}
              </span>
              <span
                style={{
                  ...numeric,
                  fontWeight: 700,
                  fontSize: t(72),
                  color: accent,
                  letterSpacing: '-2px',
                }}
              >
                {data.bet.odds}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CTA text={resolveCTA(data)} accent={accent} delay={10} />
          </div>
          <BrandingFooter branding={data.branding} accent={accent} delay={16} />
        </Safe>
      </Section>
    </Frame>
  )
}
