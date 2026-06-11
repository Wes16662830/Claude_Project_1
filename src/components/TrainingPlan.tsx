import React, { useState } from 'react'
import {
  TRAINING_PLAN, SESSION_COLORS, PHASE_COLORS, WORKOUT_TYPE_LABEL, WEEK_LOAD,
  type Phase, type SessionType, type WorkoutType,
} from '../data/trainingPlan'
import {
  resolveStation, getDivision, getFitnessLevel, STATION_LABELS,
  type Profile, type StationId, type ResolvedStation,
} from '../data/profile'
import { fmtTime } from '../data/raceData'

const ALL_STATIONS: StationId[] = [
  'skierg', 'sled_push', 'sled_pull', 'bbj', 'row', 'farmers', 's_lunges', 'wall_balls',
]

const STATUS_COLOR: Record<ResolvedStation['status'], string> = {
  native:     '#2a8c5a',
  substitute: '#e8962a',
  fallback:   '#d63b2f',
}
const STATUS_LABEL: Record<ResolvedStation['status'], string> = {
  native:     'you have this',
  substitute: 'substitute',
  fallback:   'no kit — basic sub',
}

const HYROX_GOLD = '#e8c12a'

function workoutTypeBadge(_wt: WorkoutType): React.CSSProperties {
  return {
    display: 'inline-block', fontSize: 9, fontWeight: 800, letterSpacing: '0.8px',
    color: '#000', background: HYROX_GOLD, borderRadius: 3,
    padding: '2px 6px', textTransform: 'uppercase', marginBottom: 6,
  }
}

function weekHeaderStyle(phase: Phase): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
    cursor: 'pointer', borderLeft: `3px solid ${PHASE_COLORS[phase]}`, userSelect: 'none',
  }
}

function phaseBadgeStyle(phase: Phase): React.CSSProperties {
  return {
    padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
    background: PHASE_COLORS[phase] + '22', color: PHASE_COLORS[phase],
    textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0,
  }
}

function dayCardStyle(type: SessionType): React.CSSProperties {
  return {
    background: SESSION_COLORS[type].bg,
    border: `1px solid ${SESSION_COLORS[type].border}33`,
    borderRadius: 8, padding: '12px 14px',
  }
}

const SESSION_TYPES: SessionType[] = ['run', 'strength', 'compromised', 'sim', 'rest']

