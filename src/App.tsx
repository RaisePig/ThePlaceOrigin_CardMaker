import { Analytics } from '@vercel/analytics/react'
import CardMaker from './components/CardMaker'

function App() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">
            桌游卡牌制作系统
          </h1>
          <CardMaker />
        </div>
      </div>
      <Analytics />
    </>
  )
}

export default App
