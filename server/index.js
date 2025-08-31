const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { spawn } = require('child_process');

// 检测FFmpeg路径的函数
function detectFFmpegPath() {
    const possiblePaths = [
        'ffmpeg', // 系统PATH中
        'C:\\ffmpeg\\bin\\ffmpeg.exe',
        'C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe',
        'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe'
    ];
    
    for (const ffmpegPath of possiblePaths) {
        try {
            const { execSync } = require('child_process');
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

const app = express();
const PORT = process.env.PORT || process.argv[2] || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use('/output', express.static(path.join(__dirname, 'output')));

// 确保输出目录存在
const outputDir = path.join(__dirname, 'output');
const tempDir = path.join(__dirname, 'temp');
fs.ensureDirSync(outputDir);
fs.ensureDirSync(tempDir);

// 下载文件的工具函数
const downloadFile = async (url, filepath) => {
    console.log(`📥 开始下载: ${url}`);
    
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream',
            timeout: 120000, // 120秒超时
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        
        let downloadedBytes = 0;
        const totalBytes = parseInt(response.headers['content-length'] || '0');
        
        response.data.on('data', (chunk) => {
            downloadedBytes += chunk.length;
            if (totalBytes > 0) {
                const progress = ((downloadedBytes / totalBytes) * 100).toFixed(1);
                process.stdout.write(`\r📥 下载进度: ${progress}% (${(downloadedBytes / 1024 / 1024).toFixed(1)}MB / ${(totalBytes / 1024 / 1024).toFixed(1)}MB)`);
            }
        });
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                writer.destroy();
                reject(new Error('下载超时（120秒）'));
            }, 120000);
            
            writer.on('finish', () => {
                clearTimeout(timeout);
                console.log(`\n✅ 下载完成: ${filepath}`);
                resolve();
            });
            
            writer.on('error', (err) => {
                clearTimeout(timeout);
                console.log(`\n❌ 下载失败: ${err.message}`);
                reject(err);
            });
        });
    } catch (error) {
        console.log(`\n❌ 下载错误: ${error.message}`);
        throw error;
    }
};

// 生成静态歌词展示
const generateStaticLyricsDrawtext = (lyricsData, title, artist, escapedFontPath) => {
    console.log('=== 生成静态歌词展示 ===');
    console.log('歌词数据量:', lyricsData.length);
    
    if (!lyricsData || lyricsData.length === 0) {
        console.log('没有歌词数据，返回空过滤器');
        return [];
    }
    
    // 提取所有歌词文本，去除结构标记
    let rawText = '';
    lyricsData.forEach((item) => {
        const text = item.word.replace(/\[.*?\]/g, '').replace(/\n/g, '').trim();
        if (text && !isStructureTag(text)) {
            rawText += text;
        }
    });
    
    console.log('原始歌词文本:', rawText);
    
    // 简单分句：按主要标点符号分割，每个分割结果作为一句
    const simpleSentenceSplit = (text) => {
        // 按句号、问号、感叹号、逗号等分割
        const parts = text.split(/[。？！?!，、,]/).filter(part => part.trim().length > 0);
        
        // 每个分割结果就是一句，不再合并
        return parts.map(part => part.trim()).filter(part => part.length > 0);
    };
    
    const sentences = simpleSentenceSplit(rawText);
    console.log('智能分割后的句子:', sentences);
    
    // 严格控制每行只有两句，不超过
    const lines = [];
    const seenLines = new Set(); // 用于跟踪已经添加的行
    
    for (let i = 0; i < sentences.length; i += 2) {
        let line = sentences[i].trim();
        
        // 如果还有下一句，合并成一行（严格两句）
        if (i + 1 < sentences.length) {
            const nextSentence = sentences[i + 1].trim();
            line += '，' + nextSentence;
        }
        
        // 去重和长度检查
        if (line.length > 0 && !seenLines.has(line)) {
            lines.push(line);
            seenLines.add(line);
        }
    }
    
    // 使用 \n 作为换行符
    const fullLyrics = lines.join('\n');
    
    console.log('处理后的完整歌词:', fullLyrics);
    
    let drawtextFilters = [];
    
    // 添加黑色渐变蒙版（9:16比例）
    const gradientOverlay = "color=black@0.4:size=1080x1920";
    
    // 转义特殊字符
    const escapeText = (text) => {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/:/g, '\\:');
    };
    
    // 专门用于歌词的转义函数，保留换行符
    const escapeLyrics = (text) => {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/:/g, '\\:');
            // 不转义换行符，让FFmpeg直接处理原始的 \n
    };
    
    const escapedTitle = escapeText(title || '未知歌曲');
    const escapedArtist = escapeText(artist || '未知艺术家');
    const escapedLyrics = escapeLyrics(fullLyrics);
    
    // 歌曲标题 - 顶部居中，大字体（9:16比例调整）
    const titleFilter = `drawtext=text='${escapedTitle}':fontfile='${escapedFontPath}':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=300:shadowcolor=black:shadowx=3:shadowy=3`;
    drawtextFilters.push(titleFilter);
    
    // 艺术家名字 - 标题下方，使用指定字体
    const artistText = `by 你&${artist || 'LoneIN'}`;
    const escapedArtistText = escapeText(artistText);
    const artistFilter = `drawtext=text='${escapedArtistText}':fontfile='${escapedFontPath}':fontsize=30:fontcolor=white:x=(w-text_w)/2:y=380:shadowcolor=black:shadowx=2:shadowy=2`;
    drawtextFilters.push(artistFilter);
    
    // 歌词内容 - 中间位置，支持多行，字体大小调整为64（原来32的2倍）
    const lyricsFilter = `drawtext=text='${escapedLyrics}':fontfile='${escapedFontPath}':fontsize=50:fontcolor=white:x=(w-text_w)/2:y=580:shadowcolor=black:shadowx=2:shadowy=2:line_spacing=20`;
    drawtextFilters.push(lyricsFilter);
    
    console.log(`生成了 ${drawtextFilters.length} 个文字过滤器`);
    return { drawtextFilters, gradientOverlay };
};

