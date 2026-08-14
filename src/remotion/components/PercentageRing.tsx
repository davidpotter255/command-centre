import { numeric } from '../fonts'
import { palette, tint } from '../theme'
import { useRamp } from '../utils/timing'

type Props = {
  percent: number
  accent: string
  size: number
  delay?: number
  length?: number
  stroke?: number
  /** Hide the centre figure when the value is already shown elsewhere. */
  showValue?: boolean
}

export const PercentageRing: React.FC<Props> = ({
  percent,
  accent,
  size,
  delay = 0,
  length = 26,
  stroke,
  showValue = true,
}) => {
  const progress = useRamp(delay, length)
  const w = stroke ?? Math.max(5, size * 0.1)
  const radius = (size - w) / 2
  const circumference = 2 * Math.PI * radius
  const value = Math.max(0, Math.min(100, percent))
  const dash = (value / 100) * circumference * progress

  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={w}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={w}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 ${w}px ${tint(accent, 0.55)})` }}
        />
      </svg>
      {showValue && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...numeric,
            fontWeight: 700,
            fontSize: size * 0.28,
            color: palette.text,
            letterSpacing: '-1px',
          }}
        >
          {Math.round(value * progress)}%
        </div>
      )}
    </div>
  )
}
