// 图片处理工具函数

// 在图片上渲染诗词 - 简洁版本
export const renderPoemOnImage = async (
    imageUrl: string,
    title: string,
    content: string
): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            // 创建canvas元素
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                throw new Error('无法创建canvas上下文');
            }
            
            // 创建图片对象
            const img = new Image();
            img.crossOrigin = 'anonymous'; // 处理跨域问题
            
            img.onload = () => {
                try {
                    // 设置canvas尺寸
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // 绘制背景图片
                    ctx.drawImage(img, 0, 0);
                    
                    // 设置文字样式 - 简洁版
                    ctx.fillStyle = 'white';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // 添加文字阴影 - 更自然的效果
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 3;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 1;
                    
                    // 绘制日期
                    const dateFontSize = Math.max(12, canvas.width * 0.018);
                    ctx.font = `300 ${dateFontSize}px "字魂风华雅宋", "STKaiti", "KaiTi", "SimKai", sans-serif`;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    const currentDate = new Date().toLocaleDateString('zh-CN', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                    });
                    const dateY = canvas.height * 0.08;
                    ctx.fillText(currentDate, canvas.width / 2, dateY);
                    
                    // 重置颜色为标题
                    ctx.fillStyle = 'white';
                    
                    // 绘制标题 - 优雅简洁
                    const titleFontSize = Math.max(24, canvas.width * 0.035);
                    ctx.font = `italic 300 ${titleFontSize}px "字魂风华雅宋", "STKaiti", "KaiTi", "SimKai", "DFKai-SB", "Brush Script MT", cursive, "PingFang SC", sans-serif`;
                    const titleY = canvas.height * 0.18;
                    ctx.fillText(title, canvas.width / 2, titleY);
                    
                    // 绘制诗词内容 - 适应更长内容
                    const contentFontSize = Math.max(14, canvas.width * 0.022);
                    ctx.font = `italic 300 ${contentFontSize}px "字魂风华雅宋", "STKaiti", "KaiTi", "SimKai", "DFKai-SB", "Brush Script MT", cursive, "PingFang SC", sans-serif`;
                    
                    const lines = content.split('\n').filter(line => line.trim());
                    const lineHeight = contentFontSize * 1.8;
                    
                    // 计算可用区域
                    const availableHeight = canvas.height * 0.6; // 60%的高度用于诗词内容
                    const totalContentHeight = lines.length * lineHeight;
                    
                    // 如果内容太长，调整字体大小
                    let adjustedFontSize = contentFontSize;
                    let adjustedLineHeight = lineHeight;
                    
                    if (totalContentHeight > availableHeight) {
                        const scaleFactor = availableHeight / totalContentHeight;
                        adjustedFontSize = contentFontSize * scaleFactor * 0.9; // 稍微留点余量
                        adjustedLineHeight = adjustedFontSize * 1.8;
                        ctx.font = `italic 300 ${adjustedFontSize}px "字魂风华雅宋", "STKaiti", "KaiTi", "SimKai", "DFKai-SB", "Brush Script MT", cursive, "PingFang SC", sans-serif`;
                    }
                    
                    // 计算起始Y位置，使内容在可用区域内居中
                    const finalContentHeight = lines.length * adjustedLineHeight;
                    const contentStartY = titleY + titleFontSize + 30;
                    const contentCenterY = contentStartY + (availableHeight - finalContentHeight) / 2;
                    
                    lines.forEach((line, index) => {
                        if (line.trim()) {
                            const y = contentCenterY + index * adjustedLineHeight;
                            ctx.fillText(line.trim(), canvas.width / 2, y);
                        }
                    });
                    
                    // 绘制作者信息
                    const authorFontSize = Math.max(12, canvas.width * 0.018);
                    ctx.font = `300 ${authorFontSize}px "字魂风华雅宋", "STKaiti", "KaiTi", "SimKai", sans-serif`;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    const authorY = canvas.height * 0.92;
                    ctx.fillText('—— LoneIN 用户', canvas.width / 2, authorY);
                    
                    // 创建JPG格式的canvas，添加白色背景
                    const jpgCanvas = document.createElement('canvas');
                    const jpgCtx = jpgCanvas.getContext('2d')!;
                    jpgCanvas.width = canvas.width;
                    jpgCanvas.height = canvas.height;
                    
                    // 设置白色背景
                    jpgCtx.fillStyle = 'white';
                    jpgCtx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
                    
                    // 绘制原始canvas内容
                    jpgCtx.drawImage(canvas, 0, 0);
                    
                    // 转换为JPG格式
                    const dataUrl = jpgCanvas.toDataURL('image/jpeg', 0.95);
                    resolve(dataUrl);
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => {
                reject(new Error('图片加载失败'));
            };
            
            // 加载图片
            img.src = imageUrl;
        } catch (error) {
            reject(error);
        }
    });
};

// 下载图片
export const downloadImage = (dataUrl: string, filename: string) => {
    try {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('下载图片失败:', error);
        throw error;
    }
};

// 将图片转换为Blob用于分享
export const dataUrlToBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}; 