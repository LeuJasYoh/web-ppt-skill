// verify 共享库：deck 解析 / 构建 / 静态服务器 / 系统浏览器发现
// 三个来源项目（guizang / html-ppt-skill / style-generate）的浏览器查找都是 macOS 专用，
// 这里必须自带 Windows 逻辑（注册表 App Paths + Program Files + LOCALAPPDATA + PATH）。
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import http from 'node:http'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json', '.map': 'application/json',
}

/* ---------- deck 解析 ---------- */

// 风格检测：main.js 里 import 的是 magazine.css 还是 swiss.css（忽略注释行）
export function detectStyle(deckDir) {
  const main = (readIfExists(join(deckDir, 'src', 'main.js')) || '')
    .split('\n').filter(l => !l.trim().startsWith('//') && !l.trim().startsWith('/*')).join('\n')
  if (/import\s+['"][^'"]*styles\/magazine\.css['"]/.test(main)) return 'magazine'
  if (/import\s+['"][^'"]*styles\/swiss\.css['"]/.test(main)) return 'swiss'
  return null
}

// 按 src/slides/index.js 的未注释 import 顺序解析出页面组件文件（即页序）
export function deckSlides(deckDir) {
  const idxPath = join(deckDir, 'src', 'slides', 'index.js')
  const src = readIfExists(idxPath)
  if (!src) return { slides: [], error: `找不到 ${idxPath}` }
  const slidesDir = join(deckDir, 'src', 'slides')
  const slides = []
  for (const line of src.split('\n')) {
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) continue
    const m = line.match(/import\s+\w+\s+from\s+['"](\.?\/?[^'"]+\.vue)['"]/)
    if (!m) continue
    const rel = m[1].replace(/^\.\//, '').replace(/^\//, '')
    const file = join(slidesDir, rel)
    slides.push({ file, exists: existsSync(file), section: parseSection(existsSync(file) ? readFileSync(file, 'utf-8') : '') })
  }
  return { slides, error: slides.length ? null : 'index.js 里没有解析到任何页面 import' }
}

// 取 <section ...> 的 class / data-layout / data-animate（页面第一组；模板多余 section 极少见，全量取第一个）
function parseSection(vueSrc) {
  const tpl = vueSrc.replace(/<!--[\s\S]*?-->/g, '')
  const m = tpl.match(/<section\b([^>]*)>/)
  if (!m) return { classes: [], layout: null, animate: null }
  const attrs = m[1]
  const cls = (attrs.match(/class="([^"]*)"/) || [, ''])[1]
  const layout = (attrs.match(/data-layout="([^"]*)"/) || [])[1] || null
  const animate = (attrs.match(/data-animate="([^"]*)"/) || [])[1] || null
  return { classes: cls.split(/\s+/).filter(Boolean), layout, animate }
}

export function readIfExists(p) { return existsSync(p) ? readFileSync(p, 'utf-8') : null }

/* ---------- 构建 + 静态服务器 ---------- */

export function buildDeck(deckDir, { force = false } = {}) {
  const distIndex = join(deckDir, 'dist', 'index.html')
  if (!force && existsSync(distIndex)) {
    // dist 比 src 新就跳过构建
    const newestSrc = newestMtime(join(deckDir, 'src'))
    if (newestSrc <= statSync(distIndex).mtimeMs) return { ok: true, skipped: true }
  }
  const r = spawnSync('npm', ['run', 'build'], { cwd: deckDir, shell: true, encoding: 'utf-8' })
  if (r.status !== 0 || !existsSync(distIndex)) {
    return { ok: false, log: ((r.stdout || '') + (r.stderr || '')).slice(-1200) }
  }
  return { ok: true, skipped: false }
}

function newestMtime(dir) {
  let newest = 0
  const walk = d => {
    let entries = []
    try { entries = readdirSync(d, { withFileTypes: true }) } catch { return }
    for (const e of entries) {
      const p = join(d, e.name)
      if (e.isDirectory()) walk(p)
      else { try { newest = Math.max(newest, statSync(p).mtimeMs) } catch {} }
    }
  }
  walk(dir)
  return newest
}

export function serveDir(dir) {
  return new Promise((res, rej) => {
    const server = http.createServer((req, resp) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
      let file = resolve(join(dir, urlPath === '/' ? 'index.html' : urlPath.slice(1)))
      if (!file.startsWith(resolve(dir))) { resp.writeHead(403); return resp.end() }
      try {
        const body = readFileSync(file)
        resp.writeHead(200, { 'content-type': MIME[join(file).toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || ''] || 'application/octet-stream' })
        resp.end(body)
      } catch {
        // SPA 兜底：未命中路径回 index.html（?slide=N 是 query，不会走到这，但保险）
        try { resp.writeHead(200, { 'content-type': 'text/html' }); resp.end(readFileSync(join(dir, 'index.html'))) } catch { resp.writeHead(404); resp.end() }
      }
    })
    server.on('error', rej)
    server.listen(0, '127.0.0.1', () => res({ server, port: server.address().port }))
  })
}

/* ---------- 系统浏览器发现（Windows 优先） ---------- */

export function findBrowser(override) {
  const cand = []
  if (override) cand.push(override)
  const env = process.env
  const pf = env['ProgramFiles'] || 'C:\\Program Files'
  const pf86 = env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'
  const lac = env['LOCALAPPDATA'] || join(env.USERPROFILE || '', 'AppData', 'Local')
  if (process.platform === 'win32') {
    // 注册表 App Paths 最可靠（Edge/Chrome 安装即登记）
    for (const exe of ['msedge.exe', 'chrome.exe']) {
      const r = spawnSync('reg', ['query', `HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\${exe}`, '/ve'], { encoding: 'utf-8', shell: true })
      const m = (r.stdout || '').match(/REG_SZ\s+(.+\.exe)/i)
      if (m && existsSync(m[1].trim())) cand.push(m[1].trim())
    }
    cand.push(
      join(pf86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      join(pf, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      join(pf86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      join(lac, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    )
  } else if (process.platform === 'darwin') {
    cand.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    )
  } else {
    for (const b of ['chromium', 'chromium-browser', 'google-chrome', 'microsoft-edge']) {
      const r = spawnSync('which', [b], { encoding: 'utf-8' })
      if (r.status === 0 && r.stdout.trim()) cand.push(r.stdout.trim())
    }
  }
  for (const c of cand) { if (c && existsSync(c)) return c }
  // 最后再试 PATH（where/which 均可）
  for (const b of ['msedge', 'chrome', 'chromium']) {
    const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [b], { encoding: 'utf-8', shell: process.platform === 'win32' })
    const hit = (r.stdout || '').split('\n').map(s => s.trim()).find(s => s && existsSync(s))
    if (hit) return hit
  }
  return null
}

/* ---------- Playwright 可选解析（混合式降级的关键） ---------- */

// 依次在 deck 目录 / cwd / 本 skill 目录找 playwright；找不到返回 null（调用方降级为纯静态）
export function resolvePlaywright(roots) {
  for (const root of roots) {
    try {
      const req = createRequire(join(root, 'noop.js'))
      const pwPath = req.resolve('playwright')
      return req(pwPath)
    } catch { /* 试下一个根 */ }
  }
  return null
}
