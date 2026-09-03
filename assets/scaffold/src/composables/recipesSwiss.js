// 瑞士风动效 recipes（移植自 guizang template-swiss.html 的 Motion One 引擎）
// IBM Carbon Motion · 每个 recipe 服务一种表达，动效绑在内容语义上。
// 在 <section data-animate="recipe名"> 上选择；recipe 查询页面内结构类做定向动画。
import { animate } from 'motion'

/* 缓动从 :root 的 Carbon motion token 读取，CSS 是唯一事实源（解析失败才用兜底值） */
const cssEase = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name)
  const m = v && v.match(/cubic-bezier\(([^)]+)\)/)
  const nums = m ? m[1].split(',').map(Number) : []
  return (nums.length === 4 && nums.every(Number.isFinite)) ? nums : fallback
}
const EASE_PROD = () => cssEase('--ease-prod', [.2, 0, .38, .9])
const EASE_ENTRY_EXP = () => cssEase('--ease-entry-exp', [0, 0, .3, 1])

/* ---------- 通用工具 ---------- */
const fade = (el, opts = {}) => animate(el,
  { opacity: [0, 1], y: [opts.y ?? 12, 0] },
  { duration: opts.duration ?? .6, delay: opts.delay ?? 0, easing: opts.easing ?? EASE_ENTRY_EXP() })

export function resetAnimsSwiss(slide) {
  slide.querySelectorAll('[data-anim]').forEach(el => {
    el.style.opacity = ''
    el.style.transform = ''
  })
}

export function revealStaticSwiss(slide) {
  resetAnimsSwiss(slide)
  if (document.getAnimations) document.getAnimations().forEach(a => a.cancel())
  slide.querySelectorAll('[data-anim],.row-fill,.tl-node,.stack-block,.bar-tower,.sub-card,.col,.vrule,.kpi-cell,.card-fill,.card-accent,.card-ink')
    .forEach(el => {
      el.style.opacity = '1'
      el.style.transform = 'none'
    })
}

/* ---------- recipe: hero · 封面索引：大编号点名式亮起 → 索引行落定 ---------- */
function rHero(slide) {
  const numRows = [...slide.querySelectorAll('.cover-row')]
  const chrome = slide.querySelector('.chrome-min')
  if (chrome) animate(chrome, { opacity: [0, 1] }, { duration: .24, easing: EASE_PROD() })
  numRows.forEach((row, i) => {
    animate(row, { opacity: [0, 1], x: [-12, 0] },
      { duration: .5, delay: .15 + i * .18, easing: EASE_ENTRY_EXP() })
  })
  const idx = slide.querySelector('[data-anim="line"]')
  if (idx) fade(idx, { delay: .15 + numRows.length * .18 + .1, duration: .5, y: 6 })
}

/* ---------- recipe: progression · 时间线节点递进生长 + KPI 收尾 ---------- */
function rProgression(slide) {
  const head = slide.querySelector('[data-anim="line"]')
  if (head) fade(head, { duration: .6, y: 10 })

  const nodes = [...slide.querySelectorAll('.tl-node')]
  nodes.forEach((node, i) => {
    const base = .35 + i * .32
    animate(node, { opacity: [0, 1], y: [14, 0] }, { duration: .55, delay: base, easing: EASE_ENTRY_EXP() })
    const multi = node.querySelector('.multi')
    if (multi) animate(multi, { scale: [.92, 1], opacity: [0, 1] }, { duration: .5, delay: base + .12, easing: EASE_ENTRY_EXP() })
  })

  const kpis = [...slide.querySelectorAll('.kpi-cell')]
  kpis.forEach((cell, i) => {
    animate(cell, { opacity: [0, 1], y: [8, 0] }, { duration: .4, delay: 1.4 + i * .07, easing: EASE_PROD() })
  })
}