// 移除标点符号的函数
const removePunctuation = (text) => {
    return text.replace(/[，。！？,;:.!?；：]/g, '').trim();
};

// 判断是否为结构标记的函数
const isStructureTag = (word) => {
    const cleanWord = word.trim();
    
    // 检查是否以方括号或花括号包围
    if (
        (cleanWord.startsWith('[') && cleanWord.endsWith(']')) ||
        (cleanWord.startsWith('{') && cleanWord.endsWith('}'))
    ) {
        return true;
    }
    
    // 检查是否包含结构关键词（不区分大小写）
    const structureKeywords = [
        'verse', 'chorus', 'hook', 'bridge', 'intro', 'outro', 
        'pre-chorus', 'refrain', 'breakdown', 'drop'
    ];
    
    const lowerWord = cleanWord.toLowerCase();
    return structureKeywords.some(keyword => {
        return lowerWord.includes(keyword) || 
               lowerWord.startsWith(keyword) ||
               new RegExp(`\\b${keyword}\\b`, 'i').test(cleanWord);
    });
};

// 时间格式转换 (秒 -> SRT格式)
const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
};

// 调用HitPaw去水印（可选）
const removeWatermark = async (inputPath, outputPath) => {
    // 这里需要根据HitPaw的实际命令行参数调整
    // 如果HitPaw不支持命令行，这个函数可以跳过
    return new Promise((resolve, reject) => {
        // 暂时直接复制文件，后续可以集成HitPaw
        fs.copy(inputPath, outputPath, (err) => {
            if (err) reject(err);
            else resolve(outputPath);
        });
    });
};

