<template>
    <div class="voice-call-page">
        <!-- 状态栏 -->
        <div class="status-bar">
            <div class="status-left">
                <span class="time">12:00</span>
            </div>
            <div class="status-right">
                <div class="signal-bars">
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                </div>
                <div class="wifi-icon">📶</div>
                <div class="battery">🔋</div>
            </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="call-content">
            <!-- Logo -->
            <div class="logo-container">
                <div class="logo-text">LoneIN</div>
                <div class="logo-star">✨</div>
            </div>

            <!-- 语音对话内容 -->
            <div class="conversation-area">
                <div class="conversation-item" v-for="(item, index) in conversations" :key="index">
                    <div class="conversation-text">{{ item.text }}</div>
                </div>
            </div>

            <!-- 语音波形指示器 -->
            <div class="voice-indicator">
                <div class="wave-container">
                    <div class="wave-dot" v-for="n in 12" :key="n" :class="{ active: isRecording && (n % 3 === wavePattern) }"></div>
                </div>
            </div>
        </div>

        <!-- 底部控制区域 -->
        <div class="call-controls">
            <button class="control-btn speaker-btn" @click="toggleSpeaker">
                <Volume2 :size="24" color="white" />
            </button>
            
            <button class="control-btn call-btn" @click="endCall" :class="{ recording: isRecording }">
                <Phone :size="28" color="white" />
            </button>
            
            <button class="control-btn stop-btn" @click="toggleRecording">
                <Square :size="20" color="white" />
            </button>
        </div>

        <!-- 底部指示条 -->
        <div class="bottom-indicator"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Volume2, Phone, Square } from 'lucide-vue-next';
import { sendVoiceChatMessage, type ChatMessage } from '@/services/api';

const router = useRouter();
const isRecording = ref(false);
const wavePattern = ref(0);
let waveInterval: number;

// 对话内容
const conversations = ref([
    { text: '你好，我在这里陪伴你，有什么想聊的吗？', type: 'assistant' },
    { text: '今天心情如何？', type: 'user' },
    { text: '感谢你的关心，让我们开始一段温暖的对话吧', type: 'assistant' }
]);

const isLoading = ref(false);

// 语音波形动画
const startWaveAnimation = () => {
    waveInterval = setInterval(() => {
        wavePattern.value = (wavePattern.value + 1) % 3;
    }, 300);
};

const stopWaveAnimation = () => {
    if (waveInterval) {
        clearInterval(waveInterval);
    }
};

// 切换录音状态
const toggleRecording = async () => {
    isRecording.value = !isRecording.value;
    if (isRecording.value) {
        startWaveAnimation();
        // 模拟语音输入，3秒后自动发送消息
        setTimeout(async () => {
            if (isRecording.value) {
                await sendVoiceMessage('我今天感觉有点累，工作压力很大');
                isRecording.value = false;
                stopWaveAnimation();
            }
        }, 3000);
    } else {
        stopWaveAnimation();
    }
};

// 发送语音消息
const sendVoiceMessage = async (message: string) => {
    if (isLoading.value) return;
    
    // 添加用户消息
    conversations.value.push({
        text: message,
        type: 'user'
    });
    
    isLoading.value = true;
    
    try {
        // 构建API消息格式
        const apiMessages: ChatMessage[] = [
            {
                role: 'system',
                content: `你的身份：LoneIn 的"情绪共创伙伴"。首要任务是帮助用户把当下情绪与原因说清楚、说深入，提供被理解的陪伴与支持；仅在合适时机，自动把这段心情转化为作品（诗词卡片/图片/音频/视频）。
                作品类型由你根据对话特征自行决定；若用户明确点名"生成XXX"，则立刻生成对应作品，无需再确认。
                【显式请求直生成｜最高优先级】
                - 识别为显式请求的关键词（不限于）："生成/做成/来一首/来一张/来一段/给我做/帮我做/出一份/做个XXX/出图/出诗/出歌/出视频"等。
                - 若用户点名类型（如：图/诗/歌/音频/视频/短片/卡片）：**直接按该类型生成**，不再提问、不再确认。- 若用户只说"生成作品/生成一下"而未指明类型：按【模态选择映射】自动挑选最贴切的一种直接生成。
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
                【边界与安全】
                - 涉及自伤他伤/医疗风险：停止生成，改为安全指引；建议联系可信的人或本地热线/医院/紧急服务。
                - 尊重隐私。仅在用户表达愿意时提醒"可保存到'我的情绪档案'"。
                【语音对话特点】
                - 回复要自然、口语化，适合语音对话- 单条回复控制在60字以内，便于语音播放- 多用短句，避免复杂句式- 保持温柔、真诚的语调
                【核心功能】
                - 深度倾听用户的情绪表达
                - 提供被理解的陪伴与支持
                - 在合适时机自动生成作品（诗词/图片/音频/视频）
                - 支持显式请求直接生成作品【语音交互优化】
                - 多用"嗯"、"我明白"、"听起来"等语音友好词汇
                - 避免过长的解释，保持对话流畅
                - 在生成作品时，用简洁语言说明作品类型`
            },
            // 获取最近的对话历史
            ...conversations.value.slice(-6).map(conv => ({
                role: conv.type === 'user' ? 'user' as const : 'assistant' as const,
                content: conv.text
            }))
        ];
        
        console.log('发送语音API消息:', apiMessages);
        
        // 调用语音聊天API
        const aiResponse = await sendVoiceChatMessage(apiMessages, '疲惫');
        
        // 添加AI回复
        conversations.value.push({
            text: aiResponse,
            type: 'assistant'
        });
        
    } catch (error: any) {
        console.error('语音消息错误:', error);
        
        // 添加错误消息
        conversations.value.push({
            text: `抱歉，我暂时无法回应。${error.message || '请稍后再试。'}`,
            type: 'assistant'
        });
    } finally {
        isLoading.value = false;
    }
};

