# VuePPT

一个做网页幻灯片的 Agent Skill。给它一份大纲，它产出两样东西：能在浏览器里翻页演示的页面，和一个拷到任何 Windows 机器双击就能跑的 exe。字体、动效、图标全部打包进二进制，断网也不影响效果。

前端是 Vue 3 + Vite，所有页面常驻 DOM 做横向条带翻页，动效由 Motion One 驱动。后端是 Go `go:embed` 的静态服务器，七十来行、零依赖，负责随机端口和自动开浏览器。视觉系统移植自 guizang-ppt-skill 的两套风格，在这个基础上改成了组件化，补了主题生产线和交付前的机检工具。

## 两种风格

一份 deck 只能选一种。叙事、观点、人文类内容适合 A；数据、产品、汇报类适合 B。

| | A · 电子杂志 | B · 瑞士国际主义 |
|---|---|---|
| 气质 | Monocle 杂志感 | Helvetica Forever |
| 字体 | 衬线大标题 + 等宽元数据 | 全程无衬线，字号越大字重越轻 |
| 背景 | WebGL 双背景（暗页色散 / 亮页涡流） | canvas 直角卡片即页面，默认不开 WebGL |
| 版式 | 10 种布局 | 22 种锁定版式 S01-S22 |
| 动效 | 5 种语义 recipe | 21 种语义 recipe |

## 主题

色值只有一处事实源：`scripts/themes/themes.csv`。目前 magazine 侧 7 套（墨水经典、靛蓝瓷、森林墨、牛皮纸、沙丘、象牙雪、鼠尾草），swiss 侧 5 套（克莱因蓝、柠檬黄、柠檬绿、安全橙、信任蓝）。

换主题不改 CSS，跑脚本：

```bash
node <skill目录>/scripts/themes/gen.mjs --apply <slug> --deck <deck目录>
```

不接受自定义 hex。配色这件事搭错一格画面就垮，预设的作用就是把这种自由发挥挡在门外。想加新主题，在 CSV 里加一行，`validate.mjs` 会查词表、槽位和对比度，过了才允许应用。

## 怎么用

把仓库 clone 到 agent 的 skills 目录（比如 `<项目>/.agents/skills/VuePPT/`），然后正常对话触发即可。用户提到网页 PPT、瑞士风 PPT、slide deck，或者想要"比 PowerPoint 动效更强的演示"、"离线单文件程序"时，agent 会走这个 skill。

skill 目录本身是只读的工具箱，干活在另一个地方——工作区里新建的 deck 目录：

```bash
node <skill目录>/scripts/new-deck.mjs 我的演示 --install     # 建目录、复制脚手架、装依赖
node <skill目录>/scripts/themes/gen.mjs --list               # 挑主题
node <skill目录>/scripts/themes/gen.mjs --apply mag-ink --deck 我的演示
```

写页面在 deck 的 `src/slides/` 里进行。布局骨架照抄 `references/layouts.md`（A）或 `swiss-layout-lock.md` 加 `layouts-swiss.md`（B），不要发明模板外的类名。文案有单独一份硬规则清单 `references/copywriting.md`——翻案腔、空转冒号句、拟人喻体这类 AI 腔，在生成环节就被拦下，而不是上屏之后再改。

交付前过一遍机检：

```bash
node <skill目录>/scripts/verify/check-deck.mjs 我的演示            # 版式锁、主题节奏、占位符
node <skill目录>/scripts/verify/check-deck.mjs 我的演示 --render   # 加像素实测（需 playwright）
node <skill目录>/scripts/verify/capture.mjs 我的演示               # 逐页截图，人眼过一遍
node <skill目录>/scripts/themes/validate.mjs --deck 我的演示       # 主题表与 CSS 同步
```

check-deck 拦的东西：未登记的版式、连续三页同明暗、SVG 里写文字、占位符残留、白名单外的依赖。`--render` 量的东西：溢出（按 40/90/160px 给修复建议）、最小字号、标题间距、修过头留下的大片空白。

最后出成品：

```bash
npm run build
go build -ldflags "-s -w" -o 演示名称.exe .
```

## 演示时的操作

`→` 或空格翻页，`←` 回退，`Home`/`End` 首末页，`ESC` 呼出总览宫格，地址栏加 `?slide=N` 直达第 N 页。页面里不放任何键位提示，观众看不到这些说明——需要时把本节发给他。

系统开了"减少动态效果"（prefers-reduced-motion）时自动进入静态模式：动画停用，内容全显。

## 目录

```
SKILL.md                主控文档：需求访谈、工作流、硬规则、技术红线
references/             布局骨架、组件手册、文案纪律、自检清单
scripts/new-deck.mjs    在工作区创建 deck 目录
scripts/themes/         主题生产线（CSV 事实源 + 生成 + 校验 + 词表）
scripts/verify/         验收工具链（结构快门 + 截图连拍 + 主题画廊）
assets/scaffold/        Vue 3 + Vite + Go 脚手架模板
```

references 里的布局骨架和类名已与脚手架的 CSS、动效引擎逐一核对过，照抄即可生效。

## 命名

三处标识是定死的：品牌叫 VuePPT，skill 注册名是 `vue-ppt`（SKILL.md frontmatter），npm 包和 Go 模块都叫 `vueppt`。改的时候三处一起动。

## 致谢

视觉系统（双风格 CSS、版式语言、动效 recipe、主题色）来自 [guizang-ppt-skill](https://github.com/Obnine/guizang-ppt-skill)；主题词表与"生成→校验→截图→人眼验收"的闭环方法论来自 style-generate-skill；文案规则来自 lieflat-less-ai-tone 的 629 篇对照研究。各自都做了适配或重写，问题归本项目。
