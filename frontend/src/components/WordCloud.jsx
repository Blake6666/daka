// 词云（Day 8 第 3 步）
// 作用：把三榜 60 条热搜按「分类」汇总成一个云，一眼看出今天哪个话题最多；
// 点任意一个词 = 用这个分类筛选下面的榜单（和分类标签是同一个入口，只是更好看）。
//
// 口径：字号 = 该分类的总热度（不用条数，免得冷门分类因为条多而显得很大）
//      颜色 = 这个分类里条目最多的平台
//
// 诚实说明：现在是 mock 数据，"词"只能取条目的「分类」字段，一共 7 个。
// 第 3 周接真 API 后，把 words 换成接口返回的真实关键词列表即可，本组件不用改。

export default function WordCloud({ words, active, onPick }) {
  if (!words.length) return <p className="wc-empty">加载中…</p>

  const heats = words.map((w) => w.heat)
  const max = Math.max(...heats)
  const min = Math.min(...heats)

  // 把热度线性映射到 15~40px：最小的词也看得清，最大的词不撑破卡片
  const fontSize = (heat) =>
    max === min ? 26 : Math.round(15 + ((heat - min) / (max - min)) * 25)

  return (
    <div className="word-cloud">
      {words.map((w) => (
        <button
          key={w.text}
          type="button"
          className={`wc-word ${w.platform}${active === w.text ? ' active' : ''}`}
          style={{ fontSize: `${fontSize(w.heat)}px` }}
          title={`${w.text}：${w.count} 条 · 总热度 ${w.heat}万 · 点击只看这个分类`}
          onClick={() => onPick(active === w.text ? '全部' : w.text)}
        >
          {w.text}
        </button>
      ))}
    </div>
  )
}
