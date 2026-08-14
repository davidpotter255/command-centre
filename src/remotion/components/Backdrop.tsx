import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { palette, tint } from '../theme'

type Props = {
  accent: string
  /** Slightly brighter treatment for the payoff moment. */
  intensity?: number
}

/**
 * Continuous background motion so no frame is ever completely static — the thing
 * that separates a video from an animated graphic on a feed.
 *
 * Four restrained layers: two drifting radial glows, a perspective pitch grid
 * that scrolls, a slow diagonal light sweep, and fixed grain. All driven off
 * `frame`, so it's deterministic and identical across preview and render.
 */
export const Backdrop: React.FC<Props> = ({ accent, intensity = 1 }) => {
  const frame = useCurrentFrame()
  const { width, height, durationInFrames } = useVideoConfig()

  // Slow, non-repeating drift. Different periods so the two glows never sync up.
  const t = frame / 30
  const glowAX = 50 + Math.sin(t * 0.42) * 14
  const glowAY = 22 + Math.cos(t * 0.31) * 8
  const glowBX = 62 + Math.cos(t * 0.27) * 12
  const glowBY = 84 + Math.sin(t * 0.36) * 7

  // Grid scrolls upward ~1 cell over the whole video — felt, not seen.
  const gridOffset = interpolate(frame, [0, durationInFrames], [0, 90])

  // One light sweep per ~6s, crossing the frame diagonally.
  const sweepCycle = (frame % 180) / 180
  const sweepX = interpolate(sweepCycle, [0, 1], [-0.45, 1.45])
  const sweepOpacity = interpolate(sweepCycle, [0, 0.25, 0.75, 1], [0, 0.06, 0.06, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill style={{ background: palette.base, overflow: 'hidden' }}>
      {/* Perspective pitch lines — anchored to the lower half, fading upward. */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            linear-gradient(${palette.lineStrong} 1px, transparent 1px),
            linear-gradient(90deg, ${palette.lineStrong} 1px, transparent 1px)
          `,
          backgroundSize: '90px 90px',
          backgroundPosition: `0px ${-gridOffset}px`,
          opacity: 0.28,
          transform: 'perspective(900px) rotateX(58deg) scale(2.1)',
          transformOrigin: '50% 100%',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 62%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 62%)',
        }}
      />

      {/* Accent glow, top — sits behind the hook and match reveal. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(58% 42% at ${glowAX}% ${glowAY}%, ${tint(accent, 0.2 * intensity)} 0%, transparent 70%)`,
        }}
      />

      {/* Cool counter-glow, bottom — stops the lower third going flat black. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(52% 38% at ${glowBX}% ${glowBY}%, ${tint(palette.blue, 0.14 * intensity)} 0%, transparent 72%)`,
        }}
      />

      {/* Light sweep. */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(105deg, transparent 42%, rgba(255,255,255,${sweepOpacity}) 50%, transparent 58%)`,
          transform: `translateX(${sweepX * width}px)`,
        }}
      />

      {/* Grain — kills banding on the gradients after platform re-encoding. */}
      <AbsoluteFill style={{ opacity: 0.045, mixBlendMode: 'overlay' }}>
        <svg width={width} height={height}>
          <filter id="backdrop-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width={width} height={height} filter="url(#backdrop-grain)" />
        </svg>
      </AbsoluteFill>

      {/* Vignette. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 78% at 50% 46%, transparent 42%, rgba(0,0,0,0.62) 100%)`,
        }}
      />
    </AbsoluteFill>
  )
}
