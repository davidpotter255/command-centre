/**
 * Odds helpers. Odds arrive as free-form strings ("10/11", "1.91", "evens")
 * because that's how they're written on social, but the edge maths needs a
 * number — so parse defensively and fall back to null rather than NaN.
 */

export const parseOdds = (odds?: string | number | null): number | null => {
  if (odds === null || odds === undefined) return null
  if (typeof odds === 'number') return Number.isFinite(odds) ? odds : null

  const raw = odds.trim().toLowerCase()
  if (!raw) return null
  if (raw === 'evs' || raw === 'evens' || raw === 'even') return 2

  const fraction = raw.match(/^(\d+(?:\.\d+)?)\s*[/-]\s*(\d+(?:\.\d+)?)$/)
  if (fraction) {
    const num = parseFloat(fraction[1])
    const den = parseFloat(fraction[2])
    if (den === 0) return null
    return num / den + 1
  }

  const decimal = parseFloat(raw)
  return Number.isFinite(decimal) && decimal > 1 ? decimal : null
}

/** Implied probability as a percentage, 0–100. */
export const impliedProbability = (odds?: string | number | null): number | null => {
  const dec = parseOdds(odds)
  return dec ? (100 / dec) : null
}

/** Decimal -> the nearest tidy fraction, for the fractional-odds audience. */
const COMMON_FRACTIONS: [number, string][] = [
  [1.2, '1/5'], [1.25, '1/4'], [1.29, '2/7'], [1.33, '1/3'], [1.36, '4/11'],
  [1.4, '2/5'], [1.44, '4/9'], [1.5, '1/2'], [1.53, '8/15'], [1.57, '4/7'],
  [1.62, '8/13'], [1.67, '4/6'], [1.73, '8/11'], [1.8, '4/5'], [1.83, '5/6'],
  [1.91, '10/11'], [2, 'Evens'], [2.1, '11/10'], [2.2, '6/5'], [2.25, '5/4'],
  [2.38, '11/8'], [2.5, '6/4'], [2.63, '13/8'], [2.75, '7/4'], [2.88, '15/8'],
  [3, '2/1'], [3.25, '9/4'], [3.5, '5/2'], [4, '3/1'], [4.5, '7/2'], [5, '4/1'],
  [6, '5/1'], [7, '6/1'], [8, '7/1'], [9, '8/1'], [11, '10/1'],
]

export const toFractional = (odds?: string | number | null): string | null => {
  const dec = parseOdds(odds)
  if (!dec) return null
  let best = COMMON_FRACTIONS[0]
  for (const entry of COMMON_FRACTIONS) {
    if (Math.abs(entry[0] - dec) < Math.abs(best[0] - dec)) best = entry
  }
  return Math.abs(best[0] - dec) <= 0.16 ? best[1] : null
}

/** Accumulator price for a bet builder / multiple. */
export const combineOdds = (legs: (string | number | null | undefined)[]): string | null => {
  const decimals = legs.map(parseOdds).filter((d): d is number => d !== null)
  if (decimals.length === 0 || decimals.length !== legs.length) return null
  const product = decimals.reduce((acc, d) => acc * d, 1)
  return product.toFixed(2)
}

/**
 * Edge in percentage points. Explicit `edge` wins; otherwise derive it from the
 * model/market pair, so a pick only carrying probabilities still shows an edge.
 */
export const resolveEdge = (
  edge?: number,
  modelProbability?: number,
  impliedProb?: number,
): number | null => {
  if (typeof edge === 'number' && Number.isFinite(edge)) return edge
  if (typeof modelProbability === 'number' && typeof impliedProb === 'number') {
    return Math.round((modelProbability - impliedProb) * 10) / 10
  }
  return null
}

export const formatPercent = (value: number, decimals = 0): string =>
  `${value.toFixed(decimals)}%`
