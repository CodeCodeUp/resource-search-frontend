#!/bin/bash

# 简化的Docker部署脚本

set -e

# 配置变量
CONTAINER_NAME="resource-search-frontend"
IMAGE_NAME="resource-search-frontend"
HOST_PORT="3000"

# 日志函数
log_info() {
    echo "[INFO] $1"
}

log_error() {
    echo "[ERROR] $1"
}

# 检查Docker
check_docker() {
    log_info "Docker已安装"
}

# 构建镜像
build() {
    log_info "构建Docker镜像..."
    docker build -f Dockerfile -t $IMAGE_NAME:latest ../
    log_info "构建完成"
}

# 停止并删除容器
stop() {
    log_info "停止容器..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    log_info "容器已停止"
}

# 启动容器
start() {
    log_info "启动容器..."
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -p $HOST_PORT:3000 \
        $IMAGE_NAME:latest
    log_info "容器已启动，访问地址: http://localhost:$HOST_PORT"
}

# 查看日志
logs() {
    docker logs -f $CONTAINER_NAME
}

# 查看状态
status() {
    docker ps -a | grep $CONTAINER_NAME || echo "容器不存在"
}

# 完整部署
deploy() {
    check_docker
    build
    stop
    start
    log_info "部署完成！"
}

# 重启
restart() {
    stop
    start
}

# 清理
cleanup() {
    stop
    docker rmi $IMAGE_NAME:latest 2>/dev/null || true
    log_info "清理完成"
}

# 帮助信息
help() {
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  deploy   - 完整部署"
    echo "  build    - 构建镜像"
    echo "  start    - 启动容器"
    echo "  stop     - 停止容器"
    echo "  restart  - 重启"
    echo "  logs     - 查看日志"
    echo "  status   - 查看状态"
    echo "  cleanup  - 清理资源"
    echo "  help     - 显示帮助"
}

# 主函数
case "${1:-help}" in
    "deploy")   deploy ;;
    "build")    check_docker && build ;;
    "start")    check_docker && start ;;
    "stop")     stop ;;
    "restart")  restart ;;
    "logs")     logs ;;
    "status")   status ;;
    "cleanup")  cleanup ;;
    "help")     help ;;
    *)          log_error "未知命令: $1" && help && exit 1 ;;
esac
