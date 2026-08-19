import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Button, Input, Textarea, ScrollView, Label, Image } from '@tarojs/components'
import { loadData, saveData, loadTheme, saveTheme, removeHabitData, saveIdentity, addHabitBonusEnergy } from '../../utils/storage'
import { EMOJIS, COLORS, THEMES, WEEKDAYS, Habit, CUSTOM_ICON_KEYS, ICON_MAP } from '../../utils/constants'
import { getNavBarHeight } from '../../utils/safeArea'
import HabitIcon from '../../components/HabitIcon'
import './index.scss'

let undoTimers: Record<number, any> = {}

interface State {
  habits: Habit[]
  showModal: boolean
  showTheme: boolean
  showFeedback: boolean
  feedbackText: string
  feedbackContact: string
  editingId: number | null
  editName: string
  editEmoji: string
  editColor: string
  editRestDays: number[]
  theme: string
  pendingDeletes: number[]
  undoTimer: any
}

export default class ManagePage extends Component<{}, State> {
  state: State = {
    habits: [],
    showModal: false,
    showTheme: false,
    showFeedback: false,
    feedbackText: '',
    feedbackContact: '',
    editingId: null,
    editName: '',
    editEmoji: EMOJIS[0],
    editColor: COLORS[0],
    editRestDays: [],
    theme: 'latte',
    pendingDeletes: [],
    undoTimer: null
  }

  componentDidMount() { Taro.showShareMenu({ withShareTicket: true }); this.refresh() }
  componentDidShow() { this.refresh(); Taro.eventCenter.trigger('pet-changed') }

  refresh() {
    const data = loadData()
    this.setState({ habits: data.habits, theme: loadTheme() })
  }

  openAdd() {
    this.setState({
      showModal: true, editingId: null,
      editName: '', editEmoji: EMOJIS[0], editColor: COLORS[0], editRestDays: []
    })
  }

  openEdit(h: Habit) {
    this.setState({
      showModal: true, editingId: h.id,
      editName: h.name, editEmoji: h.emoji, editColor: h.color,
      editRestDays: h.restDays || []
    })
  }

  saveHabit() {
    const { editingId, editName, editEmoji, editColor, editRestDays, habits, theme } = this.state
    if (!editName.trim()) { wx.showToast({ title: '请输入名称', icon: 'none' }); return }

    let next: Habit[]
    if (editingId) {
      // 不可变更新，避免直接 mutate（P0-2 同款修复）
      next = habits.map(x => x.id === editingId ? { ...x, name: editName, emoji: editEmoji, color: editColor, restDays: editRestDays } : x)
      wx.showToast({ title: '已更新', icon: 'none' })
    } else {
      next = [...habits, {
        id: Date.now(),
        name: editName,
        emoji: editEmoji,
        color: editColor,
        restDays: editRestDays,
        checkins: {}
      }]
      const energy = addHabitBonusEnergy()
      wx.showToast({ title: `已添加 🎉 新习惯能量+1（当前${energy}点）`, icon: 'none', duration: 2000 })
    }

    saveData({ habits: next, theme })
    this.setState({ habits: next, showModal: false, editName: '' })
  }

  deleteHabit(id: number) {
    wx.showModal({
      title: '确认删除',
      content: '打卡记录也会一起删除，确定吗？',
      success: (res) => {
        if (res.confirm) {
          this.setState(prev => ({ pendingDeletes: prev.pendingDeletes.includes(id) ? prev.pendingDeletes : [...prev.pendingDeletes, id] }))
          if (undoTimers[id]) clearTimeout(undoTimers[id])
          undoTimers[id] = setTimeout(() => {
            delete undoTimers[id]
            this.doDelete(id)
          }, 5000)
        }
      }
    })
  }

  undoDelete(id: number) {
    if (undoTimers[id]) { clearTimeout(undoTimers[id]); delete undoTimers[id] }
    this.setState(prev => ({ pendingDeletes: prev.pendingDeletes.filter(x => x !== id) }))
  }

  doDelete(id: number) {
    // 用函数式 setState 保证拿到最新列表，避免异步状态导致删不掉
    this.setState(prev => {
      const habits = prev.habits.filter(h => h.id !== id)
      removeHabitData(id)
      saveData({ habits, theme: prev.theme })
      return { habits, pendingDeletes: prev.pendingDeletes.filter(x => x !== id) }
    }, () => {
      wx.showToast({ title: '已删除', icon: 'none' })
    })
  }

  componentWillUnmount() {
    Object.keys(undoTimers).forEach(k => clearTimeout(undoTimers[Number(k)]))
    undoTimers = {}
  }

