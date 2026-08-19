import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Button, Input } from '@tarojs/components'
import { loadEnergy, spendEnergy, loadIdentity } from '../../utils/storage'
import { loadPet, savePet, defaultEgg, randomHatch, HATCH_ENERGY, GROWTH_ENERGY, PET_TYPES, PRESET_GOALS, loadGoals, saveGoals, loadCustomGoals, saveCustomGoals } from '../../utils/pet'
import { loadTheme } from '../../utils/storage'
import { getNavBarHeight } from '../../utils/safeArea'
import FloatingPet from '../../components/FloatingPet'
import './index.scss'

interface State {
  pet: ReturnType<typeof defaultEgg>
  energy: number
  theme: string
  peek: boolean
  feedBurst: number
  goals: string[]
  customGoals: string[]
  customGoalInput: string
  summonFx: boolean
  identity: string
  showAllGoals: boolean
}

export default class PetPage extends Component<{}, State> {
  state: State = {
    pet: defaultEgg(),
    energy: 0,
    theme: 'latte',
    peek: false,
    feedBurst: 0,
    goals: [],
    customGoals: [],
    customGoalInput: '',
    summonFx: false,
    identity: '',
    showAllGoals: false
  }

  componentDidMount() { this.refresh() }
  componentDidShow() { this.refresh() }

  refresh() {
    this.setState({
      pet: loadPet() || defaultEgg(),
      energy: loadEnergy(),
      theme: loadTheme(),
      goals: loadGoals(),
      customGoals: loadCustomGoals(),
      identity: loadIdentity()
    })
  }

  notifyPet() {
    Taro.eventCenter.trigger('pet-changed')
  }

  toggleSleep() {
    const pet = { ...this.state.pet, sleeping: !this.state.pet.sleeping }
    savePet(pet)
    this.setState({ pet, peek: false })
    this.notifyPet()
  }

  feed() {
    const { energy, pet } = this.state
    if (energy <= 0) {
      wx.showToast({ title: '还没有能量，先去打卡或新建习惯赚能量吧', icon: 'none', duration: 2200 })
      return
    }
    spendEnergy(1)
    const left = loadEnergy()

    if (pet.type === 'egg') {
      const hatchProgress = (pet.hatchProgress || 0) + 1
      const nextPet = { ...pet, hatchProgress }
      savePet(nextPet)
      this.setState({ pet: nextPet, energy: left })
      const burstAt = Date.now()
      this.setState({ feedBurst: burstAt })
      setTimeout(() => {
        this.setState(prev => prev.feedBurst === burstAt ? { feedBurst: 0 } : null)
      }, 1800)
      if (hatchProgress >= HATCH_ENERGY) {
        wx.showToast({ title: `孵化值满 ${HATCH_ENERGY} 点啦，准备孵化…`, icon: 'none', duration: 1500 })
        setTimeout(() => {
          this.hatch(nextPet)
        }, 1200)
      } else {
        wx.showToast({ title: `🫳 投喂成功，孵化值 ${hatchProgress}/${HATCH_ENERGY}，还剩 ${left} 点能量`, icon: 'none', duration: 2500 })
      }
      return
    }

    // 孵化后：投喂 1 次 = 成长值 +1
    const growthProgress = (pet.growthProgress || 0) + 1
    const nextPet = { ...pet, growthProgress }
    savePet(nextPet)
    this.setState({ pet: nextPet, energy: left })
    const burstAt = Date.now()
    this.setState({ feedBurst: burstAt })
    setTimeout(() => {
      this.setState(prev => prev.feedBurst === burstAt ? { feedBurst: 0 } : null)
    }, 1800)
    if (growthProgress >= GROWTH_ENERGY && pet.stage === 'baby') {
      const adult = { ...nextPet, stage: 'adult' as const }
      savePet(adult)
      this.setState({ pet: adult })
      wx.showToast({ title: `🎉 成长值满 ${GROWTH_ENERGY}，进化到成体！`, icon: 'none', duration: 2500 })
    } else {
      wx.showToast({ title: `🫳 投喂成功，成长值 ${growthProgress}/${GROWTH_ENERGY}，还剩 ${left} 点能量`, icon: 'none', duration: 2500 })
    }
  }

  summonCompanion() {
    // 先在窝里播放旋转飞出动画，再真正切到陪伴状态
    this.setState({ summonFx: true })
    setTimeout(() => {
      const pet = { ...this.state.pet, sleeping: false }
      savePet(pet)
      this.setState({ pet, summonFx: false })
      this.notifyPet()
      wx.showToast({ title: '它飞出来陪你啦，切换页面也会跟着', icon: 'none', duration: 2200 })
    }, 700)
  }

