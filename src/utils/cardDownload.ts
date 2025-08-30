// 诗词卡片下载工具函数
import html2canvas from 'html2canvas';

// 将跨域图片转换为base64数据URL
const convertImageToDataURL = async (imgElement: HTMLImageElement): Promise<string> => {
    return new Promise((resolve, reject) => {
        // 如果图片已经是data URL，直接返回
        if (imgElement.src.startsWith('data:')) {
            resolve(imgElement.src);
            return;
        }
        
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                reject(new Error('无法创建canvas上下文'));
                return;
            }
            
            // 创建一个新的图片对象，设置跨域
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                try {
                    canvas.width = img.naturalWidth || img.width;
                    canvas.height = img.naturalHeight || img.height;
                    
                    ctx.drawImage(img, 0, 0);
                    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
                    resolve(dataURL);
                } catch (error) {
                    console.error('转换图片失败:', error);
                    reject(error);
                }
            };
            
            img.onerror = () => {
                console.error('图片加载失败:', imgElement.src);
                reject(new Error('图片加载失败'));
            };
            
            // 尝试加载图片
            img.src = imgElement.src;
            
        } catch (error) {
            console.error('处理图片时出错:', error);
            reject(error);
        }
    });
};

// 将元素中的所有跨域图片转换为数据URL
const convertCrossOriginImages = async (element: HTMLElement): Promise<Map<HTMLImageElement, string>> => {
    const images = element.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
    const imageMap = new Map<HTMLImageElement, string>();
    
    for (const img of images) {
        try {
            // 跳过已经是data URL的图片
            if (img.src.startsWith('data:')) {
                continue;
            }
            
            console.log('转换图片:', img.src);
            const dataURL = await convertImageToDataURL(img);
            imageMap.set(img, dataURL);
        } catch (error) {
            console.warn('转换图片失败，将跳过:', img.src, error);
        }
    }
    
    return imageMap;
};

// 应用转换后的图片数据URL
const applyConvertedImages = (imageMap: Map<HTMLImageElement, string>) => {
    const originalSrcs = new Map<HTMLImageElement, string>();
    
    imageMap.forEach((dataURL, img) => {
        originalSrcs.set(img, img.src);
        img.src = dataURL;
    });
    
    return originalSrcs;
};

// 恢复原始图片URL
const restoreOriginalImages = (originalSrcs: Map<HTMLImageElement, string>) => {
    originalSrcs.forEach((originalSrc, img) => {
        img.src = originalSrc;
    });
};

// 优化元素样式以便截图
export const optimizeForScreenshot = (element: HTMLElement) => {
    const originalStyles: { [key: string]: string } = {};
    
    // 保存原始样式
    const computedStyle = window.getComputedStyle(element);
    originalStyles.transform = element.style.transform;
    originalStyles.position = element.style.position;
    originalStyles.zIndex = element.style.zIndex;
    originalStyles.opacity = element.style.opacity;
    
    // 应用优化样式
    element.style.transform = 'none';
    element.style.position = 'static';
    element.style.zIndex = '9999';
    element.style.opacity = '1';
    
    // 确保所有子元素可见
    const allElements = element.querySelectorAll('*');
    const childOriginalStyles: { element: HTMLElement; styles: { [key: string]: string } }[] = [];
    
    allElements.forEach((child) => {
        if (child instanceof HTMLElement) {
            const childStyles: { [key: string]: string } = {};
            childStyles.opacity = child.style.opacity;
            childStyles.visibility = child.style.visibility;
            childStyles.display = child.style.display;
            
            childOriginalStyles.push({ element: child, styles: childStyles });
            
            child.style.opacity = '1';
            child.style.visibility = 'visible';
            if (child.style.display === 'none') {
                child.style.display = 'block';
            }
        }
    });
    
    return { originalStyles, childOriginalStyles };
};

// 恢复原始样式
export const restoreOriginalStyles = (
    element: HTMLElement, 
    styleInfo: { 
        originalStyles: { [key: string]: string }; 
        childOriginalStyles: { element: HTMLElement; styles: { [key: string]: string } }[] 
    }
) => {
    // 恢复主元素样式
    Object.keys(styleInfo.originalStyles).forEach(key => {
        if (styleInfo.originalStyles[key]) {
            (element.style as any)[key] = styleInfo.originalStyles[key];
        } else {
            (element.style as any)[key] = '';
        }
    });
    
    // 恢复子元素样式
    styleInfo.childOriginalStyles.forEach(({ element: child, styles }) => {
        Object.keys(styles).forEach(key => {
            if (styles[key]) {
                (child.style as any)[key] = styles[key];
            } else {
                (child.style as any)[key] = '';
            }
        });
    });
};

