// 杂志风动效 recipes（移植自 guizang template.html 的 Motion One 引擎）
// 5 种：cascade(默认) / hero(自动) / quote / directional / pipeline(手动推进)
import { animate, stagger } from 'motion'

export const EASE = [.22, 1, .36, 1]
let pipeStep = -1

export function resetAnimsMagazine(slide) {
  slide.querySelectorAll('[data-anim]').forEach(el => {
    el.style.opacity = ''
    el.style.transform = ''
  })
}

export function revealStaticMagazine(slide) {
  resetAnimsMagazine(slide)
  if (document.getAnimations) document.getAnimations().forEach(a => a.cancel())
  slide.querySelectorAll('[data-anim]').forEach(el => {
    el.style.opacity = '1'
    el.style.transform = 'none'
  })
}

export function playMagazine(slide) {
  const all = [...slide.querySelectorAll('[data-anim]')]
  const recipe = slide.dataset.animate || (slide.classList.contains('hero') ? 'hero' : 'cascade')

  if (recipe === 'pipeline') {
    pipeStep = -1
    all.forEach(el => { el.style.opacity = '0.15'; el.style.transform = 'none' })
    return
  }

  resetAnimsMagazine(slide)
  if (!all.length) return

  if (recipe === 'directional') {
    const lefts = all.filter(el => el.dataset.anim === 'left')
    const divs = all.filter(el => el.dataset.anim === 'divider')
    const rights = all.filter(el => el.dataset.anim === 'right')
    const others = all.filter(el => !['left', 'right', 'divider'].includes(el.dataset.anim))
    if (others.length) animate(others, { opacity: [0, 1], y: [12, 0] }, { duration: .6, delay: stagger(.1, { start: .15 }), easing: EASE })
    if (lefts.length) animate(lefts, { opacity: [0, 1], x: [-24, 0] }, { duration: .8, delay: .35, easing: EASE })
    if (divs.length) animate(divs, { opacity: [0, .25] }, { duration: .5, delay: .9 })
    if (rights.length) animate(rights, { opacity: [0, 1], x: [24, 0] }, { duration: .8, delay: 1.0, easing: EASE })
    return
  }

  if (recipe === 'quote') {
    const lines = all.filter(el => el.dataset.anim === 'line')
    const others = all.filter(el => el.dataset.anim !== 'line')
    if (others.length) animate(others, { opacity: [0, 1], y: [8, 0] }, { duration: .6, delay: stagger(.12, { start: .2 }), easing: EASE })
    if (lines.length) animate(lines, { opacity: [.35, 1], y: [10, 0] }, { duration: .8, delay: stagger(.55, { start: .5 }), easing: EASE })
    return
  }

  if (recipe === 'hero') {
    animate(all, { opacity: [0, 1], y: [14, 0] }, { duration: .9, delay: stagger(.16, { start: .2 }), easing: EASE })
    return
  }

  // default: cascade
  animate(all, { opacity: [0, 1], y: [16, 0] }, { duration: .75, delay: stagger(.1, { start: .15 }), easing: EASE })
}

// pipeline 手动推进（返回 true = 消费了本次按键，不翻页）
export function pipeAdvanceMagazine(slide) {
  if (slide.dataset.animate !== 'pipeline') return false
  const steps = [...slide.querySelectorAll('[data-anim="step"]')]
  const arrows = [...slide.querySelectorAll('[data-anim="arrow"]')]
  if (pipeStep >= steps.length - 1) return false
  pipeStep++
  animate(steps[pipeStep], { opacity: [.15, 1], y: [8, 0] }, { duration: .5, easing: EASE })
  if (pipeStep > 0 && arrows[pipeStep - 1]) {
    animate(arrows[pipeStep - 1], { opacity: [.15, .7] }, { duration: .3, delay: .15 })
  }
  return true
}
