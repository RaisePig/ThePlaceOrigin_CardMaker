// 卡牌预览组件

import { useRef, useEffect, useState } from 'react'
import { CardData } from '../types/card'
import {
  NAME_POSITION_X,
  NAME_POSITION_Y,
  NAME_FONT_SIZE,
  ID_POSITION_X,
  ID_POSITION_Y,
  ID_FONT_SIZE,
  POWER_POSITION_X,
  POWER_POSITION_Y,
  POWER_FONT_SIZE,
  AGILITY_POSITION_X,
  AGILITY_POSITION_Y,
  AGILITY_FONT_SIZE,
  HEALTH_POSITION_X,
  HEALTH_POSITION_Y,
  HEALTH_FONT_SIZE,
  CATEGORY_POSITION_X,
  CATEGORY_POSITION_Y,
  CATEGORY_FONT_SIZE,
  CATEGORY_FONT_SIZE_SMALL,
  TEXT_STROKE_WIDTH
} from '../constants/cardPositions'
import { generateStrokeShadow } from '../utils/textStroke'

interface CardPreviewProps {
  cardData: CardData
  isDragging: boolean
  onPortraitMouseDown: (e: React.MouseEvent) => void
  onPortraitWheel?: (e: WheelEvent) => void
  portraitRef?: React.RefObject<HTMLDivElement>
}

