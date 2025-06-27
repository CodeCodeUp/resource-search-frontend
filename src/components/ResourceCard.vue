<template>
  <div class="resource-card-wrapper">
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
        <span v-html="highlightedName"></span>
      </h3>
      
      <p class="card-description" :title="resource.content">
        <span v-html="highlightedContent || '暂无描述'"></span>
      </p>
      
      <div class="card-footer">
        <div class="card-tags">
          <el-tag size="small" type="info">
            {{ getResourceType(resource.type || resource.typeId) }}
          </el-tag>
        </div>
        
        <div class="card-actions">
          <el-button
            link
            type="primary"
            size="small"
            @click.stop="handleView"
          >
            <el-icon><View /></el-icon>
            查看
          </el-button>
          
          <!-- <el-button
            link
            type="success"
            size="small"
            @click.stop="handleDownload"
            v-if="resource.url"
          >
            <el-icon><Download /></el-icon>
            访问
          </el-button> -->
        </div>
      </div>
    </div>
  </div>

  <!-- 滑动验证组件 -->
  <SlideVerify
    v-model:visible="verifyVisible"
    @success="handleVerifySuccess"
    @cancel="handleVerifyCancel"
  />

  <!-- 验证加载状态弹窗 -->
  <el-dialog
    v-model="isVerifying"
    title="正在验证"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    align-center
    class="verify-loading-dialog"
  >
    <div class="verify-loading-content">
      <div class="loading-animation">
        <el-icon class="rotating" size="48" color="#409EFF">
          <Loading />
        </el-icon>
      </div>
      <h3>正在验证资源访问权限</h3>
      <p>请稍候，正在为您获取资源链接...</p>
      <div class="loading-steps">
        <div class="step" :class="{ active: verifyStep >= 1, completed: verifyStep > 1 }">
          <el-icon><Check v-if="verifyStep > 1" /><Loading v-else-if="verifyStep === 1" class="rotating" /></el-icon>
          <span>验证滑块结果</span>
        </div>
        <div class="step" :class="{ active: verifyStep >= 2, completed: verifyStep > 2 }">
          <el-icon><Check v-if="verifyStep > 2" /><Loading v-else-if="verifyStep === 2" class="rotating" /></el-icon>
          <span>获取访问令牌</span>
        </div>
        <div class="step" :class="{ active: verifyStep >= 3, completed: verifyStep > 3 }">
          <el-icon><Check v-if="verifyStep > 3" /><Loading v-else-if="verifyStep === 3" class="rotating" /></el-icon>
          <span>获取资源链接</span>
        </div>
      </div>
    </div>
  </el-dialog>

  <!-- 精美的资源详情弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    :title="resource.name"
    width="500px"
    :before-close="handleDialogClose"
    class="resource-dialog"
    align-center
  >
    <div class="dialog-content">
      <!-- 资源信息 -->
      <div class="resource-info">
        <div class="resource-icon">
          <el-icon size="48" color="#409EFF">
            <Link />
          </el-icon>
        </div>

        <div class="resource-details">
          <h3 class="resource-title">
            <span v-html="highlightedName"></span>
          </h3>
          <p class="resource-description">
            <span v-html="highlightedContent || '暂无描述'"></span>
          </p>
          <div class="resource-meta">
            <el-tag size="small" type="info">
              {{ getResourceType(resource.type || resource.typeId) }}
            </el-tag>
            <span class="resource-time" v-if="resource.createTime">
              {{ formatTime(resource.createTime) }}
            </span>
          </div>
        </div>
      </div>

      <!-- URL 显示区域 -->
      <div class="url-section">
        <div class="url-label">
          <el-icon><Link /></el-icon>
          资源链接
        </div>

        <div class="url-container">
          <div class="url-display">
            <el-input
              v-model="resourceUrl"
              readonly
              placeholder="验证后可获取资源链接"
              class="url-input"
              :loading="isLoadingUrl"
            >
              <template #suffix>
                <el-button
                  type="primary"
                  size="small"
                  @click="copyUrl"
                  :disabled="!resourceUrl"
                  class="copy-btn"
                >
                  <el-icon>
                    <Check v-if="copySuccess" />
                    <DocumentCopy v-else />
                  </el-icon>
                  {{ copySuccess ? '已复制' : '复制' }}
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 温馨提示 -->
      <div class="warning-section">
        <el-alert
          title="温馨提示"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            <div class="warning-content">
              <p>• 资源链接随时可能失效，请及时保存</p>
              <p>• 可复制链接后在对应APP中打开</p>
            </div>
          </template>
        </el-alert>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="openUrl"
          :disabled="!resourceUrl"
        >
          <el-icon><TopRight /></el-icon>
          打开链接
        </el-button>
      </div>
    </template>
  </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { View, Link, DocumentCopy, Check, TopRight, Loading } from '@element-plus/icons-vue'
