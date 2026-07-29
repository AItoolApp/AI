import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { loadData, loadTheme } from '../../utils/storage'
import { getCheckinCounts, getStreak } from '../../utils/stats'
import { WEEKDAYS, Habit } from '../../utils/constants'
import './index.scss'

interface State {
  year: number
  month: number
  checkinMap: Record<string, number>
  habits: Habit[]
  theme: string
}

export default class CalendarPage extends Component<{}, State> {
  state: State = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    checkinMap: {},
    habits: [],
    theme: 'latte'
  }

  componentDidMount() { Taro.showShareMenu({ withShareTicket: true }); this.refresh() }
  componentDidShow() { this.refresh() }

  refresh() {
    const data = loadData()
    this.setState({ habits: data.habits, checkinMap: getCheckinCounts(data.habits), theme: loadTheme() })
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

  render() {
    const { year, month, checkinMap } = this.state
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
    const dim = new Date(year, month, 0).getDate()
    const fdm = new Date(year, month - 1, 1).getDay()

    let days: any[] = []
    for (let i = 0; i < fdm; i++) days.push('blank')
    for (let d = 1; d <= dim; d++) {
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      days.push({ day: d, dateStr, isToday: dateStr === todayStr, count: checkinMap[dateStr] || 0 })
    }

    return (
      <View className={`app-page theme-${this.state.theme}`}>
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
              <View key={d.dateStr} className={`cal-day ${d.isToday ? 'today' : ''}`}>
                <Text>{d.day}</Text>
                {d.count > 0 && <View className='dot'><Text className='dot-count'>{d.count > 1 ? d.count : ''}</Text></View>}
              </View>
            )
          })}
        </View>

        {this.state.habits.length > 0 && (
          <View className='cal-detail'>
            {(() => {
              const h = this.state.habits
              const todayS = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`
              const todayDone = h.filter(x => x.checkins && x.checkins[todayS])
              const monthDays = Object.keys(this.state.checkinMap)
                .filter(d => d.startsWith(`${this.state.year}-${String(this.state.month).padStart(2,'0')}`))
              const monthTotal = monthDays.reduce((a, d) => a + this.state.checkinMap[d], 0)
              const monthCheckDays = monthDays.length
              // Current total streak (max across all habits)
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
                          <Text className='cal-habit-emoji'>{x.emoji}</Text>
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
      </View>
    )
  }
}
