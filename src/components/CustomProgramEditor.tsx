import type { CSSProperties } from 'react'
import { type Profile, type CustomProgram, type CustomDay, type CustomExercise } from '../data/profile'
import { upperLowerTemplate } from '../data/customProgram'

const card: CSSProperties = {
  background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '20px 24px',
}
const sectionTitle: CSSProperties = {
  fontSize: 14, fontWeight: 700, color: '#aaa', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.8px',
}
const input: CSSProperties = {
  background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 6,
  padding: '7px 10px', color: '#f0ede8', fontSize: 13, fontFamily: 'inherit',
}
const smallBtn: CSSProperties = {
  background: 'none', border: '1px solid #2a2a2a', borderRadius: 6,
  padding: '6px 12px', color: '#aaa', fontSize: 12, cursor: 'pointer',
}

interface Props {
  profile: Profile
  onSetCustomProgram: (program: CustomProgram | null) => void
}

export default function CustomProgramEditor({ profile, onSetCustomProgram }: Props) {
  const program = profile.customProgram

  const commit = (p: CustomProgram) => onSetCustomProgram(p)

  if (!program) {
    return (
      <div style={card}>
        <div style={sectionTitle}>Custom Program</div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 16, lineHeight: 1.6 }}>
          Enter your own program (e.g. an Upper/Lower split). It saves only on this device — nothing is uploaded or shared.
          Once added, select <b style={{ color: '#e8962a' }}>Custom Program</b> in Workout Mode and it cycles across your training days.
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => commit(upperLowerTemplate())}
            style={{ ...smallBtn, borderColor: '#e8962a', color: '#e8962a' }}
          >
            + Start from Upper/Lower template
          </button>
          <button
            onClick={() => commit({ name: 'My Program', days: [{ name: 'Day 1', exercises: [{ name: '', sets: '', reps: '', rest: '', notes: '' }] }] })}
            style={smallBtn}
          >
            + Start blank
          </button>
        </div>
      </div>
    )
  }

  const setName = (name: string) => commit({ ...program, name })

  const setDay = (di: number, day: CustomDay) =>
    commit({ ...program, days: program.days.map((d, i) => i === di ? day : d) })

  const addDay = () =>
    commit({ ...program, days: [...program.days, { name: `Day ${program.days.length + 1}`, exercises: [{ name: '', sets: '', reps: '', rest: '', notes: '' }] }] })

  const removeDay = (di: number) =>
    commit({ ...program, days: program.days.filter((_, i) => i !== di) })

  const setExercise = (di: number, ei: number, ex: CustomExercise) => {
    const day = program.days[di]
    setDay(di, { ...day, exercises: day.exercises.map((e, i) => i === ei ? ex : e) })
  }
  const addExercise = (di: number) => {
    const day = program.days[di]
    setDay(di, { ...day, exercises: [...day.exercises, { name: '', sets: '', reps: '', rest: '', notes: '' }] })
  }
  const removeExercise = (di: number, ei: number) => {
    const day = program.days[di]
    setDay(di, { ...day, exercises: day.exercises.filter((_, i) => i !== ei) })
  }

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
        <div style={sectionTitle}>Custom Program</div>
        <button
          onClick={() => { if (confirm('Delete this custom program? This cannot be undone.')) onSetCustomProgram(null) }}
          style={{ ...smallBtn, borderColor: '#d63b2f55', color: '#d63b2f' }}
        >
          Delete program
        </button>
      </div>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 14, lineHeight: 1.6 }}>
        Saved only on this device. Days cycle across your training days (Mon/Tue/Thu/Sat/Sun). Select
        <b style={{ color: '#e8962a' }}> Custom Program</b> in Workout Mode to use it.
      </div>

      <label style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Program name</label>
      <input style={{ ...input, width: '100%', marginTop: 6, marginBottom: 18 }} value={program.name} onChange={e => setName(e.target.value)} placeholder="e.g. Upper / Lower" />

      {program.days.map((day, di) => (
        <div key={di} style={{ border: '1px solid #1e1e1e', borderRadius: 10, padding: '14px', marginBottom: 14, background: '#0d0d0d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <input
              style={{ ...input, flex: 1, fontWeight: 700, color: '#e8962a' }}
              value={day.name}
              onChange={e => setDay(di, { ...day, name: e.target.value })}
              placeholder="Day name (e.g. Upper A)"
            />
            <button onClick={() => removeDay(di)} style={{ ...smallBtn, borderColor: '#d63b2f44', color: '#d63b2f' }}>✕ Day</button>
          </div>

          {/* Exercise header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 48px 60px 60px 24px', gap: 6, fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, padding: '0 2px' }}>
            <span>Exercise</span><span>Sets</span><span>Reps</span><span>Rest</span><span />
          </div>

          {day.exercises.map((ex, ei) => (
            <div key={ei} style={{ marginBottom: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 48px 60px 60px 24px', gap: 6, alignItems: 'center' }}>
                <input style={input} value={ex.name} onChange={e => setExercise(di, ei, { ...ex, name: e.target.value })} placeholder="Exercise" />
                <input style={{ ...input, textAlign: 'center' }} value={ex.sets} onChange={e => setExercise(di, ei, { ...ex, sets: e.target.value })} placeholder="3" />
                <input style={{ ...input, textAlign: 'center' }} value={ex.reps} onChange={e => setExercise(di, ei, { ...ex, reps: e.target.value })} placeholder="8-10" />
                <input style={{ ...input, textAlign: 'center' }} value={ex.rest ?? ''} onChange={e => setExercise(di, ei, { ...ex, rest: e.target.value })} placeholder="2m" />
                <button onClick={() => removeExercise(di, ei)} style={{ background: 'none', border: 'none', color: '#d63b2f', fontSize: 14, cursor: 'pointer', padding: 0 }}>✕</button>
              </div>
              <input
                style={{ ...input, width: '100%', marginTop: 4, fontSize: 12, color: '#999' }}
                value={ex.notes ?? ''}
                onChange={e => setExercise(di, ei, { ...ex, notes: e.target.value })}
                placeholder="Notes (optional) — tempo, cues, superset…"
              />
            </div>
          ))}

          <button onClick={() => addExercise(di)} style={{ ...smallBtn, marginTop: 4 }}>+ Exercise</button>
        </div>
      ))}

      <button onClick={addDay} style={{ ...smallBtn, borderColor: '#e8962a55', color: '#e8962a' }}>+ Add day</button>
    </div>
  )
}
