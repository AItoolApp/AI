// 云函数：反馈收集
// 部署：微信开发者工具 → 云开发 → 云函数 → 新建 → 粘贴此文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { text, contact } = event
  const wxContext = cloud.getWXContext()
  
  if (!text || !text.trim()) {
    return { ok: false, msg: '内容为空' }
  }
  
  try {
    await db.collection('feedbacks').add({
      data: {
        text: text.trim(),
        contact: contact || '',
        openid: wxContext.OPENID,
        time: db.serverDate(),
        status: 'new'
      }
    })
    return { ok: true }
  } catch (e) {
    console.error(e)
    return { ok: false, msg: '写入失败' }
  }
}
