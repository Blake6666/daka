// Day 13 拆出的第 1 个视图：首页（原 App.jsx 的主体，逻辑一行没改，只是搬进了自己的文件）
// 【说人话】以前所有东西都塞在一个文件里（App.jsx 626 行），现在拆成三个页面文件，
// 各自只管自己那一页。这样加第 4 页时不用去翻 600 行代码找插入位置。

import { useState, useMemo } from 'react'
import { favKey } from '../hooks/useFavorites'
import { heatNum, tagClass as TAG_STYLE } from '../utils/format'
import { TREND_7D, WORD_CLOUD } from '../data/hotlistData'
import WordCloud from '../components/WordCloud'
import TrendChart from '../components/TrendChart'
import CopyButton from '../components/CopyButton'
import { navigate } from '../router'

// 骨架屏占位平台
const SKELETON_PLATFORMS = ['douyin', 'bilibili', 'baidu']

// Day 12：平台筛选的选项（key 对应 lists 里的 platform 字段）
const PLATFORMS = [
  { key: 'douyin', name: '抖音' },
  { key: 'bilibili', name: 'B站' },
  { key: 'baidu', name: '百度' }
]

export default function HomeView({ hot, query, setQuery, fav }) {
  const { phase, lists, retry } = hot
  const { favorites, isFavorited, toggle, setNote } = fav
  const [editing, setEditing] = useState(null)

  // ===== 第 3 步新增：分类筛选 =====
  // '全部' = 不筛；否则只看这个分类。词云点词也是改这里，所以两个入口天然同步。
  const [category, setCategory] = useState('全部')

  // ===== Day 12 新增：平台筛选 =====
  // 'all' = 三榜并列；否则只显示所选平台的榜单（其他两栏整个隐藏）。
  const [platform, setPlatform] = useState('all')

  const startEdit = (platform, rank, currentNote) => {
    setEditing({ platform, rank, value: currentNote || '' })
  }

  const saveEdit = () => {
    if (!editing) return
    setNote(editing.platform, editing.rank, editing.value)
    setEditing(null)
  }

  // 注意：加载中和失败时 lists 还不存在，必须给空数组兜底（否则白屏，Day 7 踩过）
  const safeLists = lists || []
  const totalItems = safeLists.reduce((sum, l) => sum + l.items.length, 0)

  // Hero 统计卡 ③：全网热度最高词条（从 mock 数据里算出来）
  const topItem = useMemo(() => {
    let top = null
    for (const l of safeLists) {
      for (const it of l.items) {
        if (!top || heatNum(it.heat) > heatNum(top.heat)) top = it
      }
    }
    return top
  }, [safeLists])

  // 搜索 + 分类 + 平台：三个条件是「并且」关系（同时设置时同时生效）
  const q = query.trim()
  const filtering = !!q || category !== '全部' || platform !== 'all'
  // 给「本榜没有…」提示拼一句人话，说明到底是哪个条件筛空的
  const condText = [
    q && `含「${q}」`,
    category !== '全部' && `属于「${category}」`
  ]
    .filter(Boolean)
    .join(' 且 ')

  const visibleLists = safeLists
    // Day 12：平台筛选先在「栏」这一层生效——没选中的平台整栏不渲染
    .filter((list) => platform === 'all' || list.platform === platform)
    .map((list) => {
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

  // Day 12：每个平台当前正常加载的条数（异常演示切到"单榜失败"等场景时会变），
  // 给平台筛选胶囊的条数徽标用
  const platCount = {}
  for (const l of safeLists) {
    if (l.status !== 'ok') continue
    platCount[l.platform] = (platCount[l.platform] || 0) + l.items.length
  }

  // 分类统计：从原始数据（不是筛选后的）算每个分类的条数、总热度、主导平台
  // → 给分类标签的条数徽标、词云的字号和颜色用
  const categories = useMemo(() => {
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
    return Object.values(catMap)
      .map((c) => ({
        ...c,
        heat: Math.round(c.heat),
        // 这个分类里条目最多的平台，决定词云里这个词的颜色
        platform: Object.entries(c.byPlatform).sort((a, b) => b[1] - a[1])[0][0]
      }))
      .sort((a, b) => b.heat - a.heat)
  }, [safeLists])

  return (
    <>
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
      {/* Day 12：平台筛选栏——先按平台筛（整栏隐藏），复用分类胶囊的样式与焦点态 */}
      {phase === 'ok' && (
        <div className="plat-bar">
          <span className="cat-bar-label">平台</span>
          <button
            type="button"
            className={platform === 'all' ? 'cat-pill active' : 'cat-pill'}
            onClick={() => setPlatform('all')}
          >
            全部
            <span className="cat-count">{totalItems}</span>
          </button>
          {PLATFORMS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={platform === p.key ? 'cat-pill active' : 'cat-pill'}
              onClick={() => setPlatform(platform === p.key ? 'all' : p.key)}
            >
              <span className={`plat-dot ${p.key}`} aria-hidden="true" />
              {p.name}
              <span className="cat-count">{platCount[p.key] ?? 0}</span>
            </button>
          ))}
        </div>
      )}

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
                setPlatform('all')
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
                      <p>暂时获取不到{list.name}</p>
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
                              title={`${item.source}热搜第 ${item.rank} 名 · ${item.category} · 点击查看详情`}
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
                                  {/* Day 13：标题改成进「详情页」的内部链接
                                      （原来直接跳原平台，现在多了一级页面可看） */}
                                  <a
                                    className="title"
                                    href={`#/item/${list.platform}/${item.rank}`}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      navigate(`/item/${list.platform}/${item.rank}`)
                                    }}
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
                                  {/* Day 11：复制标题 —— 有反馈的交互（成功/失败/处理中都在按钮上） */}
                                  <CopyButton text={item.title} />
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
                      {/* Day 13：底部入口从「跳原平台」改成「进本平台列表页」，
                          原平台链接挪到列表页里，层级更清楚 */}
                      <a
                        className="view-more"
                        href={`#/platform/${list.platform}`}
                        onClick={(e) => {
                          e.preventDefault()
                          navigate(`/platform/${list.platform}`)
                        }}
                      >
                        查看{list.name}完整榜单 →
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
              <span className="insight-hint">点词 = 只看含这个词的热搜</span>
            </div>
            <WordCloud words={WORD_CLOUD} active={q} onPick={(text) => setQuery(text)} />
            <p className="insight-note">
              字号 = 这个词的热度权重，颜色 = 这个词最热的平台，最大的词在正中央、其余从中心向外铺开。当前是
              mock 数据，「词」从 60 条热搜标题里提炼；接真接口后换成真实关键词即可。
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
    </>
  )
}
