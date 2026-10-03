// Day 13：App.jsx 从「什么都装」瘦成「外壳」——只负责三件事
//   ① 顶栏（品牌 / 搜索 / 刷新 / 深浅色 / 收藏入口 + 三个视图的切换按钮）
//   ② 根据地址决定显示哪个视图（路由出口）
//   ③ 全站共用的东西：我的收藏面板、页脚、异常演示开关
// 页面内容全部搬到 src/views/ 下的三个文件里了。

import { useState, useEffect } from 'react'
import { useFavorites, favKey } from './hooks/useFavorites'
import { useHotlists } from './hooks/useHotlists'
import CopyButton from './components/CopyButton'
import { NotFoundState } from './components/StateBlock'
import { useHashRoute, navigate } from './router'
import HomeView from './views/HomeView'
import PlatformView from './views/PlatformView'
import ItemView from './views/ItemView'

// 演示开关的选项（开发/验收用，让异常状态可以被亲眼看到）
// Day 13 新增「卡在加载」：正常加载只有 400ms，来不及截图，这一档会一直停在加载态
const SCENARIOS = [
  { key: 'normal', label: '正常' },
  { key: 'loading-stuck', label: '卡在加载' },
  { key: 'douyin-error', label: '单榜失败' },
  { key: 'all-error', label: '全部失败' },
  { key: 'bilibili-empty', label: '空榜单' }
]

// 顶栏的三个视图入口（清单要求的「可访问的导航标签」，键盘 Tab 能走到）
const VIEWS = [
  { key: 'home', label: '首页', hash: '/' },
  { key: 'platform', label: '平台榜单', hash: '/platform/douyin' },
  { key: 'item', label: '热搜详情', hash: '/item/douyin/1' }
]

// 深色模式在 localStorage 里的钥匙（刷新页面后记住你的选择）
const THEME_KEY = 'daka_theme'

export default function App() {
  const fav = useFavorites()
  const { favorites, count } = fav
  const hot = useHotlists()
  const { phase, scenario, switchScenario, retry } = hot
  const route = useHashRoute()
  const [panelOpen, setPanelOpen] = useState(false)

  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'light'
    } catch {
      return 'light'
    }
  })
  const [toast, setToast] = useState('')
  const [toastPending, setToastPending] = useState(false)

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

  // 换页面时把滚动位置拉回顶部，不然从第 20 条点进详情会停在半空
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route.name, route.params.platform, route.params.rank])

  const favList = Object.entries(favorites)

  // ===== 路由出口：根据地址渲染对应视图 =====
  const view = (() => {
    if (route.name === 'home') {
      return <HomeView hot={hot} query={query} setQuery={setQuery} fav={fav} />
    }
    if (route.name === 'platform') {
      return <PlatformView hot={hot} platform={route.params.platform} fav={fav} />
    }
    if (route.name === 'item') {
      return (
        <ItemView
          hot={hot}
          platform={route.params.platform}
          rank={route.params.rank}
          fav={fav}
        />
      )
    }
    return <NotFoundState path={window.location.hash} onHome={() => navigate('/')} />
  })()

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
          {query && (
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
            {/* PRD 第 5 节要求：入口带「已收藏数量」的小角标。
                没收藏时不显示（显示 0 反而像在催你收藏）；有收藏时用红底白字。 */}
            {count > 0 && (
              <span className="fav-count" aria-label={`已收藏 ${count} 条`}>
                {count}
              </span>
            )}
          </button>
        </div>

        {/* ============ Day 13 新增：视图切换按钮（三个页面互跳的主入口） ============ */}
        {/* 说明：href 用真地址，键盘 Tab 能聚焦、回车能跳转；
            onClick 里再用 navigate 改 hash，是为了不用整页刷新、切换是瞬时的。 */}
        <nav className="view-tabs" aria-label="页面切换">
          {VIEWS.map((v) => (
            <a
              key={v.key}
              className={
                route.name === v.key
                  ? 'view-tab active'
                  : route.name === 'platform' && v.key === 'platform'
                    ? 'view-tab active'
                    : route.name === 'item' && v.key === 'item'
                      ? 'view-tab active'
                      : 'view-tab'
              }
              href={`#${v.hash}`}
              aria-current={route.name === v.key ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault()
                navigate(v.hash)
              }}
            >
              {v.label}
            </a>
          ))}
          <span className="view-tabs-hint">地址栏的 # 后面就是当前页面</span>
        </nav>
      </header>

      {/* ============ 路由出口：这里放当前该显示的页面 ============ */}
      {view}

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
                        href={`#/item/${f.platform || 'douyin'}/${f.rank}`}
                        onClick={(e) => {
                          e.preventDefault()
                          setPanelOpen(false)
                          navigate(`/item/${f.platform || 'douyin'}/${f.rank}`)
                        }}
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
          mock 数据版本（Day 8~13 · 三级页面 + 加载/成功/空/错误四种状态）｜hash 路由，网址可直接分享｜收藏和备注保存在你自己的浏览器里，无需注册
        </p>
      </footer>
    </div>
  )
}
