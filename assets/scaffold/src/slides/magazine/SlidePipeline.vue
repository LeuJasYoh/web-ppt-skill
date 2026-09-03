<template>
  <!-- 流水线 · dark：data-animate="pipeline"，按 →/空格 手动一步步点亮 -->
  <section class="slide dark" data-animate="pipeline">
    <div class="chrome">
      <div class="left">Workflow · Pipeline</div>
      <div class="right">Act II · 03 / 04</div>
    </div>

    <div class="frame" style="justify-content: center">
      <div data-anim><p class="kicker">How it works</p></div>
      <div data-anim>
        <h2 class="h-xl">流程分步<span class="en">演示</span></h2>
      </div>

      <div class="pipeline-section">
        <div class="pipeline-label">Pipeline · 按 → 逐步推进</div>
        <div class="pipeline" data-cols="4">
          <div class="step" data-anim="step">
            <div class="step-nb">01</div>
            <div class="step-title">输入</div>
            <div class="step-desc">第一步说明文字，两行以内</div>
          </div>
          <div class="step" data-anim="step">
            <div class="step-nb">02</div>
            <div class="step-title">处理</div>
            <div class="step-desc">第二步说明文字，两行以内</div>
          </div>
          <div class="step" data-anim="step">
            <div class="step-nb">03</div>
            <div class="step-title">产出</div>
            <div class="step-desc">第三步说明文字，两行以内</div>
          </div>
          <div class="step" data-anim="step">
            <div class="step-nb">04</div>
            <div class="step-title">反馈</div>
            <div class="step-desc">第四步说明文字，两行以内</div>
          </div>
        </div>
      </div>
    </div>

    <div class="foot">
      <div>Pipeline · 4 steps</div>
      <div>— · —</div>
    </div>
  </section>
</template>
