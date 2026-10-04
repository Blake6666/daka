# headless-page-verify（项目内拷贝）

> **为什么有这份拷贝**：这个技能原本装在用户级目录 `~/.workbuddy/skills/`，换 WorkBuddy 账号或换电脑时可能丢失。
> 项目内这份拷贝跟着 Git 走，任何环境下都能拿回来。
> 如果你那边已经装了这个技能，用装的那个即可；这份是「保险」。

---
name: headless-page-verify
description: 用系统自带 Edge/Chrome 的无头模式 + CDP 调试协议，真实打开本地或线上网页来验证效果——判断是否白屏、点击/输入等交互是否生效、控制台有无运行时报错、并生成截图。零安装（不下载 Playwright/Chromium）。当需要"亲眼确认"页面真的能跑、或要交付页面截图时使用。
agent_created: true
---

# 无头浏览器验证网页（零安装）

## 何时用

- 改完前端后要确认页面**不是白屏**、交互真的生效、控制台没报错。
- 需要给页面截图（浅色/深色/某交互态）。
- **不要**用 `agent-browser` skill 做这些：它要下载约 500MB Chromium。只有需要复杂多步自动化（登录、表单、多页流程）时才用它。

## 核心思路

系统自带的 Edge/Chrome 就支持 `--headless=new`，且能用 `--remote-debugging-port` 暴露 CDP 协议。Node 18+ 内置 `WebSocket` 和 `fetch`，所以**不需要装任何 npm 包**就能驱动真实浏览器。

## 步骤

### 1. 先找浏览器

```bash
for p in "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
         "/c/Program Files/Microsoft/Edge/Application/msedge.exe" \
         "/c/Program Files/Google/Chrome/Application/chrome.exe" \
         "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"; do
  [ -f "$p" ] && echo "FOUND: $p"
done
```

### 2. 快速判断是否白屏（30 秒）

```bash
"<msedge>" --headless=new --disable-gpu --no-sandbox --dump-dom \
  --virtual-time-budget=6000 "http://localhost:5173/" > "$TEMP/dom.html"
```

`--virtual-time-budget` 必须给（给 JS 留时间跑完，含 setTimeout 模拟的异步请求）。然后用 node 读文件检查关键字：

```js
const t = require('fs').readFileSync(process.env.TEMP + '/dom.html', 'utf8')
for (const k of ['页面标题', '某条数据文字']) console.log((t.includes(k) ? '✅ ' : '❌ ') + k)
```

### 3. 验证交互 + 抓运行时报错（正式验证）

用 CDP 脚本，骨架固定如下。**关键点已在代码里用注释标出**：

```js
import { spawn } from 'node:child_process'
import os from 'node:os'; import path from 'node:path'; import fs from 'node:fs'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const URL = 'http://localhost:5173/'
const PORT = 9333
const profile = path.join(os.tmpdir(), 'edge_profile_tmp')
fs.rmSync(profile, { recursive: true, force: true })  // 每次用干净 profile，避免旧实例冲突

const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--window-size=1440,1080', URL], { stdio: 'ignore' })

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const log = (ok, msg) => console.log(`${ok ? '✅' : '❌'} ${msg}`)

// 等调试端口就绪（重试，别用固定 sleep）
async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const p = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl)
      if (p) return p.webSocketDebuggerUrl
    } catch {}
    await sleep(300)
  }
  throw new Error('调试端口没起来')
}

const ws = new WebSocket(await getWsUrl())
await new Promise(r => (ws.onopen = r))
let id = 0; const pending = new Map(); const consoleErrors = []

ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) {           // 命令的返回
    const p = pending.get(m.id); pending.delete(m.id)
    m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result)
    return
  }
  // 事件：抓白屏元凶
  if (m.method === 'Runtime.exceptionThrown')
    consoleErrors.push('未捕获异常: ' + (m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text))
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
    consoleErrors.push('console.error: ' + m.params.args.map(a => a.value || a.description || '').join(' '))
}

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const mid = ++id; pending.set(mid, { resolve, reject })
  ws.send(JSON.stringify({ id: mid, method, params }))
})

// evaluate 会把页面内的报错也抛出来（否则报错被静默吞掉）
const ev = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error('页面内报错: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text))
  return r.result.value
}
const shot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'png' })
  const f = path.join(os.tmpdir(), 'shots', name); fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, Buffer.from(r.data, 'base64')); console.log('已保存 ' + f)
}

await send('Runtime.enable')   // 必须，否则收不到 console/异常事件
await send('Page.enable')
await sleep(2500)              // 等框架挂载 + 首屏异步数据（按项目调整）

// —— 在这里写你的断言 ——
log(await ev(`document.querySelectorAll('.item').length`) === 20, '渲染 20 条')
await ev(`document.querySelector('.btn').click()`)
await sleep(150)               // ⚠️ React 状态更新是异步的，必须等，否则误判
// 受控输入框：直接改 value 不会触发 onChange，要用原生 setter
await ev(`(() => { const i = document.querySelector('.search input');
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(i, '关键词');
  i.dispatchEvent(new Event('input', { bubbles: true })); })()`)
await sleep(500)
await ev(`document.querySelector('.nav-btn').click()`); await sleep(600)
await shot('state.png')

log(consoleErrors.length === 0, consoleErrors.length ? '报错:\n   ' + consoleErrors.join('\n   ') : '控制台无报错')

ws.close(); edge.kill(); await sleep(600)
try { fs.rmSync(profile, { recursive: true, force: true }) } catch {}
process.exit(0)
```

