import { Text, Image } from '@tarojs/components'
import { ICON_MAP } from '../utils/constants'

interface Props {
  emoji: string
  className?: string
  imageClassName?: string
}

export default function HabitIcon({ emoji, className, imageClassName }: Props) {
  if (emoji.startsWith('icon:')) {
    const src = ICON_MAP[emoji.slice(5)]
    if (src) {
      return <Image className={imageClassName || 'habit-icon-img'} src={src} mode='aspectFit' />
    }
  }
  return <Text className={className}>{emoji}</Text>
}