/* ---------- recipe: statement · 大宣言：左右半屏错峰 / 三行盖章 ---------- */
function rStatement(slide) {
  const halves = [...slide.querySelectorAll('.half')]
  if (halves.length === 2) {
    animate(halves[0], { opacity: [0, 1], y: [18, 0] }, { duration: .7, delay: 0, easing: EASE_ENTRY_EXP() })
    animate(halves[1], { opacity: [0, 1], y: [18, 0] }, { duration: .7, delay: .6, easing: EASE_ENTRY_EXP() })
  } else {
    const head = slide.querySelector('[data-anim="line"]')
    if (head) fade(head, { duration: .5, y: 6 })
    const blocks = [...slide.querySelectorAll('[data-anim]')].filter(el => el !== head)
    blocks.forEach((el, i) => {
      animate(el, { opacity: [0, 1], y: [20, 0] }, { duration: .55, delay: .25 + i * .18, easing: EASE_ENTRY_EXP() })
    })
  }
}

/* ---------- recipe: grid-reveal · 卡片按序号依次揭示 ---------- */
function rGridReveal(slide) {
  const head = slide.querySelector('[data-anim="line"]')
  if (head) fade(head, { duration: .6, y: 10 })
  const cards = [...slide.querySelectorAll('.sub-card')]
  cards.forEach((card, i) => {
    animate(card, { opacity: [0, 1], y: [20, 0], scale: [.96, 1] },
      { duration: .5, delay: .3 + i * .09, easing: EASE_ENTRY_EXP() })
  })
}

/* ---------- recipe: stack-build · 三层架构：中层先入，上下包夹 ---------- */
function rStackBuild(slide) {
  const head = slide.querySelector('[data-anim="line"]')
  if (head) fade(head, { duration: .6, y: 10 })

  const blocks = [...slide.querySelectorAll('.stack-block')]
  if (blocks[1]) animate(blocks[1], { opacity: [0, 1], scaleY: [.85, 1] }, { duration: .55, delay: .3, easing: EASE_ENTRY_EXP() })
  if (blocks[0]) animate(blocks[0], { opacity: [0, 1], y: [-22, 0] }, { duration: .6, delay: .6, easing: EASE_ENTRY_EXP() })
  if (blocks[2]) animate(blocks[2], { opacity: [0, 1], y: [22, 0] }, { duration: .6, delay: .6, easing: EASE_ENTRY_EXP() })

  const foot = slide.querySelector('.t-meta')
  if (foot) animate(foot, { opacity: [0, 1] }, { duration: .3, delay: 1.3, easing: EASE_PROD() })
}

/* ---------- recipe: measure-up · KPI 塔 scaleY 生长 + cap 弹入 ---------- */
function rMeasureUp(slide) {
  const head = slide.querySelector('[data-anim="line"]')
  if (head) fade(head, { duration: .6, y: 10 })

  const towers = [...slide.querySelectorAll('.bar-tower')]
  towers.forEach((tower, i) => {
    const block = tower.querySelector('.body-block')
    if (block) {
      block.style.transformOrigin = 'bottom center'
      animate(block, { opacity: [0, 1], scaleY: [.05, 1] }, { duration: .7, delay: .35 + i * .12, easing: EASE_ENTRY_EXP() })
    }
    const cap = tower.querySelector('.cap')
    if (cap) animate(cap, { opacity: [0, 1], y: [-8, 0] }, { duration: .4, delay: .85 + i * .12, easing: EASE_PROD() })
  })
}

