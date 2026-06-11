import React, { useState, useRef } from 'react'
import { TRAINING_PLAN } from '../data/trainingPlan'
import { getDivision, type Profile } from '../data/profile'
import { fmtTime } from '../data/raceData'
import {
  encodeSnapshot, decodeSnapshot, savePartner,
  type PartnerSnapshot,
} from '../data/progress'

interface Props {
  profile: Profile
  completed: Set<string>
  partner: PartnerSnapshot | null
  onSetPartner: (snap: PartnerSnapshot | null) => void
}

const BASE_URL = `${window.location.origin}${window.location.pathname}`

function weekSessions(weekNum: number): string[] {
  const week = TRAINING_PLAN.find(w => w.week === weekNum)
  if (!week) return []
  const ids = week.days
    .filter(d => d.session.type !== 'rest')
    .map((_, i) => `w${weekNum}_d${i}`)
  if (week.gymSession) ids.push(`w${weekNum}_gym`)
  return ids
}

function allSessionIds(): string[] {
  return TRAINING_PLAN.flatMap(week => weekSessions(week.week))
}

function completedInWeek(weekNum: number, done: Set<string> | string[]): number {
  const doneSet = Array.isArray(done) ? new Set(done) : done
  return weekSessions(weekNum).filter(id => doneSet.has(id)).length
}

function WeekDots({ weekNum, done, color = '#e8962a' }: { weekNum: number; done: Set<string> | string[]; color?: string }) {
  const ids = weekSessions(weekNum)
  const doneSet = Array.isArray(done) ? new Set(done) : done
  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {ids.map(id => (
        <div key={id} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: doneSet.has(id) ? color : '#2a2a2a',
          border: `1px solid ${doneSet.has(id) ? color : '#333'}`,
          transition: 'background 0.2s',
        }} />
      ))}
    </div>
  )
}