// 下载诗词卡片为图片
export const downloadPoemCard = async (
    cardElement: HTMLElement,
    title: string,
    options: {
        format?: 'png' | 'jpeg';
        quality?: number;
        filename?: string;
        addWhiteBackground?: boolean;
    } = {}
): Promise<void> => {
    const {
        format = 'jpeg',
        quality = 0.95,
        filename,
        addWhiteBackground = true
    } = options;
    
    let styleInfo: any = null;
    let originalImageSrcs: Map<HTMLImageElement, string> | null = null;
    
    try {
        // 等待所有图片加载完成
        await waitForImagesToLoad(cardElement);
        
        // 转换跨域图片为数据URL
        console.log('开始转换跨域图片...');
        const imageMap = await convertCrossOriginImages(cardElement);
        console.log('转换完成，共处理图片:', imageMap.size);
        
        // 应用转换后的图片
        originalImageSrcs = applyConvertedImages(imageMap);
        
        // 给DOM一些时间来完全渲染
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 优化元素样式以便截图
        styleInfo = optimizeForScreenshot(cardElement);
        
        // 再等待一下确保样式应用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 使用html2canvas截图
        console.log('开始生成截图...');
        const canvas = await html2canvas(cardElement, {
            useCORS: true,
            allowTaint: true,
            scale: 2, // 提高清晰度
            backgroundColor: addWhiteBackground ? '#ffffff' : null,
            removeContainer: false,
            foreignObjectRendering: false,
            imageTimeout: 30000, // 增加超时时间
            logging: true, // 启用日志以便调试
            width: cardElement.scrollWidth,
            height: cardElement.scrollHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
        });
        
        // 恢复原始样式和图片URL
        if (styleInfo) {
            restoreOriginalStyles(cardElement, styleInfo);
        }
        if (originalImageSrcs) {
            restoreOriginalImages(originalImageSrcs);
        }
        
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
            throw new Error('截图失败：生成的canvas无效');
        }
        
        // 转换为指定格式
        let dataUrl: string;
        if (format === 'png') {
            dataUrl = canvas.toDataURL('image/png');
        } else {
            // JPEG格式，可能需要添加白色背景
            if (addWhiteBackground) {
                const jpegCanvas = document.createElement('canvas');
                const jpegCtx = jpegCanvas.getContext('2d')!;
                jpegCanvas.width = canvas.width;
                jpegCanvas.height = canvas.height;
                
                // 设置白色背景
                jpegCtx.fillStyle = '#ffffff';
                jpegCtx.fillRect(0, 0, jpegCanvas.width, jpegCanvas.height);
                
                // 绘制原始canvas内容
                jpegCtx.drawImage(canvas, 0, 0);
                
                dataUrl = jpegCanvas.toDataURL('image/jpeg', quality);
            } else {
                dataUrl = canvas.toDataURL('image/jpeg', quality);
            }
        }
        
        // 检查生成的图片是否有效
        if (dataUrl.length < 1000) {
            throw new Error('截图失败：生成的图片数据太小');
        }
        
        // 下载图片
        const finalFilename = filename || `${title}_${Date.now()}.${format}`;
        downloadImage(dataUrl, finalFilename);
        
    } catch (error: any) {
        // 确保恢复样式和图片URL
        if (styleInfo && cardElement) {
            restoreOriginalStyles(cardElement, styleInfo);
        }
        if (originalImageSrcs) {
            restoreOriginalImages(originalImageSrcs);
        }
        throw error;
    }
};

// 等待元素内所有图片加载完成
const waitForImagesToLoad = async (element: HTMLElement): Promise<void> => {
    const images = element.querySelectorAll('img');
    const promises: Promise<void>[] = [];
    
    images.forEach((img) => {
        if (!img.complete) {
            promises.push(
                new Promise((resolve) => {
                    img.onload = () => resolve();
                    img.onerror = () => resolve(); // 即使加载失败也继续
                })
            );
        }
    });
    
    // 等待背景图片加载
    const elementsWithBg = element.querySelectorAll('[style*="background-image"]');
    elementsWithBg.forEach((el) => {
        const style = window.getComputedStyle(el);
        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
            const matches = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
            if (matches && matches[1]) {
                promises.push(
                    new Promise((resolve) => {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = () => resolve();
                        img.onerror = () => resolve();
                        img.src = matches[1];
                    })
                );
            }
        }
    });
    
    await Promise.all(promises);
};

// 下载图片到本地
export const downloadImage = (dataUrl: string, filename: string): void => {
    try {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象（如果是blob URL）
        if (dataUrl.startsWith('blob:')) {
            URL.revokeObjectURL(dataUrl);
        }
    } catch (error) {
        console.error('下载图片失败:', error);
        throw error;
    }
};

// 将诗词卡片保存到本地存储
export const savePoemCardToStorage = (poemData: {
    title: string;
    content: string;
    imageUrl?: string;
    cardImageUrl: string;
    poemId?: string;
}): void => {
    try {
        const savedPoems = JSON.parse(localStorage.getItem('savedPoems') || '[]');
        const newPoem = {
            ...poemData,
            poemId: poemData.poemId || Date.now().toString(),
            savedAt: new Date().toISOString()
        };
        
        savedPoems.push(newPoem);
        localStorage.setItem('savedPoems', JSON.stringify(savedPoems));
    } catch (error) {
        console.error('保存到本地存储失败:', error);
    }
}; 