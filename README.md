# 资源搜索平台

一个基于 Vue 3 + Element Plus 的现代化资源搜索平台，提供优雅的用户界面和流畅的搜索体验。

## ✨ 特性

- 🎨 **现代化设计** - 采用渐变背景和卡片式布局，视觉效果优雅
- 🔍 **智能搜索** - 支持关键词搜索和资源类型筛选
- 📱 **响应式布局** - 完美适配桌面端和移动端
- ⚡ **高性能** - 基于 Vue 3 Composition API 和 Vite 构建
- 🎯 **用户友好** - 直观的交互设计和流畅的动画效果

## 🛠️ 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **HTTP 客户端**: Axios
- **样式**: CSS3 + Flexbox/Grid

## 📦 项目结构

```
src/
├── api/                 # API 接口
│   ├── index.js        # 主要 API 配置
│   └── mock.js         # 模拟数据
├── components/         # 组件
│   ├── SearchBar.vue   # 搜索栏组件
│   ├── ResourceCard.vue # 资源卡片组件
│   └── ResourceList.vue # 资源列表组件
├── stores/             # 状态管理
│   └── resource.js     # 资源相关状态
├── utils/              # 工具函数
│   └── message.js      # 消息提示工具
├── views/              # 页面
│   └── Home.vue        # 主页
├── router/             # 路由配置
└── main.js            # 应用入口
```

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 🔧 配置说明

### 环境变量

在 `.env.development` 文件中可以配置：

```env
# 是否使用真实API（注释掉则使用模拟数据）
# VITE_USE_REAL_API=true
```

### API 接口

项目支持以下 API 接口：

1. **获取资源类型**: `GET /api/menus/hierarchical`
2. **分页获取资源**: `GET /api/resources/page?page=1&size=10`
3. **搜索资源**: `POST /api/resources/search/page`

#### API 数据格式

**资源列表/搜索返回格式**:
```json
{
  "total": 1,
  "list": [
    {
      "id": 17,
      "name": "数据结构与算法",
      "content": "计算机专业课程",
      "url": "https://example.com/algorithm.pdf",
      "pig": "algorithm.jpg",
      "level": 1,
      "type": "study",
      "createTime": "2025-06-17 06:40:55",
      "updateTime": "2025-06-17 06:40:55"
    }
  ],
  "pageNum": 1,
  "pageSize": 10,
  "pages": 1
}
```

### 模拟数据

当后端 API 不可用时，项目会自动使用模拟数据，确保前端功能正常展示。

## 📱 功能特性

### 搜索功能
- 关键词搜索
- 资源类型筛选
- 实时搜索结果
- 搜索历史记录

### 资源展示
- 卡片式布局
- 图片懒加载
- 响应式网格
- 分页导航

### 用户体验
- 加载状态提示
- 错误处理
- 空状态展示
- 平滑动画过渡

## 🎨 设计亮点

- **渐变背景**: 使用现代化的渐变色彩
- **毛玻璃效果**: 搜索框采用半透明毛玻璃设计
- **卡片悬浮**: 鼠标悬停时的优雅动画效果
- **响应式设计**: 完美适配各种屏幕尺寸

## 📄 许可证

MIT License
