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

// 使用大模型生成标题，确保每次都不一样
const generateTitleByAI = async (content: string, emotion: string, theme: string): Promise<string> => {
    try {
        const titleSystemMessage: ChatMessage = {
            role: 'system',
            content: `你是一个专业的诗词标题创作者。请根据诗词内容创作一个文艺浪漫、富有诗意的标题。

要求：
- 2-6个字的简洁标题
- 要有想象力和艺术感，避免俗套
- 体现诗词的核心意境和情感
- 要独特创新，避免常见标题
- 参考现代文学、古典诗词的命名风格
- 可以使用抽象意象、时间概念、空间意象、情感状态等

请直接返回标题，不要解释。`
        };

        const titleUserMessage: ChatMessage = {
            role: 'user',
            content: `诗词内容：${content}\n情感基调：${emotion}\n主题：${theme}\n\n请为这首诗创作一个独特的标题。`
        };

        const titleResponse = await sendChatMessage([titleSystemMessage, titleUserMessage]);
        
        // 清理标题，去掉可能的引号等
        const cleanTitle = titleResponse
            .replace(/["""''《》]/g, '')
            .replace(/标题[:：]\s*/g, '')
            .trim();
            
        return cleanTitle || '诗意人生';
    } catch (error) {
        console.error('AI标题生成失败:', error);
        // 如果AI生成失败，返回基于时间的动态标题
        const timeBasedTitles = [
            '此时此刻', '瞬间永恒', '光影流年', '心海微澜', 
            '意境深处', '灵感乍现', '诗心初动', '情思飞扬'
        ];
        return timeBasedTitles[Date.now() % timeBasedTitles.length];
    }
};

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
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
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
            temperature: 0.9, // 提高温度增加创造性
            max_tokens: 1000,
            top_p: 0.95, // 添加nucleus sampling
            frequency_penalty: 0.3, // 降低重复内容概率
            presence_penalty: 0.2, // 鼓励新颖内容
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

// 语音聊天响应接口
export interface VoiceChatResponse {
    text: string;
    audioData?: string; // base64编码的音频数据
}

// 发送语音聊天消息（支持多模态输出）
export const sendVoiceChatMessage = async (
    messages: ChatMessage[], 
    emotion?: string
): Promise<VoiceChatResponse> => {
    try {
        // 为语音聊天添加情感上下文
        const systemMessage: ChatMessage = {
            role: 'system',
            content: `你是一个温暖、善解人意的AI伙伴。请用温柔、理解的语气回应用户。${
                emotion ? `用户当前的情绪状态是: ${emotion}，请给予适当的情感支持。` : ''
            }回复要简洁自然，像朋友间的对话。`
        };

        const messagesWithContext = [systemMessage, ...messages];

        // 构建支持多模态的请求
        const requestData = {
            model: 'qwen-omni-turbo', // 使用多模态模型
            messages: messagesWithContext,
            modalities: ['text', 'audio'], // 设置输出模态
            audio: {
                voice: 'Cherry', // 语音角色
                format: 'wav'   // 音频格式
            },
            temperature: 0.7,
            max_tokens: 1000,
            stream: true,
            stream_options: { include_usage: true }
        };

        console.log('发送多模态语音请求:', requestData);

        const response = await fetch(`${API_CONFIG.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('无法读取响应流');
        }

        let textContent = '';
        let audioString = '';

        // 读取流式响应
        let buffer = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // 将新数据添加到缓冲区
            buffer += new TextDecoder().decode(value);
            
            // 按行分割并处理完整的行
            const lines = buffer.split('\n');
            // 保留最后一行（可能不完整）
            buffer = lines.pop() || '';
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;
                
                if (trimmedLine.startsWith('data: ')) {
                    const data = trimmedLine.slice(6).trim();
                    if (data === '[DONE]') continue;
                    if (!data) continue;

                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.choices && parsed.choices[0]) {
                            const delta = parsed.choices[0].delta;
                            
                            // 收集文本内容
                            if (delta.content) {
                                textContent += delta.content;
                            }
                            
                            // 收集音频数据
                            if (delta.audio && delta.audio.data) {
                                audioString += delta.audio.data;
                                console.log('收集音频片段，当前总长度:', audioString.length);
                            }
                        }
                    } catch (e) {
                        console.warn('解析流数据失败:', data, e);
                        // 跳过无效的JSON数据
                        continue;
                    }
                }
            }
        }

        console.log('收集到的文本长度:', textContent.length);
        console.log('收集到的音频数据长度:', audioString.length);
        
        return {
            text: textContent || '我理解你的感受，请继续和我分享。',
            audioData: audioString.length > 0 ? audioString : undefined
        };

    } catch (error: any) {
        console.error('多模态语音聊天API调用错误:', error);
        console.warn('降级到纯文本模式...');
        
        // 降级到纯文本响应
        try {
            const systemMessage: ChatMessage = {
                role: 'system',
                content: `你是一个温暖、善解人意的AI伙伴。请用温柔、理解的语气回应用户。${
                    emotion ? `用户当前的情绪状态是: ${emotion}，请给予适当的情感支持。` : ''
                }回复要简洁自然，像朋友间的对话。单次回复控制在60字以内，适合语音对话。`
            };
            const fallbackMessages = [systemMessage, ...messages];
            const textResponse = await sendChatMessage(fallbackMessages);
            return {
                text: textResponse,
                audioData: undefined
            };
        } catch (fallbackError) {
            console.error('文本降级也失败:', fallbackError);
            return {
                text: '我现在有些听不清楚，但我在这里陪伴你。请再试一次吧。',
                audioData: undefined
            };
        }
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

// 删除了复杂的analyzeGiftUserInput函数，现在直接让大模型处理分析

// 生成歌词和歌名（支持礼物模式的深度分析）
export const generateLyricsFromConversation = async (
    conversation: string,
    emotion: string,
    theme: string,
    isGiftMode: boolean = false,
    recipient?: string,
    userMessage?: string,
    senderName?: string,
    relationship?: string
): Promise<{ title: string; lyrics: string }> => {
    try {
        let enhancedPrompt = '';
        
        if (isGiftMode && recipient && userMessage) {
                        // 礼物模式：直接提供礼物信息给大模型分析创作
            enhancedPrompt = `
            礼物模式歌词创作指导：
            - 礼物接收者：${recipient}
            - 关系：${relationship || '朋友'}
            - 想表达的内容：${userMessage}
            ${senderName ? `- 送礼者：${senderName}` : ''}
            - 情感氛围：${emotion}
            - 主题：${theme}
            
            请根据具体关系"${relationship || '朋友'}"创作相应的歌词，确保：
            1. 深度体现用户的真实意图和情感
            2. 根据人物关系选择合适的表达方式和音乐风格
            3. 具有高度的艺术感和情感共鸣
            4. 恋人关系使用浪漫词汇，家人关系使用温馨词汇，朋友关系使用友谊词汇
            5. 使用诗意的意象和隐喻，如"星光"、"微风"、"花开"、"时光"等美好元素
            6. 避免使用"给xxx的音乐"等直白表达，而是通过意境营造情感
            7. 创造能够启发优美歌名的诗意氛围
            8. 歌名要富有文学性和想象力，使用抽象意象而非具象描述
            9. 避免在歌词中直接使用歌名，让歌名成为对整首歌意境的诗意概括
            ${senderName ? `10. 在歌词中自然地体现送礼者的身份和情感，但要避免过于直白的表述` : ''}
`;
        }

        const systemMessage: ChatMessage = {
            role: 'system',
            content: `你是一个专业的歌词创作者和音乐制作人。根据用户的对话内容、情绪状态和主题，创作一首富有情感的现代流行歌曲。

            🎵 **歌词结构要求（参考现代流行歌曲标准）**：
            
            **[Verse 1]** - 主歌第一段（4-6行）
            - 设置场景和情境，引入故事背景
            - 每行8-12个字，节奏舒缓，为副歌做铺垫
            - 使用具体的意象和细节描述
            
            **[Chorus]** - 副歌（4-6行）  
            - 情感爆发点，表达核心主题
            - 每行6-10个字，朗朗上口，易于记忆
            - 使用重复和呼应，增强感染力
            - 包含歌曲的情感高潮和核心信息
            
            **[Verse 2]** - 主歌第二段（4-6行）
            - 深化情感层次，推进故事发展  
            - 与第一段呼应但有所发展
            - 为第二次副歌做更深层的情感铺垫
            
            **[Chorus]** - 副歌重复（4-6行）
            - 重复核心旋律和情感表达
            - 可以在最后一行做细微变化增强效果
            
            **[Bridge]** - 过渡段（2-4行，可选）
            - 情感转折或升华
            - 为最终高潮做准备
            
            **[Outro]** - 尾声（2-3行）
            - 情感的沉淀和回味
            - 给听众留下深刻印象

            🎨 **创作质量标准**：
            - **总字数**：300-400字（符合完整歌曲长度）
            - **韵律感**：注重押韵和节拍，易于演唱
            - **情感层次**：从引入→高潮→深化→升华的完整情感弧线
            - **现代感**：融合当代流行音乐的表达方式和词汇
            - **画面感**：使用生动的意象，避免空洞的抒情
            - **记忆点**：副歌部分要有强烈的记忆点和传唱度
            - **歌名独立性**：歌词正文中绝对不能出现歌名，歌名应该是对整首歌意境的抽象概括，而非歌词的直接引用

            🌟 **语言风格**：
            - 自然流畅，符合现代人的表达习惯
            - 情真意切，避免矫揉造作
            - 既有诗意美感，又具备流行歌曲的亲和力
            - 巧妙运用修辞手法：比喻、拟人、排比等

            ${enhancedPrompt}
            
            请按以下JSON格式返回结果：
            {
                "title": "歌名（3-5个字，现代流行风格，有记忆点）",
                "lyrics": "完整歌词内容，包含所有结构标记"
            }
            
            🎵 **歌名创作标准**：
            - **3-5个字**，简洁有力，便于传播
            - **文艺诗意风格**：避免具象描述，追求抽象美感和意境深度
            - **情感共鸣**：能瞬间触动人心，引起共鸣
            - **记忆度高**：朗朗上口，容易记住和分享
            - **避免俗套表达**：
              * 不用"给xxx的歌"、"xxx之歌"、"xxx之光"等老套格式
              * 避免"礼物"、"心语"、"情话"等直白词汇
              * 拒绝"爱的xxx"、"xxx的故事"等套路化表达
            - **诗意命名风格**：
              * 时间意象：如"三月雨"、"夜半歌"、"黄昏诗"、"午后光"
              * 自然元素：如"微风词"、"星河谣"、"花间令"、"雪落声"
              * 情感状态：如"心事重"、"思君不见君"、"梦里花"
              * 空间概念：如"远方信"、"窗外雨"、"桥下水"、"山间月"
              * 抽象概念：如"温柔乡"、"岁月痕"、"时光书"、"青春赋"
            - **参考经典**：如"青花瓷"、"烟花易冷"、"东风破"、"发如雪"等富有诗意的歌名
            - **创新性**：每次都要有新意，避免重复和套路
            - **重要提醒**：歌名绝对不能出现在歌词正文中，保持歌名的独立性和神秘感
            
            只返回JSON格式，不要任何其他内容。`
        };

        const promptMessage: ChatMessage = {
            role: 'user',
            content: isGiftMode 
                ? `礼物接收者: ${recipient}\n想表达的内容: ${userMessage}\n情绪状态: ${emotion}\n主题: ${theme}\n请创作歌词。`
                : `对话内容: ${conversation}\n情绪状态: ${emotion}\n主题: ${theme}\n请创作歌词。`
        };

        const response = await sendChatMessage([systemMessage, promptMessage]);
        
        try {
            // 清理响应中可能的额外文本，只保留JSON部分
            let cleanResponse = response.trim();
            
            // 尝试找到JSON对象的开始和结束
            const jsonStart = cleanResponse.indexOf('{');
            const jsonEnd = cleanResponse.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
            }
            
            // 尝试解析JSON响应
            const parsedResponse = JSON.parse(cleanResponse);
            if (parsedResponse.title && parsedResponse.lyrics) {
                // 确保歌词是纯文本，不包含JSON结构
                let cleanLyrics = parsedResponse.lyrics;
                if (typeof cleanLyrics === 'string') {
                    // 清理可能的转义字符
                    cleanLyrics = cleanLyrics
                        .replace(/\\n/g, '\n')
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, '\\')
                        .trim();
                }
                
                return {
                    title: parsedResponse.title,
                    lyrics: cleanLyrics
                };
            }
        } catch (error) {
            console.warn('歌词响应JSON解析失败，尝试手动提取:', error);
            console.log('原始响应:', response);
        }
        
        // 如果JSON解析失败，尝试手动提取title和lyrics
        try {
            const titleMatch = response.match(/["']?title["']?\s*[:：]\s*["']([^"']*?)["']/i);
            // 更精确的歌词匹配，避免匹配到嵌套的JSON
            const lyricsMatch = response.match(/["']?lyrics["']?\s*[:：]\s*["']((?:[^"'\\]|\\.)*)["']/i);
            
            let extractedTitle = titleMatch ? titleMatch[1].trim() : '';
            let extractedLyrics = lyricsMatch ? lyricsMatch[1].trim() : '';
            
            // 清理歌词中的转义字符和多余的引号
            extractedLyrics = extractedLyrics
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\')
                .trim();
            
            // 如果没有提取到标题，使用AI生成
            if (!extractedTitle) {
                try {
                    extractedTitle = await generateTitleByAI(extractedLyrics || response.slice(0, 200), emotion, theme);
                } catch (titleError) {
                    console.error('AI标题生成失败:', titleError);
                    extractedTitle = `${emotion}心语`;
                }
            }
            
            // 如果没有提取到歌词，使用原始响应
            if (!extractedLyrics) {
                extractedLyrics = response;
            }
            
            return {
                title: extractedTitle,
                lyrics: extractedLyrics
            };
        } catch (extractError) {
            console.error('手动提取也失败:', extractError);
            
            // 最后的兜底方案
            return {
                title: `${emotion}心语`,
                lyrics: response
            };
        }
    } catch (error) {
        console.error('生成歌词错误:', error);
        throw error;
    }
};

// 生成音乐（包含歌词生成和音乐API调用，支持礼物模式）
export const generateMusicFromConversation = async (
    conversation: string,
    emotion: string,
    theme: string,
    onProgress?: (progress: string, stage: string) => void,
    isGiftMode: boolean = false,
    recipient?: string,
    userMessage?: string,
    senderName?: string,
    relationship?: string
): Promise<MusicFetchResponse> => {
    try {
        // 第一步：生成歌词
        if (onProgress) onProgress('0%', '正在创作歌词...');
        
        const lyricsData = await generateLyricsFromConversation(
            conversation, 
            emotion, 
            theme, 
            isGiftMode, 
            recipient, 
            userMessage,
            senderName,
            relationship
        );
        console.log('生成的歌词和歌名:', lyricsData);
        
        if (onProgress) onProgress('30%', '歌词创作完成，开始生成音乐...');
        
        // 第二步：调用音乐生成API，使用AI生成的歌名
        // 根据不同模式和情感生成更精准的标签
        // 根据模式选择音乐标签
        let musicTags = `${emotion}, melodic, heartfelt, emotional`;
        
        if (isGiftMode) {
            // 礼物模式：添加温馨标签，如果有关系信息则添加对应风格
            musicTags += ', gentle, acoustic, soft vocals, tender';
            if (relationship) {
                const rel = relationship.toLowerCase();
                if (rel.includes('恋人') || rel.includes('情侣') || rel.includes('男朋友') || rel.includes('女朋友')) {
                    musicTags += ', romantic, intimate, love song';
                } else if (rel.includes('家人') || rel.includes('父母') || rel.includes('爸爸') || rel.includes('妈妈')) {
                    musicTags += ', family love, warm, nostalgic';
                } else {
                    musicTags += ', friendship, uplifting, positive';
                }
            }
        } else {
            // 普通模式
            musicTags += ', contemporary, expressive';
        }
        
        const jobId = await generateMusic(
            lyricsData.lyrics,
            lyricsData.title, // 使用AI生成的歌名
            musicTags
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

// 生图API配置
const IMAGE_API_CONFIG = {
    baseURL: 'https://api.siliconflow.cn/v1',
    apiKey: 'sk-cevkjvfzcsvaatiqoffnwxwznqkgdrjdcuzorsrnlpmrvmvw'
};

// 创建生图API客户端
const imageApiClient = axios.create({
    baseURL: IMAGE_API_CONFIG.baseURL,
    headers: {
        'Authorization': `Bearer ${IMAGE_API_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
    },
    timeout: 60000
});

// 诗词生成响应接口
export interface PoemGenerationResponse {
    title: string;
    content: string;
    imagePrompt: string;
}

// 生图响应接口
export interface ImageGenerationResponse {
    images: Array<{
        url: string;
    }>;
    timings: {
        inference: number;
    };
    seed: number;
}

// 诗词卡片生成响应接口
export interface PoemCardResponse {
    poem: PoemGenerationResponse;
    imageUrl: string;
    cardImageUrl?: string; // 渲染后的诗词卡片图片
}

// 生成诗词内容和生图提示词（支持礼物模式的深度分析）
export const generatePoem = async (
    conversation: string,
    emotion: string,
    theme: string,
    isGiftMode: boolean = false,
    recipient?: string,
    userMessage?: string,
    senderName?: string,
    relationship?: string
): Promise<PoemGenerationResponse> => {
    try {
        let enhancedPrompt = '';
        
        if (isGiftMode && recipient && userMessage) {
            // 礼物模式：直接提供礼物信息给大模型分析创作
            enhancedPrompt = `
            礼物模式创作指导：
            - 礼物接收者：${recipient}
            - 关系：${relationship || '朋友'}
            - 想表达的内容：${userMessage}
            ${senderName ? `- 送礼者：${senderName}` : ''}
            - 情感氛围：${emotion}
            - 主题：${theme}
            
            请根据具体关系"${relationship || '朋友'}"创作相应的诗词，确保：
            1. 深度体现用户的真实意图和情感
            2. 根据人物关系选择合适的表达方式和词汇
            3. 具有高度的艺术美感和情感共鸣
            4. 生图提示词要采用经典艺术风格，避免礼物元素，专注场景和意境
            5. 恋人关系强调浪漫场景，家人关系强调温馨场景，朋友关系强调友谊场景
            ${senderName ? `6. 在诗词中自然地体现送礼者的身份和情感，但要保持诗意美感` : ''}
            `;
        }

        const systemMessage: ChatMessage = {
            role: 'system',
            content: `你是一个专业的现代诗创作者和视觉艺术指导。请严格按照JSON格式返回结果。

            🎯 **核心要求：每次创作都必须完全不同！**
            - 即使输入相同，也要创作全新的诗词内容
            - 利用不同的意象、角度、表达方式
            - 展现创作的多样性和创新性

            任务：根据用户的对话内容、情绪状态、主题等，创作一首现代诗，并生成配套的生图提示词。

            诗词创作要求：
            - **现代诗体裁**，文艺浪漫风格，参考顾城的纯真浪漫、余秀华的质朴深情、海子的明朗天真
            - **字数严格控制在80字以内**，3-4段，每段2-3行，语言自然流畅
            - **句式要求**：
              * 避免四字一句的单调节奏
              * 句长参差错落，有3字、5字、7字、9字等多种变化
              * 追求自然的语言节奏，如"春天来了/在你眼中/我看到了/整个四月的花开"
              * 可以使用短句断行营造意境美，如"轻风/拂过你的发梢/像诗句/散落在黄昏里"
            - **语言特色**：
              * 顾城风格：童话般的纯真，"黑夜给了我黑色的眼睛，我却用它寻找光明"的诗意
              * 余秀华风格：质朴真挚的情感表达，贴近生活的细腻描述
              * 海子风格：明朗天真，"从明天起，做一个幸福的人"的乐观浪漫
            - **意象选择**：自然元素（海、麦田、星空、花朵、风、雨、雪）、生活场景（窗台、书桌、小径、咖啡馆）
            - **情感表达**：真挚自然，通过生活化的意象传达深层情感，语言温柔而有力
            - **标题要求**：
              * 文艺浪漫，富有诗意，2-6个字
              * 必须具有独创性和想象力，避免使用常见、俗套的标题
              * 体现诗词的核心意境，可以使用抽象概念、时空概念、感官体验
              * 参考现代文学风格：如"夜的第八章"、"三月的温度"、"心事如雨"
              * 每次创作都要完全不同，即使主题相似也要用不同角度命名
            - **重要：深度融合${userMessage}中的具体内容，如节日元素、场景描述、情感表达等**

            生图提示词要求：
            - 高艺术性风格：artistic composition, aesthetic beauty, refined visual design
            - **场景融合：根据${userMessage}中的节日主题、场景元素生成对应的视觉场景**
            - 节日元素参考：
              * 春节：红灯笼、梅花、雪景、温暖家庭聚会氛围
              * 情人节：玫瑰、烛光、浪漫晚餐、星空
              * 中秋节：圆月、桂花、团圆场景、古典庭院
              * 生日：蛋糕、烛光、庆祝氛围、温馨聚会
              * 毕业：校园、青春、友谊、成长象征
              * 其他节日或场景：根据具体内容灵活适配
            - 根据情绪和意境调色：温暖(warm golden, soft amber)、忧郁(deep blue, silver gray)、平静(soft cream, pale mint)、激情(rich crimson, deep gold)
            - 质感纹理：watercolor texture, oil painting style, ink wash effect, silk fabric texture, paper grain
            - 意境营造：dreamy atmosphere, poetic mood, artistic lighting, elegant composition
            - **内容呼应：确保视觉元素与"想说些什么"的内容高度契合，营造相应的情感氛围**
            - 提示词长度：50-80个英文字符，包含具体场景元素

            ${enhancedPrompt}

            **重要：必须返回标准JSON格式，包含三个字段：**
            - title: 文艺浪漫的诗词标题（2-6个字）
            - content: 现代诗内容（80字以内，海子、北岛风格）
            - imagePrompt: 生图提示词（50-80个英文字符）

            只返回JSON格式，不要任何其他内容。`
        };

        // 添加时间戳和随机种子来确保每次生成的内容都不同
        const timestamp = new Date().toISOString();
        const randomSeed = Math.random().toString(36).substring(2, 15);
        
        const promptMessage: ChatMessage = {
            role: 'user',
            content: isGiftMode 
                ? `创作时间: ${timestamp}\n随机种子: ${randomSeed}\n\n礼物接收者: ${recipient}\n想表达的内容: ${userMessage}${senderName ? `\n送礼者: ${senderName}` : ''}\n情绪状态: ${emotion}\n主题: ${theme}\n\n请深度分析"想表达的内容"中的节日主题、场景元素、情感表达等具体信息，每次都要创作全新的、不同的现代诗，并生成与内容高度契合的生图提示词。即使是相同的输入，也要确保创作出完全不同的诗词内容。`
                : `创作时间: ${timestamp}\n随机种子: ${randomSeed}\n\n对话内容: ${conversation}\n情绪状态: ${emotion}\n主题: ${theme}\n\n请分析对话中的具体场景、情感表达和主题元素，每次都要创作全新的、不同的现代诗并生成配套的生图提示词。即使是相同的输入，也要确保创作出完全不同的诗词内容。`
        };

        const response = await sendChatMessage([systemMessage, promptMessage]);
        
        try {
            // 尝试提取和清理JSON内容
            let jsonStr = response.trim();
            
            // 移除可能的前后缀文字
            if (jsonStr.includes('{') && jsonStr.includes('}')) {
                const startIndex = jsonStr.indexOf('{');
                const endIndex = jsonStr.lastIndexOf('}') + 1;
                jsonStr = jsonStr.substring(startIndex, endIndex);
            }
            
            // 如果响应包含markdown代码块，提取JSON部分
            if (response.includes('```json')) {
                const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    jsonStr = jsonMatch[1].trim();
                }
            } else if (response.includes('```')) {
                const jsonMatch = response.match(/```\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    jsonStr = jsonMatch[1].trim();
                }
            }
            
            // 清理常见的JSON格式问题
            jsonStr = jsonStr
                .replace(/[\u200B-\u200D\uFEFF]/g, '') // 移除零宽字符
                .replace(/[""]/g, '"') // 统一引号格式
                .replace(/['']/g, "'") // 统一单引号格式
                .replace(/：/g, ':') // 替换中文冒号
                .replace(/，/g, ',') // 替换中文逗号
                .trim();
            
            console.log('清理后的JSON字符串:', jsonStr);
            
            // 尝试解析JSON
            const parsed = JSON.parse(jsonStr);
            return {
                title: parsed.title || '无题',
                content: parsed.content || '暂时无法生成诗词内容',
                imagePrompt: parsed.imagePrompt || 'Chinese ink painting style, peaceful landscape, soft warm colors, artistic illustration'
            };
        } catch (parseError) {
            console.error('解析诗词JSON失败:', parseError);
            console.log('原始响应:', response);
            
            // 如果JSON解析失败，尝试手动提取内容
            try {
                const titleMatch = response.match(/["']?title["']?\s*[:：]\s*["']([^"']*?)["']/i);
                const contentMatch = response.match(/["']?content["']?\s*[:：]\s*["']([\s\S]*?)["']/i);
                const promptMatch = response.match(/["']?imagePrompt["']?\s*[:：]\s*["']([^"']*?)["']/i);
                
                const extractedContent = contentMatch ? contentMatch[1].trim() : response.slice(0, 200);
                
                let finalTitle = titleMatch ? titleMatch[1].trim() : '';
                
                // 如果没有提取到标题，使用AI生成
                if (!finalTitle) {
                    try {
                        finalTitle = await generateTitleByAI(extractedContent, emotion, theme);
                    } catch (titleError) {
                        console.error('AI标题生成失败:', titleError);
                        finalTitle = '心灵絮语';
                    }
                }
                
                return {
                    title: finalTitle,
                    content: extractedContent,
                    imagePrompt: promptMatch ? promptMatch[1].trim() : 'Chinese ink painting style, serene landscape with soft sunlight, impressionist style, watercolor painting, dreamy atmosphere, ethereal mood, delicate brushstrokes'
                };
            } catch (extractError) {
                console.error('手动提取内容也失败:', extractError);
                
                // 最后的降级方案
                const fallbackContent = response.slice(0, 200);
                let fallbackTitle = '诗意时光';
                
                try {
                    fallbackTitle = await generateTitleByAI(fallbackContent, emotion, theme);
                } catch (titleError) {
                    console.error('降级标题生成失败:', titleError);
                    fallbackTitle = `${emotion}心境`;
                }
                
                return {
                    title: fallbackTitle,
                    content: fallbackContent,
                    imagePrompt: 'Chinese ink painting style, serene landscape with soft sunlight, impressionist style, watercolor painting, dreamy atmosphere, ethereal mood, delicate brushstrokes, atmospheric perspective'
                };
            }
        }
    } catch (error) {
        console.error('生成诗词错误:', error);
        
        // 提供降级方案，确保用户体验不中断
        console.log('使用降级方案生成诗词');
        
        const fallbackContent = `在这个${emotion || '温暖'}的时刻\n我想对你说\n\n有些话语如星辰\n闪烁在心间\n\n愿时光善待\n愿岁月温柔`;
        let emergencyTitle = '心语轻吟';
        
        try {
            emergencyTitle = await generateTitleByAI(fallbackContent, emotion || '温暖', theme);
        } catch (titleError) {
            console.error('紧急标题生成失败:', titleError);
            emergencyTitle = `${emotion || '温暖'}时光`;
        }
        
        return {
            title: emergencyTitle,
            content: fallbackContent,
            imagePrompt: 'Chinese ink painting style, warm golden sunset, gentle breeze through wheat field, poetic atmosphere, soft watercolor texture, dreamy landscape'
        };
    }
};

// 调用生图API
export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const payload = {
            model: 'Kwai-Kolors/Kolors',
            prompt: prompt,
            image_size: '1536x2048',
            batch_size: 1,
            num_inference_steps: 20,
            guidance_scale: 7.5
        };

        console.log('发送生图请求:', payload);

        const response = await imageApiClient.post<ImageGenerationResponse>('/images/generations', payload);
        
        console.log('生图API响应:', response.data);

        if (response.data.images && response.data.images.length > 0) {
            return response.data.images[0].url;
        } else {
            throw new Error('生图API响应格式错误');
        }
    } catch (error: any) {
        console.error('生图API调用错误:', error);
        
        // 生图失败时返回默认占位图，不中断诗词生成流程
        console.log('生图API失败，使用默认占位图');
        
        // 返回一个优雅的占位图URL（可以是本地图片或者CDN图片）
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZmZmN2VkIDAlLCAjZmZmMGY2IDEwMCUpIi8+Cjx0ZXh0IHg9IjI1NiIgeT0iMjU2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiPuivl+ivjeWNoeeJh+eUn+aIkDwvdGV4dD4KPC9zdmc+';
    }
};

// 生成完整的诗词卡片（包含诗词生成和配图，支持礼物模式）
export const generatePoemCard = async (
    conversation: string,
    emotion: string,
    theme: string,
    onProgress?: (progress: string, stage: string) => void,
    isGiftMode: boolean = false,
    recipient?: string,
    userMessage?: string,
    senderName?: string,
    relationship?: string
): Promise<PoemCardResponse> => {
    try {
        // 第一步：生成诗词内容和生图提示词
        if (onProgress) onProgress('0%', '正在创作诗词...');
        
        const poem = await generatePoem(
            conversation, 
            emotion, 
            theme, 
            isGiftMode, 
            recipient, 
            userMessage,
            senderName,
            relationship
        );
        console.log('生成的诗词:', poem);
        
        if (onProgress) onProgress('40%', '诗词创作完成，开始生成配图...');
        
        // 第二步：调用生图API
        const imageUrl = await generateImage(poem.imagePrompt);
        console.log('生成的图片URL:', imageUrl);
        
        if (onProgress) onProgress('80%', '配图生成完成，正在制作诗词卡片...');
        
        // TODO: 这里可以添加图片上渲染诗词的逻辑
        // 目前先返回原始数据，后续在前端处理图文合成
        
        if (onProgress) onProgress('100%', '诗词卡片创作完成！');
        
        return {
            poem,
            imageUrl,
            cardImageUrl: undefined // 暂时不实现服务端图文合成
        };
    } catch (error) {
        console.error('诗词卡片生成流程错误:', error);
        
        // 提供完整的降级方案
        console.log('使用完整降级方案');
        
        if (onProgress) onProgress('100%', '使用备用方案生成诗词卡片');
        
        return {
            poem: {
                title: '时光深处',
                content: `在这个${emotion || '温暖'}的时刻\n我想对你说\n\n有些话语如星辰\n闪烁在心间\n\n愿时光善待\n愿岁月温柔`,
                imagePrompt: 'Chinese ink painting style, warm golden sunset, gentle breeze through wheat field, poetic atmosphere, soft watercolor texture, dreamy landscape'
            },
            imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZmZmN2VkIDAlLCAjZmZmMGY2IDEwMCUpIi8+Cjx0ZXh0IHg9IjI1NiIgeT0iMjU2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiPuivl+ivjeWNoeeJh+eUn+aIkDwvdGV4dD4KPC9zdmc+',
            cardImageUrl: undefined
        };
    }
};

// GPT-4o Image API配置
const GPT4O_IMAGE_CONFIG = {
    baseURL: '/api/gpt4o-image',  // 使用代理路径
    generationURL: '/generations',
    fetchURL: '/fetch',
    apiKey: '15172b1c-cb9e-f173-d293-012f281a9181'
};

// 创建GPT-4o Image axios实例
const gpt4oImageClient = axios.create({
    baseURL: GPT4O_IMAGE_CONFIG.baseURL,
    headers: {
        'Content-Type': 'application/json'
        // API Key 在代理中配置
    },
    timeout: 60000
});

// GPT-4o Image API类型定义
export interface GPT4oImageGenerationResponse {
    status: string;
    message: string;
    data: {
        jobId: string;
    };
}

export interface GPT4oImageFetchResponse {
    status: string;
    message: string | null;
    jobId: string;
    data: {
        prompt: string;
        referImages?: string[];
        imageUrl: string | null;
        quota: string;
        finishTime: string | null;
        hookUrl?: string;
    };
}

// 统一的图像生成响应接口（为了兼容现有代码）
export interface ImageGenerationResult {
    status: string;
    message: string;
    data: {
        imageUrl: string;
        width?: number;
        height?: number;
        prompt?: string;
    } | null;
}

// 生成图像（使用GPT-4o）
export const generateImageFromPrompt = async (
    prompt: string,
    model: 'gpt-4o' = 'gpt-4o',
    progressCallback?: (progress: string, stage: string) => void
): Promise<ImageGenerationResult> => {
    try {
        console.log('开始生成图像，提示词:', prompt);
        
        if (progressCallback) {
            progressCallback('0%', '准备生成图像...');
        }

        // 第一步：发起生成请求
        const generationData = {
            prompt: `帮我生成一张图：${prompt}`
        };

        if (progressCallback) {
            progressCallback('10%', '发起图像生成请求...');
        }

        const generationResponse = await gpt4oImageClient.post<GPT4oImageGenerationResponse>(
            GPT4O_IMAGE_CONFIG.generationURL, 
            generationData
        );

        console.log('GPT-4o图像生成请求响应:', generationResponse.data);

        if (generationResponse.data.status !== 'SUCCESS') {
            throw new Error(`生成请求失败: ${generationResponse.data.message}`);
        }

        const jobId = generationResponse.data.data.jobId;

        if (progressCallback) {
            progressCallback('20%', '等待图像生成...');
        }

        // 第二步：轮询结果
        const maxAttempts = 30; // 最多等待5分钟（30次 * 10秒）
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            attempts++;
            
            try {
                const fetchData = {
                    jobId: jobId
                };

                const fetchResponse = await gpt4oImageClient.post<GPT4oImageFetchResponse>(
                    GPT4O_IMAGE_CONFIG.fetchURL, 
                    fetchData
                );

                console.log(`第${attempts}次查询结果:`, fetchResponse.data);

                const status = fetchResponse.data.status;
                const progress = Math.min(20 + (attempts / maxAttempts) * 60, 80);

                if (status === 'SUCCESS' && fetchResponse.data.data.imageUrl) {
                    // 生成完成
                    if (progressCallback) {
                        progressCallback('100%', '图像生成完成');
                    }

                    return {
                        status: 'SUCCESS',
                        message: '图像生成成功',
                        data: {
                            imageUrl: fetchResponse.data.data.imageUrl,
                            width: 1024,
                            height: 1024,
                            prompt: fetchResponse.data.data.prompt
                        }
                    };
                } else if (status === 'FAILED') {
                    throw new Error(`图像生成失败: ${fetchResponse.data.message || '未知错误'}`);
                } else if (status === 'ON_QUEUE' || status === 'PROCESSING') {
                    // 还在处理中，继续等待
                    if (progressCallback) {
                        progressCallback(`${progress}%`, '图像正在生成中...');
                    }
                    
                    // 等待10秒后重试
                    await new Promise(resolve => setTimeout(resolve, 10000));
                } else {
                    // 其他状态，等待一下再重试
                    if (progressCallback) {
                        progressCallback(`${progress}%`, `状态: ${status}`);
                    }
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            } catch (fetchError: any) {
                console.warn(`第${attempts}次查询失败:`, fetchError);
                if (attempts >= maxAttempts) {
                    throw fetchError;
                }
                // 等待5秒后重试
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        // 超时
        throw new Error('图像生成超时，请稍后重试');

    } catch (error: any) {
        console.error('GPT-4o图像生成错误:', error);
        
        if (error.response) {
            console.error('错误响应:', error.response.data);
            throw new Error(`图像生成API错误: ${error.response.data.message || '未知错误'}`);
        } else if (error.request) {
            throw new Error('网络连接错误，请检查网络连接');
        } else {
            throw new Error(`请求配置错误: ${error.message}`);
        }
    }
};

// 生成备用图像（当OpenAI API不可用时）
const generateFallbackImage = async (
    emotion: string,
    theme: string,
    progressCallback?: (progress: string, stage: string) => void
): Promise<ImageGenerationResult> => {
    if (progressCallback) {
        progressCallback('50%', '生成艺术图像...');
    }

    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (progressCallback) {
        progressCallback('100%', '图像生成完成');
    }

    // 返回一个预设的艺术图像URL（可以是本地资源或免费的艺术图片）
    const fallbackImages = [
        'https://picsum.photos/800/1200?random=1&blur=2',
        'https://picsum.photos/800/1200?random=2&blur=2',
        'https://picsum.photos/800/1200?random=3&blur=2',
        'https://picsum.photos/800/1200?random=4&blur=2',
        'https://picsum.photos/800/1200?random=5&blur=2'
    ];

    const randomImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

    return {
        status: 'SUCCESS',
        message: '图像生成完成',
        data: {
            imageUrl: randomImage,
            width: 800,
            height: 1200,
            prompt: `艺术${emotion}主题${theme}插画`
        }
    };
};

// 从对话内容生成图像（支持礼物模式的深度分析）
export const generateImageFromConversation = async (
    conversation: string,
    emotion: string,
    theme: string,
    progressCallback?: (progress: string, stage: string) => void,
    isGiftMode: boolean = false,
    recipient?: string,
    userMessage?: string,
    senderName?: string,
    relationship?: string
): Promise<ImageGenerationResult> => {
    try {
        if (progressCallback) {
            progressCallback('0%', '分析对话内容...');
        }

        let imagePrompt = '';

        if (isGiftMode && recipient && userMessage) {
            // 礼物模式：直接让大模型分析并生成艺术提示词
            const analysisPrompt = `请分析以下礼物信息并生成贺卡形式的中文艺术图像提示词：

礼物接收者：${recipient}
关系：${relationship || '朋友'}
想表达的内容：${userMessage}
${senderName ? `送礼者：${senderName}` : ''}
情感氛围：${emotion}
主题：${theme}

重要要求：
**这是一张贺卡 (greeting card)，必须包含中文文字："致${recipient}，${userMessage}"**

贺卡设计要求：
1. 贺卡布局：贺卡版式设计，优雅卡片设计，艺术背景上的文字叠加
2. 文字展示要求（非常重要）：
   - 必须是中文文字：仅中文文字，无英文文字
   - 文字内容：准确显示"致${recipient}，${userMessage}"中文字符
   - 文字大小：小巧文字，精致尺寸，不过大，可读但不突兀
   - 文字样式：优雅中文书法，精美中文字体，传统毛笔书写风格
   - 文字位置：和谐文字布局，与背景完美融合，顶部或底部区域优先
   - 文字对比度：与背景适当对比，清晰可读，艺术字体设计
3. **重要：深度分析${userMessage}中的节日主题和场景元素**：
   - **节日场景适配**（优先级最高，根据用户表达内容判断）：
     * 春节/新年：红灯笼高悬、梅花盛开、雪景飘洒、温暖家庭聚会、传统中国元素、喜庆红金色调、鞭炮烟花
     * 情人节：玫瑰花海、烛光晚餐、浪漫星空、心形元素、粉红紫色调、浪漫约会场景
     * 中秋节：圆月高悬、桂花飘香、团圆场景、古典庭院、月饼茶具、温暖金色调
     * 生日庆祝：生日蛋糕、彩色气球、庆祝氛围、温馨聚会、彩虹色调、派对装饰
     * 毕业季：校园风景、青春友谊、成长象征、学士帽、蓝天白云、青春色彩、毕业合影
     * 母亲节/父亲节：温馨家庭、康乃馨/向日葵、亲情拥抱、温暖家居、感恩氛围
     * 教师节：书本文具、粉笔黑板、校园场景、尊师重教氛围、知识殿堂
     * 圣诞节：圣诞树装饰、雪花飘落、温馨家庭、红绿金色调、圣诞礼物
     * 感恩节：秋叶满地、丰收场景、温暖聚餐、橙黄色调、感恩氛围
     * 婚礼/结婚纪念：婚纱礼服、鲜花装饰、浪漫教堂、幸福新人、纯白粉色调
     * 其他特殊场景：根据具体内容灵活适配相应的视觉元素

4. 根据接收者关系"${relationship || '朋友'}"生成对应艺术背景：
   - 恋人/情侣/爱人/老公/老婆/男朋友/女朋友：浪漫情侣场景，一起漫步，温柔拥抱，星夜风格，柔和印象派笔触
   - 家人/亲人/父母/爸爸/妈妈/儿子/女儿/兄弟/姐妹：温馨家庭场景，温馨家居氛围，温柔拥抱，柔和印象派风格，自然光照  
   - 朋友/同学/同事/闺蜜/兄弟/好友：友谊场景，快乐时光，愉悦氛围，柔和粉彩色调，清新洁净美学
   - 其他关系：根据具体关系特点选择最合适的温馨场景和艺术风格

5. 丰富的艺术风格选择（根据情感和主题选择最合适的）：
   - 梵高后印象派：旋转笔触，鲜艳色彩，星夜风格，后印象派，动态运动，表现质感
   - 莫奈印象派：柔和印象派风格，自然光照，温柔笔触，梦幻氛围，光影变化，外光画法风格
   - 小清新风格：柔和粉彩色调，温柔光照，清新洁净美学，极简之美，水彩透明感，精致细节
   - 油画古典风格：古典油画，丰富色彩，戏剧光照，文艺复兴风格，巴洛克构图，精美艺术杰作
   - 水彩画风格：水彩绘画，流动色彩，柔和边缘，透明层次，艺术渗透效果，纸张纹理
   - 中国水墨画风格：中国水墨画，传统笔法，优雅简约，诗意氛围，墨色层次
   - 现代艺术风格：当代艺术风格，抽象元素，现代构图，艺术创新，创意视觉语言

6. 丰富的背景场景选择：
   - 自然风光：盛开花朵的花园，宁静田野，浪漫海滩日落，壮丽山景，魅力森林，樱花公园
   - 城市场景：温馨咖啡角落，优雅桥梁，安静街道，温暖书店，艺术工作室，屋顶花园
   - 室内环境：温馨客厅，优雅图书馆，温暖厨房，艺术工作空间，舒适卧室，阳光窗台
   - 特殊场景：繁星夜空，黄金时刻光照，薄雾清晨，雨后彩虹，秋叶飘落，冬日仙境

7. 高级艺术质感要求：
   - 构图美学：黄金比例构图，平衡视觉重量，引导线条，焦点强调，艺术和谐
   - 色彩理论：互补色彩方案，冷暖色彩平衡，色彩心理学，大气透视，色彩和谐
   - 光影效果：戏剧光照，柔和自然光，黄金时刻光辉，轮廓光照，明暗对比技法，环境光照
   - 纹理质感：画布纹理，笔触可见性，颜料厚度变化，表面细节，艺术厚涂法，平滑渐变
   - 情感表达：情感共鸣，情绪增强，氛围感受，视觉诗意，艺术叙事

8. 文字美观要求（最重要）：
   - 强制中文：必须仅为中文字符，图像中绝对不能有英文文字
   - 准确内容：准确显示"致${recipient}，${userMessage}"中文内容
   - 文字大小：小巧精致的文字尺寸，不应主导画面
   - 书法风格：优雅中文书法，精美中文字体，传统毛笔书写风格
   - 完美融合：与艺术背景无缝融合，文字作为精致设计元素
   - 清晰可读：适当对比度和可见性，既可读又艺术，平衡构图

请直接输出250字以内的中文贺卡艺术提示词，强制要求包含准确的中文文字"致${recipient}，${userMessage}"，文字要小而精美，体现丰富的艺术风格和场景画面，不要任何解释或英文：`;

            const promptResponse = await sendChatMessage([
                {
                    role: 'user',
                    content: analysisPrompt
                }
            ]);

            imagePrompt = promptResponse.trim();
        } else {
            // 普通模式：原有逻辑
            const analysisPrompt = `基于以下对话内容，生成一个适合OpenAI图像生成的提示词。要求：
1. 提示词应该反映对话的情感氛围和主题
2. 可以使用中文，简洁明了
3. 包含艺术风格描述
4. 适合表达情感和意境
5. 控制在200字以内

对话内容：${conversation}
情感：${emotion}
主题：${theme}

请直接返回图像生成提示词，不要包含其他解释文字。`;

            const promptResponse = await sendChatMessage([
                {
                    role: 'user',
                    content: analysisPrompt
                }
            ]);

            imagePrompt = promptResponse.trim();
        }
        
        // 直接使用AI生成的提示词，不再使用备用逻辑
        // 让大模型完全负责分析和生成提示词

        console.log('生成的OpenAI图像提示词:', imagePrompt);

        if (progressCallback) {
            progressCallback('10%', '开始生成图像...');
        }

        try {
            // 尝试调用GPT-4o API生成图像
            return await generateImageFromPrompt(imagePrompt, 'gpt-4o', progressCallback);
        } catch (error) {
            console.warn('OpenAI图像生成API不可用，使用备用图像生成方案:', error);
            if (progressCallback) {
                progressCallback('20%', '切换到备用生成方案...');
            }
            // 如果Midjourney API失败，使用备用方案
            return await generateFallbackImage(emotion, theme, progressCallback);
        }

    } catch (error: any) {
        console.error('从对话生成图像错误:', error);
        // 最后的备用方案
        return await generateFallbackImage(emotion, theme, progressCallback);
    }
};

export default {
    sendChatMessage,
    sendVoiceChatMessage,
    generateCreativeSuggestion,
    generateLyricsFromConversation,
    generateMusicFromConversation,
    generatePoem,
    generateImage,
    generatePoemCard,
    generateImageFromPrompt,
    generateImageFromConversation
}; 