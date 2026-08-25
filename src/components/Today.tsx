import React, { useState, useEffect, useRef, useCallback } from 'react'
import { TRAINING_PLAN, SESSION_COLORS, PHASE_COLORS, type SessionType } from '../data/trainingPlan'
import { SESSION_MOTIVATION } from '../data/sessionMotivation'
import { type Profile, weeksUntilRace, mapCalendarDayToPlanDay, resolveWorkoutMode } from '../data/profile'
import { getStrengthSession, planWorkoutSlot } from '../data/strengthPlan'

// ─── Beep + vibrate on phase changes ────────────────────────────────────────

function beep(freq = 880, ms = 120) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000)
    osc.start(); osc.stop(ctx.currentTime + ms / 1000)
  } catch { /* Safari / restricted context */ }
  try { navigator.vibrate?.(ms) } catch {}
}
function tripleBeep() { beep(660, 80); setTimeout(() => beep(660, 80), 120); setTimeout(() => beep(1000, 200), 260) }

// ─── Timer mode detection ────────────────────────────────────────────────────

export type TimerKind =
  | { kind: 'stopwatch' }
  | { kind: 'countdown'; totalSecs: number }
  | { kind: 'tabata'; workSecs: number; restSecs: number; rounds: number; blocks: number }
  | { kind: 'emom'; totalMins: number; intervalSecs: number }
  | { kind: 'interval'; reps: number; restSecs: number }
  | { kind: 'rounds'; total: number; restSecs: number }

function detectTimer(format = '', title = '', type = ''): TimerKind {
  const txt = (format + ' ' + title).toLowerCase()
  if (type === 'rest') return { kind: 'stopwatch' }

  // Tabata
  if (/tabata/.test(txt)) return { kind: 'tabata', workSecs: 20, restSecs: 10, rounds: 8, blocks: 3 }

  // AMRAP N min
  const amrap = txt.match(/amrap\s*(\d+)\s*min/)
  if (amrap) return { kind: 'countdown', totalSecs: +amrap[1] * 60 }

  // E2MOM (every 2 min) × N
  const e2mom = txt.match(/e2mom.*?×?\s*(\d+)/)
  if (e2mom) return { kind: 'emom', totalMins: +e2mom[1] * 2, intervalSecs: 120 }

  // EMOM × N  or  EMOM N min
  const emomX = txt.match(/emom.*?×\s*(\d+)/)
  if (emomX) return { kind: 'emom', totalMins: +emomX[1], intervalSecs: 60 }
  const emomM = txt.match(/emom\s*(\d+)\s*min/)
  if (emomM) return { kind: 'emom', totalMins: +emomM[1], intervalSecs: 60 }

  // N × distance intervals: "6 × 1 km", "8 × 400m"
  const intv = txt.match(/(\d+)\s*[×x]\s*[\d.]+\s*(?:km|m)(?!\w)/)
  if (intv) return { kind: 'interval', reps: +intv[1], restSecs: 90 }

  // N rounds / N RFT
  const rds = txt.match(/(\d+)\s*(?:rounds?|rft)/)
  if (rds) return { kind: 'rounds', total: +rds[1], restSecs: 120 }

  // Steady run / workout with explicit duration
  const durM = txt.match(/(\d+)\s*min/)
  if (durM && +durM[1] >= 20) return { kind: 'countdown', totalSecs: +durM[1] * 60 }

  return { kind: 'stopwatch' }
}

// ─── Format seconds ──────────────────────────────────────────────────────────

