<template>
  <div class="app">
    <!-- 结果页面 -->
    <div v-if="showResult && isMultiMode" class="result-overlay">
      <div class="result-content">
        <AwardResult
          :awards="multiAwardSettings.awards"
          :winners="awardWinners"
          @export="handleExportCSV"
          @reset="handleResetAll"
        />
        <button class="back-btn" @click="handleHideResult">返回抽奖</button>
      </div>
    </div>

    <h1 class="title">
      <span class="title-icon">🎰</span>
      {{ isMultiMode ? '多奖项抽奖' : '数字滚轮抽奖' }}
    </h1>

    <div class="main-content">
      <!-- 左侧：滚轮和控制 -->
      <div class="panel wheel-panel">
        <div class="panel-title">
          抽奖滚轮
          <span v-if="isMultiMode" class="mode-badge">多奖项</span>
        </div>

        <Wheel
          :participants="participants"
          :is-running="isRunning"
          :available-numbers="availableNumbers"
          :duration="settings.duration"
          :animation-effect="settings.animationEffect"
          :current-award-name="isMultiMode ? currentAward?.name : undefined"
          :award-color="isMultiMode ? getAwardColor(currentAward?.id || '') : undefined"
          :remaining-count="isMultiMode ? remainingCount : undefined"
          :current-award-winners="isMultiMode ? currentAwardWinnersList : undefined"
          @animation-complete="onAnimComplete"
        />

        <div class="controls">
          <button
            v-if="!isMultiMode"
            class="btn btn-primary"
            :disabled="isRunning || participants.length === 0"
            @click="handleStartLottery"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            开始抽奖
          </button>

          <template v-else>
            <button
              class="btn btn-primary"
              :disabled="isRunning || participants.length === 0 || remainingCount <= 0"
              @click="handleStartLottery"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              {{ remainingCount > 0 ? '开始抽奖' : '已抽完' }}
            </button>

            <button
              v-if="remainingCount <= 0 && currentAwardIndex < totalAwardsCount - 1"
              class="btn btn-next"
              @click="handleNextAward"
            >
              下一奖项 →
            </button>

            <button
              v-if="isAllAwardsCompleted"
              class="btn btn-result"
              @click="handleShowResult"
            >
              查看结果
            </button>
          </template>

          <button class="btn btn-secondary" @click="handleReset">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            重置
          </button>
        </div>

        <div class="result-display" v-if="winner && !isMultiMode">
          <div class="result-label">中奖号码</div>
          <div class="result-value">
            <span class="winner-number">{{ winner.number }}</span>
            <span class="winner-name">{{ winner.name }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：名单管理 -->
      <ParticipantList
        :participants="participants"
        @add="handleAddParticipant"
        @delete="handleDeleteParticipant"
        @clear="handleClearAll"
        @import="handleImport"
        @export="handleExport"
      />

      <!-- 设置面板 -->
      <Settings
        :settings="settings"
        :total-participants="totalParticipants"
        :total-draws="totalDraws"
        :unique-winners="uniqueWinners"
        :multi-award-settings="multiAwardSettings"
        @update="settings = $event"
        @update-multi-award="updateMultiAwardSettings"
      />

      <!-- 历史记录（非多奖项模式） -->
      <History
        v-if="!isMultiMode"
        :history="history"
        :show-history="settings.showHistory"
        @export-results="handleExportResults"
        @clear-history="handleClearHistory"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Wheel from './components/Wheel.vue'
import ParticipantList from './components/ParticipantList.vue'
import Settings from './components/Settings.vue'
import History from './components/History.vue'
import AwardResult from './components/AwardResult.vue'
import { useLottery } from './composables/useLottery'

const {
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
  getCurrentAward,
  getRemainingWinners,
  getCurrentAwardWinners,
  getAvailableNumbersForCurrentAward,
  onMultiAwardAnimationComplete,
  nextAward,
  resetMultiAward,
  isAllAwardsCompleted,
  totalAwardsCount,
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
  clearHistory
} = useLottery()

const availableNumbers = ref<number[]>([])
const showResult = ref(false)

// 判断是否启用多奖项模式
const isMultiMode = computed(() => multiAwardSettings.value.enabled)

// 获取当前奖项信息
const currentAward = computed(() => getCurrentAward.value)
const currentAwardWinnersList = computed(() => getCurrentAwardWinners.value)
const remainingCount = computed(() => getRemainingWinners.value)

// 奖项颜色映射
const awardColors: Record<string, string> = {}
multiAwardSettings.value.awards.forEach((award, index) => {
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899']
  awardColors[award.id] = colors[index % colors.length]
})

const getAwardColor = (awardId: string) => awardColors[awardId] || '#f59e0b'

// 开始抽奖
const handleStartLottery = () => {
  if (isMultiMode.value) {
    // 多奖项模式
    const numbers = getAvailableNumbersForCurrentAward()
    if (numbers && numbers.length > 0) {
      availableNumbers.value = numbers
      setIsRunning(true)
    }
  } else {
    // 普通模式
    const numbers = startLottery()
    if (numbers) {
      availableNumbers.value = numbers
      setIsRunning(true)
    }
  }
}

// 动画完成回调
const onAnimComplete = (winnerNumber: number) => {
  if (isMultiMode.value) {
    onMultiAwardAnimationComplete(winnerNumber)
    // 检查当前奖项是否已抽完
    if (getRemainingWinners.value <= 0) {
      // 显示完成提示
      if (currentAwardIndex.value < totalAwardsCount.value - 1) {
        alert(`${currentAward.value?.name} 已抽完！点击确定进入下一奖项。`)
      }
    }
  } else {
    onAnimationComplete(winnerNumber)
  }
}

// 重置
const handleReset = () => {
  availableNumbers.value = []
  resetWinner()
}

// 切换到下一奖项
const handleNextAward = () => {
  nextAward()
  availableNumbers.value = []
}

// 显示结果页面
const handleShowResult = () => {
  showResult.value = true
}

// 隐藏结果页面
const handleHideResult = () => {
  showResult.value = false
}

// 重新抽奖
const handleResetAll = () => {
  if (confirm('确定要重新开始吗？所有中奖记录将被清除。')) {
    resetMultiAward()
    availableNumbers.value = []
    showResult.value = false
    resetWinner()
  }
}

// 导出 CSV
const handleExportCSV = () => {
  const csv = exportAwardWinnersCSV()
  downloadFile(csv, 'award_winners.csv', 'text/csv')
}

const handleAddParticipant = (name: string) => {
  addParticipant(name)
}

const handleDeleteParticipant = (id: number) => {
  deleteParticipant(id)
}

const handleClearAll = () => {
  clearAllParticipants()
  availableNumbers.value = []
  resetWinner()
}

const handleImport = (content: string) => {
  importParticipants(content)
}

const handleExport = () => {
  const content = exportParticipants()
  if (!content) {
    alert('没有参与者可导出')
    return
  }
  downloadFile(content, 'participants.csv', 'text/csv')
}

const handleExportResults = () => {
  const content = '时间,号码,中奖者\n' +
    history.value.map(h => `${h.time},${h.result},${h.name}`).join('\n')
  downloadFile(content, 'lottery_results.csv', 'text/csv')
}

const handleClearHistory = () => {
  clearHistory()
}

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', 'Noto Sans SC', 'PingFang SC', sans-serif;
  background:
    linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%);
  min-height: 100vh;
  padding: 20px;
  color: #fafafa;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  text-align: center;
  color: #fafafa;
  margin-bottom: 30px;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.title-icon {
  margin-right: 12px;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 1.8rem;
  }
}

