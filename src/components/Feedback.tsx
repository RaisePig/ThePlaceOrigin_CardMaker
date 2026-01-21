// 反馈页面组件

import { useState } from 'react'

type FeedbackType = 'bug' | 'feature' | 'question' | 'other'

interface FeedbackForm {
  type: FeedbackType
  content: string
  contact: string
}

const feedbackTypes: { value: FeedbackType; label: string; icon: string; color: string }[] = [
  { value: 'bug', label: 'Bug 反馈', icon: '🐛', color: 'from-red-500 to-rose-500' },
  { value: 'feature', label: '功能建议', icon: '💡', color: 'from-amber-500 to-yellow-500' },
  { value: 'question', label: '使用疑问', icon: '❓', color: 'from-blue-500 to-cyan-500' },
  { value: 'other', label: '其他反馈', icon: '📝', color: 'from-purple-500 to-indigo-500' },
]

export default function Feedback() {
  const [form, setForm] = useState<FeedbackForm>({
    type: 'bug',
    content: '',
    contact: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.content.trim()) {
      setSubmitResult({ success: false, message: '请填写反馈内容' })
      return
    }

    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitResult({ success: true, message: data.message || '反馈提交成功！' })
        // 清空表单
        setForm({ type: 'bug', content: '', contact: '' })
      } else {
        setSubmitResult({ success: false, message: data.error || '提交失败，请稍后重试' })
      }
    } catch (error) {
      console.error('提交反馈失败:', error)
      setSubmitResult({ success: false, message: '网络错误，请检查网络连接后重试' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedType = feedbackTypes.find(t => t.value === form.type)

  return (
    <div className="max-w-2xl mx-auto">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent mb-3">
          意见反馈
        </h1>
        <p className="text-slate-400 text-sm">
          您的反馈对我们非常重要，帮助我们不断改进工具体验
        </p>
      </div>

      {/* 反馈表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 反馈类型选择 */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-teal-900/30">
          <label className="block text-sm font-medium text-slate-300 mb-4">
            反馈类型
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {feedbackTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, type: type.value }))}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  form.type === type.value
                    ? `border-teal-500 bg-gradient-to-br ${type.color} bg-opacity-20`
                    : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                }`}
              >
                <span className="text-2xl block mb-2">{type.icon}</span>
                <span className={`text-sm font-medium ${
                  form.type === type.value ? 'text-white' : 'text-slate-400'
                }`}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 反馈内容 */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-teal-900/30">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            反馈内容 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.content}
            onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
            placeholder={
              form.type === 'bug' ? '请详细描述您遇到的问题，包括复现步骤、预期结果和实际结果...' :
              form.type === 'feature' ? '请描述您希望添加的功能，以及这个功能如何帮助您...' :
              form.type === 'question' ? '请描述您在使用过程中遇到的疑问...' :
              '请输入您想反馈的内容...'
            }
            rows={6}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none text-slate-200 placeholder-slate-500 resize-none"
          />
          <p className="text-xs text-slate-500 mt-2">
            {form.content.length} / 2000 字符
          </p>
        </div>

        {/* 联系方式（可选） */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-teal-900/30">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            联系方式 <span className="text-slate-500 text-xs">（可选）</span>
          </label>
          <input
            type="text"
            value={form.contact}
            onChange={(e) => setForm(prev => ({ ...prev, contact: e.target.value }))}
            placeholder="邮箱、QQ 或其他联系方式，方便我们与您沟通"
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none text-slate-200 placeholder-slate-500"
          />
          <p className="text-xs text-slate-500 mt-2">
            留下联系方式可以让我们在处理您的反馈时与您沟通
          </p>
        </div>

        {/* 提交结果提示 */}
        {submitResult && (
          <div className={`p-4 rounded-lg ${
            submitResult.success 
              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300' 
              : 'bg-red-500/20 border border-red-500/50 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              {submitResult.success ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span>{submitResult.message}</span>
            </div>
          </div>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isSubmitting || !form.content.trim()}
          className={`w-full py-4 rounded-lg font-medium text-white transition-all ${
            isSubmitting || !form.content.trim()
              ? 'bg-slate-700 cursor-not-allowed'
              : `bg-gradient-to-r ${selectedType?.color || 'from-teal-500 to-emerald-500'} hover:shadow-lg hover:shadow-teal-500/25`
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              提交中...
            </span>
          ) : (
            '提交反馈'
          )}
        </button>
      </form>

      {/* 常见问题 */}
      <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-teal-900/30">
        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span>
          常见问题
        </h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="text-teal-300 font-medium mb-1">Q: 如何上传立绘？</h3>
            <p className="text-slate-400">在编辑卡牌页面，点击"人物立绘"区域即可上传图片。支持 JPG、PNG 等常见图片格式。</p>
          </div>
          <div>
            <h3 className="text-teal-300 font-medium mb-1">Q: 如何调整立绘位置和大小？</h3>
            <p className="text-slate-400">上传立绘后，在预览区域拖动可调整位置，使用鼠标滚轮可调整大小。</p>
          </div>
          <div>
            <h3 className="text-teal-300 font-medium mb-1">Q: 导出的图片可以用于什么？</h3>
            <p className="text-slate-400">原图适合打印，缩略图适合在 Tabletop Simulator 等桌游模拟器中使用。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
