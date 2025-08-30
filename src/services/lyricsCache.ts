// 全局歌词缓存管理器
// 用于在ConversationPage和MusicPlayerPage之间共享歌词缓存

export interface LyricLine {
    time: number;
    text: string;
}

class LyricsCacheManager {
    private cache: Map<string, LyricLine[]> = new Map();

    // 设置歌词缓存
    set(musicId: string, lyrics: LyricLine[]): void {
        this.cache.set(musicId, lyrics);
        console.log('歌词缓存已设置:', musicId, lyrics);
    }

    // 获取歌词缓存
    get(musicId: string): LyricLine[] | null {
        const lyrics = this.cache.get(musicId);
        if (lyrics) {
            console.log('从缓存获取歌词:', musicId, lyrics);
            return lyrics;
        }
        console.log('缓存中未找到歌词:', musicId);
        return null;
    }

    // 检查是否存在缓存
    has(musicId: string): boolean {
        return this.cache.has(musicId);
    }

    // 清除特定缓存
    delete(musicId: string): boolean {
        return this.cache.delete(musicId);
    }

    // 清除所有缓存
    clear(): void {
        this.cache.clear();
    }

    // 获取缓存大小
    get size(): number {
        return this.cache.size;
    }

    // 获取所有缓存的musicId
    get keys(): string[] {
        return Array.from(this.cache.keys());
    }
}

// 导出单例实例
export const lyricsCache = new LyricsCacheManager(); 