// 词云（Day 8 创建；Day 10 重做为「中心辐射式」布局）
//
// 视觉规则：
//   ① 权重最高的词放在**正中央、字号最大**
//   ② 其余词沿螺旋线从中心向外找空位，谁先找到谁先落座 → 自然形成「里大外小」
//   ③ 词与词互不重叠（矩形碰撞检测），长短词交错点缀，看起来散乱但不打架
//
// 布局算法（零依赖，纯手写，不装任何图表/词云库）：
//   阿基米德螺旋 r = k·θ：从圆心出发、每圈半径递增。
//   对每个词沿螺旋扫描候选点，第一个「不出界 + 不压到已放好的词」的点就是它的位置。
//   扫不到空位就把字号缩小 15% 再扫，仍不行就跳过这个词——
//   宁可少放一个词，也不让两个词叠在一起（叠字是最难看的）。
//
// 诚实说明：现在是 mock 数据，词来自 hotlistData.js 的 WORD_CLOUD。
// 第 3 周接真 API 后把 words 换成接口返回的关键词即可，本组件一行都不用改。

import { useLayoutEffect, useMemo, useRef, useState } from 'react'

const GAP = 3 // 词与词之间的最小视觉空隙（px）
const SPIRAL_TURNS = 22 // 螺旋圈数：圈数越多，找位越细，越容易把词塞进缝隙
const SAMPLES = 2200 // 每条螺旋上的候选点数量

// 估算一段文字在指定字号下占多少像素（中文按 1em、英文数字按 0.55em）
function measure(text, size) {
  let units = 0
  for (const ch of text) units += ch.charCodeAt(0) > 0x2e80 ? 1 : 0.55
  return { w: units * size, h: size * 1.2 }
}

// 布局：算出每个词最终的位置和字号
function layout(words, W, H) {
  const placed = []
  const cx = W / 2
  const cy = H / 2
  const maxR = Math.sqrt(W * W + H * H) / 2 // 螺旋最远能到容器对角，保证能覆盖整块区域
  const angMax = SPIRAL_TURNS * 2 * Math.PI

  for (const word of words) {
    let settled = false

    // 先按原字号试；塞不下就逐级缩小（最多缩到约 70%），实在放不下就跳过
    for (let scale = 1; scale >= 0.69 && !settled; scale -= 0.15) {
      const size = Math.max(11, Math.round(word.size * scale))
      const text = measure(word.text, size)
      const bw = text.w + GAP * 2 // 碰撞盒（含空隙）
      const bh = text.h + GAP * 2

      // 起点角度按词本身错开，让不同的词从不同方向开始找位 —— 分布更"散"、不呆板
      const seed = [...word.text].reduce((s, ch) => s + ch.charCodeAt(0), 0)
      const phase = ((seed % 100) / 100) * 0.9

      for (let i = 0; i < SAMPLES; i++) {
        const t = i / SAMPLES
        const ang = phase + t * angMax
        const r = t * maxR
        const x = cx + r * Math.cos(ang) - bw / 2 // 碰撞盒左上角
        const y = cy + r * Math.sin(ang) - bh / 2

        // ① 必须整个待在容器里，不能探出去
        if (x < 0 || y < 0 || x + bw > W || y + bh > H) continue

        // ② 不能压到任何已经放好的词
        let hit = false
        for (const p of placed) {
          if (x < p.x + p.w && x + bw > p.x && y < p.y + p.h && y + bh > p.y) {
            hit = true
            break
          }
        }
        if (hit) continue

        placed.push({ ...word, size, x, y, w: bw, h: bh, textW: text.w, textH: text.h })
        settled = true
        break
      }
    }
  }
  return placed
}

export default function WordCloud({ words, active, onPick }) {
  const boxRef = useRef(null)
  const [box, setBox] = useState({ w: 0, h: 0 })

  // 量容器的实际尺寸；窗口缩放、手机横竖屏切换都会重量一次
  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const update = () => {
      const w = Math.round(el.clientWidth)
      const h = Math.round(el.clientHeight)
      setBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
    }
    update()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const placed = useMemo(() => {
    if (!words || !words.length || box.w < 160 || box.h < 160) return []

    const weights = words.map((w) => w.weight)
    const wMax = Math.max(...weights)
    const wMin = Math.min(...weights)

    // 字号随容器自适应：窄屏自动变小，不会挤成一团
    const maxSize = Math.min(44, Math.max(24, Math.min(box.w, box.h) * 0.105))
    const minSize = Math.max(11, maxSize * 0.26)

    // 权重 → 字号，**用线性而不是开方**：开方会把差距压平（第一版第一名 40px、第二名 38px，
    // 看上去就是"一堆差不多大的字"，没有重心）。权重本身已按长尾分布设定，线性映射
    // 才能让第一名真正"最大"、越往后越小。
    // 再按「词长」做一点收束：6 个字的长词若也按 44px 渲染会有 264px 宽、横占半行，
    // 反而把它自己挤出去。长词略微收小，长短搭配更耐看，也更容易全部落位。
    const list = words
      .map((w) => {
        const ratio = wMax === wMin ? 1 : (w.weight - wMin) / (wMax - wMin)
        const lenCount = [...w.text].length
        const lenFactor = lenCount <= 3 ? 1 : Math.max(0.74, 1 - (lenCount - 3) * 0.11)
        const size = Math.round((minSize + (maxSize - minSize) * ratio) * lenFactor)
        return { ...w, size }
      })
      .sort((a, b) => b.size - a.size) // 大的先放，才能占住正中央

    return layout(list, box.w, box.h)
  }, [words, box.w, box.h])

  if (!words || !words.length) return <p className="wc-empty">加载中…</p>

  return (
    <div className="word-cloud" ref={boxRef}>
      {placed.map((w) => (
        <button
          key={w.text}
          type="button"
          className={`wc-word ${w.platform}${active === w.text ? ' active' : ''}`}
          style={{
            left: `${w.x + GAP}px`,
            top: `${w.y + GAP}px`,
            width: `${w.textW}px`,
            height: `${w.textH}px`,
            fontSize: `${w.size}px`,
            lineHeight: `${w.textH}px`
          }}
          title={`${w.text}：点一下只看含这个词的热搜`}
          onClick={() => onPick(active === w.text ? '' : w.text)}
        >
          {w.text}
        </button>
      ))}
    </div>
  )
}
