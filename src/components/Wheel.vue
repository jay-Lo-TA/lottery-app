<template>
  <div class="wheel-container" v-if="participants.length > 0">
    <div class="wheel-column">
      <div class="wheel-strip" ref="stripRef">
        <div
          v-for="(num, index) in numberList"
          :key="index"
          class="wheel-digit"
          :class="{ highlight: index === targetIndex }"
        >
          {{ String(num).padStart(3, '0') }}
        </div>
      </div>
    </div>
  </div>
  <div v-else class="empty-wheel">
    请先添加参与者
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import type { Participant } from '../types'

const props = defineProps<{
  participants: Participant[]
  isRunning: boolean
  winnerNumber: number | null
  duration: number
  spins: number
}>()

const emit = defineEmits<{
  (e: 'animationComplete'): void
}>()

const stripRef = ref<HTMLElement | null>(null)
const targetIndex = ref<number>(0)
const digitHeight = 120
const isAnimating = ref(false)

// 生成滚轮数字列表：重复参与者编号多次以支持动画
const numberList = computed(() => {
  const count = props.participants.length
  if (count === 0) return []
  // 需要足够的轮数来支持动画：spins 圈 + 额外余量
  const rounds = props.spins + 3
  const numbers: number[] = []
  for (let i = 0; i < rounds * count; i++) {
    numbers.push((i % count) + 1)
  }
  return numbers
})

// 执行滚动动画
const animate = () => {
  if (!stripRef.value || isAnimating.value) return

  const count = props.participants.length
  if (count === 0 || !props.winnerNumber) return

  isAnimating.value = true

  // 计算目标位置：在最后一轮中找到中奖编号的位置
  const rounds = props.spins + 2
  const winnerRoundIndex = rounds * count + (props.winnerNumber - 1)
  targetIndex.value = winnerRoundIndex

  const targetPosition = winnerRoundIndex * digitHeight

  // 应用滚动
  stripRef.value.style.transition = `transform ${props.duration}s cubic-bezier(0.25, 0.1, 0.25, 1)`
  stripRef.value.style.transform = `translateY(-${targetPosition}px)`

  // 等待动画完成
  setTimeout(() => {
    isAnimating.value = false
    emit('animationComplete')
  }, props.duration * 1000)
}

// 监听开始抽奖
watch([() => props.isRunning, () => props.winnerNumber], async ([running, winnerNum]) => {
  if (running && winnerNum && props.participants.length > 0 && stripRef.value && !isAnimating.value) {
    await nextTick()
    animate()
  }
})

// 监听重置
watch(() => props.winnerNumber, (val) => {
  if (!val && stripRef.value) {
    // 重置位置
    stripRef.value.style.transition = 'none'
    stripRef.value.style.transform = 'translateY(0)'
    targetIndex.value = 0
    isAnimating.value = false
  }
})

// 初始化时检查是否需要执行动画
onMounted(() => {
  if (stripRef.value) {
    stripRef.value.style.transform = 'translateY(0)'
    // 如果已经设置了抽奖状态，执行动画
    if (props.isRunning && props.winnerNumber && props.participants.length > 0) {
      animate()
    }
  }
})
</script>

<style scoped>
.wheel-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 30px 0;
}

.wheel-column {
  width: 120px;
  height: 120px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5), 0 5px 15px rgba(0, 0, 0, 0.3);
}

.wheel-column::before,
.wheel-column::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 30px;
  pointer-events: none;
  z-index: 2;
}

.wheel-column::before {
  top: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
}

.wheel-column::after {
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
}

.wheel-strip {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  will-change: transform;
}

.wheel-digit {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  background: linear-gradient(180deg, #2d2d44 0%, #1a1a2e 50%, #2d2d44 100%);
  border-bottom: 1px solid #3d3d5c;
}

.wheel-digit.highlight {
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
}

.empty-wheel {
  padding: 60px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2rem;
}
</style>
