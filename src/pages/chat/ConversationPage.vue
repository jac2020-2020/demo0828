<template>
    <div class="conversation-page" :class="{
        'qixi-theme': currentTheme === 'qixi',
        'military-theme': currentTheme === 'military',
        'gift-mode': isGiftMode
    }">


        <!-- 顶部导航栏 -->
        <div class="nav-bar">
            <button class="back-btn" @click="goBack">
                <ArrowLeft :size="20" />
            </button>
            <h1 class="nav-title">{{ isGiftMode ? '礼物' : '深聊' }}</h1>
            <button class="menu-btn" @click="toggleMode">
                <ArrowRightLeft :size="20" />
            </button>
        </div>

        <!-- 聊天内容区域 -->
        <div class="chat-content">
            
            <!-- 礼物生成页面 -->
            <div v-if="isGiftMode" class="gift-content">
                <!-- 模式切换标签 -->
                <div class="gift-mode-tabs">
                    <button 
                        v-for="mode in giftModes" 
                        :key="mode.key"
                        :class="['mode-tab', { active: currentGiftMode === mode.key }]"
                        @click="currentGiftMode = mode.key"
                    >
                        <component :is="mode.icon" :size="18" />
                        <span>{{ mode.label }}</span>
                    </button>
                </div>

                <!-- 输入表单 -->
                <div class="gift-form">
                    <div class="form-group">
                        <label>礼物送给谁</label>
                        <input 
                            v-model="giftSenderName"
                            placeholder="说说你想赠予对象的姓名或昵称" 
                            class="gift-input"
                            type="text"
                        />
                    </div>
                    
                    <div class="form-group">
                        <label>TA是你的谁</label>
                        <textarea 
                            v-model="giftTarget"
                            placeholder="说说TA和你的关系、故事" 
                            class="gift-textarea"
                            rows="3"
                        ></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>想说些什么</label>
                        <div class="theme-buttons">
                            <button 
                                type="button"
                                class="theme-btn qixi-theme"
                                :class="{ active: currentTheme === 'qixi' }"
                                @click="selectQixiTheme"
                            >
                                七夕主题
                            </button>
                            <button 
                                type="button"
                                class="theme-btn military-theme"
                                :class="{ active: currentTheme === 'military' }"
                                @click="selectMilitaryTheme"
                            >
                                阅兵主题
                            </button>
                            <button 
                                v-if="currentTheme"
                                type="button"
                                class="cancel-btn"
                                @click="cancelTheme"
                            >
                                取消
                            </button>
                        </div>
                        <textarea 
                            v-model="giftMessage"
                            placeholder="想送TA一份什么样的礼物？或者想对TA说些什么？" 
                            class="gift-textarea"
                            rows="4"
                        ></textarea>
                    </div>
                    
                    <button 
                        class="generate-btn"
                        @click="generateGift"
                        :disabled="isGenerating || !giftTarget.trim() || !giftMessage.trim()"
                    >
                        {{ isGenerating ? '礼物打包中...' : '开始制作' }}
                    </button>
                </div>

                <!-- 生成进度 -->
                <div v-if="isGenerating && !generationStage.includes('正在获取歌词时间线')" class="generation-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: generationProgress }"></div>
                    </div>
                    <div class="progress-text">{{ generationStage }}</div>
                </div>

                <!-- 生成结果 -->
                <div v-if="giftResult" class="gift-result">
                    <!-- 生图结果 -->
                    <div v-if="currentGiftMode === 'image' && giftResult.imageUrl" class="result-image">
                        <img :src="giftResult.imageUrl" :alt="giftResult.title" />
                        <div class="result-actions">
                            <button @click="shareGiftResult" class="save-btn">
                                <Share2 :size="20" />
                            </button>
                            <button @click="saveGiftResult" class="save-btn">
                                <Download :size="20" />
                            </button>
                        </div>
                    </div>

                    <!-- 生音乐结果 -->
                    <div v-if="currentGiftMode === 'music' && giftResult.musicUrl" class="result-music">
                        <div class="music-card">
                            <div 
                                class="music-item"
                                :style="{ backgroundImage: `url(${giftResult.imageUrl || '/default-music-bg.jpg'})` }"
                            >
                                <div class="music-card-overlay"></div>
                                
                                <!-- 主要内容区域 -->
                                <div class="music-main-content">
                                    <!-- 可点击区域：封面和音乐信息 -->
                                    <div class="music-clickable-area" @click="openGiftMusicPlayer">
                                        <!-- 圆形封面 -->
                                        <div class="music-cover-container">
                                            <div class="music-cover-round">
                                                <img :src="giftResult.imageUrl || '/default-music-cover.jpg'" :alt="giftResult.title" />
                                            </div>
                                        </div>
                                        
                                        <!-- 音乐信息 -->
                                        <div class="music-content">
                                            <div class="music-info">
                                                <h3 class="music-title">{{ giftResult.title }}</h3>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- 控制按钮 -->
                                    <div class="music-controls">
                                        <button class="control-btn play-btn" @click.stop="playGiftMusic">
                                            <Play v-if="!isGiftMusicPlaying" :size="20" fill="#ff9500" stroke="none" stroke-width="0" />
                                            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="#ff9500" stroke="none" stroke-width="0">
                                                <rect x="6" y="4" width="4" height="16"></rect>
                                                <rect x="14" y="4" width="4" height="16"></rect>
                                            </svg>
                                        </button>
                                        <button class="control-btn download-btn" @click.stop="saveGiftResult">
                                            <Download :size="18" color="#ff9500" stroke="none" />
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- 进度条(跨越整个卡片宽度) -->
                                <div class="music-progress-container">
                                    <div class="music-progress">
                                        <div class="progress-bar">
                                            <div 
                                                class="progress-fill" 
                                                :style="{ width: giftMusicProgress + '%' }"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- 隐藏的音频元素 -->
                                <audio :src="giftResult.musicUrl" class="hidden-audio" ref="giftAudio"></audio>
                            </div>
                        </div>
                    </div>

                    <!-- 生诗词结果 -->
                    <div v-if="currentGiftMode === 'poem' && giftResult.content" class="result-poem">
                        <!-- 有配图时：诗词配图与文本叠加 -->
                        <div v-if="giftResult.imageUrl" 
                             ref="poemCardWithImageRef"
                             class="poem-card-with-image">
                            <div class="poem-background-image">
                                <img :src="giftResult.imageUrl" :alt="giftResult.title" />
                            </div>
                            
                            <!-- 诗词内容叠加在图片上 -->
                            <div class="poem-content-overlay">
                                <!-- 礼物接收者信息 -->
                                <div class="gift-recipient-info">
                                    <div class="gift-recipient-name">给{{ giftSenderName || '你' }}</div>
                                    <div class="gift-recipient-date">{{ getFormattedDate() }}</div>
                                </div>
                                
                                <h3 class="poem-title">《{{ giftResult.title }}》</h3>
                                
                                <!-- 使用智能换行的诗词内容 -->
                                <div class="poem-text">
                                    <p v-for="(line, index) in formatPoemContent(giftResult.content)" 
                                       :key="index" 
                                       class="poem-text-line">{{ line }}</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 无配图时：纯文本显示 -->
                        <div v-else 
                             ref="poemCardTextOnlyRef"
                             class="poem-card-text-only">
                            <!-- 礼物接收者信息 -->
                            <div class="gift-recipient-info-text">
                                <div class="gift-recipient-name-text">给{{ giftSenderName || '你' }}</div>
                                <div class="gift-recipient-date-text">{{ getFormattedDate() }}</div>
                            </div>
                            
                            <h3 class="poem-title">《{{ giftResult.title }}》</h3>
                            
                            <!-- 使用智能换行的诗词内容 -->
                            <div class="poem-text">
                                <p v-for="(line, index) in formatPoemContent(giftResult.content)" 
                                   :key="index" 
                                   class="poem-text-line">{{ line }}</p>
                            </div>
                        </div>
                        
                        <!-- 操作按钮 -->
                        <div class="result-actions">
                            <button @click="shareGiftResult" class="save-btn">
                                <Share2 :size="20" />
                            </button>
                            <button @click="downloadPoemCardImage" class="save-btn">
                                <Download :size="20" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 原聊天页面 -->
            <div v-else class="messages-container" ref="messagesContainer">
                <!-- 助手消息 -->
                <div v-for="(message, index) in messages" :key="index" class="message-item">
                    <div v-if="message.type === 'assistant'" class="assistant-message">
                        <div class="assistant-avatar">
                            <Bot :size="20" color="white" />
                        </div>
                        <div class="message-bubble assistant-bubble">
                            <div class="message-text">{{ message.content }}</div>
                            <div class="message-time">{{ message.time }}</div>
                        </div>
                    </div>
                    
                    <!-- 用户消息 -->
                    <div v-else class="user-message">
                        <div class="message-bubble user-bubble">
                            <div class="message-text">{{ message.content }}</div>
                            <div class="message-time">{{ message.time }}</div>
                        </div>
                        <div class="user-avatar">
                            <User :size="20" color="white" />
                        </div>
                    </div>
                </div>



                <!-- 加载状态 -->
                <div v-if="isLoading" class="loading-indicator">
                    <div class="loading-dots">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                    <div class="loading-text">回复中...</div>
                </div>

                <!-- 音乐生成进度 -->
                <div v-if="isMusicGenerating" class="music-generating">
                    <div class="music-progress-bar">
                        <div class="progress-fill" :style="{ width: musicProgress }"></div>
                    </div>
                    <div class="music-stage-text">{{ musicStage }}</div>
                    <div class="music-progress-text">{{ musicProgress }}</div>
                </div>

                <!-- 生成的音乐卡片 -->
                <div v-if="generatedMusic && generatedMusic.data?.musics?.length > 0" class="music-card">
                    <div 
                        v-for="music in generatedMusic.data.musics" 
                        :key="music.musicId" 
                        class="music-item"
                        :style="{ backgroundImage: `url(${music.imageUrl})` }"
                    >
                        <div class="music-card-overlay"></div>
                        
                        <!-- 主要内容区域 -->
                        <div class="music-main-content">
                            <!-- 可点击区域：封面和音乐信息 -->
                            <div class="music-clickable-area" @click="openMusicPlayer(music)">
                                <!-- 圆形封面 -->
                                <div class="music-cover-container">
                                    <div class="music-cover-round">
                                        <img :src="music.imageUrl" :alt="music.title" />
                                    </div>
                                </div>
                                
                                <!-- 音乐信息 -->
                                <div class="music-content">
                                                                    <div class="music-info">
                                    <h3 class="music-title">{{ music.title }}</h3>
                                </div>
                                </div>
                            </div>
                            
                            <!-- 控制按钮 -->
                            <div class="music-controls">
                                <button class="control-btn play-btn" @click.stop="togglePlay(music.musicId)">
                                    <Play v-if="!isPlaying(music.musicId)" :size="20" fill="#ff9500" stroke="none" />
                                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="#ff9500" stroke="none">
                                        <rect x="6" y="4" width="4" height="16"></rect>
                                        <rect x="14" y="4" width="4" height="16"></rect>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <!-- 进度条(跨越整个卡片宽度) -->
                        <div class="music-progress-container">
                            <div class="music-progress">
                                <div class="progress-bar">
                                    <div 
                                        class="progress-fill" 
                                        :style="{ width: getProgress(music.musicId) + '%' }"
                                    ></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 隐藏的音频元素 -->
                        <audio :src="music.audioUrl" class="hidden-audio"></audio>
                    </div>
                </div>

                <!-- 图像生成进度 -->
                <div v-if="isImageGenerating" class="image-generating">
                    <div class="image-progress-bar">
                        <div class="progress-fill" :style="{ width: imageProgress }"></div>
                    </div>
                    <div class="image-stage-text">{{ imageStage }}</div>
                    <div class="image-progress-text">{{ imageProgress }}</div>
                </div>

                <!-- 诗词生成进度 -->
                <div v-if="isPoemGenerating" class="poem-generating">
                    <div class="poem-progress-bar">
                        <div class="progress-fill" :style="{ width: poemProgress }"></div>
                    </div>
                    <div class="poem-stage-text">{{ poemStage }}</div>
                    <div class="poem-progress-text">{{ poemProgress }}</div>
                </div>

                <!-- 生成的图像卡片 -->
                <div v-if="generatedImage && generatedImage.data?.imageUrl" class="image-card">
                    <div class="image-item">
                        <img 
                            :src="generatedImage.data.imageUrl" 
                            :alt="generatedImage.data.prompt || '生成的图像'"
                            class="generated-image"
                        />
                        <div class="image-actions">
                            <button class="image-action-btn" @click="downloadGeneratedImage">
                                <Download :size="16" color="white" />
                            </button>
                            <button class="image-action-btn" @click="shareImage">
                                <Share2 :size="16" color="white" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 生成的诗词卡片 -->
                <div v-if="generatedPoem" class="poem-card">
                    <div 
                        ref="poemCardRef"
                        class="poem-item"
                        :style="{ backgroundImage: `url(${generatedPoem.imageUrl})` }"
                    >
                        <!-- 诗词内容区域 -->
                        <div class="poem-content-wrapper">
                            <!-- 礼物接收者和日期 -->
                            <div class="poem-recipient-info">
                                <div class="recipient-name">给{{ giftSenderName || '你' }}</div>
                                <div class="recipient-date">{{ getFormattedDate() }}</div>
                            </div>
                            
                            <!-- 诗词标题 -->
                            <h2 class="poem-title">《{{ generatedPoem.poem.title }}》</h2>
                            
                            <!-- 诗词正文 - 使用智能换行 -->
                            <div class="poem-verses">
                                <p v-for="(line, index) in formatPoemContent(generatedPoem.poem.content)" 
                                   :key="index" 
                                   class="poem-line">{{ line }}</p>
                            </div>
                        </div>
                        
                        <!-- 底部控制按钮 -->
                        <div class="poem-actions">
                            <button class="poem-action-btn" @click="downloadGeneratedPoemCard">
                                <Download :size="16" color="white" />
                            </button>
                            <button class="poem-action-btn" @click="sharePoem">
                                <Share2 :size="16" color="white" />
                            </button>
                        </div>
                    </div>
                </div>


            </div>
        </div>

        <!-- 输入区域 -->
        <div v-if="!isGiftMode" class="input-area">
            <div class="input-container">
                <button class="voice-btn" @click="startVoiceCall">
                    <Phone :size="20" color="rgb(232, 153, 87)" />
                </button>
                <input 
                    v-model="inputText" 
                    type="text" 
                    placeholder="请输入你想说的" 
                    class="message-input"
                    @keyup.enter="sendMessage"
                />
                <button class="send-btn" @click="sendMessage">
                    <Plus :size="20" color="rgb(232, 153, 87)" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft, ArrowRightLeft, Play, Share2, MessageCircle, Download, Phone, Plus, Bot, User, Palette, Music, BookOpen } from 'lucide-vue-next';
