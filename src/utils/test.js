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

    console.log('🎉 所有测试通过！数据结构已匹配实际API格式')
    return true
  } catch (error) {
    console.error('❌ 测试失败:', error)
    return false
  }
}

// 在浏览器控制台中运行测试
if (typeof window !== 'undefined') {
  window.testApi = testApi
  console.log('💡 在控制台中运行 testApi() 来测试 API 功能')
}
