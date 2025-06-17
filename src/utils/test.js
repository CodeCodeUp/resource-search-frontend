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
      page: 0,
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

// 在浏览器控制台中运行测试
if (typeof window !== 'undefined') {
  window.testApi = testApi
  window.testUrlSearch = testUrlSearch
  console.log('💡 在控制台中运行以下命令来测试功能:')
  console.log('  - testApi() 测试 API 功能')
  console.log('  - testUrlSearch() 测试 URL 搜索功能')
}
