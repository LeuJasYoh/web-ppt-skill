---
name: web-ppt
description: 制作现代、带精美动效的网页版 PPT（Web PPT）：Vue 3 + Vite 前端、Go go:embed 静态服务器，构建为单个可离线双击运行的 exe。视觉系统移植自 guizang-ppt-skill，提供两种风格——风格 A「电子杂志 × 电子墨水」（衬线大标题 + WebGL 流体背景，5 套主题色）与风格 B「瑞士国际主义」（无衬线极致字号对比 + 点阵网格，4 套锚点色）。当用户提到 网页PPT、Web PPT、网页幻灯片、演示网页、幻灯片网站、杂志风 PPT、瑞士风 PPT、Swiss Style、slide deck、web presentation，或想要"比 PowerPoint 动效更强的演示"、"离线单文件演示程序" 时使用本 skill。
---

# Web PPT（Vue + Go 网页幻灯片）

制作横向翻页的网页版 PPT。前端 Vue 3 + Vite（视觉系统移植自 guizang-ppt-skill，两种风格），后端 Go `go:embed` 静态服务器，交付**单个离线可执行文件**：双击 → 本地服务（127.0.0.1 随机端口）→ 自动打开浏览器。演示设备无需任何运行时。

**相对原项目的改进**：Motion 动效与全部字体经 npm 打包内嵌——原版"离线时动效/字体降级"的缺陷在本方案中不存在，离线即全保真。

## 两种风格（一份 deck 只能选一种，不可混用）

| | 风格 A · 电子杂志 | 风格 B · 瑞士国际主义 |
|---|---|---|
| 气质 | Monocle 杂志感、叙事、人文 | Helvetica Forever、信息驱动、数据 |
| 字体 | 衬线标题（Noto Serif SC / Playfair）+ 等宽元数据 | 全程无衬线（Inter / Noto Sans SC），字号越大字重越轻（200） |
| 背景 | WebGL 双背景：暗页全息色散 / 亮页银色涡流 | canvas 模式默认；可开 WebGL 极细网格 + accent 偷渡 |
| 主题色 | 5 套（references/themes.md） | 4 套锚点色（references/themes-swiss.md） |
| 布局 | 10 种（references/layouts.md） | 22 种锁定版式 S01-S22（references/layouts-swiss.md + swiss-layout-lock.md） |
| 动效 | 5 种 recipe：cascade/hero/quote/directional/pipeline | 21 种语义 recipe：measure-up/bar-grow/duo-mirror/timeline-walk… |

**选型**：叙事/观点/人文/行业观察 → A；数据/产品/方法论/技术汇报 → B。用户没说就按内容定并告知用户你的选择。

## 架构

- 所有页常驻 DOM 的**横向条带**（`#deck` = N×100vw，translateX 翻页，0.9s 过渡）——这是分步（pipeline）和 ESC 克隆总览的基础
- 每页 = 一个 Vue 组件 `src/slides/SlideXxx.vue`，`<template>` 里直接用参考文档的布局骨架（class / data-anim / data-animate 原样保留）
- 动效 = Motion One（npm `motion`，离线可用）：页面 `<section data-animate="recipe">` 选 recipe，元素 `data-anim` 标记进场
- 字体 = @fontsource 自托管（构建期内嵌，离线 100% 保真，代价是 exe 约 20-35MB）
- 图标 = Lucide（npm），`<i data-lucide="name"></i>` 自动物化为 SVG

## 工作流程

### 1. 需求澄清
风格 A/B → 受众/场合 → 页数（15 分钟 ≈ 10 页，30 分钟 ≈ 20 页）→ 有无素材/图片 → 主题色（A 五选一 / B 四选一，**不接受自定义 hex**）→ 硬约束。风格没指定时按选型表自行决定并说明理由，不要抛回开放问题。

### 2. 搭脚手架
复制本 skill 的 `assets/scaffold/` 到目标目录，`npm install`（网络不畅加 `--registry=https://registry.npmmirror.com`）。

### 3. 选风格（改 4 处，见 src/style.js 顶部注释）
1. `src/style.js` 的 `STYLE`
2. `src/main.js` 的样式导入（magazine.css / swiss.css 二选一）
3. `src/slides/index.js` 的示例页导入
4. `index.html` 背景色（magazine `#0a0a0b` / swiss `#fafaf8`）与 `<title>`

### 4. 选主题色
- A → 读 `references/themes.md`，替换 `src/styles/magazine.css` 顶部 `:root` 的"主题色"段（6 个变量）
- B → 读 `references/themes-swiss.md`，替换 `src/styles/swiss.css` 顶部 `:root` 的"主题色"段（11 个变量）
- 其他 CSS 全走 `var(--...)`，不要到处改色

