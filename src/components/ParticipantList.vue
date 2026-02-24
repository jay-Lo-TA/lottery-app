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
      <button class="btn-file" @click="triggerImport">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        导入
      </button>
      <button class="btn-file" @click="handleExport">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        导出
      </button>
      <button class="btn-file btn-danger" @click="handleClearAll">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        清空
      </button>
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
        <button class="btn-delete" @click="$emit('delete', p.id)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
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

.participant-input {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.participant-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  font-size: 1rem;
  background: #000000;
  color: #fafafa;
  transition: all 0.25s ease;
  font-family: inherit;
}

.participant-input input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
}

.participant-input input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.btn-add {
  padding: 12px 24px;
  background: #fafafa;
  color: #000000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.25s ease;
  font-family: inherit;
}

.btn-add:hover {
  background: #e5e5e5;
}

.btn-add:active {
  transform: translateY(0);
}

.file-operations {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
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

.btn-file svg {
  margin-right: 6px;
  vertical-align: middle;
}

.btn-file:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
}

.btn-file.btn-danger {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
  color: #fafafa;
}

.btn-file.btn-danger:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.participant-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: #000000;
}

.participant-list::-webkit-scrollbar {
  width: 6px;
}

.participant-list::-webkit-scrollbar-track {
  background: #000000;
  border-radius: 3px;
}

.participant-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.participant-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.participant-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: background 0.2s ease;
}

.participant-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.participant-item:last-child {
  border-bottom: none;
}

.participant-number {
  font-weight: 600;
  color: #fafafa;
  margin-right: 12px;
  min-width: 50px;
}

.participant-name {
  flex: 1;
  font-size: 1rem;
  color: #d4d4d8;
}

.btn-delete {
  background: transparent;
  color: #71717a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-delete:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fafafa;
  border-color: rgba(255, 255, 255, 0.2);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.4);
}
</style>
