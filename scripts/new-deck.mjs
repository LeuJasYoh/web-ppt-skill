// 在工作区创建新的 deck 目录（从 skill 的 assets/scaffold 复制纯源码）
// 用法:  node new-deck.mjs <目标目录> [--install]
//        --install  创建后立即 npm install（网络不畅可先设 registry）
// 复制排除：node_modules / dist / verify-output（都是生成物，目标目录自己长出来）
import { cpSync, existsSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
const target = resolve(args.find(a => !a.startsWith('--')) || '')
if (!target) {
  console.error('用法: node new-deck.mjs <目标目录> [--install]')
  process.exit(2)
}
if (existsSync(target) && readdirSync(target).length) {
  console.error(`✗ ${target} 已存在且非空——换个目录名，或清空后再试`)
  process.exit(2)
}

const scaffold = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'scaffold')
cpSync(scaffold, target, {
  recursive: true,
  filter: src => !/node_modules$|dist$|verify-output$|\.edge-profile$/.test(src),
})
console.log(`✓ deck 已创建: ${target}`)

if (args.includes('--install')) {
  console.log('▶ npm install（首次约 1-3 分钟）…')
  const r = spawnSync('npm', ['install'], { cwd: target, stdio: 'inherit', shell: true })
  if (r.status !== 0) { console.error('✗ npm install 失败——网络不畅可加镜像: npm install --registry=https://registry.npmmirror.com'); process.exit(1) }
} else {
  console.log('下一步: cd ' + target + ' && npm install')
}
console.log('之后: 选风格/主题（SKILL.md §2-4）→ 写页面 → check-deck 验收 → build 交付')
