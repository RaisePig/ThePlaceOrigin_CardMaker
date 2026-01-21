-- 在 Neon 数据库控制台执行此 SQL 创建反馈表

CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  contact VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending'
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

-- 添加注释
COMMENT ON TABLE feedback IS '用户反馈表';
COMMENT ON COLUMN feedback.type IS '反馈类型：bug/feature/question/other';
COMMENT ON COLUMN feedback.content IS '反馈内容';
COMMENT ON COLUMN feedback.contact IS '联系方式（可选）';
COMMENT ON COLUMN feedback.status IS '处理状态：pending/processing/resolved';
