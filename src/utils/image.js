// 图片处理工具函数

/**
 * 处理跨域图片URL
 * @param {string} imageUrl - 原始图片URL
 * @returns {string} 处理后的图片URL
 */
export const processImageUrl = (imageUrl) => {
  if (!imageUrl) return ''
  
  // 如果是本地图片或已经是代理URL，直接返回
  if (imageUrl.startsWith('/') || imageUrl.startsWith('data:') || imageUrl.includes('proxy-image')) {
    return imageUrl
  }
  
  // 方案1：使用后端代理（推荐）
  if (import.meta.env.VITE_USE_IMAGE_PROXY === 'backend') {
    return `/proxy-image?url=${encodeURIComponent(imageUrl)}`
  }
  
  // 方案2：使用第三方代理服务（临时方案）
  if (import.meta.env.VITE_USE_IMAGE_PROXY === 'cors-anywhere') {
    return `https://cors-anywhere.herokuapp.com/${imageUrl}`
  }
  
  // 方案3：使用其他公共代理服务
  if (import.meta.env.VITE_USE_IMAGE_PROXY === 'allorigins') {
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`
  }
  
  // 方案4：使用图片代理服务
  if (import.meta.env.VITE_USE_IMAGE_PROXY === 'imageproxy') {
    return `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}`
  }
  
  // 默认返回原URL（可能会有跨域问题）
  return imageUrl
}

/**
 * 生成默认图片（Base64编码的SVG）
 * @param {string} text - 显示的文字
 * @param {string} bgColor - 背景色
 * @param {string} textColor - 文字颜色
 * @returns {string} Base64编码的SVG图片
 */
export const generateDefaultImage = (text = '无图片', bgColor = '#f0f0f0', textColor = '#999') => {
  const svg = `
    <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="${bgColor}"/>
      <text x="200" y="150" font-family="Arial, sans-serif" font-size="18" fill="${textColor}" text-anchor="middle" dy="0.3em">${text}</text>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

/**
 * 检查图片是否可以加载
 * @param {string} imageUrl - 图片URL
 * @returns {Promise<boolean>} 是否可以加载
 */
export const checkImageLoad = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = imageUrl
    
    // 设置超时
    setTimeout(() => resolve(false), 5000)
  })
}

/**
 * 智能图片加载（带重试机制）
 * @param {string} imageUrl - 原始图片URL
 * @param {string} fallbackText - 失败时显示的文字
 * @returns {Promise<string>} 最终的图片URL
 */
export const smartImageLoad = async (imageUrl, fallbackText = '加载失败') => {
  if (!imageUrl) {
    return generateDefaultImage(fallbackText)
  }
  
  // 尝试原始URL
  const originalWorks = await checkImageLoad(imageUrl)
  if (originalWorks) {
    return imageUrl
  }
  
  // 尝试代理URL
  const proxyUrl = processImageUrl(imageUrl)
  if (proxyUrl !== imageUrl) {
    const proxyWorks = await checkImageLoad(proxyUrl)
    if (proxyWorks) {
      return proxyUrl
    }
  }
  
  // 都失败了，返回默认图片
  return generateDefaultImage(fallbackText)
}