  async submitFeedback() {
    const { feedbackText, feedbackContact, habits } = this.state
    if (!feedbackText.trim()) {
      wx.showToast({ title: '写点什么吧～', icon: 'none' })
      return
    }
    // Store feedback locally as fallback
    const feedbacks = Taro.getStorageSync('habit_feedbacks') || '[]'
    const list = JSON.parse(feedbacks)
    list.push({
      text: feedbackText.trim(),
      contact: feedbackContact.trim(),
      time: new Date().toISOString()
    })
    Taro.setStorageSync('habit_feedbacks', JSON.stringify(list))

    // Upload to WeChat Cloud Development when available
    if (Taro.cloud) {
      try {
        await Taro.cloud.callFunction({
          name: 'feedbackCollect',
          data: {
            text: feedbackText.trim(),
            contact: feedbackContact.trim()
          }
        })
      } catch (e) {
        console.error('Cloud feedback failed, local copy kept:', e)
      }
    }

    wx.showToast({ title: '感谢反馈 🎉', icon: 'none', duration: 2000 })
    this.setState({ showFeedback: false, feedbackText: '', feedbackContact: '' })
  }

  selTheme(k: string) {
    saveTheme(k) // 只写主题，不重写任何打卡数据（v1.1）
    this.setState({ theme: k, showTheme: false })
  }

