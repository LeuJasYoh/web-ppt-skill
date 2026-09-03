// 低功耗静态模式（按 B 切换）：停用一切动画，内容直接可见
import { ref, computed } from 'vue'

const KEY = 'web-ppt-low-power'
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const stored = localStorage.getItem(KEY)

export const lowPower = ref(stored === '1' || (stored === null && reduced))
export const LOW_POWER_EVENT = 'deck-low-power-change'

// 按钮文案：显示的是"按下去会变成的状态"（原模板行为）
export const lowPowerLabel = computed(() => (lowPower.value ? '动态' : '静态'))

export function initLowPower() {
  document.body.classList.toggle('low-power', lowPower.value)
}

export function setLowPower(on, opts = {}) {
  lowPower.value = !!on
  document.body.classList.toggle('low-power', lowPower.value)
  if (opts.persist !== false) localStorage.setItem(KEY, lowPower.value ? '1' : '0')
  if (lowPower.value && document.getAnimations) {
    document.getAnimations().forEach(a => a.cancel())
  }
  dispatchEvent(new CustomEvent(LOW_POWER_EVENT, { detail: { on: lowPower.value } }))
}
