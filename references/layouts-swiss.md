<!-- Vue 版适配说明：
1. 下文的布局骨架是纯 HTML，直接粘贴进 src/slides/SlideXxx.vue 的 <template> 里即可，
   class / data-anim / data-animate 原样保留（动效引擎查询真实 DOM，与框架无关）。
2. 图片放 public/images/（命名 {页号}-{语义}.{ext}），骨架里 src="images/01-cover.jpg" 原样可用。
3. 每页组件在 src/slides/index.js 按顺序注册；用到 ASCII 呼吸场的页在 <script setup> 里
   import AsciiField from '../components/AsciiField.vue'（仅 S01 / S10）。
4. 本 skill 未移植演讲者模式与校验脚本，自检一律用文中的 grep/目测方式。
-->

# Layouts · 风格 B 瑞士国际主义

22 个登记版式 · 严格模块化网格 · 每个版式说明用途、骨架、关键类名、专属动效。

> ⚠️ 这套版式与风格 A(电子杂志/电子墨水)**不通用**。类名同名但语义不同(例如 `h-hero` 在风格 A 是衬线,在风格 B 是无衬线极细 200)。一份 deck 只能选一套。

> 📌 **类名真源**：本文档所有骨架只用两类来源的类名——① `src/styles/swiss.css` 中真实定义的选择器；② `src/composables/recipesSwiss.js` 查询的动效挂点类(如 `.cover-row` / `.ledger-row`，它们没有 CSS 样式，只作为动效锚点，布局靠骨架自带的 inline style)。**不要再引用其他来源的类名**；需要微调时写 inline style，不要发明新类。

---

## Swiss locked mode(必须先读)

本主题的 golden source 是仓库内的 `src/styles/swiss.css`(由原 guizang-ppt-skill 的 template-swiss.html 派生;原始参考 PPT 不随仓库分发,`swiss-layout-lock.md` 登记的 S01-S22 即其版式快照)。

生成正文页时不要把 Swiss 当成“自由组合的风格包”。默认只能使用 `references/swiss-layout-lock.md` 登记的 `S01-S22`。每个 slide 都必须在 `<section>` 上写 `data-layout="Sxx"`。

**关键约束**:

- 顶部中文标题默认左对齐并处在左上内容轴;不要把标题放到页面中间。
- 不允许临时发明原始 22P 之外的正文结构。本文档末尾的 P23/P24 属于历史实验区,默认禁用。
- 需要单张大图时使用 `S22 Image Hero`;需要多图时用 `S15/S16` 的原始矩阵/小报骨架改造成图片格。
- 地图/点位类内容:本 skill **未移植** MapLibre 地图组件,也不要自行引入(技术红线:不新增依赖)。地点关系用 `S08 Duo Compare` 文字对照或 `S11 Horizontal Timeline` 承载。
- SVG 只画几何线条、圆、箭头、路径;**除环心/圆心的 1-2 个极短居中大字外**(S14/S17 的 recipe 会点亮它们),不要在 SVG 里写可见文字,标签一律用 HTML。

**生成后自检(grep 目标是 src/slides/ 目录,不是 index.html)**:

```bash
grep -L 'data-layout="S' src/slides/*.vue        # 输出为空 = 每页都登记了版式
grep -o 'data-layout="S[0-9]*"' src/slides/*.vue  # 逐页核对 Sxx 与实际结构一致
```

---

## 设计语言基线

**配色**(`--accent` 由主题决定,见 `themes-swiss.md`)
- `--paper` 纸白底 #fafaf8(主背景,canvas-mode 下卡片即页面)
- `--ink` 黑墨字 #0a0a0a(主文字 / Ink 反转块)
- `--accent` 单色锚点(IKB 蓝默认 / 黄 / 绿 / 橙 四套)
- `--text-primary / secondary / helper` 三级文字灰阶
- `--border-subtle` 1px 发丝细线 #e0e0e0

**排版**
- 字体:`var(--sans)` Inter / Helvetica Neue + `var(--sans-zh)` + `var(--mono)` JetBrains Mono(全部 @fontsource npm 内嵌,离线可用)
- 字重:**200 (ExtraLight) 大字** / **300 (Light) 正文** / **600 (SemiBold) t-cat 小标**
- 大标题保持轻字重:主标题 `font-weight:200`,重点词/数字 `font-weight:300`;不要把 Swiss 大标题加粗到 800/900
- 大字号收紧:`letter-spacing:-.04em` / `line-height:.9`
- mono 数字:`font-feature-settings:"tnum","ss01"`

**中文大标题字号分档**
中文方块字的视觉面积比英文更重,不能直接套英文页的 `6.8vw-7vw`。生成前先按中文标题长度降级:

| 中文标题形态 | 推荐字号 |
|---|---|
| 1 行,≤ 8 个中文字符 | `min(6.4vw,11.2vh)` |
| 2 行,每行≤ 8 个中文字符 | `min(5.8vw,10.2vh)` |
| 2 行,任一行 9-12 个中文字符 | `min(5.2vw,9.2vh)` |
| 3 行或更长标题 | 改写标题;实在不能改时用 `min(4.6vw,8.2vh)` |

规则:中文标题优先改短,其次降字号;不要让标题挤占下方图文区域。英文、数字型 hero 可以更大,中文方法论页必须更克制。

**演示最小字号与字重阶梯**
瑞士风不是网页说明页,投屏时不能出现 10-12px 的注释字。默认下限:

| 文本类型 | 最小字号 |
|---|---|
| 正文段落 / 主要说明 | `18px` |
| 卡片描述 / 列表 / 时间线说明 / caption / 图注 | `16px` |
| meta / kicker / mono label / 图表标签 | `14px` |

内容过多时,先压缩文案、拆页或更换 Sxx 版式;禁止靠降低小字字号解决拥挤。图注、时间线说明、KPI 注释、底部 note 尤其要守住这个下限。

**字号与字重阶梯(瑞士风核心)** — "越大越细,越小越粗"不是感性描述:

| 字号区间 | 推荐字重 | 典型场景 |
|---|---|---|
| ≥ 8vw | 200 (ExtraLight) | 封面大字、巨号 KPI、statement 巨字 |
| 4-7.9vw | 200-300 | 章节标题(h-xl/h-xl-zh)、大编号 |
| 1.8-3.9vw | 300-400 | 中型标题、takeaway 标题(≈1.8vw)、中号数字 |
| 1-1.7vw / 16-20px | 400-500 | 正文段落、卡片描述、说明文字 |
| 13-15px(小字) | 500-600 | meta、kicker、角标、图表标签、caption 强调 |

**硬规则:**
- 同一页内,字号越小的元素字重必须 ≥ 字号越大的元素(不允许 16px 正文用 300 而 1.8vw 标题用 500)
- 16px 左右的小字拒绝使用 weight 300(太细不可读),最低 400,推荐 500
- 封面/IKB 反白大标题内强调字用 `italic + weight 300`,不要用 accent 色(蓝压蓝看不见)
- Windows 雅黑没有 200 字重,`is-win` 类会自动补偿为 300——**不要手写死 `font-weight:200` 的 inline**(CSS 有 `[style*="font-weight:200"]` 全局覆盖,写 200 会被强制提亮,优先用类或去掉 inline 字重)

**网格**(IBM Carbon 2x Grid 改造)
- 12 列 grid:`.grid-12` + `.span-2` … `.span-12`
- 经典分栏:`.grid-2-7-5`(7:5) / `.grid-2-6-6`(1:1) / `.grid-2-8-4`(8:4) / `.grid-2-4-8`(4:8) / `.grid-3`(三均分) / `.grid-3-3`(3×2) / `.grid-4`(2×2) / `.grid-6`(3×2)
- spacing token:`--sp-3` 8 / `--sp-4` 12 / `--sp-5` 16 / `--sp-6` 24 / `--sp-7` 32 / `--sp-8` 40 / `--sp-9` 48 / `--sp-10` 64 / `--sp-11` 80 / `--sp-12` 96 / `--sp-13` 160

**画布**
- 默认 canvas mode(见 `src/style.js` 的 `canvasMode:true`):无 WebGL,`.canvas-card` 即页面,`padding:5.6vh 5vw 4.4vh`
- 必须保留右下角 `B 静态` 快捷键。低功耗模式使用 `body.low-power`,停止 ASCII canvas RAF 与 Motion 入场动画,刷新后通过 `localStorage` 保持用户选择
- 如需 WebGL 极细网格背景(鼠标附近偷渡一抹 accent),把 `src/style.js` 里 swiss 的 `canvasMode` 改为 `false`——默认不要动

---

### P0 对齐法则(每生成一页都先过这 4 条,违反 = 整页报废)

**1. 不要二次叠加水平 padding** ⚠️ 最常踩
`.canvas-card` 已自带 `padding:5.6vh 5vw 4.4vh`。
chrome-min(页眉)、主体内容、底部 footnote 都是 canvas-card 的子元素,**共用同一条 5vw 边线**。
如果在主体那层再写 `padding:5vh 5vw 4vh`,水平方向就变成 `5vw + 5vw = 10vw`,主体比 chrome-min 多内缩一圈,左右对不齐。

```html
<!-- ❌ 错:主体多缩了 5vw -->
<div class="canvas-card">
  <div class="chrome-min">...</div>
  <div style="flex:1;padding:5vh 5vw 4vh;...">主体内容</div>
</div>

<!-- ✅ 对:主体 padding 为 0,只用 grid gap 控垂直间距 -->
<div class="canvas-card">
  <div class="chrome-min">...</div>
  <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:3vh">主体内容</div>
</div>
```

