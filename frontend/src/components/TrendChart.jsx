// 7 天趋势折线图（Day 8 第 3 步）—— 手绘 SVG，不装任何图表库
//
// 为什么不算成折线图，而算成「指数」：
//   三个平台的热度量级差太多（抖音约 1.28 亿、B站约 1 亿、百度约 1100 万），
//   直接画在同一根纵轴上，百度那条线会贴着底部看不出起伏。
//   所以每家都以「自己这 7 天的平均值 = 100」换算成相对指数：
//     指数 = 当天总热度 ÷ 该平台 7 天平均热度 × 100
//   这样三条线都落在 90~110 附近，谁在涨、谁在跌，一眼可见。
//
// 线的颜色不写死在 JS 里，交给 CSS（styles.css 里的 .trend-line.平台名），
// 因为抖音品牌色是黑色，在深色模式下会看不见，需要按主题换色。

import { useState } from 'react'

const W = 680
const H = 260
const PAD = { l: 46, r: 18, t: 20, b: 34 }

export default function TrendChart({ data }) {
  const [hover, setHover] = useState(-1) // 鼠标停在第几天（-1 = 没停）
  const { days, series } = data
  const n = days.length

  // 1. 每个平台先算 7 天均值，再把每天换算成指数
  const indexed = series.map((s) => {
    const avg = s.values.reduce((a, b) => a + b, 0) / s.values.length
    return { ...s, idx: s.values.map((v) => (v / avg) * 100) }
  })

  // 2. 纵轴范围：把所有指数包进去，上下各留一点空隙
  const all = indexed.flatMap((s) => s.idx)
  const yMin = Math.floor(Math.min(...all) - 4)
  const yMax = Math.ceil(Math.max(...all) + 4)

  const plotW = W - PAD.l - PAD.r
  const plotH = H - PAD.t - PAD.b
  // 数据坐标 → SVG 坐标（纵轴要翻转：值越大越靠上）
  const px = (i) => PAD.l + (i / (n - 1)) * plotW
  const py = (v) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * plotH

  // 4 条横向参考线（含最上和最下）
  const ticks = [0, 1, 2, 3].map((k) => yMax - (k * (yMax - yMin)) / 3)

  // 悬停浮层的横向位置：夹在 14%~86% 之间，免得贴到卡片边缘被切掉
  const tipLeft = Math.min(86, Math.max(14, (px(hover) / W) * 100))

  return (
    <div className="trend-wrap">
      <svg
        className="trend-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="7 天热度趋势折线图"
      >
        {/* 横向参考线 + 纵轴刻度 */}
        {ticks.map((t) => (
          <g key={t}>
            <line className="trend-grid" x1={PAD.l} x2={W - PAD.r} y1={py(t)} y2={py(t)} />
            <text className="trend-tick" x={PAD.l - 8} y={py(t) + 4} textAnchor="end">
              {Math.round(t)}
            </text>
          </g>
        ))}

        {/* 鼠标停住那天的竖向参考线 */}
        {hover >= 0 && (
          <line
            className="trend-cursor"
            x1={px(hover)}
            x2={px(hover)}
            y1={PAD.t}
            y2={H - PAD.b}
          />
        )}

        {/* 三条折线 */}
        {indexed.map((s) => (
          <polyline
            key={s.platform}
            className={`trend-line ${s.platform}`}
            points={s.idx.map((v, i) => `${px(i)},${py(v)}`).join(' ')}
          />
        ))}

        {/* 每天的数据点（鼠标停住那天放大） */}
        {indexed.map((s) =>
          s.idx.map((v, i) => (
            <circle
              key={`${s.platform}-${i}`}
              className={`trend-dot ${s.platform}${hover === i ? ' on' : ''}`}
              cx={px(i)}
              cy={py(v)}
              r={hover === i ? 4.5 : 2.6}
            />
          ))
        )}

        {/* 横轴日期 */}
        {days.map((d, i) => (
          <text
            key={d}
            className="trend-tick trend-day"
            x={px(i)}
            y={H - 10}
            textAnchor="middle"
          >
            {d}
          </text>
        ))}

        {/* 每天一个透明竖条盖在最上层接鼠标（SVG 里靠它做悬停） */}
        {days.map((d, i) => (
          <rect
            key={`hit-${d}`}
            className="trend-hit"
            x={PAD.l + (i * plotW) / n}
            y={PAD.t}
            width={plotW / n}
            height={plotH}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(-1)}
          />
        ))}
      </svg>

      {/* 悬停浮层：用 HTML 画，比在 SVG 里排版文字省事得多 */}
      {hover >= 0 && (
        <div className="trend-tip" style={{ left: `${tipLeft}%` }}>
          <p className="trend-tip-day">{days[hover]}</p>
          {indexed.map((s) => (
            <p key={s.platform} className="trend-tip-row">
              <i className={`tip-dot ${s.platform}`} />
              {s.name}
              <b>{s.idx[hover].toFixed(1)}</b>
            </p>
          ))}
        </div>
      )}

      {/* 图例 */}
      <div className="trend-legend">
        {indexed.map((s) => (
          <span key={s.platform} className="trend-legend-item">
            <i className={`tip-dot ${s.platform}`} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}
