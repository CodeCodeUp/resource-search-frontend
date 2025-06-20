<template>
  <div class="home">
    <!-- 搜索栏 -->
    <SearchBar />
    
    <!-- 资源列表 -->
    <div class="content-section">
      <div class="container">
        <ResourceList />
      </div>
    </div>
    
    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-info">
            <h4>资源搜索平台</h4>
            <p>发现优质资源，助力学习成长</p>
          </div>
          <div class="footer-links">
            <a href="#" @click.prevent>关于我们</a>
            <a href="#" @click.prevent>联系方式</a>
            <a href="#" @click.prevent>使用帮助</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 资源搜索平台. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import SearchBar from '@/components/SearchBar.vue'
import ResourceList from '@/components/ResourceList.vue'
import { useResourceStore } from '@/stores/resource'
import { getSearchFromQuery, getTypeFromQuery } from '@/utils/url'

const route = useRoute()
const resourceStore = useResourceStore()

// 处理URL参数的搜索逻辑函数
const handleUrlParams = async (query) => {
  const searchTerm = getSearchFromQuery(query)
  const type = getTypeFromQuery(query)

  // 构建搜索数据，包含URL中的搜索词和类型参数
  const searchData = {
    searchTerm: searchTerm || '',
    type: type || '',
    page: 0, // searchResources 使用 0 基索引
    size: 10
  }

  await resourceStore.searchResources(searchData)
}

onMounted(async () => {
  // 初始化时获取资源类型
  await resourceStore.fetchResourceTypes()

  // 处理初始URL参数（搜索词和类型）
  await handleUrlParams(route.query)
})

// 监听路由查询参数变化
watch(
  () => route.query,
  async (newQuery) => {
    // 当URL中的查询参数变化时，自动执行搜索
    await handleUrlParams(newQuery)
  },
  { deep: true } // 深度监听查询对象的变化
)
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-section {
  flex: 1;
  background: #f8f9fa;
}

.footer {
  background: #2c3e50;
  color: white;
  padding: 40px 0 20px;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.footer-info h4 {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #ecf0f1;
}

.footer-info p {
  color: #bdc3c7;
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  gap: 30px;
}

.footer-links a {
  color: #bdc3c7;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #3498db;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #34495e;
}

.footer-bottom p {
  color: #95a5a6;
  font-size: 0.85rem;
  margin: 0;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .footer-links {
    gap: 20px;
  }
}
</style>
