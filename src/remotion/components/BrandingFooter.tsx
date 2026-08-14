import { Img } from 'remotion'
import { fonts } from '../fonts'
import { palette, tint } from '../theme'
import type { Branding } from '../types'
import { useEnter, useLayout } from '../utils/timing'

type Props = {
  branding?: Branding
  accent: string
  delay?: number
}

/**
 * Brand marks live only here and in the watermark, never baked into the
 * templates — the same engine is meant to run more than one football brand.
 */
export const BrandingFooter: React.FC<Props> = ({ branding, accent, delay = 0 }) => {
  const { t } = useLayout()
  const enter = useEnter(delay)

  if (!branding?.logo && !branding?.handle) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: t(14),
        opacity: enter * 0.9,
        transform: `translateY(${(1 - enter) * 10}px)`,
      }}
    >
      {branding.logo && (
        <Img
          src={branding.logo}
          style={{ height: t(46), width: 'auto', objectFit: 'contain', borderRadius: 8 }}
        />
      )}
      {branding.handle && (
        <>
          <span
            style={{
              width: t(6),
              height: t(6),
              borderRadius: '50%',
              background: tint(accent, 0.8),
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: t(26),
              letterSpacing: '1.5px',
              color: palette.textDim,
            }}
          >
            {branding.handle}
          </span>
        </>
      )}
    </div>
  )
}

/** Always-on corner mark. Separate from the footer so it can sit over any layer. */
export const Watermark: React.FC<{ branding?: Branding }> = ({ branding }) => {
  const { t } = useLayout()
  if (!branding?.watermark) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: t(48),
        right: t(48),
        fontFamily: fonts.display,
        fontWeight: 700,
        fontSize: t(24),
        letterSpacing: '2px',
        color: 'rgba(255,255,255,0.28)',
        textTransform: 'uppercase',
      }}
    >
      {branding.watermark}
    </div>
  )
}
