// VuePPT deck 验收：静态快门必跑 + Playwright 可选像素实测（混合式降级）
// 用法:  node check-deck.mjs <deck目录> [--render] [--no-build] [--json]
// 退出码: 0 = 无 error（warn 不拦截）；1 = 有 error；2 = 用法/环境错误
// 规则来源：references/swiss-layout-lock.md（版式锁）、references/layouts.md（A 主题节奏）、SKILL.md 技术红线
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildDeck, deckSlides, detectStyle, resolvePlaywright, serveDir } from './lib.mjs'

const args = process.argv.slice(2)
const deckDir = resolve(args.find(a => !a.startsWith('--')) || '.')
const flags = new Set(args.filter(a => a.startsWith('--')))
const wantRender = flags.has('--render')
const here = fileURLToPath(new URL('.', import.meta.url))

const issues = []          // { level: 'error'|'warn'|'info', where, msg, advice? }
const err = (where, msg, advice) => issues.push({ level: 'error', where, msg, advice })
const warn = (where, msg, advice) => issues.push({ level: 'warn', where, msg, advice })
const info = (where, msg) => issues.push({ level: 'info', where, msg })

/* ---------------- 入口检查 ---------------- */
if (!existsSync(join(deckDir, 'src', 'main.js'))) {
  console.error(`✗ ${deckDir} 不像一个 VuePPT deck（没有 src/main.js）`)
  process.exit(2)
}
const style = detectStyle(deckDir)
if (!style) {
  console.error('✗ 无法从 src/main.js 识别风格（magazine.css / swiss.css 二选一导入）——严禁同时导入，也都没导入也不行')
  process.exit(2)
}
console.log(`▶ 风格：${style === 'magazine' ? 'A · 电子杂志' : 'B · 瑞士国际主义'}\n▶ 目录：${deckDir}\n`)

const { slides, error: slideErr } = deckSlides(deckDir)
if (slideErr) { err('src/slides/index.js', slideErr) }

/* ---------------- 静态快门 ---------------- */

// —— B 风格：版式锁（登记表 = swiss-layout-lock.md 的 S01-S22 快照）——
const SWISS_LAYOUTS = new Set(Array.from({ length: 22 }, (_, i) => 'S' + String(i + 1).padStart(2, '0')))
// statement/split 版式允许顶部居中；SVG 允许写极短中心文字的版式
const SWISS_CENTER_OK = new Set(['S03', 'S09', 'S10'])
const SWISS_SVG_TEXT_OK = new Set(['S14', 'S17'])

slides.forEach((s, i) => {
  const where = `${basename(s.file)}(第${i + 1}页)`
  if (!s.exists) { err(where, 'index.js 引用的组件文件不存在'); return }
  const tpl = readFileSync(s.file, 'utf-8').replace(/<!--[\s\S]*?-->/g, '')
  const cls = s.section.classes
  const layout = s.section.layout

  if (style === 'swiss') {
    if (!layout) err(where, '缺 data-layout="Sxx"（版式锁要求每页登记版式）', '从 S01-S22 里选一个登记版式，骨架照抄 references/layouts-swiss.md')
    else if (!SWISS_LAYOUTS.has(layout)) err(where, `data-layout="${layout}" 未登记`, '版式锁只认 S01-S22；不要发明 S23/S24')
    if (layout && !SWISS_CENTER_OK.has(layout)) {
      const head = tpl.slice(0, 1800)
      if (/text-align\s*:\s*center/.test(head)) warn(where, `顶部出现 text-align:center（${layout} 非statement版式）`, '顶部标题应贴左上内容轴；只有 S03/S09/S10 允许居中')
    }
    if (layout && !SWISS_SVG_TEXT_OK.has(layout) && /<text[\s>]|text-anchor/.test(tpl)) {
      err(where, `SVG 里写了可见文字（${layout}）`, 'SVG 只画几何线条；文字用 HTML 放进网格/卡片/caption。只有 S14/S17 允许 1-2 个极短中心字')
    }
    if (layout === 'S22' && /object-position\s*:\s*top/.test(tpl)) {
      warn(where, 'S22 主图 object-position:top 会裁掉人脸', '用 center 35% 或类似中位锚点（swiss-layout-lock S22 规则）')
    }
    if (/font-weight\s*:\s*200/.test(tpl)) {
      warn(where, '内联 font-weight:200', 'Windows 雅黑无 200，is-win 补偿只对类生效——字号字重交给 CSS 类，不要内联写死')
    }
  }

  if (style === 'magazine') {
    const base = cls.includes('dark') ? 'dark' : cls.includes('light') ? 'light' : null
    if (!base) err(where, 'section 缺 light/dark 主题类', '每页必须带 light / dark / hero light / hero dark 之一，JS 靠它切 WebGL 背景')
  }

  // 通用：占位符残留
  if (tpl.includes('[必填]') || tpl.includes('标题写在这里') || tpl.includes('一句话副标题')) {
    warn(where, '示例占位文案疑似残留', '交付前替换为真实内容')
  }
  // 通用：模板内联 hex 色（主题色应走 :root 主题段）
  const inlineHex = tpl.match(/style="[^"]*#[0-9a-fA-F]{3,8}[^"]*"/g)
  if (inlineHex) warn(where, `内联 hex 色 × ${inlineHex.length}`, '颜色只写在 magazine.css/swiss.css 的主题段（:root），页面里走 var(--...)')
})

