import { interpolate, useCurrentFrame } from 'remotion'
import { fonts } from '../fonts'
import { palette, tint } from '../theme'
import { useLayout } from '../utils/timing'

type Props = {
  result: 'won' | 'lost' | 'void'
  accent: string
  delay?: number
  size?: number
}

const COPY = { won: '✓ WON', lost: '✗ LOST', void: '⊘ VOID' } as const

/**
 * Rubber-stamp entrance: drops in oversized and slightly rotated, overshoots
 * past its resting size, then settles — the impact is the point, so it's a
 * fast ease rather than a spring.
 */
export const ResultStamp: React.FC<Props> = ({ result, accent, delay = 0, size }) => {
  const { t, v } = useLayout()
  const frame = useCurrentFrame()
  const local = frame - delay

  const scale = interpolate(local, [0, 6, 10], [2.4, 0.92, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const opacity = interpolate(local, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const rotate = interpolate(local, [0, 10], [-14, -7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  // Impact ring pushing outward from the stamp.
  const ring = interpolate(local, [4, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const colour = result === 'won' ? accent : result === 'lost' ? palette.red : palette.textDim
  const fontSize = t(size ?? 56)

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          position: 'absolute',
          inset: `-${t(20)}px`,
          borderRadius: 999,
          border: `2px solid ${tint(colour, 0.5 * (1 - ring))}`,
          transform: `scale(${1 + ring * 0.6})`,
          opacity: 1 - ring,
        }}
      />
      <div
        style={{
          padding: `${v(12)}px ${t(28)}px`,
          borderRadius: 10,
          border: `3px solid ${colour}`,
          background: tint(colour, 0.12),
          fontFamily: fonts.display,
          fontWeight: 900,
          fontSize,
          letterSpacing: '2px',
          color: colour,
          opacity,
          transform: `scale(${scale}) rotate(${rotate}deg)`,
          textShadow: `0 0 ${t(30)}px ${tint(colour, 0.6)}`,
          whiteSpace: 'nowrap',
        }}
      >
        {COPY[result]}
      </div>
    </div>
  )
}
