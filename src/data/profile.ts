// Personalisation model — division, equipment, targets, athletes.
// Drives the whole app and persists to localStorage.

export type StationId =
  | 'running' | 'skierg' | 'sled_push' | 'sled_pull' | 'bbj'
  | 'row' | 'farmers' | 's_lunges' | 'wall_balls'

export interface SegmentSplit {
  id: StationId
  label: string
  type: 'run' | 'station'
  actualSeconds: number   // last race result (run = avg sec/km)
  targetSeconds: number   // goal (run = avg sec/km)
  note: string
}

// ---------------------------------------------------------------------------
// Divisions
// ---------------------------------------------------------------------------
export type DivisionId =
  | 'open_doubles_men' | 'open_doubles_women' | 'pro_doubles_men'
  | 'mixed_doubles'
  | 'open_singles_men' | 'open_singles_women'
  | 'pro_singles_men' | 'pro_singles_women'
  | 'relay'

export interface Division {
  id: DivisionId
  label: string
  athletes: number          // people sharing the work
  tier: 'standard' | 'pro'
  loadNote: string
}

export const DIVISIONS: Division[] = [
  { id:'open_doubles_men',   label:'Doubles — Men',         athletes:2, tier:'standard', loadNote:'Open loads, men. Work split across two athletes.' },
  { id:'open_doubles_women', label:'Doubles — Women',       athletes:2, tier:'standard', loadNote:'Open loads, women. Work split across two athletes.' },
  { id:'pro_doubles_men',    label:'Pro Doubles — Men',     athletes:2, tier:'pro',      loadNote:'Pro loads — heavier sled & 9kg wall ball (verify current official standards).' },
  { id:'mixed_doubles',      label:'Mixed Doubles',         athletes:2, tier:'standard', loadNote:'One man + one woman. Confirm per-station loads for your pairing.' },
  { id:'open_singles_men',   label:'Singles — Men',         athletes:1, tier:'standard', loadNote:'Open loads, men. You do every rep solo.' },
  { id:'open_singles_women', label:'Singles — Women',       athletes:1, tier:'standard', loadNote:'Open loads, women. You do every rep solo.' },
  { id:'pro_singles_men',    label:'Pro — Men',             athletes:1, tier:'pro',      loadNote:'Pro loads — heavier sled & 9kg wall ball (verify current official standards).' },
  { id:'pro_singles_women',  label:'Pro — Women',           athletes:1, tier:'pro',      loadNote:'Pro loads, women — heavier than Open (verify current standards).' },
  { id:'relay',              label:'Relay (4)',             athletes:4, tier:'standard', loadNote:'Open loads. Work split across four athletes — each does ~2 stations.' },
]

export const getDivision = (id: DivisionId): Division =>
  DIVISIONS.find(d => d.id === id) ?? DIVISIONS[0]

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------
export type EquipmentId =
  | 'skierg' | 'rower' | 'sled' | 'wall_ball'
  | 'barbell' | 'rack' | 'dumbbell' | 'kettlebell'
  | 'sandbag' | 'bands' | 'pullup_bar' | 'treadmill'

export interface Equipment {
  id: EquipmentId
  label: string
  group: 'hyrox' | 'free' | 'accessory'
}

export const EQUIPMENT_CATALOG: Equipment[] = [
  { id:'skierg',     label:'SkiErg',          group:'hyrox' },
  { id:'rower',      label:'Rower',           group:'hyrox' },
  { id:'sled',       label:'Sled',            group:'hyrox' },
  { id:'wall_ball',  label:'Wall ball + target', group:'hyrox' },
  { id:'barbell',    label:'Barbell + plates', group:'free' },
  { id:'rack',       label:'Squat rack',      group:'free' },
  { id:'dumbbell',   label:'Dumbbells',       group:'free' },
  { id:'kettlebell', label:'Kettlebells',     group:'free' },
  { id:'sandbag',    label:'Sandbag',         group:'free' },
  { id:'bands',      label:'Resistance bands', group:'accessory' },
  { id:'pullup_bar', label:'Pull-up bar',     group:'accessory' },
  { id:'treadmill',  label:'Treadmill',       group:'accessory' },
]

// ---------------------------------------------------------------------------
// Station → movement resolver (the "smart" part)
// Ordered candidates; first one whose requirements are met wins.
// ---------------------------------------------------------------------------
interface Candidate {
  requires: EquipmentId[]   // empty = always available (bodyweight)
  movement: string
  native?: boolean          // true = this IS the real race station
}

