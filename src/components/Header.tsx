import React, { useState, useEffect } from 'react'
import { fmtTime } from '../data/raceData'
import { getDivision, type Profile } from '../data/profile'
import type { PartnerSnapshot } from '../data/progress'

interface HeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
  profile: Profile
  partner: PartnerSnapshot | null
}

const TABS = [
  { id: 'today',    label: 'Today' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'plan', label: 'Training Plan' },
  { id: 'analysis', label: 'Split Analysis' },
  { id: 'partner', label: 'Partner' },
  { id: 'settings', label: 'Settings' },
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

// Detect iOS (Safari doesn't fire beforeinstallprompt)
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
const isInStandaloneMode = 'standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone

export default function Header({ activeTab, onTabChange, profile, partner }: HeaderProps) {
  const division = getDivision(profile.division)
  const first = (name: string) => name.trim().split(' ')[0] || name
  const title = profile.athlete2.trim()
    ? `${first(profile.athlete1)} + ${first(profile.athlete2)}`
    : first(profile.athlete1) || 'My Hyrox'

  // PWA install prompt (Chrome/Android)
  const [installPrompt, setInstallPrompt] = useState<Event & { prompt: () => void } | null>(null)
  const [showIOSHint, setShowIOSHint] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as Event & { prompt: () => void })
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      setInstallPrompt(null)
    } else if (isIOS) {
      setShowIOSHint(h => !h)
    }
  }

  const showInstallBtn = !isInStandaloneMode && (installPrompt !== null || isIOS)

  return (
    <header style={headerStyle}>
      <div style={topStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', color: '#f0ede8' }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: '#888', letterSpacing: '0.5px' }}>
            {division.label}{profile.lastRaceName ? ` · ${profile.lastRaceName}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showInstallBtn && (
            <button
              onClick={handleInstall}
              style={{
                background: '#e8962a18', border: '1px solid #e8962a55', borderRadius: 8,
                padding: '6px 12px', color: '#e8962a', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <span style={{ fontSize: 14 }}>⬇</span> Install app
            </button>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#e8962a', letterSpacing: '-1px' }}>
              {fmtTime(profile.targetFinishSeconds)}
            </div>
            <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {profile.nextRaceName || 'next race'} target
            </div>
          </div>
        </div>
      </div>

      {/* iOS install hint */}
      {showIOSHint && (
        <div style={{ background: '#1a1400', border: '1px solid #e8962a33', borderRadius: 8, padding: '10px 14px', marginBottom: 10, fontSize: 13, color: '#ccc', lineHeight: 1.6 }}>
          Tap <b style={{ color: '#e8962a' }}>Share</b> (the box-with-arrow icon at the bottom of Safari), then tap <b style={{ color: '#e8962a' }}>Add to Home Screen</b>.
        </div>
      )}

      <nav style={{ display: 'flex', gap: 4, borderTop: '1px solid #1a1a1a', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} style={tabStyle(activeTab === t.id)} onClick={() => onTabChange(t.id)}>
            {t.label}
            {t.id === 'partner' && partner && (
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#2a8c5a', marginLeft: 5, verticalAlign: 'middle', marginBottom: 1 }} />
            )}
          </button>
        ))}
      </nav>
    </header>
  )
}
