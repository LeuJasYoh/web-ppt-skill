<!-- Vue 版适配说明：
1. 所有 grep/自检的目标都是 src/slides/*.vue（每页一个组件），不是单文件 index.html。
2. 动效由 npm 包 motion 驱动（src/composables/），字体由 @fontsource npm 包内嵌，图标由 npm 包 lucide 渲染——全部离线可用，不存在 CDN 校验项。
3. 本 skill 未移植演讲者模式与校验脚本：演讲者模式（P 键/SPEAKER_NOTES/观众屏）与 validate-*.mjs 均不存在，自检一律用本文的 grep + 浏览器目测。
-->

# 质量检查清单（Checklist）

这个清单来自"一人公司"分享 PPT 的真实迭代过程。每一条都是踩过坑之后总结的，按重要性排序。

生成 PPT 前，先通读一遍；生成后，逐项自检。

---

## 🔴 P0 · 一定不能犯的错

### 0-S. Swiss locked mode:正文页必须来自原始 22P

**现象**:颜色、字体看起来像 Swiss,但标题跑到中间、图片不在网格上、页面结构和原始 22P 完全不是一套东西。

**根因**:生成时把 Swiss 当成风格包,自由组合了新的 S23/S24/自绘 SVG 页面,没有从登记的 22 个版式里选。

**做法**:
- 先读 `references/swiss-layout-lock.md`,再读 `references/layouts-swiss.md`
- 正文页只能使用 `S01-S22`;每个 `<section class="slide">` 必须写 `data-layout="Sxx"`
- 地图类内容本 skill 无组件,用 S08 文字对照或 S11 时间线承载

**生成后自检**(目标 src/slides/):
```bash
grep -L 'data-layout="S' src/slides/*.vue        # 输出为空 = 全部登记
grep -o 'data-layout="S[0-9]*"' src/slides/*.vue # 逐页核对编号与结构
grep -rn 'text-anchor' src/slides/*.vue          # SVG 文字只允许 S14/S17 中心标签
```

### 0-S-2. Swiss 顶部标题默认左上,不是居中

**现象**:最顶上的中文标题在页面中间,像一页自制海报,不再像原始 PPT。

**做法**:
- 除 `S03/S09/S10` 这类 statement/split 版式外,顶部标题必须贴原始模板的左上内容轴。
- 不要把小标题放左列、大标题放右侧大列,这会导致标题视觉居中。
- 如果需要标题 + 说明两列,复制 S11/S17 的 head 骨架(t-meta + 标题上下叠),不要自写 `4fr 8fr`。

### 0-S-4. Swiss 演示字号不能小到看不清 + 字重阶梯必须遵守

**现象**:瑞士风页面整体结构没问题,但图注、说明、时间线、KPI note、卡片小字在投屏时看不清;或者 16px 小字用了 weight 300 导致又小又细。

**做法(字号下限)**:
- 正文段落 / 主要说明 ≥ `18px`
- 卡片描述 / 列表 / 时间线说明 / caption / 图注 ≥ `16px`
- meta / kicker / mono label / 图表标签 ≥ `14px`
- 内容超出时,先删减文案、拆页或换 Sxx 版式,不要用 10/11/12/13px 小字硬塞。

**做法(字重阶梯 ⭐)**:
瑞士风坚持"越大越细,越小越粗",字号与字重必须成反比阶梯:
- ≥ 8vw → weight **200**(ExtraLight)
- 4-7.9vw → weight **200-300**
- 1.8-3.9vw → weight **300-400**
- 1-1.7vw / 16-20px → weight **400-500**
- 13-15px → weight **500-600**
- 同一页内,字号小的元素字重必须 ≥ 字号大的元素。
- **16px 左右小字禁止使用 weight 300**(太细不可读),最低 400,推荐 500。
- 封面/IKB 反白大标题内强调字用 `italic + weight 300`,不要用 accent 色。
- Windows 雅黑无 200 字重,`is-win` 类自动补偿——不要手写死 `font-weight:200` 内联。

**检查**:
- `rg -n "font-size:(10px|11px|12px|13px)|max\((9|10|11|12|13)px" src/slides/`
- 浏览器以 100% 缩放查看,底部 note、caption、timeline label、卡片描述仍能一眼读清。

### 0-A. 瑞士风画布对齐法则(每一页必查 · 最常踩)

**现象**:页眉 chrome-min 和主体区域左右对不齐,中间内容多内缩了一截。

**根因**:`.canvas-card` 已自带 `padding:5.6vh 5vw 4.4vh`,主体再叠水平 padding 就变成 10vw。

**做法**:主体那层 `padding:0`,只用 grid `gap` 控垂直间距;split 页和 S12 通栏 ink 条(负 margin)是登记例外。完整四条对齐法则见 `layouts-swiss.md`「P0 对齐法则」。

**自检**:`grep -rn "padding:.*5vw" src/slides/`,命中 `padding:Xvh 5vw Yvh` 出现在 canvas-card 直系子元素里就是错的(.half / 通栏 ink 条 / 装饰层除外)。

### 0-B. 瑞士风 head 区:kicker 必须在大标题"上方"(不要左右排)

**现象**:小标题(`.t-meta`/`.t-cat`)和大标题被 `grid-template-columns:auto 1fr` 挤成左右两列,头部失去层级。

**做法**:head 用 `display:flex;flex-direction:column;gap:1.4vh` 上下叠(所有登记骨架的 head 都是这么写的);例外(右挂小注脚)见 layouts-swiss.md。

**自检**:`grep -rn "grid-template-columns:auto 1fr" src/slides/`,命中 head 区即违规。

### 0-B-2. 瑞士风封面 / 封底默认:IKB 满屏 + ASCII 呼吸场 + 白色 weight 200(强制)

**现象**:封面用白底 + 黑字 + 一个大大的"01"——chrome 角标已经写了 `01 / 07`,屏幕上出现两个"01";白底完全没有开场仪式感。

**做法**(瑞士风必守,骨架见 layouts-swiss.md S01/S10):
- **封面强制 `<section class="slide accent">`**(满屏 IKB),不要 `slide.light` 白底;`.canvas-card` 内**第一个子元素**放 `<AsciiField />`
- **不要写"01"编号大字**(S01 的索引目录变体除外,那里编号是目录结构)
- **强调字必须用斜体**:`font-style:italic;font-weight:300`,**禁止**用 `color:var(--accent)`——IKB 蓝压 IKB 蓝
- **封底强制 `slide.split`**:左半 `.half.b-accent` + `<AsciiField />`(与封面色彩闭环),右半 paper 白底 3 条 takeaway(`.takeaway-list`);**第 03 条**用 `var(--accent)` 上色
- 封面/封底主标题字号双约束:`min(11.6vw,19vh)` ~ `min(8vw,14vh)`(遵守 Y ≥ X × 1.6)

**自检**:
- `grep -rc "AsciiField" src/slides/*.vue`——封面 + 封底组件各命中 ≥ 1
- `grep -rn "slide accent" src/slides/`——封面应是 `slide accent`
- `grep -rn "color:var(--accent)" src/slides/`——命中行若同时处于 IKB/ink 底上即危险(蓝压蓝);只有封底"03 takeaway"等白底处合法
- 目视:封面有没有多余的"01"大编号——有就删

### 0-C. 瑞士风大字号双约束:`min(Xvw, Yvh)` 中 Y ≥ X × 1.6

**现象**:在 16:9 标准屏打开,标题字号比预期小一截,整页内容显得空旷或缩水。

**根因**:1vw : 1vh ≈ 1.78,写 `min(7vw, 10vh)` 时 7vw = 12.46vh 会被 10vh 截断,字号缩水 20%。

**做法**:推荐速查表见 `layouts-swiss.md`「P0 对齐法则」第 3 条。

**自检**:`grep -rnE "font-size:min\([0-9.]+vw,\s*[0-9.]+vh\)" src/slides/`,任何 Y/X < 1.6 都改大。

### 0-D. 瑞士风图片混排:直角、同高、只做证据

**现象**:图片像普通 PPT 插图,圆角、阴影、比例混乱;多张截图高度不一。

**根因**:瑞士风的图片不是装饰,而是 grid 里的证据块。没有先选原始版式和图片槽位,就会把任意图片硬塞进页面。

**先判断图像角色**:
- 证据截图、UI、代码、dashboard:保真优先,关键文字不能裁;统一比例时用 `.fit-contain`。
- 已按槽位生成的信息图/插图:按 S22/S15/S16 的目标比例铺满,不要缩成短小图片。
- 照片/产品图/人物图:写清 `object-position`,主体不能被裁切;人像/会议用 `center 35%`,不要 `top center`。
- 多图组:统一比例、高度、容器样式和 caption 密度;视觉角色不同的图不要硬放同一组。

**做法**:
- 先选版式:单张大图 + KPI 用 `S22`;多图用 `S15/S16` 的原始网格骨架改造
- S22 生成图比例固定 `21:9`
- 图片容器只用 `.frame-img`;**不要** `border-radius` / `box-shadow`
- 文字压图必须先做 quiet-zone 判断:至少约 30% 低细节区域可承载标题;不通过就换图、换裁切或改成图文分栏,不要整页套遮罩

**自检**:
- `grep -rnE "border-radius|box-shadow" src/slides/`——命中就删
- 目视:图片内部如果自带大标题、页码、页脚、角标,优先重生成;截图外侧背景应是安静托底

### 0-D-2. 瑞士风底部分页安全区:最低处不要碰 nav

**现象**:图片 caption、脚注、timeline 下方 label、底部 KPI 被分页小方块挡住。

**根因**:`#nav` 固定在 `bottom:2vh`,主体内容贴到底就会进入分页区域。

**做法**:
- 主内容最低边缘与分页组件之间至少留 `3vh` 呼吸空间
- 贴底内容用 `.nav-safe-bottom` / `.nav-safe-bottom-tight`,或用 `margin-top:auto` 时同步目测
- 不要手写 `bottom:2vh` / `bottom:0` 放说明文字

**自检**:`grep -rnE "align-items:end|align-self:end|bottom:0|bottom:2vh" src/slides/`,命中后逐个确认是否留了安全区。

### 0-D-3. 后验修正:溢出/空白靠目测阶梯,不靠猜

**现象**:一页只超出 20-30px,修的时候删掉大块内容,结果下方多出一大片空白。

**做法**(本 skill 无渲染测量脚本,用浏览器 DevTools 代替):
- `npm run dev` 打开该页,DevTools 选中最低的元素,看它是否越过约 93vh 安全线、底部空白多大
- **Overflow 修正阶梯**:
  - `1-40px` over:只做微调,上移内容组或收紧一个 gap;不要删内容
  - `40-90px` over:局部压缩 gap/padding 或降低一个模块高度;仍然优先保留内容
  - `90-160px` over:轻微压标题或压缩一段正文,再考虑拆页
  - `160px+` over:才考虑换更高容量版式、合并模块或删内容
- 每轮只做一个档位的调整,刷新后再看;修完反查底部空白是否过大(修过头了)

### 0-E. Swiss 模板还原度守卫:swiss.css 是 golden source

**现象**:生成页看起来像瑞士风,但字重、间距、时间线、卡片密度和原始模板不一致;越迭代越偏离。

**根因**:把新增样式写成全局修改,或改动了原始基座类(如 `.h-xl` 字重、`.tl-node` 列宽、`.duo-compare` 间距)。

**做法**:
- `src/styles/swiss.css` 是 golden source,**不要修改它**;页面级微调用 inline style 或组件内新类
- 原始页面的大标题大量使用 `font-weight:200/300`,不要恢复成 800/900
- 新增图片能力必须绑定到 S22/S15/S16 原始槽位,不要发明新正文结构

**自检**:`git diff src/styles/swiss.css`(或对比 skill 的 scaffold 原件)应无改动。

### 0-F. 视觉 + 代码双核对:不要只看 .vue

**现象**:代码看起来类名正确,但实际页面拥挤、图文关系不对、可选组件堆太多。

**做法**:
- 先打开网页逐页看视觉:标题字重、头部间距、正文密度、图片对齐、nav 安全区;等入场动效稳定后再下判断
- 再回代码看结构:该页是否用了正确版式,必选组件是否齐,可选组件是否过度
- 判断问题来源:版式选错 / 必选组件缺失 / 可选组件滥用 / 间距和安全区问题
- 通用版式(S03/S08/S11/S19)可多用;数据专用(S02/S06/S07/S20/S21/S22)必须有真实数据或案例;结构专用(S14/S15/S17)必须有闭环、矩阵或层级关系

---

### 0. 生成前必须通过的类名校验(最重要)

**现象**：直接把布局骨架粘进新页面,结果样式全部丢失——大标题不衬线、数据大字报字体小得像正文、pipeline 挤成一坨。

**根因**：骨架里的类在当前风格的 CSS 里没有定义,浏览器 fallback 到默认样式。

**做法**：
- **生成 PPT 前,必须先 Read 当前风格对应 CSS**:风格 A 读 `src/styles/magazine.css`,风格 B 读 `src/styles/swiss.css`,确认骨架里用到的类都已定义
- 布局骨架只从 `references/layouts.md` / `references/layouts-swiss.md` 复制——这两份文档的类名已与 CSS 对齐
- **不要发明新类名**;必须自定义时用 `style="..."` inline 写;个别无样式的"动效挂点类"(如 `.cover-row`/`.ledger-row`/`.kpi-num`)只作 recipe 锚点,布局靠骨架自带的 inline style
- 风格 B 还要核对 `src/composables/recipesSwiss.js` 的 recipe 契约(layouts-swiss.md 有速查表),挂点类写错动效会静默失效
- 生成后打开浏览器,如果看到"大标题字体不对"或"动画没播",几乎 100% 是这个问题

### 1. 不要用 emoji 作图标

**现象**：在中式杂志风格里用 emoji（🎯 💡 ✅）会立刻破坏格调。

**做法**：用 Lucide 图标库——**npm 包已内置,离线可用**,直接写:

```html
<i data-lucide="target" class="ico-md"></i>
```

App.vue 会在挂载后自动把所有 `data-lucide` 物化为 SVG,**不要**手写 CDN `<script>` 引用(离线 exe 里会 404)。

常用图标名：`target / palette / search-check / compass / share-2 / crown / check-circle / x-circle / plus / arrow-right / grid-2x2 / network`

### 2. 图片只允许裁底部，左右和顶部绝对不能切

**现象**：用 `aspect-ratio` 撑图，网格会在父容器不足时堆叠或切掉图片关键信息（比如截图上部的标题栏）。

**做法**：图片容器用**固定 height + overflow hidden**，图片走 `object-fit:cover + object-position:top`（杂志风 CSS 已预设）:

```html
<figure class="frame-img" style="height:26vh">
  <img src="images/screenshot.png">
</figure>
```

**绝不用这种写法**（会在网格中撑破容器）：

```html
<!-- 坏例 -->
<figure class="frame-img" style="aspect-ratio: 16/9">...</figure>
```

**例外**：单张主视觉（非网格内）可以用 `aspect-ratio + max-height`，因为父容器会兜底。瑞士风的 S22 顶部横幅也是登记例外（全宽 `object-fit:cover`）。

### 2b. 亮页面配暗 WebGL = 灰蒙蒙(主题切换没生效 · 杂志风)

**现象**:所有 light 页面背景都像蒙了一层灰,甚至 hero light 也灰。

**根因**:`src/style.js` 根据 slide 的 class 推断主题,切换两张 canvas 的可见性。slide 漏写主题类,body 永远不加 `light-bg`。

**做法**:
- 杂志风每页 section 必须明确带 `light` / `dark`(hero 页 `hero light` / `hero dark`),不要漏写,更不要用其他自定义主题名
- 一个 deck 里必须至少有一个 **非 hero 的 light 页**,确保 body 有机会加 `light-bg`

### 2b-2. 整个 deck 全是 light,没有节奏(杂志风)

**现象**:除封面 `hero dark` 外,其余所有页面默认写 `light`——视觉平淡,白花花一片。

**做法**:
- **生成前画"主题节奏表"**:每一页写清 `hero dark` / `hero light` / `light` / `dark` 中的哪一个,对齐后再写代码
- **硬规则**:连续 3 页以上同主题 = 不允许;8 页以上必须有 ≥1 `hero dark` + ≥1 `hero light`;不能全是 `light` 正文页——必须有 `dark` 正文页
- 按布局选主题的默认值表见 `layouts.md`「主题节奏规划」
- **生成后自检**:`grep -h 'class="slide' src/slides/*.vue`,目视确认节奏有交错

### 2c. chrome 和 kicker 不要写同一句话

**现象**:左上角 `.chrome` 写"Design First · 设计先行",同一页里 `.kicker` 又写"Phase 01 · 设计阶段"——同义翻译,AI 味浓。

**做法**:
- **chrome = 杂志页眉 / 导航标签**:跨多页可相同(如 "Act II · Workflow"、"Data · Result")
- **kicker = 本页独一份的引导句**:短、有钩子、是大标题的"小前缀"(如 "BUT"、"一个人,做了什么。"、"The Question")
- 一个描述栏目,一个描述这一页——绝不互相翻译

### 3. 大标题字号不能超过屏宽 / 单字数

**现象**：中文大标题字号设太大（比如 13vw），结果每行只容 1 个字，强制换行非常难看。

**做法**：
- 杂志风 `h-hero`（最大）：10vw，**且标题长度 ≤ 5 字**；`h-xl`：6vw-7vw
- 瑞士风按中文分档表降级（≤8 字 `min(6.4vw,11.2vh)` 起,见 layouts-swiss.md）
- 长标题用 `<br>` 手工断行，不要依赖自动换行
- 必要时加 `white-space:nowrap`

### 4. 字体分工：全部 npm 自托管，离线保真

**做法**：
- 字体已通过 @fontsource npm 包在构建期内嵌（Playfair/Source Serif/Noto Serif SC/Noto Sans SC/Inter/JetBrains Mono/IBM Plex Mono），**不要**再引入 Google Fonts CDN 或下载字体文件
- 杂志风分工：大标题、重点 quote、数字 → 衬线;正文描述 → 非衬线;元数据/标签 → 等宽
- 瑞士风：全程无衬线 + 等宽,字重阶梯见 0-S-4

### 4b. 图片不要用 `align-self:end` 贴底

**现象**：图文页给图片加 `align-self:end`,父容器不是 grid 时完全失效,图片掉到文档流最下面被遮挡。

**做法**：
- 图文混排**必须用 `.frame.grid-2-7-5`**(或 `.grid-2-6-6`/`.grid-2-8-4`)的 grid 结构,图片自然贴顶
- 要让左列 callout"贴底":给**左列**加 flex column + `justify-content:space-between`,不要动右列
- 瑞士风贴底用登记机制(S15 底注 `margin-top:auto` / `.swiss-img-split.align-image-bottom`)

### 4c. 图片不要用原图奇葩比例

**现象**:`aspect-ratio: 2592/1798` 这种从原图复制的比例,在不同屏幕下撑出奇怪的空白或溢出。

**做法**：占位器固定用标准比例 **16/10 / 4/3 / 3/2 / 1/1 / 16/9**(瑞士风多图还有 21/9)。图片 `object-fit:cover`,底部裁掉一点无伤大雅;信息图用 `.fit-contain`。

### 5. 不要给图片加厚边框 / 阴影

**现象**：为了"高级感"加了强阴影或黑框，瞬间变成商务 PPT。

**做法**：杂志风最多 1-4px 微圆角 + 极淡底噪（已在 CSS 中）;瑞士风**直角、无圆角、无阴影**,唯一允许的线条是 `.swiss-lined` 顶部 accent 线或 1px 极淡灰边。

---

## 🟡 P1 · 排版节奏

### 6. Hero 页和非 hero 页要交替（杂志风）

**推荐节奏**（25-30 页）：
```
Hero Cover → Act Divider (hero) → 3-4 pages non-hero → Act Divider (hero)
→ 4-5 pages non-hero → Hero Question → ... → Hero Close
```

连续 2 页以上 hero 会让人疲劳，连续 4 页以上 non-hero 会让节奏死。瑞士风的"呼吸页"由 S03/S09 statement 承担。

### 7. 大字报页和密集页要交替

大字报（S06/S09/big numbers）和密集页（S15/S21/pipeline）交替出现，听众眼睛才不累。

### 8. 同一概念的英文/中文用法要统一

**现象**：一会儿写 "Skills"，一会儿写"技能"，全篇不一致。

**做法**：术语优先用**英文单词**（圈内熟悉词）,别硬翻译;整个 deck 里同一个词 1 个写法。

### 9. 底部 chrome 的页码要一致

用 `XX / 总页数` 的格式（比如 `05 / 27`）。导航圆点由 App.vue 按注册的组件数自动生成,但 chrome/chrome-min 里的 `XX / N` 是**手写死的**——加页/删页时要手工改 N,并同步改各页页码。

### 9b. 动效系统:每一页都要有 data-anim 标记

**现象**:生成后打开浏览器,翻页时内容直接"啪"地出来,没有任何节奏感。

**根因**:完全没给元素加 `data-anim` / 没写 recipe 挂点,动效引擎找不到可播的元素。

**做法**:
- 杂志风:至少给 kicker / 主标题 / lead / callout / stat-card / figure 这些叶子元素加 `data-anim`;大引用页 `data-animate="quote"` + `data-anim="line"`;对比页 `data-animate="directional"` + left/right;pipeline 页 `data-animate="pipeline"` + `data-anim="step"`
- 瑞士风:每个版式的挂点已写进 layouts-swiss.md 的骨架与 recipe 契约表,**照骨架抄,不要自创挂点**
- **自检**:杂志风 `grep -c 'data-anim' src/slides/*.vue` 应每页 ≥ 3;瑞士风核对 recipe 契约表

### 9c. Pipeline 页必须加 data-animate="pipeline"（杂志风）

**现象**:流水线页直接全部淡入,失去"一步步讲"的节奏。

**做法**:Layout 6 的 `<section>` 必须加 `data-animate="pipeline"`。演示时按 →/空格/滚轮下滑**逐个点亮 step**,全部点亮之后再按 → 才会翻到下一页。这个节奏是刻意的,不是 bug。

---

## 🟢 P2 · 视觉打磨

### 10. WebGL 背景的遮罩透明度（杂志风）

**dark hero**：遮罩 12-15%（WebGL 明显透出）
**light hero**：遮罩 16-20%（WebGL 隐约可见，不抢字）
**普通 light/dark 页**：遮罩 92-95%（几乎不透）

如果页面文字非常少（hero question），遮罩可以再薄些；如果正文密集，必须加厚遮罩确保可读。

### 11. Light hero 的 shader 不能有强中心点（杂志风）

**现象**：Spiral Vortex、径向涟漪在 light 主题下太显眼，像 Windows 98 屏保。

**做法**：light hero 用 FBM 域扭曲驱动的无中心流动，底色保持银/纸色（接近 #F0F0F0 / #FBF8F3），彩虹偏色 subtle（0.05 以下）。脚手架的双 shader 已按此预设,不要改。

### 12. Dark hero 允许更多视觉冲击（杂志风）

Dark hero 可以用 Holographic Dispersion（钛金色散）等带中心结构的 shader，因为黑底能容纳更多视觉信息。

### 13. 左文右图的对齐

- 左列文字组 `justify-content:space-between`：标题贴顶，引用框贴底
- 右列图片保持自然顶对齐,不要加 `align-self:end`
- 右列图片通常要跟正文内容区对齐,不是跟大标题顶端对齐;必要时加 `margin-top:7vh` 到 `9vh`
- 网格整体 `align-items:start`（不是 `center` / `end`）

### 13b. 标题与正文间距

- 顶部标题 + 下方长内容的两段式布局,中间推荐 `margin-top:6vh` 到 `8vh`(瑞士风用 grid gap,见对齐法则)
- 居中大标题页必须整体水平居中,不要只让文字块左对齐居中摆放
- 复杂内容页用大标题定调,下方内容用 grid 两端对齐,不要把大标题、小标题、正文挤成一坨

### 13c. UI 情景图不要拉成巨长条

- 单张 UI 截图放满宽会变长条,优先拆成 2-3 个局部面板
- 多面板拼排时每个 `.frame-img` 用同一个固定高度类(`.h-16`/`.h-18`/`.h-22`),不要混用
- 如果确实需要全宽,生成比例足够长的横向图片,prompt 写明 "ultra-wide horizontal strip"

### 13d. 生成配图不要自带 slide 元素

- 生成/挑选的配图只是嵌入素材,不要自带页眉、页脚、标题、页码、角标、署名或装饰边框
- 流程图/信息图只保留核心图形和必要短标签,PPT 自己负责标题、页脚和 chrome
- 如果图片已经带了这些元素,优先重选/重生成;不要在页面里再叠一层 chrome

### 13e. Swiss 图文混排不能只用一种

- 7-8 页 Swiss deck 至少使用 6 个不同 S 编号版式
- 有 2-3 张配图时,至少两种图片承载方式:S22 主视觉 / S15 矩阵 / S16 小报 / S08 对照图文 / S19 四卡证据
- 左文右图需要底对齐时,先控制图片高度和主体安全区,不要把整块内容推到分页组件附近
- 白底信息图容器必须白底、无描边;不要用灰框包白图

### 13f. Swiss 中文大标题要降级

- 中文 2 行标题默认从 `min(5.8vw,10.2vh)` 起步,不要直接用英文页的 `6.8vw-7vw`
- 任一行 9-12 个中文字符时降到 `min(5.2vw,9.2vh)`
- 3 行标题优先改写,不能为了标题大而挤掉下方图文内容

### 14. 图片的微弱圆角

风格 A 可以有轻微圆角。风格 B Swiss 必须直角: `.frame-img` 和图片本身都不要圆角、阴影或消费 app 式卡片感。

---

## 🔵 P3 · 操作细节

### 15. 图片路径用相对路径

图片放在 `public/images/` 下，页面里用相对路径 `images/xxx.png`（构建后挂在站点根,`go:embed` 原样打包）,不要用绝对路径。

### 16. 页码在 `.chrome` 里写死

导航圆点由 App.vue 按注册组件数自动生成,但 `.chrome` / `.chrome-min` 里的 `XX / N` 是写死的。加页/删页时要手工改 N,并逐页核对页码。

### 17. 翻页导航要保留

脚手架默认支持：← → ↑ ↓ / Space / PgUp PgDn / Home End / 滚轮 / 触屏滑动 / 底部圆点 / `ESC` 总览 / `B` 静态模式 / `?slide=N` 直达。不要删 App.vue 里的导航逻辑。

### 18. 不要用 `height:100vh` 硬设，用 `min-height:80vh`

`100vh` 会让内容刚好卡满屏幕，但浏览器工具栏、标签栏会吃掉一部分高度，导致内容溢出。用 `min-height:80vh + align-content:center` 更稳。

---

## 🧪 最终自检清单

生成完 PPT 后，逐项对照这个清单（勾一下）：

```
预检(生成前)
  □ 已 Read 当前风格 CSS(magazine.css / swiss.css),确认骨架类都已定义
  □ 已决定每页用哪个版式(杂志风 Layout 1-10 / 瑞士风 S01-S22)
  □ 杂志风:已画"主题节奏表",满足无连续 3 页同主题 / ≥1 hero dark + ≥1 hero light
  □ 瑞士风:每页已列 `页码 → data-layout → 为什么选它 → 图片槽位`
  □ `<title>` 已改为实际 deck 标题(grep "[必填]" 应无结果)
  □ 瑞士风:封面是 `slide accent` 满屏 IKB + `<AsciiField />`(不是白底)
  □ 瑞士风:封底是 `slide split` + 左 `b-accent` + AsciiField / 右 `.takeaway-list`,第 03 条用 var(--accent)
  □ 瑞士风:封面没有"01"等大编号(chrome-min 已显示 01/N)

内容
  □ 每一幕的页数比例合理(不会头重脚轻)
  □ 没有使用 emoji 作图标
  □ 术语用法全篇统一
  □ 每页的 kicker + 标题 + 正文 三级信息清晰

排版
  □ 所有大标题没有出现 1 字 1 行的换行
  □ 图片网格用 height:Nvh 或登记比例类,而非原图奇葩比例
  □ 杂志风图片只裁底部;瑞士风照片不裁头顶
  □ 字体分工符合当前风格(衬线/无衬线/等宽)
  □ 瑞士风:字号下限(正文≥18px/卡片≥16px/meta≥14px)与字重阶梯全部达标

视觉
  □ hero 页和 non-hero 页交替(杂志风)/ statement 呼吸页穿插(瑞士风)
  □ 杂志风:WebGL 背景在 hero 页可见;瑞士风:图片直角无阴影
  □ 没有沉重的阴影和边框

交互(双击 exe 或 npm run dev 实测)
  □ ← → ↑ ↓ / Space / PgUp PgDn 翻页正常,Home/End 首末页
  □ 底部圆点数量与总页数匹配,点圆点可跳页
  □ chrome 里的页码和实际页号一致
  □ ESC 总览宫格正常(点缩略图跳页,缩略图内容完整可见)
  □ B 键低功耗模式切换,右下角提示在 `B 动态` / `B 静态` 之间切换
  □ URL 加 ?slide=N 直达第 N 页

动效
  □ 翻页时内容逐个淡入,不是"啪"一下全出
  □ 杂志风:大引用 quote / 对比 directional / pipeline 分步,挂点齐全
  □ 瑞士风:每页 recipe 命中契约表(挂点类抄自登记骨架)
  □ 杂志风 `grep -c 'data-anim' src/slides/*.vue` 每页 ≥ 3
  □ 低功耗模式下内容仍全部可见,无控制台报错
```

全勾完，才是合格的 PPT。
