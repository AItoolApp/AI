import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import { Habit } from '../../utils/constants'
import HabitIcon from '../../components/HabitIcon'
import { getStreak } from '../../utils/stats'
import { loadData, saveHabitCheckins, todayStr, loadTheme } from '../../utils/storage'
import { getNavBarHeight } from '../../utils/safeArea'
import './index.scss'

interface State {
  habits: Habit[]
  currentDate: string
  theme: string
}

export default class TodayPage extends Component<{}, State> {
  state: State = {
    habits: [],
    currentDate: todayStr(),
    theme: 'latte'
  }

  componentDidMount() { Taro.showShareMenu({ withShareTicket: true }); this.loadHabits(); this.loadTheme() }
  componentDidShow() { this.loadHabits(); this.loadTheme() }

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
    // 不可变更新：不直接 mutate h.checkins（P0-2）
    const next: Record<string, boolean> = { ...prev }
    const wasChecked = !!prev[td]
    if (wasChecked) {
      delete next[td]
    } else {
      next[td] = true
    }

    // 只写当前习惯的独立 key，不重写整份数据（P0-1）
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

  render() {
    const { habits, currentDate, theme } = this.state
    const now = new Date()
    const weekday = ['日','一','二','三','四','五','六'][now.getDay()]
    const dateStr = `${now.getMonth()+1}月${now.getDate()}日 周${weekday}`

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
      </View>
    )
  }
}
