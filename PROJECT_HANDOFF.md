# 习惯打卡项目交接与状态

> 更新：2026-08-19
> 用途：项目内轻量交接入口。新会话先读本文件；需要细节时再读“外部上下文”中的文档，不要默认加载旧会话 JSONL。

## 当前结论

- 小程序代码可构建：`weapp` 下 `npx tsc --noEmit` 和 `npm run build:weapp` 均通过（2026-08-18 复验）。
- **UI 优化 v1.1（数据加固，P0-1~P0-6）已实施并提交**：存储拆分（`habit_data` 元信息 + `habit_checkins_<id>` 打卡记录，数据格式 v2 带自动迁移）、写入失败兜底弹窗、打卡不可变更新、导航栏安全区动态适配（`utils/safeArea.ts`）、单行输入改 Input、删除 12 个冗余 .jpg 图标。详见 `UI优化方案-v1.md` §8。
- **ICP 小程序备案已通过**（微信后台显示“已备案”），备案号待从后台「设置 → 基本设置 → 小程序备案 → 查看详情」获取并回填到文档与关于页。
- **线上版本已升级为 v1.1.0**（2026-08-19 审核通过并发布）：数据加固版已上线，旧版 1.0.0 已被替换。
- **v1.1.0 数据加固版已于 2026-08-18 提交审核，2026-08-19 审核通过并发布上线**，备注：`v1.1 数据加固：存储拆分+迁移、写入兜底、安全区适配、Input 替换、图标去重`。
- **手机看到“开发版”说明**：扫的是开发者工具预览码，不是线上版；线上验证应从微信名称搜索进入。
- **v1.1 真机/模拟器验收已完成**（2026-08-18）：刘海屏标题、旧数据迁移、10 习惯×365 天压测均通过，未报告遗留问题。
- **微信认证已通过**（2026-08-19）：名称搜索已恢复，用户用另一个微信已能搜索到小程序。
- **用户隐私保护指引已完成**（2026-08-18）：已选择“本小程序处理了用户信息”，并声明反馈内容、联系方式（选填）通过云函数上传至云开发数据库用于收集建议；打卡数据仅存本地。
- **用户生成内容场景声明已完成**（2026-08-18）：选择“不涉及用户生成内容”。
- **公安备案未办理**：ICP 备案通过后 30 日内需在 `beian.gov.cn` 办理公安联网备案（小程序类型）；腾讯云侧提醒的是网站公安备案，两者分开办理。
- 服务类目（后台实际）：工具 > 备忘录、工具 > 记账。
- 备案号待确认：后台「设置 → 基本设置 → 小程序备案 → 查看详情」已有备案信息，但备案号字段需用户找到后回填；如后台无号，可到 beian.miit.gov.cn 公共查询或咨询在线客服。
- 云开发环境：`cloudbase-d3g7noa8yac9d743c`。
- `feedbackCollect` 已部署；`feedbacks` 已有 4 条测试记录，反馈链路正常。
- `dailyReminder` 未部署；代码中仍是 `YOUR_TEMPLATE_ID`，需要订阅消息模板 ID 后才能部署。
- 本地 `main` 与 `origin/main` 已同步（2026-08-19 push：含 v1.1 数据加固代码、v1.1.0 提审/认证/发布等文档更新）。
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

1. P0：线上验证 v1.1.0：微信搜索名称进入 → 管理页确认显示 `习惯打卡 v1.1.0`，无“开发版/体验版”角标。
2. P0：查看并回填小程序备案号（微信暂无通知，等后台可查后处理）；拿到号后在管理页「关于」区域展示并更新本文件。
3. P0：公安联网备案：`beian.gov.cn` 提交小程序类型公安备案（备案通过后 30 日内完成）；与网站公安备案分开办理。
4. P1：用户提供订阅消息模板 ID；拿到后替换 `dailyReminder/index.js` 中的 `YOUR_TEMPLATE_ID` 并部署云函数。
5. P2（v1.2）：按 `UI优化方案-v1.md` 推进交互升级（P1-1~P1-5：打卡按钮可访问性、打卡彩蛋、删除撤销、日历详情、主题引导）。
6. P2：按上线前准备清单执行体验版自测、运营素材、数据埋点。

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
