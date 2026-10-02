import { useEffect, useRef, useState } from 'react'

// Day 11：可复用的「复制标题」按钮 —— 一个不依赖后端的交互反馈样板。
// 四个状态：idle（待操作）→ busy（处理中，按钮禁用防连点）→ ok（成功）→ fail（失败）。
// 成功/失败都有可感知的反馈（图标变色 + 气泡 + 动画），2 秒后自动回到待操作态。

const RESET_MS = 2000 // 反馈停留多久，之后按钮复原

// 降级方案：老环境的 execCommand 复制（现代浏览器基本走不到，只是兜底）
function legacyCopy(text) {
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}

export default function CopyButton({ text, title = '复制标题' }) {
  const [state, setState] = useState('idle') // idle | busy | ok | fail
  const timer = useRef(null)

  // 组件卸载时清掉定时器，避免对已卸载组件 setState 的警告
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    if (state === 'busy') return // 处理中不可重复点击（清单硬要求）
    setState('busy')
    let done = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        done = true
      } else {
        done = legacyCopy(text)
      }
    } catch {
      done = legacyCopy(text) // 现代通道被拒（如无权限）→ 走降级
    }
    setState(done ? 'ok' : 'fail')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), RESET_MS)
  }

  const icon =
    state === 'ok' ? '✓' : state === 'fail' ? '✕' : state === 'busy' ? '⏳' : '📋'
  const bubble =
    state === 'ok' ? '已复制' : state === 'fail' ? '复制失败，请手动选中标题复制' : ''

  return (
    <button
      type="button"
      className={`copy-btn ${state}`}
      title={title}
      aria-label={bubble ? `${title}：${bubble}` : title}
      disabled={state === 'busy'}
      onClick={copy}
    >
      <span className="copy-icon" aria-hidden="true">
        {icon}
      </span>
      {bubble && (
        <span className="copy-bubble" role="status">
          {bubble}
        </span>
      )}
    </button>
  )
}
