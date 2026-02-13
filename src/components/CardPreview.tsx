// 卡牌预览组件 - 使用 Canvas 渲染确保与下载一致

import { useRef, useEffect, useState, useCallback } from 'react'
import { CardData } from '../types/card'
import { loadImage, getBgImagePath, getSkillIconPath, getUniqueIconPath, drawWatermark } from '../utils/resourceLoader'
import { getAppConfig } from '../utils/appConfig'
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
  SKILL_BG_WIDTH,
  SKILL_BG_X,
  ULTIMATE_BG_X,
  ULTIMATE_BG_WIDTH,
  SKILL_ICON_WIDTH,
  SKILL_ICON_HEIGHT,
  SKILL_ICON_X,
  ULTIMATE_ICON_WIDTH,
  ULTIMATE_ICON_HEIGHT,
  ULTIMATE_ICON_X,
  SKILL_NAME_FONT_SIZE,
  SKILL_DESC_FONT_SIZE,
  ULTIMATE_NAME_FONT_SIZE,
  ULTIMATE_DESC_FONT_SIZE,
  SKILL_NAME_STROKE_WIDTH,
  SKILL_DESC_STROKE_WIDTH,
  SKILL_START_OFFSET,
  SKILL_GAP,
  SKILL_ICON_TO_BG_OFFSET,
  ULTIMATE_ICON_TO_BG_OFFSET,
  SKILL_NAME_OFFSET_X,
  SKILL_NAME_OFFSET_Y,
  ULTIMATE_NAME_OFFSET_X,
  ULTIMATE_NAME_OFFSET_Y,
  SSR_ID_POSITION_X,
  SSR_ID_POSITION_Y,
  SSR_NAME_POSITION_Y,
  SSR_POWER_POSITION_Y,
  SSR_AGILITY_POSITION_Y,
  UR_ID_POSITION_X,
  UR_ID_POSITION_Y,
  UR_NAME_POSITION_X,
  UR_NAME_POSITION_Y,
  UR_POWER_POSITION_Y,
  UR_AGILITY_POSITION_Y
} from '../constants/cardPositions'

interface CardPreviewProps {
  cardData: CardData
  isDragging: boolean
  onPortraitMouseDown: (e: React.MouseEvent) => void
  onPortraitWheel?: (e: WheelEvent) => void
  onTouchStart?: (e: React.TouchEvent) => void
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

// 计算自动换行文字的布局信息
const calculateWrappedTextLayout = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  baseLineHeight: number,
  baseFontSize: number,
  fontFamily: string
) => {
  let fontSize = baseFontSize
  let lines: string[] = []
  let reductionCount = 0
  
  const calculateLines = (size: number): string[] => {
    ctx.font = `${size}px ${fontFamily}`
    const words = text.split('')
    const result: string[] = []
    let currentLine = ''
    
    for (const char of words) {
      const testLine = currentLine + char
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine !== '') {
        result.push(currentLine)
        currentLine = char
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) {
      result.push(currentLine)
    }
    return result
  }
  
  lines = calculateLines(fontSize)
  
  if (lines.length > 3) {
    fontSize -= 3
    reductionCount++
    lines = calculateLines(fontSize)
    
    if (lines.length > 4) {
      fontSize -= 3
      reductionCount++
      lines = calculateLines(fontSize)
    }
  }
  
  const lineHeight = baseLineHeight - reductionCount * 3
  const textHeight = lines.length > 0 ? (lines.length - 1) * lineHeight + fontSize : 0
  
  return { lines, fontSize, lineHeight, textHeight }
}


