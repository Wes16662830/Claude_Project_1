// Full strength gym program — Push / Pull / Legs split.
// Used when the user switches a day (or the whole plan) to "Strength" mode.
// Returns TrainingSession-shaped objects so the existing Today / Training Plan
// UI can render them with no special-casing.

import type { TrainingSession } from './trainingPlan'
import type { FitnessLevel } from './profile'

export type PPLKey = 'push' | 'pull' | 'legs'

// The plan's 5 weekly workout days sit at these plan-day indexes (Mon,Tue,Thu,Sat,Sun).
export const PLAN_WORKOUT_DAYS = [0, 1, 3, 5, 6]

/** Which slot (0-4) a plan-day index occupies among the week's workout days; -1 for rest days. */
export function planWorkoutSlot(planDayIndex: number): number {
  return PLAN_WORKOUT_DAYS.indexOf(planDayIndex)
}

interface PPLTemplate {
  key: PPLKey
  format: string
  title: string
  detail: string
  notes: string
}

const PPL: Record<PPLKey, PPLTemplate> = {
  push: {
    key: 'push',
    format: 'Push — Chest / Shoulders / Triceps',
    title: 'Push Day',
    detail:
      '5 min warm-up (band pull-aparts + light press) · ' +
      'A) Barbell Bench Press — 4 × 6-8 · ' +
      'B) Standing Overhead Press — 3 × 8 · ' +
      'C) Incline DB Press — 3 × 10 · ' +
      'D) Lateral Raises — 3 × 15 · ' +
      'E) Overhead or Cable Triceps Extension — 3 × 12 · ' +
      'F) Triceps Dips or Pushdowns — 2 × 15',
    notes:
      'Go heavy on the bench and overhead press (A/B) with 2-3 min rest. Chase the pump on C-F with 60-90s rest. Full lockout on every press.',
  },
  pull: {
    key: 'pull',
    format: 'Pull — Back / Biceps / Rear Delts',
    title: 'Pull Day',
    detail:
      '5 min warm-up (dead hangs + light rows) · ' +
      'A) Deadlift or Rack Pull — 4 × 5 · ' +
      'B) Pull-ups (weighted if able) — 4 × 6-10 · ' +
      'C) Barbell or DB Row — 3 × 10 · ' +
      'D) Face Pulls — 3 × 15 · ' +
      'E) Barbell or DB Curl — 3 × 10 · ' +
      'F) Hammer Curl — 2 × 12',
    notes:
      'Deadlift (A) heavy and crisp — stop the set the moment form breaks. Full stretch at the bottom of every row and pull-up. Strict curls, no swinging.',
  },
  legs: {
    key: 'legs',
    format: 'Legs — Quads / Hamstrings / Calves',
    title: 'Leg Day',
    detail:
      '8 min warm-up (leg swings + bodyweight squats) · ' +
      'A) Back Squat — 4 × 6-8 · ' +
      'B) Romanian Deadlift — 3 × 8 · ' +
      'C) Bulgarian Split Squat — 3 × 10 per leg · ' +
      'D) Leg Press or Walking Lunges — 3 × 12 · ' +
      'E) Leg Curl — 3 × 12 · ' +
      'F) Standing Calf Raise — 4 × 15',
    notes:
      'Squat (A) is the priority — 3 min rest, brace hard, drive through the floor. Control the RDL eccentric and feel the hamstring stretch. Split squats will expose imbalances — keep them honest.',
  },
}

const LOAD_GUIDANCE: Record<FitnessLevel, string> = {
  beginner:     'Beginner: start light and own the technique. 2-3 working sets per lift, stop 3 reps short of failure.',
  intermediate: 'Intermediate: moderate loads. Take the last set of each lift to within 1-2 reps of failure.',
  advanced:     'Advanced: push heavy on the main lifts (A/B). Final 1-2 sets to failure with clean form. Add weight when you clear the top of the rep range.',
  elite:        'Elite: heavy compounds, progressive overload every week. Add a drop-set on the final accessory. Superset C-F to save time if needed.',
}

/**
 * Build a strength session for a given plan week + workout slot.
 * The PPL cycle runs continuously across the whole plan so no muscle group
 * is consistently under-trained (Wk1: P P L P L · Wk2: L P P L P · …).
 */
export function getStrengthSession(
  weekNum: number,
  slot: number,
  fitness: FitnessLevel,
): TrainingSession {
  const cycle: PPLKey[] = ['push', 'pull', 'legs']
  const globalIndex = (weekNum - 1) * 5 + Math.max(0, slot)
  const t = PPL[cycle[globalIndex % 3]]
  return {
    type: 'strength',
    workoutType: 'power',
    format: t.format,
    title: t.title,
    duration: '50-60 min',
    detail: t.detail,
    notes: `${t.notes}\n\n${LOAD_GUIDANCE[fitness]}`,
    stations: [],
  }
}
