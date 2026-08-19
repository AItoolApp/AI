import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Button, ScrollView, Image } from '@tarojs/components'
import { Habit, ICON_MAP } from '../../utils/constants'
import HabitIcon from '../../components/HabitIcon'
import { getStreak } from '../../utils/stats'
import { loadData, saveHabitCheckins, todayStr, loadTheme, loadIdentity, saveIdentity, loadEnergy, awardEnergyOnceToday } from '../../utils/storage'
import { getTodayCard, IDENTITIES, ContentCard } from '../../utils/content'
import { getCardBg } from '../../utils/cardTheme'
import { getNavBarHeight } from '../../utils/safeArea'
import './index.scss'

interface State {
  habits: Habit[]
  currentDate: string
  theme: string
  identity: string
  selected: string[]
  showIdentity: boolean
  card: ContentCard
  cardExpanded: boolean
  burst: number
  energy: number
}

export default class TodayPage extends Component<{}, State> {
  state: State = {
    habits: [],
    currentDate: todayStr(),
    theme: 'latte',
    identity: '',
    selected: [],
    showIdentity: false,
    card: getTodayCard(),
    cardExpanded: false,
    burst: 0,
    energy: 0
  }

  componentDidMount() {
    Taro.showShareMenu({ withShareTicket: true })
    this.loadHabits()
    this.loadTheme()
    this.initIdentity()
  }
  componentDidShow() { this.loadHabits(); this.loadTheme(); this.initIdentity() }

  initIdentity() {
    const identity = loadIdentity()
    if (identity) {
      this.setState({ identity, card: getTodayCard(identity) })
    } else {
      this.setState({ showIdentity: true })
    }
  }

