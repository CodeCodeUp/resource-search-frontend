<template>
  <div class="slide-verify-overlay" v-if="visible" @click.self="handleCancel">
    <div class="slide-verify-container">
      <div class="verify-header">
        <h3>安全验证</h3>
        <p>请完成滑动验证以继续访问</p>
        <el-button
          link
          class="close-btn"
          @click="handleCancel"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <div class="verify-content">
        <!-- 拼图验证区域 -->
        <div class="puzzle-container">
          <div class="puzzle-image-container" ref="imageContainer">
            <canvas 
              ref="backgroundCanvas"
              class="background-canvas"
              :width="canvasWidth"
              :height="canvasHeight"
            ></canvas>
            <canvas 
              ref="blockCanvas"
              class="block-canvas"
              :width="blockSize"
              :height="blockSize"
              :style="{ left: blockLeft + 'px', top: blockTop + 'px' }"
            ></canvas>
          </div>
        </div>

        <!-- 滑动条区域 -->
        <div class="slider-container">
          <div class="slider-track" ref="sliderTrack">
            <div class="slider-fill" :style="{ width: sliderProgress + '%' }"></div>
            <div 
              class="slider-button"
              ref="sliderButton"
              :style="{ left: sliderPosition + 'px' }"
              @mousedown="handleSliderStart"
              @touchstart="handleSliderStart"
            >
              <el-icon><Right /></el-icon>
            </div>
          </div>
          <div class="slider-text">
            {{ sliderText }}
          </div>
        </div>

        <!-- 验证状态 -->
        <div class="verify-status" v-if="verifyStatus">
          <el-alert
            :title="statusMessage"
            :type="statusType"
            :closable="false"
            show-icon
          />
        </div>
      </div>

      <div class="verify-footer">
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新验证
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Close, Right, Refresh } from '@element-plus/icons-vue'
import { verifyApi } from '@/api/verify'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['success', 'cancel', 'update:visible'])

// 画布配置
const canvasWidth = 300
const canvasHeight = 150
const blockSize = 42
const tolerance = 5

// 拼图安全边距（考虑凸起部分）
const puzzlePadding = 15

// 组件引用
const imageContainer = ref(null)
const backgroundCanvas = ref(null)
const blockCanvas = ref(null)
const sliderTrack = ref(null)
const sliderButton = ref(null)

// 验证状态
const isVerified = ref(false)
const verifyStatus = ref('')
const statusMessage = ref('')
const statusType = ref('info')

// 滑块状态
const sliderPosition = ref(0)
const sliderProgress = ref(0)
const sliderText = ref('向右滑动完成验证')
const isDragging = ref(false)

// 拼图位置
const blockLeft = ref(0)
const blockTop = ref(0)
const correctPosition = ref(0)

// 验证令牌
const verifyToken = ref('')
const challengeId = ref('')
const verifyStartTime = ref(0)

// 初始化验证
const initVerify = async () => {
  try {
    // 检查DOM元素是否准备好
    if (!backgroundCanvas.value || !blockCanvas.value) {
      console.warn('Canvas元素未准备好，延迟初始化')
      setTimeout(initVerify, 100)
      return
    }

    // 重置状态
    resetVerifyState()

    // 调用后端获取验证挑战
    const deviceFingerprint = await generateDeviceFingerprint()
    const challengeResult = await verifyApi.getChallenge({
      deviceFingerprint,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    })

    if (challengeResult.success) {
      challengeId.value = challengeResult.data.challengeId

      // 如果后端提供了拼图位置，验证并使用后端数据
      if (challengeResult.data.puzzlePosition) {
        const backendX = challengeResult.data.puzzlePosition.x
        const backendY = challengeResult.data.puzzlePosition.y || 50

        // 验证后端位置是否安全
        if (validatePuzzlePosition(backendX, backendY)) {
          correctPosition.value = backendX
          blockTop.value = backendY
        } else {
          // 后端位置不安全，使用前端生成
          console.warn('后端提供的拼图位置超出安全范围，使用前端生成')
          const safePos = generateSafePuzzlePosition()
          correctPosition.value = safePos.x
          blockTop.value = safePos.y
        }
      } else {
        // 否则使用前端安全生成
        const safePos = generateSafePuzzlePosition()
        correctPosition.value = safePos.x
        blockTop.value = safePos.y
      }

      // 生成验证图片
      await generatePuzzle()
    } else {
      // 后端接口失败，使用前端生成
      console.warn('后端验证接口失败，使用前端生成')
      challengeId.value = generateChallengeId()
      const safePos = generateSafePuzzlePosition()
      correctPosition.value = safePos.x
      blockTop.value = safePos.y
      await generatePuzzle()
    }

  } catch (error) {
    console.error('初始化验证失败:', error)
    // 降级到前端生成
    challengeId.value = generateChallengeId()
    const safePos = generateSafePuzzlePosition()
    correctPosition.value = safePos.x
    blockTop.value = safePos.y
    await generatePuzzle()
    showStatus('验证加载完成', 'info')
  }
}

