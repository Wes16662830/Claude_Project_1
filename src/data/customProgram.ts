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
  const detail = day.exercises.length
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
