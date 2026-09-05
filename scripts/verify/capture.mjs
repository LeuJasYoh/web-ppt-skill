// VuePPT deck 截图连拍：系统 Edge/Chrome headless CLI（零 npm 依赖）
// 用法:  node capture.mjs <deck目录> [--out 目录] [--pages 1,3,5-8] [--browser 路径] [--no-build]
// 产物:  <deck>/verify-output/pages/01.png ...（1920×1080）
// 说明:  需要先构建（脚本自动 npm run build）；A 风格 WebGL 背景在 headless 下由 SwiftShader 软渲染，
//        个别机器上背景 canvas 可能降级为纯色——内容排版不受影响，以人眼验收排版为主。
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { buildDeck, deckSlides, detectStyle, findBrowser, serveDir } from './lib.mjs'
import { readThemes, findTheme } from '../themes/gen.mjs'

// ⚠️ 必须用异步 spawn：Windows 上 spawnSync 的同步管道会让 Edge/Chrome（GUI 子系统 Chromium）
// 无限期挂住（实测 40s×N 全部 ETIMEDOUT）；异步 spawn 同参数 2-3s 正常退出。别改回 spawnSync。
function shot(exe, argv, out, timeoutMs) {
  return new Promise(resolve => {
    const child = spawn(exe, argv, { stdio: ['ignore', 'pipe', 'pipe'] })
    let firstErr = ''
    child.stderr.on('data', d => { if (!firstErr) firstErr = d.toString().split('\n')[0].slice(0, 120) })
    const killer = setTimeout(() => { try { child.kill() } catch {}; resolve({ ok: false, err: `超时 ${timeoutMs}ms（浏览器未退出）` }) }, timeoutMs)
    child.on('error', e => { clearTimeout(killer); resolve({ ok: false, err: '启动失败 ' + e.code }) })
    child.on('exit', code => {
      clearTimeout(killer)
      // 以文件落盘为准：Edge headless 偶发非 0 退出码但截图已写出
      const ok = existsSync(out)
      resolve({ ok, err: ok ? '' : `exit ${code}${firstErr ? ' · ' + firstErr : ''}` })
    })
  })
}

const args = process.argv.slice(2)
const positional = args.filter(a => !a.startsWith('--'))
const opt = (name, dflt) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : dflt }
const flag = name => args.includes('--' + name)

const deckDir = resolve(positional[0] || '.')
if (!existsSync(join(deckDir, 'src', 'main.js'))) {
  console.error('✗ 不是 VuePPT deck 目录（缺 src/main.js）'); process.exit(2)
}
const outDir = resolve(opt('out', join(deckDir, 'verify-output', 'pages')))
const pagesArg = opt('pages', null)

/* ---- 页序解析：默认全量，--pages 支持 "1,3,5-8" ---- */
const { slides } = deckSlides(deckDir)
if (!slides.length) { console.error('✗ src/slides/index.js 解析不到页面'); process.exit(2) }
let pages = slides.map((_, i) => i + 1)
if (pagesArg) {
  pages = pagesArg.split(',').flatMap(part => {
    const m = part.match(/^(\d+)-(\d+)$/)
    if (m) return Array.from({ length: +m[2] - +m[1] + 1 }, (_, k) => +m[1] + k)
    return [parseInt(part, 10)].filter(Boolean)
  }).filter(n => n >= 1 && n <= slides.length)
}

/* ---- 构建 + 起本地静态服务（内置 http，零依赖） ---- */
if (!flag('no-build')) {
  process.stdout.write('▶ 构建中（vite build）…\n')
  const b = buildDeck(deckDir, { force: !existsSync(join(deckDir, 'dist', 'index.html')) ? false : flag('force-build') })
  if (!b.ok) { console.error('✗ 构建失败：\n' + (b.log || '')); process.exit(1) }
} else if (!existsSync(join(deckDir, 'dist', 'index.html'))) {
  console.error('✗ --no-build 但 dist/ 不存在，先 npm run build'); process.exit(2)
}

const browser = findBrowser(opt('browser', null))
if (!browser) {
  console.error('✗ 找不到 Edge/Chrome。解决：确认已安装 Microsoft Edge，或用 --browser "浏览器exe路径" 指定')
  process.exit(2)
}
console.log(`▶ 浏览器：${browser}`)

const { server, port } = await serveDir(join(deckDir, 'dist'))


