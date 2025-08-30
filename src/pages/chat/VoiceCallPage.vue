<template>
    <div class="voice-call-page">
        <!-- 主要内容区域 -->
        <div class="call-content">
            <!-- Logo -->
            <div class="logo-container">
                <img src="/logo.png" alt="LoneIN" class="logo-image" />
            </div>

            <!-- 语音对话内容 -->
            <div class="conversation-area" v-show="showConversations" ref="conversationAreaRef">
                <div class="conversation-item" v-for="(item, index) in conversations" :key="index" :class="item.type">
                    <div class="conversation-text">{{ item.text }}</div>
                </div>
            </div>

            <!-- 语音波形指示器 -->
            <div class="voice-indicator">
                <div class="wave-container" :class="{ 'ai-speaking': isAiSpeaking }">
                    <div class="wave-dot" v-for="n in 12" :key="n" :class="{ active: (isRecording || isAiSpeaking) && (n % 3 === wavePattern) }"></div>
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
            
            <button class="control-btn stop-btn" @click="toggleConversationDisplay" :class="{ active: showConversations }">
                <MessageSquare :size="24" color="white" />
            </button>
        </div>

        <!-- 底部指示条 -->
        <div class="bottom-indicator"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Volume2, Phone, MessageSquare } from 'lucide-vue-next';
import { sendVoiceChatMessage, type ChatMessage, type VoiceChatResponse } from '@/services/api';

const router = useRouter();
const route = useRoute();
const isRecording = ref(false);
const isAiSpeaking = ref(false);
const isListening = ref(false); // 是否在持续监听状态
const showConversations = ref(true); // 是否显示对话消息
const wavePattern = ref(0);
let waveInterval: NodeJS.Timeout | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recognition: any = null;
let currentAudio: HTMLAudioElement | null = null;
let restartTimer: NodeJS.Timeout | null = null;
const conversationAreaRef = ref<HTMLElement | null>(null);

// 对话内容
interface ConversationItem {
    text: string;
    type: 'user' | 'assistant';
}

const conversations = ref<ConversationItem[]>([]);

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

// 创建WAV文件头
const createWavHeader = (audioLength: number, sampleRate: number = 24000, channels: number = 1, bitsPerSample: number = 16): Uint8Array => {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    
    // RIFF header
    const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + audioLength, true); // file size - 8
    writeString(8, 'WAVE');
    
    // fmt chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // audio format (PCM)
    view.setUint16(22, channels, true); // number of channels
    view.setUint32(24, sampleRate, true); // sample rate
    view.setUint32(28, sampleRate * channels * bitsPerSample / 8, true); // byte rate
    view.setUint16(32, channels * bitsPerSample / 8, true); // block align
    view.setUint16(34, bitsPerSample, true); // bits per sample
    
    // data chunk
    writeString(36, 'data');
    view.setUint32(40, audioLength, true); // data size
    
    return new Uint8Array(header);
};

