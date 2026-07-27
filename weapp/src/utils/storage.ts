import Taro from '@tarojs/taro'
import { Habit, AppData, STORAGE_KEY, DEFAULT_THEME } from './constants'

export function loadData(): AppData {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as AppData
      return data
    }
  } catch (e) {
    console.error('loadData error:', e)
  }
  return { habits: [], theme: DEFAULT_THEME }
}

export function saveData(data: AppData): void {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('saveData error:', e)
  }
}

export function todayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay()
}
/* End of File */

/** Load saved theme key from storage */
export function loadTheme(): string {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as AppData
      return data.theme || DEFAULT_THEME
    }
  } catch (e) {
    console.error('loadTheme error:', e)
  }
  return DEFAULT_THEME
}
