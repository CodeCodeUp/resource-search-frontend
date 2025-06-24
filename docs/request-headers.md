# 验证API请求头规范

## 概述

为了增强安全性和规范化API调用，验证相关的敏感参数（设备指纹、用户代理、时间戳）现在通过请求头传递，而不是查询参数或请求体。

## 请求头规范

### 标准请求头

所有验证相关的API调用都必须包含以下请求头：

```javascript
{
  "X-Device-Fingerprint": "abc123def456",     // 设备指纹 (必需)
  "X-User-Agent": "Mozilla/5.0...",           // 用户代理 (必需)
  "X-Timestamp": "1703123456789"              // 请求时间戳 (必需)
}
```

### 请求头说明

#### X-Device-Fingerprint
- **类型**: String
- **必需**: 是
- **说明**: 客户端生成的设备指纹，用于设备识别和防重放攻击
- **示例**: `"abc123def456"`

#### X-User-Agent
- **类型**: String  
- **必需**: 是
- **说明**: 客户端用户代理字符串，用于环境验证
- **示例**: `"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"`

#### X-Timestamp
- **类型**: String (数字)
- **必需**: 是
- **说明**: 请求发起时的时间戳（毫秒），用于防重放攻击
- **示例**: `"1703123456789"`

## 前端实现

### API调用示例

#### 获取验证挑战

```javascript
// 之前的实现 (查询参数)
const challengeResult = await api.get('/verify/challenge', { 
  params: {
    deviceFingerprint: 'abc123',
    userAgent: navigator.userAgent,
    timestamp: Date.now()
  }
})

// 现在的实现 (请求头)
const headers = {
  'X-Device-Fingerprint': 'abc123def456',
  'X-User-Agent': navigator.userAgent,
  'X-Timestamp': Date.now().toString()
}

const challengeResult = await api.get('/verify/challenge', { headers })
```

#### 验证滑动结果

```javascript
// 之前的实现 (请求体包含所有参数)
const verifyResult = await api.post('/verify/slide', {
  challengeId: 'challenge_123',
  token: 'verify_token',
  timestamp: Date.now(),
  slidePosition: 150,
  slideTime: 1200,
  deviceFingerprint: 'abc123',
  userAgent: navigator.userAgent,
  resourceId: 'resource_123'
})

// 现在的实现 (敏感参数在请求头)
const { deviceFingerprint, userAgent, timestamp, ...bodyData } = verifyData

const headers = {
  'X-Device-Fingerprint': deviceFingerprint,
  'X-User-Agent': userAgent,
  'X-Timestamp': timestamp.toString()
}

const verifyResult = await api.post('/verify/slide', bodyData, { headers })
```

### verifyApi实现

```javascript
export const verifyApi = {
  // 获取验证挑战
  getChallenge(params) {
    const headers = {
      'X-Device-Fingerprint': params.deviceFingerprint,
      'X-User-Agent': params.userAgent,
      'X-Timestamp': params.timestamp.toString()
    }
    
    return api.get('/verify/challenge', { headers })
  },

  // 验证滑动结果
  verifySlide(verifyData) {
    const { deviceFingerprint, userAgent, timestamp, ...bodyData } = verifyData
    
    const headers = {
      'X-Device-Fingerprint': deviceFingerprint,
      'X-User-Agent': userAgent,
      'X-Timestamp': timestamp.toString()
    }
    
    return api.post('/verify/slide', bodyData, { headers })
  }
}
```

## 后端实现

### 请求头解析

```python
from flask import request

@app.route('/api/verify/challenge', methods=['GET'])
def get_challenge():
    # 从请求头获取参数
    device_fingerprint = request.headers.get('X-Device-Fingerprint')
    user_agent = request.headers.get('X-User-Agent')
    timestamp = request.headers.get('X-Timestamp')
    
    # 验证必需参数
    if not all([device_fingerprint, user_agent, timestamp]):
        return {
            'success': False,
            'message': '缺少必需的请求头参数'
        }, 400
    
    # 验证时间戳
    try:
        timestamp = int(timestamp)
        if abs(time.time() * 1000 - timestamp) > 300000:  # 5分钟有效期
            return {
                'success': False,
                'message': '请求时间戳无效'
            }, 400
    except ValueError:
        return {
            'success': False,
            'message': '时间戳格式错误'
        }, 400
    
    # 处理验证逻辑
    challenge_data = generate_challenge(device_fingerprint, user_agent, timestamp)
    return {'success': True, 'data': challenge_data}
```

### 中间件验证

```python
def verify_headers_middleware():
    """验证请求头中间件"""
    required_headers = ['X-Device-Fingerprint', 'X-User-Agent', 'X-Timestamp']
    
    for header in required_headers:
        if header not in request.headers:
            return {
                'success': False,
                'message': f'缺少必需的请求头: {header}'
            }, 400
    
    # 验证设备指纹格式
    device_fp = request.headers.get('X-Device-Fingerprint')
    if not re.match(r'^[a-zA-Z0-9]{8,32}$', device_fp):
        return {
            'success': False,
            'message': '设备指纹格式无效'
        }, 400
    
    # 验证时间戳
    try:
        timestamp = int(request.headers.get('X-Timestamp'))
        current_time = int(time.time() * 1000)
        if abs(current_time - timestamp) > 300000:  # 5分钟有效期
            return {
                'success': False,
                'message': '请求时间戳过期'
            }, 400
    except (ValueError, TypeError):
        return {
            'success': False,
            'message': '时间戳格式错误'
        }, 400
```

## 安全优势

### 1. 隐藏敏感信息
- 设备指纹不会出现在URL中，避免日志泄露
- 用户代理信息不会被缓存或记录在访问日志中
- 时间戳不会暴露在查询参数中

### 2. 防重放攻击
- 时间戳在请求头中，难以被篡改
- 结合设备指纹，提供更强的防重放保护
- 请求头参数不会被浏览器缓存

### 3. 规范化
- 统一的请求头格式，便于中间件处理
- 清晰的参数分离：敏感信息在请求头，业务数据在请求体
- 便于实现统一的安全验证逻辑

## 兼容性考虑

### 1. 向后兼容
- 可以同时支持请求头和查询参数，逐步迁移
- 在过渡期间提供兼容性处理

### 2. 错误处理
- 明确的错误信息，指导客户端正确使用
- 详细的参数验证和格式检查

### 3. 文档更新
- 更新API文档，明确请求头要求
- 提供示例代码和最佳实践

## 测试验证

### 1. 功能测试
- ✅ 验证所有API都正确使用请求头
- ✅ 测试缺少请求头时的错误处理
- ✅ 验证请求头格式验证

### 2. 安全测试
- ✅ 测试时间戳过期处理
- ✅ 验证设备指纹格式检查
- ✅ 测试防重放攻击机制

### 3. 兼容性测试
- ✅ 测试不同客户端的请求头支持
- ✅ 验证中间件的正确处理
- ✅ 测试错误响应格式

## 部署注意事项

1. **Nginx配置**: 确保代理服务器正确传递自定义请求头
2. **CORS设置**: 允许自定义请求头的跨域访问
3. **日志配置**: 避免在访问日志中记录敏感请求头
4. **监控告警**: 监控缺少请求头的异常请求

这个请求头规范提供了更好的安全性和规范性，同时保持了良好的开发体验。
