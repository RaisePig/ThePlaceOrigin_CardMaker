// 卡牌相关类型定义

export interface Skill {
  name: string
  type: 'active' | 'passive'
  description: string
}

export interface Attributes {
  power: number
  agility: number
  health: number
  category: string
}

export interface CardData {
  id: string
  name: string
  level: 'SR' | 'SSR' | 'UR'
  skills: Skill[]
  ultimate: Skill | null
  attributes: Attributes
  portrait: string | null
  portraitPosition: { x: number; y: number }
  portraitScale: number // 立绘缩放比例
}