  toggleGoal(key: string) {
    const { goals } = this.state
    const next = goals.includes(key) ? goals.filter(g => g !== key) : [...goals, key]
    saveGoals(next)
    this.setState({ goals: next })
  }

  addCustomGoal() {
    const text = this.state.customGoalInput.trim()
    if (!text) {
      wx.showToast({ title: '先写一个小目标吧', icon: 'none' })
      return
    }
    const next = [...this.state.customGoals, text]
    saveCustomGoals(next)
    this.setState({ customGoals: next, customGoalInput: '' })
  }

  removeCustomGoal(index: number) {
    const next = this.state.customGoals.filter((_, i) => i !== index)
    saveCustomGoals(next)
    this.setState({ customGoals: next })
  }

  hatch(existingPet?: ReturnType<typeof defaultEgg>) {
    const current = existingPet || this.state.pet
    if (current.type !== 'egg') return
    const progress = current.hatchProgress || 0
    if (progress < HATCH_ENERGY && this.state.energy < HATCH_ENERGY) {
      wx.showToast({ title: `孵化值 ${progress}/${HATCH_ENERGY}，投喂或能量满后才能孵化`, icon: 'none', duration: 2200 })
      return
    }
    const pet = randomHatch()
    savePet(pet)
    this.setState({ pet })
    this.notifyPet()
    wx.showToast({ title: `孵化成功！是${PET_TYPES.find(t => t.key === pet.type)?.name} 🎉`, icon: 'none', duration: 2000 })
  }

