// 文字描边工具函数

/**
 * 生成描边阴影效果，确保边缘指定像素内都是黑色
 * 使用密集的text-shadow网格填充描边区域
 */
export const generateStrokeShadow = (strokeWidth: number): string => {
  const shadows: string[] = []
  const step = 1 // 1px步长，确保完整覆盖
  
  // 生成描边区域内的所有点
  for (let x = -strokeWidth; x <= strokeWidth; x += step) {
    for (let y = -strokeWidth; y <= strokeWidth; y += step) {
      const distance = Math.sqrt(x * x + y * y)
      // 在描边宽度范围内创建阴影
      if (distance <= strokeWidth) {
        shadows.push(`${x}px ${y}px 0 #000`)
      }
    }
  }
  
  // 限制阴影数量以避免性能问题（浏览器通常支持最多1000个阴影）
  if (shadows.length > 800) {
    // 采样以减少数量但保持覆盖
    const filtered: string[] = []
    const skip = Math.ceil(shadows.length / 800)
    for (let i = 0; i < shadows.length; i += skip) {
      filtered.push(shadows[i])
    }
    return filtered.join(', ')
  }
  
  return shadows.join(', ')
}
