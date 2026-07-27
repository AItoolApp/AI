import { Habit, HabitStats } from './constants'
import { todayStr, formatDate } from './storage'

export function calcStats(habits: Habit[]): HabitStats[] {
  return habits.map(h => {
    let streak = 0
    let longest = 0
    let cur = 0
    let prev: Date | null = null
    let total = 0
    let monthC = 0
    const now = new Date()
    const ms = formatDate(now.getFullYear(), now.getMonth() + 1, 1)
    const md = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const td = todayStr()
    const ck = !!(h.checkins && h.checkins[td])

    if (h.checkins) {
      const dates = Object.keys(h.checkins).sort()
      total = dates.length

      // Compute current streak
      const dd = new Date()
      while (true) {
        const ds = formatDate(dd.getFullYear(), dd.getMonth() + 1, dd.getDate())
        if (h.checkins[ds]) {
          streak++
          dd.setDate(dd.getDate() - 1)
        } else break
      }

      // Compute longest streak and month count
      dates.forEach(ds => {
        const dt = new Date(ds)
        if (prev === null || (dt.getTime() - prev.getTime()) / 86400000 === 1) {
          cur++
        } else {
          cur = 1
        }
        longest = Math.max(longest, cur)
        prev = dt
        if (ds >= ms) monthC++
      })
    }

    const monthRate = md > 0 ? Math.round(monthC / md * 100) : 0

    return {
      id: h.id,
      name: h.name,
      emoji: h.emoji,
      total,
      streak,
      longest,
      month_rate: monthRate,
      today: ck
    }
  })
}


/** Get current consecutive checkin streak for a single habit */
export function getStreak(h: Habit): number {
  if (!h.checkins) return 0
  let streak = 0
  const dd = new Date()
  while (true) {
    const ds = formatDate(dd.getFullYear(), dd.getMonth() + 1, dd.getDate())
    if (h.checkins[ds]) {
      streak++
      dd.setDate(dd.getDate() - 1)
    } else break
  }
  return streak
}

export function getCheckinCounts(habits: Habit[]): Record<string, number> {
  const map: Record<string, number> = {}
  habits.forEach(h => {
    if (h.checkins) {
      Object.keys(h.checkins).forEach(d => {
        map[d] = (map[d] || 0) + 1
      })
    }
  })
  return map
}
/* End of File */
