// Quirky, session-specific motivation lines — keyed by `w${week}_d${dayIndex}`.
// dayIndex matches the position in week.days[] (0 = Mon, 1 = Tue, 3 = Thu, 5 = Sat, 6 = Sun).
// Rest days (d2 Wed, d4 Fri) are intentionally left without lines.

export const SESSION_MOTIVATION: Record<string, string> = {

  // ─── WEEK 1 — BASE ────────────────────────────────────────────────────────
  'w1_d0': 'Round one of the engine that wins races. Run tired, lift tired, learn what compromised feels like — today it\'s a lesson, in twelve weeks it\'s a weapon.',
  'w1_d1': 'One speed day a week, and this is it. Eight 400s, hit the pace or take more rest — never grind slow reps. Fast legs are built here.',
  'w1_d3': 'Wall balls, lunges, burpees — the three that beat you in JHB. Starting today they get trained twice a week until they\'re your strong suit.',
  'w1_d5': '8km, fully conversational. Boring is fast — every easy kilometre makes the stations cheaper. Bank the base.',
  'w1_d6': 'Easy means easy. This run exists to help you recover, not to prove anything. Legs light, HR low.',

  // ─── WEEK 2 — BUILD ───────────────────────────────────────────────────────
  'w2_d0': 'Five rounds now. The circuit should feel like a race station — heart rate pinned, legs full, then run anyway. That\'s the whole game.',
  'w2_d1': '800s today — speed you can actually hold. Split every rep, both of you together. Watch the last two: hold the line.',
  'w2_d3': 'Power cleans build the snap that fires a wall ball. Four rounds of your weak trio after — one more than last week. Log the burpee time.',
  'w2_d5': '8km again, a touch quicker on feel. If you can\'t talk, you\'re going too hard. Stay in Zone 2.',
  'w2_d6': 'Recovery only. The adaptations from this week land while you jog easy and sleep well.',

  // ─── WEEK 3 — GROW ────────────────────────────────────────────────────────
  'w3_d0': '800m runs inside the circuit now — this is where compromised running bites. Hold your deadlift form when the lungs are screaming.',
  'w3_d1': 'Ten 400s, less rest. Pure top-end speed. Protect the pace — this is the fastest you\'ll run all week.',
  'w3_d3': 'Snatches for explosive power, then 25 wall balls a round. Your weakest station is becoming a number you\'re proud of.',
  'w3_d5': 'First threshold inside the long run. The middle 4km: comfortably hard, controlled, not racing. Learn the edge.',
  'w3_d6': 'Six easy kilometres. Nothing heroic. Let the legs soak up three weeks of work.',

  // ─── WEEK 4 — PACE ────────────────────────────────────────────────────────
  'w4_d0': 'Six rounds, 75s rest. The engine session. The circuit keeps your heart rate redlined while you run — exactly the race feeling, on purpose.',
  'w4_d1': '800s at race pace. Memorise this effort. On race day you\'ll live right here — make it feel like home.',
  'w4_d3': 'Five rounds of your weak stations. You get good at what you train most — that\'s not a slogan, it\'s a promise. Log the numbers.',
  'w4_d5': 'First full partner brick. Run into your weak stations, seamless changeovers, no dead time at the swap. This is the race in miniature.',
  'w4_d6': 'Flush the brick out. Easy legs, easy mind. Recovery is training too.',

  // ─── WEEK 5 — PUSH ────────────────────────────────────────────────────────
  'w5_d0': 'Six rounds, 800m runs. Big compromised engine day. When the heart rate maxes, the deadlifts still have to look clean. Discipline under fatigue.',
  'w5_d1': '1km repeats just under race pace. Longer reps, same focus — split every kilometre and hold it, both of you.',
  'w5_d3': 'Heaviest squats yet. Strong legs power the sled and the lunges. Then 28 wall balls a round — chase unbroken.',
  'w5_d5': 'Long run with surges. Practice the gear-change after a station — lift the pace, then settle. Respond to feel.',
  'w5_d6': 'Recovery pace only. You\'re past halfway now. Trust the easy days.',

  // ─── WEEK 6 — FORGE ───────────────────────────────────────────────────────
  'w6_d0': 'Rest drops to 60 seconds. If the runs slow, that\'s the exact fatigue you\'re training to beat. Embrace the grind.',
  'w6_d1': 'Mixed intervals — finish faster than you start. The 200s at the end sharpen your legs when they\'re already cooked.',
  'w6_d3': 'Explosive block front and centre — box jumps and snatches. Then 30 wall balls a round. Your weakness is turning into a weapon.',
  'w6_d5': 'Half-race sim, first four stations, full loads. Burpees are your station here — attack them. Record every run split.',
  'w6_d6': 'Post-sim flush. Easy only. Let the body absorb the specificity.',

  // ─── WEEK 7 — CLIMB ───────────────────────────────────────────────────────
  'w7_d0': 'Seven rounds. Huge engine volume. Consistency across all seven runs is the win — negative-split it if you\'ve got the nerve.',
  'w7_d1': '800s slightly faster than race pace. Hold form on the last two — that\'s where the race is decided.',
  'w7_d3': 'Six rounds of your weak trio — your highest volume yet. This is the session that turns wall balls, lunges and burpees into a strength.',
  'w7_d5': '9km, longest run of the plan. The tank you draw from on race day. Relaxed, conversational, patient.',
  'w7_d6': 'Recovery only. Big week banked. Sleep is the secret weapon.',

  // ─── WEEK 8 — GRIND ───────────────────────────────────────────────────────
  'w8_d0': '45 minutes of continuous grind — the hardest engine session in the plan. The cliff hits around minute 30. Push through it together; the fatigue is the point.',
  'w8_d1': 'Six race-pace 800s off tired legs. The landmark speed session. Hold every split — no drifting after rep four.',
  'w8_d3': 'Peak weak-station volume — 33 wall balls a round. If they\'re unbroken here, they\'re unbroken on race day. Prove it.',
  'w8_d5': 'Back half of the race, full loads. This is the exact fatigue you\'ll feel late in Cape Town. Wall balls unbroken, farmers unbroken.',
  'w8_d6': 'Easy flush. The hardest week is done. Be proud, then recover hard.',

  // ─── WEEK 9 — SHARPEN ─────────────────────────────────────────────────────
  'w9_d0': 'Race pace on every run, race stations off tired legs. Five rounds is half the race. Seamless changeovers — hold pace to the last rep.',
  'w9_d1': 'Sharpening 400s at 3:50. Crisp turnover, full recovery. The volume is dropping — let the speed come out.',
  'w9_d3': 'Volume down, speed up. Move the bar fast, keep the weak-station block crisp. Quality over quantity from here.',
  'w9_d5': 'Six-station sim. Compare your run splits round to round and hold pace on round three. Dress rehearsal for the weak stations.',
  'w9_d6': 'Recovery only. The big simulation is next week — save something for it.',

  // ─── WEEK 10 — SIMULATE ───────────────────────────────────────────────────
  'w10_d0': 'Sharp and race-paced, not exhausting. Leave feeling fast. You\'re priming for Saturday\'s full sim, not emptying the tank.',
  'w10_d1': 'Race-pace 800s, fresher legs. Should feel controlled now. The fitness is banked — this just keeps it awake.',
  'w10_d3': 'Neural primer. Short, snappy, spring-loaded. Wake the nervous system without a drop of unnecessary fatigue.',
  'w10_d5': 'Full race simulation. Race protocol, race loads, race pace, time every segment. This tells you exactly where you stand — 1:02 is in here somewhere.',
  'w10_d6': 'Very easy flush. Let the sim settle into fitness. Legs up tonight.',

  // ─── WEEK 11 — PRIME ──────────────────────────────────────────────────────
  'w11_d0': 'Short sharp brick — race-ready feel, fresh legs. Snappy stations, race pace on the runs. Leave strong, not depleted.',
  'w11_d1': 'Four fast 400s. Just enough to stay sharp. Fast and clean, no grinding. The taper is working.',
  'w11_d3': 'Neural touch only — stop three reps short of everything. Keep the patterns sharp for race week.',
  'w11_d5': 'Last longer run before the race. Easy with strides. The fitness is banked — do not chase it now, protect it.',
  'w11_d6': 'Easy legs into race week. Everything from here is about arriving fresh.',

  // ─── WEEK 12 — RACE ───────────────────────────────────────────────────────
  'w12_d0': 'Nothing hard this week. Let the legs freshen and the mind settle. The work is done.',
  'w12_d1': 'Not a workout — preparation. The pickups keep race-pace rhythm in the legs. Loose, easy, ready.',
  'w12_d3': 'Race preview — sharp, not worked. Prime the wall balls, lunges and burpees so the patterns are fresh. Leave feeling fast.',
  'w12_d6': 'JHB 2026 was 1:08:46. Twelve weeks of graft point at 1:02. Wall balls unbroken, lunges smooth, burpees relentless, run 8 is your sprint. Bring it home.',
}
