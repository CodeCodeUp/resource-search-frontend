// 图片适配配置

/**
 * 图片适配模式
 */
export const IMAGE_FIT_MODES = {
  COVER: 'cover',           // 覆盖模式（默认）- 填满容器，可能裁剪
  CONTAIN: 'contain',       // 包含模式 - 完整显示，可能有空白
  AUTO: 'auto',            // 自动模式 - 根据宽高比智能选择
  SMART: 'smart'           // 智能模式 - 竖屏用contain，横屏用cover
}

/**
 * 图片适配配置
 */
export const imageConfig = {
  // 默认适配模式（从环境变量读取）
  defaultFitMode: import.meta.env.VITE_IMAGE_FIT_MODE || IMAGE_FIT_MODES.SMART,
  
  // 竖屏图片阈值（宽高比小于此值认为是竖屏）
  portraitThreshold: 0.8,
  
  // 极端比例阈值（超出此范围使用contain模式）
  extremeRatioThreshold: {
    min: 0.5,  // 最小宽高比
    max: 2.5   // 最大宽高比
  },
  
  // 是否显示适配信息（开发模式）
  showFitInfo: import.meta.env.DEV,
  
  // 背景色配置
  backgroundColor: {
    portrait: '#f8f9fa',     // 竖屏图片背景色
    autoFit: '#f5f5f5',      // 自动适配背景色
    default: 'transparent'    // 默认背景色
  }
}

/**
 * 判断图片适配模式
 * @param {number} aspectRatio - 图片宽高比
 * @param {string} mode - 适配模式
 * @returns {Object} 适配结果
 */
export const getImageFitMode = (aspectRatio, mode = imageConfig.defaultFitMode) => {
  const result = {
    objectFit: 'cover',
    isPortrait: false,
    isAutoFit: false,
    backgroundColor: imageConfig.backgroundColor.default,
    info: ''
  }
  
  switch (mode) {
    case IMAGE_FIT_MODES.COVER:
      result.objectFit = 'cover'
      result.info = 'Cover模式'
      break
      
    case IMAGE_FIT_MODES.CONTAIN:
      result.objectFit = 'contain'
      result.backgroundColor = imageConfig.backgroundColor.autoFit
      result.info = 'Contain模式'
      break
      
    case IMAGE_FIT_MODES.AUTO:
      if (aspectRatio < imageConfig.extremeRatioThreshold.min || 
          aspectRatio > imageConfig.extremeRatioThreshold.max) {
        result.objectFit = 'contain'
        result.isAutoFit = true
        result.backgroundColor = imageConfig.backgroundColor.autoFit
        result.info = 'Auto模式 - Contain'
      } else {
        result.objectFit = 'cover'
        result.info = 'Auto模式 - Cover'
      }
      break
      
    case IMAGE_FIT_MODES.SMART:
    default:
      if (aspectRatio < imageConfig.portraitThreshold) {
        result.objectFit = 'contain'
        result.isPortrait = true
        result.backgroundColor = imageConfig.backgroundColor.portrait
        result.info = 'Smart模式 - 竖屏Contain'
      } else if (aspectRatio < imageConfig.extremeRatioThreshold.min || 
                 aspectRatio > imageConfig.extremeRatioThreshold.max) {
        result.objectFit = 'contain'
        result.isAutoFit = true
        result.backgroundColor = imageConfig.backgroundColor.autoFit
        result.info = 'Smart模式 - 极端比例Contain'
      } else {
        result.objectFit = 'cover'
        result.info = 'Smart模式 - 正常Cover'
      }
      break
  }
  
  return result
}

/**
 * 获取图片尺寸信息
 * @param {HTMLImageElement} img - 图片元素
 * @returns {Object} 尺寸信息
 */
export const getImageInfo = (img) => {
  const aspectRatio = img.naturalWidth / img.naturalHeight
  const isLandscape = aspectRatio > 1
  const isPortrait = aspectRatio < 1
  const isSquare = Math.abs(aspectRatio - 1) < 0.1
  
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    aspectRatio,
    isLandscape,
    isPortrait,
    isSquare,
    orientation: isSquare ? 'square' : (isLandscape ? 'landscape' : 'portrait')
  }
}