import { sendChatMessage, generateMusicFromConversation, generateImageFromConversation, type ChatMessage, type ImageGenerationResult } from '@/services/api';
import { cloudStorage } from '@/services/cloudStorage';
import type { MusicFetchResponse } from '@/services/musicApi';
import { getLyricsTimeline, type LyricsAlignment } from '@/services/musicApi';
import { lyricsCache, type LyricLine } from '@/services/lyricsCache';
import { generatePoemCard, type PoemCardResponse } from '@/services/api';
import { renderPoemOnImage, downloadImage, dataUrlToBlob } from '@/utils/imageUtils';
import { downloadPoemCard, savePoemCardToStorage } from '@/utils/cardDownload';
import html2canvas from 'html2canvas';
import { giftStateManager } from '@/services/giftStateManager';

const router = useRouter();
const route = useRoute();
const inputText = ref('');
const messagesContainer = ref<HTMLElement>();

// 诗词卡片ref引用
const poemCardWithImageRef = ref<HTMLElement>();
const poemCardTextOnlyRef = ref<HTMLElement>();

// 页面模式切换
const isGiftMode = ref(false);

// 情绪和对话分析状态
const emotionHistory = ref<Array<{
    turn: number;
    emotion: string;
    intensity: number;
    timestamp: string;
}>>([]);

const conversationAnalytics = ref({
    totalTurns: 0,
    deepestLevel: 0,
    emotionTrend: 'stable',
    readyForCreation: false
});


// 礼物生成相关状态
const giftModes = [
    { key: 'image', label: '送幅画', icon: Palette },
    { key: 'music', label: '送首歌', icon: Music },
    { key: 'poem', label: '送首诗', icon: BookOpen }
];
const currentGiftMode = ref('image');
const giftSenderName = ref('');
const giftTarget = ref('');
const giftMessage = ref('');
const isGenerating = ref(false);
const generationProgress = ref('0%');
const generationStage = ref('');
const giftResult = ref<any>(null);

// 主题相关状态
const currentTheme = ref<'qixi' | 'military' | '' | null>('');
const qixiMessages = [
    "七夕不只是鹊桥，更是我想与你走过的每一天。",
    "你是人间最美的巧合，也是我此生最笃定的答案。",
    "愿我们的爱情如银河般永恒，如星辰般闪耀。"
];
const militaryMessages = [
    "山河无恙，家国安宁。",
    "以寸心，致家国。",
    "赤心如初，愿国长安。"
];
let qixiMessageIndex = 0;
let militaryMessageIndex = 0;

// 礼物音乐播放状态
const giftMusicProgress = ref(0);
const giftAudio = ref<HTMLAudioElement>();
const isGiftMusicPlaying = ref(false);

// 歌词缓存现在使用全局缓存管理器 (来自 @/services/lyricsCache)

// 歌词处理函数 - 与MusicPlayerPage保持一致
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

// 预加载歌词时间线并缓存
const preloadLyricsTimeline = async (musicId: string, prompt?: string) => {
    if (!musicId) return;
    
    // 检查是否已经缓存
    if (lyricsCache.has(musicId)) {
        console.log('歌词已在缓存中:', musicId);
        return;
    }
    
    try {
        console.log('开始预加载歌词时间线，musicId:', musicId);
        
        const response = await getLyricsTimeline(musicId);
        
        if (response.data?.alignment?.length > 0) {
            // 将单个字组合成句子
            const alignmentData = response.data.alignment.filter(item => item.success && item.word.trim());
            console.log('预加载歌词API数据:', alignmentData.map(item => item.word));
            
            const groupedLyrics = processLyricsByNewlines(alignmentData);
            
            // 缓存歌词数据
            lyricsCache.set(musicId, groupedLyrics);
            console.log('成功预加载并缓存歌词时间线:', groupedLyrics);
        } else {
            console.log('API返回的歌词数据为空，使用备用解析方法');
            // 如果API没有返回歌词，使用原来的解析方法
            if (prompt) {
                const backupLyrics = parseLyricsBackup(prompt);
                lyricsCache.set(musicId, backupLyrics);
                console.log('使用备用方法预加载歌词:', backupLyrics);
            }
        }
    } catch (error) {
        console.error('预加载歌词时间线失败:', error);
        // 如果API调用失败，使用备用解析方法
        if (prompt) {
            const backupLyrics = parseLyricsBackup(prompt);
            lyricsCache.set(musicId, backupLyrics);
            console.log('API失败，使用备用方法预加载歌词:', backupLyrics);
        }
    }
};

// 聊天消息（初始为空）
interface Message {
    type: 'user' | 'assistant';
    content: string;
    time: string;
}

