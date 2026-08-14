import { fonts, numeric } from '../fonts'
import { palette, radius, springs, tint } from '../theme'
import type { BetBuilderLeg } from '../types'
import { fitFontSize, safeWrap } from '../utils/text'
import { useEnter, useLayout } from '../utils/timing'

type Props = {
  leg: BetBuilderLeg
  index: number
  accent: string
  delay: number
  /** Row height at full extension — the slip animates this from 0. */
  rowHeight: number
}

export const BetSlipLeg: React.FC<Props> = ({ leg, index, accent, delay, rowHeight }) => {
  const { t, v } = useLayout()
  const enter = useEnter(delay, springs.smooth)
  const tick = useEnter(delay + 5, springs.snap)

  const selectionSize = fitFontSize(leg.selection, {
    max: t(38),
    min: t(25),
    comfortable: 24,
    overflow: 52,
  })

  return (
    <div
      style={{
        height: rowHeight * enter,
        marginBottom: v(12) * enter,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          height: rowHeight,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: t(18),
          padding: `0 ${t(22)}px`,
          borderRadius: radius.sm,
          background: palette.raised,
          border: `1px solid ${palette.line}`,
          opacity: enter,
          transform: `translateX(${(1 - enter) * 46}px)`,
        }}
      >
        <span
          style={{
            ...numeric,
            fontWeight: 700,
            fontSize: t(22),
            color: palette.textDim,
            width: t(26),
            flexShrink: 0,
          }}
        >
          {index + 1}
        </span>

        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: selectionSize,
            lineHeight: 1.15,
            color: palette.text,
            ...safeWrap,
          }}
        >
          {leg.selection}
        </span>

        {leg.odds && (
          <span
            style={{
              ...numeric,
              fontWeight: 700,
              fontSize: t(28),
              color: palette.textSecondary,
              flexShrink: 0,
            }}
          >
            {leg.odds}
          </span>
        )}

        {/* Tick stamps on a beat after the leg settles — the satisfying part. */}
        <div
          style={{
            width: t(40),
            height: t(40),
            borderRadius: '50%',
            background: tint(accent, 0.18),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            opacity: tick,
            transform: `scale(${0.5 + tick * 0.5})`,
          }}
        >
          <svg width={t(22)} height={t(22)} viewBox="0 0 24 24" fill="none">
            <path
              d="M4 12.5L9.5 18L20 6"
              stroke={accent}
              strokeWidth={3.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={24}
              strokeDashoffset={24 * (1 - tick)}
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
