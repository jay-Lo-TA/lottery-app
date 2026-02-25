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
      <label>动画效果</label>
      <select
        :value="settings.animationEffect"
        @change="updateSetting('animationEffect', ($event.target as HTMLSelectElement).value as AnimationEffect)"
      >
        <option value="ease">平滑过渡</option>
        <option value="easeIn">缓入</option>
        <option value="easeOut">缓出</option>
        <option value="easeInOut">缓入缓出</option>
        <option value="bounce">弹性效果</option>
      </select>
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
import type { Settings, AnimationEffect } from '../types'

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

.settings-group {
  margin-bottom: 20px;
}

.settings-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #d4d4d8;
}

.settings-group input[type="number"] {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  font-size: 1rem;
  background: #000000;
  color: #fafafa;
  transition: all 0.25s ease;
  font-family: inherit;
}

.settings-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  font-size: 1rem;
  background: #000000;
  color: #fafafa;
  transition: all 0.25s ease;
  font-family: inherit;
  cursor: pointer;
}

.settings-group select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
}

.settings-group input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
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
  accent-color: #fafafa;
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.checkbox-group label {
  margin: 0;
  cursor: pointer;
  color: #d4d4d8;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-top: 25px;
  padding: 20px;
  background: #000000;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #fafafa;
}

.stat-label {
  font-size: 0.85rem;
  color: #71717a;
  margin-top: 4px;
}
</style>
