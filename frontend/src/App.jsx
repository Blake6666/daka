// Day 7 第 4 步：异常状态提示（PRD 第 7 节 5 种中的 3 种需要代码：
// 单榜失败 / 全部失败 / 空榜单；收藏为空已在第 3 步做，链接失效由原平台处理）。
// F1 榜单、F2 跳转、F3 收藏备注均已完成。
import { useState } from 'react'
import { useFavorites, favKey } from './hooks/useFavorites'
import { useHotlists } from './hooks/useHotlists'

// 演示开关的选项（开发/验收用，让异常状态可以被亲眼看到）
const SCENARIOS = [
  { key: 'normal', label: '正常' },
  { key: 'weibo-error', label: '单榜失败' },
  { key: 'all-error', label: '全部失败' },
  { key: 'douyin-empty', label: '空榜单' }
]

export default function App() {
  const { favorites, isFavorited, toggle, setNote, count } = useFavorites()
  const { phase, lists, updatedAt, scenario, switchScenario, retry } = useHotlists()
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const startEdit = (platform, rank, currentNote) => {
    setEditing({ platform, rank, value: currentNote || '' })
  }

  const saveEdit = () => {
    if (!editing) return
    setNote(editing.platform, editing.rank, editing.value)
    setEditing(null)
  }

  const favList = Object.entries(favorites)

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <h1>今日热搜</h1>
          <p className="subtitle">三个平台的实时热点，一屏看完</p>
        </div>
        <div className="topbar-right">
          <span className="sample-badge">示例数据</span>
          <span className="update-time">
            更新时间：{phase === 'ok' ? updatedAt : '--:--'}
          </span>
          <button className="fav-entry" type="button" onClick={() => setPanelOpen(true)}>
            我的收藏
            {count > 0 && <span className="fav-badge">{count}</span>}
          </button>
        </div>
      </header>

      {/* 全部失败：整块榜单区替换成统一提示（PRD 第 7 节第 2 行） */}
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

      {(phase === 'loading' || phase === 'ok') && (
        <main className="board">
          {phase === 'loading' && (
            <div className="all-loading">
              <p>榜单加载中…</p>
            </div>
          )}
          {phase === 'ok' &&
            lists.map((list) => (
              <section className="column" key={list.platform}>
                <div className="column-head">
                  <h2>{list.name}</h2>
                  <span className="column-hint">{list.hint}</span>
                </div>

                {/* 单榜失败：这一栏显示提示，另两栏不受影响（PRD 第 7 节第 1 行） */}
                {list.status === 'error' && (
                  <div className="col-error">
                    <p>暂时获取不到{list.name}榜单</p>
                    <p className="col-error-sub">其他榜单不受影响</p>
                    <button className="retry-btn" type="button" onClick={retry}>
                      重试
                    </button>
                  </div>
                )}

                {/* 空榜单：显示"今天暂时没有数据"（PRD 第 7 节第 3 行） */}
                {list.status === 'empty' && (
                  <div className="col-empty">
                    <p>今天暂时没有数据</p>
                  </div>
                )}

                {list.status === 'ok' && (
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

                      return (
                        <li
                          className={item.rank <= 3 ? 'hot-item top' : 'hot-item'}
                          key={item.rank}
                        >
                          <span className="rank">{item.rank}</span>
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
                )}
              </section>
            ))}
        </main>
      )}

      {/* 我的收藏 面板 */}
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
          示例数据版本（Day 7 · 第 4 步）｜点击标题跳转原平台｜收藏和备注保存在你自己的浏览器里，无需注册
        </p>
      </footer>
    </div>
  )
}