例外:`.slide.split .canvas-card{padding:0}` 已被 CSS 覆盖,split 模式下两个 `.half` 自己控制 padding(常用 `5.6vh 3.6vw 4.4vh`),与本法则不冲突。通栏 ink 条(S12)用负 margin `margin:0 -5vw -4.4vh` 取消父级 padding,也属合法例外。

**2. kicker 必须在大标题"上方",不要压成左右**
小标题(`.t-meta` / `.t-cat`)与大标题之间是从属关系,版式上必须**上下结构**。

```html
<!-- ❌ 错:auto 1fr 把 kicker 和大标题挤成左右两列 -->
<div data-anim="line" style="display:grid;grid-template-columns:auto 1fr;gap:3vw;align-items:end">
  <div class="t-meta">METHODOLOGY · 03</div>
  <h2 class="h-xl-zh">为什么是 N+1</h2>
</div>

<!-- ✅ 对:flex column 上下叠 -->
<div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
  <div class="t-meta">METHODOLOGY · 03</div>
  <h2 class="h-xl-zh">为什么是 N+1</h2>
</div>
```

例外:head 一行同时承载"左:kicker+大标题(自己上下叠)"和"右:小注脚",外层可以用 `display:grid;grid-template-columns:1fr auto`,但**内层**仍要保持 flex column。

**3. 双约束限高 `min(Xvw, Yvh)` 中 Y ≥ X × 1.6**
标准 16:9 屏 1vw : 1vh ≈ 1.78,如果 Y 太严(例如 `min(7vw, 10vh)`),大字号会被高度上限截断到 10vh,不再受 7vw 主导,显得整体缩小。
经验数值:

| 用途 | 推荐 |
|---|---|
| h-hero 巨字宣言 | `min(11.6vw, 19vh)` |
| h-xl 章节标题 | `min(7vw, 12vh)` ~ `min(7.4vw, 13vh)` |
| 大数字 KPI | `min(8.4vw, 14vh)` |
| 中数字 / 编号 | `min(4.6vw, 8.5vh)` ~ `min(5.6vw, 10vh)` |

**4. canvas-card 子元素之间用 grid `gap`,不要靠 margin/padding 堆**
`.canvas-card` 默认 `display:flex;flex-direction:column`,chrome-min 自带 `margin-bottom:48px`(`--sp-9`;`chrome-min tight` 是 32px)。
主体区往下排几行(head / 内容 / footnote),**首选** `display:grid;grid-template-rows:...;gap:Nvh`,**次选** flex column + gap,**禁用** 在每个子块里加 `margin-top` / `padding-top` 调间距(会和 chrome-min 的 margin-bottom 重叠或撕裂)。

**5. 底部分页安全区:主内容最低处不要触及 nav**
底部分页 dot 固定在 `bottom:2vh`,视觉上占据约 `93vh` 之后的区域。主内容、图片 caption、图表说明、timeline label 的最低处必须停在安全区上方。

- 模板提供 `--nav-safe-bottom:8vh`,可用 `.nav-safe-bottom` / `.nav-safe-bottom-tight`
- 如果为某页手写 `align-items:end` / `margin-top:auto` / `position:absolute;bottom:...`,必须肉眼检查最低处是否越过 nav
- 视觉自检:打开页面到该页,确认内容最低边缘与分页 dot 之间至少有 `3vh` 呼吸空间

---

**卡片 token(必须遵守)**
| 类型 | 类名 | 角色 | 用法 |
|---|---|---|---|
| Ink 黑底 | `.card-ink` | 反转 / 宣言 | hero 块、收束页一半 |
| Accent 填充 | `.card-accent` | 唯一焦点 | 一组中突出一项 |
| Grey 灰底 | `.card-fill` | 默认中性 | 多卡并列、统计卡 |

- 三类 token 互斥,**禁止混用**(蓝底+描边、灰底+描边等);同组多卡统一样式,最多一张 `.card-accent`
- 灰底微卡也常用 `.sub-card`(自带灰底 + padding + 编号/图标/标题/描述的子结构,见 S04)
- 需要白底描边"锚点框"时不属于任何 token,用 inline `border:1px solid var(--grey-2);background:var(--paper)` 实现,且不要与上面三类混排在同一组

**装饰极简原则**
- 1px hairline 分隔(`.rule` / `border-bottom`)
- 8×8 / 12×12 直角小方块替代圆点(`.geo-square` / `.geo-dot`)
- 点阵 `.dot-mat`(.lg/.xl/.dense) / 描边圆 `.ring-mat`(.lg) / 叉 `.cross-mat`(.lg) / 斜杠 `.hatch` —— 装饰矩阵严格在 grid 内,不贴边出血(S09 的角落点阵除外,那是登记版式的一部分)

**图片使用原则**
- 图片是网格中的"证据块",不是装饰背景;必须有明确功能:案例、实拍证据、UI 截图、系统图、概念信息图
- 所有图片容器保持直角、无阴影、无圆角;容器用 `.frame-img`(比例类 `.r-16x9/.r-21x9/.r-16x10/.r-4x3/.r-3x2/.r-3x4/.r-1x1`,高度类 `.h-16/.h-18/.h-22/.h-26/.h-28/.h-32`)
- 白底信息图 / 流程图 / UI 图:加 `.fit-contain`,容器背景是 `var(--paper)`,不要用灰底包白图
- 只有当图片本身边缘无法和页面区分时,才加 `.swiss-lined`(顶部 accent 线);不要给每张图都套边框
- 纪实照片 `object-fit:cover` 默认居中裁,人像/会议场景写 `object-position:center 35%` 或用 `.pos-face`,不要用 `top center` 截人脸;截图 UI 用 `.fit-contain` 保内容
- 瑞士风图片优先比例:S22 顶部横幅 `21:9`(`.frame-img.r-21x9`);S15/S16 多图格统一 `21:9` 或统一 `16:10`,同组必须同比例同高度
- 生成配图只保留核心图像本身,不要把页眉、页脚、标题、页码、角标、边框、署名画进图片里

**版式多样性硬规则**
Swiss 主题有 22 个登记版式,生成时要主动展示版式系统,不要把所有内容都做成 `head + 卡片网格`:

- 7-8 页 deck 至少使用 **6 个不同 S 编号版式**
- 不允许连续 3 页使用同一种主体结构(如三页连续 S19 / 普通卡片)
- 如果是"测试模板"或"我想看看效果",必须覆盖:封面、收尾、至少 1 个对比/时间线(S08/S11/S02)、至少 1 个结构图(S14/S17/S15)、至少 1 个图片版式(S22 或 S15/S16 图片格)
- 每页写代码前先列 `页码 → data-layout → 为什么选它 → 图片槽位`;生成后用上面的 grep 自检

**动效原则(每页一个语义化 recipe)**

`src/composables/recipesSwiss.js` 注册了 21 个 recipe。**recipe 的动效查询的是真实 DOM 结构**,骨架必须按下表给对挂点,否则该页静默退化为"内容直接出现":

| recipe(`data-animate`) | 动效挂点(recipe 查询的 DOM) |
|---|---|
| `hero` | `.chrome-min` 淡入 → 每个 `.cover-row` 逐行亮起 → 可选 `[data-anim="line"]` 最后淡入 |
| `progression` | `[data-anim="line"]` 先入 → `.tl-node` 依次点亮(其内 `.multi` scale 弹入)→ `.kpi-cell` 收尾 |
| `statement` | 两个 `.half` 错峰升起;无 `.half` 时 `[data-anim]` 元素依次入场 |
| `grid-reveal` | `[data-anim="line"]` 先入 → `.sub-card` 依次揭示 |
| `stack-build` | `[data-anim="line"]` 先入 → `.stack-block` 中→上→下包夹 |
| `measure-up` | `[data-anim="line"]` 先入 → `.bar-tower` 内 `.body-block` scaleY 生长 / `.cap` 弹入 |
| `bar-grow` | `[data-anim="line"]` 先入 → `.row-fill` 宽度生长 + `.row-lbl`/`.row-val` 滑入(可选 `[data-anim="up"]` 带 `.t-cat`/`.midline` 中线) |
| `duo-mirror` | `[data-anim="line"]` 先入 → `.duo-compare .col` 左右镜像入场 → `.vrule` scaleY 拉开 |
| `split-statement` | `.half` 淡入 → 左半 `.kpi-thin` 逐条升起 → 右半 `.takeaway-list li` 依次滑入 |
| `timeline-walk` | `[data-anim="line"]` 先入 → `.timeline-h` 内 `.th-node` 的 `.dot`/`.label` 沿轴点亮 |
| `manifesto` | `[data-anim="line"]`(`.t-cat` + 第 2 个子 div 大标题)→ `[data-anim="up"]` 通栏条升起 |
| `three-forces` | `[data-anim="up"]` 网格:第 1 子 div(ink hero)横移入 → 第 2 子 div 内 `.card-fill` 三卡滑入(卡内首子 div 巨编号 pop) |
| `loop-form` | `[data-anim="up"]`:第 1 子 div 内步骤 div 依次 → svg:首 circle 底环 → 其余 circle 节点 → `path[marker-end]` 箭头 → 末尾两个 `<text>` 中心字 |
| `matrix-fill` | `[data-anim="line"]` 先入 → 第 1 个 `[data-anim="up"]` 直接子元素按 6 列波扫 → 第 2 个 `[data-anim="up"]` 底注(其首子 div 的第 2 个子 div = 巨数) |
| `field-notes` | `[data-anim="line"]` 先入 → `[data-anim="up"]` 直接子元素 6 卡乱序入 |
| `system-diagram` | `[data-anim="line"]` 先入 → `[data-anim="up"]` 内 svg 圆圈同心 scale → 末子 div 的三列说明依次 |
| `why-now` | `[data-anim="line"]` 先入 → `[data-anim="up"]` 直接子元素 = 3 列(每列:非末子 div 正文 + 末子 div 巨数) |
| `four-cards` | `[data-anim="line"]` 首子 div(顶线)scaleX → 第 2 子 div 标题 → `[data-anim="up"]` 直接子元素 4 卡 |
| `stacked-ledger` | `[data-anim="ledger"]` 容器 → `.ledger-row` 逐行(行内 `.ledger-num`/`.ledger-label`/`.ledger-icon`) |
| `tech-spec` | `[data-anim="line"]` → `[data-anim="up"]`(首子 div 标题列,其余子 div = KPI 列:首子 div 顶线 + `.kpi-num`)→ `[data-anim="hero"]`(`.bottom-hero`)→ `[data-anim="bars"]` 内 `.vbar` 弹起 |
| `image-hero` | `[data-anim="img"]` 内 img 缓推 → `[data-anim="title-block"]` 白块推开 → `[data-anim="kpi"]`(首子 div 段落;第 2 子 div 的直接子 div = KPI 列,列首 div 顶线) |

