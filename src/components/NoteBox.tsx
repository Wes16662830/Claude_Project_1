import { useState, useEffect } from 'react'

// Per-session note editor. Local draft while typing; commits on blur.
// Shows a subtle saved state and works the same in Today and the Training Plan.
export default function NoteBox({
  value, onSave, compact = false,
}: {
  value: string
  onSave: (text: string) => void
  compact?: boolean
}) {
  const [draft, setDraft] = useState(value)
  const [focused, setFocused] = useState(false)
  useEffect(() => { if (!focused) setDraft(value) }, [value, focused])

  const dirty = draft.trim() !== value.trim()

  return (
    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: compact ? 8 : 12, padding: compact ? '10px 12px' : '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: compact ? 11 : 13, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          📝 Your notes
        </span>
        {value.trim() && !dirty && (
          <span style={{ fontSize: 10, color: '#2a8c5a', fontWeight: 600 }}>saved</span>
        )}
        {dirty && (
          <span style={{ fontSize: 10, color: '#e8962a', fontWeight: 600 }}>unsaved — tap away to save</span>
        )}
      </div>
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); if (dirty) onSave(draft) }}
        placeholder="How did it go? Times, splits, how you felt, what to change…"
        rows={compact ? 2 : 3}
        style={{
          width: '100%', resize: 'vertical', minHeight: compact ? 40 : 60,
          background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 6,
          padding: '9px 11px', color: '#f0ede8', fontSize: 13, fontFamily: 'inherit', lineHeight: 1.6,
        }}
      />
    </div>
  )
}
