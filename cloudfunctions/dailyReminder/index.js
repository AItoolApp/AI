// 云函数：每日打卡提醒（定时触发器）
// 部署：微信开发者工具 → 云开发 → 云函数 → 新建 → 配置定时触发器
// 触发器：每天 20:00 执行（config.json 已配置）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  // 查询所有订阅了提醒的用户
  const users = await db.collection('reminders')
    .where({ enabled: true })
    .get()
  
  let sent = 0
  for (const user of users.data) {
    try {
      // 发送订阅消息（需要用户在小程序内点击订阅授权）
      const result = await cloud.openapi.subscribeMessage.send({
        touser: user.openid,
        templateId: 'YOUR_TEMPLATE_ID', // 替换为你的订阅消息模板ID
        page: 'pages/today/index',
        data: {
          thing1: { value: '今天还有习惯没完成哦' }
        }
      })
      sent++
    } catch (e) {
      console.error('发送失败', user.openid, e)
    }
  }
  
  return { ok: true, sent }
}
