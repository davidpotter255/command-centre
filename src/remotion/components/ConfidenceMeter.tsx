import { useCurrentFrame } from 'remotion'
import { fonts, numeric } from '../fonts'
import { palette, springs, tint } from '../theme'
import { useEnter, useLayout, useRamp } from '../utils/timing'
import { AnimatedNumber } from './AnimatedNumber'

type Props = {
  confidence: number
  accent: string
  delay?: number
  label?: string
  segments?: number
}

/**
 * Segmented meter rather than a smooth bar — segments lighting up one by one
 * gives the value a rhythm, and it reads as an instrument rather than a
 * progress bar.
 */
export const ConfidenceMeter: React.FC<Props> = ({
  confidence,
  accent,
  delay = 0,
  label = 'Model Confidence',
  segments = 20,
}) => {
  const { t, v } = useLayout()
  const frame = useCurrentFrame()
  const enter = useEnter(delay, springs.smooth)
  const progress = useRamp(delay + 4, 28)
  const value = Math.max(0, Math.min(100, confidence))
  const lit = (value / 100) * segments * progress

  // Without an entrance the meter would sit on screen reading 0% until its
  // ramp begins, which looks like a broken stat rather than a pending one.
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: v(14),
        opacity: enter,
        transform: `translateY(${(1 - enter) * 20}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: t(26),
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: palette.textSecondary,
          }}
        >
          {label}
        </span>
        <span
          style={{
            ...numeric,
            fontWeight: 700,
            fontSize: t(64),
            lineHeight: 1,
            letterSpacing: '-2px',
            color: accent,
          }}
        >
          <AnimatedNumber value={value} delay={delay + 4} length={28} suffix="%" />
        </span>
      </div>

      <div style={{ display: 'flex', gap: t(6), width: '100%' }}>
        {Array.from({ length: segments }, (_, i) => {
          const on = Math.max(0, Math.min(1, lit - i))
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: t(18),
                borderRadius: 3,
                background: on > 0 ? accent : 'rgba(255,255,255,0.07)',
                opacity: on > 0 ? 0.35 + on * 0.65 : 1,
                boxShadow: on > 0.5 ? `0 0 ${t(12)}px ${tint(accent, 0.45)}` : 'none',
                // The leading segment pulses briefly as it lights.
                transform: frame >= delay && Math.abs(lit - i - 1) < 0.5 ? 'scaleY(1.25)' : 'scaleY(1)',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
