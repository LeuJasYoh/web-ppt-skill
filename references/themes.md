# 主题色预设（Themes）

7 套精心调配的主题色板（登记表 `scripts/themes/themes.csv` 的 mag-* 行）,保证"电子杂志 × 电子墨水"的美学不垮。**不允许用户自定义颜色——色彩搭配错了画面瞬间变丑**,只从以下预设中挑选。

> 色值唯一事实源在 `scripts/themes/themes.csv`（`gen.mjs --apply <slug>` 应用,`validate.mjs` 校验）;本页保留配色语义与适用判断说明。

---

## 使用方法（gen 工作流，勿手改 CSS）

1. 问用户选哪套(或基于内容推荐一套),完整清单以 `gen.mjs --list` 为准
2. 应用：`node <skill目录>/scripts/themes/gen.mjs --apply <slug> --deck <deck目录>`——只回写 THEME 标记段,其他 CSS 都走 `var(--...)`
3. 手改标记段会被 `validate.mjs --deck` 判不同步;要加新主题 = themes.csv 加一行 → validate 通过 → --apply

---

## 🖋 墨水经典 (Monocle 默认)

**适合**:通用分享、商业发布、科技产品、任何场景都安全的默认选择。
**调性**:纯墨黑 + 暖米白,杂志感最强,Monocle / Apricot / A Book Apart 风。

```css
--ink:#0a0a0b;
--ink-rgb:10,10,11;
--paper:#f1efea;
--paper-rgb:241,239,234;
--paper-tint:#e8e5de;
--ink-tint:#18181a;
```

---

## 🌊 靛蓝瓷 (Indigo Porcelain)

**适合**:科技/研究/数据分享、工程师文化、深度内容、技术发布会。
**调性**:深靛蓝 + 瓷白,冷静、理性、有深度,像学术期刊或蓝印花瓷器。

```css
--ink:#0a1f3d;
--ink-rgb:10,31,61;
--paper:#f1f3f5;
--paper-rgb:241,243,245;
--paper-tint:#e4e8ec;
--ink-tint:#152a4a;
```

---

## 🌿 森林墨 (Forest Ink)

**适合**:自然/可持续/文化/非虚构内容、户外品牌、环保主题。
**调性**:深森林绿 + 象牙,沉稳、有呼吸感,像旧版《国家地理》。

```css
--ink:#1a2e1f;
--ink-rgb:26,46,31;
--paper:#f5f1e8;
--paper-rgb:245,241,232;
--paper-tint:#ece7da;
--ink-tint:#253d2c;
```

---

## 🍂 牛皮纸 (Kraft Paper)

**适合**:怀旧/人文/阅读/历史/文学分享、独立杂志、手作品牌。
**调性**:深棕 + 暖米,像牛皮信封或老笔记本,温暖、有年代感。

```css
--ink:#2a1e13;
--ink-rgb:42,30,19;
--paper:#eedfc7;
--paper-rgb:238,223,199;
--paper-tint:#e0d0b6;
--ink-tint:#3a2a1d;
```

---

## 🌙 沙丘 (Dune)

**适合**:艺术/设计/创意/时尚分享、画廊手册、审美优先的私享会。
**调性**:炭灰 + 沙色,克制、高级、中性,像沙漠黄昏或建筑设计图册。

```css
--ink:#1f1a14;
--ink-rgb:31,26,20;
--paper:#f0e6d2;
--paper-rgb:240,230,210;
--paper-tint:#e3d7bf;
--ink-tint:#2d2620;
```

---

## ❄️ 象牙雪 (Ivory Snow)

**适合**:学术研究、作品集、杂志编辑。
**调性**:象牙纸白 + 近黑墨字,近单色的极简,像高级画册的内页。

```css
--ink:#14120f;
--ink-rgb:20,18,15;
--paper:#faf8f4;
--paper-rgb:250,248,244;
--paper-tint:#efeadf;
--ink-tint:#26221c;
```

---

## 🌿 鼠尾草 (Sage)

**适合**:教学科普、生活方式、旅游出行。
**调性**:灰绿墨字 + 淡绿灰纸,安静的自然感,像植物图鉴。

```css
--ink:#26332a;
--ink-rgb:38,51,42;
--paper:#f2f4ef;
--paper-rgb:242,244,239;
--paper-tint:#e4e9e0;
--ink-tint:#3a4a3e;
```

---

## 推荐选择参考

| 如果是... | 推荐主题 |
|---|---|
| 不知道选啥 / 第一次用 | 🖋 墨水经典 |
| AI / 技术 / 产品发布 | 🌊 靛蓝瓷 |
| 内容 / 行业观察 / 文化 | 🌿 森林墨 |
| 书评 / 生活方式 / 人文 | 🍂 牛皮纸 |
| 设计 / 艺术 / 品牌 | 🌙 沙丘 |

---

## 切换原则

- **一份 deck 只用一套主题**,不要中途换色
- WebGL shader 的默认主色(钛金色散 / 银色流动)适配全部 7 套(经测试可接受)
- `currentColor` 驱动的 border / icon 会跟随 section 的 text color 自动适配,无需额外调整
- 选定主题后,`<title>` 文字和 `chrome` 文案可以强化该主题的语义(例如牛皮纸配"Vol.03 · 秋"这种)

## ❌ 不要做的事

- ❌ **不允许混搭**(例如 ink 取墨水经典的,paper 取沙丘的)——会彻底违和
- ❌ **不允许用户随便给一个 hex 值**——需委婉拒绝并展示登记表预设让选（gen.mjs --list）
- ❌ **不要直接修改 magazine.css 其他地方的颜色**——所有散落 rgba 都走 var,改 :root 一处即可

选定主题后在 skill 对话中告诉用户:"用 🖋 墨水经典 / 🌊 靛蓝瓷 ..."并在 deck 项目记录里备注,方便后续迭代时保持一致。
