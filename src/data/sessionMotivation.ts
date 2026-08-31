// Quirky, session-specific motivation lines — keyed by `w${week}_d${dayIndex}`.
// dayIndex matches the position in week.days[] (0 = Mon, 1 = Tue, 3 = Thu, 5 = Sat, 6 = Sun).
// Rest days (d2 Wed, d4 Fri) are intentionally left without lines.

export const SESSION_MOTIVATION: Record<string, string> = {

  // ─── WEEK 1 — BASE ────────────────────────────────────────────────────────
  'w1_d0': 'Round one of the engine that wins races. Run tired, lift tired, learn what compromised feels like — a lesson today, a weapon in twelve weeks.',
  'w1_d1': 'One speed day a week and this is it. Eight 400s — hit the pace or take more rest, never grind slow reps.',
  'w1_d3': 'Your first wall-ball EMOM. Full depth, bounce out of the hole, never catch straight-armed. Starting today the wall balls become your strength.',
  'w1_d5': '8km, fully conversational. Boring is fast — every easy kilometre makes the stations cheaper.',
  'w1_d6': 'Easy means easy. This run helps you recover, not prove anything. Legs light, HR low.',

  // ─── WEEK 2 — BUILD ───────────────────────────────────────────────────────
  'w2_d0': 'Front squats and cleans build the upright, snappy legs a wall ball loves. The ladder teaches pacing — don\'t blow up on the way up.',
  'w2_d1': 'Compromised running starts here — 800m at race effort then straight into the stations. This exact feeling is race day.',
  'w2_d3': '800s today. Longer reps, same job — split every one and hold the line on the last two.',
  'w2_d5': 'Progression run: start too easy on purpose, finish the last 2km fast. Negative-split discipline.',
  'w2_d6': 'Recovery only. The week lands as fitness while you jog easy and sleep well.',

  // ─── WEEK 3 — GROW ────────────────────────────────────────────────────────
  'w3_d0': 'Hills — strength-speed that builds power and protects the legs. Drive the knees, tall and proud.',
  'w3_d1': 'Deadlifts heavy, then a wall-ball EMOM on tired legs. This is how you make 100 wall balls feel routine.',
  'w3_d3': 'AMRAP — a pace-management test. Go out controlled or you\'ll blow up by minute 12. Log your round score.',
  'w3_d5': 'First tempo block inside the long run. The middle 4km: comfortably hard, controlled, not racing.',
  'w3_d6': 'Six easy kilometres. Let three weeks of work soak in.',

  // ─── WEEK 4 — PACE ────────────────────────────────────────────────────────
  'w4_d0': 'Sled brick — drive off the sled straight into a hard run, no walking. Compromised running on cooked legs is the whole game.',
  'w4_d1': 'Single-leg work bulletproofs your lunges; snatches add explosive power. Fix the imbalances now.',
  'w4_d3': '1km repeats just under race pace. Memorise this effort — you\'ll live here on race day.',
  'w4_d5': 'First full partner brick. Switch wall balls every 20–25 reps, even burpee split, sub-30s changeovers. The race in miniature.',
  'w4_d6': 'Flush the brick out. Easy legs, easy mind.',

  // ─── WEEK 5 — PUSH ────────────────────────────────────────────────────────
  'w5_d0': 'Run/station EMOM — the rest shrinks as you tire, and that\'s the point. Keep every 200m under a minute.',
  'w5_d1': 'Pyramid day. The 1200 in the middle is the grind. Even effort up and down.',
  'w5_d3': 'Heaviest squats yet, then the wall-ball EMOM with a heavier ball. Rehearse your doubles split — strongest takes 60–70.',
  'w5_d5': 'Long run with surges — practise the gear-change after a station. Respond to feel.',
  'w5_d6': 'Recovery pace only. Past halfway — trust the easy days.',

  // ─── WEEK 6 — FORGE ───────────────────────────────────────────────────────
  'w6_d0': 'Heavy deadlifts, then a chipper — one long grind. Pace the wall balls so you don\'t stall on the burpees.',
  'w6_d1': 'Rotating brick — the station changes each round so nothing adapts. Run 1 sets the tone; the last two rounds are mental.',
  'w6_d3': 'Descending intervals — finish faster than you start. The 200s sharpen tired legs.',
  'w6_d5': 'Half-race sim, first four stations, full loads. Burpees are your station — step-up, moderate jumps. Practise sub-30s transitions.',
  'w6_d6': 'Post-sim flush. Easy only.',

  // ─── WEEK 7 — CLIMB ───────────────────────────────────────────────────────
  'w7_d0': 'Broken kilometres — faster-than-race pace with micro-breaks. Teaches surging. Sprint the last 200 every time.',
  'w7_d1': 'Front squats for the upright torso, then a for-time weak-station blast. Set the time to beat later.',
  'w7_d3': 'Seven-round brick. Huge engine volume — consistency across all seven runs is the win.',
  'w7_d5': '9km, the longest run of the plan. The tank you draw from on race day. Relaxed and patient.',
  'w7_d6': 'Recovery only. Big week banked — sleep is the secret weapon.',

  // ─── WEEK 8 — GRIND ───────────────────────────────────────────────────────
  'w8_d0': '45 minutes of continuous grind — the hardest engine session in the plan. The cliff hits at minute 30; push through it together.',
  'w8_d1': 'Race-pace 800s, then 100 wall balls on trashed legs — the best way to train wall balls under race fatigue. Grind them unbroken.',
  'w8_d3': 'The Red Bull 100 — 100 unbroken wall balls after a peak leg session. This is the exact skill you need at station 8. Prove it.',
  'w8_d5': 'Back half of the race, full loads — the exact late-race fatigue. Wall balls unbroken, lunges unbroken, sub-30s transitions.',
  'w8_d6': 'Easy flush. The hardest week is done. Be proud, then recover hard.',

  // ─── WEEK 9 — SHARPEN ─────────────────────────────────────────────────────
  'w9_d0': 'Race pace on every run, race stations off tired legs. Half the race — seamless changeovers, hold pace to the last rep.',
  'w9_d1': 'Sharpening 400s at 3:50. Crisp turnover, full recovery. The volume is dropping — let the speed out.',
  'w9_d3': 'Speed-strength — move the bar fast, keep the stations crisp. Quality over quantity from here.',
  'w9_d5': 'Six-station sim. Hold pace on round 3. Rehearse the doubles splits and sub-30s changeovers all day.',
  'w9_d6': 'Recovery only. The big simulation is next week — save something for it.',

  // ─── WEEK 10 — SIMULATE ───────────────────────────────────────────────────
  'w10_d0': 'Neural primer — short, snappy, spring-loaded. Wake the nervous system without a drop of unnecessary fatigue.',
  'w10_d1': 'Race-pace primer. Sharp, not exhausting. Leave feeling fast — Saturday is the full sim.',
  'w10_d3': 'Race-pace 800s, fresher legs. Controlled. The fitness is banked; this keeps it awake.',
  'w10_d5': 'Full race simulation. Race protocol, race loads, time every transition. This tells you exactly where you stand — {target} is in here.',
  'w10_d6': 'Very easy flush. Let the sim settle into fitness. Legs up tonight.',

  // ─── WEEK 11 — PRIME ──────────────────────────────────────────────────────
  'w11_d0': 'Four fast 400s. Just enough to stay sharp — fast and clean, no grinding. The taper is working.',
  'w11_d1': 'Light primer — stop three reps short of everything. Keep the patterns sharp for race week.',
  'w11_d3': 'Short sharp brick — race-ready feel, fresh legs. Snappy stations, race pace on the runs. Leave strong.',
  'w11_d5': 'Last longer run before the race. Easy with strides. The fitness is banked — protect it, don\'t chase it.',
  'w11_d6': 'Easy legs into race week. Everything now is about arriving fresh.',

  // ─── WEEK 12 — RACE ───────────────────────────────────────────────────────
  'w12_d0': 'Nothing hard this week. Let the legs freshen and the mind settle. The work is done.',
  'w12_d1': 'Not a workout — preparation. The pickups keep race-pace rhythm in the legs. Loose, easy, ready.',
  'w12_d3': 'Race preview — sharp, not worked. Prime the wall balls, lunges and burpees. Leave feeling fast.',
  'w12_d6': '{lastRace} was {lastFinish}. Twelve weeks point at {target}. Wall balls unbroken, lunges smooth, burpees relentless, sub-30s transitions, run 8 is your sprint. Bring it home.',
}
