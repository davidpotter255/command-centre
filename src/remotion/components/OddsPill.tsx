import { fonts, numeric } from '../fonts'
import { palette, springs, tint } from '../theme'
import { toFractional } from '../utils/odds'
import { useEnter, useLayout } from '../utils/timing'

type Props = {
  odds: string
  accent: string
  delay?: number
  size?: 'sm' | 'md' | 'lg'
  /** Show the fractional equivalent underneath when the input was decimal. */
  showAlternate?: boolean
}

const SIZES = { sm: 34, md: 56, lg: 96 } as const

/** Odds snap into place — the one deliberately abrupt movement in the system. */
export const OddsPill: React.FC<Props> = ({ odds, accent, delay = 0, size = 'md', showAlternate = false }) => {
  const { t, v } = useLayout()
  const enter = useEnter(delay, springs.pop)

  const fontSize = t(SIZES[size])
  const alternate = showAlternate && /^\d+(\.\d+)?$/.test(odds.trim()) ? toFractional(odds) : null

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: v(4),
        opacity: Math.min(1, enter * 1.6),
        transform: `scale(${0.72 + enter * 0.28})`,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          padding: `${v(fontSize * 0.22)}px ${fontSize * 0.5}px`,
          borderRadius: 999,
          background: `linear-gradient(180deg, ${tint(accent, 0.2)}, ${tint(accent, 0.1)})`,
          border: `2px solid ${tint(accent, 0.55)}`,
          boxShadow: `0 0 ${fontSize * 0.8}px ${tint(accent, 0.28 * enter)}`,
          ...numeric,
          fontWeight: 700,
          fontSize,
          lineHeight: 1,
          color: accent,
          letterSpacing: '-1px',
        }}
      >
        {odds}
      </div>
      {alternate && (
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: t(20),
            letterSpacing: '1.6px',
            textTransform: 'uppercase',
            color: palette.textDim,
          }}
        >
          {alternate}
        </span>
      )}
    </div>
  )
}