/* ---------- recipe: bar-grow · 横向柱图 width 生长 ---------- */
function rBarGrow(slide) {
  const head = slide.querySelector('[data-anim="line"]')
  if (head) fade(head, { duration: .6, y: 10 })

  const midRow = slide.querySelector('[data-anim="up"]')
  if (midRow) {
    const midLabel = midRow.querySelector('.t-cat')
    const midLine = midRow.querySelector('.midline')
    if (midLabel) animate(midLabel, { opacity: [0, 1], x: [-8, 0] }, { duration: .4, delay: .4, easing: EASE_PROD() })
    if (midLine) {
      midLine.style.transformOrigin = 'center'
      animate(midLine, { opacity: [0, 1], scaleX: [0, 1] }, { duration: .55, delay: .5, easing: EASE_ENTRY_EXP() })
    }
  }

  const fills = [...slide.querySelectorAll('.row-fill')]
  const labels = [...slide.querySelectorAll('.row-lbl')]
  const values = [...slide.querySelectorAll('.row-val')]
  fills.forEach((fill, i) => {
    const target = fill.style.width
    fill.style.width = '0%'
    if (labels[i]) animate(labels[i], { opacity: [0, 1], x: [-12, 0] }, { duration: .4, delay: .85 + i * .14, easing: EASE_PROD() })
    animate(fill, { width: ['0%', target] }, { duration: .65, delay: .95 + i * .14, easing: EASE_ENTRY_EXP() })
    if (values[i]) animate(values[i], { opacity: [0, 1] }, { duration: .3, delay: 1.5 + i * .14, easing: EASE_PROD() })
  })
}

/* ---------- recipe: duo-mirror · 对仗对比：左入 → vrule scaleY → 右入 ---------- */
function rDuoMirror(slide) {
  const head = slide.querySelector('[data-anim="line"]')
  if (head) fade(head, { duration: .6, y: 10 })

  const cols = [...slide.querySelectorAll('.duo-compare .col')]
  const vrule = slide.querySelector('.duo-compare .vrule')
  if (cols[0]) animate(cols[0], { opacity: [0, 1], x: [-24, 0] }, { duration: .65, delay: .4, easing: EASE_ENTRY_EXP() })
  if (vrule) {
    vrule.style.transformOrigin = 'center'
    animate(vrule, { opacity: [0, 1], scaleY: [0, 1] }, { duration: .55, delay: .55, easing: EASE_ENTRY_EXP() })
  }
  if (cols[1]) animate(cols[1], { opacity: [0, 1], x: [24, 0] }, { duration: .65, delay: .7, easing: EASE_ENTRY_EXP() })

  const foot = slide.querySelector('.t-meta')
  if (foot) animate(foot, { opacity: [0, 1] }, { duration: .3, delay: 1.3, easing: EASE_PROD() })
}

/* ---------- recipe: split-statement · 收尾：黑半屏金句 + 白半屏清单 ---------- */
function rSplitStatement(slide) {
  const halves = [...slide.querySelectorAll('.half')]
  if (halves[0]) {
    animate(halves[0], { opacity: [0, 1] }, { duration: .4, easing: EASE_PROD() })
    halves[0].querySelectorAll('.kpi-thin').forEach((k, i) => {
      animate(k, { opacity: [0, 1], y: [24, 0] }, { duration: .7, delay: .25 + i * .55, easing: EASE_ENTRY_EXP() })
    })
  }
  if (halves[1]) {
    animate(halves[1], { opacity: [0, 1] }, { duration: .4, delay: .3, easing: EASE_PROD() })
    halves[1].querySelectorAll('.takeaway-list li').forEach((li, i) => {
      animate(li, { opacity: [0, 1], x: [20, 0] }, { duration: .45, delay: 1.0 + i * .12, easing: EASE_ENTRY_EXP() })
    })
  }
}

