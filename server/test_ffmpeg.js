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

// 测试FFmpeg的drawtext功能
async function testDrawtext() {
    console.log('🧪 测试FFmpeg drawtext功能');
    
    const outputPath = path.join(__dirname, 'test_drawtext.mp4');
    
    try {
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input('color=c=blue:s=1080x1920:d=10') // 10秒蓝色背景
                .inputOptions('-f', 'lavfi')
                .complexFilter([
                    // 基础背景
                    'color=c=blue:s=1080x1920:d=10[bg]',
                    // 添加测试文字1（0-5秒）
                    '[bg]drawtext=text=\'测试文字1\':fontsize=60:fontcolor=red:x=(w-text_w)/2:y=300:enable=\'between(t,0,5)\'[text1]',
                    // 添加测试文字2（2-7秒）
                    '[text1]drawtext=text=\'测试文字2\':fontsize=60:fontcolor=yellow:x=(w-text_w)/2:y=400:enable=\'between(t,2,7)\'[text2]',
                    // 添加时间显示（全程）
                    '[text2]drawtext=text=\'时间: %{pts\\:hms}\':fontsize=40:fontcolor=white:x=50:y=100[out]'
                ])
                .outputOptions('-map', '[out]')
                .outputOptions('-c:v', 'libx264')
                .outputOptions('-preset', 'fast')
                .outputOptions('-crf', '23')
                .output(outputPath)
                .on('start', (commandLine) => {
                    console.log('FFmpeg命令:', commandLine);
                })
                .on('progress', (progress) => {
                    console.log('进度:', progress.percent + '%');
                })
                .on('end', () => {
                    console.log('✅ 测试视频生成完成:', outputPath);
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

// 只有找到FFmpeg才运行测试
if (ffmpegPath) {
    testDrawtext();
} else {
    console.error('无法运行测试：FFmpeg未找到');
} 