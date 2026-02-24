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

export interface Settings {
  duration: number
  spins: number
  allowRepeat: boolean
  showHistory: boolean
}
