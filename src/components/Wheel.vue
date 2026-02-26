<template>
  <div class="wheel-container" v-if="participants.length > 0">
    <!-- 当前奖项信息 -->
    <div v-if="currentAwardName" class="current-award">
      <span class="award-badge" :style="{ backgroundColor: awardColor }">{{ currentAwardName }}</span>
      <span class="remaining-count">剩余名额: {{ remainingCount }}</span>
    </div>

    <div class="wheel-column">
      <div class="wheel-strip" ref="stripRef">
        <div
          v-for="(num, index) in numberList"
          :key="index"
          class="wheel-digit"
          :class="{ highlight: index === targetIndex }"
        >
          {{ String(num).padStart(digitPadding, '0') }}
        </div>
      </div>
    </div>

    <!-- 当前奖项已中奖名单 -->
    <div v-if="currentAwardWinners && currentAwardWinners.length > 0" class="current-winners">
      <div class="winners-title">已中奖</div>
      <div class="winners-list">
        <span v-for="winner in currentAwardWinners" :key="winner.participant.id" class="winner-tag">
          {{ winner.participant.number }} - {{ winner.participant.name }}
        </span>
      </div>
    </div>
  </div>
  <div v-else class="empty-wheel">
    请先添加参与者
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import type { Participant, AnimationEffect, AwardWinner } from '../types'

const props = defineProps<{
  participants: Participant[]
  isRunning: boolean
  availableNumbers: number[]
  duration: number
  animationEffect?: AnimationEffect
  // 多奖项模式 props
  currentAwardName?: string
  awardColor?: string
  remainingCount?: number
  currentAwardWinners?: AwardWinner[]
}>()

const emit = defineEmits<{
  (e: 'animationComplete', winnerNumber: number): void
}>()

const stripRef = ref<HTMLElement | null>(null)
const targetIndex = ref<number>(0)
const digitHeight = 120
const isAnimating = ref(false)
const currentWinnerNumber = ref<number | null>(null)

// 计算动态位数（至少3位）
const digitPadding = computed(() => {
  return Math.max(3, String(props.participants.length).length)
})

// 动画效果对应的缓动函数
const getEasingFunction = (effect: AnimationEffect | undefined): string => {
  const easingMap: Record<AnimationEffect, string> = {
    ease: 'ease',
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
  return easingMap[effect || 'easeOut']
}

// 滚动圈数常量
const ROUNDS = 5
const EXTRA_ROUNDS = 3  // 额外轮数，确保滚轮有足够的长度

// 生成滚轮数字列表：重复参与者编号多次以支持动画
const numberList = computed(() => {
  const count = props.participants.length
  if (count === 0) return []
  // 需要足够的轮数来支持动画：ROUNDS 圈 + 额外余量
  const totalRounds = ROUNDS + EXTRA_ROUNDS
  const numbers: number[] = []
  for (let i = 0; i < totalRounds * count; i++) {
    numbers.push((i % count) + 1)
  }
  return numbers
})

// 执行滚动动画
const animate = () => {
  if (!stripRef.value || isAnimating.value) return

  const count = props.participants.length
  if (count === 0 || props.availableNumbers.length === 0) return

  isAnimating.value = true

  // 从可用编号池中随机选择一个作为中奖号码
  const winnerNum = props.availableNumbers[Math.floor(Math.random() * props.availableNumbers.length)]
  currentWinnerNumber.value = winnerNum

  // 计算目标位置：停在倒数第二轮的末尾位置（确保滚动足够且停在正确数字上）
  const totalRounds = ROUNDS + EXTRA_ROUNDS
  // 停止位置 = 倒数第一轮的对应数字索引
  const winnerRoundIndex = (totalRounds - 1) * count + (winnerNum - 1)
  targetIndex.value = winnerRoundIndex

  const targetPosition = winnerRoundIndex * digitHeight

  // 应用滚动
  const easing = getEasingFunction(props.animationEffect)
  stripRef.value.style.transition = `transform ${props.duration}s ${easing}`
  stripRef.value.style.transform = `translateY(-${targetPosition}px)`

  // 等待动画完成
  setTimeout(() => {
    isAnimating.value = false
    emit('animationComplete', winnerNum)
  }, props.duration * 1000)
}

// 监听 isRunning 变化
watch(() => props.isRunning, async (running, oldRunning) => {
  // 从 false 变为 true 时开始动画
  if (running && !oldRunning) {
    if (props.participants.length > 0 && stripRef.value && !isAnimating.value) {
      // 等待下一个 tick，确保 availableNumbers 已更新
      await nextTick()
      if (props.availableNumbers.length > 0) {
        animate()
      }
    }
  }

  // 从 true 变为 false 时重置位置（但只有在没有中奖者时才重置，保持中奖数字显示）
  if (!running && oldRunning && stripRef.value && !currentWinnerNumber.value) {
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
    // 注意：onMounted 时如果 isRunning 为 true，应该由 watch 处理
    // 这里不直接调用 animate()，避免重复执行
  }
})
</script>

<style scoped>
.wheel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 30px 0;
  position: relative;
}

.current-award {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.award-badge {
  padding: 8px 20px;
  border-radius: 20px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.remaining-count {
  color: #a1a1aa;
  font-size: 0.9rem;
}

.current-winners {
  width: 100%;
  max-width: 400px;
  margin-top: 10px;
}

.winners-title {
  text-align: center;
  color: #71717a;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.winners-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.winner-tag {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 0.85rem;
  color: #d4d4d8;
}

/* Subtle scanline effect */
.wheel-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.03) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 10;
  border-radius: 12px;
}

.wheel-column {
  width: 200px;
  height: 120px;
  background: #000000;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow:
    inset 0 0 30px rgba(255, 255, 255, 0.05),
    0 4px 20px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Subtle border */
.wheel-column::after {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 13px;
  z-index: -1;
}

.wheel-column::before,
.wheel-column .top-mask,
.wheel-column .bottom-mask {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 30px;
  pointer-events: none;
  z-index: 5;
}

.wheel-column::before {
  top: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), transparent);
}

.wheel-column .bottom-mask {
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
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
  font-family: 'Microsoft YaHei', 'Courier New', monospace;
  color: #fafafa;
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(255, 255, 255, 0.03) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.wheel-digit.highlight {
  color: #ffffff;
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(255, 255, 255, 0.1) 100%);
  animation: digitPulse 0.5s ease-in-out infinite;
}

@keyframes digitPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.empty-wheel {
  padding: 60px;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .wheel-column {
    width: 100px;
    height: 100px;
  }

  .wheel-digit {
    height: 100px;
    font-size: 3rem;
  }
}
</style>
