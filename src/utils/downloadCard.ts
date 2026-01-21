// 卡牌下载工具函数 - 使用 Canvas API 直接绘制

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
import { CardData } from '../types/card'

/**
 * 绘制带描边的文字
 */
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

/**
 * 加载图片
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * 根据等级获取底图路径
 */
const getBgImagePath = (level: 'SR' | 'SSR' | 'UR') => {
  switch (level) {
    case 'SR': return '/resources/bg.png'
    case 'SSR': return '/resources/bg_2.png'
    case 'UR': return '/resources/bg_3.png'
    default: return '/resources/bg.png'
  }
}

/**
 * 生成原始尺寸的卡牌 Canvas（内部使用）
 */
const generateFullSizeCanvas = async (
  cardData: CardData,
  bgImage: HTMLImageElement,
  skillBgImage: HTMLImageElement,
  uniqueBgImage: HTMLImageElement,
  skillIconImage: HTMLImageElement,
  uniqueIconImage: HTMLImageElement
): Promise<HTMLCanvasElement> => {
  const width = bgImage.naturalWidth
  const height = bgImage.naturalHeight

  // 创建原始尺寸的 canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建 canvas context')

  // 绘制立绘（在底图之前，作为背景）
  if (cardData.portrait) {
    const portraitImg = await loadImage(cardData.portrait)
    const pWidth = width * cardData.portraitScale
    const pHeight = height * cardData.portraitScale
    const pX = (cardData.portraitPosition.x / 100) * width - pWidth / 2
    const pY = (cardData.portraitPosition.y / 100) * height - pHeight / 2
    ctx.drawImage(portraitImg, pX, pY, pWidth, pHeight)
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
    ctx.transform(1, 0, Math.tan(-10 * Math.PI / 180), 1, 0, 0) // skewX(-10deg)
    drawStrokedText(ctx, String(value), 0, 0, 4)
    ctx.restore()
  }

  // 力量
  drawSkewedNumber(cardData.attributes.power, POWER_POSITION_X, POWER_POSITION_Y, POWER_FONT_SIZE)
  // 敏捷
  drawSkewedNumber(cardData.attributes.agility, AGILITY_POSITION_X, AGILITY_POSITION_Y, AGILITY_FONT_SIZE)
  // 生命
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
    ctx.drawImage(skillBgImage, SKILL_AREA_X, skillY, SKILL_AREA_WIDTH, SKILL_AREA_HEIGHT)
    
    // SR等级时绘制技能标识图片
    if (cardData.level === 'SR') {
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
    ctx.drawImage(uniqueBgImage, SKILL_AREA_X, ULTIMATE_Y, SKILL_AREA_WIDTH, SKILL_AREA_HEIGHT)
    
    // SR等级时绘制绝技标识图片
    if (cardData.level === 'SR') {
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

  return canvas
}

/**
 * 生成卡牌 Canvas
 * @param cardData 卡牌数据
 * @param scale 输出缩放（1=原图，0.5=缩略图）
 * @returns canvas 元素
 */
const generateCardCanvas = async (
  cardData: CardData,
  scale: number = 1
): Promise<HTMLCanvasElement> => {
  // 加载所有需要的图片
  const [bgImage, skillBgImage, uniqueBgImage, skillIconImage, uniqueIconImage] = await Promise.all([
    loadImage(getBgImagePath(cardData.level)),
    loadImage('/resources/skill_bg.png'),
    loadImage('/resources/unique_bg.png'),
    loadImage('/resources/skill.png'),
    loadImage('/resources/unique.png')
  ])
  
  // 先生成原始尺寸的高清图
  const fullSizeCanvas = await generateFullSizeCanvas(cardData, bgImage, skillBgImage, uniqueBgImage, skillIconImage, uniqueIconImage)
  
  // 如果是原图，直接返回
  if (scale === 1) {
    return fullSizeCanvas
  }
  
  // 缩略图：创建新的 canvas 并高质量缩放
  const width = bgImage.naturalWidth
  const height = bgImage.naturalHeight
  const scaledCanvas = document.createElement('canvas')
  scaledCanvas.width = Math.round(width * scale)
  scaledCanvas.height = Math.round(height * scale)
  
  const ctx = scaledCanvas.getContext('2d')
  if (!ctx) throw new Error('无法创建 canvas context')
  
  // 启用高质量图像平滑
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  
  // 将原始高清图缩放绘制到新 canvas
  ctx.drawImage(fullSizeCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height)
  
  return scaledCanvas
}

/**
 * 生成卡牌预览图（返回 base64 URL）
 * @param cardData 卡牌数据
 * @param scale 输出缩放（1=原图，0.5=缩略图）
 * @returns base64 图片 URL
 */
export const generateCardPreview = async (
  cardData: CardData,
  scale: number = 1
): Promise<string> => {
  const canvas = await generateCardCanvas(cardData, scale)
  return canvas.toDataURL('image/png')
}

/**
 * 下载卡牌图片（从预览图 URL 下载）
 * @param previewUrl 预览图 URL（base64）
 * @param filename 文件名
 */
export const downloadFromPreview = (previewUrl: string, filename: string) => {
  const link = document.createElement('a')
  link.href = previewUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
