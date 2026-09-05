// 低功耗静态降级：随系统"减少动态效果"(prefers-reduced-motion) 自动启用，无手动开关。
// 作用：停用 WebGL/ASCII/Motion 动画、内容直接全显（useDeckMotion 的 revealStatic）——
// 也是 verify/capture.mjs 确定性截图所依赖的机制（--force-prefers-reduced-motion）。
import { ref } from 'vue'

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

export const lowPower = ref(reduced)

export function initLowPower() {
  document.body.classList.toggle('low-power', lowPower.value)
}
