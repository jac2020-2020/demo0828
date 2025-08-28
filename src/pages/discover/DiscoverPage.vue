<template>
    <div class="discover-page">
        <!-- 顶部状态栏 -->
        <div class="status-bar safe-area-top"></div>
        
        <!-- 页面标题 -->
        <div class="page-header">
            <h1 class="page-title">发现</h1>
        </div>
        
        <!-- Tab切换 -->
        <div class="tab-switcher">
            <button 
                v-for="tab in tabs" 
                :key="tab.key"
                class="tab-button"
                :class="{ active: activeTab === tab.key }"
                @click="switchTab(tab.key)"
            >
                {{ tab.label }}
            </button>
        </div>
        
        <!-- 内容区域 -->
        <div class="content-area">
            <!-- 推荐 -->
            <div v-if="activeTab === 'recommend'" class="tab-content">
                <div v-if="recommendWorks.length === 0" class="empty-state">
                    <div class="empty-icon">
                        <Sparkles :size="48" />
                    </div>
                    <div class="empty-text">去和我聊聊，作品会在这里遇见同频的人。</div>
                </div>
                <div v-else class="works-grid">
                    <div v-for="work in recommendWorks" :key="work.id" class="work-item" @click="viewWork(work)">
                        <div class="work-cover">
                                                    <div v-if="work.modality === 'poem'" class="poem-preview">{{ work.title }}</div>
                        <div v-else class="image-preview">
                            <Palette :size="32" />
                        </div>
                        </div>
                        <div class="work-info">
                            <div class="work-title">{{ work.title }}</div>
                            <div class="work-tags">
                                <span v-for="tag in work.emotion_labels.slice(0, 2)" :key="tag" class="tag">{{ tag }}</span>
                            </div>
                        </div>
                        <div class="work-meta">
                            <span class="author">匿名用户</span>
                            <span class="time">{{ formatTime(work.created_at) }}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 关注 -->
            <div v-if="activeTab === 'follow'" class="tab-content">
                <div class="empty-state">
                    <div class="empty-icon">
                        <Users :size="48" />
                    </div>
                    <div class="empty-text">还没有关注的人，去发现页逛逛吧。</div>
                </div>
            </div>
            
            <!-- 共鸣墙 -->
            <div v-if="activeTab === 'wall'" class="tab-content">
                <div class="emotion-topics">
                    <div class="topic-header">
                        <h3>情绪话题</h3>
                    </div>
                    <div class="topics-grid">
                        <div v-for="topic in emotionTopics" :key="topic" class="topic-item" @click="viewTopic(topic)">
                            <span class="topic-name">{{ topic }}</span>
                            <span class="topic-count">{{ Math.floor(Math.random() * 100) + 1 }}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 流光瓶 -->
            <div v-if="activeTab === 'bottle'" class="tab-content">
                <div class="bottle-area">
                    <div class="bottle-animation">
                        <div class="bottle-icon">
                            <Mail :size="64" />
                        </div>
                        <div class="bottle-text">扔出一只瓶子，看看谁会拾起。</div>
                    </div>
                    <div class="bottle-actions">
                        <button class="btn-primary bottle-btn" @click="throwBottle">投递流光瓶</button>
                        <button class="btn-secondary bottle-btn" @click="pickBottle">拾取流光瓶</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 底部导航 -->
        <TabBar current="discover" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sparkles, Users, Mail, Palette } from 'lucide-vue-next';
import TabBar from '@/components/TabBar.vue';
import type { Work } from '@/types';

const activeTab = ref('recommend');
const recommendWorks = ref<Work[]>([]);

const tabs = [
    { key: 'recommend', label: '推荐' },
    { key: 'follow', label: '关注' },
    { key: 'wall', label: '共鸣墙' },
    { key: 'bottle', label: '流光瓶' },
];

const emotionTopics = [
    '孤独', '思念', '深夜', '回忆', '希望', '焦虑', 
    '快乐', '感动', '失落', '温暖', '迷茫', '治愈'
];

// 切换Tab
const switchTab = (tabKey: string) => {
    activeTab.value = tabKey;
};

