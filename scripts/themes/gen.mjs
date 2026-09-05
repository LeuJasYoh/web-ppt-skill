// 主题生成器：themes.csv（唯一事实源）→ 回写风格 CSS 的 THEME 标记段
// 用法:
//   node gen.mjs --list                          列出全部主题
//   node gen.mjs --apply <slug> --deck <deck目录> 把主题写入该 deck 的风格 CSS
//   node gen.mjs --check --deck <deck目录>        校验 deck 的 CSS 标记段与 CSV 是否同步
// 设计约定：主题数据存在 skill（themes.csv），应用目标永远是 deck 目录——skill 只读不回写。
// deck 的风格 CSS 里主题段被 /* THEME:BEGIN <slug> */ ... /* THEME:END */ 标记包裹，
// 生成器只改标记之间——构建链（Vite/Go）零感知，rgb 三元组由 hex 现场派生不入库。
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SLOTS, STYLES } from './wordlist.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const CSV_PATH = join(HERE, 'themes.csv')

// 主题数据存在 skill 里，但应用目标永远是【deck 目录】的风格 CSS——skill 本身只读，绝不回写模板。
// 用法: gen.mjs --apply <slug> --deck <deck目录> / --check --deck <deck目录>
function cssPathsFor(deckDir) {
  return {
    magazine: join(deckDir, 'src', 'styles', 'magazine.css'),
    swiss: join(deckDir, 'src', 'styles', 'swiss.css'),
  }
}

function requireDeck(deckArg) {
  if (!deckArg) {
    console.error('✗ 缺少 --deck <deck目录>——主题应用到 deck 的风格 CSS；skill 目录只存数据与工具，不被写入')
    process.exit(2)
  }
  const deckDir = resolve(deckArg)
  if (!existsSync(join(deckDir, 'src', 'styles', 'magazine.css'))) {
    console.error(`✗ ${deckDir} 不是 VuePPT deck（缺 src/styles/magazine.css）——先用 new-deck.mjs 创建 deck`)
    process.exit(2)
  }
  return deckDir
}

/* ---------- CSV 解析（约定：字段内禁止逗号，多值用顿号） ---------- */
export function readThemes() {
  const text = readFileSync(CSV_PATH, 'utf-8')
  const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'))
  const header = lines[0].split(',')
  return lines.slice(1).map(line => {
    const cells = line.split(',')
    const row = {}
    header.forEach((h, i) => (row[h] = (cells[i] ?? '').trim()))
    return row
  })
}

export function findTheme(slug) {
  return readThemes().find(t => t.slug === slug) || null
}

/* ---------- 派生：hex → rgb 三元组 ---------- */
const rgb = hex => {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}

/* ---------- 生成某主题的标记段内容（含 BEGIN/END 行） ---------- */
export function renderBlock(theme) {
  const slots = SLOTS[theme.style]
  const lines = [`/* THEME:BEGIN ${theme.slug} */`]
  const varName = k => '--' + k.replaceAll('_', '-')
  for (const k of slots) {
    const v = theme[k]
    lines.push(`  ${varName(k)}:${v};`)
    // 仅 ink/paper/accent 三个主变量有 -rgb 兄弟（与 v1 CSS 完全一致，勿扩展）
    if (['ink', 'paper', 'accent'].includes(k)) {
      lines.push(`  ${varName(k)}-rgb:${rgb(v)};`)
    }
  }
  lines.push('/* THEME:END */')
  return lines.join('\n')
}

const markerSlug = (cssText, style) =>
  cssText.match(/\/\* THEME:BEGIN ([a-z0-9-]+) \*\//)?.[1] ?? null

function replaceBlock(cssText, block) {
  const re = /\/\* THEME:BEGIN [a-z0-9-]+ \*\/[\s\S]*?\/\* THEME:END \*\//
  if (re.test(cssText)) return cssText.replace(re, block)
  // 首次引导：无标记时插到 :root{ 之后（原主题段的位置）
  if (!/:root\{\r?\n/.test(cssText)) throw new Error('CSS 里既无 THEME 标记段也无 :root{ —— 无法定位主题段')
  return cssText.replace(/(:root\{\r?\n)/, `$1${block}\n`)
}

/* ---------- 命令（仅直接运行时执行；被 validate import 时不触发） ---------- */
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const args = process.argv.slice(2)

  if (args[0] === '--list') {
    for (const t of readThemes()) {
      console.log(`${t.slug.padEnd(12)} ${t.style.padEnd(9)} ${t.label}  ${t.desc}`)
    }
    process.exit(0)
  }

  if (args[0] === '--check') {
    const deckDir = requireDeck(args[args.indexOf('--deck') + 1])
    const CSS_PATHS = cssPathsFor(deckDir)
    let fail = false
    for (const style of STYLES) {
      if (!existsSync(CSS_PATHS[style])) continue
      const css = readFileSync(CSS_PATHS[style], 'utf-8')
      const slug = markerSlug(css, style)
      const theme = slug && findTheme(slug)
      if (!theme) { console.error(`✗ ${style}.css 标记段 slug "${slug}" 在 themes.csv 中不存在`); fail = true; continue }
      const expect = renderBlock(theme)
      const actual = css.match(/\/\* THEME:BEGIN [\s\S]*?\/\* THEME:END \*\//)?.[0]
      if (actual !== expect) { console.error(`✗ ${style}.css 的标记段与 themes.csv 不同步（当前登记 ${slug}）→ 跑 gen.mjs --apply ${slug}`); fail = true }
      else console.log(`✓ ${style}.css 与 CSV 同步（${slug}）`)
    }
    process.exit(fail ? 1 : 0)
  }

  const slug = args[0] === '--apply' ? args[1] : null
  const deckIdx = args.indexOf('--deck')
  const deckDir = requireDeck(deckIdx >= 0 ? args[deckIdx + 1] : null)
  if (!slug) {
    console.error('用法: node gen.mjs --list | --apply <slug> --deck <deck目录> | --check --deck <deck目录>')
    process.exit(2)
  }
  const theme = findTheme(slug)
  if (!theme) {
    console.error(`✗ themes.csv 里没有 "${slug}"。可用主题: node gen.mjs --list`)
    process.exit(2)
  }
  const cssPath = cssPathsFor(deckDir)[theme.style]
  if (!existsSync(cssPath)) { console.error(`✗ 找不到 ${cssPath}`); process.exit(2) }
  writeFileSync(cssPath, replaceBlock(readFileSync(cssPath, 'utf-8'), renderBlock(theme)))
  console.log(`✓ ${deckDir} 的 ${theme.style}.css 主题已应用: ${slug}（${theme.label}）——npm run build 后生效`)
}
