import { numeric } from '../fonts'
import { useRamp } from '../utils/timing'

type Props = {
  value: number
  delay?: number
  /** Frames the count-up takes. */
  length?: number
  decimals?: number
  prefix?: string
  suffix?: string
  /** Count from something other than zero — e.g. market % -> model %. */
  from?: number
  style?: React.CSSProperties
}

/**
 * Count-up. Tabular figures and a fixed decimal count mean the digits never
 * change width mid-animation, which is what makes cheap count-ups look cheap.
 */
export const AnimatedNumber: React.FC<Props> = ({
  value,
  delay = 0,
  length = 26,
  decimals = 0,
  prefix = '',
  suffix = '',
  from = 0,
  style,
}) => {
  const progress = useRamp(delay, length)
  const current = from + (value - from) * progress

  return (
    <span style={{ ...numeric, ...style }}>
      {prefix}
      {current.toFixed(decimals)}
      {suffix}
    </span>
  )
}
