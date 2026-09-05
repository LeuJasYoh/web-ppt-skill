// 主题登记表校验：词表封闭集 / 槽位完备性 / 对比度 / CSS 同步——fail 则不得交付
// 用法: node validate.mjs [--deck <deck目录>]（给 --deck 时追加 CSS 同步检查）
// 与 gen.mjs 共享 wordlist.mjs（词表唯一权威），与 style-generate 的"双处强制"同模式。
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATEGORIES, STYLE_CASES, STYLES, SLOTS, HEX_RE, SLUG_RE } from './wordlist.mjs'
import { readThemes, renderBlock } from './gen.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const deckArg = process.argv.includes('--deck') ? process.argv[process.argv.indexOf('--deck') + 1] : null
const CSS_PATHS = deckArg && {
  magazine: join(resolve(deckArg), 'src', 'styles', 'magazine.css'),
  swiss: join(resolve(deckArg), 'src', 'styles', 'swiss.css'),
}

const errors = []
const warns = []
const err = m => errors.push(m)
const warn = m => warns.push(m)

const themes = readThemes()

/* ---------- 1. 结构 ---------- */
const seen = new Set()
themes.forEach((t, i) => {
  const where = `第${i + 2}行(${t.slug || '?'})`
  if (!t.slug) return err(`${where}: slug 为空`)
  if (!SLUG_RE.test(t.slug)) err(`${where}: slug "${t.slug}" 不合法（小写字母开头，仅小写字母/数字/连字符）`)
  if (seen.has(t.slug)) err(`${where}: slug 重复 "${t.slug}"`)
  seen.add(t.slug)
  if (!STYLES.includes(t.style)) err(`${where}: style "${t.style}" ∉ ${STYLES.join('/')}`)
  if (!t.label) err(`${where}: label 为空`)
  if (!t.desc) err(`${where}: desc 为空`)
  else if (t.desc.length > 30) warn(`${where}: desc 超过 30 字（"${t.desc}"）——登记表要短，详情放 references`)
})

/* ---------- 2. 词表封闭集 ---------- */
for (const t of themes) {
  const where = `第${themes.indexOf(t) + 2}行(${t.slug})`
  if (!CATEGORIES.includes(t.category)) err(`${where}: category "${t.category}" ∉ 封闭词表（14 值，见 wordlist.mjs）`)
  if (!t.styleCase) err(`${where}: styleCase 为空`)
  else {
    const cases = t.styleCase.split('、').map(s => s.trim()).filter(Boolean)
    if (cases.length < 2 || cases.length > 5) err(`${where}: styleCase 需 2-5 个顿号分隔值（当前 ${cases.length}）`)
    for (const c of cases) if (!STYLE_CASES.includes(c)) err(`${where}: styleCase "${c}" ∉ 封闭词表（19 值）`)
  }
}

/* ---------- 3. 槽位完备性 + hex 格式 ---------- */
for (const t of themes) {
  const where = `第${themes.indexOf(t) + 2}行(${t.slug})`
  if (!STYLES.includes(t.style)) continue
  const required = new Set(SLOTS[t.style])
  for (const col of SLOTS.magazine.concat(SLOTS.swiss)) {
    const v = t[col]
    if (required.has(col)) {
      if (!v) err(`${where}: ${t.style} 风格必填槽位 ${col} 为空`)
      else if (!HEX_RE.test(v)) err(`${where}: ${col}="${v}" 不是 #RRGGBB`)
    } else if (v) {
      err(`${where}: ${col} 不属于 ${t.style} 风格的槽位（应留空）`)
    }
  }
}

/* ---------- 4. 对比度（WCAG 相对亮度） ---------- */
const lum = hex => {
  const n = parseInt(hex.slice(1), 16)
  const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255)
}
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}
for (const t of themes) {
  const where = `(${t.slug})`
  if (t.style === 'swiss' && HEX_RE.test(t.accent) && HEX_RE.test(t.accent_on)) {
    const r = ratio(t.accent_on, t.accent)
    if (r < 3) err(`${where}: accent_on 在 accent 上对比度 ${r.toFixed(1)}:1 < 3:1（大字可读底线）`)
    else if (r < 4.5) warn(`${where}: accent_on/accent 对比度 ${r.toFixed(1)}:1（≥3 达标，建议 4.5）`)
  }
  if (t.style === 'magazine' && HEX_RE.test(t.ink) && HEX_RE.test(t.paper)) {
    const r = ratio(t.ink, t.paper)
    if (r < 4.5) err(`${where}: ink/paper 正文对比度 ${r.toFixed(1)}:1 < 4.5:1`)
    else if (r < 7) warn(`${where}: ink/paper 对比度 ${r.toFixed(1)}:1（≥4.5 达标，杂志长文建议 7+）`)
  }
}

/* ---------- 5. CSS 同步（--deck <目录> 时检查该 deck；未给则跳过） ---------- */
if (!deckArg) {
  console.log('· 未指定 --deck，跳过 CSS 同步检查（只校验登记表本身）')
} else for (const style of STYLES) {
  if (!existsSync(CSS_PATHS[style])) continue
  const css = readFileSync(CSS_PATHS[style], 'utf-8')
  const slug = css.match(/\/\* THEME:BEGIN ([a-z0-9-]+) \*\//)?.[1]
  if (!slug) err(`${style}.css 缺少 THEME:BEGIN/END 标记段——gen.mjs 的契约被破坏`)
  else {
    const theme = themes.find(t => t.slug === slug)
    if (!theme) err(`${style}.css 标记段 slug "${slug}" 不在 themes.csv 里`)
    else {
      const actual = css.match(/\/\* THEME:BEGIN [\s\S]*?\/\* THEME:END \*\//)?.[0]
      if (actual !== renderBlock(theme)) {
        err(`${style}.css 标记段与 CSV 不同步（${slug}）→ 跑: node gen.mjs --apply ${slug}`)
      }
    }
  }
}

/* ---------- 报告 ---------- */
if (errors.length || warns.length) {
  errors.forEach(m => console.error('✗ ' + m))
  warns.forEach(m => console.warn('⚠ ' + m))
}
console.log(`══ 主题登记表：${themes.length} 套 ｜ error ${errors.length} · warn ${warns.length} ｜ ${errors.length ? '✗ 不通过' : '✓ 通过'}`)
process.exit(errors.length ? 1 : 0)
