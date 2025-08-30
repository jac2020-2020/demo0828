<template>
    <div class="music-player-page">
        <!-- 背景封面 -->
        <div class="background-cover" :style="{ backgroundImage: `url(${musicData?.imageUrl})` }">
            <div class="background-overlay"></div>
        </div>
        

        
        <!-- 顶部导航 -->
        <div class="top-nav">
            <button class="nav-btn back-btn" @click="goBack">
                <ArrowLeft :size="20" color="white" />
            </button>
        </div>
        
        <!-- 主要内容区域 -->
        <div class="main-content">
            <!-- 封面和音乐信息区域 -->
            <div class="cover-info-section">
                <!-- 大尺寸封面 -->
                <div v-if="!showLyrics" class="large-cover" @click="toggleLyrics">
                    <img :src="musicData?.imageUrl" :alt="musicData?.title" />
                </div>
                
                <!-- 歌词显示区域 -->
                <div v-if="showLyrics" class="lyrics-display" @click="toggleLyrics" @scroll="onLyricsScroll" ref="lyricsDisplayRef">
                    <div v-if="isLoadingLyrics" class="loading-lyrics">
                        <p>正在获取歌词时间线...</p>
                    </div>
                    <div v-else-if="lyrics.length === 0" class="no-lyrics">
                        <p>暂无歌词</p>
                        <p class="no-lyrics-tip">点击此处关闭歌词</p>
                    </div>
                    <div v-else class="lyrics-content">
                        <div 
                            v-for="(lyric, index) in lyrics" 
                            :key="index"
                            class="lyric-line"
                            :class="{ 'active': index === currentLyricIndex }"
                        >
                            {{ lyric.text }}
                        </div>
                    </div>
                </div>
                
                <!-- 音乐信息 -->
                <div v-if="!showLyrics" class="music-info">
                    <h1 class="music-title">{{ musicData?.title || '夜行人' }}</h1>
                    <p class="music-artist">{{ musicData?.artist || '用户A' }}</p>
                </div>
            </div>
            
            <!-- 进度条 -->
            <div class="progress-container">
                <span class="time-current">{{ formatTime(currentTime) }}</span>
                <div 
                    class="progress-bar" 
                    ref="progressBarRef"
                    @click="onProgressClick"
                    @mousedown="onProgressMouseDown"
                >
                    <div 
                        class="progress-fill"
                        :style="{ width: progressPercent + '%' }"
                    ></div>
                    <div 
                        class="progress-thumb"
                        :style="{ left: progressPercent + '%' }"
                        @mousedown.stop="onThumbMouseDown"
                    ></div>
                </div>
                <span class="time-total">{{ formatTime(totalTime) }}</span>
            </div>
            
            <!-- 播放控制按钮 -->
            <div class="player-controls">
                <button class="control-btn prev-btn" @click="previousTrack">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                    </svg>
                </button>
                
                <button class="control-btn play-pause-btn" @click="togglePlayPause">
                    <svg v-if="!isPlaying" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="none">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="none">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                </button>
                
                <button class="control-btn next-btn" @click="nextTrack">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                    </svg>
                </button>
            </div>
        </div>
        

        
        <!-- 隐藏的音频元素 -->
        <audio 
            ref="audioPlayer"
            :src="musicData?.audioUrl"
            @timeupdate="updateProgress"
            @loadedmetadata="updateDuration"
            @ended="onTrackEnd"
        ></audio>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import { getLyricsTimeline, type LyricsAlignment } from '@/services/musicApi';
import { cloudStorage } from '@/services/cloudStorage';
import { lyricsCache, type LyricLine } from '@/services/lyricsCache';

const router = useRouter();
const route = useRoute();

// 音乐数据
const musicData = ref<any>(null);
const isPlaying = ref(false);
const currentTime = ref(105); // 1:45
const totalTime = ref(200); // 3:20
const audioPlayer = ref<HTMLAudioElement>();
const lyricsDisplayRef = ref<HTMLElement>();

// 进度条相关
const progressBarRef = ref<HTMLElement>();
const isDragging = ref(false);
const dragProgress = ref(0);

// 计算进度百分比
const progressPercent = computed(() => {
    if (isDragging.value) {
        return dragProgress.value;
    }
    return totalTime.value > 0 ? (currentTime.value / totalTime.value) * 100 : 0;
});