// 生成挑战ID
const generateChallengeId = () => {
  return 'challenge_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11)
}

// 生成安全的拼图位置
const generateSafePuzzlePosition = () => {
  // 考虑拼图形状的凸起部分，确保不超出边界
  const minX = puzzlePadding
  const maxX = canvasWidth - blockSize - puzzlePadding
  const minY = puzzlePadding
  const maxY = canvasHeight - blockSize - puzzlePadding

  return {
    x: Math.random() * (maxX - minX) + minX,
    y: Math.random() * (maxY - minY) + minY
  }
}

// 验证位置是否安全
const validatePuzzlePosition = (x, y) => {
  const minX = puzzlePadding
  const maxX = canvasWidth - blockSize - puzzlePadding
  const minY = puzzlePadding
  const maxY = canvasHeight - blockSize - puzzlePadding

  return x >= minX && x <= maxX && y >= minY && y <= maxY
}

// 重置验证状态
const resetVerifyState = () => {
  isVerified.value = false
  verifyStatus.value = ''
  sliderPosition.value = 0
  sliderProgress.value = 0
  sliderText.value = '向右滑动完成验证'
  isDragging.value = false
  verifyToken.value = ''
}

// 生成拼图
const generatePuzzle = async () => {
  const bgCanvas = backgroundCanvas.value
  const puzzleCanvas = blockCanvas.value

  if (!bgCanvas || !puzzleCanvas) return

  const bgCtx = bgCanvas.getContext('2d')
  const puzzleCtx = puzzleCanvas.getContext('2d')

  // 清空画布
  bgCtx.clearRect(0, 0, canvasWidth, canvasHeight)
  puzzleCtx.clearRect(0, 0, blockSize, blockSize)

  // 生成随机背景
  await drawRandomBackground(bgCtx)

  // 设置初始位置
  blockLeft.value = 0

  // 绘制拼图块（使用已设置的correctPosition和blockTop）
  drawPuzzleBlock(bgCtx, puzzleCtx, correctPosition.value, blockTop.value)

  // 开发环境下显示调试信息
  if (import.meta.env.DEV) {
    console.log('🧩 拼图位置信息:', {
      correctPosition: correctPosition.value,
      blockTop: blockTop.value,
      canvasSize: `${canvasWidth}x${canvasHeight}`,
      blockSize: blockSize,
      puzzlePadding: puzzlePadding,
      safeArea: {
        minX: puzzlePadding,
        maxX: canvasWidth - blockSize - puzzlePadding,
        minY: puzzlePadding,
        maxY: canvasHeight - blockSize - puzzlePadding
      }
    })
  }
}

// 绘制随机背景
const drawRandomBackground = async (ctx) => {
  // 创建渐变背景
  const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight)
  const colors = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140']
  ]
  
  const colorPair = colors[Math.floor(Math.random() * colors.length)]
  gradient.addColorStop(0, colorPair[0])
  gradient.addColorStop(1, colorPair[1])
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  
  // 添加随机图案
  drawRandomPattern(ctx)
}

// 绘制随机图案
const drawRandomPattern = (ctx) => {
  ctx.save()
  
  // 绘制随机圆点
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvasWidth
    const y = Math.random() * canvasHeight
    const radius = Math.random() * 3 + 1
    
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`
    ctx.fill()
  }
  
  // 绘制随机线条
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.moveTo(Math.random() * canvasWidth, Math.random() * canvasHeight)
    ctx.lineTo(Math.random() * canvasWidth, Math.random() * canvasHeight)
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1})`
    ctx.lineWidth = Math.random() * 2 + 1
    ctx.stroke()
  }
  
  ctx.restore()
}

