import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import TrainingPlan from './components/TrainingPlan'
import SplitAnalysis from './components/SplitAnalysis'

export default function App() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Header activeTab={tab} onTabChange={setTab} />
      <main>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'plan' && <TrainingPlan />}
        {tab === 'analysis' && <SplitAnalysis />}
      </main>
    </div>
  )
}
