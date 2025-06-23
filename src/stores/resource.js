import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { resourceApi } from '@/api'
import { showMessage } from '@/utils/message'

export const useResourceStore = defineStore('resource', () => {
  // 状态
  const resources = ref([])
  const resourceTypes = ref([])
  const loading = ref(false)
  const searchLoading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const searchTerm = ref('')
  const selectedType = ref('')
const searchStrategy = ref('') // 搜索策略
const searchWords = ref([]) // 搜索关键词列表

  // 计算属性
  const hasResources = computed(() => resources.value.length > 0)
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  // 获取资源类型
  const fetchResourceTypes = async () => {
    try {
      loading.value = true
      const data = await resourceApi.getMenusHierarchical()
      resourceTypes.value = data || []
    } catch (error) {
      console.error('获取资源类型失败:', error)
      resourceTypes.value = []
      // 错误已在API拦截器中处理，这里不重复显示
    } finally {
      loading.value = false
    }
  }

  // 获取资源列表（统一使用搜索接口）
  const fetchResources = async (page = 1, size = 10, type = '') => {
    const searchData = {
      searchTerm: '', // 空搜索词表示获取所有资源
      type: type,
      page: page - 1, // searchResources 使用 0 基索引
      size: size
    }
    await searchResources(searchData)
  }

  // 搜索资源
  const searchResources = async (searchData) => {
    try {
      searchLoading.value = true
      const data = await resourceApi.searchResources(searchData)

      // 处理搜索结果
      resources.value = data.pageInfo?.list || data.list || []
      total.value = data.pageInfo?.total || data.total || 0
      currentPage.value = data.pageInfo?.pageNum || searchData.page
      searchTerm.value = searchData.searchTerm || ''

      // 保存搜索策略和关键词
      searchStrategy.value = data.searchStrategy || ''
      searchWords.value = data.words || []

      // 保存选中的资源类型，但不覆盖用户的选择
      if (searchData.type !== undefined) {
        selectedType.value = searchData.type
      }

      // 根据搜索策略显示不同的提示信息
      if (resources.value.length === 0) {
        showMessage.info('未找到相关资源，请尝试其他关键词')
      } else if (searchData.searchTerm && searchStrategy.value !== 'complete') {
        showMessage.success('为您找到以下相似资源')
      }
    } catch (error) {
      console.error('搜索资源失败:', error)
      resources.value = []
      total.value = 0
      searchStrategy.value = ''
      searchWords.value = []
    } finally {
      searchLoading.value = false
    }
  }

  // 重置搜索
  const resetSearch = () => {
    searchTerm.value = ''
    selectedType.value = ''
    currentPage.value = 1
    total.value = 0
    // 使用搜索接口获取所有资源
    searchResources({
      searchTerm: '',
      type: '',
      page: 1,
      size: pageSize.value
    })
  }

  return {
    // 状态
    resources,
    resourceTypes,
    loading,
    searchLoading,
    currentPage,
    pageSize,
    total,
    searchTerm,
    selectedType,
    searchStrategy,
    searchWords,

    // 计算属性
    hasResources,
    totalPages,

    // 方法
    fetchResourceTypes,
    fetchResources,
    searchResources,
    resetSearch
  }
})
