import { ref, computed, watch } from 'vue'
import type { Participant, HistoryRecord, Settings, AwardWinner, MultiAwardSettings } from '../types'
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
  const { loadParticipants, loadHistory, loadSettings, loadAwards, loadAwardWinners,
    saveParticipants, saveHistory, saveSettings, saveAwards, saveAwardWinners } = useStorage()

  const participants = ref<Participant[]>(loadParticipants())
  const history = ref<HistoryRecord[]>(loadHistory())
  const settings = ref<Settings>(loadSettings())
  const isRunning = ref(false)
  const winner = ref<Participant | null>(null)

  // 多奖项模式状态
  const multiAwardSettings = ref<MultiAwardSettings>(loadAwards())
  const awardWinners = ref<AwardWinner[]>(loadAwardWinners())
  const currentAwardIndex = ref(0)
  const isMultiAwardMode = ref(false)

  // 监听设置变化并保存
  watch(settings, (newSettings) => {
    saveSettings(newSettings)
  }, { deep: true })

  // 监听多奖项设置变化并保存
  watch(multiAwardSettings, (newSettings) => {
    saveAwards(newSettings)
  }, { deep: true })

  // 监听中奖记录变化并保存
  watch(awardWinners, (newWinners) => {
    saveAwardWinners(newWinners)
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

  // 多奖项模式方法
  const getCurrentAward = computed(() => {
    if (!multiAwardSettings.value.enabled) return null
    return multiAwardSettings.value.awards[currentAwardIndex.value] || null
  })

  const getRemainingWinners = computed(() => {
    if (!multiAwardSettings.value.enabled) return 0
    const currentAward = getCurrentAward.value
    if (!currentAward) return 0

    const currentAwardWinners = awardWinners.value.filter(
      w => w.awardId === currentAward.id
    )
    return currentAward.count - currentAwardWinners.length
  })

  const getCurrentAwardWinners = computed(() => {
    if (!multiAwardSettings.value.enabled) return []
    const currentAward = getCurrentAward.value
    if (!currentAward) return []

    return awardWinners.value.filter(w => w.awardId === currentAward.id)
  })

  const getAllAwardWinners = computed(() => {
    return awardWinners.value
  })

  const getAwardWinnersByAward = (awardId: string) => {
    return awardWinners.value.filter(w => w.awardId === awardId)
  }

  // 获取当前奖项的可用编号池
  const getAvailableNumbersForCurrentAward = (): number[] | null => {
    if (!multiAwardSettings.value.enabled) return null
    const currentAward = getCurrentAward.value
    if (!currentAward) return null

    const numberPool = generateNumberPool()
    const { allowRepeat } = settings.value

    let availableNumbers = [...numberPool]
    if (!allowRepeat) {
      // 排除已经中奖的人
      const winnerIds = new Set(awardWinners.value.map(w => w.participant.id))
      availableNumbers = numberPool.filter(num => {
        const participant = findParticipantByNumber(num)
        return participant && !winnerIds.has(participant.id)
      })
    }

    return availableNumbers
  }

  // 多奖项模式抽奖完成回调
  const onMultiAwardAnimationComplete = (winnerNumber: number) => {
    const currentAward = getCurrentAward.value
    if (!currentAward) return

    const winnerParticipant = findParticipantByNumber(winnerNumber)
    if (!winnerParticipant) return

    // 添加中奖记录
    const awardWinner: AwardWinner = {
      awardId: currentAward.id,
      awardName: currentAward.name,
      participant: winnerParticipant,
      time: new Date().toLocaleString()
    }
    awardWinners.value.unshift(awardWinner)
    saveAwardWinners(awardWinners.value)

    isRunning.value = false

    // 检查当前奖项是否已抽完
    const remaining = getRemainingWinners.value
    if (remaining <= 0) {
      // 当前奖项已抽完，检查是否还有下一个奖项
      if (currentAwardIndex.value < multiAwardSettings.value.awards.length - 1) {
        // 还有下一个奖项
        currentAwardIndex.value++
      }
    }
  }

  // 进入下一个奖项
  const nextAward = () => {
    if (currentAwardIndex.value < multiAwardSettings.value.awards.length - 1) {
      currentAwardIndex.value++
      return true
    }
    return false
  }

  // 切换到上一个奖项
  const prevAward = () => {
    if (currentAwardIndex.value > 0) {
      currentAwardIndex.value--
      return true
    }
    return false
  }

  // 重置多奖项模式
  const resetMultiAward = () => {
    currentAwardIndex.value = 0
    awardWinners.value = []
    saveAwardWinners([])
  }

  // 判断所有奖项是否已抽完
  const isAllAwardsCompleted = computed(() => {
    if (!multiAwardSettings.value.enabled) return false
    return currentAwardIndex.value >= multiAwardSettings.value.awards.length - 1 &&
      getRemainingWinners.value <= 0
  })

  // 获取奖项总数
  const totalAwardsCount = computed(() => multiAwardSettings.value.awards.length)

  // 获取已完成奖项数
  const completedAwardsCount = computed(() => {
    if (!multiAwardSettings.value.enabled) return 0
    let count = 0
    for (let i = 0; i < multiAwardSettings.value.awards.length; i++) {
      const award = multiAwardSettings.value.awards[i]
      const winners = awardWinners.value.filter(w => w.awardId === award.id)
      if (winners.length >= award.count) {
        count++
      }
    }
    return count
  })

  // 更新多奖项设置
  const updateMultiAwardSettings = (newSettings: MultiAwardSettings) => {
    multiAwardSettings.value = newSettings
    saveAwards(newSettings)
  }

  // 导出多奖项结果为 CSV
  const exportAwardWinnersCSV = (): string => {
    const headers = ['奖项', '编号', '姓名', '抽奖时间']
    const rows = awardWinners.value.map(w => [
      w.awardName,
      w.participant.number,
      w.participant.name,
      w.time
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
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
    // 多奖项模式
    multiAwardSettings,
    awardWinners,
    currentAwardIndex,
    isMultiAwardMode,
    getCurrentAward,
    getRemainingWinners,
    getCurrentAwardWinners,
    getAllAwardWinners,
    getAwardWinnersByAward,
    getAvailableNumbersForCurrentAward,
    onMultiAwardAnimationComplete,
    nextAward,
    prevAward,
    resetMultiAward,
    isAllAwardsCompleted,
    totalAwardsCount,
    completedAwardsCount,
    updateMultiAwardSettings,
    exportAwardWinnersCSV,
    // 原有方法
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
