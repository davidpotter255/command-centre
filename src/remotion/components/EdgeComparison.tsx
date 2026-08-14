import { fonts, numeric } from '../fonts'
import { palette, radius, springs, tint } from '../theme'
import { rise, useEnter, useLayout } from '../utils/timing'
import { AnimatedNumber } from './AnimatedNumber'
import { StatBar } from './StatBar'

type Props = {
  modelProbability: number
  impliedProbability: number
  edge: number
  accent: string
  delay?: number
}

/**
 * Model vs market, then the gap between them. The market bar fills first and
 * the model bar overtakes it — the edge badge only lands once the viewer has
 * seen the two bars diverge, which is what makes the number mean something.
 */
export const EdgeComparison: React.FC<Props> = ({
  modelProbability,
  impliedProbability,
  edge,
  accent,
  delay = 0,
}) => {
  const { t, v } = useLayout()
  const marketIn = useEnter(delay, springs.smooth)
  const modelIn = useEnter(delay + 12, springs.smooth)
  const edgeIn = useEnter(delay + 40, springs.pop)

  const positive = edge >= 0
  const edgeColour = positive ? accent : palette.red

  const row = (
    label: string,
    value: number,
    progress: number,
    barDelay: number,
    muted: boolean,
  ) => (
    <div style={{ ...rise(progress, 18), display: 'flex', flexDirection: 'column', gap: v(10), width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: t(26),
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: muted ? palette.textDim : palette.textSecondary,
          }}
        >
          {label}
        </span>
        <span
          style={{
            ...numeric,
            fontWeight: 700,
            fontSize: t(52),
            lineHeight: 1,
            letterSpacing: '-1.5px',
            color: muted ? palette.textSecondary : accent,
          }}
        >
          <AnimatedNumber value={value} delay={barDelay} length={24} suffix="%" />
        </span>
      </div>
      <StatBar percent={value} accent={accent} delay={barDelay} height={t(16)} muted={muted} />
    </div>
  )

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: v(28) }}>
      {row('Market Implied', impliedProbability, marketIn, delay + 2, true)}
      {row('Model', modelProbability, modelIn, delay + 14, false)}

      <div
        style={{
          alignSelf: 'center',
          display: 'inline-flex',
          alignItems: 'center',
          gap: t(14),
          padding: `${v(14)}px ${t(30)}px`,
          borderRadius: radius.pill,
          background: tint(edgeColour, 0.14),
          border: `2px solid ${tint(edgeColour, 0.5)}`,
          boxShadow: `0 0 ${t(60)}px ${tint(edgeColour, 0.25 * edgeIn)}`,
          opacity: Math.min(1, edgeIn * 1.6),
          transform: `scale(${0.8 + edgeIn * 0.2})`,
        }}
      >
        <span
          style={{
            ...numeric,
            fontWeight: 700,
            fontSize: t(58),
            lineHeight: 1,
            letterSpacing: '-1.5px',
            color: edgeColour,
          }}
        >
          <AnimatedNumber
            value={Math.abs(edge)}
            delay={delay + 40}
            length={20}
            decimals={Math.abs(edge) % 1 === 0 ? 0 : 1}
            prefix={positive ? '+' : '−'}
            suffix="%"
          />
        </span>
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: t(28),
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: edgeColour,
          }}
        >
          Edge
        </span>
      </div>
    </div>
  )
}
