# 验收工具链（scripts/verify/）

交付前必跑。设计原则：**静态快门永远保底，渲染能力就环境水涨船高**（混合式降级）——两个脚本零 npm 依赖可用，装了 playwright 自动升级为像素实测。

## check-deck.mjs — 结构验收

```bash
node <本skill目录>/scripts/verify/check-deck.mjs <deck目录>            # 静态快门
node <本skill目录>/scripts/verify/check-deck.mjs <deck目录> --render   # + 像素实测（需 playwright）
```

**静态快门**（必跑，无任何依赖）：

| 检查 | 级别 | 依据 |
|---|---|---|
| B：每页 `data-layout` 存在且 ∈ S01-S22 | error | swiss-layout-lock.md 版式锁 |
| B：非 S03/S09/S10 版式顶部 text-align:center | warn | 版式锁第 3 条 |
| B：S14/S17 之外 SVG 里写可见文字 | error | 版式锁第 4 条 |
| A：每页 section 带 light/dark 主题类 | error | layouts.md 主题节奏 |
| A：连续 ≥3 页同明暗 | error | layouts.md"禁止连续 3 页以上相同主题" |
| A：6 页以上连续 >5 页无 hero | warn | 每 3-4 页一个 hero |
| `[必填]`/示例占位文案残留 | warn | — |
| 模板内联 hex 色 | warn | 颜色只写在风格 CSS 主题段 |
| package.json 依赖白名单外（只允许 vue/motion/lucide/@fontsource） | error | SKILL.md 技术红线 |
| 图片命名 `{两位页号}-{语义}.{ext}` | warn | layouts.md 图片契约 |
| B：S22 主图 `object-position:top`（裁人脸） | warn | swiss-layout-lock S22 |
| B：内联 `font-weight:200`（is-win 补偿只对类生效） | warn | SKILL.md 风格 B 硬规则 9 |

**像素实测**（`--render`，自动按 deck目录 → cwd → skill目录 的顺序找 playwright；找不到则**跳过并明示**，不算失败）：
逐页打开 `dist`（自动 `vite build`，可用 `--no-build` 跳过），1800ms 动画落定后测量：

- 内容溢出视口 → 按**修复阶梯**给建议：≤40px 微调 / ≤90px 压间距 / ≤160px 压内容 / >160px 换版式
- 最小字号（<14px warn、<12px error；演示最小字号：正文≥18 / 卡片描述≥16 / meta≥14）
- 标题与下方元素最小间距（<12px warn，参考 M2：大标题 32px / 局部标题 14px）
- 顶对齐版式的底部大片空白（内容最低点 <55vh warn——修过头检测）
- 底部安全区占用（导航圆点区域，info 级）
- 自动 `vite build`，`--no-build` 可跳过（需 dist 已存在）

退出码：`0` 通过（warn 不拦截）/ `1` 有 error / `2` 用法错误。`--json` 输出机器可读报告。

## capture.mjs — 截图连拍（人眼复查）

```bash
node <本skill目录>/scripts/verify/capture.mjs <deck目录>                    # 全页
node <本skill目录>/scripts/verify/capture.mjs <deck目录> --pages 1,3,5-8    # 指定页
node <本skill目录>/scripts/verify/capture.mjs <deck目录> --browser "C:\...\msedge.exe"
node <本skill目录>/scripts/verify/capture.mjs <deck目录> --width 1600 --height 900 --budget 2000 --allow-webgl
```

- 浏览器发现顺序（Windows）：注册表 App Paths（msedge/chrome）→ Program Files → LOCALAPPDATA → PATH；macOS/Linux 有对应候选。Edge 是 Windows 预装，**任何机器开箱即用**
- 产物 `verify-output/pages/NN.png`（默认 1920×1080，headless Chrome CLI，零 npm 依赖）
- **确定性截图**：默认加 `--force-prefers-reduced-motion`，deck 走低功耗静态揭示（内容全显、零动画）——截图不与动画时序竞态。调动画请实机浏览器看，不要依赖截图
- 默认禁 WebGL（`--allow-webgl` 开启）：shader 背景在软渲染下代价极高且非排版验收目标
- `--budget` 虚拟时间预算保持默认 2000 即可；≥6000 会因"虚拟时间×rAF 帧数"在软渲染下拖到分钟级
- **主题画廊 `--gallery`**：按 deck 风格遍历 `themes.csv` 全部主题，逐套 应用→重建→连拍（1600×900），结束自动恢复原主题；产物 `verify-output/gallery/<slug>/`
- `--force-build` 强制重新构建（默认 dist 比 src 新就跳过）
- 实现注记：必须用**异步 spawn**——Windows 上 spawnSync 的同步管道会让 Edge/Chrome 无限期挂住（实测全 ETIMEDOUT）

## 推荐流程

```
npm run build && go build → 双击 exe 人眼过一遍
  → check-deck.mjs <deck> --render   # 结构 + 像素
  → capture.mjs <deck>               # 连拍留档/横向对比
  → 按"修复阶梯"改 → 重跑直到 0 error
```