const STATION_CANDIDATES: Record<StationId, Candidate[]> = {
  running: [
    { requires: [], movement: 'Running (outdoor or treadmill)', native: true },
  ],
  skierg: [
    { requires: ['skierg'],     movement: 'SkiErg', native: true },
    { requires: ['bands'],      movement: 'Banded straight-arm pulldowns + swings' },
    { requires: ['kettlebell'], movement: 'KB swings (hinge + lungs)' },
    { requires: ['dumbbell'],   movement: 'DB swings / snatches' },
    { requires: [],             movement: 'Burpees (engine — no kit)' },
  ],
  sled_push: [
    { requires: ['sled'],       movement: 'Sled Push', native: true },
    { requires: ['sandbag'],    movement: 'Heavy sandbag bear-hug carry' },
    { requires: ['barbell'],    movement: 'Zercher carry / walking lunges' },
    { requires: ['dumbbell'],   movement: 'Heavy DB walking lunges' },
    { requires: ['kettlebell'], movement: 'Heavy KB front-rack carry' },
    { requires: [],             movement: 'Weighted step-ups / bear crawls' },
  ],
  sled_pull: [
    { requires: ['sled'],       movement: 'Sled Pull', native: true },
    { requires: ['bands'],      movement: 'Hand-over-hand band pulls (anchor to loaded sandbag)' },
    { requires: ['barbell'],    movement: 'Heavy barbell bent-over rows' },
    { requires: ['dumbbell'],   movement: 'Heavy DB rows' },
    { requires: ['pullup_bar'], movement: 'Weighted pull-ups / inverted rows' },
    { requires: [],             movement: 'Towel / bodyweight rows' },
  ],
  bbj: [
    { requires: [], movement: 'Burpee Broad Jumps', native: true },
  ],
  row: [
    { requires: ['rower'],      movement: 'Row', native: true },
    { requires: ['kettlebell'], movement: 'KB swings + cleans (engine)' },
    { requires: ['dumbbell'],   movement: 'DB snatches + swings (engine)' },
    { requires: ['sandbag'],    movement: 'Sandbag cleans (engine)' },
    { requires: [],             movement: 'Burpees / shuttle runs (engine)' },
  ],
  farmers: [
    { requires: ['kettlebell'], movement: 'KB farmers carry', native: true },
    { requires: ['dumbbell'],   movement: 'DB farmers carry', native: true },
    { requires: ['sandbag'],    movement: 'Sandbag carry' },
    { requires: ['barbell'],    movement: 'Barbell suitcase carry' },
    { requires: [],             movement: 'Loaded backpack carry' },
  ],
  s_lunges: [
    { requires: ['sandbag'],    movement: 'Sandbag lunges', native: true },
    { requires: ['barbell'],    movement: 'Barbell front-rack lunges' },
    { requires: ['dumbbell'],   movement: 'DB lunges' },
    { requires: ['kettlebell'], movement: 'KB front-rack lunges' },
    { requires: [],             movement: 'Bodyweight walking lunges' },
  ],
  wall_balls: [
    { requires: ['wall_ball'],  movement: 'Wall Balls', native: true },
    { requires: ['dumbbell'],   movement: 'DB thrusters' },
    { requires: ['kettlebell'], movement: 'KB thrusters / goblet squat-to-press' },
    { requires: ['sandbag'],    movement: 'Sandbag thrusters' },
    { requires: ['barbell'],    movement: 'Barbell thrusters' },
    { requires: [],             movement: 'Air squat + reach (no load)' },
  ],
}

export interface ResolvedStation {
  id: StationId
  movement: string
  status: 'native' | 'substitute' | 'fallback'
}

export function resolveStation(id: StationId, equipment: EquipmentId[]): ResolvedStation {
  const candidates = STATION_CANDIDATES[id]
  const has = (req: EquipmentId[]) => req.every(r => equipment.includes(r))
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i]
    if (has(c.requires)) {
      const isLast = i === candidates.length - 1
      const status: ResolvedStation['status'] =
        c.native ? 'native' : (isLast && c.requires.length === 0) ? 'fallback' : 'substitute'
      return { id, movement: c.movement, status }
    }
  }
  const last = candidates[candidates.length - 1]
  return { id, movement: last.movement, status: 'fallback' }
}

export const STATION_LABELS: Record<StationId, string> = {
  running: 'Running', skierg: 'SkiErg', sled_push: 'Sled Push', sled_pull: 'Sled Pull',
  bbj: 'Burpee Broad Jump', row: 'Row', farmers: 'Farmers Carry',
  s_lunges: 'Sandbag Lunges', wall_balls: 'Wall Balls',
}

// ---------------------------------------------------------------------------
// Station loads per division — official Hyrox loads
// Wall ball: Open = 4kg, Pro Men = 6kg, Pro Women = 4kg
// Sled push/pull are different loads (push is heavier than pull)
// ---------------------------------------------------------------------------
export interface StationLoads {
  wall_balls: number   // kg
  farmers: number      // kg per hand
  s_lunges: number     // kg (sandbag)
  sled_push: number    // kg (including sled)
  sled_pull: number    // kg (including sled)
}