  render() {
    const { habits, showModal, showTheme, editName, editEmoji, editColor, editRestDays, editingId, theme } = this.state

    return (
      <View className={`app-page theme-${theme}`} style={`padding-top: ${getNavBarHeight()}px;`}>
        <View className='page-title'>管理</View>

        <Button className='add-btn' onClick={() => this.openAdd()}>+ 添加新习惯</Button>

        <View className='mgr-actions'>
          <Button className='theme-btn mgr-pet' onClick={() => Taro.navigateTo({ url: '/pages/pet/index' })}>
            <View className='mgr-icon'>🐣</View>
            <Text className='mgr-btn-text'>宠物小窝</Text>
          </Button>
          <Button className='theme-btn mgr-art' onClick={() => this.setState({ showTheme: true })}>
            <View className='mgr-icon'>🎨</View>
            <Text className='mgr-btn-text'>切换主题</Text>
          </Button>
          <Button className='theme-btn mgr-target' onClick={() => {
            saveIdentity('')
            wx.showToast({ title: '下次进入今日页可重新选择身份', icon: 'none', duration: 2000 })
          }}>
            <View className='mgr-icon'>🎯</View>
            <Text className='mgr-btn-text'>重新选择身份</Text>
          </Button>
          <Button className='theme-btn mgr-msg' onClick={() => this.setState({ showFeedback: true })}>
            <View className='mgr-icon'>💬</View>
            <Text className='mgr-btn-text'>反馈建议</Text>
          </Button>
        </View>

        {habits.length === 0 ? (
          <View className='empty-state'>
            <Image className='empty-icon-img' src={ICON_MAP['writing']} mode='aspectFit' />
            <Text>还没有习惯，点击上方添加吧</Text>
          </View>
        ) : (
          <ScrollView scrollY className='manage-list'>
            {habits.map(h => {
              if (this.state.pendingDeletes.includes(h.id)) {
                return (
                  <View key={h.id} className='m-item pending'>
                    <HabitIcon emoji={h.emoji} className='mi' imageClassName='mi-img' />
                    <Text className='mn'>已删除 · 5 秒内可恢复</Text>
                    <View className='ma'>
                      <Button className='m-btn edit' onClick={() => this.undoDelete(h.id)}>撤销</Button>
                    </View>
                  </View>
                )
              }
              return (
                <View key={h.id} className='m-item'>
                  <HabitIcon emoji={h.emoji} className='mi' imageClassName='mi-img' />
                  <Text className='mn'>{h.name}</Text>
                  <View className='ma'>
                    <Button className='m-btn edit' onClick={() => this.openEdit(h)}>编辑</Button>
                    <Button className='m-btn del' onClick={() => this.deleteHabit(h.id)}>删除</Button>
                  </View>
                </View>
              )
            })}
          </ScrollView>
        )}

        <View className='about-section'>
          <Text className='about-version'>习惯打卡 v1.1.0</Text>
          <Text className='about-line'>每天打卡，见证改变</Text>
        </View>

        {this.state.showFeedback && (
          <View className='modal-overlay' onClick={() => this.setState({ showFeedback: false })}>
            <View className='modal-box' onClick={e => e.stopPropagation()}>
              <View className='modal-title'>💬 反馈建议</View>
              <View className='modal-body'>
                <View className='fg'>
                  <Label className='fg-label'>你的想法</Label>
                  <Textarea className='fg-input textarea-input' value={this.state.feedbackText}
                    placeholder='说说你的建议或遇到的bug' maxlength={200}
                    onInput={e => this.setState({ feedbackText: e.detail.value })}
                  />
                  <View className='input-meta'>
                    <Text className='char-count'>{this.state.feedbackText.length}/200</Text>
                  </View>
                </View>
                <View className='fg'>
                  <Label className='fg-label'>联系方式（选填）</Label>
                  <Input className='fg-input single-line-input' value={this.state.feedbackContact}
                    placeholder='微信/QQ/邮箱，方便跟进' maxlength={50} type='text'
                    onInput={e => this.setState({ feedbackContact: e.detail.value })}
                  />
                </View>
                <View className='modal-actions'>
                  <Button className='btn-action cancel' onClick={() => this.setState({ showFeedback: false })}>取消</Button>
                  <Button className='btn-action confirm' onClick={() => this.submitFeedback()}>提交</Button>
                </View>
              </View>
            </View>
          </View>
        )}

        {showModal && (
          <View className='modal-overlay' onClick={() => this.setState({ showModal: false })}>
            <View className='modal-box' onClick={e => e.stopPropagation()}>
              <View className='modal-title'>{editingId ? '编辑习惯' : '添加习惯'}</View>
              <View className='modal-body'>
                <View className='fg'>
                  <Label className='fg-label'>习惯名称</Label>
                  <Input className='fg-input single-line-input' value={editName}
                    placeholder='写个名字吧 ✏️' maxlength={20} type='text'
                    onInput={e => this.setState({ editName: e.detail.value })}
                  />
                  <View className='input-meta'>
                    <Text className='char-count'>{editName.length}/20</Text>
                  </View>
                  {editName.trim() && (
                    <View className='input-preview'>
                      {editEmoji.startsWith('icon:') ? (
                        <Image className='preview-emoji-img' src={ICON_MAP[editEmoji.slice(5)]} mode='aspectFit' />
                      ) : (
                        <Text className='preview-emoji'>{editEmoji}</Text>
                      )}
                      <Text className='preview-name'>{editName.trim()}</Text>
                    </View>
                  )}
                </View>
                <View className='fg'>
                  <Label className='fg-label'>选择图标</Label>
                  <View className='emoji-grid'>
                    {CUSTOM_ICON_KEYS.map(k => {
                      const val = `icon:${k}`
                      return (
                        <View key={val}
                          className={`epi icon-epi ${val === editEmoji ? 'sel' : ''}`}
                          onClick={() => this.setState({ editEmoji: val })}
                        ><Image className='epi-img' src={ICON_MAP[k]} mode='aspectFit' /></View>
                      )
                    })}
                    {EMOJIS.map(e => (
                      <View key={e}
                        className={`epi ${e === editEmoji ? 'sel' : ''}`}
                        onClick={() => this.setState({ editEmoji: e })}
                      ><Text>{e}</Text></View>
                    ))}
                  </View>
                </View>
                <View className='fg'>
                  <Label className='fg-label'>每周休息日（可选）</Label>
                  <View className='restday-row'>
                    {WEEKDAYS.map((w, idx) => (
                      <View
                        key={w}
                        className={`restday-chip ${editRestDays.includes(idx) ? 'on' : ''}`}
                        onClick={() => {
                          const next = editRestDays.includes(idx)
                            ? editRestDays.filter(d => d !== idx)
                            : [...editRestDays, idx]
                          this.setState({ editRestDays: next })
                        }}
                      >{w}</View>
                    ))}
                  </View>
                  <Text className='restday-tip'>休息日不打卡也不会断连击，允许自己放松一下</Text>
                </View>
                <View className='fg'>
                  <Label className='fg-label'>主题色</Label>
                  <View className='color-grid'>
                    {COLORS.map(c => (
                      <View key={c}
                        className={`cpi ${c === editColor ? 'sel' : ''}`}
                        style={`background: ${c}`}
                        onClick={() => this.setState({ editColor: c })}
                      ></View>
                    ))}
                  </View>
                </View>
                <View className='modal-actions'>
                  <Button className='btn-action cancel' onClick={() => this.setState({ showModal: false })}>取消</Button>
                  <Button className='btn-action confirm' onClick={() => this.saveHabit()}>保存</Button>
                </View>
              </View>
            </View>
          </View>
        )}
      {showTheme && (
        <View className='modal-overlay' onClick={() => this.setState({ showTheme: false })}>
          <View className='modal-box' onClick={e => e.stopPropagation()}>
            <View className='modal-title'>🎨 切换主题</View>
            <View className='theme-grid'>
              {THEMES.map(t => (
                <View
                  key={t.key}
                  className={`theme-opt ${t.key === theme ? 'active' : ''}`}
                  onClick={() => this.selTheme(t.key)}
                >
                  <View className='theme-preview' style={`background: ${t.color}; ${t.key === 'midnight' ? 'border-color: #444470;' : ''}`}></View>
                  <Text className='theme-name'>{t.name}</Text>
                </View>
              ))}
            </View>
            <View className='modal-actions'>
              <Button className='btn-action cancel' onClick={() => this.setState({ showTheme: false })}>关闭</Button>
            </View>
          </View>
        </View>
      )}
      </View>
    )
  }
}
