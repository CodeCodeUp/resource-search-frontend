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

  // 获取资源列表
  const fetchResources = async (page = 1, size = 10) => {
    try {
      loading.value = true
      const data = await resourceApi.getResourcesPage(page, size)
      resources.value = data.list || data.content || data.records || data.data || []
      total.value = data.total || data.totalElements || 0
      currentPage.value = data.pageNum || page
    } catch (error) {
      console.error('获取资源列表失败:', error)
      resources.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  // 搜索资源
  const searchResources = async (searchData) => {
    try {
      searchLoading.value = true
      const data = await resourceApi.searchResources(searchData)
      resources.value = data.list || data.content || data.records || data.data || []
      total.value = data.total || data.totalElements || 0
      currentPage.value = data.pageNum || (searchData.page + 1)
      searchTerm.value = searchData.searchTerm

      if (resources.value.length === 0) {
        showMessage.info('未找到相关资源，请尝试其他关键词')
      }
    } catch (error) {
      console.error('搜索资源失败:', error)
      resources.value = []
      total.value = 0
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
    fetchResources()
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
