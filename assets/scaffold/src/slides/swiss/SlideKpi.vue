<template>
  <!-- S06 KPI Tower · measure-up：塔体 scaleY 生长 + 图标 cap 弹入 -->
  <section class="slide" data-layout="S06" data-animate="measure-up">
    <div class="canvas-card">
      <div class="chrome-min tight">
        <div class="l">SECTION 02 · DATA</div>
        <div class="r">02 / 03</div>
      </div>

      <div data-anim="line" style="display: flex; flex-direction: column; gap: 1.2vh">
        <div class="t-cat">KPI TOWER</div>
        <div class="h-xl-zh">四座数据塔</div>
      </div>

      <div class="bar-towers">
        <div class="bar-tower">
          <div class="cap"><i data-lucide="zap"></i></div>
          <div class="body-block h-1">
            <div class="lbl">Metric 01</div>
            <div class="nb">3.2<span class="unit">×</span></div>
            <div class="sub">说明一行</div>
          </div>
        </div>
        <div class="bar-tower">
          <div class="cap"><i data-lucide="clock"></i></div>
          <div class="body-block h-2">
            <div class="lbl">Metric 02</div>
            <div class="nb">45<span class="unit">天</span></div>
            <div class="sub">说明一行</div>
          </div>
        </div>
        <div class="bar-tower">
          <div class="cap"><i data-lucide="trending-up"></i></div>
          <div class="body-block h-3 b-accent">
            <div class="lbl">Metric 03</div>
            <div class="nb">98<span class="unit">%</span></div>
            <div class="sub">说明一行</div>
          </div>
        </div>
        <div class="bar-tower">
          <div class="cap"><i data-lucide="layers"></i></div>
          <div class="body-block h-4">
            <div class="lbl">Metric 04</div>
            <div class="nb">120<span class="unit">万</span></div>
            <div class="sub">说明一行</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
