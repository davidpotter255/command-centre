import { fonts } from '../fonts'
import { palette, springs, tint } from '../theme'
import type { Team } from '../types'
import { displayTeamName, fitFontSize, safeWrap } from '../utils/text'
import { useEnter, useLayout } from '../utils/timing'
import { TeamCrest } from './TeamCrest'

type Props = {
  home: Team
  away: Team
  competition?: string
  kickoff?: string
  accent: string
  delay?: number
  /** Half-height version for templates where the match isn't the hero. */
  compact?: boolean
}

/**
 * Crest above name on each side with a V between — the broadcast convention.
 * Keeping the crest directly above its own name is why this reads in the
 * ~400ms a viewer gives it; a stacked name column between two crests doesn't
 * tell you which team is which.
 */
export const MatchHeader: React.FC<Props> = ({
  home,
  away,
  competition,
  kickoff,
  accent,
  delay = 0,
  compact = false,
}) => {
  const { t, v } = useLayout()

  const meta = useEnter(delay, springs.smooth)
  const homeIn = useEnter(delay + 3, springs.heavy)
  const awayIn = useEnter(delay + 7, springs.heavy)
  const vIn = useEnter(delay + 11, springs.snap)

  const crestSize = compact ? t(112) : t(168)
  const homeName = displayTeamName(home.name, home.shortName)
  const awayName = displayTeamName(away.name, away.shortName)
  const longest = Math.max(homeName.length, awayName.length)
  const nameSize = fitFontSize('x'.repeat(longest), {
    max: compact ? t(46) : t(66),
    min: compact ? t(28) : t(38),
    comfortable: 9,
    overflow: 18,
  })

  const side = (team: Team, label: string, progress: number, direction: number) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: v(compact ? 14 : 22),
        flex: 1,
        minWidth: 0,
        opacity: progress,
        transform: `translateX(${(1 - progress) * 34 * direction}px)`,
      }}
    >
      <TeamCrest name={team.name} crest={team.crest} size={crestSize} accent={accent} progress={progress} />
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: nameSize,
          letterSpacing: '-1.5px',
          color: palette.text,
          textAlign: 'center',
          lineHeight: 1.05,
          textTransform: 'uppercase',
          ...safeWrap,
        }}
      >
        {label}
      </div>
    </div>
  )

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: v(compact ? 18 : 30) }}>
      {(competition || kickoff) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: `${v(9)}px ${t(22)}px`,
            borderRadius: 999,
            background: tint(accent, 0.09),
            border: `1px solid ${tint(accent, 0.24)}`,
            opacity: meta,
            transform: `translateY(${(1 - meta) * 14}px)`,
          }}
        >
          {competition && (
            <span
              style={{
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: t(24),
                letterSpacing: '2.4px',
                textTransform: 'uppercase',
                color: accent,
              }}
            >
              {competition}
            </span>
          )}
          {competition && kickoff && (
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: tint(accent, 0.5) }} />
          )}
          {kickoff && (
            <span
              style={{
                fontFamily: fonts.mono,
                fontWeight: 500,
                fontSize: t(23),
                color: palette.textSecondary,
              }}
            >
              {kickoff}
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: t(12) }}>
        {side(home, homeName, homeIn, -1)}

        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 900,
            fontSize: t(40),
            color: palette.textDim,
            marginTop: crestSize * 0.32,
            opacity: vIn,
            transform: `scale(${0.5 + vIn * 0.5})`,
            flexShrink: 0,
          }}
        >
          V
        </div>

        {side(away, awayName, awayIn, 1)}
      </div>
    </div>
  )
}
