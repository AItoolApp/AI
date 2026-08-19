import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { loadData, loadTheme, saveHabitCheckins, loadEnergy, spendEnergy, refundEnergy, MAKEUP_COST } from '../../utils/storage'
import { getCheckinCounts, getStreak } from '../../utils/stats'
import { getNavBarHeight } from '../../utils/safeArea'
import { WEEKDAYS, Habit } from '../../utils/constants'
import HabitIcon from '../../components/HabitIcon'
import './index.scss'

interface State {
  year: number
  month: number
  checkinMap: Record<string, number>
  habits: Habit[]
  theme: string
  makeUpDate: string | null
  makeUpUnlocked: boolean
}

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export default class CalendarPage extends Component<{}, State> {
  state: State = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    checkinMap: {},
    habits: [],
    theme: 'latte',
    makeUpDate: null,
    makeUpUnlocked: false
  }

  componentDidMount() { Taro.showShareMenu({ withShareTicket: true }); this.refresh() }
  componentDidShow() { this.refresh() }

  refresh() {
    const data = loadData()
    // 补签后期解锁：累计打卡 21 次后开放（宠物养成规划 §4）
    const totalCheckins = data.habits.reduce((a, h) => a + Object.keys(h.checkins || {}).length, 0)
    this.setState({
      habits: data.habits,
      checkinMap: getCheckinCounts(data.habits),
      theme: loadTheme(),
      makeUpUnlocked: totalCheckins >= 21
    })
  }

  prevMonth() {
    let { year, month } = this.state
    month--
    if (month < 1) { month = 12; year-- }
    this.setState({ year, month })
  }

  nextMonth() {
    let { year, month } = this.state
    month++
    if (month > 12) { month = 1; year++ }
    this.setState({ year, month })
  }

  canMakeUp(dateStr: string): boolean {
    if (!this.state.makeUpUnlocked) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dt = new Date(dateStr)
    dt.setHours(0, 0, 0, 0)
    const diff = Math.floor((today.getTime() - dt.getTime()) / 86400000)
    // 允许补签过去 3 天 + 今天（今天用日历打卡也可以）
    return diff >= 0 && diff <= 3
  }

  openMakeUp(dateStr: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dt = new Date(dateStr)
    dt.setHours(0, 0, 0, 0)
    if (dt.getTime() > today.getTime()) {
      wx.showToast({ title: '未来的日子还没到哦', icon: 'none', duration: 1200 })
      return
    }
    this.setState({ makeUpDate: dateStr })
  }

  toggleMakeUp(id: number) {
    const { makeUpDate, habits } = this.state
    if (!makeUpDate) return
    const h = habits.find(x => x.id === id)
    if (!h) return

    const prev = h.checkins || {}
    const next: Record<string, boolean> = { ...prev }
    const isOn = !!prev[makeUpDate]
    if (isOn) {
      delete next[makeUpDate]
    } else {
      // 补签需要消耗能量：坚持打卡积累，3 点兑换 1 次
      const energy = loadEnergy()
      if (energy < MAKEUP_COST) {
        wx.showToast({ title: `补签需要 ${MAKEUP_COST} 点能量，当前 ${energy} 点，坚持打卡积累吧`, icon: 'none', duration: 2200 })
        return
      }
      if (!spendEnergy(MAKEUP_COST)) {
        wx.showToast({ title: '能量不足', icon: 'none' })
        return
      }
      next[makeUpDate] = true
    }

    const ok = saveHabitCheckins(id, next)
    if (!ok) {
      wx.showToast({ title: '保存失败，请检查存储空间', icon: 'none', duration: 1500 })
      return
    }

    if (isOn) {
      refundEnergy(MAKEUP_COST)
      wx.showToast({ title: `已取消补签，返还 ${MAKEUP_COST} 点能量`, icon: 'none', duration: 1500 })
    } else {
      wx.showToast({ title: `补签成功，剩余 ${loadEnergy()} 点能量`, icon: 'none', duration: 1500 })
    }

    const nextHabits = habits.map(x => x.id === id ? { ...x, checkins: next } : x)
    this.setState({ habits: nextHabits, checkinMap: getCheckinCounts(nextHabits) })
  }

  render() {
    const { year, month, checkinMap, makeUpDate } = this.state
    const today = new Date()
    const todayStr = fmt(today)
    const dim = new Date(year, month, 0).getDate()
    const fdm = new Date(year, month - 1, 1).getDay()

    let days: any[] = []
    for (let i = 0; i < fdm; i++) days.push('blank')
    for (let d = 1; d <= dim; d++) {
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      days.push({
        day: d,
        dateStr,
        isToday: dateStr === todayStr,
        count: checkinMap[dateStr] || 0,
        canMakeUp: this.canMakeUp(dateStr)
      })
    }

    return (
      <View className={`app-page theme-${this.state.theme}`} style={`padding-top: ${getNavBarHeight()}px;`}>
        <View className='page-title'>日历</View>

        <View className='cal-nav'>
          <View className='cal-nav-btn' onClick={() => this.prevMonth()}>◀</View>
          <Text className='cal-title'>{year}年{month}月</Text>
          <View className='cal-nav-btn' onClick={() => this.nextMonth()}>▶</View>
        </View>

        <View className='cal-grid'>
          {WEEKDAYS.map(w => <View key={w} className='cal-hdr'>{w}</View>)}
          {days.map((d, i) => {
            if (d === 'blank') return <View key={`b${i}`} className='cal-day other'></View>
            return (
              <View
                key={d.dateStr}
                className={`cal-day ${d.isToday ? 'today' : ''} ${d.canMakeUp ? 'can-makeup' : ''}`}
                onClick={() => this.openMakeUp(d.dateStr)}
              >
                <Text>{d.day}</Text>
                {d.count > 0 && <View className='dot'><Text className='dot-count'>{d.count > 1 ? d.count : ''}</Text></View>}
                {d.canMakeUp && d.count === 0 && <Text className='makeup-hint'>补</Text>}
              </View>
            )
          })}
        </View>

        {this.state.habits.length > 0 && (
          <View className='cal-detail'>
            {(() => {
              const h = this.state.habits
              const todayS = todayStr
              const todayDone = h.filter(x => x.checkins && x.checkins[todayS])
              const monthDays = Object.keys(checkinMap)
                .filter(d => d.startsWith(`${year}-${String(month).padStart(2,'0')}`))
              const monthTotal = monthDays.reduce((a, d) => a + checkinMap[d], 0)
              const monthCheckDays = monthDays.length
              const maxStreak = Math.max(...h.map(x => getStreak(x)), 0)
              return (
                <View>
                  <View className='cal-stats-row'>
                    <View className='cal-stat-item'>
                      <Text className='cal-stat-val'>{monthCheckDays}</Text>
                      <Text className='cal-stat-label'>本月打卡天数</Text>
                    </View>
                    <View className='cal-stat-item'>
                      <Text className='cal-stat-val'>{monthTotal}</Text>
                      <Text className='cal-stat-label'>本月打卡次数</Text>
                    </View>
                    <View className='cal-stat-item'>
                      <Text className='cal-stat-val'>{maxStreak}</Text>
                      <Text className='cal-stat-label'>最长连击</Text>
                    </View>
                  </View>
                  {todayDone.length > 0 && (
                    <View className='cal-today-detail'>
                      <Text className='cal-today-title'>今日已完成</Text>
                      {todayDone.map(x => (
                        <View key={x.id} className='cal-habit-mini'>
                          <HabitIcon emoji={x.emoji} className='cal-habit-emoji' imageClassName='cal-habit-emoji-img' />
                          <Text className='cal-habit-name'>{x.name}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )
            })()}
          </View>
        )}

        {/* 补签面板 */}
        {makeUpDate && (
          <View className='makeup-overlay' onClick={() => this.setState({ makeUpDate: null })}>
            <View className='makeup-box' onClick={e => e.stopPropagation()}>
              <View className='makeup-title'>📅 {makeUpDate}</View>
              <View className='makeup-sub'>
                {this.canMakeUp(makeUpDate)
                  ? `最近 3 天可补 · 当前 ${loadEnergy()} 点能量 · 补签 1 次消耗 ${MAKEUP_COST} 点`
                  : this.state.makeUpUnlocked
                    ? '该日期仅查看详情，不支持补签'
                    : '累计打卡 21 天后解锁补签，先坚持一下吧'}
              </View>
              <ScrollView scrollY className='makeup-list'>
                {this.state.habits.map(h => {
                  const checked = !!(h.checkins && h.checkins[makeUpDate])
                  const editable = this.canMakeUp(makeUpDate)
                  return (
                    <View key={h.id} className={`makeup-item ${editable ? '' : 'readonly'}`} onClick={() => editable && this.toggleMakeUp(h.id)}>
                      <HabitIcon emoji={h.emoji} className='makeup-emoji' imageClassName='makeup-emoji-img' />
                      <Text className='makeup-name'>{h.name}</Text>
                      <View className={`makeup-check ${checked ? 'checked' : ''}`}>{checked ? '✓' : ''}</View>
                    </View>
                  )
                })}
              </ScrollView>
              <View className='makeup-close' onClick={() => this.setState({ makeUpDate: null })}>关闭</View>
            </View>
          </View>
        )}
      </View>
    )
  }
}
