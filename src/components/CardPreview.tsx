// 卡牌预览组件 - 使用 Canvas 渲染确保与下载一致

import { useRef, useEffect, useState, useCallback } from 'react'
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
  TEXT_STROKE_WIDTH,
  SKILL_AREA_X,
  SKILL_AREA_WIDTH,
  SKILL_AREA_HEIGHT,
  SKILL_ICON_WIDTH,
  SKILL_ICON_HEIGHT,
  SKILL_1_ICON_X,
  SKILL_1_ICON_Y,
  SKILL_2_ICON_X,
  SKILL_2_ICON_Y,
  SKILL_1_Y,
  SKILL_1_NAME_X,
  SKILL_1_NAME_Y,
  SKILL_1_DESC_X,
  SKILL_1_DESC_Y,
  SKILL_2_Y,
  SKILL_2_NAME_X,
  SKILL_2_NAME_Y,
  SKILL_2_DESC_X,
  SKILL_2_DESC_Y,
  ULTIMATE_ICON_WIDTH,
  ULTIMATE_ICON_HEIGHT,
  ULTIMATE_ICON_X,
  ULTIMATE_ICON_Y,
  ULTIMATE_Y,
  ULTIMATE_NAME_X,
  ULTIMATE_NAME_Y,
  ULTIMATE_DESC_X,
  ULTIMATE_DESC_Y,
  SKILL_NAME_FONT_SIZE,
  SKILL_DESC_FONT_SIZE,
  ULTIMATE_NAME_FONT_SIZE,
  ULTIMATE_DESC_FONT_SIZE,
  SKILL_NAME_STROKE_WIDTH,
  SKILL_DESC_STROKE_WIDTH
} from '../constants/cardPositions'

interface CardPreviewProps {
  cardData: CardData
  isDragging: boolean
  onPortraitMouseDown: (e: React.MouseEvent) => void
  onPortraitWheel?: (e: WheelEvent) => void
  portraitRef?: React.RefObject<HTMLDivElement>
  cardContainerRef?: React.RefObject<HTMLDivElement>
}

// 绘制带描边的文字
const drawStrokedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  strokeWidth: number
) => {
  ctx.strokeStyle = '#000'
  ctx.lineWidth = strokeWidth * 2
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.strokeText(text, x, y)
  ctx.fillText(text, x, y)
}

// 根据等级获取底图路径
const getBgImagePath = (level: 'SR' | 'SSR' | 'UR') => {
  switch (level) {
    case 'SR': return '/resources/bg.png'
    case 'SSR': return '/resources/bg_2.png'
    case 'UR': return '/resources/bg_3.png'
    default: return '/resources/bg.png'
  }
}