// Scaled load display — return a bar + label string
function ScaledBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ flex: 1, height: 5, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(pct * 100, 120)}%`, background: color, borderRadius: 3, transition: 'width 0.3s' }} />
    </div>
  )
}

interface Props { profile: Profile }

export default function TrainingPlan({ profile }: Props) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]))
  const division = getDivision(profile.division)
  const fitness = getFitnessLevel(profile.fitnessLevel)
  const isSolo = division.athletes === 1
  const trainingAlone = profile.trainingMode === 'solo'

  const runSegment = profile.segments.find(s => s.id === 'running')
  const targetPace = runSegment?.targetSeconds ?? 272
  const scaledPace = targetPace + fitness.runPaceAdjustSec
  const maxHR = profile.maxHR

  // Pace zones derived from the user's scaled race pace
  const paceZones = {
    easy:      scaledPace + 90,
    z2:        scaledPace + 65,
    threshold: scaledPace + 22,
    race:      scaledPace,
    interval:  scaledPace - 15,
    vo2:       Math.max(scaledPace - 32, 150),
  }
  // HR zone boundaries (bpm)
  const hrZ2 = [Math.round(maxHR * 0.60), Math.round(maxHR * 0.70)]
  const hrZ3 = [Math.round(maxHR * 0.70), Math.round(maxHR * 0.80)]
  const hrZ4 = [Math.round(maxHR * 0.80), Math.round(maxHR * 0.90)]
  const hrZ5 = [Math.round(maxHR * 0.90), maxHR]

  // Race station loads (kg) for the user's division, scaled by fitness level
  const isMenDiv = profile.division.includes('men')
  const baseWB = isMenDiv ? 9 : 6
  const baseFarmers = isMenDiv ? 24 : 16
  const baseLunges = isMenDiv ? 20 : 10
  const baseSled = isMenDiv ? 102 : 78
  const loads = {
    wall_balls: +(baseWB      * fitness.loadPct).toFixed(1),
    farmers:    Math.round(baseFarmers * fitness.loadPct),
    s_lunges:   Math.round(baseLunges  * fitness.loadPct),
    sled:       Math.round(baseSled    * fitness.loadPct / 5) * 5,
  }

  // Derive which pace zone a run session is primarily targeting
  function sessionPaceInfo(s: { title: string; format?: string }): { label: string; pace: number; hr: number[] } {
    const t = (s.title + ' ' + (s.format ?? '')).toLowerCase()
    if (/easy|long easy|zone 2|flush|activation/.test(t)) return { label: 'Z2 Aerobic', pace: paceZones.z2, hr: hrZ2 }
    if (/fartlek/.test(t))                                 return { label: 'Z2 + Surges', pace: paceZones.z2, hr: hrZ3 }
    if (/threshold|tempo/.test(t))                         return { label: 'Threshold', pace: paceZones.threshold, hr: hrZ4 }
    if (/vo2|400m|800m/.test(t))                           return { label: 'VO2 / Intervals', pace: paceZones.vo2, hr: hrZ5 }
    if (/emom|pace ladder|speed brick/.test(t))            return { label: 'Race + Compromised', pace: paceZones.race, hr: hrZ4 }
    return { label: 'Race Pace', pace: paceZones.race, hr: hrZ4 }
  }

  const toggle = (week: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev)
      next.has(week) ? next.delete(week) : next.add(week)
      return next
    })
  }
  const expandAll = () => setExpandedWeeks(new Set(TRAINING_PLAN.map(w => w.week)))
  const collapseAll = () => setExpandedWeeks(new Set())

  const maxLoad = Math.max(...Object.values(WEEK_LOAD))

  return (
    <div style={{ padding: '24px', maxWidth: 960, margin: '0 auto' }}>

      {/* Training load progression curve */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Training Load
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: fitness.color }} />
            <span style={{ fontSize: 12, color: fitness.color, fontWeight: 600 }}>{fitness.label} — {fitness.tagline}</span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#555', marginBottom: 14 }}>
          Plan intensity ramp. Peaks at Week 7 (GRIND), full simulation at Week 9, taper through to race day.
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 60 }}>
          {TRAINING_PLAN.map(week => {
            const rawLoad = WEEK_LOAD[week.week] ?? 50
            const scaledLoad = rawLoad * fitness.volumePct
            const barH = Math.round((scaledLoad / maxLoad) * 56)
            const phaseColor = PHASE_COLORS[week.phase]
            return (
              <div
                key={week.week}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                onClick={() => { toggle(week.week); setTimeout(() => document.getElementById(`week-${week.week}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50) }}
              >
                <div style={{
                  width: '100%', height: barH, background: phaseColor + 'aa',
                  borderRadius: '3px 3px 0 0', border: `1px solid ${phaseColor}44`,
                  transition: 'height 0.3s',
                }} />
                <span style={{ fontSize: 9, color: '#555', fontWeight: 700 }}>W{week.week}</span>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
          {(['aerobic', 'build', 'peak'] as Phase[]).map(p => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#777' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: PHASE_COLORS[p] }} />
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 11, color: '#555' }}>
            Tap a bar to jump to that week
          </div>
        </div>
      </div>

      {/* Fitness level scaling summary */}
      {fitness.id !== 'advanced' && (
        <div style={{
          background: fitness.color + '10', border: `1px solid ${fitness.color}33`,
          borderRadius: 8, padding: '12px 16px', marginBottom: 16,
          display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center',
        }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: fitness.color, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              {fitness.label}
            </span>
            <span style={{ fontSize: 11, color: '#777', marginLeft: 6 }}>— all workouts scale as follows</span>
          </div>
          {[
            ['Volume', `${Math.round(fitness.volumePct * 100)}% of prescribed`, fitness.volumePct],
            ['Load', `${Math.round(fitness.loadPct * 100)}% of prescribed`, fitness.loadPct],
            ['Run pace', `${fmtTime(scaledPace)}/km (target ${fmtTime(targetPace)}/km + ${fitness.runPaceAdjustSec}s)`, fitness.volumePct],
            ['Rest', fitness.restMultiplier === 1 ? 'As written' : `×${fitness.restMultiplier} (longer)`, 1 / fitness.restMultiplier],
          ].map(([k, v]) => (
            <div key={k as string} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k as string}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#f0ede8' }}>{v as string}</span>
            </div>
          ))}
        </div>
      )}

      {/* Running Zones reference */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
          Your Running Zones
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
          {([
            { label: 'Easy / Z2',    pace: paceZones.z2,        hr: hrZ2, color: '#4a9fd4' },
            { label: 'Threshold',    pace: paceZones.threshold,  hr: hrZ3, color: '#2a8c5a' },
            { label: 'Race Pace',    pace: paceZones.race,       hr: hrZ4, color: '#e8962a' },
            { label: 'Intervals',    pace: paceZones.interval,   hr: hrZ4, color: '#e8962a' },
            { label: 'VO2 Max',      pace: paceZones.vo2,        hr: hrZ5, color: '#d63b2f' },
          ] as const).map(z => (
            <div key={z.label} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 6, padding: '8px 10px' }}>
              <div style={{ fontSize: 9, color: z.color, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.6px', marginBottom: 4 }}>{z.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#f0ede8', fontFamily: 'monospace', marginBottom: 2 }}>{fmtTime(z.pace)}<span style={{ fontSize: 10, fontWeight: 400, color: '#666' }}>/km</span></div>
              <div style={{ fontSize: 10, color: '#666' }}>{z.hr[0]}–{z.hr[1]} bpm</div>
            </div>
          ))}
          <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 6, padding: '8px 10px' }}>
            <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.6px', marginBottom: 4 }}>Station Loads</div>
            <div style={{ fontSize: 10, color: '#aaa', lineHeight: 1.7 }}>
              Wall Balls <span style={{ color: '#f0ede8', fontWeight: 700 }}>{loads.wall_balls}kg</span><br />
              Farmers <span style={{ color: '#f0ede8', fontWeight: 700 }}>{loads.farmers}kg</span>/hand<br />
              Lunges bag <span style={{ color: '#f0ede8', fontWeight: 700 }}>{loads.s_lunges}kg</span><br />
              Sled <span style={{ color: '#f0ede8', fontWeight: 700 }}>{loads.sled}kg</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: '#444', marginTop: 8 }}>Based on your target pace, fitness level, and max HR. Update in Settings → Segment Splits and Max HR.</div>
      </div>

      {/* Your station map */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>
          Your Stations
        </div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 14 }}>
          How each race station maps to your equipment. Update gear in Settings to change these.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {ALL_STATIONS.map(id => {
            const r = resolveStation(id, profile.equipment)
            const c = STATUS_COLOR[r.status]
            return (
              <div key={id} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>{STATION_LABELS[id]}</span>
                  <span style={{ fontSize: 9, color: c, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#f0ede8', lineHeight: 1.35 }}>{r.movement}</div>
              </div>
            )
          })}
        </div>
      </div>

      {isSolo && (
        <div style={{ background: '#1a0d2d', border: '1px solid #a855f733', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#c79bf0' }}>
          Solo division — you do the full work yourself on every session.
        </div>
      )}
      {!isSolo && trainingAlone && (
        <div style={{ background: '#1a1400', border: '1px solid #e8c12a33', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#e8c12a' }}>
          Solo training mode — workouts show individual instructions. You carry the full doubles volume: harder than race day, exactly by design.
        </div>
      )}

      {/* Legend + controls */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center',
        padding: '12px 16px', background: '#111', borderRadius: 8, border: '1px solid #1e1e1e',
      }}>
        {SESSION_TYPES.map(type => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#aaa' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: SESSION_COLORS[type].border }} />
            {SESSION_COLORS[type].label}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#aaa' }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: HYROX_GOLD }} />
          Hyrox type
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={expandAll} style={{ background: 'none', border: '1px solid #333', borderRadius: 6, padding: '4px 12px', color: '#888', fontSize: 12, cursor: 'pointer' }}>Expand All</button>
        <button onClick={collapseAll} style={{ background: 'none', border: '1px solid #333', borderRadius: 6, padding: '4px 12px', color: '#888', fontSize: 12, cursor: 'pointer' }}>Collapse All</button>
      </div>

      {TRAINING_PLAN.map(week => {
        const open = expandedWeeks.has(week.week)
        const rawLoad = WEEK_LOAD[week.week] ?? 50
        const scaledLoad = rawLoad * fitness.volumePct
        const loadPct = scaledLoad / maxLoad

        return (
          <div id={`week-${week.week}`} key={week.week} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
            <div style={weekHeaderStyle(week.phase)} onClick={() => toggle(week.week)}>
              {/* Week number */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 44, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WEEK</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#f0ede8', lineHeight: 1, letterSpacing: '-1px' }}>
                  {String(week.week).padStart(2, '0')}
                </span>
              </div>
              {/* Theme word */}
              <div style={{ fontSize: 14, fontWeight: 900, color: HYROX_GOLD, letterSpacing: '1px', textTransform: 'uppercase', flexShrink: 0, width: 110 }}>
                {week.weekTheme}
              </div>
              {/* Title + focus + load bar */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f0ede8' }}>{week.title}</div>
                <div style={{ fontSize: 11, color: '#777', marginTop: 2, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{week.focus}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ScaledBar pct={loadPct} color={PHASE_COLORS[week.phase]} />
                  <span style={{ fontSize: 10, color: '#555', flexShrink: 0 }}>
                    {fitness.id !== 'advanced' ? `~${Math.round(scaledLoad)}` : Math.round(rawLoad)} load
                  </span>
                </div>
              </div>
              <div style={phaseBadgeStyle(week.phase)}>{week.phase}</div>
              <div style={{ color: '#555', fontSize: 12, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▶</div>
            </div>

            {open && (
              <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, padding: '0 20px 16px' }}>
                {week.days.map(d => {
                  const s = d.session
                  const rawType = s.type as string
                  const type: SessionType = rawType === 'race' ? 'sim' : s.type
                  const isRace = rawType === 'race'
                  const isRest = s.type === 'rest'
                  const subs = (s.stations ?? [])
                    .map(id => resolveStation(id, profile.equipment))
                    .filter(r => r.status !== 'native')

                  const isRunSession = s.type === 'run'
                  const showScaling = !isRest && fitness.id !== 'advanced'
                  const showZones = isRunSession && !isRest
                  const zoneInfo = isRunSession ? sessionPaceInfo(s) : null
                  const hasStationLoads = !isRunSession && (s.stations ?? []).some(
                    id => ['wall_balls','farmers','s_lunges','sled_push','sled_pull'].includes(id)
                  )

                  return (
                    <div key={d.day} style={{
                      ...dayCardStyle(type),
                      ...(isRace ? { borderColor: '#e8962a', background: '#2d1e00' } : {}),
                    }}>
                      {/* Day + Hyrox type badge */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: 2 }}>{d.day}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                          {s.workoutType && <div style={workoutTypeBadge(s.workoutType)}>{WORKOUT_TYPE_LABEL[s.workoutType]}</div>}
                          {isRace && <div style={{ ...workoutTypeBadge('complete'), background: '#e8962a' }}>RACE DAY</div>}
                        </div>
                      </div>

                      {/* Format */}
                      {s.format && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: HYROX_GOLD, letterSpacing: '0.3px', marginBottom: 4 }}>
                          {s.format}
                        </div>
                      )}

                      {/* Title */}
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f0ede8', marginBottom: 4, lineHeight: 1.3 }}>{s.title}</div>
                      {s.duration && <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>{s.duration}</div>}
                      {s.detail && <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6, marginBottom: 6 }}>{s.detail}</div>}

                      {/* Equipment subs */}
                      {subs.length > 0 && (
                        <div style={{ fontSize: 11, color: '#888', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 4, padding: '6px 8px', lineHeight: 1.5, marginBottom: 6 }}>
                          <span style={{ color: '#e8962a', fontWeight: 700 }}>With your kit: </span>
                          {subs.map((r, i) => (
                            <span key={r.id}>{STATION_LABELS[r.id]} → {r.movement}{i < subs.length - 1 ? ' · ' : ''}</span>
                          ))}
                        </div>
                      )}

                      {/* Zone targets for run sessions — shown for all fitness levels */}
                      {showZones && zoneInfo && (
                        <div style={{
                          background: '#0d1a0d', border: '1px solid #4a9fd433',
                          borderRadius: 6, padding: '8px 10px', marginBottom: 6,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 9, fontWeight: 800, color: '#4a9fd4', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Your Targets</span>
                            <span style={{ fontSize: 9, color: '#4a9fd4', fontWeight: 600 }}>{zoneInfo.label}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <div>
                              <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>Pace</div>
                              <div style={{ fontSize: 14, fontWeight: 800, color: '#f0ede8', fontFamily: 'monospace' }}>
                                {fmtTime(zoneInfo.pace)}<span style={{ fontSize: 10, fontWeight: 400, color: '#666' }}>/km</span>
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>HR zone</div>
                              <div style={{ fontSize: 14, fontWeight: 800, color: '#f0ede8' }}>
                                {zoneInfo.hr[0]}–{zoneInfo.hr[1]}<span style={{ fontSize: 10, fontWeight: 400, color: '#666' }}> bpm</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Station loads for strength sessions — shown for all fitness levels */}
                      {hasStationLoads && (
                        <div style={{
                          background: '#0d0d1a', border: '1px solid #a855f722',
                          borderRadius: 6, padding: '7px 10px', marginBottom: 6,
                          fontSize: 10, color: '#888', lineHeight: 1.8,
                        }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 4 }}>Your Loads</span>
                          {(s.stations ?? []).includes('wall_balls')  && <span style={{ marginRight: 10 }}>Wall Balls <b style={{ color: '#f0ede8' }}>{loads.wall_balls}kg</b></span>}
                          {(s.stations ?? []).includes('farmers')     && <span style={{ marginRight: 10 }}>Farmers <b style={{ color: '#f0ede8' }}>{loads.farmers}kg</b>/hand</span>}
                          {(s.stations ?? []).includes('s_lunges')    && <span style={{ marginRight: 10 }}>Lunges bag <b style={{ color: '#f0ede8' }}>{loads.s_lunges}kg</b></span>}
                          {((s.stations ?? []).includes('sled_push') || (s.stations ?? []).includes('sled_pull')) && <span>Sled <b style={{ color: '#f0ede8' }}>{loads.sled}kg</b></span>}
                        </div>
                      )}

                      {/* Fitness level scaling box — non-advanced only */}
                      {showScaling && (
                        <div style={{
                          background: fitness.color + '0d',
                          border: `1px solid ${fitness.color}30`,
                          borderRadius: 6, padding: '8px 10px', marginBottom: 6,
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: fitness.color, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 7 }}>
                            {fitness.label} — Volume &amp; Load
                          </div>
                          {isRunSession ? (
                            fitness.restMultiplier !== 1 ? (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: '#777' }}>Rest periods</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#f0ede8' }}>×{fitness.restMultiplier}</span>
                              </div>
                            ) : null
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                              {[
                                { k: 'Volume', pct: fitness.volumePct, label: `${Math.round(fitness.volumePct * 100)}%` },
                                { k: 'Load',   pct: fitness.loadPct,   label: `${Math.round(fitness.loadPct * 100)}%` },
                              ].map(row => (
                                <div key={row.k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontSize: 11, color: '#777', width: 48 }}>{row.k}</span>
                                  <ScaledBar pct={row.pct} color={fitness.color} />
                                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f0ede8', width: 36, textAlign: 'right' }}>{row.label}</span>
                                </div>
                              ))}
                              {fitness.restMultiplier !== 1 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                                  <span style={{ fontSize: 11, color: '#777' }}>Rest</span>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f0ede8' }}>×{fitness.restMultiplier}</span>
                                </div>
                              )}
                              {fitness.id === 'elite' && (
                                <div style={{ fontSize: 10, color: fitness.color, marginTop: 2 }}>Push beyond prescribed when you feel strong.</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes — prefer soloNotes when training alone */}
                      {(() => {
                        const notesText = (trainingAlone || isSolo) && s.soloNotes ? s.soloNotes : s.notes
                        if (!notesText) return null
                        return (
                          <div style={
                            isRace
                              ? { fontSize: 11, color: '#e8962a', background: '#e8962a11', borderRadius: 4, padding: '6px 8px', lineHeight: 1.5 }
                              : { fontSize: 11, color: SESSION_COLORS[type].text, background: SESSION_COLORS[type].border + '11', borderRadius: 4, padding: '6px 8px', lineHeight: 1.5 }
                          }>{notesText}</div>
                        )
                      })()}
                    </div>
                  )
                })}
              </div>

              {/* Optional gym session */}
              {week.gymSession && (() => {
                const g = week.gymSession
                return (
                  <div style={{ margin: '0 20px 20px', border: '1px dashed #2a4a2a', borderRadius: 8, padding: '12px 14px', background: '#0a120a', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 9, fontWeight: 800, color: '#2a8c5a', letterSpacing: '0.8px', background: '#2a8c5a22', border: '1px solid #2a8c5a44', padding: '2px 7px', borderRadius: 3 }}>
                      OPTIONAL
                    </div>
                    <div style={{ fontSize: 10, color: '#2a8c5a', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.6px', marginBottom: 6 }}>+ Physique Day — {g.title.includes('Upper') ? 'Upper' : g.title.includes('Lower') ? 'Lower' : 'Light'} Body</div>
                    {g.format && <div style={{ fontSize: 11, fontWeight: 700, color: HYROX_GOLD, letterSpacing: '0.3px', marginBottom: 4 }}>{g.format}</div>}
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f0ede8', marginBottom: 4 }}>{g.title}</div>
                    <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>{g.duration} · Do on Wed or Fri — not before a hard run or sim</div>
                    <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6, marginBottom: 6 }}>{g.detail}</div>
                    {fitness.id !== 'advanced' && (
                      <div style={{ fontSize: 10, color: '#555', background: '#0d0d0d', borderRadius: 4, padding: '5px 8px', marginBottom: 6 }}>
                        At your level: target {Math.round(fitness.loadPct * 65)}–{Math.round(fitness.loadPct * 75)}% of 1RM on compound lifts
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: '#2a8c5a', background: '#2a8c5a11', borderRadius: 4, padding: '6px 8px', lineHeight: 1.5 }}>{g.notes}</div>
                  </div>
                )
              })()}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
