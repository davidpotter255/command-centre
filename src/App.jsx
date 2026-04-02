import { useState, useEffect, useCallback, useMemo } from 'react'

// ─── Storage helpers (localStorage for Vercel, no backend needed) ───
const store = {
  get: (key, fallback = null) => {
    try {
      const v = localStorage.getItem(`cc_${key}`)
      return v ? JSON.parse(v) : fallback
    } catch { return fallback }
  },
  set: (key, val) => {
    try { localStorage.setItem(`cc_${key}`, JSON.stringify(val)) } catch {}
  }
}

// ─── Constants ───
const LEAGUES = {
  'Premier League': { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#3d195b' },
  'Championship': { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#1c2c5b' },
  'League One': { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#e63946' },
  'League Two': { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#2a9d8f' },
  'La Liga': { flag: '🇪🇸', color: '#ee8707' },
  'Serie A': { flag: '🇮🇹', color: '#024494' },
  'Bundesliga': { flag: '🇩🇪', color: '#d20515' },
  'Ligue 1': { flag: '🇫🇷', color: '#091c3e' },
  'Eredivisie': { flag: '🇳🇱', color: '#f26522' },
  'Primeira Liga': { flag: '🇵🇹', color: '#006847' },
  'Scottish Prem': { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: '#1a1a6c' },
  'Belgian Pro': { flag: '🇧🇪', color: '#2d2d2d' },
  'Turkish Süper Lig': { flag: '🇹🇷', color: '#c8102e' },
  'MLS': { flag: '🇺🇸', color: '#c62032' },
  'A-League': { flag: '🇦🇺', color: '#003580' },
}

const MARKETS = ['All', 'Match Winner', 'BTTS', 'Over 2.5', 'Double Chance', 'Asian Handicap', 'Draw No Bet', 'Over/Under']
const CONFIDENCE_LEVELS = ['all', 'high', 'medium', 'low']

const SAMPLE_PICKS = [
  { id:'s1', league:'Premier League', home:'Arsenal', away:'Chelsea', kickoff:'15:00', market:'Match Winner', pick:'Arsenal Win', odds:1.85, confidence:'high', edge:12.4, xgHome:1.8, xgAway:1.1, formHome:'WWDWW', formAway:'LWDLW', h2h:'3W 1D 1L', reasoning:'Arsenal strong at home, xG advantage 1.8 vs 1.1. Chelsea missing 3 key defenders.', source:'auto', result:null, date:'2026-04-02' },
  { id:'s2', league:'La Liga', home:'Real Madrid', away:'Atletico Madrid', kickoff:'20:00', market:'BTTS', pick:'Yes', odds:1.72, confidence:'high', edge:9.8, xgHome:2.1, xgAway:1.3, formHome:'WWWDW', formAway:'DWWLW', h2h:'2W 2D 1L', reasoning:'Both teams scored in 7 of last 10 H2H. Poisson model projects 2.1 vs 1.3 goals.', source:'auto', result:null, date:'2026-04-02' },
  { id:'s3', league:'Bundesliga', home:'Bayern Munich', away:'Dortmund', kickoff:'17:30', market:'Over 2.5', pick:'Over 2.5 Goals', odds:1.55, confidence:'medium', edge:6.2, xgHome:2.4, xgAway:1.6, formHome:'WWLWW', formAway:'WDWLW', h2h:'4W 0D 1L', reasoning:'xG model: 2.4 + 1.6 = 4.0 expected goals. Last 5 meetings averaged 4.2 goals.', source:'manual', result:null, date:'2026-04-02' },
  { id:'s4', league:'Serie A', home:'Napoli', away:'Juventus', kickoff:'19:45', market:'Double Chance', pick:'Napoli or Draw', odds:1.35, confidence:'medium', edge:4.1, xgHome:1.6, xgAway:0.9, formHome:'DWWWW', formAway:'WDWDL', h2h:'2W 2D 1L', reasoning:'Napoli unbeaten at home in 14. Juve away form poor — 2W 4D 3L last 9.', source:'auto', result:null, date:'2026-04-02' },
  { id:'s5', league:'Ligue 1', home:'PSG', away:'Lyon', kickoff:'20:45', market:'Match Winner', pick:'PSG Win', odds:1.42, confidence:'high', edge:8.1, xgHome:2.3, xgAway:0.8, formHome:'WWWWW', formAway:'LDWLW', h2h:'5W 0D 0L', reasoning:'PSG dominant at home. Lyon away record worst in top 6.', source:'auto', result:null, date:'2026-04-02' },
  { id:'s6', league:'Eredivisie', home:'PSV', away:'Ajax', kickoff:'18:45', market:'Over 2.5', pick:'Over 2.5 Goals', odds:1.48, confidence:'high', edge:11.2, xgHome:2.0, xgAway:1.7, formHome:'WWDWW', formAway:'WLWWW', h2h:'3W 1D 1L', reasoning:'De Topper averages 3.8 goals over last 10. Both defences leaky away.', source:'auto', result:null, date:'2026-04-02' },
  { id:'s7', league:'Championship', home:'Leeds', away:'Sheffield Utd', kickoff:'12:30', market:'BTTS', pick:'Yes', odds:1.80, confidence:'medium', edge:5.5, xgHome:1.5, xgAway:1.2, formHome:'WDWLW', formAway:'DWWDW', h2h:'2W 1D 2L', reasoning:'Yorkshire derby. Both teams score in 70% of Championship home games for Leeds.', source:'manual', result:null, date:'2026-04-02' },
  { id:'s8', league:'Premier League', home:'Liverpool', away:'Man City', kickoff:'17:30', market:'BTTS', pick:'Yes', odds:1.57, confidence:'high', edge:10.3, xgHome:1.9, xgAway:1.7, formHome:'WWWDW', formAway:'WLWWW', h2h:'2W 1D 2L', reasoning:'BTTS landed in 8 of last 10 meetings. Both attackers in top form.', source:'auto', result:null, date:'2026-04-02' },
]

// ─── Utility ───
function hitRateColor(pct) {
  if (pct >= 80) return 'var(--accent-green)'
  if (pct >= 60) return 'var(--accent-orange)'
  if (pct >= 40) return 'var(--accent-yellow)'
  return 'var(--accent-red)'
}

function hitRateBg(pct) {
  if (pct >= 80) return 'var(--accent-green-dim)'
  if (pct >= 60) return 'var(--accent-orange-dim)'
  if (pct >= 40) return 'var(--accent-yellow-dim)'
  return 'var(--accent-red-dim)'
}

function confidenceColor(c) {
  if (c === 'high') return 'var(--accent-green)'
  if (c === 'medium') return 'var(--accent-orange)'
  return 'var(--accent-red)'
}

function edgeColor(e) {
  if (e >= 10) return 'var(--accent-green)'
  if (e >= 5) return 'var(--accent-orange)'
  return 'var(--accent-red)'
}

const today = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
const timeNow = () => new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' })

// ─── Sidebar ───
function Sidebar({ active, onNav, mobileOpen, onClose }) {
  const items = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'picks', icon: '⚽', label: 'Picks' },
    { id: 'fixtures', icon: '📅', label: 'Fixtures' },
    { id: 'results', icon: '✅', label: 'Results' },
    { id: 'import', icon: '📋', label: 'Import' },
  ]

  return (
    <>
      {mobileOpen && <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:998, display:'block' }} />}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 'var(--sidebar-width)',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        zIndex: 999,
        transform: mobileOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.2s ease',
        ...(typeof window !== 'undefined' && window.innerWidth <= 768 && !mobileOpen ? { transform: 'translateX(-100%)' } : {}),
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-green), #00b060)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 900, color: '#000',
            }}>⚡</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)' }}>Command Centre</div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Football Suite</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {items.map(item => (
            <button key={item.id} onClick={() => { onNav(item.id); onClose() }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px', borderRadius: '10px', border: 'none',
              background: active === item.id ? 'var(--accent-green-dim)' : 'transparent',
              color: active === item.id ? 'var(--accent-green)' : 'var(--text-secondary)',
              fontSize: '14px', fontWeight: active === item.id ? 700 : 500,
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease',
              marginBottom: '2px',
            }}>
              <span style={{ fontSize: '16px', width: '22px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)' }} />
            Football Season Active
          </div>
          <div style={{ marginTop: '4px', opacity: 0.6 }}>• Live Monitoring</div>
        </div>
      </aside>
    </>
  )
}