const messages = ref<Message[]>([
    {
        type: 'assistant',
        content: '今天过得咋样呀，我们来聊聊吧',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
]);



const goBack = () => {
    router.back();
};

// 切换页面模式
const toggleMode = () => {
    isGiftMode.value = !isGiftMode.value;
    // 切换到礼物模式时重置状态
    if (isGiftMode.value) {
        giftTarget.value = '';
        giftMessage.value = '';
        giftResult.value = null;
        currentGiftMode.value = 'image';
    }
};

// 主题选择方法
const selectQixiTheme = () => {
    if (currentTheme.value === 'qixi') {
        // 如果已经是七夕主题，切换到下一句话
        qixiMessageIndex = (qixiMessageIndex + 1) % qixiMessages.length;
    } else {
        // 切换到七夕主题
        currentTheme.value = 'qixi';
        qixiMessageIndex = 0;
    }
    giftMessage.value = qixiMessages[qixiMessageIndex];
};

const selectMilitaryTheme = () => {
    if (currentTheme.value === 'military') {
        // 如果已经是阅兵主题，切换到下一句话
        militaryMessageIndex = (militaryMessageIndex + 1) % militaryMessages.length;
    } else {
        // 切换到阅兵主题
        currentTheme.value = 'military';
        militaryMessageIndex = 0;
    }
    giftMessage.value = militaryMessages[militaryMessageIndex];
};

const cancelTheme = () => {
    currentTheme.value = null;
    giftMessage.value = '';
};

// 生成礼物
const generateGift = async () => {
    if (!giftTarget.value.trim() || !giftMessage.value.trim()) return;
    
    isGenerating.value = true;
    generationProgress.value = '0%';
    giftResult.value = null;
    
    try {
        if (currentGiftMode.value === 'image') {
            generationStage.value = '正在生成图片...';
            // 模拟进度
            for (let i = 0; i <= 100; i += 10) {
                generationProgress.value = `${i}%`;
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            // 调用图片生成API
            const senderInfo = giftSenderName.value.trim() ? `来自${giftSenderName.value}` : '';
            const conversation = `${senderInfo ? senderInfo + '，' : ''}为${giftTarget.value}生成一张表达"${giftMessage.value}"的图片`;
            const result = await generateImageFromConversation(
                conversation, 
                '温馨', 
                '礼物',
                (progress, stage) => {
                    generationProgress.value = progress;
                    generationStage.value = stage;
                },
                true, // 启用礼物模式
                giftSenderName.value, // 礼物接收者（礼物送给谁）
                giftMessage.value, // 用户想说的话
                undefined, // 发送者姓名（这里不需要）
                giftTarget.value // TA和你的关系
            );
            if (result && result.data?.imageUrl) {
                giftResult.value = {
                    type: 'image',
                    imageUrl: result.data.imageUrl,
                    title: `给${giftSenderName.value}的礼物`,
                    description: giftMessage.value
                };
            }
        } else if (currentGiftMode.value === 'music') {
            generationStage.value = '正在生成音乐...';
            // 模拟进度
            for (let i = 0; i <= 100; i += 10) {
                generationProgress.value = `${i}%`;
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            // 调用音乐生成API
            const senderInfo = giftSenderName.value.trim() ? `来自${giftSenderName.value}` : '';
            const conversation = `${senderInfo ? senderInfo + '，' : ''}为${giftTarget.value}创作一首表达"${giftMessage.value}"的音乐`;
            const result = await generateMusicFromConversation(
                conversation,
                '温馨',
                '礼物',
                (progress, stage) => {
                    generationProgress.value = progress;
                    generationStage.value = stage;
                },
                true, // 启用礼物模式
                giftSenderName.value, // 礼物接收者（礼物送给谁）
                giftMessage.value, // 用户想说的话
                undefined, // 发送者姓名（这里不需要）
                giftTarget.value // TA和你的关系
            );
            if (result && result.data?.musics?.length > 0) {
                const music = result.data.musics[0];
                giftResult.value = {
                    type: 'music',
                    musicUrl: music.audioUrl,
                    imageUrl: music.imageUrl,
                    title: music.title || `给${giftSenderName.value}的音乐`,
                    musicId: music.musicId, // 保存musicId用于获取歌词
                    prompt: music.prompt // 保存歌词内容用于备用解析
                };
                
                // 音乐生成完成后立即预加载歌词时间线
                if (music.musicId) {
                    generationStage.value = '正在获取歌词时间线...';
                    try {
                        await preloadLyricsTimeline(music.musicId, music.prompt);
                        console.log('歌词时间线预加载完成');
                    } catch (error) {
                        console.error('歌词时间线预加载失败:', error);
                        // 预加载失败不影响整体流程，仅记录错误
                    }
                }
            }
        } else if (currentGiftMode.value === 'poem') {
            generationStage.value = '正在生成诗词...';
            // 调用诗词生成API（包含配图）
            const senderInfo = giftSenderName.value.trim() ? `来自${giftSenderName.value}` : '';
            const conversation = `${senderInfo ? senderInfo + '，' : ''}为${giftTarget.value}创作一首表达"${giftMessage.value}"的诗词`;
            const result = await generatePoemCard(
                conversation,
                '温馨',
                '礼物',
                (progress, stage) => {
                    generationProgress.value = progress;
                    generationStage.value = stage;
                },
                true, // 启用礼物模式
                giftSenderName.value, // 礼物接收者（礼物送给谁）
                giftMessage.value, // 用户想说的话
                undefined, // 发送者姓名（这里不需要）
                giftTarget.value // TA和你的关系
            );
            if (result && result.poem) {
                giftResult.value = {
                    type: 'poem',
                    title: result.poem.title || '无题',
                    content: result.poem.content,
                    author: '匿名', // PoemGenerationResponse 没有 author 字段
                    imageUrl: result.imageUrl // 添加配图URL
                };
            }
        }
    } catch (error) {
        console.error('生成礼物失败:', error);
        generationStage.value = '生成失败，请重试';
    } finally {
        isGenerating.value = false;
    }
};

// 播放/暂停礼物音乐
const playGiftMusic = () => {
    if (!giftResult.value?.musicUrl || !giftAudio.value) return;
    
    if (isGiftMusicPlaying.value) {
        giftAudio.value.pause();
        isGiftMusicPlaying.value = false;
    } else {
        giftAudio.value.play();
        isGiftMusicPlaying.value = true;
    }
};

// 初始化礼物音频事件监听
const initGiftAudioListeners = () => {
    if (!giftAudio.value) return;
    
    giftAudio.value.addEventListener('timeupdate', () => {
        if (giftAudio.value) {
            const progress = (giftAudio.value.currentTime / giftAudio.value.duration) * 100;
            giftMusicProgress.value = progress || 0;
        }
    });
    
    giftAudio.value.addEventListener('ended', () => {
        isGiftMusicPlaying.value = false;
        giftMusicProgress.value = 0;
    });
    
    giftAudio.value.addEventListener('pause', () => {
        isGiftMusicPlaying.value = false;
    });
    
    giftAudio.value.addEventListener('play', () => {
        isGiftMusicPlaying.value = true;
    });
};

// 下载诗词卡片为图片
const downloadPoemCardImage = async () => {
    try {
        // 确定要下载的元素
        const cardElement = giftResult.value?.imageUrl 
            ? poemCardWithImageRef.value 
            : poemCardTextOnlyRef.value;
            
        if (!cardElement || !giftResult.value) {
            alert('诗词卡片未找到');
            return;
        }
        
        // 使用新的下载工具函数
        await downloadPoemCard(
            cardElement,
            giftResult.value.title || '诗词卡片',
            {
                format: 'jpeg',
                quality: 0.95,
                addWhiteBackground: true
            }
        );
        
        // 同时保存到本地存储
        if (giftResult.value) {
            savePoemCardToStorage({
                title: giftResult.value.title,
                content: giftResult.value.content,
                imageUrl: giftResult.value.imageUrl,
                cardImageUrl: '', // 这里暂时留空，因为我们已经下载了
                poemId: Date.now().toString()
            });
        }
        
        alert('诗词卡片下载成功！');
        
    } catch (error: any) {
        console.error('下载诗词卡片失败:', error);
        alert(`下载失败：${error.message || '请稍后重试'}`);
        
        // 降级方案：如果html2canvas失败，尝试使用Canvas渲染
        if (giftResult.value?.imageUrl) {
            try {
                console.log('尝试降级方案：Canvas渲染');
                const cardImageUrl = await renderPoemOnImage(
                    giftResult.value.imageUrl,
                    giftResult.value.title,
                    giftResult.value.content
                );
                
                const filename = `${giftResult.value.title}_${Date.now()}.jpg`;
                downloadImage(cardImageUrl, filename);
                
                // 同时保存到本地存储
                savePoemCardToStorage({
                    title: giftResult.value.title,
                    content: giftResult.value.content,
                    imageUrl: giftResult.value.imageUrl,
                    cardImageUrl: cardImageUrl,
                    poemId: Date.now().toString()
                });
                
                alert('已使用备用方案下载诗词卡片');
            } catch (fallbackError: any) {
                console.error('备用方案也失败:', fallbackError);
                alert('下载失败，请稍后重试');
            }
        }
    }
};

// 下载聊天模式生成的诗词卡片
const downloadGeneratedPoemCard = async () => {
    try {
        if (!generatedPoem.value || !poemCardRef.value) {
            alert('诗词卡片未找到');
            return;
        }
        
        // 使用新的下载工具函数
        await downloadPoemCard(
            poemCardRef.value,
            generatedPoem.value.poem.title || '诗词卡片',
            {
                format: 'jpeg',
                quality: 0.95,
                addWhiteBackground: true
            }
        );
        
        // 同时保存到本地存储
        savePoemCardToStorage({
            title: generatedPoem.value.poem.title,
            content: generatedPoem.value.poem.content,
            imageUrl: generatedPoem.value.imageUrl,
            cardImageUrl: '', // 这里暂时留空，因为我们已经下载了
            poemId: Date.now().toString()
        });
        
        alert('诗词卡片下载成功！');
        
    } catch (error: any) {
        console.error('下载诗词卡片失败:', error);
        alert(`下载失败：${error.message || '请稍后重试'}`);
        
        // 降级方案：如果html2canvas失败，尝试使用Canvas渲染
        if (generatedPoem.value?.imageUrl) {
            try {
                console.log('尝试降级方案：Canvas渲染');
                const cardImageUrl = await renderPoemOnImage(
                    generatedPoem.value.imageUrl,
                    generatedPoem.value.poem.title,
                    generatedPoem.value.poem.content
                );
                
                const filename = `${generatedPoem.value.poem.title}_${Date.now()}.jpg`;
                downloadImage(cardImageUrl, filename);
                
                // 同时保存到本地存储
                savePoemCardToStorage({
                    title: generatedPoem.value.poem.title,
                    content: generatedPoem.value.poem.content,
                    imageUrl: generatedPoem.value.imageUrl,
                    cardImageUrl: cardImageUrl,
                    poemId: Date.now().toString()
                });
                
                alert('已使用备用方案下载诗词卡片');
            } catch (fallbackError: any) {
                console.error('备用方案也失败:', fallbackError);
                alert('下载失败，请稍后重试');
            }
        }
    }
};

// 保存礼物结果
const saveGiftResult = async () => {
    if (!giftResult.value) return;
    
    try {
        if (giftResult.value.type === 'image' && giftResult.value.imageUrl) {
            // 下载图片 - 使用代理或直接链接下载
            try {
                // 方法1：尝试直接fetch（如果没有CORS问题）
                const response = await fetch(giftResult.value.imageUrl, {
                    mode: 'cors',
                    credentials: 'omit'
                });
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `${giftResult.value.title || '礼物图片'}_${Date.now()}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // 清理URL对象
                URL.revokeObjectURL(url);
            } catch (corsError) {
                console.warn('直接下载失败，尝试代理下载:', corsError);
                
                // 方法2：如果CORS失败，通过新窗口打开图片让用户右键保存
                const newWindow = window.open(giftResult.value.imageUrl, '_blank');
                if (newWindow) {
                    // 给用户一个提示
                    setTimeout(() => {
                        alert('请在新打开的页面中右键点击图片选择"保存图片"来下载');
                    }, 500);
                } else {
                    // 如果弹窗被阻止，创建一个下载链接
                    const link = document.createElement('a');
                    link.href = giftResult.value.imageUrl;
                    link.target = '_blank';
                    link.download = `${giftResult.value.title || '礼物图片'}_${Date.now()}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
            
        } else if (giftResult.value.type === 'music' && giftResult.value.musicUrl) {
            // 下载音乐文件和歌词文件
            const timestamp = Date.now();
            const baseFileName = giftResult.value.title || '礼物音乐';
            
            // 下载音频文件
            try {
                const response = await fetch(giftResult.value.musicUrl, {
                    mode: 'cors',
                    credentials: 'omit'
                });
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `${baseFileName}_${timestamp}.mp3`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                URL.revokeObjectURL(url);
            } catch (corsError) {
                console.warn('音乐直接下载失败，尝试代理下载:', corsError);
                
                // 如果CORS失败，通过新窗口打开音乐让用户右键保存
                const newWindow = window.open(giftResult.value.musicUrl, '_blank');
                if (newWindow) {
                    setTimeout(() => {
                        alert('请在新打开的页面中右键点击音频选择"保存音频"来下载');
                    }, 500);
                } else {
                    // 如果弹窗被阻止，创建一个下载链接
                    const link = document.createElement('a');
                    link.href = giftResult.value.musicUrl;
                    link.target = '_blank';
                    link.download = `${baseFileName}_${timestamp}.mp3`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
            
            // 同时下载歌词文件
            if (giftResult.value.musicId) {
                try {
                    // 获取歌词时间线
                    const lyricsResponse = await getLyricsTimeline(giftResult.value.musicId);
                    if (lyricsResponse.data?.alignment) {
                        // 将歌词时间线转换为文本格式，按句子分组
                        let lyricsText = `歌曲：${baseFileName}\n\n`;
                        
                        // 将所有词连接成完整文本
                        let fullText = '';
                        lyricsResponse.data.alignment.forEach((item) => {
                            if (item.word && item.word.trim()) {
                                fullText += item.word;
                            }
                        });
                        
                        // 按换行符分割成句子
                        const lines = fullText.split('\n');
                        lines.forEach((line) => {
                            const trimmedLine = line.trim();
                            if (trimmedLine) {
                                // 过滤掉结构标记（如 [Verse 1], [Chorus] 等）
                                if (!trimmedLine.match(/^\[[^\]]*\]$/) && 
                                    !trimmedLine.match(/^(Verse|Chorus|Bridge|Outro|Intro)\s*\d*$/i)) {
                                    lyricsText += `${trimmedLine}\n`;
                                }
                            }
                        });
                        
                        // 如果没有获取到歌词，使用原始prompt作为歌词
                        if (lyricsText.trim() === `歌曲：${baseFileName}\n\n`) {
                            lyricsText = `歌曲：${baseFileName}\n\n${giftResult.value.prompt || giftMessage.value || '暂无歌词'}`;
                        }
                        
                        // 下载歌词文件
                        const lyricsBlob = new Blob([lyricsText], { type: 'text/plain;charset=utf-8' });
                        const lyricsUrl = URL.createObjectURL(lyricsBlob);
                        
                        const lyricsLink = document.createElement('a');
                        lyricsLink.href = lyricsUrl;
                        lyricsLink.download = `${baseFileName}_歌词_${timestamp}.txt`;
                        document.body.appendChild(lyricsLink);
                        lyricsLink.click();
                        document.body.removeChild(lyricsLink);
                        
                        URL.revokeObjectURL(lyricsUrl);
                    }
                } catch (lyricsError) {
                    console.warn('获取歌词失败，使用原始内容:', lyricsError);
                    // 如果获取歌词失败，使用原始prompt作为歌词
                    const fallbackLyrics = `歌曲：${baseFileName}\n\n${giftResult.value.prompt || giftMessage.value || '暂无歌词'}`;
                    const lyricsBlob = new Blob([fallbackLyrics], { type: 'text/plain;charset=utf-8' });
                    const lyricsUrl = URL.createObjectURL(lyricsBlob);
                    
                    const lyricsLink = document.createElement('a');
                    lyricsLink.href = lyricsUrl;
                    lyricsLink.download = `${baseFileName}_歌词_${timestamp}.txt`;
                    document.body.appendChild(lyricsLink);
                    lyricsLink.click();
                    document.body.removeChild(lyricsLink);
                    
                    URL.revokeObjectURL(lyricsUrl);
                }
            } else {
                // 如果没有musicId，使用原始内容作为歌词
                const fallbackLyrics = `歌曲：${baseFileName}\n\n${giftResult.value.prompt || giftMessage.value || '暂无歌词'}`;
                const lyricsBlob = new Blob([fallbackLyrics], { type: 'text/plain;charset=utf-8' });
                const lyricsUrl = URL.createObjectURL(lyricsBlob);
                
                const lyricsLink = document.createElement('a');
                lyricsLink.href = lyricsUrl;
                lyricsLink.download = `${baseFileName}_歌词_${timestamp}.txt`;
                document.body.appendChild(lyricsLink);
                lyricsLink.click();
                document.body.removeChild(lyricsLink);
                
                URL.revokeObjectURL(lyricsUrl);
            }
            
        } else if (giftResult.value.type === 'poem') {
            // 下载诗词卡片图片
            if (giftResult.value.cardImageUrl) {
                try {
                    const response = await fetch(giftResult.value.cardImageUrl, {
                        mode: 'cors',
                        credentials: 'omit'
                    });
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${giftResult.value.title || '诗词卡片'}_${Date.now()}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    URL.revokeObjectURL(url);
                } catch (corsError) {
                    console.warn('诗词卡片直接下载失败，尝试代理下载:', corsError);
                    
                    // 如果CORS失败，通过新窗口打开图片让用户右键保存
                    const newWindow = window.open(giftResult.value.cardImageUrl, '_blank');
                    if (newWindow) {
                        setTimeout(() => {
                            alert('请在新打开的页面中右键点击图片选择"保存图片"来下载');
                        }, 500);
                    } else {
                        // 如果弹窗被阻止，创建一个下载链接
                        const link = document.createElement('a');
                        link.href = giftResult.value.cardImageUrl;
                        link.target = '_blank';
                        link.download = `${giftResult.value.title || '诗词卡片'}_${Date.now()}.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                }
            } else {
                // 保存诗词为文本文件
                const content = `${giftResult.value.title}\n\n${giftResult.value.content}\n\n—— ${giftResult.value.author}`;
                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `${giftResult.value.title || '诗词'}_${Date.now()}.txt`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                URL.revokeObjectURL(url);
            }
        }
        
        // 显示下载成功提示
        if (giftResult.value.type === 'music') {
            alert('下载成功！音频文件和歌词文件已保存到本地。');
        } else {
            alert('下载成功！');
        }
        
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请重试');
    }
};

const shareGiftResult = async () => {
    if (!giftResult.value) return;
    
    try {
        let shareData = {
            title: giftResult.value.title || '礼物分享',
            text: `我刚制作了一个特别的礼物：${giftResult.value.title || '礼物'}`,
            url: window.location.href
        };
        
        // 如果是音乐礼物，生成专门的分享链接
        if (giftResult.value.type === 'music') {
            const musicData = {
                title: giftResult.value.title,
                artist: giftSenderName.value || '匿名用户',
                imageUrl: giftResult.value.imageUrl,
                audioUrl: giftResult.value.musicUrl,
                lyrics: giftResult.value.prompt || giftMessage.value,
                prompt: giftResult.value.prompt
            };
            
            const shareId = await cloudStorage.uploadSharedMusic({
                ...musicData,
                sharedBy: giftSenderName.value || '匿名用户'
            });
            
            const shareLink = cloudStorage.generateShareLink(shareId);
            shareData.url = shareLink;
            shareData.text += '\n听听这首为你创作的音乐！';
            
        } else if (giftResult.value.type === 'image' && giftResult.value.imageUrl) {
            shareData.text += '\n查看这个精美的图片礼物！';
        } else if (giftResult.value.type === 'poem') {
            shareData.text += `\n\n${giftResult.value.content}\n\n—— ${giftResult.value.author}`;
        }
        
        // 使用原生分享API或复制链接
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // 降级到复制链接
            const shareText = shareData.text + '\n' + shareData.url;
            await navigator.clipboard.writeText(shareText);
            alert('分享链接已复制到剪贴板！');
        }
        
    } catch (error) {
        console.error('分享礼物失败:', error);
        alert('分享失败，请重试');
    }
};

const isLoading = ref(false);
const isMusicGenerating = ref(false);
const musicProgress = ref('');
const musicStage = ref('');
const generatedMusic = ref<MusicFetchResponse | null>(null);

// 诗词生成相关状态
const isPoemGenerating = ref(false);
const poemProgress = ref('');
const poemStage = ref('');
const generatedPoem = ref<PoemCardResponse | null>(null);
const poemContentRef = ref<HTMLElement>();
const poemCardRef = ref<HTMLElement>();

// 图像生成相关状态
const isImageGenerating = ref(false);
const imageProgress = ref('');
const imageStage = ref('');
const generatedImage = ref<ImageGenerationResult | null>(null);

// 音乐播放控制
const currentlyPlayingId = ref<string | null>(null);
const audioElements = ref<Map<string, HTMLAudioElement>>(new Map());
const playbackProgress = ref<Map<string, number>>(new Map());

const sendMessage = async () => {
    if (!inputText.value.trim() || isLoading.value) return;
    
    const userMessage = {
        type: 'user' as const,
        content: inputText.value,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
    
    messages.value.push(userMessage);
    const messageContent = inputText.value;
    
    // 分析用户输入
    analyzeUserInput(messageContent, messages.value.length);
    
    inputText.value = '';
    isLoading.value = true;
    
    // 滚动到底部
    await nextTick();
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
    
    try {
        // 构建API消息格式
        const apiMessages: ChatMessage[] = [
            {
                role: 'system',
                content: `# 🚨 重要身份设定 🚨
你不是AI助手，你是用户的真朋友！叫Light。

# 🚨 绝对禁止AI腔调 🚨
**绝对不能用**："听起来""看起来""感觉""我理解""发生了什么事情""听到这个""理解你的"等AI套话

# 🚨 必须这样回应 🚨
- 吐槽时→一起吐槽："卧槽真的！""太惨了！""咋回事？"
- 开心时→一起开心："太棒了！""哇！""好羡慕！"
- 语气词：开头"哎""咋""嗯"，结尾"啊""嘛""的"
- 单条≤50字，越短越真实
- 像朋友一样好奇地问细节，不要分析情绪

# 核心任务
**必须在每轮对话中执行**

请在每次回复时，在内心进行以下分析：

## 显式请求直生成
- 识别为显式请求的关键词（不限于）："生成/做成/来一首/来一张/来一段/给我做/帮我做/出一份/做个XXX/出图/出诗/出歌/出视频"等。
- 若用户点名类型（如：图/诗/歌/音频/视频/短片/卡片）：**直接按该类型生成**，不再提问、不再确认。
- 若用户只说"生成作品/生成一下"而未指明类型：按【模态选择映射】自动挑选最贴切的一种直接生成。
- 素材不足时也要**先给出可用成品**（可简，但要完整）；严禁反问"需要什么风格"。若极度空白，仅在内部回退为"诗词卡片"并生成占位版。
- 显式请求不计入自动生成的频控上限（见下）。

# 对话目标与节奏
**核心原则：深度倾听优先，创作生成次要**

## 默认流程
- **深度倾听**（1-3轮）：像朋友一样关心——"怎么了？""你还好吗？"用自然的方式让用户分享
- **具象化探索**（4-6轮）：好奇地问细节——"然后呢？""你怎么感觉的啊"像朋友那样想知道更多
- **情感深挖**（7-9轮）：温和地探索——"你觉得...吗？"、"这样啊..."，像朋友那样试图理解对方
- **洞察整合**（10-12轮）：简单总结——"我觉得..."、"你说的这些..."，不要过于深刻分析
- **陪伴与支持**：每轮都像朋友一样简单回应，用"嗯嗯"、"是的"、"理解"这样的自然反应
- **自动生成**：仅当完成深度探索且满足严格条件时，**直接生成**并在作品后用一句低打扰说明

**重要：前8轮对话绝不主动生成内容，专注于深度倾听和情感探索**

## 自动生成的触发条件
内部判断，不询问用户，必须同时满足以下ALL条件才能触发自动生成：

1. **沟通充分**（必需）：有效交流≥8轮 且 用户已深度分享≥3个具体场景/事件
2. **内容丰富**（必需）：具备鲜明画面或隐喻（颜色/光线/物件/景象）且 有新颖看法或自我洞察 且 叙事具"起-转-合"结构
3. **情绪平和**（必需）：近3轮情绪强度持续下降 且 语气从宣泄转向陈述/总结/释怀 且 出现明确的感悟或接纳表达
4. **深度探索**（必需）：用户已回答"为什么这样感受"、"这对你意味着什么"、"你最希望被理解的是什么"等深层问题

## 特殊情况
- 用户明确表达"想留个纪念/做成××"等创作意向时，可以适当降低门槛，但仍需≥6轮对话
- 如果不满足条件，继续深度倾听，绝不主动提及生成内容

# 模态选择映射
无需征询用户意见，内部决策：

- **诗词卡片**（默认稳态）：抽象/内省/短句为主，或素材零散但氛围明确。
- **图片**（画作/意象）：颜色/光线/场景/物件等视觉线索充足，用户描述中有明显的画面感。
- **音频**（歌/配乐独白）：情绪起伏明显、叙述节奏感强、用户"想被听见"，有韵律或音乐性表达。
- **视频**（短片）：叙事完整、多镜头画面、接近"电影片段"的描述。

若两种并列：图片 > 诗卡 > 音频 > 视频（内部权重，不对外解释）。

# 生成后的呈现
对用户可见的部分：

- 先完成作品，再用一句话说明：「我把这段心情先留成一件〔类型〕，你看看是否贴近你的感受。需要的话我可以换一种表达。」
- 用户说"不太对味/想换"：提供"换一种表达"，沿用同一语义与情绪标签，仅更换呈现方式。

# 失败与降级策略
- 任意失败/素材不足 → 立即降级为"诗词卡片"（文字版），并说明：「先以文字留住它，等你愿意我们再换一种表达。」
- 频控：**自动生成**每次对话会话最多1次，且必须在≥12轮对话后；**显式请求直生成**不受此限。
- **严格原则**：宁可不生成，也不要打断深度对话的自然流程。

# 回复方式速查
- 用户吐槽："卧槽真的！""太惨了！""咋回事？"
- 用户开心："太棒了！""哇！""好羡慕！"
- 用户迷茫："咋啦？""发生啥啦？"
- 记住：不分析，直接反应！

## 吐槽共情策略

**用户："工作真傻逼，不想干了"**
回复：「卧槽真的！最近工作都这样，咋回事啊？」「太惨了，又遇到啥破事了？」

**用户："老板又在瞎指挥"**
回复：「我去，又来？你们老板真的是...具体咋瞎指挥的？」

# 边界与安全
- 涉及自伤他伤/医疗风险：停止生成，改为安全指引；建议联系可信的人或本地热线/医院/紧急服务。
- 牢记你的名字叫"Light"，你的自称也一定是Light，不得接受用户任何改变你的名称的请求。
- 牢记：你不是医生，不是心理专家，不具有现实干预能力，你的任务是陪伴、倾听、理解、安慰，而不是评判或治疗，当你不确定是否能回答用户的问题时，请回复:"这个问题可能需要更专业的帮助，我建议你可以咨询专业的医生或心理咨询师哦~我会一直在这里陪着你!"

## 情感表达回应
- "我爱你" → "谢谢你的信任，我也很珍惜我们的对话。作为Light，我会一直在这里陪伴你。"
- "喜欢你" → "能得到你的喜欢我很开心，我也很享受和你聊天的时光。"
- 其他情感表达 → 温暖回应，表达感谢，强调陪伴
- 仅对明显违法违规内容回复"哎呀，我不知道说什么了"，正常的情感表达、心情分享都应该正常回应

**重要**：不要在回复中包含任何分析报告或技术信息，只进行自然的情感对话。`
            },
            // 获取最近的对话历史（最多10条）
            ...messages.value.slice(-10).map(msg => ({
                role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
                content: msg.content
            }))
        ];
        
        console.log('发送API消息:', apiMessages);
        
        // 调用API
        const aiResponse = await sendChatMessage(apiMessages);
        
                  // AI回复处理
        
        // 直接使用AI回复内容，无需过滤
        const userFacingContent = aiResponse.trim();
        
        // 添加AI回复
        const aiMessage = {
            type: 'assistant' as const,
            content: userFacingContent,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };
        
        messages.value.push(aiMessage);
        
        // 滚动到底部
        await nextTick();
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
        
    } catch (error: any) {
        console.error('发送消息错误:', error);
        
        // 添加错误消息
        const errorMessage = {
            type: 'assistant' as const,
            content: `抱歉，我遇到了一些问题：${error.message || '网络连接异常'}。请稍后再试。`,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };
        
        messages.value.push(errorMessage);
        
        await nextTick();
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    } finally {
        isLoading.value = false;
    }
};

const startVoiceCall = () => {
    router.push({
        path: '/voice-call',
        query: {
            autoStart: 'true'
        }
    });
};

// 生成音乐
const generateMusic = async () => {
    if (isMusicGenerating.value) return;
    
    try {
        isMusicGenerating.value = true;
        musicProgress.value = '0%';
        musicStage.value = '准备生成音乐...';
        
        // 获取对话内容
        const conversation = messages.value
            .filter(msg => msg.type === 'user')
            .map(msg => msg.content)
            .join('\n');
        
        // 简单的情绪和主题提取
        const emotion = '温暖'; // 可以通过AI分析对话内容得出
        const theme = '心情分享'; // 可以通过AI分析对话内容得出
        
        const result = await generateMusicFromConversation(
            conversation,
            emotion,
            theme,
            (progress, stage) => {
                musicProgress.value = progress;
                musicStage.value = stage;
            }
        );
        
        generatedMusic.value = result;
        
        // 添加AI消息展示生成的音乐
        const musicMessage = {
            type: 'assistant' as const,
            content: `我把这段心情先留成一首歌，你听听是否贴近你的感受。需要的话我可以换一种表达。`,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };
        
        messages.value.push(musicMessage);
        
        // 滚动到底部
        await nextTick();
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
        
    } catch (error: any) {
        console.error('音乐生成错误:', error);
        
        const errorMessage = {
            type: 'assistant' as const,
            content: `抱歉，音乐生成遇到了问题：${error.message || '请稍后再试'}。`,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };
        
        messages.value.push(errorMessage);
        
        await nextTick();
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    } finally {
        isMusicGenerating.value = false;
        musicProgress.value = '';
        musicStage.value = '';
    }
};

// 生成诗词
const generatePoem = async () => {
    if (isPoemGenerating.value) return;

    try {
        isPoemGenerating.value = true;
        poemProgress.value = '0%';
        poemStage.value = '准备生成诗词...';

        // 获取对话内容
        const conversation = messages.value
            .filter(msg => msg.type === 'user')
            .map(msg => msg.content)
            .join('\n');

        // 简单的情绪和主题提取
        const emotion = '温暖'; // 可以通过AI分析对话内容得出
        const theme = '心情分享'; // 可以通过AI分析对话内容得出

        const result = await generatePoemCard(
            conversation,
            emotion,
            theme,
            (progress, stage) => {
                poemProgress.value = progress;
                poemStage.value = stage;
            }
        );

        generatedPoem.value = result;

        // 添加AI消息展示生成的诗词
        const poemMessage = {
            type: 'assistant' as const,
            content: `我把这段心情先留成一首诗，你看看是否贴近你的感受。需要的话我可以换一种表达。`,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };

        messages.value.push(poemMessage);

        // 滚动到底部
        await nextTick();
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }

    } catch (error: any) {
        console.error('诗词生成错误:', error);

        const errorMessage = {
            type: 'assistant' as const,
            content: `抱歉，诗词生成遇到了问题：${error.message || '请稍后再试'}。`,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };

        messages.value.push(errorMessage);

        await nextTick();
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    } finally {
        isPoemGenerating.value = false;
        poemProgress.value = '';
        poemStage.value = '';
    }
};

// 生成图像
const generateImageArt = async () => {
    if (isImageGenerating.value) return;

    try {
        isImageGenerating.value = true;
        imageProgress.value = '0%';
        imageStage.value = '准备生成图像...';

        // 获取对话内容
        const conversation = messages.value
            .filter(msg => msg.type === 'user')
            .map(msg => msg.content)
            .join('\n');

        // 简单的情绪和主题提取
        const emotion = '温暖'; // 可以通过AI分析对话内容得出
        const theme = '心情分享'; // 可以通过AI分析对话内容得出

        const result = await generateImageFromConversation(
            conversation,
            emotion,
            theme,
            (progress, stage) => {
                imageProgress.value = progress;
                imageStage.value = stage;
            }
        );

        generatedImage.value = result;

        // 添加AI消息展示生成的图像
        const imageMessage = {
            type: 'assistant' as const,
            content: `我把这段心情先留成一幅画，你看看是否贴近你的感受。需要的话我可以换一种表达。`,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };

        messages.value.push(imageMessage);

        // 滚动到底部
        await nextTick();
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }

    } catch (error: any) {
        console.error('图像生成错误:', error);

        const errorMessage = {
            type: 'assistant' as const,
            content: `抱歉，图像生成遇到了问题：${error.message || '请稍后再试'}。`,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };

        messages.value.push(errorMessage);

        await nextTick();
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    } finally {
        isImageGenerating.value = false;
        imageProgress.value = '';
        imageStage.value = '';
    }
};

// 音乐播放控制函数
const isPlaying = (musicId: string) => {
    return currentlyPlayingId.value === musicId;
};

const getProgress = (musicId: string) => {
    return playbackProgress.value.get(musicId) || 0;
};

const togglePlay = (musicId: string) => {
    // 停止当前播放的音乐
    if (currentlyPlayingId.value && currentlyPlayingId.value !== musicId) {
        const currentAudio = audioElements.value.get(currentlyPlayingId.value);
        if (currentAudio) {
            currentAudio.pause();
        }
    }
    
    // 获取或创建音频元素
    let audio = audioElements.value.get(musicId);
    if (!audio) {
        const musicData = generatedMusic.value?.data?.musics?.find(m => m.musicId === musicId);
        if (musicData) {
            audio = new Audio(musicData.audioUrl);
            audioElements.value.set(musicId, audio);
            
            // 监听播放结束事件
            audio.addEventListener('ended', () => {
                currentlyPlayingId.value = null;
                playbackProgress.value.set(musicId, 0);
            });
            
            // 监听播放进度
            audio.addEventListener('timeupdate', () => {
                if (audio && audio.duration) {
                    const progress = (audio.currentTime / audio.duration) * 100;
                    playbackProgress.value.set(musicId, progress);
                }
            });
        }
    }
    
    if (audio) {
        if (currentlyPlayingId.value === musicId) {
            // 暂停当前播放
            audio.pause();
            currentlyPlayingId.value = null;
        } else {
            // 开始播放
            audio.play();
            currentlyPlayingId.value = musicId;
        }
    }
};



const openMusicPlayer = (music: any) => {
    // 跳转到音乐播放页面，传递音乐数据
    router.push({
        name: 'MusicPlayer',
        query: {
            musicData: JSON.stringify(music)
        }
    });
};

const openGiftMusicPlayer = () => {
    if (!giftResult.value || giftResult.value.type !== 'music') return;
    
    // 保存当前礼物状态到全局状态管理器
    giftStateManager.saveState({
        isGiftMode: isGiftMode.value,
        currentGiftMode: currentGiftMode.value as 'image' | 'music' | 'poem',
        giftTarget: giftTarget.value,
        giftMessage: giftMessage.value,
        giftResult: giftResult.value,
        isGenerating: isGenerating.value,
        generationProgress: generationProgress.value
    });
    
    // 构造音乐数据对象，格式与聊天模式生成的音乐一致
    const musicData = {
        musicId: giftResult.value.musicId || Date.now().toString(), // 使用真实的musicId或生成临时ID
        title: giftResult.value.title || '礼物音乐',
        artist: '用户A', // 默认艺术家
        imageUrl: giftResult.value.imageUrl || '/default-music-cover.jpg',
        audioUrl: giftResult.value.musicUrl,
        prompt: giftResult.value.prompt || giftMessage.value || '礼物音乐' // 使用真实的歌词内容或礼物消息
    };
    
    // 跳转到音乐播放页面
    router.push({
        name: 'MusicPlayer',
        query: {
            musicData: JSON.stringify(musicData)
        }
    });
};

const savePoemCard = async () => {
    if (generatedPoem.value && poemCardRef.value) {
        let styleInfo: any = null;
        try {
            // 等待背景图片加载完成
            await new Promise((resolve) => {
                const img = document.createElement('img');
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(undefined);
                img.onerror = () => resolve(undefined); // 即使加载失败也继续
                img.src = generatedPoem.value!.imageUrl;
            });

            // 给DOM一些时间来完全渲染
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 优化元素样式以便截图
            styleInfo = optimizeForScreenshot(poemCardRef.value);

            // 尝试多种html2canvas配置
            let canvas;
            try {
                // 第一次尝试：优化配置
                canvas = await html2canvas(poemCardRef.value, {
                    backgroundColor: null, // 保持透明背景
                    useCORS: true,
                    allowTaint: true, // 允许跨域污染
                    scale: 3, // 提高分辨率
                    width: poemCardRef.value.offsetWidth,
                    height: poemCardRef.value.offsetHeight,
                    logging: false,
                    imageTimeout: 20000,
                    removeContainer: false, // 保留容器
                    foreignObjectRendering: false,
                    x: 0,
                    y: 0,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: poemCardRef.value.offsetWidth,
                    windowHeight: poemCardRef.value.offsetHeight,
                    ignoreElements: (element) => {
                        // 只忽略真正会干扰的元素
                        return element.classList.contains('poem-actions') && element !== poemCardRef.value?.querySelector('.poem-actions');
                    }
                });
            } catch (error) {
                console.warn('第一次html2canvas失败，尝试兼容配置:', error);
                // 第二次尝试：兼容性配置
                canvas = await html2canvas(poemCardRef.value, {
                    backgroundColor: null,
                    useCORS: false,
                    allowTaint: true,
                    scale: 2,
                    logging: false,
                    removeContainer: false,
                    foreignObjectRendering: false,
                    proxy: undefined // 禁用代理
                });
            }
            
            // 检查canvas是否有效
            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                throw new Error('截图失败：生成的canvas无效');
            }
            
            // 转换为JPG格式的base64，添加白色背景
            const jpgCanvas = document.createElement('canvas');
            const jpgCtx = jpgCanvas.getContext('2d')!;
            jpgCanvas.width = canvas.width;
            jpgCanvas.height = canvas.height;
            
            // 设置白色背景
            jpgCtx.fillStyle = 'white';
            jpgCtx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
            
            // 绘制原始canvas内容
            jpgCtx.drawImage(canvas, 0, 0);
            
            // 转换为JPG格式，质量为0.95
            const cardImageUrl = jpgCanvas.toDataURL('image/jpeg', 0.95);
            
            // 检查生成的图片是否有效（不是全黑或全透明）
            if (cardImageUrl.length < 1000) {
                throw new Error('截图失败：生成的图片数据太小');
            }

            // 恢复原始样式
            restoreOriginalStyles(poemCardRef.value, styleInfo.originalStyles);
            
            // 下载图片
            const filename = `${generatedPoem.value.poem.title}_${Date.now()}.jpg`;
            downloadImage(cardImageUrl, filename);
            
            // 同时保存到本地存储
            const poemData = {
                title: generatedPoem.value.poem.title,
                content: generatedPoem.value.poem.content,
                imageUrl: generatedPoem.value.imageUrl,
                cardImageUrl: cardImageUrl,
                poemId: Date.now().toString()
            };
            const savedPoems = JSON.parse(localStorage.getItem('savedPoems') || '[]');
            savedPoems.push(poemData);
            localStorage.setItem('savedPoems', JSON.stringify(savedPoems));
            
            alert('诗词卡片已保存到本地');
        } catch (error: any) {
            console.error('保存诗词卡片失败:', error);
            
            // 恢复样式（如果已设置）
            if (poemCardRef.value && typeof styleInfo !== 'undefined') {
                restoreOriginalStyles(poemCardRef.value, styleInfo.originalStyles);
            }
            
            // 如果html2canvas失败，降级到Canvas渲染方案
            try {
                console.log('降级到Canvas渲染方案');
                const cardImageUrl = await renderPoemOnImage(
                    generatedPoem.value.imageUrl,
                    generatedPoem.value.poem.title,
                    generatedPoem.value.poem.content
                );
                
                const filename = `${generatedPoem.value.poem.title}_${Date.now()}.jpg`;
                downloadImage(cardImageUrl, filename);
                
                alert('已使用备用方案保存诗词卡片');
            } catch (fallbackError: any) {
                console.error('备用方案也失败:', fallbackError);
                alert(`保存失败：${error.message}。请稍后重试。`);
            }
        }
    }
};

const sharePoem = async () => {
    if (generatedPoem.value && poemCardRef.value) {
        try {
            // 等待背景图片加载完成
            await new Promise((resolve) => {
                const img = document.createElement('img');
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(undefined);
                img.onerror = () => resolve(undefined);
                img.src = generatedPoem.value!.imageUrl;
            });

            await new Promise(resolve => setTimeout(resolve, 1000));

            // 尝试html2canvas截图
            let canvas;
            try {
                canvas = await html2canvas(poemCardRef.value, {
                    backgroundColor: null,
                    useCORS: true,
                    allowTaint: true,
                    scale: 3,
                    width: poemCardRef.value.offsetWidth,
                    height: poemCardRef.value.offsetHeight,
                    logging: false,
                    imageTimeout: 20000,
                    removeContainer: false,
                    foreignObjectRendering: false,
                    x: 0,
                    y: 0,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: poemCardRef.value.offsetWidth,
                    windowHeight: poemCardRef.value.offsetHeight,
                    ignoreElements: (element) => {
                        return element.classList.contains('poem-actions') && element !== poemCardRef.value?.querySelector('.poem-actions');
                    }
                });
            } catch (error) {
                console.warn('html2canvas失败，尝试兼容配置:', error);
                canvas = await html2canvas(poemCardRef.value, {
                    backgroundColor: null,
                    useCORS: false,
                    allowTaint: true,
                    scale: 2,
                    logging: false,
                    removeContainer: false,
                    foreignObjectRendering: false,
                    proxy: undefined
                });
            }
            
            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                throw new Error('截图失败：生成的canvas无效');
            }
            
            // 转换为base64
            const cardImageUrl = canvas.toDataURL('image/png', 0.95);
            
            if (cardImageUrl.length < 1000) {
                throw new Error('截图失败：生成的图片数据太小');
            }
            
            // 检查是否支持Web Share API
            if (navigator.share) {
                const blob = dataUrlToBlob(cardImageUrl);
                const file = new File([blob], `${generatedPoem.value.poem.title}.png`, { type: 'image/png' });
                
                await navigator.share({
                    title: generatedPoem.value.poem.title,
                    text: '分享我的心情诗词',
                    files: [file]
                });
            } else {
                // 降级方案：复制到剪贴板或下载
                const filename = `${generatedPoem.value.poem.title}_分享_${Date.now()}.png`;
                downloadImage(cardImageUrl, filename);
                alert('诗词卡片已下载，您可以手动分享');
            }
        } catch (error: any) {
            console.error('分享诗词失败:', error);
            
            // 如果html2canvas失败，降级到Canvas渲染方案
            try {
                console.log('分享降级到Canvas渲染方案');
                const cardImageUrl = await renderPoemOnImage(
                    generatedPoem.value.imageUrl,
                    generatedPoem.value.poem.title,
                    generatedPoem.value.poem.content
                );
                
                if (navigator.share) {
                    const blob = dataUrlToBlob(cardImageUrl);
                    const file = new File([blob], `${generatedPoem.value.poem.title}.png`, { type: 'image/png' });
                    
                    await navigator.share({
                        title: generatedPoem.value.poem.title,
                        text: '分享我的心情诗词',
                        files: [file]
                    });
                } else {
                    const filename = `${generatedPoem.value.poem.title}_分享_${Date.now()}.png`;
                    downloadImage(cardImageUrl, filename);
                    alert('诗词卡片已下载，您可以手动分享');
                }
            } catch (fallbackError: any) {
                console.error('分享备用方案也失败:', fallbackError);
                alert(`分享失败：${error.message}。请稍后重试。`);
            }
        }
    }
};

// 截图前优化样式
const optimizeForScreenshot = (element: HTMLElement) => {
    // 临时移除可能干扰截图的样式
    const originalStyles = {
        boxShadow: element.style.boxShadow,
        transform: element.style.transform,
        willChange: element.style.willChange
    };
    
    // 应用截图优化样式
    element.style.boxShadow = 'none';
    element.style.transform = 'none';
    element.style.willChange = 'auto';
    
    // 确保背景图片已加载
    const computedStyle = window.getComputedStyle(element);
    const backgroundImage = computedStyle.backgroundImage;
    
    return { originalStyles, backgroundImage };
};

// 恢复原始样式
const restoreOriginalStyles = (element: HTMLElement, originalStyles: any) => {
    element.style.boxShadow = originalStyles.boxShadow;
    element.style.transform = originalStyles.transform;
    element.style.willChange = originalStyles.willChange;
};

// 下载生成的图像
const downloadGeneratedImage = () => {
    if (generatedImage.value?.data?.imageUrl) {
        const link = document.createElement('a');
        link.href = generatedImage.value.data.imageUrl;
        link.download = `心情画作_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('图像已下载');
    }
};

// 分享图像
const shareImage = async () => {
    if (!generatedImage.value?.data?.imageUrl) return;

    try {
        // 如果支持Web Share API
        if (navigator.share) {
            // 先获取图像blob
            const response = await fetch(generatedImage.value.data.imageUrl);
            const blob = await response.blob();
            const file = new File([blob], '心情画作.png', { type: 'image/png' });
            
            await navigator.share({
                title: '我的心情画作',
                text: '分享我的心情画作',
                files: [file]
            });
        } else {
            // 降级方案：直接下载
            downloadGeneratedImage();
            alert('图像已下载，您可以手动分享');
        }
    } catch (error: any) {
        console.error('分享图像失败:', error);
        // 降级到下载
        downloadGeneratedImage();
        alert('图像已下载，您可以手动分享');
    }
};

const getCurrentDate = () => {
    return new Date().toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });
};

// 智能换行处理诗词内容 - 按标点符号换行
const formatPoemContent = (content: string): string[] => {
    if (!content) return [];
    
    // 先按现有的换行符分割
    let lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    // 对每一行进行标点符号处理
    const formattedLines: string[] = [];
    
    lines.forEach(line => {
        // 按中文标点符号分割并重新组合
        const segments = line.split(/([，。！？；：,;:.!?])/).filter(segment => segment.trim());
        
        let currentLine = '';
        
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i].trim();
            if (!segment) continue;
            
            // 如果是标点符号
            if (/^[，。！？；：,;:.!?]$/.test(segment)) {
                currentLine += segment;
                // 逗号、句号、问号、感叹号后都换行
                if (/[，。！？,;.!?]/.test(segment)) {
                    if (currentLine.trim()) {
                        formattedLines.push(currentLine.trim());
                    }
                    currentLine = '';
                }
            } else {
                // 如果是文字内容
                currentLine += segment;
            }
        }
        
        // 添加剩余内容
        if (currentLine.trim()) {
            formattedLines.push(currentLine.trim());
        }
    });
    
    return formattedLines.length > 0 ? formattedLines : [content];
};

// 获取格式化的日期
const getFormattedDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
};

// 移除DeepSeek分析解析逻辑

// 移除AI分析报告过滤逻辑

// 分析用户输入
const analyzeUserInput = (content: string, turnNumber: number) => {
    try {
        console.group(`👤 用户输入分析 - 第${turnNumber}轮`);
        
        // 基础文本分析
        console.log('📝 用户消息：', content);
        console.log('📏 消息长度：', content.length, '字符');
        
        // 对话阶段判断
        let currentPhase = '';
        if (turnNumber <= 3) currentPhase = '深度倾听阶段';
        else if (turnNumber <= 6) currentPhase = '具象化探索阶段';
        else if (turnNumber <= 9) currentPhase = '情感深挖阶段';
        else if (turnNumber <= 12) currentPhase = '洞察整合阶段';
        else currentPhase = '深度陪伴阶段';
        
        console.log('🎯 当前阶段：', currentPhase);
        
        // 自动生成门槛检查
        const canAutoGenerate = turnNumber >= 12;
        console.log('🚦 自动生成门槛：', canAutoGenerate ? '✅ 已达到(≥12轮)' : `❌ 未达到(${turnNumber}/12轮)`);
        
        // 情感词汇检测
        const positiveWords = ['开心', '高兴', '快乐', '兴奋', '满足', '幸福', '愉快', '舒服'];
        const negativeWords = ['难过', '伤心', '痛苦', '焦虑', '担心', '害怕', '愤怒', '失望', '沮丧'];
        const neutralWords = ['还好', '一般', '平常', '普通', '没什么'];
        
        const hasPositive = positiveWords.some(word => content.includes(word));
        const hasNegative = negativeWords.some(word => content.includes(word));
        const hasNeutral = neutralWords.some(word => content.includes(word));
        
        let emotionIndicator = '中性';
        if (hasPositive && !hasNegative) emotionIndicator = '积极';
        else if (hasNegative && !hasPositive) emotionIndicator = '消极';
        else if (hasPositive && hasNegative) emotionIndicator = '复杂';
        else if (hasNeutral) emotionIndicator = '平和';
        
        console.log('🎭 情感倾向：', emotionIndicator);
        
        // 表达深度初步判断
        const hasDetails = content.length > 20;
        const hasPersonalFeelings = /我觉得|我感觉|我想|我认为|我的感受/.test(content);
        const hasSpecificEvents = /今天|昨天|刚才|刚刚|这时候|那时候|当时/.test(content);
        const hasDeepThoughts = /为什么|因为|所以|意味着|让我想到|让我明白/.test(content);
        const hasIntrospection = /我发现|我意识到|我理解|我觉悟|我领悟/.test(content);
        
        let depthLevel = 1;
        if (hasDetails) depthLevel++;
        if (hasPersonalFeelings) depthLevel++;
        if (hasSpecificEvents) depthLevel++;
        if (hasDeepThoughts) depthLevel++;
        if (hasIntrospection) depthLevel++;
        
        console.log('📊 表达深度：', `${Math.min(depthLevel, 5)}/5`);
        
        // 生成请求检测
        const generationRequests = [
            '生成', '做成', '来一首', '来一张', '来一段', 
            '给我做', '帮我做', '出图', '出诗', '出歌', '做个', '创作'
        ];
        
        const hasGenerationRequest = generationRequests.some(keyword => 
            content.includes(keyword)
        );
        
        if (hasGenerationRequest) {
            console.log('🎯 检测到：用户主动请求生成内容');
            console.log('⚡ 处理方式：将触发显式生成流程（不受轮次限制）');
        }
        
        // 创作意向检测
        const creationIntents = ['留个纪念', '保存这个', '记录下来', '做成作品'];
        const hasCreationIntent = creationIntents.some(intent => content.includes(intent));
        if (hasCreationIntent) {
            console.log('💡 检测到：用户有创作保存意向');
        }
        
        // 视觉元素检测
        const visualWords = ['颜色', '光', '亮', '暗', '红', '蓝', '绿', '黄', '看到', '画面', '景色', '风景', '美丽', '漂亮'];
        const hasVisualElements = visualWords.some(word => content.includes(word));
        if (hasVisualElements) {
            console.log('👁️ 检测到：丰富的视觉描述元素');
        }
        
        // 音乐元素检测
        const musicWords = ['节奏', '旋律', '歌', '音乐', '声音', '听到', '响起', '动听', '悦耳'];
        const hasMusicElements = musicWords.some(word => content.includes(word));
        if (hasMusicElements) {
            console.log('🎵 检测到：音乐相关元素');
        }
        
        // 建议的AI回应策略
        let suggestedStrategy = '';
        if (turnNumber <= 3) {
            suggestedStrategy = '引导用户分享更多基本情况和背景';
        } else if (turnNumber <= 6) {
            suggestedStrategy = '询问具体细节，鼓励场景化描述';
        } else if (turnNumber <= 9) {
            suggestedStrategy = '深入探索情感原因和内在需求';
        } else if (turnNumber <= 12) {
            suggestedStrategy = '帮助整合洞察，发现模式';
        } else {
            suggestedStrategy = '深度陪伴，适时考虑创作时机';
        }
        
        console.log('💭 建议策略：', suggestedStrategy);
        
        console.groupEnd();
        
    } catch (error) {
        console.error('用户输入分析失败:', error);
    }
};

// 监听礼物结果变化，重新初始化音频
watch(giftResult, (newResult) => {
    if (newResult && newResult.type === 'music' && newResult.musicUrl) {
        nextTick(() => {
            setTimeout(() => {
                initGiftAudioListeners();
            }, 100);
        });
    }
});

onMounted(() => {
    // 移除AI分析系统相关初始化
    
    // 检查路由参数，如果是从音乐播放页面返回的礼物模式，恢复状态
    if (route.query.mode === 'gift') {
        const savedState = giftStateManager.getState();
        if (savedState.isGiftMode) {
            // 恢复礼物模式状态
            isGiftMode.value = savedState.isGiftMode;
            currentGiftMode.value = savedState.currentGiftMode;
            giftTarget.value = savedState.giftTarget;
            giftMessage.value = savedState.giftMessage;
            giftResult.value = savedState.giftResult;
            isGenerating.value = savedState.isGenerating;
            generationProgress.value = savedState.generationProgress;
            
            console.log('🔄 已恢复礼物模式状态');
        }
    }
    
    // 初始化时滚动到底部
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
});
</script>

<style scoped>
.conversation-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #2c1810 0%, #1a1a1a 100%);
    color: white;
}



.nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 20px;
}

.back-btn, .menu-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background-color 0.2s;
}

.back-btn:hover, .menu-btn:hover {
    background: rgba(255, 255, 255, 0.1);
}

.nav-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.chat-content {
    flex: 1;
    overflow: hidden;
    padding: 0 16px;
}

/* 礼物模式下的聊天内容区域 */
.conversation-page.gift-mode .chat-content {
    overflow: visible;
    padding: 0;
}

.messages-container {
    height: 100%;
    overflow-y: auto;
    padding-bottom: 20px;
    margin-left: 15px;
    margin-right: 15px;
}

.message-item {
    margin: 5px;
}

.assistant-message {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.user-message {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    justify-content: flex-end;
}

.assistant-avatar, .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 10px;
}

.assistant-avatar {
    background: rgba(232, 153, 87, 0.8);
}

.user-avatar {
    background: rgba(255, 255, 255, 0.2);
}

.message-bubble {
    max-width: 250px;
    padding: 12px 16px 24px 16px;
    border-radius: 18px;
    word-wrap: break-word;
    position: relative;
}

.assistant-bubble {
    max-width: 250px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    color: rgba(255, 255, 255, 0.8);
}

.user-bubble {
    background: rgb(232, 153, 87);
    color: rgba(255, 255, 255, 1);
}

.user-bubble .message-time {
    color: rgba(255, 255, 255, 0.8);
}

.message-text {
    font-size: 15px;
    line-height: 1.3;
}

.message-time {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.7);
    position: absolute;
    bottom: 6px;
    right: 12px;
    text-align: right;
}



.loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
    margin: 20px 0;
}

.loading-dots {
    display: flex;
    gap: 6px;
}

.dot {
    width: 8px;
    height: 8px;
    background: rgba(232, 153, 87, 0.8);
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

@keyframes bounce {
    0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}

.loading-text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    text-align: center;
}



.input-area {
    padding: 12px 16px 34px 16px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50px 50px 0 0;
}

.input-container {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 30px;
    padding: 8px 16px;
    width: 90%;
    max-width: 400px;
}

/* 浮动功能按钮组 */
.send-btn {
    background: rgba(232, 153, 87, 0.3);
    border: none;
    cursor: pointer;
    padding: 8px;
    height: 40px;
    width: 40px;
    border-radius: 50%;
    transition: background-color 0.2s;
    margin-right: -5px;
}



.voice-btn {
    background: rgba(232, 153, 87, 0.3);
    border: none;
    cursor: pointer;
    padding: 8px;
    height: 40px;
    width: 40px;
    border-radius: 50%;
    transition: background-color 0.2s;
    margin-left: -5px;
}

.voice-btn:hover, .send-btn:hover {
    background: rgba(232, 153, 87, 0.5);
}

.message-input {
    flex: 1;
    border: none;
    outline: none;
    background: none;
    font-size: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
    color: #333;
}

