<template>
  <div class="resource-card" @click="handleCardClick">
    <div class="card-image">
      <img
        :src="resource.pig || resource.pic || defaultImage"
        :alt="resource.name"
        @error="handleImageError"
      />
      <div class="card-overlay">
        <el-button type="primary" circle>
          <el-icon><View /></el-icon>
        </el-button>
      </div>
    </div>
    
    <div class="card-content">
      <h3 class="card-title" :title="resource.name">
        {{ resource.name }}
      </h3>
      
      <p class="card-description" :title="resource.content">
        {{ resource.content || '暂无描述' }}
      </p>
      
      <div class="card-footer">
        <div class="card-tags">
          <el-tag size="small" type="info">
            {{ getResourceType(resource.type || resource.typeId) }}
          </el-tag>
        </div>
        
        <div class="card-actions">
          <el-button 
            text 
            type="primary" 
            size="small"
            @click.stop="handleView"
          >
            <el-icon><View /></el-icon>
            查看
          </el-button>
          
          <el-button 
            text 
            type="success" 
            size="small"
            @click.stop="handleDownload"
            v-if="resource.url"
          >
            <el-icon><Download /></el-icon>
            访问
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { View, Download } from '@element-plus/icons-vue'
import { useResourceStore } from '@/stores/resource'
import { storeToRefs } from 'pinia'

const props = defineProps({
  resource: {
    type: Object,
    required: true
  }
})

const resourceStore = useResourceStore()
const { resourceTypes } = storeToRefs(resourceStore)

const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjNjY3ZWVhIDAlLCAjNzY0YmEyIDEwMCUpIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPuaXoOWbvueJhzwvdGV4dD4KPHN2Zz4K'

const getResourceType = (typeValue) => {
  if (!typeValue) return '未知类型'

  // 从API获取的resourceTypes菜单中根据resource.type匹配menu字段，返回对应的name
  if (resourceTypes.value && resourceTypes.value.length > 0) {
    // 根据resource.type查找对应的菜单项（匹配menu字段）
    const menuItem = resourceTypes.value.find(menu => menu.menu === typeValue)

    if (menuItem) {
      return menuItem.name
    }
  }

  // 如果在菜单中没有找到，使用本地映射作为后备
  const typeMap = {
    'study': '学习',
    'movie': '影视',
    'anime': '动漫',
    'comic': '漫画',
    'game': '游戏',
    'shortdrama': '短剧',
    'novel': '小说',
    'wallpaper': '壁纸'
  }

  return typeMap[typeValue] || typeValue || '未知类型'
}

const handleImageError = (event) => {
  event.target.src = defaultImage
}

const handleCardClick = () => {
  handleView()
}

const handleView = () => {
  // 这里可以打开详情弹窗或跳转到详情页
  console.log('查看资源:', props.resource)
}

const handleDownload = () => {
  if (props.resource.url) {
    window.open(props.resource.url, '_blank')
  }
}
</script>

<style scoped>
.resource-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.resource-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.resource-card:hover .card-image img {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.resource-card:hover .card-overlay {
  opacity: 1;
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 16px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.card-tags {
  flex: 1;
}

.card-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .card-image {
    height: 150px;
  }
  
  .card-content {
    padding: 16px;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .card-description {
    font-size: 0.85rem;
  }
}
</style>