- 缓动从 `:root` 的 Carbon motion token 读取(`--ease-prod` / `--ease-entry-exp`),CSS 是唯一事实源
- `playSwiss` 入口会先 reveal 所有 `[data-anim]` 容器到 opacity:1,recipe 再用 `{opacity:[0,1]}` 覆盖——所以 `[data-anim]` 只是占位标记时也不会白屏
- 没命中任何 recipe 名时走兜底:所有 `[data-anim]` 平凡 fade

---

## 视觉 + 代码双维审核(生成后必须做)

不要只看 HTML/CSS。Swiss 模板的还原度要同时从**浏览器视觉**和**代码结构**判断:

1. 同时打开两份:当前 `src/styles/swiss.css`(golden source)与正在写的页面;有条件时再加一份此前验收过的成品 deck 作对照。
2. 截图前先等入场动效稳定(约 1-2 秒)。不要把动画中间态误判成"内容缺失"或"版式空白"。
3. 先看视觉:标题重量、头部距离、图片落位、底部安全区、caption 是否被 nav 挡住。
4. 对照本文件登记版式的同类页,不要只对照 CSS helper;以实际页面结构和视觉结果为准。
5. 再回到代码,检查该页是否误用了不属于该版式的组件,或把数据版式用于没有真实数值的概念列表。
6. 若视觉不一致,优先判断是**版式选择错**、**必选组件缺失**、**可选组件滥用**还是**间距/安全区问题**,不要直接靠调 `margin` 硬救。
7. 修改模板时,新增能力必须用新类隔离;不要因为一页出问题去改全局基座类。

### 原始 PPT 视觉锚点(对照时优先看这些)

| 视觉锚点 | 原始 PPT 的实际做法 | 生成时的规则 |
|---|---|---|
| 大标题重量 | 实际页面大量使用 `font-weight:200/300`;即使 raw CSS helper 里有 700/800,也不能直接当视觉标准 | 大标题保持轻字重,字号越大越细 |
| 留白 | 页面经常只占上半屏或中部,底部留给 nav 和少量 footnote | 不要为了"填满"而把内容推到底 |
| 分割线 | 只在章节边界、证据墙、卡片层级处使用 1px hairline | 不要给每个内容块都加线 |
| 标题与内容 | 标题区和正文/图表之间有明显空气感 | 复杂页用 grid `gap`,不要让内容贴着标题 |
| Timeline | 轴线在中下部,但 label 不碰底部 nav | 横向 timeline 必须同时检查上下 label 和 nav 安全区 |
| 图片页 | 图片是证据块,要么做 S22 主视觉,要么放进 S15/S16 原始网格 | 不要使用未登记图文结构 |

### 组件必选 / 可选 / 可省略

| 组件 | 规则 |
|---|---|
| `.canvas-card` / `.chrome-min` | 基础页必选;split 页左右 half 各自有 chrome-min |
| `t-meta` / `t-cat` kicker | head 区必选,但正文卡片内可省略;必须在大标题上方 |
| 大标题 | 章节/论点页必选;列表型小卡页可以用较小标题,但不能缺页级信息锚点 |
| `lead` 说明 | 可选;如果标题已经解释清楚,可以省略,但不能用长段正文贴着标题 |
| 图片 caption | S15/S16 多图格必选;S22 大图可选,因为图已经是主视觉且下方有 KPI/说明 |
| 发丝线 / border-bottom | 可选;只能用于建立层级,不能为了装饰堆线 |
| KPI / 数字 | 只在有真实数据时使用;不要为概念解释编造数值 |
| `footnote` / 底部说明 | 可选;如果使用,必须避开 nav 安全区 |

### 通用版式 / 非通用版式

| 类型 | 版式 | 使用边界 |
|---|---|---|
| 通用 | S01, S03, S08, S09, S10, S11, S19 | 大多数叙事 deck 都能用,但仍要满足内容形状 |
| 条件通用 | S04, S05, S13, S16 | 取决于数量是否刚好匹配:3/4/6 项 |
| 数据专用 | S02, S06, S07, S18, S20, S21, S22 | 必须有真实时间、数值、指标或案例数据 |
| 结构专用 | S14, S15, S17 | 必须有闭环、矩阵、层级/生态关系;不适合普通段落 |

---

## 22 个登记版式

> 通用页面骨架:`<section class="slide" data-layout="Sxx" data-animate="recipe名">` 内放 `.canvas-card`,第一行 `.chrome-min`(左 `l` 栏目 / 右 `r` 页码),随后 head 区(`data-anim="line"` 包住 `.t-meta` + `.h-xl-zh`,上下叠)。骨架里 `[必填]` 换成实际文案;`NN` 换成实际页数。

### S01 · Cover · 封面页

**用途**:整套 deck 起手 / 主题宣言。**纯文字结构**(主标题 + 副标 + 元信息),不承载数据。
**适用内容类型**:封面 / 章节首页 / 主题宣言。
**动效 recipe**:`hero` —— `.cover-row` 点名式逐行亮起。

**默认推荐:IKB 满屏 + ASCII 呼吸场** ⭐

```html
<section class="slide accent" data-layout="S01" data-animate="hero">
  <div class="canvas-card">
    <AsciiField />
    <div class="chrome-min">
      <div class="l">[必填] Deck 标题 · Issue/Field Note 编号</div>
      <div class="r">SS · YY.MM.DD · 01 / NN</div>
    </div>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:2.6vh">
      <div class="cover-row">
        <div class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em">[必填] 章节英文 / Section En</div>
      </div>
      <h1 class="cover-row" style="align-self:center;font-weight:200;font-size:min(11.6vw,19vh);line-height:.94;letter-spacing:-.025em;color:#fff">[必填] 中文主标题<br/>(可在某字加 <span style="font-style:italic;font-weight:300">italic</span> 微强调)</h1>
      <div data-anim="line" style="display:grid;grid-template-rows:auto auto;gap:1.6vh;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh">
        <div class="lead" style="max-width:52ch;color:rgba(255,255,255,.86);font-weight:300">[必填] 一段 1-2 行的副标 / 引子,定调全场.</div>
        <div style="display:flex;justify-content:space-between;align-items:end">
          <div class="t-meta" style="color:rgba(255,255,255,.6)">[选填] 作者 · 日期 · 出处</div>
          <div class="t-meta" style="color:rgba(255,255,255,.6)">→ swipe / arrow keys</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

**索引目录变体(左大编号 + 右大标题,`num-mega`/`name-mega` 越大越细)**:

```html
<section class="slide accent" data-layout="S01" data-animate="hero">
  <div class="canvas-card">
    <AsciiField />
    <div class="chrome-min">
      <div class="l">[必填] Deck 标题</div>
      <div class="r">01 / NN</div>
    </div>
    <div style="flex:1;padding:0;display:flex;flex-direction:column;justify-content:flex-end;gap:2.4vh">
      <div class="cover-row" style="display:flex;align-items:baseline;gap:2.4vw">
        <div class="num-mega">01</div>
        <div class="name-mega">[必填] 主标题</div>
      </div>
      <div class="cover-row" style="display:flex;align-items:baseline;gap:2.4vw">
        <div class="num-mega" style="opacity:.4">02</div>
        <div class="name-mega muted">[必填] 副标题:一句话说清主题</div>
      </div>
      <div class="cover-row" style="margin-top:3vh">
        <div class="t-meta" style="color:rgba(255,255,255,.7)">[选填] 演讲人 · 日期 · Venue</div>
      </div>
    </div>
  </div>
