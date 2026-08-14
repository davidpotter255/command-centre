import { Player } from '@remotion/player'
import { useMemo, useState } from 'react'
import { EXAMPLES } from '../remotion/data/examples'
import { TEMPLATE_LIST, TEMPLATES } from '../remotion/templates'
import { FORMATS, FPS, type BettingVideo, type FormatId, type TemplateId } from '../remotion/types'
import { pickToVideo, previousResultFromPick, type Pick } from '../remotion/utils/pickToVideo'

const ACCENTS = [
  { id: 'green', hex: '#00E676' },
  { id: 'blue', hex: '#448AFF' },
  { id: 'purple', hex: '#B388FF' },
  { id: 'amber', hex: '#FFB020' },
  { id: 'cyan', hex: '#18FFFF' },
]

const input: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--bg-input)',
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}

const label: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text-dim)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: 5,
  display: 'block',
}

const card: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '16px 18px',
  marginBottom: 14,
}

/** "Salah 1+ Shot on Target | 1.30" per line -> legs. */
const parseLegs = (raw: string) =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [selection, odds] = line.split('|').map((s) => s.trim())
      return { selection, odds: odds || undefined }
    })

const legsToText = (legs?: { selection: string; odds?: string }[]) =>
  (legs ?? []).map((l) => (l.odds ? `${l.selection} | ${l.odds}` : l.selection)).join('\n')

type Props = { picks: Pick[] }