// —— A 风格：主题节奏（连续 3 页同明暗禁止；建议每 3-5 页一个 hero）——
if (style === 'magazine' && slides.length) {
  let run = 1
  slides.forEach((s, i) => {
    if (i === 0) return
    const prev = slides[i - 1].section.classes
    const cur = s.section.classes
    const bOf = c => (c.includes('dark') ? 'dark' : 'light')
    if (bOf(prev) === bOf(cur) && cur.some(x => x === 'light' || x === 'dark')) {
      run++
      if (run >= 3) err(`${basename(s.file)}(第${i + 1}页)`, `已连续 ${run} 页同明暗（${bOf(cur)}）`, 'layouts.md：禁止连续 3 页以上相同主题，插入反向页或 hero 呼吸页')
    } else run = 1
  })
  const heroGap = (() => {
    let last = -1, worst = 0
    slides.forEach((s, i) => { if (s.section.classes.includes('hero')) { worst = Math.max(worst, i - last); last = i } })
    worst = Math.max(worst, slides.length - last)
    return worst
  })()
  if (slides.length >= 6 && heroGap > 5) warn('全册', `连续 ${heroGap} 页没有 hero 页`, '每 3-4 页插一个 hero（封面/幕封/大引用）做呼吸')
}

// —— 通用：占位符 / 依赖白名单 / 图片命名 ——
const idxHtml = readIfExistsSafe(join(deckDir, 'index.html'))
if (idxHtml && (idxHtml.includes('[必填]'))) warn('index.html', '<title> 还是"[必填]"占位', '交付前替换为 deck 标题（也是浏览器标签页标题）')

const pkgRaw = readIfExistsSafe(join(deckDir, 'package.json'))
if (pkgRaw) {
  try {
    const deps = Object.keys(JSON.parse(pkgRaw).dependencies || {})
    const bad = deps.filter(d => !(d === 'vue' || d === 'motion' || d === 'lucide' || d.startsWith('@fontsource')))
    if (bad.length) err('package.json', `依赖白名单外：${bad.join(', ')}`, 'v1 只允许 vue / motion / lucide / @fontsource-*；不引入 vue-router/pinia/UI 库/图表库')
  } catch { err('package.json', 'JSON 解析失败') }
}

const imgDir = join(deckDir, 'public', 'images')
if (existsSync(imgDir)) {
  for (const f of readdirSync(imgDir)) {
    if (!/\.(jpe?g|png|webp|gif|svg)$/i.test(f)) continue
    if (!/^\d{2}-[a-z0-9][a-z0-9-]*\.(jpe?g|png|webp|gif|svg)$/i.test(f)) warn(`public/images/${f}`, '图片命名不符合 {两位页号}-{语义}.{ext}', '如 01-cover.jpg——这是 layouts.md 的图片契约')
  }
}

function readIfExistsSafe(p) { return existsSync(p) ? readFileSync(p, 'utf-8') : null }

