// Session completion tracking — persisted in localStorage.

const PROGRESS_KEY = 'hyrox-progress-v1'
const PARTNER_KEY  = 'hyrox-partner-v1'

// ---------------------------------------------------------------------------
// Your own completed sessions
// ---------------------------------------------------------------------------
export function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch { return new Set() }
}

export function saveCompleted(ids: Set<string>): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...ids]))
  } catch {}
}

// ---------------------------------------------------------------------------
// Partner snapshot (shared via link or paste)
// ---------------------------------------------------------------------------
export interface PartnerSnapshot {
  n: string    // name
  d: string    // division label
  t: number    // targetFinishSeconds
  l: number    // lastFinishSeconds
  c: string[]  // completedSessions
  u: number    // updatedAt (ms since epoch)
}

export function encodeSnapshot(snap: PartnerSnapshot): string {
  return btoa(JSON.stringify(snap))
}

export function decodeSnapshot(code: string): PartnerSnapshot | null {
  try {
    return JSON.parse(atob(code.trim())) as PartnerSnapshot
  } catch { return null }
}

export function loadPartner(): PartnerSnapshot | null {
  try {
    const raw = localStorage.getItem(PARTNER_KEY)
    return raw ? (JSON.parse(raw) as PartnerSnapshot) : null
  } catch { return null }
}

export function savePartner(snap: PartnerSnapshot | null): void {
  try {
    if (snap) localStorage.setItem(PARTNER_KEY, JSON.stringify(snap))
    else localStorage.removeItem(PARTNER_KEY)
  } catch {}
}
