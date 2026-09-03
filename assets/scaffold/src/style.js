import { ref } from 'vue'

// ================= 风格选择（二选一，与 main.js 的样式导入保持一致） =================
// 'magazine' = 风格 A · 电子杂志 × 电子墨水（衬线大标题 + WebGL 流体背景，5 套主题色）
// 'swiss'    = 风格 B · 瑞士国际主义（无衬线极致字号对比 + 点阵网格，4 套锚点色）
//
// 切换风格时同步修改 4 处：
//   1. 本文件 STYLE
//   2. src/main.js 的样式导入（magazine.css / swiss.css 二选一）
//   3. src/slides/index.js 的示例页导入
//   4. index.html 的内联背景色（magazine 默认 #0a0a0b / swiss 默认 #fafaf8）
export const STYLE = 'magazine'

// 当前页是否深色（背景组件读取，用于 WebGL uniform）
export const deckThemeDark = ref(false)

export const styleConfig = {
  magazine: {
    name: 'magazine',
    ascii: false,          // 无 ASCII 呼吸场
    canvasMode: false,     // 启用 WebGL 双背景（暗页色散 / 亮页涡流）
    // 总览浮层配色
    overviewBg: 'rgba(var(--ink-rgb),.92)',
    overviewLabelColor: 'var(--paper)',
    slideIsDark(el) {
      const t = el?.dataset.theme || (el?.classList.contains('light') ? 'light' : 'dark')
      return t !== 'light'
    },
    applyTheme(el) {
      const light = !this.slideIsDark(el)
      document.body.classList.toggle('light-bg', light)
      deckThemeDark.value = !light
    },
  },
  swiss: {
    name: 'swiss',
    ascii: true,           // 封面/封底可插 <AsciiField />（IKB 底 ASCII 呼吸场）
    canvasMode: true,      // true = canvas 模式：无 WebGL 网格，卡片即页面（与原模板默认一致）
    overviewBg: 'rgba(250,250,248,.96)',
    overviewLabelColor: 'var(--ink)',
    slideIsDark(el) {
      return !!el?.classList.contains('dark') || !!el?.classList.contains('accent')
    },
    applyTheme(el) {
      const dark = this.slideIsDark(el)
      document.body.classList.toggle('dark-bg', dark)
      deckThemeDark.value = dark
    },
  },
}[STYLE]
