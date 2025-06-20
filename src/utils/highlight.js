/**
 * 文本高亮工具函数
 */

/**
 * 高亮显示文本中的关键词
 * @param {string} text - 原始文本
 * @param {Array} keywords - 关键词数组
 * @param {string} className - 高亮样式类名
 * @returns {string} 包含高亮标记的HTML字符串
 */
export const highlightText = (text, keywords, className = 'highlight') => {
  if (!text || !keywords || keywords.length === 0) {
    return text
  }

  // 过滤空关键词并去重
  const validKeywords = [...new Set(keywords.filter(keyword => keyword && keyword.trim()))]
  
  if (validKeywords.length === 0) {
    return text
  }

  // 转义HTML特殊字符
  const escapeHtml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  // 转义正则表达式特殊字符
  const escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // 先转义HTML
  let highlightedText = escapeHtml(text)

  // 按关键词长度降序排列，优先匹配长关键词
  const sortedKeywords = validKeywords.sort((a, b) => b.length - a.length)

  // 为每个关键词创建正则表达式并替换
  sortedKeywords.forEach(keyword => {
    const escapedKeyword = escapeRegex(keyword.trim())
    // 使用全局不区分大小写的正则表达式
    const regex = new RegExp(`(${escapedKeyword})`, 'gi')
    
    highlightedText = highlightedText.replace(regex, `<span class="${className}">$1</span>`)
  })

  return highlightedText
}

/**
 * 检查文本是否包含任意关键词
 * @param {string} text - 要检查的文本
 * @param {Array} keywords - 关键词数组
 * @returns {boolean} 是否包含关键词
 */
export const containsKeywords = (text, keywords) => {
  if (!text || !keywords || keywords.length === 0) {
    return false
  }

  const lowerText = text.toLowerCase()
  return keywords.some(keyword => {
    if (!keyword || !keyword.trim()) return false
    return lowerText.includes(keyword.trim().toLowerCase())
  })
}

/**
 * 获取匹配的关键词列表
 * @param {string} text - 要检查的文本
 * @param {Array} keywords - 关键词数组
 * @returns {Array} 匹配的关键词列表
 */
export const getMatchedKeywords = (text, keywords) => {
  if (!text || !keywords || keywords.length === 0) {
    return []
  }

  const lowerText = text.toLowerCase()
  return keywords.filter(keyword => {
    if (!keyword || !keyword.trim()) return false
    return lowerText.includes(keyword.trim().toLowerCase())
  })
}

/**
 * Vue 组件中使用的高亮指令
 * 用法: v-highlight="{ text: '文本', keywords: ['关键词'] }"
 */
export const highlightDirective = {
  mounted(el, binding) {
    const { text, keywords, className = 'highlight' } = binding.value || {}
    if (text && keywords) {
      el.innerHTML = highlightText(text, keywords, className)
    }
  },
  updated(el, binding) {
    const { text, keywords, className = 'highlight' } = binding.value || {}
    if (text && keywords) {
      el.innerHTML = highlightText(text, keywords, className)
    }
  }
}

/**
 * 默认高亮样式
 */
export const defaultHighlightStyle = `
.highlight {
  background: linear-gradient(120deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  padding: 1px 3px;
  border-radius: 3px;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(255, 215, 0, 0.3);
}
`
