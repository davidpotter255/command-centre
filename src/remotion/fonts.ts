/**
 * Fonts are loaded through @remotion/google-fonts rather than the CSS @import in
 * index.css, so a headless render produces byte-identical type to the in-app
 * preview. Remotion holds the render until the faces are ready.
 *
 * Same two families the dashboard uses: DM Sans for display, JetBrains Mono for
 * anything numeric (odds, percentages, xG) so digits stay tabular and don't
 * jitter during count-ups.
 */
import { loadFont as loadDisplay } from '@remotion/google-fonts/DMSans'
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono'

const display = loadDisplay('normal', {
  weights: ['400', '500', '700', '800', '900'],
  subsets: ['latin'],
})

const mono = loadMono('normal', {
  weights: ['500', '700'],
  subsets: ['latin'],
})

export const fonts = {
  display: `${display.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  mono: `${mono.fontFamily}, ui-monospace, SFMono-Regular, Menlo, monospace`,
} as const

/** Numeric styling used everywhere digits animate. */
export const numeric = {
  fontFamily: fonts.mono,
  fontVariantNumeric: 'tabular-nums' as const,
  fontFeatureSettings: '"tnum" 1',
}
