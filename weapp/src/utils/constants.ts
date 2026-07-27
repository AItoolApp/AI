// 习惯打卡 - 常量定义

export const EMOJIS = [
  '😊','🎧','⭐','☕','🎯','💪','🏃','🎨',
  '🌱','🍳','📝','🎬','🧘','😺','🫶','🎵',
  '🎮','📖','🚴','✌️'
]

export const COLORS = [
  '#ff6b6b','#00d2d3','#a29bfe','#feca57','#00b894',
  '#fd79a8','#74b9ff','#e17055','#00cec9','#e84393'
]

export const THEMES = [
  { key: 'latte', name: '奶油拿铁', color: '#f5ece3' },
  { key: 'mint', name: '薄荷苏打', color: '#e4f0e4' },
  { key: 'peach', name: '蜜桃乌龙', color: '#f4e4ea' },
  { key: 'ocean', name: '海盐汽水', color: '#e4eef4' },
  { key: 'sunset', name: '落日海岸', color: '#f4e8d8' },
  { key: 'midnight', name: '星空午夜', color: '#1a1a2e' },
]

export const DEFAULT_THEME = 'latte'

export interface Habit {
  id: number
  name: string
  emoji: string
  color: string
  checkins: Record<string, boolean>
}

export interface HabitStats {
  id: number
  name: string
  emoji: string
  total: number
  streak: number
  longest: number
  month_rate: number
  today: boolean
}

export interface AppData {
  habits: Habit[]
  theme: string
}

export const STORAGE_KEY = 'habit_data'

export const WEEKDAYS = ['日','一','二','三','四','五','六']
/* End of File */
