const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const { execSync } = require('child_process');

// FFmpeg路径检测函数（与主服务器相同）
function detectFFmpegPath() {
    const possiblePaths = [
        'ffmpeg', // 系统PATH中
        'C:\\ffmpeg\\bin\\ffmpeg.exe',
        'C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe',
        'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe'
    ];
    
    for (const ffmpegPath of possiblePaths) {
        try {
            execSync(`"${ffmpegPath}" -version`, { stdio: 'pipe' });
            console.log(`✅ 找到FFmpeg: ${ffmpegPath}`);
            return ffmpegPath;
        } catch (error) {
            // 继续尝试下一个路径
        }
    }
    
    console.error('❌ 未找到FFmpeg，请安装FFmpeg');
    return null;
}

// 配置FFmpeg路径
const ffmpegPath = detectFFmpegPath();
if (ffmpegPath && ffmpegPath !== 'ffmpeg') {
    ffmpeg.setFfmpegPath(ffmpegPath);
    const ffprobePath = ffmpegPath.replace('ffmpeg.exe', 'ffprobe.exe');
    ffmpeg.setFfprobePath(ffprobePath);
}

// 测试在现有视频上添加文字
async function testDrawtextOnVideo() {
    console.log('🧪 测试在现有视频上添加文字');
    
    const inputPath = path.join(__dirname, 'output');
    const outputPath = path.join(__dirname, 'test_with_text.mp4');
    
    try {
        // 列出output目录中的视频文件
        const fs = require('fs');
        const files = fs.readdirSync(inputPath).filter(f => f.endsWith('.mp4'));
        
        if (files.length === 0) {
            console.log('❌ 没有找到视频文件进行测试');
            return;
        }
        
        const videoFile = path.join(inputPath, files[0]);
        console.log('使用视频文件:', videoFile);
        
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(videoFile)
                .complexFilter([
                    // 在原视频上添加测试文字
                    '[0:v]drawtext=text=\'测试文字叠加\':fontsize=80:fontcolor=red:x=(w-text_w)/2:y=200:box=1:boxcolor=black@0.5:boxborderw=5[out]'
                ])
                .outputOptions('-map', '[out]')
                .outputOptions('-map', '0:a') // 保留音频
                .outputOptions('-c:v', 'libx264')
                .outputOptions('-c:a', 'copy') // 复制音频不重编码
                .outputOptions('-t', '10') // 只处理前10秒
                .output(outputPath)
                .on('start', (commandLine) => {
                    console.log('FFmpeg命令:', commandLine);
                })
                .on('progress', (progress) => {
                    console.log('进度:', Math.round(progress.percent || 0) + '%');
                })
                .on('end', () => {
                    console.log('✅ 测试视频生成完成:', outputPath);
                    console.log('请检查视频是否有红色文字叠加');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('❌ FFmpeg错误:', err);
                    reject(err);
                })
                .run();
        });
    } catch (error) {
        console.error('测试失败:', error);
    }
}

// 运行测试
if (ffmpegPath) {
    testDrawtextOnVideo();
} else {
    console.error('无法运行测试：FFmpeg未找到');
} 