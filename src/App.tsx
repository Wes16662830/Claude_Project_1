import { useEffect, useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import TrainingPlan from './components/TrainingPlan'
import SplitAnalysis from './components/SplitAnalysis'
import Settings from './components/Settings'
import Partner from './components/Partner'
import { loadProfile, saveProfile, type Profile } from './data/profile'
import {
  loadCompleted, saveCompleted, loadPartner, savePartner,
  decodeSnapshot, type PartnerSnapshot,
} from './data/progress'

export default function App() {
  const [tab, setTab] = useState('dashboard')
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
      <Header activeTab={tab} onTabChange={setTab} profile={profile} partner={partner} />
      <main>
        {tab === 'dashboard' && <Dashboard profile={profile} />}
        {tab === 'plan'      && <TrainingPlan profile={profile} completed={completed} onToggleComplete={toggleComplete} />}
        {tab === 'analysis'  && <SplitAnalysis profile={profile} />}
        {tab === 'partner'   && <Partner profile={profile} completed={completed} partner={partner} onSetPartner={setPartner} />}
        {tab === 'settings'  && <Settings profile={profile} setProfile={setProfile} />}
      </main>
    </div>
  )
}
