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
// Rest days stay Wed + Fri (5 training days). The ROLE of each training day
// (speed / strength / compromised) rotates week to week, and the exercises
// and workout formats change throughout so no two weeks feel the same.
// ~25km running per week · one dedicated speed day · one ~8km long run ·
// leg + explosive strength · weak stations (wall balls, lunges, burpees)
// trained twice weekly. Research-backed: polarized runs, compromised bricks,
// wall-ball EMOM/under-fatigue work, doubles splits, fast transitions.
// ---------------------------------------------------------------------------
export const TRAINING_PLAN: TrainingWeek[] = [
  {
    week:1, phase:'aerobic', weekTheme:'BASE',
    title:'Aerobic Base + Movement Prep',
    focus:'Mon circuit · Tue 400s · Thu squat+jump · Sat 8km · ~24km',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'power',format:'4 Rounds',
        title:'High-HR Circuit + Run',duration:'50 min',
        detail:'10 min warm-up · 4 rounds: 600m run at 5:00/km → 15 KB Swings + 12 Goblet Squats + 12 Push-ups + 8 Deadlifts + 10 Headcutters · 90s rest',
        notes:'DOUBLES — split circuit reps, run together. Keep the heart rate pinned across the whole round; treat the circuit like a race station.',
        soloNotes:'Training solo: run then the full circuit, 4 rounds. Your intro to running on loaded legs.'}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'8 × 400m',
        title:'Track Speed — 400s',duration:'45 min',
        detail:'2km warm-up · 8 × 400m at 3:55–4:05/km · 90s jog recovery · 1.5km cooldown',
        notes:'Z5. Your speed day. Hit the pace or extend the rest — never grind slow reps. Both partners together.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest + mobility. Hips, ankles, T-spine.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'power',format:'Squat + Jump + WB EMOM',
        title:'Back Squat + Wall-Ball EMOM',duration:'58 min',
        detail:'A) Back Squat 4×8 · B) Box Jump 4×5 (explosive) · C) Standing Calf Raise 3×15 · Wall-ball EMOM: 8 min, 12 reps/min · Finish: 3 rounds of 20m Lunges + 10 Burpee BJ',
        notes:'Wall-ball technique: full depth, bounce out of the hole, never catch straight-armed. Lunges unbroken, burpees step-up out of each rep.',
        soloNotes:'Training solo: all of it yourself. Log the wall-ball EMOM feel and burpee pace — your baselines.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest day.',notes:''}},
      {day:'Sat',session:{type:'run',workoutType:'aerobic',format:'Long Run 8km',
        title:'Long Easy 8km',duration:'50 min',
        detail:'8km at 5:20–5:40/km, fully conversational · 4 × 20s strides to finish',
        notes:'Your weekly long run. Z2 the whole way — this is the aerobic base everything sits on.'}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 5km',duration:'32 min',
        detail:'5km very easy Z2. HR under 145.',notes:'Flush the legs. No pace pressure.'}},
    ]},

  {
    week:2, phase:'aerobic', weekTheme:'BUILD',
    title:'Volume + Station Skill',
    focus:'Mon strength · Tue brick · Thu 800s · Sat 8km progression · ~25km',
    days:[
      {day:'Mon',session:{type:'strength',workoutType:'power',format:'Front Squat + Clean + Ladder',
        title:'Front Squat + Weak-Station Ladder',duration:'60 min',
        detail:'A) Front Squat 4×6 · B) Power Clean 5×3 (explosive) · C) Seated Calf Raise 3×18 · Weak-station ladder: Wall Balls / Lunges(m) / Burpee BJ — 10-15-20-15-10 (rest = work)',
        notes:'The ladder teaches pacing — easy to blow up on the way up. Power cleans build the snap for wall balls. Log the totals.',
        soloNotes:'Training solo: lifts then the full ladder yourself.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Tue',session:{type:'compromised',workoutType:'complete',format:'5 Rounds',
        title:'Run + Station Brick',duration:'52 min',
        detail:'5 rounds: 800m run at 4:50/km → 20 Wall Balls + 20m Lunges · 90s rest',
        notes:'DOUBLES — race-pace effort on the runs, switch on the stations. Compromised running is the Hyrox-specific skill — this is where it starts to bite.',
        soloNotes:'Training solo: run then stations yourself, 5 rounds. Watch pace hold across the set.',
        stations:['wall_balls','s_lunges']}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest + mobility.',notes:''}},
      {day:'Thu',session:{type:'run',workoutType:'engine',format:'6 × 800m',
        title:'Speed — 800s',duration:'48 min',
        detail:'2km warm-up · 6 × 800m at 4:05–4:15/km · 90s jog recovery · 1.5km cooldown',
        notes:'Z4–Z5. Longer reps hold speed under fatigue. Split every rep.'}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'run',workoutType:'engine',format:'Progression 8km',
        title:'Progression Run 8km',duration:'48 min',
        detail:'8km starting at 5:35/km, dropping ~10s/km every 2km to finish at ~4:55/km',
        notes:'Negative-split discipline. Start too easy on purpose — the last 2km should be the only hard part.'}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 5km',duration:'32 min',
        detail:'5km easy Z2.',notes:'Recovery only.'}},
    ]},

  {
    week:3, phase:'aerobic', weekTheme:'GROW',
    title:'Threshold + Power',
    focus:'Mon hills · Tue deadlift+WB · Thu AMRAP · Sat 8km tempo · ~25km',
    days:[
      {day:'Mon',session:{type:'run',workoutType:'engine',format:'Hills 10 × 60s',
        title:'Speed — Hill Repeats',duration:'45 min',
        detail:'2km warm-up · 10 × 60s hard uphill (strong drive) · jog down recovery · 1.5km cooldown',
        notes:'Z5 strength-speed. Hills build power and protect the legs vs flat intervals. Drive the knees, tall posture.'}},
      {day:'Tue',session:{type:'strength',workoutType:'power',format:'Deadlift + Swing + WB EMOM',
        title:'Hinge Strength + Wall-Ball EMOM',duration:'60 min',
        detail:'A) Deadlift 4×5 · B) KB Swing 4×15 (explosive) · C) Single-leg Calf Raise 3×12/leg · Wall-ball EMOM: 10 min, 15 reps/min heavier ball · Finish: 30m Lunges',
        notes:'Deadlift heavy and crisp — stop when form breaks. Wall-ball EMOM under fatigue, full depth, elastic bounce.',
        soloNotes:'Training solo: all lifts + EMOM. Compare wall-ball feel to Week 1.',
        stations:['wall_balls','s_lunges']}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest + mobility.',notes:''}},
      {day:'Thu',session:{type:'compromised',workoutType:'complete',format:'AMRAP 20 min',
        title:'Station AMRAP',duration:'40 min',
        detail:'10 min warm-up · AMRAP 20 min: 200m run + 12 Wall Balls + 8 Burpee BJ + 15 KB Swings · count rounds + partial reps',
        notes:'DOUBLES — split reps, both run. Pace-management test: go out controlled or you blow up by minute 12. Record your round score.',
        soloNotes:'Training solo: all reps yourself. Find a rhythm you can finish each round cleanly.',
        stations:['wall_balls','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'run',workoutType:'engine',format:'Long Run 8km + Tempo',
        title:'Long Run 8km w/ Tempo',duration:'52 min',
        detail:'2km easy · 4km at 4:45–4:55/km (threshold, continuous) · 2km easy',
        notes:'First threshold block in the long run. The middle 4km: comfortably hard, controlled, not racing.'}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 6km',duration:'38 min',
        detail:'6km easy Z2.',notes:'Recovery pace.'}},
    ]},

  {
    week:4, phase:'build', weekTheme:'PACE',
    title:'Race Pace Begins',
    focus:'Mon brick · Tue split-squat+snatch · Thu 5×1km · Sat partner brick · ~26km',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'complete',format:'6 Rounds',
        title:'Sled + Run Brick',duration:'55 min',
        detail:'6 rounds: 400m run HARD → 25m Sled Push (or 10 Jump Squats) + 12 Wall Balls · 75s rest',
        notes:'DOUBLES — no walking the recovery run, drive straight off the sled. Compromised running when the legs are cooked is the whole game.',
        soloNotes:'Training solo: run + station yourself, 6 rounds. Explosive off the sled every time.',
        stations:['sled_push','wall_balls']}},
      {day:'Tue',session:{type:'strength',workoutType:'power',format:'Split Squat + Snatch',
        title:'Unilateral Legs + Snatch Power',duration:'62 min',
        detail:'A) Bulgarian Split Squat 4×8/leg · B) DB/KB Snatch 5×5/arm (explosive) · C) RDL 3×8 · Finish: 5 rounds of 25m Lunges + 12 Burpee BJ (75s rest)',
        notes:'Single-leg work fixes imbalances and bulletproofs the lunges. Snatches are explosive full-body power. Burpees — moderate jumps, step-up, steady tempo.',
        soloNotes:'Training solo: lifts then the weak-station rounds.',
        stations:['s_lunges','bbj']}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest + mobility.',notes:''}},
      {day:'Thu',session:{type:'run',workoutType:'engine',format:'5 × 1km',
        title:'Speed — 1km Repeats',duration:'52 min',
        detail:'2km warm-up · 5 × 1km at 4:15/km · 2 min recovery · 2km cooldown',
        notes:'Z4, just under race pace. Split every km — learn the effort you\'ll live at on race day.'}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'compromised',workoutType:'complete',format:'4 Rounds',
        title:'First Partner Brick',duration:'55 min',
        detail:'4 rounds: both run 1km at 4:40/km → 20 Wall Balls each + 20m Lunges each + 10 Burpee BJ each · 2 min rest',
        notes:'Race-order compromised running into your weak stations. DOUBLES: switch wall balls every 20–25 reps; split burpees evenly (40m each), faster partner sets a composed rhythm — each completes own reps. Practise sub-30s changeovers: every 30s saved is ~4 min off race day.',
        soloNotes:'Training solo: run then all reps yourself. Full doubles volume solo is deliberate overload — time every round.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 6km',duration:'38 min',
        detail:'6km easy Z2 flush.',notes:'Recover from the brick. Easy only.'}},
    ]},

  {
    week:5, phase:'build', weekTheme:'PUSH',
    title:'Strength-Endurance',
    focus:'Mon EMOM · Tue pyramid · Thu heavy squat+WB100 · Sat 8km surges · ~26km',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'complete',format:'EMOM 24 min',
        title:'Run/Station EMOM',duration:'48 min',
        detail:'10 min warm-up · EMOM 24 min — Min 1: 200m run · Min 2: 15 Wall Balls · Min 3: 12 Burpee BJ · repeat ×8 · rest in the remaining seconds',
        notes:'DOUBLES — split station reps, both run. Rest shrinks as fatigue builds — that\'s the point. Keep each 200m under a minute so the next station starts on time.',
        soloNotes:'Training solo: all reps yourself. Log how much rest is left in the final rounds.',
        stations:['wall_balls','bbj']}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'Pyramid',
        title:'Speed — Pyramid',duration:'52 min',
        detail:'2km warm-up · 400-800-1200-800-400m at 4:00–4:15/km · equal-time jog recovery · 1.5km cooldown',
        notes:'Z4–Z5. The 1200 in the middle is the grind. Even effort up and down the pyramid.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest + mobility.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'power',format:'Heavy Squat + Clean + WB EMOM',
        title:'Heavy Legs + Wall-Ball EMOM',duration:'66 min',
        detail:'A) Back Squat 5×5 (heavy) · B) Power Clean 5×3 · C) RDL 3×8 · D) Calf Raise 4×18 · Wall-ball EMOM: 10 min, 15 reps/min ball 1–2kg heavier than race · Finish: 4 rounds of 25m Lunges (unbroken) + 14 Burpee BJ',
        notes:'Heaviest squats yet. Wall-ball EMOM builds capacity — full depth, elastic bounce, breathe on the catch. DOUBLES: rehearse the split — 20–25 rep chunks, strongest takes 60–70 of the 100.',
        soloNotes:'Training solo: heavy lifts then the EMOM + finisher. Log every number.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'run',workoutType:'aerobic',format:'Long Run 8km + Surges',
        title:'Long Run 8km w/ Surges',duration:'52 min',
        detail:'8km Z2 with 6 × 1 min surges at 4:30/km scattered through · 5 min easy to finish',
        notes:'Trains the gear-change after a station — lift the pace then settle. Respond to feel, don\'t plan the surges.'}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 6km',duration:'38 min',
        detail:'6km easy Z2.',notes:'Recovery only.'}},
    ]},

  {
    week:6, phase:'build', weekTheme:'FORGE',
    title:'Power + Simulation',
    focus:'Mon deadlift+chipper · Tue rotation · Thu 400s+200s · Sat half sim 1-4 · ~26km',
    days:[
      {day:'Mon',session:{type:'strength',workoutType:'power',format:'Deadlift + Box Jump + Chipper',
        title:'Hinge Power + Station Chipper',duration:'64 min',
        detail:'A) Deadlift 5×3 (heavy) · B) Box Jump 5×4 (explosive) · C) Calf Raise 4×20 · Chipper for time: 50 Wall Balls → 40m Lunges → 30 Burpee BJ → 20 KB Swings',
        notes:'The chipper is one long grind — pace the wall balls so you don\'t stall on the burpees. Full depth on every wall ball. Record your chipper time.',
        soloNotes:'Training solo: lifts then the full chipper. This is a big single effort — pace it.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Tue',session:{type:'compromised',workoutType:'complete',format:'5 Rounds — Rotating',
        title:'Rotating Station Brick',duration:'55 min',
        detail:'5 rounds: 1km run at race pace → 1 rotating station (R1 Wall Balls 30 · R2 Lunges 40m · R3 Burpee BJ 20 · R4 Wall Balls 30 · R5 Lunges 40m) · 90s rest',
        notes:'DOUBLES — the station changes each round so nothing adapts. Run 1 sets the tone; don\'t go out too fast. Last two rounds are mental.',
        soloNotes:'Training solo: run + rotating station yourself, 5 rounds. Your biggest brick yet.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest + mobility.',notes:''}},
      {day:'Thu',session:{type:'run',workoutType:'engine',format:'8 × 400m + 4 × 200m',
        title:'Speed — Descending',duration:'52 min',
        detail:'2km warm-up · 8 × 400m at 3:55/km (75s rest) · 4 × 200m at 3:40/km (60s rest) · 1.5km cooldown',
        notes:'Z5. Finish faster than you start. The 200s sharpen leg speed when you\'re already tired.'}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'sim',workoutType:'complete',format:'Race Order',
        title:'Half-Race Sim (Stations 1–4)',duration:'~30 min',
        detail:'4 × 1km run at race pace alternating with: SkiErg 1000m · Sled Push 50m · Sled Pull 50m · Burpee BJ 80m',
        notes:'Full race conditions and loads on the first half. Burpees are your station — step-up, moderate jumps. Record every run split and practise sub-30s transitions.',
        soloNotes:'Training solo: run each leg at race pace, each station yourself. Execution and clean transitions.',
        stations:['skierg','sled_push','sled_pull','bbj']}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 6km',duration:'38 min',
        detail:'6km easy Z2 post-sim flush.',notes:'Easy only.'}},
    ]},

  {
    week:7, phase:'build', weekTheme:'CLIMB',
    title:'Peak Build',
    focus:'Mon broken km · Tue front-squat+snatch · Thu 7-round brick · Sat 9km · ~27km',
    days:[
      {day:'Mon',session:{type:'run',workoutType:'engine',format:'Broken 1km × 4',
        title:'Speed — Broken Kilometres',duration:'52 min',
        detail:'2km warm-up · 4 × (1000m as 400 hard / 15s / 400 hard / 15s / 200 sprint) · 2 min between sets · 1.5km cooldown',
        notes:'Z5. Broken kms let you hold faster-than-race pace with micro-breaks — teaches surging. Sprint the last 200 of each.'}},
      {day:'Tue',session:{type:'strength',workoutType:'power',format:'Front Squat + Snatch + For-Time',
        title:'Front Squat + Weak-Station For-Time',duration:'64 min',
        detail:'A) Front Squat 5×4 · B) DB Snatch 5×4/arm + Broad Jump 5×3 (explosive) · C) Calf Raise 4×20 · For time: 60 Wall Balls + 60m Lunges + 30 Burpee BJ',
        notes:'Front squats hammer the upright torso you need for wall balls. Then a for-time weak-station blast — go hard but hold form. Log the time to beat later.',
        soloNotes:'Training solo: lifts then the for-time piece. Record your time.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest + mobility.',notes:''}},
      {day:'Thu',session:{type:'compromised',workoutType:'complete',format:'7 Rounds',
        title:'Long Compromised Brick',duration:'62 min',
        detail:'7 rounds: 700m run at 4:45/km → 18 KB Swings + 14 Push-ups + 10 Deadlifts + 12 Headcutters · 60s rest',
        notes:'DOUBLES — seven rounds, big engine volume. Consistency across all seven runs is the win. Negative-split it if you\'ve got the nerve.',
        soloNotes:'Training solo: 7 rounds. Pace to survive the back half.'}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'run',workoutType:'aerobic',format:'Long Run 9km',
        title:'Long Run 9km',duration:'58 min',
        detail:'9km at 5:10–5:30/km Z2 · 6 × 20s strides to finish',
        notes:'Longest run of the plan. Pure aerobic base — the tank you draw from on race day. Relaxed and patient.'}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 6km',duration:'38 min',
        detail:'6km easy Z2.',notes:'Recovery only.'}},
    ]},

  {
    week:8, phase:'peak', weekTheme:'GRIND',
    title:'Peak Volume',
    focus:'Mon 45-min grind · Tue 800s+100 WB · Thu Red Bull 100 · Sat half sim 5-8 · ~28km',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'complete',format:'AMRAP 45 min',
        title:'45-min Continuous Grind',duration:'55 min',
        detail:'10 min warm-up · AMRAP 45 min, rotate continuously: 800m run → 20 Wall Balls → 15 KB Swings → 20m Lunges → 12 Burpee BJ → 10 Deadlifts → repeat',
        notes:'DOUBLES — split station reps, run together. Hardest engine session in the plan. The cliff hits around minute 30 — push through together; the fatigue is the point.',
        soloNotes:'Training solo: full rotation continuously for 45 min. Adjust rest, never stop moving.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'6 × 800m + 100 WB',
        title:'Speed + Wall Balls Under Fatigue',duration:'56 min',
        detail:'2km warm-up · 6 × 800m at 4:05–4:10/km · 90s recovery · then 100 Wall Balls for time (race weight) · 1km cooldown',
        notes:'Z4. Race-pace 800s, then 100 wall balls on trashed legs — the single best way to train wall balls under race fatigue. Hold every split, then grind unbroken if you can.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest. 8+ hrs sleep.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'power',format:'Peak Legs + Red Bull 100',
        title:'Peak Legs + 100 Wall Balls',duration:'66 min',
        detail:'A) Back Squat 4×5 (peak load) · B) Power Clean 5×3 + Box Jump 5×5 · C) Calf Raise 4×20 · Wall-ball EMOM: 12 min, 15–18 reps/min heavier ball · Then: 100 Wall Balls for time (unbroken target) → 50m Lunges → 20 Burpee BJ',
        notes:'Peak weak-station volume and the "Red Bull 100" test — 100 unbroken wall balls after fatigue is the exact skill you need at station 8. DOUBLES: rehearse your split — 20–25 rep chunks, strongest takes 60–70. If they\'re unbroken here, they\'re unbroken on race day.',
        soloNotes:'Training solo: peak lifts then the EMOM + 100 wall balls. This is your benchmark session.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'sim',workoutType:'complete',format:'Race Order',
        title:'Half-Race Sim (Stations 5–8)',duration:'~32 min',
        detail:'4 × 1km run at race pace alternating with: Row 1000m · Farmers Carry 200m · Sandbag Lunges 100m · Wall Balls 100 reps',
        notes:'Back half of the race, full loads — the exact late-race fatigue. Wall balls: full depth, bounce out, 20–25 rep chunks switching fast (strongest 60–70). Lunges: unbroken from rep one. Practise sub-30s transitions.',
        soloNotes:'Training solo: run each leg at race pace, all reps yourself. Hold run pace after the farmers.',
        stations:['row','farmers','s_lunges','wall_balls']}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 6km',duration:'38 min',
        detail:'6km easy Z2 flush after peak week.',notes:'Easy only. Big week done.'}},
    ]},

  {
    week:9, phase:'peak', weekTheme:'SHARPEN',
    title:'Race Specific',
    focus:'Mon race-pace brick · Tue 400s · Thu speed-strength · Sat 6-station sim · ~26km',
    days:[
      {day:'Mon',session:{type:'compromised',workoutType:'complete',format:'5 Rounds',
        title:'Race-Pace Brick',duration:'55 min',
        detail:'5 rounds: both run 1km at 4:35/km (race pace) → 25 Wall Balls each + 20m Lunges each + 12 Burpee BJ each · 90s rest',
        notes:'DOUBLES — race pace on every run, race stations off tired legs. Half race load. Seamless changeovers, hold pace to the end.',
        soloNotes:'Training solo: run at race pace then all reps, 5 rounds. Your hardest brick — trust the rest.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'10 × 400m',
        title:'Speed — Sharpening 400s',duration:'50 min',
        detail:'2km warm-up · 10 × 400m at 3:50/km · 75s recovery · 1.5km cooldown',
        notes:'Z5. Fast and sharp as the taper nears. Crisp turnover, full recovery on the jogs.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'power',format:'Speed-Strength + Crisp Stations',
        title:'Speed-Strength + Weak Stations',duration:'52 min',
        detail:'A) Back Squat 4×4 (fast, explosive intent) · B) Box Jump 4×4 + Power Clean 4×2 · C) Calf Raise 3×15 · Finish: 4 rounds of 25 Wall Balls + 20m Lunges + 12 Burpee BJ (75s rest)',
        notes:'Volume down, speed up. Move the bar fast. Keep the weak-station block crisp — quality over quantity now.',
        soloNotes:'Training solo: explosive lifts then 4 crisp rounds.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest. High-carb day.',notes:''}},
      {day:'Sat',session:{type:'sim',workoutType:'complete',format:'6-Station Sim',
        title:'6-Station Race Sim',duration:'~45 min',
        detail:'3 rounds for time: 1km run at race pace → SkiErg 500m + 25 Wall Balls + 100m Lunges + 12 Burpee BJ · full race loads',
        notes:'Compare run splits round to round — hold pace on round 3. Dress rehearsal for your weak stations under fatigue. Rehearse doubles splits and sub-30s changeovers all day.',
        soloNotes:'Training solo: all 3 rounds yourself at race loads. Track total time and run splits.',
        stations:['skierg','wall_balls','s_lunges','bbj']}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 6km',duration:'38 min',
        detail:'6km easy Z2.',notes:'Recovery only. Big sim week next.'}},
    ]},

  {
    week:10, phase:'peak', weekTheme:'SIMULATE',
    title:'Full Race Simulation',
    focus:'Mon neural primer · Tue race-pace primer · Thu 800s · Sat FULL SIM · ~24km',
    days:[
      {day:'Mon',session:{type:'strength',workoutType:'power',format:'Neural Primer',
        title:'Neural Primer + Weak Stations',duration:'40 min',
        detail:'A) Back Squat 3×3 (fast) · B) Box Jump 3×3 · Finish: 3 rounds of 20 Wall Balls + 20m Lunges + 10 Burpee BJ (fast, 90s rest)',
        notes:'Short and snappy — wake the nervous system without fatigue. Legs spring-loaded for the weekend. In and out.',
        soloNotes:'Training solo: quick explosive lifts + 3 crisp rounds. Do not chase fatigue.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Tue',session:{type:'compromised',workoutType:'complete',format:'4 Rounds',
        title:'Race-Pace Primer',duration:'48 min',
        detail:'4 rounds: both run 1km at 4:35/km → 20 Wall Balls each + 20m Lunges each + 10 Burpee BJ each · 2 min rest',
        notes:'DOUBLES — sharp and race-paced, not exhausting. Leave feeling fast. Priming for Saturday\'s full sim.',
        soloNotes:'Training solo: 4 rounds at race pace. Quality primer — don\'t overcook it.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest. Save it for Saturday.',notes:''}},
      {day:'Thu',session:{type:'run',workoutType:'engine',format:'5 × 800m',
        title:'Speed — Race Pace 800s',duration:'50 min',
        detail:'2km warm-up · 5 × 800m at 4:05/km · 90s recovery · 1.5km cooldown',
        notes:'Z4. Stay sharp — controlled, fresher legs now the volume has dropped.'}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest. High-carb day.',notes:''}},
      {day:'Sat',session:{type:'sim',workoutType:'complete',format:'Full Race',
        title:'FULL RACE SIMULATION',duration:'Target = goal time',
        detail:'All 8 stations, all 8 runs, race order, race loads, race pace. Time every segment.',
        notes:'Dress rehearsal. Full race protocol — nutrition, warm-up, kit. If possible do it at a Hyrox gym on the real machines. Time every RoxZone transition — target under 7 min total (elite <5). Every 30s saved is ~4 min off your finish. This tells you exactly where you stand.',
        soloNotes:'Training solo: run all 8 legs and all 8 stations at race loads. Your time will exceed the doubles target — focus on race-pace running and clean execution.',
        stations:['skierg','sled_push','sled_pull','bbj','row','farmers','s_lunges','wall_balls']}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Easy Flush 5km',duration:'32 min',
        detail:'5km very easy Z1–Z2. Legs recovery.',notes:'Flush the sim out. Very easy.'}},
    ]},

  {
    week:11, phase:'peak', weekTheme:'PRIME',
    title:'Taper I',
    focus:'Mon 4×400 · Tue light primer · Thu short brick · Sat 7km strides · ~18km',
    days:[
      {day:'Mon',session:{type:'run',workoutType:'engine',format:'4 × 400m',
        title:'Speed — Sharp 400s',duration:'38 min',
        detail:'2km warm-up · 4 × 400m at 3:50/km · 90s recovery · 1.5km cooldown',
        notes:'Z5. Just enough to stay sharp. Fast and clean — no grinding.'}},
      {day:'Tue',session:{type:'strength',workoutType:'power',format:'Light Primer',
        title:'Light Primer + Weak Stations',duration:'35 min',
        detail:'A) Back Squat 3×3 (light, fast) · B) Box Jump 3×3 · Finish: 2 rounds of 20 Wall Balls + 20m Lunges + 10 Burpee BJ',
        notes:'Neural touch only — stop 3 reps short on everything. Keep the movement patterns sharp for race week.',
        soloNotes:'Training solo: quick primer + 2 easy rounds. In and out.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Thu',session:{type:'compromised',workoutType:'complete',format:'3 Rounds',
        title:'Short Sharp Brick',duration:'40 min',
        detail:'3 rounds: 1km run at race pace → 20 Wall Balls each + 15m Lunges each + 10 Burpee BJ each · 2 min rest',
        notes:'DOUBLES — race-ready feel, short enough to leave you fresh. Snappy stations, hold race pace on the runs.',
        soloNotes:'Training solo: 3 rounds at race pace. Leave feeling strong, not depleted.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Sat',session:{type:'run',workoutType:'aerobic',format:'Easy 7km',
        title:'Easy 7km + Strides',duration:'42 min',
        detail:'7km easy Z2 with 4 × 20s strides.',notes:'Last longer run before the race. Easy — the fitness is banked, protect it.'}},
      {day:'Sun',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Recovery 5km',duration:'32 min',
        detail:'5km very easy Z2.',notes:'Easy legs into race week.'}},
    ]},

  {
    week:12, phase:'peak', weekTheme:'RACE',
    title:'Taper II + Race',
    focus:'Mon easy · Tue activation · Thu preview · Sun RACE DAY',
    days:[
      {day:'Mon',session:{type:'run',workoutType:'aerobic',format:'Easy',
        title:'Easy Run 5km',duration:'32 min',
        detail:'5km very easy Z2. Just keep the legs ticking over.',notes:'Nothing hard this week. Let the legs freshen.'}},
      {day:'Tue',session:{type:'run',workoutType:'engine',format:'6 × 1 min pickups',
        title:'Aerobic Activation',duration:'35 min',
        detail:'30 min easy run · 6 × 1 min pickups at race pace · 2 min easy between each',
        notes:'Not a workout — preparation. The pickups keep race-pace rhythm in the legs; the easy run keeps everything loose.'}},
      {day:'Wed',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest.',notes:''}},
      {day:'Thu',session:{type:'strength',workoutType:'complete',format:'5 Stations × 40%',
        title:'Race Preview',duration:'20 min',
        detail:'Choose 5 stations in race order · 40% race reps at race pace · both partners · in and out',
        notes:'Feel sharp, not worked. Include wall balls, lunges and burpees so the patterns are fresh. You should leave feeling fast.',
        soloNotes:'Training solo: 5 stations at 40% reps, race pace. Prime the weak stations.',
        stations:['wall_balls','s_lunges','bbj']}},
      {day:'Fri',session:{type:'rest',title:'Rest',duration:'',detail:'Full rest. Carb load. Early night.',notes:''}},
      {day:'Sat',session:{type:'rest',title:'Race Day Eve',duration:'',detail:'Gear check. Nutrition sorted. Light 15 min walk only.',notes:''}},
      {day:'Sun',session:{type:'race' as SessionType,workoutType:'complete',format:'Target = goal time',
        title:'RACE DAY',duration:'',
        detail:'Warm up 15 min. Start controlled — do not go out at max on run 1. Trust the plan.',
        notes:'You have done the work. Wall balls unbroken. Lunges smooth. Burpees relentless. Row even splits, attack the sled pull. Sub-30s transitions. Run 8 is your sprint. Bring it home.'}},
    ]},
]
