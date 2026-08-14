import { AbsoluteFill } from 'remotion'
import type { Branding } from '../types'
import { useLayout } from '../utils/timing'
import { Backdrop } from './Backdrop'
import { Watermark } from './BrandingFooter'

type FrameProps = {
  accent: string
  branding?: Branding
  children: React.ReactNode
  intensity?: number
}

/** Shared stage: backdrop and watermark. Sections layer on top of it. */
export const Frame: React.FC<FrameProps> = ({ accent, branding, children, intensity }) => (
  <AbsoluteFill style={{ backgroundColor: '#04040A' }}>
    <Backdrop accent={accent} intensity={intensity} />
    <Watermark branding={branding} />
    {children}
  </AbsoluteFill>
)

type SafeProps = {
  children: React.ReactNode
  /** Vertical distribution of the content block. */
  justify?: 'center' | 'flex-start' | 'flex-end' | 'space-between'
  gap?: number
  style?: React.CSSProperties
}

/**
 * Safe area.
 *
 * The bottom inset is generous on purpose — TikTok and Reels lay the caption,
 * handle and action rail over roughly the lower 15% and the right edge. Content
 * that ignores that gets covered on the platform even though the render looks
 * fine in isolation.
 */
export const Safe: React.FC<SafeProps> = ({ children, justify = 'center', gap = 0, style }) => {
  const { v, t } = useLayout()

  return (
    <AbsoluteFill
      style={{
        padding: `${v(140)}px ${t(72)}px ${v(240)}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: justify,
        alignItems: 'stretch',
        gap: v(gap),
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  )
}
