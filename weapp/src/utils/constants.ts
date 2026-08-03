// 习惯打卡 - 常量定义

export const EMOJIS = [
  '🫶','🎵','📖','🚴','✌️'
]

export const CUSTOM_ICON_KEYS = [
  'smile', 'cat', 'star', 'headphone', 'coffee', 'target', 'muscle',
  'running', 'art', 'plant', 'cooking', 'writing', 'movie', 'meditation', 'gaming'
]

import smile from '../assets/icons/smile.png'
import cat from '../assets/icons/cat.png'
import star from '../assets/icons/star.png'
import headphone from '../assets/icons/headphone.png'
import coffee from '../assets/icons/coffee.png'
import target from '../assets/icons/target.png'
import muscle from '../assets/icons/muscle.png'
import running from '../assets/icons/running.png'
import art from '../assets/icons/art.png'
import plant from '../assets/icons/plant.png'
import cooking from '../assets/icons/cooking.png'
import writing from '../assets/icons/writing.png'
import movie from '../assets/icons/movie.png'
import meditation from '../assets/icons/meditation.png'
import gaming from '../assets/icons/gaming.png'

export const ICON_MAP: Record<string, string> = {
  smile, cat, star, headphone, coffee, target, muscle,
  running, art, plant, cooking, writing, movie, meditation, gaming
}

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
