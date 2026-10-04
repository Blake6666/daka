# daka 项目上下文包（换账号/换设备时用）

> **这份文件是干什么的**：把 14 天里「不在 GitHub 上的东西」集中存成一份。
>
> **为什么需要它**：项目代码和文档都推到 GitHub 了，换账号换设备都能拉回来。
> 但还有两类东西只在本地：
> ① `.workbuddy/memory/` 里的 14 天工作日志（被 `.gitignore` 挡住，从来没进过 GitHub）
> ② 「我踩过的坑 / 我为什么这么做」这些判断
>
> 这两类恰恰是最值钱的。换号之后靠这份文件把上下文接回来。
>
> **怎么用**：新账号第一次开这个项目时，跟 AI 说「读一下 HANDOFF.md，接上下文」。

---

## 一、5 秒钟自检：我在哪、有没有丢东西

| 检查项 | 在哪 | 换号后还在吗 |
|---|---|---|
| 项目代码 | `C:\Users\Administrator\WorkBuddy\daka\` | ✅ 在，这是你自己的文件夹 |
| GitHub 仓库 | `github.com/Blake6666/daka` | ✅ 在，跟 WorkBuddy 账号无关 |
| 14 天工作日志 | `.workbuddy/memory/*.md` | ⚠️ 只在这台电脑上（**已汇总进本文件**） |
| 用户级技能 | `~/.workbuddy/skills/` | ❌ 可能要重装（见第五节） |
| 市场插件 | `settings.json` 的 `enabledPlugins` | ❌ 跟账号绑定，要重装 |

**GitHub 仓库账号**：Blake6666，邮箱 2697183340@qq.com —— 16 个提交，最新 `51b1751 Day 14`。

---

## 二、项目是什么

「全网热搜聚合」——把抖音、B站、百度三个平台的热搜榜单聚合成一个网站。

这是 Vibe Coding 28 天训练营的练习项目，Day 3~14 走完了「研究 → PRD → 选型 → 开发 → 测试」全流程。

**当前是 mock 数据**（页面上有「mock 数据」徽标，不冒充真数据）。三个平台都没有免密的公开接口，这是 Day 5 就预判到的降级方案。

### 现在有什么功能

| 功能 | 状态 |
|---|---|
| 三个页面（首页 / 平台榜 / 详情页） | ✅ hash 路由，刷新和分享都不丢 |
| 60 条榜单 + 搜索 + 平台筛选 + 分类筛选 | ✅ |
| 四种状态（加载/成功/空/错误） | ✅ 页脚有演示开关可切换 |
| 收藏 + 备注 + 数量角标 | ✅ 存浏览器本地 |
| 词云（36 词）+ 7 天趋势 | ✅ 手写 SVG，零依赖 |
| 复制标题 | ✅ 四态反馈 |
| 深浅色切换 | ✅ |
| **接真数据** | ❌ 未做（第 3 周） |
| **部署上线** | ❌ 未做 |

### 三个页面怎么进

```
首页       http://localhost:5173/#/
平台榜单   http://localhost:5173/#/platform/douyin   （bilibili / baidu 同理）
热搜详情   http://localhost:5173/#/item/douyin/1      （1~20 任选）
```

---

## 三、技术栈与关键约定

- **React 18 + Vite 5**，纯前端，不接云端（Day 7 用户拍板走 7A 路线）
- 端口固定 5173（写死在 `vite.config.js` 的 `strictPort`）
- **Node 用这个绝对路径**（本会话 Bash 是精简终端，coreutils 命令不存在）：
  ```
  C:/Users/Administrator/.workbuddy/binaries/node/versions/22.22.2-3/node.exe
  ```
  跑 vite：`node node_modules/vite/bin/vite.js`
  跑 npm：`node <node>/node_modules/npm/bin/npm-cli.js`
- **数据是 mock 的**，`frontend/src/data/hotlistData.js`，数据结构与云函数返回格式对齐，换真数据时只动这个文件
- 样式全在 `frontend/src/styles.css`，设计规则见 `DESIGN_RULES.md`（改界面先对照它）

---

## 四、我踩过的坑（换号后能省下这些时间）

### 验证前端

- **肉眼看截图不可靠**，已被误导 3 次。一切以 DOM 查询 / `getComputedStyle` 为准
- 手法：系统自带 Edge 无头 + CDP 调试协议，零安装。脚本模板在用户级技能 `headless-page-verify`
- 坑：React 状态更新是异步的，`.click()` 后必须等 100~150ms 再读 DOM
- 坑：受控输入框 `input.value='x'` 不触发 onChange，要用原生 setter + `dispatchEvent(new Event('input',{bubbles:true}))`
- 坑：必须先 `Runtime.enable`，否则收不到报错事件，等于没查
- 坑：可点区大小要用 `elementFromPoint` 命中测试量，`getBoundingClientRect` 量不到 `::after` 撑出来的区域
- 坑：撑大可点区别用 `min-width`（会改变布局），用绝对定位的透明 `::after`
- 坑：**对比度测量必须识别渐变**，否则 163 处全是假故障（`background-clip:text` 也会被误判）
- 坑：对比度脚本要把「祖先的半透明底色」按**层叠遮挡**模型处理——元素自己有不透明底色时祖先不参与比较，否则红底白字按钮会被判 1:1
- 坑：断言别写死会变的数字（`check(count === 36)` 遇真实值 33 会连累后面全挂）
- 坑：CDP 表达式里 `() => ({...})()` 结尾必须是 `}))()`，而 `() => { ... })()` 是 `})()`。**统一用后者**
- 坑：探针里正则 `/\\d/` 通过 bash 传会被吃掉，判断数字直接比 `textContent`

### Git 推送

- GitHub 流量必须走 Nano 加速器的系统代理，git 全局配置已写 `http.https://github.com.proxy`
- 端口可能随 Nano 重启变化（当时是 127.0.0.1:65532）。失效时查注册表 `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings` 的 `ProxyServer`
- **`git push` 报 SIGTERM 不等于网络坏**——那是命令超时被杀的。先 `curl -x http://127.0.0.1:65532 https://github.com` 测一条真请求确认链路
- 推送用这条：
  ```
  git -c http.postBuffer=524288000 -c http.lowSpeedLimit=0 -c http.lowSpeedTime=999999 push origin main
  ```
  配 `run_in_background=true` + TaskOutput 等结果

### 这个终端

- Bash 是**精简终端**：`ls`/`tail`/`env`/`dirname` 等 coreutils 命令不存在，管道里带 `tail` 会「假失败」（实为命令缺失）
- 绕法：文件操作用 `node -e` + `fs`

---

## 五、换号后要做的事

1. **读 `AGENTS.md`** —— 14 天攒下的协作规则（清单即任务范围、一次一步、提交前先列文件、只允许 `git revert` 等），这是最值钱的一份
2. **读本文件** —— 接上下文
3. **重装技能**（零安装的小工具，几秒钟）：
   - `headless-page-verify`：系统 Edge 无头 + CDP 页面验证
   - `basketball-career-sim-v6`：与本项目无关，按需
4. **按需重装市场插件**：`settings.json` 里 `enabledPlugins` 记的那些
5. **确认 Git 代理还在**：`git config --get http.https://github.com.proxy`，没有就设上
6. **开项目**：`cd C:\Users\Administrator\WorkBuddy\daka\frontend` 然后 `npm run dev`

---

## 六、还没做完的事（接着做这些）

| 事项 | 状态 |
|---|---|
| **Day 14 真人测试** | ⚠️ **最重要**。我做的是「卡住降级」自测，`TEST_RECORD.md` 里所有「原话」都是推演的。真人测完必须重填第一节和所有「原话」栏 |
| Day 15 清单 | 还没发 |
| 接真数据 | 第 3 周（Day 21） |
| 截图 | Day 9~14 的截图都攒着，最后一起拍（用户的节奏） |
| 词云里补「AI」等真关键词 | Day 14 测试的意外发现：36 个词里没有一个含「AI」，用户真搜「AI」一个都搜不到 |
| 平台栏/分类栏区分 | Day 14 测试第二个卡点：两排胶囊长得几乎一样，靠 12px 小标签区分，会「差点点错」 |
| 「今日新增 18」写死的假数字 | Hero 区的，RUN.md 已诚实标注 |

---

## 七、这个项目之后要做什么

**「搞怪/奇思妙想百科」** —— 用户课程结束后要立项的产品构想：

- 收集脑洞大开的问题，按版块分类（生活/学习/工作等），给出幽默又科学的回答
- 用户原话的问题举例：「蜘蛛是怎么织网的」「古人怎么在两座山之间架索道」——好奇很久但从没认真查过
- 产品灵魂：**一本正经地回答不正经的好奇心**，笑完还能学到东西
- 承诺：按「研究 → PRD → 选型 → 开发」的同样流程立项

---

## 八、完整文档索引

| 文件 | 是什么 | 哪天的 |
|---|---|---|
| `AGENTS.md` | 协作规则（最重要） | Day 1 起，Day 6 追加 |
| `research.md` | 需求研究、砍功能的理由 | Day 3 |
| `PRD.md` | 产品需求 v1.1（含第 11 节变更记录） | Day 4 |
| `TECH_DESIGN.md` | 技术设计（含第 9.1 节说人话版） | Day 5 |
| `DESIGN_RULES.md` | 界面设计规则（改界面先对照它） | Day 9 |
| `RUN.md` | 运行说明 + 验收复核记录 | Day 7 起 |
| `TEST_CHECKLIST.md` | 用户测试清单（发给同伴看的那份） | Day 14 |
| `TEST_RECORD.md` | 测试记录（自测已填，真人部分待填） | Day 14 |
| `skills/design-review/` | 设计审查技能 + 调用记录 | Day 12 |
| `.workbuddy/memory/*.md` | 14 天工作日志（**只在这台电脑上**） | Day 1~14 |