import { useResourceStore } from '@/stores/resource'
import { storeToRefs } from 'pinia'
import { highlightText } from '@/utils/highlight'
import { processImageUrl, generateDefaultImage } from '@/utils/image'
import { getImageFitMode, getImageInfo, imageConfig } from '@/config/image'
import SlideVerify from './SlideVerify.vue'
import { verifyApi, globalVerifySession, VerifyUtils } from '@/api/verify'
import { ElMessage } from 'element-plus'

const props = defineProps({
  resource: {
    type: Object,
    required: true
  }
})

const resourceStore = useResourceStore()
const { resourceTypes, searchWords } = storeToRefs(resourceStore)

// 图片加载状态
const imageLoading = ref(false)
const processedImageUrl = ref('')
const imageRef = ref(null)
const isPortraitImage = ref(false)
const useAutoFit = ref(false)

// 弹窗状态
const dialogVisible = ref(false)
const copySuccess = ref(false)

// 验证状态
const verifyVisible = ref(false)
const isVerifying = ref(false)
const verifyStep = ref(0) // 验证步骤：0-未开始，1-验证滑块，2-获取令牌，3-获取链接，4-完成
const verifyToken = ref('')
const resourceUrl = ref('')
const isLoadingUrl = ref(false)

// 高亮显示的文本
const highlightedName = computed(() => {
  return highlightText(props.resource.name || '', searchWords.value)
})

const highlightedContent = computed(() => {
  return highlightText(props.resource.content || '', searchWords.value)
})

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
  // 检查是否已经验证过该资源
  const resourceId = props.resource.id || props.resource._id

  if (globalVerifySession.isResourceVerified(resourceId)) {
    // 已验证，直接显示详情
    showResourceDetails()
  } else {
    // 未验证，显示滑动验证
    verifyVisible.value = true
  }
}

const showResourceDetails = async () => {
  dialogVisible.value = true
  copySuccess.value = false

  // 如果还没有资源URL，尝试获取
  if (!resourceUrl.value && verifyToken.value) {
    await loadResourceUrl()
  }
}

// 加载资源URL
const loadResourceUrl = async () => {
  try {
    isLoadingUrl.value = true
    const resourceId = props.resource.id || props.resource._id

    // 使用已有的验证令牌验证并获取资源URL
    const validateResult = await verifyApi.validateAccessToken(verifyToken.value)

    if (validateResult.success && validateResult.data.valid) {
      resourceUrl.value = validateResult.data.resourceData?.url
    } else {
      // 如果令牌无效，需要重新验证
      ElMessage.warning('访问令牌已过期，请重新验证')
      globalVerifySession.markResourceVerified(resourceId, false) // 标记为未验证
    }
  } catch (error) {
    console.error('获取资源URL失败:', error)
    ElMessage.error('获取资源链接失败')
  } finally {
    isLoadingUrl.value = false
  }
}

// 复制URL到剪贴板
const copyUrl = async () => {
  if (!resourceUrl.value) return

  try {
    await navigator.clipboard.writeText(resourceUrl.value)
    copySuccess.value = true

    // 2秒后重置状态
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    // 降级方案：使用传统方法复制
    fallbackCopy(resourceUrl.value)
  }
}

// 降级复制方案
const fallbackCopy = (text) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()

  try {
    document.execCommand('copy')
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('降级复制也失败:', error)
  }

  document.body.removeChild(textArea)
}

// 打开URL
const openUrl = () => {
  if (resourceUrl.value) {
    window.open(resourceUrl.value, '_blank')
  }
}

// 验证成功处理
const handleVerifySuccess = async (verifyData) => {
  try {
    isVerifying.value = true
    verifyStep.value = 1 // 开始验证滑块结果
    const resourceId = props.resource.id || props.resource._id

    console.log('ResourceCard - 接收到滑动验证数据:', verifyData)

    // 1. 调用后端验证滑动结果
    const verifyResult = await verifyApi.verifySlide({
      ...verifyData,
      resourceId: resourceId
    })

    if (verifyResult.success && verifyResult.data.verified) {
      console.log('ResourceCard - 后端验证成功:', verifyResult.data)
      verifyStep.value = 2 // 开始获取访问令牌

      // 2. 使用验证令牌和会话ID获取资源URL
      const accessResult = await verifyApi.getAccessToken({
        resourceId: resourceId,
        verifyToken: verifyResult.data.accessToken,
        sessionId: verifyResult.data.sessionId
      })

      if (accessResult.success) {
        verifyStep.value = 3 // 开始获取资源链接

        // 3. 验证访问令牌并获取最终资源URL
        const validateResult = await verifyApi.validateAccessToken(accessResult.data.accessToken)

        if (validateResult.success && validateResult.data.valid) {
          verifyStep.value = 4 // 验证完成

          // 标记资源已验证
          globalVerifySession.markResourceVerified(resourceId)
          verifyToken.value = accessResult.data.accessToken
          resourceUrl.value = validateResult.data.resourceData?.url || accessResult.data.resourceUrl

          // 短暂延迟后显示资源详情，让用户看到完成状态
          setTimeout(() => {
            showResourceDetails()
            ElMessage.success('验证成功！')
          }, 800)
        } else {
          ElMessage.error('资源访问验证失败')
        }
      } else {
        ElMessage.error('获取资源访问权限失败')
      }
    } else {
      ElMessage.error('滑动验证失败，请重试')
    }
  } catch (error) {
    console.error('验证失败:', error)
    ElMessage.error('验证失败，请重试')
  } finally {
    // 延迟关闭加载状态，确保用户能看到完成状态
    setTimeout(() => {
      isVerifying.value = false
      verifyStep.value = 0
    }, verifyStep.value === 4 ? 1000 : 500)
  }
}

