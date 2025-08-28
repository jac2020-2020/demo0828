// 用户类型
export interface User {
    id: string;
    nickname: string;
    avatar: string;
    bio: string;
    created_at: string;
}

// 会话类型
export interface Session {
    id: string;
    user_id: string;
    created_at: string;
    status: string;
}

// 消息类型
export interface Message {
    id: string;
    session_id: string;
    role: 'user' | 'ai';
    content: string;
    created_at: string;
}

// 情绪评估类型
export interface EmotionEval {
    id: string;
    session_id: string;
    depth_score: number;
    intensity: number;
    labels: string[];
    trigger_signals: string[];
}

// 作品类型
export interface Work {
    id: string;
    user_id: string;
    session_id: string;
    source_message_id: string;
    modality: 'poem' | 'image' | 'audio' | 'video';
    title: string;
    desc: string;
    emotion_labels: string[];
    visibility: 'public' | 'private';
    created_at: string;
}

// 作品资源类型
export interface WorkAsset {
    id: string;
    work_id: string;
    url: string;
    cover_url: string;
    duration?: number;
    meta: Record<string, any>;
}

// 互动类型
export interface Interaction {
    id: string;
    work_id: string;
    user_id: string;
    type: 'resonate' | 'comment' | 'share';
    content?: string;
    created_at: string;
}

// 流光瓶类型
export interface Bottle {
    id: string;
    work_id: string;
    topic_tags: string[];
    status: 'thrown' | 'picked';
    matched_user_id?: string;
    created_at: string;
} 