// Loads from official Hyrox Doubles sheet (confirmed by user):
//   Doubles Men:   6kg WB · 125kg push · 75kg pull · 2×24kg farmers · 20kg lunges
//   Doubles Women: 4kg WB · 75kg push  · 50kg pull · 2×16kg farmers · 10kg lunges
//   Mixed Doubles: 6kg WB · 125kg push · 75kg pull · 2×24kg farmers · 20kg lunges
// Singles and Pro loads are best-estimate (not confirmed from sheet).
// Sled weights are plate load only (+ sled frame on race day).
const DIVISION_LOADS: Record<DivisionId, StationLoads> = {
  open_doubles_men:   { wall_balls: 6,  farmers: 24, s_lunges: 20, sled_push: 125, sled_pull: 75  },
  open_doubles_women: { wall_balls: 4,  farmers: 16, s_lunges: 10, sled_push: 75,  sled_pull: 50  },
  pro_doubles_men:    { wall_balls: 9,  farmers: 32, s_lunges: 30, sled_push: 175, sled_pull: 125 },
  mixed_doubles:      { wall_balls: 6,  farmers: 24, s_lunges: 20, sled_push: 125, sled_pull: 75  },
  open_singles_men:   { wall_balls: 4,  farmers: 24, s_lunges: 20, sled_push: 125, sled_pull: 75  },
  open_singles_women: { wall_balls: 4,  farmers: 16, s_lunges: 10, sled_push: 75,  sled_pull: 50  },
  pro_singles_men:    { wall_balls: 9,  farmers: 32, s_lunges: 30, sled_push: 175, sled_pull: 125 },
  pro_singles_women:  { wall_balls: 6,  farmers: 24, s_lunges: 20, sled_push: 125, sled_pull: 75  },
  relay:              { wall_balls: 4,  farmers: 24, s_lunges: 20, sled_push: 125, sled_pull: 75  },
}

export function getStationLoads(divisionId: DivisionId): StationLoads {
  return DIVISION_LOADS[divisionId] ?? DIVISION_LOADS.open_doubles_men
}

export function resolveLoads(profile: { division: DivisionId; customLoads?: StationLoads | null }): StationLoads {
  const base = getStationLoads(profile.division)
  if (!profile.customLoads) return base
  return { ...base, ...profile.customLoads }
}

// ---------------------------------------------------------------------------
// Default segments (Wesley + Glenn, Johannesburg 2026)
// ---------------------------------------------------------------------------
export const DEFAULT_SEGMENTS: SegmentSplit[] = [
  { id:'running',    label:'Running',        type:'run',     actualSeconds:280, targetSeconds:272, note:'avg/km across all 8 runs' },
  { id:'skierg',     label:'SkiErg',         type:'station', actualSeconds:234, targetSeconds:221, note:'1000m' },
  { id:'sled_push',  label:'Sled Push',      type:'station', actualSeconds:87,  targetSeconds:93,  note:'50m — beat this ✓' },
  { id:'sled_pull',  label:'Sled Pull',      type:'station', actualSeconds:211, targetSeconds:163, note:'50m — biggest station deficit' },
  { id:'bbj',        label:'Burpee BJ',      type:'station', actualSeconds:161, targetSeconds:151, note:'80m' },
  { id:'row',        label:'Row',            type:'station', actualSeconds:281, targetSeconds:244, note:'1000m' },
  { id:'farmers',    label:'Farmers Carry',  type:'station', actualSeconds:92,  targetSeconds:85,  note:'200m total' },
  { id:'s_lunges',   label:'Sandbag Lunges', type:'station', actualSeconds:191, targetSeconds:172, note:'100m' },
  { id:'wall_balls', label:'Wall Balls',     type:'station', actualSeconds:258, targetSeconds:224, note:'100 reps' },
]

// ---------------------------------------------------------------------------
// Fitness level
// ---------------------------------------------------------------------------
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite'

export interface FitnessLevelConfig {
  id: FitnessLevel
  label: string
  tagline: string
  color: string
  description: string
  runPaceAdjustSec: number   // seconds/km added to target pace (+ve = slower)
  volumePct: number          // multiply prescribed reps/sets
  loadPct: number            // multiply prescribed load
  restMultiplier: number     // multiply prescribed rest
  sessionCapPerWeek: number  // drop later days if over cap
}