export default function CardPreview({ cardData, isDragging, onPortraitMouseDown, onPortraitWheel, portraitRef }: CardPreviewProps) {
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const internalPortraitRef = useRef<HTMLDivElement>(null)
  const refToUse = portraitRef || internalPortraitRef
  const bgImageRef = useRef<HTMLImageElement>(null)
  const [scale, setScale] = useState(1)
  const [bgOffset, setBgOffset] = useState({ x: 0, y: 0 })
  const [bgOriginalSize, setBgOriginalSize] = useState({ width: 0, height: 0 })

  // 计算底图缩放比例和偏移
  useEffect(() => {
    const updateScale = () => {
      if (!cardContainerRef.current || bgOriginalSize.width === 0 || bgOriginalSize.height === 0) return
      
      const container = cardContainerRef.current
      const containerWidth = container.offsetWidth
      const containerHeight = container.offsetHeight
      
      const bgAspect = bgOriginalSize.width / bgOriginalSize.height
      const containerAspect = containerWidth / containerHeight
      
      let scale: number
      let offsetX = 0
      let offsetY = 0
      
      if (bgAspect > containerAspect) {
        // 底图更宽，以高度为准
        scale = containerHeight / bgOriginalSize.height
        offsetX = (containerWidth - bgOriginalSize.width * scale) / 2
      } else {
        // 底图更高，以宽度为准
        scale = containerWidth / bgOriginalSize.width
        offsetY = (containerHeight - bgOriginalSize.height * scale) / 2
      }
      
      setScale(scale)
      setBgOffset({ x: offsetX, y: offsetY })
    }
    
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [bgOriginalSize])

  // 处理预览框内的滚轮事件，阻止页面滚动
  useEffect(() => {
    const container = cardContainerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // 阻止默认滚动行为
      e.preventDefault()
      e.stopPropagation()
      
      // 如果已上传立绘，调用父组件的滚轮处理函数
      if (cardData.portrait && onPortraitWheel) {
        onPortraitWheel(e)
      }
    }

    // 使用 { passive: false } 确保 preventDefault 生效
    container.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [cardData.portrait, onPortraitWheel])

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">卡牌预览</h2>
      <div 
        ref={cardContainerRef}
        className="aspect-[2/3] rounded-lg overflow-hidden relative border-2 border-gray-200 bg-gray-100"
      >
        {/* 卡牌底图 */}
        <img
          ref={bgImageRef}
          src="/resources/bg.png"
          alt="卡牌底图"
          className="absolute inset-0 w-full h-full object-contain"
          onLoad={(e) => {
            // 获取底图实际尺寸
            const img = e.currentTarget
            setBgOriginalSize({
              width: img.naturalWidth,
              height: img.naturalHeight
            })
          }}
        />
        
        {/* 人物立绘区域 */}
        <div
          ref={refToUse}
          className="absolute inset-0 cursor-move"
          onMouseDown={onPortraitMouseDown}
          style={{ cursor: cardData.portrait ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          {cardData.portrait && (
            <img
              src={cardData.portrait}
              alt="人物立绘"
              className="absolute object-cover"
              style={{
                width: `${cardData.portraitScale * 100}%`,
                height: `${cardData.portraitScale * 100}%`,
                left: `${cardData.portraitPosition.x}%`,
                top: `${cardData.portraitPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                objectPosition: 'center center',
                pointerEvents: 'none'
              }}
            />
          )}
        </div>

        {/* 编号显示 - 使用自定义字体，居中对齐，斜体 */}
        {cardData.id && bgOriginalSize.width > 0 && (
          <div
            className="absolute"
            style={{
              fontFamily: 'Font1, sans-serif',
              fontSize: `${ID_FONT_SIZE * scale}px`,
              left: `${bgOffset.x + ID_POSITION_X * scale}px`,
              top: `${bgOffset.y + ID_POSITION_Y * scale}px`,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              color: '#fff',
              fontStyle: 'italic',
              textShadow: generateStrokeShadow(TEXT_STROKE_WIDTH * scale),
              transformOrigin: 'center center',
              width: 'auto',
              display: 'inline-block'
            } as React.CSSProperties}
          >
            {cardData.id}
          </div>
        )}

        {/* 姓名显示 - 使用自定义字体，居中对齐，斜体 */}
        {cardData.name && bgOriginalSize.width > 0 && (
          <div
            className="absolute"
            style={{
              fontFamily: 'Font1, sans-serif',
              fontSize: `${NAME_FONT_SIZE * scale}px`,
              left: `${bgOffset.x + NAME_POSITION_X * scale}px`,
              top: `${bgOffset.y + NAME_POSITION_Y * scale}px`,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              color: '#fff',
              fontStyle: 'italic',
              textShadow: generateStrokeShadow(TEXT_STROKE_WIDTH * scale),
              transformOrigin: 'center center',
              width: 'auto',
              display: 'inline-block'
            } as React.CSSProperties}
          >
            {cardData.name}
          </div>
        )}

        {/* 人物属性显示 - 在底图上显示 */}
        {bgOriginalSize.width > 0 && (
          <>
            {/* 力量 */}
            <div
              className="absolute"
              style={{
                fontFamily: 'Number, sans-serif',
                fontSize: `${POWER_FONT_SIZE * scale}px`,
                left: `${bgOffset.x + POWER_POSITION_X * scale}px`,
                top: `${bgOffset.y + POWER_POSITION_Y * scale}px`,
                transform: 'translate(-50%, -50%) skewX(-10deg)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                color: '#fff',
                textShadow: generateStrokeShadow(4 * scale),
                transformOrigin: 'center center',
                width: 'auto',
                display: 'inline-block'
              } as React.CSSProperties}
            >
              {cardData.attributes.power}
            </div>
            {/* 敏捷 */}
            <div
              className="absolute"
              style={{
                fontFamily: 'Number, sans-serif',
                fontSize: `${AGILITY_FONT_SIZE * scale}px`,
                left: `${bgOffset.x + AGILITY_POSITION_X * scale}px`,
                top: `${bgOffset.y + AGILITY_POSITION_Y * scale}px`,
                transform: 'translate(-50%, -50%) skewX(-10deg)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                color: '#fff',
                textShadow: generateStrokeShadow(4 * scale),
                transformOrigin: 'center center',
                width: 'auto',
                display: 'inline-block'
              } as React.CSSProperties}
            >
              {cardData.attributes.agility}
            </div>
            {/* 生命 */}
            <div
              className="absolute"
              style={{
                fontFamily: 'Number, sans-serif',
                fontSize: `${HEALTH_FONT_SIZE * scale}px`,
                left: `${bgOffset.x + HEALTH_POSITION_X * scale}px`,
                top: `${bgOffset.y + HEALTH_POSITION_Y * scale}px`,
                transform: 'translate(-50%, -50%) skewX(-10deg)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                color: '#fff',
                textShadow: generateStrokeShadow(4 * scale),
                transformOrigin: 'center center',
                width: 'auto',
                display: 'inline-block'
              } as React.CSSProperties}
            >
              {cardData.attributes.health}
            </div>
            {/* 种类 */}
            {cardData.attributes.category && (
              <div
                className="absolute"
                style={{
                  fontFamily: 'Font1, sans-serif',
                  fontSize: `${(cardData.attributes.category.length === 3 ? CATEGORY_FONT_SIZE_SMALL : CATEGORY_FONT_SIZE) * scale}px`,
                  left: `${bgOffset.x + CATEGORY_POSITION_X * scale}px`,
                  top: `${bgOffset.y + CATEGORY_POSITION_Y * scale}px`,
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  color: '#fff',
                  fontStyle: 'italic',
                  textShadow: generateStrokeShadow(4 * scale),
                  transformOrigin: 'center center',
                  width: 'auto',
                  display: 'inline-block'
                } as React.CSSProperties}
              >
                {cardData.attributes.category}
              </div>
            )}
          </>
        )}

        {/* 卡牌信息覆盖层 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-75">#{cardData.id || '000'}</span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              cardData.level === 'UR' ? 'bg-red-500' :
              cardData.level === 'SSR' ? 'bg-orange-500' :
              'bg-purple-500'
            }`}>
              {cardData.level}
            </span>
          </div>
          <h3 className="text-lg font-bold mb-2">{cardData.name || '人物姓名'}</h3>
          <div className="flex gap-2 text-xs">
            <span>力量: {cardData.attributes.power}</span>
            <span>敏捷: {cardData.attributes.agility}</span>
            <span>生命: {cardData.attributes.health}</span>
            {cardData.attributes.category && (
              <span className="ml-auto">{cardData.attributes.category}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
