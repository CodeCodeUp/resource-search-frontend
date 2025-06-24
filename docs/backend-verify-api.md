# 滑动验证后端API文档

## 概述

本文档描述了滑动验证系统的后端API接口设计，用于防止爬虫和恶意访问资源详情。

## 安全设计原则

1. **多层验证**：客户端验证 + 服务端验证
2. **防重放攻击**：每个验证令牌只能使用一次
3. **时效性控制**：验证令牌有时间限制
4. **设备指纹**：结合设备特征进行验证
5. **频率限制**：限制验证请求频率
6. **加密传输**：所有敏感数据加密传输

## 重要变更

### 资源列表API变化

**重要**：资源列表接口不再直接返回资源URL，需要通过验证流程获取。

#### 修改前
```json
{
  "success": true,
  "data": {
    "pageInfo": {
      "list": [
        {
          "id": "123",
          "name": "资源名称",
          "url": "https://direct-resource-url.com",  // 直接返回URL
          "type": "study"
        }
      ]
    }
  }
}
```

#### 修改后
```json
{
  "success": true,
  "data": {
    "pageInfo": {
      "list": [
        {
          "id": "123",
          "name": "资源名称",
          // url字段不再返回，需要通过验证流程获取
          "type": "study"
        }
      ]
    }
  }
}
```

## API接口

### 1. 获取验证挑战

**接口地址：** `GET /api/verify/challenge`

**请求头：** (Request Headers)
```javascript
{
  "X-Device-Fingerprint": "abc123def456",     // 设备指纹 (必需)
  "X-User-Agent": "Mozilla/5.0...",           // 用户代理 (必需)
  "X-Timestamp": "1703123456789"              // 请求时间戳 (必需)
}
```

**响应数据：**
```json
{
  "success": true,
  "data": {
    "challengeId": "challenge_1703123456789_abc123_def456",
    "backgroundImage": "base64_encoded_image_data",
    "puzzlePosition": {
      "x": 150,  // 必须在安全范围内：15 <= x <= 243
      "y": 75    // 必须在安全范围内：15 <= y <= 93
    },
    "tolerance": 5,
    "expiresAt": 1703123756789,
    "serverSignature": "encrypted_signature"
  }
}
```

**重要说明：**
- 拼图位置必须考虑边界安全，避免拼图形状超出画布范围
- 画布尺寸：300x150像素
- 拼图块尺寸：42x42像素
- 安全边距：15像素（考虑拼图凸起部分）
- X坐标范围：15 ≤ x ≤ 243
- Y坐标范围：15 ≤ y ≤ 93

### 2. 验证滑动结果

**接口地址：** `POST /api/verify/slide`

**请求头：** (Request Headers)
```javascript
{
  "X-Device-Fingerprint": "abc123def456",     // 设备指纹 (必需)
  "X-User-Agent": "Mozilla/5.0...",           // 用户代理 (必需)
  "X-Timestamp": "1703123456789"              // 请求时间戳 (必需)
}
```

**请求参数：** (Request Body)
```json
{
  "challengeId": "string",       // 挑战ID
  "token": "string",             // 客户端生成的验证令牌
  "resourceId": "string",        // 要访问的资源ID
  "slidePosition": "number",     // 滑动位置
  "slideTime": "number"          // 滑动耗时（毫秒）
}
```

**响应数据：**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "accessToken": "encrypted_access_token",
    "expiresAt": 1703125456789,
    "sessionId": "session_abc123def456"
  }
}
```

### 3. 获取资源访问令牌

**接口地址：** `POST /api/verify/access-token`

**请求头：** (Request Headers)
```javascript
{
  "X-Device-Fingerprint": "abc123def456",     // 设备指纹 (可选)
  "X-User-Agent": "Mozilla/5.0...",           // 用户代理 (可选)
  "X-Timestamp": "1703123456789"              // 请求时间戳 (可选)
}
```

**请求参数：** (Request Body)
```json
{
  "resourceId": "string",        // 资源ID
  "verifyToken": "string",       // 验证令牌
  "sessionId": "string"          // 会话ID (从verify/slide接口获取)
}
```

**响应数据：**
```json
{
  "success": true,
  "data": {
    "accessToken": "encrypted_access_token",
    "expiresAt": 1703125456789
  }
}
```

### 4. 验证访问令牌

**接口地址：** `POST /api/verify/validate-token`

**请求参数：**
```json
{
  "token": "string",             // 访问令牌
}
```

**响应数据：**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "resourceData": {
      "id": "string",
      "name": "string",
      "url": "string",
      "type": "string"
    }
  }
}
```