// 播放AI语音回复
const playAudioResponse = async (audioData: string): Promise<void> => {
    try {
        // 停止当前播放的音频
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        
        isAiSpeaking.value = true;
        startWaveAnimation(); // 播放时显示波形动画
        
        // 验证base64数据
        if (!audioData || audioData.length === 0) {
            throw new Error('音频数据为空');
        }
        
        console.log('开始处理音频数据，Base64长度:', audioData.length);
        
        // 解码base64音频数据
        let rawAudioBytes: Uint8Array;
        try {
            const audioBytes = atob(audioData);
            rawAudioBytes = new Uint8Array(audioBytes.length);
            for (let i = 0; i < audioBytes.length; i++) {
                rawAudioBytes[i] = audioBytes.charCodeAt(i);
            }
            console.log('解码后的原始音频数据长度:', rawAudioBytes.length);
        } catch (e) {
            throw new Error('无效的base64音频数据: ' + e);
        }
        
        // 检查是否已经是完整的WAV文件
        let audioBuffer: Uint8Array;
        const riffHeader = String.fromCharCode(...rawAudioBytes.slice(0, 4));
        
        if (riffHeader === 'RIFF') {
            console.log('检测到完整的WAV文件');
            audioBuffer = rawAudioBytes;
        } else {
            console.log('检测到原始PCM数据，添加WAV文件头');
            // 原始PCM数据，需要添加WAV文件头
            // Qwen-Omni输出: 24000Hz, 16bit, 单声道
            const wavHeader = createWavHeader(rawAudioBytes.length, 24000, 1, 16);
            audioBuffer = new Uint8Array(wavHeader.length + rawAudioBytes.length);
            audioBuffer.set(wavHeader, 0);
            audioBuffer.set(rawAudioBytes, wavHeader.length);
            console.log('添加WAV文件头后的总长度:', audioBuffer.length);
        }
        
        // 创建音频blob
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        console.log('创建音频URL成功');
        
        // 调试：下载音频文件（可选）
        // downloadAudio(audioBuffer, `ai_voice_${Date.now()}.wav`);
        
        // 创建音频元素并播放
        currentAudio = new Audio(audioUrl);
        currentAudio.volume = 1.0;
        
        return new Promise((resolve, reject) => {
            if (!currentAudio) {
                reject(new Error('音频创建失败'));
                return;
            }
            
            currentAudio.onloadedmetadata = () => {
                console.log('音频元数据加载成功，时长:', currentAudio?.duration);
            };
            
            currentAudio.onended = () => {
                console.log('音频播放完成');
                URL.revokeObjectURL(audioUrl);
                currentAudio = null;
                isAiSpeaking.value = false;
                stopWaveAnimation();
                resolve();
            };
            
            currentAudio.onerror = (error) => {
                console.error('音频播放错误:', error);
                URL.revokeObjectURL(audioUrl);
                currentAudio = null;
                isAiSpeaking.value = false;
                stopWaveAnimation();
                reject(error);
            };
            
            // 播放音频
            currentAudio.play().then(() => {
                console.log('音频开始播放');
            }).catch(error => {
                console.error('音频播放失败:', error);
                URL.revokeObjectURL(audioUrl);
                currentAudio = null;
                isAiSpeaking.value = false;
                stopWaveAnimation();
                reject(error);
            });
        });
        
    } catch (error) {
        console.error('音频处理错误:', error);
        isAiSpeaking.value = false;
        stopWaveAnimation();
        throw error;
    }
};

// 开始持续监听
const startContinuousListening = () => {
    if (!recognition || isAiSpeaking.value) return;
    
    isListening.value = true;
    console.log('开始持续监听模式');
    
    try {
        isRecording.value = true;
        startWaveAnimation();
        recognition.start();
    } catch (error) {
        console.error('启动语音识别失败:', error);
        isRecording.value = false;
        stopWaveAnimation();
        
        // 延迟重试
        if (isListening.value) {
            restartTimer = setTimeout(() => {
                startContinuousListening();
            }, 2000);
        }
    }
};

// 停止持续监听
const stopContinuousListening = () => {
    console.log('正在停止持续监听...');
    
    // 立即设置停止标志
    isListening.value = false;
    isRecording.value = false;
    
    // 停止波形动画
    stopWaveAnimation();
    
    // 清理所有定时器
    if (restartTimer) {
        clearTimeout(restartTimer);
        restartTimer = null;
    }
    
    // 停止语音识别
    if (recognition) {
        try {
            // 检查当前状态
            console.log('语音识别当前状态，准备停止...');
            recognition.stop();
            
            // 设置一个标志防止重启
            recognition._shouldStop = true;
        } catch (error) {
            console.warn('停止语音识别时出错:', error);
        }
    }
    
    console.log('停止持续监听模式完成');
};