function timeSince(ms: number): string {
  const s = (Date.now() - ms) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)}m ago`
  if (s < 86400) return `${Math.round(s / 3600)}h ago`
  return `${Math.round(s / 86400)}d ago`
}

export default function Partner({ profile, completed, partner, onSetPartner }: Props) {
  const [codeInput, setCodeInput] = useState('')
  const [copyMsg, setCopyMsg] = useState('')
  const [importErr, setImportErr] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const division = getDivision(profile.division)
  const myName = profile.athlete1.trim().split(' ')[0] || 'Me'
  const total = allSessionIds().length
  const myDone = completed.size

  // Build my snapshot
  const mySnap: PartnerSnapshot = {
    n: myName,
    d: division.label,
    t: profile.targetFinishSeconds,
    l: profile.lastFinishSeconds,
    c: [...completed],
    u: Date.now(),
  }
  const myCode = encodeSnapshot(mySnap)
  const shareUrl = `${BASE_URL}?partner=${encodeURIComponent(myCode)}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyMsg('Link copied!')
      setTimeout(() => setCopyMsg(''), 2500)
    } catch {
      setCopyMsg('Copy failed — try long-press')
      setTimeout(() => setCopyMsg(''), 2500)
    }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(myCode)
      setCopyMsg('Code copied!')
      setTimeout(() => setCopyMsg(''), 2500)
    } catch {
      setCopyMsg('Copy failed')
      setTimeout(() => setCopyMsg(''), 2500)
    }
  }

  const importCode = () => {
    setImportErr('')
    const snap = decodeSnapshot(codeInput)
    if (!snap || typeof snap.n !== 'string') {
      setImportErr('Invalid code — ask your partner to re-copy it.')
      return
    }
    savePartner(snap)
    onSetPartner(snap)
    setCodeInput('')
  }

  const clearPartner = () => {
    savePartner(null)
    onSetPartner(null)
  }

  const card: React.CSSProperties = {
    background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '18px 20px', marginBottom: 16,
  }
  const label: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10,
  }
  const btn: React.CSSProperties = {
    padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
  }

  return (
    <div style={{ padding: '24px', maxWidth: 860, margin: '0 auto' }}>

      {/* YOUR PROGRESS */}
      <div style={card}>
        <div style={label}>Your Progress</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f0ede8', letterSpacing: '-0.5px' }}>{myName}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{division.label}</div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#e8962a' }}>{fmtTime(profile.targetFinishSeconds)}</div>
              <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#4a9fd4' }}>{myDone}<span style={{ fontSize: 12, color: '#666' }}>/{total}</span></div>
              <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sessions done</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#666' }}>Plan completion</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#e8962a' }}>{Math.round(myDone / total * 100)}%</span>
          </div>
          <div style={{ height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${myDone / total * 100}%`, background: '#e8962a', borderRadius: 3, transition: 'width 0.4s' }} />
          </div>
        </div>

        {/* Week-by-week dots */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
          {TRAINING_PLAN.map(week => {
            const done = completedInWeek(week.week, completed)
            const tot = weekSessions(week.week).length
            return (
              <div key={week.week} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 6, padding: '6px 8px' }}>
                <div style={{ fontSize: 9, color: '#555', fontWeight: 700, marginBottom: 4 }}>W{week.week} <span style={{ color: done === tot && tot > 0 ? '#2a8c5a' : '#444' }}>{done}/{tot}</span></div>
                <WeekDots weekNum={week.week} done={completed} />
              </div>
            )
          })}
        </div>
      </div>

      {/* SHARE */}
      <div style={card}>
        <div style={label}>Share Your Progress</div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 14 }}>
          Send your partner a link or paste the code into their Partner tab. Your data syncs instantly when they open it.
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <button style={{ ...btn, background: '#e8962a', color: '#000' }} onClick={copyLink}>
            📋 Copy Share Link
          </button>
          <button style={{ ...btn, background: '#1e1e1e', color: '#aaa', border: '1px solid #333' }} onClick={copyCode}>
            Copy Code
          </button>
          {copyMsg && <span style={{ fontSize: 12, color: '#2a8c5a', alignSelf: 'center' }}>{copyMsg}</span>}
        </div>
        <div style={{ fontSize: 10, color: '#444', wordBreak: 'break-all', background: '#0d0d0d', borderRadius: 4, padding: '6px 8px', fontFamily: 'monospace' }}>
          {shareUrl.length > 120 ? shareUrl.substring(0, 120) + '…' : shareUrl}
        </div>
      </div>

      {/* PARTNER DATA */}
      {partner ? (
        <div style={{ ...card, border: '1px solid #2a8c5a44', background: '#080f08' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={label}>Partner: {partner.n}</div>
            <button onClick={clearPartner} style={{ ...btn, background: 'none', border: '1px solid #333', color: '#555', fontSize: 11, padding: '4px 10px' }}>
              Remove
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f0ede8' }}>{partner.n}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{partner.d} · Updated {timeSince(partner.u)}</div>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#e8962a' }}>{fmtTime(partner.t)}</div>
                <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#4a9fd4' }}>
                  {partner.c.length}<span style={{ fontSize: 12, color: '#666' }}>/{total}</span>
                </div>
                <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sessions done</div>
              </div>
            </div>
          </div>

          {/* Partner progress bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#666' }}>Plan completion</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#2a8c5a' }}>{Math.round(partner.c.length / total * 100)}%</span>
            </div>
            <div style={{ height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${partner.c.length / total * 100}%`, background: '#2a8c5a', borderRadius: 3, transition: 'width 0.4s' }} />
            </div>
          </div>

          {/* SIDE-BY-SIDE weekly comparison */}
          <div style={{ ...label, marginBottom: 12 }}>Week-by-Week Comparison</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
            {TRAINING_PLAN.map(week => {
              const myDoneW  = completedInWeek(week.week, completed)
              const ptDoneW  = completedInWeek(week.week, partner.c)
              const tot      = weekSessions(week.week).length
              const iAhead   = myDoneW > ptDoneW
              const theyAhead = ptDoneW > myDoneW
              return (
                <div key={week.week} style={{
                  background: '#0d0d0d', border: `1px solid ${iAhead ? '#e8962a33' : theyAhead ? '#2a8c5a33' : '#1a1a1a'}`,
                  borderRadius: 8, padding: '8px 10px',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#555', marginBottom: 6 }}>
                    Week {week.week} <span style={{ color: '#666' }}>({tot} sessions)</span>
                  </div>

                  {/* You */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 9, color: '#888', width: 32 }}>{myName.substring(0,4)}</span>
                    <WeekDots weekNum={week.week} done={completed} color="#e8962a" />
                    <span style={{ fontSize: 10, fontWeight: 700, color: myDoneW === tot && tot > 0 ? '#e8962a' : '#555', marginLeft: 2 }}>{myDoneW}/{tot}</span>
                  </div>

                  {/* Partner */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 9, color: '#888', width: 32 }}>{partner.n.substring(0,4)}</span>
                    <WeekDots weekNum={week.week} done={partner.c} color="#2a8c5a" />
                    <span style={{ fontSize: 10, fontWeight: 700, color: ptDoneW === tot && tot > 0 ? '#2a8c5a' : '#555', marginLeft: 2 }}>{ptDoneW}/{tot}</span>
                  </div>

                  {/* Who's ahead */}
                  {iAhead && <div style={{ fontSize: 9, color: '#e8962a', marginTop: 4 }}>You're ahead +{myDoneW - ptDoneW}</div>}
                  {theyAhead && <div style={{ fontSize: 9, color: '#2a8c5a', marginTop: 4 }}>{partner.n} ahead +{ptDoneW - myDoneW}</div>}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* IMPORT PARTNER */
        <div style={card}>
          <div style={label}>Import Partner Data</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 14 }}>
            Ask your partner to open the Partner tab and tap "Copy Share Link" or "Copy Code", then paste it here.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              ref={inputRef}
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && importCode()}
              placeholder="Paste partner code here…"
              style={{
                flex: 1, minWidth: 200, background: '#0d0d0d', border: '1px solid #333',
                borderRadius: 6, padding: '8px 12px', color: '#f0ede8', fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              onClick={importCode}
              disabled={!codeInput.trim()}
              style={{ ...btn, background: codeInput.trim() ? '#2a8c5a' : '#1a1a1a', color: codeInput.trim() ? '#fff' : '#555' }}
            >
              Load
            </button>
          </div>
          {importErr && <div style={{ fontSize: 12, color: '#d63b2f', marginTop: 8 }}>{importErr}</div>}
          <div style={{ fontSize: 11, color: '#444', marginTop: 12 }}>
            No account needed. Your partner's data is stored only in your browser. Ask them to re-share whenever they've logged new sessions.
          </div>
        </div>
      )}

    </div>
  )
}