## 数据库设计

### 验证挑战表 (verify_challenges)

```sql
CREATE TABLE verify_challenges (
  id VARCHAR(64) PRIMARY KEY,
  challenge_id VARCHAR(128) UNIQUE NOT NULL,
  background_image TEXT,
  puzzle_position JSON,
  tolerance INT DEFAULT 5,
  device_fingerprint VARCHAR(64),
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  used_at TIMESTAMP NULL,
  status ENUM('pending', 'verified', 'expired', 'failed') DEFAULT 'pending',
  INDEX idx_challenge_id (challenge_id),
  INDEX idx_expires_at (expires_at),
  INDEX idx_device_fingerprint (device_fingerprint)
);
```

### 验证会话表 (verify_sessions)

```sql
CREATE TABLE verify_sessions (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(128) UNIQUE NOT NULL,
  challenge_id VARCHAR(128),
  resource_id VARCHAR(64),
  access_token VARCHAR(256),
  device_fingerprint VARCHAR(64),
  user_agent TEXT,
  ip_address VARCHAR(45),
  verified_at TIMESTAMP,
  expires_at TIMESTAMP,
  last_access_at TIMESTAMP,
  access_count INT DEFAULT 0,
  status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
  INDEX idx_session_id (session_id),
  INDEX idx_access_token (access_token),
  INDEX idx_resource_id (resource_id),
  INDEX idx_expires_at (expires_at),
  FOREIGN KEY (challenge_id) REFERENCES verify_challenges(challenge_id)
);
```

### 访问日志表 (verify_access_logs)

```sql
CREATE TABLE verify_access_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(128),
  resource_id VARCHAR(64),
  action VARCHAR(32),
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_fingerprint VARCHAR(64),
  success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session_id (session_id),
  INDEX idx_resource_id (resource_id),
  INDEX idx_created_at (created_at),
  INDEX idx_ip_address (ip_address)
);
```

## 安全实现要点

### 1. 设备指纹生成

```javascript
// 客户端设备指纹组成
const fingerprint = {
  userAgent: navigator.userAgent,
  language: navigator.language,
  screen: `${screen.width}x${screen.height}`,
  timezone: new Date().getTimezoneOffset(),
  canvas: canvasFingerprint(),
  webgl: webglFingerprint(),
  fonts: fontFingerprint()
}
```

### 2. 服务端验证逻辑

```python
def generate_safe_puzzle_position():
    """生成安全的拼图位置"""
    CANVAS_WIDTH = 300
    CANVAS_HEIGHT = 150
    BLOCK_SIZE = 42
    PUZZLE_PADDING = 15

    min_x = PUZZLE_PADDING
    max_x = CANVAS_WIDTH - BLOCK_SIZE - PUZZLE_PADDING
    min_y = PUZZLE_PADDING
    max_y = CANVAS_HEIGHT - BLOCK_SIZE - PUZZLE_PADDING

    return {
        'x': random.randint(min_x, max_x),
        'y': random.randint(min_y, max_y)
    }

def validate_puzzle_position(x, y):
    """验证拼图位置是否安全"""
    CANVAS_WIDTH = 300
    CANVAS_HEIGHT = 150
    BLOCK_SIZE = 42
    PUZZLE_PADDING = 15

    min_x = PUZZLE_PADDING
    max_x = CANVAS_WIDTH - BLOCK_SIZE - PUZZLE_PADDING
    min_y = PUZZLE_PADDING
    max_y = CANVAS_HEIGHT - BLOCK_SIZE - PUZZLE_PADDING

    return min_x <= x <= max_x and min_y <= y <= max_y

def verify_slide_challenge(challenge_id, slide_position, device_fingerprint):
    # 1. 验证挑战是否存在且未过期
    challenge = get_challenge(challenge_id)
    if not challenge or challenge.expires_at < now():
        return False, "挑战已过期"

    # 2. 验证设备指纹
    if challenge.device_fingerprint != device_fingerprint:
        return False, "设备指纹不匹配"

    # 3. 验证拼图位置是否安全
    puzzle_x = challenge.puzzle_position['x']
    puzzle_y = challenge.puzzle_position['y']
    if not validate_puzzle_position(puzzle_x, puzzle_y):
        return False, "拼图位置不安全"

    # 4. 验证滑动位置
    tolerance = challenge.tolerance
    if abs(slide_position - puzzle_x) > tolerance:
        return False, "验证失败"

    # 5. 标记挑战已使用
    challenge.status = 'verified'
    challenge.used_at = now()

    return True, "验证成功"
```