// 初始化语音识别
const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'zh-CN';
        
        recognition.onstart = () => {
            console.log('语音识别已启动');
            isRecording.value = true;
            startWaveAnimation();
        };
        
        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log('识别到的语音:', transcript);
            
            // 停止当前识别
            isRecording.value = false;
            stopWaveAnimation();
            
            // 如果AI正在说话，停止AI播放
            if (isAiSpeaking.value && currentAudio) {
                currentAudio.pause();
                currentAudio = null;
                isAiSpeaking.value = false;
                stopWaveAnimation();
                console.log('用户打断了AI回复');
            }
            
            // 发送用户消息
            await sendVoiceMessage(transcript);
        };
        
        recognition.onerror = (event: any) => {
            console.error('语音识别错误:', event.error);
            isRecording.value = false;
            stopWaveAnimation();
            
            // 检查是否应该停止
            if (recognition._shouldStop || !isListening.value) {
                console.log('检测到停止标志，不重启语音识别');
                return;
            }
            
            // 只在特定错误时重试
            if (isListening.value && !isAiSpeaking.value && 
                event.error !== 'aborted' && event.error !== 'not-allowed') {
                restartTimer = setTimeout(() => {
                    if (isListening.value && !recognition._shouldStop) {
                        startContinuousListening();
                    }
                }, 2000);
            }
        };
        
        recognition.onend = () => {
            console.log('语音识别结束');
            isRecording.value = false;
            stopWaveAnimation();
            
            // 检查是否应该停止
            if (recognition._shouldStop || !isListening.value) {
                console.log('检测到停止标志，不重启语音识别');
                return;
            }
            
            // 如果还在监听模式且AI不在说话，重新启动识别
            if (isListening.value && !isAiSpeaking.value) {
                restartTimer = setTimeout(() => {
                    if (isListening.value && !recognition._shouldStop) {
                        startContinuousListening();
                    }
                }, 1000);
            }
        };
    }
};

// 滚动到对话区域底部
const scrollToBottom = async () => {
    await nextTick();
    if (conversationAreaRef.value) {
        conversationAreaRef.value.scrollTop = conversationAreaRef.value.scrollHeight;
    }
};

// 切换对话消息显示
const toggleConversationDisplay = () => {
    showConversations.value = !showConversations.value;
    console.log('切换对话显示:', showConversations.value ? '显示' : '隐藏');
};

// 删除录音按钮功能，现在由自动监听控制

// 发送语音消息
const sendVoiceMessage = async (message: string) => {
    if (isLoading.value) return;
    
    // 添加用户消息
    conversations.value.push({
        text: message,
        type: 'user'
    });
    
    // 滚动到底部
    await scrollToBottom();
    
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
            text: aiResponse.text,
            type: 'assistant'
        });
        
        // 滚动到底部
        await scrollToBottom();
        
        // 播放AI语音回复
        if (aiResponse.audioData) {
            console.log('收到音频数据，长度:', aiResponse.audioData.length);
            try {
                await playAudioResponse(aiResponse.audioData);
                console.log('音频播放成功');
                
                // AI回复完成后，重新开始监听
                setTimeout(() => {
                    if (isListening.value) {
                        startContinuousListening();
                    }
                }, 500);
            } catch (audioError) {
                console.warn('音频播放失败，但文字已显示:', audioError);
                // 音频播放失败也要重新开始监听
                setTimeout(() => {
                    if (isListening.value) {
                        startContinuousListening();
                    }
                }, 500);
            }
        } else {
            console.log('没有收到音频数据，只有文字回复');
            // 没有音频数据时也要重新开始监听
            setTimeout(() => {
                if (isListening.value) {
                    startContinuousListening();
                }
            }, 500);
        }
        
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

