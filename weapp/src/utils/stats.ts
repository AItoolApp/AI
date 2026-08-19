import { Habit, HabitStats } from './constants'
import { todayStr, formatDate } from './storage'

function isRestDay(h: Habit, d: Date): boolean {
  return !!(h.restDays && h.restDays.includes(d.getDay()))
}

/** 当前连击：休息日跳过，不计入也不打断 */
export function getStreak(h: Habit): number {
  if (!h.checkins) return 0
  let streak = 0
  const dd = new Date()
  while (true) {
    if (isRestDay(h, dd)) {
      dd.setDate(dd.getDate() - 1)
      continue
    }
    const ds = formatDate(dd.getFullYear(), dd.getMonth() + 1, dd.getDate())
    if (h.checkins[ds]) {
      streak++
      dd.setDate(dd.getDate() - 1)
    } else break
  }
  return streak
}

export function calcStats(habits: Habit[]): HabitStats[] {
  return habits.map(h => {
    let longest = 0
    let cur = 0
    let total = 0
    let monthC = 0
    const now = new Date()
    const ms = formatDate(now.getFullYear(), now.getMonth() + 1, 1)
    const md = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const td = todayStr()
    const ck = !!(h.checkins && h.checkins[td])
    const streak = getStreak(h)

    if (h.checkins) {
      const dates = Object.keys(h.checkins).sort()
      total = dates.length

      // 最长连击：按天遍历，休息日不断，未打卡（非休息日）归零
      if (dates.length > 0) {
        const min = new Date(dates[0])
        const max = new Date(dates[dates.length - 1])
        const cur2 = new Date(min)
        while (cur2 <= max) {
          const ds = formatDate(cur2.getFullYear(), cur2.getMonth() + 1, cur2.getDate())
          if (h.checkins![ds]) {
            cur++
            longest = Math.max(longest, cur)
          } else if (isRestDay(h, cur2)) {
            // 休息日：不断
          } else {
            cur = 0
          }
          cur2.setDate(cur2.getDate() + 1)
        }
      }

      dates.forEach(ds => {
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
