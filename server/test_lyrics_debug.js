const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

// FFmpeg路径检测函数
function detectFFmpegPath() {
    const possiblePaths = [
        'ffmpeg',
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
    
    console.error('❌ 未找到FFmpeg');
    return null;
}

// 配置FFmpeg路径
const ffmpegPath = detectFFmpegPath();
if (ffmpegPath && ffmpegPath !== 'ffmpeg') {
    ffmpeg.setFfmpegPath(ffmpegPath);
    const ffprobePath = ffmpegPath.replace('ffmpeg.exe', 'ffprobe.exe');
    ffmpeg.setFfprobePath(ffprobePath);
}

// 模拟真实的歌词数据
const testLyricsData = [
    { word: "Hello", start_s: 1.0, end_s: 2.0 },
    { word: "World", start_s: 2.5, end_s: 3.5 },
    { word: "这是", start_s: 4.0, end_s: 5.0 },
    { word: "测试", start_s: 5.5, end_s: 6.5 },
    { word: "歌词", start_s: 7.0, end_s: 8.0 }
];

// 生成歌词drawtext过滤器（简化版）
function generateLyricsDrawtext(lyricsData) {
    console.log('=== 生成歌词drawtext过滤器 ===');
    console.log('歌词数据量:', lyricsData.length);
    
    let drawtextFilters = [];
    
    // 添加固定测试文本
    console.log('🔧 添加固定测试歌词（0-10秒）');
    drawtextFilters.push(`drawtext=text='测试歌词显示':fontsize=60:fontcolor=red:x=(w-text_w)/2:y=h-300:enable='between(t,0,10)'`);
    
    // 添加实际歌词
    lyricsData.forEach((lyric, index) => {
        const cleanText = lyric.word.replace(/'/g, "\\'");
        const filter = `drawtext=text='${cleanText}':fontsize=50:fontcolor=yellow:x=(w-text_w)/2:y=h-200:enable='between(t,${lyric.start_s},${lyric.end_s})'`;
        drawtextFilters.push(filter);
        console.log(`歌词${index + 1}: ${cleanText} (${lyric.start_s}s-${lyric.end_s}s)`);
    });
    
    console.log(`总共生成 ${drawtextFilters.length} 个过滤器`);
    return drawtextFilters;
}

// 测试歌词视频生成
async function testLyricsVideo() {
    console.log('🧪 测试歌词视频生成');
    
    const outputPath = path.join(__dirname, 'test_lyrics_debug.mp4');
    
    try {
        // 使用现有的视频作为输入
        const inputPath = path.join(__dirname, 'output');
        const videoFiles = fs.readdirSync(inputPath).filter(f => f.endsWith('.mp4'));
        
        if (videoFiles.length === 0) {
            console.log('❌ 没有找到视频文件');
            return;
        }
        
        const inputVideo = path.join(inputPath, videoFiles[0]);
        console.log('使用输入视频:', inputVideo);
        
        // 生成歌词过滤器
        const lyricsFilters = generateLyricsDrawtext(testLyricsData);
        
        // 构建复杂过滤器
        const complexFilters = [];
        
        // 添加基础视频处理
        complexFilters.push('[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg]');
        
        // 添加歌词过滤器
        let currentLabel = 'bg';
        lyricsFilters.forEach((filter, index) => {
            const nextLabel = index === lyricsFilters.length - 1 ? 'out' : `lyrics_${index}`;
            const completeFilter = `[${currentLabel}]${filter}[${nextLabel}]`;
            complexFilters.push(completeFilter);
            console.log(`添加过滤器 ${index}:`, completeFilter);
            currentLabel = nextLabel;
        });
        
        const filterComplex = complexFilters.join(';');
        console.log('🔍 完整过滤器字符串:');
        console.log(filterComplex);
        
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(inputVideo)
                .complexFilter(filterComplex)
                .outputOptions('-map', '[out]')
                .outputOptions('-map', '0:a')
                .outputOptions('-c:v', 'libx264')
                .outputOptions('-c:a', 'copy')
                .outputOptions('-t', '15') // 只处理前15秒
                .output(outputPath)
                .on('start', (commandLine) => {
                    console.log('🚀 FFmpeg命令:');
                    console.log(commandLine);
                })
                .on('progress', (progress) => {
                    console.log('进度:', Math.round(progress.percent || 0) + '%');
                })
                .on('end', () => {
                    console.log('✅ 调试视频生成完成:', outputPath);
                    console.log('请检查视频中是否有文字显示！');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('❌ FFmpeg错误:', err);
                    console.error('错误详情:', err.message);
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
    testLyricsVideo();
} else {
    console.error('无法运行测试：FFmpeg未找到');
} 