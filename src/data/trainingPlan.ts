import type { StationId } from './profile'

export type SessionType = 'run' | 'strength' | 'compromised' | 'sim' | 'rest'
export type Phase = 'aerobic' | 'build' | 'peak' | 'race'
export type WorkoutType = 'engine' | 'foundation' | 'complete' | 'aerobic' | 'power'

export interface TrainingSession {
  type: SessionType
  workoutType?: WorkoutType
  format?: string
  title: string
  duration: string
  detail: string
  notes: string
  soloNotes?: string
  optional?: boolean         // renders with OPTIONAL badge — user can skip
  stations?: StationId[]
}

export interface TrainingDay {
  day: string
  session: TrainingSession
}

export interface TrainingWeek {
  week: number
  phase: Phase
  weekTheme: string
  title: string
  focus: string
  gymSession?: TrainingSession  // optional upper/lower body physique day
  days: TrainingDay[]
}

export const PHASE_COLORS: Record<Phase, string> = {
  aerobic: '#2a8c5a',
  build:   '#e8962a',
  peak:    '#d63b2f',
  race:    '#d63b2f',
}

export const WORKOUT_TYPE_LABEL: Record<WorkoutType, string> = {
  engine:     'HYROX ENGINE',
  foundation: 'HYROX FOUNDATION',
  complete:   'HYROX COMPLETE',
  aerobic:    'HYROX AEROBIC',
  power:      'HYROX POWER',
}

export const SESSION_COLORS: Record<SessionType, { bg: string; border: string; text: string; label: string }> = {
  run:         { bg: '#0d1f2d', border: '#4a9fd4', text: '#4a9fd4', label: 'Run' },
  strength:    { bg: '#1a0d2d', border: '#a855f7', text: '#a855f7', label: 'Strength' },
  compromised: { bg: '#2d0d0d', border: '#d63b2f', text: '#d63b2f', label: 'Compromised' },
  sim:         { bg: '#2d1e00', border: '#e8962a', text: '#e8962a', label: 'Simulation' },
  rest:        { bg: '#111111', border: '#333333', text: '#555555', label: 'Rest' },
}

export const WEEK_LOAD: Record<number, number> = {
  1: 30, 2: 40, 3: 48, 4: 56,
  5: 64, 6: 72, 7: 80, 8: 90,
  9: 82, 10: 74, 11: 46, 12: 22,
}

