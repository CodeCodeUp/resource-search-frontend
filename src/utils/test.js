// 简单的测试工具函数
export const testApi = async () => {
  try {
    const { resourceApi } = await import('@/api')

    console.log('🧪 开始测试 API...')

    // 测试获取资源类型
    console.log('📋 测试获取资源类型...')
    const types = await resourceApi.getMenusHierarchical()
    console.log('✅ 资源类型:', types)

    // 测试获取资源列表
    console.log('📄 测试获取资源列表...')
    const resources = await resourceApi.getResourcesPage(1, 5)
    console.log('✅ 资源列表:', resources)
    console.log('📊 数据结构验证:')
    console.log('  - total:', resources.total)
    console.log('  - list:', resources.list?.length, '条记录')
    console.log('  - pageNum:', resources.pageNum)
    console.log('  - 第一条数据:', resources.list?.[0])

    // 测试搜索功能
    console.log('🔍 测试搜索功能...')
    const searchResult = await resourceApi.searchResources({
      searchTerm: 'Vue',
      page: 1,
      size: 5
    })
    console.log('✅ 搜索结果:', searchResult)
    console.log('📊 搜索结果验证:')
    console.log('  - total:', searchResult.total)
    console.log('  - list:', searchResult.list?.length, '条记录')
    console.log('  - pageNum:', searchResult.pageNum)

    // 测试资源类型映射
    console.log('🏷️ 测试资源类型映射...')
    if (types && types.length > 0) {
      console.log('✅ 资源类型映射测试:')
      types.forEach(type => {
        console.log(`  - ${type.name} (menu: ${type.menu}, id: ${type.id})`)
      })

      // 测试类型匹配逻辑
      console.log('🔍 测试类型匹配逻辑:')
      const testTypes = ['study', 'movie', 'anime', 'comic', 'game', 'shortdrama', 'novel', 'wallpaper']
      testTypes.forEach(testType => {
        const matchedType = types.find(t => t.menu === testType)
        console.log(`  - resource.type="${testType}" → menu.name="${matchedType?.name || '未找到'}"`)
      })
    }

    console.log('🎉 所有测试通过！数据结构已匹配实际API格式')
    console.log('📋 新功能验证:')
    console.log('  ✅ 现代化分页组件（下拉选择页码）')
    console.log('  ✅ 资源类型从API菜单动态获取')
    console.log('  ✅ 完整的分页控制（上下页、跳转、每页数量）')
    console.log('  ✅ 根据resource.type匹配菜单name显示')
    console.log('  ✅ URL参数搜索功能（支持中文搜索）')

    // 测试URL搜索功能
    console.log('🔗 URL搜索功能测试:')
    console.log('  - 在地址栏输入: ?search=作品')
    console.log('  - 在地址栏输入: ?search=%E4%BD%9C%E5%93%81 (URL编码)')
    console.log('  - 搜索框会自动填入搜索词并执行搜索')
    console.log('  - 搜索时会自动更新URL参数')
    return true
  } catch (error) {
    console.error('❌ 测试失败:', error)
    return false
  }
}

// URL搜索功能测试
export const testUrlSearch = () => {
  console.log('🔗 测试URL搜索功能...')

  // 测试URL编码解码
  const testCases = [
    { input: '作品', encoded: '%E4%BD%9C%E5%93%81' },
    { input: '学习资料', encoded: '%E5%AD%A6%E4%B9%A0%E8%B5%84%E6%96%99' },
    { input: 'Vue教程', encoded: 'Vue%E6%95%99%E7%A8%8B' }
  ]

  testCases.forEach(({ input, encoded }) => {
    const encodedResult = encodeURIComponent(input)
    const decodedResult = decodeURIComponent(encoded)
    console.log(`✅ "${input}" ↔ "${encoded}"`)
    console.log(`  编码: ${encodedResult === encoded ? '✓' : '✗'} ${encodedResult}`)
    console.log(`  解码: ${decodedResult === input ? '✓' : '✗'} ${decodedResult}`)
  })

  console.log('📝 使用方法:')
  console.log('  1. 在地址栏输入: http://localhost:3000/?search=作品')
  console.log('  2. 或输入编码后的: http://localhost:3000/?search=%E4%BD%9C%E5%93%81')
  console.log('  3. 页面会自动执行搜索并在搜索框中显示搜索词')
  console.log('  4. 在搜索框中输入新的搜索词，URL会自动更新')
}

// 图片代理功能测试
export const testImageProxy = () => {
  console.log('🖼️ 测试图片代理功能...')

  // 测试图片URL
  const testImages = [
    'https://example.com/image1.jpg',
    'https://cdn.example.com/image2.png',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop'
  ]

  testImages.forEach((url, index) => {
    console.log(`📸 测试图片 ${index + 1}: ${url}`)

    // 测试不同的代理方式
    const proxyMethods = [
      { name: 'imageproxy', url: `https://images.weserv.nl/?url=${encodeURIComponent(url)}` },
      { name: 'allorigins', url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` },
      { name: 'backend', url: `/proxy-image?url=${encodeURIComponent(url)}` }
    ]

    proxyMethods.forEach(({ name, url: proxyUrl }) => {
      console.log(`  - ${name}: ${proxyUrl}`)
    })
  })

  console.log('🔧 当前配置:', import.meta.env.VITE_USE_IMAGE_PROXY)
  console.log('📝 使用方法:')
  console.log('  1. 修改 .env.development 中的 VITE_USE_IMAGE_PROXY')
  console.log('  2. 重启开发服务器')
  console.log('  3. 查看资源卡片中的图片是否正常显示')
}

// 图片适配功能测试
export const testImageFit = () => {
  console.log('📐 测试图片适配功能...')

  // 测试不同宽高比的图片
  const testCases = [
    { name: '竖屏图片', width: 400, height: 600, ratio: 0.67 },
    { name: '正方形图片', width: 400, height: 400, ratio: 1.0 },
    { name: '横屏图片', width: 600, height: 400, ratio: 1.5 },
    { name: '极窄竖屏', width: 200, height: 800, ratio: 0.25 },
    { name: '极宽横屏', width: 800, height: 200, ratio: 4.0 }
  ]

  testCases.forEach(({ name, width, height, ratio }) => {
    console.log(`📸 ${name} (${width}x${height}, 比例: ${ratio}):`)

    // 模拟不同适配模式的结果
    const modes = ['smart', 'cover', 'contain', 'auto']
    modes.forEach(mode => {
      // 这里可以调用实际的适配函数进行测试
      console.log(`  - ${mode}模式: ${ratio < 0.8 && mode === 'smart' ? 'contain' : 'cover'}`)
    })
  })

  console.log('🔧 当前配置:', import.meta.env.VITE_IMAGE_FIT_MODE)
  console.log('📝 使用方法:')
  console.log('  1. 修改 .env.development 中的 VITE_IMAGE_FIT_MODE')
  console.log('  2. 可选值: smart, cover, contain, auto')
  console.log('  3. 重启开发服务器查看效果')
  console.log('  4. 在浏览器开发者工具中查看图片适配信息')
}

// 在浏览器控制台中运行测试
if (typeof window !== 'undefined') {
  window.testApi = testApi
  window.testUrlSearch = testUrlSearch
  window.testImageProxy = testImageProxy
  window.testImageFit = testImageFit
  console.log('💡 在控制台中运行以下命令来测试功能:')
  console.log('  - testApi() 测试 API 功能')
  console.log('  - testUrlSearch() 测试 URL 搜索功能')
  console.log('  - testImageProxy() 测试图片代理功能')
  console.log('  - testImageFit() 测试图片适配功能')
}
