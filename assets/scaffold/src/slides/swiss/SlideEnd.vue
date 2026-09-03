<template>
  <!-- S10 Split Closing · split-statement：左 IKB + ASCII 呼吸场，右白底 takeaway（第 03 条 accent 缝合色彩） -->
  <section class="slide split" data-layout="S10" data-animate="split-statement">
    <div class="canvas-card">
      <div class="split-half">
        <div class="half b-accent" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between;position:relative;overflow:hidden">
          <AsciiField />
          <div class="chrome-min" style="margin-bottom:0;position:relative;z-index:1">
            <div class="l">03 / 03</div>
            <div class="r">CLOSING</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:2vh;position:relative;z-index:1">
            <div class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em;margin-bottom:1.6vh">MANIFESTO</div>
            <div class="kpi-thin" style="font-size:min(6.4vw,11vh)">Build once.</div>
            <div class="kpi-thin" style="font-size:min(6.4vw,11vh)">Present <span style="font-style:italic;font-weight:300">anywhere</span>.</div>
            <div style="font-size:max(15px,1vw);line-height:1.6;color:rgba(255,255,255,.82);font-weight:300;max-width:36ch;margin-top:1.4vh">一句话收束：这场演示想留下的结论。</div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:end;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh;position:relative;z-index:1">
            <div class="t-meta" style="color:rgba(255,255,255,.62)">SWISS DECK · 2026</div>
            <div class="t-meta" style="color:rgba(255,255,255,.62)">26.09.03</div>
          </div>
        </div>
        <div class="half r-border" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between">
          <div class="chrome-min" style="margin-bottom:0">
            <div class="l">TAKEAWAYS</div>
            <div class="r">03 RULES</div>
          </div>
          <ul class="takeaway-list" style="gap:4vh">
            <li>
              <div class="t-meta" style="margin-bottom:1vh">RULE 01</div>
              <div class="t-h-prod">第一条结论，一行以内</div>
              <p class="t-body-sm" style="margin-top:.8vh">结论的展开说明。</p>
            </li>
            <li>
              <div class="t-meta" style="margin-bottom:1vh">RULE 02</div>
              <div class="t-h-prod">第二条结论，一行以内</div>
              <p class="t-body-sm" style="margin-top:.8vh">结论的展开说明。</p>
            </li>
            <li style="color:var(--accent)">
              <div class="t-meta" style="margin-bottom:1vh;color:var(--accent)">RULE 03</div>
              <div class="t-h-prod">第三条用 accent 上色，缝合色彩闭环</div>
              <p class="t-body-sm" style="margin-top:.8vh;color:var(--text-secondary)">结论的展开说明。</p>
            </li>
          </ul>
          <div class="t-meta" style="color:var(--text-helper);text-align:right">→ END · THANKS FOR WATCHING</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import AsciiField from '../../components/AsciiField.vue'
</script>
