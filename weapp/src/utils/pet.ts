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
