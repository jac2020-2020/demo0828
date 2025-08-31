# 🎬 歌词视频生成服务

## 📋 功能说明

这是一个本地Node.js服务，用于生成歌词同步视频。支持：

- ✅ 基于Suno音乐和歌词时间轴生成视频
- ✅ 自动下载音频和封面图片
- ✅ 使用FFmpeg合成歌词视频
- ✅ 可选的水印移除功能
- ✅ 竖屏视频格式（1080x1920）

## 🚀 快速开始

### 1. 安装依赖

#### 安装Node.js
- 下载：https://nodejs.org/
- 推荐版本：16.x 或更高

#### 安装FFmpeg
**方法一：直接下载**
- 下载：https://ffmpeg.org/download.html
- 解压后将ffmpeg.exe添加到系统PATH

**方法二：使用Chocolatey（推荐）**
```bash
# 以管理员身份运行PowerShell
choco install ffmpeg
```

### 2. 启动服务

#### 方法一：使用批处理脚本（推荐）
```bash
# 双击运行
start.bat
```

#### 方法二：手动启动
```bash
# 安装依赖
npm install

# 启动服务
npm start
```

### 3. 验证服务

访问：http://localhost:3001/health

应该看到：
```json
{
  "status": "ok",
  "message": "歌词视频服务运行正常"
}
```

## 🎯 API接口

### 生成歌词视频

**请求**：
```http
POST http://localhost:3001/generate-lyrics-video
Content-Type: application/json

{
  "audioUrl": "https://example.com/audio.mp3",
  "coverUrl": "https://example.com/cover.jpg",
  "title": "歌曲标题",
  "lyricsTimeline": [
    {
      "start_s": 0.4,
      "end_s": 2.1,
      "word": "歌词内容",
      "success": true,
      "p_align": 1
    }
  ],
  "removeWatermarkFlag": false
}
```

**响应**：
```json
{
  "success": true,
  "videoUrl": "http://localhost:3001/output/lyrics_video_1234567890.mp4",
  "message": "歌词视频生成成功"
}
```

## 🔧 配置说明

### 视频参数
- **分辨率**：1080x1920（竖屏）
- **帧率**：30fps
- **编码**：H.264 + AAC
- **字幕样式**：微软雅黑，48px，白色，黑色描边

### 目录结构
```
server/
├── index.js          # 主服务文件
├── package.json      # 依赖配置
├── start.bat         # 启动脚本
├── temp/             # 临时文件目录
└── output/           # 输出视频目录
```

## 🐛 常见问题

### Q: 服务启动失败
A: 检查端口3001是否被占用，或修改index.js中的PORT变量

### Q: FFmpeg命令失败
A: 确保FFmpeg已正确安装并添加到系统PATH

### Q: 字幕不显示
A: 检查字体是否存在，可能需要调整字体名称

### Q: 视频生成很慢
A: 正常现象，3分钟音乐大约需要1-2分钟生成时间

## 🔮 后续扩展

- [ ] 支持更多视频模板
- [ ] 集成HitPaw去水印功能
- [ ] 添加视频预览功能
- [ ] 支持自定义字幕样式
- [ ] 添加进度回调接口 