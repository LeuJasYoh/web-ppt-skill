<script setup>
// WebGL 背景（移植自 guizang 模板，按风格切换）：
//   magazine = 双画布：暗页全息色散（钛金暗流）/ 亮页旋转涡流（银色珍珠），light-bg 切换
//   swiss    = 单画布：极细移动网格 + 鼠标点阵微扰 + accent 偷渡（canvas-mode 下不渲染）
// 低功耗模式（系统 prefers-reduced-motion 自动启用）停止 RAF 并隐藏画布。
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { STYLE, styleConfig, deckThemeDark } from '../style'
import { lowPower } from '../composables/useLowPower'

const darkEl = ref(null)
const lightEl = ref(null)
const gridEl = ref(null)

const VS = 'attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}'

// —— 风格 A：全息色散（暗） ——
const FS_DARK = `precision highp float;
uniform vec2 u_resolution;uniform float u_time;uniform vec2 u_mouse;
vec3 palette(float t,vec3 a,vec3 b,vec3 c,vec3 d){return a+b*cos(6.28318*(c*t+d));}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution.xy;
  vec2 p=uv*2.0-1.0;p.x*=u_resolution.x/u_resolution.y;
  vec2 m=u_mouse*2.0-1.0;m.x*=u_resolution.x/u_resolution.y;
  float md=length(p-m);
  float mr=sin(md*15.0-u_time*4.0)*exp(-md*3.0);p+=mr*0.08;
  vec2 p0=p;
  for(float i=1.0;i<4.0;i++){
    p.x+=0.1/i*sin(i*3.0*p.y+u_time*0.4)+0.05;
    p.y+=0.1/i*cos(i*2.0*p.x+u_time*0.3)-0.05;
  }
  float r=length(p);float ang=atan(p.y,p.x);
  vec3 a=vec3(0.12,0.12,0.13);
  vec3 b=vec3(0.03,0.04,0.05);
  vec3 c=vec3(1.0,1.0,1.0);
  vec3 d=vec3(0.1,0.2,0.4);
  vec3 col=palette(r*1.5+p0.x*0.5+u_time*0.1,a,b,c,d);
  float disp=sin(r*25.0-u_time*1.5+ang*2.0)*0.5+0.5;
  col+=vec3(disp*0.015,disp*0.01,disp*0.02);
  float hi=pow(sin(p.x*4.0+p.y*3.0+u_time)*0.5+0.5,8.0);
  col+=hi*0.08;
  vec3 base=vec3(0.05,0.05,0.06);
  col=mix(base,col,0.85);
  gl_FragColor=vec4(col,1.0);
}`

// —— 风格 A：旋转涡流（亮）——
const FS_LIGHT = `precision highp float;
uniform vec2 u_resolution;uniform float u_time;uniform vec2 u_mouse;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  float a=hash(i),b=hash(i+vec2(1,0));
  float c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v=0.0,a=0.5;
  mat2 m=mat2(0.80,0.60,-0.60,0.80);
  for(int i=0;i<5;i++){v+=a*noise(p);p=m*p*2.02;a*=0.5;}
  return v;
}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution.xy;
  vec2 p=uv;p.x*=u_resolution.x/u_resolution.y;
  vec2 m=u_mouse;m.x*=u_resolution.x/u_resolution.y;
  vec2 md=p-m;float dl=length(md);
  p+=normalize(md+vec2(0.0001))*exp(-dl*5.0)*0.03;
  vec2 q=vec2(fbm(p*1.8+u_time*0.07),fbm(p*1.8+vec2(5.2,1.3)+u_time*0.06));
  vec2 r=vec2(fbm(p*2.0+q*1.3+vec2(1.7,9.2)+u_time*0.05),
              fbm(p*2.0+q*1.3+vec2(8.3,2.8)+u_time*0.04));
  float f=fbm(p*2.2+r*1.5);
  vec3 silverDark=vec3(0.86,0.85,0.84);
  vec3 paper=vec3(0.955,0.945,0.925);
  vec3 col=mix(silverDark,paper,f);
  float ph=r.x*2.2+u_time*0.35;
  col+=vec3(0.78,0.62,0.92)*sin(ph)*0.055;
  col+=vec3(0.55,0.72,0.95)*sin(ph*0.8+2.0)*0.05;
  float hl=smoothstep(0.48,0.92,f);
  col+=hl*0.06;
  gl_FragColor=vec4(col,1.0);
}`

