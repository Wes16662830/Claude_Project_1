import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { SEGMENTS, ACTUAL_FINISH, TARGET_FINISH, fmtTime } from '../data/raceData'

const card: React.CSSProperties = {
  background: '#111',
  border: '1px solid #1e1e1e',
  borderRadius: 12,
  padding: '20px 24px',
}

const sectionTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: '#aaa',
  marginBottom: 20,
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
}

const th: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 11,
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  padding: '0 12px 10px 0',
  borderBottom: '1px solid #1e1e1e',
}

const td: React.CSSProperties = {
  padding: '12px 12px 12px 0',
  borderBottom: '1px solid #141414',
  fontSize: 14,
  verticalAlign: 'top',
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload) return null
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ fontSize: 13, color: p.color }}>
          {p.name}: {fmtTime(p.value)}
        </div>
      ))}
    </div>
  )
}

const chartData = SEGMENTS.map(s => ({
  name: s.label,
  Actual: s.actualSeconds,
  Target: s.targetSeconds,
}))

const gapData = SEGMENTS.map(s => ({
  name: s.label,
  gap: Math.abs(s.deltaSeconds),
  positive: s.deltaSeconds >= 0,
}))

export default function SplitAnalysis() {
  return (
    <div style={{ padding: '24px', maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={card}>
        <div style={sectionTitle}>Actual vs Target (seconds)</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: '#888', fontSize: 11 }} tickLine={false} axisLine={false}
              tickFormatter={(v: number) => fmtTime(v)} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#aaa' }} />
            <Bar dataKey="Actual" fill="#d63b2f" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Target" fill="#2a8c5a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={card}>
        <div style={sectionTitle}>Gap to Target (seconds) — red = lost time</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={gapData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: '#888', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
              labelStyle={{ color: '#aaa', fontSize: 12 }}
              itemStyle={{ color: '#f0ede8' }}
              formatter={(v: number) => [`${v}s`, 'Gap']}
            />
            <Bar dataKey="gap" radius={[3, 3, 0, 0]}>
              {gapData.map((entry, i) => (
                <Cell key={i} fill={entry.positive ? '#2a8c5a' : '#d63b2f'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={card}>
        <div style={sectionTitle}>Segment Detail</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Segment</th>
              <th style={th}>JHB Actual</th>
              <th style={th}>Target</th>
              <th style={th}>Delta</th>
              <th style={th}>Note</th>
            </tr>
          </thead>
          <tbody>
            {SEGMENTS.map(seg => {
              const color = seg.deltaSeconds >= 0 ? '#2a8c5a' : seg.deltaSeconds > -15 ? '#e8962a' : '#d63b2f'
              const isRun = seg.type === 'run'
              return (
                <tr key={seg.id}>
                  <td style={{ ...td, fontWeight: 600, color: '#f0ede8' }}>
                    {seg.label}
                    {isRun && <span style={{ fontSize: 11, color: '#666', marginLeft: 6 }}>pace</span>}
                  </td>
                  <td style={{ ...td, color: '#ccc', fontFamily: 'monospace' }}>
                    {isRun ? fmtTime(seg.actualSeconds) + '/km' : fmtTime(seg.actualSeconds)}
                  </td>
                  <td style={{ ...td, color: '#ccc', fontFamily: 'monospace' }}>
                    {isRun ? fmtTime(seg.targetSeconds) + '/km' : fmtTime(seg.targetSeconds)}
                  </td>
                  <td style={{ ...td, color, fontWeight: 700, fontFamily: 'monospace' }}>
                    {seg.deltaSeconds >= 0 ? '+' : ''}{seg.deltaSeconds}s
                  </td>
                  <td style={{ ...td, color: '#777', fontSize: 12 }}>{seg.note}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#888' }}>JHB total: {fmtTime(ACTUAL_FINISH)}</span>
          <span style={{ fontSize: 13, color: '#888' }}>Cape Town target: {fmtTime(TARGET_FINISH)}</span>
        </div>
      </div>
    </div>
  )
}