/* ---------- recipe: timeline-walk · 横向演化：dot 依次 scale 入 ---------- */
function rTimelineWalk(slide) {
  const head = slide.querySelector('[data-anim="line"]')
  if (head) fade(head, { duration: .55, y: 10 })

  const tl = slide.querySelector('.timeline-h')
  if (tl) animate(tl, { opacity: [0, 1] }, { duration: .4, delay: .35, easing: EASE_PROD() })

  const nodes = [...slide.querySelectorAll('.timeline-h .th-node')]
  nodes.forEach((node, i) => {
    const base = .55 + i * .18
    const dot = node.querySelector('.dot')
    const label = node.querySelector('.label')
    if (dot) {
      dot.style.transformOrigin = 'center'
      animate(dot, { opacity: [0, 1], scale: [.2, 1] }, { duration: .45, delay: base, easing: EASE_ENTRY_EXP() })
    }
    if (label) {
      const fromY = node.classList.contains('up') ? 8 : -8
      // 保留 CSS 的水平居中 translateX(-50%)，避免动效覆盖后 label 与 dot 错位
      animate(label, { opacity: [0, 1], transform: [`translate(-50%, ${fromY}px)`, 'translate(-50%, 0px)'] },
        { duration: .5, delay: base + .12, easing: EASE_ENTRY_EXP() })
    }
  })

  const foot = slide.querySelector('.t-meta')
  if (foot) animate(foot, { opacity: [0, 1] }, { duration: .3, delay: 1.7, easing: EASE_PROD() })
}

/* ---------- recipe: manifesto · 副标先入 → 大字落 → ink 通栏条推上 ---------- */
function rManifesto(slide) {
  const head = slide.querySelector('[data-anim="line"]')
  if (head) {
    const cat = head.querySelector('.t-cat')
    const title = head.querySelector('div:nth-child(2)')
    if (cat) animate(cat, { opacity: [0, 1], x: [-10, 0] }, { duration: .4, delay: .1, easing: EASE_PROD() })
    if (title) animate(title, { opacity: [0, 1], y: [26, 0] }, { duration: .85, delay: .3, easing: EASE_ENTRY_EXP() })
  }
  const foot = [...slide.querySelectorAll('[data-anim="up"]')]
  foot.forEach((el, i) => {
    animate(el, { opacity: [0, 1], y: [40, 0] }, { duration: .75, delay: .85 + i * .12, easing: EASE_ENTRY_EXP() })
  })
}

/* ---------- recipe: three-forces · 左 ink hero + 右三卡滑入 ---------- */
function rThreeForces(slide) {
  const head = slide.querySelector('[data-anim="line"]')
  if (head) fade(head, { duration: .5, y: 8 })

  const grid = slide.querySelector('[data-anim="up"]')
  if (grid) animate(grid, { opacity: [0, 1] }, { duration: .3, delay: .3, easing: EASE_PROD() })

  const heroBlock = grid?.querySelector(':scope > div:first-child')
  if (heroBlock) animate(heroBlock, { opacity: [0, 1], x: [-26, 0] }, { duration: .6, delay: .4, easing: EASE_ENTRY_EXP() })

  const cards = grid ? [...grid.querySelectorAll(':scope > div:nth-child(2) > .card-fill')] : []
  cards.forEach((card, i) => {
    const base = .6 + i * .18
    animate(card, { opacity: [0, 1], x: [28, 0] }, { duration: .6, delay: base, easing: EASE_ENTRY_EXP() })
    const num = card.querySelector(':scope > div:first-child')
    if (num) animate(num, { opacity: [0, 1], scale: [.7, 1] }, { duration: .5, delay: base + .15, easing: EASE_ENTRY_EXP() })
  })
}

