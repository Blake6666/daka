// Day 13 拆出的第 3 个视图：热搜详情页（地址 #/item/douyin/1）
// 【说人话】首页看到「第 1 名 某某某」，点进去这一页告诉你：它多热、属于哪类、
// 别的平台有没有这个词、想收藏点哪。相当于这条热搜的「档案页」。
//
// 层级最深的一页，所以「返回上一层」在这里最重要——
// 页头有面包屑，底部还有一个返回按钮，手机上单手也能点到。

import { LoadingState, EmptyState, ErrorState } from '../components/StateBlock'
import { findList, findItem, PLATFORM_INFO } from '../hooks/useHotlists'
import { heatNum, tagClass } from '../utils/format'
import { navigate, goBack } from '../router'
import CopyButton from '../components/CopyButton'

export default function ItemView({ hot, platform, rank, fav }) {
  const { phase, lists, retry } = hot
  const { isFavorited, toggle } = fav

  const info = PLATFORM_INFO[platform]
  const list = findList(lists, platform)
  const item = findItem(lists, platform, rank)

  // ===== ① 加载中 =====
  if (phase === 'loading') {
    return (
      <section className="iv">
        <Crumb platform={platform} />
        <LoadingState rows={4} label="正在加载这条热搜的详情…" />
      </section>
    )
  }

  // ===== ② 错误 =====
  if (phase === 'all-error' || (list && list.status === 'error')) {
    return (
      <section className="iv">
        <Crumb platform={platform} />
        <ErrorState
          title="加载失败"
          text="这条热搜的详情暂时取不到，请检查网络后重试。"
          actionLabel="重新加载"
          onAction={retry}
        />
        <BackBar platform={platform} />
      </section>
    )
  }

  // ===== ③ 空：地址里的排名不存在（比如手敲了 #/item/douyin/999） =====
  if (!item) {
    return (
      <section className="iv">
        <Crumb platform={platform} />
        <EmptyState
          title="没有找到这条热搜"
          text={`${info?.name || '该平台'}第 ${rank} 名现在没有数据，可能已经掉出榜单了。`}
          actionLabel="去看这个平台的完整榜单"
          onAction={() => navigate(`/platform/${platform}`)}
        />
        <BackBar platform={platform} />
      </section>
    )
  }

  // ===== ④ 成功 =====
  // 同一个词在别的平台有没有上榜？这是详情页才有信息量的地方
  const elsewhere = (lists || [])
    .filter((l) => l.platform !== platform && l.status === 'ok')
    .map((l) => ({ list: l, hit: l.items.find((x) => x.title === item.title) }))
    .filter((x) => x.hit)

  // 同分类里这条排第几（用热度在同分类内排序）
  const sameCat = list.items.filter((x) => x.category === item.category)
  const catRank = sameCat.findIndex((x) => x.rank === item.rank) + 1
  // 上一条 / 下一条（在同一平台榜单里翻）
  const prev = item.rank > 1 ? findItem(lists, platform, item.rank - 1) : null
  const next = item.rank < list.items.length ? findItem(lists, platform, item.rank + 1) : null

  const isFav = isFavorited(platform, item.rank)
  const share = Math.round((heatNum(item.heat) / list.items.reduce((s, x) => s + heatNum(x.heat), 0)) * 100)

  return (
    <section className="iv">
      <Crumb platform={platform} />

      <article className="iv-card">
        <div className="iv-head">
          <span className={item.rank <= 3 ? `rank rank-${item.rank}` : 'rank'}>{item.rank}</span>
          <h2 className="iv-title">{item.title}</h2>
          {item.tag && <span className={`tag tag-${tagClass(item.tag)}`}>{item.tag}</span>}
        </div>

        <div className="iv-meta">
          <div className="iv-meta-item">
            <p className="iv-meta-label">热度</p>
            <p className="iv-meta-value">{item.heat}</p>
          </div>
          <div className="iv-meta-item">
            <p className="iv-meta-label">排名</p>
            <p className="iv-meta-value">第 {item.rank} / {list.items.length} 名</p>
          </div>
          <div className="iv-meta-item">
            <p className="iv-meta-label">分类</p>
            <p className="iv-meta-value">{item.category}</p>
          </div>
          <div className="iv-meta-item">
            <p className="iv-meta-label">占本榜热度</p>
            <p className="iv-meta-value">{share}%</p>
          </div>
        </div>

        {/* 分类内位置 + 一根热度条：把「它有多热」画出来 */}
        <div className="iv-bar-wrap">
          <p className="iv-bar-label">
            热度占本平台榜单第 {catRank} 位（同「{item.category}」共 {sameCat.length} 条）
          </p>
          <div className="heat-bar" aria-hidden="true">
            <i style={{ width: `${Math.max(6, Math.round((heatNum(item.heat) / Math.max(...list.items.map((x) => heatNum(x.heat)), 1)) * 100))}%` }} />
          </div>
        </div>

        <div className="iv-actions">
          <button
            className={isFav ? 'fav-star active iv-fav' : 'fav-star iv-fav'}
            type="button"
            onClick={() => toggle(item, platform)}
          >
            {isFav ? '★ 已收藏' : '☆ 收藏这条'}
          </button>
          <CopyButton text={item.title} />
          <a
            className="state-btn iv-link"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            去{info?.name || list.name}看原文 ↗
          </a>
        </div>
      </article>

      {/* 别家平台有没有这个词：详情页的「独家信息」 */}
      <section className="iv-card">
        <h3 className="iv-h3">其他平台有没有这个词</h3>
        {elsewhere.length === 0 ? (
          <p className="iv-note">另外两个平台当前榜单里没有出现这个词，只有{info?.name || list.name}在讨论。</p>
        ) : (
          <ul className="iv-also">
            {elsewhere.map(({ list: l, hit }) => (
              <li key={l.platform} className="iv-also-item">
                <span className={`plat-dot ${l.platform}`} aria-hidden="true" />
                <span className="iv-also-name">{PLATFORM_INFO[l.platform].name}</span>
                <span className="iv-also-heat">{hit.heat}</span>
                <span className="iv-also-rank">第 {hit.rank} 名</span>
                <a
                  className="iv-also-go"
                  href={`#/item/${l.platform}/${hit.rank}`}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(`/item/${l.platform}/${hit.rank}`)
                  }}
                >
                  看它的详情 →
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 上一条 / 下一条：详情页之间横着翻，不用回列表 */}
      <nav className="iv-pager" aria-label="榜单上下条">
        {prev ? (
          <a
            className="iv-pager-item"
            href={`#/item/${platform}/${prev.rank}`}
            onClick={(e) => {
              e.preventDefault()
              navigate(`/item/${platform}/${prev.rank}`)
            }}
          >
            <span className="iv-pager-dir">← 上一条</span>
            <span className="iv-pager-title">{prev.title}</span>
          </a>
        ) : (
          <span className="iv-pager-item disabled">已经是第 1 条</span>
        )}
        {next ? (
          <a
            className="iv-pager-item"
            href={`#/item/${platform}/${next.rank}`}
            onClick={(e) => {
              e.preventDefault()
              navigate(`/item/${platform}/${next.rank}`)
            }}
          >
            <span className="iv-pager-dir">下一条 →</span>
            <span className="iv-pager-title">{next.title}</span>
          </a>
        ) : (
          <span className="iv-pager-item disabled">已经是最后一条</span>
        )}
      </nav>

      <BackBar platform={platform} />
    </section>
  )
}

// 标签样式映射已挪到 utils/format.js（三个视图共用一份）

// 面包屑（余力加练项）：首页 › 抖音热搜 › 详情
function Crumb({ platform }) {
  const info = PLATFORM_INFO[platform]
  return (
    <nav className="crumb" aria-label="面包屑">
      <a
        className="crumb-item"
        href="#/"
        onClick={(e) => {
          e.preventDefault()
          navigate('/')
        }}
      >
        首页
      </a>
      <span className="crumb-sep" aria-hidden="true">
        ›
      </span>
      <a
        className="crumb-item"
        href={`#/platform/${platform}`}
        onClick={(e) => {
          e.preventDefault()
          navigate(`/platform/${platform}`)
        }}
      >
        {info?.name || platform}
      </a>
      <span className="crumb-sep" aria-hidden="true">
        ›
      </span>
      <span className="crumb-item current">详情</span>
    </nav>
  )
}

// 底部返回条：手机上够得着的位置放一个「返回上一层」
function BackBar({ platform }) {
  return (
    <div className="iv-back">
      <button
        className="state-btn"
        type="button"
        onClick={() => goBack(`/platform/${platform}`)}
      >
        ← 返回上一页
      </button>
      <button
        className="state-btn ghost"
        type="button"
        onClick={() => navigate(`/platform/${platform}`)}
      >
        回到{PLATFORM_INFO[platform]?.name || '平台'}列表
      </button>
    </div>
  )
}
