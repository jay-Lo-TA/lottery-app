<template>
  <div class="award-settings">
    <div class="award-header">
      <div class="checkbox-group">
        <input
          type="checkbox"
          id="enableMultiAward"
          :checked="multiAwardSettings.enabled"
          @change="toggleEnabled"
        />
        <label for="enableMultiAward">启用多奖项模式</label>
      </div>
    </div>

    <div v-if="multiAwardSettings.enabled" class="awards-list">
      <div
        v-for="(award, index) in multiAwardSettings.awards"
        :key="award.id"
        class="award-item"
        draggable="true"
        @dragstart="onDragStart(index)"
        @dragover.prevent
        @drop="onDrop(index)"
      >
        <div class="drag-handle">⋮⋮</div>
        <div class="award-info">
          <input
            type="text"
            :value="award.name"
            @input="updateAward(index, 'name', ($event.target as HTMLInputElement).value)"
            placeholder="奖项名称"
            class="award-name-input"
          />
          <div class="award-count">
            <label>名额：</label>
            <input
              type="number"
              :value="award.count"
              @input="updateAward(index, 'count', +($event.target as HTMLInputElement).value)"
              min="1"
              max="100"
              class="count-input"
            />
          </div>
        </div>
        <button class="delete-btn" @click="deleteAward(index)" title="删除奖项">×</button>
      </div>

      <button class="add-btn" @click="addAward">+ 添加奖项</button>

      <div v-if="validationError" class="validation-error">
        {{ validationError }}
      </div>

      <div class="award-summary">
        <span>奖项数量: {{ multiAwardSettings.awards.length }}</span>
        <span>总名额: {{ totalWinnerCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Award, MultiAwardSettings } from '../types'

const props = defineProps<{
  multiAwardSettings: MultiAwardSettings
  participantCount: number
}>()

const emit = defineEmits<{
  (e: 'update', settings: MultiAwardSettings): void
}>()

const dragIndex = ref<number | null>(null)

const totalWinnerCount = computed(() => {
  return props.multiAwardSettings.awards.reduce((sum, award) => sum + award.count, 0)
})

const validationError = computed(() => {
  if (!props.multiAwardSettings.enabled) return ''
  if (props.participantCount === 0) return '请先添加参与者'
  if (totalWinnerCount.value > props.participantCount) {
    return `总名额 (${totalWinnerCount.value}) 超过参与人数 (${props.participantCount})`
  }
  return ''
})

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

const toggleEnabled = () => {
  emit('update', {
    ...props.multiAwardSettings,
    enabled: !props.multiAwardSettings.enabled
  })
}

const addAward = () => {
  const newAward: Award = {
    id: generateId(),
    name: `奖项 ${props.multiAwardSettings.awards.length + 1}`,
    count: 1,
    color: getAwardColor(props.multiAwardSettings.awards.length)
  }
  emit('update', {
    ...props.multiAwardSettings,
    awards: [...props.multiAwardSettings.awards, newAward]
  })
}

const updateAward = (index: number, key: keyof Award, value: string | number) => {
  const updatedAwards = [...props.multiAwardSettings.awards]
  updatedAwards[index] = { ...updatedAwards[index], [key]: value }
  emit('update', {
    ...props.multiAwardSettings,
    awards: updatedAwards
  })
}

const deleteAward = (index: number) => {
  const updatedAwards = props.multiAwardSettings.awards.filter((_, i) => i !== index)
  emit('update', {
    ...props.multiAwardSettings,
    awards: updatedAwards
  })
}

const onDragStart = (index: number) => {
  dragIndex.value = index
}

const onDrop = (dropIndex: number) => {
  if (dragIndex.value === null || dragIndex.value === dropIndex) return

  const awards = [...props.multiAwardSettings.awards]
  const [draggedItem] = awards.splice(dragIndex.value, 1)
  awards.splice(dropIndex, 0, draggedItem)

  emit('update', {
    ...props.multiAwardSettings,
    awards
  })

  dragIndex.value = null
}

const getAwardColor = (index: number): string => {
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899']
  return colors[index % colors.length]
}
</script>

<style scoped>
.award-settings {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.award-header {
  margin-bottom: 15px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.checkbox-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #f59e0b;
}

.checkbox-group label {
  cursor: pointer;
  color: #fafafa;
  font-weight: 600;
}

.awards-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.award-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #27272a;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.award-item:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.drag-handle {
  cursor: grab;
  color: #71717a;
  font-size: 1.2rem;
  padding: 0 5px;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.award-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 15px;
}

.award-name-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  background: #18181b;
  color: #fafafa;
  font-size: 0.95rem;
}

.award-name-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
}

.award-count {
  display: flex;
  align-items: center;
  gap: 8px;
}

.award-count label {
  color: #a1a1aa;
  font-size: 0.9rem;
}

.count-input {
  width: 60px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  background: #18181b;
  color: #fafafa;
  font-size: 0.95rem;
  text-align: center;
}

.count-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
}

.delete-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: #3f3f46;
  color: #a1a1aa;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: #ef4444;
  color: #fafafa;
}

.add-btn {
  padding: 10px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: transparent;
  color: #a1a1aa;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  border-color: rgba(255, 255, 255, 0.4);
  color: #fafafa;
}

.validation-error {
  padding: 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 10px;
}

.award-summary {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding: 10px 15px;
  background: #18181b;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #a1a1aa;
}
</style>
