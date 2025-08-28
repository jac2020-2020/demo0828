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

                <!-- 作品卡片 -->
                <div v-if="generatedWork" class="work-card">
                    <div class="work-content">
                        <div class="work-image">
                            <img :src="generatedWork.imageUrl" :alt="generatedWork.title" />
                            <div class="play-button">
                                <Play :size="24" fill="white" />
                            </div>
                        </div>
                        <div class="work-info">
                            <h3 class="work-title">{{ generatedWork.title }}</h3>
                            <p class="work-description">{{ generatedWork.description }}</p>
                        </div>
                        <div class="work-actions">
                            <Share2 :size="16" />
                        </div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="action-buttons">
                    <button class="action-btn share-btn">
                        <MessageCircle :size="16" />
                        <span>分享到社区</span>
                    </button>
                    <button class="action-btn save-btn">
                        <Download :size="16" />
                        <span>投递流光瓶</span>
                    </button>
                    <button class="action-btn create-btn">
                        <Palette :size="16" />
                        <span>来创作品</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
            <div class="input-container">
                <button class="voice-btn">
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
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, MoreVertical, Play, Share2, MessageCircle, Download, Palette, Phone, Plus, Bot, User } from 'lucide-vue-next';

const router = useRouter();
const inputText = ref('');
const messagesContainer = ref<HTMLElement>();

// 模拟聊天消息
const messages = ref([
    {
        type: 'assistant',
        content: '中午好，今天要生了什么有趣的事情吗？可以跟我分享。',
        time: '00:12'
    },
    {
        type: 'user',
        content: '你好',
        time: '00:12'
    },
    {
        type: 'assistant',
        content: '我理解你的感受，这种经历一定很特别吧？',
        time: '00:12'
    },
    {
        type: 'user',
        content: '今天比较emo，上班好累啊',
        time: '00:12'
    },
    {
        type: 'assistant',
        content: '我很ope到你的状态，上班的确让人疲惫所在。你在意意',
        time: '00:12'
    },
    {
        type: 'user',
        content: '今天有什么特别让你觉得emo的事情吗？',
        time: '00:12'
    },
    {
        type: 'assistant',
        content: '昨天加班到深夜，今天起来还是很头疼',
        time: '00:12'
    },
    {
        type: 'assistant',
        content: '感觉很不方向，人生就像在走迷宫，看不到前面要去哪儿，只能一直往前...',
        time: '00:12'
    },
    {
        type: 'assistant',
        content: '嗯，确实这个让我觉得有感触。让我一句话也就是句句心血管写一首歌！',
        time: '00:12'
    },
    {
        type: 'assistant',
        content: '倾听下，我写一首你的情感，马上生成发布来',
        time: '00:12'
    },
    {
        type: 'assistant',
        content: '我写了一首《夜行人》，人生虽然充满迷茫，但不要害怕，总会找到属于自己的光！',
        time: '00:12'
    }
]);

// 生成的作品
const generatedWork = ref({
    title: '夜行人',
    description: 'song, jazz, guitar...',
    imageUrl: '/api/placeholder/300/200'
});

const goBack = () => {
    router.back();
};

const sendMessage = () => {
    if (inputText.value.trim()) {
        messages.value.push({
            type: 'user',
            content: inputText.value,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        });
        inputText.value = '';
        
        // 滚动到底部
        nextTick(() => {
            if (messagesContainer.value) {
                messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
            }
        });
    }
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
}

.user-bubble {
    background: rgb(232, 153, 87);
    color: white;
}

.user-bubble .message-time {
    color: rgba(255, 255, 255, 0.8);
}

.message-text {
    font-size: 15px;
    line-height: 1.2;
}

.message-time {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.7);
    position: absolute;
    bottom: 6px;
    right: 12px;
    text-align: right;
}

.work-card {
    margin: 24px 0;
    padding: 16px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.work-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.work-image {
    position: relative;
    width: 100%;
    height: 120px;
    border-radius: 12px;
    overflow: hidden;
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.work-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 48px;
    height: 48px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.work-info {
    text-align: center;
}

.work-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: white;
}

.work-description {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
}

.work-actions {
    display: flex;
    justify-content: flex-end;
}

.action-buttons {
    display: flex;
    gap: 12px;
    margin: 20px 0;
    flex-wrap: wrap;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: rgba(232, 153, 87, 0.2);
    border: 1px solid rgba(232, 153, 87, 0.4);
    border-radius: 20px;
    color: rgb(232, 153, 87);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
    justify-content: center;
    min-width: 0;
}

.action-btn:hover {
    background: rgba(232, 153, 87, 0.3);
    border-color: rgb(232, 153, 87);
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
    color: #333;
}

.message-input::placeholder {
    color: #999;
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