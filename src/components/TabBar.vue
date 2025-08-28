<template>
    <div class="tab-bar safe-area-bottom">
        <div class="tab-container">
            <router-link 
                v-for="tab in tabs" 
                :key="tab.name" 
                :to="tab.path" 
                class="tab-item"
                :class="{ active: current === tab.name }"
            >
                <div class="tab-icon">
                    <component :is="tab.icon" :size="20" />
                </div>
                <div class="tab-label">{{ tab.label }}</div>
            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { User, MessageCircle, Compass } from 'lucide-vue-next';

interface Props {
    current: 'chat' | 'discover' | 'me';
}

defineProps<Props>();

const tabs = [
    {
        name: 'me',
        path: '/me',
        icon: User,
        label: '我的',
    },
    {
        name: 'chat',
        path: '/chat',
        icon: MessageCircle,
        label: '对话',
    },
    {
        name: 'discover',
        path: '/discover',
        icon: Compass,
        label: '发现',
    },
];
</script>

<style scoped>
.tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgb(82, 82, 82);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    z-index: 1000;
}

.tab-container {
    display: flex;
    height: 70px;
    align-items: center;
    justify-content: space-around;
    padding: 8px 20px;
    position: relative;
    border-radius: 300px;
    overflow: hidden;
}

.tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    text-decoration: none;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 6px 12px;
    border-radius: 16px;
    position: relative;
    min-height: 54px;
}

.tab-item.active {
    color: rgb(232, 153, 87);
    background: rgba(232, 153, 87, 0.08);
    transform: translateY(-2px);
}

.tab-item.active::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 3px;
    background: linear-gradient(90deg, rgb(232, 153, 87) 0%, rgba(232, 153, 87, 0.8) 100%);
    border-radius: 0 0 2px 2px;
}

.tab-item:not(.active):active {
    background: rgba(255, 255, 255, 0.03);
    transform: scale(0.96);
}

.tab-icon {
    margin-bottom: 4px;
    transition: all 0.3s ease;
}

.tab-item.active .tab-icon {
    transform: scale(1.1);
    filter: drop-shadow(0 2px 4px rgba(232, 153, 87, 0.3));
}

.tab-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.3px;
    transition: all 0.3s ease;
    text-align: center;
    line-height: 1;
}

.tab-item.active .tab-label {
    font-weight: 600;
    font-size: 12px;
    text-shadow: 0 1px 2px rgba(232, 153, 87, 0.3);
}

/* 添加底部安全区域指示器 */
.tab-bar::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 134px;
    height: 5px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px 3px 0 0;
}
</style> 