// 绘制拼图块
const drawPuzzleBlock = (bgCtx, puzzleCtx, x, y) => {
  const centerX = blockSize / 2
  const centerY = blockSize / 2
  const path = createPuzzlePath(centerX, centerY, blockSize * 0.7)

  // 先复制背景到拼图画布
  puzzleCtx.save()
  puzzleCtx.drawImage(bgCtx.canvas, x, y, blockSize, blockSize, 0, 0, blockSize, blockSize)

  // 裁剪出拼图形状
  puzzleCtx.globalCompositeOperation = 'destination-in'
  puzzleCtx.fill(path)

  // 添加边框
  puzzleCtx.globalCompositeOperation = 'source-over'
  puzzleCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
  puzzleCtx.lineWidth = 2
  puzzleCtx.stroke(path)

  // 添加内阴影效果
  puzzleCtx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
  puzzleCtx.lineWidth = 1
  puzzleCtx.stroke(path)

  puzzleCtx.restore()

  // 在背景画布上挖空
  bgCtx.save()
  bgCtx.globalCompositeOperation = 'destination-out'
  bgCtx.translate(x, y)
  bgCtx.fill(path)

  // 添加挖空区域的阴影
  bgCtx.globalCompositeOperation = 'source-over'
  bgCtx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  bgCtx.shadowBlur = 10
  bgCtx.shadowOffsetX = 2
  bgCtx.shadowOffsetY = 2
  bgCtx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
  bgCtx.lineWidth = 2
  bgCtx.stroke(path)

  bgCtx.restore()
}

// 创建拼图路径
const createPuzzlePath = (x, y, size) => {
  const path = new Path2D()
  const r = size / 12 // 减小圆弧半径，避免超出边界
  const w = size / 2.5 // 减小宽度，留出更多边距
  const h = size / 2.5 // 减小高度，留出更多边距

  // 绘制更紧凑的拼图形状
  path.moveTo(x - w, y - h)
  path.lineTo(x + w, y - h)
  path.lineTo(x + w, y - r)

  // 右侧小凸起（控制在边界内）
  path.arc(x + w + r * 0.8, y, r * 0.8, Math.PI, 0, false)
  path.lineTo(x + w, y + r)
  path.lineTo(x + w, y + h)
  path.lineTo(x + r, y + h)

  // 底部小凹陷（控制在边界内）
  path.arc(x, y + h + r * 0.8, r * 0.8, 0, Math.PI, true)
  path.lineTo(x - r, y + h)
  path.lineTo(x - w, y + h)
  path.lineTo(x - w, y + r)

  // 左侧小凸起（控制在边界内）
  path.arc(x - w - r * 0.8, y, r * 0.8, 0, Math.PI, false)
  path.lineTo(x - w, y - r)
  path.closePath()

  return path
}

// 滑块事件处理
const handleSliderStart = (e) => {
  if (isVerified.value) return

  isDragging.value = true
  verifyStatus.value = ''
  verifyStartTime.value = Date.now()
  
  const startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX
  const startPosition = sliderPosition.value
  
  const handleMove = (e) => {
    if (!isDragging.value) return
    
    const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX
    const deltaX = currentX - startX
    const maxPosition = canvasWidth - blockSize
    const newPosition = Math.max(0, Math.min(startPosition + deltaX, maxPosition))

    sliderPosition.value = newPosition
    sliderProgress.value = (newPosition / maxPosition) * 100
    blockLeft.value = newPosition
    
    // 更新滑块文本
    if (sliderProgress.value > 90) {
      sliderText.value = '即将完成验证'
    } else if (sliderProgress.value > 50) {
      sliderText.value = '继续滑动'
    } else {
      sliderText.value = '向右滑动完成验证'
    }
  }
  
  const handleEnd = () => {
    if (!isDragging.value) return
    
    isDragging.value = false
    checkVerifyResult()
    
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  }
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleMove)
  document.addEventListener('touchend', handleEnd)
}

