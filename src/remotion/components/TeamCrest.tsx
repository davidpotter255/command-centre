import { Img } from 'remotion'
import { fonts } from '../fonts'
import { palette, tint } from '../theme'

type Props = {
  name: string
  crest?: string
  size: number
  accent: string
  progress: number
}

/**
 * Initials fallback so a missing crest still looks intentional. Single-word
 * clubs get a three-letter code (ARS, CHE) rather than one lonely letter —
 * that's the convention football audiences already read.
 */
const initials = (name: string): string => {
  const words = name.split(/\s+/).filter((w) => w.length > 1)
  if (words.length === 0) return name.slice(0, 3).toUpperCase()
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase()
  return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase()
}

export const TeamCrest: React.FC<Props> = ({ name, crest, size, accent, progress }) => {
  const shell: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `radial-gradient(circle at 50% 30%, ${palette.cardHi}, ${palette.card})`,
    border: `2px solid ${tint(accent, 0.28)}`,
    boxShadow: `0 0 ${size * 0.5}px ${tint(accent, 0.18 * progress)}, inset 0 1px 0 rgba(255,255,255,0.06)`,
    transform: `scale(${0.86 + progress * 0.14})`,
    opacity: progress,
    flexShrink: 0,
    overflow: 'hidden',
  }

  if (crest) {
    return (
      <div style={shell}>
        <Img
          src={crest}
          style={{ width: size * 0.66, height: size * 0.66, objectFit: 'contain' }}
        />
      </div>
    )
  }

  return (
    <div style={shell}>
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: 900,
          fontSize: size * 0.26,
          letterSpacing: '-1px',
          color: palette.textSecondary,
        }}
      >
        {initials(name)}
      </span>
    </div>
  )
}
