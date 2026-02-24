<template>
  <div class="panel">
    <div class="panel-title">名单管理</div>

    <div class="participant-input">
      <input
        type="text"
        v-model="newName"
        placeholder="输入参与者名称"
        @keyup.enter="addParticipant"
      />
      <button class="btn-add" @click="addParticipant">添加</button>
    </div>

    <div class="file-operations">
      <button class="btn-file" @click="triggerImport">📥 导入名单</button>
      <button class="btn-file" @click="handleExport">📤 导出名单</button>
      <button class="btn-file btn-danger" @click="handleClearAll">🗑️ 清空名单</button>
    </div>

    <div class="participant-list">
      <div v-if="participants.length === 0" class="empty-state">
        暂无参与者，请添加
      </div>
      <div
        v-for="p in participants"
        :key="p.id"
        class="participant-item"
      >
        <span class="participant-number">#{{ p.number }}</span>
        <span class="participant-name">{{ p.name }}</span>
        <button class="btn-delete" @click="$emit('delete', p.id)">删除</button>
      </div>
    </div>

    <input
      type="file"
      ref="fileInput"
      accept=".txt,.csv,.json"
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Participant } from '../types'

const props = defineProps<{
  participants: Participant[]
}>()

const emit = defineEmits<{
  (e: 'add', name: string): void
  (e: 'delete', id: number): void
  (e: 'clear'): void
  (e: 'import', content: string): void
  (e: 'export'): void
}>()

const newName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const addParticipant = () => {
  if (newName.value.trim()) {
    emit('add', newName.value)
    newName.value = ''
  }
}

const triggerImport = () => {
  fileInput.value?.click()
}

const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    emit('import', content)
  }
  reader.readAsText(file)
  target.value = ''
}

const handleExport = () => {
  emit('export')
}

const handleClearAll = () => {
  if (props.participants.length === 0) {
    alert('名单已经是空的')
    return
  }
  if (confirm(`确定要清空所有 ${props.participants.length} 个参与者吗？`)) {
    emit('clear')
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

.participant-input {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.participant-input input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
}

.participant-input input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-add {
  padding: 12px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-add:hover {
  background: #5a6fd6;
}

.file-operations {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
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

.btn-file.btn-danger {
  background: #ffe0e0;
  color: #d33;
}

.btn-file.btn-danger:hover {
  background: #ffcccc;
}

.participant-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 10px;
}

.participant-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

.participant-item:hover {
  background: #f8f9ff;
}

.participant-item:last-child {
  border-bottom: none;
}

.participant-number {
  font-weight: bold;
  color: #667eea;
  margin-right: 10px;
  min-width: 50px;
}

.participant-name {
  flex: 1;
  font-size: 1rem;
}

.btn-delete {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-delete:hover {
  background: #ee5a5a;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
