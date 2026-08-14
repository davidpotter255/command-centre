import { fonts, numeric } from '../fonts'
import { palette, radius, springs, tint } from '../theme'
import type { Reason } from '../types'
import { fitFontSize, safeWrap } from '../utils/text'
import { rise, useEnter, useLayout } from '../utils/timing'
import { AnimatedNumber } from './AnimatedNumber'
import { PercentageRing } from './PercentageRing'
import { StatBar } from './StatBar'

type Props = {
  reason: Reason
  accent: string
  delay: number
  /** Cycles the default visualisation so three reasons never look identical. */
  index: number
}

const DEFAULT_VIZ: Reason['viz'][] = ['bar', 'ring', 'count']

const Tick: React.FC<{ progress: number; accent: string; size: number }> = ({ progress, accent, size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: tint(accent, 0.16),
      border: `2px solid ${tint(accent, 0.5)}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transform: `scale(${0.6 + progress * 0.4})`,
      opacity: progress,
    }}
  >
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 12.5L9.5 18L20 6"
        stroke={accent}
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={24}
        strokeDashoffset={24 * (1 - progress)}
      />
    </svg>
  </div>
)

/**
 * One supporting reason. Each row owns a small visualisation — a filling bar,
 * a ring, a count-up or a tick — because three identical fade-ins is the exact
 * thing that makes betting content look templated.
 */
export const StatRow: React.FC<Props> = ({ reason, accent, delay, index }) => {
  const { t, v } = useLayout()
  const enter = useEnter(delay, springs.smooth)
  const tick = useEnter(delay + 6, springs.snap)

  const viz = reason.viz ?? (reason.percent !== undefined ? DEFAULT_VIZ[index % DEFAULT_VIZ.length] : 'tick')
  const numericValue = reason.value !== undefined ? parseFloat(String(reason.value)) : NaN
  const canCount = viz === 'count' && Number.isFinite(numericValue)
  const decimals = canCount && String(reason.value).includes('.') ? 2 : 0

  const labelSize = fitFontSize(reason.label, {
    max: t(38),
    min: t(26),
    comfortable: 30,
    overflow: 68,
  })

  return (
    <div
      style={{
        ...rise(enter, 26),
        display: 'flex',
        alignItems: 'center',
        gap: t(22),
        padding: `${v(22)}px ${t(26)}px`,
        borderRadius: radius.md,
        background: `linear-gradient(180deg, ${palette.cardHi}, ${palette.card})`,
        border: `1px solid ${palette.line}`,
        borderLeft: `3px solid ${tint(accent, 0.7)}`,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {viz === 'ring' && reason.percent !== undefined ? (
        <PercentageRing percent={reason.percent} accent={accent} size={t(86)} delay={delay + 4} />
      ) : (
        <Tick progress={tick} accent={accent} size={t(54)} />
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: v(10) }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: labelSize,
            lineHeight: 1.2,
            color: palette.text,
            ...safeWrap,
          }}
        >
          {reason.label}
        </div>

        {viz === 'bar' && reason.percent !== undefined && (
          <StatBar percent={reason.percent} accent={accent} delay={delay + 5} height={t(12)} />
        )}
      </div>

      {reason.value !== undefined && viz !== 'ring' && (
        <div
          style={{
            ...numeric,
            fontWeight: 700,
            fontSize: t(44),
            color: accent,
            letterSpacing: '-1px',
            flexShrink: 0,
          }}
        >
          {canCount ? (
            <AnimatedNumber value={numericValue} delay={delay + 4} decimals={decimals} />
          ) : (
            reason.value
          )}
        </div>
      )}
    </div>
  )
}
