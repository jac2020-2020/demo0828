<template>
    <div class="me-page">
        <!-- 顶部状态栏 -->
        <div class="status-bar safe-area-top"></div>
        
        <!-- 个人信息区域 -->
        <div class="profile-section">
            <div class="profile-header">
                <div class="avatar">
                    <div class="avatar-placeholder">👤</div>
                </div>
                <div class="profile-info">
                    <h2 class="username">{{ user.nickname }}</h2>
                    <p class="bio">{{ user.bio || '这个人很懒，什么都没写...' }}</p>
                </div>
                <button class="edit-btn" @click="editProfile">编辑</button>
            </div>
            
            <div class="stats-row">
                <div class="stat-item">
                    <div class="stat-number">{{ myWorks.length }}</div>
                    <div class="stat-label">作品</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{ followingCount }}</div>
                    <div class="stat-label">关注</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{ followerCount }}</div>
                    <div class="stat-label">粉丝</div>
                </div>
            </div>
        </div>
        
        <!-- 作品列表 -->
        <div class="works-section">
            <div class="section-header">
                <h3 class="section-title">我的作品</h3>
                <div class="view-toggle">
                    <button 
                        class="toggle-btn"
                        :class="{ active: viewMode === 'grid' }"
                        @click="viewMode = 'grid'"
                    >
                        ⊞
                    </button>
                    <button 
                        class="toggle-btn"
                        :class="{ active: viewMode === 'list' }"
                        @click="viewMode = 'list'"
                    >
                        ☰
                    </button>
                </div>
            </div>
            
            <div v-if="myWorks.length === 0" class="empty-works">
                <div class="empty-icon">
                    <FileText :size="48" />
                </div>
                <div class="empty-text">还没有作品，去聊天创作第一个作品吧</div>
            </div>
            
            <div v-else class="works-container" :class="viewMode">
                <div 
                    v-for="work in myWorks" 
                    :key="work.id" 
                    class="work-item"
                    @click="viewWorkDetail(work)"
                >
                    <div class="work-content">
                        <div v-if="work.modality === 'poem'" class="poem-work">
                            <div class="work-type-icon">
                                <ScrollText :size="20" />
                            </div>
                            <div class="work-preview">{{ work.desc.slice(0, 50) }}...</div>
                        </div>
                        <div v-else-if="work.modality === 'image'" class="image-work">
                            <div class="work-type-icon">
                                <Image :size="20" />
                            </div>
                            <div class="work-preview">{{ work.desc }}</div>
                        </div>
                        <div v-else class="other-work">
                            <div class="work-type-icon">
                                <Music :size="20" />
                            </div>
                            <div class="work-preview">{{ work.desc }}</div>
                        </div>
                    </div>
                    
                    <div class="work-info">
                        <h4 class="work-title">{{ work.title }}</h4>
                        <div class="work-tags">
                            <span v-for="tag in work.emotion_labels.slice(0, 3)" :key="tag" class="tag">
                                {{ tag }}
                            </span>
                        </div>
                        <div class="work-meta">
                            <span class="work-time">{{ formatTime(work.created_at) }}</span>
                            <div class="work-actions">
                                <button class="action-btn" @click.stop="shareWork(work)">分享</button>
                                <button class="action-btn" @click.stop="deleteWork(work)">删除</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 底部导航 -->
        <TabBar current="me" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FileText, ScrollText, Image, Music } from 'lucide-vue-next';
import TabBar from '@/components/TabBar.vue';
import type { User, Work } from '@/types';

const user = ref<User>({
    id: 'current-user',
    nickname: '孤独旅人',
    avatar: '',
    bio: '用文字记录内心的声音',
    created_at: new Date().toISOString(),
});

const myWorks = ref<Work[]>([]);
const viewMode = ref<'grid' | 'list'>('list');
const followingCount = ref(12);
const followerCount = ref(8);

