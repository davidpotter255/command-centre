import { fonts } from '../fonts'
import { palette, radius, springs, tint } from '../theme'
import type { Bet } from '../types'
import { fitFontSize, safeWrap } from '../utils/text'
import { useEnter, useLayout } from '../utils/timing'
import { OddsPill } from './OddsPill'

type Props = {
  bet: Bet
  accent: string
  delay?: number
  /** The strap above the selection. */
  eyebrow?: string
  compact?: boolean
}

/**
 * The payoff card. Gets the only real overshoot in the system plus an expanding
 * glow, so the reveal lands as an event rather than another element appearing.
 */
export const BetCard: React.FC<Props> = ({ bet, accent, delay = 0, eyebrow = 'Best Bet', compact = false }) => {
  const { t, v } = useLayout()
  const enter = useEnter(delay, springs.pop)
  const label = useEnter(delay + 4, springs.smooth)

  const selectionSize = fitFontSize(bet.selection, {
    max: compact ? t(64) : t(88),
    min: compact ? t(36) : t(46),
    comfortable: 16,
    overflow: 44,
  })

  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: `${v(compact ? 30 : 44)}px ${t(38)}px ${v(compact ? 32 : 46)}px`,
        borderRadius: radius.lg,
        background: `linear-gradient(165deg, ${palette.cardHi} 0%, ${palette.card} 55%, ${palette.raised} 100%)`,
        border: `1px solid ${tint(accent, 0.3)}`,
        boxShadow: `0 ${v(24)}px ${v(70)}px rgba(0,0,0,0.55), 0 0 ${t(90)}px ${tint(accent, 0.16 * enter)}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: v(compact ? 16 : 24),
        opacity: Math.min(1, enter * 1.5),
        transform: `translateY(${(1 - enter) * 40}px) scale(${0.93 + enter * 0.07})`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent rule across the top edge, wiping outward from centre. */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: `${enter * 100}%`,
          height: 3,
          transform: 'translateX(-50%)',
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />

      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: t(24),
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: accent,
          opacity: label,
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 900,
          fontSize: selectionSize,
          lineHeight: 1.02,
          letterSpacing: '-2px',
          textAlign: 'center',
          textTransform: 'uppercase',
          color: palette.text,
          ...safeWrap,
        }}
      >
        {bet.selection}
      </div>

      {bet.market && bet.market.toLowerCase() !== bet.selection.toLowerCase() && (
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: t(24),
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: palette.textDim,
            opacity: label,
          }}
        >
          {bet.market}
        </div>
      )}

      <OddsPill odds={bet.odds} accent={accent} delay={delay + 8} size={compact ? 'md' : 'lg'} showAlternate />
    </div>
  )
}
