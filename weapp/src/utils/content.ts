// 今日知识卡片：内容库与每日推荐（v1.2 第 1 轮）
export interface ContentCard {
  id: string
  category: string
  type: 'quote' | 'video' | 'tip'
  title: string
  text: string
  source: string
  link: string
  tags: string[]
}

export interface Identity {
  key: string
  name: string
  emoji: string
  desc: string
  prefs: string[]
}

export const IDENTITIES: Identity[] = [
  { key: 'kaoyan', name: '考研备考', emoji: '📚', desc: '每天学习打卡，稳稳上岸', prefs: ['learning', 'cognition', 'growth', 'research'] },
  { key: 'study', name: '学习成长', emoji: '🌱', desc: '学点东西，持续进步', prefs: ['learning', 'literature', 'cognition', 'growth'] },
  { key: 'cognition', name: '认知提升', emoji: '🧠', desc: '思维升级，效率翻倍', prefs: ['cognition', 'learning', 'growth', 'lifestyle'] },
  { key: 'life', name: '生活方式', emoji: '🍵', desc: '高质量生活，爱自己', prefs: ['wellness', 'lifestyle', 'literature', 'growth'] }
]

export const CONTENT_LIBRARY: ContentCard[] = [
  // ── 文学经典 ──
  { id: 'lit-001', category: 'literature', type: 'quote', title: '文学经典', text: '一个人可以被毁灭，但不能被打败。', source: '海明威《老人与海》', link: '', tags: ['文学', '经典', '励志'] },
  { id: 'lit-002', category: 'literature', type: 'quote', title: '文学经典', text: '道生一，一生二，二生三，三生万物。', source: '老子《道德经》', link: '', tags: ['经典', '哲学'] },
  { id: 'lit-003', category: 'literature', type: 'quote', title: '文学经典', text: '学而时习之，不亦说乎？', source: '《论语》', link: '', tags: ['经典', '学习'] },
  { id: 'lit-004', category: 'literature', type: 'quote', title: '文学经典', text: '路漫漫其修远兮，吾将上下而求索。', source: '屈原《离骚》', link: '', tags: ['经典', '成长'] },
  // ── 成长励志 ──
  { id: 'gro-001', category: 'growth', type: 'quote', title: '成长励志', text: '种一棵树最好的时间是十年前，其次是现在。', source: '非洲谚语', link: '', tags: ['成长', '行动'] },
  { id: 'gro-002', category: 'growth', type: 'quote', title: '成长励志', text: '日拱一卒，功不唐捐。', source: '《法华经》句意', link: '', tags: ['成长', '坚持'] },
  { id: 'gro-003', category: 'growth', type: 'quote', title: '成长励志', text: '不要因为走得太远，而忘记为什么出发。', source: '纪伯伦', link: '', tags: ['成长', '初心'] },
  // ── 养生放松爱自己 ──
  { id: 'wel-001', category: 'wellness', type: 'quote', title: '养生放松', text: '身体是革命的本钱，先照顾好自己，再谈远方。', source: '生活小记', link: '', tags: ['健康', '爱自己'] },
  { id: 'wel-002', category: 'wellness', type: 'quote', title: '养生放松', text: '睡前原谅一切，醒来便是新生。', source: '生活小记', link: '', tags: ['放松', '情绪'] },
  { id: 'wel-003', category: 'wellness', type: 'tip', title: '养生放松', text: '试试 4-7-8 呼吸法：吸气 4 秒，屏息 7 秒，呼气 8 秒，重复 4 组，帮助入眠。', source: '放松技巧', link: '', tags: ['呼吸', '睡眠'] },
  // ── 学习方法 ──
  { id: 'lrn-001', category: 'learning', type: 'tip', title: '学习方法', text: '费曼学习法：把你刚学的内容讲给一个完全不懂的人听，讲不明白的地方就是你的知识漏洞。', source: '费曼学习法', link: '', tags: ['学习', '方法'] },
  { id: 'lrn-002', category: 'learning', type: 'tip', title: '学习方法', text: '番茄工作法：25 分钟专注 + 5 分钟休息，每 4 轮休息 15-30 分钟。适合启动困难的任务。', source: '番茄工作法', link: '', tags: ['专注', '效率'] },
  { id: 'lrn-003', category: 'learning', type: 'video', title: '牛津大学博士的时间管理黑科技', text: '把 24 小时用成 48 小时（中英校译）', source: 'B站', link: 'https://www.bilibili.com/video/BV15VFEz4E9M/', tags: ['时间管理', '成长'] },
  { id: 'lrn-004', category: 'learning', type: 'video', title: '你真的可以在两周内学会任何东西', text: '学习方法论：快速入门任何技能', source: 'B站', link: 'https://www.bilibili.com/video/BV148QZBzEDV/', tags: ['学习', '方法'] },
  { id: 'lrn-005', category: 'learning', type: 'video', title: 'ChatGPT 当英语陪练太强啦', text: '职场·雅思·日常三场景，Native Speaker 角色扮演免费陪练', source: 'B站', link: 'https://www.bilibili.com/video/BV1o2L36eEiw/', tags: ['英语', 'AI'] },
  { id: 'lrn-006', category: 'learning', type: 'video', title: '全英 vlog：告别哑巴英语', text: '被油管博主狠狠投喂，沉浸式英语输入', source: 'B站', link: 'https://www.bilibili.com/video/BV1K2bB64EF5/', tags: ['英语', '听力'] },
  // ── 认知提升 ──
  { id: 'cog-001', category: 'cognition', type: 'tip', title: '认知提升', text: '复利思维：每天进步 1%，一年后是 37.8 倍；每天退步 1%，一年后只剩 0.03。', source: '复利公式', link: '', tags: ['认知', '成长'] },
  { id: 'cog-002', category: 'cognition', type: 'quote', title: '认知提升', text: '我们听到的一切都是一个观点，不是事实；我们看见的一切都是一个视角，不是真相。', source: '马可·奥勒留', link: '', tags: ['认知', '思考'] },
  { id: 'cog-003', category: 'cognition', type: 'tip', title: '认知提升', text: '把“我做不到”换成“我暂时还没做到”，思维会从固定型转向成长型。', source: '成长型思维', link: '', tags: ['认知', '心态'] },
  // ── 学术研究 ──
  { id: 'res-001', category: 'research', type: 'tip', title: '学术研究', text: '读论文三步法：先读摘要和结论，再读图表，最后精读方法。不要从头读到尾。', source: '学术方法', link: '', tags: ['学术', '论文'] },
  { id: 'res-002', category: 'research', type: 'tip', title: '学术研究', text: '文献管理：每天固定 20 分钟整理 Zotero，给每篇文献写一句“这篇对我有什么用”。', source: '学术方法', link: '', tags: ['文献', '效率'] },
  // ── 高质量生活方式 ──
  { id: 'lfs-001', category: 'lifestyle', type: 'video', title: 'Shopify 新手建站全攻略（2026 最新版）', text: '独立站从 0 到 1 的完整流程', source: 'B站', link: 'https://www.bilibili.com/video/BV1x1dpBjEzp/', tags: ['副业', '建站'] },
  { id: 'lfs-002', category: 'lifestyle', type: 'quote', title: '生活方式', text: '生活不是赶路，而是感受路。', source: '生活小记', link: '', tags: ['生活', '松弛'] },
  { id: 'lfs-003', category: 'lifestyle', type: 'tip', title: '生活方式', text: '每天睡前写下三件值得感谢的小事，连续 21 天，情绪会明显变好。', source: '感恩练习', link: '', tags: ['情绪', '习惯'] }
]

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86400000)
}

export function getTodayCard(identityKey?: string): ContentCard {
  const idt = IDENTITIES.find(x => x.key === identityKey) || IDENTITIES[1]
  const doy = dayOfYear(new Date())
  // 按身份偏好选板块，再按日期在板块内轮换
  const cat = idt.prefs[doy % idt.prefs.length]
  const items = CONTENT_LIBRARY.filter(x => x.category === cat)
  const card = items[doy % items.length] || CONTENT_LIBRARY[0]
  return card
}
