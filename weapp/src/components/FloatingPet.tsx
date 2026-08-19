import { useState, useRef, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { PetData, savePet, PET_TYPES, loadPetPos, savePetPos } from '../utils/pet'
import './FloatingPet.scss'

interface Props {
  pet: PetData | null
  onUpdate: () => void
  /** 只在刚召唤时传 true，播放飞入动画；页面切换时传 false 避免重复动画 */
  animate?: boolean
}

const EXPRESSIONS = [
  { emoji: '🐣', text: '陪你打卡～' },
  { emoji: '✨', text: '今天真棒！' },
  { emoji: '💤', text: '有点困了…' }
]

export default function FloatingPet({ pet, onUpdate, animate = false }: Props) {
  const [expr, setExpr] = useState(0)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(loadPetPos())
  const posRef = useRef(pos)
  const offRef = useRef({ x: 0, y: 0 })
  const draggingRef = useRef(false)
  const movedRef = useRef(false)

  // 任何页面拖动后，所有已挂载的宠物实例实时同步位置
  useEffect(() => {
    const handler = (p: { x: number; y: number }) => {
      setPos(p)
      posRef.current = p
    }
    Taro.eventCenter.on('pet-pos-changed', handler)
    return () => { Taro.eventCenter.off('pet-pos-changed', handler) }
  }, [])

  if (!pet || pet.type === 'egg' || pet.sleeping) return null

  const type = PET_TYPES.find(t => t.key === pet.type)
  const emoji = EXPRESSIONS[expr].emoji === '🐣' ? (type?.emoji || '🐣') : EXPRESSIONS[expr].emoji

  const tap = () => {
    const next = (expr + 1) % EXPRESSIONS.length
    setExpr(next)
  }

  const sleep = () => {
    savePet({ ...pet, sleeping: true })
    onUpdate()
  }

  const onTouchStart = (e: any) => {
    const t = e.touches[0]
    let x = posRef.current ? posRef.current.x : Taro.getWindowInfo().windowWidth - 108
    let y = posRef.current ? posRef.current.y : Taro.getWindowInfo().windowHeight - 334
    setPos({ x, y })
    posRef.current = { x, y }
    offRef.current = { x: t.clientX - x, y: t.clientY - y }
    draggingRef.current = true
    movedRef.current = false
  }

  const onTouchMove = (e: any) => {
    if (!draggingRef.current) return
    movedRef.current = true
    const t = e.touches[0]
    const win = Taro.getWindowInfo()
    const x = Math.min(Math.max(0, t.clientX - offRef.current.x), win.windowWidth - 96)
    const y = Math.min(Math.max(0, t.clientY - offRef.current.y), win.windowHeight - 180)
    setPos({ x, y })
    posRef.current = { x, y }
    e.stopPropagation && e.stopPropagation()
  }

  const onTouchEnd = () => {
    draggingRef.current = false
    if (movedRef.current && posRef.current) {
      savePetPos(posRef.current)
      Taro.eventCenter.trigger('pet-pos-changed', posRef.current)
    }
  }

  return (
    <View
      className={`floating-pet ${animate ? 'fly-in' : ''}`}
      style={pos ? `left: ${pos.x}px; top: ${pos.y}px;` : ''}
    >
      <View className='fp-bubble'>
        <Text>{EXPRESSIONS[expr].text}</Text>
      </View>
      <View
        className='fp-body'
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={tap}
      >
        <Text className='fp-emoji'>{emoji}</Text>
      </View>
      <View className='fp-sleep' onClick={sleep}>🏠</View>
    </View>
  )
}
