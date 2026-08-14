import { fonts } from '../fonts'
import { palette, springs, tint } from '../theme'
import { fitFontSize, safeWrap } from '../utils/text'
import { useEnter, useLayout } from '../utils/timing'

type Props = {
  text: string
  accent: string
  delay?: number
}

/**
 * Deliberately quiet. The CTA is the last thing to arrive and should never
 * out-shout the bet — so no fill, no glow, just a rule and restrained type.
 */
export const CTA: React.FC<Props> = ({ text, accent, delay = 0 }) => {
  const { t } = useLayout()
  const enter = useEnter(delay, springs.smooth)

  const fontSize = fitFontSize(text, {
    max: t(38),
    min: t(26),
    comfortable: 26,
    overflow: 60,
  })

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: t(16),
        opacity: enter,
        transform: `translateY(${(1 - enter) * 14}px)`,
      }}
    >
      <span style={{ width: t(28), height: 2, background: tint(accent, 0.6), flexShrink: 0 }} />
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: 600,
          fontSize,
          letterSpacing: '0.5px',
          color: palette.textSecondary,
          ...safeWrap,
        }}
      >
        {text}
      </span>
    </div>
  )
}
