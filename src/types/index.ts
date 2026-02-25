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
