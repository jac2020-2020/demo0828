<template>
    <div class="shared-music-page">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>加载音乐中...</p>
        </div>
        
        <!-- 错误状态 -->
        <div v-else-if="error" class="error-container">
            <div class="error-icon">🎵</div>
            <h2>音乐不存在或已失效</h2>
            <p>{{ error }}</p>
            <button class="retry-btn" @click="loadMusic">重试</button>
        </div>
        
        <!-- 音乐播放器 -->
        <div v-else-if="musicData" class="music-player">
            <!-- 背景封面 -->
            <div class="background-cover" :style="{ backgroundImage: `url(${musicData.imageUrl})` }">
                <div class="background-overlay"></div>
            </div>
            
            <!-- 顶部信息 -->
            <div class="top-info">
                <div class="share-badge">
                    <Share2 :size="16" color="white" />
                    <span>分享的音乐</span>
                </div>
                <div class="share-actions">
                    <button class="action-btn" @click="copyLink" :class="{ copied: linkCopied }">
                        <Copy :size="16" />
                        <span>{{ linkCopied ? '已复制' : '复制链接' }}</span>
                    </button>
                </div>
            </div>
            
            <!-- 主要内容 -->
            <div class="main-content">
                <!-- 封面和歌词切换区域 -->
                <div class="content-area">
                    <!-- 封面显示 -->
                    <div v-if="!showLyrics" class="cover-section" @click="toggleLyrics">
                        <div class="music-cover">
                            <img :src="musicData.imageUrl" :alt="musicData.title" />
                            <div class="cover-overlay">
                                <p>点击查看歌词</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 歌词显示 -->
                    <div v-else class="lyrics-section" @click="toggleLyrics">
                        <div class="lyrics-container">
                            <h3>歌词</h3>
                            <div class="lyrics-content">
                                <p v-for="(line, index) in lyricsLines" :key="index" class="lyrics-line">
                                    {{ line }}
                                </p>
                            </div>
                            <p class="lyrics-tip">点击返回封面</p>
                        </div>
                    </div>
                </div>
                
                <!-- 音乐信息 -->
                <div class="music-info">
                    <h1 class="music-title">{{ musicData.title }}</h1>
                    <p class="music-artist">{{ musicData.artist }}</p>
                    <p class="share-info">{{ formatDate(musicData.createdAt) }} 由 {{ musicData.sharedBy }} 分享</p>
                </div>
                
                <!-- 进度条 -->
                <div class="progress-section">
                    <div class="time-info">
                        <span class="current-time">{{ formatTime(currentTime) }}</span>
                        <span class="total-time">{{ formatTime(totalTime) }}</span>
                    </div>
                    <div class="progress-bar" @click="seekTo">
                        <div class="progress-track"></div>
                        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
                        <div class="progress-thumb" :style="{ left: progressPercentage + '%' }"></div>
                    </div>
                </div>
                
                <!-- 播放控制 -->
                <div class="player-controls">
                    <button class="control-btn play-btn" @click="togglePlayPause">
                        <Play v-if="!isPlaying" :size="32" color="white" />
                        <Pause v-else :size="32" color="white" />
                    </button>
                </div>
                
                <!-- 下载应用提示 -->
                <div class="app-promotion">
                    <div class="app-info">
                        <div class="app-icon">🎵</div>
                        <div class="app-text">
                            <h4>LoneIn</h4>
                            <p>创作属于你的音乐作品</p>
                        </div>
                    </div>
                    <button class="download-app-btn" @click="goToApp">
                        体验应用
                    </button>
                </div>
            </div>
        </div>
        
        <!-- 隐藏的音频元素 -->
        <audio 
            ref="audioPlayer"
            :src="musicData?.audioUrl"
            @timeupdate="updateProgress"
            @loadedmetadata="updateDuration"
            @ended="onTrackEnd"
            @error="onAudioError"
        ></audio>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { Share2, Copy, Play, Pause } from 'lucide-vue-next';
import { cloudStorage, type SharedMusicData } from '@/services/cloudStorage';

const route = useRoute();

// 数据状态
const loading = ref(true);
const error = ref<string | null>(null);
const musicData = ref<SharedMusicData | null>(null);

// 播放状态
const audioPlayer = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const totalTime = ref(0);

// 界面状态
const showLyrics = ref(false);
const linkCopied = ref(false);

// 计算属性
const progressPercentage = computed(() => {
    return totalTime.value > 0 ? (currentTime.value / totalTime.value) * 100 : 0;
});

const lyricsLines = computed(() => {
    if (!musicData.value?.lyrics) return ['暂无歌词'];
    
    return musicData.value.lyrics
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
});

// 生命周期
onMounted(() => {
    loadMusic();
});

// 方法
const loadMusic = async () => {
    try {
        loading.value = true;
        error.value = null;
        
        const shareId = route.params.shareId as string;
        if (!shareId) {
            throw new Error('分享链接无效');
        }
        
        const data = await cloudStorage.getSharedMusic(shareId);
        if (!data) {
            throw new Error('音乐不存在或已过期');
        }
        
        musicData.value = data;
        
        // 设置页面标题
        if (data.title) {
            document.title = `${data.title} - ${data.artist} | LoneIn`;
        }
        
    } catch (err: any) {
        error.value = err.message || '加载失败';
        console.error('加载分享音乐失败:', err);
    } finally {
        loading.value = false;
    }
};

