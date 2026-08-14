import { Sequence, interpolate, useCurrentFrame } from 'remotion'

type Props = {
  from: number
  durationInFrames: number
  /** Frames of fade-out at the tail. Set to 0 to hard-cut. */
  exit?: number
  /** Slight lift as the section leaves, so exits aren't just opacity. */
  exitLift?: number
  children: React.ReactNode
}

/**
 * A timed block of the video. Sections overlap by a few frames so one is always
 * arriving as another leaves — the alternative, hard cuts between full-screen
 * states, reads as a slideshow.
 *
 * Child `delay` values are relative to the section's own start.
 */
export const Section: React.FC<Props> = ({ from, durationInFrames, exit = 8, exitLift = 18, children }) => (
  <Sequence from={from} durationInFrames={durationInFrames} layout="none">
    <Fader durationInFrames={durationInFrames} exit={exit} exitLift={exitLift}>
      {children}
    </Fader>
  </Sequence>
)

const Fader: React.FC<{
  durationInFrames: number
  exit: number
  exitLift: number
  children: React.ReactNode
}> = ({ durationInFrames, exit, exitLift, children }) => {
  const frame = useCurrentFrame()

  if (exit <= 0) return <>{children}</>

  const progress = interpolate(frame, [durationInFrames - exit, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 1 - progress,
        transform: `translateY(${-progress * exitLift}px) scale(${1 - progress * 0.015})`,
      }}
    >
      {children}
    </div>
  )
}