</section>
```

**要点**:
- 封面强制 `slide accent` 满屏 IKB,不要白底;`AsciiField` 必须是 canvas-card 内**第一个子元素**
- 主标题反白 weight 200;微强调字用斜体(`font-style:italic;font-weight:300`),**禁止**用 `color:var(--accent)`——IKB 蓝压 IKB 蓝看不见
- **不要再放编号大字"01"**——`chrome-min` 已显示 01/NN,索引变体除外(那里编号是目录结构的一部分)
- 与 S10 收尾的半屏 IKB 形成"开场全 IKB ↔ 收尾半 IKB"色彩闭环

---

### S02 · Vertical Timeline + KPI · 纵向时间轴

**用途**:演化对比、年代变迁、版本迭代(2-5 个时间节点)。
**适用内容类型**:**带量化数据的时间演化**。每节点「年份 + 量化数值 + 描述」三件套。只有节点名没有数据时,改用 S11 横向时间线。
**动效 recipe**:`progression` —— 节点按时间顺序点亮,`.multi` 弹入,`.kpi-cell` 收尾。

```html
<section class="slide" data-layout="S02" data-animate="progression">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">02 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
      <div class="t-meta">[必填] EN LABEL</div>
      <h2 class="h-xl-zh">[必填] 中文标题(≤ 8 字)</h2>
    </div>
    <div class="timeline-v" style="margin-top:3.6vh">
      <div class="tl-node">
        <div class="dot"></div>
        <div class="yr">2023</div>
        <div class="multi">1<span class="unit">×</span></div>
        <p class="desc">[必填] 一行描述</p>
      </div>
      <div class="tl-node accent">
        <div class="dot"></div>
        <div class="yr">2026</div>
        <div class="multi">100<span class="unit">%</span></div>
        <p class="desc">[必填] 一行描述(关键节点加 .accent)</p>
      </div>
      <!-- 2-5 个 tl-node -->
    </div>
    <div class="kpi-row-4" style="margin-top:auto">
      <div class="kpi-cell"><div class="lbl">Label</div><div class="nb">00</div></div>
      <div class="kpi-cell"><div class="lbl">Label</div><div class="nb">00<span class="unit">%</span></div><div class="note">[选填] 注</div></div>
      <!-- 4 个 kpi-cell -->
    </div>
  </div>
</section>
```

**要点**:`.tl-node` 是 4 列 grid(axis 24px / 年份 / 倍数 / 描述),不要自己调整列宽;`timeline-v` 的虚线轴与 dot 对齐由 CSS 保证,**不要**给 dot 手写定位。

---

### S03 · Split Statement · 双半屏陈述

**用途**:中心论点、章节起始、立场宣言。左巨字 + 右灰底解释。
**适用内容类型**:**纯定性论断**。一句话压缩到 8-12 词,不承载数据或列表。
**动效 recipe**:`statement` —— 两个 `.half` 错峰升起。

```html
<section class="slide split" data-layout="S03" data-animate="statement">
  <div class="canvas-card">
    <div class="split-half">
      <div class="half" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between">
        <div class="chrome-min" style="margin-bottom:0"><div class="l">03 / NN</div><div class="r">STATEMENT</div></div>
        <h1 style="font-weight:200;font-size:min(8.4vw,14vh);line-height:.96;letter-spacing:-.03em">[必填] 一句立场<br/>两行以内,<span style="font-style:italic;font-weight:300">强调</span>用斜体</h1>
        <div class="t-meta">[选填] 注脚</div>
      </div>
      <div class="half b-grey r-border" style="padding:5.6vh 3.6vw 4.4vh;justify-content:center;gap:2.4vh">
        <div class="t-cat">WHY</div>
        <p class="t-body">[必填] 2-4 行解释:这个立场为什么成立.</p>
        <p class="t-body-sm">[选填] 补充说明或出处.</p>
      </div>
    </div>
  </div>
</section>
```

**要点**:split 模式下 `.canvas-card` padding 为 0,两个 `.half` 自己控制 padding(`5.6vh 3.6vw 4.4vh`);右半底色用 `.b-grey`(或 `.b-ink` 反转),加 `.r-border` 发丝线。

---

### S04 · Six Cells · 六格定义

**用途**:6 个并列概念定义、6 项功能并列。
**适用内容类型**:**6 个对等概念 / 功能列举**(数量必须 = 6,过少用 S05,过多用 S15/S16)。每格「图标 + 编号 + 短标题 + 一行描述」。
**动效 recipe**:`grid-reveal` —— `.sub-card` 依次揭示。

```html
<section class="slide" data-layout="S04" data-animate="grid-reveal">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">04 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
      <div class="t-meta">[必填] EN LABEL</div>
      <h2 class="h-xl-zh">[必填] 中文标题</h2>
    </div>
    <div class="sub-grid-3-2">
      <div class="sub-card">
        <span class="nb-corner">01</span>
        <i data-lucide="layout-grid"></i>
        <div class="ttl">[必填] 短标题</div>
        <div class="desc">[必填] 一行描述</div>
      </div>
      <!-- 6 张 sub-card;需要突出一张时改 class="sub-card accent" -->
    </div>
  </div>
</section>
```

**要点**:**不要自己画 SVG 图标**,用 `<i data-lucide="...">`(npm 内置,自动物化);`sub-card` 的图标/编号位置已由 CSS 固定。

---

### S05 · Three Layers · 三层结构

**用途**:三层架构、三段堆叠(栈层 / 分层架构 / 三阶段)。
**适用内容类型**:**恰好 3 层 / 3 块**,每块「编号 + 图标 + 标题 + 描述 + 标签」。
**动效 recipe**:`stack-build` —— **中间块先入**,上下包夹;把最重要的一层放中间。

```html
<section class="slide" data-layout="S05" data-animate="stack-build">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">05 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
      <div class="t-meta">[必填] EN LABEL</div>
      <h2 class="h-xl-zh">[必填] 中文标题</h2>
    </div>
    <div class="stack-row">
      <div class="stack-block b-grey">
        <div class="layer-nb">LAYER 01</div>
        <i data-lucide="globe"></i>
        <div class="layer-ttl">[必填] 层名</div>
        <div class="layer-desc">[必填] 1-2 行职责</div>
        <div class="layer-tag">[选填] TECH · TAG</div>
      </div>
      <div class="stack-block b-accent">
        <!-- 同结构;核心层用 .b-accent(或 .b-ink),其余 .b-grey -->
      </div>
      <div class="stack-block b-grey"><!-- 同结构 --></div>
    </div>
  </div>
</section>
```

---

### S06 · KPI Tower · 不等高柱状 KPI

**用途**:4 项数据用视觉高度表达层级差异。
**适用内容类型**:**4 项可比量化数据**(必须有真实数值,塔高由数据决定)。**禁止**用于无数据的概念列举(那是 S04/S05)。
**动效 recipe**:`measure-up` —— `.body-block` scaleY 从底部生长,`.cap` 弹入。

```html
<section class="slide" data-layout="S06" data-animate="measure-up">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">06 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
      <div class="t-meta">[必填] EN LABEL</div>
      <h2 class="h-xl-zh">[必填] 中文标题</h2>
    </div>
    <div class="bar-towers">
      <div class="bar-tower">
        <div class="cap"><i data-lucide="zap"></i></div>
        <div class="body-block h-1">
          <div class="lbl">METRIC 01</div>
          <div class="nb">3.2<span class="unit">×</span></div>
          <div class="sub">[必填] 一行说明</div>
        </div>
      </div>
      <div class="bar-tower">
        <div class="cap"><i data-lucide="clock"></i></div>
        <div class="body-block h-2"><!-- 同结构 --></div>
      </div>
      <div class="bar-tower">
        <div class="cap"><i data-lucide="trending-up"></i></div>
        <div class="body-block h-3 b-accent"><!-- 突出项;高度按数值选 h-1~h-4 --></div>
      </div>
      <div class="bar-tower">
        <div class="cap"><i data-lucide="layers"></i></div>
        <div class="body-block h-4"><!-- 同结构 --></div>
      </div>
    </div>
  </div>
</section>
```

**要点**:塔高阶梯 `.h-1`(22vh)→ `.h-4`(46vh),按**数值大小**分配,不要随机;默认浅描边卡,只有一张 `.b-accent`。

---

### S07 · H-Bar Chart · 横向条形图

**用途**:多项排名比较 / 占比对比(5-10 项)。
**适用内容类型**:**5-10 项可比量化数据**(必须有真实百分比/评分/数值,bar 宽度由数据决定)。⚠️ **严禁用于无量化数据的概念列举**——编造数字会被识破。
**动效 recipe**:`bar-grow` —— `.row-fill` 宽度 0→目标生长,`.row-lbl`/`.row-val` 滑入。

```html
<section class="slide" data-layout="S07" data-animate="bar-grow">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">07 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
      <div class="t-meta">[必填] EN LABEL</div>
      <h2 class="h-xl-zh">[必填] 中文标题</h2>
    </div>
    <div data-anim="up" class="h-bar-chart" style="margin-top:6vh">
      <div class="row-lbl">[必填] 标签 01</div>
      <div class="row-track"><div class="row-fill" style="width:84%"></div></div>
      <div class="row-val">84<span class="unit">%</span></div>
      <div class="row-lbl">[必填] 标签 02</div>
      <div class="row-track"><div class="row-fill accent" style="width:72%"></div></div>
      <div class="row-val">72<span class="unit">%</span></div>
      <!-- 5-10 组;通常只有一条 .accent,其余默认墨色 -->
    </div>
    <div class="t-meta" style="margin-top:auto;padding-bottom:1vh">[选填] 数据来源/口径注脚</div>
  </div>
</section>
```

**要点**:`.h-bar-chart` 是「标签列 11em + 柱体列 + 数值列 8em」三列 grid,每行按 `row-lbl / row-track / row-val` 顺序排放;`.row-fill` 的宽度必须写 inline `style="width:X%"`。

---

### S08 · Duo Compare · 双轨对照

**用途**:Before/After、A vs B、旧/新对比。
**适用内容类型**:**二元对照**(必须正好 2 项)。两侧结构同质:标签 + 大字标题 + 段落 + 列表。
**动效 recipe**:`duo-mirror` —— 左右镜像入场,中线 scaleY 拉开。

```html
<section class="slide" data-layout="S08" data-animate="duo-mirror">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">08 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
      <div class="t-meta">[必填] EN LABEL</div>
      <h2 class="h-xl-zh">[必填] 中文标题</h2>
    </div>
    <div class="duo-compare" style="margin-top:4vh">
      <div class="col">
        <div class="col-tag"><span class="num">01</span> BEFORE</div>
        <div class="col-ttl">[必填] 旧模式名</div>
        <p class="col-desc">[必填] 一句概括.</p>
        <ul class="col-list">
          <li>[必填] 要点</li>
          <li>[必填] 要点</li>
          <li>[必填] 要点</li>
        </ul>
      </div>
      <div class="vrule"></div>
      <div class="col accent">
        <!-- 同结构,tag 写 AFTER;右侧 .accent 突出 -->
      </div>
    </div>
  </div>
