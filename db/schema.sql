-- ============================================================
-- schema.sql｜建表脚本
-- 项目：全网热搜聚合
-- Day 16｜表结构从 api-contract.md 推导，不是自由发挥
--
-- ⚠️ 本脚本【可重复执行】：开头先 DROP 再建表，跑第二遍不会报错。
--
-- 【安全警告】Day 20 部署上线后禁止执行本文件！
--   建表脚本会 DROP 掉已有的表，真实数据会全部清空。
--   上线后的表结构变更一律写成【增量 SQL】（ALTER TABLE ... ADD COLUMN）。
--   只在开发阶段使用。
-- ============================================================

-- ------------------------------------------------------------
-- 表 1：hotlist_items（热搜条目）
-- 对应契约接口：2 列表 / 3 单平台榜 / 4 详情 / 5 词云 / 6 趋势
-- ------------------------------------------------------------

-- 先删后建，保证脚本可重复执行
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS hotlist_items CASCADE;

CREATE TABLE hotlist_items (
  -- 主键。BIGINT 而不是 INT：条目会长期累积，且被 favorites 引用
  id           BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- 来源平台。枚举值用 CHECK 写死在数据库里
  platform     VARCHAR(20)  NOT NULL
               CHECK (platform IN ('douyin', 'bilibili', 'baidu')),

  -- 热搜标题。VARCHAR(200) 而不是 TEXT：TEXT 不加长度限制，以后想收紧改不动
  title        VARCHAR(200) NOT NULL,

  -- 🔴 热度拆成两个字段（Day 16 用户拍板）：
  --    heat_value 整数 → 用来排序、算相对指数（Day 5 的趋势算法依赖它）
  --    heat_text  字符串 → 页面原样显示「1021万」，前端不用换算
  --    只存字符串会导致「字符串没法排序、没法算趋势」
  heat_value   BIGINT       NOT NULL CHECK (heat_value >= 0),
  heat_text    VARCHAR(20)  NOT NULL,

  -- 排名。取值范围直接写进数据库
  rank         INTEGER      NOT NULL CHECK (rank BETWEEN 1 AND 20),

  -- 分类。契约里定义了 7 个
  category     VARCHAR(20)  NOT NULL
               CHECK (category IN ('生活', '热点事件', '娱乐', '体育', '科技', '社会', '游戏')),

  -- 🔴 tag 是【可选字段】，部分条目没有（如「热」「沸」「新」）
  --    可空就写 NULL，不要填空字符串——空串和 NULL 是两回事
  tag          VARCHAR(10)  NULL,

  -- 原平台链接，长度不设限
  url          TEXT         NOT NULL,

  -- 展示用的中文平台名
  source       VARCHAR(20)  NOT NULL,

  -- 榜单日期。用 DATE 不用字符串：能按天分组算趋势、能比较大小
  stat_date    DATE         NOT NULL,

  -- 抓取时间（云函数写入）。带时区，跨时区不会错
  fetched_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

  -- 唯一约束只加在【业务字段】上（Day 16 用户拍板，对齐课程案例的「来源平台+标题+日期」）
  -- 同一天、同一平台、同一个标题只应有一条 → 同时也是「每天抓取去重」的基础
  CONSTRAINT uq_hotlist_platform_title_date UNIQUE (platform, title, stat_date)
);

-- 「查某平台某天的榜单」是最高频的查询（契约接口 2/3 都走它）
CREATE INDEX idx_hotlist_platform_date ON hotlist_items (platform, stat_date);

-- 「最近 7 天趋势」要按 stat_date 分组（契约接口 6）
CREATE INDEX idx_hotlist_stat_date ON hotlist_items (stat_date);


-- ------------------------------------------------------------
-- 表 2：favorites（收藏）
-- 对应契约接口：7 读 / 8 增 / 9 改备注 / 10 删
--
-- 🔴 关联方式（今天每日一问的答案）：favorites.item_id
--    → hotlist_items.id，靠外键关联，不是靠标题字符串
--
-- ⚠️ 本课程不登录、不建用户表（清单明确要求），
--    所以【没有身份/用户字段】——意味着这张表是全局共享的一份收藏。
--    Day 20 上线后如果有别人访问，收藏是所有人共用的。这是砍掉登录的连带代价。
-- ------------------------------------------------------------

CREATE TABLE favorites (
  id          BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- 🔴 外键：靠它关联到 hotlist_items
  --    ON DELETE CASCADE：条目被删了，收藏自动跟着删，不留脏数据
  item_id     BIGINT       NOT NULL
              REFERENCES hotlist_items (id) ON DELETE CASCADE,

  -- 备注。契约里规定最长 200 字，可为空
  note        VARCHAR(200) NULL,

  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),

  -- 改备注（契约接口 9）要靠它区分「什么时候改的」
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),

  -- 同一条热搜不允许收藏两次
  CONSTRAINT uq_fav_item UNIQUE (item_id)
);

-- 「我的收藏」页要按收藏时间倒序展示
CREATE INDEX idx_fav_created ON favorites (created_at DESC);


-- ============================================================
-- 字段类型为什么这么选（清单「余力加练」要求说明）
--
-- BIGINT  vs INT     ：id 是外键、被收藏表引用，且条目长期累积，INT 迟早不够
-- DATE    vs VARCHAR ：stat_date 要参与分组和大小比较，字符串比不了
-- TIMESTAMPTZ vs TIMESTAMP ：带时区。抓取时间来自云函数，存本地时间迟早出乱子
-- VARCHAR(N) vs TEXT ：标题/备注有明确上限，写死长度才能在数据库层拦住超长数据
-- NOT NULL vs NULL   ：平台/标题/热度/排名这些业务必需的一律 NOT NULL
--                      tag 按契约就是可选的，必须给 NULL
-- CHECK vs 枚举类型  ：CHECK 写死了规则但后期好改；建 PostgreSQL 枚举类型改动成本高
-- 拆 heat 两个字段   ：显示要「1021万」原样，计算要纯数字，混在一起两头都不讨好
-- ============================================================