/* ---------------- 渲染实测（Playwright 可选；找不到就明示降级） ---------------- */
let renderNote = null
if (wantRender) {
  const pw = resolvePlaywright([deckDir, process.cwd(), join(here, '..', '..'), here])
  if (!pw) {
    renderNote = '未找到 playwright —— 跳过像素实测（静态快门已全部通过/失败见上）。启用方法：在 deck 目录 npm i -D playwright 后重跑 --render'
    info('render', renderNote)
  } else {
    process.stdout.write('▶ 构建中（vite build）…\n')
    const b = buildDeck(deckDir)
    if (!b.ok) { err('build', 'vite build 失败', (b.log || '').slice(-300)); }
    if (b.ok) {
      const { server, port } = await serveDir(join(deckDir, 'dist'))
      const chalk = { dim: s => `\x1b[2m${s}\x1b[0m`, red: s => `\x1b[31m${s}\x1b[0m`, yellow: s => `\x1b[33m${s}\x1b[0m`, green: s => `\x1b[32m${s}\x1b[0m` }
      let browser
      try {
        browser = await pw.chromium.launch({ channel: 'msedge' }).catch(() => pw.chromium.launch({ channel: 'chrome' }).catch(() => pw.chromium.launch()))
        const page = await (await browser.newContext({ viewport: { width: 1600, height: 900 } })).newPage()
        for (let i = 1; i <= slides.length; i++) {
          await page.goto(`http://127.0.0.1:${port}/?slide=${i}`, { waitUntil: 'domcontentloaded' })
          await page.waitForTimeout(1800) // 入场动画播完再量
          const m = await page.evaluate(measureSlide)
          const where = `第${i}页`
          if (m.offenders.length) {
            for (const o of m.offenders.slice(0, 3)) {
              const px = Math.max(o.overX, o.overY)
              err(where, `内容溢出视口 ${px}px —— <${o.tag} class="${o.cls}"> "${o.text}"`, ladder(px))
            }
            if (m.offenders.length > 3) info(where, `另有 ${m.offenders.length - 3} 处溢出未展开`)
          }
          if (m.minFont !== null && m.minFont < 14) {
            (m.minFont < 12 ? err : warn)(where, `最小字号 ${m.minFont}px（"${m.minFontSample}"）`, '演示最小字号：正文≥18 / 卡片描述≥16 / meta≥14')
          }
          if (m.titleGap !== null && m.titleGap < 12) warn(where, `标题"${m.titleGapSample}"与下方元素间距仅 ${m.titleGap}px`, '标题块加 margin-bottom ≥14px（guizang M2：大标题 32px / 局部标题 14px）')
          if (m.contentBottom > 0 && m.contentBottom < 0.55) warn(where, `内容最低点只到 ${Math.round(m.contentBottom * 100)}vh——底部大片空白`, '居中版式属正常可忽略；顶对齐版式出现则是修过头/内容过少')
          if (m.bottomHits.length) info(where, `底部安全区有内容（导航圆点下方）: ${m.bottomHits.map(h => `"${h.text}"`).join(' / ')}`)
          if (!m.offenders.length && (m.minFont === null || m.minFont >= 14)) console.log(`  ${chalk.green('✓')} 第${i}页 ${chalk.dim(`overflow×0 · minFont ${m.minFont}px`)}`)
        }
      } catch (e) {
        err('render', `渲染实测失败：${e.message.split('\n')[0]}`, '确认本机已装 Edge 或 Chrome（channel 自动探测）')
      } finally {
        if (browser) await browser.close().catch(() => {})
        server.close()
      }
    }
  }
}

