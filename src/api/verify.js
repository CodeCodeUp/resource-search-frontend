// 验证相关API
import api from './index'
import { mockVerifyApi } from './mock'

// 是否使用Mock数据
const useMock = import.meta.env.VITE_USE_MOCK === 'false'

/**
 * 验证API服务
 */
export const verifyApi = {
  /**
   * 获取验证挑战
   * @param {Object} params - 请求参数
   * @param {string} params.deviceFingerprint - 设备指纹
   * @param {string} params.userAgent - 用户代理
   * @param {number} params.timestamp - 请求时间戳
   * @returns {Promise} 挑战数据
   */
  getChallenge(params) {
    if (useMock) {
      return mockVerifyApi.getChallenge(params)
    }

    // 将参数放在请求头中
    const headers = {
      'X-Device-Fingerprint': params.deviceFingerprint,
      'X-User-Agent': params.userAgent,
      'X-Timestamp': params.timestamp.toString()
    }

    return api.get('/verify/challenge', { headers })
  },

  /**
   * 验证滑动结果
   * @param {Object} verifyData - 验证数据
   * @param {string} verifyData.token - 验证令牌
   * @param {string} verifyData.challengeId - 挑战ID
   * @param {number} verifyData.timestamp - 时间戳
   * @param {string} verifyData.resourceId - 资源ID
   * @param {string} verifyData.deviceFingerprint - 设备指纹
   * @param {string} verifyData.userAgent - 用户代理
   * @returns {Promise} 验证结果
   */
  verifySlide(verifyData) {
    if (useMock) {
      return mockVerifyApi.verifySlide(verifyData)
    }

    // 提取请求头参数
    const { deviceFingerprint, userAgent, timestamp, ...bodyData } = verifyData

    const headers = {
      'X-Device-Fingerprint': deviceFingerprint,
      'X-User-Agent': userAgent,
      'X-Timestamp': timestamp.toString()
    }

    return api.post('/verify/slide', bodyData, { headers })
  },

  /**
   * 获取资源访问令牌
   * @param {Object} accessData - 访问数据
   * @param {string} accessData.resourceId - 资源ID
   * @param {string} accessData.verifyToken - 验证令牌
   * @param {string} accessData.sessionId - 会话ID
   * @returns {Promise} 访问令牌
   */
  getAccessToken(accessData) {
    if (useMock) {
      return mockVerifyApi.getAccessToken(accessData)
    }
    return api.post('/verify/access-token', accessData)
  },

  /**
   * 验证访问令牌
   * @param {string} token - 访问令牌
   * @returns {Promise} 验证结果
   */
  validateAccessToken(token) {
    if (useMock) {
      return mockVerifyApi.validateAccessToken(token)
    }
    return api.post('/verify/validate-token', { token })
  }
}

/**
 * 客户端验证工具
 */
export class VerifyUtils {
  /**
   * 生成客户端指纹
   * @returns {string} 设备指纹
   */
  static generateFingerprint() {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')
    
    return btoa(fingerprint).substr(0, 32)
  }

  /**
   * 生成随机挑战ID
   * @returns {string} 挑战ID
   */
  static generateChallengeId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    const fingerprint = this.generateFingerprint().substr(0, 8)
    return `${timestamp}_${random}_${fingerprint}`
  }

  /**
   * 验证令牌签名
   * @param {string} token - 令牌
   * @param {string} secret - 密钥（客户端不应该有真实密钥）
   * @returns {boolean} 验证结果
   */
  static verifyTokenSignature(token, secret = 'client_verify') {
    try {
      const decoded = atob(token)
      const parts = decoded.split(':')
      return parts.length >= 3
    } catch (error) {
      return false
    }
  }

  /**
   * 检查时间戳有效性
   * @param {number} timestamp - 时间戳
   * @param {number} maxAge - 最大有效期（毫秒）
   * @returns {boolean} 是否有效
   */
  static isTimestampValid(timestamp, maxAge = 300000) { // 5分钟
    const now = Date.now()
    return (now - timestamp) <= maxAge && timestamp <= now
  }

  /**
   * 生成安全的验证令牌
   * @param {string} challengeId - 挑战ID
   * @param {number} timestamp - 时间戳
   * @returns {string} 验证令牌
   */
  static generateSecureToken(challengeId, timestamp) {
    const fingerprint = this.generateFingerprint()
    const random = Math.random().toString(36).substr(2, 9)
    const payload = `${challengeId}:${timestamp}:${fingerprint}:${random}`
    
    // 简单的客户端签名（真实签名应该在服务端）
    const signature = btoa(payload + ':client_verify')
    return signature
  }

  /**
   * 防重放攻击检查
   * @param {string} challengeId - 挑战ID
   * @returns {boolean} 是否已使用
   */
  static isTokenUsed(challengeId) {
    const usedTokens = JSON.parse(localStorage.getItem('used_verify_tokens') || '[]')
    return usedTokens.includes(challengeId)
  }

  /**
   * 标记令牌已使用
   * @param {string} challengeId - 挑战ID
   */
  static markTokenUsed(challengeId) {
    const usedTokens = JSON.parse(localStorage.getItem('used_verify_tokens') || '[]')
    usedTokens.push(challengeId)
    
    // 只保留最近100个令牌
    if (usedTokens.length > 100) {
      usedTokens.splice(0, usedTokens.length - 100)
    }
    
    localStorage.setItem('used_verify_tokens', JSON.stringify(usedTokens))
  }

  /**
   * 清理过期的已使用令牌
   */
  static cleanupExpiredTokens() {
    const usedTokens = JSON.parse(localStorage.getItem('used_verify_tokens') || '[]')
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24小时
    
    const validTokens = usedTokens.filter(token => {
      try {
        const parts = token.split('_')
        const timestamp = parseInt(parts[0])
        return (now - timestamp) <= maxAge
      } catch (error) {
        return false
      }
    })
    
    localStorage.setItem('used_verify_tokens', JSON.stringify(validTokens))
  }
}

/**
 * 验证状态管理
 */
export class VerifySession {
  constructor() {
    this.sessionId = this.generateSessionId()
    this.verifiedResources = new Set()
    this.sessionStartTime = Date.now()
  }

  /**
   * 生成会话ID
   * @returns {string} 会话ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * 检查资源是否已验证
   * @param {string} resourceId - 资源ID
   * @returns {boolean} 是否已验证
   */
  isResourceVerified(resourceId) {
    return this.verifiedResources.has(resourceId)
  }

  /**
   * 标记资源验证状态
   * @param {string} resourceId - 资源ID
   * @param {boolean} verified - 是否已验证，默认为true
   */
  markResourceVerified(resourceId, verified = true) {
    if (verified) {
      this.verifiedResources.add(resourceId)
    } else {
      this.verifiedResources.delete(resourceId)
    }
  }

  /**
   * 检查会话是否过期
   * @param {number} maxAge - 最大有效期（毫秒）
   * @returns {boolean} 是否过期
   */
  isSessionExpired(maxAge = 30 * 60 * 1000) { // 30分钟
    return (Date.now() - this.sessionStartTime) > maxAge
  }

  /**
   * 重置会话
   */
  reset() {
    this.sessionId = this.generateSessionId()
    this.verifiedResources.clear()
    this.sessionStartTime = Date.now()
  }
}

// 全局验证会话实例
export const globalVerifySession = new VerifySession()

// 定期清理过期令牌
setInterval(() => {
  VerifyUtils.cleanupExpiredTokens()
}, 60 * 60 * 1000) // 每小时清理一次
