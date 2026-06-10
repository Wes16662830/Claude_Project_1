import React from 'react'
import { ATHLETE } from '../data/raceData'

interface HeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'plan', label: 'Training Plan' },
  { id: 'analysis', label: 'Split Analysis' },
]

const headerStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #111 0%, #0a0a0a 100%)',
  borderBottom: '1px solid #1e1e1e',
  padding: '0 24px',
  position: 'sticky',
  top: 0,
  zIndex: 100,
}

const topStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 0 12px',
  gap: 16,
  flexWrap: 'wrap',
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: '10px 20px',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    color: active ? '#f0ede8' : '#666',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid #e8962a' : '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
    letterSpacing: '0.2px',
    marginBottom: -1,
  }
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header style={headerStyle}>
      <div style={topStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', color: '#f0ede8' }}>
            {ATHLETE.name1.split(' ')[0]} + {ATHLETE.name2.split(' ')[0]}
          </div>
          <div style={{ fontSize: 12, color: '#888', letterSpacing: '0.5px' }}>
            {ATHLETE.event} · {ATHLETE.lastRace}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#e8962a', letterSpacing: '-1px' }}>
            {ATHLETE.target}
          </div>
          <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            {ATHLETE.nextRace} target
          </div>
        </div>
      </div>
      <nav style={{ display: 'flex', gap: 4, borderTop: '1px solid #1a1a1a' }}>
        {TABS.map(t => (
          <button key={t.id} style={tabStyle(activeTab === t.id)} onClick={() => onTabChange(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
