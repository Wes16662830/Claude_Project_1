import React, { useEffect, useState } from 'react'
import { fmtTime, parseTime } from '../data/raceData'
import {
  DIVISIONS, EQUIPMENT_CATALOG, FITNESS_LEVELS, getDivision, DEFAULT_PROFILE,
  type Profile, type EquipmentId, type Equipment, type FitnessLevel,
} from '../data/profile'

const card: React.CSSProperties = {
  background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '20px 24px',
}
const sectionTitle: React.CSSProperties = {
  fontSize: 14, fontWeight: 700, color: '#aaa', marginBottom: 16,
  textTransform: 'uppercase', letterSpacing: '0.8px',
}
const fieldLabel: React.CSSProperties = {
  fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6, display: 'block',
}
const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 6,
  padding: '9px 12px', color: '#f0ede8', fontSize: 14, fontFamily: 'inherit',
}

// Time field with isolated text state so typing isn't clobbered by re-renders.
function TimeInput({ seconds, onCommit }: { seconds: number; onCommit: (s: number) => void }) {
  const [text, setText] = useState(fmtTime(seconds))
  useEffect(() => {
    if (parseTime(text) !== seconds) setText(fmtTime(seconds))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds])
  return (
    <input
      value={text}
      onChange={e => {
        setText(e.target.value)
        const parsed = parseTime(e.target.value)
        if (parsed !== null) onCommit(parsed)
      }}
      onBlur={() => setText(fmtTime(seconds))}
      style={{ ...inputStyle, fontFamily: 'monospace', textAlign: 'center', padding: '7px 8px' }}
    />
  )
}

const GROUP_LABELS: Record<Equipment['group'], string> = {
  hyrox: 'Hyrox machines', free: 'Free weights', accessory: 'Accessories',
}

interface Props {
  profile: Profile
  setProfile: (p: Profile) => void
}

