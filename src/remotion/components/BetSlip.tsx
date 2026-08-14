import { useCurrentFrame } from 'remotion'
import { fonts, numeric } from '../fonts'
import { palette, radius, springs, tint } from '../theme'
import type { BetBuilderLeg } from '../types'
import { useEnter, useLayout } from '../utils/timing'
import { BetSlipLeg } from './BetSlipLeg'

type Props = {
  legs: BetBuilderLeg[]
  accent: string
  /** Frame the first leg lands. */
  delay: number
  /** Frames between legs. */
  stagger: number
  combinedOdds?: string
  /** Frame the combined-odds footer lands. Defaults to just after the last leg. */
  totalDelay?: number
  title?: string
}

/**
 * The bet slip. Legs slide in one at a time and the slip grows to fit; each new
 * leg nudges the whole slip down a fraction of a percent in scale, which reads
 * as the slip reorganising itself rather than a list appending.
 */
export const BetSlip: React.FC<Props> = ({
  legs,
  accent,
  delay,
  stagger,
  combinedOdds,
  totalDelay,
  title = "Tonight's Bet Builder",
}) => {
  const { t, v } = useLayout()
  const frame = useCurrentFrame()
  const shell = useEnter(delay - 8, springs.heavy)

  const rowHeight = v(legs.length > 4 ? 84 : 96)
  const lastLegDelay = delay + stagger * (legs.length - 1)
  const footerDelay = totalDelay ?? lastLegDelay + 14
  const footer = useEnter(footerDelay, springs.pop)

  // Legs landed so far -> a small settle in scale. Counted off the frame rather
  // than a hook per leg, so the hook order never depends on `legs.length`.
  const landed = legs.filter((_leg, i) => frame >= delay + stagger * i + 6).length
  const settle = 1 - landed * 0.006

  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: `${v(30)}px ${t(28)}px`,
        borderRadius: radius.lg,
        background: `linear-gradient(170deg, ${palette.cardHi}, ${palette.card})`,
        border: `1px solid ${palette.line}`,
        boxShadow: `0 ${v(20)}px ${v(60)}px rgba(0,0,0,0.5)`,
        opacity: shell,
        transform: `translateY(${(1 - shell) * 26}px) scale(${(0.96 + shell * 0.04) * settle})`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: t(12),
          marginBottom: v(22),
          opacity: shell,
        }}
      >
        <span style={{ width: t(8), height: t(8), borderRadius: '50%', background: accent, boxShadow: `0 0 ${t(12)}px ${accent}` }} />
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: t(24),
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: palette.textSecondary,
          }}
        >
          {title}
        </span>
      </div>

      {legs.map((leg, i) => (
        <BetSlipLeg
          key={`${leg.selection}-${i}`}
          leg={leg}
          index={i}
          accent={accent}
          delay={delay + stagger * i}
          rowHeight={rowHeight}
        />
      ))}

      {combinedOdds && (
        <div
          style={{
            marginTop: v(10),
            paddingTop: v(24),
            borderTop: `1px dashed ${palette.lineStrong}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: Math.min(1, footer * 1.5),
            transform: `scale(${0.94 + footer * 0.06})`,
          }}
        >
          <span
            style={{
              fontFamily: fonts.display,
              fontWeight: 800,
              fontSize: t(28),
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: palette.textSecondary,
            }}
          >
            Combined Odds
          </span>
          <span
            style={{
              ...numeric,
              fontWeight: 700,
              fontSize: t(76),
              lineHeight: 1,
              letterSpacing: '-2px',
              color: accent,
              textShadow: `0 0 ${t(40)}px ${tint(accent, 0.5)}`,
            }}
          >
            {combinedOdds}
          </span>
        </div>
      )}
    </div>
  )
}
