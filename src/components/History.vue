<template>
  <div class="panel history-section" v-if="showHistory">
    <div class="panel-title">抽奖历史</div>
    <div class="history-list">
      <div v-if="history.length === 0" class="empty-state">
        暂无抽奖记录
      </div>
      <div v-for="(item, index) in history" :key="index" class="history-item">
        <span class="history-time">{{ item.time }}</span>
        <span class="history-result">{{ item.result }} - {{ item.name }}</span>
      </div>
    </div>
    <div class="file-operations">
      <button class="btn-file" @click="handleExportResults">📤 导出结果</button>
      <button class="btn-file" @click="handleClearHistory">🗑️ 清空历史</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HistoryRecord } from '../types'

const props = defineProps<{
  history: HistoryRecord[]
  showHistory: boolean
}>()

const emit = defineEmits<{
  (e: 'exportResults'): void
  (e: 'clearHistory'): void
}>()

const handleExportResults = () => {
  if (props.history.length === 0) {
    alert('没有抽奖记录可导出')
    return
  }
  emit('exportResults')
}

const handleClearHistory = () => {
  if (props.history.length === 0) {
    alert('没有历史记录')
    return
  }
  if (confirm('确定要清空所有抽奖历史吗？')) {
    emit('clearHistory')
  }
}
</script>

<style scoped>
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

.history-section {
  grid-column: 1 / -1;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
}

.history-time {
  color: #999;
  font-size: 0.9rem;
}

.history-result {
  font-weight: bold;
  color: #667eea;
}

.file-operations {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-file {
  flex: 1;
  padding: 10px;
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-file:hover {
  background: #e0e0e0;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
