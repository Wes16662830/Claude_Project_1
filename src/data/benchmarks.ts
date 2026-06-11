// Competitive benchmarks for Doubles Men 35-39, South Africa.
//
// Sources & method: per-station splits modelled from global Hyrox data
// (HyroxDataLab, 425k+ doubles finishes) calibrated to confirmed SA event
// results — Cape Town 2025 Doubles Men winner 54:55 (Kamffer/Nel, 477 teams),
// Cape Town 2026 Pro Doubles 51:58 (Pienaar/Schoonbee), JHB Nov 2025 Pro
// Doubles 58:20 (Battersby/Henning, at 1,750m altitude). 35-39 Doubles Men
// world record: 49:40 (Buchanan/Woolley, Melbourne 2025).
//
// Two tiers:
//   competitive — what a strong top-10% SA team (~1:05 finish) runs
//   podium      — what a SA podium / sub-55 team runs
//
// Running values are seconds per km (avg across the 8 × 1km legs).
// Station values are total seconds for that station.

import type { StationId } from './profile'

export interface StationBenchmark {
  id: StationId
  competitive: number   // top-10% SA team (~1:05)
  podium: number        // SA podium / world-class (sub-55)
}

export const SA_35_39_DOUBLES_MEN: StationBenchmark[] = [
  { id: 'running',    competitive: 250, podium: 220 },  // 4:10/km → 3:40/km
  { id: 'skierg',     competitive: 190, podium: 160 },  // 3:10 → 2:40
  { id: 'sled_push',  competitive: 65,  podium: 52  },  // 1:05 → 0:52
  { id: 'sled_pull',  competitive: 150, podium: 112 },  // 2:30 → 1:52
  { id: 'bbj',        competitive: 130, podium: 105 },  // 2:10 → 1:45
  { id: 'row',        competitive: 220, podium: 190 },  // 3:40 → 3:10
  { id: 'farmers',    competitive: 70,  podium: 58  },  // 1:10 → 0:58
  { id: 's_lunges',   competitive: 145, podium: 120 },  // 2:25 → 2:00
  { id: 'wall_balls', competitive: 185, podium: 150 },  // 3:05 → 2:30
]

export const getBenchmark = (id: StationId): StationBenchmark | undefined =>
  SA_35_39_DOUBLES_MEN.find(b => b.id === id)

// Confirmed reference finishes for context / the "where you stand" ladder.
export interface FieldReference {
  label: string
  seconds: number
  note: string
}

export const SA_FIELD_LADDER: FieldReference[] = [
  { label: '35-39 World Record',     seconds: 49 * 60 + 40, note: 'Buchanan & Woolley · Melbourne 2025' },
  { label: 'CT Pro Doubles Winner',  seconds: 51 * 60 + 58, note: 'Pienaar & Schoonbee · Cape Town 2026' },
  { label: 'CT Doubles Winner',      seconds: 54 * 60 + 55, note: 'Kamffer & Nel · Cape Town 2025 · 477 teams' },
  { label: 'SA Podium zone',         seconds: 58 * 60,      note: 'Top 3 in 35-39 at most SA events' },
  { label: 'Your CT target',         seconds: 62 * 60,      note: 'Estimated top 3–5 in SA 35-39 (sea level)' },
  { label: 'Global top 10%',         seconds: 67 * 60,      note: 'Under 1:07 across all ages' },
]

// Motivational lines surfaced contextually based on how close they are.
export const MOTIVATION = {
  bigGap: [
    'The top SA teams aren\'t fitter — they\'re more efficient. Every line below is a few seconds you leave on the floor on race day.',
    'A 1:02 at sea level puts you in the SA podium conversation for 35-39. That\'s not a dream — it\'s a training block away.',
  ],
  closing: [
    'You\'re one disciplined block from a PB. Hold race pace on the runs and the stations take care of themselves.',
    'The gap is mostly running. Fix the runs and you\'re knocking on the door of a SA top-5 finish.',
  ],
  onTrack: [
    'Targets now cover the gap. Execute on race day and the PB is yours.',
    'You\'re projecting under your goal — now it\'s about holding it when it hurts.',
  ],
}
