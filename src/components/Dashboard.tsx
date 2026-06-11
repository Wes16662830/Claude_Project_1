import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { fmtTime } from '../data/raceData'
import { getFitnessLevel, type Profile, type SegmentSplit } from '../data/profile'
import { TRAINING_PLAN, WEEK_LOAD, PHASE_COLORS } from '../data/trainingPlan'

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
function rankColor(i: number): string { return RANK_COLORS[i] ?? '#4a9fd4' }

// Running seconds/km × 8 runs; stations once.
function segSaves(seg: SegmentSplit): number {
  const diff = seg.actualSeconds - seg.targetSeconds
  return seg.type === 'run' ? diff * 8 : diff
}

interface Props { profile: Profile }

export default function Dashboard({ profile }: Props) {
  const { segments, lastFinishSeconds, targetFinishSeconds } = profile

  const runSeg    = segments.find(s => s.type === 'run')
  const stations  = segments.filter(s => s.type === 'station')

  const sumActuals  = (runSeg ? runSeg.actualSeconds  * 8 : 0) + stations.reduce((a, s) => a + s.actualSeconds,  0)
  const sumTargets  = (runSeg ? runSeg.targetSeconds   * 8 : 0) + stations.reduce((a, s) => a + s.targetSeconds,  0)
  // Transition/pen time implied by the last race result vs the sum of recorded splits
  const transitions = Math.max(lastFinishSeconds - sumActuals, 0)

  const projectedWithTargets = sumTargets + transitions
  const totalNeeded  = lastFinishSeconds - targetFinishSeconds   // e.g. 406s
  const totalSavings = sumActuals - sumTargets                   // e.g. 226s
  const budgetGap    = projectedWithTargets - targetFinishSeconds // e.g. 180s

  // Per-segment savings from hitting targets, sorted best → worst
  const savingsRanked = [...segments]
    .map(s => ({ seg: s, saves: segSaves(s) }))
    .sort((a, b) => b.saves - a.saves)

  // Top-3 priorities (biggest weighted gap — run counts ×8)
  const priorities = [...segments]
    .map(s => ({ seg: s, loss: s.type === 'run' ? (s.targetSeconds - s.actualSeconds) * 8 : (s.targetSeconds - s.actualSeconds) }))
    .filter(x => x.loss < 0)
    .sort((a, b) => a.loss - b.loss)
    .slice(0, 3)

  const budgetPct = totalNeeded > 0 ? Math.min(totalSavings / totalNeeded, 1) : 1
  const projColor = budgetGap <= 0 ? '#2a8c5a' : budgetGap < 60 ? '#e8962a' : '#d63b2f'

  const heroes = [
    { label: 'Last Finish',        value: fmtTime(lastFinishSeconds),        sub: profile.lastRaceName,                color: '#f0ede8' },
    { label: 'Target',             value: fmtTime(targetFinishSeconds),       sub: `${profile.nextRaceName} — goal`,   color: '#e8c12a' },
    { label: 'Time to Find',       value: fmtTime(Math.abs(totalNeeded)),     sub: `${totalNeeded}s total to cut`,     color: totalNeeded > 0 ? '#d63b2f' : '#2a8c5a' },
    { label: 'Proj. w/ Targets',   value: fmtTime(projectedWithTargets),
      sub: budgetGap > 0 ? `${budgetGap}s short of goal` : 'On track ✓',     color: projColor },
  ]

  return (
    <div style={{ padding: '24px', maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Hero stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
        {heroes.map(h => (
          <div key={h.label} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: h.color }}>{h.value}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{h.sub}</div>
          </div>
        ))}
      </div>

      {/* Time Budget */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={sectionTitle}>Time Budget</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {totalNeeded}s to find total &nbsp;·&nbsp; {totalSavings}s from current targets &nbsp;·&nbsp;
            <span style={{ fontWeight: 700, color: budgetGap > 0 ? '#d63b2f' : '#2a8c5a' }}>
              {budgetGap > 0 ? `${budgetGap}s still unaccounted for` : 'Targets cover the gap ✓'}
            </span>
          </div>
        </div>

        {/* Progress bar — how much of the needed savings current targets cover */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ height: 10, background: '#1a1a1a', borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', width: `${budgetPct * 100}%`, background: `linear-gradient(90deg, #2a8c5a, #e8962a)`, borderRadius: 5 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555' }}>
            <span>Targets cover {Math.round(budgetPct * 100)}% of the needed savings</span>
            {budgetGap > 0 && <span style={{ color: '#d63b2f' }}>{budgetGap}s shortfall — push targets further</span>}
          </div>
        </div>

        {/* Per-segment savings */}
        {savingsRanked.map(({ seg, saves }) => {
          const barPct = totalNeeded > 0 ? Math.abs(saves) / totalNeeded * 100 : 0
          const isAhead = saves < 0
          const color = isAhead ? '#2a8c5a' : saves === 0 ? '#333' : saves >= 40 ? '#d63b2f' : saves >= 20 ? '#e8962a' : '#4a9fd4'
          return (
            <div key={seg.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 110, fontSize: 12, color: '#ccc', flexShrink: 0 }}>{seg.label}</div>
              <div style={{ flex: 1, height: 7, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(barPct, 100)}%`, background: color, borderRadius: 4 }} />
              </div>
              <div style={{ width: 64, fontSize: 12, fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>
                {isAhead
                  ? <span style={{ color: '#2a8c5a' }}>−{Math.abs(saves)}s ahead</span>
                  : <span style={{ color }}>{saves > 0 ? `+${saves}s` : '—'}</span>}
              </div>
            </div>
          )
        })}

        {budgetGap > 0 && (
          <div style={{
            marginTop: 16, paddingTop: 14, borderTop: '1px solid #1a1a1a',
            fontSize: 12, color: '#e8962a', lineHeight: 1.6,
          }}>
            <span style={{ fontWeight: 700 }}>To close the {budgetGap}s gap: </span>
            {savingsRanked
              .filter(x => x.saves > 10)
              .slice(0, 3)
              .map(x => {
                const extra = Math.round(x.saves * budgetGap / totalSavings)
                const newTarget = x.seg.type === 'run'
                  ? fmtTime(x.seg.targetSeconds - Math.round(extra / 8)) + '/km'
                  : fmtTime(x.seg.targetSeconds - extra)
                return `${x.seg.label} → ${newTarget}`
              }).join(' · ')}
            <span style={{ color: '#666' }}> — adjust in Settings → Segment Splits</span>
          </div>
        )}
      </div>

      {/* Gap by Segment */}
      <div style={card}>
        <div style={sectionTitle}>Gap by Segment — Actual vs Target</div>
        {segments.map(seg => {
          const delta = seg.targetSeconds - seg.actualSeconds
          const maxAbsDelta = Math.max(...segments.map(s => Math.abs(s.targetSeconds - s.actualSeconds)), 1)
          const pct = Math.min(Math.abs(delta) / maxAbsDelta * 100, 100)
          const color = delta >= 0 ? '#2a8c5a' : delta > -15 ? '#e8962a' : '#d63b2f'
          return (
            <div key={seg.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 120, fontSize: 13, color: '#ccc', flexShrink: 0 }}>{seg.label}</div>
              <div style={{ flex: 1, height: 8, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4 }} />
              </div>
              <div style={{ width: 56, fontSize: 13, fontWeight: 600, textAlign: 'right', flexShrink: 0, color }}>
                {delta >= 0 ? '+' : ''}{delta}{seg.type === 'run' ? 's/km' : 's'}
              </div>
            </div>
          )
        })}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
          <span>Positive = already meeting target &nbsp;·&nbsp; Negative = gap to close</span>
          <span style={{ color: '#aaa' }}>Running gap shown per km (×8 for total impact)</span>
        </div>
      </div>

      {/* Top 3 priorities */}
      {priorities.length > 0 && (
        <div>
          <div style={sectionTitle}>Top {priorities.length} Focus Areas</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {priorities.map((p, i) => {
              const c = rankColor(i)
              const isRun = p.seg.type === 'run'
              const lossAbs = Math.abs(p.loss)
              const pctOfNeed = totalNeeded > 0 ? Math.round(lossAbs / totalNeeded * 100) : 0
              return (
                <div key={p.seg.id} style={{ ...card, borderLeft: `3px solid ${c}` }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: '50%', background: c,
                    color: '#fff', fontSize: 12, fontWeight: 700, marginBottom: 8,
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#f0ede8' }}>{p.seg.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: c, marginBottom: 4, fontFamily: 'monospace' }}>
                    -{fmtTime(lossAbs)}
                  </div>
                  <div style={{ fontSize: 12, color: '#777', lineHeight: 1.5 }}>
                    {isRun
                      ? `${Math.abs(p.seg.targetSeconds - p.seg.actualSeconds)}s/km × 8 runs = ${fmtTime(lossAbs)} total. ${pctOfNeed}% of your entire deficit.`
                      : `${p.seg.note} · ${pctOfNeed}% of total deficit`}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Training load progression */}
      {(() => {
        const fitness = getFitnessLevel(profile.fitnessLevel)
        const chartData = TRAINING_PLAN.map(w => ({
          week: `W${w.week}`,
          theme: w.weekTheme,
          load: Math.round((WEEK_LOAD[w.week] ?? 50) * fitness.volumePct),
          phase: w.phase,
        }))
        return (
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
              <div style={sectionTitle}>Training Load Progression</div>
              <div style={{ fontSize: 12, color: fitness.color, fontWeight: 600, marginBottom: 16 }}>
                {fitness.label} — {Math.round(fitness.volumePct * 100)}% volume
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="week" tick={{ fill: '#666', fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#aaa' }}
                  formatter={(v: number, _: string, entry: { payload?: { theme?: string } }) => [
                    `${v} load units`, entry.payload?.theme ?? '',
                  ]}
                />
                <Bar dataKey="load" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={PHASE_COLORS[entry.phase as keyof typeof PHASE_COLORS] + 'cc'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
              {(['aerobic', 'build', 'peak'] as const).map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#777' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: PHASE_COLORS[p] }} />
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </div>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#555' }}>Peaks W7, tapers W10–11</span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
