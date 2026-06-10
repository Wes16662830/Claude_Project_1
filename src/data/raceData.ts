// Hyrox Doubles Men — Wesley Phillips + Glenn McEwan
// Johannesburg 2026: 1:08:46 actual | 1:02:00 podium target (Cape Town)

export interface Segment {
  id: string
  label: string
  type: 'run' | 'station'
  actualSeconds: number    // JHB 2026 result
  targetSeconds: number    // 1:02:00 podium target
  deltaSeconds: number     // target - actual (negative = lost time)
  note: string
}

export const SEGMENTS: Segment[] = [
  // Running stored as avg seconds/km (actual 5:01 = 301s, target 4:32 = 272s)
  { id:'running',    label:'Running',        type:'run',     actualSeconds:301, targetSeconds:272, deltaSeconds:-29,  note:'avg/km across all 8 runs' },
  { id:'skierg',     label:'SkiErg',         type:'station', actualSeconds:234, targetSeconds:221, deltaSeconds:-13,  note:'1000m' },
  { id:'sled_push',  label:'Sled Push',      type:'station', actualSeconds:87,  targetSeconds:93,  deltaSeconds:6,    note:'50m — beat this ✓' },
  { id:'sled_pull',  label:'Sled Pull',      type:'station', actualSeconds:211, targetSeconds:163, deltaSeconds:-48,  note:'50m — biggest station deficit' },
  { id:'bbj',        label:'Burpee BJ',      type:'station', actualSeconds:161, targetSeconds:151, deltaSeconds:-10,  note:'80m' },
  { id:'row',        label:'Row',            type:'station', actualSeconds:281, targetSeconds:244, deltaSeconds:-37,  note:'1000m' },
  { id:'farmers',    label:'Farmers Carry',  type:'station', actualSeconds:92,  targetSeconds:85,  deltaSeconds:-7,   note:'200m total' },
  { id:'s_lunges',   label:'Sandbag Lunges', type:'station', actualSeconds:191, targetSeconds:172, deltaSeconds:-19,  note:'100m' },
  { id:'wall_balls', label:'Wall Balls',     type:'station', actualSeconds:258, targetSeconds:224, deltaSeconds:-34,  note:'100 reps' },
]

export const ACTUAL_FINISH = 68 * 60 + 46   // 1:08:46
export const TARGET_FINISH = 62 * 60         // 1:02:00
export const TOTAL_GAP = ACTUAL_FINISH - TARGET_FINISH  // 406 seconds

export const ATHLETE = {
  name1: 'Wesley Phillips',
  name2: 'Glenn McEwan',
  event: 'Hyrox Doubles Men',
  lastRace: 'Johannesburg 2026',
  lastFinish: '1:08:46',
  nextRace: 'Cape Town',
  target: '1:02:00',
  targetReason: 'Podium — Doubles Men division',
}

export const fmtTime = (s: number): string => {
  const abs = Math.round(Math.abs(s))
  return `${Math.floor(abs / 60)}:${(abs % 60).toString().padStart(2, '0')}`
}

export const fmtPace = (s: number): string => fmtTime(s) + '/km'
