// Day 8 第 2 步：交互层接通
// 本步点亮导航栏三个控件：① 搜索框实时筛选三榜 ② 刷新按钮（旋转动画+成功提示）
// ③ 深/浅色切换（平滑过渡 + localStorage 记忆，下次打开保持）。
// Day 8 第 3 步：内容区补齐——分类筛选标签、热搜词云（点词筛选）、7 天趋势折线图。
// 骨架（第 1 步）、收藏备注、四种页面状态、异常演示开关全部保留。

import { useState, useEffect } from 'react'
import { useFavorites, favKey } from './hooks/useFavorites'
import { useHotlists } from './hooks/useHotlists'
import { TREND_7D } from './data/hotlistData'
import WordCloud from './components/WordCloud'
import TrendChart from './components/TrendChart'

// 演示开关的选项（开发/验收用，让异常状态可以被亲眼看到）
const SCENARIOS = [
  { key: 'normal', label: '正常' },
  { key: 'douyin-error', label: '单榜失败' },
  { key: 'all-error', label: '全部失败' },
  { key: 'bilibili-empty', label: '空榜单' }
]

// 把 "482万" 这样的热度文字换算成可比较的数字（用于热度条比例和统计）
const heatNum = (h) => {
  const m = String(h).match(/([\d.]+)/)
  if (!m) return 0
  const n = parseFloat(m[1])
  return String(h).includes('亿') ? n * 10000 : n
}

// 热搜标签的样式映射：沸=红底爆点，热/新=粉底红字
const TAG_STYLE = { 沸: 'fei', 热: 're', 新: 'xin' }

// 骨架屏占位平台
const SKELETON_PLATFORMS = ['douyin', 'bilibili', 'baidu']

// 深色模式在 localStorage 里的钥匙（刷新页面后记住你的选择）
const THEME_KEY = 'daka_theme'

