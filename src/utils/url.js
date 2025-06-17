// URL参数处理工具函数

/**
 * 安全地解码URL参数
 * @param {string} param - 需要解码的参数
 * @returns {string} 解码后的字符串
 */
export const safeDecodeURIComponent = (param) => {
  if (!param) return ''
  
  try {
    return decodeURIComponent(param)
  } catch (error) {
    console.warn('URL解码失败:', error)
    return param
  }
}

/**
 * 安全地编码URL参数
 * @param {string} param - 需要编码的参数
 * @returns {string} 编码后的字符串
 */
export const safeEncodeURIComponent = (param) => {
  if (!param) return ''
  
  try {
    return encodeURIComponent(param)
  } catch (error) {
    console.warn('URL编码失败:', error)
    return param
  }
}

/**
 * 从URL查询参数中获取搜索词
 * @param {Object} query - 路由查询对象
 * @returns {string} 搜索词
 */
export const getSearchFromQuery = (query) => {
  const searchParam = query.search
  return safeDecodeURIComponent(searchParam)
}

/**
 * 构建包含搜索参数的查询对象
 * @param {Object} currentQuery - 当前查询对象
 * @param {string} searchTerm - 搜索词
 * @returns {Object} 新的查询对象
 */
export const buildSearchQuery = (currentQuery, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    // 如果搜索词为空，移除search参数
    const { search, ...otherQuery } = currentQuery
    return otherQuery
  }
  
  return {
    ...currentQuery,
    search: safeEncodeURIComponent(searchTerm.trim())
  }
}

/**
 * 检查URL是否包含搜索参数
 * @param {Object} query - 路由查询对象
 * @returns {boolean} 是否包含搜索参数
 */
export const hasSearchQuery = (query) => {
  return !!(query && query.search)
}
