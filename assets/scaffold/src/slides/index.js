// 幻灯片注册表：按演示顺序排列。新增页面 = 建 SlideXxx.vue + 加入数组。
// ⚠️ 示例页按风格二选一，与 src/style.js 的 STYLE、main.js 的样式导入保持一致。

// —— 风格 A · 电子杂志（默认）——
import SlideCover from './magazine/SlideCover.vue'
import SlideStats from './magazine/SlideStats.vue'
import SlidePipeline from './magazine/SlidePipeline.vue'
import SlideEnd from './magazine/SlideEnd.vue'

export default [
  SlideCover,
  SlideStats,
  SlidePipeline,
  SlideEnd,
]

// —— 风格 B · 瑞士国际主义（切风格时注释掉上面，启用下面）——
// import SlideCover from './swiss/SlideCover.vue'
// import SlideKpi from './swiss/SlideKpi.vue'
// import SlideEnd from './swiss/SlideEnd.vue'
// export default [
//   SlideCover,
//   SlideKpi,
//   SlideEnd,
// ]
