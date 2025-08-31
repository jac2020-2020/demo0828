<template>
    <div class="chat-page">
        <!-- 视频背景 -->
        <div class="video-container">
            <video 
                class="video-background" 
                autoplay 
                muted 
                loop 
                playsinline
                preload="auto"
                ref="videoRef"
                :src="videoSrc"
            >
            </video>
            <div class="video-overlay"></div>
        </div>
        
        <!-- 顶部状态栏 -->
        <div class="status-bar safe-area-top"></div>
        
        <!-- 聊天内容区域 -->
        <div class="chat-content" ref="chatContent">
            <!-- 欢迎消息 -->
            <div v-if="messages.length === 0" class="welcome-message">
                <div class="logo-container">
                    <img src="@/assets/images/logo.png" alt="LoneIN" class="welcome-logo" />
                </div>
                <div class="welcome-text">今天心情如何，<br/>
                    要把心事变成作品吗？</div>
                <div class="start-chat-container">
                    <button class="start-chat-btn" @click="startConversation">
                        开始对话
                    </button>
                </div>
            </div>
            
            <!-- 消息列表 -->
            <div v-for="message in messages" :key="message.id" class="message-item">
                <div class="message-bubble" :class="message.role === 'user' ? 'message-user' : 'message-ai'">
                    {{ message.content }}
                </div>
                <div class="message-time">{{ formatTime(message.created_at) }}</div>
            </div>
            
            <!-- 建议生成气泡 -->
            <div v-if="showSuggestion" class="suggestion-bubble">
                <div class="suggestion-content">
                    <div class="suggestion-text">要把这段心情留成一张诗卡/一幅画吗？</div>
                    <div class="suggestion-actions">
                        <button class="btn-suggestion" @click="generateWork('poem')">诗卡</button>
                        <button class="btn-suggestion" @click="generateWork('image')">画作</button>
                        <button class="btn-dismiss" @click="dismissSuggestion">稍后</button>
                    </div>
                </div>
            </div>
            
            <!-- 生成中状态 -->
            <div v-if="isGenerating" class="generating-message">
                <div class="loading"></div>
                <span>正在为你把这段心情化成作品…</span>
            </div>
            
            <!-- 作品卡片 -->
            <div v-if="generatedWork" class="work-card-container">
                <div class="work-card" @click="viewWork">
                    <div class="work-header">
                        <h3 class="work-title">{{ generatedWork.title }}</h3>
                        <div class="work-tags">
                            <span v-for="tag in generatedWork.emotion_labels" :key="tag" class="tag">{{ tag }}</span>
                        </div>
                    </div>
                    <div class="work-content">
                        <div v-if="generatedWork.modality === 'poem'" class="poem-content">
                            {{ generatedWork.desc }}
                        </div>
                        <div v-else-if="generatedWork.modality === 'image'" class="image-content">
                            <div class="image-placeholder">🎨 画作生成中...</div>
                        </div>
                    </div>
                    <div class="work-actions">
                        <button class="btn-action" @click.stop="saveWork">保存到我的</button>
                        <button class="btn-action" @click.stop="shareWork">分享</button>
                        <button class="btn-action" @click.stop="changeModality">换形态</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 输入区域 -->
        <div class="input-area safe-area-bottom">
            <div class="input-container">
                <button class="voice-btn" @click="toggleVoice">
                    <Mic :size="18" />
                </button>
                <input 
                    v-model="inputText" 
                    type="text" 
                    class="message-input" 
                    placeholder="说点什么..."
                    @keyup.enter="sendMessage"
                />
                <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim()">
                    <Send :size="18" />
                </button>
            </div>
        </div>
        
        <!-- 底部导航 -->
        <TabBar current="chat" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Mic, Send } from 'lucide-vue-next';
import TabBar from '@/components/TabBar.vue';
import { useChatStore } from '@/store/chat';
import { generatePoem } from '@/services/api';
import type { Message, Work } from '@/types';


const router = useRouter();
const chatStore = useChatStore();
const chatContent = ref<HTMLElement>();
const videoRef = ref<HTMLVideoElement>();
const inputText = ref('');
const messages = ref<Message[]>([]);
const showSuggestion = ref(false);
const isGenerating = ref(false);
const generatedWork = ref<Work | null>(null);
const videoSrc = ref('/background.mp4');

