import Taro from '@tarojs/taro'
import { Habit, AppData, STORAGE_KEY, CHECKIN_KEY_PREFIX, DATA_VERSION, DEFAULT_THEME } from './constants'

/**
 * v1.1 存储重构（P0-1 / P0-5）
 *
 * 结构变化：
 * - `habit_data`（meta）只存 habits 元信息（无 checkins）+ theme + schemaVersion，体积小；
 * - 每个习惯的打卡记录独立存 `habit_checkins_<id>`，打卡时只写一个 key，不再全量重写；
 * - 读取时自动合并并迁移旧数据（v1 的 checkins 内联在 habit_data 里）。
 */

interface StoredHabit {
  id: number
  name: string
  emoji: string
  color: string
  /** 每周休息日（0=周日…6=周六），v1.2 起可设置 */
  restDays?: number[]
  /** v1 旧数据可能内联 checkins；迁移后不再写入 */
  checkins?: Record<string, boolean>
}

interface StoredData {
  schemaVersion?: number
  habits: StoredHabit[]
  theme: string
}

function emptyData(): AppData {
  return { habits: [], theme: DEFAULT_THEME, schemaVersion: DATA_VERSION }
}

/** 存储写入失败兜底（P0-1）：提示用户而非静默丢数据 */
function notifyStorageFull() {
  try {
    Taro.showModal({
      title: '保存失败',
      content: '本地存储空间不足，记录可能无法保存。请删除一些不再需要的习惯或数据。',
      showCancel: false
    })
  } catch (e) {
    console.error('notifyStorageFull error:', e)
  }
}

function readMeta(): StoredData | null {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as StoredData
    if (!data || typeof data !== 'object') return null
    return data
  } catch (e) {
    console.error('readMeta error:', e)
    return null
  }
}

function writeMeta(data: StoredData): boolean {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('writeMeta error:', e)
    notifyStorageFull()
    return false
  }
}

function readCheckins(id: number): Record<string, boolean> {
  try {
    const raw = Taro.getStorageSync(CHECKIN_KEY_PREFIX + id)
    if (raw) {
      const data = JSON.parse(raw) as Record<string, boolean>
      return data && typeof data === 'object' ? data : {}
    }
  } catch (e) {
    console.error('readCheckins error:', e)
  }
  return {}
}

/** v1 → v2：把内联在 habit_data 里的 checkins 拆到独立 key，并写入 schemaVersion */
function migrateIfNeeded(data: StoredData): StoredData {
  const version = data.schemaVersion || 1
  if (version >= DATA_VERSION) return data

  const habits: StoredHabit[] = (data.habits || []).map(h => {
    if (h.checkins && Object.keys(h.checkins).length > 0) {
      try {
        Taro.setStorageSync(CHECKIN_KEY_PREFIX + h.id, JSON.stringify(h.checkins))
      } catch (e) {
        console.error('migrate checkins error:', e)
      }
    }
    // 元信息里不再保留 checkins
    return { id: h.id, name: h.name, emoji: h.emoji, color: h.color, restDays: h.restDays || [] }
  })

  const next: StoredData = { ...data, schemaVersion: DATA_VERSION, habits }
  writeMeta(next)
  return next
}

/** 读取完整数据（自动迁移 + 合并各习惯的打卡记录），页面层无需感知拆分 */
export function loadData(): AppData {
  const meta = readMeta()
  if (!meta) return emptyData()
  const migrated = migrateIfNeeded(meta)
  const habits: Habit[] = (migrated.habits || []).map(h => ({
    ...h,
    restDays: h.restDays || [],
    checkins: readCheckins(h.id)
  }))
  return { habits, theme: migrated.theme || DEFAULT_THEME, schemaVersion: DATA_VERSION }
}

