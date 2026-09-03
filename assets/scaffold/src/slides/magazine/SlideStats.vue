<template>
  <!-- 数据大字报 · light：grid-4 + stat-card，默认 cascade 依次进场 -->
  <section class="slide light">
    <div class="chrome">
      <div class="left">Data · Result</div>
      <div class="right">Act I · 02 / 04</div>
    </div>

    <div class="frame" style="justify-content: center">
      <div data-anim><p class="kicker">By the numbers</p></div>
      <div data-anim>
        <h2 class="h-xl">用数字<span class="en">说话</span></h2>
      </div>
      <div class="grid-4" style="margin-top: 5vh">
        <div class="stat-card" data-anim>
          <div class="stat-label">Metric 01</div>
          <div class="stat-nb">3.6<span class="stat-unit">倍</span></div>
          <div class="stat-note">指标说明，一行以内</div>
        </div>
        <div class="stat-card" data-anim>
          <div class="stat-label">Metric 02</div>
          <div class="stat-nb">98<span class="stat-unit">%</span></div>
          <div class="stat-note">指标说明，一行以内</div>
        </div>
        <div class="stat-card" data-anim>
          <div class="stat-label">Metric 03</div>
          <div class="stat-nb">120<span class="stat-unit">万</span></div>
          <div class="stat-note">指标说明，一行以内</div>
        </div>
        <div class="stat-card" data-anim>
          <div class="stat-label">Metric 04</div>
          <div class="stat-nb">0<span class="stat-unit">门槛</span></div>
          <div class="stat-note">指标说明，一行以内</div>
        </div>
      </div>
    </div>

    <div class="foot">
      <div>数据来源 · Source</div>
      <div>— · —</div>
    </div>
  </section>
</template>
