import { reactive } from 'vue';

export interface GiftState {
    isGiftMode: boolean;
    currentGiftMode: 'image' | 'music' | 'poem';
    giftTarget: string;
    giftMessage: string;
    giftResult: any;
    isGenerating: boolean;
    generationProgress: string;
}

export const giftState = reactive<GiftState>({
    isGiftMode: false,
    currentGiftMode: 'image',
    giftTarget: '',
    giftMessage: '',
    giftResult: null,
    isGenerating: false,
    generationProgress: '0%'
});

export const giftStateManager = {
    // 保存当前状态
    saveState(state: Partial<GiftState>) {
        Object.assign(giftState, state);
    },
    
    // 获取当前状态
    getState(): GiftState {
        return giftState;
    },
    
    // 重置状态
    resetState() {
        giftState.isGiftMode = false;
        giftState.currentGiftMode = 'image';
        giftState.giftTarget = '';
        giftState.giftMessage = '';
        giftState.giftResult = null;
        giftState.isGenerating = false;
        giftState.generationProgress = '0%';
    },
    
    // 设置为礼物模式
    enableGiftMode() {
        giftState.isGiftMode = true;
    },
    
    // 保存生成结果
    saveGiftResult(result: any) {
        giftState.giftResult = result;
    }
}; 