/** 全量保存（习惯增删改/主题变化等低频操作）：meta 与各 checkins key 分开写 */
export function saveData(data: AppData): boolean {
  let ok = true

  for (const h of data.habits || []) {
    if (h.checkins !== undefined && !saveHabitCheckins(h.id, h.checkins)) ok = false
  }

  const meta: StoredData = {
    schemaVersion: DATA_VERSION,
    theme: data.theme || DEFAULT_THEME,
    habits: (data.habits || []).map(h => ({ id: h.id, name: h.name, emoji: h.emoji, color: h.color, restDays: h.restDays || [] }))
  }
  if (!writeMeta(meta)) ok = false
  return ok
}

/** 只写单个习惯的打卡记录（打卡/取消打卡热路径，一次只写一个 key） */
export function saveHabitCheckins(id: number, checkins: Record<string, boolean>): boolean {
  try {
    Taro.setStorageSync(CHECKIN_KEY_PREFIX + id, JSON.stringify(checkins))
    return true
  } catch (e) {
    console.error('saveHabitCheckins error:', e)
    notifyStorageFull()
    return false
  }
}

/** 删除习惯时清理其打卡记录 key */
export function removeHabitData(id: number): void {
  try {
    Taro.removeStorageSync(CHECKIN_KEY_PREFIX + id)
  } catch (e) {
    console.error('removeHabitData error:', e)
  }
}

/** 只更新主题（不重写任何打卡数据） */
export function saveTheme(theme: string): boolean {
  const meta = readMeta()
  if (!meta) return false
  return writeMeta({ ...meta, theme, schemaVersion: DATA_VERSION })
}

/** 读取已保存的主题（v1.1 起直接读 meta，不再解析整份数据） */
export function loadTheme(): string {
  const meta = readMeta()
  return (meta && meta.theme) || DEFAULT_THEME
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

/* ─── 用户身份（v1.2 第 1 轮）─── */

const IDENTITY_KEY = 'habit_identity'

export function loadIdentity(): string {
  try {
    return Taro.getStorageSync(IDENTITY_KEY) || ''
  } catch (e) {
    console.error('loadIdentity error:', e)
    return ''
  }
}

export function saveIdentity(key: string): boolean {
  try {
    Taro.setStorageSync(IDENTITY_KEY, key)
    return true
  } catch (e) {
    console.error('saveIdentity error:', e)
    return false
  }
}

/* ─── 补签能量（v1.2 第 1 轮反馈：坚持打卡积累能量，兑换补签）─── */

const ENERGY_KEY = 'habit_makeup_energy'
const ENERGY_DATE_KEY = 'habit_energy_date'
export const MAKEUP_COST = 3

export function loadEnergy(): number {
  try {
    const n = parseInt(Taro.getStorageSync(ENERGY_KEY), 10)
    return isNaN(n) ? 0 : n
  } catch (e) {
    return 0
  }
}

function saveEnergy(n: number) {
  try {
    Taro.setStorageSync(ENERGY_KEY, String(Math.max(0, n)))
  } catch (e) {
    console.error('saveEnergy error:', e)
  }
}

/** 每天第一次打卡奖励 1 点能量，返回当前能量 */
export function awardEnergyOnceToday(): number {
  const today = todayStr()
  try {
    const last = Taro.getStorageSync(ENERGY_DATE_KEY)
    if (last === today) return loadEnergy()
    Taro.setStorageSync(ENERGY_DATE_KEY, today)
  } catch (e) {
    console.error('awardEnergy date error:', e)
  }
  const next = loadEnergy() + 1
  saveEnergy(next)
  return next
}

export function spendEnergy(cost: number): boolean {
  const cur = loadEnergy()
  if (cur < cost) return false
  saveEnergy(cur - cost)
  return true
}

export function refundEnergy(n: number) {
  saveEnergy(loadEnergy() + n)
}

/** 新建习惯的一次性能量奖励（v1.3 试运行：让孵化更快可测） */
export function addHabitBonusEnergy(): number {
  const next = loadEnergy() + 1
  saveEnergy(next)
  return next
}