// 歌词相关
const showLyrics = ref(false);
const currentLyricIndex = ref(-1); // 初始化为-1，表示没有高亮
const lyrics = ref<LyricLine[]>([]);
const isLoadingLyrics = ref(false);
const isUserScrolling = ref(false);
const scrollTimeout = ref<number | null>(null);

// 歌词缓存现在使用全局缓存管理器 (来自 @/services/lyricsCache)

// 按换行符处理歌词的函数
const processLyricsByNewlines = (alignmentData: any[]): LyricLine[] => {
    const sentences: LyricLine[] = [];
    
    // 将所有词组合成完整文本，并建立更精确的时间映射
    let fullText = '';
    const charToTimeMap: Array<{ char: number; time: number }> = [];
    let charIndex = 0;
    
    alignmentData.forEach(item => {
        const word = item.word;
        // 为这个词的每个字符记录时间
        for (let i = 0; i < word.length; i++) {
            charToTimeMap.push({
                char: charIndex + i,
                time: item.start_s
            });
        }
        fullText += word;
        charIndex += word.length;
    });
    
    console.log('完整歌词文本:', fullText);
    console.log('字符时间映射总数:', charToTimeMap.length);
    
    // 按换行符分割
    const lines = fullText.split('\n');
    let currentCharIndex = 0;
    
    lines.forEach((line, lineIndex) => {
        const trimmedLine = line.trim();
        
        // 跳过空行
        if (!trimmedLine) {
            currentCharIndex += line.length + 1; // +1 for \n
            return;
        }
        
        // 过滤结构标记
        if (isStructureTag(trimmedLine)) {
            console.log('跳过结构标记:', trimmedLine);
            currentCharIndex += line.length + 1;
            return;
        }
        
        // 移除标点符号
        const cleanLine = removePunctuation(trimmedLine);
        if (cleanLine) {
            // 找到这一行的开始时间 - 查找最接近的时间映射
            let lineStartTime = 0;
            for (const mapping of charToTimeMap) {
                if (mapping.char >= currentCharIndex) {
                    lineStartTime = mapping.time;
                    break;
                }
            }
            
            sentences.push({
                time: lineStartTime,
                text: cleanLine
            });
            
            console.log(`添加歌词行 ${lineIndex + 1}: "${cleanLine}" 时间: ${lineStartTime}s`);
        }
        
        currentCharIndex += line.length + 1; // +1 for \n
    });
    
    // 按时间排序，确保歌词按正确的时间顺序排列
    sentences.sort((a, b) => a.time - b.time);
    
    console.log('最终歌词数组（已排序）:', sentences);
    return sentences;
};

// 移除标点符号的函数
const removePunctuation = (text: string): string => {
    return text.replace(/[，。！？,;:.!?；：]/g, '').trim();
};

// 判断是否为结构标记的函数
const isStructureTag = (word: string): boolean => {
    const cleanWord = word.trim();
    
    // 检查是否以方括号或花括号包围
    if (
        (cleanWord.startsWith('[') && cleanWord.endsWith(']')) ||
        (cleanWord.startsWith('{') && cleanWord.endsWith('}'))
    ) {
        console.log('检测到结构标记（括号）:', cleanWord);
        return true;
    }
    
    // 检查是否包含结构关键词（不区分大小写）
    const structureKeywords = [
        'verse', 'chorus', 'hook', 'bridge', 'intro', 'outro', 
        'pre-chorus', 'refrain', 'breakdown', 'drop'
    ];
    
    const lowerWord = cleanWord.toLowerCase();
    const isStructure = structureKeywords.some(keyword => {
        const hasKeyword = lowerWord.includes(keyword) || 
                          lowerWord.startsWith(keyword) ||
                          new RegExp(`\\b${keyword}\\b`, 'i').test(cleanWord);
        if (hasKeyword) {
            console.log('检测到结构标记（关键词）:', cleanWord, '匹配:', keyword);
        }
        return hasKeyword;
    });
    
    return isStructure;
};