/* ---------- recipe: loop-form · 左台阶步进 + 右环图节点时钟序入 ---------- */
function rLoopForm(slide) {
  const head = slide.querySelector('[data-anim="line"]')
  if (head) fade(head, { duration: .55, y: 10 })

  const grid = slide.querySelector('[data-anim="up"]')
  if (grid) animate(grid, { opacity: [0, 1] }, { duration: .3, delay: .35, easing: EASE_PROD() })

  const steps = grid ? [...grid.querySelectorAll(':scope > div:first-child > div')] : []
  steps.forEach((step, i) => {
    animate(step, { opacity: [0, 1], x: [-18, 0] }, { duration: .5, delay: .5 + i * .14, easing: EASE_ENTRY_EXP() })
  })

  const svg = grid?.querySelector('svg')
  if (svg) {
    const ring = svg.querySelector('circle:first-of-type')
    if (ring) animate(ring, { opacity: [0, .25] }, { duration: .5, delay: .6, easing: EASE_PROD() })

    const nodeCircles = [...svg.querySelectorAll('circle')].slice(1)
    nodeCircles.forEach((c, i) => {
      c.style.transformOrigin = `${c.getAttribute('cx')}px ${c.getAttribute('cy')}px`
      animate(c, { opacity: [0, 1], scale: [.4, 1] }, { duration: .45, delay: .7 + i * .16, easing: EASE_ENTRY_EXP() })
    })

    const arrows = [...svg.querySelectorAll('path[marker-end]')]
    arrows.forEach((p, i) => {
      animate(p, { opacity: [0, 1] }, { duration: .4, delay: .85 + i * .16, easing: EASE_PROD() })
    })

    const center = [...svg.querySelectorAll('text')].slice(-2)
    center.forEach((t, i) => {
      animate(t, { opacity: [0, 1], scale: [.7, 1] }, { duration: .5, delay: 1.55 + i * .1, easing: EASE_ENTRY_EXP() })
    })
  }
}

/* ---------- recipe: matrix-fill · 矩阵按对角线波扫入 + 底部巨数 ---------- */
function rMatrixFill(slide) {
  const head = slide.querySelector('[data-anim="line"]')
  if (head) fade(head, { duration: .55, y: 10 })

  const matrix = slide.querySelector('[data-anim="up"]')
  if (!matrix) return
  animate(matrix, { opacity: [0, 1] }, { duration: .3, delay: .35, easing: EASE_PROD() })

  const cards = [...matrix.children]
  const cols = 6
  cards.forEach((card, i) => {
    const row = Math.floor(i / cols), col = i % cols
    const wave = (row + col) * .055
    animate(card, { opacity: [0, 1], y: [14, 0], scale: [.92, 1] },
      { duration: .42, delay: .5 + wave, easing: EASE_ENTRY_EXP() })
  })

  const foot = [...slide.querySelectorAll('[data-anim="up"]')][1]
  if (foot) {
    animate(foot, { opacity: [0, 1], y: [18, 0] }, { duration: .7, delay: 1.4, easing: EASE_ENTRY_EXP() })
    const bigNum = foot.querySelector('div:nth-child(1) > div:nth-child(2)')
    if (bigNum) animate(bigNum, { opacity: [0, 1], scale: [.94, 1] }, { duration: .7, delay: 1.55, easing: EASE_ENTRY_EXP() })
  }
}

/* ---------- recipe: field-notes · 散点乱序入 + 微旋转复位 ---------- */
function rFieldNotes(slide) {
  const head = slide.querySelector('[data-anim="line"]')
  if (head) fade(head, { duration: .55, y: 10 })

  const grid = slide.querySelector('[data-anim="up"]')
  if (!grid) return
  animate(grid, { opacity: [0, 1] }, { duration: .3, delay: .35, easing: EASE_PROD() })

  const order = [0, 3, 1, 4, 2, 5]
  const cards = [...grid.children]
  order.forEach((idx, i) => {
    const card = cards[idx]
    if (!card) return
    animate(card, { opacity: [0, 1], y: [18, 0], rotate: [(idx % 2 ? -.6 : .6), 0] },
      { duration: .55, delay: .5 + i * .11, easing: EASE_ENTRY_EXP() })
  })
}

