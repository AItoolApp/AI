import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import { loadData, loadTheme } from '../../utils/storage'
import { getCheckinCounts } from '../../utils/stats'
import { WEEKDAYS } from '../../utils/constants'
import './index.scss'

interface State {
  year: number
  month: number
  checkinMap: Record<string, number>
  theme: string
}

export default class CalendarPage extends Component<{}, State> {
  state: State = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    checkinMap: {},
    theme: 'latte'
  }

  componentDidMount() { this.refresh() }
  componentDidShow() { this.refresh() }

  refresh() {
    const data = loadData()
    this.setState({ checkinMap: getCheckinCounts(data.habits), theme: loadTheme() })
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
        <View className='page-title'>📅 日历</View>

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
      </View>
    )
  }
}
