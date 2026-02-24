<template>
  <div class="panel">
    <div class="panel-title">抽奖设置</div>

    <div class="settings-group">
      <label>滚动时长（秒）</label>
      <input
        type="number"
        :value="settings.duration"
        @input="updateSetting('duration', +($event.target as HTMLInputElement).value)"
        min="1"
        max="10"
      />
    </div>

    <div class="settings-group">
      <label>每次滚动圈数</label>
      <input
        type="number"
        :value="settings.spins"
        @input="updateSetting('spins', +($event.target as HTMLInputElement).value)"
        min="1"
        max="20"
      />
    </div>

    <div class="settings-group checkbox-group">
      <input
        type="checkbox"
        id="allowRepeat"
        :checked="settings.allowRepeat"
        @change="updateSetting('allowRepeat', ($event.target as HTMLInputElement).checked)"
      />
      <label for="allowRepeat">允许重复中奖</label>
    </div>

    <div class="settings-group checkbox-group">
      <input
        type="checkbox"
        id="showHistory"
        :checked="settings.showHistory"
        @change="updateSetting('showHistory', ($event.target as HTMLInputElement).checked)"
      />
      <label for="showHistory">显示抽奖历史</label>
    </div>

    <div class="stats">
      <div class="stat-item">
        <div class="stat-value">{{ totalParticipants }}</div>
        <div class="stat-label">总人数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ totalDraws }}</div>
        <div class="stat-label">抽奖次数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ uniqueWinners }}</div>
        <div class="stat-label">中奖人数</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Settings } from '../types'

const props = defineProps<{
  settings: Settings
  totalParticipants: number
  totalDraws: number
  uniqueWinners: number
}>()

const emit = defineEmits<{
  (e: 'update', settings: Settings): void
}>()

const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
  emit('update', {
    ...props.settings,
    [key]: value
  })
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

.settings-group {
  margin-bottom: 20px;
}

.settings-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.settings-group input[type="number"] {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.settings-group input:focus {
  outline: none;
  border-color: #667eea;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox-group input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.checkbox-group label {
  margin: 0;
  cursor: pointer;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  padding: 15px;
  background: #f8f9ff;
  border-radius: 10px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}
</style>