function measureSlide() {
  const vw = innerWidth, vh = innerHeight
  const out = { offenders: [], minFont: null, minFontSample: '', bottomHits: [], contentBottom: 0, titleGap: null, titleGapSample: '' }
  const skip = el => el.closest('#nav, .progress-bar, #overview, .notes')
  const isChrome = el => /foot|chrome|meta|page-num|slide-number|kicker|eyebrow/i.test(typeof el.className === 'string' ? el.className : '')
  for (const el of document.querySelectorAll('#deck .slide, #deck .slide *')) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue
    const r = el.getBoundingClientRect()
    if (r.width < 4 || r.height < 4) continue
    if (r.right <= 2 || r.left >= vw - 2 || r.bottom <= 2 || r.top >= vh - 2) continue // 完全在屏外（未激活页）
    const text = (el.textContent || '').trim()
    const cls = (typeof el.className === 'string' ? el.className : '').slice(0, 36)
    if (!skip(el) && (r.right > vw + 2 || r.bottom > vh + 2)) {
      out.offenders.push({ tag: el.tagName.toLowerCase(), cls, text: text.slice(0, 20), overX: Math.max(0, Math.round(r.right - vw)), overY: Math.max(0, Math.round(r.bottom - vh)) })
    }
    const leaf = el.children.length === 0
    if (leaf && text) {
      const fs = parseFloat(cs.fontSize)
      if (Number.isFinite(fs) && (out.minFont === null || fs < out.minFont)) { out.minFont = fs; out.minFontSample = text.slice(0, 16) }
      if (!skip(el) && !isChrome(el) && r.top > vh * 0.93) {
        out.bottomHits.push({ text: text.slice(0, 16) })
      }
      if (!skip(el) && !isChrome(el)) out.contentBottom = Math.max(out.contentBottom, r.bottom / vh)
    }
    // 标题-下方元素最小间距（guizang M2 的轻量版）
    if (/^H[1-4]$/.test(el.tagName) || /(h-hero|h-xl|h-md|h1|h2)/.test(cls)) {
      let gap = null
      for (const other of el.closest('.slide').querySelectorAll('*')) {
        if (other === el || other.contains(el) || el.contains(other)) continue
        const ocs = getComputedStyle(other)
        if (ocs.display === 'none' || +ocs.opacity === 0) continue
        const or_ = other.getBoundingClientRect()
        if (or_.width < 4 || or_.height < 4 || or_.top < r.bottom - 1 || or_.left >= vw || or_.right <= 0) continue
        const d = or_.top - r.bottom
        if (d >= 0 && (gap === null || d < gap)) gap = d
      }
      if (gap !== null && gap < 60 && (out.titleGap === null || gap < out.titleGap)) {
        out.titleGap = Math.round(gap); out.titleGapSample = (el.textContent || '').trim().slice(0, 14)
      }
    }
  }
  // 父子同溢出去重：只留溢出量最大的前 6 个
  out.offenders.sort((a, b) => Math.max(b.overX, b.overY) - Math.max(a.overX, a.overY))
  return out
}

function ladder(px) {
  if (px <= 40) return `微调（${px}px ≤ 40）：该元素减 padding/字号或缩短一词即可，不要删内容`
  if (px <= 90) return `压间距（${px}px ≤ 90）：压缩该区块与相邻区块的间距/行高`
  if (px <= 160) return `压内容（${px}px ≤ 160）：删减次要文案或拆成两页`
  return `换版式（溢出 ${px}px > 160）：内容装不下这个版式，换更宽松的登记版式`
}

/* ---------------- 报告 ---------------- */
const errors = issues.filter(x => x.level === 'error')
const warns = issues.filter(x => x.level === 'warn')
const infos = issues.filter(x => x.level === 'info')

if (flags.has('--json')) {
  console.log(JSON.stringify({ style, slides: slides.length, errors, warns, infos, pass: errors.length === 0 }, null, 2))
} else {
  console.log('')
  for (const x of issues) {
    const icon = x.level === 'error' ? '✗' : x.level === 'warn' ? '⚠' : '·'
    console.log(`${icon} [${x.level}] ${x.where}: ${x.msg}`)
    if (x.advice) console.log(`   ↳ 建议：${x.advice}`)
  }
  console.log(`\n══ 结果：${errors.length ? '✗ 不通过' : '✓ 通过'} ｜ error ${errors.length} · warn ${warns.length} · info ${infos.length}${renderNote ? '\n　 ' + renderNote : ''}`)
  if (!wantRender && !renderNote) console.log('　 提示：加 --render 且环境装有 playwright 时，会追加像素级实测（overflow/最小字号）')
}
process.exit(errors.length ? 1 : 0)