/* ---------- recipe: system-diagram · 三圆系统图同心 scale 入 ---------- */
function rSystemDiagram(slide) {
  const head = slide.querySelector('[data-anim="line"]')
  if (head) fade(head, { duration: .55, y: 10 })

  const stage = slide.querySelector('[data-anim="up"]')
  if (!stage) return
  animate(stage, { opacity: [0, 1] }, { duration: .3, delay: .35, easing: EASE_PROD() })

  const svgs = [...stage.querySelectorAll('svg')]
  svgs.forEach((svg, i) => {
    const base = .55 + i * .22
    const circles = [...svg.querySelectorAll('circle')]
    if (circles.length > 1) {
      circles.forEach((c, j) => {
        c.style.transformOrigin = `${c.getAttribute('cx')}px ${c.getAttribute('cy')}px`
        animate(c, { opacity: [0, 1], scale: [.4, 1] }, { duration: .5, delay: base + j * .13, easing: EASE_ENTRY_EXP() })
      })
    } else if (circles[0]) {
      circles[0].style.transformOrigin = `${circles[0].getAttribute('cx')}px ${circles[0].getAttribute('cy')}px`
      animate(circles[0], { opacity: [0, 1], scale: [.4, 1] }, { duration: .5, delay: base, easing: EASE_ENTRY_EXP() })
    }
    const labels = [...svg.querySelectorAll('text')]
    labels.forEach((t, j) => {
      animate(t, { opacity: [0, 1] }, { duration: .4, delay: base + .25 + j * .06, easing: EASE_PROD() })
    })
  })

  const cols = [...stage.querySelectorAll(':scope > div:last-child > div')]
  cols.forEach((col, i) => {
    animate(col, { opacity: [0, 1], y: [12, 0] }, { duration: .45, delay: 1.3 + i * .1, easing: EASE_ENTRY_EXP() })
  })
}

/* ---------- recipe: why-now · 三列文本 + 底部巨数错峰落定 ---------- */
function rWhyNow(slide) {
  const head = slide.querySelector('[data-anim="line"]')
  if (head) fade(head, { duration: .55, y: 10 })

  const grid = slide.querySelector('[data-anim="up"]')
  if (!grid) return
  animate(grid, { opacity: [0, 1] }, { duration: .3, delay: .35, easing: EASE_PROD() })

  const cols = [...grid.children]
  cols.forEach((col, i) => {
    const base = .5 + i * .16
    const body = col.querySelector(':scope > div:not(:last-child)')
    const big = col.querySelector(':scope > div:last-child')
    if (body) animate(body, { opacity: [0, 1], y: [14, 0] }, { duration: .55, delay: base, easing: EASE_ENTRY_EXP() })
    if (big) animate(big, { opacity: [0, 1], scale: [.7, 1] }, { duration: .7, delay: base + .35, easing: EASE_ENTRY_EXP() })
  })
}

/* ---------- recipe: four-cards · 顶线画出 → 标题 → 四卡依次入 ---------- */
function rFourCards(slide) {
  const topRule = slide.querySelector('[data-anim="line"] > div:first-child')
  if (topRule) {
    topRule.style.transformOrigin = 'left center'
    animate(topRule, { opacity: [0, 1], scaleX: [0, 1] }, { duration: .5, delay: .1, easing: EASE_ENTRY_EXP() })
  }

  const head = slide.querySelector('[data-anim="line"]')
  if (head) {
    const title = head.querySelector(':scope > div:nth-child(2)')
    if (title) animate(title, { opacity: [0, 1], y: [14, 0] }, { duration: .55, delay: .4, easing: EASE_ENTRY_EXP() })
  }

  const grid = slide.querySelector('[data-anim="up"]')
  if (!grid) return
  animate(grid, { opacity: [0, 1] }, { duration: .3, delay: .55, easing: EASE_PROD() })

  const cards = [...grid.children]
  cards.forEach((card, i) => {
    animate(card, { opacity: [0, 1], y: [18, 0] }, { duration: .55, delay: .7 + i * .13, easing: EASE_ENTRY_EXP() })
  })
}

