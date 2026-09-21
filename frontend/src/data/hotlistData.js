// 静态示例数据 —— Day 7 兜底方案（TECH_DESIGN 第 9 节 Q1）
// 说明：三个平台没有免密公开接口，MVP 阶段先用示例数据跑通界面。
// 数据结构与将来云函数 API 返回的完全一致，替换成真数据时页面代码不用改。

export const HOTLISTS = [
  {
    platform: 'weibo',
    name: '微博热搜',
    hint: '大家在讨论什么',
    updated_at: '2026-09-21 08:00',
    items: [
      { rank: 1, title: '秋季开学第一周 神兽归笼', heat: '482万', source: '微博', url: 'https://weibo.com/hot/search' },
      { rank: 2, title: '冷空气影响北方多地', heat: '391万', source: '微博', url: 'https://weibo.com/hot/search' },
      { rank: 3, title: '这届年轻人开始养生早餐', heat: '355万', source: '微博', url: 'https://weibo.com/hot/search' },
      { rank: 4, title: '秋天的第一杯奶茶又来了', heat: '312万', source: '微博', url: 'https://weibo.com/hot/search' },
      { rank: 5, title: '直播带货新规实施', heat: '287万', source: '微博', url: 'https://weibo.com/hot/search' },
      { rank: 6, title: '城市马拉松报名开启', heat: '265万', source: '微博', url: 'https://weibo.com/hot/search' },
      { rank: 7, title: '高校食堂新菜品走红', heat: '231万', source: '微博', url: 'https://weibo.com/hot/search' },
      { rank: 8, title: '国产动画电影定档', heat: '208万', source: '微博', url: 'https://weibo.com/hot/search' },
      { rank: 9, title: '户外露营装备热销', heat: '186万', source: '微博', url: 'https://weibo.com/hot/search' },
      { rank: 10, title: '周末短途游攻略', heat: '154万', source: '微博', url: 'https://weibo.com/hot/search' }
    ]
  },
  {
    platform: 'baidu',
    name: '百度热搜',
    hint: '大家在搜什么',
    updated_at: '2026-09-21 08:00',
    items: [
      { rank: 1, title: '台风路径最新消息', heat: '98万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime' },
      { rank: 2, title: '秋分吃什么', heat: '87万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime' },
      { rank: 3, title: '中秋国庆放假安排', heat: '79万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime' },
      { rank: 4, title: '大学排名公布', heat: '65万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime' },
      { rank: 5, title: '新能源汽车销量', heat: '58万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime' },
      { rank: 6, title: '体检报告怎么看', heat: '52万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime' },
      { rank: 7, title: '考研预报名开始', heat: '47万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime' },
      { rank: 8, title: '空气质量指数查询', heat: '41万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime' },
      { rank: 9, title: '电视剧大结局', heat: '36万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime' },
      { rank: 10, title: '熬夜的危害有哪些', heat: '30万', source: '百度', url: 'https://top.baidu.com/board?tab=realtime' }
    ]
  },
  {
    platform: 'douyin',
    name: '抖音热点',
    hint: '什么视频火了',
    updated_at: '2026-09-21 08:00',
    items: [
      { rank: 1, title: '沉浸式收纳宿舍桌面', heat: '1021万', source: '抖音', url: 'https://www.douyin.com/hot' },
      { rank: 2, title: '街头随机合唱挑战', heat: '876万', source: '抖音', url: 'https://www.douyin.com/hot' },
      { rank: 3, title: '猫咪踩键盘名场面', heat: '743万', source: '抖音', url: 'https://www.douyin.com/hot' },
      { rank: 4, title: '一分钟看完老电影', heat: '688万', source: '抖音', url: 'https://www.douyin.com/hot' },
      { rank: 5, title: '厨房小白逆袭红烧肉', heat: '621万', source: '抖音', url: 'https://www.douyin.com/hot' },
      { rank: 6, title: '大学生宿舍改造', heat: '547万', source: '抖音', url: 'https://www.douyin.com/hot' },
      { rank: 7, title: '秋季穿搭公式', heat: '492万', source: '抖音', url: 'https://www.douyin.com/hot' },
      { rank: 8, title: '城市夜景航拍', heat: '430万', source: '抖音', url: 'https://www.douyin.com/hot' },
      { rank: 9, title: '宠物迷惑行为大赏', heat: '376万', source: '抖音', url: 'https://www.douyin.com/hot' },
      { rank: 10, title: '广场舞新神曲', heat: '318万', source: '抖音', url: 'https://www.douyin.com/hot' }
    ]
  }
]