// ─── Header ───
function Header({ title, subtitle, onMenuToggle }) {
  const [time, setTime] = useState(timeNow())
  useEffect(() => {
    const t = setInterval(() => setTime(timeNow()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 24px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-secondary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button onClick={onMenuToggle} style={{
          display: 'none', background: 'none', border: 'none', color: 'var(--text)', fontSize: '22px', cursor: 'pointer',
          ...(typeof window !== 'undefined' && window.innerWidth <= 768 ? { display: 'block' } : {}),
        }}>☰</button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2 }}>{title}</h1>
          {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '2px' }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontFamily: "'JetBrains Mono', monospace" }}>● {time} UK</span>
        <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{today}</span>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 800, color: '#000',
        }}>D</div>
      </div>
    </header>
  )
}

// ─── Sortable Table ───
function SortableTable({ columns, data, onRowClick }) {
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  const sorted = useMemo(() => {
    if (!sortCol) return data
    const col = columns.find(c => c.key === sortCol)
    return [...data].sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol]
      if (col?.sortFn) return sortDir === 'asc' ? col.sortFn(a, b) : col.sortFn(b, a)
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va
      va = String(va || ''); vb = String(vb || '')
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })
  }, [data, sortCol, sortDir, columns])

  return (
    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: 'var(--bg-elevated)' }}>
            {columns.map(col => (
              <th key={col.key} onClick={() => col.sortable !== false && handleSort(col.key)} style={{
                padding: '10px 14px', textAlign: col.align || 'left',
                color: sortCol === col.key ? 'var(--accent-green)' : 'var(--text-dim)',
                fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px',
                cursor: col.sortable !== false ? 'pointer' : 'default',
                whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)',
                userSelect: 'none', position: 'sticky', top: 0, background: 'var(--bg-elevated)', zIndex: 1,
              }}>
                {col.label} {sortCol === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={row.id || i} onClick={() => onRowClick?.(row)} style={{
              background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)',
              cursor: onRowClick ? 'pointer' : 'default',
              transition: 'background 0.1s',
            }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
               onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)'}>
              {columns.map(col => (
                <td key={col.key} style={{
                  padding: '11px 14px', borderBottom: '1px solid var(--border)',
                  textAlign: col.align || 'left', whiteSpace: 'nowrap',
                }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>No data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ─── Stat Card ───
function StatCard({ label, value, sub, color = 'var(--text)' }) {
  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)',
      padding: '16px 18px', flex: 1, minWidth: '120px',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-1px' }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>{sub}</div>}
    </div>
  )
}

// ─── Badge ───
function Badge({ children, color, bg }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
      background: bg, color, letterSpacing: '0.3px', textTransform: 'uppercase',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
      {children}
    </span>
  )
}

// ─── Dashboard Page ───
function DashboardPage({ picks }) {
  const pending = picks.filter(p => !p.result)
  const won = picks.filter(p => p.result === 'won').length
  const lost = picks.filter(p => p.result === 'lost').length
  const total = won + lost
  const winRate = total > 0 ? ((won / total) * 100).toFixed(0) : '—'
  const roi = total > 0 ? (((picks.filter(p => p.result === 'won').reduce((s, p) => s + (p.odds - 1), 0) - lost) / total) * 100).toFixed(1) : '—'
  const avgEdge = pending.length > 0 ? (pending.reduce((s, p) => s + (p.edge || 0), 0) / pending.length).toFixed(1) : '—'
  const highConf = pending.filter(p => p.confidence === 'high')

  return (
    <div style={{ padding: '24px' }}>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <StatCard label="Today's Picks" value={pending.length} sub={`${picks.length} total incl. settled`} />
        <StatCard label="Win Rate" value={winRate === '—' ? '—' : `${winRate}%`} color={parseFloat(winRate) >= 60 ? 'var(--accent-green)' : 'var(--accent-orange)'} sub={`${won}W - ${lost}L`} />
        <StatCard label="ROI" value={roi === '—' ? '—' : `${roi}%`} color={parseFloat(roi) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'} />
        <StatCard label="Avg Edge" value={avgEdge === '—' ? '—' : `${avgEdge}%`} color='var(--accent-blue)' />
        <StatCard label="High Conf" value={highConf.length} color='var(--accent-green)' sub="picks today" />
      </div>

      {/* Best picks strip */}
      {highConf.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px' }}>🔥</span>
            <span style={{ fontWeight: 800, fontSize: '14px' }}>BEST LINES OF THE DAY</span>
            <Badge color="var(--accent-green)" bg="var(--accent-green-dim)">High Conf</Badge>
            {total > 0 && (
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace" }}>
                All-Time: {won}W - {lost}L ({winRate}%)
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
            {highConf.map(p => (
              <div key={p.id} style={{
                minWidth: '200px', padding: '14px 16px',
                background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)',
                borderTop: `3px solid var(--accent-green)`,
              }}>
                <Badge color="var(--accent-green)" bg="var(--accent-green-dim)">Top Pick</Badge>
                <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '8px' }}>{p.home}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>
                  ↑ {p.pick} <span style={{ color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace", marginLeft: '8px' }}>{p.odds.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
                  {LEAGUES[p.league]?.flag} {p.home} vs {p.away}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's fixtures table */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)' }} />
        <span style={{ fontWeight: 700, fontSize: '14px' }}>TODAY</span>
        <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>({pending.length} games)</span>
      </div>

      <SortableTable
        columns={[
          { key: 'kickoff', label: 'KO', render: v => <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>{v}</span> },
          { key: 'league', label: 'League', render: (v) => <span>{LEAGUES[v]?.flag} {v}</span> },
          { key: 'match', label: 'Match', render: (_, r) => <span style={{ fontWeight: 700 }}>{r.home} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>vs</span> {r.away}</span> },
          { key: 'market', label: 'Market' },
          { key: 'pick', label: 'Pick', render: v => <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{v}</span> },
          { key: 'odds', label: 'Odds', align: 'center', render: v => <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{v?.toFixed(2)}</span> },
          { key: 'confidence', label: 'Conf', align: 'center', render: v => <Badge color={confidenceColor(v)} bg={v === 'high' ? 'var(--accent-green-dim)' : v === 'medium' ? 'var(--accent-orange-dim)' : 'var(--accent-red-dim)'}>{v}</Badge> },
          { key: 'edge', label: 'Edge', align: 'center', render: v => v ? <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: edgeColor(v) }}>+{v.toFixed(1)}%</span> : '—' },
          { key: 'source', label: 'Src', align: 'center', render: v => v === 'manual' ? <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', fontWeight: 700 }}>MAN</span> : <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)', fontWeight: 700 }}>AUTO</span> },
        ]}
        data={pending}
      />
    </div>
  )
}

// ─── Picks Page (detailed) ───
function PicksPage({ picks, onResult, onDelete }) {
  const [leagueFilter, setLeagueFilter] = useState('All')
  const [marketFilter, setMarketFilter] = useState('All')
  const [confFilter, setConfFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  const pending = picks.filter(p => !p.result)
  const leagues = ['All', ...new Set(pending.map(p => p.league))]

  const filtered = pending.filter(p => {
    if (leagueFilter !== 'All' && p.league !== leagueFilter) return false
    if (marketFilter !== 'All' && p.market !== marketFilter) return false
    if (confFilter !== 'all' && p.confidence !== confFilter) return false
    return true
  })

  return (
    <div style={{ padding: '24px' }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {leagues.map(l => (
          <button key={l} onClick={() => setLeagueFilter(l)} style={{
            padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
            border: leagueFilter === l ? '1px solid var(--accent-green)' : '1px solid var(--border)',
            background: leagueFilter === l ? 'var(--accent-green-dim)' : 'transparent',
            color: leagueFilter === l ? 'var(--accent-green)' : 'var(--text-secondary)',
            cursor: 'pointer',
          }}>{l === 'All' ? '● All Leagues' : `${LEAGUES[l]?.flag || ''} ${l}`}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {MARKETS.map(m => (
          <button key={m} onClick={() => setMarketFilter(m)} style={{
            padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
            border: marketFilter === m ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
            background: marketFilter === m ? 'var(--accent-blue-dim)' : 'transparent',
            color: marketFilter === m ? 'var(--accent-blue)' : 'var(--text-dim)',
            cursor: 'pointer',
          }}>{m}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {CONFIDENCE_LEVELS.map(c => (
          <button key={c} onClick={() => setConfFilter(c)} style={{
            padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
            border: confFilter === c ? `1px solid ${c === 'all' ? 'var(--text-secondary)' : confidenceColor(c)}` : '1px solid var(--border)',
            background: confFilter === c ? (c === 'all' ? 'var(--bg-elevated)' : c === 'high' ? 'var(--accent-green-dim)' : c === 'medium' ? 'var(--accent-orange-dim)' : 'var(--accent-red-dim)') : 'transparent',
            color: confFilter === c ? (c === 'all' ? 'var(--text)' : confidenceColor(c)) : 'var(--text-dim)',
            cursor: 'pointer', textTransform: 'capitalize',
          }}>{c}</button>
        ))}
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>{filtered.length} picks</div>

      <SortableTable
        columns={[
          { key: 'kickoff', label: 'KO', render: v => <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>{v}</span> },
          { key: 'league', label: 'League', render: v => <span style={{ fontSize: '12px' }}>{LEAGUES[v]?.flag} {v}</span> },
          { key: 'match', label: 'Match', render: (_, r) => <span style={{ fontWeight: 700 }}>{r.home} <span style={{ color:'var(--text-dim)', fontWeight:400 }}>vs</span> {r.away}</span> },
          { key: 'market', label: 'Mkt' },
          { key: 'pick', label: 'Pick', render: v => <span style={{ fontWeight:700, color:'var(--accent-green)' }}>{v}</span> },
          { key: 'odds', label: 'Odds', align:'center', render: v => <span style={{ fontFamily:"'JetBrains Mono', monospace", fontWeight:700 }}>{v?.toFixed(2)}</span> },
          { key: 'xgHome', label: 'xG H', align:'center', render: v => v ? <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'12px' }}>{v}</span> : '—' },
          { key: 'xgAway', label: 'xG A', align:'center', render: v => v ? <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'12px' }}>{v}</span> : '—' },
          { key: 'formHome', label: 'Form H', align:'center', render: v => v ? <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', letterSpacing:'1px' }}>{v?.split('').map((c, i) => <span key={i} style={{ color: c === 'W' ? 'var(--accent-green)' : c === 'L' ? 'var(--accent-red)' : 'var(--accent-yellow)' }}>{c}</span>)}</span> : '—' },
          { key: 'formAway', label: 'Form A', align:'center', render: v => v ? <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', letterSpacing:'1px' }}>{v?.split('').map((c, i) => <span key={i} style={{ color: c === 'W' ? 'var(--accent-green)' : c === 'L' ? 'var(--accent-red)' : 'var(--accent-yellow)' }}>{c}</span>)}</span> : '—' },
          { key: 'confidence', label: 'Conf', align:'center', render: v => <Badge color={confidenceColor(v)} bg={v === 'high' ? 'var(--accent-green-dim)' : v === 'medium' ? 'var(--accent-orange-dim)' : 'var(--accent-red-dim)'}>{v}</Badge> },
          { key: 'edge', label: 'Edge', align:'center', render: v => v ? <span style={{ fontFamily:"'JetBrains Mono', monospace", fontWeight:700, color:edgeColor(v) }}>+{v.toFixed(1)}%</span> : '—' },
          { key: 'actions', label: '', align:'center', sortable: false, render: (_, r) => (
            <div style={{ display:'flex', gap:'4px', justifyContent:'center' }}>
              <button onClick={(e) => { e.stopPropagation(); onResult(r.id, 'won') }} style={{ padding:'4px 8px', borderRadius:'6px', border:'1px solid var(--accent-green)', background:'var(--accent-green-dim)', color:'var(--accent-green)', fontSize:'10px', fontWeight:700, cursor:'pointer' }}>W</button>
              <button onClick={(e) => { e.stopPropagation(); onResult(r.id, 'lost') }} style={{ padding:'4px 8px', borderRadius:'6px', border:'1px solid var(--accent-red)', background:'var(--accent-red-dim)', color:'var(--accent-red)', fontSize:'10px', fontWeight:700, cursor:'pointer' }}>L</button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(r.id) }} style={{ padding:'4px 8px', borderRadius:'6px', border:'1px solid var(--border)', background:'transparent', color:'var(--text-dim)', fontSize:'10px', cursor:'pointer' }}>✕</button>
            </div>
          )},
        ]}
        data={filtered}
        onRowClick={r => setExpandedId(expandedId === r.id ? null : r.id)}
      />

      {/* Expanded reasoning */}
      {expandedId && (() => {
        const p = filtered.find(x => x.id === expandedId)
        if (!p) return null
        return (
          <div style={{
            marginTop: '12px', padding: '16px 20px', background: 'var(--bg-card)', borderRadius: '12px',
            border: '1px solid var(--border)', borderLeft: '3px solid var(--accent-green)',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>{p.home} vs {p.away} — Reasoning</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p.reasoning}</div>
            {p.h2h && <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>H2H: {p.h2h}</div>}
          </div>
        )
      })()}
    </div>
  )
}

// ─── Results Page ───
function ResultsPage({ picks }) {
  const settled = picks.filter(p => p.result)
  return (
    <div style={{ padding: '24px' }}>
      <SortableTable
        columns={[
          { key: 'league', label: 'League', render: v => <span>{LEAGUES[v]?.flag} {v}</span> },
          { key: 'match', label: 'Match', render: (_, r) => <span style={{ fontWeight: 600 }}>{r.home} vs {r.away}</span> },
          { key: 'market', label: 'Market' },
          { key: 'pick', label: 'Pick', render: v => <span style={{ fontWeight: 700 }}>{v}</span> },
          { key: 'odds', label: 'Odds', align:'center', render: v => <span style={{ fontFamily:"'JetBrains Mono', monospace" }}>{v?.toFixed(2)}</span> },
          { key: 'result', label: 'Result', align:'center', render: v => (
            <Badge
              color={v === 'won' ? 'var(--accent-green)' : v === 'lost' ? 'var(--accent-red)' : 'var(--text-dim)'}
              bg={v === 'won' ? 'var(--accent-green-dim)' : v === 'lost' ? 'var(--accent-red-dim)' : 'var(--bg-elevated)'}
            >{v === 'won' ? '✓ WON' : v === 'lost' ? '✗ LOST' : '⊘ VOID'}</Badge>
          )},
          { key: 'pnl', label: 'P&L', align:'center', render: (_, r) => {
            const pl = r.result === 'won' ? (r.odds - 1) : r.result === 'lost' ? -1 : 0
            return <span style={{ fontFamily:"'JetBrains Mono', monospace", fontWeight:700, color: pl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{pl >= 0 ? '+' : ''}{pl.toFixed(2)}u</span>
          }},
        ]}
        data={settled}
      />
      {settled.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>No settled picks yet. Mark picks as Won/Lost from the Picks page.</div>}
    </div>
  )
}

// ─── Import Page ───
function ImportPage({ onImport, onAddManual }) {
  const [raw, setRaw] = useState('')
  const [manualForm, setManualForm] = useState({ league:'Premier League', home:'', away:'', kickoff:'', market:'Match Winner', pick:'', odds:'', confidence:'medium', edge:'', reasoning:'', xgHome:'', xgAway:'', formHome:'', formAway:'', h2h:'' })

  const inputStyle = { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid var(--border)', background:'var(--bg-input)', color:'var(--text)', fontSize:'14px', outline:'none', boxSizing:'border-box' }
  const labelStyle = { fontSize:'11px', fontWeight:700, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'4px', display:'block' }

  const update = (k, v) => setManualForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ padding: '24px', maxWidth: '700px' }}>
      {/* Paste import */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>📋 Paste Script Output</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '10px', lineHeight: 1.5 }}>
          Paste JSON array or pipe-delimited lines:<br />
          <code style={{ fontSize: '11px', color: 'var(--accent-green)', background: 'var(--bg-input)', padding: '2px 6px', borderRadius: '4px' }}>
            League | Home vs Away | HH:MM | Market | Pick | Odds | Confidence | Edge | Reasoning
          </code>
        </p>
        <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={8} placeholder="Paste your football script output here..." style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', resize: 'vertical' }} />
        <button onClick={() => { onImport(raw); setRaw('') }} style={{
          marginTop: '10px', padding: '12px 24px', borderRadius: '10px', border: 'none',
          background: 'var(--accent-green)', color: '#000', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
        }}>Import Picks</button>
      </div>

      {/* Manual add */}
      <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>✏️ Add Pick Manually</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div><label style={labelStyle}>League</label><select value={manualForm.league} onChange={e => update('league', e.target.value)} style={inputStyle}>{Object.keys(LEAGUES).map(l => <option key={l} value={l}>{l}</option>)}</select></div>
        <div><label style={labelStyle}>Kick-off</label><input type="time" value={manualForm.kickoff} onChange={e => update('kickoff', e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Home</label><input value={manualForm.home} onChange={e => update('home', e.target.value)} placeholder="Home team" style={inputStyle} /></div>
        <div><label style={labelStyle}>Away</label><input value={manualForm.away} onChange={e => update('away', e.target.value)} placeholder="Away team" style={inputStyle} /></div>
        <div><label style={labelStyle}>Market</label><select value={manualForm.market} onChange={e => update('market', e.target.value)} style={inputStyle}>{MARKETS.filter(m => m !== 'All').map(m => <option key={m} value={m}>{m}</option>)}</select></div>
        <div><label style={labelStyle}>Pick</label><input value={manualForm.pick} onChange={e => update('pick', e.target.value)} placeholder="e.g. Arsenal Win" style={inputStyle} /></div>
        <div><label style={labelStyle}>Odds</label><input type="number" step="0.01" value={manualForm.odds} onChange={e => update('odds', e.target.value)} placeholder="1.85" style={inputStyle} /></div>
        <div><label style={labelStyle}>Confidence</label><select value={manualForm.confidence} onChange={e => update('confidence', e.target.value)} style={inputStyle}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
        <div><label style={labelStyle}>Edge %</label><input type="number" step="0.1" value={manualForm.edge} onChange={e => update('edge', e.target.value)} placeholder="8.5" style={inputStyle} /></div>
        <div><label style={labelStyle}>xG Home</label><input type="number" step="0.1" value={manualForm.xgHome} onChange={e => update('xgHome', e.target.value)} placeholder="1.8" style={inputStyle} /></div>
        <div><label style={labelStyle}>xG Away</label><input type="number" step="0.1" value={manualForm.xgAway} onChange={e => update('xgAway', e.target.value)} placeholder="1.1" style={inputStyle} /></div>
        <div><label style={labelStyle}>Form Home</label><input value={manualForm.formHome} onChange={e => update('formHome', e.target.value)} placeholder="WWDWW" style={inputStyle} /></div>
        <div><label style={labelStyle}>Form Away</label><input value={manualForm.formAway} onChange={e => update('formAway', e.target.value)} placeholder="LWDLW" style={inputStyle} /></div>
        <div><label style={labelStyle}>H2H</label><input value={manualForm.h2h} onChange={e => update('h2h', e.target.value)} placeholder="3W 1D 1L" style={inputStyle} /></div>
      </div>
      <div style={{ marginTop: '12px' }}>
        <label style={labelStyle}>Reasoning</label>
        <textarea value={manualForm.reasoning} onChange={e => update('reasoning', e.target.value)} rows={3} placeholder="Why is this a value bet?" style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
      <button onClick={() => {
        if (!manualForm.home || !manualForm.away || !manualForm.pick || !manualForm.odds) return
        onAddManual({
          ...manualForm, id: Date.now().toString(), odds: parseFloat(manualForm.odds),
          edge: manualForm.edge ? parseFloat(manualForm.edge) : null,
          xgHome: manualForm.xgHome ? parseFloat(manualForm.xgHome) : null,
          xgAway: manualForm.xgAway ? parseFloat(manualForm.xgAway) : null,
          source: 'manual', result: null, date: new Date().toISOString().slice(0, 10),
        })
        setManualForm({ league:'Premier League', home:'', away:'', kickoff:'', market:'Match Winner', pick:'', odds:'', confidence:'medium', edge:'', reasoning:'', xgHome:'', xgAway:'', formHome:'', formAway:'', h2h:'' })
      }} style={{
        marginTop: '14px', padding: '12px 24px', borderRadius: '10px', border: 'none',
        background: 'var(--accent-green)', color: '#000', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
      }}>Add Pick</button>
    </div>
  )
}

// ─── Fixtures Page ───
function FixturesPage({ picks }) {
  const pending = picks.filter(p => !p.result)
  const byLeague = {}
  pending.forEach(p => { if (!byLeague[p.league]) byLeague[p.league] = []; byLeague[p.league].push(p) })

  return (
    <div style={{ padding: '24px' }}>
      {Object.entries(byLeague).map(([league, games]) => (
        <div key={league} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', padding: '8px 14px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)', borderLeft: `3px solid ${LEAGUES[league]?.color || 'var(--border)'}` }}>
            <span style={{ fontSize: '16px' }}>{LEAGUES[league]?.flag}</span>
            <span style={{ fontWeight: 800, fontSize: '14px' }}>{league}</span>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-dim)' }}>{games.length} games</span>
          </div>
          {games.map(g => (
            <div key={g.id} style={{
              display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)', gap: '16px',
            }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--text-dim)', minWidth: '45px' }}>{g.kickoff}</span>
              <span style={{ fontWeight: 700, flex: 1 }}>{g.home} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>vs</span> {g.away}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{g.market}</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-green)', minWidth: '100px', textAlign: 'right' }}>{g.pick}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, minWidth: '45px', textAlign: 'right' }}>{g.odds.toFixed(2)}</span>
            </div>
          ))}
        </div>
      ))}
      {Object.keys(byLeague).length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>No fixtures. Import or add picks first.</div>}
    </div>
  )
}

// ─── Main App ───
export default function App() {
  const [page, setPage] = useState('dashboard')
  const [picks, setPicks] = useState(SAMPLE_PICKS)
  const [mobileMenu, setMobileMenu] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const saved = store.get('picks')
    if (saved && saved.length > 0) setPicks(saved)
  }, [])

  // Save
  useEffect(() => { store.set('picks', picks) }, [picks])

  const onResult = useCallback((id, result) => { setPicks(p => p.map(x => x.id === id ? { ...x, result } : x)) }, [])
  const onDelete = useCallback((id) => { setPicks(p => p.filter(x => x.id !== id)) }, [])
  const onAddManual = useCallback((pick) => { setPicks(p => [pick, ...p]) }, [])

  const onImport = useCallback((raw) => {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const newPicks = parsed.map((p, i) => ({
          id: `import-${Date.now()}-${i}`, league: p.league || 'Unknown', home: p.home || 'Home', away: p.away || 'Away',
          kickoff: p.kickoff || p.time || 'TBD', market: p.market || 'Match Winner', pick: p.pick || p.selection || '',
          odds: parseFloat(p.odds) || 0, confidence: p.confidence || 'medium', edge: p.edge ? parseFloat(p.edge) : null,
          xgHome: p.xgHome ? parseFloat(p.xgHome) : null, xgAway: p.xgAway ? parseFloat(p.xgAway) : null,
          formHome: p.formHome || '', formAway: p.formAway || '', h2h: p.h2h || '',
          reasoning: p.reasoning || p.analysis || '', source: 'auto', result: null, date: new Date().toISOString().slice(0, 10),
        }))
        setPicks(p => [...newPicks, ...p]); return
      }
    } catch {}
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
    const newPicks = lines.map((line, i) => {
      const parts = line.split('|').map(s => s.trim())
      if (parts.length < 6) return null
      const teams = (parts[1] || '').split(/\bvs\b/i).map(s => s.trim())
      return {
        id: `paste-${Date.now()}-${i}`, league: parts[0] || 'Unknown', home: teams[0] || 'Home', away: teams[1] || 'Away',
        kickoff: parts[2] || 'TBD', market: parts[3] || 'Match Winner', pick: parts[4] || '',
        odds: parseFloat(parts[5]) || 0, confidence: (parts[6] || 'medium').toLowerCase(),
        edge: parts[7] ? parseFloat(parts[7]) : null, reasoning: parts[8] || '',
        xgHome: null, xgAway: null, formHome: '', formAway: '', h2h: '',
        source: 'auto', result: null, date: new Date().toISOString().slice(0, 10),
      }
    }).filter(Boolean)
    if (newPicks.length > 0) setPicks(p => [...newPicks, ...p])
  }, [])

  const titles = { dashboard: ['Dashboard', 'Overview of today\'s football picks and performance'], picks: ['Picks', 'Detailed view with xG, form, and filters'], fixtures: ['Fixtures', 'Today\'s games grouped by league'], results: ['Results', 'Settled picks and P&L tracking'], import: ['Import', 'Add picks manually or paste script output'] }
  const [title, subtitle] = titles[page] || ['', '']

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar active={page} onNav={setPage} mobileOpen={mobileMenu} onClose={() => setMobileMenu(false)} />
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh', transition: 'margin 0.2s ease' }}>
        <Header title={title} subtitle={subtitle} onMenuToggle={() => setMobileMenu(m => !m)} />
        {page === 'dashboard' && <DashboardPage picks={picks} />}
        {page === 'picks' && <PicksPage picks={picks} onResult={onResult} onDelete={onDelete} />}
        {page === 'fixtures' && <FixturesPage picks={picks} />}
        {page === 'results' && <ResultsPage picks={picks} />}
        {page === 'import' && <ImportPage onImport={onImport} onAddManual={onAddManual} />}
      </div>
    </div>
  )
}
