import { neon } from '@neondatabase/serverless'

interface FeedbackBody {
  type: string
  content: string
  contact?: string
}

export default async (request: Request) => {
  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '方法不允许' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body: FeedbackBody = await request.json()
    
    // 验证必填字段
    if (!body.type || !body.content) {
      return new Response(JSON.stringify({ error: '请填写反馈类型和内容' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 连接 Neon 数据库（Netlify 自动注入的环境变量名为 NETLIFY_DATABASE_URL）
    const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL
    if (!databaseUrl) {
      console.error('数据库环境变量未设置')
      return new Response(JSON.stringify({ error: '服务器配置错误' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const sql = neon(databaseUrl)

    // 插入反馈数据
    await sql`
      INSERT INTO feedback (type, content, contact, created_at)
      VALUES (${body.type}, ${body.content}, ${body.contact || null}, NOW())
    `

    return new Response(JSON.stringify({ success: true, message: '反馈提交成功，感谢您的意见！' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('提交反馈失败:', error)
    return new Response(JSON.stringify({ error: '提交失败，请稍后重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: '/api/feedback'
}