export default function App() {
  const { favorites, isFavorited, toggle, setNote, count } = useFavorites()
  const { phase, lists, updatedAt, scenario, switchScenario, retry } = useHotlists()
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  // ===== 第 2 步新增的三个交互状态 =====
  const [query, setQuery] = useState('') // 搜索关键词
  const [theme, setTheme] = useState(() => {
    // 打开页面时读上次的选择，没选过默认浅色
    try {
      return localStorage.getItem(THEME_KEY) || 'light'
    } catch {
      return 'light'
    }
  })
  const [toast, setToast] = useState('') // 刷新成功提示文字
  const [toastPending, setToastPending] = useState(false) // 是否在等待刷新完成

  // ===== 第 3 步新增：分类筛选 =====
  // '全部' = 不筛；否则只看这个分类。词云点词也是改这里，所以两个入口天然同步。
  const [category, setCategory] = useState('全部')

  // 主题变化：写进 localStorage + 给 body 挂深色类（控制页面底色）
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // 隐私模式写不进就算了，不影响切换
    }
    document.body.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // 刷新完成信号：数据从 loading 变回 ok 时，弹成功提示，2.2 秒后自动消失
  useEffect(() => {
    if (toastPending && phase === 'ok') {
      setToastPending(false)
      setToast('榜单已刷新，数据已是最新 ✓')
      const t = setTimeout(() => setToast(''), 2200)
      return () => clearTimeout(t)
    }
  }, [toastPending, phase])

  // 点刷新：重新走一遍加载流程（mock 阶段就是重新模拟一次请求）
  const onRefresh = () => {
    if (phase === 'loading') return
    setToastPending(true)
    retry()
  }

  const startEdit = (platform, rank, currentNote) => {
    setEditing({ platform, rank, value: currentNote || '' })
  }

  const saveEdit = () => {
    if (!editing) return
    setNote(editing.platform, editing.rank, editing.value)
    setEditing(null)
  }

  const favList = Object.entries(favorites)
  // 注意：加载中和失败时 lists 还不存在，必须给空数组兜底（否则白屏，Day 7 踩过）
  const safeLists = lists || []
  const totalItems = safeLists.reduce((sum, l) => sum + l.items.length, 0)

  // Hero 统计卡 ③：全网热度最高词条（从 mock 数据里算出来）
  let topItem = null
  for (const l of safeLists) {
    for (const it of l.items) {
      if (!topItem || heatNum(it.heat) > heatNum(topItem.heat)) topItem = it
    }
  }

  // 搜索 + 分类：两个条件是「并且」关系（既输了关键词、又点了分类标签时同时生效）
  const q = query.trim()
  const filtering = !!q || category !== '全部'
  // 给「本榜没有…」提示拼一句人话，说明到底是哪个条件筛空的
  const condText = [
    q && `含「${q}」`,
    category !== '全部' && `属于「${category}」`
  ]
    .filter(Boolean)
    .join(' 且 ')
  const visibleLists = safeLists.map((list) => {
    if (list.status !== 'ok') return list
    return {
      ...list,
      items: list.items.filter(
        (it) =>
          (!q || it.title.includes(q)) &&
          (category === '全部' || it.category === category)
      )
    }
  })

  // 分类统计：从原始数据（不是筛选后的）算每个分类的条数、总热度、主导平台
  // → 给分类标签的条数徽标、词云的字号和颜色用
  const catMap = {}
  for (const l of safeLists) {
    if (l.status !== 'ok') continue
    for (const it of l.items) {
      if (!catMap[it.category]) {
        catMap[it.category] = { text: it.category, count: 0, heat: 0, byPlatform: {} }
      }
      const c = catMap[it.category]
      c.count += 1
      c.heat += heatNum(it.heat)
      c.byPlatform[l.platform] = (c.byPlatform[l.platform] || 0) + 1
    }
  }
  // 按总热度从高到低排：热门的分类自然排在标签栏和词云前面
  const categories = Object.values(catMap)
    .map((c) => ({
      ...c,
      heat: Math.round(c.heat),
      // 这个分类里条目最多的平台，决定词云里这个词的颜色
      platform: Object.entries(c.byPlatform).sort((a, b) => b[1] - a[1])[0][0]
    }))
    .sort((a, b) => b.heat - a.heat)

  return (
    <div className="page" data-theme={theme}>
      {/* ============ 顶部导航栏（吸顶悬浮） ============ */}
      <header className="navbar">
        <div className="nav-brand">
          <span className="nav-logo" aria-hidden="true">🔥</span>
          <span className="nav-name">全网热搜聚合</span>
        </div>

        <div className="nav-search">
          <span className="nav-search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            placeholder="搜索热搜关键词，三榜实时筛选…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {q && (
            <button
              className="nav-search-clear"
              type="button"
              aria-label="清空搜索"
              onClick={() => setQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="nav-actions">
          <span className="sample-badge">mock 数据</span>
          <button
            className="nav-btn"
            type="button"
            title="重新加载榜单"
            onClick={onRefresh}
            disabled={phase === 'loading'}
          >
            <span className={phase === 'loading' ? 'refresh-icon spinning' : 'refresh-icon'}>
              ⟳
            </span>{' '}
            刷新
          </button>
          <button
            className="nav-btn"
            type="button"
            title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="fav-entry" type="button" onClick={() => setPanelOpen(true)}>
            ★ 我的收藏
          </button>
        </div>
      </header>

      {/* ============ Hero 区：简介 + 统计面板 ============ */}
      <section className="hero">
        <h2 className="hero-title">一站式查看抖音、B站、百度实时热搜</h2>
        <p className="hero-sub">三个平台的热点榜单聚合在一页，点击任意条目跳转原平台原文</p>
        <div className="stat-cards">
          <div className="stat-card">
            <p className="stat-num">{phase === 'ok' ? totalItems : '--'}</p>
            <p className="stat-label">实时总热搜数</p>
          </div>
          <div className="stat-card">
            <p className="stat-num">{phase === 'ok' ? '18' : '--'}</p>
            <p className="stat-label">今日新增条数</p>
          </div>
          <div className="stat-card stat-wide">
            <p className="stat-num stat-top-title">
              {phase === 'ok' && topItem ? topItem.title : '--'}
            </p>
            <p className="stat-label">
              热度最高词条{phase === 'ok' && topItem ? ` · ${topItem.source} · ${topItem.heat}` : ''}
            </p>
          </div>
        </div>
      </section>

      {/* ============ 全部失败：统一提示（PRD 第 7 节第 2 行） ============ */}
      {phase === 'all-error' && (
        <main className="board">
          <div className="all-error">
            <p className="all-error-title">网络开小差了</p>
            <p className="all-error-text">暂时获取不到榜单数据，请检查网络后再试</p>
            <button className="retry-btn" type="button" onClick={retry}>
              重试
            </button>
          </div>
        </main>
      )}

      {/* ============ 三卡片榜单区 ============ */}
      {/* 分类筛选标签（第 3 步）：和词云点词共用同一个状态，点哪边另一边也会亮 */}
      {phase === 'ok' && categories.length > 0 && (
        <div className="cat-bar">
          <span className="cat-bar-label">分类</span>
          <button
            type="button"
            className={category === '全部' ? 'cat-pill active' : 'cat-pill'}
            onClick={() => setCategory('全部')}
          >
            全部
            <span className="cat-count">{totalItems}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.text}
              type="button"
              className={category === c.text ? 'cat-pill active' : 'cat-pill'}
              onClick={() => setCategory(category === c.text ? '全部' : c.text)}
            >
              {c.text}
              <span className="cat-count">{c.count}</span>
            </button>
          ))}
          {filtering && (
            <button
              type="button"
              className="cat-reset"
              onClick={() => {
                setCategory('全部')
                setQuery('')
              }}
            >
              清空筛选
            </button>
          )}
        </div>
      )}

      {(phase === 'loading' || phase === 'ok') && (
        <main className="board">
          {phase === 'loading' &&
            SKELETON_PLATFORMS.map((p) => (
              <section className={`column ${p}`} key={p}>
                <div className="column-head">
                  <div className="sk sk-head" />
                  <div className="sk sk-chip" />
                </div>
                <div className="hot-list">
                  {[...Array(10)].map((_, i) => (
                    <div className="sk sk-item" key={i} />
                  ))}
                </div>
              </section>
            ))}

          {phase === 'ok' &&
            visibleLists.map((list) => {
              // 本栏最高热度，条目下迷你热度条按比例算长度
              const maxHeat = Math.max(...list.items.map((it) => heatNum(it.heat)), 1)

              return (
                <section className={`column ${list.platform}`} key={list.platform}>
                  <div className="column-head">
                    <h2>{list.name}</h2>
                    <span className="column-hint">
                      <span className="live-dot" aria-hidden="true" />
                      {list.updated_at ? `更新 ${list.updated_at.slice(11)}` : '实时'}
                    </span>
                  </div>

                  {/* 单榜失败：这一栏显示提示，另两栏不受影响 */}
                  {list.status === 'error' && (
                    <div className="col-error">
                      <p>暂时获取不到{list.name}榜单</p>
                      <p className="col-error-sub">其他榜单不受影响</p>
                      <button className="retry-btn" type="button" onClick={retry}>
                        重试
                      </button>
                    </div>
                  )}

                  {/* 空榜单 */}
                  {list.status === 'empty' && (
                    <div className="col-empty">
                      <p>今天暂时没有数据</p>
                    </div>
                  )}

                  {/* 筛选后这一栏空了：提示里说清是关键词还是分类筛空的 */}
                  {list.status === 'ok' && filtering && list.items.length === 0 && (
                    <div className="col-empty">
                      <p>本榜没有{condText}的热搜</p>
                    </div>
                  )}

                  {list.status === 'ok' && list.items.length > 0 && (
                    <>
                      <ol className="hot-list">
                        {list.items.map((item) => {
                          const isFav = isFavorited(list.platform, item.rank)
                          const isEditing =
                            editing &&
                            editing.platform === list.platform &&
                            editing.rank === item.rank
                          const note = isFav
                            ? favorites[favKey(list.platform, item.rank)].note
                            : ''
                          const barWidth = Math.max(
                            6,
                            Math.round((heatNum(item.heat) / maxHeat) * 100)
                          )

                          return (
                            <li
                              className={item.rank <= 3 ? 'hot-item top' : 'hot-item'}
                              key={item.rank}
                              title={`${item.source}热搜第 ${item.rank} 名 · ${item.category} · 点击查看原文`}
                            >
                              <span
                                className={
                                  item.rank <= 3 ? `rank rank-${item.rank}` : 'rank'
                                }
                              >
                                {item.rank}
                              </span>
                              <div className="item-main">
                                <div className="item-row">
                                  <a
                                    className="title"
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {item.title}
                                  </a>
                                  {item.tag && (
                                    <span
                                      className={`tag tag-${TAG_STYLE[item.tag] || 're'}`}
                                    >
                                      {item.tag}
                                    </span>
                                  )}
                                  <span className="heat">{item.heat}</span>
                                  <button
                                    className={isFav ? 'fav-star active' : 'fav-star'}
                                    type="button"
                                    aria-label={isFav ? '取消收藏' : '收藏'}
                                    title={isFav ? '取消收藏' : '收藏'}
                                    onClick={() => toggle(item, list.platform)}
                                  >
                                    {isFav ? '★' : '☆'}
                                  </button>
                                </div>

                                {/* 迷你热度条：长度 = 本条热度 / 本栏最高热度 */}
                                <div className="heat-bar" aria-hidden="true">
                                  <i style={{ width: `${barWidth}%` }} />
                                </div>

                                {isFav && !isEditing && (
                                  <div className="note-area">
                                    {note && <p className="note-text">{note}</p>}
                                    <button
                                      className="note-btn"
                                      type="button"
                                      onClick={() =>
                                        startEdit(list.platform, item.rank, note)
                                      }
                                    >
                                      {note ? '改备注' : '写备注'}
                                    </button>
                                  </div>
                                )}

                                {isEditing && (
                                  <div className="note-editor">
                                    <input
                                      type="text"
                                      maxLength={100}
                                      autoFocus
                                      placeholder="写一句备注（最长 100 字）"
                                      value={editing.value}
                                      onChange={(e) =>
                                        setEditing({ ...editing, value: e.target.value })
                                      }
                                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                    />
                                    <button type="button" onClick={saveEdit}>
                                      保存
                                    </button>
                                    <button
                                      className="ghost"
                                      type="button"
                                      onClick={() => setEditing(null)}
                                    >
                                      取消
                                    </button>
                                  </div>
                                )}
                              </div>
                            </li>
                          )
                        })}
                      </ol>
                      <a
                        className="view-more"
                        href={list.items[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        查看完整榜单 →
                      </a>
                    </>
                  )}
                </section>
              )
            })}
        </main>
      )}

      {/* ============ 洞察区（第 3 步）：词云 + 7 天趋势 ============ */}
      {phase === 'ok' && (
        <section className="insights">
          <div className="insight-card">
            <div className="insight-head">
              <h3>热搜词云</h3>
              <span className="insight-hint">点词 = 只看这个分类</span>
            </div>
            <WordCloud words={categories} active={category} onPick={setCategory} />
            <p className="insight-note">
              字号 = 该分类的总热度，颜色 = 这个分类里条目最多的平台。当前是 mock
              数据，「词」取自条目的分类字段；接真接口后换成真实关键词即可。
            </p>
          </div>

          <div className="insight-card">
            <div className="insight-head">
              <h3>7 天热度趋势</h3>
              <span className="insight-hint">指数 100 = 该平台一周均值</span>
            </div>
            <TrendChart data={TREND_7D} />
            <p className="insight-note">
              三个平台量级差太多（抖音约 1.28 亿、百度约 1100 万），直接比会被压扁，所以换算成相对指数：指数
              = 当天热度 ÷ 该平台 7 天平均热度 × 100。
            </p>
          </div>
        </section>
      )}

      {/* ============ 我的收藏 面板 ============ */}
      {panelOpen && (
        <div className="modal-mask" onClick={() => setPanelOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>我的收藏（{count}）</h3>
              <button type="button" onClick={() => setPanelOpen(false)}>
                关闭
              </button>
            </div>

            {favList.length === 0 ? (
              <p className="fav-empty">还没有收藏，去榜单上点 ☆ 试试</p>
            ) : (
              <ul className="fav-list">
                {favList.map(([key, f]) => (
                  <li className="fav-item" key={key}>
                    <span className="rank">{f.rank}</span>
                    <div className="fav-main">
                      <a
                        className="title"
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {f.title}
                      </a>
                      {f.note && <p className="note-text">{f.note}</p>}
                    </div>
                    <div className="fav-meta">
                      <span>{f.source}</span>
                      <span>{f.favoritedAt}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <p className="fav-hint">
              收藏和备注只保存在你这台设备的浏览器里；换设备或清缓存后不保留，无需注册。
            </p>
          </div>
        </div>
      )}

      {/* ============ 刷新成功提示（轻量 toast，自动消失） ============ */}
      {toast && <div className="toast">{toast}</div>}

      {/* ============ 页脚与演示开关 ============ */}
      <footer className="footnote">
        <div className="demo-bar">
          <span>异常演示（验收第 8 条用）：</span>
          {SCENARIOS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={scenario === s.key ? 'demo-btn active' : 'demo-btn'}
              onClick={() => switchScenario(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p>
          mock 数据版本（Day 8 · 搜索/刷新/深浅色 + 分类筛选 + 词云 + 7 天趋势）｜点击标题跳转原平台｜收藏和备注保存在你自己的浏览器里，无需注册
        </p>
      </footer>
    </div>
  )
}
