// 模拟数据，用于开发和演示
export const mockResourceTypes = [
  { id: 1, name: '编程教程', parentId: null },
  { id: 2, name: '设计资源', parentId: null },
  { id: 3, name: '办公软件', parentId: null },
  { id: 4, name: '学习资料', parentId: null },
  { id: 5, name: '工具软件', parentId: null }
]

export const mockResources = [
  {
    id: 1,
    name: 'Vue.js 完整教程',
    content: '从零开始学习Vue.js框架，包含基础语法、组件开发、路由管理、状态管理等核心内容。适合初学者和进阶开发者。',
    url: 'https://vuejs.org',
    pig: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    level: 1,
    type: 'programming',
    createTime: '2025-06-17 06:40:55',
    updateTime: '2025-06-17 06:40:55'
  },
  {
    id: 2,
    name: 'React 开发指南',
    content: '深入学习React框架，掌握组件化开发、Hooks使用、性能优化等高级技巧。包含大量实战项目。',
    url: 'https://reactjs.org',
    pig: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=300&fit=crop',
    level: 1,
    type: 'programming',
    createTime: '2025-06-17 06:40:55',
    updateTime: '2025-06-17 06:40:55'
  },
  {
    id: 3,
    name: 'UI设计素材包',
    content: '精美的UI设计素材集合，包含图标、按钮、卡片等常用组件。支持Sketch、Figma等主流设计工具。',
    url: 'https://example.com/ui-kit',
    pig: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    level: 1,
    type: 'design',
    createTime: '2025-06-17 06:40:55',
    updateTime: '2025-06-17 06:40:55'
  },
  {
    id: 4,
    name: 'Photoshop 高级教程',
    content: '专业的Photoshop教程，涵盖图像处理、特效制作、合成技巧等高级功能。适合设计师和摄影师。',
    url: 'https://example.com/ps-tutorial',
    pig: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&h=300&fit=crop',
    level: 1,
    type: 'design',
    createTime: '2025-06-17 06:40:55',
    updateTime: '2025-06-17 06:40:55'
  },
  {
    id: 5,
    name: 'Excel 数据分析',
    content: 'Excel数据分析完整教程，包含数据透视表、图表制作、函数应用、宏编程等实用技能。',
    url: 'https://example.com/excel-tutorial',
    pig: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    level: 1,
    type: 'office',
    createTime: '2025-06-17 06:40:55',
    updateTime: '2025-06-17 06:40:55'
  },
  {
    id: 6,
    name: 'Python 编程入门',
    content: 'Python编程语言入门教程，从基础语法到实际项目开发，包含爬虫、数据分析、Web开发等应用。',
    url: 'https://python.org',
    pig: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop',
    level: 1,
    type: 'programming',
    createTime: '2025-06-17 06:40:55',
    updateTime: '2025-06-17 06:40:55'
  },
  {
    id: 7,
    name: '计算机网络原理',
    content: '深入理解计算机网络原理，包含TCP/IP协议、网络安全、路由算法等核心知识点。',
    url: 'https://example.com/network',
    pig: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
    level: 1,
    type: 'study',
    createTime: '2025-06-17 06:40:55',
    updateTime: '2025-06-17 06:40:55'
  },
  {
    id: 8,
    name: 'VSCode 插件开发',
    content: '学习如何开发VSCode插件，提升开发效率。包含插件架构、API使用、发布流程等内容。',
    url: 'https://code.visualstudio.com',
    pig: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
    level: 1,
    type: 'tool',
    createTime: '2025-06-17 06:40:55',
    updateTime: '2025-06-17 06:40:55'
  }
]

// 模拟API响应
export const mockApi = {
  getMenusHierarchical: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockResourceTypes)
      }, 500)
    })
  },

  getResourcesPage: (page = 1, size = 10) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const start = (page - 1) * size
        const end = start + size
        const list = mockResources.slice(start, end)

        resolve({
          total: mockResources.length,
          list,
          pageNum: page,
          pageSize: size,
          size: list.length,
          startRow: start,
          endRow: end - 1,
          pages: Math.ceil(mockResources.length / size),
          prePage: page > 1 ? page - 1 : 0,
          nextPage: page < Math.ceil(mockResources.length / size) ? page + 1 : 0,
          isFirstPage: page === 1,
          isLastPage: page === Math.ceil(mockResources.length / size),
          hasPreviousPage: page > 1,
          hasNextPage: page < Math.ceil(mockResources.length / size),
          navigatePages: 8,
          navigatepageNums: [page],
          navigateFirstPage: 1,
          navigateLastPage: Math.ceil(mockResources.length / size)
        })
      }, 800)
    })
  },

  searchResources: (searchData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { searchTerm, page = 0, size = 10 } = searchData

        let filtered = mockResources
        if (searchTerm) {
          filtered = mockResources.filter(resource =>
            resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.content.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }

        const start = page * size
        const end = start + size
        const list = filtered.slice(start, end)
        const pageNum = page + 1

        resolve({
          total: filtered.length,
          list,
          pageNum,
          pageSize: size,
          size: list.length,
          startRow: start,
          endRow: end - 1,
          pages: Math.ceil(filtered.length / size),
          prePage: pageNum > 1 ? pageNum - 1 : 0,
          nextPage: pageNum < Math.ceil(filtered.length / size) ? pageNum + 1 : 0,
          isFirstPage: pageNum === 1,
          isLastPage: pageNum === Math.ceil(filtered.length / size),
          hasPreviousPage: pageNum > 1,
          hasNextPage: pageNum < Math.ceil(filtered.length / size),
          navigatePages: 8,
          navigatepageNums: [pageNum],
          navigateFirstPage: 1,
          navigateLastPage: Math.ceil(filtered.length / size)
        })
      }, 600)
    })
  }
}
