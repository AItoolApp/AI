import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { loadData, loadTheme, formatDate } from '../../utils/storage'
import { calcStats } from '../../utils/stats'
import { getNavBarHeight } from '../../utils/safeArea'
import { HabitStats, ICON_MAP } from '../../utils/constants'
import HabitIcon from '../../components/HabitIcon'
import './index.scss'

interface State {
  stats: HabitStats[]
  theme: string
}

export default class StatsPage extends Component<{}, State> {
  state: State = { stats: [], theme: 'latte' }

  componentDidMount() { Taro.showShareMenu({ withShareTicket: true }); this.refresh() }
  componentDidShow() { this.refresh() }

  refresh() {
    const data = loadData()
    this.setState({ stats: calcStats(data.habits), theme: loadTheme() })
  }

  render() {
    const { stats } = this.state
    const totalHabits = stats.length
    const todayChecked = stats.filter(s => s.today).length
    const longestStreak = stats.length > 0 ? Math.max(...stats.map(s => s.longest)) : 0
    const avgRate = stats.length > 0 ? Math.round(stats.reduce((a, s) => a + s.month_rate, 0) / stats.length) : 0

    // 近 7 天完成率趋势
    const trend: { label: string; rate: number; total: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      trend.push({ label: ['日','一','二','三','四','五','六'][d.getDay()], rate: 0, total: 0 })
    }
    if (stats.length > 0) {
      const data = loadData()
      const weekDays: string[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        weekDays.push(formatDate(d.getFullYear(), d.getMonth() + 1, d.getDate()))
      }
      weekDays.forEach((ds, idx) => {
        const done = data.habits.filter(h => h.checkins && h.checkins[ds]).length
        const rate = data.habits.length > 0 ? Math.round(done / data.habits.length * 100) : 0
        trend[idx] = { label: trend[idx].label, rate, total: done }
      })
    }

    if (stats.length === 0) {
      return (
        <View className={`app-page theme-${this.state.theme}`} style={`padding-top: ${getNavBarHeight()}px;`}>
          <View className='page-title'>统计</View>
          <View className='empty-state'>
            <Image className='empty-icon-img' src={ICON_MAP['star']} mode='aspectFit' />
            <Text>还没有数据，开始打卡吧！</Text>
          </View>
        </View>
      )
    }

    return (
      <View className={`app-page theme-${this.state.theme}`} style={`padding-top: ${getNavBarHeight()}px;`}>
        <View className='page-title'>统计</View>

        <View className='trend-card'>
          <View className='trend-head'>
            <Text className='trend-title'>近 7 天完成率</Text>
            <Text className='trend-sub'>每天完成习惯数 / 总习惯数</Text>
          </View>
          <View className='trend-bars'>
            {trend.map((t, idx) => (
              <View key={idx} className='trend-col'>
                <Text className='trend-val'>{t.rate}%</Text>
                <View className='trend-bar-track'>
                  <View className='trend-bar-fill' style={`height: ${Math.max(t.rate, 4)}%;`}></View>
                </View>
                <Text className='trend-day'>{t.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='stats-grid'>
          <View className='stat-card'>
            <Image className='stat-icon-img' src={ICON_MAP['target']} mode='aspectFit' />
            <Text className='sv'>{totalHabits}</Text>
            <Text className='sl'>习惯总数</Text>
          </View>
          <View className='stat-card'>
            <Image className='stat-icon-img' src={ICON_MAP['smile']} mode='aspectFit' />
            <Text className='sv'>{todayChecked}</Text>
            <Text className='sl'>今日完成</Text>
          </View>
          <View className='stat-card'>
            <Image className='stat-icon-img' src={ICON_MAP['star']} mode='aspectFit' />
            <Text className='sv'>{avgRate}%</Text>
            <Text className='sl'>月均完成率</Text>
          </View>
          <View className='stat-card'>
            <Image className='stat-icon-img' src={ICON_MAP['muscle']} mode='aspectFit' />
            <Text className='sv'>{longestStreak}</Text>
            <Text className='sl'>最长连击</Text>
          </View>
        </View>

        {stats.map(s => (
          <View key={s.id} className='stat-item'>
            <View className='stat-hdr'>
              <HabitIcon emoji={s.emoji} className='se' imageClassName='se-img' />
              <Text className='sn'>{s.name}</Text>
            </View>
            <View className='stat-row'>
              <Text>当前连击</Text>
              <Text className='sv2'>{s.streak} 天</Text>
            </View>
            <View className='stat-row'>
              <Text>最长连击</Text>
              <Text className='sv2'>{s.longest} 天</Text>
            </View>
            <View className='stat-row'>
              <Text>本月完成率</Text>
              <Text className='sv2'>{s.month_rate}%</Text>
            </View>
            <View className='stat-row'>
              <Text>总打卡</Text>
              <Text className='sv2'>{s.total} 次</Text>
            </View>
            <View className='stat-bar'>
              <View className='fill' style={`width: ${s.month_rate}%`}></View>
            </View>
          </View>
        ))}
      </View>
    )
  }
}
/* End of File */
