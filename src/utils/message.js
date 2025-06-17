import { ElMessage } from 'element-plus'

export const showMessage = {
  success(message) {
    ElMessage.success(message)
  },
  
  error(message) {
    ElMessage.error(message)
  },
  
  warning(message) {
    ElMessage.warning(message)
  },
  
  info(message) {
    ElMessage.info(message)
  }
}

export const handleApiError = (error) => {
  console.error('API Error:', error)
  
  if (error.response) {
    // 服务器响应错误
    const status = error.response.status
    const message = error.response.data?.message || '请求失败'
    
    switch (status) {
      case 400:
        showMessage.error('请求参数错误')
        break
      case 401:
        showMessage.error('未授权访问')
        break
      case 403:
        showMessage.error('访问被拒绝')
        break
      case 404:
        showMessage.error('资源不存在')
        break
      case 500:
        showMessage.error('服务器内部错误')
        break
      default:
        showMessage.error(message)
    }
  } else if (error.request) {
    // 网络错误
    showMessage.error('网络连接失败，请检查网络设置')
  } else {
    // 其他错误
    showMessage.error('请求失败，请稍后重试')
  }
}
