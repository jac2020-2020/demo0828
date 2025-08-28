import axios from 'axios';
import { generateMusic, pollMusicResult, type MusicFetchResponse } from './musicApi';

// API配置
const API_CONFIG = {
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: 'sk-6721e297ae8f47be885e6fe0ac0e3f64',
    model: 'qwen-omni-turbo'
};

// 创建axios实例
const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    headers: {
        'Authorization': `Bearer ${API_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
    },
    timeout: 30000
});

// 消息类型定义
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatCompletionRequest {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}

export interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// 发送聊天消息
export const sendChatMessage = async (messages: ChatMessage[]): Promise<string> => {
    try {
        const requestData: ChatCompletionRequest = {
            model: API_CONFIG.model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000,
            stream: false
        };

        console.log('发送请求:', requestData);

        const response = await apiClient.post<ChatCompletionResponse>('/chat/completions', requestData);
        
        console.log('API响应:', response.data);

        if (response.data.choices && response.data.choices.length > 0) {
            return response.data.choices[0].message.content;
        } else {
            throw new Error('API响应格式错误');
        }
    } catch (error: any) {
        console.error('API调用错误:', error);
        
        if (error.response) {
            console.error('错误响应:', error.response.data);
            throw new Error(`API错误: ${error.response.data.error?.message || '未知错误'}`);
        } else if (error.request) {
            throw new Error('网络连接错误，请检查网络连接');
        } else {
            throw new Error(`请求配置错误: ${error.message}`);
        }
    }
};

// 发送语音聊天消息（带情感分析）
export const sendVoiceChatMessage = async (
    messages: ChatMessage[], 
    emotion?: string
): Promise<string> => {
    try {
        // 为语音聊天添加情感上下文
        const systemMessage: ChatMessage = {
            role: 'system',
            content: `你是一个温暖、善解人意的AI伙伴。请用温柔、理解的语气回应用户。${
                emotion ? `用户当前的情绪状态是: ${emotion}，请给予适当的情感支持。` : ''
            }回复要简洁自然，像朋友间的对话。`
        };

        const messagesWithContext = [systemMessage, ...messages];

        return await sendChatMessage(messagesWithContext);
    } catch (error) {
        console.error('语音聊天API调用错误:', error);
        throw error;
    }
};

// 生成创作建议
export const generateCreativeSuggestion = async (
    conversation: string,
    emotion: string
): Promise<{ type: 'poem' | 'music' | 'image', suggestion: string }> => {
    try {
        const systemMessage: ChatMessage = {
            role: 'system',
            content: `基于用户的对话内容和情绪状态，建议一种创作形式（诗歌、音乐或图像）并给出具体的创作建议。
            请以JSON格式回复，包含type（'poem'、'music'或'image'）和suggestion（具体建议）字段。`
        };

        const userMessage: ChatMessage = {
            role: 'user',
            content: `对话内容: ${conversation}\n情绪状态: ${emotion}\n请建议适合的创作形式和具体建议。`
        };

        const response = await sendChatMessage([systemMessage, userMessage]);
        
        try {
            return JSON.parse(response);
        } catch {
            // 如果解析失败，返回默认建议
            return {
                type: 'poem',
                suggestion: '根据你的心情，我建议创作一首诗来表达内心的感受。'
            };
        }
    } catch (error) {
        console.error('生成创作建议错误:', error);
        throw error;
    }
};

// 生成歌词
export const generateLyricsFromConversation = async (
    conversation: string,
    emotion: string,
    theme: string
): Promise<string> => {
    try {
        const systemMessage: ChatMessage = {
            role: 'system',
            content: `你是一个专业的歌词创作者。根据用户的对话内容、情绪状态和主题，创作一首富有情感的歌词。
            
            歌词要求：
            - 包含 [Verse 1], [Chorus], [Verse 2], [Bridge], [Chorus], [Outro] 等结构
            - 情感真挚，富有画面感
            - 符合流行歌曲的韵律和节奏
            - 每行不超过15个字
            - 整体歌词控制在200字以内
            
            只返回歌词内容，不需要额外说明。`
        };

        const userMessage: ChatMessage = {
            role: 'user',
            content: `对话内容: ${conversation}\n情绪状态: ${emotion}\n主题: ${theme}\n请创作歌词。`
        };

        const lyrics = await sendChatMessage([systemMessage, userMessage]);
        return lyrics;
    } catch (error) {
        console.error('生成歌词错误:', error);
        throw error;
    }
};

// 生成音乐（包含歌词生成和音乐API调用）
export const generateMusicFromConversation = async (
    conversation: string,
    emotion: string,
    theme: string,
    onProgress?: (progress: string, stage: string) => void
): Promise<MusicFetchResponse> => {
    try {
        // 第一步：生成歌词
        if (onProgress) onProgress('0%', '正在创作歌词...');
        
        const lyrics = await generateLyricsFromConversation(conversation, emotion, theme);
        console.log('生成的歌词:', lyrics);
        
        if (onProgress) onProgress('30%', '歌词创作完成，开始生成音乐...');
        
        // 第二步：调用音乐生成API
        const jobId = await generateMusic(
            lyrics,
            `${emotion}之歌`,
            `${emotion}, melodic, heartfelt, emotional`
        );
        
        if (onProgress) onProgress('40%', '音乐生成任务已提交，等待处理...');
        
        // 第三步：轮询获取结果
        const result = await pollMusicResult(
            jobId,
            (progress) => {
                if (onProgress) {
                    const progressNum = parseInt(progress.replace('%', ''));
                    const adjustedProgress = Math.max(40, Math.min(100, 40 + progressNum * 0.6));
                    onProgress(`${adjustedProgress}%`, '正在生成音乐...');
                }
            }
        );
        
        if (onProgress) onProgress('100%', '音乐生成完成！');
        
        return result;
    } catch (error) {
        console.error('音乐生成流程错误:', error);
        throw error;
    }
};

export default {
    sendChatMessage,
    sendVoiceChatMessage,
    generateCreativeSuggestion,
    generateLyricsFromConversation,
    generateMusicFromConversation
}; 