  toggleSelect(key: string) {
    const { selected } = this.state
    const next = selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]
    this.setState({ selected: next })
  }

  confirmIdentity() {
    const keys = this.state.selected.length > 0 ? this.state.selected : ['study']
    const identity = keys.join(',')
    saveIdentity(identity)
    this.setState({ identity, showIdentity: false, card: getTodayCard(identity) })
  }

  loadHabits() {
    const data = loadData()
    this.setState({ habits: data.habits, currentDate: todayStr(), energy: loadEnergy() })
  }

  toggleCheckin(id: number) {
    const { habits } = this.state
    const h = habits.find(x => x.id === id)
    if (!h) return

    const td = todayStr()
    const prev = h.checkins || {}
    const next: Record<string, boolean> = { ...prev }
    const wasChecked = !!prev[td]
    if (wasChecked) {
      delete next[td]
    } else {
      next[td] = true
    }

    const ok = saveHabitCheckins(id, next)
    if (!ok) {
      wx.showToast({ title: '保存失败，请检查存储空间', icon: 'none', duration: 1500 })
      return
    }

    const nextHabits = habits.map(x => x.id === id ? { ...x, checkins: next } : x)
    let tip = wasChecked ? '已取消' : '打卡成功 🎉'
    let newEnergy = loadEnergy()
    if (!wasChecked) {
      const before = loadEnergy()
      newEnergy = awardEnergyOnceToday()
      if (newEnergy > before) tip = `⚡ 宠物能量+1，当前 ${newEnergy} 点`
      const streak = getStreak({ ...h, checkins: next })
      if ([7, 30, 100, 200, 365].includes(streak)) {
        tip = `🎉 连击 ${streak} 天！`
      }
      const burstAt = Date.now()
      this.setState({ burst: burstAt })
      setTimeout(() => {
        this.setState(prev => prev.burst === burstAt ? { burst: 0 } : null)
      }, 1600)
    }
    wx.showToast({ title: tip, icon: 'none', duration: 1800 })
    this.setState({ habits: nextHabits, energy: newEnergy })
  }

  loadTheme() {
    this.setState({ theme: loadTheme() })
  }

  copyLink(link: string) {
    if (!link) return
    Taro.setClipboardData({ data: link })
  }

  render() {
    const { habits, currentDate, theme, identity, selected, showIdentity, card, cardExpanded, energy } = this.state
    const now = new Date()
    const weekday = ['日','一','二','三','四','五','六'][now.getDay()]
    const dateStr = `${now.getMonth()+1}月${now.getDate()}日 周${weekday}`
    const allDone = habits.length > 0 && habits.every(h => h.checkins && h.checkins[currentDate])
    const idtKeys = identity.split(',').filter(Boolean)
    const identityName = idtKeys.length === 1
      ? (IDENTITIES.find(x => x.key === idtKeys[0])?.name || '学习成长') + '推荐'
      : '多身份推荐'

    return (
      <View className={`app-page theme-${theme}`} style={`padding-top: ${getNavBarHeight()}px;`}>
        <View className='page-header-compact'>
          <View className='page-title'>今日打卡</View>
          <View className='header-meta'>
            <View className='tag-badge'>{dateStr}</View>
            <View className='energy-badge' onClick={() => Taro.navigateTo({ url: '/pages/pet/index' })}>⚡ {energy}</View>
            {habits.length > 0 && (
              <Text className='summary-badge'>✓ {habits.filter(h => h.checkins && h.checkins[currentDate]).length}/{habits.length}</Text>
            )}
          </View>
        </View>

        {/* 今日知识卡片 */}
        <View className={`knowledge-card kc-${card.category}`} onClick={() => this.setState({ cardExpanded: !cardExpanded })}>
          <View className='kc-bg' style={`background-image: url(${getCardBg(card.category)});`} />
          <View className='kc-top'>
            <View className='kc-badge'>
              <Text>{card.type === 'video' ? '🎬 精品视频' : card.type === 'tip' ? '💡 方法卡' : '📖 经典语录'}</Text>
              <Text className='kc-cat'> · {identityName}</Text>
            </View>
            {!cardExpanded && <Text className='kc-more'>轻点展开</Text>}
          </View>
          <Text className='kc-title'>{card.title}</Text>
          {!cardExpanded ? (
            <Text className='kc-hook'>{card.highlight || card.text.slice(0, 30)}{(card.highlight || card.text).length > 30 ? '…' : ''}</Text>
          ) : (
            <View className='kc-body'>
              {card.highlight && <Text className='kc-highlight'>✨ {card.highlight}</Text>}
              <Text className='kc-text'>{card.text}</Text>
              {card.source && <Text className='kc-source'>—— {card.source}</Text>}
              {card.type === 'video' && card.link && (
                <Button
                  className='kc-link-btn'
                  onClick={(e) => { e.stopPropagation(); this.copyLink(card.link) }}
                >🔗 复制链接去B站看</Button>
              )}
              {allDone && <Text className='kc-done-tip'>✅ 今日已全部打卡，收下这份成长礼物</Text>}
              {!allDone && <Text className='kc-done-tip'>💪 完成打卡后，明天还会有新卡片</Text>}
            </View>
          )}
        </View>

        {habits.length === 0 ? (
          <View className='empty-state'>
            <Image className='empty-icon-img' src={ICON_MAP['plant']} mode='aspectFit' />
            <Text>还没有习惯呢～{'\n'}来创建你的第一个习惯吧！</Text>
            <Button className='btn-primary' onClick={() => {
              wx.switchTab({ url: '/pages/manage/index' })
            }}>+ 开始创建</Button>
          </View>
        ) : (
          <ScrollView scrollY className='habits-list'>
            {habits.map(h => {
              const checked = !!(h.checkins && h.checkins[currentDate])
              return (
                <View
                  key={h.id}
                  className='habit-row'
                  style={`--c-acc: ${h.color};`}
                >
                  <HabitIcon emoji={h.emoji} className='emoji' imageClassName='emoji-img' />
                  <View className='info'>
                    <Text className='name'>{h.name}</Text>
                    <View className='meta'>
                      <Text className={`meta-tag ${checked ? 'done' : 'pend'}`}>
                        {checked ? '✓ 已完成' : '⏳ 待完成'}
                      </Text>
                      <Text className='streak-badge'>🔥 {getStreak(h)}天</Text>
                    </View>
                  </View>
                  <View
                    className={`check-btn ${checked ? 'checked' : ''}`}
                    onTouchEnd={(e) => { e.stopPropagation(); this.toggleCheckin(h.id) }}
                  >
                    {checked ? '✓' : ''}
                  </View>
                </View>
              )
            })}
          </ScrollView>
        )}

        {/* 打卡庆祝彩蛋 */}
        {this.state.burst > 0 && (
          <View className='celebrate-burst'>
            <Text className='cb-emoji cb-1'>🎉</Text>
            <Text className='cb-emoji cb-2'>✨</Text>
            <Text className='cb-emoji cb-3'>🌟</Text>
            <Text className='cb-text'>太棒了！</Text>
          </View>
        )}

        {/* 身份选择（可多选，可重新进入） */}
        {showIdentity && (
          <View className='identity-overlay'>
            <View className='identity-box'>
              <View className='identity-title'>🎯 你更想提升哪方面？</View>
              <View className='identity-sub'>可多选，我会综合推荐内容卡片</View>
              <View className='identity-tags'>
                {IDENTITIES.map((idt, idx) => {
                  const on = selected.includes(idt.key)
                  return (
                    <View key={idt.key} className={`identity-tag tag-${idx % 5} ${on ? 'on' : ''}`} onClick={() => this.toggleSelect(idt.key)}>
                      <Text className='identity-tag-emoji'>{idt.emoji}</Text>
                      <Text className='identity-tag-name'>{idt.name}</Text>
                      <Text className='identity-tag-desc'>{idt.desc}</Text>
                      <View className={`identity-check ${on ? 'checked' : ''}`}>{on ? '✓' : ''}</View>
                    </View>
                  )
                })}
              </View>
              <Button className='identity-confirm' onClick={() => this.confirmIdentity()}>
                开始打卡{selected.length > 0 ? `（已选 ${selected.length} 项）` : ''}
              </Button>
              <Button className='identity-skip' onClick={() => this.confirmIdentity()}>先随便看看</Button>
            </View>
          </View>
        )}
      </View>
    )
  }
}
