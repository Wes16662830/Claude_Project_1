import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import TrainingPlan from './components/TrainingPlan'
import SplitAnalysis from './components/SplitAnalysis'
import Settings from './components/Settings'
import Partner from './components/Partner'
import Today from './components/Today'
import { loadProfile, saveProfile, type Profile } from './data/profile'
import {
  loadCompleted, saveCompleted, loadPartner, savePartner,
  decodeSnapshot, type PartnerSnapshot,
} from './data/progress'

function UpdateBanner() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  if (!needRefresh) return null
  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, background: '#1a1400', border: '1px solid #e8962a',
      borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center',
      gap: 14, boxShadow: '0 4px 24px #000a', whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 13, color: '#f0ede8' }}>New version available</span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: '#e8962a', border: 'none', borderRadius: 8,
          padding: '7px 16px', color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}
      >
        Update now
      </button>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('today')
  const [profile, setProfileState] = useState<Profile>(() => loadProfile())
  const [completed, setCompletedState] = useState<Set<string>>(() => loadCompleted())
  const [partner, setPartnerState] = useState<PartnerSnapshot | null>(() => loadPartner())

  const setProfile = (p: Profile) => { setProfileState(p); saveProfile(p) }
  const setCompleted = (ids: Set<string>) => { setCompletedState(ids); saveCompleted(ids) }
  const setPartner = (snap: PartnerSnapshot | null) => { setPartnerState(snap); savePartner(snap) }

  const toggleComplete = (id: string) => {
    const next = new Set(completed)
    next.has(id) ? next.delete(id) : next.add(id)
    setCompleted(next)
  }

  const setDayMode = (sessionId: string, mode: 'hyrox' | 'strength' | null) => {
    const next = { ...(profile.dayModeOverrides ?? {}) }
    if (mode === null) delete next[sessionId]
    else next[sessionId] = mode
    setProfile({ ...profile, dayModeOverrides: next })
  }

  // Parse ?partner= URL param on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('partner')
    if (code) {
      const snap = decodeSnapshot(code)
      if (snap) { setPartner(snap); setTab('partner') }
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  useEffect(() => { saveProfile(profile) }, [profile])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <UpdateBanner />
      <Header activeTab={tab} onTabChange={setTab} profile={profile} partner={partner} />
      <main>
        {tab === 'today'     && <Today profile={profile} completed={completed} onToggleComplete={toggleComplete} onSetDayMode={setDayMode} />}
        {tab === 'dashboard' && <Dashboard profile={profile} />}
        {tab === 'plan'      && <TrainingPlan profile={profile} completed={completed} onToggleComplete={toggleComplete} />}
        {tab === 'analysis'  && <SplitAnalysis profile={profile} />}
        {tab === 'partner'   && <Partner profile={profile} completed={completed} partner={partner} onSetPartner={setPartner} />}
        {tab === 'settings'  && <Settings profile={profile} setProfile={setProfile} />}
      </main>
    </div>
  )
}
