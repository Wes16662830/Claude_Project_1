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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, padding: '0 20px 20px' }}>
                {week.days.map(d => {
                  const s = d.session
                  const rawType = s.type as string
                  const type: SessionType = rawType === 'race' ? 'sim' : s.type
                  const isRace = rawType === 'race'
                  const isRest = s.type === 'rest'
                  const subs = (s.stations ?? [])
                    .map(id => resolveStation(id, profile.equipment))
                    .filter(r => r.status !== 'native')

                  // Fitness scaling values for this session
                  const showScaling = !isRest && fitness.id !== 'advanced'
                  const isRunSession = s.type === 'run'

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

                      {/* Fitness level scaling box */}
                      {showScaling && (
                        <div style={{
                          background: fitness.color + '0d',
                          border: `1px solid ${fitness.color}30`,
                          borderRadius: 6, padding: '8px 10px', marginBottom: 6,
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: fitness.color, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 7 }}>
                            {fitness.label} — Your version
                          </div>
                          {isRunSession ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: '#777' }}>Run pace target</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#f0ede8', fontFamily: 'monospace' }}>
                                  {fmtTime(scaledPace)}/km
                                </span>
                              </div>
                              {fitness.restMultiplier !== 1 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: 11, color: '#777' }}>Rest periods</span>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: '#f0ede8' }}>×{fitness.restMultiplier}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                              {[
                                { k: 'Volume', pct: fitness.volumePct, label: `${Math.round(fitness.volumePct * 100)}% of prescribed` },
                                { k: 'Load',   pct: fitness.loadPct,   label: `${Math.round(fitness.loadPct * 100)}% of prescribed` },
                              ].map(row => (
                                <div key={row.k}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                    <span style={{ fontSize: 11, color: '#777' }}>{row.k}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#f0ede8' }}>{row.label}</span>
                                  </div>
                                  <ScaledBar pct={row.pct} color={fitness.color} />
                                </div>
                              ))}
                              {fitness.restMultiplier !== 1 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                                  <span style={{ fontSize: 11, color: '#777' }}>Rest between sets</span>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f0ede8' }}>×{fitness.restMultiplier}</span>
                                </div>
                              )}
                              {fitness.id === 'elite' && (
                                <div style={{ fontSize: 10, color: fitness.color, marginTop: 2 }}>
                                  Push beyond prescribed when you feel strong. Do not force it in weeks 1–3.
                                </div>
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
            )}
          </div>
        )
      })}
    </div>
  )
}
