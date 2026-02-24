import { describe, it, expect } from 'vitest'
import type { Participant, HistoryRecord, Settings } from '../src/types'

describe('Types', () => {
  describe('Participant', () => {
    it('should have correct structure', () => {
      const participant: Participant = {
        id: 1,
        name: '张三',
        number: '001'
      }

      expect(participant.id).toBe(1)
      expect(participant.name).toBe('张三')
      expect(participant.number).toBe('001')
    })
  })

  describe('HistoryRecord', () => {
    it('should have correct structure', () => {
      const record: HistoryRecord = {
        time: '2024/1/1 12:00:00',
        result: '001',
        name: '张三'
      }

      expect(record.time).toBe('2024/1/1 12:00:00')
      expect(record.result).toBe('001')
      expect(record.name).toBe('张三')
    })
  })

  describe('Settings', () => {
    it('should have correct structure', () => {
      const settings: Settings = {
        duration: 3,
        spins: 5,
        allowRepeat: true,
        showHistory: true
      }

      expect(settings.duration).toBe(3)
      expect(settings.spins).toBe(5)
      expect(settings.allowRepeat).toBe(true)
      expect(settings.showHistory).toBe(true)
    })

    it('should allow partial updates', () => {
      const settings: Settings = {
        duration: 3,
        spins: 5,
        allowRepeat: true,
        showHistory: true
      }

      const updated: Settings = {
        ...settings,
        duration: 5
      }

      expect(updated.duration).toBe(5)
      expect(updated.spins).toBe(5)
    })
  })
})
