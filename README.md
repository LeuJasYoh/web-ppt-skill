# web-ppt-skill

一个 Agent Skill（ZCode / Claude Code 等）：制作现代、带精美动效的**网页版 PPT（Web PPT）**，交付**单个离线可执行的 .exe**——拷到任意设备双击即演，无需任何运行时。

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
| 版式 | 10 种布局 | 22 种锁定版式 S01-S22（版式锁） |
| 动效 | 5 种 recipe | 21 种语义 recipe（KPI 生长 / 时间线点亮 / 镜像对照…） |

## 仓库结构

```
SKILL.md                  # 主控文档：工作流、硬规则、技术红线
references/               # 参考文档（按需渐进阅读）
  layouts.md              #   风格 A 的 10 个布局骨架
  layouts-swiss.md        #   风格 B 的 22 个版式骨架 + 21 个动效 recipe 契约表
  swiss-layout-lock.md    #   瑞士风版式锁（S01-S22 登记表）
  themes.md/themes-swiss.md  # 主题色预设（A 五套 / B 四套，只选不自定义）
  components.md           #   组件手册
  checklist.md            #   交付前 P0-P3 自检清单
  golang-server.md        #   构建交付与交叉编译
assets/scaffold/          # Vue 3 + Vite + Go 脚手架（复制即用）
```

> 文档中的布局骨架与类名已与脚手架的 `swiss.css` / `magazine.css` 及动效引擎 `recipesSwiss.js` / `recipesMagazine.js` 的 DOM 契约逐一校验对齐，照抄即可生效。

## 安装

把本仓库整目录复制（或 clone）到 Agent 的 skills 目录：

```
# 工作区级
<项目>/.agents/skills/web-ppt/
```

用户提到「网页PPT / Web PPT / 瑞士风 PPT / slide deck」等，或想要"比 PowerPoint 动效更强的演示"、"离线单文件演示程序"时自动触发。

## 操作

双击 exe 后：`→`/`空格` 翻页，`←` 回退，`ESC` 总览宫格，`B` 静态（低功耗）模式，`Home/End` 首末页；URL 加 `?slide=N` 直达第 N 页。

## 致谢

视觉系统（双风格 CSS、版式语言、动效 recipe、主题色）移植自 [guizang-ppt-skill](https://github.com/Obnine/guizang-ppt-skill)，在其基础上改为 Vue 3 组件化 + Go 单文件交付，并将参考文档全部重写对齐到实际代码。
