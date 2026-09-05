# 主题生产线（scripts/themes/）

主题系统的唯一事实源是 **`themes.csv`**：登记 + 色值都在表里；`gen.mjs` 把它写入风格 CSS，`validate.mjs` 把关。改主题、加主题、换主题都不再手改 CSS。

## 三个命令

```bash
node scripts/themes/gen.mjs --list                              # 列出全部主题
node scripts/themes/gen.mjs --apply <slug> --deck <deck目录>    # 应用主题到该 deck 的风格 CSS
node scripts/themes/validate.mjs --deck <deck目录>              # 校验登记表 + 该 deck 的 CSS 同步
node scripts/themes/gen.mjs --check --deck <deck目录>           # 只查 deck CSS 与 CSV 是否同步
```

> 使用模型：**skill 目录只读**（存主题数据与工具），`--deck` 指向工作区里由 `new-deck.mjs` 创建的 deck 目录——主题永远应用进 deck，不回写 skill 模板。

## themes.csv 列定义

| 列 | 说明 |
|---|---|
| `slug` | 主题标识，`^[a-z][a-z0-9-]*$`，风格前缀约定：magazine → `mag-*`，swiss → `sw-*` |
| `label` / `desc` | 中文名 / 一句话调性（≤30 字） |
| `category` | 色调气质，**封闭词表 14 值**（wordlist.mjs） |
| `styleCase` | 用途，顿号分隔 **2-5 个**，封闭词表 19 值 |
| `style` | `magazine` / `swiss` |
| 色槽列 | magazine：`ink,paper,paper_tint,ink_tint`；swiss：`ink,paper,grey_1,grey_2,grey_3,accent,accent_on,accent_bright`——全部 `#RRGGBB`，**非本风格槽位留空** |

rgb 三元组（`--ink-rgb` 等）由 gen 从 hex 现场派生，不入库。

## 校验规则（validate.mjs）

- 结构：slug 合法唯一、label/desc 非空、字段内无逗号（多值用顿号）
- 词表：category / styleCase 只能取封闭集——"AI 只能从合法集合里选"，主题聚合筛选不失明
- 槽位：本风格必填齐全、他风格槽位必须留空、hex 格式
- 对比度（WCAG 相对亮度）：swiss `accent_on`/`accent` ≥3:1（建议 4.5）；magazine `ink`/`paper` ≥4.5:1（建议 7）
- 同步：两套风格 CSS 的 `THEME:BEGIN/END` 标记段必须与 CSV 一致（不同步 → `--apply` 修复）

## 换主题 / 加主题的标准流程

```
换主题：gen.mjs --apply <slug> --deck <deck>       → 在 deck 里 npm run build && go build
加主题：themes.csv 加一行 → validate 通过 → --apply --deck <deck> → capture --gallery 人眼验收
画廊：  node scripts/verify/capture.mjs <deck目录> --gallery
        （按 deck 风格遍历登记表，逐套应用+重建+连拍，结束自动恢复原主题）
```

## 实现契约

- deck 的风格 CSS（magazine.css / swiss.css）里主题段被 `/* THEME:BEGIN <slug> */` … `/* THEME:END */` 包裹，gen 只改标记之间——**标记是契约，手改标记段会被 --check/validate 判不同步**
- 生成产物入库（CSS 在 git 里可 diff 可回退），Vite/Go 构建链零感知
- 词表改口只改 `wordlist.mjs`（validate 自动跟随）——单一权威，别在别处复制词表