const togglePlayPause = () => {
    if (!audioPlayer.value) return;
    
    if (isPlaying.value) {
        audioPlayer.value.pause();
    } else {
        audioPlayer.value.play().catch(err => {
            console.error('播放失败:', err);
            error.value = '音频播放失败，请检查网络连接';
        });
    }
    isPlaying.value = !isPlaying.value;
};

const toggleLyrics = () => {
    showLyrics.value = !showLyrics.value;
};

const copyLink = async () => {
    try {
        const currentUrl = window.location.href;
        await navigator.clipboard.writeText(currentUrl);
        linkCopied.value = true;
        setTimeout(() => {
            linkCopied.value = false;
        }, 2000);
    } catch (err) {
        console.error('复制链接失败:', err);
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        linkCopied.value = true;
        setTimeout(() => {
            linkCopied.value = false;
        }, 2000);
    }
};

const seekTo = (event: MouseEvent) => {
    if (!audioPlayer.value) return;
    
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * totalTime.value;
    
    audioPlayer.value.currentTime = seekTime;
    currentTime.value = seekTime;
};

const updateProgress = () => {
    if (audioPlayer.value) {
        currentTime.value = audioPlayer.value.currentTime;
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

const onAudioError = (event: Event) => {
    console.error('音频加载错误:', event);
    error.value = '音频加载失败，请检查网络连接';
};

const goToApp = () => {
    // 跳转到应用首页
    window.location.href = '/';
};

const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
</script>

<style scoped>
.shared-music-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    overflow-x: hidden;
}

/* 加载状态 */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: white;
    text-align: center;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: white;
    text-align: center;
    padding: 20px;
}

.error-icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.7;
}

.error-container h2 {
    margin: 0 0 10px 0;
    font-size: 24px;
}

.error-container p {
    margin: 0 0 30px 0;
    opacity: 0.8;
}

.retry-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 12px 24px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;
}

.retry-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

/* 音乐播放器 */
.music-player {
    min-height: 100vh;
    position: relative;
}

.background-cover {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    filter: blur(20px);
    transform: scale(1.1);
    z-index: -2;
}

.background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
    z-index: -1;
}

/* 顶部信息 */
.top-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    position: relative;
    z-index: 10;
}

.share-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.2);
    padding: 8px 16px;
    border-radius: 20px;
    color: white;
    font-size: 14px;
}

.share-actions {
    display: flex;
    gap: 10px;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
}

.action-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

.action-btn.copied {
    background: rgba(76, 175, 80, 0.8);
}

/* 主要内容 */
.main-content {
    padding: 0 20px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
}

/* 内容区域 */
.content-area {
    width: 100%;
    max-width: 350px;
    margin-bottom: 30px;
    min-height: 350px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 封面区域 */
.cover-section {
    width: 100%;
    cursor: pointer;
}

.music-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.music-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.cover-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    color: white;
    padding: 20px;
    text-align: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.music-cover:hover .cover-overlay {
    opacity: 1;
}

/* 歌词区域 */
.lyrics-section {
    width: 100%;
    cursor: pointer;
}

.lyrics-container {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 30px;
    color: white;
    text-align: center;
    min-height: 350px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.lyrics-container h3 {
    margin: 0 0 20px 0;
    font-size: 20px;
    opacity: 0.9;
}

.lyrics-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
}

.lyrics-line {
    margin: 0;
    font-size: 16px;
    line-height: 1.6;
    opacity: 0.9;
}

.lyrics-tip {
    margin: 0;
    font-size: 14px;
    opacity: 0.6;
}

/* 音乐信息 */
.music-info {
    text-align: center;
    color: white;
    margin-bottom: 40px;
}

.music-title {
    font-size: 28px;
    font-weight: bold;
    margin: 0 0 8px 0;
}

.music-artist {
    font-size: 18px;
    opacity: 0.8;
    margin: 0 0 8px 0;
}

.share-info {
    font-size: 14px;
    opacity: 0.6;
    margin: 0;
}

/* 进度条 */
.progress-section {
    width: 100%;
    max-width: 350px;
    margin-bottom: 30px;
}

.time-info {
    display: flex;
    justify-content: space-between;
    color: white;
    font-size: 14px;
    margin-bottom: 10px;
    opacity: 0.8;
}

.progress-bar {
    position: relative;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    cursor: pointer;
}

.progress-track {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
}

.progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: white;
    border-radius: 2px;
    transition: width 0.1s ease;
}

.progress-thumb {
    position: absolute;
    top: -6px;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    transform: translateX(-50%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: left 0.1s ease;
}

/* 播放控制 */
.player-controls {
    display: flex;
    justify-content: center;
    margin-bottom: 60px;
}

.play-btn {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.play-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
}

.play-btn:active {
    transform: scale(0.95);
}

/* 应用推广 */
.app-promotion {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 20px;
    color: white;
    width: 100%;
    max-width: 350px;
}

.app-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.app-icon {
    font-size: 32px;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
}

.app-text h4 {
    margin: 0 0 4px 0;
    font-size: 18px;
}

.app-text p {
    margin: 0;
    font-size: 14px;
    opacity: 0.8;
}

.download-app-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 12px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: all 0.3s ease;
}

.download-app-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 480px) {
    .main-content {
        padding: 0 16px 40px;
    }
    
    .content-area {
        max-width: none;
        margin: 0 0 20px 0;
    }
    
    .music-title {
        font-size: 24px;
    }
    
    .app-promotion {
        flex-direction: column;
        gap: 20px;
        text-align: center;
    }
    
    .app-info {
        flex-direction: column;
        gap: 12px;
    }
}
</style> 