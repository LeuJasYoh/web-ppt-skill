// ASCII 点阵呼吸场（瑞士风 IKB 封面/封底专用，移植自 template-swiss.html）
// sin/cos 二维噪声场驱动字符显隐，工业仪表板"涌动呼吸"质感。
// 用法：在 .canvas-card（或 split .half.b-accent）内首位插入 <AsciiField />。
// 单一 RAF 管理所有画布，离屏 slide 降帧渲染。
import { lowPower } from './useLowPower'

const PALETTE = '   ...:::---+++***◦◦••▢▣'
const CELL = 16
const FONT_SIZE = 13

const canvases = new Set()

function setup(c) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const rect = c.getBoundingClientRect()
  if (rect.width < 4 || rect.height < 4) return false
  c.width = Math.round(rect.width * dpr)
  c.height = Math.round(rect.height * dpr)
  c.__dpr = dpr
  c.__w = rect.width
  c.__h = rect.height
  const ctx = c.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const mono = (getComputedStyle(document.documentElement).getPropertyValue('--mono') || 'monospace').trim()
  ctx.font = `500 ${FONT_SIZE}px ${mono}`
  ctx.textBaseline = 'top'
  c.__ctx = ctx
  return true
}

function draw(c, t) {
  if (!c.__ctx) return
  const ctx = c.__ctx, w = c.__w, h = c.__h
  ctx.clearRect(0, 0, w, h)
  const cols = Math.ceil(w / CELL)
  const rows = Math.ceil(h / CELL)
  for (let r = 0; r < rows; r++) {
    for (let cc = 0; cc < cols; cc++) {
      const n = (
        Math.sin(cc * 0.18 + t) +
        Math.sin(r * 0.24 - t * 0.7) +
        Math.sin((cc + r) * 0.12 + t * 0.45) +
        Math.sin(Math.hypot(cc - cols * 0.5, r - rows * 0.5) * 0.16 - t * 0.55)
      ) / 4
      const v = (n + 1) / 2
      if (v < 0.22) continue
      const idx = Math.min(PALETTE.length - 1, Math.floor(v * PALETTE.length))
      const ch = PALETTE[idx]
      if (ch === ' ') continue
      const alpha = 0.08 + (v - 0.22) * 0.55
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`
      ctx.fillText(ch, cc * CELL, r * CELL)
    }
  }
}

let t0 = performance.now()
let frame = 0, asciiRAF = 0, running = false, pending = null

function tick(now) {
  if (!running || lowPower.value) { running = false; asciiRAF = 0; return }
  const t = ((now - t0) / 1000) * 0.55
  frame++
  canvases.forEach(c => {
    // 离屏 slide 降帧：每 4 帧渲染一次
    const slide = c.closest('.slide')
    const rect = slide ? slide.getBoundingClientRect() : null
    const onscreen = rect && rect.right > 0 && rect.left < window.innerWidth
    if (!onscreen && (frame & 3) !== 0) return
    draw(c, t)
  })
  asciiRAF = requestAnimationFrame(tick)
}

function start() {
  if (running || lowPower.value) return
  canvases.forEach(setup)
  t0 = performance.now()
  frame = 0
  running = true
  asciiRAF = requestAnimationFrame(tick)
}

function stop() {
  running = false
  if (asciiRAF) cancelAnimationFrame(asciiRAF)
  if (pending) cancelAnimationFrame(pending)
  asciiRAF = 0
  pending = null
  canvases.forEach(c => { if (c.__ctx) c.__ctx.clearRect(0, 0, c.__w || 0, c.__h || 0) })
}

addEventListener('resize', () => {
  if (lowPower.value) return
  if (pending) cancelAnimationFrame(pending)
  pending = requestAnimationFrame(() => canvases.forEach(setup))
}, { passive: true })

export function registerAscii(c) {
  canvases.add(c)
  setup(c)
  start()
}

export function unregisterAscii(c) {
  canvases.delete(c)
  if (!canvases.size) stop()
}
