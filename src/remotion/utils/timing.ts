import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { springs } from '../theme'

type SpringConfig = { damping: number; mass: number; stiffness: number }

/**
 * Entrance progress 0 -> 1, starting `delay` frames into the current Sequence.
 * Everything that enters the frame runs off this, so timing stays consistent
 * across templates and is trivially retimed from one place.
 */
export const useEnter = (delay = 0, config: SpringConfig = springs.smooth, durationInFrames?: number) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return spring({ frame: frame - delay, fps, config, durationInFrames })
}

/** Eased 0 -> 1 ramp. For bars, rings and count-ups, where a spring would look loose. */
export const useRamp = (delay: number, length: number, easing = Easing.out(Easing.cubic)) => {
  const frame = useCurrentFrame()
  return interpolate(frame, [delay, delay + length], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  })
}

/** 1 -> 0 fade used to clear a section before the next one lands. */
export const useExit = (start: number, length = 8) => {
  const frame = useCurrentFrame()
  return interpolate(frame, [start, start + length], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  })
}

/** Standard entrance transform: small rise + micro scale. Never more than ~30px. */
export const rise = (progress: number, distance = 24) => ({
  opacity: progress,
  transform: `translateY(${(1 - progress) * distance}px) scale(${0.965 + progress * 0.035})`,
})

/** Horizontal variant, for bet slip legs and stat rows. */
export const slideIn = (progress: number, distance = 40) => ({
  opacity: progress,
  transform: `translateX(${(1 - progress) * distance}px)`,
})

/**
 * Layout scaling. All templates are authored against a 1080x1920 canvas; for
 * 4:5 and 1:1 the width is unchanged but vertical room shrinks, so vertical
 * rhythm compresses faster than type does.
 */
export const useLayout = () => {
  const { width, height } = useVideoConfig()
  const vRatio = height / 1920
  return {
    width,
    height,
    /** Vertical spacing scale — compresses fully with the canvas. */
    v: (px: number) => Math.round(px * vRatio),
    /** Type scale — compresses at a third of the rate so text stays legible. */
    t: (px: number) => Math.round(px * (1 - (1 - vRatio) * 0.34)),
    isShort: height < 1600,
  }
}

/** Seconds -> frames at the composition's fps. Keeps template timelines readable. */
export const useSec = () => {
  const { fps } = useVideoConfig()
  return (seconds: number) => Math.round(seconds * fps)
}
