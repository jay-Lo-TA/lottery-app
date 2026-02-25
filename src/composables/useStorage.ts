import type { Participant, HistoryRecord, Settings } from '../types'

const PARTICIPANTS_KEY = 'lottery_participants'
const HISTORY_KEY = 'lottery_history'
const SETTINGS_KEY = 'lottery_settings'

const defaultSettings: Settings = {
  duration: 3,
  animationEffect: 'easeOut',
  allowRepeat: true,
  showHistory: true
}

export function useStorage() {
  const loadParticipants = (): Participant[] => {
    const stored = localStorage.getItem(PARTICIPANTS_KEY)
    if (stored) {
      const participants = JSON.parse(stored) as Participant[]
      // 重新计算序号
      const padding = Math.max(3, String(participants.length).length)
      participants.forEach((p, index) => {
        p.number = String(index + 1).padStart(padding, '0')
      })
      return participants
    }
    return []
  }

  const loadHistory = (): HistoryRecord[] => {
    const stored = localStorage.getItem(HISTORY_KEY)
    if (stored) {
      return JSON.parse(stored) as HistoryRecord[]
    }
    return []
  }

  const loadSettings = (): Settings => {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<Settings>
        return { ...defaultSettings, ...parsed }
      } catch {
        return { ...defaultSettings }
      }
    }
    return { ...defaultSettings }
  }

  const saveParticipants = (participants: Participant[]) => {
    localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(participants))
  }

  const saveHistory = (history: HistoryRecord[]) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  }

  const saveSettings = (settings: Settings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }

  return {
    loadParticipants,
    loadHistory,
    loadSettings,
    saveParticipants,
    saveHistory,
    saveSettings,
    defaultSettings
  }
}
