import { createApp } from 'vue'
import App from './App.vue'

// —— 风格样式导入（与 src/style.js 的 STYLE 保持一致，二选一）——
import './styles/magazine.css'
// import './styles/swiss.css'

// Windows 字重补偿：雅黑没有 ExtraLight 200，中文大字提亮一档（瑞士风必需）
if (/Win/i.test(navigator.platform || navigator.userAgentData?.platform || '')) {
  document.body.classList.add('is-win')
}

createApp(App).mount('#app')