/* ---- --gallery 主题画廊：按本 deck 风格遍历登记表，逐套 应用→重建→连拍 ---- */
if (flag('gallery')) {
  const style = detectStyle(deckDir)
  const themes = readThemes().filter(t => t.style === style)
  if (!themes.length) { console.error(`✗ 登记表里没有 ${style} 风格的主题`); process.exit(2) }
  const genPath = join(resolve(import.meta.dirname, '..'), 'themes', 'gen.mjs')
  const styleCss = join(deckDir, 'src', 'styles', style === 'magazine' ? 'magazine.css' : 'swiss.css')
  const original = readFileSync(styleCss, 'utf-8').match(/\/\* THEME:BEGIN ([a-z0-9-]+) \*\//)?.[1]
  const galleryDir = join(deckDir, 'verify-output', 'gallery')
  mkdirSync(galleryDir, { recursive: true })
  const profileDir = join(tmpdir(), 'vueppt-edge-profile') // 系统临时目录：一次性浏览器 profile 不污染 deck
  const genApply = slug => spawnSync(process.execPath, [genPath, '--apply', slug, '--deck', deckDir], { encoding: 'utf-8' })
  console.log(`▶ 画廊模式：${style} 风格 × ${themes.length} 套主题 × ${pages.length} 页\n`)
  let okThemes = 0
  for (const t of themes) {
    genApply(t.slug)
    const b = buildDeck(deckDir, { force: true })
    if (!b.ok) { console.error(`  ✗ ${t.slug}: 构建失败`); continue }
    const tDir = join(galleryDir, t.slug)
    mkdirSync(tDir, { recursive: true })
    let okN = 0
    for (const n of pages) {
      const out = join(tDir, `${String(n).padStart(2, '0')}.png`)
      const r = await shot(browser, buildShotArgs({ out, port, n, profileDir, width: opt('width', '1600'), height: opt('height', '900'), budget: opt('budget', '2000'), webglFlags: flag('allow-webgl') ? [] : ['--disable-webgl', '--disable-webgl2'] }), out, 60000)
      if (r.ok) okN++
      else console.error(`      ${r.err}`)
    }
    console.log(`  ${okN === pages.length ? '✓' : '✗'} ${t.slug.padEnd(12)} ${t.label}（${okN}/${pages.length}）→ verify-output/gallery/${t.slug}/`)
    if (okN === pages.length) okThemes++
  }
  if (original) { genApply(original); buildDeck(deckDir, { force: true }) }
  server.close()
  console.log(`\n══ 画廊完成：${okThemes}/${themes.length} 套 → ${galleryDir}${original ? `（已恢复原主题 ${original}）` : '（⚠ 未能恢复原主题：CSS 无 THEME 标记）'}`)
  process.exit(okThemes === themes.length ? 0 : 1)
}

function buildShotArgs({ out, port, n, profileDir, width, height, budget, webglFlags }) {
  return [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    ...webglFlags,
    '--no-first-run', '--no-default-browser-check',
    // ⚠️ 确定性截图的关键：强制 reduced-motion → deck 走 revealStatic（内容全显、零动画）。
    //   否则截图与"虚拟时间 vs 动画时序"竞态（实测同一命令时好时坏）；deck 的低功耗模式恰好响应它。
    '--force-prefers-reduced-motion',
    `--user-data-dir=${profileDir}`,
    `--window-size=${width},${height}`, `--virtual-time-budget=${budget}`, // ⚠️ 必须保持 ≤2000：虚拟时间走完后 Motion One 动画结束、样式回退到预隐藏门 → 截图只剩 chrome；2000 恰在"动画近完成未回退"的窗口。≥6000 还会因 rAF 帧数在软渲染下拖到分钟级
    `--screenshot=${out}`,
    `http://127.0.0.1:${port}/?slide=${n}`,
  ]
}

mkdirSync(outDir, { recursive: true })
// 独立干净 profile（系统临时目录）：headless 复用用户真实 profile 会加载扩展/首启向导，可能卡死不出图
const profileDir = join(tmpdir(), 'vueppt-edge-profile')

let okCount = 0
for (const n of pages) {
  const out = join(outDir, `${String(n).padStart(2, '0')}.png`)
  const W = opt('width', '1920'), H = opt('height', '1080'), budget = opt('budget', '2000')
  const webglFlags = flag('allow-webgl') ? [] : ['--disable-webgl', '--disable-webgl2'] // 默认禁：背景由软渲染时代价极高且非验收目标；排版以内容为准
  // ⚠️ 实测（二分验证）：Edge 加 --disable-extensions 会让页面的动效揭示（Motion One/WAAPI）不发生，
  //    截图只剩 chrome 没有内容——禁止加回这个 flag。--no-first-run/--default-browser-check 无此问题。
  const r = await shot(browser, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    ...webglFlags,
    '--no-first-run', '--no-default-browser-check',
    // ⚠️ 确定性截图的关键：强制 reduced-motion → deck 走 revealStatic（内容全显、零动画）。
    //   否则截图与"虚拟时间 vs 动画时序"竞态（实测同一命令时好时坏）；deck 的低功耗模式恰好响应它。
    '--force-prefers-reduced-motion',
    `--user-data-dir=${profileDir}`,
    `--window-size=${W},${H}`, `--virtual-time-budget=${budget}`, // ⚠️ 必须保持 ≤2000：虚拟时间走完后 Motion One 动画结束、样式回退到预隐藏门 → 截图只剩 chrome；2000 恰在"动画近完成未回退"的窗口。≥6000 还会因 rAF 帧数在软渲染下拖到分钟级
    `--screenshot=${out}`,
    `http://127.0.0.1:${port}/?slide=${n}`,
  ], out, 60000)
  console.log(`  ${r.ok ? '✓' : '✗'} 第${n}页 → ${out}${r.ok ? '' : '\n      ' + r.err}`)
  if (r.ok) okCount++
}

server.close()
console.log(`\n══ 连拍完成：${okCount}/${pages.length} 张 → ${outDir}`)
console.log('　 逐张肉眼验收：溢出/遮挡/对比度/留白；深色玻璃类效果在截图里可能弱于实机，以浏览器实机为准。')
process.exit(okCount === pages.length ? 0 : 1)
