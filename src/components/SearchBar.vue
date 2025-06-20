<template>
  <div class="search-bar">
    <div class="search-container">
      <div class="search-header">
        <h1 class="search-title">
          <el-icon class="title-icon"><Search /></el-icon>
          机器学习训练结果测试
        </h1>
        <p class="search-subtitle">自动识别数据</p>
      </div>
      
      <div class="search-form">
        <div class="search-input-group">
          <el-input
            v-model="searchForm.searchTerm"
            placeholder="请输入搜索关键词..."
            size="large"
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-select
            v-model="searchForm.selectedType"
            placeholder="选择资源类型"
            size="large"
            class="type-select"
            clearable
          >
            <el-option
              v-for="type in resourceTypes"
              :key="type.id"
              :label="type.name"
              :value="type.menu"
            />
          </el-select>
          
          <el-button
            type="primary"
            size="large"
            class="search-btn"
            :loading="searchLoading"
            @click="handleSearch"
          >
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
        
        <div class="search-actions">
          <el-button
            text
            type="info"
            @click="handleReset"
          >
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useResourceStore } from '@/stores/resource'
import { storeToRefs } from 'pinia'
import { getSearchFromQuery, getTypeFromQuery, buildFullQuery } from '@/utils/url'

const route = useRoute()
const router = useRouter()
const resourceStore = useResourceStore()
const { resourceTypes, searchLoading, searchTerm, selectedType } = storeToRefs(resourceStore)

const searchForm = reactive({
  searchTerm: '',
  selectedType: ''
})

// 初始化时从URL参数设置搜索词和类型
onMounted(() => {
  const searchTerm = getSearchFromQuery(route.query)
  const type = getTypeFromQuery(route.query)

  if (searchTerm) {
    searchForm.searchTerm = searchTerm
  }

  if (type) {
    searchForm.selectedType = type
  }
})

// 监听store中的searchTerm变化，同步到表单
watch(searchTerm, (newTerm) => {
  if (newTerm !== searchForm.searchTerm) {
    searchForm.searchTerm = newTerm
  }
})

// 监听store中的selectedType变化，同步到表单
// 只在重置时同步，避免搜索时的循环更新
watch(selectedType, (newType) => {
  // 只有在重置时（store中的值为空）才同步到表单
  if (newType === '') {
    searchForm.selectedType = ''
  }
})

const handleSearch = () => {
  const term = searchForm.searchTerm.trim()
  const type = searchForm.selectedType

  // 构建新的查询参数，包含搜索词和类型
  const newQuery = buildFullQuery(route.query, term, type)

  // 更新URL
  router.push({ query: newQuery })

  if (!term) {
    // 清空搜索时，获取默认资源列表（但保持类型过滤）
    resourceStore.searchResources({
      searchTerm: '',
      type: searchForm.selectedType || '',
      page: 1,
      size: 10
    })
    return
  }

  const searchData = {
    searchTerm: term,
    type: searchForm.selectedType || '', // 添加资源类型参数
    page: 1, 
    size: 10
  }

  resourceStore.searchResources(searchData)
}

const handleReset = () => {
  searchForm.searchTerm = ''
  searchForm.selectedType = ''
  // 清空URL参数
  router.push({ query: {} })
  resourceStore.resetSearch()
}
</script>

<style scoped>
.search-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 0;
  position: relative;
  overflow: hidden;
}

.search-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.search-header {
  text-align: center;
  margin-bottom: 40px;
}

.search-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 2.2rem;
}

.search-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  font-weight: 300;
}

.search-form {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.search-input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
}

.type-select {
  width: 200px;
}

.search-btn {
  padding: 0 30px;
  font-weight: 600;
}

.search-actions {
  text-align: center;
}

@media (max-width: 768px) {
  .search-input-group {
    flex-direction: column;
  }
  
  .type-select {
    width: 100%;
  }
  
  .search-title {
    font-size: 2rem;
  }
}
</style>
