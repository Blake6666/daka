// 榜单数据加载引擎（含异常状态模拟，PRD 第 7 节）
// 说明：MVP 阶段数据来自静态示例文件。为了让"出错时页面不崩"可以亲眼验证，
// 这里把加载过程做成和将来调云函数 API 一样的异步形式，并支持模拟几种故障。
// 将来接真数据时，只需把 load 里的 setTimeout 换成 fetch，页面其余代码不动。

import { useState, useEffect, useCallback } from 'react'
import { HOTLISTS } from '../data/hotlistData'

// 演示场景：normal 正常 / weibo-error 微博单榜失败 / all-error 全部失败 / douyin-empty 抖音空榜单
export function useHotlists() {
  const [scenario, setScenario] = useState('normal')
  const [state, setState] = useState({ phase: 'loading' })

  const load = useCallback((sc) => {
    setState({ phase: 'loading' })
    // 模拟网络请求耗时（将来换成真的 fetch）
    setTimeout(() => {
      if (sc === 'all-error') {
        setState({ phase: 'all-error' })
        return
      }
      const lists = HOTLISTS.map((l) => {
        if (sc === 'weibo-error' && l.platform === 'weibo') {
          return { ...l, status: 'error' }
        }
        if (sc === 'douyin-empty' && l.platform === 'douyin') {
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
