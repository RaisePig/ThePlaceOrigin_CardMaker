/**
 * 资源加载器 - 将图片转为 Base64 并缓存
 * 防止通过 Network 面板直接获取原始资源 URL
 */

// 资源缓存
const resourceCache: Map<string, string> = new Map()
const imageCache: Map<string, HTMLImageElement> = new Map()

// 资源路径映射表
const RESOURCE_PATHS: Record<string, string> = {
  '/resources/bg.png': '/resources/bg.png',
  '/resources/bg_2.png': '/resources/bg_2.png',
  '/resources/bg_3.png': '/resources/bg_3.png',
  '/resources/skill_bg.png': '/resources/skill_bg.png',
  '/resources/unique_bg.png': '/resources/unique_bg.png',
  '/resources/skill.png': '/resources/skill.png',
  '/resources/skill_2.png': '/resources/skill_2.png',
  '/resources/skill_3.png': '/resources/skill_3.png',
  '/resources/unique.png': '/resources/unique.png',
  '/resources/unique_2.png': '/resources/unique_2.png',
  '/resources/unique_3.png': '/resources/unique_3.png',
}

/**
 * 获取资源路径
 */
export const getResourceUrl = (path: string): string => {
  return RESOURCE_PATHS[path] || path
}

/**
 * 将图片 URL 转换为 Base64
 */
const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * 加载资源并转换为 Base64（带缓存）
 */
export const loadResourceAsBase64 = async (path: string): Promise<string> => {
  // 检查缓存
  if (resourceCache.has(path)) {
    return resourceCache.get(path)!
  }

  const actualUrl = getResourceUrl(path)
  const base64 = await urlToBase64(actualUrl)
  resourceCache.set(path, base64)
  return base64
}

/**
 * 加载图片元素（带缓存）
 */
export const loadImage = async (path: string): Promise<HTMLImageElement> => {
  // 检查缓存
  if (imageCache.has(path)) {
    return imageCache.get(path)!
  }

  const base64 = await loadResourceAsBase64(path)
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageCache.set(path, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = base64
  })
}

/**
 * 预加载所有资源
 */
export const preloadAllResources = async (): Promise<void> => {
  const paths = Object.keys(RESOURCE_PATHS)
  await Promise.all(paths.map(path => loadResourceAsBase64(path)))
}

/**
 * 根据等级获取底图路径
 */
export const getBgImagePath = (level: 'SR' | 'SSR' | 'UR'): string => {
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
export const getSkillIconPath = (level: 'SR' | 'SSR' | 'UR'): string => {
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
export const getUniqueIconPath = (level: 'SR' | 'SSR' | 'UR'): string => {
  switch (level) {
    case 'SR': return '/resources/unique.png'
    case 'SSR': return '/resources/unique_2.png'
    case 'UR': return '/resources/unique_3.png'
    default: return '/resources/unique.png'
  }
}

/**
 * 水印配置
 */
export const WATERMARK_CONFIG = {
  text: 'xhs:野猪peppa',
  fontSize: 36,
  color: 'rgba(255, 255, 255, 0.25)',
  angle: -30, // 倾斜角度（度）
  lines: 3, // 水印行数
}

/**
 * 在 Canvas 上绘制水印（斜着三行）
 */
export const drawWatermark = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config = WATERMARK_CONFIG
): void => {
  ctx.save()
  
  ctx.font = `${config.fontSize}px sans-serif`
  ctx.fillStyle = config.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // 旋转画布
  ctx.translate(width / 2, height / 2)
  ctx.rotate((config.angle * Math.PI) / 180)
  
  // 计算三行水印的垂直间距
  const totalHeight = height * 0.8
  const lineSpacing = totalHeight / (config.lines - 1)
  const startY = -totalHeight / 2
  
  // 绘制三行水印
  for (let i = 0; i < config.lines; i++) {
    const y = startY + i * lineSpacing
    ctx.fillText(config.text, 0, y)
  }
  
  ctx.restore()
}
