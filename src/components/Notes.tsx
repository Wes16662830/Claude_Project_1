import { TRAINING_PLAN, SESSION_COLORS, PHASE_COLORS, type SessionType } from '../data/trainingPlan'
import NoteBox from './NoteBox'

interface Props {
  notes: Record<string, string>
  onSetNote: (sessionId: string, text: string) => void
}

export default function Notes({ notes, onSetNote }: Props) {
  // Collect every session that has a saved note, in plan order.
  const weeks = TRAINING_PLAN.map(week => {
    const entries = week.days
      .map((d, i) => ({ sessionId: `w${week.week}_d${i}`, day: d.day, session: d.session }))
      .filter(e => (notes[e.sessionId] ?? '').trim().length > 0)
    return { week, entries }
  }).filter(w => w.entries.length > 0)

  const total = weeks.reduce((n, w) => n + w.entries.length, 0)

  if (total === 0) {
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#f0ede8', marginBottom: 8 }}>No notes yet</div>
        <div style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
          After each workout, jot a note on the <b style={{ color: '#e8962a' }}>Today</b> tab — times, splits, how you felt, what to change.
          They’ll all collect here so you can read back through your training.
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#f0ede8' }}>Training Log</div>
        <div style={{ fontSize: 12, color: '#666' }}>{total} note{total !== 1 ? 's' : ''} across {weeks.length} week{weeks.length !== 1 ? 's' : ''}</div>
      </div>

      {weeks.map(({ week, entries }) => (
        <div key={week.week} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ background: PHASE_COLORS[week.phase] + '22', border: `1px solid ${PHASE_COLORS[week.phase]}44`, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 800, color: PHASE_COLORS[week.phase], textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Week {week.week}
            </div>
            <div style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>{week.title}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entries.map(({ sessionId, day, session }) => {
              const rawType = session.type as string
              const type: SessionType = rawType === 'race' ? 'sim' : session.type
              const c = SESSION_COLORS[type]
              return (
                <div key={sessionId} style={{ borderLeft: `3px solid ${c.border}`, paddingLeft: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      {day}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f0ede8' }}>{session.title}</span>
                  </div>
                  <NoteBox compact value={notes[sessionId] ?? ''} onSave={t => onSetNote(sessionId, t)} />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
