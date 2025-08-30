<template>
    <div class="work-detail-page">
        <!-- 顶部状态栏 -->
        <div class="status-bar safe-area-top"></div>
        
        <!-- 导航栏 -->
        <div class="nav-bar">
            <button class="back-btn" @click="goBack">
                <ArrowLeft :size="20" />
            </button>
            <h1 class="nav-title">作品详情</h1>
            <button class="share-btn" @click="shareWork">
                <Share :size="20" />
            </button>
        </div>
        
        <!-- 作品内容 -->
        <div class="work-content-area">
            <div v-if="work" class="work-display">
                <div class="work-header">
                    <h2 class="work-title">{{ work.title }}</h2>
                    <div class="work-tags">
                        <span v-for="tag in work.emotion_labels" :key="tag" class="tag">{{ tag }}</span>
                    </div>
                </div>
                
                <div class="work-main">
                    <div v-if="work.modality === 'poem'" class="poem-display">
                        <div class="poem-text">{{ work.desc }}</div>
                    </div>
                    <div v-else-if="work.modality === 'image'" class="image-display">
                        <div class="image-placeholder">
                            <Palette :size="48" />
                            <span>画作展示</span>
                        </div>
                        <div class="image-desc">{{ work.desc }}</div>
                    </div>
                </div>
                
                <div class="work-actions">
                    <button class="action-btn primary" @click="regenerateWork">换形态</button>
                    <button class="action-btn secondary" @click="saveToGallery">保存</button>
                    <button class="action-btn secondary" @click="throwBottle">投流光瓶</button>
                </div>
            </div>
            
            <!-- 互动区域 -->
            <div class="interaction-section">
                <div class="interaction-stats">
                    <div class="stat-item">
                        <Heart :size="16" />
                        <span class="stat-count">{{ resonanceCount }}</span>
                    </div>
                    <div class="stat-item">
                        <MessageCircle :size="16" />
                        <span class="stat-count">{{ commentCount }}</span>
                    </div>
                </div>
                
                <div class="comments-area">
                    <h3 class="comments-title">共鸣评论</h3>
                    <div v-if="comments.length === 0" class="empty-comments">
                        <div class="empty-text">还没有人留下共鸣，成为第一个吧</div>
                    </div>
                    <div v-else class="comments-list">
                        <div v-for="comment in comments" :key="comment.id" class="comment-item">
                            <div class="comment-author">匿名用户</div>
                            <div class="comment-content">{{ comment.content }}</div>
                            <div class="comment-time">{{ formatTime(comment.created_at) }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 底部输入区 -->
        <div class="input-area safe-area-bottom">
            <div class="comment-input-container">
                <input 
                    v-model="commentText" 
                    type="text" 
                    class="comment-input" 
                    placeholder="写下你的共鸣..."
                    @keyup.enter="submitComment"
                />
                <button 
                    class="submit-btn" 
                    @click="submitComment"
                    :disabled="!commentText.trim()"
                >
                    发送
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft, Share, Palette, Heart, MessageCircle } from 'lucide-vue-next';
import type { Work, Interaction } from '@/types';

const router = useRouter();
const route = useRoute();

const work = ref<Work | null>(null);
const comments = ref<Interaction[]>([]);
const commentText = ref('');
const resonanceCount = ref(0);
const commentCount = ref(0);

// 返回上一页
const goBack = () => {
    router.back();
};

// 分享作品
const shareWork = () => {
    console.log('分享作品');
    // TODO: 实现分享功能
};

// 重新生成作品
const regenerateWork = () => {
    console.log('重新生成作品');
    // TODO: 实现重新生成功能
};

// 保存到相册
const saveToGallery = () => {
    console.log('保存到相册');
    // TODO: 实现保存功能
};

// 投流光瓶
const throwBottle = () => {
    console.log('投流光瓶');
    // TODO: 实现流光瓶功能
};

// 提交评论
const submitComment = () => {
    if (!commentText.value.trim()) return;
    
    const newComment: Interaction = {
        id: Date.now().toString(),
        work_id: work.value?.id || '',
        user_id: 'current-user',
        type: 'comment',
        content: commentText.value,
        created_at: new Date().toISOString(),
    };
    
    comments.value.unshift(newComment);
    commentCount.value++;
    commentText.value = '';
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

// 模拟加载作品数据
const loadWork = () => {
    // 模拟作品数据
    work.value = {
        id: route.params.id as string,
        user_id: 'current-user',
        session_id: 'session-1',
        source_message_id: 'msg-1',
        modality: 'poem',
        title: '深夜独白',
        desc: '夜深人静时\n思绪如潮涌\n孤独中寻找\n心灵的共鸣\n\n文字是我唯一的朋友\n在这无声的夜里\n倾诉着内心的秘密',
        emotion_labels: ['孤独', '深夜', '思考', '内省'],
        visibility: 'private',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    resonanceCount.value = Math.floor(Math.random() * 50) + 10;
    commentCount.value = comments.value.length;
};

onMounted(() => {
    loadWork();
});
</script>

<style scoped>
.work-detail-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #000000 0%, #1a1a1a 100%);
}

.status-bar {
    height: 44px;
    background: transparent;
}

.nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-btn, .share-btn {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #ffffff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.back-btn:active, .share-btn:active {
    background: rgba(255, 255, 255, 0.2);
}

.nav-title {
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.work-content-area {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0 20px;
}

.work-display {
    padding: 20px 0;
}

.work-header {
    margin-bottom: 24px;
}

.work-title {
    color: #ffffff;
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 12px 0;
}

.work-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.work-main {
    margin-bottom: 32px;
}

.poem-display {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 32px;
    text-align: center;
}

.poem-text {
    color: #ffffff;
    font-size: 18px;
    line-height: 1.8;
    white-space: pre-line;
    font-style: italic;
    letter-spacing: 1px;
}

.image-display {
    text-align: center;
}

.image-placeholder {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    color: rgba(255, 255, 255, 0.6);
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 16px;
}

.image-placeholder span {
    font-size: 16px;
}

.image-desc {
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    line-height: 1.5;
}

.work-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.action-btn {
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
}

.action-btn.primary {
    background: linear-gradient(135deg, rgb(232, 153, 87) 0%, rgba(232, 153, 87, 0.8) 100%);
    color: #ffffff;
}

.action-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #ffffff;
}

.action-btn:active {
    transform: scale(0.95);
}

.interaction-section {
    padding: 20px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.interaction-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.stat-icon {
    font-size: 16px;
}

.stat-count {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-weight: 500;
}

.comments-title {
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
}

.empty-comments {
    text-align: center;
    padding: 40px 0;
}

.empty-text {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
}

.comments-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.comment-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 16px;
}

.comment-author {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 8px;
}

.comment-content {
    color: #ffffff;
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 8px;
}

.comment-time {
    color: rgba(255, 255, 255, 0.5);
    font-size: 10px;
}

.input-area {
    padding: 12px 20px;
    background: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.comment-input-container {
    display: flex;
    gap: 12px;
    align-items: center;
}

.comment-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    color: #ffffff;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
    padding: 10px 16px;
    outline: none;
}

.comment-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.submit-btn {
    background: linear-gradient(135deg, rgb(232, 153, 87) 0%, rgba(232, 153, 87, 0.8) 100%);
    border: none;
    border-radius: 16px;
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    padding: 10px 20px;
    cursor: pointer;
}

.submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.submit-btn:not(:disabled):active {
    transform: scale(0.95);
}
</style> 