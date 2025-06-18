<template>
  <div class="resource-list">
    <!-- 搜索结果统计 -->
    <div class="list-header" v-if="searchTerm">
      <div class="search-stats">
        <el-icon><Search /></el-icon>
        搜索 "{{ searchTerm }}" 找到 {{ total }} 个结果
      </div>
      <el-button text type="primary" @click="resetSearch">
        <el-icon><Close /></el-icon>
        清除搜索
      </el-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading || searchLoading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 空状态 -->
    <div v-else-if="!hasResources" class="empty-state">
      <div class="empty-icon">
        <el-icon><DocumentRemove /></el-icon>
      </div>
      <h3>{{ searchTerm ? '未找到相关资源' : '暂无资源' }}</h3>
      <p>{{ searchTerm ? '尝试使用其他关键词搜索' : '请稍后再试或联系管理员' }}</p>
      <el-button type="primary" @click="resetSearch" v-if="searchTerm">
        浏览全部资源
      </el-button>
    </div>

    <!-- 资源网格 -->
    <div v-else class="resource-grid">
      <transition-group name="slide-up" tag="div" class="grid-container">
        <ResourceCard
          v-for="resource in resources"
          :key="resource.id"
          :resource="resource"
          class="grid-item"
        />
      </transition-group>
    </div>

    <!-- 分页 -->
    <div v-if="hasResources && totalPages > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { Search, Close, DocumentRemove } from '@element-plus/icons-vue'
import { useResourceStore } from '@/stores/resource'
import { storeToRefs } from 'pinia'
import ResourceCard from './ResourceCard.vue'

const resourceStore = useResourceStore()
const {
  resources,
  loading,
  searchLoading,
  hasResources,
  currentPage,
  pageSize,
  total,
  totalPages,
  searchTerm
} = storeToRefs(resourceStore)

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  if (searchTerm.value) {
    resourceStore.searchResources({
      searchTerm: searchTerm.value,
      page: 1,
      size: newSize
    })
  } else {
    resourceStore.fetchResources(1, newSize)
  }
}

const handleCurrentChange = (newPage) => {
  if (searchTerm.value) {
    resourceStore.searchResources({
      searchTerm: searchTerm.value,
      page: newPage ,
      size: pageSize.value
    })
  } else {
    resourceStore.fetchResources(newPage, pageSize.value)
  }
}

const resetSearch = () => {
  resourceStore.resetSearch()
}

onMounted(() => {
  if (!hasResources.value && !searchTerm.value) {
    resourceStore.fetchResources()
  }
})
</script>

<style scoped>
.resource-list {
  padding: 40px 0;
  min-height: 60vh;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 20px;
}

.search-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  color: #666;
  font-weight: 500;
}

.loading-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.empty-state p {
  font-size: 1rem;
  margin-bottom: 30px;
}

.resource-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.grid-item {
  min-height: 300px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding: 0 20px;
}

.slide-up-enter-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .list-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .pagination-container {
    margin-top: 30px;
  }
  
  :deep(.el-pagination) {
    justify-content: center;
  }
  
  :deep(.el-pagination .el-pagination__sizes),
  :deep(.el-pagination .el-pagination__jump) {
    display: none;
  }
}
</style>
