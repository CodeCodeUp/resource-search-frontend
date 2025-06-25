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
            <h4>精盘搜</h4>
          </div>
          <div class="footer-links">
            <router-link to="/user-agreement">用户协议</router-link>
            <router-link to="/disclaimer">免责声明</router-link>
            <router-link to="/copyright">版权说明</router-link>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 精盘搜. All rights reserved.</p>
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
    page: 1, // searchResources 使用 0 基索引
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
  background: white;
  color: #666;
  padding: 30px 0 15px;
  margin-top: auto;
  border-top: 1px solid #e9ecef;
}

.footer .container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.footer-info h4 {
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: #555;
}

.footer-info p {
  color: #888;
  font-size: 0.85rem;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links a,
.footer-links .router-link-active,
.footer-links .router-link-exact-active {
  color: #888;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.footer-links a:hover,
.footer-links .router-link-active:hover,
.footer-links .router-link-exact-active:hover {
  color: #3498db;
}

.footer-bottom {
  text-align: center;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.footer-bottom p {
  color: #999;
  font-size: 0.8rem;
  margin: 0;
}

@media (max-width: 768px) {
  .footer .container {
    max-width: 100%;
    padding: 0 15px;
  }

  .footer-content {
    flex-direction: column;
    gap: 15px;
  }

  .footer-links {
    gap: 15px;
    flex-wrap: wrap;
  }
}
</style>
