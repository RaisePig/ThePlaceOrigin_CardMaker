// 卡牌元素显示位置常量（基于底图原始尺寸）

// ========== SR 等级位置配置 ==========
// 姓名显示位置
export const NAME_POSITION_X = 220
export const NAME_POSITION_Y = 183
export const NAME_FONT_SIZE = 44

// 编号显示位置
export const ID_POSITION_X = 285
export const ID_POSITION_Y = 122
export const ID_FONT_SIZE = 44

// 战斗属性显示位置
export const POWER_POSITION_X = 265
export const POWER_POSITION_Y = 362
export const POWER_FONT_SIZE = 57

// 敏捷属性显示位置
export const AGILITY_POSITION_X = 265
export const AGILITY_POSITION_Y = 448
export const AGILITY_FONT_SIZE = 57

// 生命属性显示位置
export const HEALTH_POSITION_X = 265
export const HEALTH_POSITION_Y = 535
export const HEALTH_FONT_SIZE = 57

// 种类显示位置
export const CATEGORY_POSITION_X = 272
export const CATEGORY_POSITION_Y = 620
export const CATEGORY_FONT_SIZE = 30
export const CATEGORY_FONT_SIZE_SMALL = 23

// ========== SSR 等级位置配置 ==========
// SSR 编号位置（X往右移动50px，Y+1+2=+3）
export const SSR_ID_POSITION_X = ID_POSITION_X + 50
export const SSR_ID_POSITION_Y = ID_POSITION_Y + 3

// SSR 姓名位置（Y往下移动1px）
export const SSR_NAME_POSITION_Y = NAME_POSITION_Y + 1

// SSR 战斗属性位置（Y+1+2=+3）
export const SSR_POWER_POSITION_Y = POWER_POSITION_Y + 3

// SSR 敏捷属性位置（Y往下移动1px）
export const SSR_AGILITY_POSITION_Y = AGILITY_POSITION_Y + 1

// ========== UR 等级位置配置 ==========
// UR 编号位置（Y+3+2=+5）
export const UR_ID_POSITION_X = ID_POSITION_X
export const UR_ID_POSITION_Y = ID_POSITION_Y + 5

// UR 姓名位置（Y+3+2+1=+6，X-3-2=-5）
export const UR_NAME_POSITION_X = NAME_POSITION_X - 5
export const UR_NAME_POSITION_Y = NAME_POSITION_Y + 6

// UR 战斗属性位置（Y+2）
export const UR_POWER_POSITION_Y = POWER_POSITION_Y + 2

// UR 敏捷属性位置（Y+2）
export const UR_AGILITY_POSITION_Y = AGILITY_POSITION_Y + 2

// 描边宽度
export const TEXT_STROKE_WIDTH = 6 // 像素

// 技能背景图片尺寸
export const SKILL_BG_WIDTH = 886 // 技能背景宽度
export const SKILL_BG_HEIGHT = 100 // 技能背景高度

// 布局配置（自适应）
export const SKILL_START_OFFSET = 50 // 距离底部的起始偏移
export const SKILL_GAP = 35 // 技能/绝技之间的间隔
export const SKILL_ICON_TO_BG_OFFSET = 48 // 标识图片顶部到背景顶部的偏移
export const ULTIMATE_ICON_TO_BG_OFFSET = 50 // 绝技标识图片顶部到背景顶部的偏移

// 技能标识图片位置（skill.png）
export const SKILL_ICON_WIDTH = 153 // 技能标识宽度
export const SKILL_ICON_HEIGHT = 56 // 技能标识高度
export const SKILL_ICON_X = 650 // 技能标识X位置（通用）

// 绝技标识图片位置（unique.png）
export const ULTIMATE_ICON_WIDTH = 177 // 绝技标识宽度
export const ULTIMATE_ICON_HEIGHT = 64 // 绝技标识高度
export const ULTIMATE_ICON_X = 60 // 绝技标识X位置

// 背景图片X位置
export const SKILL_BG_X = 0 // 技能背景X位置
export const ULTIMATE_BG_X = 0 // 绝技背景X位置
export const ULTIMATE_BG_WIDTH = 886 // 绝技背景宽度

// 技能名称相对于标识的偏移
export const SKILL_NAME_OFFSET_X = -8 // 技能名称相对标识X偏移（右对齐）
export const SKILL_NAME_OFFSET_Y = 30 // 技能名称相对标识Y偏移

// 绝技名称相对于标识的偏移
export const ULTIMATE_NAME_OFFSET_X = 8 // 绝技名称相对标识右侧的偏移
export const ULTIMATE_NAME_OFFSET_Y = 35 // 绝技名称相对标识Y偏移

// 技能/绝技字体大小
export const SKILL_NAME_FONT_SIZE = 34 // 技能名称字体大小
export const SKILL_DESC_FONT_SIZE = 30 // 技能描述字体大小
export const ULTIMATE_NAME_FONT_SIZE = 37 // 绝技名称字体大小
export const ULTIMATE_DESC_FONT_SIZE = 30 // 绝技描述字体大小

// 技能/绝技描边宽度
export const SKILL_NAME_STROKE_WIDTH = 3 // 技能名称描边宽度
export const SKILL_DESC_STROKE_WIDTH = 2 // 技能描述描边宽度
