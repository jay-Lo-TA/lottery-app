export interface Participant {
  id: number
  name: string
  number: string
}

export interface HistoryRecord {
  time: string
  result: string
  name: string
}

export type AnimationEffect = 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce'

export interface Settings {
  duration: number
  animationEffect: AnimationEffect
  allowRepeat: boolean
  showHistory: boolean
}

// 多奖项模式相关类型
export interface Award {
  id: string
  name: string
  count: number  // 奖项名额数量
  color?: string  // 奖项展示颜色
}

export interface AwardWinner {
  awardId: string
  awardName: string
  participant: Participant
  time: string
}

export interface MultiAwardSettings {
  enabled: boolean  // 是否启用多奖项模式
  awards: Award[]   // 奖项列表
}
