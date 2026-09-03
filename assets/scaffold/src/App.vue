<script setup>
// Deck 主控：横向条带翻页（所有页常驻 DOM，与原模板机制一致）。
// 键盘 ← → ↑ ↓ / Space / PgUp PgDn / Home End / ESC 总览 / B 低功耗
// 滚轮、触屏滑动、底部圆点、?slide=N 直达（1-based）
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { createIcons } from 'lucide'
import * as lucideIcons from 'lucide'   // ESM 需显式传入图标集（全量引入，离线可用）
import slides from './slides'
import { styleConfig as cfg } from './style'
import { lowPower, lowPowerLabel, initLowPower, setLowPower } from './composables/useLowPower'
import { playSlide, pipeAdvance } from './composables/useDeckMotion'
import DeckBackground from './components/DeckBackground.vue'

const idx = ref(0)
const total = slides.length
const overviewOn = ref(false)
const deckEl = ref(null)
const navEl = ref(null)
const ovEl = ref(null)
let lock = false

function currentSlideEl() {
  return deckEl.value?.children[idx.value]
}

function go(n, opts = {}) {
  if (lock && !opts.force) return
  idx.value = Math.max(0, Math.min(total - 1, n))
  window.__currentSlideIndex = idx.value
  deckEl.value.style.transform = `translateX(${-idx.value * 100}vw)`
  navEl.value.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx.value))
  cfg.applyTheme(currentSlideEl())
  // 翻页过渡中段触发动效（与原模板一致）
  setTimeout(() => playSlide(idx.value, currentSlideEl()), 450)
  if (!opts.force) { lock = true; setTimeout(() => (lock = false), 700) }
}

function next() { if (pipeAdvance()) return; go(idx.value + 1) }
function prev() { go(idx.value - 1) }

/* =============== ESC 总览（克隆 DOM 缩略图，跳过动效） =============== */
function buildOverview() {
  const ov = ovEl.value
  ov.innerHTML = ''
  const grid = document.createElement('div')
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:2vh 1.6vw;max-width:90vw;margin:0 auto'
  ;[...deckEl.value.children].forEach((s, i) => {
    const dark = cfg.slideIsDark(s)
    const activeBorder = cfg.name === 'magazine'
      ? 'rgba(var(--paper-rgb),.8)'
      : 'rgba(var(--ink-rgb),.8)'
    const idleBorder = cfg.name === 'magazine'
      ? 'rgba(var(--paper-rgb),.15)'
      : 'rgba(var(--ink-rgb),.15)'
    const hoverBorder = cfg.name === 'magazine'
      ? 'rgba(var(--paper-rgb),.6)'
      : 'rgba(var(--ink-rgb),.6)'
    const card = document.createElement('div')
    card.style.cssText = `cursor:pointer;border-radius:6px;overflow:hidden;border:2px solid ${i === idx.value ? activeBorder : idleBorder};transition:border-color .2s`
    card.onmouseenter = () => (card.style.borderColor = hoverBorder)
    card.onmouseleave = () => (card.style.borderColor = i === idx.value ? activeBorder : idleBorder)
    const wrap = document.createElement('div')
    wrap.style.cssText = `width:100%;aspect-ratio:16/9;overflow:hidden;position:relative;pointer-events:none;background:${dark ? 'var(--ink)' : 'var(--paper)'}`
    const clone = s.cloneNode(true)
    clone.style.cssText = 'width:100vw;height:100vh;transform:scale(' + (1 / 4.5) + ');transform-origin:top left;position:absolute;top:0;left:0;pointer-events:none'
    wrap.appendChild(clone)
    const label = document.createElement('div')
    label.style.cssText = `padding:6px 10px;font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${cfg.overviewLabelColor};opacity:.7`
    label.textContent = `${i + 1} / ${total}`
    card.appendChild(wrap)
    card.appendChild(label)
    card.onclick = () => { toggleOverview(); go(i) }
    grid.appendChild(card)
  })
  ov.appendChild(grid)
}

