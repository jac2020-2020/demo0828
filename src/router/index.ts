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
    ],
});

export default router; 