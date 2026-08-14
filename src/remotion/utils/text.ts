/**
 * Deterministic text fitting.
 *
 * Measuring the DOM would be more precise, but measurement inside Remotion means
 * delayRender/continueRender round-trips and a real risk of the studio preview
 * and the headless render disagreeing. Betting selections vary from
 * "Over 2.5 Goals" to "Manchester City To Win + Over 2.5 Goals", which is a
 * character-count problem, not a font-metrics problem — so scale off length.
 */

type FitOptions = {
  max: number
  min: number
  /** Character count that still fits comfortably at `max`. */
  comfortable: number
  /** Character count at which we've reached `min`. */
  overflow?: number
}

export const fitFontSize = (text: string, { max, min, comfortable, overflow }: FitOptions): number => {
  const len = (text ?? '').trim().length
  if (len <= comfortable) return max
  const hard = overflow ?? comfortable * 2.4
  if (len >= hard) return min
  const t = (len - comfortable) / (hard - comfortable)
  return Math.round(max + (min - max) * t)
}

/**
 * Team name for the match header. Long names get their `shortName`, and if
 * there isn't one we drop common suffixes rather than shrinking the type,
 * because two mismatched team sizes look broken.
 */
export const displayTeamName = (name: string, shortName?: string, limit = 13): string => {
  if (name.length <= limit) return name
  if (shortName) return shortName
  return name
    .replace(/\b(Football Club|FC|AFC|CF|SC)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Uppercase display text without letting CSS text-transform mangle emoji. */
export const shout = (text: string): string => text.toUpperCase()

/** Style block that guarantees text wraps instead of overflowing the frame. */
export const safeWrap = {
  overflowWrap: 'break-word' as const,
  wordBreak: 'normal' as const,
  hyphens: 'none' as const,
  maxWidth: '100%',
}