function fmt(secs: number): string {
  const s = Math.abs(Math.floor(secs))
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

// ─── Plan position ───────────────────────────────────────────────────────────

function getPlanPos(
  startDate: string,
  restDays: number[],
): { weekNum: number; planDayIndex: number; calendarDay: number } | null {
  if (!startDate) return null
  const [y, mo, d] = startDate.split('-').map(Number)
  const start = new Date(y, mo - 1, d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000)
  if (diff < 0 || diff >= 77) return null
  const calendarDay = diff % 7
  return {
    weekNum: Math.floor(diff / 7) + 1,
    calendarDay,
    planDayIndex: mapCalendarDayToPlanDay(calendarDay, restDays),
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  profile: Profile
  completed: Set<string>
  onToggleComplete: (id: string) => void
  onSetDayMode: (sessionId: string, mode: 'hyrox' | 'strength' | null) => void
}

// ─── Timer hook ───────────────────────────────────────────────────────────────

function useTimer(mode: TimerKind) {
  // Wall-clock refs — never stale
  const startRef    = useRef(0)            // Date.now() when last started
  const baseRef     = useRef(0)            // accumulated seconds before this run
  const runRef      = useRef(false)

  // Phase state in refs (mutated in interval, read in render)
  const tabRef = useRef({ block: 1, round: 1, phase: 'work' as 'work' | 'rest', phaseBase: 0 })
  const emomRef = useRef({ minute: 1, minBase: 0 })
  const intvRef = useRef({ rep: 1, phase: 'work' as 'work' | 'rest', phaseBase: 0 })
  const rdsRef  = useRef({ round: 1, phase: 'work' as 'work' | 'rest', phaseBase: 0, laps: [] as number[] })

  // Display state
  const [tick, setTick] = useState(0)
  const [done, setDone] = useState(false)
  const itvRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getElapsed = useCallback((): number =>
    runRef.current ? baseRef.current + (Date.now() - startRef.current) / 1000 : baseRef.current
  , [])

  const advance = useCallback(() => {
    const elapsed = getElapsed()
    const mk = mode.kind

    if (mk === 'countdown') {
      if (elapsed >= mode.totalSecs) { tripleBeep(); setDone(true); runRef.current = false; clearInterval(itvRef.current!) }
    }
    else if (mk === 'tabata') {
      const t = tabRef.current
      const dur = t.phase === 'work' ? mode.workSecs : mode.restSecs
      const phaseElapsed = elapsed - t.phaseBase
      if (phaseElapsed >= dur) {
        if (t.phase === 'work') {
          beep(440, 80)
          tabRef.current = { ...t, phase: 'rest', phaseBase: elapsed }
        } else {
          if (t.round >= mode.rounds) {
            if (t.block >= mode.blocks) { tripleBeep(); setDone(true); runRef.current = false; clearInterval(itvRef.current!); return }
            beep(880, 200); tabRef.current = { block: t.block + 1, round: 1, phase: 'work', phaseBase: elapsed }
          } else {
            beep(660, 80); tabRef.current = { ...t, round: t.round + 1, phase: 'work', phaseBase: elapsed }
          }
        }
      }
    }
    else if (mk === 'emom') {
      const e = emomRef.current
      const phaseElapsed = elapsed - e.minBase
      if (phaseElapsed >= mode.intervalSecs) {
        if (e.minute >= mode.totalMins) { tripleBeep(); setDone(true); runRef.current = false; clearInterval(itvRef.current!); return }
        beep(660, 80); emomRef.current = { minute: e.minute + 1, minBase: elapsed }
      }
    }
    else if (mk === 'interval') {
      const iv = intvRef.current
      if (iv.phase === 'rest') {
        const phaseElapsed = elapsed - iv.phaseBase
        if (phaseElapsed >= mode.restSecs) {
          if (iv.rep >= mode.reps) { tripleBeep(); setDone(true); runRef.current = false; clearInterval(itvRef.current!); return }
          beep(880, 120); intvRef.current = { rep: iv.rep + 1, phase: 'work', phaseBase: elapsed }
        }
      }
    }

    setTick(n => n + 1)
  }, [mode, getElapsed])

  const start = useCallback(() => {
    if (done) return
    startRef.current = Date.now()
    runRef.current = true
    itvRef.current = setInterval(advance, 250)
    setTick(n => n + 1)
  }, [done, advance])

  const pause = useCallback(() => {
    runRef.current = false
    baseRef.current = getElapsed()
    clearInterval(itvRef.current!)
    setTick(n => n + 1)
  }, [getElapsed])

  const reset = useCallback(() => {
    runRef.current = false; clearInterval(itvRef.current!)
    baseRef.current = 0; startRef.current = 0
    tabRef.current  = { block: 1, round: 1, phase: 'work', phaseBase: 0 }
    emomRef.current = { minute: 1, minBase: 0 }
    intvRef.current = { rep: 1, phase: 'work', phaseBase: 0 }
    rdsRef.current  = { round: 1, phase: 'work', phaseBase: 0, laps: [] }
    setDone(false); setTick(n => n + 1)
  }, [])

  // Rounds-specific: user taps to end a round / skip rest
  const nextRound = useCallback(() => {
    const elapsed = getElapsed()
    const r = rdsRef.current
    if (r.phase === 'work') {
      rdsRef.current = { ...r, laps: [...r.laps, elapsed - r.phaseBase], phase: 'rest', phaseBase: elapsed }
      beep(660, 80)
    } else {
      if (r.round >= (mode.kind === 'rounds' ? mode.total : 0)) {
        tripleBeep(); setDone(true); runRef.current = false; clearInterval(itvRef.current!)
      } else {
        rdsRef.current = { ...r, round: r.round + 1, phase: 'work', phaseBase: elapsed }
        beep(880, 120)
      }
    }
    setTick(n => n + 1)
  }, [mode, getElapsed])

  // Interval-specific: user taps to start rest / next rep
  const nextRep = useCallback(() => {
    const elapsed = getElapsed()
    const iv = intvRef.current
    if (iv.phase === 'work') {
      beep(660, 80); intvRef.current = { ...iv, phase: 'rest', phaseBase: elapsed }
    } else {
      if (iv.rep >= (mode.kind === 'interval' ? mode.reps : 0)) {
        tripleBeep(); setDone(true); runRef.current = false; clearInterval(itvRef.current!)
      } else {
        beep(880, 120); intvRef.current = { ...iv, rep: iv.rep + 1, phase: 'work', phaseBase: elapsed }
      }
    }
    setTick(n => n + 1)
  }, [mode, getElapsed])

  useEffect(() => () => clearInterval(itvRef.current!), [])

  return { tick, done, isRunning: runRef.current, getElapsed, tabRef, emomRef, intvRef, rdsRef, start, pause, reset, nextRound, nextRep }
}

// ─── Timer Display ────────────────────────────────────────────────────────────

interface TDisplayProps { mode: TimerKind; accentColor: string }

function TimerDisplay({ mode, accentColor }: TDisplayProps) {
  const { done, isRunning, getElapsed, tabRef, emomRef, intvRef, rdsRef, start, pause, reset, nextRound, nextRep } = useTimer(mode)

  const elapsed = getElapsed()
  let primary = '00:00'
  let phaseLabel = ''
  let subLabel = ''
  let bgColor = '#0d0d0d'
  let showNextBtn = false
  let nextLabel = ''

  if (mode.kind === 'stopwatch') {
    primary = fmt(elapsed)
    phaseLabel = done ? 'DONE' : isRunning ? 'RUNNING' : 'STOPWATCH'
  }
  else if (mode.kind === 'countdown') {
    const left = Math.max(0, mode.totalSecs - elapsed)
    primary = fmt(left)
    phaseLabel = done ? '⏰ TIME!' : isRunning ? 'COUNTDOWN' : fmt(mode.totalSecs)
    bgColor = done ? '#1a0d00' : '#0d0d0d'
  }
  else if (mode.kind === 'tabata') {
    const t = tabRef.current
    const phaseDur = t.phase === 'work' ? mode.workSecs : mode.restSecs
    const left = Math.max(0, phaseDur - (elapsed - t.phaseBase))
    primary = fmt(left)
    phaseLabel = done ? '✓ DONE' : t.phase === 'work' ? '💪 WORK' : '😮‍💨 REST'
    bgColor = done ? '#0a120a' : t.phase === 'work' ? '#1a0d00' : '#0a120a'
    subLabel = `Block ${t.block}/${mode.blocks} · Round ${t.round}/${mode.rounds}`
  }
  else if (mode.kind === 'emom') {
    const e = emomRef.current
    const left = Math.max(0, mode.intervalSecs - (elapsed - e.minBase))
    primary = fmt(left)
    const isOdd = e.minute % 2 === 1
    phaseLabel = done ? '✓ DONE' : `${isOdd ? 'ODD' : 'EVEN'} MIN`
    bgColor = isOdd ? '#0d1a0d' : '#0d0d1a'
    subLabel = `Minute ${e.minute} of ${mode.totalMins} · ${fmt(elapsed)} total`
  }
  else if (mode.kind === 'interval') {
    const iv = intvRef.current
    if (iv.phase === 'work') {
      primary = fmt(elapsed - iv.phaseBase)
      phaseLabel = done ? '✓ DONE' : `REP ${iv.rep}/${mode.reps}`
      subLabel = 'Tap ↓ when done with this rep'
      bgColor = '#0d1a00'
      showNextBtn = !done && isRunning; nextLabel = 'End Rep →'
    } else {
      const left = Math.max(0, mode.restSecs - (elapsed - iv.phaseBase))
      primary = fmt(left)
      phaseLabel = `REST — rep ${iv.rep} done`
      subLabel = 'Tap ↓ to start next rep early'
      bgColor = '#0a120a'
      showNextBtn = !done && isRunning; nextLabel = `Rep ${iv.rep + 1} →`
    }
  }
  else if (mode.kind === 'rounds') {
    const r = rdsRef.current
    if (r.phase === 'work') {
      primary = fmt(elapsed - r.phaseBase)
      phaseLabel = done ? '✓ DONE' : `ROUND ${r.round}/${mode.total}`
      subLabel = `Best lap: ${r.laps.length ? fmt(Math.min(...r.laps)) : '—'}`
      bgColor = '#0d1a00'
      showNextBtn = !done && isRunning; nextLabel = 'End Round ✓'
    } else {
      const left = Math.max(0, mode.restSecs - (elapsed - r.phaseBase))
      primary = fmt(left)
      phaseLabel = `REST — ${fmt(r.laps[r.laps.length - 1] ?? 0)} last round`
      subLabel = r.laps.map((l, i) => `R${i + 1}: ${fmt(l)}`).join(' · ')
      bgColor = '#0a120a'
      showNextBtn = !done && isRunning; nextLabel = `Round ${r.round + 1} →`
    }
  }

  const bigBtn: React.CSSProperties = {
    padding: '16px 32px', borderRadius: 12, fontSize: 18, fontWeight: 800,
    cursor: 'pointer', border: 'none', letterSpacing: '0.5px', minWidth: 120,
  }

  return (
    <div style={{ background: bgColor, border: `1px solid ${accentColor}33`, borderRadius: 16, padding: '24px 20px', textAlign: 'center', transition: 'background 0.3s' }}>
      {/* Phase label */}
      <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '2px', color: accentColor, textTransform: 'uppercase', marginBottom: 8 }}>
        {phaseLabel || (mode.kind === 'stopwatch' ? 'STOPWATCH' : mode.kind.toUpperCase())}
      </div>

      {/* Big clock */}
      <div style={{ fontSize: 'clamp(64px, 18vw, 96px)', fontWeight: 900, fontFamily: 'monospace', color: done ? '#2a8c5a' : '#f0ede8', letterSpacing: '-2px', lineHeight: 1, marginBottom: 8 }}>
        {primary}
      </div>

      {/* Sub label */}
      {subLabel && (
        <div style={{ fontSize: 12, color: '#666', marginBottom: 16, minHeight: 16 }}>{subLabel}</div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
        {!done && (
          isRunning
            ? <button style={{ ...bigBtn, background: '#e8962a', color: '#000' }} onClick={pause}>⏸ Pause</button>
            : <button style={{ ...bigBtn, background: accentColor, color: '#000' }} onClick={start}>▶ {elapsed > 0 ? 'Resume' : 'Start'}</button>
        )}
        {showNextBtn && (
          <button style={{ ...bigBtn, background: '#2a2a2a', color: '#f0ede8', fontSize: 15 }}
            onClick={mode.kind === 'rounds' ? nextRound : nextRep}>{nextLabel}</button>
        )}
        {elapsed > 0 && (
          <button style={{ ...bigBtn, background: 'none', border: '1px solid #2a2a2a', color: '#666', fontSize: 14, padding: '14px 20px' }} onClick={reset}>↺ Reset</button>
        )}
      </div>

      {/* Mode hint */}
      <div style={{ marginTop: 16, fontSize: 11, color: '#444' }}>
        {mode.kind === 'tabata' && `${mode.workSecs}s work / ${mode.restSecs}s rest · ${mode.rounds} rounds × ${mode.blocks} blocks`}
        {mode.kind === 'emom' && `${mode.intervalSecs === 120 ? 'Every 2 min' : 'Every min'} for ${mode.totalMins} min`}
        {mode.kind === 'interval' && `${mode.reps} reps · ${mode.restSecs}s rest between reps`}
        {mode.kind === 'rounds' && `${mode.total} rounds · ${mode.restSecs}s rest between rounds`}
        {mode.kind === 'countdown' && `Counting down from ${fmt(mode.totalSecs)}`}
        {mode.kind === 'stopwatch' && 'Count up — tap Start when you begin'}
      </div>
    </div>
  )
}

// ─── Main Today Component ────────────────────────────────────────────────────

export default function Today({ profile, completed, onToggleComplete, onSetDayMode }: Props) {
  const pos = getPlanPos(profile.planStartDate, profile.restDays ?? [2, 4])

  // No start date set
  if (!profile.planStartDate) {
    const weeksLeft = profile.raceDate ? weeksUntilRace(profile.raceDate) : null
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#f0ede8', marginBottom: 8 }}>Set your race date</div>
        <div style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 24 }}>
          Go to <b style={{ color: '#e8962a' }}>Settings → Races &amp; Targets → Race Date</b> and pick your event date.
          The plan start date is calculated automatically — 11 weeks out. If you have fewer weeks, you jump in at the right point.
        </div>
        {weeksLeft !== null && (
          <div style={{ fontSize: 12, color: '#444', background: '#111', borderRadius: 8, padding: '12px 16px', textAlign: 'left', lineHeight: 1.7 }}>
            {weeksLeft} week{weeksLeft !== 1 ? 's' : ''} until race day.
            {weeksLeft < 11 ? ` You'll enter at Week ${Math.max(1, 12 - weeksLeft)} of the plan.` : ' Full 11-week plan available.'}
          </div>
        )}
        {!profile.raceDate && (
          <div style={{ fontSize: 12, color: '#444', background: '#111', borderRadius: 8, padding: '12px 16px', textAlign: 'left', lineHeight: 1.7 }}>
            Tip: The plan is 11 weeks. Set your race date in Settings and everything will auto-configure.
          </div>
        )}
      </div>
    )
  }

  // Before or after the plan window
  if (!pos) {
    const start = new Date(profile.planStartDate)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const isBefore = today < start
    const weeksLeft = profile.raceDate ? weeksUntilRace(profile.raceDate) : null
    const daysToStart = Math.ceil((start.getTime() - today.getTime()) / 86400000)

    if (!isBefore && weeksLeft !== null && weeksLeft === 0) {
      // Race week — plan is technically done, but race is this week
      return (
        <div style={{ padding: 24, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#e8962a', marginBottom: 8 }}>Race week!</div>
          <div style={{ fontSize: 14, color: '#aaa', lineHeight: 1.7, marginBottom: 8 }}>
            11 weeks of work done. Time to race. Trust the training, attack every station, run your own race.
          </div>
          <div style={{ fontSize: 13, color: '#666', fontStyle: 'italic' }}>
            {profile.nextRaceName || 'Race day'} target: {Math.floor(profile.targetFinishSeconds / 60)}:{String(profile.targetFinishSeconds % 60).padStart(2, '0')}
          </div>
        </div>
      )
    }

    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{isBefore ? '⏳' : '🏁'}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#f0ede8', marginBottom: 8 }}>
          {isBefore
            ? daysToStart === 1 ? 'Plan starts tomorrow!' : `Plan starts in ${daysToStart} days`
            : 'Training block complete!'}
        </div>
        <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>
          {isBefore
            ? 'Get your kit ready. Rest, eat well, and show up on Day 1.'
            : 'The 11 weeks are done. How did the race go? Update your result in Settings → Segment Splits.'}
        </div>
        {weeksLeft !== null && !isBefore && (
          <div style={{ fontSize: 13, color: '#e8962a', fontWeight: 600 }}>
            {weeksLeft} week{weeksLeft !== 1 ? 's' : ''} until {profile.nextRaceName || 'race day'}
          </div>
        )}
      </div>
    )
  }

  const week = TRAINING_PLAN.find(w => w.week === pos.weekNum)
  if (!week) return null
  const day = week.days[pos.planDayIndex]
  if (!day) return null

  const planSession = day.session
  const planIsRest = planSession.type === 'rest'
  const planIsRace = (planSession.type as string) === 'race'
  const sessionId = `w${pos.weekNum}_d${pos.planDayIndex}`

  // Strength override: swap the Hyrox session for a PPL gym day (never on rest/race days)
  const mode = resolveWorkoutMode(profile, sessionId)
  const useStrength = mode === 'strength' && !planIsRest && !planIsRace
  const session = useStrength
    ? getStrengthSession(pos.weekNum, planWorkoutSlot(pos.planDayIndex), profile.fitnessLevel)
    : planSession

  const rawType = session.type as string
  const type: SessionType = rawType === 'race' ? 'sim' : session.type
  const isRest = session.type === 'rest'
  const isRace = rawType === 'race'
  const colors = SESSION_COLORS[type]
  const isDone = completed.has(sessionId)
  const motivation = useStrength ? '' : (SESSION_MOTIVATION[sessionId] ?? '')
  const isSolo = profile.trainingMode === 'solo'
  const notesText = !useStrength && isSolo && session.soloNotes ? session.soloNotes : session.notes
  const timerMode = detectTimer(session.format, session.title, session.type)
  const canSwitchMode = !planIsRest && !planIsRace

  const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const PHASE_LABEL: Record<string, string> = { aerobic: 'BASE', build: 'BUILD', peak: 'PEAK', race: 'RACE' }

  return (
    <div style={{ padding: '16px', maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Rest day */}
      {isRest ? (
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: '32px 24px', textAlign: 'center' }}>
          {/* Context row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ background: PHASE_COLORS[week.phase] + '22', border: `1px solid ${PHASE_COLORS[week.phase]}44`, borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 800, color: PHASE_COLORS[week.phase], textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Week {pos.weekNum} — {PHASE_LABEL[week.phase] ?? week.phase}
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>{DAY_NAMES[pos.calendarDay]}</div>
          </div>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛋️</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f0ede8', marginBottom: 6 }}>{session.title}</div>
          {session.detail && <div style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.6 }}>{session.detail}</div>}
          {motivation && <div style={{ fontSize: 13, color: '#e8c12a', fontStyle: 'italic', lineHeight: 1.6 }}>{motivation}</div>}
        </div>
      ) : (
        <>
          {/* Main session tile */}
          <div style={{ background: colors.bg, border: `1px solid ${colors.border}55`, borderRadius: 16, padding: '20px 20px 16px' }}>
            {/* Context row — small, inside the card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ background: PHASE_COLORS[week.phase] + '22', border: `1px solid ${PHASE_COLORS[week.phase]}44`, borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 800, color: PHASE_COLORS[week.phase], textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Week {pos.weekNum} — {PHASE_LABEL[week.phase] ?? week.phase}
              </div>
              <div style={{ fontSize: 12, color: '#777' }}>{DAY_NAMES[pos.calendarDay]}</div>
              <div style={{ fontSize: 11, color: '#555', fontStyle: 'italic' }}>{week.title}</div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                {profile.raceDate && (() => {
                  const w = weeksUntilRace(profile.raceDate)
                  if (w === null || w > 11) return null
                  const color = w <= 1 ? '#d63b2f' : w <= 3 ? '#e8962a' : '#888'
                  return (
                    <div style={{ fontSize: 10, fontWeight: 700, color, border: `1px solid ${color}44`, borderRadius: 20, padding: '2px 8px' }}>
                      {w === 0 ? 'RACE WEEK' : `${w}w to race`}
                    </div>
                  )
                })()}
                {isDone && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#2a8c5a', background: '#0a120a', border: '1px solid #2a8c5a44', borderRadius: 20, padding: '2px 8px' }}>✓ Done</div>
                )}
              </div>
            </div>

            {/* Hyrox / Strength day toggle */}
            {canSwitchMode && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {([
                  { id: 'hyrox',    label: '🏃 Hyrox' },
                  { id: 'strength', label: '🏋️ Strength' },
                ] as const).map(({ id, label }) => {
                  const sel = mode === id
                  const globalDefault = profile.workoutMode ?? 'hyrox'
                  return (
                    <button
                      key={id}
                      onClick={() => onSetDayMode(sessionId, id === globalDefault ? null : id)}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: sel ? 700 : 500,
                        cursor: 'pointer', border: `1px solid ${sel ? '#e8962a' : '#2a2a2a'}`,
                        background: sel ? '#e8962a22' : '#0a0a0a',
                        color: sel ? '#e8962a' : '#888', transition: 'all 0.12s',
                      }}
                    >
                      {label}{sel ? '  ✓' : ''}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Workout — dominant */}
            {session.format && (
              <div style={{ fontSize: 12, fontWeight: 800, color: '#e8c12a', letterSpacing: '0.5px', marginBottom: 6 }}>{session.format}</div>
            )}
            <div style={{ fontSize: 28, fontWeight: 900, color: '#f0ede8', marginBottom: 4, lineHeight: 1.15, letterSpacing: '-0.5px' }}>{session.title}</div>
            {session.duration && <div style={{ fontSize: 13, color: '#888', marginBottom: 2 }}>{session.duration}</div>}

            {motivation && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${colors.border}33`, fontSize: 13, color: '#e8c12a', fontStyle: 'italic', lineHeight: 1.6 }}>
                {motivation}
              </div>
            )}
          </div>

          {/* Workout detail — always visible */}
          {(session.detail || notesText) && (
            <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '16px' }}>
              {session.detail && (
                <div style={{ fontSize: 14, color: '#bbb', lineHeight: 1.8, marginBottom: notesText ? 12 : 0, whiteSpace: 'pre-line' }}>{session.detail}</div>
              )}
              {notesText && (
                <div style={{ fontSize: 13, color: colors.text, background: colors.border + '15', borderRadius: 8, padding: '10px 12px', lineHeight: 1.7, borderLeft: `3px solid ${colors.border}`, whiteSpace: 'pre-line' }}>{notesText}</div>
              )}
            </div>
          )}

          {/* Timer */}
          <TimerDisplay key={sessionId} mode={timerMode} accentColor={isRace ? '#e8962a' : colors.border} />

          {/* Mark Done */}
          <button
            onClick={() => onToggleComplete(sessionId)}
            style={{
              width: '100%', padding: '18px', borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: 'pointer',
              background: isDone ? '#0a120a' : '#2a8c5a',
              color: isDone ? '#2a8c5a' : '#fff',
              border: `2px solid ${isDone ? '#2a8c5a' : 'transparent'}`,
              letterSpacing: '0.5px', transition: 'all 0.2s',
            } as React.CSSProperties}
          >
            {isDone ? '✓ Marked Done — tap to undo' : '✓ Mark Session Complete'}
          </button>
        </>
      )}
    </div>
  )
}
