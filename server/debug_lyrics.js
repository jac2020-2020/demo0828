// 调试歌词视频生成问题
const fs = require('fs');

// 模拟歌词数据（从日志中提取的前几个）
const sampleLyricsData = [
    {
        end_s: 15.6383,
        p_align: 1,
        start_s: 15.31915,
        success: true,
        word: "[Verse 1]\n阳"
    },
    {
        end_s: 15.71809,
        p_align: 1,
        start_s: 15.6383,
        success: true,
        word: "光"
    },
    {
        end_s: 15.95745,
        p_align: 1,
        start_s: 15.87766,
        success: true,
        word: "洒"
    },
    {
        end_s: 16.27660,
        p_align: 1,
        start_s: 16.19681,
        success: true,
        word: "在"
    },
    {
        end_s: 16.59574,
        p_align: 1,
        start_s: 16.51596,
        success: true,
        word: "我"
    }
];

// 复制原始的函数逻辑
const isStructureTag = (word) => {
    const cleanWord = word.trim();
    
    if (
        (cleanWord.startsWith('[') && cleanWord.endsWith(']')) ||
        (cleanWord.startsWith('{') && cleanWord.endsWith('}'))
    ) {
        return true;
    }
    
    const structureKeywords = ['verse', 'chorus', 'bridge', 'outro', 'intro', 'pre-chorus', 'refrain'];
    const lowerWord = cleanWord.toLowerCase();
    
    return structureKeywords.some(keyword => lowerWord.includes(keyword));
};

const removePunctuation = (text) => {
    return text.replace(/[，。！？,;:.!?；：]/g, '').trim();
};

// 调试函数
function debugLyricsGeneration(lyricsData) {
    console.log('=== 调试歌词生成过程 ===');
    
    // 1. 构建完整文本和时间映射
    let fullText = '';
    const charToTimeMap = [];
    let charIndex = 0;
    
    lyricsData.forEach((item, index) => {
        const word = item.word;
        console.log(`词 ${index}: "${word}" (${item.start_s}s - ${item.end_s}s)`);
        
        for (let i = 0; i < word.length; i++) {
            charToTimeMap.push({
                char: charIndex + i,
                time: item.start_s,
                end_time: item.end_s
            });
        }
        fullText += word;
        charIndex += word.length;
    });
    
    console.log('\n完整文本:', JSON.stringify(fullText));
    console.log('字符时间映射总数:', charToTimeMap.length);
    
    // 2. 按行分析
    const lines = fullText.split('\n');
    let currentCharIndex = 0;
    const sentences = [];
    
    console.log('\n=== 行分析 ===');
    lines.forEach((line, lineIndex) => {
        const trimmedLine = line.trim();
        console.log(`行 ${lineIndex}: "${line}" (trimmed: "${trimmedLine}")`);
        console.log(`当前字符索引: ${currentCharIndex}`);
        
        if (!trimmedLine) {
            console.log('  -> 跳过空行');
            currentCharIndex += line.length + 1;
            return;
        }
        
        if (isStructureTag(trimmedLine)) {
            console.log('  -> 跳过结构标记');
            currentCharIndex += line.length + 1;
            return;
        }
        
        const cleanLine = removePunctuation(trimmedLine);
        console.log(`  -> 清理后: "${cleanLine}"`);
        
        if (cleanLine) {
            // 查找时间
            let lineStartTime = 0;
            let lineEndTime = 0;
            
            for (const mapping of charToTimeMap) {
                if (mapping.char >= currentCharIndex) {
                    lineStartTime = mapping.time;
                    break;
                }
            }
            
            const lineEndCharIndex = currentCharIndex + line.length;
            for (let i = charToTimeMap.length - 1; i >= 0; i--) {
                if (charToTimeMap[i].char <= lineEndCharIndex) {
                    lineEndTime = charToTimeMap[i].end_time || charToTimeMap[i].time + 2;
                    break;
                }
            }
            
            console.log(`  -> 时间范围: ${lineStartTime}s - ${lineEndTime}s`);
            
            sentences.push({
                text: cleanLine,
                start_s: lineStartTime,
                end_s: lineEndTime
            });
        }
        
        currentCharIndex += line.length + 1;
    });
    
    console.log('\n=== 生成的句子 ===');
    sentences.forEach((sentence, index) => {
        console.log(`句子 ${index}: "${sentence.text}" (${sentence.start_s}s - ${sentence.end_s}s)`);
        
        // 生成drawtext过滤器
        const escapedText = sentence.text
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/:/g, "\\:")
            .replace(/\n/g, ' ')
            .replace(/\r/g, '')
            .replace(/\t/g, ' ');
            
        const enableCondition = `between(t,${sentence.start_s},${sentence.end_s})`;
        const filter = `drawtext=text='${escapedText}':fontfile='temp/font.otf':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=h-200:enable='${enableCondition}':shadowcolor=black:shadowx=3:shadowy=3`;
        
        console.log(`  过滤器: ${filter}`);
        
        // 检查时间范围是否合理
        const duration = sentence.end_s - sentence.start_s;
        if (duration <= 0) {
            console.log(`  ⚠️ 警告: 时间范围无效 (${duration}s)`);
        } else if (duration < 0.5) {
            console.log(`  ⚠️ 警告: 时间范围太短 (${duration}s)`);
        }
    });
    
    return sentences;
}

// 运行调试
const result = debugLyricsGeneration(sampleLyricsData);
console.log(`\n总共生成 ${result.length} 个句子`); 