function toggleOverview() {
  overviewOn.value = !overviewOn.value
  if (overviewOn.value) { buildOverview(); ovEl.value.style.display = 'block' }
  else { ovEl.value.style.display = 'none' }
}

function toggleLowPower() {
  setLowPower(!lowPower.value)
  // 切回动态模式时重播当前页；切静态时 playSlide 内部会 revealStatic
  playSlide(idx.value, currentSlideEl())
}

/* =============== 输入：键盘 / 滚轮 / 触屏 =============== */
function onKey(e) {
  if (e.key === 'Escape') { e.preventDefault(); toggleOverview(); return }
  if (e.key && e.key.toLowerCase() === 'b' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    e.preventDefault(); toggleLowPower(); return
  }
  if (overviewOn.value) return
  if (['ArrowRight', 'PageDown', ' ', 'ArrowDown'].includes(e.key)) { e.preventDefault(); next(); return }
  if (['ArrowLeft', 'PageUp', 'ArrowUp'].includes(e.key)) { e.preventDefault(); prev() }
  if (e.key === 'Home') go(0, { force: true })
  if (e.key === 'End') go(total - 1, { force: true })
}

let wheelTO = null, wheelAcc = 0
function onWheel(e) {
  wheelAcc += e.deltaY + e.deltaX
  if (Math.abs(wheelAcc) > 50) {
    if (wheelAcc > 0 && pipeAdvance()) { wheelAcc = 0 }
    else { go(idx.value + (wheelAcc > 0 ? 1 : -1)); wheelAcc = 0 }
  }
  clearTimeout(wheelTO)
  wheelTO = setTimeout(() => (wheelAcc = 0), 150)
}

let tx = 0, ty = 0
function onTouchStart(e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY }
function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - tx
  const dy = e.changedTouches[0].clientY - ty
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0 && pipeAdvance()) return
    go(idx.value + (dx < 0 ? 1 : -1))
  }
}

onMounted(async () => {
  initLowPower()
  if (cfg.canvasMode) document.body.classList.add('canvas-mode')
  // 关键：矫正 deck 宽度为 total * 100vw，否则翻页会错位
  deckEl.value.style.width = total * 100 + 'vw'
  ovEl.value.style.cssText =
    `position:fixed;inset:0;z-index:100;background:${cfg.overviewBg};backdrop-filter:blur(12px);display:none;overflow-y:auto;padding:4vh 4vw`

  // ?slide=N 直达（1-based）
  const initialParam = Number(new URLSearchParams(location.search).get('slide')) - 1
  go(Number.isFinite(initialParam) && initialParam >= 0 ? initialParam : 0)

  await nextTick()
  createIcons({ icons: lucideIcons })   // Lucide 图标一次性物化（所有页常驻 DOM）
  playSlide(idx.value, currentSlideEl())  // 首屏动效立即播（go 里的 450ms 兜底仍在）

  addEventListener('keydown', onKey)
  addEventListener('wheel', onWheel, { passive: true })
  addEventListener('touchstart', onTouchStart, { passive: true })
  addEventListener('touchend', onTouchEnd, { passive: true })
})

onUnmounted(() => {
  removeEventListener('keydown', onKey)
  removeEventListener('wheel', onWheel)
  removeEventListener('touchstart', onTouchStart)
  removeEventListener('touchend', onTouchEnd)
})
</script>

<template>
  <DeckBackground />

  <div id="deck" ref="deckEl">
    <component v-for="(s, i) in slides" :is="s" :key="i" />
  </div>

  <div id="nav" ref="navEl">
    <button
      v-for="i in total" :key="i" class="dot"
      :aria-label="`Page ${i}`" @click="go(i - 1)"
    ></button>
  </div>

  <div id="hint" role="toolbar" aria-label="快捷控制">
    <span>← → 翻页</span><span class="ppt-sep">·</span>
    <button type="button" @click="toggleLowPower"><span class="ppt-key">B</span>{{ lowPowerLabel }}</button><span class="ppt-sep">·</span>
    <button type="button" @click="toggleOverview"><span class="ppt-key">ESC</span>总览</button>
  </div>

  <div id="overview" ref="ovEl"></div>
</template>