</section>
```

**要点**:`.vrule` 是登记的中线,不要删;两列结构必须同质(相同的子元素顺序),一列 `.accent` 一列默认。

---

### S09 · Dot Matrix Statement · 点阵宣言

**用途**:第二张陈述页 / 章节切换 / 视觉透气页。用于一个 deck 内**避免连续两页都是 S03**。
**适用内容类型**:口号 / 隐喻 / 章节切换 + 几何点阵装饰。
**动效 recipe**:`statement` —— 无 `.half` 时 `[data-anim]` 元素依次入场。

```html
<section class="slide" data-layout="S09" data-animate="statement">
  <div class="canvas-card">
    <div class="chrome-min">
      <div class="l">[必填] Section · The Argument</div>
      <div class="r">09 / NN</div>
    </div>
    <span class="ring-mat" style="position:absolute;left:5vw;bottom:9vh;width:16vw;height:16vw"></span>
    <span class="dot-mat" style="position:absolute;right:0;top:0;width:34vw;height:34vw"></span>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:1fr auto;gap:4vh">
      <div data-anim="line" style="align-self:center;display:flex;flex-direction:column;gap:2.4vh">
        <div class="t-cat" style="color:var(--accent)">THESIS · 01</div>
        <h1 style="font-weight:200;font-size:min(7.2vw,12.6vh);line-height:.98;letter-spacing:-.03em">[必填] 三行以内宣言,<br/>强调用 <span style="font-style:italic;font-weight:300">italic</span></h1>
        <div class="lead" style="font-weight:300;max-width:44ch">[必填] 一行落地解释.</div>
      </div>
      <div data-anim style="display:flex;justify-content:space-between;align-items:end;border-top:1px solid var(--border-subtle);padding-top:2vh;padding-bottom:1vh">
        <div class="t-meta">[选填] 引导语 →</div>
        <div class="t-meta">S09 · STATEMENT</div>
      </div>
    </div>
  </div>
</section>
```

**要点**:点阵/圆环矩阵是装饰层,`position:absolute` 且不遮文字区;`dot-mat`/`ring-mat` 的尺寸用 vw 写在 inline。

---

### S10 · Split Closing · 收束宣言

**用途**:整套 deck 收尾页(**每个 deck 只有一页**,不能在中间页使用)。
**适用内容类型**:固定结构 = 左侧宣言短句 + 右侧 3 条 takeaway。
**动效 recipe**:`split-statement` —— 左半 `.kpi-thin` 逐条升起,右半 `.takeaway-list li` 滑入。

```html
<section class="slide split" data-layout="S10" data-animate="split-statement">
  <div class="canvas-card">
    <div class="split-half">
      <!-- 左半 · IKB + ASCII 呼吸场 -->
      <div class="half b-accent" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between;position:relative;overflow:hidden">
        <AsciiField />
        <div class="chrome-min" style="margin-bottom:0;position:relative;z-index:1">
          <div class="l">NN / NN</div>
          <div class="r">CLOSING</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:2vh;position:relative;z-index:1">
          <div class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em;margin-bottom:1.6vh">MANIFESTO</div>
          <div class="kpi-thin" style="font-size:min(6.4vw,11vh)">[必填] Build once.</div>
          <div class="kpi-thin" style="font-size:min(6.4vw,11vh)">[必填] Present <span style="font-style:italic;font-weight:300">anywhere</span>.</div>
          <div style="font-size:max(15px,1vw);line-height:1.6;color:rgba(255,255,255,.82);font-weight:300;max-width:36ch;margin-top:1.4vh">[必填] 一句落地注脚.</div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:end;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh;position:relative;z-index:1">
          <div class="t-meta" style="color:rgba(255,255,255,.62)">[选填] 作者 · 头衔</div>
          <div class="t-meta" style="color:rgba(255,255,255,.62)">YY.MM.DD</div>
        </div>
      </div>
      <!-- 右半 · 白底 takeaway,第 03 条用 IKB 缝合色彩 -->
      <div class="half r-border" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between">
        <div class="chrome-min" style="margin-bottom:0"><div class="l">TAKEAWAYS</div><div class="r">03 RULES</div></div>
        <ul class="takeaway-list" style="gap:4vh">
          <li>
            <div class="t-meta" style="margin-bottom:1vh">RULE 01</div>
            <div class="t-h-prod">[必填] 结论标题</div>
            <p class="t-body-sm" style="margin-top:.8vh">[必填] 一行说明.</p>
          </li>
          <li><!-- RULE 02 同结构 --></li>
          <li style="color:var(--accent)">
            <div class="t-meta" style="margin-bottom:1vh;color:var(--accent)">RULE 03</div>
            <div class="t-h-prod">[必填] 最后一条用 accent 上色</div>
            <p class="t-body-sm" style="margin-top:.8vh;color:var(--text-secondary)">[必填] 一行说明.</p>
          </li>
        </ul>
        <div class="t-meta" style="color:var(--text-helper);text-align:right">→ END · THANKS</div>
      </div>
    </div>
  </div>
</section>
```

**要点**:左半宣言行用 `.kpi-thin`(recipe 逐条点亮的就是它);右半第 03 条 takeaway 用 `var(--accent)`——把 IKB 从左半穿到右半,完成首尾色彩闭环;IKB 蓝底上的强调只用斜体,不用 accent 色。

---

### S11 · Horizontal Timeline · 横向时间线

**用途**:多步骤流程(4-7 步)、时间演进。
**适用内容类型**:**4-7 步线性流程**(每步只有一个名称 + 一行说明)。每步要展开时改用 S05;有量化数据用 S02;循环结构禁用(S14)。
**动效 recipe**:`timeline-walk` —— `.th-node` 沿轴左→右点亮,label 上/下交替。

```html
<section class="slide" data-layout="S11" data-animate="timeline-walk">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">11 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh;align-items:flex-start">
      <div class="t-meta">[必填] EN LABEL</div>
      <h2 class="h-xl-zh">[必填] 中文标题</h2>
    </div>
    <div class="timeline-h" style="margin-top:10vh">
      <div class="tl-row">
        <div class="th-node up">
          <div class="dot"></div>
          <div class="label">
            <div class="yr">01</div>
            <div class="name">[必填] 步骤名</div>
            <div class="desc">[必填] 一行说明</div>
          </div>
        </div>
        <div class="th-node down"><!-- 同结构,up/down 交替 --></div>
        <div class="th-node up accent"><!-- 关键步骤加 .accent --></div>
        <div class="th-node down"><!-- 同结构 --></div>
        <div class="th-node up"><!-- 同结构 --></div>
      </div>
    </div>
    <div class="t-meta" style="margin-top:auto;padding-bottom:1vh;text-align:right">[选填] 底部注脚</div>
  </div>
</section>
```

**要点**:`.tl-row` 默认 5 列 grid,步骤数不是 5 时在 `.tl-row` 上 inline 覆写 `grid-template-columns:repeat(N,1fr)`;`.label` 的水平居中 `translateX(-50%)` 由 CSS + recipe 共同保证,**不要**给 label 手写 transform。

---

### S12 · Manifesto + Ink Banner · 宣言 + 通栏 ink 条

**用途**:阶段性结论、章节封底、口号 + 视觉强收束。
**适用内容类型**:**章节性收束 / 阶段性宣言**(deck 中段而非结尾,S10 是终结)。「主张 + 通栏 ink 宣言」两段结构,无数据。
**动效 recipe**:`manifesto` —— head(`[data-anim="line"]` 内 `.t-cat` + 大标题)先入 → `[data-anim="up"]` 通栏条升起。

```html
<section class="slide" data-layout="S12" data-animate="manifesto">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">12 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh;margin-top:2vh">
      <div class="t-cat">[必填] EN LABEL</div>
      <div style="font-weight:200;font-size:min(7vw,12vh);line-height:.96;letter-spacing:-.035em">[必填] 四行以内宣言,<br/>强调用 <span style="font-style:italic;font-weight:300">italic</span></div>
    </div>
    <div data-anim="up" class="ink-block" style="margin:6vh -5vw -4.4vh;padding:4vh 5vw;display:flex;justify-content:space-between;align-items:center;gap:3vw">
      <div class="t-h-prod" style="color:var(--paper)">[必填] ink 条内反白短句</div>
      <div style="display:flex;gap:1.6vw;color:var(--paper)">
        <i data-lucide="hammer"></i><i data-lucide="package"></i><i data-lucide="plug-zap"></i>
      </div>
    </div>
  </div>
