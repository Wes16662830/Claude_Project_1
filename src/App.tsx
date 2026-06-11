import { useEffect, useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import TrainingPlan from './components/TrainingPlan'
import SplitAnalysis from './components/SplitAnalysis'
import Settings from './components/Settings'
import { loadProfile, saveProfile, type Profile } from './data/profile'

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [profile, setProfileState] = useState<Profile>(() => loadProfile())

  const setProfile = (p: Profile) => {
    setProfileState(p)
    saveProfile(p)
  }

  // Belt-and-braces: persist on any profile change.
  useEffect(() => { saveProfile(profile) }, [profile])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Header activeTab={tab} onTabChange={setTab} profile={profile} />
      <main>
        {tab === 'dashboard' && <Dashboard profile={profile} />}
        {tab === 'plan' && <TrainingPlan profile={profile} />}
        {tab === 'analysis' && <SplitAnalysis profile={profile} />}
        {tab === 'settings' && <Settings profile={profile} setProfile={setProfile} />}
      </main>
    </div>
  )
}