export const FITNESS_LEVELS: FitnessLevelConfig[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    tagline: 'Building the base',
    color: '#4a9fd4',
    description: 'New to Hyrox or structured training. Less than 6 months of consistent work. Focus on technique over intensity.',
    runPaceAdjustSec: 60,
    volumePct: 0.6,
    loadPct: 0.7,
    restMultiplier: 1.5,
    sessionCapPerWeek: 4,
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    tagline: 'Race fit',
    color: '#2a8c5a',
    description: 'Some Hyrox or fitness background. Can run 5km under 30 min and complete all stations with correct technique.',
    runPaceAdjustSec: 25,
    volumePct: 0.8,
    loadPct: 0.85,
    restMultiplier: 1.2,
    sessionCapPerWeek: 5,
  },
  {
    id: 'advanced',
    label: 'Advanced',
    tagline: 'As prescribed',
    color: '#e8962a',
    description: 'Completed a Hyrox. Comfortable at race pace. Full plan exactly as written — this is the baseline.',
    runPaceAdjustSec: 0,
    volumePct: 1.0,
    loadPct: 1.0,
    restMultiplier: 1.0,
    sessionCapPerWeek: 7,
  },
  {
    id: 'elite',
    label: 'Elite',
    tagline: 'Podium hunting',
    color: '#d63b2f',
    description: 'Top-10% finisher targeting the podium. Volume and load above prescribed — be conservative early in the plan.',
    runPaceAdjustSec: -10,
    volumePct: 1.1,
    loadPct: 1.1,
    restMultiplier: 0.9,
    sessionCapPerWeek: 7,
  },
]

export const getFitnessLevel = (id: FitnessLevel): FitnessLevelConfig =>
  FITNESS_LEVELS.find(l => l.id === id) ?? FITNESS_LEVELS[2]

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
export interface Profile {
  athlete1: string
  athlete2: string
  division: DivisionId
  lastRaceName: string
  nextRaceName: string
  lastFinishSeconds: number
  targetFinishSeconds: number
  equipment: EquipmentId[]
  segments: SegmentSplit[]
  fitnessLevel: FitnessLevel
  trainingMode: 'solo' | 'partner'
  maxHR: number
  raceDate: string             // YYYY-MM-DD — the actual race day
  planStartDate: string        // YYYY-MM-DD — the Monday of Week 1 (auto-derived or manual)
  customLoads: StationLoads | null  // null = use division defaults
}

export const DEFAULT_PROFILE: Profile = {
  athlete1: 'Wesley Phillips',
  athlete2: 'Glenn McEwan',
  division: 'open_doubles_men',
  lastRaceName: 'Johannesburg 2026',
  nextRaceName: 'Cape Town',
  lastFinishSeconds: 68 * 60 + 46, // 1:08:46
  targetFinishSeconds: 62 * 60,    // 1:02:00
  equipment: ['barbell', 'rack', 'dumbbell', 'kettlebell', 'bands', 'pullup_bar', 'sandbag'],
  segments: DEFAULT_SEGMENTS,
  fitnessLevel: 'advanced',
  trainingMode: 'partner',
  maxHR: 185,
  raceDate: '',
  planStartDate: '',
  customLoads: null,
}

// ---------------------------------------------------------------------------
// Race date helpers
// ---------------------------------------------------------------------------

/** Given a race date, compute the Monday that is exactly 11 weeks before it. */
export function raceDateToPlanStart(raceDate: string): string {
  if (!raceDate) return ''
  const [y, m, d] = raceDate.split('-').map(Number)
  const race = new Date(y, m - 1, d)
  // 77 days before race = Week 1 Monday (plan is exactly 11 weeks)
  const approxStart = new Date(race.getTime() - 77 * 86400000)
  // Snap back to Monday (JS getDay: 0=Sun, 1=Mon … 6=Sat)
  const dow = approxStart.getDay()
  const daysBack = dow === 0 ? 6 : dow - 1
  const monday = new Date(approxStart.getTime() - daysBack * 86400000)
  // Use local date parts — toISOString() converts to UTC and shifts date in UTC+ timezones
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`
}

/** Weeks remaining until race date (0 if today is race day or past). */
export function weeksUntilRace(raceDate: string): number | null {
  if (!raceDate) return null
  const [y, m, d] = raceDate.split('-').map(Number)
  const race = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((race.getTime() - today.getTime()) / 86400000)
  return diff < 0 ? null : Math.floor(diff / 7)
}

const STORAGE_KEY = 'hyrox-profile-v2'

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PROFILE
    const parsed = JSON.parse(raw) as Partial<Profile>
    // Merge so new fields always have a default.
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      segments: parsed.segments && parsed.segments.length === DEFAULT_SEGMENTS.length
        ? parsed.segments
        : DEFAULT_SEGMENTS,
    }
  } catch {
    return DEFAULT_PROFILE
  }
}

export function saveProfile(p: Profile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    /* storage unavailable — ignore */
  }
}