</section>
```

**要点**:通栏 ink 条用 `.ink-block` + 负 margin `margin:0 -5vw -4.4vh`(或上下留白 `margin:6vh -5vw -4.4vh`)取消 canvas-card 的 padding,才真正做到出血通栏;ink 条内文字一律反白。

---

### S13 · Three Forces · 三力卡片小报

**用途**:3 个对等概念深化(每个 = 巨编号 + 标题 + 说明)。
**适用内容类型**:**3 个对等主张/反驳/力量**(数量 = 3,比 S04 承载更多文字)。01/02/03 是编号锚点而非数据。
**动效 recipe**:`three-forces` —— 左 ink hero 横移入 → 右三卡从右滑入 → 巨编号 pop。

```html
<section class="slide" data-layout="S13" data-animate="three-forces">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">13 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
      <div class="t-meta">[必填] EN LABEL</div>
      <h2 class="h-xl-zh">[必填] 中文标题</h2>
    </div>
    <div data-anim="up" style="flex:1;display:grid;grid-template-columns:5fr 11fr;gap:2vw;margin-top:3vh;min-height:0">
      <div class="card-ink" style="padding:3.2vh 1.8vw;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">
        <span class="dot-mat" style="position:absolute;right:-2vw;bottom:-2vh;width:14vw;height:14vh;color:var(--paper)"></span>
        <div class="t-cat on-dark">THREE FORCES</div>
        <div style="font-weight:200;font-size:min(4.6vw,8vh);line-height:1.02;color:var(--paper)">[必填] 左侧<br/>巨字主张</div>
      </div>
      <div style="display:grid;grid-template-rows:repeat(3,1fr);gap:1.4vh;min-height:0">
        <div class="card-fill" style="padding:2.4vh 2vw;display:grid;grid-template-columns:auto 1fr;gap:2vw;align-items:center">
          <div class="num-mega" style="font-size:min(5.6vw,10vh);color:var(--accent)">01</div>
          <div>
            <div class="t-h-prod">[必填] 标题</div>
            <p class="t-body-sm" style="margin-top:.6vh">[必填] 一行说明.</p>
          </div>
        </div>
        <!-- 3 张 .card-fill,结构相同;巨编号是每卡第一个子元素(recipe 对它 pop) -->
      </div>
    </div>
  </div>
</section>
```

**要点**:三张卡必须统一 `.card-fill`;要突出时只把左 hero 块换 `.card-accent`,**禁止**蓝底+描边混用。

---

### S14 · Loop Form · 闭环流程图

**用途**:自学闭环、自动化流程(3-5 步循环)。
**适用内容类型**:**循环 / 闭环流程**(终点回到起点)。线性流程禁用(S11)。
**动效 recipe**:`loop-form` —— 左步骤依次 → 右 svg 底环→节点→箭头→中心巨字。

```html
<section class="slide" data-layout="S14" data-animate="loop-form">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">14 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
      <div class="t-meta">[必填] EN LABEL</div>
      <h2 class="h-xl-zh">[必填] 中文标题</h2>
    </div>
    <div data-anim="up" style="flex:1;display:grid;grid-template-columns:5fr 7fr;gap:3vw;align-items:center;min-height:0">
      <div style="display:flex;flex-direction:column;gap:2.2vh">
        <div style="display:grid;grid-template-columns:auto 1fr;gap:1.6vw;align-items:baseline">
          <span class="t-meta">01</span>
          <div>
            <div class="t-h-prod">[必填] 步骤名</div>
            <p class="t-body-sm">[必填] 一行说明.</p>
          </div>
        </div>
        <!-- 3-5 个步骤,均为第一个子列的直接子 div -->
      </div>
      <div class="geo-icon" style="width:100%;height:min(46vh,34vw);margin:0">
        <svg viewBox="0 0 400 400">
          <defs><marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L8,4 L0,8 z" fill="currentColor"/></marker></defs>
          <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".25"/>
          <circle cx="200" cy="50" r="10" class="fill-accent"/>
          <circle cx="330" cy="275" r="10" class="fill-accent"/>
          <circle cx="70" cy="275" r="10" class="fill-accent"/>
          <path d="M215,62 A150,150 0 0,1 320,262" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#arrow)"/>
          <path d="M312,288 A150,150 0 0,1 88,288" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#arrow)"/>
          <path d="M62,262 A150,150 0 0,1 185,55" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#arrow)"/>
          <text x="200" y="196" text-anchor="middle" style="font-weight:200;font-size:44px;letter-spacing:-.04em">LOOP</text>
          <text x="200" y="228" text-anchor="middle" style="font-size:14px;letter-spacing:.2em" class="t-meta">× N</text>
        </svg>
      </div>
    </div>
  </div>
</section>
```

**要点**:recipe 依次点亮「首 circle(底环)→ 其余 circle(节点)→ `path[marker-end]`(箭头)→ 末尾两个 `<text>`(中心字)」,svg 内**只允许**这两个中心 text,其余文字标签全部放左侧 HTML;步骤列表必须是 svg 所在网格的**第一个子 div** 的直接子 div。

---

### S15 · Matrix + Hero Stat · 矩阵 + 大字底注

**用途**:大量同类项展示(8-12 项),底部一个汇总数据收束。
**适用内容类型**:**8-12 项同类型小项 + 一个汇总指标**。每项只承载短标题。项数只有 6 时用 S04。
**动效 recipe**:`matrix-fill` —— 格子按对角线波扫(按 6 列计算),底部巨数收尾。

```html
<section class="slide" data-layout="S15" data-animate="matrix-fill">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">15 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
      <div class="t-meta">[必填] EN LABEL</div>
      <h2 class="h-xl-zh">[必填] 中文标题</h2>
    </div>
    <div data-anim="up" style="flex:1;display:grid;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(2,1fr);gap:1.2vh 1vw;margin-top:3vh;min-height:0">
      <div class="card-fill" style="padding:1.6vh 1vw;display:flex;align-items:center;justify-content:center"><span class="t-body-emp">[必填] 短项</span></div>
      <!-- 8-12 格,均为该网格的直接子元素;突出一格用 .card-accent -->
    </div>
    <div data-anim="up" style="display:grid;grid-template-columns:1fr auto;align-items:end;gap:2vw;margin-top:2.4vh">
      <div>
        <div class="t-meta" style="margin-bottom:1vh">TOTAL</div>
        <div class="kpi-thin" style="font-size:min(8.4vw,14vh)">[必填] 12<span class="unit">项</span></div>
      </div>
      <div class="t-meta" style="text-align:right">[选填] 注脚</div>
    </div>
  </div>
</section>
```

**要点**:波扫按 **6 列**计算波延迟,矩阵保持 6 列;底部汇总块的巨数必须是其首子 div 的第 2 个子 div(recipe 对它单独 pop)。

---

### S16 · Multi-card Brief · 微卡小报

**用途**:6 项小卡并列(快讯、tip 集合、特性概览)。
**适用内容类型**:**6 项轻量短讯 / tip / 注脚**(数量 = 6,每项主文短 + 小字注脚)。
**动效 recipe**:`field-notes` —— 6 卡乱序散点入 + 微旋转复位。

```html
<section class="slide" data-layout="S16" data-animate="field-notes">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">16 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
      <div class="t-meta">[必填] EN LABEL</div>
      <h2 class="h-xl-zh">[必填] 中文标题</h2>
    </div>
    <div data-anim="up" class="sub-grid-3-2">
      <div class="card-fill" style="padding:2.2vh 1.6vw;display:flex;flex-direction:column;justify-content:space-between;min-height:0">
        <div class="t-h-prod">[必填] 主文(左上)</div>
        <div class="t-meta" style="text-align:right">[必填] 注脚(右下)</div>
      </div>
      <!-- 6 张卡,均为网格直接子元素;只允许一张 .card-accent(单焦点法则) -->
    </div>
  </div>
</section>
```

**要点**:卡内排版**左上主文 + 右下小字**,中间空出;可复用 `.sub-grid-3-2` 作 3×2 网格。

---

### S17 · System Diagram · 同心圆系统图

**用途**:层级架构(core→middle→outer)、生态地图。
**适用内容类型**:**严格三层嵌套关系**。非三层结构禁用(扁平用 S04,层级不清用 S05)。
**动效 recipe**:`system-diagram` —— svg 圆圈同心 scale 入 → 三列说明依次。

```html
<section class="slide" data-layout="S17" data-animate="system-diagram">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">17 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
      <div class="t-meta">[必填] EN LABEL</div>
      <h2 class="h-xl-zh">[必填] 中文标题</h2>
    </div>
    <div data-anim="up" style="flex:1;display:grid;grid-template-columns:6fr 6fr;gap:3vw;align-items:center;min-height:0">
      <div style="display:grid;place-items:center">
        <div class="geo-icon" style="width:min(44vh,32vw);height:min(44vh,32vw);margin:0">
          <svg viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" stroke-width="1.2"/>
            <circle cx="200" cy="200" r="120" fill="none" stroke="currentColor" stroke-width="1.2"/>
            <circle cx="200" cy="200" r="58" class="fill-accent"/>
            <text x="200" y="196" text-anchor="middle" style="font-weight:600;font-size:16px;letter-spacing:.14em" fill="var(--accent-on)">CORE</text>
            <text x="200" y="214" text-anchor="middle" style="font-size:12px" class="t-meta">内核</text>
          </svg>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:2.4vh">
        <div>
          <div class="t-cat">OUTER · 外圈</div>
          <p class="t-body-sm" style="margin-top:.6vh">[必填] 一行解释.</p>
        </div>
        <div><!-- MIDDLE · 中间层,同结构 --></div>
        <div><!-- CORE · 内核,同结构 --></div>
      </div>
    </div>
  </div>
