# 资源搜索前端 Docker 部署指南

## 📋 概述

本项目提供了完整的 Docker 部署解决方案，包括自动化部署脚本、Docker 配置文件和 docker-compose 编排文件。所有Docker相关文件都位于 `docker/` 目录下。

## 🚀 快速开始

### 方式一：使用部署脚本（推荐）

#### Linux/macOS 系统：

1. **进入docker目录**
```bash
cd docker
```

2. **给脚本添加执行权限**
```bash
chmod +x deploy.sh
```

3. **完整部署**
```bash
./deploy.sh deploy
```

4. **查看应用状态**
```bash
./deploy.sh status
```

5. **查看实时日志**
```bash
./deploy.sh logs
```

#### Windows 系统：

1. **进入docker目录**
```cmd
cd docker
```

2. **完整部署**
```cmd
deploy.bat deploy
```

3. **查看应用状态**
```cmd
deploy.bat status
```

4. **查看实时日志**
```cmd
deploy.bat logs
```

### 方式二：使用 docker-compose

1. **进入docker目录**
```bash
cd docker
```

2. **启动服务**
```bash
docker-compose up -d
```

3. **查看日志**
```bash
docker-compose logs -f
```

4. **停止服务**
```bash
docker-compose down
```

## 📖 部署脚本命令详解

### 基本命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `deploy` | 完整部署（构建+启动） | `./deploy.sh deploy` |
| `build` | 仅构建镜像 | `./deploy.sh build` |
| `start` | 启动容器 | `./deploy.sh start` |
| `stop` | 停止容器 | `./deploy.sh stop` |
| `restart` | 重启应用 | `./deploy.sh restart` |
| `logs` | 查看实时日志 | `./deploy.sh logs` |
| `status` | 查看容器状态 | `./deploy.sh status` |
| `health` | 健康检查 | `./deploy.sh health` |
| `cleanup` | 清理所有资源 | `./deploy.sh cleanup` |
| `help` | 显示帮助信息 | `./deploy.sh help` |

### 使用示例

#### Linux/macOS:
```bash
# 进入docker目录
cd docker

# 1. 首次部署
./deploy.sh deploy

# 2. 查看应用状态
./deploy.sh status

# 3. 查看实时日志（按 Ctrl+C 退出）
./deploy.sh logs

# 4. 重启应用
./deploy.sh restart

# 5. 健康检查
./deploy.sh health

# 6. 清理所有资源
./deploy.sh cleanup
```

#### Windows:
```cmd
# 进入docker目录
cd docker

# 1. 首次部署
deploy.bat deploy

# 2. 查看应用状态
deploy.bat status

# 3. 查看实时日志（按 Ctrl+C 退出）
deploy.bat logs

# 4. 重启应用
deploy.bat restart

# 5. 健康检查
deploy.bat health

# 6. 清理所有资源
deploy.bat cleanup
```

## 🔧 配置说明

### 端口配置

- **容器内端口**: 3000
- **主机端口**: 80（可在 deploy.sh 中修改 `HOST_PORT` 变量）

### 环境变量

可以在 `docker-compose.yml` 中修改环境变量：

```yaml
environment:
  - NODE_ENV=production
  - API_BASE_URL=https://api.example.com
```

### Nginx 配置

Nginx 配置文件位于 `nginx.conf`，包含以下特性：

- **Gzip 压缩**: 减少传输大小
- **静态资源缓存**: 提高加载速度
- **安全头**: 增强安全性
- **Vue Router 支持**: 支持前端路由
- **健康检查端点**: `/health`

## 📁 文件结构

```
.
├── docker/                # Docker相关文件目录
│   ├── deploy.sh          # Linux/macOS 部署脚本
│   ├── deploy.bat         # Windows 部署脚本
│   ├── Dockerfile         # Docker 镜像构建文件
│   ├── docker-compose.yml # Docker Compose 编排文件
│   ├── nginx.conf         # Nginx 配置文件
│   └── .dockerignore      # Docker 构建忽略文件
└── DEPLOY.md             # 部署文档
```

## 🔍 监控和日志

### 查看容器状态

**Linux/macOS:**
```bash
cd docker && ./deploy.sh status
```

**Windows:**
```cmd
cd docker && deploy.bat status
```

### 查看实时日志

**Linux/macOS:**
```bash
cd docker && ./deploy.sh logs
```

**Windows:**
```cmd
cd docker && deploy.bat logs
```

### 查看资源使用情况
```bash
docker stats resource-search-frontend
```

### 健康检查

**Linux/macOS:**
```bash
cd docker && ./deploy.sh health
```

**Windows:**
```cmd
cd docker && deploy.bat health
```

**或直接访问:**
```bash
curl http://localhost/health
```

## 🛠 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   lsof -i :80
   # 修改 deploy.sh 中的 HOST_PORT 变量
   ```

2. **构建失败**
   ```bash
   # 查看构建日志
   docker build -t resource-search-frontend .
   ```

3. **容器启动失败**
   ```bash
   # 查看容器日志
   docker logs resource-search-frontend
   ```

4. **健康检查失败**
   ```bash
   # 手动检查应用
   curl -v http://localhost/
   ```

### 日志位置

- **容器日志**: `docker logs resource-search-frontend`
- **Nginx 访问日志**: 容器内 `/var/log/nginx/access.log`
- **Nginx 错误日志**: 容器内 `/var/log/nginx/error.log`

## 🔄 更新部署

### 更新应用代码

**Linux/macOS:**
```bash
# 1. 拉取最新代码
git pull

# 2. 重新部署
cd docker && ./deploy.sh deploy
```

**Windows:**
```cmd
# 1. 拉取最新代码
git pull

# 2. 重新部署
cd docker && deploy.bat deploy
```

### 仅更新镜像

**Linux/macOS:**
```bash
# 1. 构建新镜像
cd docker && ./deploy.sh build

# 2. 重启容器
./deploy.sh restart
```

**Windows:**
```cmd
# 1. 构建新镜像
cd docker && deploy.bat build

# 2. 重启容器
deploy.bat restart
```

## 🚨 生产环境注意事项

1. **安全配置**
   - 修改默认端口
   - 配置 HTTPS
   - 设置防火墙规则

2. **性能优化**
   - 调整 Nginx worker 进程数
   - 配置适当的缓存策略
   - 启用 HTTP/2

3. **监控告警**
   - 配置日志收集
   - 设置监控指标
   - 配置告警通知

4. **备份策略**
   - 定期备份配置文件
   - 备份应用数据
   - 测试恢复流程

## 📞 技术支持

如果在部署过程中遇到问题，请：

1. 查看部署日志
2. 检查容器状态
3. 查看应用日志
4. 联系技术支持团队

---

**版本**: 1.0.0  
**更新时间**: 2025-01-27  
**维护团队**: 精盘搜开发团队