### 3. 频率限制

```python
# Redis实现频率限制
def check_rate_limit(ip_address, device_fingerprint):
    key_ip = f"verify_rate_limit:ip:{ip_address}"
    key_device = f"verify_rate_limit:device:{device_fingerprint}"
    
    # IP限制：每分钟最多10次
    if redis.incr(key_ip, ex=60) > 10:
        return False, "IP请求过于频繁"
    
    # 设备限制：每分钟最多5次
    if redis.incr(key_device, ex=60) > 5:
        return False, "设备请求过于频繁"
    
    return True, "通过"
```

### 4. 令牌加密

```python
import jwt
from cryptography.fernet import Fernet

def generate_access_token(session_id, resource_id, expires_at):
    payload = {
        'session_id': session_id,
        'resource_id': resource_id,
        'exp': expires_at,
        'iat': time.time(),
        'jti': str(uuid.uuid4())  # 防重放
    }
    
    # JWT签名
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    
    # 二次加密
    fernet = Fernet(ENCRYPTION_KEY)
    encrypted_token = fernet.encrypt(token.encode())
    
    return base64.b64encode(encrypted_token).decode()
```

## 防护措施

### 1. 防自动化攻击

- 随机生成拼图位置和背景
- 验证滑动轨迹的人类特征
- 检测异常快速的操作
- 限制验证频率

### 2. 防重放攻击

- 每个挑战ID只能使用一次
- 验证令牌包含时间戳和随机数
- 服务端记录已使用的令牌

### 3. 防暴力破解

- 连续失败后增加验证难度
- 临时封禁异常IP和设备
- 记录所有验证尝试

### 4. 数据保护

- 敏感数据加密存储
- 定期清理过期数据
- 访问日志审计

## 高级安全特性

### 1. 行为分析

```python
class BehaviorAnalyzer:
    def analyze_slide_behavior(self, slide_data):
        """分析滑动行为特征"""
        features = {
            'slide_time': slide_data['slide_time'],
            'trajectory_smoothness': self.calculate_smoothness(slide_data['trajectory']),
            'acceleration_pattern': self.analyze_acceleration(slide_data['trajectory']),
            'pause_count': self.count_pauses(slide_data['trajectory']),
            'overshoot_distance': self.calculate_overshoot(slide_data)
        }

        # 人类行为特征检测
        is_human_like = (
            features['slide_time'] > 200 and  # 最少200ms
            features['trajectory_smoothness'] > 0.7 and  # 轨迹平滑度
            features['pause_count'] <= 3 and  # 暂停次数
            features['acceleration_pattern'] > 0.5  # 加速度模式
        )

        return is_human_like, features
```

### 2. 图像水印技术

```python
def generate_watermarked_image(base_image, session_id):
    """生成带水印的验证图片"""
    # 添加不可见水印
    watermark = generate_invisible_watermark(session_id)
    watermarked_image = embed_watermark(base_image, watermark)

    # 添加随机噪点
    noisy_image = add_random_noise(watermarked_image)

    return noisy_image

def verify_watermark(submitted_image, session_id):
    """验证图片水印"""
    extracted_watermark = extract_watermark(submitted_image)
    expected_watermark = generate_invisible_watermark(session_id)

    return extracted_watermark == expected_watermark
```

### 3. 机器学习检测

```python
import tensorflow as tf

class BotDetectionModel:
    def __init__(self):
        self.model = tf.keras.models.load_model('bot_detection_model.h5')

    def predict_bot_probability(self, features):
        """预测是否为机器人"""
        # 特征包括：滑动时间、轨迹、设备指纹等
        normalized_features = self.normalize_features(features)
        prediction = self.model.predict([normalized_features])

        return prediction[0][0]  # 返回机器人概率

    def is_likely_bot(self, features, threshold=0.8):
        """判断是否可能是机器人"""
        bot_probability = self.predict_bot_probability(features)
        return bot_probability > threshold
```

## 前端安全加固

### 1. 代码混淆

```javascript
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            properties: {
              regex: /^_/  // 混淆以_开头的属性
            }
          },
          compress: {
            drop_console: true,  // 移除console
            drop_debugger: true  // 移除debugger
          }
        }
      })
    ]
  }
};
```

### 2. 反调试技术

