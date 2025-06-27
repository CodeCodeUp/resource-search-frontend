FROM nginx:alpine

# 删除默认的nginx配置
RUN rm -rf /usr/share/nginx/html/*

# 复制已构建的前端文件
COPY docker/dist/ /usr/share/nginx/html

# 复制nginx配置文件
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["nginx", "-g", "daemon off;"]
