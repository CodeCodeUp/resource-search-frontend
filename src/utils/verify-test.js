// 验证API测试工具
import { verifyApi } from '@/api/verify'

/**
 * 测试验证API接口
 */
export const testVerifyApi = async () => {
  console.log('🧪 开始测试验证API...')

  try {
    // 1. 测试获取验证挑战
    console.log('📋 测试获取验证挑战...')
    const challengeParams = {
      deviceFingerprint: 'test_device_fp_' + Date.now(),
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    }
    
    const challengeResult = await verifyApi.getChallenge(challengeParams)
    console.log('✅ 验证挑战结果:', challengeResult)
    
    if (challengeResult.success) {
      const challengeData = challengeResult.data
      console.log('📊 挑战数据验证:')
      console.log('  - challengeId:', challengeData.challengeId)
      console.log('  - puzzlePosition:', challengeData.puzzlePosition)
      console.log('  - tolerance:', challengeData.tolerance)
      console.log('  - expiresAt:', new Date(challengeData.expiresAt))

      // 2. 测试验证滑动结果
      console.log('🔍 测试验证滑动结果...')
      const verifyParams = {
        challengeId: challengeData.challengeId,
        token: 'test_token_' + Date.now(),
        timestamp: Date.now(),
        slidePosition: challengeData.puzzlePosition?.x || 150,
        slideTime: 1500, // 1.5秒
        deviceFingerprint: challengeParams.deviceFingerprint,
        userAgent: navigator.userAgent
      }
      
      const verifyResult = await verifyApi.verifySlide(verifyParams)
      console.log('✅ 验证结果:', verifyResult)
      
      if (verifyResult.success) {
        console.log('📊 验证结果数据:')
        console.log('  - verified:', verifyResult.data.verified)
        console.log('  - accessToken:', verifyResult.data.accessToken)
        console.log('  - sessionId:', verifyResult.data.sessionId)
        console.log('  - expiresAt:', new Date(verifyResult.data.expiresAt))
      }

      // 3. 测试获取访问令牌
      if (verifyResult.success && verifyResult.data.verified) {
        console.log('🔑 测试获取访问令牌...')
        const accessResult = await verifyApi.getAccessToken({
          resourceId: 'test_resource_123',
          verifyToken: verifyResult.data.accessToken
        })
        console.log('✅ 访问令牌结果:', accessResult)
      }

      // 4. 测试验证访问令牌
      console.log('🔐 测试验证访问令牌...')
      const validateResult = await verifyApi.validateAccessToken('test_token_123')
      console.log('✅ 令牌验证结果:', validateResult)
    }

    console.log('🎉 验证API测试完成!')
    return true

  } catch (error) {
    console.error('❌ 验证API测试失败:', error)
    return false
  }
}

/**
 * 测试设备指纹生成
 */
export const testDeviceFingerprint = () => {
  console.log('🔍 测试设备指纹生成...')
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset().toString()
  ]
  
  console.log('📊 设备指纹组件:')
  console.log('  - userAgent:', navigator.userAgent)
  console.log('  - language:', navigator.language)
  console.log('  - screen:', screen.width + 'x' + screen.height)
  console.log('  - timezone:', new Date().getTimezoneOffset())
  
  // 生成指纹
  const hash = components.join('|')
  let hashValue = 0
  for (let i = 0; i < hash.length; i++) {
    const char = hash.charCodeAt(i)
    hashValue = ((hashValue << 5) - hashValue) + char
    hashValue = hashValue & hashValue
  }
  const fingerprint = Math.abs(hashValue).toString(36)
  
  console.log('✅ 生成的设备指纹:', fingerprint)
  return fingerprint
}

/**
 * 测试验证令牌生成
 */
export const testTokenGeneration = () => {
  console.log('🔑 测试验证令牌生成...')
  
  const challengeId = 'test_challenge_' + Date.now()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11)
  const signature = btoa(`${challengeId}:${timestamp}:${random}`)
  
  console.log('📊 令牌组件:')
  console.log('  - challengeId:', challengeId)
  console.log('  - timestamp:', timestamp)
  console.log('  - random:', random)
  console.log('  - signature:', signature)
  
  return signature
}

// 开发环境下自动运行测试
if (import.meta.env.DEV) {
  // 延迟执行，确保页面加载完成
  setTimeout(() => {
    console.log('🚀 自动运行验证API测试...')
    testDeviceFingerprint()
    testTokenGeneration()
    // testVerifyApi() // 可以手动调用
  }, 2000)
}