// 从API获取精确的歌词时间线（带缓存）
const fetchLyricsTimeline = async (musicId: string) => {
    if (!musicId) return;
    
    // 检查缓存
    if (lyricsCache.has(musicId)) {
        console.log('使用缓存的歌词数据:', musicId);
        lyrics.value = lyricsCache.get(musicId) || [];
        return;
    }
    
    try {
        isLoadingLyrics.value = true;
        console.log('获取歌词时间线，musicId:', musicId);
        
        const response = await getLyricsTimeline(musicId);
        
        if (response.data?.alignment?.length > 0) {
            // 将单个字组合成句子
            const alignmentData = response.data.alignment.filter(item => item.success && item.word.trim());
            console.log('原始API数据:', alignmentData.map(item => item.word));
            
            const groupedLyrics = processLyricsByNewlines(alignmentData);
            
            // 缓存歌词数据
            lyricsCache.set(musicId, groupedLyrics);
            lyrics.value = groupedLyrics;
            console.log('成功获取歌词时间线并缓存:', groupedLyrics);
        } else {
            console.log('API返回的歌词数据为空，使用备用解析方法');
            // 如果API没有返回歌词，使用原来的解析方法
            if (musicData.value?.prompt) {
                const backupLyrics = parseLyricsBackup(musicData.value.prompt);
                lyricsCache.set(musicId, backupLyrics);
                lyrics.value = backupLyrics;
            }
        }
    } catch (error) {
        console.error('获取歌词时间线失败:', error);
        // 如果API调用失败，使用备用解析方法
        if (musicData.value?.prompt) {
            const backupLyrics = parseLyricsBackup(musicData.value.prompt);
            lyricsCache.set(musicId, backupLyrics);
            lyrics.value = backupLyrics;
        }
    } finally {
        isLoadingLyrics.value = false;
    }
};

