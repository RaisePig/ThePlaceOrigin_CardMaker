// 卡牌编辑表单组件

import { useRef } from 'react'
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
  onUpdateAttribute
}: CardFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClearPortrait = () => {
    // 清除立绘数据
    onUpdateCardData({ portrait: null })
    // 重置文件输入框，允许再次选择同一个文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">编辑卡牌</h2>

      {/* 人物立绘上传 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          人物立绘
        </label>
        <div className="flex items-center gap-4">
          <label className="flex-1 cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileUpload}
              className="hidden"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm text-gray-600">点击上传图片</span>
            </div>
          </label>
          {cardData.portrait && (
            <button
              onClick={handleClearPortrait}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              清除
            </button>
          )}
        </div>
        {cardData.portrait && (
          <p className="text-xs text-gray-500 mt-2">
            提示：上传后可以拖动图片调整位置，滚轮调整大小
          </p>
        )}
      </div>

      {/* 编号 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          编号
        </label>
        <input
          type="text"
          value={cardData.id}
          onChange={(e) => onUpdateCardData({ id: e.target.value })}
          placeholder="请输入编号"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* 人物姓名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          人物姓名
        </label>
        <input
          type="text"
          value={cardData.name}
          onChange={(e) => onUpdateCardData({ name: e.target.value })}
          placeholder="请输入人物姓名"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* 卡牌等级 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          卡牌等级
        </label>
        <div className="flex gap-2">
          {(['SR', 'SSR', 'UR'] as const).map((level) => (
            <button
              key={level}
              onClick={() => onUpdateCardData({ level })}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                cardData.level === level
                  ? level === 'UR' ? 'bg-red-500 text-white' :
                    level === 'SSR' ? 'bg-orange-500 text-white' :
                    'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          <label className="block text-sm font-medium text-gray-700">
            技能 (最多2个)
          </label>
          {cardData.skills.length < 2 && (
            <button
              onClick={onAddSkill}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + 添加技能
            </button>
          )}
        </div>
        <div className="space-y-3">
          {cardData.skills.map((skill, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => onUpdateSkill(index, 'name', e.target.value)}
                  placeholder="技能名称"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
                <select
                  value={skill.type}
                  onChange={(e) => onUpdateSkill(index, 'type', e.target.value as 'active' | 'passive')}
                  className="px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="active">主动</option>
                  <option value="passive">被动</option>
                </select>
                <button
                  onClick={() => onRemoveSkill(index)}
                  className="px-2 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                >
                  删除
                </button>
              </div>
              <textarea
                value={skill.description}
                onChange={(e) => onUpdateSkill(index, 'description', e.target.value)}
                placeholder="技能描述"
                rows={2}
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
              />
            </div>
          ))}
          {cardData.skills.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              暂无技能，点击上方按钮添加
            </p>
          )}
        </div>
      </div>

      {/* 绝技 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            绝技 (最多1个)
          </label>
          {!cardData.ultimate && (
            <button
              onClick={() => onSetUltimate('name', '')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + 添加绝技
            </button>
          )}
        </div>
        {cardData.ultimate ? (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={cardData.ultimate.name}
                onChange={(e) => onSetUltimate('name', e.target.value)}
                placeholder="绝技名称"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
              <select
                value={cardData.ultimate.type}
                onChange={(e) => onSetUltimate('type', e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="active">主动</option>
                <option value="passive">被动</option>
              </select>
              <button
                onClick={onRemoveUltimate}
                className="px-2 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                删除
              </button>
            </div>
            <textarea
              value={cardData.ultimate.description}
              onChange={(e) => onSetUltimate('description', e.target.value)}
              placeholder="绝技描述"
              rows={2}
              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4 border border-gray-200 rounded-lg">
            暂无绝技，点击上方按钮添加
          </p>
        )}
      </div>

      {/* 人物属性 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          人物属性
        </label>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">力量 (0-9)</label>
            <input
              type="number"
              min="0"
              max="9"
              value={cardData.attributes.power}
              onChange={(e) => onUpdateAttribute('power', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">敏捷 (0-9)</label>
            <input
              type="number"
              min="0"
              max="9"
              value={cardData.attributes.agility}
              onChange={(e) => onUpdateAttribute('agility', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">生命 (0-9)</label>
            <input
              type="number"
              min="0"
              max="9"
              value={cardData.attributes.health}
              onChange={(e) => onUpdateAttribute('health', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">种类</label>
            <input
              type="text"
              value={cardData.attributes.category}
              onChange={(e) => onUpdateAttribute('category', e.target.value)}
              placeholder="如：魂灵、意识体"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