// 发送消息
const sendMessage = async () => {
    if (!inputText.value.trim()) return;
    
    const userMessage: Message = {
        id: Date.now().toString(),
        session_id: 'current',
        role: 'user',
        content: inputText.value,
        created_at: new Date().toISOString(),
    };
    
    messages.value.push(userMessage);
    const messageContent = inputText.value;
    inputText.value = '';
    
    // 滚动到底部
    await nextTick();
    scrollToBottom();
    
    // 模拟AI回复
    setTimeout(() => {
        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            session_id: 'current',
            role: 'ai',
            content: generateAIResponse(messageContent),
            created_at: new Date().toISOString(),
        };
        messages.value.push(aiMessage);
        
        // 检查是否需要显示建议
        if (shouldShowSuggestion()) {
            setTimeout(() => {
                showSuggestion.value = true;
            }, 1000);
        }
        
        nextTick(() => scrollToBottom());
    }, 1000);
};

// 生成AI回复
const generateAIResponse = (userMessage: string): string => {
    const responses = [
        '我能感受到你的情绪，能再详细说说这件事对你的意义吗？',
        '这听起来很有画面感，你当时的感受是怎样的？',
        '我理解你的感受，这种经历一定很特别吧？',
        '听起来这对你来说很重要，想要把这份心情记录下来吗？',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
};

// 判断是否显示建议
const shouldShowSuggestion = (): boolean => {
    return messages.value.length >= 6 && Math.random() > 0.5;
};

// 生成作品
const generateWork = async (modality: 'poem' | 'image') => {
    showSuggestion.value = false;
    isGenerating.value = true;
    
    try {
        // 实际生成内容，不再使用硬编码
        if (modality === 'poem') {
            // 生成诗词
            const poemResult = await generatePoem(
                messages.value.map(m => m.content).join('\n'),
                '深思',
                '人生感悟'
            );
            
            generatedWork.value = {
                id: Date.now().toString(),
                user_id: 'current-user',
                session_id: 'current',
                source_message_id: messages.value[messages.value.length - 1].id,
                modality,
                title: poemResult.title,
                desc: poemResult.content,
                emotion_labels: ['深思', '感悟', '诗意'],
                visibility: 'private',
                created_at: new Date().toISOString(),
            };
        } else {
            // 模拟图片生成延迟
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            generatedWork.value = {
                id: Date.now().toString(),
                user_id: 'current-user',
                session_id: 'current',
                source_message_id: messages.value[messages.value.length - 1].id,
                modality,
                title: '月下独酌',
                desc: '一幅描绘月下独自思考的画作',
                emotion_labels: ['孤独', '思念', '深夜'],
                visibility: 'private',
                created_at: new Date().toISOString(),
            };
        }
    } catch (error) {
        console.error('生成内容失败:', error);
        // 如果生成失败，显示错误信息
        generatedWork.value = {
            id: Date.now().toString(),
            user_id: 'current-user',
            session_id: 'current',
            source_message_id: messages.value[messages.value.length - 1].id,
            modality,
            title: '生成失败',
            desc: '抱歉，内容生成失败，请重试',
            emotion_labels: ['系统'],
            visibility: 'private',
            created_at: new Date().toISOString(),
        };
    } finally {
        isGenerating.value = false;
        nextTick(() => scrollToBottom());
    }
};

// 取消建议
const dismissSuggestion = () => {
    showSuggestion.value = false;
};

// 语音切换
const toggleVoice = () => {
    // TODO: 实现语音功能
    console.log('语音功能待实现');
};

// 开始对话
const startConversation = () => {
    router.push('/conversation');
};

// 查看作品
const viewWork = () => {
    if (generatedWork.value) {
        // TODO: 跳转到作品详情
        console.log('查看作品:', generatedWork.value);
    }
};

// 保存作品
const saveWork = () => {
    if (generatedWork.value) {
        // TODO: 保存到我的作品
        console.log('保存作品');
    }
};

// 分享作品
const shareWork = () => {
    if (generatedWork.value) {
        // TODO: 分享功能
        console.log('分享作品');
    }
};

// 换形态
const changeModality = () => {
    if (generatedWork.value) {
        const newModality = generatedWork.value.modality === 'poem' ? 'image' : 'poem';
        generateWork(newModality);
    }
};

// 格式化时间
const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

// 滚动到底部
const scrollToBottom = () => {
    if (chatContent.value) {
        chatContent.value.scrollTop = chatContent.value.scrollHeight;
    }
};

onMounted(() => {
    // 初始化聊天
    console.log('聊天页面已加载');
    
    // 确保视频能够播放
    if (videoRef.value) {
        videoRef.value.addEventListener('loadeddata', () => {
            console.log('视频加载完成');
            videoRef.value?.play().catch(err => {
                console.log('视频自动播放失败:', err);
            });
        });
    }
});
</script>

<style scoped>
.chat-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}