// 编辑个人资料
const editProfile = () => {
    console.log('编辑个人资料');
    // TODO: 实现编辑功能
};

// 查看作品详情
const viewWorkDetail = (work: Work) => {
    console.log('查看作品详情:', work);
    // TODO: 跳转到作品详情页
};

// 分享作品
const shareWork = (work: Work) => {
    console.log('分享作品:', work);
    // TODO: 实现分享功能
};

// 删除作品
const deleteWork = (work: Work) => {
    console.log('删除作品:', work);
    // TODO: 实现删除功能
    const index = myWorks.value.findIndex(w => w.id === work.id);
    if (index > -1) {
        myWorks.value.splice(index, 1);
    }
};

// 格式化时间
const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 生成模拟作品数据
const generateMockWorks = () => {
    const mockWorks: Work[] = [
        {
            id: 'my-work-1',
            user_id: 'current-user',
            session_id: 'session-1',
            source_message_id: 'msg-1',
            modality: 'poem',
            title: '深夜独白',
            desc: '夜深人静时\n思绪如潮涌\n孤独中寻找\n心灵的共鸣\n文字是我唯一的朋友',
            emotion_labels: ['孤独', '深夜', '思考'],
            visibility: 'private',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: 'my-work-2',
            user_id: 'current-user',
            session_id: 'session-2',
            source_message_id: 'msg-2',
            modality: 'image',
            title: '雨后彩虹',
            desc: '经历了暴风雨后，天空出现了美丽的彩虹',
            emotion_labels: ['希望', '美好', '治愈'],
            visibility: 'public',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: 'my-work-3',
            user_id: 'current-user',
            session_id: 'session-3',
            source_message_id: 'msg-3',
            modality: 'poem',
            title: '城市夜归人',
            desc: '万家灯火中\n只有我一人\n行走在回家的路上\n思念着远方的你',
            emotion_labels: ['思念', '孤独', '城市'],
            visibility: 'public',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];
    myWorks.value = mockWorks;
};

onMounted(() => {
    generateMockWorks();
});
</script>

<style scoped>
.me-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #000000 0%, #1a1a1a 100%);
}

.status-bar {
    height: 44px;
    background: transparent;
}

.profile-section {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 40px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(232, 153, 87, 0.3);
}

.avatar-placeholder {
    font-size: 32px;
    color: rgba(255, 255, 255, 0.7);
}

.profile-info {
    flex: 1;
}

.username {
    color: #ffffff;
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px 0;
}

.bio {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    line-height: 1.4;
    margin: 0;
}

.edit-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    color: #ffffff;
    font-size: 12px;
    font-weight: 500;
    padding: 8px 16px;
    cursor: pointer;
}

.edit-btn:active {
    background: rgba(255, 255, 255, 0.2);
}

.stats-row {
    display: flex;
    justify-content: space-around;
}

.stat-item {
    text-align: center;
}

.stat-number {
    color: #ffffff;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 4px;
}

.stat-label {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
}

.works-section {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 120px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.section-title {
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.view-toggle {
    display: flex;
    gap: 4px;
}

.toggle-btn {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.toggle-btn.active {
    background: rgba(232, 153, 87, 0.3);
    border-color: rgba(232, 153, 87, 0.5);
    color: #ffffff;
}

.empty-works {
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

.works-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.works-container.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
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

.work-content {
    margin-bottom: 12px;
}

.poem-work, .image-work, .other-work {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.work-type-icon {
    opacity: 0.8;
    color: rgba(255, 255, 255, 0.7);
}

.work-preview {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    line-height: 1.4;
    flex: 1;
}

.work-info {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 12px;
}

.work-title {
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px 0;
}

.work-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
}

.work-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.work-time {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
}

.work-actions {
    display: flex;
    gap: 8px;
}

.action-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 10px;
    padding: 4px 8px;
    cursor: pointer;
}

.action-btn:active {
    background: rgba(255, 255, 255, 0.1);
}
</style> 