  render() {
    const { pet, energy, theme, peek } = this.state
    const petType = PET_TYPES.find(t => t.key === pet.type)
    const isEgg = pet.type === 'egg'
    const canHatch = isEgg && ((pet.hatchProgress || 0) >= HATCH_ENERGY || energy >= HATCH_ENERGY)
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
            ) : pet.sleeping || isEgg ? (
              <View className={`pet-stage sleeping ${this.state.summonFx ? 'summon-fly' : ''}`}>
                <Text className='zzz'>Z z z</Text>
                <Text className='pet-emoji'>{emoji}</Text>
                <Text className='dream'>🌙</Text>
              </View>
            ) : (
              <View className='pet-stage awake'>
                <Text className='pet-emoji pet-out'>✨</Text>
                <Text className='pet-out-tip'>它飞出去陪你啦</Text>
              </View>
            )}
          </View>
          <View className='nest-base'></View>
        </View>

        <View className='pet-info'>
          <Text className='pet-name'>{isEgg ? '灵宠蛋' : petType?.name}</Text>
          <Text className='pet-stage'>{isEgg ? '孵化期' : pet.stage === 'baby' ? '幼体期' : '成体期'}</Text>
          <Text className='pet-energy'>⚡ 能量 {energy} 点（手动投喂，不自动扣）</Text>
          {isEgg ? (
            <View className='pet-progress-box'>
              <Text className='pet-progress'>孵化值 {pet.hatchProgress || 0}/{HATCH_ENERGY} · 投喂 1 次 = 孵化值 +1</Text>
              <View className='pet-bar-track'><View className='pet-bar-fill' style={`width: ${Math.min(100, ((pet.hatchProgress || 0) / HATCH_ENERGY) * 100)}%;`}></View></View>
              <Text className='pet-tip'>创建习惯/每日首卡赚能量 → 手动投喂 → 满 {HATCH_ENERGY} 点孵化</Text>
            </View>
          ) : (
            <View className='pet-progress-box'>
              <Text className='pet-progress'>成长值 {pet.growthProgress || 0}/{GROWTH_ENERGY} · 投喂 1 次 = 成长值 +1</Text>
              <View className='pet-bar-track'><View className='pet-bar-fill' style={`width: ${Math.min(100, ((pet.growthProgress || 0) / GROWTH_ENERGY) * 100)}%;`}></View></View>
              <Text className='pet-tip'>继续投喂到 {GROWTH_ENERGY} 点进化成体，能量靠打卡和新建习惯积累</Text>
            </View>
          )}
        </View>

        <View className='pet-guide'>
          <Text className='pet-guide-title'>💡 能量怎么来（一看就懂）</Text>
          <View className='pet-guide-list'>
            <Text className='pet-guide-line'>① 每新建 1 个习惯：能量 +1（一次性）</Text>
            <Text className='pet-guide-line'>② 每天第一次完成打卡：能量 +1（每天最多 1 次）</Text>
            <Text className='pet-guide-line'>③ 能量只积攒、不自动扣，需要你到宠物页手动投喂</Text>
            {isEgg && <Text className='pet-guide-line pet-guide-hot'>④ 满 {HATCH_ENERGY} 点是能量累加值，不是 7 个习惯、也不是必须 7 天</Text>}
          </View>
        </View>

        <View className='pet-guide'>
          <Text className='pet-guide-title'>🎯 小目标与里程碑</Text>
          <View className='pet-guide-list'>
            <Text className='pet-guide-line'>· 每日第一次打卡：能量 +1（自动投喂）</Text>
            <Text className='pet-guide-line'>· 新建习惯：能量 +1（新朋友见面礼）</Text>
            <Text className='pet-guide-line'>· 连续打卡 7 天：进化一次 / 解锁新表情</Text>
            <Text className='pet-guide-line'>· 累计打卡 30 天：解锁换装</Text>
            <Text className='pet-guide-line'>· 累计打卡 100 天：稀有形态</Text>
            <Text className='pet-guide-line'>· 累计打卡 365 天：纪念形态 + 小窝装饰</Text>
          </View>
        </View>

        {/* 投喂庆祝 */}
        {this.state.feedBurst > 0 && (
          <View className='feed-burst'>
            <Text className='fb-emoji'>🫳✨</Text>
            <Text className='fb-text'>他日必定破壳飞天</Text>
          </View>
        )}

        <FloatingPet pet={this.state.pet} onUpdate={() => this.refresh()} animate />

        <View className='pet-actions'>
          <Button className='pet-btn' onClick={() => this.feed()}>🫳 投喂能量</Button>
          {isEgg && canHatch && (
            <Button className='pet-btn primary' onClick={() => this.hatch()}>✨ 孵化</Button>
          )}
          {pet.sleeping ? (
            <Button className='pet-btn' onClick={() => this.setState({ peek: !peek })}>{peek ? '🫣 关灯不看了' : '👀 围观睡姿'}</Button>
          ) : null}
          <Button className='pet-btn' onClick={() => this.toggleSleep()}>
            {pet.sleeping ? '☀️ 叫醒' : '🌙 回去睡觉'}
          </Button>
          {!isEgg && (
            <Button className='pet-btn primary' onClick={() => this.summonCompanion()}>✨ 召唤陪伴</Button>
          )}
        </View>

        {/* 学习小目标 */}
        <View className='pet-guide'>
          <Text className='pet-guide-title'>🎯 小目标 & 里程碑（可多选）</Text>
          <Text className='pet-guide-text'>根据你的身份展示对应示例，也可以展开全部。</Text>
          <View className='goal-toggle' onClick={() => this.setState({ showAllGoals: !this.state.showAllGoals })}>
            {this.state.showAllGoals ? '收起，只看我身份相关的' : '展开全部分类'}
          </View>
          {(() => {
            const idtCats: Record<string, string[]> = {
              english: ['英语学习'],
              kaoyan: ['考研备考'],
              study: ['英语学习', '认知提升'],
              cognition: ['认知提升'],
              life: ['生活方式']
            }
            const keys = this.state.identity.split(',').filter(Boolean)
            let showCats = ['英语学习', '考研备考', '认知提升', '生活方式']
            if (!this.state.showAllGoals && keys.length > 0) {
              const matched: string[] = []
              keys.forEach(k => { (idtCats[k] || []).forEach(c => { if (!matched.includes(c)) matched.push(c) }) })
              if (matched.length > 0) showCats = matched
            }
            return showCats.map(cat => (
            <View key={cat} className='goal-group'>
              <Text className='goal-cat'>{cat}</Text>
              <View className='goal-list'>
                {PRESET_GOALS.filter(g => g.category === cat).map(g => {
                  const on = this.state.goals.includes(g.key)
                  return (
                    <View key={g.key} className={`goal-item ${on ? 'on' : ''}`} onClick={() => this.toggleGoal(g.key)}>
                      <Text className='goal-emoji'>{g.emoji}</Text>
                      <Text className='goal-name'>{g.name}</Text>
                      <View className={`goal-check ${on ? 'checked' : ''}`}>{on ? '✓' : ''}</View>
                    </View>
                  )
                })}
              </View>
            </View>
            ))
          })()}
          <View className='goal-custom'>
            <Text className='goal-cat'>自定义小目标</Text>
            <View className='goal-custom-row'>
              <Input
                className='goal-custom-input'
                value={this.state.customGoalInput}
                placeholder='写一个自己的小目标'
                maxlength={30}
                type='text'
                onInput={e => this.setState({ customGoalInput: e.detail.value })}
              />
              <Button className='goal-custom-btn' onClick={() => this.addCustomGoal()}>添加</Button>
            </View>
            {this.state.customGoals.map((g, i) => (
              <View key={i} className='goal-item custom'>
                <Text className='goal-emoji'>✏️</Text>
                <Text className='goal-name'>{g}</Text>
                <View className='goal-check checked' onClick={() => this.removeCustomGoal(i)}>✕</View>
              </View>
            ))}
          </View>
        </View>

        <View className='pet-footer'>泡泡玛特风 · 正式形象逐步替换中</View>
      </View>
    )
  }
}
