import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Button, Input, Textarea, ScrollView, Label } from '@tarojs/components'
import { loadData, saveData, loadTheme } from '../../utils/storage'
import { EMOJIS, COLORS, THEMES, Habit } from '../../utils/constants'
import './index.scss'

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
  theme: string
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
    theme: 'latte'
  }

  componentDidMount() { Taro.showShareMenu({ withShareTicket: true }); this.refresh() }
  componentDidShow() { this.refresh() }

  refresh() {
    const data = loadData()
    this.setState({ habits: data.habits, theme: loadTheme() })
  }

  openAdd() {
    this.setState({
      showModal: true, editingId: null,
      editName: '', editEmoji: EMOJIS[0], editColor: COLORS[0]
    })
  }

  openEdit(h: Habit) {
    this.setState({
      showModal: true, editingId: h.id,
      editName: h.name, editEmoji: h.emoji, editColor: h.color
    })
  }

  saveHabit() {
    const { editingId, editName, editEmoji, editColor, habits } = this.state
    if (!editName.trim()) { wx.showToast({ title: '请输入名称', icon: 'none' }); return }

    if (editingId) {
      const h = habits.find(x => x.id === editingId)
      if (h) { h.name = editName; h.emoji = editEmoji; h.color = editColor }
      wx.showToast({ title: '已更新', icon: 'none' })
    } else {
      habits.push({
        id: Date.now(),
        name: editName,
        emoji: editEmoji,
        color: editColor,
        checkins: {}
      })
      wx.showToast({ title: '已添加 🎉', icon: 'none' })
    }

    const theme = loadData().theme
    saveData({ habits, theme })
    this.setState({ habits: [...habits], showModal: false, editName: '' })
  }

  deleteHabit(id: number) {
    wx.showModal({
      title: '确认删除',
      content: '打卡记录也会一起删除，确定吗？',
      success: (res) => {
        if (res.confirm) {
          const habits = this.state.habits.filter(h => h.id !== id)
          const theme = loadData().theme
          saveData({ habits, theme })
          this.setState({ habits })
          wx.showToast({ title: '已删除', icon: 'none' })
        }
      }
    })
  }

  submitFeedback() {
    const { feedbackText, feedbackContact, habits } = this.state
    if (!feedbackText.trim()) {
      wx.showToast({ title: '写点什么吧～', icon: 'none' })
      return
    }
    // Store feedback locally for now
    const feedbacks = Taro.getStorageSync('habit_feedbacks') || '[]'
    const list = JSON.parse(feedbacks)
    list.push({
      text: feedbackText.trim(),
      contact: feedbackContact.trim(),
      time: new Date().toISOString()
    })
    Taro.setStorageSync('habit_feedbacks', JSON.stringify(list))
    wx.showToast({ title: '感谢反馈 🎉', icon: 'none', duration: 2000 })
    this.setState({ showFeedback: false, feedbackText: '', feedbackContact: '' })
  }

  selTheme(k: string) {
    const data = loadData()
    data.theme = k
    saveData(data)
    this.setState({ theme: k, showTheme: false })
  }

  render() {
    const { habits, showModal, showTheme, editName, editEmoji, editColor, editingId, theme } = this.state

    return (
      <View className={`app-page theme-${theme}`}>
        <View className='page-title'>管理</View>

        <Button className='add-btn' onClick={() => this.openAdd()}>+ 添加新习惯</Button>

        <Button className='theme-btn' onClick={() => this.setState({ showTheme: true })}>
          🎨 切换主题
        </Button>

        <Button className='theme-btn' onClick={() => this.setState({ showFeedback: true })}>
          💬 反馈建议
        </Button>

        {habits.length === 0 ? (
          <View className='empty-state'>
            <Text className='ei'>📋</Text>
            <Text>还没有习惯，点击上方添加吧</Text>
          </View>
        ) : (
          <ScrollView scrollY className='manage-list'>
            {habits.map(h => (
              <View key={h.id} className='m-item'>
                <Text className='mi'>{h.emoji}</Text>
                <Text className='mn'>{h.name}</Text>
                <View className='ma'>
                  <Button className='m-btn edit' onClick={() => this.openEdit(h)}>编辑</Button>
                  <Button className='m-btn del' onClick={() => this.deleteHabit(h.id)}>删除</Button>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <View className='about-section'>
          <Text className='about-version'>习惯打卡 v1.0</Text>
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
                  <Textarea className='fg-input single-line-input' value={this.state.feedbackContact}
                    placeholder='微信/QQ/邮箱，方便跟进' maxlength={50}
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
                  <Textarea className='fg-input single-line-input' value={editName}
                    placeholder='写个名字吧 ✏️' maxlength={20}
                    onInput={e => this.setState({ editName: e.detail.value })}
                  />
                  <View className='input-meta'>
                    <Text className='char-count'>{editName.length}/20</Text>
                  </View>
                  {editName.trim() && (
                    <View className='input-preview'>
                      <Text className='preview-emoji'>{editEmoji}</Text>
                      <Text className='preview-name'>{editName.trim()}</Text>
                    </View>
                  )}
                </View>
                <View className='fg'>
                  <Label className='fg-label'>选择图标</Label>
                  <View className='emoji-grid'>
                    {EMOJIS.map(e => (
                      <View key={e}
                        className={`epi ${e === editEmoji ? 'sel' : ''}`}
                        onClick={() => this.setState({ editEmoji: e })}
                      ><Text>{e}</Text></View>
                    ))}
                  </View>
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