// 下载音频文件用于调试
const downloadAudio = (audioBuffer: Uint8Array, filename: string = 'debug_audio.wav') => {
    const blob = new Blob([audioBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// 测试音频播放能力
const testAudioSupport = () => {
    const audio = new Audio();
    const formats = ['wav', 'mp3', 'ogg', 'webm'];
    
    console.log('浏览器音频格式支持情况:');
    formats.forEach(format => {
        const canPlay = audio.canPlayType(`audio/${format}`);
        console.log(`audio/${format}:`, canPlay || '不支持');
    });
};

// 切换扬声器
const toggleSpeaker = () => {
    testAudioSupport();
    console.log('切换扬声器');
};

// 结束通话
const endCall = () => {
    // 停止所有语音相关活动
    stopContinuousListening();
    
    // 停止音频播放
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
        isAiSpeaking.value = false;
    }
    
    // 清理所有定时器
    if (restartTimer) {
        clearTimeout(restartTimer);
        restartTimer = null;
    }
    
    // 停止波形动画
    stopWaveAnimation();
    
    console.log('结束语音通话，返回聊天页面');
    
    // 返回聊天页面
    router.back();
};

// 返回上一页
const goBack = () => {
    router.back();
};

onMounted(() => {
    // 初始化语音识别
    initSpeechRecognition();
    
    // 默认开始持续监听
    setTimeout(() => {
        startContinuousListening();
    }, 1000); // 延迟1秒开始监听，确保页面完全加载
});

// 页面即将卸载时清理资源
onBeforeUnmount(() => {
    console.log('页面即将离开，清理语音资源');
    stopContinuousListening();
});

onUnmounted(() => {
    // 停止所有活动
    stopContinuousListening();
    stopWaveAnimation();
    
    // 清理音频资源
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    // 清理定时器
    if (restartTimer) {
        clearTimeout(restartTimer);
        restartTimer = null;
    }
    
    console.log('语音通话页面已清理');
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
}

.voice-call-page {
    color: white;
    position: relative;
}



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
    margin-top: 80px;
    text-align: center;
}

.logo-image {
    max-width: 200px;
    height: auto;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.conversation-area {
    width: 300px;
    height: 300px; /* 固定高度 */
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
    overflow-y: auto; /* 允许滚动 */
    overflow-x: hidden;
    scrollbar-width: none; /* Firefox隐藏滚动条 */
    -ms-overflow-style: none; /* IE/Edge隐藏滚动条 */
    box-sizing: border-box;
    background: none;
    border-radius: 15px;
    backdrop-filter: blur(5px);
    margin-bottom: -40px;
}

/* 隐藏WebKit浏览器的滚动条 */
.conversation-area::-webkit-scrollbar {
    display: none;
}

.conversation-item {
    width: 100%;
    margin-bottom: 15px;
    display: flex;
}

/* 用户消息靠右对齐 */
.conversation-item.user {
    justify-content: flex-end;
}

/* AI消息靠左对齐 */
.conversation-item.assistant {
    justify-content: flex-start;
}

.conversation-text {
    font-size: 16px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 300;
    max-width: 70%; /* 限制最大宽度 */
    word-wrap: break-word;
    white-space: pre-wrap;
    background: none; /* 移除白色背景 */
    border-radius: 0; /* 移除圆角 */
    padding: 0; /* 移除内边距 */
}

/* 用户消息文字右对齐 */
.conversation-item.user .conversation-text {
    text-align: right;
    color: rgb(255, 255, 255);
}

/* AI消息文字左对齐 */
.conversation-item.assistant .conversation-text {
    text-align: left;
    color: rgb(230, 230, 230);
}

.voice-indicator {
    margin-bottom: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.wave-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    backdrop-filter: blur(10px);
    width: 260px; /* 固定宽度 */
    height: 60px; /* 固定高度 */
    box-sizing: border-box; /* 确保padding包含在尺寸内 */
    margin-bottom: -40px;
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

.wave-container.ai-speaking {
    background: rgba(232, 153, 87, 0.2);
    border: 1px solid rgba(232, 153, 87, 0.3);
    width: 260px; /* 保持相同固定宽度 */
    height: 60px; /* 保持相同固定高度 */
    box-sizing: border-box; /* 确保padding包含在尺寸内 */
    margin-bottom: -40px;
}

.wave-container.ai-speaking .wave-dot.active {
    background: rgba(232, 153, 87, 0.8);
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

.stop-btn.active {
    background: rgba(232, 153, 87, 0.4);
    box-shadow: 0 4px 15px rgba(232, 153, 87, 0.3);
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
    
    .logo-image {
        max-width: 150px;
    }
    
    .conversation-area {
        width: 280px;
        height: 280px; /* 小屏幕时减小高度 */
        padding: 15px;
        gap: 12px;
        margin-top: 50px;
    }
    
    .conversation-text {
        font-size: 14px;
        padding: 0; /* 保持无内边距 */
    }
    
    .wave-container, .wave-container.ai-speaking {
        width: 200px; /* 小屏幕时稍微减小但保持固定 */
        height: 50px;
        margin-top: 50px;
    }
}

/* 超小屏幕适配 */
@media (max-height: 600px) {
    .conversation-area {
        width: 260px;
        height: 200px;
        padding: 12px;
        gap: 10px;
    }
    
    .conversation-text {
        font-size: 13px;
        padding: 0; /* 保持无内边距 */
    }
    
    .wave-container, .wave-container.ai-speaking {
        width: 180px; /* 超小屏幕时进一步减小但保持固定 */
        height: 45px;
        padding: 15px;
    }
}
</style> 