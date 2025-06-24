# access-token接口添加sessionId参数修复

## 问题描述

在验证流程中，`/api/verify/access-token` 接口缺少 `sessionId` 参数，导致后端无法正确关联验证会话和资源访问请求。

## 问题分析

### 验证流程中的会话管理

根据数据库设计，验证系统使用会话表 (`verify_sessions`) 来管理验证状态：

```sql
CREATE TABLE verify_sessions (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(128) UNIQUE NOT NULL,
  challenge_id VARCHAR(128),
  resource_id VARCHAR(64),
  access_token VARCHAR(256),
  device_fingerprint VARCHAR(64),
  -- ...其他字段
);
```

### API调用流程

1. **verify/slide** → 返回 `sessionId` 和 `accessToken`
2. **access-token** → 需要 `sessionId` 来关联会话
3. **validate-token** → 验证最终的访问令牌

### 缺少sessionId的问题

**之前的调用**：
```javascript
const accessResult = await verifyApi.getAccessToken({
  resourceId: resourceId,
  verifyToken: verifyResult.data.accessToken
  // 缺少 sessionId
})
```

**问题**：
- 后端无法关联验证会话
- 无法验证请求的合法性
- 安全性降低

## 修复方案

### 1. 更新API文档

**修改前**：
```json
{
  "resourceId": "string",
  "verifyToken": "string"
}
```

**修改后**：
```json
{
  "resourceId": "string",
  "verifyToken": "string",
  "sessionId": "string"  // 新增：会话ID
}
```

### 2. 更新前端调用

**修改前端代码**：
```javascript
// ResourceCard.vue
const accessResult = await verifyApi.getAccessToken({
  resourceId: resourceId,
  verifyToken: verifyResult.data.accessToken,
  sessionId: verifyResult.data.sessionId  // 新增
})
```

**数据来源**：
- `sessionId` 从 `verify/slide` 接口的响应中获取
- `verify/slide` 响应包含：`{ verified, accessToken, sessionId, expiresAt }`

### 3. 更新API接口注释

```javascript
/**
 * 获取资源访问令牌
 * @param {Object} accessData - 访问数据
 * @param {string} accessData.resourceId - 资源ID
 * @param {string} accessData.verifyToken - 验证令牌
 * @param {string} accessData.sessionId - 会话ID (新增)
 * @returns {Promise} 访问令牌
 */
getAccessToken(accessData) {
  return api.post('/verify/access-token', accessData)
}
```

### 4. 更新Mock API

```javascript
getAccessToken(accessData) {
  return new Promise((resolve) => {
    // 验证必需参数
    if (!accessData.sessionId) {
      resolve({
        success: false,
        message: '缺少会话ID参数'
      })
      return
    }
    
    console.log('Mock API - 获取资源访问令牌:', {
      resourceId: accessData.resourceId,
      verifyToken: accessData.verifyToken,
      sessionId: accessData.sessionId  // 新增日志
    })
    
    resolve({
      success: true,
      data: {
        accessToken: `resource_access_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        resourceUrl: `https://example.com/resource/${accessData.resourceId}?session=${accessData.sessionId}`,
        expiresAt: Date.now() + 1800000
      }
    })
  })
}
```

## 后端实现要求

### 1. 参数验证

```python
@app.route('/api/verify/access-token', methods=['POST'])
def get_access_token():
    data = request.get_json()
    
    # 验证必需参数
    required_fields = ['resourceId', 'verifyToken', 'sessionId']
    for field in required_fields:
        if field not in data:
            return {
                'success': False,
                'message': f'缺少必需参数: {field}'
            }, 400
    
    resource_id = data['resourceId']
    verify_token = data['verifyToken']
    session_id = data['sessionId']
    
    # 验证会话是否存在且有效
    session = verify_session_service.get_session(session_id)
    if not session:
        return {
            'success': False,
            'message': '会话不存在或已过期'
        }, 400
    
    # 验证令牌是否匹配
    if session.access_token != verify_token:
        return {
            'success': False,
            'message': '验证令牌无效'
        }, 400
    
    # 生成资源访问令牌
    resource_access_token = generate_resource_access_token(
        session_id, resource_id, session.expires_at
    )
    
    # 更新会话信息
    session.resource_id = resource_id
    session.last_access_at = datetime.now()
    session.access_count += 1
    session.save()
    
    return {
        'success': True,
        'data': {
            'accessToken': resource_access_token,
            'resourceUrl': f'https://example.com/resource/{resource_id}',
            'expiresAt': int(session.expires_at.timestamp() * 1000)
        }
    }
