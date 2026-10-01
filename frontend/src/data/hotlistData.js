// 静态示例数据 —— Day 8 mock 数据版（Day 7 兜底方案的扩充）
// 说明：三个平台没有免密公开接口，第 3 周才接真实 API。
// 数据结构与将来云函数 API 返回的完全一致（含分类字段），换真数据时页面代码不用改。
// 平台：抖音 / B站 / 百度（Day 8 起由微博调整为 B站，PRD 已同步）

export const HOTLISTS = [
  {
    platform: 'douyin',
    name: '抖音热搜',
    hint: '什么视频火了',
    updated_at: '2026-09-23 21:30',
    items: [
      { rank: 1, title: '沉浸式收纳宿舍桌面', heat: '1021万', source: '抖音', url: 'https://www.douyin.com/hot', category: '生活', tag: '热' },
      { rank: 2, title: '挑战全网最干净厨房', heat: '987万', source: '抖音', url: 'https://www.douyin.com/hot', category: '生活' },
      { rank: 3, title: '狗狗的等待有多深情', heat: '896万', source: '抖音', url: 'https://www.douyin.com/hot', category: '生活' },
      { rank: 4, title: '国产大飞机新涂装亮相', heat: '855万', source: '抖音', url: 'https://www.douyin.com/hot', category: '热点事件', tag: '沸' },
      { rank: 5, title: '大学生体测名场面', heat: '812万', source: '抖音', url: 'https://www.douyin.com/hot', category: '娱乐' },
      { rank: 6, title: '秋天的第一顿螃蟹', heat: '763万', source: '抖音', url: 'https://www.douyin.com/hot', category: '生活' },
      { rank: 7, title: '非遗漆扇制作全过程', heat: '701万', source: '抖音', url: 'https://www.douyin.com/hot', category: '娱乐' },
      { rank: 8, title: '城市夜景航拍天花板', heat: '688万', source: '抖音', url: 'https://www.douyin.com/hot', category: '娱乐' },
      { rank: 9, title: '宠物迷惑行为大赏', heat: '655万', source: '抖音', url: 'https://www.douyin.com/hot', category: '生活' },
      { rank: 10, title: '男篮世预赛战胜强敌', heat: '622万', source: '抖音', url: 'https://www.douyin.com/hot', category: '体育', tag: '新' },
      { rank: 11, title: '航天员太空日常更新', heat: '598万', source: '抖音', url: 'https://www.douyin.com/hot', category: '科技' },
      { rank: 12, title: '古法红糖熬制技艺', heat: '561万', source: '抖音', url: 'https://www.douyin.com/hot', category: '生活' },
      { rank: 13, title: '新手机发布会高光时刻', heat: '540万', source: '抖音', url: 'https://www.douyin.com/hot', category: '科技', tag: '新' },
      { rank: 14, title: '山村教师坚守三十年', heat: '512万', source: '抖音', url: 'https://www.douyin.com/hot', category: '社会' },
      { rank: 15, title: '电竞选手退役仪式泪目', heat: '488万', source: '抖音', url: 'https://www.douyin.com/hot', category: '游戏' },
      { rank: 16, title: '早餐摊主的凌晨四点', heat: '466万', source: '抖音', url: 'https://www.douyin.com/hot', category: '社会' },
      { rank: 17, title: '露营装备避坑指南', heat: '443万', source: '抖音', url: 'https://www.douyin.com/hot', category: '生活' },
      { rank: 18, title: '传统武术进校园', heat: '421万', source: '抖音', url: 'https://www.douyin.com/hot', category: '体育' },
      { rank: 19, title: 'AI 修复百年老照片', heat: '405万', source: '抖音', url: 'https://www.douyin.com/hot', category: '科技' },
      { rank: 20, title: '街头艺人翻唱走红', heat: '388万', source: '抖音', url: 'https://www.douyin.com/hot', category: '娱乐' }
    ]
  },
  {
    platform: 'bilibili',
    name: 'B站热搜',
    hint: '年轻人在看什么',
    updated_at: '2026-09-23 21:28',
    items: [
      { rank: 1, title: '《黑神话》新 DLC 实机演示', heat: '892万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '游戏', tag: '沸' },
      { rank: 2, title: '何同学测评折叠屏新旗舰', heat: '765万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '科技', tag: '热' },
      { rank: 3, title: '罗翔谈最新司法解释', heat: '701万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '社会' },
      { rank: 4, title: '新番开播首集封神', heat: '668万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '娱乐', tag: '新' },
      { rank: 5, title: '手工耿新发明看呆网友', heat: '633万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '娱乐' },
      { rank: 6, title: '大学生自制卫星成功入轨', heat: '589万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '科技' },
      { rank: 7, title: 'LPL 季后赛让二追三', heat: '556万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '游戏' },
      { rank: 8, title: 'UP主复原圆明园十二兽首', heat: '521万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '娱乐' },
      { rank: 9, title: '量子计算机科普破圈', heat: '497万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '科技' },
      { rank: 10, title: '虚拟主播演唱会爆满', heat: '472万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '娱乐' },
      { rank: 11, title: '乡村小学校长的日记', heat: '448万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '社会' },
      { rank: 12, title: '编程 UP 主手写操作系统', heat: '425万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '科技' },
      { rank: 13, title: '国风舞蹈惊艳海外', heat: '409万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '娱乐' },
      { rank: 14, title: '世乒赛国乒包揽五金', heat: '391万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '体育', tag: '新' },
      { rank: 15, title: '独立游戏制作人纪录片', heat: '377万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '游戏' },
      { rank: 16, title: '宿舍美食料理大赛', heat: '356万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '生活' },
      { rank: 17, title: '高铁司机的第一视角', heat: '341万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '生活' },
      { rank: 18, title: '古籍修复师的一天', heat: '329万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '生活' },
      { rank: 19, title: '马拉松大众选手破三', heat: '312万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '体育' },
      { rank: 20, title: '动画专业毕业设计合集', heat: '298万', source: 'B站', url: 'https://www.bilibili.com/v/popular/rank/all', category: '娱乐' }
    ]
  },
  {
    platform: 'baidu',
    name: '百度热搜',
    hint: '大家在搜什么',
    updated_at: '2026-09-23 21:25',
    items: [
      { rank: 1, title: '台风路径最新消息', heat: '98万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '社会', tag: '热' },
      { rank: 2, title: '央行降准释放流动性', heat: '92万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '热点事件', tag: '沸' },
      { rank: 3, title: '新能源汽车补贴政策', heat: '87万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '热点事件' },
      { rank: 4, title: '国考报名人数创新高', heat: '81万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '社会' },
      { rank: 5, title: '国产芯片制程新突破', heat: '76万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '科技' },
      { rank: 6, title: '世界杯预选赛赛程公布', heat: '71万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '体育' },
      { rank: 7, title: '考研预报名开始', heat: '66万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '社会' },
      { rank: 8, title: '医保药品目录调整', heat: '62万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '热点事件', tag: '新' },
      { rank: 9, title: '大熊猫幼崽首次亮相', heat: '58万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '生活' },
      { rank: 10, title: '新一轮降温即将到货', heat: '54万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '生活' },
      { rank: 11, title: '人工智能立法新进展', heat: '50万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '科技' },
      { rank: 12, title: '黄金周旅游订单翻倍', heat: '47万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '生活' },
      { rank: 13, title: '著名演员新剧定档', heat: '44万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '娱乐', tag: '新' },
      { rank: 14, title: '粮食产量再创新高', heat: '41万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '热点事件' },
      { rank: 15, title: '电竞入选正式比赛项目', heat: '39万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '游戏' },
      { rank: 16, title: '新一线城市名单发布', heat: '36万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '社会' },
      { rank: 17, title: '登山队成功登顶新高峰', heat: '34万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '体育' },
      { rank: 18, title: '家庭教育促进法实施', heat: '31万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '社会' },
      { rank: 19, title: '演唱会门票一票难求', heat: '29万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '娱乐' },
      { rank: 20, title: '快递进村覆盖率提升', heat: '27万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime', category: '生活' }
    ]
  }
]

// 7 天趋势（Day 8 第 3 步）—— 同样是 mock 数据
// 数值含义：当天该平台 TOP20 的总热度，单位「万」。
// 将来接真 API 后，这里换成云函数每天存的一份快照即可，趋势图代码不用改。
// 词云词库（Day 10 重做）—— 同样是 mock 数据
// 来源：从上面 60 条热搜标题里提炼出的关键词，**每个词都真实出现在某条标题中**，
//       所以点词筛选一定能命中，不会出现「点了没反应」的假词。
// 字段：weight = 热度权重（0~100），决定字号；platform = 该词最热的平台，决定颜色；
//       category = 归属分类（保留给以后按分类聚合用）。
// 权重按真实热搜的「长尾分布」设定——第一名远高于第十名、越往后越密，
// 这样词云才有一个明确的重心，而不是一堆差不多大的字铺满屏。
// 第 3 周接真 API 后，这里换成接口返回的关键词列表即可，词云组件不用改。
export const WORD_CLOUD = [
  { text: '黑神话', weight: 100, platform: 'bilibili', category: '游戏' },
  { text: '台风', weight: 82, platform: 'baidu', category: '社会' },
  { text: '收纳', weight: 71, platform: 'douyin', category: '生活' },
  { text: '宿舍', weight: 63, platform: 'douyin', category: '生活' },
  { text: '央行降准', weight: 57, platform: 'baidu', category: '热点事件' },
  { text: '大飞机', weight: 52, platform: 'douyin', category: '热点事件' },
  { text: '折叠屏', weight: 48, platform: 'bilibili', category: '科技' },
  { text: '国考', weight: 45, platform: 'baidu', category: '社会' },
  { text: '手工耿', weight: 42, platform: 'bilibili', category: '娱乐' },
  { text: '电竞', weight: 39, platform: 'bilibili', category: '游戏' },
  { text: '航天员', weight: 37, platform: 'douyin', category: '科技' },
  { text: '新能源汽车', weight: 35, platform: 'baidu', category: '热点事件' },
  { text: '罗翔', weight: 33, platform: 'bilibili', category: '社会' },
  { text: '世界杯预选赛', weight: 31, platform: 'baidu', category: '体育' },
  { text: 'LPL', weight: 29, platform: 'bilibili', category: '游戏' },
  { text: '大熊猫', weight: 28, platform: 'baidu', category: '生活' },
  { text: '非遗漆扇', weight: 27, platform: 'douyin', category: '娱乐' },
  { text: '国产芯片', weight: 26, platform: 'baidu', category: '科技' },
  { text: '考研', weight: 25, platform: 'baidu', category: '社会' },
  { text: '新手机', weight: 24, platform: 'douyin', category: '科技' },
  { text: '体测', weight: 23, platform: 'douyin', category: '娱乐' },
  { text: '卫星', weight: 22, platform: 'bilibili', category: '科技' },
  { text: '演唱会', weight: 21, platform: 'baidu', category: '娱乐' },
  { text: '男篮', weight: 20, platform: 'douyin', category: '体育' },
  { text: '虚拟主播', weight: 19, platform: 'bilibili', category: '娱乐' },
  { text: '马拉松', weight: 18, platform: 'bilibili', category: '体育' },
  { text: '圆明园', weight: 17, platform: 'bilibili', category: '娱乐' },
  { text: '降温', weight: 16, platform: 'baidu', category: '生活' },
  { text: '露营', weight: 15, platform: 'douyin', category: '生活' },
  { text: '世乒赛', weight: 14, platform: 'bilibili', category: '体育' },
  { text: '量子计算', weight: 13, platform: 'bilibili', category: '科技' },
  { text: '黄金周', weight: 12, platform: 'baidu', category: '生活' },
  { text: '山村教师', weight: 11, platform: 'douyin', category: '社会' },
  { text: '国风舞蹈', weight: 10, platform: 'bilibili', category: '娱乐' },
  { text: '古籍修复', weight: 9, platform: 'bilibili', category: '生活' },
  { text: '快递进村', weight: 8, platform: 'baidu', category: '生活' }
]

export const TREND_7D = {
  days: ['09-17', '09-18', '09-19', '09-20', '09-21', '09-22', '09-23'],
  series: [
    { platform: 'douyin', name: '抖音', values: [11800, 12250, 12010, 12740, 13120, 12600, 12822] },
    { platform: 'bilibili', name: 'B站', values: [9600, 9350, 9820, 10150, 9880, 9650, 9980] },
    { platform: 'baidu', name: '百度', values: [1050, 990, 1080, 1150, 1210, 1090, 1123] }
  ]
}
