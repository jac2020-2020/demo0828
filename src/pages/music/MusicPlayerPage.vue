<template>
    <div class="music-player-page">
        <!-- 背景封面 -->
        <div class="background-cover" :style="{ backgroundImage: `url(${musicData?.imageUrl})` }">
            <div class="background-overlay"></div>
        </div>
        

        
        <!-- 顶部导航 -->
        <div class="top-nav">
            <button class="nav-btn back-btn" @click="goBack">
                <ArrowLeft :size="24" color="white" />
            </button>
            <span class="page-title">作品播放页</span>
            <button class="nav-btn share-btn" @click="shareMusic">
                <Share2 :size="24" color="white" />
            </button>
        </div>
        
        <!-- 主要内容区域 -->
        <div class="main-content">
            <!-- 大尺寸封面 -->
            <div class="large-cover">
                <img :src="musicData?.imageUrl" :alt="musicData?.title" />
            </div>
            
            <!-- 音乐信息 -->
            <div class="music-info">
                <h1 class="music-title">{{ musicData?.title || '夜行人' }}</h1>
                <p class="music-artist">{{ musicData?.artist || '用户A' }}</p>
            </div>
            
            <!-- 进度条 -->
            <div class="progress-container">
                <span class="time-current">{{ formatTime(currentTime) }}</span>
                <div class="progress-bar">
                    <div 
                        class="progress-fill"
                        :style="{ width: (currentTime / totalTime) * 100 + '%' }"
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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft, Share2 } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

// 音乐数据
const musicData = ref<any>(null);
const isPlaying = ref(false);
const currentTime = ref(105); // 1:45
const totalTime = ref(200); // 3:20
const audioPlayer = ref<HTMLAudioElement>();





// 生命周期
onMounted(() => {
    // 从路由参数获取音乐数据
    if (route.query.musicData) {
        try {
            musicData.value = JSON.parse(route.query.musicData as string);
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

const shareMusic = () => {
    console.log('分享音乐');
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
}

.nav-btn {
    width: 44px;
    height: 44px;
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

.large-cover {
    width: 280px;
    height: 280px;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.large-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.music-info {
    text-align: center;
    margin-bottom: 60px;
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
    color: white;
    font-size: 14px;
    font-weight: 500;
    min-width: 40px;
}

.progress-bar {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff9500, #ff6b6b);
    border-radius: 3px;
    transition: width 0.3s ease;
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
</style> 