</section>
```

**要点**:svg 内只允许圆心极短标签;三列说明必须是 `[data-anim="up"]` **最后一个子 div** 的直接子 div;从外向内圈径递减。

---

### S18 · Why Now · 三列递进 + 巨数

**用途**:三论点 + 各自支撑数据("为什么是现在")。
**适用内容类型**:**3 个论点 + 每个论点一个量化数据**(百分比/年份/倍数)。最后一列 IKB 强调。
**动效 recipe**:`why-now` —— 三列垂直递进,列底巨数 scale 落定。

```html
<section class="slide" data-layout="S18" data-animate="why-now">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">18 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
      <div class="t-meta">[必填] EN LABEL</div>
      <h2 class="h-xl-zh">[必填] 中文标题</h2>
    </div>
    <div data-anim="up" class="grid-3" style="flex:1;margin-top:3vh;align-items:stretch;min-height:0">
      <div style="display:flex;flex-direction:column;gap:1.6vh;min-height:0">
        <div style="display:flex;flex-direction:column;gap:1vh">
          <div class="t-cat">REASON 01</div>
          <div class="t-h-prod">[必填] 论点标题</div>
          <p class="t-body-sm">[必填] 2-3 行支撑.</p>
        </div>
        <div class="kpi-thin-sm" style="margin-top:auto">[必填] 64<span class="unit">%</span></div>
      </div>
      <!-- 3 列,每列 = 正文包裹 div + 末尾巨数 div(巨数必须是该列最后一个子元素) -->
      <!-- 第 3 列巨数加 style="color:var(--accent)" -->
    </div>
  </div>
</section>
```

**要点**:巨数只用颜色突出最后一列,**不要**加粗;字号统一(`.kpi-thin-sm` 或 inline `min(4.6vw,8.5vh)`)。

---

### S19 · Four Cards · 四列均分卡

**用途**:4 项功能/特性并列(等权重)。
**适用内容类型**:**4 项等权特性 / 模块**(数量 = 4,结构完全同质),纯定性无数据。
**动效 recipe**:`four-cards` —— 顶部 accent 线 scaleX 画出 → 标题 → 四卡依次入。

```html
<section class="slide" data-layout="S19" data-animate="four-cards">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">19 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
      <div style="width:80px;height:3px;background:var(--accent)"></div>
      <div class="h-xl-zh">[必填] 中文标题</div>
    </div>
    <div data-anim="up" style="flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:1.6vw;margin-top:5vh;min-height:0">
      <div style="display:flex;flex-direction:column;gap:1.2vh">
        <div class="t-meta">— 01 / SLASH</div>
        <div class="h-md">[必填] 大字标题</div>
        <p class="t-body-sm">[必填] 2-3 行描述.</p>
      </div>
      <!-- 4 列,均为网格直接子元素 -->
    </div>
  </div>
</section>
```

**要点**:顶部蓝线的**宽度固定 80px 左右**(它是 head 区第一个子 div,recipe 对它 scaleX);**不要**用圆形装饰点(不符合直角语言)。

---

### S20 · Stacked KPI Ledger · 纵向账单 KPI

**用途**:4-6 行核心数据账单式展示(每行 = 巨数 + 标签 + 图标)。
**适用内容类型**:**4-6 项核心数据**(每行必须有真实数值)。垂直账单形式适合财务数据、KPI 仪表板。
**动效 recipe**:`stacked-ledger` —— `.ledger-row` 逐行点亮(num 升起 → label 滑入 → icon pop)。

```html
<section class="slide" data-layout="S20" data-animate="stacked-ledger">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · 主题域</div>
      <div class="r">20 / NN</div>
    </div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
      <div class="t-meta">[必填] EN LABEL</div>
      <h2 class="h-xl-zh">[必填] 中文标题</h2>
    </div>
    <div data-anim="ledger" style="flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0">
      <div class="ledger-row" style="display:grid;grid-template-columns:16vw 1fr auto;gap:2vw;align-items:center;padding:2.2vh 0;border-top:1px solid var(--border-subtle);border-bottom:1px solid var(--border-subtle)">
        <div class="ledger-num kpi-thin-sm" style="font-size:min(6.4vw,11vh)">[必填] 64<span class="unit">%</span></div>
        <div class="ledger-label">
          <div class="t-h-prod">[必填] 指标名</div>
          <p class="t-body-sm" style="margin-top:.4vh">[必填] 一行口径说明.</p>
        </div>
        <div class="ledger-icon"><i data-lucide="zap"></i></div>
      </div>
      <!-- 4-6 行;中间行只写 border-bottom -->
    </div>
  </div>
</section>
```

**要点**:`.ledger-row` / `.ledger-num` / `.ledger-label` / `.ledger-icon` 是动效挂点类(CSS 无样式),布局靠行内 inline;巨数**必须限高** `min(Xvw, 16vh)` 以内,否则底部行被挤出屏。

---

### S21 · Tech Spec Sheet · 规格说明书

**用途**:产品规格、benchmark 数据、性能基线(多 KPI + 竖线装饰)。deck 中数据密度最高的版式。
**适用内容类型**:**真实多维数据**(3 KPI + 9 根竖线 + 底部巨数 = 15+ 数据点)。
**动效 recipe**:`tech-spec` —— 标题列 → KPI 顶线逐根画出 + 数字升起 → 底部巨数 pop → 竖线从底弹起。

```html
<section class="slide" data-layout="S21" data-animate="tech-spec">
  <div class="canvas-card">
    <div class="chrome-min tight">
      <div class="l">[必填] Section · Spec</div>
      <div class="r">21 / NN</div>
    </div>
    <div data-anim="up" style="flex:1;display:grid;grid-template-columns:4fr 2.6fr 2.6fr 2.6fr;gap:2vw;min-height:0;margin-top:2vh">
      <div style="display:flex;flex-direction:column;gap:2vh">
        <div style="font-weight:200;font-size:min(5.6vw,10vh);line-height:.98;letter-spacing:-.035em">[必填] 规格大标题<br/>两行</div>
        <div class="t-body-sm">[必填] 一行注脚/口径.</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:1vh">
        <div style="height:1px;background:var(--ink)"></div>
        <div class="kpi-num kpi-thin-sm" style="font-size:min(4.6vw,8.5vh)">[必填] 12×</div>
        <div class="t-meta">[必填] LABEL 01</div>
        <p class="t-body-sm" style="margin-top:auto">[必填] 一行解释.</p>
      </div>
      <!-- 3 个 KPI 列:必须是该网格的直接子 div(与标题列平级) -->
    </div>
    <div data-anim="hero" style="display:flex;justify-content:space-between;align-items:end;margin-top:2vh;padding-top:2vh;border-top:1px solid var(--border-subtle)">
      <div class="bottom-hero kpi-thin" style="font-size:min(8.4vw,14vh)">[必填] 100<span class="unit">%</span></div>
      <div style="display:flex;gap:2vw;align-items:end">
        <div data-anim="bars" style="display:flex;gap:6px;align-items:end;height:8vh">
          <div class="vbar" style="width:6px;height:40%;background:var(--ink)"></div>
          <div class="vbar" style="width:6px;height:65%;background:var(--ink)"></div>
          <div class="vbar" style="width:6px;height:30%;background:var(--accent)"></div>
          <!-- 9 根 .vbar,高度 inline 百分比由数据决定;一根 accent -->
        </div>
        <div class="t-meta">[选填] MP-XX · YY.MM</div>
      </div>
    </div>
  </div>
</section>
```

**要点**:`kpi-num` / `bottom-hero` / `vbar` 是动效挂点类;竖线矩阵**底对齐**且不超右边距,高度百分 比**来自真实数据**。

---

### S22 · Image Hero · 图文混排封面

**用途**:案例展示、产品图 + 数据落地、章节封面带图。
**适用内容类型**:**真实图片 + 3 个核心数据**。**没有真实图源时禁用**(占位灰图破坏视觉)。
**动效 recipe**:`image-hero` —— 图缓推 → 白块 scaleX 推开 → KPI 顶线依序画出。

```html
<section class="slide" data-layout="S22" data-animate="image-hero">
  <div class="canvas-card" style="padding:0;display:flex;flex-direction:column;overflow:hidden">
    <div data-anim="img" style="position:relative;flex:0 0 58%;overflow:hidden;background:var(--grey-1)">
      <img src="images/22-product-scene.jpg" alt="[必填] 图片说明" loading="eager"
           style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 35%">
      <div class="chrome-min" style="position:absolute;top:0;left:0;right:0;color:rgba(255,255,255,.9);padding:5.6vh 5vw 0;margin-bottom:0">
        <div class="l">Section · Case / Visual Evidence</div>
        <div class="r">22 / NN</div>
      </div>
      <div data-anim="title-block" style="position:absolute;left:5vw;top:11vh;background:var(--paper);padding:3.2vh 3.2vw;max-width:40vw">
        <div style="font-weight:200;font-size:min(5.2vw,9vh);line-height:1;letter-spacing:-.035em;color:var(--text-primary)">[必填] Image<br>Evidence</div>
      </div>
    </div>
    <div data-anim="kpi" class="image-hero-body">
      <div class="body" style="max-width:48ch">[必填] 1-2 行解释这张图为什么重要,不要重复标题.</div>
      <div class="image-hero-stats">
        <div style="display:flex;flex-direction:column;gap:.6vh">
          <div style="height:1px;background:var(--ink)"></div>
          <div class="t-meta">Metric 01</div>
          <div class="kpi-thin-sm" style="font-size:min(4.6vw,7.6vh)">12×</div>
          <p class="t-body-sm" style="margin-top:auto">[必填] 指标解释.</p>
        </div>
        <!-- 3 列;第 3 列数字加 color:var(--accent) -->
      </div>
    </div>
  </div>
