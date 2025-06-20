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
 * 从URL查询参数中获取资源类型
 * @param {Object} query - 路由查询对象
 * @returns {string} 资源类型
 */
export const getTypeFromQuery = (query) => {
  const typeParam = query.type
  return safeDecodeURIComponent(typeParam)
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
 * 构建包含类型参数的查询对象
 * @param {Object} currentQuery - 当前查询对象
 * @param {string} type - 资源类型
 * @returns {Object} 新的查询对象
 */
export const buildTypeQuery = (currentQuery, type) => {
  if (!type || !type.trim()) {
    // 如果类型为空，移除type参数
    const { type: _, ...otherQuery } = currentQuery
    return otherQuery
  }

  return {
    ...currentQuery,
    type: safeEncodeURIComponent(type.trim())
  }
}

/**
 * 构建完整的查询参数对象
 * @param {Object} currentQuery - 当前查询对象
 * @param {string} searchTerm - 搜索词
 * @param {string} type - 资源类型
 * @returns {Object} 新的查询对象
 */
export const buildFullQuery = (currentQuery, searchTerm, type) => {
  let newQuery = { ...currentQuery }

  // 处理搜索词
  if (!searchTerm || !searchTerm.trim()) {
    delete newQuery.search
  } else {
    newQuery.search = safeEncodeURIComponent(searchTerm.trim())
  }

  // 处理类型
  if (!type || !type.trim()) {
    delete newQuery.type
  } else {
    newQuery.type = safeEncodeURIComponent(type.trim())
  }

  return newQuery
}

/**
 * 检查URL是否包含搜索参数
 * @param {Object} query - 路由查询对象
 * @returns {boolean} 是否包含搜索参数
 */
export const hasSearchQuery = (query) => {
  return !!(query && query.search)
}

/**
 * 检查URL是否包含类型参数
 * @param {Object} query - 路由查询对象
 * @returns {boolean} 是否包含类型参数
 */
export const hasTypeQuery = (query) => {
  return !!(query && query.type)
}
