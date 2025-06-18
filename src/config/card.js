// 卡片尺寸配置

/**
 * 卡片尺寸预设
 */
export const CARD_SIZE_PRESETS = {
  COMPACT: 'compact',     // 紧凑型
  NORMAL: 'normal',       // 正常型
  LARGE: 'large'          // 大型
}

/**
 * 卡片尺寸配置
 */
export const cardConfig = {
  // 当前尺寸模式（从环境变量读取）
  currentSize: import.meta.env.VITE_CARD_SIZE || CARD_SIZE_PRESETS.COMPACT,
  
  // 不同尺寸的配置
  sizes: {
    [CARD_SIZE_PRESETS.COMPACT]: {
      name: '紧凑型',
      minHeight: 280,           // 卡片最小高度
      imageHeight: 140,         // 图片区域高度
      imageHeightMobile: 110,   // 移动端图片高度
      gridMinWidth: 280,        // 网格最小宽度
      padding: 16,              // 内容区域内边距
      gap: 20                   // 卡片间距
    },
    
    [CARD_SIZE_PRESETS.NORMAL]: {
      name: '正常型',
      minHeight: 320,
      imageHeight: 160,
      imageHeightMobile: 130,
      gridMinWidth: 300,
      padding: 18,
      gap: 24
    },
    
    [CARD_SIZE_PRESETS.LARGE]: {
      name: '大型',
      minHeight: 380,
      imageHeight: 200,
      imageHeightMobile: 160,
      gridMinWidth: 320,
      padding: 20,
      gap: 28
    }
  }
}

/**
 * 获取当前卡片配置
 * @returns {Object} 当前卡片配置
 */
export const getCurrentCardConfig = () => {
  return cardConfig.sizes[cardConfig.currentSize] || cardConfig.sizes[CARD_SIZE_PRESETS.NORMAL]
}

/**
 * 生成CSS变量
 * @param {string} size - 尺寸类型
 * @returns {Object} CSS变量对象
 */
export const generateCardCSSVars = (size = cardConfig.currentSize) => {
  const config = cardConfig.sizes[size] || cardConfig.sizes[CARD_SIZE_PRESETS.NORMAL]
  
  return {
    '--card-min-height': `${config.minHeight}px`,
    '--card-image-height': `${config.imageHeight}px`,
    '--card-image-height-mobile': `${config.imageHeightMobile}px`,
    '--card-grid-min-width': `${config.gridMinWidth}px`,
    '--card-padding': `${config.padding}px`,
    '--card-gap': `${config.gap}px`
  }
}

/**
 * 获取所有可用的尺寸选项
 * @returns {Array} 尺寸选项数组
 */
export const getCardSizeOptions = () => {
  return Object.entries(cardConfig.sizes).map(([key, config]) => ({
    value: key,
    label: config.name,
    config
  }))
}