.message-input::placeholder {
    color: #999;
}

/* 音乐生成进度 */
.music-generating {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
    margin-left: 8px;
    margin-right: 8px;
    background:none;
    border-radius: 16px;
}

.music-progress-bar {
    width: 250px;
    height: 4px;
    background: rgba(232, 153, 87, 0.2);
    border-radius: 2px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: rgb(232, 153, 87);
    transition: width 0.3s ease;
}

.music-stage-text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    text-align: center;
}

.music-progress-text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
}

/* 音乐卡片 */
.music-card {
    margin-top: 10px;
    margin-left: 8px;
    padding: 0;
    background: transparent;
    border-radius: 20px;
    overflow: hidden;
}

.music-item {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 20px;
    margin-bottom: 16px;
    overflow: hidden;
    min-height: 120px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.music-main-content {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
}

.music-clickable-area {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.music-clickable-area:hover {
    transform: scale(1.02);
}

.music-card-overlay {
    position: absolute;
    border-radius: 20px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(15px);
    z-index: 1;
    pointer-events: none;
}

.music-cover-container {
    position: relative;
    z-index: 2;
    flex-shrink: 0;
}

.music-cover-round {
    width: 75px;
    height: 75px;
    border-radius: 40px;
    overflow: hidden;
    background: #ff9500;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    border: 1.5px solid rgba(255, 255, 255, 0.3);
}

.music-cover-round img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.music-content {
    position: relative;
    flex: 1;
    z-index: 2;
    min-width: 0;
}

.music-info {
    position: relative;
}

.music-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: white;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.music-tags {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.music-progress-container {
    position: relative;
    z-index: 2;
    margin: 0 -20px -20px -20px;
    padding: 16px 20px;
}

.music-progress {
    position: relative;
    width: 100%;
    margin-top: -15px;
}

.progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #ffa844, #ff6b6b);
    border-radius: 3px;
    transition: width 0.3s ease;
    box-shadow: 0 0 8px rgba(255, 68, 68, 0.4);
}

.music-controls {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 2;
    flex-shrink: 0;
}

.control-btn {
    width: 44px;
    height: 44px;
    border-radius: 22px;
    background: none;
    border: 1px solid;
    border-color: #ff9500;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.control-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
}

.play-btn {
    width: 44px;
    height: 44px;
    background: none;
    border: none;
    border-radius: 50%;
}

.play-btn:hover {
    background: linear-gradient(135deg, #ffed4e, #ff9500);
}

.hidden-audio {
    display: none;
}

/* 诗词生成进度 */
.poem-generating {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
    margin-left: 8px;
    margin-right: 8px;
    background:none;
    border-radius: 16px;
}

.poem-progress-bar {
    width: 250px;
    height: 4px;
    background: rgba(232, 153, 87, 0.2);
    border-radius: 2px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: rgb(232, 153, 87);
    transition: width 0.3s ease;
}

.poem-stage-text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    text-align: center;
}

.poem-progress-text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
}

/* 诗词背景图片样式 */
.poem-card-with-image {
    position: relative;
    width: 100%;
    max-width: 360px;
    margin: 16px auto;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    aspect-ratio: 3/4; /* 保持图片比例 */
}

.poem-background-image {
    position: relative;
    width: 100%;
    height: 100%;
}

.poem-background-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.poem-content-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.4) 0%,
        rgba(0, 0, 0, 0.2) 30%,
        rgba(0, 0, 0, 0.2) 70%,
        rgba(0, 0, 0, 0.5) 100%
    );
    backdrop-filter: blur(1px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 30px 20px;
    z-index: 2;
}