/* ---------- recipe: stacked-ledger · 账单逐行点亮 ---------- */
function rStackedLedger(slide) {
  const ledger = slide.querySelector('[data-anim="ledger"]')
  if (!ledger) return
  animate(ledger, { opacity: [0, 1] }, { duration: .3, delay: .1, easing: EASE_PROD() })

  const rows = [...ledger.querySelectorAll('.ledger-row')]
  rows.forEach((row, i) => {
    const base = .25 + i * .18
    const num = row.querySelector('.ledger-num')
    const label = row.querySelector('.ledger-label')
    const icon = row.querySelector('.ledger-icon')
    if (num) animate(num, { opacity: [0, 1], y: [20, 0] }, { duration: .7, delay: base, easing: EASE_ENTRY_EXP() })
    if (label) animate(label, { opacity: [0, 1], x: [-12, 0] }, { duration: .55, delay: base + .12, easing: EASE_ENTRY_EXP() })
    if (icon) animate(icon, { opacity: [0, 1], scale: [.6, 1] }, { duration: .55, delay: base + .22, easing: EASE_ENTRY_EXP() })
  })
}

/* ---------- recipe: tech-spec · 规格表：顶线画出/分行/竖线弹起 ---------- */
function rTechSpec(slide) {
  const head = slide.querySelector('[data-anim="line"]')
  if (head) fade(head, { duration: .5, y: 8 })

  const main = slide.querySelector('[data-anim="up"]')
  if (main) {
    animate(main, { opacity: [0, 1] }, { duration: .3, delay: .25, easing: EASE_PROD() })

    const titleLines = main.querySelector(':scope > div:first-child > div:first-child')
    if (titleLines) animate(titleLines, { opacity: [0, 1], y: [18, 0] }, { duration: .7, delay: .35, easing: EASE_ENTRY_EXP() })
    const titleNote = main.querySelector(':scope > div:first-child > div:nth-child(2)')
    if (titleNote) animate(titleNote, { opacity: [0, 1], y: [10, 0] }, { duration: .5, delay: .95, easing: EASE_ENTRY_EXP() })

    const kpis = [...main.querySelectorAll(':scope > div:not([data-anim]):not(:first-child)')]
    kpis.forEach((kpi, i) => {
      const base = .55 + i * .18
      const topRule = kpi.querySelector(':scope > div:first-child')
      if (topRule) {
        topRule.style.transformOrigin = 'left center'
        animate(topRule, { scaleX: [0, 1], opacity: [0, 1] }, { duration: .5, delay: base, easing: EASE_ENTRY_EXP() })
      }
      const num = kpi.querySelector('.kpi-num')
      if (num) animate(num, { opacity: [0, 1], y: [14, 0] }, { duration: .6, delay: base + .15, easing: EASE_ENTRY_EXP() })
      const handled = new Set([topRule, num])
      ;[...kpi.children].filter(el => !handled.has(el)).forEach((el, j) => {
        animate(el, { opacity: [0, 1] }, { duration: .4, delay: base + .25 + j * .05, easing: EASE_PROD() })
      })
    })
  }

  const hero = slide.querySelector('[data-anim="hero"]')
  if (hero) {
    animate(hero, { opacity: [0, 1] }, { duration: .3, delay: 1.3, easing: EASE_PROD() })
    const bottomHero = hero.querySelector('.bottom-hero')
    if (bottomHero) animate(bottomHero, { opacity: [0, 1], y: [24, 0], scale: [.92, 1] }, { duration: .7, delay: 1.4, easing: EASE_ENTRY_EXP() })
    const bars = slide.querySelectorAll('[data-anim="bars"] .vbar')
    bars.forEach((bar, i) => {
      bar.style.transformOrigin = 'bottom'
      animate(bar, { scaleY: [0, 1], opacity: [0, 1] }, { duration: .5, delay: 2.0 + i * .04, easing: EASE_ENTRY_EXP() })
    })
  }
}

