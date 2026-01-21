import { neon } from '@neondatabase/serverless'

interface FeedbackBody {
  type: string
  content: string
  contact?: string
}

// CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
}

export default async (request: Request) => {
  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '方法不允许' }), {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    const body: FeedbackBody = await request.json()
    
    // 验证必填字段
    if (!body.type || !body.content) {
      return new Response(JSON.stringify({ error: '请填写反馈类型和内容' }), {
        status: 400,
        headers: corsHeaders
      })
    }

    // 连接 Neon 数据库
    const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL
    if (!databaseUrl) {
      console.error('数据库环境变量未设置')
      return new Response(JSON.stringify({ error: '服务器配置错误，请联系管理员' }), {
        status: 500,
        headers: corsHeaders
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
      headers: corsHeaders
    })
  } catch (error) {
    console.error('提交反馈失败:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return new Response(JSON.stringify({ error: '提交失败，请稍后重试', detail: errorMessage }), {
      status: 500,
      headers: corsHeaders
    })
  }
}

export const config = {
  path: '/api/feedback'
}
