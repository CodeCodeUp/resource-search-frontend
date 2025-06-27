// 安全配置
export const securityConfig = {
  // 验证配置
  verify: {
    // 验证超时时间（毫秒）
    timeout: 300000, // 5分钟
    
    // 最大重试次数
    maxRetries: 3,
    
    // 滑动容差（像素）
    tolerance: 5,
    
    // 最小滑动时间（毫秒）
    minSlideTime: 200,
    
    // 最大滑动时间（毫秒）
    maxSlideTime: 30000,
    
    // 会话有效期（毫秒）
    sessionDuration: 1800000, // 30分钟
  },
  
  // 反调试配置
  antiDebug: {
    // 是否启用反调试
    enabled: import.meta.env.PROD,
    
    // 检测间隔（毫秒）
    detectInterval: 1000,
    
    // 开发者工具检测阈值
    devToolsThreshold: 160,
    
    // 调试器检测阈值（毫秒）
    debuggerThreshold: 100,
  },
  
  // 请求安全配置
  request: {
    // 请求签名
    enableSigning: true,
    
    // 请求加密
    enableEncryption: false,
    
    // 请求超时（毫秒）
    timeout: 60000,
    
    // 重试次数
    retryCount: 2,
  },
  
  // 设备指纹配置
  fingerprint: {
    // 是否启用设备指纹
    enabled: true,
    
    // 指纹组件
    components: {
      userAgent: true,
      language: true,
      screen: true,
      timezone: true,
      canvas: true,
      webgl: true,
      fonts: false, // 字体检测可能较慢
    },
    
    // 指纹缓存时间（毫秒）
    cacheTime: 3600000, // 1小时
  }
}

/**
 * 反调试类
 */
export class AntiDebug {
  static isEnabled = securityConfig.antiDebug.enabled
  static detectInterval = securityConfig.antiDebug.detectInterval
  static devToolsThreshold = securityConfig.antiDebug.devToolsThreshold
  static debuggerThreshold = securityConfig.antiDebug.debuggerThreshold
  
  static init() {
    if (!this.isEnabled) return
    
    this.detectDevTools()
    this.detectDebugger()
    this.detectConsole()
    this.preventRightClick()
    this.preventKeyboardShortcuts()
  }
  
  static detectDevTools() {
    setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > this.devToolsThreshold
      const heightThreshold = window.outerHeight - window.innerHeight > this.devToolsThreshold
      
      if (widthThreshold || heightThreshold) {
        this.onSecurityViolation('开发者工具检测')
      }
    }, this.detectInterval)
  }
  
  static detectDebugger() {
    setInterval(() => {
      const start = performance.now()
      debugger
      const end = performance.now()
      
      if (end - start > this.debuggerThreshold) {
        this.onSecurityViolation('调试器检测')
      }
    }, this.detectInterval)
  }
  
  static detectConsole() {
    // 重写console方法
    const originalLog = console.log
    console.log = function(...args) {
      AntiDebug.onSecurityViolation('控制台使用检测')
      return originalLog.apply(console, args)
    }
  }
  
  static preventRightClick() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      this.onSecurityViolation('右键菜单检测')
    })
  }
  
  static preventKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // 禁用F12, Ctrl+Shift+I, Ctrl+U等
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C')
      ) {
        e.preventDefault()
        this.onSecurityViolation('快捷键检测')
      }
    })
  }
  
  static onSecurityViolation(type) {
    console.warn(`安全违规检测: ${type}`)
    
    // 可以选择的响应措施：
    // 1. 清空页面
    // document.body.innerHTML = '<h1>访问被拒绝</h1>'
    
    // 2. 重定向
    // window.location.href = '/'
    
    // 3. 发送告警
    this.sendSecurityAlert(type)
  }
  
  static sendSecurityAlert(type) {
    // 发送安全告警到后端
    fetch('/api/security/alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'security_violation',
        details: type,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(() => {
      // 忽略错误，避免暴露
    })
  }
}

/**
 * 设备指纹生成器
 */
export class DeviceFingerprint {
  static cache = new Map()
  
  static async generate() {
    const cacheKey = 'device_fingerprint'
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < securityConfig.fingerprint.cacheTime) {
      return cached.fingerprint
    }
    
    const components = []
    const config = securityConfig.fingerprint.components
    
    if (config.userAgent) {
      components.push(navigator.userAgent)
    }
    
    if (config.language) {
      components.push(navigator.language)
    }
    
    if (config.screen) {
      components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`)
    }
    
    if (config.timezone) {
      components.push(new Date().getTimezoneOffset().toString())
    }
    
    if (config.canvas) {
      components.push(await this.getCanvasFingerprint())
    }
    
    if (config.webgl) {
      components.push(this.getWebGLFingerprint())
    }
    
    const fingerprint = this.hash(components.join('|'))
    
    this.cache.set(cacheKey, {
      fingerprint,
      timestamp: Date.now()
    })
    
    return fingerprint
  }
  
  static async getCanvasFingerprint() {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('Device fingerprint 🔒', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('Device fingerprint 🔒', 4, 17)
    
    return canvas.toDataURL()
  }
  
  static getWebGLFingerprint() {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (!gl) return 'no-webgl'
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    
    return `${vendor}~${renderer}`
  }
  
  static hash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(36)
  }
}

/**
 * 请求签名器
 */
export class RequestSigner {
  static async sign(data, timestamp, nonce) {
    if (!securityConfig.request.enableSigning) {
      return null
    }
    
    const message = JSON.stringify(data) + timestamp + nonce
    const secret = await this.getClientSecret()
    
    return await this.hmacSha256(message, secret)
  }
  
  static async getClientSecret() {
    const fingerprint = await DeviceFingerprint.generate()
    const timeWindow = Math.floor(Date.now() / 300000) // 5分钟窗口
    return btoa(fingerprint + timeWindow).substr(0, 32)
  }
  
  static async hmacSha256(message, secret) {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(message)
    )
    
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
}

// 自动初始化反调试
if (typeof window !== 'undefined') {
  AntiDebug.init()
}
