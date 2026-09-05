// 封闭词表（唯一权威定义，validate.mjs import 此模块——改词表只改这里）
// 词表方法论来自 style-generate-skill：封闭集 + 单处定义 + 双重强制，
// 让"AI 分类不可靠"变成"AI 只能从合法集合里选"，主题聚合筛选才不会失明。

// category · 色调气质（单选，14 值）
export const CATEGORIES = [
  '浅色 · 极简', '浅色 · 专业', '浅色 · 柔和',
  '深色 · 科技', '深色 · 沉稳', '深色 · 奢华',
  '暖色 · 治愈', '活力 · 创意', '大胆 · 宣言',
  '杂志 · 编辑', '自然 · 有机', '东方 · 国风',
  '插画 · 手绘', '效果 · 戏剧',
]

// styleCase · 用途（顿号分隔选 2-5 个，19 值）
export const STYLE_CASES = [
  '技术分享', '商业汇报', '融资路演', '产品发布', '品牌营销',
  '学术研究', '教学科普', '传统文化', '疗愈冥想', '婚庆浪漫',
  '亲子儿童', '生活方式', '杂志编辑', '艺术视觉', '年度庆典',
  '餐饮美食', '时尚潮流', '影视音乐', '旅游出行',
]

export const STYLES = ['magazine', 'swiss']

// 每种风格的语义槽位：hex 必填列（rgb 三元组由 gen 派生，不入库）
export const SLOTS = {
  magazine: ['ink', 'paper', 'paper_tint', 'ink_tint'],
  swiss: ['paper', 'ink', 'grey_1', 'grey_2', 'grey_3', 'accent', 'accent_on', 'accent_bright'],
}

export const HEX_RE = /^#[0-9a-fA-F]{6}$/
export const SLUG_RE = /^[a-z][a-z0-9-]*$/
