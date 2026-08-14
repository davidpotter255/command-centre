import { interpolate, useCurrentFrame } from 'remotion'
import { fonts } from '../fonts'
import { palette, springs, tint } from '../theme'
import { fitFontSize, safeWrap } from '../utils/text'
import { useEnter, useLayout } from '../utils/timing'

type Props = {
  text: string
  accent: string
  delay?: number
  /** Small strap above the hook — competition, "Best Bet", etc. */
  eyebrow?: string
}

/**
 * The first second. Movement has to be visible on frame 2, so the mask wipe
 * starts immediately and there is no logo sting in front of it — the words
 * arrive first and everything else is layered behind them.
 */
export const Hook: React.FC<Props> = ({ text, accent, delay = 0, eyebrow }) => {
  const { t, v } = useLayout()
  const frame = useCurrentFrame()
  const enter = useEnter(delay, springs.heavy)
  const eyebrowIn = useEnter(delay + 8, springs.smooth)

  // Wipe reveals the headline from the left over ~10 frames.
  const wipe = interpolate(frame - delay, [0, 10], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Underline rule shoots out after the words land.
  const rule = interpolate(frame - delay, [6, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const fontSize = fitFontSize(text, {
    max: t(118),
    min: t(62),
    comfortable: 20,
    overflow: 58,
  })

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: v(18) }}>
      {eyebrow && (
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: t(26),
            letterSpacing: '5px',
            textTransform: 'uppercase',
            color: accent,
            opacity: eyebrowIn,
            transform: `translateY(${(1 - eyebrowIn) * 10}px)`,
          }}
        >
          {eyebrow}
        </div>
      )}

      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 900,
          fontSize,
          lineHeight: 0.98,
          letterSpacing: '-3px',
          textTransform: 'uppercase',
          color: palette.text,
          textShadow: `0 ${v(10)}px ${t(50)}px rgba(0,0,0,0.6)`,
          maskImage: `linear-gradient(90deg, #000 ${wipe}%, transparent ${wipe + 6}%)`,
          WebkitMaskImage: `linear-gradient(90deg, #000 ${wipe}%, transparent ${wipe + 6}%)`,
          transform: `translateY(${(1 - enter) * 22}px)`,
          ...safeWrap,
        }}
      >
        {text}
      </div>

      <div
        style={{
          height: 4,
          width: `${rule * 42}%`,
          borderRadius: 4,
          background: `linear-gradient(90deg, ${accent}, ${tint(accent, 0)})`,
        }}
      />
    </div>
  )
}
