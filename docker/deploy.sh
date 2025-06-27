#!/bin/bash

# 资源搜索前端 Docker 部署脚本
# 作者: 精盘搜团队
# 版本: 1.0.0

set -e

# 配置变量
APP_NAME="resource-search-frontend"
CONTAINER_NAME="resource-search-frontend"
IMAGE_NAME="resource-search-frontend"
PORT="3000"
HOST_PORT="3000"
LOG_FILE="/var/log/${APP_NAME}.log"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 通知函数
send_notification() {
    local title="$1"
    local message="$2"
    local level="$3"
    
    echo "==================================="
    echo "📢 $title"
    echo "📝 $message"
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
    echo "==================================="
    
    # 可以在这里添加其他通知方式，如邮件、钉钉、企业微信等
    # 例如：curl -X POST "webhook_url" -d "{'text': '$title: $message'}"
}

# 检查执行环境
check_environment() {
    # 检查是否在docker目录下执行
    if [ ! -f "Dockerfile" ] || [ ! -f "nginx.conf" ] || [ ! -f "deploy.sh" ]; then
        log_error "请在docker目录下执行此脚本"
        log_error "当前目录: $(pwd)"
        log_error "请执行: cd docker && ./deploy.sh [命令]"
        exit 1
    fi

    log_info "✅ 执行环境检查通过"
}

# 配置Docker镜像源（可选）
setup_docker_mirror() {
    log_info "配置Docker镜像源以加速下载..."

    # 检查是否已配置镜像源
    if [ -f "/etc/docker/daemon.json" ]; then
        log_info "Docker镜像源已配置"
        return
    fi

    # 创建Docker配置目录
    sudo mkdir -p /etc/docker

    # 配置国内镜像源
    sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
    "registry-mirrors": [
        "https://docker.mirrors.ustc.edu.cn",
        "https://hub-mirror.c.163.com",
        "https://mirror.baidubce.com"
    ]
}
EOF

    # 重启Docker服务
    sudo systemctl daemon-reload
    sudo systemctl restart docker

    log_info "Docker镜像源配置完成"
}

# 检查Docker是否安装
check_docker() {
    # if ! command -v docker &> /dev/null; then
    #     log_error "Docker 未安装，请先安装 Docker Desktop"
    #     exit 1
    # fi

    log_info "Docker 已安装，版本: $(docker --version)"
}

# 检查容器状态
check_container_status() {
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        echo "running"
    elif docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
        echo "stopped"
    else
        echo "not_exists"
    fi
}

# 构建镜像
build_image() {
    log_info "开始构建 Docker 镜像..."

    # 从docker目录构建，构建上下文为父目录
    log_info "构建命令: docker build -f Dockerfile -t $IMAGE_NAME:latest ../"
    docker build -f Dockerfile -t $IMAGE_NAME:latest ../

    if [ $? -eq 0 ]; then
        log_info "Docker 镜像构建成功"
        send_notification "构建成功" "Docker 镜像 $IMAGE_NAME 构建完成" "success"
    else
        log_error "Docker 镜像构建失败"
        send_notification "构建失败" "Docker 镜像 $IMAGE_NAME 构建失败" "error"
        exit 1
    fi
}

# 停止容器
stop_container() {
    local status=$(check_container_status)
    
    if [ "$status" = "running" ]; then
        log_info "正在停止容器 $CONTAINER_NAME..."
        docker stop $CONTAINER_NAME
        log_info "容器已停止"
    elif [ "$status" = "stopped" ]; then
        log_warn "容器 $CONTAINER_NAME 已经停止"
    else
        log_warn "容器 $CONTAINER_NAME 不存在"
    fi
}

# 删除容器
remove_container() {
    local status=$(check_container_status)
    
    if [ "$status" != "not_exists" ]; then
        log_info "正在删除容器 $CONTAINER_NAME..."
        docker rm -f $CONTAINER_NAME 2>/dev/null || true
        log_info "容器已删除"
    fi
}

# 启动容器
start_container() {
    log_info "正在启动容器 $CONTAINER_NAME..."
    
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -p $HOST_PORT:$PORT \
        -v /etc/localtime:/etc/localtime:ro \
        $IMAGE_NAME:latest
    
    if [ $? -eq 0 ]; then
        log_info "容器启动成功"
        log_info "应用访问地址: http://localhost:$HOST_PORT"
        send_notification "部署成功" "应用已成功部署并启动，访问地址: http://localhost:$HOST_PORT" "success"
        
        # 等待几秒钟让容器完全启动
        sleep 3
        check_health
    else
        log_error "容器启动失败"
        send_notification "部署失败" "容器启动失败，请检查日志" "error"
        exit 1
    fi
}

