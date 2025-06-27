# 生产环境 Dockerfile for Vue3 前端应用
# 假设dist目录已经在本地构建完成

FROM nginx:alpine

# 使用阿里云镜像源加速apk下载
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装curl用于健康检查
RUN apk add --no-cache curl

# 删除默认的nginx配置
RUN rm -rf /usr/share/nginx/html/*

# 复制已构建的前端文件
COPY docker/dist/ /usr/share/nginx/html

# 复制nginx配置文件
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 创建日志目录
RUN mkdir -p /var/log/nginx

# 设置权限
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# 切换到非root用户
USER nginx

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# 启动命令
CMD ["nginx", "-g", "daemon off;"]