.video-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.video-background {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0，0);
    pointer-events: none;
}

.status-bar {
    height: 44px;
    background: transparent;
    position: relative;
    z-index: 5;
}

.chat-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 16px;
    padding-bottom: 20px;
    -webkit-overflow-scrolling: touch;
    position: relative;
    z-index: 5;
    /* 隐藏滚动条 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
}

/* 隐藏WebKit浏览器的滚动条 */
.chat-content::-webkit-scrollbar {
    display: none;
}

.welcome-message {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 380px;
    gap: 32px;
}

.logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 380px;
}

.welcome-logo {
    width: 200px;
    height: auto;
    opacity: 0.95;
    filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.5));
}

.welcome-text {
    color: rgba(255, 255, 255, 0.95);
    font-size: 26px;
    text-align: center;
    font-family: 'ZiHunFengHuaYaSong', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
    font-weight: normal;
    letter-spacing: 1px;
    line-height: 1.6;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
    margin-top: 30px;
    margin-left: 15px;
}

.start-chat-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 90px;
}

.start-chat-btn {
    background: rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(232, 153, 87, 0.6);
    border-radius: 30px;
    color: rgb(232, 153, 87);
    font-size: 18px;
    font-weight: 500;
    padding: 12px 40px;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    width:250px;
    height: 60px;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
    margin-top: 120px;
}

.start-chat-btn:hover {
    background: rgba(232, 153, 87, 0.1);
    border-color: rgb(232, 153, 87);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(232, 153, 87, 0.3);
}

.start-chat-btn:active {
    transform: translateY(0);
    background: rgba(232, 153, 87, 0.2);
}

.message-item {
    margin: 16px 0;
}

.message-time {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
    margin-top: 4px;
}

.suggestion-bubble {
    margin: 20px 0;
    display: flex;
    justify-content: center;
}

.suggestion-content {
    background: rgba(232, 153, 87, 0.2);
    border: 1px solid rgba(232, 153, 87, 0.4);
    border-radius: 16px;
    padding: 16px;
    max-width: 280px;
}

.suggestion-text {
    color: #ffffff;
    font-size: 14px;
    margin-bottom: 12px;
    text-align: center;
}

.suggestion-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.btn-suggestion {
    background: rgba(232, 153, 87, 0.3);
    border: 1px solid rgba(232, 153, 87, 0.5);
    border-radius: 8px;
    color: #ffffff;
    font-size: 12px;
    padding: 6px 12px;
    cursor: pointer;
}

.btn-dismiss {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    padding: 6px 12px;
    cursor: pointer;
}

.generating-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 20px 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
}

.work-card-container {
    margin: 20px 0;
}

.work-header {
    margin-bottom: 12px;
}

.work-title {
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
}

.work-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.work-content {
    margin: 16px 0;
}

.poem-content {
    color: rgba(255, 255, 255, 0.9);
    font-size: 16px;
    line-height: 1.6;
    white-space: pre-line;
    font-style: italic;
}

.image-content {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 120px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.6);
}

.work-actions {
    display: flex;
    gap: 8px;
    justify-content: space-around;
    margin-top: 16px;
}

.btn-action {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #ffffff;
    font-size: 12px;
    padding: 8px 12px;
    cursor: pointer;
    flex: 1;
}

.btn-action:active {
    background: rgba(255, 255, 255, 0.2);
}

.input-area {
    padding: 12px 16px;
    background: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 5;
}

.input-container {
    display: flex;
    align-items: center;
    gap: 12px;
}

.voice-btn, .send-btn {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.voice-btn:active, .send-btn:active {
    background: rgba(255, 255, 255, 0.2);
}

.send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.message-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    color: #ffffff;
    font-size: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
    padding: 10px 16px;
    outline: none;
}

.message-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}


</style> 