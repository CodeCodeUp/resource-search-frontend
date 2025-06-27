@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 资源搜索前端 Docker 部署脚本 (Windows版本)
:: 作者: 精盘搜团队
:: 版本: 1.0.0

:: 配置变量
set APP_NAME=resource-search-frontend
set CONTAINER_NAME=resource-search-frontend
set IMAGE_NAME=resource-search-frontend
set PORT=3000
set HOST_PORT=80

:: 颜色定义 (Windows CMD)
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set PURPLE=[95m
set CYAN=[96m
set NC=[0m

:: 获取当前时间
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (
    set current_date=%%a-%%b-%%c
)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
    set current_time=%%a:%%b
)

:: 日志函数
:log_info
echo %GREEN%[INFO]%NC% %current_date% %current_time% - %~1
goto :eof

:log_warn
echo %YELLOW%[WARN]%NC% %current_date% %current_time% - %~1
goto :eof

:log_error
echo %RED%[ERROR]%NC% %current_date% %current_time% - %~1
goto :eof

:log_debug
echo %BLUE%[DEBUG]%NC% %current_date% %current_time% - %~1
goto :eof

:: 通知函数
:send_notification
echo ===================================
echo 📢 %~1
echo 📝 %~2
echo ⏰ %current_date% %current_time%
echo ===================================
goto :eof

:: 检查Docker是否安装
:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker 未安装，请先安装 Docker Desktop"
    exit /b 1
)
for /f "tokens=*" %%i in ('docker --version') do (
    call :log_info "Docker 已安装，版本: %%i"
)
goto :eof

:: 检查容器状态
:check_container_status
docker ps -q -f name=%CONTAINER_NAME% >nul 2>&1
if not errorlevel 1 (
    set container_status=running
    goto :eof
)
docker ps -aq -f name=%CONTAINER_NAME% >nul 2>&1
if not errorlevel 1 (
    set container_status=stopped
    goto :eof
)
set container_status=not_exists
goto :eof

:: 构建镜像
:build_image
call :log_info "开始构建 Docker 镜像..."

if not exist "..\Dockerfile" (
    call :log_error "Dockerfile 不存在，请确保Dockerfile在项目根目录"
    exit /b 1
)

:: 从项目根目录构建，使用docker目录下的Dockerfile
cd ..
docker build -f docker\Dockerfile -t %IMAGE_NAME%:latest .
cd docker

if errorlevel 1 (
    call :log_error "Docker 镜像构建失败"
    call :send_notification "构建失败" "Docker 镜像 %IMAGE_NAME% 构建失败"
    exit /b 1
) else (
    call :log_info "Docker 镜像构建成功"
    call :send_notification "构建成功" "Docker 镜像 %IMAGE_NAME% 构建完成"
)
goto :eof

:: 停止容器
:stop_container
call :check_container_status
if "%container_status%"=="running" (
    call :log_info "正在停止容器 %CONTAINER_NAME%..."
    docker stop %CONTAINER_NAME%
    call :log_info "容器已停止"
) else if "%container_status%"=="stopped" (
    call :log_warn "容器 %CONTAINER_NAME% 已经停止"
) else (
    call :log_warn "容器 %CONTAINER_NAME% 不存在"
)
goto :eof

:: 删除容器
:remove_container
call :check_container_status
if not "%container_status%"=="not_exists" (
    call :log_info "正在删除容器 %CONTAINER_NAME%..."
    docker rm -f %CONTAINER_NAME% >nul 2>&1
    call :log_info "容器已删除"
)
goto :eof

:: 启动容器
:start_container
call :log_info "正在启动容器 %CONTAINER_NAME%..."

docker run -d --name %CONTAINER_NAME% --restart unless-stopped -p %HOST_PORT%:%PORT% %IMAGE_NAME%:latest

if errorlevel 1 (
    call :log_error "容器启动失败"
    call :send_notification "部署失败" "容器启动失败，请检查日志"
    exit /b 1
) else (
    call :log_info "容器启动成功"
    call :log_info "应用访问地址: http://localhost:%HOST_PORT%"
    call :send_notification "部署成功" "应用已成功部署并启动，访问地址: http://localhost:%HOST_PORT%"
    
    :: 等待几秒钟让容器完全启动
    timeout /t 3 /nobreak >nul
    call :check_health
)
goto :eof

:: 健康检查
:check_health
call :log_info "正在进行健康检查..."

set max_attempts=30
set attempt=1

:health_loop
curl -f -s http://localhost:%HOST_PORT% >nul 2>&1
if not errorlevel 1 (
    call :log_info "✅ 应用健康检查通过"
    goto :eof
)

call :log_debug "健康检查尝试 %attempt%/%max_attempts%..."
timeout /t 2 /nobreak >nul
set /a attempt+=1
if %attempt% leq %max_attempts% goto health_loop

call :log_warn "⚠️ 应用健康检查超时，请手动检查应用状态"
goto :eof

:: 查看实时日志
:view_logs
call :check_container_status
if "%container_status%"=="running" (
    call :log_info "显示容器 %CONTAINER_NAME% 的实时日志 (按 Ctrl+C 退出):"
    echo ----------------------------------------
    docker logs -f %CONTAINER_NAME%
) else (
    call :log_error "容器 %CONTAINER_NAME% 未运行"
    exit /b 1
)
goto :eof

:: 查看容器状态
:show_status
call :check_container_status

echo %CYAN%=== 容器状态信息 ===%NC%
echo 容器名称: %CONTAINER_NAME%
echo 镜像名称: %IMAGE_NAME%
echo 端口映射: %HOST_PORT%:%PORT%

if "%container_status%"=="running" (
    echo 状态: %GREEN%运行中%NC%
    for /f "tokens=*" %%i in ('docker ps -q -f name=%CONTAINER_NAME%') do echo 容器ID: %%i
    for /f "tokens=*" %%i in ('docker inspect -f "{{.State.StartedAt}}" %CONTAINER_NAME%') do echo 启动时间: %%i
    
    echo.
    echo %CYAN%=== 资源使用情况 ===%NC%
    docker stats %CONTAINER_NAME% --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
) else if "%container_status%"=="stopped" (
    echo 状态: %YELLOW%已停止%NC%
) else (
    echo 状态: %RED%不存在%NC%
)
goto :eof

:: 重启应用
:restart_app
call :log_info "正在重启应用..."
call :stop_container
timeout /t 2 /nobreak >nul
call :start_container
call :send_notification "重启完成" "应用已成功重启"
goto :eof

:: 完整部署
:deploy
call :log_info "开始完整部署流程..."

call :check_docker
if errorlevel 1 exit /b 1

call :build_image
if errorlevel 1 exit /b 1

call :stop_container
call :remove_container
call :start_container
if errorlevel 1 exit /b 1

call :log_info "🎉 部署完成！"
goto :eof

:: 清理资源
:cleanup
call :log_info "正在清理资源..."

call :stop_container
call :remove_container

:: 删除镜像
docker images -q %IMAGE_NAME% >nul 2>&1
if not errorlevel 1 (
    call :log_info "正在删除镜像 %IMAGE_NAME%..."
    docker rmi %IMAGE_NAME%:latest
)

:: 清理未使用的镜像和容器
call :log_info "正在清理未使用的 Docker 资源..."
docker system prune -f

call :log_info "清理完成"
call :send_notification "清理完成" "所有相关资源已清理"
goto :eof

:: 显示帮助信息
:show_help
echo %PURPLE%资源搜索前端 Docker 部署脚本 (Windows版本)%NC%
echo.
echo 用法: %~nx0 [命令]
echo.
echo 可用命令:
echo   deploy     - 完整部署 (构建镜像 + 启动容器)
echo   build      - 仅构建 Docker 镜像
echo   start      - 启动容器
echo   stop       - 停止容器
echo   restart    - 重启应用
echo   logs       - 查看实时日志
echo   status     - 查看容器状态
echo   health     - 健康检查
echo   cleanup    - 清理所有资源
echo   help       - 显示此帮助信息
echo.
echo 示例:
echo   %~nx0 deploy          # 完整部署
echo   %~nx0 logs            # 查看实时日志
echo   %~nx0 restart         # 重启应用
echo.
goto :eof

:: 主函数
:main
if "%~1"=="" goto show_help
if "%~1"=="deploy" goto deploy
if "%~1"=="build" (
    call :check_docker
    if not errorlevel 1 call :build_image
    goto :eof
)
if "%~1"=="start" (
    call :check_docker
    if not errorlevel 1 call :start_container
    goto :eof
)
if "%~1"=="stop" goto stop_container
if "%~1"=="restart" goto restart_app
if "%~1"=="logs" goto view_logs
if "%~1"=="status" goto show_status
if "%~1"=="health" goto check_health
if "%~1"=="cleanup" goto cleanup
if "%~1"=="help" goto show_help
if "%~1"=="-h" goto show_help
if "%~1"=="--help" goto show_help

call :log_error "未知命令: %~1"
call :show_help
exit /b 1

:: 执行主函数
call :main %*
