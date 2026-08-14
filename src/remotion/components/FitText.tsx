import { fonts } from '../fonts'
import { fitFontSize, safeWrap } from '../utils/text'

type Props = {
  children: string
  /** Font size when the text is short. */
  max: number
  /** Font size once the text is long. */
  min: number
  /** Character count that still fits comfortably at `max`. */
  comfortable: number
  overflow?: number
  weight?: number
  style?: React.CSSProperties
}

/**
 * Type that shrinks with content length instead of overflowing the frame.
 * See utils/text.ts for why this is character-count based rather than measured.
 */
export const FitText: React.FC<Props> = ({
  children,
  max,
  min,
  comfortable,
  overflow,
  weight = 900,
  style,
}) => (
  <span
    style={{
      fontFamily: fonts.display,
      fontWeight: weight,
      fontSize: fitFontSize(children, { max, min, comfortable, overflow }),
      ...safeWrap,
      ...style,
    }}
  >
    {children}
  </span>
)