### 5. 写页面（核心）
1. **先读对应 layouts 文档**：A → `layouts.md`；B → `swiss-layout-lock.md`（版式锁，必读）+ `layouts-swiss.md`
2. 布局骨架是纯 HTML：粘进 `SlideXxx.vue` 的 `<template>`，改文案即可；**不要发明模板外的类名**，自定义用 `style="..."` 内联
3. 动效标记：进场的元素加 `data-anim`；页面级 recipe 加 `<section data-animate="...">`（写法参考脚手架示例页）
4. 图片放 `public/images/`（命名 `{页号}-{语义}.{ext}`，如 `01-cover.jpg`），骨架里 `src="images/01-cover.jpg"` 直接可用
5. `npm run dev` 实时预览
6. **主题节奏（A 必做）**：每页 section 必须带 `light`/`dark`/`hero light`/`hero dark` 之一；连续 3 页同主题不允许；每 3-4 页一个 hero 页。生成后 grep 自检

### 6. 构建交付
```
npm run build
go build -ldflags "-s -w" -o 演示名称.exe .
```
细节与交叉编译见 `references/golang-server.md`。

### 7. 验证（交付前必做）
双击 exe 逐页检查，并完整走一遍：
- `← → ↑ ↓ / Space / PgUp PgDn` 翻页、`Home/End` 首末页
- `ESC` 总览宫格（点缩略图跳页）
- `B` 低功耗静态模式切换（WebGL/动效停、内容全显）
- pipeline 页（A）按 `→` 分步推进
- 无控制台报错、文字不溢出、图片不压分页组件

无界面环境：`./xxx.exe -no-browser -addr 127.0.0.1:18080` + `curl` 探活（期望 200）。

## 风格 B 硬规则（违反即失去瑞士感）

1. 全程无衬线；一份 deck 只有一个 accent 色，不许多色高亮
2. 直角纯色：禁止渐变/阴影/圆角（rule 横线除外）；hairline 分割用 1px
3. 极致字号对比：主标题与正文 ≥ 8:1；大字字重 200（越大越细），小字 500-600（越小越粗）
4. 中文大标题先分档（≤8 字 6.4vw 档位表见 SKILL 原则/layouts-swiss.md），不要直接套英文 hero 字号
5. 正文页只能用登记过的 S01-S22 版式，每页写 `data-layout="Sxx"`；不发明新结构
6. 卡片三类 token 互斥（card-fill/card-ink/card-accent），多卡并列统一样式，最多一张 accent 突出；白底描边框不属于 token，用内联 1px 边框实现且不与 token 混排
7. 演示最小字号：正文 ≥18px、卡片描述 ≥16px、meta ≥14px；放不下就删文案/拆页/换版式
8. 图标用 Lucide 棱角风格，不手画 SVG 圆点；装饰点阵/矩阵严格在 grid 内
9. Windows 雅黑无 200 字重，`is-win` 类会自动补偿 300——不要手动写死 font-weight:200 内联

## 风格 A 硬规则（违反即失去杂志感）

1. 大标题必须衬线（h-hero/h-xl 走 --serif-zh）；正文非衬线；元数据等宽
2. 不用阴影、不用浮动卡片；层级靠字号 + 字体对比 + 网格留白
3. WebGL 背景只在 hero 页透出（遮罩已预设），普通页几乎看不见
4. 图片只用标准比例（16:10/4:3/3:2/1:1/16:9），网格图用 `h-22/h-26` 固定高度，禁 `align-self:end`
5. 中文大标题 ≤ 5 字且 nowrap；chrome（栏目标签，跨页稳定）与 kicker（本页钩子，每页不同）不要写同一句话
6. 用 Lucide，不用 emoji

## 技术红线

- `go:embed` 是**编译期**嵌入：每次改完前端必须 `npm run build` + `go build`，旧 exe 不热更新（调试期可 `go run . -dir dist`）
- 两套风格 CSS 类名冲突（.h-hero 等同名不同义），**严禁同时导入** magazine.css 和 swiss.css
- 不要新增 npm 依赖（motion/lucide/字体已备齐）；不要引入 vue-router/pinia/UI 库
- 瑞士风 canvas-mode（默认）下没有 WebGL；要去掉 `style.js` 里 `canvasMode: true` 才启用网格背景
- 交付物 exe 未签名，Windows SmartScreen 首次运行会提示——提前告知用户"更多信息→仍要运行"

## 何时读哪个参考文件

| 文件 | 何时读 |
|---|---|
| `references/themes.md` / `themes-swiss.md` | 选主题色时（只选不自定义） |
| `references/layouts.md` | 风格 A 写每页前**必读**（10 布局骨架 + Pre-flight 类名清单 + 图片规范 + 主题节奏） |
| `references/swiss-layout-lock.md` → `layouts-swiss.md` | 风格 B 写每页前**必读**（22 版式锁 + 骨架 + 字号分档） |
| `references/components.md` | 查组件细节（字体/色/网格/图标/callout/stat/pipeline/动效） |
| `references/checklist.md` | 交付前逐项自检（P0 级必须全过） |
| `references/golang-server.md` | 构建与交付阶段 |

## 交付物

1. `演示名称.exe`——拷到任意设备双击即演
2. 操作说明：`→`/`空格` 翻页，`←` 回退，`ESC` 总览，`B` 静态模式，`Home/End` 首末页；URL 加 `?slide=N` 直达第 N 页
3. （可选）源码目录
