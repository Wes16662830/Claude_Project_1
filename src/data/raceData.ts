// Time formatting helpers. Race/segment/athlete data now lives in the
// personalisable Profile (see profile.ts) and persists to localStorage.

export const fmtTime = (s: number): string => {
  const abs = Math.round(Math.abs(s))
  const sign = s < 0 ? '-' : ''
  return `${sign}${Math.floor(abs / 60)}:${(abs % 60).toString().padStart(2, '0')}`
}

export const fmtPace = (s: number): string => fmtTime(s) + '/km'

// Parse "mm:ss" (or "h:mm:ss") into seconds. Returns null if unparseable.
export const parseTime = (input: string): number | null => {
  const parts = input.trim().split(':').map(p => p.trim())
  if (parts.length === 0 || parts.some(p => p === '' || isNaN(Number(p)))) return null
  const nums = parts.map(Number)
  if (nums.length === 1) return nums[0]
  if (nums.length === 2) return nums[0] * 60 + nums[1]
  if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2]
  return null
}
