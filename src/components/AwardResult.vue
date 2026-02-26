<template>
  <div class="award-result">
    <div class="result-header">
      <h2>抽奖结果</h2>
      <div class="header-actions">
        <button class="export-btn" @click="handleExport">
          导出 CSV
        </button>
        <button class="reset-btn" @click="handleReset">
          重新抽奖
        </button>
      </div>
    </div>

    <div v-if="awards.length === 0" class="empty-result">
      暂无抽奖结果
    </div>

    <div v-else class="awards-result">
      <div
        v-for="award in awards"
        :key="award.id"
        class="award-section"
      >
        <div class="award-title" :style="{ borderLeftColor: award.color || '#f59e0b' }">
          <span class="award-name">{{ award.name }}</span>
          <span class="award-count">（{{ getWinnersCount(award.id) }}/{{ award.count }}）</span>
        </div>

        <div v-if="getWinnersByAward(award.id).length === 0" class="no-winners">
          等待抽取...
        </div>

        <div v-else class="winners-grid">
          <div
            v-for="winner in getWinnersByAward(award.id)"
            :key="winner.participant.id"
            class="winner-card"
            :style="{ borderLeftColor: award.color || '#f59e0b' }"
          >
            <div class="winner-number">{{ winner.participant.number }}</div>
            <div class="winner-name">{{ winner.participant.name }}</div>
            <div class="winner-time">{{ winner.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Award, AwardWinner } from '../types'

const props = defineProps<{
  awards: Award[]
  winners: AwardWinner[]
}>()

const emit = defineEmits<{
  (e: 'export'): void
  (e: 'reset'): void
}>()

const getWinnersByAward = (awardId: string) => {
  return props.winners.filter(w => w.awardId === awardId)
}

const getWinnersCount = (awardId: string) => {
  return getWinnersByAward(awardId).length
}

const handleExport = () => {
  emit('export')
}

const handleReset = () => {
  if (confirm('确定要重新开始抽奖吗？所有中奖记录将被清除。')) {
    emit('reset')
  }
}
</script>

<style scoped>
.award-result {
  background: #18181b;
  border-radius: 16px;
  padding: 25px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.08);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.result-header h2 {
  font-size: 1.3rem;
  color: #fafafa;
  margin: 0;
  font-weight: 600;
  letter-spacing: 1px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.export-btn,
.reset-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.export-btn {
  background: #3b82f6;
  color: #fff;
}

.export-btn:hover {
  background: #2563eb;
}

.reset-btn {
  background: #3f3f46;
  color: #d4d4d8;
}

.reset-btn:hover {
  background: #ef4444;
  color: #fff;
}

.empty-result {
  text-align: center;
  color: #71717a;
  padding: 40px;
  font-size: 1.1rem;
}

.awards-result {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.award-section {
  background: #27272a;
  border-radius: 12px;
  padding: 20px;
}

.award-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-left: 12px;
  border-left: 4px solid;
}

.award-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fafafa;
}

.award-count {
  font-size: 0.9rem;
  color: #a1a1aa;
}

.no-winners {
  text-align: center;
  color: #71717a;
  padding: 20px;
}

.winners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.winner-card {
  background: #18181b;
  border-radius: 10px;
  padding: 15px;
  border-left: 3px solid;
  text-align: center;
}

.winner-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fafafa;
  margin-bottom: 5px;
}

.winner-name {
  font-size: 1rem;
  color: #d4d4d8;
  margin-bottom: 5px;
}

.winner-time {
  font-size: 0.75rem;
  color: #71717a;
}
</style>
