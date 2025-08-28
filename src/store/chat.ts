import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Message, Session, Work } from '@/types';

export const useChatStore = defineStore('chat', () => {
    // 状态
    const currentSession = ref<Session | null>(null);
    const messages = ref<Message[]>([]);
    const isTyping = ref(false);
    const works = ref<Work[]>([]);

    // 创建新会话
    const createSession = (): Session => {
        const session: Session = {
            id: Date.now().toString(),
            user_id: 'current-user',
            created_at: new Date().toISOString(),
            status: 'active',
        };
        currentSession.value = session;
        return session;
    };

    // 发送消息
    const sendMessage = (content: string): Message => {
        if (!currentSession.value) {
            createSession();
        }

        const message: Message = {
            id: Date.now().toString(),
            session_id: currentSession.value!.id,
            role: 'user',
            content,
            created_at: new Date().toISOString(),
        };

        messages.value.push(message);
        return message;
    };

    // 接收AI回复
    const receiveMessage = (content: string): Message => {
        if (!currentSession.value) return {} as Message;

        const message: Message = {
            id: (Date.now() + 1).toString(),
            session_id: currentSession.value.id,
            role: 'ai',
            content,
            created_at: new Date().toISOString(),
        };

        messages.value.push(message);
        return message;
    };

    // 保存作品
    const saveWork = (work: Work) => {
        works.value.push(work);
    };

    // 清空聊天
    const clearChat = () => {
        messages.value = [];
        currentSession.value = null;
    };

    return {
        currentSession,
        messages,
        isTyping,
        works,
        createSession,
        sendMessage,
        receiveMessage,
        saveWork,
        clearChat,
    };
}); 