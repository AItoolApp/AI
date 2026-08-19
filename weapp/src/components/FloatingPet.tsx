import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { PetData, savePet, PET_TYPES } from '../utils/pet'
import './FloatingPet.scss'

interface Props {
  pet: PetData | null
  onUpdate: () => void
}

const EXPRESSIONS = [
  { emoji: '🐣', text: '陪你打卡～' },
  { emoji: '✨', text: '今天真棒！' },
  { emoji: '💤', text: '有点困了…' }
]

export default function FloatingPet({ pet, onUpdate }: Props) {
  const [expr, setExpr] = useState(0)
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

  return (
    <View className='floating-pet'>
      <View className='fp-bubble'>
        <Text>{EXPRESSIONS[expr].text}</Text>
      </View>
      <View className='fp-body' onClick={tap}>
        <Text className='fp-emoji'>{emoji}</Text>
      </View>
      <View className='fp-sleep' onClick={sleep}>🏠</View>
    </View>
  )
}