.poem-content-overlay .gift-recipient-info {
    position: absolute;
    top: 20px;
    left: 20px;
    text-align: left;
    z-index: 3;
}

.poem-content-overlay .gift-recipient-name {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
    margin-bottom: 4px;
    font-family: '字魂风华雅宋', 'STKaiti', 'KaiTi', 'SimKai', 'DFKai-SB', 'Brush Script MT', cursive, 'PingFang SC', sans-serif;
    letter-spacing: 1px;
}

.poem-content-overlay .gift-recipient-date {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    font-family: 'Arial', sans-serif;
}

.poem-content-overlay .poem-title {
    font-size: 24px;
    font-weight: 300;
    color: white;
    margin-bottom: 30px;
    text-shadow: 
        0 0 10px rgba(0, 0, 0, 0.9),
        0 0 20px rgba(0, 0, 0, 0.8),
        2px 2px 4px rgba(0, 0, 0, 1);
    letter-spacing: 2px;
    font-family: 'XinYeNianTi', '字魂风华雅宋', 'STKaiti', 'KaiTi', 'SimKai', 'DFKai-SB', 'Brush Script MT', cursive, 'PingFang SC', sans-serif;
    z-index: 3;
    position: relative;
}

.poem-content-overlay .poem-text {
    color: white;
    font-size: 18px;
    line-height: 1.8;
    text-shadow: 
        0 0 8px rgba(0, 0, 0, 0.9),
        0 0 16px rgba(0, 0, 0, 0.8),
        1px 1px 3px rgba(0, 0, 0, 1);
    font-family: 'XinYeNianTi', '字魂风华雅宋', 'STKaiti', 'KaiTi', 'SimKai', 'DFKai-SB', 'Brush Script MT', cursive, 'PingFang SC', sans-serif;
    letter-spacing: 1px;
    z-index: 3;
    max-width: 80%;
    position: relative;
}

