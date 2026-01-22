// 卡牌制作主组件

import { useState, useRef, useCallback, useEffect } from 'react'
import { CardData, Skill, Attributes } from '../types/card'
import CardPreview from './CardPreview'
import CardForm from './CardForm'
import { generateCardPreview, downloadFromPreview } from '../utils/downloadCard'

export default function CardMaker() {
  const [cardData, setCardData] = useState<CardData>({
    id: '',
    name: '',
    level: 'SR',
    skills: [],
    ultimate: null,
    attributes: {
      power: 0,
      agility: 0,
      health: 0,
      category: ''
    },
    portrait: null,
    portraitPosition: { x: 50, y: 50 },
    portraitScale: 0.5 // 默认缩放为底图的一半
  })

  const [isDragging, setIsDragging] = useState(false)
  const [isTouching, setIsTouching] = useState(false)
  const portraitRef = useRef<HTMLDivElement>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)
  
  // 触摸相关状态
  const touchStateRef = useRef<{
    lastTouch: { x: number; y: number } | null
    initialDistance: number | null
    initialScale: number | null
  }>({
    lastTouch: null,
    initialDistance: null,
    initialScale: null
  })

  // 预览相关状态
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<'original' | 'thumbnail' | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // 预览原图
  const handlePreviewOriginal = async () => {
    setPreviewLoading(true)
    setPreviewType('original')
    try {
      const url = await generateCardPreview(cardData, 1)
      setPreviewUrl(url)
    } catch (error) {
      console.error('生成预览失败:', error)
      alert('生成预览失败，请重试')
    } finally {
      setPreviewLoading(false)
    }
  }

  // 预览缩略图
  const handlePreviewThumbnail = async () => {
    setPreviewLoading(true)
    setPreviewType('thumbnail')
    try {
      const url = await generateCardPreview(cardData, 0.5)
      setPreviewUrl(url)
    } catch (error) {
      console.error('生成预览失败:', error)
      alert('生成预览失败，请重试')
    } finally {
      setPreviewLoading(false)
    }
  }

  // 下载预览图
  const handleDownloadPreview = () => {
    if (!previewUrl) return
    const filename = previewType === 'original' 
      ? `card-${cardData.id || 'card'}.png`
      : `card-${cardData.id || 'card'}-thumb.png`
    downloadFromPreview(previewUrl, filename)
  }

  // 取消预览
  const handleCancelPreview = () => {
    setPreviewUrl(null)
    setPreviewType(null)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log('文件上传:', file?.name, file?.type)
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        console.log('文件读取完成, 长度:', result?.length)
        setCardData(prev => ({
          ...prev,
          portrait: result,
          portraitScale: 0.5 // 自动缩放至底图的一半
        }))
      }
      reader.onerror = (err) => {
        console.error('文件读取失败:', err)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePortraitMouseDown = () => {
    if (!cardData.portrait) return
    setIsDragging(true)
  }

  const handlePortraitMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !cardData.portrait || !portraitRef.current) return
    
    const rect = portraitRef.current.getBoundingClientRect()
    // 计算鼠标在容器中的百分比位置
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setCardData(prev => ({
      ...prev,
      portraitPosition: {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
      }
    }))
  }, [isDragging, cardData.portrait])

  const handlePortraitMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handlePortraitMouseMove)
      document.addEventListener('mouseup', handlePortraitMouseUp)
      return () => {
        document.removeEventListener('mousemove', handlePortraitMouseMove)
        document.removeEventListener('mouseup', handlePortraitMouseUp)
      }
    }
  }, [isDragging, handlePortraitMouseMove, handlePortraitMouseUp])

  // 处理预览框内的滚轮事件，控制立绘大小
  const handlePortraitWheel = useCallback((e: WheelEvent) => {
    if (!cardData.portrait) return
    
    const delta = e.deltaY > 0 ? -0.05 : 0.05
    setCardData(prev => ({
      ...prev,
      portraitScale: Math.max(0.1, Math.min(2, prev.portraitScale + delta))
    }))
  }, [cardData.portrait])

  // 计算两点之间的距离
  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // 处理触摸开始
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!cardData.portrait || !portraitRef.current) return
    
    const touches = e.touches
    if (touches.length === 1) {
      // 单指触摸 - 准备拖拽
      const touch = touches[0]
      touchStateRef.current = {
        lastTouch: { x: touch.clientX, y: touch.clientY },
        initialDistance: null,
        initialScale: null
      }
      setIsDragging(true)
      setIsTouching(true)
      e.preventDefault()
    } else if (touches.length === 2) {
      // 双指触摸 - 准备缩放
      const distance = getDistance(touches[0], touches[1])
      touchStateRef.current = {
        lastTouch: null,
        initialDistance: distance,
        initialScale: cardData.portraitScale
      }
      setIsDragging(false)
      setIsTouching(true)
      e.preventDefault()
    }
  }, [cardData.portrait, cardData.portraitScale])

  // 处理触摸移动
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!cardData.portrait || !portraitRef.current || !isTouching) return
    
    const touches = e.touches
    const touchState = touchStateRef.current
    
    if (touches.length === 1) {
      // 单指移动 - 拖拽立绘
      // 如果之前是双指，切换到单指模式
      if (touchState.lastTouch === null) {
        const touch = touches[0]
        touchState.lastTouch = { x: touch.clientX, y: touch.clientY }
        touchState.initialDistance = null
        touchState.initialScale = null
        setIsDragging(true)
      }
      
      const touch = touches[0]
      const rect = portraitRef.current.getBoundingClientRect()
      
      // 计算触摸点在容器中的百分比位置
      const x = ((touch.clientX - rect.left) / rect.width) * 100
      const y = ((touch.clientY - rect.top) / rect.height) * 100
      
      setCardData(prev => ({
        ...prev,
        portraitPosition: {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y))
        }
      }))
      
      touchState.lastTouch = { x: touch.clientX, y: touch.clientY }
      e.preventDefault()
    } else if (touches.length === 2) {
      // 双指移动 - 缩放立绘
      // 如果之前是单指，切换到双指模式
      if (touchState.initialDistance === null || touchState.initialScale === null) {
        const distance = getDistance(touches[0], touches[1])
        touchState.initialDistance = distance
        touchState.initialScale = cardData.portraitScale
        touchState.lastTouch = null
        setIsDragging(false)
      }
      
      const distance = getDistance(touches[0], touches[1])
      if (touchState.initialDistance !== null && touchState.initialScale !== null) {
        const scaleRatio = distance / touchState.initialDistance
        const newScale = touchState.initialScale * scaleRatio
        
        setCardData(prev => ({
          ...prev,
          portraitScale: Math.max(0.1, Math.min(2, newScale))
        }))
      }
      
      e.preventDefault()
    }
  }, [cardData.portrait, cardData.portraitScale, isTouching])

  // 处理触摸结束
  const handleTouchEnd = useCallback(() => {
    touchStateRef.current = {
      lastTouch: null,
      initialDistance: null,
      initialScale: null
    }
    setIsDragging(false)
    setIsTouching(false)
  }, [])

  // 监听触摸移动事件
  useEffect(() => {
    if (isTouching) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      document.addEventListener('touchcancel', handleTouchEnd)
      return () => {
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
        document.removeEventListener('touchcancel', handleTouchEnd)
      }
    }
  }, [isTouching, handleTouchMove, handleTouchEnd])

  const addSkill = () => {
    if (cardData.skills.length < 2) {
      setCardData(prev => ({
        ...prev,
        skills: [...prev.skills, { name: '', type: 'active', description: '' }]
      }))
    }
  }

  const updateSkill = (index: number, field: keyof Skill, value: string) => {
    setCardData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      )
    }))
  }

  const removeSkill = (index: number) => {
    setCardData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const setUltimate = (field: keyof Skill, value: string) => {
    setCardData(prev => ({
      ...prev,
      ultimate: prev.ultimate
        ? { ...prev.ultimate, [field]: value }
        : { name: '', type: 'active', description: '' }
    }))
  }

  const removeUltimate = () => {
    setCardData(prev => ({ ...prev, ultimate: null }))
  }

  const updateAttribute = (field: keyof Attributes, value: number | string) => {
    setCardData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [field]: value
      }
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左侧：卡牌预览 */}
      <div className="order-2 lg:order-1">
        <CardPreview
          cardData={cardData}
          isDragging={isDragging}
          onPortraitMouseDown={handlePortraitMouseDown}
          onPortraitWheel={handlePortraitWheel}
          onTouchStart={handleTouchStart}
          portraitRef={portraitRef}
          cardContainerRef={cardContainerRef}
        />
      </div>

      {/* 右侧：编辑表单 */}
      <div className="order-1 lg:order-2">
        <CardForm
          cardData={cardData}
          onFileUpload={handleFileUpload}
          onUpdateCardData={(updates) => setCardData(prev => ({ ...prev, ...updates }))}
          onAddSkill={addSkill}
          onUpdateSkill={updateSkill}
          onRemoveSkill={removeSkill}
          onSetUltimate={setUltimate}
          onRemoveUltimate={removeUltimate}
          onUpdateAttribute={updateAttribute}
          onPreviewOriginal={handlePreviewOriginal}
          onPreviewThumbnail={handlePreviewThumbnail}
          previewUrl={previewUrl}
          previewType={previewType}
          previewLoading={previewLoading}
          onDownloadPreview={handleDownloadPreview}
          onCancelPreview={handleCancelPreview}
        />
      </div>
    </div>
  )
}
