import React, { useState } from 'react'
import { TRAINING_PLAN, SESSION_COLORS, PHASE_COLORS, type Phase, type SessionType } from '../data/trainingPlan'

function weekHeaderStyle(phase: Phase): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px 20px',
    cursor: 'pointer',
    borderLeft: `3px solid ${PHASE_COLORS[phase]}`,
    userSelect: 'none',
  }
}

function phaseBadgeStyle(phase: Phase): React.CSSProperties {
  return {
    padding: '3px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    background: PHASE_COLORS[phase] + '22',
    color: PHASE_COLORS[phase],
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    flexShrink: 0,
  }
}

function dayCardStyle(type: SessionType): React.CSSProperties {
  return {
    background: SESSION_COLORS[type].bg,
    border: `1px solid ${SESSION_COLORS[type].border}33`,
    borderRadius: 8,
    padding: '12px 14px',
  }
}

function typeTagStyle(type: SessionType): React.CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: SESSION_COLORS[type].text,
  }
}

function noteBoxStyle(type: SessionType): React.CSSProperties {
  return {
    fontSize: 11,
    color: SESSION_COLORS[type].text,
    background: SESSION_COLORS[type].border + '11',
    borderRadius: 4,
    padding: '6px 8px',
    lineHeight: 1.5,
    marginTop: 6,
  }
}

function legendDotStyle(type: SessionType): React.CSSProperties {
  return {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: SESSION_COLORS[type].border,
  }
}

const SESSION_TYPES: SessionType[] = ['run', 'strength', 'compromised', 'sim', 'rest']

export default function TrainingPlan() {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]))

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
      <div style={{
        display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap',
        padding: '12px 16px', background: '#111', borderRadius: 8, border: '1px solid #1e1e1e',
        alignItems: 'center',
      }}>
        {SESSION_TYPES.map(type => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#aaa' }}>
            <div style={legendDotStyle(type)} />
            {SESSION_COLORS[type].label}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={expandAll} style={{ background: 'none', border: '1px solid #333', borderRadius: 6, padding: '4px 12px', color: '#888', fontSize: 12, cursor: 'pointer' }}>
          Expand All
        </button>
        <button onClick={collapseAll} style={{ background: 'none', border: '1px solid #333', borderRadius: 6, padding: '4px 12px', color: '#888', fontSize: 12, cursor: 'pointer' }}>
          Collapse All
        </button>
      </div>

      {TRAINING_PLAN.map(week => {
        const open = expandedWeeks.has(week.week)
        return (
          <div key={week.week} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
            <div style={weekHeaderStyle(week.phase)} onClick={() => toggle(week.week)}>
              <div style={{ fontSize: 13, color: '#666', width: 56, flexShrink: 0 }}>Week {week.week}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#f0ede8' }}>{week.title}</div>
                <div style={{ fontSize: 12, color: '#777', marginTop: 2 }}>{week.focus}</div>
              </div>
              <div style={phaseBadgeStyle(week.phase)}>{week.phase}</div>
              <div style={{ color: '#555', fontSize: 14, transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'none', flexShrink: 0 }}>▶</div>
            </div>

            {open && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, padding: '0 20px 20px' }}>
                {week.days.map(d => {
                  const s = d.session
                  const rawType = s.type as string
                  const type: SessionType = rawType === 'race' ? 'sim' : s.type
                  const isRace = rawType === 'race'
                  return (
                    <div key={d.day} style={{
                      ...dayCardStyle(type),
                      ...(isRace ? { borderColor: '#e8962a', background: '#2d1e00' } : {}),
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{d.day}</div>
                        <div style={isRace ? { ...typeTagStyle(type), color: '#e8962a' } : typeTagStyle(type)}>
                          {isRace ? 'RACE' : SESSION_COLORS[type].label}
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f0ede8', marginBottom: 4, lineHeight: 1.3 }}>{s.title}</div>
                      {s.duration && <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>{s.duration}</div>}
                      {s.detail && <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.5, marginBottom: 6 }}>{s.detail}</div>}
                      {s.notes && <div style={isRace ? { ...noteBoxStyle(type), color: '#e8962a', background: '#e8962a11' } : noteBoxStyle(type)}>{s.notes}</div>}
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