export default function VideoStudio({ picks }: Props) {
  const [templateId, setTemplateId] = useState<TemplateId>('best-bet')
  const [formatId, setFormatId] = useState<FormatId>('9:16')
  const [pickId, setPickId] = useState<string>('example')
  const [previousId, setPreviousId] = useState<string>('none')
  const [hook, setHook] = useState('')
  const [cta, setCta] = useState('')
  const [handle, setHandle] = useState('@commandcentre')
  const [watermark, setWatermark] = useState('')
  const [accent, setAccent] = useState('green')
  const [legsText, setLegsText] = useState(legsToText(EXAMPLES['bet-builder'].betBuilderLegs))
  const [copied, setCopied] = useState(false)

  const pending = picks.filter((p) => !p.result)
  const settled = picks.filter((p) => p.result)
  const template = TEMPLATES[templateId]
  const format = FORMATS[formatId]

  const data: BettingVideo = useMemo(() => {
    const branding = {
      handle: handle.trim() || undefined,
      watermark: watermark.trim() || undefined,
      accent,
    }

    const overrides: Partial<BettingVideo> = {}
    if (hook.trim()) overrides.hook = hook.trim()
    if (cta.trim()) overrides.callToAction = cta.trim()

    if (templateId === 'bet-builder') {
      const legs = parseLegs(legsText)
      if (legs.length > 0) overrides.betBuilderLegs = legs
      // Let the template recompute the accumulator from the legs on screen.
      overrides.combinedOdds = undefined
    }

    if (templateId === 'result-next-pick') {
      const source = settled.find((p) => p.id === previousId)
      if (source) overrides.previousResult = previousResultFromPick(source)
    }

    const selected = pending.find((p) => p.id === pickId)
    if (!selected) {
      const example = EXAMPLES[templateId]
      return {
        ...example,
        ...overrides,
        branding: { ...example.branding, ...branding },
      }
    }

    return pickToVideo(selected, templateId, overrides, branding)
  }, [templateId, pickId, previousId, hook, cta, handle, watermark, accent, legsText, picks])

  const durationInFrames = template.duration(data)
  const compositionId = `${template.key}-${formatId.replace(':', 'x')}`
  const renderCommand = `npx remotion render src/remotion/index.ts ${compositionId} out/${templateId}.mp4 --props=./video-props.json`

  const downloadProps = () => {
    const blob = new Blob([JSON.stringify({ data }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'video-props.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyCommand = () => {
    navigator.clipboard?.writeText(renderCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div style={{ padding: 24, display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {/* ── Controls ─────────────────────────────────────────── */}
      <div style={{ flex: '1 1 380px', minWidth: 320, maxWidth: 520 }}>
        <div style={card}>
          <span style={label}>Template</span>
          <div style={{ display: 'grid', gap: 8 }}>
            {TEMPLATE_LIST.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                style={{
                  textAlign: 'left',
                  padding: '11px 14px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  border: templateId === t.id ? '1px solid var(--accent-green)' : '1px solid var(--border)',
                  background: templateId === t.id ? 'var(--accent-green-dim)' : 'transparent',
                  color: templateId === t.id ? 'var(--accent-green)' : 'var(--text-secondary)',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3, lineHeight: 1.4 }}>{t.blurb}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={card}>
          <span style={label}>Pick</span>
          <select value={pickId} onChange={(e) => setPickId(e.target.value)} style={input}>
            <option value="example">Example data ({template.label})</option>
            {pending.map((p) => (
              <option key={p.id} value={p.id}>
                {p.home} v {p.away} — {p.pick} @ {p.odds}
              </option>
            ))}
          </select>

          {templateId === 'result-next-pick' && (
            <div style={{ marginTop: 12 }}>
              <span style={label}>Yesterday's result</span>
              <select value={previousId} onChange={(e) => setPreviousId(e.target.value)} style={input}>
                <option value="none">Example result</option>
                {settled.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.home} v {p.away} — {p.pick} ({p.result})
                  </option>
                ))}
              </select>
            </div>
          )}

          {templateId === 'bet-builder' && (
            <div style={{ marginTop: 12 }}>
              <span style={label}>Legs — one per line, "selection | odds"</span>
              <textarea
                value={legsText}
                onChange={(e) => setLegsText(e.target.value)}
                rows={5}
                style={{ ...input, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, resize: 'vertical' }}
              />
            </div>
          )}
        </div>

        <div style={card}>
          <span style={label}>Copy</span>
          <input
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            placeholder={`Hook — default: "${EXAMPLES[templateId].hook}"`}
            style={input}
          />
          <div style={{ height: 10 }} />
          <input
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            placeholder={`CTA — default: "${EXAMPLES[templateId].callToAction}"`}
            style={input}
          />
        </div>

        <div style={card}>
          <span style={label}>Branding</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@handle" style={input} />
            <input
              value={watermark}
              onChange={(e) => setWatermark(e.target.value)}
              placeholder="Watermark"
              style={input}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAccent(a.id)}
                title={a.id}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: a.hex,
                  cursor: 'pointer',
                  border: accent === a.id ? '3px solid var(--text)' : '3px solid transparent',
                  boxShadow: accent === a.id ? `0 0 12px ${a.hex}` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <div style={card}>
          <span style={label}>Format</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.values(FORMATS).map((f) => (
              <button
                key={f.id}
                onClick={() => setFormatId(f.id)}
                style={{
                  flex: 1,
                  padding: '9px 8px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: formatId === f.id ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                  background: formatId === f.id ? 'var(--accent-blue-dim)' : 'transparent',
                  color: formatId === f.id ? 'var(--accent-blue)' : 'var(--text-dim)',
                }}
              >
                {f.id}
                <div style={{ fontSize: 10, fontWeight: 500, marginTop: 2, opacity: 0.75 }}>{f.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={card}>
          <span style={label}>Render</span>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.55, marginBottom: 10 }}>
            No render server is wired up yet, so export runs locally: download the props, then run the
            command in the project root. Swap this block for a POST to a render endpoint when one exists.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={downloadProps}
              style={{
                padding: '11px 18px',
                borderRadius: 10,
                border: 'none',
                background: 'var(--accent-green)',
                color: '#000',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Download props JSON
            </button>
            <button
              onClick={copyCommand}
              style={{
                padding: '11px 18px',
                borderRadius: 10,
                border: '1px solid var(--border-light)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {copied ? 'Copied ✓' : 'Copy render command'}
            </button>
          </div>
          <code
            style={{
              display: 'block',
              marginTop: 12,
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--bg-input)',
              color: 'var(--accent-green)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              lineHeight: 1.6,
              wordBreak: 'break-all',
            }}
          >
            {renderCommand}
          </code>
        </div>
      </div>

      {/* ── Preview ──────────────────────────────────────────── */}
      <div style={{ flex: '1 1 340px', minWidth: 300, position: 'sticky', top: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
            fontSize: 12,
            color: 'var(--text-dim)',
          }}
        >
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{compositionId}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {(durationInFrames / FPS).toFixed(1)}s · {format.width}×{format.height}
          </span>
        </div>
        <div
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid var(--border)',
            background: '#04040A',
            maxWidth: formatId === '9:16' ? 380 : 520,
          }}
        >
          <Player
            component={template.component}
            inputProps={{ data }}
            durationInFrames={durationInFrames}
            fps={FPS}
            compositionWidth={format.width}
            compositionHeight={format.height}
            style={{ width: '100%' }}
            controls
            loop
            acknowledgeRemotionLicense
          />
        </div>
      </div>
    </div>
  )
}
