import { Component, type ReactNode } from 'react'
import Taro from '@tarojs/taro'
import { STORAGE_KEY, DEFAULT_THEME } from './utils/constants'
import './app.scss'

interface AppProps {
  children: ReactNode
}

class App extends Component<AppProps> {
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
        // Apply theme class to the page element
        Taro.getApp().theme = theme
      }
    } catch (e) {
      console.error('App theme init error:', e)
    }
  }
 
  render () {
    return this.props.children
  }
}

export default App
