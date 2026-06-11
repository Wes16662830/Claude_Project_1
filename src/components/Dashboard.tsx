import React from 'react'
import { fmtTime } from '../data/raceData'
import { type Profile, type SegmentSplit } from '../data/profile'

const card: React.CSSProperties = {
  background: '#111',
  border: '1px solid #1e1e1e',
  borderRadius: 12,
  padding: '20px 24px',
}

const sectionTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: '#aaa',
  marginBottom: 16,
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
}

const RANK_COLORS = ['#d63b2f', '#e8962a', '#4a9fd4']

function rankColor(i: number): string {
  return RANK_COLORS[i] ?? '#4a9fd4'
}

// Each running second/km counts 8× (8 runs); stations count once.
function weightedLoss(seg: SegmentSplit): number {
  const delta = seg.targetSeconds - seg.actualSeconds // negative = lost time
  return seg.type === 'run' ? delta * 8 : delta
}

interface Props { profile: Profile }

export default function Dashboard({ profile }: Props) {
  const { segments, lastFinishSeconds, targetFinishSeconds } = profile
  const timeToFind = lastFinishSeconds - targetFinishSeconds
  const runSeg = segments.find(s => s.type === 'run')
  const runGap = runSeg ? Math.abs(runSeg.targetSeconds - runSeg.actualSeconds) * 8 : 0
  const runPct = timeToFind > 0 ? Math.round((runGap / timeToFind) * 100) : 0

  // Dynamic top-3 priorities: largest weighted losses.
  const priorities = [...segments]
    .map(s => ({ seg: s, loss: weightedLoss(s) }))
    .filter(x => x.loss < 0)
    .sort((a, b) => a.loss - b.loss)
    .slice(0, 3)

  const maxAbsDelta = Math.max(...segments.map(s => Math.abs(s.targetSeconds - s.actualSeconds)), 1)

  const heroes = [
    { label: 'Last Finish', value: fmtTime(lastFinishSeconds), sub: profile.lastRaceName, color: '#f0ede8' },
    { label: 'Target', value: fmtTime(targetFinishSeconds), sub: `${profile.nextRaceName} — goal`, color: '#e8962a' },
    { label: 'Time to Find', value: fmtTime(Math.abs(timeToFind)), sub: `${Math.abs(timeToFind)}s ${timeToFind >= 0 ? 'to cut' : 'of buffer'}`, color: timeToFind >= 0 ? '#d63b2f' : '#2a8c5a' },
    { label: 'Run Gap Alone', value: fmtTime(runGap), sub: `${runPct}% of total deficit`, color: '#4a9fd4' },
  ]

  return (
    <div style={{ padding: '24px', maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
        {heroes.map(h => (
          <div key={h.label} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: h.color }}>{h.value}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{h.sub}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={sectionTitle}>Gap by Segment</div>
        {segments.map(seg => {
          const delta = seg.targetSeconds - seg.actualSeconds
          const pct = Math.min(Math.abs(delta) / maxAbsDelta * 100, 100)
          const color = delta >= 0 ? '#2a8c5a' : delta > -15 ? '#e8962a' : '#d63b2f'
          return (
            <div key={seg.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 120, fontSize: 13, color: '#ccc', flexShrink: 0 }}>{seg.label}</div>
              <div style={{ flex: 1, height: 8, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4 }} />
              </div>
              <div style={{ width: 56, fontSize: 13, fontWeight: 600, textAlign: 'right', flexShrink: 0, color }}>
                {delta >= 0 ? '+' : ''}{delta}s
              </div>
            </div>
          )
        })}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#888' }}>{fmtTime(lastFinishSeconds)} → {fmtTime(targetFinishSeconds)}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e8962a' }}>-{fmtTime(Math.abs(timeToFind))} needed</span>
        </div>
      </div>

      {priorities.length > 0 && (
        <div>
          <div style={sectionTitle}>Top {priorities.length} Priorities</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {priorities.map((p, i) => {
              const c = rankColor(i)
              const isRun = p.seg.type === 'run'
              return (
                <div key={p.seg.id} style={{ ...card, borderLeft: `3px solid ${c}` }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: '50%', background: c,
                    color: '#fff', fontSize: 12, fontWeight: 700, marginBottom: 8,
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#f0ede8' }}>{p.seg.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: c, marginBottom: 4 }}>
                    {fmtTime(p.loss)} {isRun ? 'total' : ''}
                  </div>
                  <div style={{ fontSize: 12, color: '#777', lineHeight: 1.5 }}>
                    {isRun
                      ? `${Math.abs(p.seg.targetSeconds - p.seg.actualSeconds)}s/km × 8 runs. Biggest single lever — chase race pace.`
                      : p.seg.note}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
