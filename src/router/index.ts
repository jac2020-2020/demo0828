import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/me',
        },
        {
            path: '/chat',
            name: 'Chat',
            component: () => import('@/pages/chat/ChatPage.vue'),
        },
        {
            path: '/conversation',
            name: 'Conversation',
            component: () => import('@/pages/chat/ConversationPage.vue'),
        },
        {
            path: '/voice-call',
            name: 'VoiceCall',
            component: () => import('@/pages/chat/VoiceCallPage.vue'),
        },
        {
            path: '/discover',
            name: 'Discover',
            component: () => import('@/pages/discover/DiscoverPage.vue'),
        },
        {
            path: '/me',
            name: 'Me',
            component: () => import('@/pages/me/MePage.vue'),
        },
        {
            path: '/work/:id',
            name: 'WorkDetail',
            component: () => import('@/pages/me/WorkDetailPage.vue'),
        },
        {
            path: '/music-player',
            name: 'MusicPlayer',
            component: () => import('@/pages/music/MusicPlayerPage.vue'),
        },
    ],
});

export default router; 