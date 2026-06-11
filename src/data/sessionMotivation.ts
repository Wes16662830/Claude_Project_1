// Quirky, session-specific motivation lines — keyed by `w${week}_d${dayIndex}` or `w${week}_gym`.
// dayIndex matches the position in week.days[] (0 = Mon, 1 = Tue, etc.)

export const SESSION_MOTIVATION: Record<string, string> = {

  // ─── WEEK 1 — BASE ────────────────────────────────────────────────────────
  'w1_d0': 'The top SA 35–39 teams started exactly here. Count your rounds carefully — you\'ll repeat this in Week 5 and that number will feel embarrassing.',
  'w1_d1': 'Boring is fast. Every minute in Zone 2 is a minute the wall balls get cheaper. Go slower than you think you need to.',
  'w1_d2': 'Rest is not optional — it\'s where the adaptations land. Foam roll and let Week 1 become fitness.',
  'w1_d3': 'Fartlek is Swedish for "speed play." Play. You have 8 gear-changes in the race — today you practice finding them without being told when.',
  'w1_d4': 'Full rest. You\'re 35-39, not 22. Sleep and eat something green.',
  'w1_d5': '20 seconds of effort, 10 seconds of "this is fine." Eight rounds per station. The sled Tabata is where your sled pull PB starts being built — today is layer one.',
  'w1_d6': '60 minutes of nothing heroic — which is exactly what turns fit people into durable ones. Do not speed up.',
  'w1_gym': 'Bench, row, press, pull. Upper body work buys you unbroken wall balls and a ski erg that doesn\'t hurt. Keep the 3-second eccentric — that\'s where the hypertrophy lives.',

  // ─── WEEK 2 — BUILD ───────────────────────────────────────────────────────
  'w2_d0': 'The row pyramid is where the 1:02 lives. Top SA teams pull ~1:58/500m on the row — today is step one toward that. Even effort across every level.',
  'w2_d1': 'Faster than race pace. Every 800m interval is a deposit into the "race feels like cruise control" account. It pays out in Cape Town.',
  'w2_d2': 'The aerobic gains happen during recovery, not the session. Honour it.',
  'w2_d3': 'The odd/even structure forces running while your legs are still pumping from the station. This is exactly what race day feels like — today you face it on purpose. Watch the 400m splits drift. That drift is the training.',
  'w2_d4': 'Full rest. The benchmark session tomorrow needs fresh legs.',
  'w2_d5': 'This number is your starting point. Write it down. Every week in this plan is aimed at making it irrelevant by April.',
  'w2_d6': '70 minutes in Zone 2. The long run doesn\'t care how fit you think you are. It just builds the engine that carries you across 8km in race conditions.',
  'w2_gym': 'Squat and hinge. Every kilogram of leg strength is torque on the sled push and staying power on the lunges. Slow eccentric — the growth stimulus is going down, not up.',

  // ─── WEEK 3 — BASE ────────────────────────────────────────────────────────
  'w3_d0': 'The chipper teaches patience in the best possible way — ignore it and the wall balls bite you on rep 60. Split your reps 40-40 on the wall balls, not 80 and pray.',
  'w3_d1': '5 × 1km. This is your race distance, once. By Week 7 you\'ll be doing eight. Today is five. Focus on even splits.',
  'w3_d2': 'Full rest. Your legs are still processing the chipper.',
  'w3_d3': '25 minutes continuous at threshold — not easy, not sprinting. The exact zone the podium teams at Cape Town run the whole race in. Do not break the block.',
  'w3_d4': 'Rest. Tomorrow\'s pyramid has two sides and you want to be awake for the descent.',
  'w3_d5': 'The descent feels like relief. Run it at the same pace as the ascent. That discipline is how you bank time in a real race.',
  'w3_d6': '75 minutes. Building duration before Phase 2 turns up the heat. Slow down and mean it.',
  'w3_gym': 'Add 2.5–5kg to Week 1 weights if technique was clean. The eccentric is the stimulus — chase it. Pull-ups should be hard by rep 6.',

  // ─── WEEK 4 — GROW ────────────────────────────────────────────────────────
  'w4_d0': 'Slow grind into explosive work, then immediate sprint. This is literally the race compressed into an EMOM. Watch your 200m splits — the ones that hold are the ones that win in Cape Town.',
  'w4_d1': 'VO2 Max — the sessions that make race pace feel like conversation pace in six weeks. 8 × 400m. Sharp and honest. Fall off pace? Extend rest. Don\'t sacrifice pace for volume.',
  'w4_d2': 'Rest. VO2 sessions need 48 hours to become fitness. Don\'t rush it.',
  'w4_d3': 'Your first real partner brick. The sled handover costs zero seconds if you rehearse it. Every smooth changeover today is time saved in front of 5,000 people in Cape Town.',
  'w4_d4': 'Rest. First brick is in the books.',
  'w4_d5': '70% load. Your body says "I could go harder." File that feeling away. Cape Town is when you cash it in.',
  'w4_d6': 'Last long Zone 2 before intensity picks up. Take it easy and appreciate it — these sessions become fewer from Week 5.',
  'w4_gym': 'Hip thrusts are sled push power. Go heavy on these. Progress from Week 2 on squats if form was clean. Do this Wednesday — not Thursday (brick day).',

  // ─── WEEK 5 — PACE ────────────────────────────────────────────────────────
  'w5_d0': 'Week 1\'s AMRAP was a baseline. This one is a statement. You\'ve had four weeks of training behind it — aim for at least one full round more. Pace the wall balls early or they\'ll pace you.',
  'w5_d1': '4:32/km. That number. Every rep today makes it feel less terrifying and more like your default pace.',
  'w5_d2': 'Sleep. Your legs ran race pace yesterday and have two bricks this week.',
  'w5_d3': 'Row into sled pull — your two biggest station deficits, back to back. Top SA 35-39 teams cut 40+ seconds here versus where you were at JHB. Today you start that conversation.',
  'w5_d4': 'Rest. The Pace Ladder tomorrow earns it.',
  'w5_d5': 'Each round faster with more fatigue. Round 4 is what Cape Town actually feels like. The top SA teams call this the "race rehearsal round." Don\'t skip it — this is where the PB is decided.',
  'w5_d6': 'Two brick sessions in one week. Zone 2 recovery — you\'ve earned every slow kilometre of this.',
  'w5_gym': 'Heavier than Week 3. Weighted pull-ups if you\'re doing 8+ bodyweight reps. The L-sit finisher builds the core stability that keeps your running form together in run 7 and 8.',

  // ─── WEEK 6 — PUSH ────────────────────────────────────────────────────────
  'w6_d0': 'Sled pull into row, no rest. You\'re training your two biggest gaps in one session. The top SA teams run 2:30 on sled pull and 3:40 on row. Today you start closing that.',
  'w6_d1': 'Threshold into VO2 in the same session. The gear-change is a trainable skill. You\'re training it. Embrace the discomfort of the 400s coming off 15 minutes of hard tempo.',
  'w6_d2': 'Rest. The deficit supersets left their mark.',
  'w6_d3': '5 rounds. Half your race load. The last two rounds are a negotiation between your brain and your legs. Your brain has read the plan. It wins.',
  'w6_d4': 'Rest. Tomorrow is your first real race rehearsal. Go in rested.',
  'w6_d5': 'First half-sim. Stations 1–4. Full loads. Sub-26 min target. Today you find out where you actually are — and the gap gets real. That\'s the point.',
  'w6_d6': 'Easy recovery. The first sim is in the books. Let the legs flush and process.',
  'w6_gym': 'Heaviest lower body week. Push the squat and hip thrust. Nordic curls protect the hamstrings in high-running weeks ahead. Wednesday, not Thursday.',

  // ─── WEEK 7 — GRIND ───────────────────────────────────────────────────────
  'w7_d0': 'Peak station day. The 3×50m sled pull in the middle of the ladder is where PBs are won or forfeited. The descent side feels like mercy. Hold the pace anyway.',
  'w7_d1': '8 × 1km at race pace. Full Hyrox run volume. The landmark session of the plan. Cape Town has 8 runs — today you run all 8 in training. Every rep split gets written down.',
  'w7_d2': '8+ hours sleep. Non-negotiable. You just ran full race run volume. The body needs this.',
  'w7_d3': 'The cliff hits around minute 40. You have been warned. Push through together — the fatigue at 40 minutes is the exact training stimulus this session was designed to deliver.',
  'w7_d4': 'Full rest. Week 7 was the hardest week in the plan. It\'s supposed to be. You survived it.',
  'w7_d5': 'Stations 5–8. Row, Farmers, Lunges, Wall balls. Wall balls unbroken. Farmers unbroken. These two stations alone are worth 90+ seconds versus JHB if you nail them.',
  'w7_d6': 'Peak week done. Z2 flush. The taper is two weeks away. Your body is about to become something.',
  'w7_gym': 'Lighter than usual — 70% of Week 5 load. Neural stimulus only. This week is about Hyrox training, not the gym. Get in, tick the boxes, get out.',

  // ─── WEEK 8 — PACE ────────────────────────────────────────────────────────
  'w8_d0': 'Watch how much rest you have in the final even-minute vs the first one. That difference is your training data. Log it.',
  'w8_d1': 'Sprint immediately after the sled. The 200m splits will feel terrible. That is the design. Record every one — the split that holds tells you which muscles you\'ve built.',
  'w8_d2': 'Rest. Sled sprints don\'t come free.',
  'w8_d3': 'Wall balls unbroken. No rest between movements. Race pace running. This is the version of you that shows up in Cape Town in April — get familiar with the feeling.',
  'w8_d4': 'Rest. High carb. Sleep. The 6-station sim tomorrow is dress rehearsal number two.',
  'w8_d5': '3 rounds at race loads. The Round 3 run pace — that\'s the one that matters. Hold it. That\'s your Cape Town self.',
  'w8_d6': 'Everything from here is pointing at Cape Town. Easy 40 minutes to let the sim settle.',
  'w8_gym': 'Last heavy lower body session before the taper. Match Week 6 loads — no new PBs. Nordic curls: hamstring insurance going into the highest-running weeks.',

  // ─── WEEK 9 — ACCELERATE ──────────────────────────────────────────────────
  'w9_d0': 'Every round starts and ends with a 500m run — exactly like race day structure. The movement changes each round so your body never adapts. Take splits on every single run.',
  'w9_d1': 'Full rest. Save everything for Saturday.',
  'w9_d2': '20 minutes. Neural priming only. Feel the stations at race pace. Get in, feel sharp, note anything that feels off, get out.',
  'w9_d3': 'Rest. High carb day. The full simulation is two days away.',
  'w9_d4': 'Legs completely fresh. A walk, nothing more. The work is done — now let it land.',
  'w9_d5': 'Dress rehearsal. Race nutrition, race kit, full warm-up, race protocol. Time everything. Your 1:02 is in this session somewhere — today you prove it\'s real.',
  'w9_d6': 'Whatever time you saw today — the real race will be faster. Trust it. The extra sleep, the taper, the crowd — it all adds up.',

  // ─── WEEK 10 — ACCELERATE (TAPER 1) ──────────────────────────────────────
  'w10_d0': 'Taper doesn\'t mean slow. 400m hard, straight into the station. 6 rounds. Push the run pace — you\'ve earned the fitness to feel this fast.',
  'w10_d1': '4 × 1km. Short and sharp. Should feel meaningfully easier than Week 7. That difference is 10 weeks of work showing up.',
  'w10_d2': 'Rest. The taper will make you feel like you\'re losing fitness. You\'re not. You\'re becoming race-ready.',
  'w10_d3': '3 rounds. Feel fast. Leave feeling good, not depleted. If you\'re toasted after this one, you went too hard.',
  'w10_d4': 'Rest. You\'re peaking. The hard sessions are behind you. Let the body consolidate.',
  'w10_d5': '30 minutes easy. Just keep the legs ticking. Nothing more to prove in training.',
  'w10_d6': 'Rest. Race week is 7 days away.',
  'w10_gym': 'Neural activation only — 50% load, stop 3 reps short of failure. In and out in 30 minutes. No soreness allowed going into race week.',

  // ─── WEEK 11 — PRIME (RACE WEEK) ─────────────────────────────────────────
  'w11_d0': '25 minutes. Easy. Conversation pace. The worst thing you can do this week is try to squeeze in one more hard session. Don\'t.',
  'w11_d1': '5 stations at 40% reps. Race pace. Feel how fast you are. You should leave this session with a smile on your face and fresh legs.',
  'w11_d2': 'Rest. You\'re ready. You just don\'t know it yet.',
  'w11_d3': '6 × 1 min pickups inside an easy run. Race pace in your legs\' memory. This is preparation, not a workout.',
  'w11_d4': 'Rest. Carb load. Kit packed and ready. Race plan reviewed. Nothing left to do but sleep and execute.',
  'w11_d5': 'Gear check. Nutrition sorted. Light walk. Early night. You\'ve trained 10 weeks for what happens tomorrow. Don\'t change anything tonight.',
  'w11_d6': '10 weeks of graft. JHB 2026 was 1:08:46. Cape Town 2026 is 1:02:00. You\'ve trained every station, every run, every handover. Go attack the sled pull. Row even splits. Wall balls unbroken. Run 8 is your sprint. Go.',
}
