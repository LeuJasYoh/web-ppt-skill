// 动效引擎调度器：按风格分发到对应 recipes。
// motion 来自 npm（构建期打包），彻底离线可用——比原模板的 CDN 方案更可靠。
import { animate } from 'motion'
import { STYLE } from '../style'
import { lowPower } from './useLowPower'
import { playMagazine, revealStaticMagazine, resetAnimsMagazine, pipeAdvanceMagazine } from './recipesMagazine'
import { playSwiss, revealStaticSwiss } from './recipesSwiss'

document.body.classList.add('motion-ready')

let lastSlideEl = null

export function playSlide(i, slideEl) {
  if (!slideEl) return
  lastSlideEl = slideEl

  if (lowPower.value) {
    if (STYLE === 'magazine') revealStaticMagazine(slideEl)
    else revealStaticSwiss(slideEl)
    return
  }

  if (STYLE === 'magazine') playMagazine(slideEl)
  else playSwiss(slideEl)
}

// pipeline 手动推进（仅杂志风 pipeline 页消费按键）
export function pipeAdvance() {
  if (lowPower.value || !lastSlideEl) return false
  if (STYLE !== 'magazine') return false
  return pipeAdvanceMagazine(lastSlideEl)
}

export { resetAnimsMagazine }