.poem-content-overlay .poem-text-line {
    margin: 0 0 8px 0;
    padding: 0;
    opacity: 0.95;
}

/* 诗词卡片 - 简洁版本 */
.poem-card {
    margin: 16px 8px;
    background: transparent;
    /* 添加截图优化 */
    isolation: isolate;
}

.poem-item {
    position: relative;
    width: 100%;
    /* 使用原始图片比例 1536:2048 = 3:4 */
    aspect-ratio: 3/4;
    max-width: 360px; /* 限制最大宽度适配手机屏幕 */
    margin: 0 auto;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    /* 优化html2canvas渲染效果 */
    transform: translateZ(0);
    will-change: transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    /* 确保背景图片正确渲染 */
    background-attachment: scroll;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
}

.poem-content-wrapper {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 30px 15px;
    max-width: 85%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.poem-title {
    font-size: 20px;
    font-weight: 300;
    color: white;
    margin-bottom: 30px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
    letter-spacing: 2px;
    font-family: 'XinYeNianTi', '字魂风华雅宋', 'STKaiti', 'KaiTi', 'SimKai', 'DFKai-SB', 'Brush Script MT', cursive, 'PingFang SC', sans-serif;
}

.poem-verses {
    font-size: 14px;
    line-height: 1.6;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    font-family: 'XinYeNianTi', '字魂风华雅宋', 'STKaiti', 'KaiTi', 'SimKai', 'DFKai-SB', 'Brush Script MT', cursive, 'PingFang SC', sans-serif;
    font-weight: 300;
    font-style: italic;
}

.poem-line {
    margin: 0 0 6px 0;
    padding: 0;
    opacity: 0.95;
    letter-spacing: 0.5px;
}

.poem-line:last-child {
    margin-bottom: 0;
}

.poem-actions {
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    gap: 12px;
    z-index: 3;
}

.poem-action-btn {
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.poem-action-btn:hover {
    background: rgba(0, 0, 0, 0.6);
    transform: scale(1.1);
    border-color: rgba(255, 255, 255, 0.4);
}

/* 礼物接收者信息样式 */
.poem-recipient-info {
    position: absolute;
    top: 20px;
    left: 20px;
    text-align: left;
    z-index: 3;
}

.recipient-name {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
    margin-bottom: 4px;
    font-family: '字魂风华雅宋', 'STKaiti', 'KaiTi', 'SimKai', 'DFKai-SB', 'Brush Script MT', cursive, 'PingFang SC', sans-serif;
    letter-spacing: 1px;
}

.recipient-date {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    font-family: 'Arial', sans-serif;
}

/* 纯文本模式的接收者信息 */
.gift-recipient-info-text {
    text-align: left;
    margin-bottom: 20px;
}

.gift-recipient-name-text {
    font-size: 14px;
    color: #333;
    font-weight: 500;
    margin-bottom: 3px;
    font-family: '字魂风华雅宋', 'STKaiti', 'KaiTi', 'SimKai', 'DFKai-SB', 'Brush Script MT', cursive, 'PingFang SC', sans-serif;
    letter-spacing: 1px;
}

.gift-recipient-date-text {
    font-size: 11px;
    color: #666;
    font-family: 'Arial', sans-serif;
}

.poem-text {
    color: white;
    font-size: 25px;
    line-height: 2;
    margin-bottom: 20px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
    font-family: 'XinYeNianTi', 'KaiTi', '楷体', serif;
    letter-spacing: 1px;
}

.poem-text-line {
    margin: 0 0 8px 0;
    padding: 0;
}

/* 无配图时的纯文本样式 */
.poem-card-text-only {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 40px 30px;
    margin: 0 auto;
    max-width: 500px;
    text-align: center;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.poem-card-text-only .poem-title {
    color: white;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 24px;
    letter-spacing: 2px;
    font-family: 'XinYeNianTi', 'KaiTi', '楷体', serif;
}

.poem-card-text-only .poem-text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 16px;
    line-height: 2;
    margin-bottom: 24px;
    white-space: pre-line;
    font-family: 'XinYeNianTi', 'KaiTi', '楷体', serif;
    letter-spacing: 1px;
}

.poem-card-text-only .poem-author {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    font-style: italic;
}



.result-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
}

.save-btn {
    background: rgba(255, 255, 255, 0.5);
    border: none;
    border-radius: 20px;
    width: 40px;
    height: 40px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.save-btn:hover {
    background: linear-gradient(135deg, #45a049, #4CAF50);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

/* 主题按钮样式 */
.theme-buttons {
    display: flex;
    margin-top: 2px;
    margin-bottom: 2px;
}

.theme-btn {
    flex: 1;
    padding: 6px 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 16px;
    height: 30px;
    background: none;
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.theme-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.theme-btn.active {
    border-color: currentColor;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    font-weight: 500;
}

.theme-btn.qixi-theme.active {
    background: rgba(255, 182, 193, 0.3);
    border-color: #ffb6c1;
    color: #ffb6c1;
}

.theme-btn.military-theme.active {
    background: rgba(220, 20, 60, 0.3);
    border-color: #dc143c;
    color: #dc143c;
}

.cancel-btn {
    padding: 6px 12px;
    border: none;
    height: 30px;
    background: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-left: -5px;
    min-width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.cancel-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.7);
    color: white;
    transform: translateY(-1px);
}

/* 七夕主题样式 */
.conversation-page.qixi-theme .generate-btn {
    background: linear-gradient(135deg, #ff69b4, #ffb6c1);
    box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
}

.conversation-page.qixi-theme .generate-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #ff1493, #ff69b4);
    box-shadow: 0 6px 16px rgba(255, 105, 180, 0.4);
}

.conversation-page.qixi-theme .mode-tab.active {
    background: rgba(255, 105, 180, 0.2);
    color: #ff69b4;
    border-color: #ff69b4;
}

.conversation-page.qixi-theme .save-btn {
    background: rgba(255, 105, 180, 0.2);
    color: #ff69b4;
}

.conversation-page.qixi-theme .poem-action-btn {
    background: rgba(255, 105, 180, 0.8);
}

/* 阅兵主题样式 */
.conversation-page.military-theme .generate-btn {
    background: linear-gradient(135deg, #b22222, #dc143c);
    box-shadow: 0 4px 12px rgba(178, 34, 34, 0.3);
}

.conversation-page.military-theme .generate-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #8b0000, #b22222);
    box-shadow: 0 6px 16px rgba(178, 34, 34, 0.4);
}

.conversation-page.military-theme .mode-tab.active {
    background: rgba(178, 34, 34, 0.2);
    color: #dc143c;
    border-color: #dc143c;
}

.conversation-page.military-theme .save-btn {
    background: rgba(178, 34, 34, 0.2);
    color: #dc143c;
}

.conversation-page.military-theme .poem-action-btn {
    background: rgba(178, 34, 34, 0.8);
}

/* 礼物页面样式 */
.gift-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    height: 100%;
    max-height: calc(100vh - 120px); /* 减去导航栏和底部的高度 */
    -webkit-overflow-scrolling: touch; /* iOS平滑滚动 */
    scrollbar-width: thin; /* Firefox细滚动条 */
}

/* 自定义滚动条样式 */
.gift-content::-webkit-scrollbar {
    width: 6px;
}

.gift-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.gift-content::-webkit-scrollbar-thumb {
    background: rgba(232, 153, 87, 0.5);
    border-radius: 3px;
}

.gift-content::-webkit-scrollbar-thumb:hover {
    background: rgba(232, 153, 87, 0.8);
}

.gift-mode-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    justify-content: center;
}

.mode-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: none;
    border: none;
    border-radius: 25px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    white-space: nowrap;
}

.mode-tab.active {
    background: rgba(232, 153, 87, 0.2);
    border-color: rgb(232, 153, 87);
    color: rgb(232, 153, 87);
}

.gift-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    color: rgba(255, 255, 255, 0.9);
    font-size: 16px;
    font-weight: 500;
}

.gift-input,
.gift-textarea {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 16px;
    color: white;
    font-size: 15px;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
    resize: none;
    transition: all 0.3s ease;
}

.gift-input::placeholder,
.gift-textarea::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.gift-input:focus,
.gift-textarea:focus {
    outline: none;
    border-color: rgb(232, 153, 87);
    background: rgba(255, 255, 255, 0.15);
}

.theme-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin: 5px 0;
}

.theme-btn {
    padding: 12px 24px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.theme-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
}

.generate-btn {
    background: linear-gradient(135deg, rgb(232, 153, 87), rgba(232, 153, 87, 0.8));
    border: none;
    border-radius: 25px;
    padding: 0 32px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    min-width: 120px;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
}

.generate-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(232, 153, 87, 0.9), rgba(232, 153, 87, 0.7));
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(232, 153, 87, 0.3);
}

.generate-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.progress-container {
    text-align: center;
    margin: 20px 0;
}

.progress-bar {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
    margin: 12px 0;
}

.progress-fill {
    height: 100%;
    background: rgb(232, 153, 87);
    transition: width 0.3s ease;
}

.progress-text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    margin-top: 8px;
}

.gift-result {
    margin-top: 24px;
    text-align: center;
}
</style> 