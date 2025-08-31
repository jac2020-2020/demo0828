// 下载工具函数
export interface DownloadOptions {
    url: string;
    filename: string;
    onProgress?: (progress: number) => void;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

// 显示Toast提示
const showToast = (message: string, type: 'loading' | 'success' | 'error' = 'success', duration = 2000) => {
    const toast = document.createElement('div');
    toast.innerHTML = message;
    
    let backgroundColor, color, padding, fontSize;
    switch (type) {
        case 'loading':
            backgroundColor = 'rgba(0, 0, 0, 0.8)';
            color = 'white';
            padding = '15px 25px';
            fontSize = '16px';
            break;
        case 'success':
            backgroundColor = 'transparent';
            color = '#22c55e';
            padding = '10px';
            fontSize = '32px';
            break;
        case 'error':
            backgroundColor = 'rgba(239, 68, 68, 0.9)';
            color = 'white';
            padding = '15px 25px';
            fontSize = '16px';
            break;
    }
    
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${backgroundColor};
        color: ${color};
        padding: ${padding};
        border-radius: 50%;
        z-index: 9999;
        font-size: ${fontSize};
        font-weight: bold;
        text-align: center;
        box-shadow: ${type === 'success' ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.15)'};
        width: ${type === 'success' ? '60px' : 'auto'};
        height: ${type === 'success' ? '60px' : 'auto'};
        display: flex;
        align-items: center;
        justify-content: center;
        ${type === 'success' ? 'max-width: none;' : 'max-width: 300px;'}
    `;
    
    document.body.appendChild(toast);
    
    if (type !== 'loading') {
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, duration);
    }
    
    return toast;
};

// 通用图片下载函数
export const downloadImage = async (options: DownloadOptions): Promise<boolean> => {
    const { url, filename, onProgress, onSuccess, onError } = options;
    
    // 显示加载提示
    const loadingToast = showToast('正在准备下载...', 'loading');
    
    try {
        // 方法1：尝试直接fetch
        const response = await fetch(url, {
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        // 创建下载链接
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理
        URL.revokeObjectURL(blobUrl);
        
        // 移除加载提示
        if (document.body.contains(loadingToast)) {
            document.body.removeChild(loadingToast);
        }
        
        // 显示成功提示
        showToast('✅ 图片下载成功！', 'success');
        
        if (onSuccess) onSuccess();
        return true;
        
    } catch (error: any) {
        console.warn('直接下载失败，尝试代理下载:', error);
        
        // 移除加载提示
        if (document.body.contains(loadingToast)) {
            document.body.removeChild(loadingToast);
        }
        
        // 方法2：尝试代理下载
        try {
            // 将 cdn.ttapi.io 的 URL 转换为代理 URL
            const proxyUrl = url.replace('https://cdn.ttapi.io', '/proxy');
            const response = await fetch(proxyUrl);
            
            if (response.ok) {
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                URL.revokeObjectURL(blobUrl);
                
                showToast('✓', 'success');
                
                if (onSuccess) onSuccess();
                return true;
            } else {
                throw new Error('代理下载失败');
            }
        } catch (proxyError) {
            console.error('代理下载也失败:', proxyError);
            
            // 方法3：最后的降级方案
            showToast('下载失败，已在新窗口打开图片', 'error', 3000);
            
            // 在新窗口打开图片
            window.open(url, '_blank');
            
            if (onError) onError(new Error('所有下载方法都失败'));
            return false;
        }
    }
};

// 专门用于下载生成的图片
export const downloadGeneratedImage = async (imageUrl: string, title: string = '心情画作'): Promise<boolean> => {
    const filename = `${title}_${Date.now()}.png`;
    
    return downloadImage({
        url: imageUrl,
        filename,
        onSuccess: () => {
            console.log('图片下载成功:', filename);
        },
        onError: (error) => {
            console.error('图片下载失败:', error);
        }
    });
};

// 下载礼物图片
export const downloadGiftImage = async (imageUrl: string, title: string = '礼物图片'): Promise<boolean> => {
    const filename = `${title}_${Date.now()}.jpg`;
    
    return downloadImage({
        url: imageUrl,
        filename,
        onSuccess: () => {
            console.log('礼物图片下载成功:', filename);
        },
        onError: (error) => {
            console.error('礼物图片下载失败:', error);
        }
    });
}; 