export default function CardPreview({ cardData, isDragging, onPortraitMouseDown, onPortraitWheel, onTouchStart, portraitRef, cardContainerRef: externalCardContainerRef }: CardPreviewProps) {
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
  /** 水印是否开启，由后台 app-config.json 控制 */
  const [watermarkEnabled, setWatermarkEnabled] = useState(false)
  
  // 检测是否为移动端
  const [isMobile, setIsMobile] = useState(false)

  // 加载应用配置（水印开关等）
  useEffect(() => {
    getAppConfig().then((config) => setWatermarkEnabled(config.watermarkEnabled))
  }, [])
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
        (window.innerWidth <= 768 && 'ontouchstart' in window))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 根据等级加载对应底图（使用 Base64 缓存）
  useEffect(() => {
    const loadBg = async () => {
      try {
        const img = await loadImage(getBgImagePath(cardData.level))
        setBgImage(img)
        setBgOriginalSize({ width: img.naturalWidth, height: img.naturalHeight })
      } catch (e) {
        console.error('底图加载失败:', e)
      }
    }
    loadBg()
  }, [cardData.level])

  // 加载立绘图片（用户上传的图片，不需要 Base64 转换）
  useEffect(() => {
    if (cardData.portrait) {
      const img = new Image()
      img.onload = () => {
        console.log('立绘加载成功:', img.naturalWidth, 'x', img.naturalHeight)
        setPortraitImage(img)
      }
      img.onerror = (e) => {
        console.error('立绘加载失败:', e)
        setPortraitImage(null)
      }
      img.src = cardData.portrait
    } else {
      setPortraitImage(null)
    }
  }, [cardData.portrait])

  // 加载技能和绝技背景图片（使用 Base64 缓存）
  useEffect(() => {
    const loadBgs = async () => {
      try {
        const [skillBg, uniqueBg] = await Promise.all([
          loadImage('/resources/skill_bg.png'),
          loadImage('/resources/unique_bg.png')
        ])
        setSkillBgImage(skillBg)
        setUniqueBgImage(uniqueBg)
      } catch (e) {
        console.error('技能背景加载失败:', e)
      }
    }
    loadBgs()
  }, [])

  // 根据等级加载对应的技能和绝技标识图片（使用 Base64 缓存）
  useEffect(() => {
    const loadIcons = async () => {
      try {
        const [skillIcon, uniqueIcon] = await Promise.all([
          loadImage(getSkillIconPath(cardData.level)),
          loadImage(getUniqueIconPath(cardData.level))
        ])
        setSkillIconImage(skillIcon)
        setUniqueIconImage(uniqueIcon)
      } catch (e) {
        console.error('技能标识加载失败:', e)
      }
    }
    loadIcons()
  }, [cardData.level])

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

    // ========== 层级1: 底图 ==========
    ctx.drawImage(bgImage, 0, 0, width, height)

    // ========== 层级2: 上传的立绘 ==========
    if (portraitImage && cardData.portrait) {
      const targetWidth = width * cardData.portraitScale
      const aspectRatio = portraitImage.naturalHeight / portraitImage.naturalWidth
      const targetHeight = targetWidth * aspectRatio
      const pX = (cardData.portraitPosition.x / 100) * width - targetWidth / 2
      const pY = (cardData.portraitPosition.y / 100) * height - targetHeight / 2
      ctx.drawImage(portraitImage, pX, pY, targetWidth, targetHeight)
    }

    // 设置文字基础样式
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff'

    // 根据等级获取位置
    const isSSR = cardData.level === 'SSR'
    const isUR = cardData.level === 'UR'
    
    let idX = ID_POSITION_X
    let idY = ID_POSITION_Y
    let nameX = NAME_POSITION_X
    let nameY = NAME_POSITION_Y
    let powerY = POWER_POSITION_Y
    let agilityY = AGILITY_POSITION_Y
    
    if (isSSR) {
      idX = SSR_ID_POSITION_X
      idY = SSR_ID_POSITION_Y
      nameY = SSR_NAME_POSITION_Y
      powerY = SSR_POWER_POSITION_Y
      agilityY = SSR_AGILITY_POSITION_Y
    } else if (isUR) {
      idX = UR_ID_POSITION_X
      idY = UR_ID_POSITION_Y
      nameX = UR_NAME_POSITION_X
      nameY = UR_NAME_POSITION_Y
      powerY = UR_POWER_POSITION_Y
      agilityY = UR_AGILITY_POSITION_Y
    }

    // 动态布局：先计算所有元素高度和位置
    const skillHeights: number[] = []
    const skillPositions: { iconY: number, bgY: number, nameX: number, nameY: number, bgHeight: number }[] = []
    
    cardData.skills.forEach((skill) => {
      if (skill.description && skillBgImage) {
        const descMaxWidth = width - 2 * 60
        const lineHeight = SKILL_DESC_FONT_SIZE + 8
        const { textHeight } = calculateWrappedTextLayout(
          ctx, skill.description, descMaxWidth, lineHeight, SKILL_DESC_FONT_SIZE, 'Font1, sans-serif'
        )
        const bgHeight = textHeight + 20 * 2
        skillHeights.push(SKILL_ICON_TO_BG_OFFSET + bgHeight)
      } else {
        skillHeights.push(SKILL_ICON_HEIGHT)
      }
    })
    
    let ultimateHeight = 0
    let ultimateBgHeight = 0
    if (cardData.ultimate) {
      if (cardData.ultimate.description && uniqueBgImage) {
        const descMaxWidth = width - 2 * 60
        const lineHeight = ULTIMATE_DESC_FONT_SIZE + 8
        const { textHeight } = calculateWrappedTextLayout(
          ctx, cardData.ultimate.description, descMaxWidth, lineHeight, ULTIMATE_DESC_FONT_SIZE, 'Font1, sans-serif'
        )
        ultimateBgHeight = textHeight + 20 * 2
        ultimateHeight = ULTIMATE_ICON_TO_BG_OFFSET + ultimateBgHeight
      } else {
        ultimateHeight = ULTIMATE_ICON_HEIGHT
      }
    }
    
    const totalHeight = skillHeights.reduce((sum, h) => sum + h, 0) 
      + (cardData.skills.length > 0 && cardData.ultimate ? SKILL_GAP : 0)
      + (cardData.skills.length > 1 ? SKILL_GAP : 0)
      + ultimateHeight
    
    let currentIconY = height - SKILL_START_OFFSET - totalHeight
    
    // 预计算所有位置
    cardData.skills.forEach((_, index) => {
      const iconY = currentIconY
      const bgY = iconY + SKILL_ICON_TO_BG_OFFSET
      skillPositions.push({
        iconY,
        bgY,
        nameX: SKILL_ICON_X + SKILL_NAME_OFFSET_X,
        nameY: iconY + SKILL_NAME_OFFSET_Y,
        bgHeight: skillHeights[index] - SKILL_ICON_TO_BG_OFFSET
      })
      currentIconY = iconY + skillHeights[index] + SKILL_GAP
    })
    
    const ultimateIconY = currentIconY
    const ultimateBgY = ultimateIconY + ULTIMATE_ICON_TO_BG_OFFSET
    const ultimateNameX = ULTIMATE_ICON_X + ULTIMATE_ICON_WIDTH + ULTIMATE_NAME_OFFSET_X
    const ultimateNameY = ultimateIconY + ULTIMATE_NAME_OFFSET_Y

    // ========== 层级3: 技能/绝技的黑色底色 ==========
    // 绘制技能背景
    cardData.skills.forEach((skill, index) => {
      if (skill.description && skillBgImage) {
        const pos = skillPositions[index]
        const { textHeight } = calculateWrappedTextLayout(
          ctx, skill.description, width - 2 * 60, SKILL_DESC_FONT_SIZE + 8, SKILL_DESC_FONT_SIZE, 'Font1, sans-serif'
        )
        const bgHeight = textHeight + 20 * 2
        ctx.drawImage(skillBgImage, SKILL_BG_X, pos.bgY, SKILL_BG_WIDTH, bgHeight)
      }
    })
    
    // 绘制绝技背景
    if (cardData.ultimate && cardData.ultimate.description && uniqueBgImage) {
      ctx.drawImage(uniqueBgImage, ULTIMATE_BG_X, ultimateBgY, ULTIMATE_BG_WIDTH, ultimateBgHeight)
    }

    // ========== 层级4: 技能/绝技标识图片 ==========
    // 绘制技能标识
    cardData.skills.forEach((_, index) => {
      if (skillIconImage) {
        const pos = skillPositions[index]
        ctx.drawImage(skillIconImage, SKILL_ICON_X, pos.iconY, SKILL_ICON_WIDTH, SKILL_ICON_HEIGHT)
      }
    })
    
    // 绘制绝技标识
    if (cardData.ultimate && uniqueIconImage) {
      ctx.drawImage(uniqueIconImage, ULTIMATE_ICON_X, ultimateIconY, ULTIMATE_ICON_WIDTH, ULTIMATE_ICON_HEIGHT)
    }

    // ========== 层级5: 所有文字 ==========
    // 绘制编号
    if (cardData.id) {
      ctx.font = `italic ${ID_FONT_SIZE}px Font1, sans-serif`
      drawStrokedText(ctx, cardData.id, idX, idY, TEXT_STROKE_WIDTH)
    }

    // 绘制姓名
    if (cardData.name) {
      ctx.font = `italic ${NAME_FONT_SIZE}px Font1, sans-serif`
      drawStrokedText(ctx, cardData.name, nameX, nameY, TEXT_STROKE_WIDTH)
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

    drawSkewedNumber(cardData.attributes.power, POWER_POSITION_X, powerY, POWER_FONT_SIZE)
    drawSkewedNumber(cardData.attributes.agility, AGILITY_POSITION_X, agilityY, AGILITY_FONT_SIZE)
    drawSkewedNumber(cardData.attributes.health, HEALTH_POSITION_X, HEALTH_POSITION_Y, HEALTH_FONT_SIZE)

    // 绘制种类
    if (cardData.attributes.category) {
      const catFontSize = cardData.attributes.category.length === 3 ? CATEGORY_FONT_SIZE_SMALL : CATEGORY_FONT_SIZE
      ctx.font = `italic ${catFontSize}px Font1, sans-serif`
      drawStrokedText(ctx, cardData.attributes.category, CATEGORY_POSITION_X, CATEGORY_POSITION_Y, 4)
    }

    // 绘制技能名称和描述文字
    cardData.skills.forEach((skill, index) => {
      const pos = skillPositions[index]
      
      // 技能名称
      ctx.textAlign = 'right'
      ctx.font = `italic ${SKILL_NAME_FONT_SIZE}px Font1, sans-serif`
      ctx.fillStyle = '#fff'
      const typeText = skill.type === 'active' ? '(主动)' : '(被动)'
      drawStrokedText(ctx, `${skill.name}${typeText}`, pos.nameX, pos.nameY, SKILL_NAME_STROKE_WIDTH)
      
      // 技能描述
      if (skill.description) {
        const descMaxWidth = width - 2 * 60
        const descCenterX = width / 2
        const lineHeight = SKILL_DESC_FONT_SIZE + 8
        const { lines, fontSize, lineHeight: actualLineHeight } = calculateWrappedTextLayout(
          ctx, skill.description, descMaxWidth, lineHeight, SKILL_DESC_FONT_SIZE, 'Font1, sans-serif'
        )
        
        ctx.font = `${fontSize}px Font1, sans-serif`
        ctx.fillStyle = '#fff'
        const textBoxLeft = descCenterX - descMaxWidth / 2
        const textStartY = pos.bgY + 20 + fontSize / 2
        
        lines.forEach((line, lineIndex) => {
          const y = textStartY + lineIndex * actualLineHeight
          ctx.textAlign = 'left'
          drawStrokedText(ctx, line, textBoxLeft, y, SKILL_DESC_STROKE_WIDTH)
        })
      }
    })

    // 绘制绝技名称和描述文字
    if (cardData.ultimate) {
      // 绝技名称（向左倾斜）
      ctx.save()
      ctx.font = `${ULTIMATE_NAME_FONT_SIZE}px Font1, sans-serif`
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'left'
      ctx.translate(ultimateNameX, ultimateNameY)
      ctx.transform(1, 0, Math.tan(10 * Math.PI / 180), 1, 0, 0)
      const typeText = cardData.ultimate.type === 'active' ? '(主动)' : '(被动)'
      drawStrokedText(ctx, `${cardData.ultimate.name}${typeText}`, 0, 0, SKILL_NAME_STROKE_WIDTH)
      ctx.restore()
      
      // 绝技描述
      if (cardData.ultimate.description) {
        const descMaxWidth = width - 2 * 60
        const descCenterX = width / 2
        const lineHeight = ULTIMATE_DESC_FONT_SIZE + 8
        const { lines, fontSize, lineHeight: actualLineHeight } = calculateWrappedTextLayout(
          ctx, cardData.ultimate.description, descMaxWidth, lineHeight, ULTIMATE_DESC_FONT_SIZE, 'Font1, sans-serif'
        )
        
        ctx.font = `${fontSize}px Font1, sans-serif`
        ctx.fillStyle = '#fff'
        const textBoxLeft = descCenterX - descMaxWidth / 2
        const textStartY = ultimateBgY + 20 + fontSize / 2
        
        lines.forEach((line, lineIndex) => {
          const y = textStartY + lineIndex * actualLineHeight
          ctx.textAlign = 'left'
          drawStrokedText(ctx, line, textBoxLeft, y, SKILL_DESC_STROKE_WIDTH)
        })
      }
    }

    // 恢复文字对齐方式
    ctx.textAlign = 'center'

    // ========== 层级6: 水印（由后台 app-config.json 的 watermarkEnabled 控制）==========
    if (watermarkEnabled) {
      drawWatermark(ctx, width, height)
    }
  }, [bgImage, portraitImage, cardData, skillBgImage, uniqueBgImage, skillIconImage, uniqueIconImage, watermarkEnabled])

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

  // 移动端长按保存状态
  const [longPressImageUrl, setLongPressImageUrl] = useState<string | null>(null)

  // 处理移动端长按保存
  const handleLongPress = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !canvasRef.current) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/png')
    
    // 显示全屏图片供用户长按保存
    setLongPressImageUrl(dataUrl)
  }, [isMobile])
  
  // 关闭长按图片
  const closeLongPressImage = useCallback(() => {
    setLongPressImageUrl(null)
  }, [])

  // 长按检测
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartPositionRef = useRef<{ x: number; y: number } | null>(null)
  const touchMovedRef = useRef(false)
  
  const handleTouchStartForLongPress = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !canvasRef.current) return
    
    const touch = e.nativeEvent.touches[0]
    touchStartPositionRef.current = { x: touch.clientX, y: touch.clientY }
    touchMovedRef.current = false
    
    // 如果是在调整立绘（有立绘且是单指），不触发长按保存
    if (cardData.portrait && e.nativeEvent.touches.length === 1 && onTouchStart) {
      // 先调用原有的触摸处理
      onTouchStart(e)
      // 不设置长按定时器，让用户调整立绘
      return
    }
    
    // 只有在没有立绘，或者双指触摸时，才允许长按保存
    // 设置长按定时器（500ms）
    longPressTimerRef.current = setTimeout(() => {
      if (!touchMovedRef.current) {
        handleLongPress(e)
      }
    }, 500)
  }, [isMobile, cardData.portrait, onTouchStart, handleLongPress])

  const handleTouchEndForLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    touchStartPositionRef.current = null
    touchMovedRef.current = false
  }, [])

  const handleTouchMoveForLongPress = useCallback((e: React.TouchEvent) => {
    // 如果移动了，取消长按
    if (touchStartPositionRef.current && e.nativeEvent.touches.length > 0) {
      const touch = e.nativeEvent.touches[0]
      const dx = Math.abs(touch.clientX - touchStartPositionRef.current.x)
      const dy = Math.abs(touch.clientY - touchStartPositionRef.current.y)
      
      // 如果移动超过 10px，认为用户是在拖拽而不是长按
      if (dx > 10 || dy > 10) {
        touchMovedRef.current = true
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = null
        }
      }
    }
  }, [])

  return (
    <>
      {/* 移动端长按保存全屏图片 */}
      {longPressImageUrl && isMobile && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLongPressImage}
          onTouchStart={closeLongPressImage}
        >
          <img
            src={longPressImageUrl}
            alt="卡牌预览"
            className="max-w-full max-h-full object-contain"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            onContextMenu={(e) => e.preventDefault()}
          />
          <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
            <p>长按图片保存到相册</p>
            <p className="text-xs text-gray-400 mt-1">点击任意位置关闭</p>
          </div>
        </div>
      )}
      
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg shadow-teal-500/10 p-6 sticky top-4 border border-teal-900/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">卡牌预览</h2>
        </div>
      <div 
        ref={cardContainerRef}
        className="w-full overflow-hidden relative rounded-lg ring-2 ring-slate-600/50 protected-resource"
        style={{
          aspectRatio: bgOriginalSize.width > 0 && bgOriginalSize.height > 0 
            ? `${bgOriginalSize.width} / ${bgOriginalSize.height}` 
            : '2 / 3'
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* 使用 Canvas 渲染 */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ imageRendering: 'auto' }}
          onContextMenu={(e) => e.preventDefault()}
        />
        
        {/* 透明的交互层，用于拖拽立绘 */}
        <div
          ref={refToUse}
          className="absolute inset-0 touch-none"
          onMouseDown={onPortraitMouseDown}
          onTouchStart={isMobile ? handleTouchStartForLongPress : onTouchStart}
          onTouchEnd={isMobile ? handleTouchEndForLongPress : undefined}
          onTouchMove={isMobile ? handleTouchMoveForLongPress : undefined}
          style={{ cursor: cardData.portrait ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        />
      </div>
      
      {/* 提示信息 */}
      {cardData.portrait && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-slate-500 text-center">
            <span className="hidden sm:inline">拖拽调整立绘位置 · 滚轮调整大小</span>
            <span className="sm:hidden">单指移动位置 · 双指缩放大小 · 长按预览图保存</span>
          </p>
          {isMobile && (
            <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-2">
              <p className="text-xs text-teal-300 text-center">
                📱 在预览框内滑动调整图片 · 在预览框外滑动调整页面
              </p>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  )
}
