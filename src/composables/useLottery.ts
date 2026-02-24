import { ref, computed } from 'vue'
import type { Participant, HistoryRecord, Settings } from '../types'
import { useStorage } from './useStorage'

// 唯一 ID 生成器
let idCounter = Date.now()
const generateId = () => ++idCounter

export function useLottery() {
  const { loadParticipants, loadHistory, saveParticipants, saveHistory, defaultSettings } = useStorage()

  const participants = ref<Participant[]>(loadParticipants())
  const history = ref<HistoryRecord[]>(loadHistory())
  const settings = ref<Settings>(defaultSettings)
  const isRunning = ref(false)
  const winner = ref<Participant | null>(null)

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

    const number = String(participants.value.length + 1).padStart(3, '0')
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
    // 重新计算序号
    participants.value.forEach((p, index) => {
      p.number = String(index + 1).padStart(3, '0')
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

    lines.forEach((line, index) => {
      const parts = line.split(/[,\t]/)
      const name = parts[0].trim()

      if (name && !participants.value.some(p => p.name === name)) {
        const number = String(startIndex + index + 1).padStart(3, '0')
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

  // 开始抽奖 - 返回结果，动画由组件控制
  const startLottery = async (): Promise<number | null> => {
    if (isRunning.value || participants.value.length === 0) {
      return null
    }

    isRunning.value = true
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
        isRunning.value = false
        return null
      }
    }

    // 随机选择编号
    const winnerNum = availableNumbers[Math.floor(Math.random() * availableNumbers.length)]
    winner.value = findParticipantByNumber(winnerNum)

    return winnerNum
  }

  // 动画完成后调用
  const onAnimationComplete = () => {
    if (winner.value) {
      // 记录历史
      history.value.unshift({
        time: new Date().toLocaleString(),
        result: winner.value.number,
        name: winner.value.name
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
    onAnimationComplete,
    resetWinner,
    clearHistory,
    generateNumberPool,
    findParticipantByNumber
  }
}
