import { palette, tint } from '../theme'
import { useRamp } from '../utils/timing'

type Props = {
  percent: number
  accent: string
  delay?: number
  length?: number
  height?: number
  /** Muted treatment for the "market" side of a comparison. */
  muted?: boolean
}

/** Fill bar with a leading-edge highlight so the motion reads at small sizes. */
export const StatBar: React.FC<Props> = ({
  percent,
  accent,
  delay = 0,
  length = 24,
  height = 14,
  muted = false,
}) => {
  const progress = useRamp(delay, length)
  const width = Math.max(0, Math.min(100, percent)) * progress
  const colour = muted ? palette.textDim : accent

  return (
    <div
      style={{
        width: '100%',
        height,
        borderRadius: height,
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: `${width}%`,
          height: '100%',
          borderRadius: height,
          background: muted
            ? `linear-gradient(90deg, ${tint(palette.textSecondary, 0.5)}, ${tint(palette.textSecondary, 0.8)})`
            : `linear-gradient(90deg, ${tint(colour, 0.65)}, ${colour})`,
          boxShadow: muted ? 'none' : `0 0 ${height * 1.4}px ${tint(colour, 0.5 * progress)}`,
        }}
      />
    </div>
  )
}
