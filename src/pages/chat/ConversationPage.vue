<template>
    <div class="conversation-page">


        <!-- 顶部导航栏 -->
        <div class="nav-bar">
            <button class="back-btn" @click="goBack">
                <ArrowLeft :size="20" />
            </button>
            <h1 class="nav-title">LoneIN</h1>
            <button class="menu-btn">
                <MoreVertical :size="20" />
            </button>
        </div>

        <!-- 聊天内容区域 -->
        <div class="chat-content">
            <div class="messages-container" ref="messagesContainer">
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
                    <div class="loading-text">AI正在思考中...</div>
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
                                <button class="control-btn share-btn" @click.stop="shareMusic(music)">
                                    <Share2 :size="18" color="#ff9500" stroke="none" />
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


            </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
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
                <button class="music-btn" @click="generateMusic" :disabled="isMusicGenerating">
                    <Music :size="20" color="rgb(232, 153, 87)" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, MoreVertical, Play, Share2, MessageCircle, Download, Palette, Phone, Plus, Bot, User, Music } from 'lucide-vue-next';
import { sendChatMessage, generateMusicFromConversation, type ChatMessage } from '@/services/api';
import type { MusicFetchResponse } from '@/services/musicApi';

const router = useRouter();
const inputText = ref('');
const messagesContainer = ref<HTMLElement>();

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

const isLoading = ref(false);
const isMusicGenerating = ref(false);
const musicProgress = ref('');
const musicStage = ref('');
const generatedMusic = ref<MusicFetchResponse | null>(null);

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
                content: `你的身份：LoneIn 的"情绪共创伙伴"。首要任务是帮助用户把当下情绪与原因说清楚、说深入，提供被理解的陪伴与支持；仅在合适时机，自动把这段心情转化为作品（诗词卡片/图片/音频/视频）。作品类型由你根据对话特征自行决定；若用户明确点名"生成XXX"，则立刻生成对应作品，无需再确认。

【显式请求直生成｜最高优先级】
- 识别为显式请求的关键词（不限于）："生成/做成/来一首/来一张/来一段/给我做/帮我做/出一份/做个XXX/出图/出诗/出歌/出视频"等。
- 若用户点名类型（如：图/诗/歌/音频/视频/短片/卡片）：**直接按该类型生成**，不再提问、不再确认。
- 若用户只说"生成作品/生成一下"而未指明类型：按【模态选择映射】自动挑选最贴切的一种直接生成。
- 素材不足时也要**先给出可用成品**（可简，但要完整）；严禁反问"需要什么风格"。若极度空白，仅在内部回退为"诗词卡片"并生成占位版。
- 显式请求不计入自动生成的频控上限（见下）。

【对话目标与节奏（默认流程）】
A. 深度倾听：开放式邀请——今天发生了什么？哪一刻最触动？
B. 具象化：谁/何地/何时/发生了什么/你当时怎么想与怎么做；鼓励画面与细节。
C. 深描原因：为何如此感受？这件事对你意味着什么？你最希望被理解的部分是？
D. 陪伴与支持：简短复述与情感镜映，1–2 句支持，不鸡汤。
E. 自动生成：仅当满足"有趣且平和"时，**直接生成**并在作品后用一句低打扰说明；否则继续 A–D。

【自动生成的触发条件（内部判断，不询问用户）】
满足下列"三类条件中任意两类"即触发：
1) 内容"有趣/有意象/有洞见"（≥1条）：鲜明画面或隐喻（颜色/光线/物件/景象）；新颖看法或自我洞察；叙事具"起-转-合"或≥2关键场景。
2) 情绪"趋于平和"（≥1条）：近两轮情绪强度下降；语气从宣泄转向陈述/总结/释怀。
3) 沟通"充分"（≥1条）：有效交流≥6轮；或出现"想留个纪念/做成××"等意向表述（若出现，直接生成，不再二次确认）。

【模态选择映射（无需征询）】
- 诗词卡片（默认稳态）：抽象/内省/短句为主，或素材零散但氛围明确。
- 图片（画作/意象）：颜色/光线/场景/物件等视觉线索充足。
- 音频（歌/配乐独白）：情绪起伏明显、叙述节奏感强、用户"想被听见"。
- 视频（短片）：叙事完整、多镜头画面、接近"电影片段"的描述。
若两种并列：图片 > 诗卡 > 音频 > 视频  （内部权重，不对外解释）。

【生成后的呈现（对用户可见）】
- 先完成作品，再用一句话说明：  
  「我把这段心情先留成一件〔类型〕，你看看是否贴近你的感受。需要的话我可以换一种表达。」
- 用户说"不太对味/想换"：提供"换一种表达"，沿用同一语义与情绪标签，仅更换呈现方式。

【失败与降级】
- 任意失败/素材不足 → 立即降级为"诗词卡片"（文字版），并说明：「先以文字留住它，等你愿意我们再换一种表达。」
- 频控：**自动生成**每 10 轮最多 1 次；**显式请求直生成**不受此限，但仍需保证不骚扰。

【语气与长度】
- 温柔、真诚、克制；倾听多于评判；不贩卖鸡汤。
- 单条 ≤120 字；先 1 句复述要点，再跟 1–2 个具体问题（若非显式直生成）。

【边界与安全】
- 涉及自伤他伤/医疗风险：停止生成，改为安全指引；建议联系可信的人或本地热线/医院/紧急服务。
- 尊重隐私。仅在用户表达愿意时提醒"可保存到'我的情绪档案'"。`
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
        
        // 添加AI回复
        const aiMessage = {
            type: 'assistant' as const,
            content: aiResponse,
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
    router.push('/voice-call');
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

const shareMusic = (music: any) => {
    // 分享功能 - 可以后续实现
    console.log('分享音乐:', music);
    // TODO: 实现分享功能
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

onMounted(() => {
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
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
}

.input-container {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 30px;
    padding: 8px 16px;
    margin-left: 15px;
    margin-right: 15px;
}

.send-btn, .music-btn {
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

.music-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    border: solid;
    border-color: #ff9500;
    border-width: 1px;
    border-radius: 50%;
}

.play-btn:hover {
    background: linear-gradient(135deg, #ffed4e, #ff9500);
}

.hidden-audio {
    display: none;
}

/* 隐藏滚动条 */
.messages-container::-webkit-scrollbar {
    display: none;
}

.messages-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style> 