// 查看作品
const viewWork = (work: Work) => {
    console.log('查看作品:', work);
    // TODO: 跳转到作品详情页
};

// 查看话题
const viewTopic = (topic: string) => {
    console.log('查看话题:', topic);
    // TODO: 显示话题相关作品
};

// 投递流光瓶
const throwBottle = () => {
    console.log('投递流光瓶');
    // TODO: 实现投递功能
};

// 拾取流光瓶
const pickBottle = () => {
    console.log('拾取流光瓶');
    // TODO: 实现拾取功能
};

// 格式化时间
const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
};

// 生成模拟数据
const generateMockWorks = () => {
    const mockWorks: Work[] = [
        {
            id: '1',
            user_id: 'user1',
            session_id: 'session1',
            source_message_id: 'msg1',
            modality: 'poem',
            title: '夜雨思君',
            desc: '夜雨敲窗声不断\n思君不见泪如帘',
            emotion_labels: ['思念', '孤独'],
            visibility: 'public',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: '2',
            user_id: 'user2',
            session_id: 'session2',
            source_message_id: 'msg2',
            modality: 'image',
            title: '城市夜景',
            desc: '霓虹灯下的孤独身影',
            emotion_labels: ['孤独', '深夜'],
            visibility: 'public',
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: '3',
            user_id: 'user3',
            session_id: 'session3',
            source_message_id: 'msg3',
            modality: 'poem',
            title: '春日暖阳',
            desc: '春风拂面暖如昔\n心中希望如花开',
            emotion_labels: ['希望', '温暖'],
            visibility: 'public',
            created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        },
    ];
    recommendWorks.value = mockWorks;
};

onMounted(() => {
    generateMockWorks();
});
</script>

<style scoped>
.discover-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #000000 0%, #1a1a1a 100%);
}

.status-bar {
    height: 44px;
    background: transparent;
}

.page-header {
    padding: 16px 20px 0;
}

.page-title {
    color: #ffffff;
    font-size: 28px;
    font-weight: 700;
    margin: 0;
}

.tab-switcher {
    display: flex;
    padding: 16px 20px;
    gap: 8px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.tab-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    font-weight: 500;
    padding: 8px 16px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.3s ease;
}

.tab-button.active {
    background: rgba(232, 153, 87, 0.3);
    border-color: rgba(232, 153, 87, 0.5);
    color: #ffffff;
}

.tab-button:not(.active):active {
    background: rgba(255, 255, 255, 0.15);
}

.content-area {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 100px;
}

.tab-content {
    padding: 0 20px;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    text-align: center;
}

.empty-icon {
    margin-bottom: 16px;
    opacity: 0.6;
    color: rgba(255, 255, 255, 0.6);
}

.empty-text {
    color: rgba(255, 255, 255, 0.6);
    font-size: 16px;
    line-height: 1.5;
}

.works-grid {
    display: grid;
    gap: 16px;
    margin-top: 16px;
}

.work-item {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.work-item:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.08);
}

.work-cover {
    margin-bottom: 12px;
}

.poem-preview {
    background: rgba(232, 153, 87, 0.2);
    border-radius: 12px;
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    padding: 20px;
    text-align: center;
}

.image-preview {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
}

.work-info {
    margin-bottom: 8px;
}

.work-title {
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
}

.work-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.work-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
}

.emotion-topics {
    margin-top: 16px;
}

.topic-header {
    margin-bottom: 16px;
}

.topic-header h3 {
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.topics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
}

.topic-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.topic-item:active {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(0.95);
}

.topic-name {
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    display: block;
    margin-bottom: 4px;
}

.topic-count {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
}

.bottle-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 0;
}

.bottle-animation {
    text-align: center;
    margin-bottom: 40px;
}

.bottle-icon {
    margin-bottom: 16px;
    animation: float 3s ease-in-out infinite;
    color: rgba(255, 255, 255, 0.7);
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.bottle-text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 16px;
    line-height: 1.5;
}

.bottle-actions {
    display: flex;
    gap: 16px;
}

.bottle-btn {
    min-width: 120px;
    padding: 12px 24px;
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-secondary:active {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(0.98);
}
</style> 