</section>
```

**要点**:
- 主图按 `21:9` 比例生成/裁切(`<img>` inline `object-fit:cover`),关键主体放中央安全区;`object-position` 用 `center 35%` 或 `center center`,**不要** `top center` 截人脸
- 信息图/UI 截图改用 `object-fit:contain` 并保证核心内容在中央 70% 安全区
- 下半屏用 `.image-hero-body`(自带与图片的缓冲);三列 KPI 大字限高,列高度统一(不要 `align-items:start`)
- 生成配图 prompt 写明:21:9 ultra-wide strip、subject centered、no title/footer/page chrome/logo/border

---

## 历史实验区(默认禁用)

下面的 P23/P24 是早期探索图文混排加入的实验版式。它们不属于原始 22P,默认不要用于正式生成。除非用户明确要求实验新图文版式,否则请使用 S22 或 S15/S16 的图片槽位(也不要给它们写 `data-layout`)。

### P23 · Swiss Image Split · 左文右图 / 右文左图(实验,默认禁用)

**用途**:解释一个观点时配一张纪实照片、信息图、UI 情景图。
**关键类**:`.swiss-img-split`(+`.reverse` / `.align-bottom` / `.align-image-bottom`) `.swiss-img-copy` `.frame-img.r-16x10.fit-contain` `.swiss-img-caption`
**动效 recipe**:`grid-reveal` 或不加(head 先入,图文错峰)

```html
<section class="slide" data-animate="grid-reveal">
  <div class="canvas-card">
    <div class="chrome-min">
      <div class="l">Section · Visual Argument</div>
      <div class="r">23 / NN</div>
    </div>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:5vh">
      <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
        <div class="t-meta">Evidence · Caption</div>
        <h2 style="font-weight:200;font-size:min(7vw,12vh);line-height:.96;letter-spacing:-.035em">[必填] 一句核心论点</h2>
      </div>
      <div class="swiss-img-split align-image-bottom" data-anim="up">
        <div class="swiss-img-copy">
          <div class="t-cat" style="color:var(--accent)">Why it matters</div>
          <p class="lead" style="font-weight:300;max-width:36ch">[必填] 2-3 行解释图片与论点的关系.</p>
          <p class="t-body-sm">[必填] 2-3 条短 bullet 或一段说明.</p>
        </div>
        <figure class="tile">
          <div class="frame-img r-16x10 fit-contain">
            <img src="images/23-visual-evidence.png" alt="[必填] 图片说明">
          </div>
          <figcaption class="swiss-img-caption"><strong>[必填] 图片标题</strong><span>16:10 · fit-contain</span></figcaption>
        </figure>
      </div>
    </div>
  </div>
</section>
```

**注意**:
- 信息图/UI 图必须 `.fit-contain`;纪实照片默认 cover
- `.align-image-bottom` 已内置底部 nav 安全区;不要再把 caption 往页面底部推
- 右图宽度大,标题不要超过 3 行,正文控制在 2-3 个短段

### P24 · Swiss Evidence Grid · 多图证据墙(实验,默认禁用)

**用途**:三张同类型图片/截图/图表并列。
**关键类**:`.swiss-img-grid` `.frame-img.h-22|h-26` `.fit-contain` `.swiss-img-caption`
**动效 recipe**:`grid-reveal`

```html
<section class="slide" data-animate="grid-reveal">
  <div class="canvas-card">
    <div class="chrome-min">
      <div class="l">Section · Evidence Grid</div>
      <div class="r">24 / NN</div>
    </div>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:6vh">
      <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh">
        <div class="t-meta">Three visual proofs</div>
        <h2 style="font-weight:200;font-size:min(6.6vw,11.6vh);line-height:.96;letter-spacing:-.035em">[必填] 三个证据,一个结论</h2>
      </div>
      <div class="swiss-img-grid" data-anim="up">
        <figure class="tile"><div class="frame-img h-26 fit-contain"><img src="images/24-proof-a.png" alt="[必填]"></div><figcaption class="swiss-img-caption"><strong>01</strong><span>[必填] 证据 A</span></figcaption></figure>
        <figure class="tile"><div class="frame-img h-26 fit-contain"><img src="images/24-proof-b.png" alt="[必填]"></div><figcaption class="swiss-img-caption"><strong>02</strong><span>[必填] 证据 B</span></figcaption></figure>
        <figure class="tile"><div class="frame-img h-26 fit-contain swiss-lined"><img src="images/24-proof-c.png" alt="[必填]"></div><figcaption class="swiss-img-caption"><strong>03</strong><span>[必填] 关键证据</span></figcaption></figure>
      </div>
    </div>
  </div>
</section>
```

**注意**:同组图片必须同一比例、同一高度(`.h-22`/`.h-26` 统一)、同一边距密度;UI/信息图统一 `.fit-contain`,照片统一 cover。

---

## 选版式索引(给 LLM 的决策表)

| 内容意图 | 推荐版式 |
|---|---|
| Deck 起手封面 | S01 Cover |
| 演化对比 / 时间轴(纵,有数据) | S02 Vertical Timeline |
| 一句口号 / 章节起 | S03 Split Statement |
| 6 项概念定义 | S04 Six Cells |
| 三层结构 / 三块堆叠 | S05 Three Layers |
| 4 项数据视觉化高度对比 | S06 KPI Tower |
| 5-10 项排名比较 | S07 H-Bar Chart |
| Before/After / 双轨对照 | S08 Duo Compare |
| 第二张口号 / 视觉透气 | S09 Dot Matrix Statement |
| 整 deck 收尾 | S10 Closing(每 deck 仅 1 次) |
| 多步流程(横,4-7 步) | S11 Horizontal Timeline |
| 阶段性结论 + ink 通栏 | S12 Manifesto + Banner |
| 3 个对等概念深化 | S13 Three Forces |
| 闭环流程 / 自学循环 | S14 Loop Diagram |
| 8-12 项矩阵 + 总数据 | S15 Image Matrix |
| 6 项快讯小卡 | S16 Multi-card Brief |
| 层级架构 / 同心圆系统 | S17 System Diagram |
| 三论点 + 数据支撑 | S18 Why Now |
| 4 项等权特性 | S19 Four Cards |
| 4-6 行账单式 KPI | S20 Stacked Ledger |
| 产品规格 / benchmark | S21 Tech Spec |
| 案例图 + 数据落地 | S22 Image Hero |
| 地点 / 路线 / 人物关系 | S08 文字对照 或 S11 时间线(本 skill 无地图组件) |
| 单图解释论点(实验) | P23 Swiss Image Split(默认禁用,用 S22) |
| 2-3 张图片证据链(实验) | P24 Evidence Grid(默认禁用,用 S15/S16) |

---

## 选版式 P0 原则:内容数据类型必须匹配版式

> 这是写 deck 时**最容易踩雷**的地方。版式承载内容的「形状」是固定的——先看内容,再选版式,**绝不能先选版式再编内容硬塞**。

| 内容类型 | 必须用 | 严禁用 |
|---|---|---|
| 有真实量化数据(百分比/数值) | S06 KPI Tower / S07 H-Bar / S20 Ledger / S21 Tech Spec | S03 / S04 / S09 / S13(无数据版式) |
| 无数据,纯定性论断 | S03 / S09 Statement / S12 / S13 / S19 | ⚠️ **S07 H-Bar / S06 KPI Tower**(编造数据会被识破) |
| 4 项对等 | S19 Four Cards / S06(若有数据) | 不能强凑成 6 用 S04 |
| 6 项对等 | S04 Six Cells / S16 Brief | 不能强凑成 4 用 S19 |
| 3 项对等 | S05 Three Layers / S13 Three Forces | |
| Before/After | S08 Duo Compare(必须正好 2 项) | |
| 闭环结构 | S14 Loop Diagram | S11 横向流程(线性 ≠ 闭环) |
| 三层嵌套 | S17 System Diagram | |
| 时间演化(有数据) | S02 Vertical Timeline | |
| 多步骤流程(无数据) | S11 Horizontal Timeline | |
| 8-12 项同类 | S15 Image Matrix | |
| deck 收尾 | S10 Closing(每 deck 仅 1 次) | |
| 1 张核心图片 + KPI | S22 Image Hero | P23(除非仅实验) |
| 2-3 张同类图片 | S15/S16 图片格改造 | P24(除非仅实验) |

**雷区案例**:用 S07 H-Bar Chart 展示「智能补全 / 实时协作 / 自主代理」这种**无可比百分比的概念列举**,编造 96/88/78 之类数字 → **数据不可信,版式滥用**。这种内容应该用 S02(若有时间维度)或 S09 Statement(若是论断)。

---

## 常犯错误(P0 检查项)

1. ❌ 给卡片加 `border-radius` → ✅ 必须直角
2. ❌ 在 `.card-accent` 上又加描边 → ✅ 卡片 token 类型互斥
3. ❌ 自己画 SVG 图标 → ✅ 用 `<i data-lucide="...">`(npm 内置)
4. ❌ 时间线 dot 自己定位 → ✅ `.tl-node .dot` / `.th-node .dot` 的对齐由 CSS 保证
5. ❌ 大字号不限高(`13vw`)→ ✅ 永远 `min(Xvw, Yvh)` 双约束,Y ≥ X×1.6
6. ❌ ESC 总览缩略图看不到带动效内容 → ✅ 模板 CSS 已有 `#overview [data-anim]` 强制可见,不要删
7. ❌ 所有页用同一个 fade → ✅ 每页一个语义化 recipe(见上文 recipe 契约表)
8. ❌ 标题 + 卡片间距 < 5vh → ✅ 章节级标题至少 9vh(用 grid gap,不要 margin 堆)
9. ❌ 9px 圆形装饰点 → ✅ 8×8 直角小方块 / mono `t-meta` 文字
10. ❌ 装饰元素超出页面边距 → ✅ 严格在 grid 内,不贴边(S09 角落点阵除外)
11. ❌ recipe 挂点类写错(`tl-h-node` 之类)→ ✅ 只用本文档骨架里的类名;不确定时 grep `src/styles/swiss.css` 与 `recipesSwiss.js`
