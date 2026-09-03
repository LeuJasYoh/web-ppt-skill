<template>
  <!-- S01 封面 · accent + ASCII 呼吸场：cover-row 点名式亮起（recipe: hero） -->
  <section class="slide accent" data-layout="S01" data-animate="hero">
    <div class="canvas-card">
      <AsciiField />
      <div class="chrome-min">
        <div class="l">SWISS DECK · 2026</div>
        <div class="r">01 / 03</div>
      </div>

      <div data-anim="line" style="margin-top: auto; display: flex; flex-direction: column; gap: 2.4vh">
        <div class="cover-row" style="display: flex; align-items: baseline; gap: 2.4vw">
          <div class="num-mega">01</div>
          <div class="name-mega">标题写在这里</div>
        </div>
        <div class="cover-row" style="display: flex; align-items: baseline; gap: 2.4vw">
          <div class="num-mega" style="opacity: .4">02</div>
          <div class="name-mega muted">副标题：一句话说清主题</div>
        </div>
        <div class="cover-row" style="margin-top: 3vh">
          <div class="t-meta" style="color: rgba(255,255,255,.7)">演讲人 · 2026.09 · Venue</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import AsciiField from '../../components/AsciiField.vue'
</script>