export default function CardPreview({ cardData, isDragging, onPortraitMouseDown, onPortraitWheel, portraitRef, cardContainerRef: externalCardContainerRef }: CardPreviewProps) {
  const internalCardContainerRef = useRef<HTMLDivElement>(null)
  const cardContainerRef = externalCardContainerRef || internalCardContainerRef
  const internalPortraitRef = useRef<HTMLDivElement>(null)
  const refToUse = portraitRef || internalPortraitRef
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null)
  const [portraitImage, setPortraitImage] = useState<HTMLImageElement | null>(null)
  const [skillBgImage, setSkillBgImage] = useState<HTMLImageElement | null>(null)
  const [uniqueBgImage, setUniqueBgImage] = useState<HTMLImageElement | null>(null)
  const [skillIconImage, setSkillIconImage] = useState<HTMLImageElement | null>(null)
  const [uniqueIconImage, setUniqueIconImage] = useState<HTMLImageElement | null>(null)
  const [bgOriginalSize, setBgOriginalSize] = useState({ width: 0, height: 0 })

  // 根据等级加载对应底图
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setBgImage(img)
      setBgOriginalSize({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.src = getBgImagePath(cardData.level)
  }, [cardData.level])

  // 加载立绘图片
  useEffect(() => {
    if (cardData.portrait) {
      const img = new Image()
      img.onload = () => setPortraitImage(img)
      img.src = cardData.portrait
    } else {
      setPortraitImage(null)
    }
  }, [cardData.portrait])

  // 加载技能和绝技背景图片及标识图片
  useEffect(() => {
    const skillImg = new Image()
    skillImg.onload = () => setSkillBgImage(skillImg)
    skillImg.src = '/resources/skill_bg.png'

    const uniqueImg = new Image()
    uniqueImg.onload = () => setUniqueBgImage(uniqueImg)
    uniqueImg.src = '/resources/unique_bg.png'

    const skillIcon = new Image()
    skillIcon.onload = () => setSkillIconImage(skillIcon)
    skillIcon.src = '/resources/skill.png'

    const uniqueIcon = new Image()
    uniqueIcon.onload = () => setUniqueIconImage(uniqueIcon)
    uniqueIcon.src = '/resources/unique.png'
  }, [])

  // 渲染 Canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !bgImage) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = bgImage.naturalWidth
    const height = bgImage.naturalHeight

    // 设置 canvas 尺寸
    canvas.width = width
    canvas.height = height

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 绘制立绘（在底图之前）
    if (portraitImage && cardData.portrait) {
      const pWidth = width * cardData.portraitScale
      const pHeight = height * cardData.portraitScale
      const pX = (cardData.portraitPosition.x / 100) * width - pWidth / 2
      const pY = (cardData.portraitPosition.y / 100) * height - pHeight / 2
      ctx.drawImage(portraitImage, pX, pY, pWidth, pHeight)
    }

    // 绘制底图
    ctx.drawImage(bgImage, 0, 0, width, height)

    // 设置文字基础样式
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff'

    // 绘制编号
    if (cardData.id) {
      ctx.font = `italic ${ID_FONT_SIZE}px Font1, sans-serif`
      drawStrokedText(ctx, cardData.id, ID_POSITION_X, ID_POSITION_Y, TEXT_STROKE_WIDTH)
    }

    // 绘制姓名
    if (cardData.name) {
      ctx.font = `italic ${NAME_FONT_SIZE}px Font1, sans-serif`
      drawStrokedText(ctx, cardData.name, NAME_POSITION_X, NAME_POSITION_Y, TEXT_STROKE_WIDTH)
    }

    // 绘制属性数值（带倾斜效果）
    const drawSkewedNumber = (value: number, x: number, y: number, fontSize: number) => {
      ctx.save()
      ctx.font = `${fontSize}px Number, sans-serif`
      ctx.translate(x, y)
      ctx.transform(1, 0, Math.tan(-10 * Math.PI / 180), 1, 0, 0)
      drawStrokedText(ctx, String(value), 0, 0, 4)
      ctx.restore()
    }

    // 力量、敏捷、生命
    drawSkewedNumber(cardData.attributes.power, POWER_POSITION_X, POWER_POSITION_Y, POWER_FONT_SIZE)
    drawSkewedNumber(cardData.attributes.agility, AGILITY_POSITION_X, AGILITY_POSITION_Y, AGILITY_FONT_SIZE)
    drawSkewedNumber(cardData.attributes.health, HEALTH_POSITION_X, HEALTH_POSITION_Y, HEALTH_FONT_SIZE)

    // 绘制种类
    if (cardData.attributes.category) {
      const catFontSize = cardData.attributes.category.length === 3 ? CATEGORY_FONT_SIZE_SMALL : CATEGORY_FONT_SIZE
      ctx.font = `italic ${catFontSize}px Font1, sans-serif`
      drawStrokedText(ctx, cardData.attributes.category, CATEGORY_POSITION_X, CATEGORY_POSITION_Y, 4)
    }

    // 绘制技能（使用图片背景）
    cardData.skills.forEach((skill, index) => {
      const skillY = index === 0 ? SKILL_1_Y : SKILL_2_Y
      const nameX = index === 0 ? SKILL_1_NAME_X : SKILL_2_NAME_X
      const nameY = index === 0 ? SKILL_1_NAME_Y : SKILL_2_NAME_Y
      const descX = index === 0 ? SKILL_1_DESC_X : SKILL_2_DESC_X
      const descY = index === 0 ? SKILL_1_DESC_Y : SKILL_2_DESC_Y
      const iconX = index === 0 ? SKILL_1_ICON_X : SKILL_2_ICON_X
      const iconY = index === 0 ? SKILL_1_ICON_Y : SKILL_2_ICON_Y
      
      // 绘制技能背景图片
      if (skillBgImage) {
        ctx.drawImage(skillBgImage, SKILL_AREA_X, skillY, SKILL_AREA_WIDTH, SKILL_AREA_HEIGHT)
      }
      
      // SR等级时绘制技能标识图片
      if (cardData.level === 'SR' && skillIconImage) {
        ctx.drawImage(skillIconImage, iconX, iconY, SKILL_ICON_WIDTH, SKILL_ICON_HEIGHT)
      }
      
      // 绘制技能名称（右对齐，在标识左侧）
      ctx.textAlign = 'right'
      ctx.font = `bold ${SKILL_NAME_FONT_SIZE}px Font1, sans-serif`
      ctx.fillStyle = '#fff'
      const typeText = skill.type === 'active' ? '【主动】' : '【被动】'
      drawStrokedText(ctx, `${typeText}${skill.name}`, nameX, nameY, SKILL_NAME_STROKE_WIDTH)
      
      // 绘制技能描述
      if (skill.description) {
        ctx.textAlign = 'left'
        ctx.font = `${SKILL_DESC_FONT_SIZE}px sans-serif`
        drawStrokedText(ctx, skill.description, descX, descY, SKILL_DESC_STROKE_WIDTH)
      }
    })

    // 绘制绝技（使用图片背景）
    if (cardData.ultimate) {
      // 绘制绝技背景图片
      if (uniqueBgImage) {
        ctx.drawImage(uniqueBgImage, SKILL_AREA_X, ULTIMATE_Y, SKILL_AREA_WIDTH, SKILL_AREA_HEIGHT)
      }
      
      // SR等级时绘制绝技标识图片
      if (cardData.level === 'SR' && uniqueIconImage) {
        ctx.drawImage(uniqueIconImage, ULTIMATE_ICON_X, ULTIMATE_ICON_Y, ULTIMATE_ICON_WIDTH, ULTIMATE_ICON_HEIGHT)
      }
      
      // 绘制绝技名称（右对齐，在标识左侧）
      ctx.textAlign = 'right'
      ctx.font = `bold ${ULTIMATE_NAME_FONT_SIZE}px Font1, sans-serif`
      ctx.fillStyle = '#FFD700' // 金色
      const typeText = cardData.ultimate.type === 'active' ? '【绝技】' : '【绝技·被动】'
      drawStrokedText(ctx, `${typeText}${cardData.ultimate.name}`, ULTIMATE_NAME_X, ULTIMATE_NAME_Y, SKILL_NAME_STROKE_WIDTH)
      
      // 绘制绝技描述
      if (cardData.ultimate.description) {
        ctx.textAlign = 'left'
        ctx.fillStyle = '#fff'
        ctx.font = `${ULTIMATE_DESC_FONT_SIZE}px sans-serif`
        drawStrokedText(ctx, cardData.ultimate.description, ULTIMATE_DESC_X, ULTIMATE_DESC_Y, SKILL_DESC_STROKE_WIDTH)
      }
    }

    // 恢复文字对齐方式
    ctx.textAlign = 'center'
  }, [bgImage, portraitImage, cardData, skillBgImage, uniqueBgImage, skillIconImage, uniqueIconImage])

  // 当数据变化时重新渲染
  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  // 处理预览框内的滚轮事件
  useEffect(() => {
    const container = cardContainerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (cardData.portrait && onPortraitWheel) {
        onPortraitWheel(e)
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [cardData.portrait, onPortraitWheel])

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">卡牌预览</h2>
      <div 
        ref={cardContainerRef}
        className="w-full overflow-hidden relative"
        style={{
          aspectRatio: bgOriginalSize.width > 0 && bgOriginalSize.height > 0 
            ? `${bgOriginalSize.width} / ${bgOriginalSize.height}` 
            : '2 / 3'
        }}
      >
        {/* 使用 Canvas 渲染 */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ imageRendering: 'auto' }}
        />
        
        {/* 透明的交互层，用于拖拽立绘 */}
        <div
          ref={refToUse}
          className="absolute inset-0"
          onMouseDown={onPortraitMouseDown}
          style={{ cursor: cardData.portrait ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        />
      </div>
    </div>
  )
}