```

### 2. 会话管理

```python
class VerifySessionService:
    def get_session(self, session_id):
        """获取验证会话"""
        session = VerifySession.query.filter_by(
            session_id=session_id,
            status='active'
        ).first()
        
        if not session:
            return None
            
        # 检查是否过期
        if session.expires_at < datetime.now():
            session.status = 'expired'
            session.save()
            return None
            
        return session
    
    def update_session_resource(self, session_id, resource_id):
        """更新会话关联的资源"""
        session = self.get_session(session_id)
        if session:
            session.resource_id = resource_id
            session.last_access_at = datetime.now()
            session.access_count += 1
            session.save()
        return session
```

### 3. 安全验证

```python
def validate_session_access(session_id, resource_id, device_fingerprint):
    """验证会话访问权限"""
    session = verify_session_service.get_session(session_id)
    
    if not session:
        return False, "会话不存在"
    
    # 验证设备指纹
    if session.device_fingerprint != device_fingerprint:
        return False, "设备指纹不匹配"
    
    # 验证资源权限
    if session.resource_id and session.resource_id != resource_id:
        return False, "资源访问权限不匹配"
    
    # 验证访问频率
    if session.access_count > MAX_ACCESS_COUNT:
        return False, "访问次数超限"
    
    return True, "验证通过"
```

## 安全优势

### 1. 会话关联

- 确保访问令牌与验证会话正确关联
- 防止令牌被滥用或重放
- 提供完整的访问审计链

### 2. 状态验证

- 验证会话是否仍然有效
- 检查会话是否已过期
- 确保设备指纹一致性

### 3. 访问控制

- 限制每个会话的访问次数
- 记录详细的访问日志
- 支持会话撤销和管理

## 测试验证

### 1. 正常流程测试

```javascript
// 1. 滑动验证
const verifyResult = await verifyApi.verifySlide({...})
// 返回: { verified: true, accessToken: "xxx", sessionId: "yyy" }

// 2. 获取资源访问权限
const accessResult = await verifyApi.getAccessToken({
  resourceId: "resource_123",
  verifyToken: verifyResult.data.accessToken,
  sessionId: verifyResult.data.sessionId
})
// 返回: { accessToken: "zzz", resourceUrl: "https://..." }

// 3. 验证访问令牌
const validateResult = await verifyApi.validateAccessToken(accessResult.data.accessToken)
// 返回: { valid: true, resourceData: {...} }
```

### 2. 错误情况测试

```javascript
// 缺少sessionId
const accessResult = await verifyApi.getAccessToken({
  resourceId: "resource_123",
  verifyToken: "xxx"
  // sessionId 缺失
})
// 返回: { success: false, message: "缺少会话ID参数" }

// 无效sessionId
const accessResult = await verifyApi.getAccessToken({
  resourceId: "resource_123",
  verifyToken: "xxx",
  sessionId: "invalid_session"
})
// 返回: { success: false, message: "会话不存在或已过期" }
```

## 总结

通过添加 `sessionId` 参数到 `access-token` 接口：

1. **完善了验证流程** - 确保会话正确关联
2. **提升了安全性** - 防止令牌滥用和重放攻击
3. **改进了审计能力** - 提供完整的访问追踪
4. **增强了状态管理** - 支持会话生命周期管理

这个修复确保了验证系统的完整性和安全性，为后续的高级安全特性奠定了基础。
