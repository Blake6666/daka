// 榜单数据加载引擎（含异常状态模拟，PRD 第 7 节）
// 说明：MVP 阶段数据来自静态示例文件。为了让"出错时页面不崩"可以亲眼验证，
// 这里把加载过程做成和将来调云函数 API 一样的异步形式，并支持模拟几种故障。
// 将来接真数据时，只需把 load 里的 setTimeout 换成 fetch，页面其余代码不动。
//
// Day 13 改动：① 新增「卡在加载」场景（loading-stuck），让加载态能停下来被截图；
//            ② 导出两个查找工具，给「平台列表页」「热搜详情页」用。

import { useState, useEffect, useCallback } from 'react'
import { HOTLISTS } from '../data/hotlistData'

// 演示场景：normal 正常 / douyin-error 抖音单榜失败 / all-error 全部失败
//          bilibili-empty B站空榜单 / loading-stuck 一直卡在加载中
export function useHotlists() {
  const [scenario, setScenario] = useState('normal')
  const [state, setState] = useState({ phase: 'loading' })

  const load = useCallback((sc) => {
    setState({ phase: 'loading' })
    // 「卡在加载」：只进 loading 不出来，专门留给验收截图用
    if (sc === 'loading-stuck') return
    // 模拟网络请求耗时（将来换成真的 fetch）
    setTimeout(() => {
      if (sc === 'all-error') {
        setState({ phase: 'all-error' })
        return
      }
      const lists = HOTLISTS.map((l) => {
        if (sc === 'douyin-error' && l.platform === 'douyin') {
          return { ...l, status: 'error' }
        }
        if (sc === 'bilibili-empty' && l.platform === 'bilibili') {
          return { ...l, status: 'empty' }
        }
        return { ...l, status: 'ok' }
      })
      setState({ phase: 'ok', lists, updatedAt: HOTLISTS[0].updated_at })
    }, 400)
  }, [])

  // 打开页面先加载一次（正常场景）
  useEffect(() => {
    load('normal')
  }, [load])

  const switchScenario = useCallback(
    (sc) => {
      setScenario(sc)
      load(sc)
    },
    [load]
  )

  const retry = useCallback(() => load(scenario), [load, scenario])

  return { ...state, scenario, switchScenario, retry }
}

// ============ Day 13 新增：给另外两个视图用的查找工具 ============
// 说明：数据只有这一份，三个视图共用。这里把「按平台找榜」「按排名找词条」
// 写成两个小函数，三个视图都调它们，逻辑不会各写一份而对不上。

// 找某个平台的榜单（如 douyin）。找不到返回 null。
export function findList(lists, platform) {
  return (lists || []).find((l) => l.platform === platform) || null
}

// 找某条热搜（平台 + 排名）。找不到返回 null —— 详情页的「空状态」就靠它。
export function findItem(lists, platform, rank) {
  const list = findList(lists, platform)
  if (!list) return null
  return list.items.find((it) => it.rank === Number(rank)) || null
}

// 平台的中文名 + 简介，给平台列表页顶部用（免得再抄一遍数据源）
export const PLATFORM_INFO = {
  douyin: { name: '抖音热搜', hint: '什么视频火了' },
  bilibili: { name: 'B站热搜', hint: '年轻人在看什么' },
  baidu: { name: '百度热搜', hint: '全网都在搜什么' }
}