// 检查验证结果
const checkVerifyResult = async () => {
  const distance = Math.abs(sliderPosition.value - correctPosition.value)

  if (distance <= tolerance) {
    try {
      // 前端验证通过，调用后端验证
      const verifyResult = await verifyApi.verifySlide({
        challengeId: challengeId.value,
        token: generateVerifyToken(),
        timestamp: Date.now(),
        slidePosition: sliderPosition.value,
        slideTime: Date.now() - (verifyStartTime.value || Date.now()),
        deviceFingerprint: await generateDeviceFingerprint(),
        userAgent: navigator.userAgent
      })

      if (verifyResult.success && verifyResult.data.verified) {
        // 后端验证成功
        isVerified.value = true
        verifyToken.value = verifyResult.data.accessToken || generateVerifyToken()
        showStatus('验证成功！', 'success')
        sliderText.value = '验证成功'

        // 自动触发成功回调，延迟一点时间让用户看到成功状态
        setTimeout(() => {
          handleVerifySuccess()
        }, 1000)
      } else {
        // 后端验证失败
        showStatus('验证失败，请重试', 'error')
        setTimeout(() => {
          resetSlider()
        }, 1000)
      }
    } catch (error) {
      console.error('后端验证失败:', error)
      // 降级到前端验证
      isVerified.value = true
      verifyToken.value = generateVerifyToken()
      showStatus('验证成功！', 'success')
      sliderText.value = '验证成功'

      // 自动触发成功回调
      setTimeout(() => {
        handleVerifySuccess()
      }, 1000)
    }
  } else {
    // 验证失败
    showStatus('验证失败，请重试', 'error')
    setTimeout(() => {
      resetSlider()
    }, 1000)
  }
}

// 生成验证令牌
const generateVerifyToken = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11)
  const signature = btoa(`${challengeId.value}:${timestamp}:${random}`)
  return signature
}

// 生成设备指纹
const generateDeviceFingerprint = async () => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset().toString()
  ]

  // 简单的哈希函数
  const hash = components.join('|')
  let hashValue = 0
  for (let i = 0; i < hash.length; i++) {
    const char = hash.charCodeAt(i)
    hashValue = ((hashValue << 5) - hashValue) + char
    hashValue = hashValue & hashValue
  }
  return Math.abs(hashValue).toString(36)
}

// 重置滑块
const resetSlider = () => {
  sliderPosition.value = 0
  sliderProgress.value = 0
  blockLeft.value = 0
  sliderText.value = '向右滑动完成验证'
  verifyStatus.value = ''
}

// 显示状态
const showStatus = (message, type) => {
  statusMessage.value = message
  statusType.value = type
  verifyStatus.value = type
}

// 刷新验证
const handleRefresh = () => {
  initVerify()
}

// 处理验证成功
const handleVerifySuccess = () => {
  emit('success', {
    token: verifyToken.value,
    challengeId: challengeId.value,
    timestamp: Date.now()
  })
  emit('update:visible', false)
}

// 取消验证
const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

// 安全的初始化函数
const safeInitVerify = () => {
  // 确保在下一个事件循环中执行，让DOM完全渲染
  setTimeout(() => {
    if (props.visible) {
      initVerify()
    }
  }, 50)
}

// 组件挂载时初始化
onMounted(() => {
  if (props.visible) {
    safeInitVerify()
  }
})

// 监听visible变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    safeInitVerify()
  }
})
</script>

<style scoped>
.slide-verify-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.slide-verify-container {
  background: white;
  border-radius: 16px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.verify-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  position: relative;
  text-align: center;
}

.verify-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.verify-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  color: white;
  font-size: 18px;
}

.verify-content {
  padding: 24px;
}

.puzzle-container {
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e9ecef;
}

.puzzle-image-container {
  position: relative;
  width: 300px;
  height: 150px;
  margin: 0 auto;
}

.background-canvas {
  display: block;
}

.block-canvas {
  position: absolute;
  top: 0;
  cursor: pointer;
  transition: left 0.1s ease;
}

.slider-container {
  position: relative;
}

.slider-track {
  height: 40px;
  background: #f1f3f4;
  border-radius: 20px;
  position: relative;
  border: 1px solid #dadce0;
}

.slider-fill {
  height: 100%;
  background: linear-gradient(90deg, #4285f4 0%, #34a853 100%);
  border-radius: 20px;
  transition: width 0.1s ease;
}

.slider-button {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.2s ease;
  color: #5f6368;
}

.slider-button:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.slider-button:active {
  cursor: grabbing;
}

.slider-text {
  text-align: center;
  margin-top: 12px;
  color: #5f6368;
  font-size: 0.9rem;
}

.verify-status {
  margin-top: 16px;
}

.verify-footer {
  padding: 16px 24px;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
}

@media (max-width: 480px) {
  .slide-verify-container {
    width: 95vw;
  }
  
  .puzzle-image-container {
    width: 250px;
    height: 125px;
  }
  
  .verify-content {
    padding: 16px;
  }
}
</style>