// ---------------------------------------------------------------------------
// 12-week Hyrox Doubles plan — Wesley + Glenn.
// Weekly rhythm (rest Wed + Fri):
//   Mon — Strength + Compromised Running (high-HR circuit)
//   Tue — Speed (400/800m intervals)
//   Thu — Leg / Running Strength + Explosive + weak-station focus (WB · Lunges · Burpees)
//   Sat — Long run ~8km (or race-order brick/sim on peak weeks)
//   Sun — Easy recovery run
// ~25km running per week. Weakest stations trained twice weekly.
// ---------------------------------------------------------------------------
export const TRAINING_PLAN: TrainingWeek[] = [
  {
    week:1, phase:'aerobic', weekTheme:'BASE',
    title:'Aerobic Base + Movement Prep',
    focus:'~24km easy · high-HR circuit intro · weak-station technique',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'power',format:'4 Rounds',
        title:'Strength + Compromised Run',duration:'50 min',
        detail:'10 min warm-up · 4 rounds: 600m run at 5:00/km → high-HR circuit: 15 KB Swings + 12 Goblet Squats + 12 Push-ups + 8 Deadlifts + 10 Headcutters · 90s rest between rounds',
        notes:'DOUBLES — split the circuit reps 50/50, both run the 600m together. Keep the heart rate high across the whole round — the circuit should feel like a race station, not a gym set. Log how the runs feel after the strength work drifts in.',
        soloNotes:'Training solo: run 600m then complete the full circuit yourself, 4 rounds. This is your bread-and-butter compromised session — running on tired legs is the whole point.'}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'8 × 400m',
        title:'Track Speed',duration:'45 min',
        detail:'2km warm-up · 8 × 400m at 3:55–4:05/km · 90s jog recovery · 1.5km cooldown',
        notes:'Z5. Your one dedicated speed day. Short and sharp — hit the pace or extend the rest, never grind slow reps. Both partners run together and push each other.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest + mobility. Hips, ankles, T-spine.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'power',format:'Legs + Power + Weak Stations',
        title:'Leg Strength + Weak-Station Focus',duration:'60 min',
        detail:'A) Back Squat 4×8 · B) Box Jumps 4×5 (explosive) · C) Standing Calf Raise 3×15 · Then weak-station block: 3 rounds of 20 Wall Balls + 20m Sandbag Lunges + 10 Burpee BJ (90s rest)',
        notes:'Leg strength first (A–C), then hammer the three weakest stations. Wall balls: find an unbroken rhythm. Lunges: full depth, back knee kisses the floor. Burpees: smooth, not frantic. These three win or lose your race.',
        soloNotes:'Training solo: full squat + power work, then the weak-station block yourself. Log wall-ball reps unbroken and burpee pace — these are your benchmarks.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest day.',notes:''}},
      {day:'Sat',session:{type:'run',workoutType:'aerobic',format:'Long Run 8km',
        title:'Long Easy 8km',duration:'50 min',
        detail:'8km at 5:20–5:40/km, fully conversational · finish with 4 × 20s strides',
        notes:'Your weekly long run. Z2 the whole way — this builds the aerobic engine everything else sits on. The strides at the end keep the legs quick.'}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 5km',duration:'32 min',
        detail:'5km very easy Z2. HR under 145.',notes:'Flush the legs. No pace pressure.'}},
    ]},

  {
    week:2, phase:'aerobic', weekTheme:'BUILD',
    title:'Volume + Weak-Station Volume',
    focus:'~25km · circuit volume up · wall balls / lunges / burpees',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'power',format:'5 Rounds',
        title:'Strength + Compromised Run',duration:'55 min',
        detail:'10 min warm-up · 5 rounds: 600m run at 4:55/km → 18 KB Swings + 14 Goblet Squats + 14 Push-ups + 10 Deadlifts + 12 Headcutters · 90s rest',
        notes:'DOUBLES — split circuit reps, run together. One extra round vs Week 1 and a touch more volume. Keep HR high — treat the circuit as continuous.',
        soloNotes:'Training solo: 5 full rounds yourself. Watch your run pace hold as the rounds add up.'}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'6 × 800m',
        title:'Speed — 800s',duration:'48 min',
        detail:'2km warm-up · 6 × 800m at 4:05–4:15/km · 90s jog recovery · 1.5km cooldown',
        notes:'Z4–Z5. Longer reps than Week 1 — holds speed under fatigue. Split every rep, both partners together.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest + mobility.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'power',format:'Legs + Power + Weak Stations',
        title:'Leg Strength + Weak-Station Focus',duration:'62 min',
        detail:'A) Back Squat 4×8 · B) Power Clean 5×3 (explosive) · C) Standing Calf Raise 3×18 · Then: 4 rounds of 22 Wall Balls + 24m Sandbag Lunges + 12 Burpee BJ (90s rest)',
        notes:'Power cleans build the triple-extension that drives wall balls and burpees. Then four rounds of the weak-station trio — one more than last week. Track total burpee time.',
        soloNotes:'Training solo: complete the lift work and the 4-round weak-station block yourself.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'run',workoutType:'aerobic',format:'Long Run 8km',
        title:'Long Easy 8km',duration:'50 min',
        detail:'8km at 5:15–5:35/km Z2 · finish with 5 × 20s strides',
        notes:'Same 8km, slightly quicker feel as the base builds. Stay conversational — if you can’t talk, slow down.'}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 5km',duration:'32 min',
        detail:'5km easy Z2.',notes:'Recovery only.'}},
    ]},

  {
    week:3, phase:'aerobic', weekTheme:'GROW',
    title:'Threshold + Compromised Intro',
    focus:'~25km · first threshold block · explosive snatches',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'power',format:'5 Rounds',
        title:'Strength + Compromised Run',duration:'55 min',
        detail:'10 min warm-up · 5 rounds: 800m run at 4:55/km → 18 KB Swings + 15 Goblet Squats + 15 Push-ups + 10 Deadlifts + 12 Headcutters · 90s rest',
        notes:'DOUBLES — run distance up to 800m per round. This is where the run really starts to bite after the circuit. Hold form on the deadlifts when fatigued.',
        soloNotes:'Training solo: 5 rounds with the 800m run. Big compromised stimulus — pace the circuit so you can still run.'}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'10 × 400m',
        title:'Speed — 400s',duration:'48 min',
        detail:'2km warm-up · 10 × 400m at 3:55/km · 75s jog recovery · 1.5km cooldown',
        notes:'Z5. Two more reps than Week 1 with less rest. This is pure top-end speed — protect the pace.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest + mobility.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'power',format:'Legs + Power + Weak Stations',
        title:'Leg Strength + Explosive + Weak Stations',duration:'64 min',
        detail:'A) Back Squat 4×6 (heavier) · B) DB/KB Snatch 5×5 per arm (explosive) · C) Seated + Standing Calf Raise 3×15 each · Then: 4 rounds of 25 Wall Balls + 24m Sandbag Lunges + 14 Burpee BJ (75s rest)',
        notes:'Snatches are explosive full-body power — carry that snap into the wall balls. Weak-station reps up again. Wall balls unbroken if you can.',
        soloNotes:'Training solo: all lift + explosive work, then the weak-station rounds yourself.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'run',workoutType:'engine',format:'Long Run 8km + Threshold',
        title:'Long Run 8km w/ Threshold',duration:'52 min',
        detail:'2km easy · 4km at 4:45–4:55/km (threshold, continuous) · 2km easy',
        notes:'First threshold block inside the long run. The middle 4km should feel comfortably hard — controlled, not racing.'}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 6km',duration:'38 min',
        detail:'6km easy Z2.',notes:'Build the easy run slightly. Recovery pace.'}},
    ]},

  {
    week:4, phase:'build', weekTheme:'PACE',
    title:'Race Pace Begins',
    focus:'~26km · race-pace runs · first partner brick',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'power',format:'6 Rounds',
        title:'Strength + Compromised Run',duration:'58 min',
        detail:'10 min warm-up · 6 rounds: 600m run at 4:50/km → 20 KB Swings + 15 Goblet Squats + 15 Push-ups + 12 Deadlifts + 12 Headcutters · 75s rest',
        notes:'DOUBLES — six rounds now. Shorter rest, higher HR. This is the engine session — the circuit keeps your heart rate pinned while you run.',
        soloNotes:'Training solo: 6 rounds. Manage the circuit so the runs don’t fall apart in rounds 5–6.'}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'5 × 800m',
        title:'Speed — Race Pace 800s',duration:'50 min',
        detail:'2km warm-up · 5 × 800m at 4:10/km · 90s recovery · 2km cooldown',
        notes:'Z4. Right around doubles race pace. Learn what this effort feels like — you’ll live here on race day.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest + mobility.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'power',format:'Legs + Power + Weak Stations',
        title:'Leg Strength + Explosive + Weak Stations',duration:'64 min',
        detail:'A) Back Squat 4×6 · B) Box Jump 4×5 + Power Clean 4×3 (explosive superset) · C) Calf Raise 4×15 · Then: 5 rounds of 25 Wall Balls + 25m Lunges + 12 Burpee BJ (75s rest)',
        notes:'Five weak-station rounds — big volume on your three limiters. This is deliberate: you get strong at what you train most. Log the totals.',
        soloNotes:'Training solo: full lift + explosive work, then 5 weak-station rounds.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'compromised',workoutType:'complete',format:'4 Rounds',
        title:'First Partner Brick',duration:'55 min',
        detail:'4 rounds: both run 1km at 4:40/km → 20 Wall Balls each + 20m Lunges each + 10 Burpee BJ each · 2 min rest',
        notes:'Race-order compromised running into your weak stations. DOUBLES: switch wall balls every 20–25 reps; split burpees evenly (40m each) with the faster partner setting a composed rhythm — each of you completes your own reps. Practise sub-30s changeovers: every 30s saved per transition is ~4 min off race day. Watch pace drift rounds 3–4.',
        soloNotes:'Training solo: run 1km then all reps yourself. Full doubles volume solo is deliberate overload — time every round.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 6km',duration:'38 min',
        detail:'6km easy Z2 flush.',notes:'Recover from the brick. Easy only.'}},
    ]},

  {
    week:5, phase:'build', weekTheme:'PUSH',
    title:'Strength-Endurance Build',
    focus:'~26km · heavier strength · longer intervals',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'power',format:'6 Rounds',
        title:'Strength + Compromised Run',duration:'60 min',
        detail:'10 min warm-up · 6 rounds: 800m run at 4:50/km → 20 KB Swings + 16 Goblet Squats + 15 Push-ups + 12 Deadlifts + 14 Headcutters · 75s rest',
        notes:'DOUBLES — 800m runs, six rounds. This is a big compromised engine day. Keep the deadlifts crisp even when the heart rate is redlining.',
        soloNotes:'Training solo: 6 rounds at full volume. One of your hardest sessions of the block — trust the rest.'}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'4 × 1km',
        title:'Speed — 1km Repeats',duration:'52 min',
        detail:'2km warm-up · 4 × 1km at 4:15/km · 2 min recovery · 2km cooldown',
        notes:'Z4. Longer speed reps holding just under race pace. Split every km, both partners together.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest + mobility.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'power',format:'Legs + Power + Weak Stations',
        title:'Leg Strength + Explosive + Weak Stations',duration:'66 min',
        detail:'A) Back Squat 5×5 (heavy) · B) Power Clean 5×3 · C) RDL 3×8 · D) Calf Raise 4×18 · Wall-ball EMOM: 10 min — 15 reps/min with a ball 1–2kg heavier than race · Then: 4 rounds of 25m Sandbag Lunges (unbroken) + 14 Burpee BJ (75s rest)',
        notes:'Heaviest squats yet. The wall-ball EMOM builds capacity — full squat depth, bounce out of the hole with the stretch reflex, never catch with straight arms. Lunges: settle an unbroken rhythm from rep one. Burpees: step up out of each rep to keep HR down, moderate jumps, steady tempo. DOUBLES: rehearse the split — break wall balls into 20–25 rep chunks and switch often; strongest partner takes 60–70 of the 100.',
        soloNotes:'Training solo: heavy lifts then the weak-station block. Log every wall-ball and burpee number.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'run',workoutType:'aerobic',format:'Long Run 8km',
        title:'Long Run 8km w/ Surges',duration:'52 min',
        detail:'8km Z2 with 6 × 1 min surges at 4:30/km scattered through · 5 min easy to finish',
        notes:'Long aerobic run with race-pace surges — trains the gear change after a station. Respond to feel, don’t plan the surges.'}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 6km',duration:'38 min',
        detail:'6km easy Z2.',notes:'Recovery pace only.'}},
    ]},

  {
    week:6, phase:'build', weekTheme:'FORGE',
    title:'Power + Compromised Volume',
    focus:'~26km · explosive focus · half-race brick',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'power',format:'6 Rounds',
        title:'Strength + Compromised Run',duration:'60 min',
        detail:'10 min warm-up · 6 rounds: 800m run at 4:45/km → 22 KB Swings + 16 Goblet Squats + 16 Push-ups + 12 Deadlifts + 14 Headcutters · 60s rest',
        notes:'DOUBLES — rest drops to 60s. The engine is the star today. If the runs slow, that’s the fatigue you’re training to beat.',
        soloNotes:'Training solo: 6 rounds, 60s rest. Brutal and brilliant — this is race fitness.'}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'8 × 400m + 4 × 200m',
        title:'Speed — Mixed Intervals',duration:'52 min',
        detail:'2km warm-up · 8 × 400m at 3:55/km (75s rest) · then 4 × 200m at 3:40/km (60s rest) · 1.5km cooldown',
        notes:'Z5. Finish faster than you start. The 200s at the end sharpen leg speed when you’re already tired.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest + mobility.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'power',format:'Legs + Explosive + Weak Stations',
        title:'Explosive Legs + Weak Stations',duration:'66 min',
        detail:'A) Back Squat 5×5 · B) Box Jump 5×4 + DB Snatch 5×4/arm (explosive) · C) Calf Raise 4×20 · Then: 5 rounds of 30 Wall Balls + 25m Lunges + 15 Burpee BJ (60s rest)',
        notes:'Explosive block front and centre. Then 30 wall balls a round — your weak station is becoming a weapon. Keep lunges honest and burpees smooth.',
        soloNotes:'Training solo: explosive lifts then the weak-station rounds yourself.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'sim',workoutType:'complete',format:'Race Order',
        title:'Half-Race Sim (Stations 1–4)',duration:'~30 min',
        detail:'4 × 1km run at race pace alternating with: SkiErg 1000m · Sled Push 50m · Sled Pull 50m · Burpee BJ 80m',
        notes:'Full race conditions and loads on the first half. Record every running split. Burpees are your station here — attack them.',
        soloNotes:'Training solo: run each leg at race pace and complete each station yourself. Focus on execution and clean transitions.',
        stations:['skierg','sled_push','sled_pull','bbj']}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 6km',duration:'38 min',
        detail:'6km easy Z2 post-sim flush.',notes:'Easy only.'}},
    ]},

  {
    week:7, phase:'build', weekTheme:'CLIMB',
    title:'Peak Build I',
    focus:'~27km · rising volume · weak-station sim',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'power',format:'7 Rounds',
        title:'Strength + Compromised Run',duration:'64 min',
        detail:'10 min warm-up · 7 rounds: 700m run at 4:45/km → 20 KB Swings + 16 Goblet Squats + 16 Push-ups + 12 Deadlifts + 14 Headcutters · 60s rest',
        notes:'DOUBLES — seven rounds. Big engine volume. Consistency across all seven runs is the win — negative-split the session if you can.',
        soloNotes:'Training solo: 7 rounds. Enormous compromised stimulus. Pace to survive the back half.'}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'5 × 800m',
        title:'Speed — 800s @ Pace',duration:'52 min',
        detail:'2km warm-up · 5 × 800m at 4:05/km · 90s recovery · 2km cooldown',
        notes:'Z4–Z5. Slightly faster than race pace. Hold form on the last two reps — that’s where the race is won.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest + mobility.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'power',format:'Legs + Explosive + Weak Stations',
        title:'Explosive Legs + Weak Stations',duration:'68 min',
        detail:'A) Back Squat 5×5 · B) Power Clean 5×3 + Box Jump 5×4 · C) Calf Raise 4×20 · Then: 6 rounds of 30 Wall Balls + 25m Lunges + 15 Burpee BJ (60s rest)',
        notes:'Six weak-station rounds — your highest volume yet on wall balls, lunges and burpees. This is the session that turns your weakness into a strength.',
        soloNotes:'Training solo: lifts then 6 weak-station rounds. Log every number and compare to Week 4.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'run',workoutType:'aerobic',format:'Long Run 9km',
        title:'Long Run 9km',duration:'58 min',
        detail:'9km at 5:10–5:30/km Z2 · finish with 6 × 20s strides',
        notes:'Longest run of the plan so far. Pure aerobic base — the tank you draw from on race day. Stay relaxed and conversational.'}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 6km',duration:'38 min',
        detail:'6km easy Z2.',notes:'Recovery only.'}},
    ]},

  {
    week:8, phase:'peak', weekTheme:'GRIND',
    title:'Peak Volume',
    focus:'~28km · hardest week · full compromised grind',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'complete',format:'AMRAP 45 min',
        title:'45-min Continuous Grind',duration:'55 min',
        detail:'10 min warm-up · AMRAP 45 min, rotate continuously: 800m run → 20 Wall Balls → 15 KB Swings → 20m Lunges → 12 Burpee BJ → 10 Deadlifts → repeat · count rounds + partial reps',
        notes:'DOUBLES — split station reps, run together. This is the hardest engine session in the plan. Keep moving for the full 45 min — the cliff hits around minute 30, push through together.',
        soloNotes:'Training solo: do the full rotation yourself, continuously for 45 min. A brutal grind — adjust rest but never stop moving.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'6 × 800m',
        title:'Speed — Race Pace 800s',duration:'54 min',
        detail:'2km warm-up · 6 × 800m at 4:05–4:10/km · 90s recovery · then 100 Wall Balls for time (race weight) · 1km cooldown',
        notes:'Z4. Six reps at race pace, then 100 wall balls on trashed legs — the single best way to train wall balls under race fatigue. Hold every split, then grind the wall balls, unbroken if you can.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest. 8+ hrs sleep.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'power',format:'Legs + Explosive + Weak Stations',
        title:'Explosive Legs + Weak Stations',duration:'68 min',
        detail:'A) Back Squat 4×5 (peak load) · B) Power Clean 5×3 + Box Jump 5×5 · C) Calf Raise 4×20 · Wall-ball EMOM: 12 min — 15–18 reps/min, heavier ball · Then: 100 Wall Balls for time (unbroken target) → 50m Lunges → 20 Burpee BJ',
        notes:'Peak weak-station volume and the "Red Bull 100" test — 100 unbroken wall balls after fatigue is the badge, and the exact skill you need at station 8. Full depth, elastic bounce, breathe on the catch. DOUBLES: rehearse your race split — 20–25 rep chunks, switch fast, strongest takes 60–70. If they’re unbroken here, they’re unbroken on race day.',
        soloNotes:'Training solo: peak lifts then 6 weak-station rounds. Everything logged — this is your benchmark week.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'sim',workoutType:'complete',format:'Race Order',
        title:'Half-Race Sim (Stations 5–8)',duration:'~32 min',
        detail:'4 × 1km run at race pace alternating with: Row 1000m · Farmers Carry 200m · Sandbag Lunges 100m · Wall Balls 100 reps',
        notes:'Back half of the race, full loads — the exact late-race fatigue. Wall balls: full depth, bounce out, 20–25 rep chunks switching fast (strongest 60–70). Lunges: unbroken rhythm from rep one. Practise sub-30s transitions — every 30s saved is ~4 min off race day.',
        soloNotes:'Training solo: run each leg at race pace, all station reps yourself. Hold run pace after the farmers — that transition is critical.',
        stations:['row','farmers','s_lunges','wall_balls']}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 6km',duration:'38 min',
        detail:'6km easy Z2 flush after peak week.',notes:'Easy only. Big week done.'}},
    ]},

  {
    week:9, phase:'peak', weekTheme:'SHARPEN',
    title:'Race Specific',
    focus:'~26km · race-pace sharpening · station speed',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'complete',format:'5 Rounds',
        title:'Race-Pace Brick',duration:'55 min',
        detail:'5 rounds: both run 1km at 4:35/km (race pace) → 25 Wall Balls each + 20m Lunges each + 12 Burpee BJ each · 90s rest',
        notes:'DOUBLES — race pace on every run, race stations off tired legs. Five rounds = half race load. Seamless changeovers, hold pace to the end.',
        soloNotes:'Training solo: run 1km at race pace then all reps yourself, 5 rounds. Your hardest brick — trust the rest.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'10 × 400m',
        title:'Speed — Sharpening 400s',duration:'50 min',
        detail:'2km warm-up · 10 × 400m at 3:50/km · 75s recovery · 1.5km cooldown',
        notes:'Z5. Fast and sharp as the taper approaches. Crisp turnover, full recovery on the jogs.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'power',format:'Speed-Strength + Weak Stations',
        title:'Speed-Strength + Weak Stations',duration:'55 min',
        detail:'A) Back Squat 4×4 (fast, explosive intent) · B) Box Jump 4×4 + Power Clean 4×2 · C) Calf Raise 3×15 · Then: 4 rounds of 25 Wall Balls + 20m Lunges + 12 Burpee BJ (75s rest)',
        notes:'Volume comes down, speed stays up. Move the bar fast. Keep the weak-station block crisp — quality over quantity now.',
        soloNotes:'Training solo: explosive lifts then 4 weak-station rounds at speed.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest. High-carb day.',notes:''}},
      {day:'Sat',session:{type:'sim',workoutType:'complete',format:'6-Station Sim',
        title:'6-Station Race Sim',duration:'~45 min',
        detail:'3 rounds for time: 1km run at race pace → SkiErg 500m + 25 Wall Balls + 100m Lunges + 12 Burpee BJ · full race loads',
        notes:'Compare run splits round to round — hold pace on round 3. Dress rehearsal for your weak stations under race fatigue. Rehearse doubles splits and fast changeovers — aim for sub-30s transitions all day.',
        soloNotes:'Training solo: all 3 rounds yourself at race loads. Track total time and run splits.',
        stations:['skierg','wall_balls','s_lunges','bbj']}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 6km',duration:'38 min',
        detail:'6km easy Z2.',notes:'Recovery only. Big sim week next.'}},
    ]},

  {
    week:10, phase:'peak', weekTheme:'SIMULATE',
    title:'Full Race Simulation',
    focus:'~24km · complete doubles sim · dress rehearsal',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'complete',format:'4 Rounds',
        title:'Race-Pace Primer',duration:'48 min',
        detail:'4 rounds: both run 1km at 4:35/km → 20 Wall Balls each + 20m Lunges each + 10 Burpee BJ each · 2 min rest',
        notes:'DOUBLES — sharp and race-paced, not exhausting. Leave feeling fast. Priming for Saturday’s full sim.',
        soloNotes:'Training solo: 4 rounds at race pace. Quality primer — do not overcook it.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'5 × 800m',
        title:'Speed — Race Pace 800s',duration:'50 min',
        detail:'2km warm-up · 5 × 800m at 4:05/km · 90s recovery · 1.5km cooldown',
        notes:'Z4. Stay sharp. Should feel controlled — you’re fresher now the volume has dropped.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest. Save it for Saturday.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'power',format:'Neural Primer + Weak Stations',
        title:'Neural Primer + Weak Stations',duration:'40 min',
        detail:'A) Back Squat 3×3 (fast) · B) Box Jump 3×3 · Then: 3 rounds of 20 Wall Balls + 20m Lunges + 10 Burpee BJ (fast, 90s rest)',
        notes:'Short and snappy — wake the nervous system without fatigue. In and out. Legs should feel spring-loaded for the weekend.',
        soloNotes:'Training solo: quick explosive lifts + 3 crisp weak-station rounds. Do not chase fatigue.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest. High-carb day.',notes:''}},
      {day:'Sat',session:{type:'sim',workoutType:'complete',format:'Full Race',
        title:'FULL RACE SIMULATION',duration:'Target = goal time',
        detail:'All 8 stations, all 8 runs, race order, race loads, race pace. Time every segment.',
        notes:'Dress rehearsal. Full race protocol — pre-race nutrition, warm-up, kit on. If possible do it at a Hyrox gym on the real machines. Time every RoxZone transition — target under 7 min total (elite go under 5). Every 30s saved per transition is ~4 min off your finish. This tells you exactly where you stand.',
        soloNotes:'Training solo: run all 8 legs and all 8 stations at race loads. Your time will exceed the doubles target — focus on race-pace running and clean execution.',
        stations:['skierg','sled_push','sled_pull','bbj','row','farmers','s_lunges','wall_balls']}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Easy Flush 5km',duration:'32 min',
        detail:'5km very easy Z1–Z2. Legs recovery.',notes:'Flush the sim out. Very easy.'}},
    ]},

  {
    week:11, phase:'peak', weekTheme:'PRIME',
    title:'Taper I',
    focus:'~18km · volume down · intensity stays',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'complete',format:'3 Rounds',
        title:'Short Sharp Brick',duration:'40 min',
        detail:'3 rounds: 1km run at race pace → 20 Wall Balls each + 15m Lunges each + 10 Burpee BJ each · 2 min rest',
        notes:'DOUBLES — race-ready feel, short enough to leave you fresh. Snappy stations, hold race pace on the runs.',
        soloNotes:'Training solo: 3 rounds at race pace. Leave feeling strong, not depleted.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'4 × 400m',
        title:'Speed — Sharp 400s',duration:'38 min',
        detail:'2km warm-up · 4 × 400m at 3:50/km · 90s recovery · 1.5km cooldown',
        notes:'Z5. Just enough to stay sharp. Fast and clean — no grinding.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'power',format:'Light Primer + Weak Stations',
        title:'Light Primer + Weak Stations',duration:'35 min',
        detail:'A) Back Squat 3×3 (light, fast) · B) Box Jump 3×3 · Then: 2 rounds of 20 Wall Balls + 20m Lunges + 10 Burpee BJ',
        notes:'Neural touch only — stop 3 reps short on everything. Keep the movement patterns sharp for race week.',
        soloNotes:'Training solo: quick primer + 2 easy weak-station rounds. In and out.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'run',workoutType:'aerobic',format:'Long Run 7km',
        title:'Easy 7km',duration:'42 min',
        detail:'7km easy Z2 with 4 × 20s strides.',notes:'Last longer run before the race. Keep it easy — the fitness is banked, don’t chase it now.'}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 5km',duration:'32 min',
        detail:'5km very easy Z2.',notes:'Easy legs into race week.'}},
    ]},

  {
    week:12, phase:'peak', weekTheme:'RACE',
    title:'Taper II + Race',
    focus:'~12km · feel fast · race day',
    days:[
      {day:'Mon',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Easy Run 5km',duration:'32 min',
        detail:'5km very easy Z2. Just keep the legs ticking over.',notes:'Nothing hard this week. Let the legs freshen.'}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'6 × 1 min pickups',
        title:'Aerobic Activation',duration:'35 min',
        detail:'30 min easy run · 6 × 1 min pickups at race pace · 2 min easy between each',
        notes:'Not a workout — preparation. The pickups keep the legs in race-pace rhythm; the easy run keeps everything loose.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'complete',format:'5 Stations × 40%',
        title:'Race Preview',duration:'20 min',
        detail:'Choose 5 stations in race order · 40% race reps at race pace · both partners · in and out',
        notes:'Feel sharp, not worked. Include wall balls, lunges and burpees so the patterns are fresh. Race-pace feel — you should leave feeling fast.',
        soloNotes:'Training solo: 5 stations at 40% reps, race pace. Prime the weak stations. Leave feeling quick.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest. Carb load. Early night.',notes:''}},
      {day:'Sat',session:{type:'rest',title:'Race Day Eve',duration:'',detail:'Gear check. Nutrition sorted. Light 15 min walk only.',notes:''}},
      {day:'Sun',session:{type:'race' as SessionType,workoutType:'complete',format:'Target = goal time',
        title:'RACE DAY',duration:'',
        detail:'Warm up 15 min. Start controlled — do not go out at max on run 1. Trust the plan.',
        notes:'You have done the work. Wall balls unbroken. Lunges smooth. Burpees relentless. Row even splits, attack the sled pull. Run 8 is your sprint. Bring it home.'}},
    ]},
]
