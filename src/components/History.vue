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
      <button class="btn-file" @click="handleExportResults">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        导出
      </button>
      <button class="btn-file" @click="handleClearHistory">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        清空
      </button>
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
  background: #18181b;
  border-radius: 16px;
  padding: 25px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.08);
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

.history-section {
  grid-column: 1 / -1;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: #000000;
}

.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: #000000;
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: background 0.2s ease;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.history-item:last-child {
  border-bottom: none;
}

.history-time {
  color: #71717a;
  font-size: 0.85rem;
}

.history-result {
  font-weight: 600;
  color: #fafafa;
}

.file-operations {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-file {
  flex: 1;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #fafafa;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}

.btn-file:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
}

.btn-file svg {
  margin-right: 6px;
  vertical-align: middle;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.4);
}
</style>
