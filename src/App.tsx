import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import CardMaker from './components/CardMaker'
import Feedback from './components/Feedback'

// 资源保护 Hook
function useResourceProtection() {
  useEffect(() => {
    // 禁用右键菜单
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // 对图片、canvas 和带有 protected 类的元素禁用右键
      // 但允许预览图片（.preview-image）在移动端长按保存
      if (
        (target.tagName === 'IMG' && !target.closest('.preview-image-container')) ||
        target.tagName === 'CANVAS' ||
        (target.closest('.protected-resource') && !target.closest('.preview-image-container')) ||
        target.closest('canvas')
      ) {
        e.preventDefault()
        return false
      }
    }

    // 禁用拖拽
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG' || target.tagName === 'CANVAS') {
        e.preventDefault()
        return false
      }
    }

    // 禁用某些快捷键（Ctrl+S, Ctrl+U, Ctrl+Shift+I 等）
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S (保存)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        return false
      }
      // Ctrl+U (查看源代码)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
        return false
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}

// 导航组件
function Navigation() {
  const location = useLocation()
  
  return (
    <nav className="bg-slate-900/50 backdrop-blur-sm border-b border-teal-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo 和标题 */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-all">
              <span className="text-white font-bold text-sm">怪</span>
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent hidden sm:block">
              怪谈事务所：起源 DIY 工具
            </span>
            <span className="text-lg font-semibold bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent sm:hidden">
              起源 DIY
            </span>
          </Link>
          
          {/* 导航链接 */}
          <div className="flex items-center gap-2">
            <Link 
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/' 
                  ? 'bg-teal-500/20 text-teal-300' 
                  : 'text-slate-400 hover:text-teal-300 hover:bg-slate-800/50'
              }`}
            >
              制作卡牌
            </Link>
            <Link 
              to="/feedback"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/feedback' 
                  ? 'bg-teal-500/20 text-teal-300' 
                  : 'text-slate-400 hover:text-teal-300 hover:bg-slate-800/50'
              }`}
            >
              意见反馈
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

// 主布局组件
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950">
      {/* 顶部滚动公告 */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 text-white py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          <span className="mx-8 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
            </svg>
            🎮 限时测试中 · 欢迎体验怪谈事务所：起源 DIY 工具 · 如遇问题请前往反馈页面提交 · 测试期间功能可能随时调整
          </span>
          <span className="mx-8 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
            </svg>
            🎮 限时测试中 · 欢迎体验怪谈事务所：起源 DIY 工具 · 如遇问题请前往反馈页面提交 · 测试期间功能可能随时调整
          </span>
          <span className="mx-8 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
            </svg>
            🎮 限时测试中 · 欢迎体验怪谈事务所：起源 DIY 工具 · 如遇问题请前往反馈页面提交 · 测试期间功能可能随时调整
          </span>
        </div>
      </div>

      {/* 导航栏 */}
      <Navigation />

      {/* 主体内容 */}
      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* 底部版权声明 */}
      <footer className="bg-slate-950/80 backdrop-blur-sm border-t border-teal-900/30 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3">
            {/* 警告提示 */}
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">重要声明</span>
            </div>
            
            {/* 声明内容 */}
            <div className="text-center text-slate-400 text-xs leading-relaxed max-w-2xl">
              <p className="mb-1">
                ⚠️ 严禁使用官方插画或受版权保护的素材进行制图
              </p>
              <p className="mb-1">
                本工具仅供个人学习交流使用，请勿用于任何商业用途
              </p>
              <p>
                用户使用本工具所产生的内容及后果由用户自行承担，与本工具无关
              </p>
            </div>

            {/* 分隔线 */}
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-teal-800 to-transparent my-2"></div>
            
            {/* 版权信息 */}
            <p className="text-slate-500 text-xs">
              © 2024 怪谈事务所：起源 DIY 工具 · 仅供学习交流使用
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  // 启用资源保护
  useResourceProtection()

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<CardMaker />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
