<template>
  <div class="resource-card" @click="handleCardClick">
    <div class="card-image">
      <img
        ref="imageRef"
        :src="processedImageUrl"
        :alt="resource.name"
        @error="handleImageError"
        @load="handleImageLoad"
        :class="{
          'image-loading': imageLoading,
          'portrait-image': isPortraitImage,
          'auto-fit': useAutoFit
        }"
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
import { ref, onMounted } from 'vue'
import { View, Download } from '@element-plus/icons-vue'
import { useResourceStore } from '@/stores/resource'
import { storeToRefs } from 'pinia'
import { processImageUrl, generateDefaultImage } from '@/utils/image'
import { getImageFitMode, getImageInfo, imageConfig } from '@/config/image'

const props = defineProps({
  resource: {
    type: Object,
    required: true
  }
})

const resourceStore = useResourceStore()
const { resourceTypes } = storeToRefs(resourceStore)

// 图片加载状态
const imageLoading = ref(false)
const processedImageUrl = ref('')
const imageRef = ref(null)
const isPortraitImage = ref(false)
const useAutoFit = ref(false)

// 默认图片
const defaultImage = generateDefaultImage('无图片')

// 处理图片URL
const processImage = () => {
  const originalUrl = props.resource.pig || props.resource.pic
  if (!originalUrl) {
    processedImageUrl.value = defaultImage
    return
  }

  // 开始加载图片
  imageLoading.value = true
  isPortraitImage.value = false
  useAutoFit.value = false

  // 使用图片处理工具
  processedImageUrl.value = processImageUrl(originalUrl)
}

// 组件挂载时处理图片
onMounted(() => {
  processImage()
})

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

// 图片加载完成处理
const handleImageLoad = (event) => {
  const img = event.target
  const imageInfo = getImageInfo(img)
  const fitResult = getImageFitMode(imageInfo.aspectRatio)

  // 应用适配结果
  isPortraitImage.value = fitResult.isPortrait
  useAutoFit.value = fitResult.isAutoFit

  imageLoading.value = false

  // 开发模式下显示详细信息
  if (imageConfig.showFitInfo) {
    console.log(`图片适配信息:`, {
      尺寸: `${imageInfo.width}x${imageInfo.height}`,
      宽高比: imageInfo.aspectRatio.toFixed(2),
      方向: imageInfo.orientation,
      适配模式: fitResult.info,
      objectFit: fitResult.objectFit
    })
  }
}

const handleImageError = (event) => {
  console.warn('图片加载失败:', processedImageUrl.value)
  event.target.src = generateDefaultImage('加载失败')
  imageLoading.value = false
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
  max-height: 300px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

/* 适配竖屏图片 - 当图片比例过高时使用contain模式 */
.card-image img.portrait-image {
  object-fit: contain;
  background-color: #f5f5f5;
}

/* 智能适配 - 根据图片宽高比自动调整 */
.card-image img.auto-fit {
  object-fit: contain;
  background-color: #f8f9fa;
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

.image-loading {
  opacity: 0.7;
  transition: opacity 0.3s ease;
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
    height: 120px;
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
