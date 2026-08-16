# 习惯打卡项目交接与状态

> 更新：2026-08-07
> 用途：项目内轻量交接入口。新会话先读本文件；需要细节时再读“外部上下文”中的文档，不要默认加载旧会话 JSONL。

## 当前结论

- 小程序代码可构建：`weapp` 下 `npx tsc --noEmit` 和 `npm run build:weapp` 均通过（2026-08-07）。
- ICP 小程序备案初审已通过，等待短信验证；域名过初审是另一个项目，不混记。
- 1.0 已提交上线流程；备案未通过前不可发布，可先做体验版测试。
- 微信审核曾有“等腾讯域名备案”的驳回提示，但小程序未配置自定义域名，需要联系微信客服确认并纠正后重提。
- 云开发环境：`cloudbase-d3g7noa8yac9d743c`。
- `feedbackCollect` 已部署；`feedbacks` 已有 4 条测试记录，反馈链路正常。
- `dailyReminder` 未部署；代码中仍是 `YOUR_TEMPLATE_ID`，需要订阅消息模板 ID 后才能部署。
- Git `main` 当前 HEAD 为 `fd17f44`；小程序云接入、云函数、备案材料等改动尚未提交。
- 习惯打卡早晚会：`automation-3` 每天 7:00/16:00，目标线程为 `019fdb39-e990-7c12-bf99-696421ec7629`（2026-08-07 起由本线程承接）。
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
- 本地数据：`weapp/src/utils/storage.ts`、`weapp/src/utils/constants.ts`
- 云函数：`weapp/cloudfunctions/feedbackCollect`、`weapp/cloudfunctions/dailyReminder`
- 云开发部署指南：`cloudfunctions/部署指南.md`
- 云开发避坑：`云开发避坑与最佳实践.md`

## 待办

1. P0：用户查看微信小程序审核结果；如仍提示腾讯域名备案问题，联系客服确认后再重提。
2. P0：ICP 短信验证通过后，继续等管局审核；通过后完成 1.0 提审/发布。
3. P1：用户提供订阅消息模板 ID；拿到后把 `dailyReminder/index.js` 中的 `YOUR_TEMPLATE_ID` 替换并部署云函数。
4. P2：按上线前准备清单执行体验版自测、运营素材、数据埋点。
5. P2：提交当前未提交的云开发和小程序接入代码，排除 `node_modules/`、`weapp/project.private.config.json`。

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
