import { describe, it, expect, beforeEach } from 'vitest'
import { useLottery } from '../src/composables/useLottery'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
    removeItem: (key: string) => { delete store[key] }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useLottery', () => {
  let lottery: ReturnType<typeof useLottery>

  beforeEach(() => {
    localStorageMock.clear()
    lottery = useLottery()
  })

  describe('addParticipant', () => {
    it('should add a new participant', () => {
      lottery.addParticipant('张三')

      expect(lottery.participants.value).toHaveLength(1)
      expect(lottery.participants.value[0].name).toBe('张三')
      expect(lottery.participants.value[0].number).toBe('001')
    })

    it('should not add empty name', () => {
      const result = lottery.addParticipant('')

      expect(result).toBe(false)
      expect(lottery.participants.value).toHaveLength(0)
    })

    it('should not add duplicate name', () => {
      lottery.addParticipant('张三')
      const result = lottery.addParticipant('张三')

      expect(result).toBe(false)
      expect(lottery.participants.value).toHaveLength(1)
    })

    it('should auto-increment participant number', () => {
      lottery.addParticipant('张三')
      lottery.addParticipant('李四')
      lottery.addParticipant('王五')

      expect(lottery.participants.value).toHaveLength(3)
      expect(lottery.participants.value[0].number).toBe('001')
      expect(lottery.participants.value[1].number).toBe('002')
      expect(lottery.participants.value[2].number).toBe('003')
    })
  })

  describe('deleteParticipant', () => {
    it('should delete a participant by id', () => {
      lottery.addParticipant('张三')
      lottery.addParticipant('李四')
      const idToDelete = lottery.participants.value[0].id

      lottery.deleteParticipant(idToDelete)

      expect(lottery.participants.value).toHaveLength(1)
      expect(lottery.participants.value[0].name).toBe('李四')
    })

    it('should renumber participants after deletion', () => {
      lottery.addParticipant('张三')
      lottery.addParticipant('李四')
      lottery.addParticipant('王五')
      const idToDelete = lottery.participants.value[1].id

      lottery.deleteParticipant(idToDelete)

      expect(lottery.participants.value).toHaveLength(2)
      expect(lottery.participants.value[0].number).toBe('001')
      expect(lottery.participants.value[1].number).toBe('002')
    })
  })

  describe('clearAllParticipants', () => {
    it('should clear all participants', () => {
      lottery.addParticipant('张三')
      lottery.addParticipant('李四')

      lottery.clearAllParticipants()

      expect(lottery.participants.value).toHaveLength(0)
    })
  })

  describe('importParticipants', () => {
    it('should import participants from text', () => {
      lottery.importParticipants('张三\n李四\n王五')

      expect(lottery.participants.value).toHaveLength(3)
      expect(lottery.participants.value[0].name).toBe('张三')
      expect(lottery.participants.value[1].name).toBe('李四')
      expect(lottery.participants.value[2].name).toBe('王五')
    })

    it('should handle CSV format', () => {
      lottery.importParticipants('001,张三\n002,李四')

      expect(lottery.participants.value).toHaveLength(2)
    })

    it('should skip duplicate names', () => {
      lottery.addParticipant('张三')
      lottery.importParticipants('张三\n李四')

      expect(lottery.participants.value).toHaveLength(2)
    })

    it('should continue numbering from existing participants', () => {
      lottery.addParticipant('张三')
      lottery.importParticipants('李四')

      expect(lottery.participants.value).toHaveLength(2)
      expect(lottery.participants.value[1].number).toBe('002')
    })
  })

  describe('exportParticipants', () => {
    it('should export participants as CSV', () => {
      lottery.addParticipant('张三')
      lottery.addParticipant('李四')

      const result = lottery.exportParticipants()

      expect(result).toBe('001,张三\n002,李四')
    })

    it('should return empty string when no participants', () => {
      const result = lottery.exportParticipants()

      expect(result).toBe('')
    })
  })

  describe('generateNumberPool', () => {
    it('should generate pool from 1 to participant count', () => {
      lottery.addParticipant('张三')
      lottery.addParticipant('李四')
      lottery.addParticipant('王五')

      const pool = lottery.generateNumberPool()

      expect(pool).toEqual([1, 2, 3])
    })

    it('should return empty array when no participants', () => {
      const pool = lottery.generateNumberPool()

      expect(pool).toEqual([])
    })
  })

  describe('findParticipantByNumber', () => {
    it('should find participant by number', () => {
      lottery.addParticipant('张三')
      lottery.addParticipant('李四')

      const result = lottery.findParticipantByNumber(2)

      expect(result.name).toBe('李四')
    })
  })

  describe('startLottery', () => {
    it('should return null when no participants', () => {
      const result = lottery.startLottery()

      expect(result).toBeNull()
    })

    it('should return available numbers array when participants exist', () => {
      lottery.addParticipant('张三')
      lottery.addParticipant('李四')

      const result = lottery.startLottery()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result).toContain(1)
      expect(result).toContain(2)
    })

    it('should not record history until onAnimationComplete is called', () => {
      lottery.addParticipant('张三')
      lottery.startLottery()

      // 历史记录应该为空，因为动画还没完成
      expect(lottery.history.value).toHaveLength(0)
    })
  })

  describe('onAnimationComplete', () => {
    it('should record history when animation completes', () => {
      lottery.addParticipant('张三')
      lottery.startLottery()
      lottery.onAnimationComplete(1)

      expect(lottery.history.value).toHaveLength(1)
    })
  })

  describe('clearHistory', () => {
    it('should clear all history after lottery', () => {
      lottery.addParticipant('张三')
      lottery.startLottery()
      lottery.onAnimationComplete(1)

      expect(lottery.history.value).toHaveLength(1)

      lottery.clearHistory()

      expect(lottery.history.value).toHaveLength(0)
    })
  })

  describe('statistics', () => {
    it('should calculate totalParticipants', () => {
      lottery.addParticipant('张三')
      lottery.addParticipant('李四')

      expect(lottery.totalParticipants.value).toBe(2)
    })

    it('should calculate totalDraws after animation completes', () => {
      lottery.addParticipant('张三')
      lottery.startLottery()
      lottery.onAnimationComplete(1)

      expect(lottery.totalDraws.value).toBe(1)
    })

    it('should calculate uniqueWinners after animation completes', () => {
      lottery.addParticipant('张三')
      lottery.addParticipant('李四')

      lottery.startLottery()
      lottery.onAnimationComplete(1)

      expect(lottery.uniqueWinners.value).toBe(1)
    })
  })
})
