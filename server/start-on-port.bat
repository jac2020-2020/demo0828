@echo off
setlocal enabledelayedexpansion

:: 获取端口参数，默认为3000
set PORT=%1
if "%PORT%"=="" set PORT=3000

echo.
echo ╔════════════════════════════════════════╗
echo ║         动态端口歌词视频服务           ║
echo ╚════════════════════════════════════════╝
echo.
echo 🚀 正在启动服务...
echo 📡 服务端口：%PORT%
echo 🔗 健康检查：http://localhost:%PORT%/health
echo.

:: 启动服务
node index.js %PORT% 