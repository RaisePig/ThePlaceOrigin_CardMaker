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
 * 计算自动换行文字的布局信息
 */
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
 * 根据等级获取技能标识图片路径
 */
const getSkillIconPath = (level: 'SR' | 'SSR' | 'UR') => {
  switch (level) {
    case 'SR': return '/resources/skill.png'
    case 'SSR': return '/resources/skill_2.png'
    case 'UR': return '/resources/skill_3.png'
    default: return '/resources/skill.png'
  }
}

/**
 * 根据等级获取绝技标识图片路径
 */
const getUniqueIconPath = (level: 'SR' | 'SSR' | 'UR') => {
  switch (level) {
    case 'SR': return '/resources/unique.png'
    case 'SSR': return '/resources/unique_2.png'
    case 'UR': return '/resources/unique_3.png'
    default: return '/resources/unique.png'
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

  // ========== 层级1: 底图 ==========
  ctx.drawImage(bgImage, 0, 0, width, height)

  // ========== 层级2: 上传的立绘 ==========
  if (cardData.portrait) {
    const portraitImg = await loadImage(cardData.portrait)
    const targetWidth = width * cardData.portraitScale
    const aspectRatio = portraitImg.naturalHeight / portraitImg.naturalWidth
    const targetHeight = targetWidth * aspectRatio
    const pX = (cardData.portraitPosition.x / 100) * width - targetWidth / 2
    const pY = (cardData.portraitPosition.y / 100) * height - targetHeight / 2
    ctx.drawImage(portraitImg, pX, pY, targetWidth, targetHeight)
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
  const skillPositions: { iconY: number, bgY: number, nameX: number, nameY: number }[] = []
  
  cardData.skills.forEach((skill) => {
    if (skill.description) {
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
    if (cardData.ultimate.description) {
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
      nameY: iconY + SKILL_NAME_OFFSET_Y
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
    if (skill.description) {
      const pos = skillPositions[index]
      const { textHeight } = calculateWrappedTextLayout(
        ctx, skill.description, width - 2 * 60, SKILL_DESC_FONT_SIZE + 8, SKILL_DESC_FONT_SIZE, 'Font1, sans-serif'
      )
      const bgHeight = textHeight + 20 * 2
      ctx.drawImage(skillBgImage, SKILL_BG_X, pos.bgY, SKILL_BG_WIDTH, bgHeight)
    }
  })
  
  // 绘制绝技背景
  if (cardData.ultimate && cardData.ultimate.description) {
    ctx.drawImage(uniqueBgImage, ULTIMATE_BG_X, ultimateBgY, ULTIMATE_BG_WIDTH, ultimateBgHeight)
  }

  // ========== 层级4: 技能/绝技标识图片 ==========
  // 绘制技能标识
  cardData.skills.forEach((_, index) => {
    const pos = skillPositions[index]
    ctx.drawImage(skillIconImage, SKILL_ICON_X, pos.iconY, SKILL_ICON_WIDTH, SKILL_ICON_HEIGHT)
  })
  
  // 绘制绝技标识
  if (cardData.ultimate) {
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
  // 加载所有需要的图片（根据等级加载对应的标识图片）
  const [bgImage, skillBgImage, uniqueBgImage, skillIconImage, uniqueIconImage] = await Promise.all([
    loadImage(getBgImagePath(cardData.level)),
    loadImage('/resources/skill_bg.png'),
    loadImage('/resources/unique_bg.png'),
    loadImage(getSkillIconPath(cardData.level)),
    loadImage(getUniqueIconPath(cardData.level))
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