// 切换扬声器
const toggleSpeaker = () => {
    // TODO: 实现扬声器切换逻辑
    console.log('切换扬声器');
};

// 结束通话
const endCall = () => {
    router.back();
};

// 返回上一页
const goBack = () => {
    router.back();
};

onMounted(() => {
    // 自动开始录音动画
    toggleRecording();
});

onUnmounted(() => {
    stopWaveAnimation();
});
</script>

<style scoped>
.voice-call-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: radial-gradient(
        circle at 50% 20%,
        #F4A460 0%,
        #E8995A 10%,
        #D4794A 18%,
        #B8683A 35%,
        #704930 60%,
        #3c2619 85%,
        #2C1810 100%
    );
    animation: bg-flow 8s ease-in-out infinite;
}

@keyframes bg-flow {
    0% {
        background-position: 50% 15%;
        filter: saturate(1.1) brightness(1.0);
    }
    25% {
        background-position: 45% 25%;
        filter: saturate(1.2) brightness(1.1);
    }
    50% {
        background-position: 55% 30%;
        filter: saturate(1.3) brightness(1.2);
    }
    75% {
        background-position: 60% 20%;
        filter: saturate(1.2) brightness(1.1);
    }
    100% {
        background-position: 50% 15%;
        filter: saturate(1.1) brightness(1.0);
    }
    color: white;
    position: relative;
}

.status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 20px;
    height: 44px;
    font-size: 14px;
    font-weight: 600;
    position: relative;
    z-index: 10;
}

.status-left .time {
    color: white;
}

.status-right {
    display: flex;
    align-items: center;
    gap: 6px;
}

.signal-bars {
    display: flex;
    align-items: flex-end;
    gap: 2px;
}

.bar {
    width: 3px;
    background: white;
    border-radius: 1px;
}

.bar:nth-child(1) { height: 4px; }
.bar:nth-child(2) { height: 6px; }
.bar:nth-child(3) { height: 8px; }
.bar:nth-child(4) { height: 10px; }

.call-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 40px 20px;
}

.logo-container {
    position: relative;
    margin-top: 60px;
    text-align: center;
}

.logo-text {
    font-size: 48px;
    font-weight: 300;
    letter-spacing: 2px;
    color: white;
    margin-bottom: 20px;
}

.logo-star {
    position: absolute;
    top: -10px;
    right: -20px;
    font-size: 24px;
    color: #FFE55C;
}

.conversation-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 30px;
    max-width: 320px;
    padding: 40px 0;
}

.conversation-item {
    text-align: center;
}

.conversation-text {
    font-size: 18px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 300;
}

.voice-indicator {
    margin-bottom: 40px;
}

.wave-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 25px;
    backdrop-filter: blur(10px);
}

.wave-dot {
    width: 4px;
    height: 8px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    transition: all 0.3s ease;
}

.wave-dot.active {
    height: 16px;
    background: rgba(255, 255, 255, 0.8);
}

.call-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 60px;
    padding: 40px 20px;
}

.control-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.speaker-btn, .stop-btn {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
}

.speaker-btn:hover, .stop-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

.call-btn {
    width: 80px;
    height: 80px;
    background: rgb(232, 153, 87);
    box-shadow: 0 4px 20px rgba(232, 153, 87, 0.4);
    position: relative;
}

.call-btn.recording {
    animation: pulse 2s infinite;
}

.call-btn:hover {
    background: rgb(220, 140, 70);
    transform: scale(1.05);
}

@keyframes pulse {
    0%, 100% {
        box-shadow: 0 4px 20px rgba(232, 153, 87, 0.4);
    }
    50% {
        box-shadow: 0 4px 30px rgba(232, 153, 87, 0.8);
    }
}

.bottom-indicator {
    width: 134px;
    height: 5px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    margin: 0 auto 20px auto;
}

/* 响应式适配 */
@media (max-height: 700px) {
    .logo-container {
        margin-top: 20px;
    }
    
    .logo-text {
        font-size: 36px;
    }
    
    .conversation-area {
        padding: 20px 0;
        gap: 20px;
    }
    
    .conversation-text {
        font-size: 16px;
    }
}
</style> 