// 验证取消处理
const handleVerifyCancel = () => {
  verifyVisible.value = false
}

// 关闭弹窗
const handleDialogClose = () => {
  dialogVisible.value = false
  copySuccess.value = false
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''

  try {
    const date = new Date(timeStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return timeStr
  }
}
</script>

<style scoped>
.resource-card-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

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

/* 高亮样式 */
:deep(.highlight) {
  background: linear-gradient(120deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  padding: 1px 3px;
  border-radius: 3px;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(255, 215, 0, 0.3);
  transition: all 0.2s ease;
}

:deep(.highlight:hover) {
  background: linear-gradient(120deg, #ffed4e 0%, #ffd700 100%);
  transform: scale(1.02);
}

/* 弹窗样式 */
:deep(.resource-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.resource-dialog .el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  margin: 0;
}

:deep(.resource-dialog .el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
}

:deep(.resource-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 18px;
}

:deep(.resource-dialog .el-dialog__body) {
  padding: 0;
}

.dialog-content {
  padding: 24px;
}

.resource-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  border-radius: 12px;
  border: 1px solid #e8eaff;
}

.resource-icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.resource-details {
  flex: 1;
  min-width: 0;
}

.resource-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.resource-description {
  color: #5a6c7d;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.resource-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.resource-time {
  color: #8492a6;
  font-size: 0.8rem;
}

.url-section {
  margin-bottom: 24px;
}

.url-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.url-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.url-display {
  position: relative;
}

:deep(.url-input .el-input__wrapper) {
  background: white;
  border-radius: 6px;
  border: 1px solid #d0d7de;
  padding-right: 90px;
}

:deep(.url-input .el-input__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  color: #24292f;
}

.copy-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  border-radius: 4px;
  font-size: 0.8rem;
  height: 28px;
  padding: 0 12px;
}

.warning-section {
  margin-bottom: 8px;
}

:deep(.warning-section .el-alert) {
  border-radius: 8px;
  border: 1px solid #fcd34d;
  background: #fffbeb;
}

:deep(.warning-section .el-alert__title) {
  color: #92400e;
  font-weight: 600;
  margin-bottom: 8px;
}

.warning-content {
  color: #92400e;
  font-size: 0.85rem;
  line-height: 1.5;
}

.warning-content p {
  margin: 4px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  margin: 0 -24px -24px -24px;
}

@media (max-width: 768px) {
  .card-content {
    padding: 16px;
  }

  .card-title {
    font-size: 1rem;
  }

  .card-description {
    font-size: 0.85rem;
  }

  :deep(.resource-dialog) {
    width: 95% !important;
    margin: 0 auto;
  }

  .resource-info {
    flex-direction: column;
    text-align: center;
  }

  .resource-icon {
    align-self: center;
  }

  .dialog-content {
    padding: 16px;
  }

  .dialog-footer {
    flex-direction: column;
    gap: 8px;
  }

  .dialog-footer .el-button {
    width: 100%;
  }
}

/* 验证加载弹窗样式 */
:deep(.verify-loading-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.verify-loading-dialog .el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  margin: 0;
}

:deep(.verify-loading-dialog .el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
}

:deep(.verify-loading-dialog .el-dialog__body) {
  padding: 32px 24px;
}

.verify-loading-content {
  text-align: center;
}

.loading-animation {
  margin-bottom: 24px;
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.verify-loading-content h3 {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.verify-loading-content p {
  color: #666;
  font-size: 1rem;
  margin: 0 0 32px 0;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
  max-width: 280px;
  margin: 0 auto;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.step.active {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #1976d2;
}

.step.completed {
  background: #e8f5e8;
  border-color: #4caf50;
  color: #2e7d32;
}

.step .el-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.step.active .el-icon {
  color: #2196f3;
}

.step.completed .el-icon {
  color: #4caf50;
}

.step span {
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
