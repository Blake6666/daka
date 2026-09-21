// 收藏与备注的存取引擎（PRD F3）
// 存放位置：用户自己浏览器的 localStorage —— 不联网、不需要账号、
// 换浏览器或清缓存后不保留（这是预期行为，页面另有提示）。

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'daka_favorites_v1'

// 每条收藏的唯一编号：平台 + 排名。
// 现在的示例数据里同平台排名不重复，够用；将来换真数据时若需要可改用链接。
export function favKey(platform, rank) {
  return `${platform}-${rank}`
}

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {} // 存的数据损坏时当作没有收藏，不让页面崩
  }
}

function nowText() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function useFavorites() {
  // 打开页面时从 localStorage 读一次
  const [favorites, setFavorites] = useState(loadFavorites)

  // 收藏一有变化就写回 localStorage（刷新页面后仍在）
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      // 隐私模式等场景写不进去：静默降级，不影响浏览
    }
  }, [favorites])

  const isFavorited = useCallback(
    (platform, rank) => favKey(platform, rank) in favorites,
    [favorites]
  )

  // 点 ★/☆：没收藏就收藏；已收藏就取消（备注一并清除，PRD F3）
  const toggle = useCallback((item, platform) => {
    const key = favKey(platform, item.rank)
    setFavorites((prev) => {
      const next = { ...prev }
      if (key in next) {
        delete next[key]
      } else {
        next[key] = {
          platform,
          rank: item.rank,
          title: item.title,
          heat: item.heat,
          source: item.source,
          url: item.url,
          note: '',
          favoritedAt: nowText()
        }
      }
      return next
    })
  }, [])

  // 保存备注（最长 100 字，PRD 第 6 节）
  const setNote = useCallback((platform, rank, note) => {
    const key = favKey(platform, rank)
    setFavorites((prev) => {
      if (!(key in prev)) return prev // 没收藏就不能写备注
      return { ...prev, [key]: { ...prev[key], note: (note || '').slice(0, 100) } }
    })
  }, [])

  const count = Object.keys(favorites).length

  return { favorites, isFavorited, toggle, setNote, count }
}