跑：`"<node.exe>" script.mjs`

## 坑（都踩过）

1. **React 状态更新是异步的**：`.click()` 返回后立刻读 DOM 读不到变化，会误判成 bug。等 100~150ms。命令式按钮（submit/close）可等更短。
2. **受控输入框**：`input.value = 'x'` 不触发 React onChange，必须用原型上的原生 value setter + `dispatchEvent(new Event('input', { bubbles: true }))`。
3. **必须 `Runtime.enable`**，否则收不到 `exceptionThrown` / `consoleAPICalled`，等于没查报错。
4. **`--virtual-time-budget` 用 `--dump-dom` 时必须给**，否则拿到的是 JS 还没跑的空壳，会误判白屏。
5. **用独立的临时 `--user-data-dir`**，否则用户已开的 Edge 会接管、调试端口起不来。
6. 跑完记得 `ws.close()` + `edge.kill()` + 删临时 profile，否则留僵尸进程。
7. 脚本写到系统临时目录，**不要写进项目仓库**（除非用户要求保留）。
8. **别靠肉眼看低分辨率截图判断 DOM 细节**（曾把截图上一处看错、以为多渲染了个元素，用 DOM 查询才证实是错觉）。DOM/接口查询是权威，截图只作观感参考。
9. **元素放大截图的 clip 是「文档坐标」，必须配 `captureBeyondViewport: true`**：
   ```js
   // ❌ 先 scrollIntoView 再按 getBoundingClientRect 截 → 截到空白或错位
   // ✅ 文档坐标 = 视口坐标 + 滚动量，并开启 captureBeyondViewport
   const box = await ev(`(() => { const r = document.querySelector(SEL).getBoundingClientRect()
     return { x: r.left + window.scrollX - 12, y: r.top + window.scrollY - 12, width: r.width + 24, height: r.height + 24 } })()`)
   await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, fromSurface: true,
     clip: { ...box, scale: 4 } })
   ```
   截完可以再用 `document.elementFromPoint(x - scrollX, y - scrollY)` 做「坐标自检」，确认截的区域里确实是目标元素。
10. **采样短暂状态要踩准窗口**：加载态/骨架屏可能只持续几百毫秒（本项目 400ms）。点了刷新后**在 100ms 内**开始采样，并且**循环采几次**（例如每 70ms 一次共 6 次），否则会误判成"功能坏了"。不要固定等一个大值再查。
11. **类名别猜**：查骨架屏时先 `grep` 源码确认真实类名（本项目是 `.sk-item`，不是 `.skeleton`），选择器写错会报假故障。
12. **验证"可点区大小"要用命中测试，不能用 `getBoundingClientRect`**：元素的可点范围常由 `::after` 伪元素或负外边距撑出，`rect` 量不到。正确做法是在目标半径的四个角上问浏览器"这一点是谁"：
    ```js
    const el = document.elementFromPoint(cx + dx, cy + dy)
    const hit = !!el?.closest('.target-selector')
    ```
13. **给元素加 `min-width/min-height` 撑大可点区会改变布局**（本项目把搜索框从 37px 撑到 50px，属视觉回归）。要「可点区变大但布局不变」，用绝对定位的透明层：`position: relative` + `::after { position: absolute; top: 50%; left: 50%; width: 32px; height: 32px; transform: translate(-50%, -50%) }`。
14. **量对比度前先确认测量工具认得出渐变**：只读 `background-color` 会把 `linear-gradient` 背景和 `background-clip: text` 渐变文字当成"没有背景"，报出大量假故障（本项目误报 163 处，实际 22 处）。要解析 `background-image` 里的色标分别算、取最差；`color: rgba(0,0,0,0)` 或带 `background-clip: text` 的元素，文字色要取自己 `background-image` 的色标，底色要往上找祖先的纯色。
15. **验证「元素互不重叠」只能靠矩形两两相交**：词云、标签云、图表标注这类绝对定位布局在截图上看不出轻微叠字。探针里对每个元素取 `getBoundingClientRect` 后两两判断 `a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top`。同时用「离容器中心最近的元素是谁」「最大的元素是谁」「四个象限各有多少个」三个指标来证明布局**形态**（例：验证"最大的词居中"就断言 最大字号元素 同时也是 距中心最近的元素）。
16. **断言别写死会随内容/参数变化的数字**：写 `check(count === 36)` 时，一旦真实数量是 33，后面所有依赖它的检查（如"深色模式下也正常"）都会连带报假失败，看起来像坏了三处、实际只有一处。**把数字打印出来看，断言只写真正的不变量**（无重叠、无出界、最大元素居中）。
17. **`document.elementFromPoint` 只认视口坐标**：长图/元素放大截图的坐标自检若在页面已滚动或目标在视口外时会返回 `null`，别据此判定截图错位。要么先滚动到目标再自检，要么改用文档坐标（`rect.top + scrollY`）。
