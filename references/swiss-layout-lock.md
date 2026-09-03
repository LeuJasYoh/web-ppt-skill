<!-- Vue 版适配说明：
1. 版式骨架是纯 HTML，直接粘贴进 src/slides/SlideXxx.vue 的 <template>；
   每个骨架的完整代码见 references/layouts-swiss.md（S01-S22）。
2. 图片放 public/images/（命名 {页号}-{语义}.{ext}），骨架里 src="images/01-cover.jpg" 原样可用。
3. 每页组件在 src/slides/index.js 按顺序注册。
4. 本 skill 未移植演讲者模式与校验脚本，自检一律用下文 grep + 浏览器目测。
-->

# Swiss Layout Lock

本文件是瑞士主题的硬约束。它的目的不是增加灵感,而是防止生成时"看起来像 Swiss,但已经脱离原始模板"。

## Golden Source

版式基准是仓库内的 `src/styles/swiss.css`(由原 guizang-ppt-skill 的 template-swiss.html 派生;原始参考 PPT 不随仓库分发,本文件登记的 S01-S22 即其版式快照)。动效结构基准是 `src/composables/recipesSwiss.js`——每个 recipe 查询的真实 DOM 挂点已登记在 layouts-swiss.md 的「动效原则」契约表中。

瑞士主题生成时,除用户明确要求实验版式外,只能从下面登记的 22 个版式中选择。新增首页/尾页必须使用 S01 / S10 的登记变体,正文页必须来自这 22 个版式。

## 生成前硬规则

1. 每个正文页都必须先选一个登记版式,并在 `<section>` 上写 `data-layout="Sxx"`。
2. 不允许临时发明 `S23/S24` 这类未出现在原始 22P 的正文结构。需要图片时,优先使用 `S22 Image Hero`;多图时使用 `S15/S16` 的原始网格骨架做图片格改造,不要发明新的证据墙。本 skill **没有**地图组件——地点/路线内容用 S08 文字对照或 S11 时间线承载,不要引入 MapLibre 等新依赖。
3. 顶部中文标题默认左对齐并贴近左上内容轴。除原始 `S03/S09/S10` 这种 statement/split 版式外,不要把大标题放到页面水平中心。
4. SVG 只能负责几何线条、圆、箭头、路径。除 S14/S17 的环心/圆心 1-2 个极短居中大字外,不要在 SVG 里写可见文字;所有文字标签用 HTML 放在网格、卡片或 caption 里。
5. 图片槽位和图片生成比例必须绑定。先确定版式和槽位,再生成图片。

## 生成后自检(grep 目标是 src/slides/,不是 index.html)

```bash
grep -L 'data-layout="S' src/slides/*.vue         # 输出为空 = 每页都已登记
grep -o 'data-layout="S[0-9]*"' src/slides/*.vue   # 逐页核对 Sxx 与实际结构
grep -rn 'text-anchor' src/slides/*.vue            # SVG 文字只应出现在 S14/S17 的中心标签
grep -rnE 'border-radius|box-shadow' src/slides/   # 命中即违规(直角纯色)
```

## 登记版式

