import { ref, computed, watch } from 'vue'
import type { Participant, HistoryRecord, Settings } from '../types'
import { useStorage } from './useStorage'

// 唯一 ID 生成器
let idCounter = Date.now()
const generateId = () => ++idCounter

// 根据参与者数量计算编号位数（至少3位）
const getNumberPadding = (count: number): number => {
  return Math.max(3, String(count).length)
}

// 生成带动态位数的编号
const generateNumber = (index: number, totalCount: number): string => {
  const padding = getNumberPadding(totalCount)
  return String(index).padStart(padding, '0')
}

export function useLottery() {
  const { loadParticipants, loadHistory, loadSettings, saveParticipants, saveHistory, saveSettings } = useStorage()

  const participants = ref<Participant[]>(loadParticipants())
  const history = ref<HistoryRecord[]>(loadHistory())
  const settings = ref<Settings>(loadSettings())
  const isRunning = ref(false)
  const winner = ref<Participant | null>(null)

  // 监听设置变化并保存
  watch(settings, (newSettings) => {
    saveSettings(newSettings)
  }, { deep: true })

  const totalParticipants = computed(() => participants.value.length)
  const totalDraws = computed(() => history.value.length)
  const uniqueWinners = computed(() => new Set(history.value.map(h => h.name)).size)

  // 生成编号池
  const generateNumberPool = () => {
    const pool: number[] = []
    for (let i = 1; i <= participants.value.length; i++) {
      pool.push(i)
    }
    return pool
  }

  // 根据编号找到参与者
  const findParticipantByNumber = (number: number) => {
    const index = number - 1
    return participants.value[index] || participants.value[participants.value.length - 1]
  }

  // 添加参与者
  const addParticipant = (name: string) => {
    if (!name.trim()) return false
    if (participants.value.some(p => p.name === name)) return false

    const oldCount = participants.value.length
    const newCount = oldCount + 1
    const oldPadding = getNumberPadding(oldCount)
    const newPadding = getNumberPadding(newCount)

    // 如果跨越位数阈值，重新计算所有编号
    if (newPadding > oldPadding && oldCount > 0) {
      participants.value.forEach((p, index) => {
        p.number = generateNumber(index + 1, newCount)
      })
    }

    const number = generateNumber(oldCount + 1, newCount)
    participants.value.push({
      id: generateId(),
      name: name.trim(),
      number
    })
    saveParticipants(participants.value)
    return true
  }

  // 删除参与者
  const deleteParticipant = (id: number) => {
    participants.value = participants.value.filter(p => p.id !== id)
    // 重新计算序号（使用动态位数）
    const totalCount = participants.value.length
    const padding = getNumberPadding(totalCount)
    participants.value.forEach((p, index) => {
      p.number = String(index + 1).padStart(padding, '0')
    })
    saveParticipants(participants.value)
  }

  // 清空所有参与者
  const clearAllParticipants = () => {
    participants.value = []
    saveParticipants(participants.value)
  }

  // 导入参与者
  const importParticipants = (content: string) => {
    const lines = content.split(/\r?\n/).filter(line => line.trim())
    const startIndex = participants.value.length
    const newCount = startIndex + lines.length

    const oldPadding = getNumberPadding(startIndex)
    const newPadding = getNumberPadding(newCount)

    // 如果跨越位数阈值，重新计算所有现有编号
    if (newPadding > oldPadding && startIndex > 0) {
      participants.value.forEach((p, index) => {
        p.number = generateNumber(index + 1, newCount)
      })
    }

    lines.forEach((line, index) => {
      const parts = line.split(/[,\t]/)
      const name = parts[0].trim()

      if (name && !participants.value.some(p => p.name === name)) {
        const number = generateNumber(startIndex + index + 1, newCount)
        participants.value.push({
          name,
          number,
          id: generateId()
        })
      }
    })

    saveParticipants(participants.value)
  }

  // 导出参与者
  const exportParticipants = () => {
    return participants.value.map(p => `${p.number},${p.name}`).join('\n')
  }

  // 开始抽奖 - 返回可用编号池，不设置 isRunning（由外部设置）
  const startLottery = (): number[] | null => {
    if (isRunning.value || participants.value.length === 0) {
      return null
    }

    const { allowRepeat } = settings.value
    const numberPool = generateNumberPool()

    // 获取可用编号
    let availableNumbers = [...numberPool]
    if (!allowRepeat) {
      const usedNames = new Set(history.value.map(h => h.name))
      availableNumbers = numberPool.filter(num => {
        const participant = findParticipantByNumber(num)
        return participant && !usedNames.has(participant.name)
      })

      if (availableNumbers.length === 0) {
        return null
      }
    }

    return availableNumbers
  }

  // 设置运行状态
  const setIsRunning = (value: boolean) => {
    isRunning.value = value
  }

  // 动画完成后调用 - 接收滚轮停止位置的编号
  const onAnimationComplete = (winnerNumber: number) => {
    // 根据编号找到中奖者
    const winnerParticipant = findParticipantByNumber(winnerNumber)
    winner.value = winnerParticipant
    
    if (winnerParticipant) {
      // 记录历史
      history.value.unshift({
        time: new Date().toLocaleString(),
        result: winnerParticipant.number,
        name: winnerParticipant.name
      })
      saveHistory(history.value)
    }
    isRunning.value = false
  }

  // 重置
  const resetWinner = () => {
    winner.value = null
  }

  // 清空历史
  const clearHistory = () => {
    history.value = []
    saveHistory(history.value)
  }

  return {
    participants,
    history,
    settings,
    isRunning,
    winner,
    totalParticipants,
    totalDraws,
    uniqueWinners,
    addParticipant,
    deleteParticipant,
    clearAllParticipants,
    importParticipants,
    exportParticipants,
    startLottery,
    setIsRunning,
    onAnimationComplete,
    resetWinner,
    clearHistory,
    generateNumberPool,
    findParticipantByNumber
  }
}
