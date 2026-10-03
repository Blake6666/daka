// Day 13：小的格式化工具
// 【说人话】把「工具」单独放一个文件，是为了三个视图能用同一份、
// 又不会「A 页面 import B 页面」绕成环。

// 把 "482万" / "1.28亿" 这样的热度文字换算成可比较的数字
// （热度条长度、统计占比、排序都要用数字比大小）
export function heatNum(h) {
  const m = String(h).match(/([\d.]+)/)
  if (!m) return 0
  const n = parseFloat(m[1])
  return String(h).includes('亿') ? n * 10000 : n
}

// 热搜标签（沸/热/新）对应哪个样式类
export function tagClass(tag) {
  return { 沸: 'fei', 热: 're', 新: 'xin' }[tag] || 're'
}
