// Day 13 拆出的第 2 个视图：平台列表页（地址 #/platform/douyin）
// 【说人话】首页是「三个平台摆在一起看」，这页是「只看一个平台，看它全部 20 条」。
// 为什么要单独开一页？因为首页为了塞下三栏，每栏只能露出前几条；
// 想认真看某个平台到底在热什么，就得有一页从头到尾排下来的清单。
//
// 这一页同时是「四种状态」的示范页：加载中 / 成功 / 空 / 错误 各有一套文案，
// 都用 components/StateBlock.jsx 里共用的组件渲染。

import { LoadingState, EmptyState, ErrorState } from '../components/StateBlock'
import { findList, PLATFORM_INFO } from '../hooks/useHotlists'
import { heatNum, tagClass } from '../utils/format'
import { navigate } from '../router'

// 平台小圆点 + 中文名，首页筛选栏和这里长得一样（DESIGN_RULES 第 6 节：同类元素统一样式）
const ALL_PLATFORMS = ['douyin', 'bilibili', 'baidu']

export default function PlatformView({ hot, platform, fav }) {
  const { phase, lists, retry } = hot
  const { isFavorited, toggle } = fav

  const info = PLATFORM_INFO[platform]
  const list = findList(lists, platform)

  // ===== 四种状态判断 =====

  // ① 加载中：整个页面数据都还没到（用骨架条占位，页面不塌）
  if (phase === 'loading') {
    return (
      <section className="pv">
        <PageHead platform={platform} name={info?.name || '平台'} hint={info?.hint} />
        <LoadingState rows={8} label="正在加载该平台榜单…" />
      </section>
    )
  }

  // ② 错误：全部失败，或这个平台自己失败（这一页只有它，所以等于整页失败）
  if (phase === 'all-error' || (list && list.status === 'error')) {
    return (
      <section className="pv">
        <PageHead platform={platform} name={info?.name || '平台'} hint={info?.hint} />
        <ErrorState
          title="加载失败"
          text="暂时获取不到这个平台的榜单，请检查网络后重试。"
          actionLabel="重新加载"
          onAction={retry}
        />
      </section>
    )
  }

  // ③ 空：这个平台今天一条数据都没有（平台自身为空）
  if (!list || list.status === 'empty' || list.items.length === 0) {
    return (
      <section className="pv">
        <PageHead platform={platform} name={info?.name || '平台'} hint={info?.hint} />
        <EmptyState
          title="该平台今天暂无数据"
          text="这个平台暂时没有返回任何热搜条目，稍后再来看看。"
          actionLabel="回到首页"
          onAction={() => navigate('/')}
        />
      </section>
    )
  }

  // ④ 成功：正常渲染这一页的内容
  const maxHeat = Math.max(...list.items.map((it) => heatNum(it.heat)), 1)
  const hot5 = list.items.slice(0, 5)

  return (
    <section className="pv">
      <PageHead platform={platform} name={info?.name || list.name} hint={info?.hint || list.hint} />

      {/* 这一页的三个小统计：用真数据算，不是写死的 */}
      <div className="pv-stats">
        <div className="pv-stat">
          <p className="pv-stat-num">{list.items.length}</p>
          <p className="pv-stat-label">在榜条数</p>
        </div>
        <div className="pv-stat">
          <p className="pv-stat-num">{list.items[0].heat}</p>
          <p className="pv-stat-label">最高热度（第 1 名）</p>
        </div>
        <div className="pv-stat">
          <p className="pv-stat-num">
            {hot5.filter((it) => it.tag).length}
          </p>
          <p className="pv-stat-label">前 5 名中带标签（沸/热/新）</p>
        </div>
      </div>

      <ol className="pv-list">
        {list.items.map((item) => {
          const isFav = isFavorited(platform, item.rank)
          return (
            <li className={item.rank <= 3 ? 'pv-item top' : 'pv-item'} key={item.rank}>
              <span className={item.rank <= 3 ? `rank rank-${item.rank}` : 'rank'}>
                {item.rank}
              </span>
              <div className="pv-main">
                <div className="pv-row">
                  {/* 点标题进「详情页」——三级页面的入口就靠这一行 */}
                  <a
                    className="pv-title"
                    title="点标题看这条热搜的站内详情，原平台链接在详情页里"
                    href={`#/item/${platform}/${item.rank}`}
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(`/item/${platform}/${item.rank}`)
                    }}
                  >
                    {item.title}
                  </a>
                  {item.tag && <span className={`tag tag-${tagClass(item.tag)}`}>{item.tag}</span>}
                  <span className="heat">{item.heat}</span>
                  <span className="pv-cat">{item.category}</span>
                  <button
                    className={isFav ? 'fav-star active' : 'fav-star'}
                    type="button"
                    aria-label={isFav ? '取消收藏' : '收藏'}
                    title={isFav ? '取消收藏' : '收藏'}
                    onClick={() => toggle(item, platform)}
                  >
                    {isFav ? '★' : '☆'}
                  </button>
                </div>
                <div className="heat-bar" aria-hidden="true">
                  <i style={{ width: `${Math.max(6, Math.round((heatNum(item.heat) / maxHeat) * 100))}%` }} />
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {/* 余力加练：去原平台看完整榜单（外链用新窗口打开，不影响本页） */}
      <p className="pv-foot">
        数据更新时间：{list.updated_at}｜
        <a href={list.items[0].url} target="_blank" rel="noopener noreferrer">
          去{info?.name || list.name}看原榜单 ↗
        </a>
      </p>
    </section>
  )
}

// 标签样式映射已挪到 utils/format.js（三个视图共用一份）

// 页头：平台名 + 简介 + 三个平台之间的切换条（页面之间互跳的主入口）
function PageHead({ platform, name, hint }) {
  return (
    <div className="pv-head">
      <div className="pv-head-main">
        <span className={`plat-dot ${platform}`} aria-hidden="true" />
        <h2 className="pv-title-h">{name}</h2>
        {hint && <span className="pv-hint">{hint}</span>}
      </div>
      <nav className="pv-switch" aria-label="切换平台">
        {ALL_PLATFORMS.map((k) => (
          <a
            key={k}
            className={k === platform ? 'pv-switch-item active' : 'pv-switch-item'}
            href={`#/platform/${k}`}
            onClick={(e) => {
              e.preventDefault()
              navigate(`/platform/${k}`)
            }}
          >
            <span className={`plat-dot ${k}`} aria-hidden="true" />
            {PLATFORM_INFO[k].name.replace('热搜', '')}
          </a>
        ))}
      </nav>
    </div>
  )
}
