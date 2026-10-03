// Day 13：自己写的极简 hash 路由（约 40 行，不装 react-router）
// 【说人话】路由就是「网址长什么样 → 该显示哪一页」的一张对照表。
// 这里用 hash（网址里 # 后面的那串）：http://localhost:5173/#/platform/douyin
// 选 hash 的三个理由：
//   1. 不用配服务器。将来部署到静态托管，改服务器配置会 404，hash 不会。
//   2. 刷新页面不会丢，直接把网址发给别人也能打开同一个页面。
//   3. 几十行就能看懂，不用学一个库。
// 代价（清单里说了「够用就好」）：没有嵌套路由、没有路由守卫，这些暂时用不上。

import { useEffect, useState } from 'react'

// 把网址里的 # 后半段拆成「视图名 + 参数」
// 例：#/item/douyin/3 → { name: 'item', params: { platform: 'douyin', rank: 3 } }
export function parseHash(hash) {
  const path = String(hash || '').replace(/^#/, '')
  const seg = path.split('/').filter(Boolean) // 拆成 ['item', 'douyin', '3']

  if (seg.length === 0) return { name: 'home', params: {} }
  if (seg[0] === 'platform') {
    return { name: 'platform', params: { platform: seg[1] || '' } }
  }
  if (seg[0] === 'item') {
    return {
      name: 'item',
      params: { platform: seg[1] || '', rank: Number(seg[2]) || 0 }
    }
  }
  return { name: 'notfound', params: {} } // 网址乱敲的兜底
}

// 监听浏览器前进/后退 + 首次进入，拿到当前该显示哪个视图
export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    // 组件刚挂载时如果地址是空的，补一个默认页（顺便让地址栏出现 #/）
    if (!window.location.hash) window.location.hash = '#/'
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

// 切换页面：改 hash 就行，浏览器会自己触发 hashchange
export function navigate(path) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`
}

// 「返回上一页」：优先用浏览器真实历史（点了详情页返回才回得去），
// 万一没有历史（比如直接粘贴网址进来的）就回首页，别让按钮点了没反应。
export function goBack(fallback = '/') {
  if (window.history.length > 1) window.history.back()
  else navigate(fallback)
}
