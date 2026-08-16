import Taro from '@tarojs/taro'

let cached: number | null = null

/** 兜底值：与旧版 app.scss 的 160px 保持一致，异常时视觉无回归 */
const FALLBACK = 160

/**
 * 动态计算自定义导航栏占位高度（状态栏 + 胶囊 + 上下间距），
 * 用于页面顶部 padding，避免写死 160px 在刘海屏/不同机型上遮挡标题（P0-3）。
 * 仅小程序端可用；H5 或异常时回退 FALLBACK。
 */
export function getNavBarHeight(): number {
  if (cached !== null) return cached
  try {
    const win = Taro.getWindowInfo()
    const rect = Taro.getMenuButtonBoundingClientRect()
    if (rect && rect.height) {
      const statusBarH = win.statusBarHeight || 0
      const gap = rect.top - statusBarH
      cached = Math.round(statusBarH + gap + rect.height + gap)
    } else {
      cached = FALLBACK
    }
  } catch (e) {
    cached = FALLBACK
  }
  return cached
}
/* End of File */
