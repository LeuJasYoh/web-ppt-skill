# VuePPT

一个 Agent Skill（ZCode / Claude Code 等）：制作现代、带精美动效的**网页版 PPT（Web PPT）**，交付**单个离线可执行的 .exe**——拷到任意设备双击即演，无需任何运行时。

## 命名（已定死，全库统一，不再改）

| 场景 | 名称 |
|---|---|
| 项目名 / 品牌 | **VuePPT** |
| Skill 标识（SKILL.md frontmatter `name`） | `vue-ppt` |
| npm 包名（`assets/scaffold/package.json`） | `vueppt` |
| Go 模块名（`assets/scaffold/go.mod`） | `vueppt` |

## 架构

- **前端**：Vue 3 + Vite。所有页常驻 DOM 的横向条带翻页；动效由 [Motion One](https://motion.dev/) 驱动（npm 打包，离线全保真）；字体 @fontsource 自托管；图标 Lucide。
- **后端**：Go `go:embed` 静态服务器（约 70 行、零依赖），把 `dist/` 编进二进制，随机端口 + 自动开浏览器。
- **交付**：`npm run build` → `go build` → 一个 exe。支持 Windows / Linux / macOS 交叉编译。

## 两种视觉风格（一份 deck 只能选一种）

| | 风格 A · 电子杂志 | 风格 B · 瑞士国际主义 |
|---|---|---|
| 气质 | Monocle 杂志感、叙事、人文 | Helvetica Forever、信息驱动、数据 |
| 字体 | 衬线大标题 + 等宽元数据 | 全程无衬线，字号越大字重越轻 |
| 背景 | WebGL 双背景（暗页色散 / 亮页涡流） | canvas 模式默认；可开极细网格 |
| 主题色 | mag-* 7 套（墨水经典 / 靛蓝瓷 / 森林墨 / 牛皮纸 / 沙丘 / 象牙雪 / 鼠尾草） | sw-* 5 套锚点色（克莱因蓝 / 柠檬黄 / 柠檬绿 / 安全橙 / 信任蓝） |
| 版式 | 10 种布局 | 22 种锁定版式 S01-S22（版式锁） |
| 动效 | 5 种 recipe | 21 种语义 recipe（KPI 生长 / 时间线点亮 / 镜像对照…） |

主题色**只从预设中挑选，不接受自定义 hex**——色彩搭配错了画面瞬间变丑，预设保证了"电子杂志 × 电子墨水"与"瑞士国际主义"的美学不垮。

## 仓库结构

```
SKILL.md                  # 主控文档：工作流、硬规则、技术红线
references/               # 参考文档（按需渐进阅读）
  layouts.md              #   风格 A 的 10 个布局骨架
  layouts-swiss.md        #   风格 B 的 22 个版式骨架 + 21 个动效 recipe 契约表
  swiss-layout-lock.md    #   瑞士风版式锁（S01-S22 登记表）
  themes.md/themes-swiss.md  # 主题配色语义参考（色值唯一事实源在 scripts/themes/themes.csv）
  components.md           #   组件手册
  checklist.md            #   交付前 P0-P3 自检清单
  golang-server.md        #   构建交付与交叉编译
assets/scaffold/          # Vue 3 + Vite + Go 脚手架（复制即用）
scripts/themes/           # 主题生产线：themes.csv 唯一事实源 + gen/validate
scripts/verify/           # 验收工具链：check-deck 结构验收 + capture 截图连拍/主题画廊
```

> 文档中的布局骨架与类名已与脚手架的 `swiss.css` / `magazine.css` 及动效引擎 `recipesSwiss.js` / `recipesMagazine.js` 的 DOM 契约逐一校验对齐，照抄即可生效。

## 安装

把本仓库整目录复制（或 clone）到 Agent 的 skills 目录：

```
# 工作区级
<项目>/.agents/skills/VuePPT/
```

用户提到「网页PPT / Web PPT / 瑞士风 PPT / slide deck」等，或想要"比 PowerPoint 动效更强的演示"、"离线单文件演示程序"时自动触发。

## 快速上手

1. **需求澄清**：风格 A/B → 受众场合 → 页数 → 素材 → 主题色（预设里选）
2. **建 deck 目录**：`node <skill目录>/scripts/new-deck.mjs <工作区/deck目录> --install`（复制纯源码脚手架 + 装依赖；skill 目录只读）
3. **选风格**（改 4 处，见 `src/style.js` 顶部注释）：`STYLE`、`main.js` 样式导入、示例页导入、`index.html` 背景色
4. **选主题色**：`node <skill目录>/scripts/themes/gen.mjs --list` 挑选 → `--apply <slug> --deck <deck目录>` 应用（清单见 `scripts/themes/README.md`）
5. **写页面**：布局骨架照抄 references 文档，动效标记 `data-anim` / `data-animate`
6. **构建交付**：`npm run build && go build` → 演示名称.exe
7. **验证**：翻页 / 总览逐页过一遍（清单见 `references/checklist.md`）

## 操作

双击 exe 后：`→`/`空格` 翻页，`←` 回退，`Home/End` 首末页，`ESC` 总览宫格（点缩略图跳页）；URL 加 `?slide=N` 直达第 N 页。成品页面内不显示任何操作提示——本节即操作说明。系统开启"减少动态效果"（prefers-reduced-motion）时自动进入静态模式：动画停用、内容全显。

## 致谢

视觉系统（双风格 CSS、版式语言、动效 recipe、主题色）移植自 [guizang-ppt-skill](https://github.com/Obnine/guizang-ppt-skill)，在其基础上改为 Vue 3 组件化 + Go 单文件交付，并将参考文档全部重写对齐到实际代码。