// —— 风格 B：极细移动网格 ——
const FS_GRID = `precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_dark;
uniform vec3 u_accent;

float gridLine(vec2 uv, float spacing, float thickness){
  vec2 g = abs(fract(uv / spacing) - 0.5);
  float d = min(g.x, g.y);
  return 1.0 - smoothstep(thickness - 0.005, thickness + 0.005, d);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = uv;
  p.x *= aspect;

  vec2 drift = vec2(u_time * 0.008, u_time * 0.005);
  vec2 gp = p + drift;

  float mainGrid = gridLine(gp, 0.12, 0.012);
  float subGrid = gridLine(gp, 0.024, 0.04) * 0.4;

  vec2 m = u_mouse;
  m.x *= aspect;
  float md = length(p - m);
  float mInfluence = exp(-md * 4.0) * 0.5;

  float gridStrength = (mainGrid + subGrid * 0.5) * (0.45 + mInfluence);

  vec2 dotGrid = fract(gp * 50.0) - 0.5;
  float dotMask = 1.0 - smoothstep(0.05, 0.14, length(dotGrid));
  float wave = sin(gp.x * 1.4 + u_time * 0.15) * cos(gp.y * 1.6 - u_time * 0.12);
  dotMask *= smoothstep(-0.3, 0.6, wave) * 0.6;

  vec3 lineColor = mix(vec3(0.08), vec3(0.92), u_dark);
  vec3 bgColor = mix(vec3(0.97, 0.97, 0.96), vec3(0.06, 0.06, 0.07), u_dark);

  vec3 col = bgColor;
  col = mix(col, lineColor, gridStrength * 0.55);
  col = mix(col, lineColor, dotMask * 0.35);
  col = mix(col, u_accent, mInfluence * 0.18);

  gl_FragColor = vec4(col, 1.0);
}`

const mouse = { x: 0.5, y: 0.5 }
function onMouseMove(e) { mouse.x = e.clientX / innerWidth; mouse.y = e.clientY / innerHeight }

let raf = 0, t0 = 0
let drawDark = null, drawLight = null, drawGrid = null

function bootGL(canvas, fsSrc, withUniforms = false) {
  if (!canvas) return null
  const gl = canvas.getContext('webgl', { alpha: withUniforms, antialias: true, premultipliedAlpha: false })
  if (!gl) return null
  const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); return sh }
  const prog = gl.createProgram()
  gl.attachShader(prog, mk(gl.VERTEX_SHADER, VS))
  gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, fsSrc))
  gl.linkProgram(prog); gl.useProgram(prog)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
  const pos = gl.getAttribLocation(prog, 'position')
  gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
  const lRes = gl.getUniformLocation(prog, 'u_resolution')
  const lT = gl.getUniformLocation(prog, 'u_time')
  const lM = gl.getUniformLocation(prog, 'u_mouse')
  const lD = withUniforms ? gl.getUniformLocation(prog, 'u_dark') : null
  const lA = withUniforms ? gl.getUniformLocation(prog, 'u_accent') : null
  const resize = () => {
    const d = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = innerWidth * d; canvas.height = innerHeight * d
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  addEventListener('resize', resize); resize()
  return (tSec, isDark) => {
    gl.uniform2f(lRes, canvas.width, canvas.height)
    gl.uniform1f(lT, tSec)
    // 杂志风沿用原模板的 1-y 翻转；瑞士风网格直接用 y
    if (STYLE === 'magazine') gl.uniform2f(lM, mouse.x, 1 - mouse.y)
    else gl.uniform2f(lM, mouse.x, mouse.y)
    if (lD) gl.uniform1f(lD, isDark ? 1 : 0)
    if (lA) {
      const hex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#002FA7'
      const m2 = hex.match(/^#([0-9a-f]{6})$/i)
      if (m2) {
        const n = parseInt(m2[1], 16)
        gl.uniform3f(lA, ((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
      }
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    return true
  }
}

function start() {
  if (lowPower.value || raf) return
  if (STYLE === 'magazine') {
    if (!drawDark) drawDark = bootGL(darkEl.value, FS_DARK)
    if (!drawLight) drawLight = bootGL(lightEl.value, FS_LIGHT)
    if (!drawDark && !drawLight) return
  } else {
    if (!drawGrid) drawGrid = bootGL(gridEl.value, FS_GRID, true)
    if (!drawGrid) return
  }
  t0 = Date.now()
  const loop = () => {
    if (lowPower.value) { raf = 0; return }
    const t = (Date.now() - t0) / 1000
    if (STYLE === 'magazine') { drawDark?.(t); drawLight?.(t) }
    else drawGrid?.(t, deckThemeDark.value)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
}

function stop() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

// 瑞士风 canvas-mode（默认）：无 WebGL，直接不渲染画布
const renderGrid = STYLE === 'swiss' && !styleConfig.canvasMode

onMounted(() => {
  if (STYLE === 'swiss' && styleConfig.canvasMode) return
  addEventListener('mousemove', onMouseMove)
  start()
})
onBeforeUnmount(() => {
  removeEventListener('mousemove', onMouseMove)
  stop()
})
</script>

<template>
  <template v-if="STYLE === 'magazine'">
    <canvas id="bg-dark" class="bg" ref="darkEl"></canvas>
    <canvas id="bg-light" class="bg" ref="lightEl"></canvas>
  </template>
  <canvas v-else-if="renderGrid" id="bg-grid" class="bg" ref="gridEl"></canvas>
</template>