# 健康检查
check_health() {
    log_info "正在进行健康检查..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:$HOST_PORT > /dev/null 2>&1; then
            log_info "✅ 应用健康检查通过"
            return 0
        fi
        
        log_debug "健康检查尝试 $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done
    
    log_warn "⚠️ 应用健康检查超时，请手动检查应用状态"
    return 1
}

# 查看实时日志
view_logs() {
    local status=$(check_container_status)
    
    if [ "$status" = "running" ]; then
        log_info "显示容器 $CONTAINER_NAME 的实时日志 (按 Ctrl+C 退出):"
        echo "----------------------------------------"
        docker logs -f $CONTAINER_NAME
    else
        log_error "容器 $CONTAINER_NAME 未运行"
        exit 1
    fi
}

# 查看容器状态
show_status() {
    local status=$(check_container_status)
    
    echo -e "${CYAN}=== 容器状态信息 ===${NC}"
    echo "容器名称: $CONTAINER_NAME"
    echo "镜像名称: $IMAGE_NAME"
    echo "端口映射: $HOST_PORT:$PORT"
    
    case $status in
        "running")
            echo -e "状态: ${GREEN}运行中${NC}"
            echo "容器ID: $(docker ps -q -f name=$CONTAINER_NAME)"
            echo "启动时间: $(docker inspect -f '{{.State.StartedAt}}' $CONTAINER_NAME)"
            ;;
        "stopped")
            echo -e "状态: ${YELLOW}已停止${NC}"
            ;;
        "not_exists")
            echo -e "状态: ${RED}不存在${NC}"
            ;;
    esac
    
    # 显示资源使用情况
    if [ "$status" = "running" ]; then
        echo -e "\n${CYAN}=== 资源使用情况 ===${NC}"
        docker stats $CONTAINER_NAME --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    fi
}

# 重启应用
restart_app() {
    log_info "正在重启应用..."
    stop_container
    sleep 2
    start_container
    send_notification "重启完成" "应用已成功重启" "info"
}

# 完整部署
deploy() {
    log_info "开始完整部署流程..."

    check_environment
    check_docker
    build_image
    stop_container
    remove_container
    start_container

    log_info "🎉 部署完成！"
}

# 清理资源
cleanup() {
    log_info "正在清理资源..."
    
    stop_container
    remove_container
    
    # 删除镜像
    if docker images -q $IMAGE_NAME | grep -q .; then
        log_info "正在删除镜像 $IMAGE_NAME..."
        docker rmi $IMAGE_NAME:latest
    fi
    
    # 清理未使用的镜像和容器
    log_info "正在清理未使用的 Docker 资源..."
    docker system prune -f
    
    log_info "清理完成"
    send_notification "清理完成" "所有相关资源已清理" "info"
}

# 显示帮助信息
show_help() {
    echo -e "${PURPLE}资源搜索前端 Docker 部署脚本${NC}"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "可用命令:"
    echo "  deploy       - 完整部署 (构建镜像 + 启动容器)"
    echo "  build        - 仅构建 Docker 镜像"
    echo "  start        - 启动容器"
    echo "  stop         - 停止容器"
    echo "  restart      - 重启应用"
    echo "  logs         - 查看实时日志"
    echo "  status       - 查看容器状态"
    echo "  health       - 健康检查"
    echo "  setup-mirror - 配置Docker镜像源加速"
    echo "  cleanup      - 清理所有资源"
    echo "  help         - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 deploy          # 完整部署"
    echo "  $0 logs            # 查看实时日志"
    echo "  $0 restart         # 重启应用"
    echo ""
}

# 主函数
main() {
    case "${1:-help}" in
        "deploy")
            deploy
            ;;
        "build")
            check_environment
            check_docker
            build_image
            ;;
        "start")
            check_environment
            check_docker
            start_container
            ;;
        "stop")
            stop_container
            ;;
        "restart")
            restart_app
            ;;
        "logs")
            view_logs
            ;;
        "status")
            show_status
            ;;
        "health")
            check_health
            ;;
        "setup-mirror")
            setup_docker_mirror
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
