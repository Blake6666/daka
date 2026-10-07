-- ============================================================
-- seed.sql｜种子脚本（示例数据）
-- 项目：全网热搜聚合
-- Day 16｜验收要求：重复执行不报错
--
-- 【本脚本做了什么】先 DROP → 再 CREATE → 再 INSERT
--   所以第 1 遍、第 2 遍、第 N 遍执行的结果完全一样，不会因为「已存在」而报错。
--
-- 🔴🔴🔴【安全警告：Day 20 部署上线后禁止执行本脚本】🔴🔴🔴
--   开头两行 DROP 会把 hotlist_items 和 favorites 的【全部真实数据删光】。
--   上线后数据变更一律用增量 SQL（INSERT / UPDATE / DELETE 单条语句）。
--   只想往表里加数据时，绝不要跑这个文件。
--
--   数据来自 frontend/src/data/hotlistData.js 里的真实示例榜单，
--   不是编的，方便你对着页面核对。
-- ============================================================

-- ------------------------------------------------------------
-- 第 1 步：先删（保证重复执行不报「已存在」）
-- 顺序有讲究：先删 favorites（外键指向 hotlist_items），再删 hotlist_items
-- ------------------------------------------------------------
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS hotlist_items CASCADE;

-- ------------------------------------------------------------
-- 第 2 步：再建
-- ⚠️ 下面的建表语句与 schema.sql 完全一致
--    改字段时【两个文件都要改】，否则这里会把库结构改回旧版
-- ------------------------------------------------------------
CREATE TABLE hotlist_items (
  id           BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  platform     VARCHAR(20)  NOT NULL
               CHECK (platform IN ('douyin', 'bilibili', 'baidu')),
  title        VARCHAR(200) NOT NULL,
  heat_value   BIGINT       NOT NULL CHECK (heat_value >= 0),
  heat_text    VARCHAR(20)  NOT NULL,
  rank         INTEGER      NOT NULL CHECK (rank BETWEEN 1 AND 20),
  category     VARCHAR(20)  NOT NULL
               CHECK (category IN ('生活', '热点事件', '娱乐', '体育', '科技', '社会', '游戏')),
  tag          VARCHAR(10)  NULL,
  url          TEXT         NOT NULL,
  source       VARCHAR(20)  NOT NULL,
  stat_date    DATE         NOT NULL,
  fetched_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_hotlist_platform_title_date UNIQUE (platform, title, stat_date)
);

CREATE INDEX idx_hotlist_platform_date ON hotlist_items (platform, stat_date);
CREATE INDEX idx_hotlist_stat_date ON hotlist_items (stat_date);

CREATE TABLE favorites (
  id          BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id     BIGINT       NOT NULL
              REFERENCES hotlist_items (id) ON DELETE CASCADE,
  note        VARCHAR(200) NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_fav_item UNIQUE (item_id)
);

CREATE INDEX idx_fav_created ON favorites (created_at DESC);

-- ------------------------------------------------------------
-- 第 3 步：灌数据
--
-- hotlist_items：6 条（三个平台各 2 条），全部取自项目里的真实示例榜单
--   · 覆盖 3 个平台
--   · 覆盖 tag 有值 和 tag 为 NULL 两种情况（契约里 tag 是可选字段）
--   · heat_value 是纯数字（1021万 → 10210000），heat_text 是原样显示值
--
-- favorites：5 条，通过 item_id 关联到上面 6 条中的 5 条
--   · item_id 写死 1~6：表是刚 DROP 重建的，自增编号从 1 开始，结果可复现
-- ------------------------------------------------------------

INSERT INTO hotlist_items
  (platform, title, heat_value, heat_text, rank, category, tag, url, source, stat_date, fetched_at)
VALUES
  -- 抖音（source 是展示用的中文名，跟 platform 是两回事）
  ('douyin',   '沉浸式收纳宿舍桌面',   10210000, '1021万', 1, '生活',     '热', 'https://www.douyin.com/hot',                    '抖音', '2026-09-23', '2026-09-23 21:30:00+08'),
  ('douyin',   '挑战全网最干净厨房',    9870000,  '987万',  2, '生活',     NULL, 'https://www.douyin.com/hot',                    '抖音', '2026-09-23', '2026-09-23 21:30:00+08'),
  -- B站
  ('bilibili', '《黑神话》新 DLC 实机演示', 8920000, '892万', 1, '游戏',    '沸', 'https://www.bilibili.com/v/popular/rank/all',   'B站',  '2026-09-23', '2026-09-23 21:28:00+08'),
  ('bilibili', '何同学测评折叠屏新旗舰',   7650000,  '765万',  2, '科技',     '热', 'https://www.bilibili.com/v/popular/rank/all',   'B站',  '2026-09-23', '2026-09-23 21:28:00+08'),
  -- 百度（量级比抖音小 10 倍以上，这正是趋势要用相对指数的原因）
  ('baidu',    '台风路径最新消息',         980000,   '98万',  1, '社会',     '热', 'https://top.baidu.com/board?tab=realtime',      '百度', '2026-09-23', '2026-09-23 21:25:00+08'),
  ('baidu',    '央行降准释放流动性',       920000,   '92万',  2, '热点事件', '沸', 'https://top.baidu.com/board?tab=realtime',      '百度', '2026-09-23', '2026-09-23 21:25:00+08');

-- 收藏：故意留 1 条没有备注（note 为 NULL），验证「备注是可选的」
INSERT INTO favorites (item_id, note, created_at, updated_at) VALUES
  (1, '想学这个桌面布置',   '2026-09-24 14:20:00+08', '2026-09-24 14:20:00+08'),
  (2, NULL,                 '2026-09-24 14:25:00+08', '2026-09-24 14:25:00+08'),
  (3, 'DLC 什么时候发售',   '2026-09-24 15:02:00+08', '2026-09-24 15:02:00+08'),
  (4, '折叠屏散热到底行不行', '2026-09-25 09:10:00+08', '2026-09-25 09:10:00+08'),
  (5, '关注',               '2026-09-25 20:30:00+08', '2026-09-25 20:30:00+08');

-- ============================================================
-- 执行完怎么验证（清单「今天怎么检测」第 1 条）
--
--   SELECT * FROM hotlist_items ORDER BY platform, rank;
--   SELECT * FROM favorites ORDER BY id;
--
--   每张表各返回 6 行 / 5 行 = 合格（有行 = 表真实存在且数据灌进去了）
--
-- 可重复执行怎么检测（检测第 2 条）：把本文件【从头再执行第二遍】。
--   不报错 = 合格。报错 = 脚本里缺了开头的「先 DROP」。
--
-- 唯一约束顺带也验了：把第 2 遍执行完再跑一次下面这句，应该报「违反唯一约束」，
--   这说明 (platform, title, stat_date) 真的生效了：
--   INSERT INTO hotlist_items (platform,title,heat_value,heat_text,rank,category,url,source,stat_date)
--   VALUES ('douyin','沉浸式收纳宿舍桌面',1,'1',1,'生活','x','抖音','2026-09-23');
-- ============================================================
