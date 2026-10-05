// Builds TrainingSession-shaped objects from a user's custom program so the
// existing Today / Training Plan UI can render it with no special-casing.
// The program is entered by the user and stored only on their device.

import type { TrainingSession } from './trainingPlan'
import type { CustomProgram, CustomDay } from './profile'

// The plan's 5 weekly workout days (Mon,Tue,Thu,Sat,Sun) — same as PPL mode.
export function customDayForSlot(program: CustomProgram, weekNum: number, slot: number): CustomDay | null {
  if (!program.days.length) return null
  // Cycle the program's days continuously across the plan's training days.
  const globalIndex = (weekNum - 1) * 5 + Math.max(0, slot)
  return program.days[globalIndex % program.days.length]
}

export function customSessionFromDay(program: CustomProgram, day: CustomDay): TrainingSession {
  const detail = (day.raw !== undefined && day.raw.trim())
    ? day.raw.trim()
    : day.exercises.length
    ? day.exercises.map(e => {
        const sr = [e.sets, e.reps].filter(Boolean).join(' × ')
        const rest = e.rest ? ` · rest ${e.rest}` : ''
        const notes = e.notes ? ` — ${e.notes}` : ''
        return `${e.name}${sr ? `: ${sr}` : ''}${rest}${notes}`
      }).join('\n')
    : 'No exercises added yet — edit this program in Settings.'
  return {
    type: 'strength',
    workoutType: 'power',
    format: program.name || 'Custom Program',
    title: day.name || 'Custom Session',
    duration: '',
    detail,
    notes: '',
    stations: [],
  }
}

// Parse pasted program text into days. A short line that looks like a day
// heading starts a new day; everything under it is kept verbatim as `raw`,
// so all the detail (muscles, sets, reps, cues) is preserved exactly.
export function parseProgramText(text: string, programName = 'My Program'): CustomProgram {
  const headerRe = /^(day\b.*|upper\b.*|lower\b.*|push\b.*|pull\b.*|legs?\b.*|full[- ]?body.*|workout\b.*|session\b.*|week\s*\d+.*|[a-d]\)?\s*(upper|lower|push|pull|legs).*)$/i
  const lines = text.replace(/\r/g, '').split('\n')
  const days: CustomDay[] = []
  let current: CustomDay | null = null
  let buf: string[] = []
  const flush = () => {
    if (current) { current.raw = buf.join('\n').trim(); days.push(current) }
    buf = []
  }
  for (const line of lines) {
    const t = line.trim()
    const isHeader = t.length > 0 && t.length <= 40 && headerRe.test(t)
    if (isHeader) {
      flush()
      current = { name: t, exercises: [], raw: '' }
    } else if (current) {
      buf.push(line)
    } else if (t) {
      current = { name: 'Day 1', exercises: [], raw: '' }
      buf.push(line)
    }
  }
  flush()
  if (!days.length) days.push({ name: 'Day 1', exercises: [], raw: text.trim() })
  return { name: programName, days }
}

// A blank Upper/Lower scaffold the user can fill from their own program.
export function upperLowerTemplate(): CustomProgram {
  const blank = (name: string): CustomDay => ({
    name,
    exercises: [{ name: '', sets: '', reps: '', rest: '', notes: '' }],
  })
  return {
    name: 'Upper / Lower',
    days: [blank('Upper A'), blank('Lower A'), blank('Upper B'), blank('Lower B')],
  }
}
