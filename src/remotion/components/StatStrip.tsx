import { fonts, numeric } from '../fonts'
import { palette, radius, springs } from '../theme'
import type { Stat } from '../types'
import { rise, useEnter, useLayout } from '../utils/timing'
import { AnimatedNumber } from './AnimatedNumber'

type Props = {
  stats: Stat[]
  accent: string
  delay?: number
  stagger?: number
}

/**
 * Row of supporting metrics under a bet. Numeric values count up; anything
 * non-numeric ("72%", "3W 1D 1L") is printed as given.
 */
export const StatStrip: React.FC<Props> = ({ stats, accent, delay = 0, stagger = 4 }) => {
  const { t, v } = useLayout()

  return (
    <div style={{ display: 'flex', gap: t(14), width: '100%' }}>
      {stats.slice(0, 3).map((stat, i) => (
        <StatTile key={`${stat.label}-${i}`} stat={stat} accent={accent} delay={delay + i * stagger} t={t} v={v} />
      ))}
    </div>
  )
}

const StatTile: React.FC<{
  stat: Stat
  accent: string
  delay: number
  t: (px: number) => number
  v: (px: number) => number
}> = ({ stat, accent, delay, t, v }) => {
  const enter = useEnter(delay, springs.smooth)
  const raw = String(stat.value)
  const asNumber = parseFloat(raw)
  const isPureNumber = Number.isFinite(asNumber) && /^-?\d+(\.\d+)?$/.test(raw.trim())
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0

  return (
    <div
      style={{
        ...rise(enter, 18),
        flex: 1,
        minWidth: 0,
        padding: `${v(20)}px ${t(18)}px`,
        borderRadius: radius.sm,
        background: palette.card,
        border: `1px solid ${palette.line}`,
        display: 'flex',
        flexDirection: 'column',
        gap: v(6),
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: t(20),
          letterSpacing: '1.6px',
          textTransform: 'uppercase',
          color: palette.textDim,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {stat.label}
      </span>
      <span
        style={{
          ...numeric,
          fontWeight: 700,
          fontSize: t(42),
          lineHeight: 1,
          letterSpacing: '-1px',
          color: accent,
        }}
      >
        {isPureNumber ? <AnimatedNumber value={asNumber} delay={delay + 2} decimals={decimals} length={20} /> : raw}
      </span>
    </div>
  )
}
