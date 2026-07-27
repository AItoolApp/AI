/* 习惯打卡 - Taro/微信小程序类型声明 */

// WeChat mini program global API (used by Taro components)
declare const wx: {
  showToast(options: {
    title: string
    icon?: 'success' | 'loading' | 'none'
    duration?: number
    mask?: boolean
  }): void
  showModal(options: {
    title: string
    content: string
    showCancel?: boolean
    cancelText?: string
    confirmText?: string
    success?: (res: { confirm: boolean; cancel: boolean }) => void
  }): void
  switchTab(options: { url: string }): void
}
