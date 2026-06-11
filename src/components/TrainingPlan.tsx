import React, { useState } from 'react'
import {
  TRAINING_PLAN, SESSION_COLORS, PHASE_COLORS, WORKOUT_TYPE_LABEL,
  type Phase, type SessionType, type WorkoutType,
} from '../data/trainingPlan'
import {
  resolveStation, getDivision, STATION_LABELS,
  type Profile, type StationId, type ResolvedStation,
} from '../data/profile'

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

// Hyrox Academy gold
const HYROX_GOLD = '#e8c12a'

function workoutTypeBadge(_wt: WorkoutType): React.CSSProperties {
  return {
    display: 'inline-block',
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '0.8px',
    color: '#000',
    background: HYROX_GOLD,
    borderRadius: 3,
    padding: '2px 6px',
    textTransform: 'uppercase',
    marginBottom: 6,
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

interface Props { profile: Profile }

export default function TrainingPlan({ profile }: Props) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]))
  const division = getDivision(profile.division)
  const isSolo = division.athletes === 1

  const toggle = (week: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev)
      next.has(week) ? next.delete(week) : next.add(week)
      return next
    })
  }
  const expandAll = () => setExpandedWeeks(new Set(TRAINING_PLAN.map(w => w.week)))
  const collapseAll = () => setExpandedWeeks(new Set())

  return (
    <div style={{ padding: '24px', maxWidth: 960, margin: '0 auto' }}>

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
          Solo division — ignore "each partner / both athletes" and handover cues. You do the full work yourself.
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
        return (
          <div key={week.week} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
            <div style={weekHeaderStyle(week.phase)} onClick={() => toggle(week.week)}>
              {/* Week number */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 44, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WEEK</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#f0ede8', lineHeight: 1, letterSpacing: '-1px' }}>
                  {String(week.week).padStart(2, '0')}
                </span>
              </div>
              {/* Theme word */}
              <div style={{
                fontSize: 15, fontWeight: 900, color: HYROX_GOLD, letterSpacing: '1px',
                textTransform: 'uppercase', flexShrink: 0, width: 110,
              }}>
                {week.weekTheme}
              </div>
              {/* Title + focus */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f0ede8' }}>{week.title}</div>
                <div style={{ fontSize: 11, color: '#777', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{week.focus}</div>
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
                  const subs = (s.stations ?? [])
                    .map(id => resolveStation(id, profile.equipment))
                    .filter(r => r.status !== 'native')
                  return (
                    <div key={d.day} style={{
                      ...dayCardStyle(type),
                      ...(isRace ? { borderColor: '#e8962a', background: '#2d1e00' } : {}),
                    }}>
                      {/* Day + Hyrox type badge row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: 2 }}>{d.day}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                          {s.workoutType && (
                            <div style={workoutTypeBadge(s.workoutType)}>
                              {WORKOUT_TYPE_LABEL[s.workoutType]}
                            </div>
                          )}
                          {isRace && <div style={{ ...workoutTypeBadge('complete'), background: '#e8962a', color: '#000' }}>RACE DAY</div>}
                        </div>
                      </div>

                      {/* Format tag */}
                      {s.format && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: HYROX_GOLD, letterSpacing: '0.3px', marginBottom: 4 }}>
                          {s.format}
                        </div>
                      )}

                      {/* Title */}
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f0ede8', marginBottom: 4, lineHeight: 1.3 }}>{s.title}</div>
                      {s.duration && <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>{s.duration}</div>}

                      {/* Workout detail */}
                      {s.detail && (
                        <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6, marginBottom: 6 }}>
                          {s.detail}
                        </div>
                      )}

                      {/* Equipment subs */}
                      {subs.length > 0 && (
                        <div style={{ fontSize: 11, color: '#888', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 4, padding: '6px 8px', lineHeight: 1.5, marginBottom: 6 }}>
                          <span style={{ color: '#e8962a', fontWeight: 700 }}>With your kit: </span>
                          {subs.map((r, i) => (
                            <span key={r.id}>
                              {STATION_LABELS[r.id]} → {r.movement}{i < subs.length - 1 ? ' · ' : ''}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {s.notes && (
                        <div style={
                          isRace
                            ? { fontSize: 11, color: '#e8962a', background: '#e8962a11', borderRadius: 4, padding: '6px 8px', lineHeight: 1.5 }
                            : { fontSize: 11, color: SESSION_COLORS[type].text, background: SESSION_COLORS[type].border + '11', borderRadius: 4, padding: '6px 8px', lineHeight: 1.5 }
                        }>{s.notes}</div>
                      )}
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
