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

// 聊天页面状态接口
export interface ChatPageState {
    messages: any[];
    inputText: string;
    generatedMusic: any;
    generatedImage: any;
    generatedPoem: any;
    generatedVideo: any;
    giftSenderName: string;
    isGiftMode: boolean;
    currentGiftMode: 'image' | 'music' | 'poem';
    giftTarget: string;
    giftMessage: string;
    giftResult: any;
    isGenerating: boolean;
    generationProgress: string;
    conversationId: string;
    // 视频生成状态
    isGeneratingVideo: boolean;
    videoProgress: string;
    videoStage: string;
    // 礼物视频生成状态
    isGiftGeneratingVideo: boolean;
    giftVideoProgress: string;
    giftVideoStage: string;
    giftGeneratedVideo: any;
}

// 聊天模式状态接口
export interface ChatModeState {
    messages: any[];
    inputText: string;
    generatedMusic: any;
    generatedImage: any;
    generatedPoem: any;
    generatedVideo: any;
    userMessageCount: number;
    showCreationChoice: boolean;
    isCreating: boolean;
    creationProgress: string;
    creationStage: string;
    creationResult: any;
    // 视频生成状态
    isGeneratingVideo: boolean;
    videoProgress: string;
    videoStage: string;
}

// 诗词模式状态接口
export interface PoemModeState {
    giftTarget: string;
    giftMessage: string;
    giftResult: any;
    currentGiftMode: 'image' | 'music' | 'poem';
    giftSenderName: string;
    isGenerating: boolean;
    generationProgress: string;
    generationStage: string;
    currentTheme: 'qixi' | 'military' | '' | null;
}

export const giftState = reactive<GiftState>({
    isGiftMode: false,
    currentGiftMode: 'music',
    giftTarget: '',
    giftMessage: '',
    giftResult: null,
    isGenerating: false,
    generationProgress: '0%'
});

// 聊天页面状态存储
export   const chatPageState = reactive<ChatPageState>({
    messages: [],
    inputText: '',
    generatedMusic: null,
    generatedImage: null,
    generatedPoem: null,
    generatedVideo: null,
    giftSenderName: '',
    isGiftMode: false,
    currentGiftMode: 'music',
    giftTarget: '',
    giftMessage: '',
    giftResult: null,
    isGenerating: false,
    generationProgress: '0%',
    conversationId: '',
    // 视频生成状态
    isGeneratingVideo: false,
    videoProgress: '0%',
    videoStage: '',
    // 礼物视频生成状态
    isGiftGeneratingVideo: false,
    giftVideoProgress: '0%',
    giftVideoStage: '',
    giftGeneratedVideo: null
  });

// 聊天模式状态存储
export   const chatModeState = reactive<ChatModeState>({
    messages: [],
    inputText: '',
    generatedMusic: null,
    generatedImage: null,
    generatedPoem: null,
    generatedVideo: null,
    userMessageCount: 0,
    showCreationChoice: false,
    isCreating: false,
    creationProgress: '',
    creationStage: '',
    creationResult: null,
    // 视频生成状态
    isGeneratingVideo: false,
    videoProgress: '0%',
    videoStage: ''
  });

// 诗词模式状态存储
export const poemModeState = reactive<PoemModeState>({
    giftTarget: '',
    giftMessage: '',
    giftResult: null,
    currentGiftMode: 'music',
    giftSenderName: '',
    isGenerating: false,
    generationProgress: '0%',
    generationStage: '',
    currentTheme: ''
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
        giftState.currentGiftMode = 'music';
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
    },
    
    // 保存聊天页面状态
    saveChatPageState(state: Partial<ChatPageState>) {
        Object.assign(chatPageState, state);
    },
    
    // 获取聊天页面状态
    getChatPageState(): ChatPageState {
        return chatPageState;
    },
    
    // 重置聊天页面状态
          resetChatPageState() {
          chatPageState.messages = [];
          chatPageState.inputText = '';
          chatPageState.generatedMusic = null;
          chatPageState.generatedImage = null;
          chatPageState.generatedPoem = null;
          chatPageState.generatedVideo = null;
          chatPageState.giftSenderName = '';
          chatPageState.isGiftMode = false;
          chatPageState.currentGiftMode = 'music';
          chatPageState.giftTarget = '';
          chatPageState.giftMessage = '';
          chatPageState.giftResult = null;
          chatPageState.isGenerating = false;
          chatPageState.generationProgress = '0%';
          chatPageState.conversationId = '';
          // 重置视频生成状态
          chatPageState.isGeneratingVideo = false;
          chatPageState.videoProgress = '0%';
          chatPageState.videoStage = '';
          chatPageState.isGiftGeneratingVideo = false;
          chatPageState.giftVideoProgress = '0%';
          chatPageState.giftVideoStage = '';
          chatPageState.giftGeneratedVideo = null;
      },

    // 保存聊天模式状态
    saveChatModeState(state: Partial<ChatModeState>) {
        Object.assign(chatModeState, state);
    },

    // 获取聊天模式状态
    getChatModeState(): ChatModeState {
        return chatModeState;
    },

    // 保存诗词模式状态
    savePoemModeState(state: Partial<PoemModeState>) {
        Object.assign(poemModeState, state);
    },

    // 获取诗词模式状态
    getPoemModeState(): PoemModeState {
        return poemModeState;
    },

    // 重置聊天模式状态
          resetChatModeState() {
          chatModeState.messages = [];
          chatModeState.inputText = '';
          chatModeState.generatedMusic = null;
          chatModeState.generatedImage = null;
          chatModeState.generatedPoem = null;
          chatModeState.generatedVideo = null;
          chatModeState.userMessageCount = 0;
          chatModeState.showCreationChoice = false;
          chatModeState.isCreating = false;
          chatModeState.creationProgress = '';
          chatModeState.creationStage = '';
          chatModeState.creationResult = null;
          // 重置视频生成状态
          chatModeState.isGeneratingVideo = false;
          chatModeState.videoProgress = '0%';
          chatModeState.videoStage = '';
      },

    // 重置诗词模式状态
    resetPoemModeState() {
        poemModeState.giftTarget = '';
        poemModeState.giftMessage = '';
        poemModeState.giftResult = null;
        poemModeState.currentGiftMode = 'music';
        poemModeState.giftSenderName = '';
        poemModeState.isGenerating = false;
        poemModeState.generationProgress = '0%';
        poemModeState.generationStage = '';
        poemModeState.currentTheme = '';
    }
}; 