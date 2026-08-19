// 知识卡片背景：分类底图 + 用户新增轮换素材
import literature from '../assets/cardbg/literature.jpg'
import learning from '../assets/cardbg/learning.jpg'
import cognition from '../assets/cardbg/cognition.jpg'
import growth from '../assets/cardbg/growth.jpg'
import wellness from '../assets/cardbg/wellness.jpg'
import research from '../assets/cardbg/research.jpg'
import lifestyle from '../assets/cardbg/lifestyle.jpg'
import extra01 from '../assets/cardbg/extra/card-01.jpg'
import extra02 from '../assets/cardbg/extra/card-02.jpg'
import extra03 from '../assets/cardbg/extra/card-03.jpg'
import extra04 from '../assets/cardbg/extra/card-04.jpg'
import extra05 from '../assets/cardbg/extra/card-05.jpg'
import extra06 from '../assets/cardbg/extra/card-06.jpg'
import extra07 from '../assets/cardbg/extra/card-07.jpg'

export const CARD_BG: Record<string, string> = {
  literature,
  learning,
  cognition,
  growth,
  wellness,
  research,
  lifestyle
}

/** 用户新增素材（WorkBuddy 生成） */
export const EXTRA_BG: string[] = [
  extra01, extra02, extra03, extra04, extra05, extra06, extra07
]

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86400000)
}

/**
 * 背景轮换：偶数日使用用户新增素材（按日轮换），奇数日使用分类底图。
 * 保留 7 张分类底图，同时让新素材参与日常轮换。
 */
export function getCardBg(category: string, date?: Date): string {
  const doy = dayOfYear(date || new Date())
  if (doy % 2 === 0 && EXTRA_BG.length > 0) {
    return EXTRA_BG[doy % EXTRA_BG.length]
  }
  return CARD_BG[category] || CARD_BG['learning']
}
