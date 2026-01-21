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
  const portraitRef = useRef<HTMLDivElement>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)

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