export default function Settings({ profile, setProfile }: Props) {
  const update = (patch: Partial<Profile>) => setProfile({ ...profile, ...patch })
  const division = getDivision(profile.division)

  const toggleEquipment = (id: EquipmentId) => {
    const has = profile.equipment.includes(id)
    update({ equipment: has ? profile.equipment.filter(e => e !== id) : [...profile.equipment, id] })
  }

  const updateSegment = (index: number, field: 'actualSeconds' | 'targetSeconds', value: number) => {
    const segments = profile.segments.map((s, i) => i === index ? { ...s, [field]: value } : s)
    update({ segments })
  }

  const reset = () => setProfile({ ...DEFAULT_PROFILE, segments: DEFAULT_PROFILE.segments.map(s => ({ ...s })) })

  const grouped = (['hyrox', 'free', 'accessory'] as Equipment['group'][]).map(g => ({
    group: g, items: EQUIPMENT_CATALOG.filter(e => e.group === g),
  }))

  return (
    <div style={{ padding: '24px', maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Athletes & division */}
      <div style={card}>
        <div style={sectionTitle}>Athletes & Division</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={fieldLabel}>Athlete 1</label>
            <input style={inputStyle} value={profile.athlete1} onChange={e => update({ athlete1: e.target.value })} placeholder="Your name" />
          </div>
          {division.athletes >= 2 && (
            <div>
              <label style={fieldLabel}>Athlete 2{division.athletes > 2 ? '+' : ''}</label>
              <input style={inputStyle} value={profile.athlete2} onChange={e => update({ athlete2: e.target.value })} placeholder="Partner name" />
            </div>
          )}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={fieldLabel}>Division</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={profile.division}
              onChange={e => update({ division: e.target.value as Profile['division'] })}
            >
              {DIVISIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
            <div style={{ fontSize: 12, color: '#666', marginTop: 8, lineHeight: 1.5 }}>{division.loadNote}</div>
          </div>

          {division.athletes > 1 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={fieldLabel}>Training Mode</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {([
                  { id: 'partner', label: 'With Partner', desc: 'Workouts show the doubles split — rep sharing and handover cues.' },
                  { id: 'solo',    label: 'Solo',         desc: 'Train alone at full doubles volume. Great overload — harder than race day.' },
                ] as const).map(({ id, label, desc }) => {
                  const sel = profile.trainingMode === id
                  return (
                    <button key={id} onClick={() => update({ trainingMode: id })} style={{
                      flex: 1, padding: '10px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                      border: `1px solid ${sel ? '#e8c12a' : '#2a2a2a'}`,
                      background: sel ? '#e8c12a18' : '#0a0a0a',
                      color: sel ? '#e8c12a' : '#888', fontWeight: sel ? 600 : 400,
                      textAlign: 'left', transition: 'all 0.12s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 15 }}>{id === 'partner' ? '👥' : '🏃'}</span>
                        <span>{label}</span>
                        {sel && <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 800, letterSpacing: '0.6px' }}>ACTIVE</span>}
                      </div>
                      <div style={{ fontSize: 11, color: sel ? '#e8c12a99' : '#555', lineHeight: 1.4 }}>{desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Races & targets */}
      <div style={card}>
        <div style={sectionTitle}>Races & Targets</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={fieldLabel}>Last race</label>
            <input style={inputStyle} value={profile.lastRaceName} onChange={e => update({ lastRaceName: e.target.value })} placeholder="e.g. Johannesburg 2026" />
          </div>
          <div>
            <label style={fieldLabel}>Next race</label>
            <input style={inputStyle} value={profile.nextRaceName} onChange={e => update({ nextRaceName: e.target.value })} placeholder="e.g. Cape Town" />
          </div>
          <div>
            <label style={fieldLabel}>Last finish (mm:ss)</label>
            <TimeInput seconds={profile.lastFinishSeconds} onCommit={s => update({ lastFinishSeconds: s })} />
          </div>
          <div>
            <label style={fieldLabel}>Target finish (mm:ss)</label>
            <TimeInput seconds={profile.targetFinishSeconds} onCommit={s => update({ targetFinishSeconds: s })} />
          </div>
        </div>
      </div>

      {/* Equipment */}
      <div style={card}>
        <div style={sectionTitle}>My Equipment</div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
          Tap everything you own. The plan resolves each station to your best available movement.
        </div>
        {grouped.map(({ group, items }) => (
          <div key={group} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>{GROUP_LABELS[group]}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {items.map(eq => {
                const on = profile.equipment.includes(eq.id)
                return (
                  <button
                    key={eq.id}
                    onClick={() => toggleEquipment(eq.id)}
                    style={{
                      padding: '8px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                      border: `1px solid ${on ? '#e8962a' : '#2a2a2a'}`,
                      background: on ? '#e8962a22' : '#0a0a0a',
                      color: on ? '#e8962a' : '#888', fontWeight: on ? 600 : 400,
                      transition: 'all 0.12s',
                    }}
                  >
                    {on ? '✓ ' : ''}{eq.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Segment splits */}
      <div style={card}>
        <div style={sectionTitle}>Segment Splits</div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
          Your last-race splits and goal per segment (running is avg pace /km). These drive the dashboard and analysis.
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontSize: 11, color: '#666', padding: '0 8px 10px 0', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Segment</th>
                <th style={{ textAlign: 'center', fontSize: 11, color: '#666', padding: '0 8px 10px', textTransform: 'uppercase', letterSpacing: '0.6px', width: 110 }}>Actual</th>
                <th style={{ textAlign: 'center', fontSize: 11, color: '#666', padding: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.6px', width: 110 }}>Target</th>
              </tr>
            </thead>
            <tbody>
              {profile.segments.map((seg, i) => (
                <tr key={seg.id}>
                  <td style={{ padding: '6px 8px 6px 0', fontSize: 13, color: '#ccc', borderBottom: '1px solid #141414' }}>
                    {seg.label}{seg.type === 'run' && <span style={{ fontSize: 10, color: '#666' }}> /km</span>}
                  </td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #141414' }}>
                    <TimeInput seconds={seg.actualSeconds} onCommit={s => updateSegment(i, 'actualSeconds', s)} />
                  </td>
                  <td style={{ padding: '6px 0', borderBottom: '1px solid #141414' }}>
                    <TimeInput seconds={seg.targetSeconds} onCommit={s => updateSegment(i, 'targetSeconds', s)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fitness level */}
      <div style={card}>
        <div style={sectionTitle}>Fitness Level</div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
          Sets how each workout scales. Volume, load, run pace, and rest periods all adjust to match where you are now.
          The plan still gets harder week over week — this controls the starting point.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {FITNESS_LEVELS.map(lvl => {
            const selected = profile.fitnessLevel === lvl.id
            return (
              <button
                key={lvl.id}
                onClick={() => update({ fitnessLevel: lvl.id as FitnessLevel })}
                style={{
                  background: selected ? lvl.color + '18' : '#0a0a0a',
                  border: `1px solid ${selected ? lvl.color : '#2a2a2a'}`,
                  borderRadius: 10, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: lvl.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: selected ? lvl.color : '#f0ede8' }}>{lvl.label}</span>
                  {selected && <span style={{ fontSize: 10, color: lvl.color, marginLeft: 'auto', fontWeight: 700, letterSpacing: '0.4px' }}>SELECTED</span>}
                </div>
                <div style={{ fontSize: 11, color: selected ? lvl.color + 'cc' : '#888', fontWeight: 600, marginBottom: 6 }}>{lvl.tagline}</div>
                <div style={{ fontSize: 11, color: '#666', lineHeight: 1.5, marginBottom: 10 }}>{lvl.description}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                  {[
                    ['Volume', `${Math.round(lvl.volumePct * 100)}%`],
                    ['Load', `${Math.round(lvl.loadPct * 100)}%`],
                    ['Pace', lvl.runPaceAdjustSec === 0 ? 'Target' : lvl.runPaceAdjustSec > 0 ? `+${lvl.runPaceAdjustSec}s/km` : `${lvl.runPaceAdjustSec}s/km`],
                    ['Rest', lvl.restMultiplier === 1 ? 'As written' : `×${lvl.restMultiplier}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: '#555' }}>{k}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: selected ? lvl.color : '#aaa' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 12, color: '#555' }}>Changes save automatically to this device.</span>
        <button
          onClick={reset}
          style={{ background: 'none', border: '1px solid #d63b2f55', borderRadius: 6, padding: '8px 16px', color: '#d63b2f', fontSize: 13, cursor: 'pointer' }}
        >
          Reset to defaults
        </button>
      </div>
    </div>
  )
}