// 主要API：生成歌词视频
app.post('/generate-lyrics-video', async (req, res) => {
    try {
        console.log('收到视频生成请求:', req.body);
        
        // 检查FFmpeg是否可用
        if (!ffmpegPath) {
            return res.status(500).json({ 
                error: 'FFmpeg未安装或未找到。请安装FFmpeg并确保它在系统PATH中。\n\n安装方法：\n1. 使用winget: winget install ffmpeg\n2. 或下载：https://ffmpeg.org/download.html' 
            });
        }
        
        const { 
            audioUrl, 
            coverUrl, 
            title, 
            lyricsTimeline,
            removeWatermarkFlag = false 
        } = req.body;
        
        // 详细验证输入数据
        console.log('=== 输入数据验证 ===');
        console.log('audioUrl:', audioUrl);
        console.log('coverUrl:', coverUrl);
        console.log('title:', title);
        console.log('lyricsTimeline类型:', typeof lyricsTimeline);
        console.log('lyricsTimeline是否为数组:', Array.isArray(lyricsTimeline));
        console.log('lyricsTimeline长度:', lyricsTimeline?.length);
        
        if (lyricsTimeline && lyricsTimeline.length > 0) {
            console.log('前3个歌词数据项:', JSON.stringify(lyricsTimeline.slice(0, 3), null, 2));
            console.log('歌词数据结构示例:', {
                word: lyricsTimeline[0]?.word,
                start_s: lyricsTimeline[0]?.start_s,
                end_s: lyricsTimeline[0]?.end_s
            });
        }
        
        if (!audioUrl || !lyricsTimeline) {
            return res.status(400).json({ 
                error: '缺少必要参数：audioUrl 和 lyricsTimeline' 
            });
        }
        
        // 设置全局字体路径 - 解决路径中特殊字符问题
        const originalFontPath = path.join(__dirname, '..', 'src', 'assets', 'fonts', 'XinYeNianTi-2.otf');
        console.log('原始字体文件路径:', originalFontPath);
        console.log('字体文件是否存在:', fs.existsSync(originalFontPath));
        
        // 将字体复制到临时目录，使用简单文件名避免路径中的特殊字符问题
        const tempFontPath = path.join(tempDir, 'font.otf');
        if (fs.existsSync(originalFontPath)) {
            fs.copyFileSync(originalFontPath, tempFontPath);
            console.log('字体已复制到临时目录:', tempFontPath);
        }
        
        // 使用相对于当前工作目录的简单路径，避免特殊字符
        const relativeFontPath = path.relative(process.cwd(), tempFontPath).replace(/\\/g, '/');
        const escapedFontPath = relativeFontPath;
        console.log('最终字体路径:', escapedFontPath);
        
        // 测试字体是否能被FFmpeg正确加载
        try {
            const testCommand = `ffmpeg -f lavfi -i color=c=black:s=100x100:d=1 -vf "drawtext=text='测试':fontfile='${escapedFontPath}':fontsize=20:fontcolor=white:x=10:y=10" -y test_font.mp4`;
            console.log('字体测试命令:', testCommand);
        } catch (err) {
            console.log('字体测试准备失败:', err.message);
        }
        
        const timestamp = Date.now();
        const audioPath = path.join(tempDir, `audio_${timestamp}.mp3`);
        const coverPath = path.join(tempDir, `cover_${timestamp}.jpg`);
        const subtitlePath = path.join(tempDir, `subtitles_${timestamp}.srt`);
        const outputPath = path.join(outputDir, `lyrics_video_${timestamp}.mp4`);
        
        // 1. 下载音频文件
        console.log('下载音频文件...');
        await downloadFile(audioUrl, audioPath);
        
        // 2. 下载封面图片
        if (coverUrl) {
            console.log('下载封面图片...');
            await downloadFile(coverUrl, coverPath);
        }
        
        // 3. 生成字幕文件和drawtext过滤器
        console.log('生成歌词显示...');
        console.log('接收到的lyricsTimeline数据:', JSON.stringify(lyricsTimeline.slice(0, 3), null, 2));
        console.log('lyricsTimeline总数据量:', lyricsTimeline.length);
        
        // 4. 生成静态歌词展示视频
        console.log('开始生成静态歌词视频...');
        
        // 生成静态歌词展示
        const staticLyricsResult = generateStaticLyricsDrawtext(lyricsTimeline, title, 'LoneIN', escapedFontPath);
        const { drawtextFilters, gradientOverlay } = staticLyricsResult;
        
        let ffmpegCommand;

        if (coverUrl) {
            // 有封面图片的情况：创建模糊背景 + 流光特效 + 黑色渐变蒙版 + 静态歌词（9:16比例）
            let filters = [
                // 创建模糊的封面背景（9:16比例）
                '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=20[bg_blur]',
                // 添加流光特效 - 创建多个移动的橙黄色光球
                `[bg_blur]drawbox=x='100+200*sin(t*0.5)':y='300+150*cos(t*0.3)':w=80:h=80:color=orange@0.3:t=fill,` +
                `drawbox=x='800+150*cos(t*0.4)':y='500+200*sin(t*0.6)':w=60:h=60:color=yellow@0.25:t=fill,` +
                `drawbox=x='300+180*sin(t*0.7)':y='800+120*cos(t*0.5)':w=100:h=100:color=orange@0.2:t=fill,` +
                `drawbox=x='600+160*cos(t*0.3)':y='1200+180*sin(t*0.4)':w=70:h=70:color=yellow@0.3:t=fill,` +
                `drawbox=x='900+140*sin(t*0.6)':y='1000+160*cos(t*0.7)':w=90:h=90:color=orange@0.25:t=fill[bg_with_lights]`,
                // 创建黑色渐变蒙版
                `[bg_with_lights]drawbox=x=0:y=0:w=1080:h=1920:color=black@0.2:t=fill[bg_with_mask]`
            ];
            
            // 添加所有文字过滤器
            let currentFilter = '[bg_with_mask]';
            drawtextFilters.forEach((filter, idx) => {
                const nextFilter = idx === drawtextFilters.length - 1 ? '[out]' : `[text${idx}]`;
                filters.push(`${currentFilter}${filter}${nextFilter}`);
                currentFilter = `[text${idx}]`;
            });
            
            ffmpegCommand = ffmpeg()
                .input(coverPath)  // 第一个输入：封面图片
                .input(audioPath)  // 第二个输入：音频
                .inputOptions('-t', '180') // 限制3分钟
                .complexFilter(filters)
                .outputOptions('-map', '[out]')  // 映射视频输出
                .outputOptions('-map', '1:a')    // 映射音频（第二个输入）
                .outputOptions('-c:a', 'aac')
                .outputOptions('-c:v', 'libx264')
                .outputOptions('-preset', 'fast')
                .outputOptions('-crf', '23')
                .output(outputPath);
        } else {
            // 没有封面图片的情况：创建纯色背景 + 静态歌词（9:16比例）
            let filters = [
                'color=c=#1a1a2e:s=1080x1920:d=180[bg_base]',
                '[bg_base]drawbox=x=0:y=0:w=1080:h=1920:color=black@0.15:t=fill[bg_with_mask]'
            ];
            
            // 添加所有文字过滤器
            let currentFilter = '[bg_with_mask]';
            drawtextFilters.forEach((filter, idx) => {
                const nextFilter = idx === drawtextFilters.length - 1 ? '[out]' : `[text${idx}]`;
                filters.push(`${currentFilter}${filter}${nextFilter}`);
                currentFilter = `[text${idx}]`;
            });
            
            ffmpegCommand = ffmpeg()
                .input(audioPath)  // 第一个输入：音频
                .inputOptions('-t', '180') // 限制3分钟
                .complexFilter(filters)
                .outputOptions('-map', '[out]')  // 映射视频输出
                .outputOptions('-map', '0:a')    // 映射音频（第一个输入）
                .outputOptions('-c:a', 'aac')
                .outputOptions('-c:v', 'libx264')
                .outputOptions('-preset', 'fast')
                .outputOptions('-crf', '23')
                .output(outputPath);
        }
            
        console.log('开始FFmpeg处理，使用静态歌词展示...');
        
        await new Promise((resolve, reject) => {
            ffmpegCommand
                .on('start', (commandLine) => {
                    console.log('FFmpeg命令:', commandLine);
                })
                .on('progress', (progress) => {
                    console.log('处理进度:', progress.percent + '%');
                })
                .on('end', () => {
                    console.log('视频生成完成');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('FFmpeg错误:', err);
                    reject(err);
                })
                .run();
        });
        
        // 5. 可选：去水印处理
        let finalVideoPath = outputPath;
        if (removeWatermarkFlag) {
            const watermarkFreePath = path.join(outputDir, `no_watermark_${timestamp}.mp4`);
            await removeWatermark(outputPath, watermarkFreePath);
            finalVideoPath = watermarkFreePath;
        }
        
        // 6. 返回结果
        const videoUrl = `http://localhost:${PORT}/output/${path.basename(finalVideoPath)}`;
        
        res.json({
            success: true,
            videoUrl: videoUrl,
            message: '歌词视频生成成功'
        });
        
        // 清理临时文件
        setTimeout(() => {
            fs.remove(audioPath).catch(console.error);
            fs.remove(coverPath).catch(console.error);
            fs.remove(subtitlePath).catch(console.error);
        }, 5000);
        
    } catch (error) {
        console.error('视频生成错误:', error);
        res.status(500).json({ 
            error: '视频生成失败: ' + error.message 
        });
    }
});

// 健康检查接口
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: '歌词视频服务运行正常' });
});

app.listen(PORT, () => {
    console.log(`🎬 歌词视频服务启动成功！`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🎵 准备处理歌词视频生成请求...`);
});