| ID | 原始页 | 名称 | 必须保留的骨架 | 图片规则 |
|---|---:|---|---|---|
| S01 | 01 | Index Cover | `.slide.accent` + `.canvas-card` + `<AsciiField />` + `.cover-row` 行(IKB 满屏变体,或 `num-mega`/`name-mega` 索引变体) | 无 |
| S02 | 02 | Vertical Timeline + KPI | 顶部 `.chrome-min` + `data-anim="line"` head + `.timeline-v`/`.tl-node` + 底部 `.kpi-row-4` | 无 |
| S03 | 03 | Split Statement | `.slide.split` + `.split-half` 双半屏,左巨字,右 `.half.b-grey` 解释 | 无 |
| S04 | 04 | Six Cells | head + `.sub-grid-3-2` 六张 `.sub-card`(nb-corner/lucide/ttl/desc) | 无 |
| S05 | 05 | Three Layers | head + `.stack-row` 三块 `.stack-block`(b-grey/b-accent/b-ink) | 无 |
| S06 | 06 | KPI Tower | head + `.bar-towers`,每塔 `.cap` + `.body-block h-1~h-4`(一张 `.b-accent`) | 无 |
| S07 | 07 | Horizontal Bar | head + `[data-anim="up"] .h-bar-chart`,每行 `.row-lbl`/`.row-track>.row-fill`/`.row-val` | 无 |
| S08 | 08 | Duo Compare | `.duo-compare` 两 `.col` + `.vrule` 中线(右列 `.accent`) | 无 |
| S09 | 09 | Dot Matrix Statement | 大号 statement + `.dot-mat`/`.ring-mat` 角落装饰 | 无 |
| S10 | 10 | Split Closing | `.slide.split` 左 `.half.b-accent`+`<AsciiField />`+`.kpi-thin` 右 `.takeaway-list` | 无 |
| S11 | 11 | Horizontal Timeline | head + `.timeline-h > .tl-row` N 个 `.th-node`(up/down/accent,dot+label) | 无 |
| S12 | 12 | Manifesto + Ink Banner | `data-anim="line"`(t-cat+大标题)+ `data-anim="up"` `.ink-block` 负 margin 通栏 | 无 |
| S13 | 13 | Three Forces | `data-anim="up"` 网格:左 `.card-ink` hero + 右三张 `.card-fill`(首子 div `num-mega` 编号) | 无 |
| S14 | 14 | Loop Form | `data-anim="up"`:左步骤列 + 右 `.geo-icon` svg(circle 节点 + `path[marker-end]` + 末两个中心 text) | 无 |
| S15 | 15 | Matrix + Hero Stat | head + 第一个 `data-anim="up"` 6 列格子墙 + 第二个 `data-anim="up"` 底注(`.kpi-thin` 巨数) | 多图可改造矩阵格,同组统一 `21:9` |
| S16 | 16 | Multi-card Brief | head + `.sub-grid-3-2` 六张微卡(`.card-fill`,左上主文+右下小字,一张 `.card-accent`) | 多图可改造卡片内容,同组统一 `21:9` |
| S17 | 17 | System Diagram | `data-anim="up"`:svg 同心圆(极短中心标签)+ 末子 div 三列说明 | 无 |
| S18 | 18 | Why Now | `data-anim="up"` `.grid-3` 三列(正文包裹 div + 末子 div `.kpi-thin-sm` 巨数,末列 accent) | 无 |
| S19 | 19 | Four Cards | `data-anim="line"` 首子 div accent 顶线 + `data-anim="up"` 四列均分卡 | 无 |
| S20 | 20 | Stacked KPI Ledger | `data-anim="ledger"` + `.ledger-row`(行内 `.ledger-num`/`.ledger-label`/`.ledger-icon` 挂点) | 无 |
| S21 | 21 | Tech Spec Sheet | `data-anim="up"`(标题列+3 KPI 列,`.kpi-num`)+ `data-anim="hero"`(`.bottom-hero`)+ `data-anim="bars"`(`.vbar`) | 无 |
| S22 | 22 | Image Hero | 顶部全宽图 + 左上 `data-anim="title-block"` 白块 + `.image-hero-body`/`.image-hero-stats` 三列 KPI | 主图按 `21:9` 生成,关键主体放中央安全区 |

完整可粘贴骨架、动效 recipe 契约与逐版式要点见 `references/layouts-swiss.md`。

## 图片槽位规则

### S22 · Hero Strip

- 生成比例: `21:9`
- 图片用途:实拍场景、产品场景、UI 情景图。
- 生成提示词必须包含: `21:9 ultra-wide strip`, `subject centered in the safe middle area`, `no title, no footer, no page chrome, no logo, no border`。
- HTML 容器必须使用 S22 的顶部全宽图骨架;不要改成普通居中大图。
- 照片用 `object-fit:cover;object-position:center 35%`。如果是人像/会议场景,不要用 `top center`。
- 信息图/UI 截图如果放 S22,必须重新生成接近 `21:9`,并保证核心内容在中央 70% 安全区。

### S15/S16 · Multi Image Grid

- 生成比例:统一 `21:9` 或统一 `16:10`,不要混用。
- 同一组图片必须同高、同宽、同一容器背景。
- 图片格必须吸附原始卡片网格(`.sub-grid-3-2` 或 S15 的 6 列格),不要让图片自己决定宽高。
- 按槽位重新生成的图片用 `.frame-img.r-21x9` 铺满槽位,不要加 `.fit-contain`,也不要用固定 `height:18vh` 这类短槽把长图缩小。
- `.fit-contain` 只用于必须保留原始比例的用户截图或文字密集图片;一旦决定重生成图片,就应该按槽位比例重生成并铺满。

## 禁止清单

- 禁止 `text-align:center` 用在顶部中文大标题。
- 禁止将顶部标题写进右侧大栏,造成视觉居中。
- 禁止未登记正文页:例如临时 `Swiss Image Split`、`Evidence Grid`、三圆图自绘页(P23/P24 属历史实验区,默认禁用)。
- 禁止图片容器灰底包白底信息图。
- 禁止 SVG 中出现长文字标签(仅 S14/S17 允许环心极短大字)。
- 禁止图片默认 `object-position:top center` 用于照片。
- 禁止引用 swiss.css 与 recipesSwiss.js 之外的类名作为版式结构(微调用 inline style)。