```javascript
// 反调试检测
class AntiDebug {
  static init() {
    // 检测开发者工具
    this.detectDevTools();

    // 检测调试器
    this.detectDebugger();

    // 检测控制台
    this.detectConsole();
  }

  static detectDevTools() {
    const threshold = 160;

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold) {
        this.onDevToolsDetected();
      }
    }, 500);
  }

  static detectDebugger() {
    setInterval(() => {
      const start = performance.now();
      debugger;
      const end = performance.now();

      if (end - start > 100) {
        this.onDebuggerDetected();
      }
    }, 1000);
  }

  static onDevToolsDetected() {
    // 清空页面或重定向
    document.body.innerHTML = '';
    window.location.href = '/';
  }
}
```

### 3. 请求签名验证

```javascript
class RequestSigner {
  static sign(data, timestamp, nonce) {
    const message = JSON.stringify(data) + timestamp + nonce;
    return this.hmacSha256(message, this.getClientSecret());
  }

  static hmacSha256(message, secret) {
    // 使用Web Crypto API
    return crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(key => {
      return crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(message)
      );
    }).then(signature => {
      return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    });
  }

  static getClientSecret() {
    // 动态生成客户端密钥
    const fingerprint = this.getDeviceFingerprint();
    const timestamp = Math.floor(Date.now() / 300000); // 5分钟窗口
    return btoa(fingerprint + timestamp).substr(0, 32);
  }
}
```

## 监控和告警

### 1. 实时监控

```python
class SecurityMonitor:
    def __init__(self):
        self.redis = redis.Redis()
        self.alert_thresholds = {
            'failed_attempts_per_ip': 10,
            'failed_attempts_per_device': 5,
            'unusual_success_rate': 0.95,
            'rapid_requests': 100
        }

    def monitor_verification_attempts(self, ip, device_fingerprint, success):
        """监控验证尝试"""
        # 记录失败次数
        if not success:
            self.increment_failure_count(ip, device_fingerprint)

        # 检查异常模式
        self.check_anomalies(ip, device_fingerprint)

    def check_anomalies(self, ip, device_fingerprint):
        """检查异常模式"""
        # 检查IP失败次数
        ip_failures = self.get_failure_count(f"ip:{ip}")
        if ip_failures > self.alert_thresholds['failed_attempts_per_ip']:
            self.send_alert(f"IP {ip} 失败次数过多: {ip_failures}")

        # 检查设备失败次数
        device_failures = self.get_failure_count(f"device:{device_fingerprint}")
        if device_failures > self.alert_thresholds['failed_attempts_per_device']:
            self.send_alert(f"设备 {device_fingerprint} 失败次数过多: {device_failures}")

    def send_alert(self, message):
        """发送告警"""
        # 发送到监控系统
        print(f"SECURITY ALERT: {message}")
        # 可以集成钉钉、企业微信等
```

### 2. 数据分析

```sql
-- 异常IP分析
SELECT
    ip_address,
    COUNT(*) as total_attempts,
    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_count,
    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) / COUNT(*) as success_rate
FROM verify_access_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
GROUP BY ip_address
HAVING total_attempts > 50 OR success_rate > 0.95
ORDER BY total_attempts DESC;

-- 设备指纹分析
SELECT
    device_fingerprint,
    COUNT(DISTINCT ip_address) as ip_count,
    COUNT(*) as total_attempts,
    AVG(TIMESTAMPDIFF(MICROSECOND, created_at, LAG(created_at) OVER (PARTITION BY device_fingerprint ORDER BY created_at))) as avg_interval
FROM verify_access_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
GROUP BY device_fingerprint
HAVING ip_count > 5 OR avg_interval < 1000000  -- 间隔小于1秒
ORDER BY total_attempts DESC;
```

## 部署建议

1. **使用HTTPS**：确保数据传输安全
2. **CDN加速**：提高验证图片加载速度
3. **负载均衡**：分散验证请求压力
4. **监控告警**：实时监控异常验证行为
5. **定期更新**：更新验证算法和安全策略
6. **WAF防护**：使用Web应用防火墙
7. **DDoS防护**：防止分布式拒绝服务攻击
8. **日志审计**：完整的访问日志记录
9. **备份恢复**：定期备份验证数据
10. **安全测试**：定期进行渗透测试

## 成本优化

1. **缓存策略**：缓存验证图片和结果
2. **资源压缩**：压缩图片和静态资源
3. **异步处理**：异步处理验证逻辑
4. **数据清理**：定期清理过期数据
5. **性能监控**：监控系统性能指标
