import { Component, type ReactNode } from 'react'
import Taro from '@tarojs/taro'
import { STORAGE_KEY, DEFAULT_THEME } from './utils/constants'
import { loadPet, PetData } from './utils/pet'
import FloatingPet from './components/FloatingPet'
import './app.scss'

interface AppProps {
  children: ReactNode
}

interface AppState {
  pet: PetData | null
  summonKey: number
}

class App extends Component<AppProps, AppState> {
  state: AppState = { pet: null, summonKey: 0 }

  componentDidMount () {
    // Initialize WeChat Cloud Development for feedback collection
    if (Taro.cloud) {
      Taro.cloud.init({ env: 'cloudbase-d3g7noa8yac9d743c' })
    }

    // Load and apply saved theme
    try {
      const raw = Taro.getStorageSync(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        const theme = data.theme || DEFAULT_THEME
        Taro.getApp().theme = theme
      }
    } catch (e) {
      console.error('App theme init error:', e)
    }

    this.refreshPet()
    Taro.eventCenter.on('pet-changed', this.refreshPet)
  }

  componentDidShow () {
    this.refreshPet()
  }

  componentWillUnmount () {
    Taro.eventCenter.off('pet-changed', this.refreshPet)
  }

  refreshPet = () => {
    const pet = loadPet()
    // sleeping 状态变化时更新 key，让悬浮宠物重新播放飞入动画
    this.setState(prev => ({
      pet,
      summonKey: pet && prev.pet && prev.pet.sleeping !== pet.sleeping ? prev.summonKey + 1 : prev.summonKey
    }))
  }

  render () {
    return (
      <>
        {this.props.children}
        <FloatingPet
          key={`${this.state.pet?.type || 'none'}-${this.state.pet?.sleeping ? 'sleep' : 'awake'}-${this.state.summonKey}`}
          pet={this.state.pet}
          onUpdate={this.refreshPet}
        />
      </>
    )
  }
}

export default App