// 备用的歌词解析函数（当API不可用时使用）
const parseLyricsBackup = (lyricsText: string): LyricLine[] => {
    if (!lyricsText) return [];
    
    let actualLyrics = lyricsText;
    
    // 首先检查是否是JSON格式的响应
    try {
        const jsonResponse = JSON.parse(lyricsText);
        if (jsonResponse.lyrics) {
            // 如果是JSON格式，提取lyrics字段
            actualLyrics = jsonResponse.lyrics;
            console.log('检测到JSON格式，提取lyrics字段:', actualLyrics);
        }
    } catch (e) {
        // 如果不是JSON格式，继续使用原始文本
        console.log('不是JSON格式，使用原始文本解析歌词');
    }
    
    // 进一步清理可能残留的JSON语法元素
    actualLyrics = actualLyrics
        .replace(/^["']|["']$/g, '') // 移除开头和结尾的引号
        .replace(/\\n/g, '\n') // 将转义的换行符转换为真实换行符
        .replace(/\\"/g, '"') // 将转义的引号转换为普通引号
        .replace(/^\s*{\s*$|^\s*}\s*$/gm, '') // 移除单独的大括号行
        .replace(/^\s*"title"\s*:\s*"[^"]*"\s*,?\s*$/gm, '') // 移除title行
        .replace(/^\s*"lyrics"\s*:\s*"?/gm, '') // 移除lyrics标记的开头
        .replace(/,?\s*$/gm, '') // 移除行尾的逗号
        .replace(/"\s*$/gm, '') // 移除行尾的引号
        .trim();
    
    const lines = actualLyrics.split('\n');
    const parsedLyrics: LyricLine[] = [];
    
    let currentTime = 0;
    const timeIncrement = 3; // 每行歌词间隔3秒
    
    lines.forEach((line) => {
        const trimmedLine = line.trim();
        
        // 跳过空行
        if (!trimmedLine) {
            return;
        }
        
        // 跳过JSON残留元素
        if (trimmedLine.match(/^["']|["']$|^{\s*$|^}\s*$|"title"|"lyrics"/)) {
            console.log('备用方法跳过JSON元素:', trimmedLine);
            return;
        }
        
        // 过滤结构标记
        if (isStructureTag(trimmedLine)) {
            console.log('备用方法跳过结构标记:', trimmedLine);
            return;
        }
        
        // 移除标点符号
        const cleanLine = removePunctuation(trimmedLine);
        if (cleanLine) {
            parsedLyrics.push({
                time: currentTime,
                text: cleanLine
            });
            currentTime += timeIncrement;
            console.log('备用方法添加歌词行:', cleanLine);
        }
    });
    
    console.log('备用方法最终歌词数组:', parsedLyrics);
    return parsedLyrics;
};



// 歌词控制函数
const toggleLyrics = () => {
    showLyrics.value = !showLyrics.value;
    
    // 显示歌词时重置高亮索引
    if (showLyrics.value) {
        currentLyricIndex.value = -1;
        console.log('显示歌词，重置高亮索引');
    }
};

const updateLyrics = () => {
    if (!showLyrics.value || lyrics.value.length === 0 || isDragging.value) return;
    
    const currentTimeInSeconds = currentTime.value;
    let newIndex = -1;
    
    // 找到当前时间应该高亮的歌词行
    for (let i = 0; i < lyrics.value.length; i++) {
        if (currentTimeInSeconds >= lyrics.value[i].time) {
            newIndex = i;
        } else {
            break;
        }
    }
    
    // 如果没有找到合适的歌词行，保持为-1（不高亮任何行）
    if (newIndex === -1) {
        if (currentLyricIndex.value !== -1) {
            currentLyricIndex.value = -1;
            console.log(`时间 ${currentTimeInSeconds.toFixed(1)}s: 无歌词高亮`);
        }
        return;
    }
    
    if (newIndex !== currentLyricIndex.value) {
        const oldIndex = currentLyricIndex.value;
        currentLyricIndex.value = newIndex;
        
        console.log(`时间 ${currentTimeInSeconds.toFixed(1)}s: 歌词高亮从第${oldIndex + 1}行切换到第${newIndex + 1}行: "${lyrics.value[newIndex].text}"`);
        
        // 只有在用户没有手动滚动时才自动滚动到当前歌词
        if (!isUserScrolling.value) {
            nextTick(() => {
                const activeElement = document.querySelector('.lyric-line.active');
                if (activeElement) {
                    activeElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            });
        }
    }
};

// 处理歌词滚动事件
const onLyricsScroll = () => {
    // 用户开始滚动
    isUserScrolling.value = true;
    
    // 清除之前的超时
    if (scrollTimeout.value) {
        clearTimeout(scrollTimeout.value);
    }
    
    // 3秒后重新启用自动滚动
    scrollTimeout.value = window.setTimeout(() => {
        isUserScrolling.value = false;
    }, 3000);
};



// 生命周期
onMounted(async () => {
    // 从路由参数获取音乐数据
    if (route.query.musicData) {
        try {
            musicData.value = JSON.parse(route.query.musicData as string);
            console.log('音乐数据:', musicData.value);
            
            // 自动获取歌词时间线
            if (musicData.value?.musicId) {
                await fetchLyricsTimeline(musicData.value.musicId);
            } else if (musicData.value?.prompt) {
                // 如果没有musicId，使用备用解析方法
                const backupLyrics = parseLyricsBackup(musicData.value.prompt);
                lyrics.value = backupLyrics;
                console.log('使用备用方法解析的歌词:', backupLyrics);
            }
        } catch (e) {
            console.error('解析音乐数据失败:', e);
        }
    }
    
    // 设置默认数据
    if (!musicData.value) {
        musicData.value = {
            title: '夜行人',
            artist: '用户A',
            imageUrl: '/api/placeholder/300/300',
            audioUrl: '/api/placeholder/audio.mp3'
        };
    }
});

// 方法
const goBack = () => {
    router.back();
};


const togglePlayPause = () => {
    if (audioPlayer.value) {
        if (isPlaying.value) {
            audioPlayer.value.pause();
        } else {
            audioPlayer.value.play();
        }
        isPlaying.value = !isPlaying.value;
    }
};

const previousTrack = () => {
    console.log('上一首');
};

const nextTrack = () => {
    console.log('下一首');
};

const updateProgress = () => {
    if (audioPlayer.value) {
        currentTime.value = audioPlayer.value.currentTime;
        updateLyrics();
    }
};

const updateDuration = () => {
    if (audioPlayer.value) {
        totalTime.value = audioPlayer.value.duration;
    }
};

const onTrackEnd = () => {
    isPlaying.value = false;
    currentTime.value = 0;
};

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 进度条拖动相关函数
const getProgressFromEvent = (event: MouseEvent): number => {
    if (!progressBarRef.value) return 0;
    
    const rect = progressBarRef.value.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const percent = Math.max(0, Math.min(100, (x / width) * 100));
    
    return percent;
};

const setAudioTime = (percent: number) => {
    if (!audioPlayer.value || totalTime.value === 0) return;
    
    const newTime = (percent / 100) * totalTime.value;
    audioPlayer.value.currentTime = newTime;
    currentTime.value = newTime;
};

const onProgressClick = (event: MouseEvent) => {
    const percent = getProgressFromEvent(event);
    setAudioTime(percent);
};

const onProgressMouseDown = (event: MouseEvent) => {
    isDragging.value = true;
    dragProgress.value = getProgressFromEvent(event);
    
    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging.value) {
            dragProgress.value = getProgressFromEvent(e);
        }
    };
    
    const handleMouseUp = () => {
        if (isDragging.value) {
            setAudioTime(dragProgress.value);
            isDragging.value = false;
        }
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
};

const onThumbMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    onProgressMouseDown(event);
};


</script>

<style scoped>
.music-player-page {
    height: 100vh;
    position: relative;
    overflow: hidden;
    background: #000;
}

/* 背景封面 */
.background-cover {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

.background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%);
    backdrop-filter: blur(20px);
}



/* 顶部导航 */
.top-nav {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    z-index: 10;
    margin-top: 20px;
}

.nav-btn {
    width: 40px;
    height: 40px;
    border-radius: 22px;
    background:none;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.nav-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.page-title {
    color: white;
    font-size: 16px;
    font-weight: 500;
}

/* 主要内容 */
.main-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
    z-index: 5;
}

/* 封面和音乐信息区域 */
.cover-info-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    min-height: 400px;
    margin-bottom: 60px;
}

.large-cover {
    width: 280px;
    height: 280px;
    border-radius: 140px;
    overflow: hidden;
    margin-bottom: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    transition: transform 0.3s ease;
}

.large-cover:hover {
    transform: scale(1.02);
}

.large-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.large-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.music-info {
    text-align: center;
    margin-top: 10px;
}

.music-title {
    font-size: 28px;
    font-weight: 700;
    color: white;
    margin: 0 0 8px 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.music-artist {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
}

/* 进度条 */
.progress-container {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    margin-bottom: 60px;
}

.time-current,
.time-total {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-weight: 500;
    min-width: 40px;
}

.time-current {
    text-align: right;
}

.time-total {
    text-align: left;
}

.progress-bar {
    flex: 1;
    height: 0cqh;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 1px;
    position: relative;
    cursor: pointer;
    padding: 2px 0; /* 增加点击区域 */
    margin: -10px 0; /* 抵消padding */
}

.progress-fill {
    height: 2px;
    background: #ff9500;
    border-radius: 1px;
    transition: width 0.1s ease;
    pointer-events: none;
}

.progress-thumb {
    position: absolute;
    top: 50%;
    width: 12px;
    height: 12px;
    background: #ff9500;
    border: 2px solid #ffffff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.progress-bar:hover .progress-thumb {
    opacity: 1;
}

/* 播放控制 */
.player-controls {
    display: flex;
    align-items: center;
    gap: 40px;
}

.control-btn {
    width: 64px;
    height: 64px;
    border-radius: 32px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.control-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
}

.play-pause-btn {
    width: 80px;
    height: 80px;
    border-radius: 40px;
}



.safe-area-top {
    padding-top: env(safe-area-inset-top);
}

/* 歌词显示区域 */
.lyrics-display {
    width: 320px;
    height: 420px;
    border-radius: 20px;
    background: none;
    border: none;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 40px 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: fadeIn 0.3s ease;
    overflow-y: auto;
    overflow-x: hidden;
    margin-top: -20px;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    /* 隐藏滚动条 - 兼容不同浏览器 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
}

.lyrics-display::-webkit-scrollbar {
    display: none; /* 完全隐藏滚动条 */
}

.lyrics-display:hover {
    transform: scale(1.02);
}

.lyrics-content {
    width: 100%;
    text-align: center;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 60px;
    padding-bottom: 60px;
}

.lyric-line {
    color: rgba(255, 255, 255, 0.6);
    font-size: 15px;
    line-height: 1.8;
    margin: 8px 0;
    transition: all 0.3s ease;
    opacity: 0.6;
    word-break: break-all;
    text-align: center;
}

.lyric-line.active {
    color: #ff9500;
    font-size: 17px;
    font-weight: 600;
    opacity: 1;
    transform: scale(1.05);
}

.no-lyrics {
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    width: 100%;
}

.no-lyrics p {
    font-size: 16px;
    margin: 15px 0;
}

.no-lyrics-tip {
    font-size: 12px;
    opacity: 0.6;
}

.loading-lyrics {
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    width: 100%;
}

.loading-lyrics p {
    font-size: 16px;
    margin: 15px 0;
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 0.7;
    }
    50% {
        opacity: 1;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style> 