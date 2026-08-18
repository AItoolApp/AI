# 习惯打卡项目交接与状态

> 更新：2026-08-18
> 用途：项目内轻量交接入口。新会话先读本文件；需要细节时再读“外部上下文”中的文档，不要默认加载旧会话 JSONL。

## 当前结论

- 小程序代码可构建：`weapp` 下 `npx tsc --noEmit` 和 `npm run build:weapp` 均通过（2026-08-18 复验）。
- **UI 优化 v1.1（数据加固，P0-1~P0-6）已实施并提交**：存储拆分（`habit_data` 元信息 + `habit_checkins_<id>` 打卡记录，数据格式 v2 带自动迁移）、写入失败兜底弹窗、打卡不可变更新、导航栏安全区动态适配（`utils/safeArea.ts`）、单行输入改 Input、删除 12 个冗余 .jpg 图标。详见 `UI优化方案-v1.md` §8。
- **ICP 小程序备案已通过**（微信后台显示“已备案”），备案号待从后台「设置 → 基本设置 → 小程序备案 → 查看详情」获取并回填到文档与关于页。
- **线上版本 1.0.0 已发布**（发布时间 2026-08-05 16:45:50，发布者“明明就想打球”）：小程序已正式上线，但当前线上代码为 v1.0 旧版。
- **v1.1.0 数据加固版已于 2026-08-18 上传并提交审核**，备注：`v1.1 数据加固：存储拆分+迁移、写入兜底、安全区适配、Input 替换、图标去重`；待微信审核通过后发布。
- **微信认证进行中**：平台通知 2026-09-17 前完成；认证已付款，等待审核。后台“通过名称搜索此小程序”当前为“无法被搜索”，违规记录已确认无记录，应为未认证导致的搜索限制，认证通过后应恢复。
- **用户隐私保护指引未更新**：提审前必须完成（设置 → 服务内容声明 → 用户隐私保护指引）。应选择“本小程序处理了用户信息”，并声明：反馈内容、联系方式（选填）通过云函数上传至云开发数据库，用于收集建议；打卡数据仅存本地。
- **用户生成内容场景声明未声明**：本项目无 UGC，提审前选择“不涉及用户生成内容”完成声明。
- **公安备案未办理**：ICP 备案通过后 30 日内需在 `beian.gov.cn` 办理公安联网备案（小程序类型）；腾讯云侧提醒的是网站公安备案，两者分开办理。
- 服务类目（后台实际）：工具 > 备忘录、工具 > 记账。
- 备案号待确认：后台「设置 → 基本设置 → 小程序备案 → 查看详情」已有备案信息，但备案号字段需用户找到后回填；如后台无号，可到 beian.miit.gov.cn 公共查询或咨询在线客服。
- 云开发环境：`cloudbase-d3g7noa8yac9d743c`。
- `feedbackCollect` 已部署；`feedbacks` 已有 4 条测试记录，反馈链路正常。
- `dailyReminder` 未部署；代码中仍是 `YOUR_TEMPLATE_ID`，需要订阅消息模板 ID 后才能部署。
- 本地 `main` 领先 `origin/main` 1 个提交（`42d6eab` v1.1 数据加固），发布前需 push 备份。
- 习惯打卡早晚会：`automation-3` 已暂停且指向旧线程，恢复前必须先更新目标线程与抄送目标。
- 自动化审计流程：见 `AUTOMATION_HANDOVER_PROCESS.md`；其他项目缺口已同步协调线程，内部等待用户确认后再修复。

## 技术栈

- 微信小程序：Taro 4 + React 18 + TypeScript + SCSS
- 小程序源码：`weapp/src`
- 小程序构建输出：`weapp/dist`
- 云函数：`weapp/cloudfunctions`（开发者工具部署副本），根目录 `cloudfunctions` 为项目源码副本
- 旧 Web 版：`app.html` / `习惯打卡.html`，纯 HTML + localStorage，非当前主线

## 关键路径

- 小程序配置：`weapp/project.config.json`，已配置 `cloudfunctionRoot: cloudfunctions/`
- 小程序入口：`weapp/src/app.tsx`
- 今日打卡：`weapp/src/pages/today/index.tsx`
- 管理/反馈：`weapp/src/pages/manage/index.tsx`
- 日历/统计：`weapp/src/pages/calendar/index.tsx`、`weapp/src/pages/stats/index.tsx`
- 本地数据：`weapp/src/utils/storage.ts`、`weapp/src/utils/constants.ts`（v2：meta + `habit_checkins_<id>`）
- 导航栏安全区：`weapp/src/utils/safeArea.ts`
- 云函数：`weapp/cloudfunctions/feedbackCollect`、`weapp/cloudfunctions/dailyReminder`
- 云开发部署指南：`cloudfunctions/部署指南.md`
- 云开发避坑：`云开发避坑与最佳实践.md`

## 待办

1. P0：等微信认证审核通过（已付款，限期 2026-09-17）；通过后验证名称搜索恢复。
2. P0：完善用户隐私保护指引（选择“处理了用户信息”并声明反馈内容/联系方式）；完成用户生成内容场景声明（选择“不涉及 UGC”）。
3. P0：查看并回填小程序备案号；拿到号后在管理页「关于」区域展示，并更新本文件。
4. P0：跟进 v1.1.0 审核进度；审核通过后立即发布（线上 1.0.0 为旧代码，存在全量读写存储风险）。
5. P0：公安联网备案：`beian.gov.cn` 提交小程序类型公安备案（备案通过后 30 日内完成）；与网站公安备案分开办理。
6. P1：push 本地领先的 1 个提交到 GitHub 备份。
7. P1：用户提供订阅消息模板 ID；拿到后替换 `dailyReminder/index.js` 中的 `YOUR_TEMPLATE_ID` 并部署云函数。
8. P1（v1.1 收尾）：真机/模拟器验收（刘海屏标题、旧数据迁移、10 习惯×365 天压测）。
9. P2（v1.2）：按 `UI优化方案-v1.md` 推进交互升级（P1-1~P1-5：打卡按钮可访问性、打卡彩蛋、删除撤销、日历详情、主题引导）。
10. P2：按上线前准备清单执行体验版自测、运营素材、数据埋点。

## 验证命令

```bash
cd /Users/mac/Documents/习惯打卡测试/weapp
npx tsc --noEmit
npm run build:weapp
```

## 外部上下文

- 共享状态：`/Users/mac/Documents/问题和学习/轻量续聊上下文.md`
- 各项目状态：`/Users/mac/Documents/问题和学习/各项目最新会话状态摘要.md`
- 习惯打卡交接摘要：`/Users/mac/Documents/问题和学习/本会话交接摘要-习惯打卡-20260804.md`
- 上线前准备清单：`/Users/mac/Documents/问题和学习/习惯打卡上线前准备清单.md`
- 自动化 memory：`/Users/mac/.codex/automations/11-30/memory.md`

## 注意事项

- CloudBase 控制台必须用「使用微信公众平台账号登录」，普通腾讯云账号登录会显示 0 个环境。
- 根目录 `cloudfunctions` 与 `weapp/cloudfunctions` 存在重复维护；后续提交时先确认以哪个副本为准。
- 不提交 `node_modules/` 和 `weapp/project.private.config.json`。
- API key 只从本地 `.env` / `.env.local` 读取，不写进聊天、文档和代码。