.panel {
  background: #18181b;
  border-radius: 16px;
  padding: 25px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.08);
}

.wheel-panel {
  grid-row: span 2;
}

.panel-title {
  font-size: 1.3rem;
  color: #fafafa;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  font-weight: 600;
  letter-spacing: 1px;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.btn {
  padding: 14px 36px;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
}

.btn svg {
  vertical-align: middle;
}

.btn-primary {
  background: #fafafa;
  color: #000000;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
}

.btn-primary:hover:not(:disabled) {
  background: #e5e5e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
}

.btn-primary:disabled {
  background: #3f3f46;
  color: #71717a;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: transparent;
  color: #fafafa;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.result-display {
  margin-top: 25px;
  padding: 30px;
  text-align: center;
  background: #fafafa;
  border-radius: 12px;
  color: #000000;
}

.result-label {
  font-size: 1rem;
  margin-bottom: 12px;
  color: #52525b;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.result-value {
  font-size: 2rem;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.winner-number {
  font-size: 3.5rem;
  font-weight: 700;
}

.winner-name {
  font-size: 1.5rem;
  color: #3f3f46;
}

.history-section {
  grid-column: 1 / -1;
}

/* 多奖项模式样式 */
.mode-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #f59e0b;
  color: #fff;
  font-size: 0.75rem;
  border-radius: 12px;
  margin-left: 10px;
  font-weight: normal;
}

.btn-next {
  background: #10b981;
  color: #fff;
}

.btn-next:hover:not(:disabled) {
  background: #059669;
}

.btn-result {
  background: #8b5cf6;
  color: #fff;
}

.btn-result:hover:not(:disabled) {
  background: #7c3aed;
}

/* 结果弹窗 */
.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.result-content {
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.back-btn {
  display: block;
  width: 100%;
  max-width: 200px;
  margin: 20px auto 0;
  padding: 12px 24px;
  background: #3f3f46;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #52525b;
}
</style>
