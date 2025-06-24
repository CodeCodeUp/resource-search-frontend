<template>
  <div class="verify-test">
    <div class="container">
      <h1>滑动验证测试页面</h1>
      
      <div class="test-section">
        <h2>测试滑动验证组件</h2>
        <div class="button-group">
          <el-button type="primary" @click="showVerify">
            显示滑动验证
          </el-button>
          <el-button type="success" @click="testVerifyApiHandler">
            测试验证API
          </el-button>
        </div>

        <div class="test-results" v-if="verifyResult">
          <h3>验证结果：</h3>
          <pre>{{ JSON.stringify(verifyResult, null, 2) }}</pre>
        </div>
      </div>

      <div class="test-section">
        <h2>测试ResourceCard验证</h2>
        <div class="card-grid">
          <ResourceCard 
            v-for="resource in testResources" 
            :key="resource.id"
            :resource="resource"
          />
        </div>
      </div>
    </div>

    <!-- 滑动验证组件 -->
    <SlideVerify
      v-model:visible="verifyVisible"
      @success="handleVerifySuccess"
      @cancel="handleVerifyCancel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SlideVerify from '@/components/SlideVerify.vue'
import ResourceCard from '@/components/ResourceCard.vue'
import { testVerifyApi } from '@/utils/verify-test'

// 验证状态
const verifyVisible = ref(false)
const verifyResult = ref(null)

// 测试资源数据
const testResources = ref([
  {
    id: 'test1',
    name: '测试资源1 - Vue3学习资料',
    content: '这是一个用于测试滑动验证的Vue3学习资源',
    url: 'https://vuejs.org',
    type: 'study',
    pic: 'https://picsum.photos/300/200?random=1'
  },
  {
    id: 'test2',
    name: '测试资源2 - React教程',
    content: '这是一个用于测试滑动验证的React教程资源',
    url: 'https://reactjs.org',
    type: 'study',
    pic: 'https://picsum.photos/300/200?random=2'
  }
])

// 显示验证
const showVerify = () => {
  verifyVisible.value = true
  verifyResult.value = null
}

// 验证成功
const handleVerifySuccess = (result) => {
  verifyResult.value = result
  console.log('验证成功:', result)
}

// 验证取消
const handleVerifyCancel = () => {
  console.log('验证取消')
}

// 测试验证API
const testVerifyApiHandler = async () => {
  console.log('开始测试验证API...')
  const result = await testVerifyApi()
  if (result) {
    console.log('验证API测试成功')
  } else {
    console.log('验证API测试失败')
  }
}
</script>

<style scoped>
.verify-test {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 40px;
}

.test-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.test-section h2 {
  color: #34495e;
  margin-bottom: 20px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.test-results {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.test-results h3 {
  color: #28a745;
  margin-bottom: 10px;
}

.test-results pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.9rem;
  line-height: 1.5;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .test-section {
    padding: 20px;
  }
  
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
