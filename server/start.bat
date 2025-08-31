@echo off
echo 🎬 启动歌词视频生成服务...
echo.

:: 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未检测到Node.js，请先安装Node.js
    echo 📥 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

:: 检查是否已安装依赖
if not exist node_modules (
    echo 📦 首次运行，正在安装依赖...
    npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
)

:: 检查FFmpeg是否安装
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  警告：未检测到FFmpeg，视频生成功能将无法使用
    echo 📥 请下载并安装FFmpeg：https://ffmpeg.org/download.html
    echo 💡 或使用chocolatey安装：choco install ffmpeg
    echo.
    echo 按任意键继续启动服务（视频功能将不可用）...
    pause
)

:: 启动服务
echo ✅ 正在启动服务...
echo 📡 服务地址：http://localhost:3001
echo 🎵 准备处理歌词视频生成请求...
echo.
echo 按 Ctrl+C 停止服务
echo.

node index.js 