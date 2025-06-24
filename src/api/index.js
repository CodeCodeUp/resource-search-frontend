import axios from 'axios'
import { handleApiError } from '@/utils/message'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    handleApiError(error)
    return Promise.reject(error)
  }
)

// API方法
export const resourceApi = {
  // 获取资源类型层级结构
  getMenusHierarchical() {
    return api.get('/menus/hierarchical')
  },

  // 搜索资源（统一接口，支持空搜索词获取所有资源）
  searchResources(searchData) {
    return api.post('/resources/search', searchData)
  }
}

export default api