/* ---------- recipe: image-hero · 图缓推 + 标题块从左滑入 + KPI 顶线画出 ---------- */
function rImageHero(slide) {
  const img = slide.querySelector('[data-anim="img"] img')
  if (img) {
    animate(img, { opacity: [0, 1], scale: [1.06, 1] }, { duration: 1.1, delay: .05, easing: EASE_ENTRY_EXP() })
  }

  const titleBlock = slide.querySelector('[data-anim="title-block"]')
  if (titleBlock) {
    titleBlock.style.transformOrigin = 'left center'
    animate(titleBlock, { opacity: [0, 1], scaleX: [0, 1] }, { duration: .7, delay: .45, easing: EASE_ENTRY_EXP() })
    const titleText = titleBlock.querySelector('div')
    if (titleText) animate(titleText, { opacity: [0, 1] }, { duration: .4, delay: .85, easing: EASE_PROD() })
  }

  const kpiWrap = slide.querySelector('[data-anim="kpi"]')
  if (kpiWrap) {
    animate(kpiWrap, { opacity: [0, 1] }, { duration: .3, delay: .7, easing: EASE_PROD() })

    const para = kpiWrap.querySelector(':scope > div:first-child')
    if (para) animate(para, { opacity: [0, 1], y: [14, 0] }, { duration: .6, delay: .85, easing: EASE_ENTRY_EXP() })

    const cols = [...kpiWrap.querySelectorAll(':scope > div:nth-child(2) > div')]
    cols.forEach((col, i) => {
      const base = 1.1 + i * .18
      const topRule = col.querySelector(':scope > div:first-child')
      if (topRule) {
        topRule.style.transformOrigin = 'left center'
        animate(topRule, { scaleX: [0, 1], opacity: [0, 1] }, { duration: .5, delay: base, easing: EASE_ENTRY_EXP() })
      }
      const cat = col.querySelector('.t-meta')
      if (cat) animate(cat, { opacity: [0, 1] }, { duration: .4, delay: base + .15, easing: EASE_PROD() })
      const heroNum = col.querySelector('.kpi-hero')
      if (heroNum) animate(heroNum, { opacity: [0, 1], y: [18, 0] }, { duration: .7, delay: base + .25, easing: EASE_ENTRY_EXP() })
      const handled = new Set([topRule, cat, heroNum])
      ;[...col.children].filter(el => !handled.has(el)).forEach((el, j) => {
        animate(el, { opacity: [0, 1] }, { duration: .4, delay: base + .45 + j * .05, easing: EASE_PROD() })
      })
    })
  }
}

const RECIPES = {
  'hero': rHero,
  'progression': rProgression,
  'statement': rStatement,
  'grid-reveal': rGridReveal,
  'stack-build': rStackBuild,
  'measure-up': rMeasureUp,
  'bar-grow': rBarGrow,
  'duo-mirror': rDuoMirror,
  'split-statement': rSplitStatement,
  'timeline-walk': rTimelineWalk,
  'manifesto': rManifesto,
  'three-forces': rThreeForces,
  'loop-form': rLoopForm,
  'matrix-fill': rMatrixFill,
  'field-notes': rFieldNotes,
  'system-diagram': rSystemDiagram,
  'why-now': rWhyNow,
  'four-cards': rFourCards,
  'stacked-ledger': rStackedLedger,
  'tech-spec': rTechSpec,
  'image-hero': rImageHero,
}

export function playSwiss(slide) {
  resetAnimsSwiss(slide)

  // 关键：[data-anim] 容器很多时候只是占位标记，真正的几何动画在子元素上。
  // 默认强制 reveal 所有 [data-anim] 容器；recipe 想做块入场时用 {opacity:[0,1]} 会自动覆盖
  slide.querySelectorAll('[data-anim]').forEach(el => {
    el.style.opacity = '1'
    el.style.transform = 'none'
  })

  const all = [...slide.querySelectorAll('[data-anim]')]
  const recipe = slide.dataset.animate
  const fn = RECIPES[recipe]
  if (fn) { fn(slide); return }

  // fallback: 平凡 fade
  if (all.length) animate(all, { opacity: [0, 1], y: [12, 0] },
    { duration: .6, delay: i => i * .08, easing: EASE_ENTRY_EXP() })
}
