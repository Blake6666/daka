// Day 13：三个视图共用的「状态展示组件」
// 【说人话】一个页面拿到数据时，只有三种「拿不到」的可能：
//   还在拿（loading）、拿到了但是空的（empty）、拿失败了（error）。
//   如果每个页面各写一遍这三种样式，肯定写得不一样。所以统一放这里，
//   三个视图都调用它 —— 同一类东西长得一样，这是 DESIGN_RULES 第 6 节的要求。

// 加载中：灰色骨架条，宽度错开，看起来像内容正在一块块填进来
export function LoadingState({ rows = 6, label = '正在加载…' }) {
  return (
    <div className="state-box state-loading" role="status" aria-live="polite">
      <p className="state-label">{label}</p>
      <div className="state-skeleton">
        {Array.from({ length: rows }, (_, i) => (
          <div className="sk sk-row" key={i} style={{ width: `${100 - i * 7}%` }} />
        ))}
      </div>
    </div>
  )
}

// 空状态：说清「为什么空」，并给一条下一步该做什么
export function EmptyState({ title, text, actionLabel, onAction }) {
  return (
    <div className="state-box state-empty">
      <p className="state-icon" aria-hidden="true">
        🗂
      </p>
      <p className="state-title">{title}</p>
      {text && <p className="state-text">{text}</p>}
      {actionLabel && (
        <button className="state-btn" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// 错误状态：说清「出什么事了」+ 给一个能救的动作（重试）
export function ErrorState({ title, text, actionLabel = '重试', onAction }) {
  return (
    <div className="state-box state-error" role="alert">
      <p className="state-icon" aria-hidden="true">
        ⚠️
      </p>
      <p className="state-title">{title}</p>
      {text && <p className="state-text">{text}</p>}
      {onAction && (
        <button className="state-btn" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// 网址乱敲时的兜底（不是四种状态之一，属于「路由没匹配到页面」）
export function NotFoundState({ path, onHome }) {
  return (
    <div className="state-box state-empty">
      <p className="state-icon" aria-hidden="true">
        🧭
      </p>
      <p className="state-title">没有这个页面</p>
      <p className="state-text">
        地址 <code>{path}</code> 不存在，可能是手敲错了。
      </p>
      <button className="state-btn" type="button" onClick={onHome}>
        回到首页
      </button>
    </div>
  )
}
