// 模拟数据，用于开发和演示
export const mockResourceTypes = [
  { id: 1, menu: 'study', name: '学习', level: 1, createTime: '2025-06-17 06:36:53', updateTime: '2025-06-17 06:36:53', children: null },
  { id: 2, menu: 'movie', name: '影视', level: 1, createTime: '2025-06-17 06:36:53', updateTime: '2025-06-17 06:36:53', children: null },
  { id: 3, menu: 'anime', name: '动漫', level: 1, createTime: '2025-06-17 06:36:53', updateTime: '2025-06-17 06:36:53', children: null },
  { id: 4, menu: 'comic', name: '漫画', level: 1, createTime: '2025-06-17 06:36:53', updateTime: '2025-06-17 06:36:53', children: null },
  { id: 5, menu: 'game', name: '游戏', level: 1, createTime: '2025-06-17 06:36:53', updateTime: '2025-06-17 06:36:53', children: null },
  { id: 6, menu: 'shortdrama', name: '短剧', level: 1, createTime: '2025-06-17 06:36:53', updateTime: '2025-06-17 06:36:53', children: null },
  { id: 7, menu: 'novel', name: '小说', level: 1, createTime: '2025-06-17 06:36:53', updateTime: '2025-06-17 06:36:53', children: null },
  { id: 8, menu: 'wallpaper', name: '壁纸', level: 1, createTime: '2025-06-17 06:36:53', updateTime: '2025-06-17 06:36:53', children: null }
]

export const mockResources = [
  {
    id: 1,
    name: 'Vue.js 完整教程',
    content: '从零开始学习Vue.js框架，包含基础语法、组件开发、路由管理、状态管理等核心内容。适合初学者和进阶开发者。',
    url: 'https://vuejs.org',
    pig: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    level: 1,
    type: 'study',
    createTime: '2025-06-17 06:40:55',
    updateTime: '2025-06-17 06:40:55'
  },
  {
    id: 2,
    name: '复仇者联盟4：终局之战',
    content: '漫威超级英雄电影的史诗级终章，复仇者们为了拯救宇宙而展开最后的决战。',
    url: 'https://example.com/avengers',
    pig: 'https://images.unsplash.com/photo-1489599735734-79b4169c2a78?w=400&h=300&fit=crop',
    level: 1,
    type: 'movie',
    createTime: '2025-06-17 06:40:55',
    updateTime: '2025-06-17 06:40:55'
  },
  {
    id: 3,
    name: '进击的巨人',
    content: '人类与巨人之间的生存战争，充满悬疑和反转的经典动漫作品。',
    url: 'https://example.com/aot',
    pig: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    level: 1,
    type: 'anime',
    createTime: '2025-06-17 06:40:55',
    updateTime: '2025-06-17 06:40:55'
  },
  {
    id: 4,
    name: '海贼王',
    content: '路飞和他的伙伴们在大海上寻找传说中的宝藏ONE PIECE的冒险故事。',
    url: 'https://example.com/onepiece',
    pig: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=400&h=300&fit=crop',
    level: 1,
    type: 'comic',
    createTime: '2025-06-17 06:40:55',
    updateTime: '2025-06-17 06:40:55'
  },
  {
    id: 5,
    name: '原神',
    content: '开放世界冒险游戏，在提瓦特大陆上展开奇幻的冒险旅程。',
    url: 'https://genshin.hoyoverse.com',
    pig: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
    level: 1,
    type: 'game',
    createTime: '2025-06-17 06:40:55',
    updateTime: '2025-06-17 06:40:55'
  },
  {
    id: 6,
    name: '霸道总裁爱上我',
    content: '现代都市爱情短剧，讲述普通女孩与霸道总裁的浪漫爱情故事。',
    url: 'https://example.com/drama',
    pig: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop',
    level: 1,
    type: 'shortdrama',
    createTime: '2025-06-17 06:40:55',
    updateTime: '2025-06-17 06:40:55'
  },
  {
    id: 7,
    name: '斗破苍穹',
    content: '玄幻小说经典之作，讲述少年萧炎从废材到强者的逆袭之路。',
    url: 'https://example.com/doupo',
    pig: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    level: 1,
    type: 'novel',
    createTime: '2025-06-17 06:40:55',
    updateTime: '2025-06-17 06:40:55'
  },
  {
    id: 8,
    name: '4K风景壁纸合集',
    content: '精美的4K高清风景壁纸，包含山川、海洋、森林等自然美景。',
    url: 'https://example.com/wallpaper',
    pig: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    level: 1,
    type: 'wallpaper',
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
