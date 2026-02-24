<template>
  <div class="app">
    <h1>🎰 数字滚轮抽奖</h1>

    <div class="main-content">
      <!-- 左侧：滚轮和控制 -->
      <div class="panel">
        <div class="panel-title">抽奖滚轮</div>

        <Wheel
          :participants="participants"
          :is-running="isRunning"
          :winner-number="winnerNumber"
          :duration="settings.duration"
          :spins="settings.spins"
          @animation-complete="onAnimComplete"
        />

        <div class="controls">
          <button
            class="btn btn-primary"
            :disabled="isRunning || participants.length === 0"
            @click="handleStartLottery"
          >
            开始抽奖
          </button>
          <button class="btn btn-secondary" @click="handleReset">重置</button>
        </div>

        <div class="result-display" v-if="winner">
          <div class="result-label">中奖号码</div>
          <div class="result-value">编号 {{ winner.number }} - {{ winner.name }}</div>
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
        @update="settings = $event"
      />

      <!-- 历史记录 -->
      <History
        :history="history"
        :show-history="settings.showHistory"
        @export-results="handleExportResults"
        @clear-history="handleClearHistory"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Wheel from './components/Wheel.vue'
import ParticipantList from './components/ParticipantList.vue'
import Settings from './components/Settings.vue'
import History from './components/History.vue'
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
  addParticipant,
  deleteParticipant,
  clearAllParticipants,
  importParticipants,
  exportParticipants,
  startLottery,
  onAnimationComplete,
  resetWinner,
  clearHistory
} = useLottery()

const winnerNumber = ref<number | null>(null)

const handleStartLottery = async () => {
  winnerNumber.value = await startLottery()
}

const onAnimComplete = () => {
  onAnimationComplete()
}

const handleReset = () => {
  winnerNumber.value = null
  resetWinner()
}

const handleAddParticipant = (name: string) => {
  addParticipant(name)
}

const handleDeleteParticipant = (id: number) => {
  deleteParticipant(id)
}

const handleClearAll = () => {
  clearAllParticipants()
  winnerNumber.value = null
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: white;
  margin-bottom: 30px;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
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
}

.panel {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.panel-title {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.btn {
  padding: 15px 40px;
  font-size: 1.2rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

.result-display {
  margin-top: 20px;
  padding: 30px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
}

.result-label {
  font-size: 1.2rem;
  margin-bottom: 10px;
  opacity: 0.9;
}

.result-value {
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.history-section {
  grid-column: 1 / -1;
}
</style>
