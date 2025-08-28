import axios from 'axios';

// 音乐API配置
const MUSIC_API_CONFIG = {
    baseURL: '/api/music', // 使用代理路径
    apiKey: '15172b1c-cb9e-f173-d293-012f281a9181'
};

// 创建axios实例
const musicApiClient = axios.create({
    baseURL: MUSIC_API_CONFIG.baseURL,
    headers: {
        'Content-Type': 'application/json'
        // API Key 已经在代理中配置
    },
    timeout: 60000 // 增加超时时间
});

// 音乐生成请求接口
export interface MusicGenerateRequest {
    mv: string;
    custom: boolean;
    instrumental: boolean;
    prompt: string;
    title?: string;
    tags?: string;
}

// 音乐生成响应接口
export interface MusicGenerateResponse {
    status: string;
    message: string;
    data: {
        jobId: string;
    };
}

// 音乐获取响应接口
export interface MusicFetchResponse {
    status: string;
    message: string;
    jobId: string;
    data: {
        jobId: string;
        action: string;
        progress: string;
        mv: string;
        quota: string;
        hookUrl?: string;
        musics: Array<{
            musicId: string;
            prompt: string;
            title: string;
            tags: string;
            imageUrl: string;
            imageLargeUrl: string;
            audioUrl: string;
            videoUrl: string;
        }>;
    };
}

// 生成音乐
export const generateMusic = async (lyrics: string, title?: string, tags?: string): Promise<string> => {
    try {
        const requestData: MusicGenerateRequest = {
            mv: 'chirp-v4',
            custom: true,
            instrumental: false,
            prompt: lyrics,
            title: title,
            tags: tags || 'emotional, melodic, heartfelt'
        };

        console.log('发送音乐生成请求:', requestData);

        const response = await musicApiClient.post<MusicGenerateResponse>('/music', requestData);
        
        console.log('音乐生成API响应:', response.data);

        if (response.data.status === 'SUCCESS' && response.data.data?.jobId) {
            return response.data.data.jobId;
        } else {
            throw new Error('音乐生成请求失败');
        }
    } catch (error: any) {
        console.error('音乐生成API调用错误:', error);
        
        if (error.response) {
            console.error('错误响应:', error.response.data);
            const errorMsg = error.response.data?.message || error.response.statusText || '未知错误';
            throw new Error(`音乐生成API错误 (${error.response.status}): ${errorMsg}`);
        } else if (error.request) {
            console.error('请求错误:', error.request);
            throw new Error('网络连接错误，请检查网络连接或稍后重试');
        } else {
            throw new Error(`音乐生成请求配置错误: ${error.message}`);
        }
    }
};

// 获取音乐生成结果
export const fetchMusicResult = async (jobId: string): Promise<MusicFetchResponse> => {
    try {
        const response = await musicApiClient.post<MusicFetchResponse>('/fetch', {
            jobId: jobId
        });
        
        console.log('音乐获取API响应:', response.data);
        
        return response.data;
    } catch (error: any) {
        console.error('音乐获取API调用错误:', error);
        
        if (error.response) {
            console.error('错误响应:', error.response.data);
            const errorMsg = error.response.data?.message || error.response.statusText || '未知错误';
            throw new Error(`音乐获取API错误 (${error.response.status}): ${errorMsg}`);
        } else if (error.request) {
            console.error('请求错误:', error.request);
            throw new Error('网络连接错误，请检查网络连接或稍后重试');
        } else {
            throw new Error(`音乐获取请求配置错误: ${error.message}`);
        }
    }
};

// 轮询获取音乐结果直到完成
export const pollMusicResult = async (
    jobId: string, 
    onProgress?: (progress: string) => void,
    maxAttempts: number = 30,
    intervalMs: number = 10000
): Promise<MusicFetchResponse> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const result = await fetchMusicResult(jobId);
            
            if (onProgress && result.data?.progress) {
                onProgress(result.data.progress);
            }
            
            // 检查是否完成
            if (result.status === 'SUCCESS' && result.data?.progress === '100%' && result.data?.musics?.length > 0) {
                return result;
            }
            
            // 如果失败，直接返回错误
            if (result.status === 'FAILED') {
                throw new Error('音乐生成失败');
            }
            
            // 等待下次轮询
            if (attempt < maxAttempts - 1) {
                await new Promise(resolve => setTimeout(resolve, intervalMs));
            }
        } catch (error) {
            console.error(`音乐结果获取失败 (尝试 ${attempt + 1}/${maxAttempts}):`, error);
            if (attempt === maxAttempts - 1) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
    }
    
    throw new Error('音乐生成超时，请稍后重试');
};

// 生成歌词的辅助函数
export const generateLyrics = async (emotion: string, story: string, theme: string): Promise<string> => {
    // 这里可以集成到主要的聊天API中生成歌词，或者使用模板
    const lyricTemplate = `[Verse 1]
${story}
情感在心中流淌
记忆如潮水般涌来

[Chorus]
${theme}
${emotion}的旋律在回响
心中的话语要诉说

[Verse 2]
时光荏苒不停留
感受这份${emotion}
让音乐带走所有烦恼

[Bridge]
${theme}
在这个瞬间
感受内心的声音

[Outro]
${emotion}如歌声般美妙
永远留在心中`;

    return lyricTemplate;
};

export default {
    generateMusic,
    fetchMusicResult,
    pollMusicResult,
    generateLyrics
}; 