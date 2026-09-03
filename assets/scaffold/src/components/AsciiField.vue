<script setup>
// ASCII 点阵呼吸场组件（瑞士风 IKB 封面/封底用）
// 放在 .canvas-card（或 split .half.b-accent）内首位。
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { registerAscii, unregisterAscii } from '../composables/asciiManager'

const el = ref(null)
onMounted(() => registerAscii(el.value))
onBeforeUnmount(() => unregisterAscii(el.value))
</script>

<template>
  <canvas class="ascii-bg" ref="el" aria-hidden="true"></canvas>
</template>
