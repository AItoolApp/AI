import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { loadEnergy } from '../../utils/storage'
import { loadPet, savePet, defaultEgg, randomHatch, HATCH_ENERGY, PET_TYPES } from '../../utils/pet'
import { loadTheme } from '../../utils/storage'
import { getNavBarHeight } from '../../utils/safeArea'
import './index.scss'

interface State {
  pet: ReturnType<typeof defaultEgg>
  energy: number
  theme: string
  peek: boolean
}

export default class PetPage extends Component<{}, State> {
  state: State = {
    pet: defaultEgg(),
    energy: 0,
    theme: 'latte',
    peek: false
  }

  componentDidMount() { this.refresh() }
  componentDidShow() { this.refresh() }

  refresh() {
    this.setState({
      pet: loadPet() || defaultEgg(),
      energy: loadEnergy(),
      theme: loadTheme()
    })
  }

  toggleSleep() {
    const pet = { ...this.state.pet, sleeping: !this.state.pet.sleeping }
    savePet(pet)
    this.setState({ pet, peek: false })
  }

  hatch() {
    if (this.state.pet.type !== 'egg') return
    if (this.state.energy < HATCH_ENERGY) {
      wx.showToast({ title: `还需要 ${HATCH_ENERGY - this.state.energy} 点能量才能孵化`, icon: 'none' })
      return
    }
    const pet = randomHatch()
    savePet(pet)
    this.setState({ pet })
    wx.showToast({ title: `孵化成功！是${PET_TYPES.find(t => t.key === pet.type)?.name} 🎉`, icon: 'none', duration: 2000 })
  }

  render() {
    const { pet, energy, theme, peek } = this.state
    const petType = PET_TYPES.find(t => t.key === pet.type)
    const isEgg = pet.type === 'egg'
    const canHatch = isEgg && energy >= HATCH_ENERGY
    const emoji = isEgg ? '🥚' : (petType?.emoji || '🐣')

    return (
      <View className={`app-page theme-${theme}`} style={`padding-top: ${getNavBarHeight()}px;`}>
        <View className='pet-top'>
          <View className='pet-back' onClick={() => Taro.navigateBack()}>‹ 返回</View>
          <View className='page-title pet-title'>宠物小窝</View>
        </View>

        <View className={`nest-box ${pet.sleeping ? 'night' : 'day'} ${isEgg ? 'egg-mode' : ''}`}>
          <View className='nest-inner'>
            {peek && pet.sleeping ? (
              <View className='peek-view'>
                <Text className='peek-emoji'>{emoji}</Text>
                <Text className='peek-zzz'>Z z z</Text>
                <Text className='peek-dream'>🌙 做着美梦呢…</Text>
              </View>
            ) : (
              <View className={`pet-stage ${pet.sleeping ? 'sleeping' : 'awake'}`}>
                {pet.sleeping && <Text className='zzz'>Z z z</Text>}
                <Text className='pet-emoji'>{emoji}</Text>
                {pet.sleeping && <Text className='dream'>🌙</Text>}
              </View>
            )}
          </View>
          <View className='nest-base'></View>
        </View>

        <View className='pet-info'>
          <Text className='pet-name'>{isEgg ? '灵宠蛋' : petType?.name}</Text>
          <Text className='pet-stage'>{isEgg ? '孵化期' : pet.stage === 'baby' ? '幼体期' : '成体期'}</Text>
          <Text className='pet-energy'>⚡ 能量 {energy} 点</Text>
          {isEgg && (
            <Text className='pet-progress'>
              孵化值 {energy}/{HATCH_ENERGY}（试运行阈值，正式版 21）
              {canHatch ? ' · 可以孵化啦！' : ` · 还差 ${HATCH_ENERGY - energy} 点`}
            </Text>
          )}
          {!isEgg && <Text className='pet-tip'>每天完成习惯打卡会自动投喂能量</Text>}
        </View>

        <View className='pet-guide'>
          <Text className='pet-guide-title'>💡 怎么获取能量和孵化值</Text>
          {isEgg ? (
            <Text className='pet-guide-text'>
              每天完成任意习惯打卡，第一次打卡自动 +1 点能量；能量就是孵化值。当前试运行满 {HATCH_ENERGY} 点可孵化，正式版为 21 点。打卡后今日页右上角 ⚡ 数值会同步增加。
            </Text>
          ) : (
            <Text className='pet-guide-text'>
              每天完成习惯打卡会自动投喂能量，连续打卡 7 天进化一次，累计 30 天解锁换装。先坚持打卡，小可爱会一直陪你长大。
            </Text>
          )}
        </View>

        <View className='pet-actions'>
          {isEgg && canHatch && (
            <Button className='pet-btn primary' onClick={() => this.hatch()}>✨ 孵化</Button>
          )}
          {pet.sleeping ? (
            <Button className='pet-btn' onClick={() => this.setState({ peek: !peek })}>{peek ? '🫣 关灯不看了' : '👀 围观睡姿'}</Button>
          ) : null}
          <Button className='pet-btn' onClick={() => this.toggleSleep()}>
            {pet.sleeping ? '☀️ 叫醒' : '🌙 回去睡觉'}
          </Button>
        </View>

        <View className='pet-footer'>泡泡玛特风 · 正式形象逐步替换中</View>
      </View>
    )
  }
}
