import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import { Habit } from '../../utils/constants'
import HabitIcon from '../../components/HabitIcon'
import { getStreak } from '../../utils/stats'
import { loadData, saveHabitCheckins, todayStr, loadTheme, loadIdentity, saveIdentity } from '../../utils/storage'
import { getTodayCard, IDENTITIES, ContentCard } from '../../utils/content'
import { getNavBarHeight } from '../../utils/safeArea'
import './index.scss'

interface State {
  habits: Habit[]
  currentDate: string
  theme: string
  identity: string
  showIdentity: boolean
  card: ContentCard
  cardExpanded: boolean
}

export default class TodayPage extends Component<{}, State> {
  state: State = {
    habits: [],
    currentDate: todayStr(),
    theme: 'latte',
    identity: '',
    showIdentity: false,
    card: getTodayCard(),
    cardExpanded: false
  }

  componentDidMount() {
    Taro.showShareMenu({ withShareTicket: true })
    this.loadHabits()
    this.loadTheme()
    this.initIdentity()
  }
  componentDidShow() { this.loadHabits(); this.loadTheme() }

  initIdentity() {
    const identity = loadIdentity()
    if (identity) {
      this.setState({ identity, card: getTodayCard(identity) })
    } else {
      this.setState({ showIdentity: true })
    }
  }

  chooseIdentity(key: string) {
    saveIdentity(key)
    this.setState({ identity: key, showIdentity: false, card: getTodayCard(key) })
  }

  loadHabits() {
    const data = loadData()
    this.setState({ habits: data.habits, currentDate: todayStr() })
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
    wx.showToast({ title: wasChecked ? '已取消' : '打卡成功 🎉', icon: 'none', duration: 1200 })
    this.setState({ habits: nextHabits })
  }

  loadTheme() {
    this.setState({ theme: loadTheme() })
  }

  copyLink(link: string) {
    if (!link) return
    Taro.setClipboardData({ data: link })
  }

  render() {
    const { habits, currentDate, theme, identity, showIdentity, card, cardExpanded } = this.state
    const now = new Date()
    const weekday = ['日','一','二','三','四','五','六'][now.getDay()]
    const dateStr = `${now.getMonth()+1}月${now.getDate()}日 周${weekday}`
    const allDone = habits.length > 0 && habits.every(h => h.checkins && h.checkins[currentDate])
    const identityName = IDENTITIES.find(x => x.key === identity)?.name || '学习成长'

    return (
      <View className={`app-page theme-${theme}`} style={`padding-top: ${getNavBarHeight()}px;`}>
        <View className='page-header-compact'>
          <View className='page-title'>今日打卡</View>
          <View className='header-meta'>
            <View className='tag-badge'>{dateStr}</View>
            {habits.length > 0 && (
              <Text className='summary-badge'>✓ {habits.filter(h => h.checkins && h.checkins[currentDate]).length}/{habits.length}</Text>
            )}
          </View>
        </View>

        {/* 今日知识卡片 */}
        <View className={`knowledge-card kc-${card.category}`} onClick={() => this.setState({ cardExpanded: !cardExpanded })}>
          <View className='kc-top'>
            <View className='kc-badge'>
              <Text>{card.type === 'video' ? '🎬 精品视频' : card.type === 'tip' ? '💡 方法卡' : '📖 经典语录'}</Text>
              <Text className='kc-cat'> · {identityName}推荐</Text>
            </View>
            {!cardExpanded && <Text className='kc-more'>轻点展开</Text>}
          </View>
          <Text className='kc-title'>{card.title}</Text>
          {!cardExpanded ? (
            <Text className='kc-hook'>{card.text.slice(0, 30)}{card.text.length > 30 ? '…' : ''}</Text>
          ) : (
            <View className='kc-body'>
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
            <Text className='ei'>🌸</Text>
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

        {/* 首次进入：身份选择 */}
        {showIdentity && (
          <View className='identity-overlay'>
            <View className='identity-box'>
              <View className='identity-title'>🎯 你更想提升哪方面？</View>
              <View className='identity-sub'>选一个身份，我会推荐更合适的内容卡片</View>
              <View className='identity-list'>
                {IDENTITIES.map(idt => (
                  <View key={idt.key} className='identity-item' onClick={() => this.chooseIdentity(idt.key)}>
                    <Text className='identity-emoji'>{idt.emoji}</Text>
                    <View className='identity-info'>
                      <Text className='identity-name'>{idt.name}</Text>
                      <Text className='identity-desc'>{idt.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Button className='identity-skip' onClick={() => this.chooseIdentity('study')}>先随便看看</Button>
            </View>
          </View>
        )}
      </View>
    )
  }
}
