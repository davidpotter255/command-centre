/**
 * Video design system.
 *
 * Deliberately self-contained: the Remotion compositions must render identically
 * inside the app (where index.css provides CSS custom properties) and inside
 * `remotion studio` / headless renders (where it does not). So nothing here
 * reads a CSS variable — every value is literal.
 */

export const palette = {
  // Backgrounds — deeper than the dashboard so accents carry on a phone screen.
  black: '#04040A',
  base: '#07070F',
  raised: '#0F0F1B',
  card: '#141422',
  cardHi: '#1B1B2C',
  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.16)',

  text: '#F4F4FA',
  textSecondary: '#A6A6C0',
  textDim: '#63637E',

  green: '#00E676',
  greenDeep: '#00B25C',
  red: '#FF5252',
  amber: '#FFB020',
  blue: '#448AFF',
  purple: '#B388FF',
  cyan: '#18FFFF',
} as const

/** Type scale, in px at a 1080x1920 canvas. Scaled by `useScale()` for other formats. */
export const type = {
  hookMax: 132,
  hookMin: 76,
  team: 78,
  teamMin: 46,
  betMax: 96,
  betMin: 52,
  odds: 104,
  stat: 40,
  label: 26,
  micro: 21,
} as const

export const radius = {
  sm: 12,
  md: 22,
  lg: 34,
  pill: 999,
} as const

/**
 * Spring presets. Low-bounce on purpose — broadcast graphics settle, they don't
 * wobble. `pop` is the only one with visible overshoot and is reserved for the
 * single payoff moment in each template.
 */
export const springs = {
  /** Default entrance: fast, no overshoot. */
  smooth: { damping: 200, mass: 0.6, stiffness: 130 },
  /** Slightly heavier — for large elements (bet card, match header). */
  heavy: { damping: 200, mass: 0.9, stiffness: 105 },
  /** The payoff. ~4% overshoot. */
  pop: { damping: 16, mass: 0.55, stiffness: 170 },
  /** Ticks, pills, small confirmations. */
  snap: { damping: 14, mass: 0.35, stiffness: 240 },
} as const

export type AccentName = keyof Pick<typeof palette, 'green' | 'blue' | 'purple' | 'amber' | 'cyan' | 'red'>

/** Resolve a branding accent (named token or raw hex) to a hex string. */
export const resolveAccent = (accent?: string): string => {
  if (!accent) return palette.green
  if (accent.startsWith('#') || accent.startsWith('rgb')) return accent
  const named = palette[accent as AccentName]
  return named ?? palette.green
}

/** Translucent tint of an accent, for pill fills and glows. */
export const tint = (hex: string, alpha: number): string => {
  if (!hex.startsWith('#')) return hex
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
