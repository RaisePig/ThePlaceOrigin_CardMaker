// 卡牌编辑表单组件

import { useRef, useState, useEffect } from 'react'
import { CardData, Skill, Attributes } from '../types/card'

interface CardFormProps {
  cardData: CardData
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUpdateCardData: (updates: Partial<CardData>) => void
  onAddSkill: () => void
  onUpdateSkill: (index: number, field: keyof Skill, value: string) => void
  onRemoveSkill: (index: number) => void
  onSetUltimate: (field: keyof Skill, value: string) => void
  onRemoveUltimate: () => void
  onUpdateAttribute: (field: keyof Attributes, value: number | string) => void
  // 预览相关
  onPreviewOriginal: () => void
  onPreviewThumbnail: () => void
  previewUrl: string | null
  previewType: 'original' | 'thumbnail' | null
  previewLoading: boolean
  onDownloadPreview: () => void
  onCancelPreview: () => void
}

export default function CardForm({
  cardData,
  onFileUpload,
  onUpdateCardData,
  onAddSkill,
  onUpdateSkill,
  onRemoveSkill,
  onSetUltimate,
  onRemoveUltimate,
  onUpdateAttribute,
  onPreviewOriginal,
  onPreviewThumbnail,
  previewUrl,
  previewType,
  previewLoading,
  onDownloadPreview,
  onCancelPreview
}: CardFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 检测是否为移动端
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
        (window.innerWidth <= 768 && 'ontouchstart' in window))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleClearPortrait = () => {
    // 清除立绘数据
    onUpdateCardData({ portrait: null })
    // 重置文件输入框，允许再次选择同一个文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg shadow-teal-500/10 p-6 space-y-6 border border-teal-900/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full"></div>
        <h2 className="text-xl font-semibold bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">编辑卡牌</h2>
      </div>

      {/* 人物立绘上传 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          人物立绘
        </label>
        {cardData.portrait ? (
          // 已上传：显示已上传状态和删除按钮
          <div className="flex items-center gap-4">
            <div className="flex-1 border-2 border-emerald-500/50 bg-emerald-500/10 rounded-lg p-4 text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-emerald-400">图片已上传</span>
            </div>
            <button
              onClick={handleClearPortrait}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all text-sm shadow-lg shadow-red-500/25"
            >
              删除
            </button>
          </div>
        ) : (
          // 未上传：显示上传区域
          <label className="block cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileUpload}
              className="hidden"
            />
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:border-teal-500/50 hover:bg-teal-500/5 transition-all">
              <svg className="w-8 h-8 mx-auto mb-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm text-slate-400">点击上传图片</span>
            </div>
          </label>
        )}
        {cardData.portrait && (
          <p className="text-xs text-slate-500 mt-2">
            提示：在预览区域拖动图片调整位置，滚轮调整大小
          </p>
        )}
      </div>

      {/* 编号 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          编号
        </label>
        <input
          type="text"
          value={cardData.id}
          onChange={(e) => onUpdateCardData({ id: e.target.value })}
          placeholder="请输入编号"
          className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none text-slate-200 placeholder-slate-500"
        />
      </div>

      {/* 人物姓名 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          人物姓名
        </label>
        <input
          type="text"
          value={cardData.name}
          onChange={(e) => onUpdateCardData({ name: e.target.value })}
          placeholder="请输入人物姓名"
          className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none text-slate-200 placeholder-slate-500"
        />
      </div>

      {/* 卡牌等级 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          卡牌等级
        </label>
        <div className="flex gap-2">
          {(['SR', 'SSR', 'UR'] as const).map((level) => (
            <button
              key={level}
              onClick={() => onUpdateCardData({ level })}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                cardData.level === level
                  ? level === 'UR' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30' :
                    level === 'SSR' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/30' :
                    'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* 技能 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-300">
            技能 (最多2个)
          </label>
          {cardData.skills.length < 2 && (
            <button
              onClick={onAddSkill}
              className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              + 添加技能
            </button>
          )}
        </div>
        <div className="space-y-3">
          {cardData.skills.map((skill, index) => (
            <div key={index} className="border border-slate-600/50 rounded-lg p-3 bg-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => onUpdateSkill(index, 'name', e.target.value)}
                  placeholder="技能名称"
                  className="flex-1 px-3 py-1.5 bg-slate-900/50 border border-slate-600 rounded focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none text-sm text-slate-200 placeholder-slate-500"
                />
                <select
                  value={skill.type}
                  onChange={(e) => onUpdateSkill(index, 'type', e.target.value as 'active' | 'passive')}
                  className="px-3 py-1.5 bg-slate-900/50 border border-slate-600 rounded focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none text-sm text-slate-200"
                >
                  <option value="active">主动</option>
                  <option value="passive">被动</option>
                </select>
                <button
                  onClick={() => onRemoveSkill(index)}
                  className="px-2 py-1.5 bg-red-500/80 text-white rounded hover:bg-red-500 transition-colors text-sm"
                >
                  删除
                </button>
              </div>
              <textarea
                value={skill.description}
                onChange={(e) => onUpdateSkill(index, 'description', e.target.value)}
                placeholder="技能描述"
                rows={2}
                className="w-full px-3 py-1.5 bg-slate-900/50 border border-slate-600 rounded focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none text-sm resize-none text-slate-200 placeholder-slate-500"
              />
            </div>
          ))}
          {cardData.skills.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">
              暂无技能，点击上方按钮添加
            </p>
          )}
        </div>
      </div>

      {/* 绝技 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-300">
            绝技 (最多1个)
          </label>
          {!cardData.ultimate && (
            <button
              onClick={() => onSetUltimate('name', '')}
              className="text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              + 添加绝技
            </button>
          )}
        </div>
        {cardData.ultimate ? (
          <div className="border border-orange-500/30 rounded-lg p-3 bg-orange-500/10">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={cardData.ultimate.name}
                onChange={(e) => onSetUltimate('name', e.target.value)}
                placeholder="绝技名称"
                className="flex-1 px-3 py-1.5 bg-slate-900/50 border border-slate-600 rounded focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none text-sm text-slate-200 placeholder-slate-500"
              />
              <select
                value={cardData.ultimate.type}
                onChange={(e) => onSetUltimate('type', e.target.value)}
                className="px-3 py-1.5 bg-slate-900/50 border border-slate-600 rounded focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none text-sm text-slate-200"
              >
                <option value="active">主动</option>
                <option value="passive">被动</option>
              </select>
              <button
                onClick={onRemoveUltimate}
                className="px-2 py-1.5 bg-red-500/80 text-white rounded hover:bg-red-500 transition-colors text-sm"
              >
                删除
              </button>
            </div>
            <textarea
              value={cardData.ultimate.description}
              onChange={(e) => onSetUltimate('description', e.target.value)}
              placeholder="绝技描述"
              rows={2}
              className="w-full px-3 py-1.5 bg-slate-900/50 border border-slate-600 rounded focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none text-sm resize-none text-slate-200 placeholder-slate-500"
            />
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4 border border-slate-600/50 rounded-lg">
            暂无绝技，点击上方按钮添加
          </p>
        )}
      </div>

      {/* 人物属性 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          人物属性
        </label>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">生命 (0-9)</label>
            <input
              type="number"
              min="0"
              max="9"
              value={cardData.attributes.power}
              onChange={(e) => onUpdateAttribute('power', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 outline-none text-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">敏捷 (0-9)</label>
            <input
              type="number"
              min="0"
              max="9"
              value={cardData.attributes.agility}
              onChange={(e) => onUpdateAttribute('agility', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none text-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">战斗 (0-9)</label>
            <input
              type="number"
              min="0"
              max="9"
              value={cardData.attributes.health}
              onChange={(e) => onUpdateAttribute('health', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none text-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">种类</label>
            <input
              type="text"
              value={cardData.attributes.category}
              onChange={(e) => onUpdateAttribute('category', e.target.value)}
              placeholder="如：魂灵、意识体"
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none text-slate-200 placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* 下载按钮 */}
      <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-4 border border-teal-900/30">
        <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          导出卡牌
        </h3>
        
        {/* 预览图显示区域 */}
        {(previewUrl || previewLoading) && (
          <div className="mb-4 border border-slate-600 rounded-lg overflow-hidden bg-slate-900/50 preview-image-container">
            {previewLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <span className="ml-3 text-slate-400">生成预览中...</span>
              </div>
            ) : previewUrl && (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="卡牌预览" 
                  className="w-full h-auto preview-image"
                  style={{ 
                    WebkitTouchCallout: 'default', // 允许移动端长按菜单
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    touchAction: 'manipulation', // 优化触摸响应
                    pointerEvents: 'auto' // 允许触摸事件
                  }}
                  draggable={false}
                  onContextMenu={(e) => {
                    // 在移动端不阻止默认行为，允许长按菜单
                    if (!isMobile) {
                      e.preventDefault()
                    }
                  }}
                />
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {previewType === 'original' ? '原图' : '缩略图'}
                </div>
                {isMobile && (
                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs px-2 py-1.5 rounded text-center backdrop-blur-sm">
                    📱 长按图片可保存到相册
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 按钮区域 */}
        {previewUrl ? (
          // 预览模式：显示下载和取消按钮
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <button
              onClick={onDownloadPreview}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all font-medium shadow-lg shadow-teal-500/25"
            >
              下载图片
            </button>
            <button
              onClick={onCancelPreview}
              className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors font-medium"
            >
              取消
            </button>
          </div>
        ) : (
          // 正常模式：显示预览按钮
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <button
              onClick={onPreviewOriginal}
              disabled={previewLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25"
            >
              预览原图
            </button>
            <button
              onClick={onPreviewThumbnail}
              disabled={previewLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
            >
              预览缩略图
            </button>
          </div>
        )}

        <div className="text-xs text-slate-500 space-y-1">
          <p>• 原图：底图原始尺寸，适用于打印</p>
          <p>• 缩略图：原图一半尺寸，适用于 Tabletop Simulator 等</p>
          {isMobile && previewUrl && (
            <p className="text-teal-400 mt-2">💡 移动端：长按预览图可直接保存到相册</p>
          )}
        </div>
      </div>
    </div>
  )
}
