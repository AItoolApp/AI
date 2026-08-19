// 宠物养成 v1.3 初版（泡泡玛特风，形象后续替换为正式素材）
import Taro from '@tarojs/taro'

export const PET_TYPES = [
  { key: 'qilin', name: '麒麟', emoji: '🦌' },
  { key: 'dragon', name: '小龙', emoji: '🐉' },
  { key: 'turtle', name: '小乌龟', emoji: '🐢' }
]

/** 试运行孵化值：正式版按规划改回 21 */
export const HATCH_ENERGY = 7

export interface PetData {
  type: string
  stage: 'egg' | 'baby' | 'adult'
  sleeping: boolean
  hatchedAt?: string
}

const PET_KEY = 'habit_pet'

export function loadPet(): PetData | null {
  try {
    const raw = Taro.getStorageSync(PET_KEY)
    if (!raw) return null
    const d = JSON.parse(raw) as PetData
    return d && d.type ? d : null
  } catch (e) {
    return null
  }
}

export function savePet(pet: PetData): boolean {
  try {
    Taro.setStorageSync(PET_KEY, JSON.stringify(pet))
    return true
  } catch (e) {
    return false
  }
}

export function defaultEgg(): PetData {
  return { type: 'egg', stage: 'egg', sleeping: true }
}

export function randomHatch(): PetData {
  const idx = Math.floor(Math.random() * PET_TYPES.length)
  const t = PET_TYPES[idx]
  return {
    type: t.key,
    stage: 'baby',
    sleeping: true,
    hatchedAt: new Date().toISOString()
  }
}

/* ─── 学习小目标（英语/成长预设）─── */

export const PRESET_GOALS = [
  { key: 'oral', category: '英语学习', name: '第一次英语口语交流', emoji: '🗣️' },
  { key: 'book', category: '英语学习', name: '读完一本英文原版书', emoji: '📖' },
  { key: 'movie', category: '英语学习', name: '无字幕看一部英文电影', emoji: '🎬' },
  { key: 'abroad', category: '英语学习', name: '出国旅行用英语点餐问路', emoji: '✈️' },
  { key: 'kaoyan_words', category: '考研备考', name: '背完一轮考研核心词汇', emoji: '📚' },
  { key: 'kaoyan_paper', category: '考研备考', name: '精读 10 篇真题阅读', emoji: '📝' },
  { key: 'kaoyan_mock', category: '考研备考', name: '完成 3 次全真模拟', emoji: '⏱️' },
  { key: 'cog_model', category: '认知提升', name: '掌握 5 个思维模型并实践', emoji: '🧠' },
  { key: 'cog_book', category: '认知提升', name: '读完一本认知类好书并输出笔记', emoji: '📖' },
  { key: 'life_sleep', category: '生活方式', name: '连续 30 天 23:30 前睡觉', emoji: '😴' },
  { key: 'life_sport', category: '生活方式', name: '每周运动 3 次，坚持 1 个月', emoji: '🏃' }
]

const GOALS_KEY = 'habit_goals'
const CUSTOM_GOALS_KEY = 'habit_custom_goals'

export function loadGoals(): string[] {
  try {
    const raw = Taro.getStorageSync(GOALS_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch (e) {
    return []
  }
}

export function saveGoals(goals: string[]): boolean {
  try {
    Taro.setStorageSync(GOALS_KEY, JSON.stringify(goals))
    return true
  } catch (e) {
    return false
  }
}

export function loadCustomGoals(): string[] {
  try {
    const raw = Taro.getStorageSync(CUSTOM_GOALS_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch (e) {
    return []
  }
}

export function saveCustomGoals(goals: string[]): boolean {
  try {
    Taro.setStorageSync(CUSTOM_GOALS_KEY, JSON.stringify(goals))
    return true
  } catch (e) {
    return false
  }
}
