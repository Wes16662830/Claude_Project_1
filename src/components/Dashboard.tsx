import React from 'react'
import { SEGMENTS, ACTUAL_FINISH, TARGET_FINISH, TOTAL_GAP, ATHLETE, fmtTime } from '../data/raceData'

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

function priorityCardStyle(rank: number): React.CSSProperties {
  const borderColor = rank === 1 ? '#d63b2f' : rank === 2 ? '#e8962a' : '#4a9fd4'
  return { ...card, borderLeft: `3px solid ${borderColor}` }
}

function rankBadgeStyle(rank: number): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: rank === 1 ? '#d63b2f' : rank === 2 ? '#e8962a' : '#4a9fd4',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
  }
}

function priorityDeltaStyle(rank: number): React.CSSProperties {
  return {
    fontSize: 24,
    fontWeight: 800,
    color: rank === 1 ? '#d63b2f' : rank === 2 ? '#e8962a' : '#4a9fd4',
    marginBottom: 4,
  }
}

const PRIORITIES = [
  {
    rank: 1,
    label: 'Running Pace',
    delta: '−3:52 total',
    note: '−29s/km × 8 runs = 232s. Target: 4:32/km. Biggest single lever in the race.',
  },
  {
    rank: 2,
    label: 'Sled Pull',
    delta: '−0:48',
    note: 'Ranked #225 at JHB. 50m haul. Target: 2:43 total. Train at race load weekly.',
  },
  {
    rank: 3,
    label: 'Row + Wall Balls',
    delta: '−1:11 combined',
    note: 'Row −37s · Wall Balls −34s. Both fixable with pacing and breathing discipline.',
  },
]

export default function Dashboard() {
  const totalSaved = TOTAL_GAP
  const runGap = 29 * 8

  return (
    <div style={{ padding: '24px', maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { label: 'Last Finish', value: ATHLETE.lastFinish, sub: ATHLETE.lastRace, color: '#f0ede8' },
          { label: 'Target', value: ATHLETE.target, sub: `${ATHLETE.nextRace} — podium`, color: '#e8962a' },
          { label: 'Time to Find', value: fmtTime(totalSaved), sub: `${totalSaved}s across all segments`, color: '#d63b2f' },
          { label: 'Run Gap Alone', value: fmtTime(runGap), sub: '57% of total deficit', color: '#4a9fd4' },
        ].map(h => (
          <div key={h.label} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: h.color }}>{h.value}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{h.sub}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={sectionTitle}>Gap by Segment</div>
        {SEGMENTS.map(seg => {
          const maxGap = 48
          const pct = Math.min(Math.abs(seg.deltaSeconds) / maxGap * 100, 100)
          const color = seg.deltaSeconds >= 0 ? '#2a8c5a' : seg.deltaSeconds > -15 ? '#e8962a' : '#d63b2f'
          return (
            <div key={seg.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 120, fontSize: 13, color: '#ccc', flexShrink: 0 }}>{seg.label}</div>
              <div style={{ flex: 1, height: 8, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4 }} />
              </div>
              <div style={{ width: 56, fontSize: 13, fontWeight: 600, textAlign: 'right', flexShrink: 0, color }}>
                {seg.deltaSeconds >= 0 ? '+' : ''}{seg.deltaSeconds}s
              </div>
            </div>
          )
        })}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#888' }}>{fmtTime(ACTUAL_FINISH)} → {fmtTime(TARGET_FINISH)}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e8962a' }}>-{fmtTime(totalSaved)} needed</span>
        </div>
      </div>

      <div>
        <div style={sectionTitle}>Top 3 Priorities</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {PRIORITIES.map(p => (
            <div key={p.rank} style={priorityCardStyle(p.rank)}>
              <div style={rankBadgeStyle(p.rank)}>{p.rank}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#f0ede8' }}>{p.label}</div>
              <div style={priorityDeltaStyle(p.rank)}>{p.delta}</div>
              <div style={{ fontSize: 12, color: '#777', lineHeight: 1.5 }}>{p.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
